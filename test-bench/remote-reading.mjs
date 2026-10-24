/** Host-owned Lab -> Claude authority. No embedded desktop driver.
 * Raw native captures and draft/route strings are inspected only in memory.
 * This deliberately does not extend the existing marker or Send contracts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, loadBenchInputs } from './inputs.mjs';
import { SDK_SHA256 } from './desktop-runner.mjs';
import { bindAuthorityStore, authorityCasePaths, registerAuthorityCase, assertAuthorityCase,
  withAuthorityLock, writeExclusive, writeAtomic, syncDirectory } from './authority-store.mjs';
import { executionConfigurationSha256 } from './execution-contract.mjs';
import { claudeAXSnapshot } from './claude-ax.mjs';
import { validateClaudeSnapshot, extractPresentationComposer, extractCanonicalComposer,
  findSubmitControl, extractSentMessage, classifyOwnedEvidence, publicDesktopNote } from './desktop-ui.mjs';
import { inspectFreshClaudeReadiness, selectUnifiedNoSendControls } from './readiness.mjs';
import { EXACT_POLICY, LAB_AX_POLICY, validateDraftPolicy, compareDraftText } from './draft-policy.mjs';
import { INLINE_SUBMITTED_POLICY, extractInlineSubmittedMessage } from './submitted-message.mjs';

export const READING_DRAFT_PROFILE = 'lab-unified-draft-nosend-v1';
export const READING_TRIAL_PROFILE = 'lab-unified-reading-trial-v1';
export const READING_TRIAL_SETUP_PROFILE = 'lab-unified-reading-trial-v2';
export const READING_TRIAL_RESET_PROFILE = 'lab-unified-reading-trial-v3';
const SCHEMA = 'agent-art-bench/remote-reading/1';
const CHROME = 'com.google.Chrome', CLAUDE = 'com.anthropic.claudefordesktop';
const AGE = 30000, DURATION = 1800000;
const SCOPE = Object.freeze({ maximumBrowserProbes: 1, maximumHandoffs: 1, maximumLaunchConfirmations: 1,
  maximumSends: 0, maximumTypes: 0, maximumKeypresses: 0, maximumClears: 0 });
const TRIAL_SCOPE = Object.freeze({ maximumBrowserProbes: 1, maximumHandoffs: 1, maximumLaunchConfirmations: 1,
  maximumNewConversations: 1, maximumRaises: 1, maximumSends: 1, maximumToolInspections: 12,
  maximumTypes: 0, maximumKeypresses: 0, maximumClears: 0 });
const TRIAL_SETUP_SCOPE = Object.freeze({ ...TRIAL_SCOPE, maximumSetupRaises: 1 });
const TRIAL_RESET_SCOPE = Object.freeze({ ...TRIAL_SETUP_SCOPE, maximumKnownPublicDraftResets: 1, maximumClears: 1 });
const ACTIONS = ['browser-probe', 'handoff', 'confirm-launch'];
const TRIAL_ACTIONS = ['setup-raise', 'new-conversation', 'reset-public-draft', 'raise', 'send', 'inspect-tool'];
const trialProfile = profile => [READING_TRIAL_PROFILE, READING_TRIAL_SETUP_PROFILE, READING_TRIAL_RESET_PROFILE].includes(profile);
const LAB_INDEX = 'https://agentart.work/agent-index.json';
const ensure = (value, message) => { if (!value) throw Error(message); };
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const safeId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(value);
const iso = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/u.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const now = () => new Date().toISOString();
const role = value => String(value || '').replace(/^AX/u, '').replace(/[\s_-]/gu, '').toLowerCase();
const CLOCK_PROFILE = 'ssh-bracketed-guest-clock-v1';
const CLOCK_DRIFT_MS = 100;

function clockShape(sample) {
  const fields = ['profile', 'hostStartedAt', 'hostFinishedAt', 'guestAt', 'bootSessionId', 'driftAllowanceMs'];
  ensure(sample && typeof sample === 'object' && !Array.isArray(sample)
    && Reflect.ownKeys(sample).length === fields.length
    && fields.every(key => Object.hasOwn(sample, key) && Object.hasOwn(Object.getOwnPropertyDescriptor(sample, key), 'value')),
  'Only the explicit bounded SSH clock sample fields are permitted.');
  ensure(sample.profile === CLOCK_PROFILE && sample.driftAllowanceMs === CLOCK_DRIFT_MS
    && iso(sample.hostStartedAt) && iso(sample.hostFinishedAt) && iso(sample.guestAt)
    && typeof sample.bootSessionId === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/iu.test(sample.bootSessionId),
  'An actual SSH-bracketed clock sample, guest boot identity and fixed 100ms allowance are required.');
  const duration = Date.parse(sample.hostFinishedAt) - Date.parse(sample.hostStartedAt);
  ensure(duration >= 0 && duration <= 2000, 'SSH clock bracket must last 0..2000ms.');
}

/** Validate the actual sample at new-case preparation, never manufacture one.
 * SSH execution/bracket attribution and stable OS clocks remain trusted.
 */
export function validateClockCorrelation(sample, { now: currentTime } = {}) {
  clockShape(sample);
  ensure(Number.isSafeInteger(currentTime), 'Explicit host preparation time required.');
  const age = currentTime - Date.parse(sample.hostFinishedAt);
  ensure(age >= 0 && age <= 60000, 'SSH clock sample must finish within 60 seconds before preparation.');
  return true;
}

/** Preserve the guest timestamp and derive a host-time uncertainty interval.
 * No midpoint retiming, arbitrary tolerance or GET-read timestamp is accepted.
 */
export function correlateGuestEvent(sample, { eventAt, claimedAt, recordedAt, deadlineAt } = {}) {
  clockShape(sample);
  ensure([eventAt, claimedAt, recordedAt, deadlineAt].every(iso), 'Actual guest event, host claim/receipt and original deadline timestamps required.');
  const event = Date.parse(eventAt), claim = Date.parse(claimedAt), receipt = Date.parse(recordedAt);
  const min = event + Date.parse(sample.hostStartedAt) - Date.parse(sample.guestAt) - CLOCK_DRIFT_MS;
  const max = event + Date.parse(sample.hostFinishedAt) - Date.parse(sample.guestAt) + CLOCK_DRIFT_MS;
  ensure(event - Date.parse(sample.guestAt) >= 0 && event - Date.parse(sample.guestAt) <= DURATION,
    'Guest event is outside the clock sample original 30-minute case interval.');
  ensure(min > claim, 'Clock bounds cannot establish that the guest event followed the host claim.');
  ensure(receipt > claim && min <= receipt && receipt <= Date.parse(deadlineAt),
    'Correlated event must intersect time before its host receipt within the original deadline.');
  return { profile: CLOCK_PROFILE, guestEventAt: eventAt,
    earliestHostAt: new Date(min).toISOString(), latestHostAt: new Date(max).toISOString(),
    driftAllowanceMs: CLOCK_DRIFT_MS, sampleSha256: sha(sample),
    limit: 'SSH-bracket attribution and guest/host clock stability within the declared drift bound are trusted.' };
}

function loopback(value) {
  const url = new URL(value);
  ensure(url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.port && !url.username && !url.password,
    'Only the owned 127.0.0.1 bench origin is permitted.');
  return url;
}
function actualPage(s, value, lane, tabId) {
  const url = loopback(value);
  ensure(sha(url.origin) === s.contract.browserOriginSha256 && url.pathname === '/'
    && url.searchParams.get('lane') === lane
    && [...url.searchParams.keys()].every(key => ['lane', 'controller'].includes(key))
    && (!url.searchParams.has('controller') || url.searchParams.get('controller') === 'agent')
    && (!url.hash || /^#reading-[a-zA-Z0-9_-]+$/u.test(url.hash)), 'Owned pinned bench page/lane required.');
  ensure(tabId === (lane === 'browser' ? s.contract.probeTabId : s.contract.browserTabId), 'Owned browser tab differs.');
  return url;
}
function fresh(material, bundleId) {
  ensure(material?.bundleId === bundleId && material.complete === true && material.imageCount === 1
    && material.visualAgreement === 'agrees' && material.inputOwnership === 'exclusive',
  'A complete reviewed owned AX/pixel or browser/pixel pair from the declared app is required.');
  ensure(safeId(material.captureId) && iso(material.capturedAt), 'Actual bounded capture identity/time required.');
  const age = Date.now() - Date.parse(material.capturedAt);
  ensure(age >= 0 && age <= AGE, 'Capture expired or is in the future.');
}
function pins(s, manifest) {
  ensure(manifest && ['sdkVersion', 'archiveSha256', 'contextSha256', 'contextBytes'].every(key => manifest[key] === s.contract.manifest[key]),
    'Observed browser component pins differ from this case.');
}

async function inputsAndRoute(environment) {
  const inputs = await loadBenchInputs({ environment });
  ensure(inputs.manifest.sdkVersion === '0.1.4' && inputs.manifest.archiveSha256 === SDK_SHA256, 'Unchanged SDK 0.1.4 required.');
  const { buildClientHandoff } = await import(pathToFileURL(path.join(inputs.packageDir, 'clients.mjs')).href);
  const route = buildClientHandoff({ client: 'claude-app', prompt: inputs.context, conversation: 'fresh', surface: 'chat' }).url;
  return { inputs, route };
}
async function current(caseId, root, binding, deadline = true) {
  const p = authorityCasePaths(caseId, root), s = read(p.state), registration = assertAuthorityCase(p, s);
  ensure(s.schema === SCHEMA && s.status === 'active' && read(p.active).id === caseId, 'Active host-owned draft-only case required.');
  const expectedScope = s.contract.profile === READING_DRAFT_PROFILE ? SCOPE
    : s.contract.profile === READING_TRIAL_PROFILE ? TRIAL_SCOPE
      : s.contract.profile === READING_TRIAL_SETUP_PROFILE ? TRIAL_SETUP_SCOPE
        : s.contract.profile === READING_TRIAL_RESET_PROFILE ? TRIAL_RESET_SCOPE : undefined;
  ensure(expectedScope && s.contractSha256 === sha(s.contract) && registration.contractSha256 === s.contractSha256
    && JSON.stringify(s.contract.scope) === JSON.stringify(expectedScope)
    && s.contract.maximumCaptureAgeMs === AGE && s.contract.timeoutMs === DURATION, 'Draft-only contract or registration changed.');
  if (s.contract.clockCorrelation !== undefined) clockShape(s.contract.clockCorrelation);
  ensure(binding?.connectionId === s.contract.connectionId && binding?.controllerId === s.contract.controllerId,
    'Controller/runtime binding changed; a fresh connection cannot replay this case.');
  if (deadline) ensure(Date.now() <= Date.parse(s.deadlineAt), 'Draft-only case deadline expired.');
  const loaded = await inputsAndRoute(s.environment);
  ensure(executionConfigurationSha256(loaded.inputs.environment) === s.contract.configurationSha256
    && JSON.stringify(loaded.inputs.manifest) === JSON.stringify(s.contract.manifest)
    && sha(loaded.route) === s.contract.expectedRouteSha256, 'Pinned inputs or execution configuration changed.');
  return { p, s, ...loaded };
}
function certain(s) {
  ensure(Object.values(s.actions).every(action => action.dispatch === 'returned'), 'Uncertain prior dispatch blocks further actions.');
}
function locked(p, s, action) {
  return withAuthorityLock(p, () => {
    ensure(sha(read(p.state)) === sha(s), 'Case changed while waiting for authority; inspect current state before proceeding.');
    return action();
  });
}

/** Only the supplied actual native tree selects native indices. No arbitrary click API. */
function chromeNodes(raw) {
  ensure(typeof raw === 'string' && raw.length <= 8_000_000
    && /^Window:.*App: Google Chrome\./mu.test(raw), 'Actual complete stable Google Chrome AX required.');
  const nodes = [], indices = new Set(), stack = [], roles = ['standard window', 'window', 'HTML content', 'text field', 'combo box', 'check box', 'checkbox', 'button', 'link', 'text', 'dialog', 'group', 'container'];
  for (const line of raw.split('\n')) {
    const match = /^(\t*)(\d+) (.*)$/u.exec(line); if (!match) continue;
    const index = Number(match[2]), depth = match[1].length; ensure(!indices.has(index), 'Ambiguous duplicate native Chrome index.'); indices.add(index);
    const kind = roles.find(name => match[3] === name || match[3].startsWith(name + ' ')) || 'unknown';
    const suffix = match[3].slice(kind === 'unknown' ? 0 : kind.length).replace(/^\s*\([^)]*\)\s*/u, '').trimStart();
    const description = /(?:^|, )Description: ([\s\S]*?)(?=, (?:Value|Help|ID|URL|Secondary Actions):|$)/u.exec(suffix)?.[1];
    const label = description ?? suffix.replace(/(?:^|, )(?:Value|Help|ID|URL|Secondary Actions):[\s\S]*/u, '').trim();
    while (stack.length && stack.at(-1).depth >= depth) stack.pop();
    nodes.push({ index, role: kind, label, visible: true, enabled: !/\(disabled\)/u.test(match[3]),
      ...(stack.length && { parentIndex: stack.at(-1).index }),
      value: /(?:^|, )Value: ([\s\S]*)/u.exec(suffix)?.[1], href: /(?:^|, )URL: (\S+)/u.exec(suffix)?.[1] });
    stack.push({ index, depth });
  }
  ensure(nodes.filter(node => ['standard window', 'window'].includes(node.role)).length === 1, 'Exactly one owned Chrome native window required.');
  return nodes;
}
function browserCapture(s, material, route, lane) {
  fresh(material, CHROME); actualPage(s, material.url, lane, material.tabId);
  pins(s, material.manifest ?? material.component);
  ensure(material.lane === lane, 'Actual browser lane differs.');
  if (material.context !== undefined) ensure(material.context === s.publicContext, 'Observed public context differs.');
  let links, basis;
  if (material.provenance === 'browser-dom') {
    ensure(Array.isArray(material.links) && material.links.length <= 30, 'Bounded actual browser links required.');
    links = material.links; basis = 'browser-dom';
  } else {
    ensure(material.provenance === 'native-ax', 'Actual browser-dom or native-ax provenance required.');
    const nodes = chromeNodes(material.rawAX), documents = nodes.filter(node => node.role === 'HTML content');
    ensure(documents.length === 1, 'One actual active native browser document required.');
    const document = documents[0];
    const normalize = value => { try { return new URL(value?.startsWith('127.0.0.1:') ? 'http://' + value : value).href; } catch { return undefined; } };
    const expected = new URL(material.url).href;
    if (document.href !== undefined) ensure(normalize(document.href) === expected, 'Native document URL differs from the owned bench page.');
    else {
      const address = nodes.filter(node => ['text field', 'combo box'].includes(node.role) && node.enabled && node.label === 'Address and search bar');
      ensure(address.length === 1 && normalize(address[0].value) === expected, 'A same-capture native address field must identify the owned active bench page.');
    }
    const within = node => { const seen = new Set();
      while (node && !seen.has(node.index)) {
        if (node.index === document.index) return true;
        seen.add(node.index); node = nodes.find(item => item.index === node.parentIndex);
      } return false; };
    links = nodes.filter(node => role(node.role) === 'link' && within(node));
    const component = material.component;
    ensure(component?.client === 'claude-app' && component.href === route
      && ['native-ax', 'trusted-loopback-component-receipt'].includes(component.hrefBasis), 'Exact SDK route from the owned component required.');
    if (component.hrefBasis === 'trusted-loopback-component-receipt') {
      const receipt = component.receipt;
      ensure(receipt?.provenance === 'owned-loopback-component' && receipt.tabId === material.tabId && receipt.url === material.url
        && receipt.href === route && receipt.client === 'claude-app' && receipt.captureId === material.captureId,
      'Trusted loopback route receipt must bind this actual page, tab and capture.');
      pins(s, receipt); basis = 'native-ax-and-trusted-loopback-route';
    } else basis = 'native-ax';
    links = links.map(node => ({ ...node, client: 'claude-app', href: component.hrefBasis === 'native-ax' ? node.href ?? node.value : component.href }));
  }
  const labels = ['Claude', 'Claude desktop', 'Open in Claude',
    ...(material.provenance === 'native-ax' ? ['Open a new Claude desktop conversation with this context'] : [])];
  const found = links.filter(node => role(node.role) === 'link' && node.visible === true && node.enabled === true
    && labels.includes(node.label) && node.client === 'claude-app');
  ensure(found.length === 1 && Number.isSafeInteger(found[0].index) && found[0].index >= 0 && found[0].href === route,
    'One current enabled Claude component link with the exact pinned SDK route required.');
  const evidence = { captureId: material.captureId, capturedAt: material.capturedAt, tabId: material.tabId, lane,
    controlIndex: found[0].index, provenance: basis, pageSha256: sha(material.url), routeSha256: sha(route),
    snapshotSha256: sha(material.provenance === 'native-ax' ? material.rawAX : material.links),
    contextSha256: s.contract.manifest.contextSha256, archiveSha256: s.contract.manifest.archiveSha256,
    tabBinding: 'controller-attributed', bundleId: CHROME };
  return evidence;
}
function claudeBaseCapture(s, material) {
  fresh(material, CLAUDE);
  const snapshot = claudeAXSnapshot(material.rawAX, { owned: true, ownedWindowId: s.contract.windowId,
    captureId: material.captureId, capturedAt: material.capturedAt });
  validateClaudeSnapshot(snapshot, { now: Date.now(), maxAgeMs: AGE });
  const one = predicate => { const found = snapshot.nodes.filter(predicate); ensure(found.length === 1, 'Unique owned Claude main controls required.'); return found[0]; };
  ensure(snapshot.nodes.filter(node => node.role === 'standard window').length === 1, 'One actual owned Claude window required.');
  const scope = one(node => node.role === 'container' && node.label === 'Primary pane');
  const composer = one(node => node.role === 'text entry area' && node.enabled);
  const claude = one(node => node.role === 'radio button' && node.label === 'Claude');
  const code = one(node => node.role === 'radio button' && node.label === 'Code');
  ensure(claude.value === '1' && code.value === '0' && claude.enabled && code.enabled,
    'Actual Claude selected and Code unselected required.');
  return { snapshot, composer, scope, claude, code };
}
function claudeCapture(s, material) {
  const { snapshot, composer, scope, claude, code } = claudeBaseCapture(s, material);
  const result = inspectFreshClaudeReadiness(snapshot, { scopeIndex: scope.index, composerIndex: composer.index,
    claudeModeIndex: claude.index, codeModeIndex: code.index, freshChat: true, now: Date.now(),
    ...selectUnifiedNoSendControls(snapshot, scope.index) });
  const trial = trialProfile(s.contract.profile);
  return { snapshot, composer, result, evidence: { ...result.evidence, modeProfile: s.contract.profile,
    surfaceClaim: trial ? 'merged-conversation-public-invitation-trial' : 'merged-conversation-public-invitation-draft-only',
    legacyChatMode: 'not-established', maximumSends: trial ? 1 : 0 } };
}
function launchCapture(s, material) {
  fresh(material, CHROME); const url = actualPage(s, material.url, 'desktop', material.tabId);
  const nodes = chromeNodes(material.rawAX), matches = nodes.filter(node => node.role === 'button' && node.enabled && node.label === 'Open Claude');
  const dialogs = nodes.filter(node => ['dialog', 'standard window', 'window'].includes(node.role) && node.label === 'Open Claude?');
  const within = (node, target) => { const seen = new Set();
    while (node && !seen.has(node.index)) {
      if (node.index === target.index) return true;
      seen.add(node.index); node = nodes.find(item => item.index === node.parentIndex);
    } return false; };
  ensure(matches.length === 1 && dialogs.length === 1 && within(matches[0], dialogs[0]), 'One actual native Open Claude confirmation required.');
  const scoped = nodes.filter(node => within(node, dialogs[0]));
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const source = new RegExp('(?:^|[\\s"“])(?:http:\\/\\/)?' + escape(url.host) + '(?=$|[\\s/"”])', 'u');
  ensure(scoped.some(node => node.role === 'text' && source.test(node.label)
    && /(?:open|launch)\s+(?:this\s+)?(?:application|app|Claude)/iu.test(node.label)),
  'The native prompt must name the exact expected loopback source.');
  const persistent = scoped.filter(node => ['checkbox', 'check box'].includes(node.role) && /always|remember/iu.test(node.label));
  ensure(persistent.every(node => node.value === '0'), 'Persistent launch permission must be visibly unchecked.');
  return { captureId: material.captureId, capturedAt: material.capturedAt, tabId: material.tabId,
    controlIndex: matches[0].index, snapshotSha256: sha(material.rawAX), sourceOriginSha256: sha(url.origin),
    persistentPermission: persistent.length ? 'observed-unchecked' : 'not-exposed', bundleId: CHROME };
}

export async function prepareRemoteReading(options = {}) {
  return prepareReading(options, false);
}
export async function prepareRemoteReadingTrial(options = {}) {
  ensure(options.authorizeSend === true, 'Explicit fresh one-Send trial authorization required.');
  ensure(options.profile === undefined || trialProfile(options.profile), 'Select the named v1 or v2 or v3 reading trial profile.');
  return prepareReading(options, true);
}
async function prepareReading({ root = ROOT, authorityRoot, environment, controllerId, connectionId,
  authorizeHandoff = false, browserOrigin, browserTabId, probeTabId, draftPolicy = EXACT_POLICY, clockCorrelation,
  profile = READING_TRIAL_PROFILE, submittedPolicy, previousCaseId } = {}, trial) {
  ensure(authorizeHandoff === true && safeId(controllerId) && safeId(connectionId), 'Explicit no-Send handoff authorization and runtime binding required.');
  ensure(environment !== undefined, 'Observed guest environment versions are required; do not substitute host metadata.');
  ensure(safeId(browserTabId) && safeId(probeTabId) && browserTabId !== probeTabId, 'Two distinct owned logical tab identities required.');
  const origin = loopback(browserOrigin); ensure(origin.href === origin.origin + '/', 'Name the loopback origin only.');
  const { inputs, route } = await inputsAndRoute(environment); validateDraftPolicy(draftPolicy, inputs.manifest);
  ensure(submittedPolicy === undefined || trial && submittedPolicy === INLINE_SUBMITTED_POLICY,
    'Only an explicit new trial may select the named submitted-message rendering policy.');
  if (previousCaseId !== undefined) {
    ensure(trial && /^reading-trial-[a-f0-9-]{36}$/u.test(previousCaseId), 'Only a finished public trial can seed fresh-conversation preparation.');
    const previous = read(authorityCasePaths(previousCaseId, root).state);
    ensure(previous.status === 'finished' && previous.actions.send?.dispatch === 'returned'
      && previous.contract.manifest.contextSha256 === inputs.manifest.contextSha256,
    'The prior trial must be finished with one returned public invitation Send.');
  }
  if (clockCorrelation !== undefined) validateClockCorrelation(clockCorrelation, { now: Date.now() });
  bindAuthorityStore({ root, authorityRoot }); const caseId = (trial ? 'reading-trial-' : 'reading-draft-') + randomUUID(), p = authorityCasePaths(caseId, root);
  const contract = { profile: trial ? profile : READING_DRAFT_PROFILE, controllerId, connectionId, windowId: 'guest-claude-' + randomUUID(),
    browserBundleId: CHROME, clientBundleId: CLAUDE, browserTabId, probeTabId,
    browserOriginSha256: sha(origin.origin), expectedRouteSha256: sha(route), manifest: inputs.manifest,
    configurationSha256: executionConfigurationSha256(inputs.environment),
    scope: trial ? profile === READING_TRIAL_RESET_PROFILE ? TRIAL_RESET_SCOPE
      : profile === READING_TRIAL_SETUP_PROFILE ? TRIAL_SETUP_SCOPE : TRIAL_SCOPE : SCOPE, draftPolicy,
    inputLimitsTarget: 'claude-composer-and-claimed-handoff-actions', browserLifecycle: 'separate-owned-tab-bridge-authority',
    ...(clockCorrelation !== undefined && { clockCorrelation: { ...clockCorrelation } }),
    ...(submittedPolicy !== undefined && { submittedPolicy }), ...(previousCaseId !== undefined && { previousCaseId }),
    maximumCaptureAgeMs: AGE, timeoutMs: DURATION };
  if (trial) contract.authorization = { source: 'explicit-user-direction', freshConversation: true,
    publicContextOnly: true, maximumSends: 1, allowSend: true };
  writeExclusive(p.active, { id: caseId, createdAt: now() });
  try {
    fs.mkdirSync(p.dir, { mode: 0o700 }); syncDirectory(p.base);
    const contractSha256 = sha(contract), authority = registerAuthorityCase(p, { id: caseId, kind: 'diagnostic', contractSha256 });
    const state = { schema: SCHEMA, id: caseId, status: 'active', authority, contract, contractSha256,
      environment: inputs.environment, startedAt: now(), deadlineAt: new Date(Date.now() + DURATION).toISOString(),
      actions: {}, preflights: [], arrival: null, ...(trial && { sent: null, transition: null, inspections: [] }) };
    writeAtomic(p.state, state); return state;
  } catch (error) {
    if (fs.existsSync(p.active) && read(p.active).id === caseId) { fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); }
    throw error;
  }
}

export async function preflightRemoteReading(caseId, { root = ROOT, binding, material } = {}) {
  const { p, s } = await current(caseId, root, binding);
  return locked(p, s, () => {
    certain(s); ensure(!s.actions.handoff && s.preflights.length < 12, 'Preflight is bounded and must precede handoff.');
    const { result, evidence } = claudeCapture(s, material); ensure(result.ready, 'Empty merged-conversation preflight failed: ' + result.reason);
    if (s.actions['new-conversation']) ensure(s.actions['new-conversation'].dispatch === 'returned'
      && Date.parse(evidence.capturedAt) > Date.parse(s.actions['new-conversation'].returnedAt),
    'Fresh observed empty conversation after the claimed new-conversation action required.');
    if (s.contract.profile === READING_TRIAL_RESET_PROFILE) {
      const reset = s.actions['reset-public-draft'];
      ensure(reset?.dispatch === 'returned' && evidence.captureId !== reset.captureId
        && Date.parse(evidence.capturedAt) > Date.parse(reset.returnedAt),
      'v3 preflight requires a distinct fresh observed empty composer after the known-public reset returned.');
    }
    ensure(!s.preflights.some(item => item.captureId === evidence.captureId), 'Distinct actual preflight capture required.');
    writeAtomic(p.state, { ...s, preflights: [...s.preflights, evidence] }); return { ready: true, evidence };
  });
}
function within(snapshot, node, scope) {
  const seen = new Set();
  while (node && !seen.has(node.index)) {
    if (node.index === scope.index) return true;
    seen.add(node.index); node = snapshot.nodes.find(item => item.index === node.parentIndex);
  }
  return false;
}
function selected(snapshot, index) {
  ensure(Number.isSafeInteger(index), 'Select an actual current native index.');
  const node = snapshot.nodes.find(item => item.index === index);
  ensure(node?.visible && node.enabled, 'Current visible enabled native control required.'); return node;
}
function trialOnly(s) {
  ensure(trialProfile(s.contract.profile) && s.contract.scope.maximumSends === 1,
    'Only browser-probe, handoff or confirm-launch are provided by draft-only authority; an explicitly authorized one-Send trial profile is required.');
}
function postSendCapture(s, material) {
  trialOnly(s); certain(s);
  const send = s.actions.send;
  ensure(send?.dispatch === 'returned', 'A prior returned one-Send dispatch is required; never resend.');
  const capture = claudeBaseCapture(s, material);
  ensure(capture.snapshot.captureId !== send.captureId
    && Date.parse(capture.snapshot.capturedAt) > Date.parse(send.returnedAt), 'A distinct actual post-Send capture is required.');
  return capture;
}
function trialClaim(s, material, action, inputs, selection) {
  trialOnly(s);
  if (action === 'reset-public-draft') {
    ensure(s.contract.profile === READING_TRIAL_RESET_PROFILE
      && s.contract.scope.maximumKnownPublicDraftResets === 1 && s.contract.scope.maximumClears === 1,
    'Only v3 provides one exact known-public draft reset, never a general clear operation.');
    ensure(!s.preflights.length && !s.actions.handoff && s.actions['setup-raise']?.dispatch === 'returned'
      && s.actions['new-conversation']?.dispatch === 'returned',
    'Known-public reset requires returned setup Raise and New, before preflight or handoff.');
    const { snapshot, composer, result, evidence } = claudeCapture(s, material);
    ensure(result.reason === 'composer-not-empty', 'The actual owned new surface must contain only the known public draft and no messages.');
    const comparison = compareDraftText(inputs.context, composer.value, { policy: s.contract.draftPolicy });
    ensure(comparison.presentationMatches, 'Only the exact pinned Lab draft under the declared policy may be reset.');
    ensure(snapshot.captureId !== s.actions['new-conversation'].captureId
      && Date.parse(snapshot.capturedAt) > Date.parse(s.actions['new-conversation'].returnedAt),
    'A distinct fresh post-New capture is required for the known-public reset.');
    ensure(new RegExp('^\\t*' + composer.index + ' text entry area \\(settable\\)', 'mu').test(material.rawAX),
      'The actual selected public-draft composer must explicitly expose settable control.');
    return { action, evidence: { ...evidence, controlIndex: composer.index, comparison,
      nativeAction: 'setValueEmpty', maximumAttempts: 1, clearTarget: 'exact-pinned-public-lab-draft-only' } };
  }
  if (action === 'new-conversation' || action === 'setup-raise') {
    ensure(!s.preflights.length && !s.actions.handoff, 'New conversation must precede preflight and handoff.');
    const base = claudeBaseCapture(s, material);
    let previousConversation;
    if (s.contract.previousCaseId && (base.composer.value === '' || base.composer.value === '\n')) {
      const user = base.snapshot.nodes.filter(n => n.role === 'container' && n.label === 'Message 1 of 2');
      const assistant = base.snapshot.nodes.filter(n => n.role === 'container' && n.label === 'Message 2 of 2');
      if (user.length === 1 && assistant.length === 1 && selection?.messageIndex !== undefined) {
        previousConversation = extractInlineSubmittedMessage(base.snapshot, inputs.context,
          { ...selection, scopeIndex: user[0].index, ownedUserMessage: true, policy: INLINE_SUBMITTED_POLICY,
            now: Date.now(), maxAgeMs: AGE });
        ensure(!base.snapshot.nodes.some(n => n.role === 'button' && /^(?:Stop|Stop response|Stop generating)$/iu.test(n.label)),
          'A prior public response must be finished before preparing another conversation.');
      }
    }
    const { snapshot, composer } = base;
    const { result, evidence } = previousConversation
      ? { result: { ready: false, reason: 'completed-owned-public-conversation' },
        evidence: { ...previousConversation.evidence, previousCaseId: s.contract.previousCaseId } }
      : claudeCapture(s, material);
    const comparison = result.ready || previousConversation ? undefined : compareDraftText(inputs.context, composer.value, { policy: s.contract.draftPolicy });
    ensure(result.ready || previousConversation || result.reason === 'composer-not-empty' && comparison.presentationMatches,
      'Only the known public Lab draft or an empty owned new surface may precede new-conversation.');
    if (action === 'setup-raise') {
      ensure([READING_TRIAL_SETUP_PROFILE, READING_TRIAL_RESET_PROFILE].includes(s.contract.profile)
        && s.contract.scope.maximumSetupRaises === 1
        && !s.actions['new-conversation'], 'Only the v2 or v3 profile provides one setup Raise before New.');
      const windows = snapshot.nodes.filter(node => node.visible && node.role === 'standard window');
      ensure(windows.length === 1 && windows[0].secondaryActions?.includes('Raise'), 'One actual supported Claude window setup Raise required.');
      return { evidence: { ...evidence, controlIndex: windows[0].index, nativeAction: 'Raise' }, action };
    }
    if ([READING_TRIAL_SETUP_PROFILE, READING_TRIAL_RESET_PROFILE].includes(s.contract.profile)) {
      const raised = s.actions['setup-raise'];
      ensure(raised?.dispatch === 'returned' && snapshot.captureId !== raised.captureId
        && Date.parse(snapshot.capturedAt) > Date.parse(raised.returnedAt),
      'v2/v3 New requires a distinct fresh reviewed capture after setup Raise returned.');
    }
    const sidebars = snapshot.nodes.filter(node => node.visible && node.role === 'container' && node.label === 'Sidebar');
    const buttons = snapshot.nodes.filter(node => node.visible && node.enabled && node.role === 'button'
      && /^(?:New|New chat|New session|New conversation)$/u.test(node.label)
      && sidebars.some(sidebar => within(snapshot, node, sidebar)));
    ensure(sidebars.length === 1 && buttons.length === 1, 'One actual public Sidebar New-conversation button required.');
    return { evidence: { ...evidence, controlIndex: buttons[0].index, ...(comparison && { comparison }) }, action };
  }
  if (action === 'raise' || action === 'send') {
    ensure(s.arrival?.fidelityAccepted === true, 'Accepted arrival in this fresh trial required before Raise or Send.');
    const { snapshot, composer, result, evidence } = claudeCapture(s, material);
    ensure(result.reason === 'composer-not-empty', 'The owned fresh merged conversation must contain only this draft.');
    const compared = s.contract.draftPolicy === LAB_AX_POLICY
      ? extractPresentationComposer(snapshot, inputs.context, { composerIndex: composer.index, policy: LAB_AX_POLICY, now: Date.now() })
      : extractCanonicalComposer(snapshot, inputs.context, { composerIndex: composer.index, now: Date.now() });
    ensure(compared.matches, 'The current draft differs from the declared public invitation policy.');
    if (action === 'raise') {
      const windows = snapshot.nodes.filter(node => node.visible && node.role === 'standard window');
      ensure(windows.length === 1 && windows[0].secondaryActions?.includes('Raise'), 'One actual supported Claude window Raise required.');
      return { evidence: { ...evidence, controlIndex: windows[0].index, nativeAction: 'Raise' }, action };
    }
    const raised = s.actions.raise;
    ensure(raised?.dispatch === 'returned' && snapshot.captureId !== raised.captureId
      && Date.parse(snapshot.capturedAt) > Date.parse(raised.returnedAt),
    'A distinct fresh reviewed post-Raise capture is required before Send.');
    const submit = findSubmitControl(snapshot, compared, { now: Date.now() });
    ensure(submit.found, 'One actual enabled Send control required.');
    return { evidence: { ...evidence, controlIndex: submit.index, comparison: compareDraftText(inputs.context, composer.value,
      { policy: s.contract.draftPolicy }), postRaiseCaptureId: snapshot.captureId, maximumAttempts: 1,
      warningObserved: snapshot.nodes.some(node => node.role === 'text' && /^Use caution before running this prompt\./u.test(node.label)) }, action };
  }
  const { snapshot } = postSendCapture(s, material);
  ensure(selection && Reflect.ownKeys(selection).every(key => ['scopeIndex', 'controlIndex', 'sourceUrl'].includes(key))
    && selection.sourceUrl === LAB_INDEX, 'Only a selected owned public Lab index tool disclosure may be inspected.');
  const scope = selected(snapshot, selection.scopeIndex), control = selected(snapshot, selection.controlIndex);
  const nativeActivitySummary = control.role === 'button' && control.label === 'Created 2 files, ran 2 commands';
  const parentHeader = snapshot.nodes.find(node => node.index === control.parentIndex);
  const ownedCompletedReply = snapshot.nodes.find(node => node.role === 'container' && node.label === 'Message 2 of 2'
    && within(snapshot, control, node));
  const completedToolHeader = s.sent?.matches === true && ownedCompletedReply
    && s.inspections.some(item => item.result.orientation.status === 'observed')
    && parentHeader?.role === 'container' && parentHeader.label !== 'container'
    && (control.label === parentHeader.label || control.label === parentHeader.label + ' Failed')
    && snapshot.nodes.some(node => node.parentIndex === parentHeader.index && node.role === 'text' && node.label === parentHeader.label)
    && !/^(?:allow|approve|permission|send|submit|edit|retry|copy|delete)(?:\b|$)/iu.test(control.label);
  const completedOwnedInspection = s.sent?.matches === true && scope.role === 'container' && scope.label === 'Message 2 of 2'
    && s.inspections.some(item => item.result.orientation.status === 'observed')
    && /^(?:(?:Read|Fetch|Web fetch|Web search|Fetched|Searched the web|View result|Show result|Show tool result)(?:[ :].*)?|Created (?:a|an|\d+) files?(?:, ran (?:a|\d+) commands?)?|Ran (?:a|\d+) commands?)$/iu.test(control.label);
  ensure(['container', 'group', 'section', 'article'].includes(scope.role) && within(snapshot, control, scope)
    && ['button', 'disclosure triangle'].includes(control.role)
    && (nativeActivitySummary || completedOwnedInspection || completedToolHeader || /^(?:(?:Read|Fetch|Web fetch|Web search|Fetched|Searched the web|View result|Show result|Show tool result)(?:[ :].*)?|https:\/\/agentart\.work\/agent-index\.json)$/iu.test(control.label))
    && (completedToolHeader || !/\b(?:allow|approve|permission|send|submit|edit|retry|copy|delete|download)\b/iu.test(control.label)),
  'Only an actual public-source tool disclosure, never permission or response controls, may be clicked.');
  const scoped = snapshot.nodes.filter(node => within(snapshot, node, scope));
  const indexVisible = scoped.some(node => [node.label, node.value, node.url].some(value => typeof value === 'string'
    && (value === LAB_INDEX || value === 'URL: ' + LAB_INDEX || value.includes(LAB_INDEX))));
  // This actual collapsed native disclosure names only the host. Opening it
  // is inspection, not evidence of the expected index or source acquisition.
  // Do not borrow the requested URL from the user message outside this scope.
  const collapsedLabRead = control.role === 'button' && control.label === 'Read agentart.work'
    && scope.role === 'container' && scope.label === 'Currently streaming message';
  ensure(indexVisible || collapsedLabRead || completedOwnedInspection || completedToolHeader,
    'The actual tool region must identify the exact public Lab index or its narrowly recognized collapsed Lab disclosure.');
  const count = Object.keys(s.actions).filter(key => /^inspect-tool-\d+$/u.test(key)).length;
  ensure(count < s.contract.scope.maximumToolInspections, 'Tool inspection budget exhausted.');
  const previous = Object.values(s.actions).filter(item => /^inspect-tool-\d+$/u.test(item.action));
  ensure(previous.every(item => item.captureId !== snapshot.captureId
    && Date.parse(snapshot.capturedAt) > Date.parse(item.returnedAt)),
  'Each tool disclosure input requires a distinct fresh capture after earlier inspection input returned.');
  return { action: 'inspect-tool-' + (count + 1), evidence: { captureId: snapshot.captureId, capturedAt: snapshot.capturedAt,
    windowId: snapshot.windowId, snapshotSha256: sha(material.rawAX), controlIndex: control.index,
    scopeIndex: scope.index, ...(indexVisible ? { sourceUrl: LAB_INDEX, sourceBinding: 'index-url-visible' }
      : { expectedSourceUrl: LAB_INDEX, sourceBinding: 'expected-index-not-yet-observed',
        disclosure: completedOwnedInspection || completedToolHeader ? 'owned-completed-source-activity' : 'read-agentart-work' }),
    ...(nativeActivitySummary && { disclosure: 'created-two-files-two-commands' }),
    maximumAttempts: 1, bundleId: CLAUDE } };
}
export async function claimRemoteReading(caseId, { root = ROOT, binding, action, material, selection } = {}) {
  ensure(ACTIONS.includes(action) || TRIAL_ACTIONS.includes(action), 'Only browser-probe, handoff or confirm-launch, or explicitly scoped trial actions; no typing, keys, clearing or arbitrary click.');
  const { p, s, route, inputs } = await current(caseId, root, binding);
  return locked(p, s, () => {
    certain(s); let evidence;
    if (TRIAL_ACTIONS.includes(action)) {
      ({ evidence, action } = trialClaim(s, material, action, inputs, selection));
    } else if (action === 'browser-probe') {
      ensure(!s.actions.handoff, 'Browser dry-run must precede the real handoff.');
      evidence = browserCapture({ ...s, publicContext: inputs.context }, material, route, 'browser');
    } else if (action === 'handoff') {
      ensure(s.actions['browser-probe']?.effect?.cancelled === true && s.actions['browser-probe'].effect.isTrusted === true,
        'Two actual browser checks (pinned route and canceled probe effect) required before handoff.');
      const preflight = s.preflights.at(-1), age = Date.now() - Date.parse(preflight?.capturedAt);
      ensure(preflight && age >= 0 && age <= AGE, 'Fresh empty Claude preflight required before handoff.');
      evidence = browserCapture({ ...s, publicContext: inputs.context }, material, route, 'desktop');
      evidence = { ...evidence, preflightCaptureId: preflight.captureId, preflightSha256: sha(preflight), windowId: preflight.windowId };
    } else {
      ensure(s.actions.handoff?.effect?.cancelled === false && !s.arrival, 'Observed uncanceled handoff required before launch confirmation.');
      evidence = launchCapture(s, material);
      ensure(Date.parse(evidence.capturedAt) > Date.parse(s.actions.handoff.claimedAt), 'Launch prompt must follow this handoff.');
    }
    const claim = { action, ...evidence, dispatch: 'entered', claimedAt: now() };
    writeExclusive(path.join(p.dir, action + '-claimed.json'), claim);
    writeAtomic(p.state, { ...s, actions: { ...s.actions, [action]: claim } }); return claim;
  });
}
function browserEffect(s, action, claim, effect) {
  ensure(['browser-event', 'owned-bench-run-receipt'].includes(effect?.provenance), 'Actual post-dispatch browser event/receipt required.');
  const lane = action === 'browser-probe' ? 'browser' : 'desktop';
  const page = actualPage(s, effect.url, lane, effect.tabId); pins(s, effect.manifest);
  ensure(sha(effect.url) === claim.pageSha256, 'Post-dispatch evidence must retain the exact claimed page/run.');
  let clockCorrelation;
  if (effect.provenance === 'owned-bench-run-receipt') {
    ensure(safeId(effect.runId) && page.hash === '#' + effect.runId && Number.isSafeInteger(effect.ordinal) && effect.ordinal === 1
      && iso(effect.eventAt) && iso(effect.recordedAt) && effect.capturedAt === effect.recordedAt
      && Date.parse(effect.recordedAt) > Date.parse(claim.claimedAt),
    'An actual first per-run receipt event after the claim is required; GET time cannot refresh an old event.');
    ensure(s.contract.clockCorrelation !== undefined, 'An explicit clock correlation is required for guest event timestamps.');
    clockCorrelation = correlateGuestEvent(s.contract.clockCorrelation, { eventAt: effect.eventAt,
      claimedAt: claim.claimedAt, recordedAt: effect.recordedAt, deadlineAt: s.deadlineAt });
  }
  ensure(safeId(effect.captureId) && iso(effect.capturedAt) && effect.captureId !== claim.captureId
    && Date.parse(effect.capturedAt) > Date.parse(claim.claimedAt) && Date.now() - Date.parse(effect.capturedAt) >= 0
    && Date.now() - Date.parse(effect.capturedAt) <= AGE && effect.lane === lane && effect.client === 'claude-app'
    && effect.clickCount === 1 && effect.isTrusted === true && effect.cancelled === (action === 'browser-probe'),
  'One distinct fresh trusted component effect with the selected cancellation boundary required.');
  return { captureId: effect.captureId, capturedAt: effect.capturedAt, tabId: effect.tabId, lane, client: effect.client,
    clickCount: 1, isTrusted: true, cancelled: effect.cancelled, provenance: effect.provenance,
    pageSha256: sha(effect.url), pinsSha256: sha(effect.manifest),
    ...(effect.provenance === 'owned-bench-run-receipt' && { runId: effect.runId, ordinal: effect.ordinal,
      eventAt: effect.eventAt, recordedAt: effect.recordedAt, clockCorrelation }) };
}
export async function settleRemoteReading(caseId, { root = ROOT, binding, action, returned = false, browserEffect: effect } = {}) {
  ensure((ACTIONS.includes(action) || ['setup-raise', 'new-conversation', 'reset-public-draft', 'raise', 'send'].includes(action) || /^inspect-tool-\d+$/u.test(action))
    && typeof returned === 'boolean', 'Bounded native API-return settlement required.');
  const { p, s } = await current(caseId, root, binding, false);
  return locked(p, s, () => {
    const claim = read(path.join(p.dir, action + '-claimed.json'));
    ensure(s.actions[action]?.captureId === claim.captureId, 'Host action claim differs.');
    ensure(effect === undefined || ['browser-probe', 'handoff'].includes(action), 'Native launch or Claude API return is not a browser event.');
    if (!ACTIONS.includes(action)) trialOnly(s);
    const result = { action, dispatch: returned ? 'returned' : 'unconfirmed', returnedAt: now(), effectObserved: effect !== undefined,
      ...(effect !== undefined && { effect: browserEffect(s, action, claim, effect) }) };
    writeExclusive(path.join(p.dir, action + '-result.json'), result);
    writeAtomic(p.state, { ...s, actions: { ...s.actions, [action]: { ...claim, ...result } } }); return result;
  });
}
export async function arrivalRemoteReading(caseId, { root = ROOT, binding, material, launchResolved = false } = {}) {
  const { p, s, inputs } = await current(caseId, root, binding);
  return locked(p, s, () => {
    certain(s); ensure(!s.arrival, 'Arrival already recorded; no replacement or replay.');
    const handoff = s.actions.handoff;
    ensure(handoff?.effect?.cancelled === false && launchResolved === true, 'Observed handoff and resolved launch required.');
    const { result, evidence, composer } = claudeCapture(s, material);
    ensure(!result.ready && result.reason === 'composer-not-empty', 'Actual merged conversation must contain the draft and no messages/response.');
    ensure(evidence.windowId === handoff.windowId && evidence.captureId !== handoff.preflightCaptureId
      && Date.parse(evidence.capturedAt) > Date.parse(handoff.claimedAt)
      && (!s.actions['confirm-launch'] || Date.parse(evidence.capturedAt) > Date.parse(s.actions['confirm-launch'].returnedAt)),
    'Distinct post-launch capture in the same owned logical Claude window required.');
    const comparison = compareDraftText(inputs.context, composer.value, { policy: s.contract.draftPolicy });
    const accepted = s.contract.draftPolicy === EXACT_POLICY ? comparison.exactMatches : comparison.presentationMatches;
    const arrival = { ...evidence, phase: 'after-handoff', reason: undefined, composerState: 'nonempty', launchResolved: true,
      preflightCaptureId: handoff.preflightCaptureId, handoffClaimedAt: handoff.claimedAt, comparison,
      arrived: true, fidelityAccepted: accepted, submitted: 'not-tested', sourceAccess: 'not-tested', execution: 'not-tested' };
    writeExclusive(path.join(p.dir, 'arrival.json'), arrival); writeAtomic(p.state, { ...s, arrival }); return arrival;
  });
}
export async function sentRemoteReading(caseId, { root = ROOT, binding, material, selection } = {}) {
  const { p, s, inputs } = await current(caseId, root, binding);
  return locked(p, s, () => {
    ensure(!s.sent, 'Submitted-message confirmation already recorded; no replacement.');
    const { snapshot } = postSendCapture(s, material);
    const result = s.contract.submittedPolicy === INLINE_SUBMITTED_POLICY
      ? extractInlineSubmittedMessage(snapshot, inputs.context, { ...selection,
        policy: s.contract.submittedPolicy, now: Date.now(), maxAgeMs: AGE })
      : extractSentMessage(snapshot, inputs.context, { ...selection,
        policy: s.contract.draftPolicy, now: Date.now(), maxAgeMs: AGE });
    writeExclusive(path.join(p.dir, 'sent.json'), result);
    writeAtomic(p.state, { ...s, sent: result }); return result;
  });
}
/** A transition is deliberately weaker than confirmed submitted invitation. */
export async function transitionRemoteReading(caseId, { root = ROOT, binding, material, selection } = {}) {
  const { p, s } = await current(caseId, root, binding);
  return locked(p, s, () => {
    ensure(!s.transition, 'Post-Send transition already recorded; no replacement.');
    const { snapshot, composer, scope } = postSendCapture(s, material);
    ensure(composer.value === '' || composer.value === '\n', 'An emptied current composer is required for the transition.');
    const node = selected(snapshot, selection?.messageBoundaryIndex);
    ensure(within(snapshot, node, scope) && /^(?:User message|You said:|Message\s+1\s+of\s+\d+)$/iu.test(node.label),
      'An actual owned submitted-user-message boundary is required, not assistant prose.');
    const result = { status: 'visible-transition-observed', submittedInvitation: 'not-confirmed',
      evidence: { captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, windowId: snapshot.windowId,
        snapshotSha256: sha(material.rawAX), indices: [composer.index, node.index] } };
    writeExclusive(path.join(p.dir, 'transition.json'), result);
    writeAtomic(p.state, { ...s, transition: result }); return result;
  });
}
export async function resultRemoteReading(caseId, { root = ROOT, binding, material, selection } = {}) {
  if (selection && typeof selection === 'object' && Object.hasOwn(selection, 'requestDenial')) {
    ensure(!Array.isArray(selection) && Reflect.ownKeys(selection).length === 1,
      'The named request-denial inspection must be separate from reply or source-success selections.');
    return requestDenialRemoteReading(caseId, { root, binding, material, selection: selection.requestDenial });
  }
  const { p, s } = await current(caseId, root, binding);
  return locked(p, s, () => {
    const { snapshot, scope } = postSendCapture(s, material);
    ensure(s.inspections.length < 12 && selection && typeof selection === 'object', 'Bounded owned source/reply inspection required.');
    ensure((selection.toolResults ?? []).every(proof => proof.sourceUrl === LAB_INDEX), 'This trial inspects only the public Lab index source.');
    const result = classifyOwnedEvidence(snapshot, { ...selection, now: Date.now(), maxAgeMs: AGE });
    const streaming = snapshot.nodes.some(node => within(snapshot, node, scope)
      && (node.role === 'button' && /^(?:Stop|Stop response|Stop generating)$/iu.test(node.label)
        || /^(?:Currently streaming message|Claude is responding)$/iu.test(node.label)));
    if (streaming && result.orientation.status === 'observed') result.orientation = {
      status: 'not-observed', reason: 'response-in-progress', note: publicDesktopNote('reply-unconfirmed') };
    const observation = { inspectedAt: now(), captureId: snapshot.captureId, result };
    writeExclusive(path.join(p.dir, 'inspection-' + (s.inspections.length + 1) + '.json'), observation);
    writeAtomic(p.state, { ...s, inspections: [...s.inspections, observation] }); return result;
  });
}
/** A named observed curl failure is not a successful source-result proof.
 * The request is inspected as text only; it is never executed or persisted.
 */
export async function requestDenialRemoteReading(caseId, { root = ROOT, binding, material, selection } = {}) {
  const { p, s } = await current(caseId, root, binding);
  return locked(p, s, () => {
    const { snapshot, scope: main } = postSendCapture(s, material);
    const v2 = selection?.adapterVersion === 'curl-request-denial-v2';
    if (v2) ensure(s.inspections.some(item => item.result.orientation.status === 'observed'),
      'The generic curl inspector requires a separately observed completed reply.');
    const fields = ['scopeIndex', 'controlIndex', 'requestLabelIndex', 'requestIndex', 'responseLabelIndex', 'bodyIndex', 'sourceUrl'];
    ensure(s.inspections.length < 12 && selection && typeof selection === 'object'
      && Reflect.ownKeys(selection).every(key => [...fields, 'contentIndex', ...(v2 ? ['adapterVersion'] : [])].includes(key))
      && fields.every(key => Object.hasOwn(selection, key))
      && selection.sourceUrl === LAB_INDEX, 'Only the bounded owned public-index request-denial selection is allowed.');
    const scope = selected(snapshot, selection.scopeIndex), control = selected(snapshot, selection.controlIndex);
    const requestLabel = selected(snapshot, selection.requestLabelIndex), request = selected(snapshot, selection.requestIndex);
    const responseLabel = selected(snapshot, selection.responseLabelIndex), body = selected(snapshot, selection.bodyIndex);
    const content = Object.hasOwn(selection, 'contentIndex') ? selected(snapshot, selection.contentIndex) : scope;
    const nodes = [scope, control, requestLabel, request, responseLabel, body,
      ...(content !== scope ? [content] : [])];
    ensure(new Set(nodes.map(node => node.index)).size === nodes.length
      && scope.role === 'container' && (v2 ? scope.label !== 'container' && scope.label.length <= 200
        && !/^(?:allow|approve|permission|send|submit|edit|retry|copy|delete)(?:\b|$)/iu.test(scope.label)
        : scope.label === 'Fetch the index raw bytes once from the shell')
      && within(snapshot, scope, main) && within(snapshot, control, scope)
      && [requestLabel, request, responseLabel, body].every(node => within(snapshot, node, content))
      && control.role === 'button' && (control.label === scope.label || v2 && control.label === scope.label + ' Failed'),
    'Select the actual distinct expanded raw-index tool boundary and its own disclosure, not an assistant reply.');
    let assistantBoundary;
    if (content !== scope) {
      const siblings = snapshot.nodes.filter(node => node.parentIndex === scope.parentIndex);
      const position = siblings.findIndex(node => node.index === scope.index);
      let ancestor = snapshot.nodes.find(node => node.index === scope.parentIndex);
      const seen = new Set();
      while (ancestor && !seen.has(ancestor.index)) {
        if (['container', 'group'].includes(ancestor.role) && /^Message 2 of 2$/iu.test(ancestor.label)) {
          assistantBoundary = ancestor; break;
        }
        seen.add(ancestor.index); ancestor = snapshot.nodes.find(node => node.index === ancestor.parentIndex);
      }
      ensure(content.role === 'container' && Number.isSafeInteger(scope.parentIndex)
        && content.parentIndex === scope.parentIndex && position >= 0 && siblings[position + 1]?.index === content.index
        && assistantBoundary && within(snapshot, assistantBoundary, main)
        && !snapshot.nodes.some(node => within(snapshot, node, assistantBoundary)
          && (node.role === 'button' && /^(?:Stop|Stop response|Stop generating)$/iu.test(node.label)
            || /^(?:Currently streaming message|Claude is responding)$/iu.test(node.label))),
      'The sibling variant requires adjacent header/content containers inside the same owned completed assistant boundary.');
    }
    const text = node => ['text', 'paragraph'].includes(node.role) ? node.value ?? node.label : undefined;
    ensure(text(requestLabel) === 'Request' && (text(responseLabel) === 'Response' || v2 && text(responseLabel) === 'Error')
      && typeof text(request) === 'string' && typeof text(body) === 'string',
    'The actual tool must expose separate exact Request and Response labels and text.');
    const command = text(request), response = text(body);
    const urls = command.match(/https?:\/\/[^\s"'<>`;)]+/gu) ?? [];
    const curls = command.match(/(?:^|[\s;&|])curl(?=\s|$)/gu) ?? [];
    ensure(curls.length === 1 && urls.length === 1 && urls[0] === LAB_INDEX
      && !/\s(?:-X|--request|-d|--data(?:-raw|-binary|-urlencode)?|-T|--upload-file|-K|--config|--url|--next)(?:[=\s]|$)/u.test(command),
    'The visible request must name one curl and one explicit public-index URL without another request or configuration source.');
    ensure(v2 ? /(?:^|\n)(?:HTTP\/\d(?:\.\d)? 403 Forbidden|curl: \(56\) CONNECT tunnel failed, response 403)(?:\n|$)/u.test(response)
      && !/(?:^|\n)HTTP\/\d(?:\.\d)? 2\d\d\b/u.test(response)
      : /^curl: \(56\) CONNECT tunnel failed, response 403\nHTTP 000 \|  \| 0 bytes\nexit= ?56\n?$/u.test(response),
      'Only the observed CONNECT403, HTTP000, zero-byte curl56 response qualifies this named denial.');
    const result = { orientation: { status: 'not-observed', note: publicDesktopNote('reply-unconfirmed') },
      sourceResults: [{ sourceUrl: LAB_INDEX, representation: 'access-denial', status: 'failed',
        scope: 'visible-tool-access-denial', reason: 'access-failed', identityCheck: 'not-established',
        provenance: 'controller-selected-expanded-curl-request-response', requestUrlBinding: 'visible-curl-request-single-explicit-url',
        payloadSha256: sha(response), requestSha256: sha(command), rawByteIdentity: 'not-established',
        note: publicDesktopNote('source-denied'),
        evidence: { captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, windowId: snapshot.windowId,
          snapshotSha256: sha(material.rawAX), indices: [...nodes.map(node => node.index),
            ...(assistantBoundary ? [assistantBoundary.index] : [])], method: 'visible-tool-request-denial',
          contentBoundary: content !== scope ? 'adjacent-tool-sibling-v1' : 'nested-tool-content',
          ...(v2 && { adapterVersion: 'curl-request-denial-v2', byteCount: 'not-established' }) } }],
      rawByteIdentity: 'not-established', limits: ['The visible curl request and failure are controller-attributed UI observations, not independent execution or network attestation.',
        'An embedded request URL is used only for this named failed-request binding; it cannot establish successful source acquisition or relax exact source-result URL checks.'] };
    const observation = { inspectedAt: now(), captureId: snapshot.captureId, result };
    writeExclusive(path.join(p.dir, 'inspection-' + (s.inspections.length + 1) + '.json'), observation);
    writeAtomic(p.state, { ...s, inspections: [...s.inspections, observation] }); return result;
  });
}
export async function finishRemoteReading(caseId, { root = ROOT, binding, cleanup = {} } = {}) {
  const { p, s } = await current(caseId, root, binding, false);
  return locked(p, s, () => {
    const trial = trialProfile(s.contract.profile);
    ensure(Object.keys(cleanup).every(key => ['browserTabs', 'claudeDraft'].includes(key))
      && (cleanup.browserTabs === undefined || ['closed', 'retained', 'blocked', 'not-created'].includes(cleanup.browserTabs))
      && (cleanup.claudeDraft === undefined || ['unsent-draft-retained', 'not-created', 'blocked',
        ...(trial ? ['submitted-conversation-retained'] : [])].includes(cleanup.claudeDraft)), 'Only bounded actual cleanup facts permitted.');
    const uncertain = Object.values(s.actions).some(action => action.dispatch !== 'returned');
    const browserPassed = s.actions['browser-probe']?.effect?.cancelled === true;
    const handoffPassed = !uncertain && browserPassed && s.actions.handoff?.effect?.cancelled === false
      && s.arrival?.fidelityAccepted === true && Date.now() <= Date.parse(s.deadlineAt);
    const sourceResults = trial ? s.inspections.flatMap(item => item.result.sourceResults) : [];
    const sourceAccess = sourceResults.some(item => item.status === 'observed') ? 'observed'
      : sourceResults.some(item => item.status === 'failed') ? 'failed' : 'not-observed';
    const reply = trial ? s.inspections.findLast(item => item.result.orientation.status === 'observed')?.result.orientation
      ?? s.inspections.at(-1)?.result.orientation ?? { status: 'not-observed' } : undefined;
    const interactionPassed = trial && handoffPassed && s.actions.send?.dispatch === 'returned'
      && s.sent?.matches === true && reply.status === 'observed';
    const passed = trial ? interactionPassed && sourceAccess !== 'not-observed' : handoffPassed;
    const report = { schema: 'agent-art-bench/remote-reading-result/1', caseId, authority: s.authority,
      contractSha256: s.contractSha256, profile: s.contract.profile, finishedAt: now(), passed,
      outcome: uncertain ? 'indeterminate-do-not-retry' : trial
        ? interactionPassed ? sourceAccess === 'observed' ? 'reading-interaction-and-visible-source-observed'
          : sourceAccess === 'failed' ? 'reading-interaction-completed-source-access-failed'
            : 'reading-interaction-completed-source-access-unobserved' : 'reading-interaction-incomplete'
        : passed ? 'lab-component-handoff-and-unsent-draft-observed' : 'incomplete',
      browser: { passed: browserPassed, actions: Object.fromEntries(Object.entries(s.actions).filter(([key]) => key !== 'confirm-launch')) },
      realClient: { launchConfirmation: s.actions['confirm-launch'] ?? null, preflights: s.preflights, arrival: s.arrival,
        sendAttempts: 0, submission: 'not-tested', sourceAccess: 'not-tested', agentExecution: 'not-tested' },
      scope: s.contract.scope, cleanup,
      limits: ['Host controller, guest OS, native CUA and any owned-loopback receipt source are trusted; no independent witness.',
        'Window/tab binding, exclusive input and visual agreement are controller-attributed.',
        'Native API return is not an observed effect. Browser events do not prove native draft arrival.',
        'Draft exposure/presentation does not establish transport-byte identity, reading or Agent execution.',
        'Guest event time is preserved; SSH-bracketed host intervals depend on trusted clocks and the fixed 100ms drift allowance.',
        'Merged conversation observed; legacy Chat mode, disabled tool access and model behavior are not established.',
        trial ? s.contract.profile === READING_TRIAL_RESET_PROFILE
          ? 'Only this separately authorized one-Send contract may submit the pinned invitation; one known-public reset is permitted, with no resend, typing, keypress or arbitrary clearing.'
          : 'Only this separately authorized one-Send contract may submit the pinned public invitation; no resend, typing, keypress or clearing operation is provided.'
          : 'No Send, typing, keypress or clearing operation is provided. Restoring the guest cannot renew host claims.'] };
    if (trial) {
      report.interactionPassed = interactionPassed;
      report.realClient = { ...report.realClient, ...([READING_TRIAL_SETUP_PROFILE, READING_TRIAL_RESET_PROFILE].includes(s.contract.profile)
        && { setupRaise: s.actions['setup-raise'] ?? null }), newConversation: s.actions['new-conversation'] ?? null,
        raise: s.actions.raise ?? null, send: s.actions.send ?? null, sendAttempts: s.actions.send ? 1 : 0,
        submission: s.sent ? 'invitation-observed-under-selected-policy' : s.transition?.status ?? 'not-observed',
        submittedMessage: s.sent, transition: s.transition, sourceAccess, sourceResults, reply, inspections: s.inspections,
        agentExecution: 'not-independently-attested', modelOrigin: 'not-established',
        sendRecovery: s.actions.send && !s.sent ? 'possibly-attempted-do-not-resend' : 'no-retry' };
      report.limits.push('Visible submission, source tool result and completed reply are separate controller-attributed observations; raw transport bytes and model origin remain unestablished.',
        'An inspected source denial completes that check but cannot be reported as successful source acquisition. Earlier no-Send reports remain immutable.');
      if (s.contract.profile === READING_TRIAL_RESET_PROFILE) {
        report.realClient.knownPublicDraftReset = s.actions['reset-public-draft'] ?? null;
        report.limits.push('v3 permits exactly one reset of the owned pinned public Lab draft before preflight; it does not permit clearing arbitrary drafts or restoring consumed budgets.');
      }
    }
    writeExclusive(path.join(p.dir, 'report.json'), report); writeAtomic(p.state, { ...s, status: 'finished' });
    fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); return report;
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const raw = fs.readFileSync(0, 'utf8'); ensure(Buffer.byteLength(raw) <= 9_000_000, 'Bounded request required.');
    const { op, caseId, ...options } = JSON.parse(raw);
    const methods = { prepare: prepareRemoteReading, 'prepare-trial': prepareRemoteReadingTrial,
      claim: claimRemoteReading, settle: settleRemoteReading, preflight: preflightRemoteReading,
      arrival: arrivalRemoteReading, sent: sentRemoteReading, transition: transitionRemoteReading,
      result: resultRemoteReading, 'request-denial': requestDenialRemoteReading, finish: finishRemoteReading };
    ensure(Object.hasOwn(methods, op), 'Only explicit prepare/prepare-trial, bounded action/settlement, observation or finish.');
    console.log(JSON.stringify(await (['prepare', 'prepare-trial'].includes(op) ? methods[op](options) : methods[op](caseId, options))));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
