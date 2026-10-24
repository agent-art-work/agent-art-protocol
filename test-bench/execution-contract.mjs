/**
 * Pure execution-environment contract for the Lab -> Claude desktop lane.
 * These checks bind controller attestations; they do not authenticate the
 * controller, operating system, screenshots, permissions or application state.
 * No UI control, persistence, wall-clock reads or raw transcript output.
 */
import { createHash } from 'node:crypto';
import { isPlainRecord } from './plain-record.mjs';
import { validateClaudeSnapshot, CLAUDE_BUNDLE_ID } from './desktop-ui.mjs';

export const EXECUTION_SCHEMA = 'agent-art-bench/execution-contract/1';
export const EXECUTION_LANE = 'lab-claude-desktop-chat';
export const NO_SEND_LANE = 'claude-desktop-no-send';
export const EXECUTION_QUALIFICATION_SCHEMA = 'agent-art-bench/execution-qualification/1';
export const EXECUTION_INSPECTION_SCHEMA = 'agent-art-bench/execution-inspection/1';
export const EXECUTION_MAX_CAPTURE_AGE_MS = 30000;
// Explicit operator-selected exception for public, zero-Send diagnostics only.
// Absence preserves the historical descriptor bytes and 30-second default.
export const NO_SEND_REVIEWED_60S_PROFILE = 'no-send-reviewed-60s-v1';
export function executionCaptureMaxAgeMs(contract) {
  validateExecutionContract(contract);
  return contract.captureProfile?.maximumAgeMs ?? EXECUTION_MAX_CAPTURE_AGE_MS;
}
export const CHROME_BUNDLE_ID = 'com.google.Chrome';

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const DIGEST = /^[a-f0-9]{64}$/u;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const VERSION = /^[A-Za-z0-9][A-Za-z0-9 ._()+:-]{0,79}$/u;
const PERMISSIONS = ['ready', 'human-required', 'unknown'];
const OWNERSHIP = ['exclusive', 'interrupted', 'unknown'];
const OBSERVATION = ['ax-and-pixels', 'unavailable'];
const VISUAL_AGREEMENT = ['agrees', 'conflicts', 'not-reviewed'];
const fail = message => { throw new TypeError(message); };
const timestamp = value => typeof value === 'string' && DATE.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const safeId = value => typeof value === 'string' && ID.test(value);
const digest = value => typeof value === 'string' && DIGEST.test(value);
const generationValid = value => Number.isSafeInteger(value) && value >= 1;
const metadataText = value => typeof value === 'string' && value === value.trim() && VERSION.test(value)
  && !['unknown', 'unrecorded', 'not-recorded', 'unavailable'].includes(value.toLowerCase());

function shape(value, allowed, required = allowed) {
  if (!isPlainRecord(value)) fail('Execution data must be plain records.');
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !allowed.includes(key) || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) fail('Unsupported execution field or non-data property.');
  }
  if (required.some(key => !Object.hasOwn(value, key))) fail('Required execution fields are missing.');
}

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (isPlainRecord(value)) return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
const hash = value => createHash('sha256').update(canonical(value), 'utf8').digest('hex');
function freeze(value) {
  for (const child of Object.values(value)) if (child !== null && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}
function moment(now) {
  const value = typeof now === 'number' ? now : timestamp(now) ? Date.parse(now) : NaN;
  if (!Number.isSafeInteger(value) || value < 0 || !Number.isFinite(new Date(value).getTime())) fail('An explicit valid execution time is required.');
  return { value, iso: new Date(value).toISOString() };
}
function options(value) {
  shape(value, ['generation', 'now']);
  if (!generationValid(value.generation)) fail('Execution generation must be a positive safe integer.');
  return moment(value.now);
}

/** Select only the declared OS, regular-browser and Claude version metadata.
 * A known Codex version may be present in the environment but is excluded from
 * this lane's identity. Unknown, private or accessor fields are rejected.
 */
export function executionConfiguration(environment) {
  shape(environment, ['os', 'browser', 'apps']);
  for (const key of ['os', 'browser']) {
    shape(environment[key], ['name', 'version']);
    if (!metadataText(environment[key].name) || !metadataText(environment[key].version)) fail('Recorded public environment names and versions are required.');
  }
  shape(environment.apps, ['claude-app', 'codex-app'], ['claude-app']);
  for (const app of Object.values(environment.apps)) {
    shape(app, ['version']);
    if (!metadataText(app.version)) fail('Recorded public application versions are required.');
  }
  return { os: { name: environment.os.name, version: environment.os.version },
    browser: { name: environment.browser.name, version: environment.browser.version },
    apps: { 'claude-app': { version: environment.apps['claude-app'].version } } };
}

export const executionConfigurationSha256 = environment => hash(executionConfiguration(environment));

function payload(manifest) {
  const fields = ['id', 'workId', 'workVersion', 'sdkVersion', 'archiveSha256', 'contextSha256', 'contextBytes'];
  shape(manifest, fields);
  let publicWork = false;
  try {
    const url = new URL(manifest.workId);
    publicWork = url.protocol === 'https:' && !url.username && !url.password && !url.search
      && url.hostname.includes('.') && /[a-z]/iu.test(url.hostname)
      && !url.hostname.includes(':') && !/\.(?:local|localhost|internal)$/iu.test(url.hostname)
      && !['localhost', 'localhost.localdomain'].includes(url.hostname);
  } catch {}
  if (!safeId(manifest.id) || !publicWork || manifest.workId.length > 256 || !metadataText(manifest.workVersion)
      || typeof manifest.sdkVersion !== 'string' || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/u.test(manifest.sdkVersion)
      || !digest(manifest.archiveSha256) || !digest(manifest.contextSha256)
      || !Number.isSafeInteger(manifest.contextBytes) || manifest.contextBytes < 1 || manifest.contextBytes > 1048576) fail('Bounded public execution payload pins are required.');
  return Object.fromEntries(fields.map(key => [key, manifest[key]]));
}

/** Creation records the already-authorized scope; it grants no permissions. */
export function createExecutionContract(input = {}) {
  return createContract(input, false);
}

export function createNoSendExecutionContract(input = {}) {
  return createContract(input, true);
}

function createContract(input, noSend) {
  shape(input, ['manifest', 'environment', 'timeoutMs', 'captureProfile', 'cleanupOrigin', 'focusOnly'], ['manifest', 'environment', 'timeoutMs']);
  const { manifest, environment, timeoutMs } = input;
  if (Object.hasOwn(input, 'captureProfile') && (!noSend || input.captureProfile !== NO_SEND_REVIEWED_60S_PROFILE)) fail('Only the explicit public no-Send 60-second capture profile is supported.');
  if (Object.hasOwn(input, 'focusOnly') && (!noSend || input.focusOnly !== true || input.cleanupOrigin)) fail('Only a separate no-Send focus-only scope is supported.');
  if (Object.hasOwn(input, 'cleanupOrigin')) {
    shape(input.cleanupOrigin, ['caseId', 'contractSha256']);
    if (!noSend || !safeId(input.cleanupOrigin.caseId) || !digest(input.cleanupOrigin.contractSha256)) fail('A bound no-Send cleanup origin is required.');
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 1800000) fail('A bounded execution duration is required.');
  const descriptor = { schema: EXECUTION_SCHEMA, lane: noSend ? NO_SEND_LANE : EXECUTION_LANE,
    configurationSha256: executionConfigurationSha256(environment), payload: payload(manifest),
    authority: { source: 'explicit-user-direction', publicContextOnly: true, freshConversation: true,
      maximumHandoffs: noSend ? 0 : 1, maximumSends: noSend ? 0 : 1, maximumDurationMs: timeoutMs },
    ...(noSend && { diagnostic: { maximumFocuses: input.cleanupOrigin ? 0 : 1, maximumTypes: input.cleanupOrigin || input.focusOnly ? 0 : 1, maximumClears: input.focusOnly ? 0 : 1, markerSha256: manifest.contextSha256,
      ...(input.focusOnly && { purpose: 'focus-recovery' }),
      ...(input.cleanupOrigin && { cleanupOrigin: { ...input.cleanupOrigin } }) } }),
    ...(input.captureProfile && { captureProfile: { id: NO_SEND_REVIEWED_60S_PROFILE, maximumAgeMs: 60000 } }),
    boundaries: { codexDesktop: 'excluded', sdkChanges: 'excluded', deployment: 'excluded',
      permissionExpansion: 'human-required', authentication: 'human-required' } };
  return freeze({ ...descriptor, contractSha256: hash(descriptor) });
}

export function validateExecutionContract(contract) {
  const noSend = contract?.lane === NO_SEND_LANE;
  const fields = ['schema', 'lane', 'configurationSha256', 'payload', 'authority', 'boundaries', 'contractSha256', ...(noSend ? ['diagnostic'] : [])];
  shape(contract, [...fields, 'captureProfile'], fields);
  if (Object.hasOwn(contract, 'captureProfile')) {
    shape(contract.captureProfile, ['id', 'maximumAgeMs']);
    if (!noSend || contract.captureProfile.id !== NO_SEND_REVIEWED_60S_PROFILE || contract.captureProfile.maximumAgeMs !== 60000) fail('Only the explicit public no-Send 60-second capture profile is supported.');
  }
  if (contract.schema !== EXECUTION_SCHEMA || ![EXECUTION_LANE, NO_SEND_LANE].includes(contract.lane) || !digest(contract.configurationSha256)
      || !digest(contract.contractSha256)) fail('Unsupported execution contract.');
  payload(contract.payload);
  const a = contract.authority, b = contract.boundaries;
  shape(a, ['source', 'publicContextOnly', 'freshConversation', 'maximumHandoffs', 'maximumSends', 'maximumDurationMs']);
  shape(b, ['codexDesktop', 'sdkChanges', 'deployment', 'permissionExpansion', 'authentication']);
  if (a.source !== 'explicit-user-direction' || a.publicContextOnly !== true || a.freshConversation !== true
      || a.maximumHandoffs !== (noSend ? 0 : 1) || a.maximumSends !== (noSend ? 0 : 1) || !Number.isSafeInteger(a.maximumDurationMs)
      || a.maximumDurationMs < 1000 || a.maximumDurationMs > 1800000
      || ['codexDesktop', 'sdkChanges', 'deployment'].some(key => b[key] !== 'excluded')
      || b.permissionExpansion !== 'human-required' || b.authentication !== 'human-required') fail('The bounded execution authority has changed.');
  if (noSend) {
    shape(contract.diagnostic, ['maximumFocuses', 'maximumTypes', 'maximumClears', 'markerSha256', 'cleanupOrigin', 'purpose'], ['maximumFocuses', 'maximumTypes', 'maximumClears', 'markerSha256']);
    const origin = contract.diagnostic.cleanupOrigin;
    const focusOnly = Object.hasOwn(contract.diagnostic, 'purpose');
    if (focusOnly && (contract.diagnostic.purpose !== 'focus-recovery' || origin)) fail('Invalid focus-only diagnostic scope.');
    if (Object.hasOwn(contract.diagnostic, 'cleanupOrigin')) {
      shape(origin, ['caseId', 'contractSha256']);
      if (!safeId(origin.caseId) || !digest(origin.contractSha256)) fail('Invalid cleanup origin.');
    }
    if (contract.diagnostic.maximumFocuses !== (origin ? 0 : 1) || contract.diagnostic.maximumTypes !== (origin || focusOnly ? 0 : 1) || contract.diagnostic.maximumClears !== (focusOnly ? 0 : 1)
      || contract.diagnostic.markerSha256 !== contract.payload.contextSha256) fail('The bounded diagnostic authority has changed.');
  }
  const { contractSha256, ...descriptor } = contract;
  if (hash(descriptor) !== contractSha256) fail('Execution contract digest does not match its fields.');
  return true;
}

/** The caller attests capabilities; no native permissions are acquired here. */
export function qualifyExecution(contract, assessment, settings = {}) {
  validateExecutionContract(contract);
  const now = options(settings);
  shape(assessment, ['controllerId', 'configuration', 'interface', 'browserBundleId', 'clientBundleId', 'permissions', 'inputOwnership', 'observation']);
  if (!safeId(assessment.controllerId) || !safeId(assessment.interface) || !safeId(assessment.browserBundleId)
      || !safeId(assessment.clientBundleId) || !PERMISSIONS.includes(assessment.permissions)
      || !OWNERSHIP.includes(assessment.inputOwnership) || !OBSERVATION.includes(assessment.observation)) fail('Execution capabilities require bounded supported data.');
  const configurationSha256 = executionConfigurationSha256(assessment.configuration);
  const reason = configurationSha256 !== contract.configurationSha256 ? 'configuration-differs'
    : assessment.interface !== 'cua' ? 'unsupported-interface'
    : assessment.browserBundleId !== CHROME_BUNDLE_ID ? 'unsupported-browser'
    : assessment.clientBundleId !== CLAUDE_BUNDLE_ID ? 'unsupported-client'
    : assessment.permissions !== 'ready' ? 'permissions-not-ready'
    : assessment.inputOwnership !== 'exclusive' ? 'input-not-exclusive'
    : assessment.observation !== 'ax-and-pixels' ? 'observation-unavailable' : undefined;
  const qualified = !reason;
  return { qualified, ...(reason ? { reason } : {}), evidence: {
    schema: EXECUTION_QUALIFICATION_SCHEMA, contractSha256: contract.contractSha256, configurationSha256,
    controllerId: assessment.controllerId, generation: settings.generation, qualifiedAt: now.iso, qualified,
    interface: assessment.interface === 'cua' ? 'cua' : 'unsupported',
    browserBundleId: assessment.browserBundleId === CHROME_BUNDLE_ID ? CHROME_BUNDLE_ID : 'unsupported',
    clientBundleId: assessment.clientBundleId === CLAUDE_BUNDLE_ID ? CLAUDE_BUNDLE_ID : 'unsupported',
    permissions: assessment.permissions, inputOwnership: assessment.inputOwnership, observation: assessment.observation,
    attribution: 'controller',
  } };
}

/** Structural and contract binding only, not authenticity verification. */
export function validateExecutionQualification(contract, qualification) {
  validateExecutionContract(contract);
  shape(qualification, ['qualified', 'evidence']);
  const e = qualification.evidence;
  shape(e, ['schema', 'contractSha256', 'configurationSha256', 'controllerId', 'generation', 'qualifiedAt', 'qualified',
    'interface', 'browserBundleId', 'clientBundleId', 'permissions', 'inputOwnership', 'observation', 'attribution']);
  if (qualification.qualified !== true || e.qualified !== true || e.schema !== EXECUTION_QUALIFICATION_SCHEMA
      || e.contractSha256 !== contract.contractSha256 || e.configurationSha256 !== contract.configurationSha256
      || !safeId(e.controllerId) || !generationValid(e.generation) || !timestamp(e.qualifiedAt)
      || e.interface !== 'cua' || e.browserBundleId !== CHROME_BUNDLE_ID || e.clientBundleId !== CLAUDE_BUNDLE_ID
      || e.permissions !== 'ready' || e.inputOwnership !== 'exclusive' || e.observation !== 'ax-and-pixels'
      || e.attribution !== 'controller') fail('A successful bound execution qualification is required.');
  return true;
}

/** Hash the actual normalized snapshot, including its private route, without
 * returning that route or any AX text. The digest is an integrity pin only.
 */
export function executionSnapshotSha256(snapshot) {
  return hash({ captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, bundleId: snapshot.bundleId,
    windowId: snapshot.windowId, ownedWindowId: snapshot.ownedWindowId, complete: snapshot.complete,
    owned: snapshot.owned, documentUrl: snapshot.documentUrl ?? null, nodes: snapshot.nodes });
}

/** Readiness is revocable at every fresh capture. Unknown/conflicting visual
 * state or external input never permits a consequential action.
 */
export function inspectExecution(contract, qualification, snapshot, assessment, settings = {}) {
  validateExecutionContract(contract);
  const now = options(settings);
  shape(assessment, ['controllerId', 'generation', 'inputOwnership', 'visualAgreement']);
  if (!safeId(assessment.controllerId) || !generationValid(assessment.generation)
      || !OWNERSHIP.includes(assessment.inputOwnership) || !VISUAL_AGREEMENT.includes(assessment.visualAgreement)) fail('A bounded current execution assessment is required.');
  let qualificationValid = true;
  try { validateExecutionQualification(contract, qualification); } catch { qualificationValid = false; }
  const q = qualificationValid ? qualification.evidence : undefined;
  let captureValid = true;
  const maxAgeMs = executionCaptureMaxAgeMs(contract);
  try { validateClaudeSnapshot(snapshot, { now: now.value, maxAgeMs }); } catch { captureValid = false; }
  const captureTime = isPlainRecord(snapshot) && timestamp(snapshot.capturedAt) ? Date.parse(snapshot.capturedAt) : NaN;
  const stale = Number.isFinite(captureTime) && (captureTime > now.value || now.value - captureTime > maxAgeMs);
  const reason = !qualificationValid ? 'qualification-not-established'
    : settings.generation !== q.generation || assessment.generation !== settings.generation ? 'generation-differs'
    : assessment.controllerId !== q.controllerId ? 'controller-differs'
    : now.value < Date.parse(q.qualifiedAt) ? 'qualification-time-invalid'
    : now.value - Date.parse(q.qualifiedAt) > contract.authority.maximumDurationMs ? 'qualification-expired'
    : assessment.inputOwnership !== 'exclusive' ? 'input-not-exclusive'
    : assessment.visualAgreement === 'conflicts' ? 'observation-conflicts'
    : assessment.visualAgreement !== 'agrees' ? 'visual-review-required'
    : !captureValid ? stale ? 'snapshot-stale' : 'snapshot-invalid'
    : captureTime < Date.parse(q.qualifiedAt) ? 'capture-before-qualification' : undefined;
  const ready = !reason;
  return { ready, ...(reason ? { reason } : {}), evidence: {
    schema: EXECUTION_INSPECTION_SCHEMA, contractSha256: contract.contractSha256,
    configurationSha256: contract.configurationSha256, controllerId: assessment.controllerId,
    generation: settings.generation, assessedAt: now.iso, ready,
    inputOwnership: assessment.inputOwnership, visualAgreement: assessment.visualAgreement,
    ...(q ? { qualifiedAt: q.qualifiedAt } : {}),
    ...(captureValid ? { captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, windowId: snapshot.windowId,
      snapshotSha256: executionSnapshotSha256(snapshot) } : {}),
    attribution: 'controller', windowBinding: 'controller-attributed',
  } };
}

/** Validate a persisted successful inspection's bounded structure and current
 * bindings. The caller must additionally bind it to the real selected capture
 * and the durable run lifecycle. This does not turn an attestation into proof.
 */
export function validateExecutionInspection(contract, qualification, inspection, settings = {}) {
  validateExecutionQualification(contract, qualification);
  const now = options(settings), q = qualification.evidence;
  shape(inspection, ['ready', 'evidence']);
  const e = inspection.evidence;
  shape(e, ['schema', 'contractSha256', 'configurationSha256', 'controllerId', 'generation', 'assessedAt', 'ready',
    'inputOwnership', 'visualAgreement', 'qualifiedAt', 'captureId', 'capturedAt', 'windowId', 'snapshotSha256',
    'attribution', 'windowBinding']);
  const validWindow = Number.isSafeInteger(e.windowId) && e.windowId >= 0 || safeId(e.windowId);
  if (inspection.ready !== true || e.ready !== true || e.schema !== EXECUTION_INSPECTION_SCHEMA
      || e.contractSha256 !== contract.contractSha256 || e.configurationSha256 !== contract.configurationSha256
      || e.controllerId !== q.controllerId || e.generation !== q.generation || e.generation !== settings.generation
      || e.qualifiedAt !== q.qualifiedAt || !timestamp(e.assessedAt) || !timestamp(e.capturedAt)
      || !safeId(e.captureId) || !validWindow || !digest(e.snapshotSha256)
      || e.inputOwnership !== 'exclusive' || e.visualAgreement !== 'agrees'
      || e.attribution !== 'controller' || e.windowBinding !== 'controller-attributed'
      || Date.parse(e.capturedAt) < Date.parse(e.qualifiedAt) || Date.parse(e.assessedAt) < Date.parse(e.capturedAt)
      || now.value < Date.parse(e.assessedAt) || now.value - Date.parse(e.capturedAt) > executionCaptureMaxAgeMs(contract)
      || now.value - Date.parse(e.qualifiedAt) > contract.authority.maximumDurationMs) fail('A fresh successful bound execution inspection is required.');
  return true;
}
