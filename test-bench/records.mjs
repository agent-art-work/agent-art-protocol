/**
 * Reading interoperability observations, not SDK receipts or execution proofs.
 * Validation checks declarations and their scope. It cannot authenticate an
 * observer, recover private conversations, or establish that a statement is true.
 */
import { isPlainRecord } from './plain-record.mjs';
import { LAB_AX_POLICY, LAB_AX_PRESENTATION_SHA256, validateDraftPolicy } from './draft-policy.mjs';
export const SCHEMA = 'agent-art-reading-bench/run/1';
export const CLIENTS = Object.freeze(['claude-app', 'codex-app']);
export const CLAIMS = Object.freeze(['handoff-requested', 'draft-arrived', 'context-matches', 'presentation-matches', 'sent', 'permission', 'source-access', 'completion']);
export const STATUSES = Object.freeze(['requested', 'observed', 'operator-reported', 'failed', 'not-observed', 'not-run']);
export const SOURCES = Object.freeze(['browser-automation', 'operator', 'desktop-ui']);
export const SURFACES = Object.freeze(['claude-chat', 'claude-code', 'chatgpt-chat', 'chatgpt-work', 'codex', 'unknown']);
export const REASONS = Object.freeze(['canceled', 'unavailable', 'permission-denied', 'access-failed', 'context-differs', 'destination-differs', 'not-inspected', 'not-authorized', 'metadata-unavailable', 'other']);
const LANES = ['browser', 'real-client'];
const METHODS = ['prepared-payload-sha256', 'composer-utf8-sha256', 'operator-pasted-text-sha256', 'visual-inspection', 'visible-tool-result', 'operator-confirmation', LAB_AX_POLICY];
const KINDS = { 'browser-automation': 'browser-event', operator: 'operator-check', 'desktop-ui': 'desktop-ui-check' };
const POSITIVE = new Set(['requested', 'observed', 'operator-reported']);
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const LIMITS = Object.freeze([
  'Browser checks establish prepared context and requested navigation only; they do not establish native arrival, Send, source access or completion.',
  'Real-client observations remain attributed to a desktop UI observer or the operator; no observer identity or statement is independently authenticated.',
  'An exact-context comparison needs the retained public-context digest and an explicit comparison method; a visual impression alone does not establish byte equality.',
  'A named Lab presentation comparison records only its specified exposed-text transformation; exact composer and transport bytes remain separate and unestablished.',
  'Operator-pasted text comparisons cover the text entered into the bench. Clipboard or textarea handling can normalize line endings; this is not proof of raw composer or transport bytes.',
  'A visible tool result or completion supports only the named observation. Model authorship, execution origin, private intention and unobserved intervention remain unestablished.',
  'This record contains public-context identifiers and bounded observations, not private transcripts. Optional notes must be reviewed for privacy by their author.',
]);

const plain = isPlainRecord;
const text = (value, max = 160) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value);
const version = value => text(value, 80) && !['unknown', 'unrecorded', 'not-recorded', 'unavailable'].includes(value.toLowerCase()) && !/[\\/]/u.test(value);
const timestamp = value => typeof value === 'string' && DATE.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const clone = value => structuredClone(value);

function shape(value, allowed, required, path, errors) {
  if (!plain(value)) { errors.push(`${path} must be a plain object`); return false; }
  if (Reflect.ownKeys(value).some(key => typeof key !== 'string' || !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'))) {
    errors.push(`${path} must contain data fields, not accessors or symbols`); return false;
  }
  for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${path}.${key} is not supported`);
  for (const key of required) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required`);
  return true;
}

function checkManifest(manifest, errors) {
  const keys = ['id', 'workId', 'workVersion', 'sdkVersion', 'archiveSha256', 'contextSha256', 'contextBytes'];
  if (!shape(manifest, keys, keys, 'manifest', errors)) return;
  if (typeof manifest.id !== 'string' || !ID.test(manifest.id)) errors.push('manifest.id must be a bounded identifier');
  if (!text(manifest.workId, 256) || /[?@]/u.test(manifest.workId)) errors.push('manifest.workId must identify the public Work without credentials or query');
  if (!text(manifest.workVersion, 80)) errors.push('manifest.workVersion must be a bounded public version');
  if (typeof manifest.sdkVersion !== 'string' || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/u.test(manifest.sdkVersion)) errors.push('manifest.sdkVersion must be a package version');
  for (const key of ['archiveSha256', 'contextSha256']) if (typeof manifest[key] !== 'string' || !DIGEST.test(manifest[key])) errors.push(`manifest.${key} must be a lowercase SHA-256 digest`);
  if (!Number.isSafeInteger(manifest.contextBytes) || manifest.contextBytes <= 0 || manifest.contextBytes > 1_048_576) errors.push('manifest.contextBytes must be a positive bounded UTF-8 byte count');
}

function checkEnvironment(environment, errors) {
  if (!shape(environment, ['os', 'browser', 'apps'], [], 'environment', errors)) return;
  for (const key of ['os', 'browser']) {
    if (environment[key] === undefined) continue;
    if (!shape(environment[key], ['name', 'version'], ['name', 'version'], `environment.${key}`, errors)) continue;
    if (!text(environment[key].name, 80)) errors.push(`environment.${key}.name must be a bounded public name`);
    if (!version(environment[key].version)) errors.push(`environment.${key}.version must be a recorded public version`);
  }
  if (environment.apps === undefined) return;
  if (!shape(environment.apps, CLIENTS, [], 'environment.apps', errors)) return;
  for (const [client, app] of Object.entries(environment.apps)) {
    if (!CLIENTS.includes(client)) continue;
    if (shape(app, ['version'], ['version'], `environment.apps.${client}`, errors) && !version(app.version)) errors.push(`environment.apps.${client}.version must be a recorded public version`);
  }
}

function checkObservation(observation, run, index, errors) {
  const path = `observations[${index}]`;
  const keys = ['id', 'at', 'lane', 'requestedClient', 'claim', 'status', 'source', 'actualSurface', 'material', 'reason', 'notes'];
  const required = ['id', 'at', 'lane', 'requestedClient', 'claim', 'status', 'source', 'material'];
  if (!shape(observation, keys, required, path, errors)) return;
  if (typeof observation.id !== 'string' || !ID.test(observation.id)) errors.push(`${path}.id must be a bounded identifier`);
  if (!timestamp(observation.at)) errors.push(`${path}.at must be an exact ISO UTC timestamp with milliseconds`);
  for (const [key, values] of [['lane', LANES], ['requestedClient', CLIENTS], ['claim', CLAIMS], ['status', STATUSES], ['source', SOURCES]]) {
    if (!values.includes(observation[key])) errors.push(`${path}.${key} is unsupported`);
  }
  if (!LANES.includes(observation.lane) || !CLIENTS.includes(observation.requestedClient) || !CLAIMS.includes(observation.claim) || !STATUSES.includes(observation.status) || !SOURCES.includes(observation.source)) return;
  if (observation.actualSurface !== undefined && !SURFACES.includes(observation.actualSurface)) errors.push(`${path}.actualSurface is unsupported`);
  if (observation.reason !== undefined && !REASONS.includes(observation.reason)) errors.push(`${path}.reason is unsupported`);
  if (observation.notes !== undefined && !text(observation.notes, 240)) errors.push(`${path}.notes must be one bounded public-only line`);
  const material = observation.material;
  if (!shape(material, ['kind', 'ref', 'contextSha256', 'method', 'canonicalSha256', 'exposedSha256', 'basis', 'captureId', 'capturedAt', 'snapshotSha256'], ['kind'], `${path}.material`, errors)) return;
  if (material.kind !== KINDS[observation.source]) errors.push(`${path}.material.kind must match its observer source`);
  if (material.ref !== undefined && (typeof material.ref !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,159}$/u.test(material.ref) || material.ref.split('/').some(part => !part || part === '.' || part === '..'))) errors.push(`${path}.material.ref must be a relative public evidence reference without traversal`);
  if (material.contextSha256 !== undefined && (typeof material.contextSha256 !== 'string' || !DIGEST.test(material.contextSha256))) errors.push(`${path}.material.contextSha256 must be a lowercase SHA-256 digest`);
  if (material.method !== undefined && !METHODS.includes(material.method)) errors.push(`${path}.material.method is unsupported`);
  for (const key of ['canonicalSha256', 'exposedSha256', 'snapshotSha256']) if (material[key] !== undefined && (typeof material[key] !== 'string' || !DIGEST.test(material[key]))) errors.push(`${path}.material.${key} must be a lowercase SHA-256 digest`);
  if (material.captureId !== undefined && (typeof material.captureId !== 'string' || !ID.test(material.captureId))) errors.push(`${path}.material.captureId must be a bounded identifier`);
  if (material.capturedAt !== undefined && !timestamp(material.capturedAt)) errors.push(`${path}.material.capturedAt must be an exact capture timestamp`);
  if (material.basis !== undefined && !['exact', 'paragraph-blank-lines-collapsed', 'different'].includes(material.basis)) errors.push(`${path}.material.basis is unsupported`);
  const presentation = material.method === LAB_AX_POLICY;
  if (presentation || observation.claim === 'presentation-matches') {
    if (!presentation || observation.lane !== 'real-client' || observation.source !== 'desktop-ui' || observation.requestedClient !== 'claude-app' || observation.actualSurface !== 'claude-chat' || !['presentation-matches', 'sent'].includes(observation.claim)) errors.push(`${path}: the named presentation method belongs only to direct Claude Chat presentation or sent observations`);
    try { validateDraftPolicy(LAB_AX_POLICY, run.manifest); } catch { errors.push(`${path}: presentation policy requires its exact pinned Lab inputs`); }
    if (material.canonicalSha256 !== run.manifest?.contextSha256 || typeof material.exposedSha256 !== 'string' || !DIGEST.test(material.exposedSha256) || !material.captureId || !material.capturedAt || !material.snapshotSha256) errors.push(`${path}: presentation evidence requires both text digests and a named capture`);
    if (material.contextSha256 !== undefined && (material.basis !== 'exact' || material.contextSha256 !== material.canonicalSha256)) errors.push(`${path}: a transformed presentation cannot also assert an exact context digest`);
    if (POSITIVE.has(observation.status)) {
      const expected = material.basis === 'exact' ? run.manifest.contextSha256 : material.basis === 'paragraph-blank-lines-collapsed' ? LAB_AX_PRESENTATION_SHA256 : undefined;
      if (!expected || material.exposedSha256 !== expected) errors.push(`${path}: positive presentation evidence must match the named transformation and its digest`);
    }
  } else if (['canonicalSha256', 'exposedSha256', 'basis'].some(key => material[key] !== undefined)) errors.push(`${path}: presentation fields require the named presentation method`);
  if (observation.status === 'operator-reported' && observation.source !== 'operator') errors.push(`${path}: operator-reported requires the operator source`);
  if (observation.status === 'requested' && observation.claim !== 'handoff-requested') errors.push(`${path}: requested describes only the native handoff request`);
  if (observation.claim === 'handoff-requested' && ['observed', 'operator-reported'].includes(observation.status)) errors.push(`${path}: a positive handoff-requested must retain requested status`);
  if (observation.lane === 'browser') {
    if (!['handoff-requested', 'context-matches'].includes(observation.claim)) errors.push(`${path}: browser observations cannot establish a real-client claim`);
    if (observation.source === 'desktop-ui') errors.push(`${path}: desktop-ui observations belong in the real-client lane`);
    if (POSITIVE.has(observation.status) && (!run.environment?.os || !run.environment?.browser)) errors.push(`${path}: positive browser observations require recorded OS and browser versions`);
    if (observation.actualSurface !== undefined) errors.push(`${path}: the browser cannot assert an actual desktop surface`);
  }
  if (observation.lane === 'real-client') {
    if (observation.source === 'browser-automation') errors.push(`${path}: browser automation cannot make real-client observations`);
    if (observation.claim === 'handoff-requested') errors.push(`${path}: handoff requests belong in the browser lane`);
    if (observation.status === 'observed' && observation.source !== 'desktop-ui') errors.push(`${path}: observed real-client results require a desktop-ui source; operator statements are operator-reported`);
    if (POSITIVE.has(observation.status)) {
      if (!run.environment?.os || !run.environment?.apps?.[observation.requestedClient]) errors.push(`${path}: positive real-client observations require recorded OS and requested app versions`);
      if (!observation.actualSurface || observation.actualSurface === 'unknown') errors.push(`${path}: positive real-client observations require the actual desktop surface`);
      if (observation.claim !== 'context-matches' && !presentation) {
        if (observation.source === 'operator' && material.method !== 'operator-confirmation') errors.push(`${path}: positive operator reports require the operator-confirmation method`);
        if (observation.source === 'desktop-ui' && !['visual-inspection', 'visible-tool-result'].includes(material.method)) errors.push(`${path}: positive desktop-ui observations require an explicit visual-inspection or visible-tool-result method`);
        if (observation.claim === 'source-access' && observation.source === 'desktop-ui' && material.method !== 'visible-tool-result') errors.push(`${path}: observed source-access requires a visible-tool-result, not a readiness statement or visual impression`);
      }
    }
  }
  if (observation.claim === 'context-matches' && POSITIVE.has(observation.status)) {
    const expectedMethod = observation.lane === 'browser' ? 'prepared-payload-sha256' : 'composer-utf8-sha256';
    const operatorPasted = observation.lane === 'real-client' && observation.source === 'operator' && observation.status === 'operator-reported' && material.method === 'operator-pasted-text-sha256';
    if ((!operatorPasted && material.method !== expectedMethod) || material.contextSha256 !== run.manifest?.contextSha256) errors.push(`${path}: exact-context matching requires the matching public-context digest and ${expectedMethod} method; operator-reported bench text may use operator-pasted-text-sha256`);
  }
}

/** Return structural/scope findings. `valid` never means a client executed. */
export function validateRun(run) {
  const errors = [];
  if (!shape(run, ['schema', 'id', 'startedAt', 'manifest', 'environment', 'observations'], ['schema', 'id', 'startedAt', 'manifest', 'environment', 'observations'], 'run', errors)) return { valid: false, errors };
  if (run.schema !== SCHEMA) errors.push('run.schema is unsupported');
  if (typeof run.id !== 'string' || !ID.test(run.id)) errors.push('run.id must be a bounded identifier');
  if (!timestamp(run.startedAt)) errors.push('run.startedAt must be an exact ISO UTC timestamp with milliseconds');
  checkManifest(run.manifest, errors);
  checkEnvironment(run.environment, errors);
  if (errors.length) return { valid: false, errors };
  if (!Array.isArray(run.observations) || run.observations.length > 1000) errors.push('run.observations must be an array of at most 1000 bounded observations');
  else if (Array.from({ length: run.observations.length }, (_, index) => Object.getOwnPropertyDescriptor(run.observations, index)).some(item => !item || !Object.hasOwn(item, 'value'))) errors.push('run.observations must contain data items without holes or accessors');
  else {
    const ids = new Set();
    let previousAt = run.startedAt;
    run.observations.forEach((observation, index) => {
      checkObservation(observation, run, index, errors);
      if (!plain(observation)) return;
      const id = Object.getOwnPropertyDescriptor(observation, 'id')?.value;
      const at = Object.getOwnPropertyDescriptor(observation, 'at')?.value;
      if (ids.has(id)) errors.push(`observations[${index}].id is duplicated`);
      ids.add(id);
      if (timestamp(at)) {
        if (timestamp(previousAt) && at < previousAt) errors.push(`observations[${index}].at precedes the run or an earlier observation`);
        previousAt = at;
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

function checked(run) {
  const result = validateRun(run);
  if (!result.valid) throw new TypeError(`Invalid reading bench record: ${result.errors.join('; ')}`);
  return run;
}

/** Pin public input identities; no source fetch or desktop inspection occurs. */
export function createRun(manifest, { id = `reading-${Date.now()}`, startedAt = new Date().toISOString(), environment = {} } = {}) {
  return clone(checked({ schema: SCHEMA, id, startedAt, manifest, environment, observations: [] }));
}

/** Append immutably. This preserves an attributed statement, not its truth. */
export function addObservation(run, observation) {
  checked(run);
  if (!plain(observation)) throw new TypeError('Observation must be a plain object');
  if (Reflect.ownKeys(observation).some(key => typeof key !== 'string' || !Object.hasOwn(Object.getOwnPropertyDescriptor(observation, key), 'value'))) throw new TypeError('Observation must contain data fields, not accessors or symbols');
  const result = { ...run, observations: [...run.observations, { id: `obs-${run.observations.length + 1}`, at: new Date().toISOString(), ...observation }] };
  return clone(checked(result));
}

/** Keep claims and observer provenance separate; deliberately no overall pass. */
export function summarizeRun(run) {
  checked(run);
  const result = { id: run.id, startedAt: run.startedAt, manifest: clone(run.manifest), environment: clone(run.environment), browser: { clients: {} }, realClient: { clients: {} }, limits: [...LIMITS] };
  for (const [lane, target] of [['browser', result.browser], ['real-client', result.realClient]]) {
    for (const client of CLIENTS) {
      const claims = {};
      const applicable = lane === 'browser' ? ['handoff-requested', 'context-matches'] : CLAIMS.filter(claim => claim !== 'handoff-requested');
      for (const claim of applicable) {
        const observations = run.observations.filter(item => item.lane === lane && item.requestedClient === client && item.claim === claim);
        const statuses = [...new Set(observations.map(item => item.status))];
        claims[claim] = { status: statuses.length === 0 ? 'not-run' : statuses.length === 1 ? statuses[0] : 'mixed', observations: clone(observations) };
      }
      target.clients[client] = claims;
    }
  }
  return result;
}
