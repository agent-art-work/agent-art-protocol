/** Host-owned authority for guest Claude setup. No desktop driver or Send API.
 * The caller supplies reviewed, complete guest-native CUA observations.
 * The VM never reads or writes canonical authority files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT, loadBenchInputs } from './inputs.mjs';
import { SDK_SHA256 } from './desktop-runner.mjs';
import { bindAuthorityStore, authorityCasePaths, registerAuthorityCase, assertAuthorityCase,
  withAuthorityLock, writeExclusive, writeAtomic, syncDirectory } from './authority-store.mjs';
import { claudeAXSnapshot } from './claude-ax.mjs';
import { validateClaudeSnapshot } from './desktop-ui.mjs';
import { executionConfigurationSha256 } from './execution-contract.mjs';
import { inspectFreshClaudeReadiness, CLAUDE_UNIFIED_NO_SEND_PROFILE, selectUnifiedNoSendControls } from './readiness.mjs';

const SCHEMA = 'agent-art-bench/remote-readiness/1';
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(value);
const ACTIONS = ['select-chat', 'open-new-chat', 'open-file-menu'];
const SCOPE = Object.freeze({ maximumModeSelections: 1, maximumNewChats: 1,
  maximumTypes: 0, maximumKeypresses: 0, maximumClears: 0, maximumHandoffs: 0, maximumSends: 0 });
const MENU_PROFILE = 'claude-file-new-chat-v1';
const scopeFor = contract => contract.setupProfile === MENU_PROFILE ? { ...SCOPE, maximumMenuOpens: 1 } : SCOPE;

function current(caseId, root, binding, deadline = true) {
  const p = authorityCasePaths(caseId, root), s = read(p.state);
  const registration = assertAuthorityCase(p, s);
  ensure(s.schema === SCHEMA && s.status === 'active' && read(p.active).id === caseId, 'Active host-owned readiness session required.');
  ensure(s.contractSha256 === sha(s.contract) && registration.contractSha256 === s.contractSha256
    && JSON.stringify(s.contract.scope) === JSON.stringify(scopeFor(s.contract)), 'Readiness scope/registration changed.');
  ensure(binding?.connectionId === s.contract.connectionId && binding?.controllerId === s.contract.controllerId,
    'Remote controller/runtime binding changed; do not reconnect or replay an action.');
  if (deadline) ensure(Date.now() <= Date.parse(s.deadlineAt), 'Readiness deadline expired.');
  return { p, s };
}

function capture(s, material) {
  ensure(material?.visualAgreement === 'agrees' && material?.inputOwnership === 'exclusive',
    'Fresh controller-reviewed AX/pixels and exclusive guest input required.');
  ensure(id(material.captureId) && typeof material.capturedAt === 'string', 'Actual capture identity/time required.');
  const snapshot = claudeAXSnapshot(material.rawAX, { owned: true,
    ownedWindowId: s.contract.windowId, captureId: material.captureId, capturedAt: material.capturedAt });
  validateClaudeSnapshot(snapshot, { now: Date.now(), maxAgeMs: 30000 });
  ensure(snapshot.nodes.filter(n => n.role === 'standard window').length === 1, 'One owned Claude window required.');
  return snapshot;
}
function controls(snapshot) {
  const one = predicate => { const found = snapshot.nodes.filter(predicate);
    ensure(found.length === 1, 'Unique current mode, main region and empty composer required.'); return found[0]; };
  const chat = one(n => n.role === 'radio button' && ['Claude', 'Chat and Cowork'].includes(n.label) && n.enabled);
  const code = one(n => n.role === 'radio button' && n.label === 'Code' && n.enabled);
  const scope = one(n => n.role === 'container' && n.label === 'Primary pane');
  const composer = one(n => n.role === 'text entry area' && n.enabled);
  const byIndex = new Map(snapshot.nodes.map(n => [n.index, n])); let ancestor = composer; const seen = new Set();
  while (ancestor && ancestor.index !== scope.index && !seen.has(ancestor.index)) {
    seen.add(ancestor.index); ancestor = byIndex.get(ancestor.parentIndex);
  }
  ensure(ancestor?.index === scope.index && ['', '\n'].includes(composer.value), 'Do not navigate away from a nonempty or unowned composer.');
  ensure(!snapshot.nodes.some(n => n.role === 'button' && /^(stop|stop response|stop generating)$/iu.test(n.label)), 'A response is in progress.');
  return { chat, code, scope, composer };
}
function submode(snapshot, scope) {
  const inside = node => { const seen = new Set();
    while (node && !seen.has(node.index)) {
      if (node.index === scope.index) return true;
      seen.add(node.index); node = snapshot.nodes.find(n => n.index === node.parentIndex);
    } return false; };
  const one = label => { const found = snapshot.nodes.filter(n => n.role === 'radio button' && n.enabled && n.label === label && inside(n));
    ensure(found.length === 1, 'Unique Chat/Cowork selectors inside the owned main region required.'); return found[0]; };
  return { chat: one('Chat'), cowork: one('Cowork') };
}

export async function prepareRemoteReadiness({ root = ROOT, authorityRoot, inputs, environment, controllerId,
  connectionId, authorizeSetup = false, timeoutMs = 1800000, setupProfile } = {}) {
  ensure(authorizeSetup === true && id(controllerId) && id(connectionId), 'Explicit no-Send setup authorization and remote binding required.');
  ensure(Number.isSafeInteger(timeoutMs) && timeoutMs >= 1000 && timeoutMs <= 1800000, 'Bounded readiness deadline required.');
  inputs ||= await loadBenchInputs({ environment });
  ensure(setupProfile === undefined || setupProfile === MENU_PROFILE, 'Unsupported named setup profile.');
  ensure(inputs.manifest.sdkVersion === '0.1.4' && inputs.manifest.archiveSha256 === SDK_SHA256, 'SDK 0.1.4 pin must remain unchanged.');
  bindAuthorityStore({ root, authorityRoot });
  const caseId = 'readiness-' + randomUUID(), p = authorityCasePaths(caseId, root);
  const contract = { controllerId, connectionId, targetBundleId: 'com.anthropic.claudefordesktop',
    windowId: 'guest-claude-' + randomUUID(), configurationSha256: executionConfigurationSha256(inputs.environment),
    sdkVersion: '0.1.4', archiveSha256: SDK_SHA256, scope: setupProfile ? { ...SCOPE, maximumMenuOpens: 1 } : SCOPE, timeoutMs,
    ...(setupProfile && { setupProfile }) };
  writeExclusive(p.active, { id: caseId, createdAt: new Date().toISOString() });
  try {
    fs.mkdirSync(p.dir, { mode: 0o700 }); syncDirectory(p.base);
    const contractSha256 = sha(contract), authority = registerAuthorityCase(p, { id: caseId, kind: 'diagnostic', contractSha256 });
    const state = { schema: SCHEMA, id: caseId, status: 'active', authority, contract, contractSha256,
      startedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + timeoutMs).toISOString(), actions: {}, readiness: [] };
    writeAtomic(p.state, state); return state;
  } catch (error) {
    if (fs.existsSync(p.active) && read(p.active).id === caseId) { fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); }
    throw error;
  }
}

/** Persist once before native dispatch. The returned index is bound to this capture. */
export function claimRemoteSetup(caseId, { root = ROOT, binding, action, material } = {}) {
  ensure(ACTIONS.includes(action), 'Only select-chat and open-new-chat are permitted; no arbitrary clicks, keys or Send.');
  const { p } = current(caseId, root, binding);
  return withAuthorityLock(p, () => {
    const { s } = current(caseId, root, binding);
    ensure(Object.values(s.actions).every(a => a.dispatch === 'returned'), 'An uncertain prior action blocks all further input.');
    const snapshot = capture(s, material), c = controls(snapshot); let control;
    if (action === 'open-file-menu') {
      ensure(s.contract.setupProfile === MENU_PROFILE, 'File menu requires the explicit named preparation scope.');
      const bars = snapshot.nodes.filter(n => n.role === 'menu bar');
      ensure(bars.length === 1, 'One actual native menu bar required.');
      const files = snapshot.nodes.filter(n => n.label === 'File' && n.enabled && n.parentIndex === bars[0].index);
      ensure(files.length === 1, 'One actual File menu control required.'); control = files[0];
    } else if (action === 'select-chat') {
      ensure(c.chat.value === '0' && c.code.value === '1'
        && snapshot.documentUrl === 'https://claude.ai/epitaxy', 'Select Chat only from the observed empty Code surface.');
      control = c.chat;
    } else {
      ensure(c.chat.value === '1' && c.code.value === '0', 'The Chat mode must actually be selected.');
      const found = snapshot.nodes.filter(n => n.role === 'button' && n.enabled && /^(New chat|New Chat)$/u.test(n.label));
      if (found.length === 1) control = found[0];
      else {
        // Current Claude restores Cowork inside /new after selecting its shared
        // umbrella. Opening the empty Chat form is the same one-budget setup
        // operation; it is never a generic click or a mode inference from URL.
        ensure(found.length === 0 && snapshot.documentUrl === 'https://claude.ai/new', 'One actual New chat control required.');
        const tabs = submode(snapshot, c.scope);
        ensure(tabs.chat.value === '0' && tabs.cowork.value === '1', 'Only the observed empty Cowork form may switch to Chat.');
        control = tabs.chat;
      }
    }
    const claim = { action, controlIndex: control.index, captureId: snapshot.captureId,
      capturedAt: snapshot.capturedAt, snapshotSha256: sha(snapshot), dispatch: 'entered', claimedAt: new Date().toISOString() };
    writeExclusive(path.join(p.dir, action + '-claimed.json'), claim);
    writeAtomic(p.state, { ...s, actions: { ...s.actions, [action]: claim }, readiness: [] });
    return claim;
  });
}

/** Native API return is not an observed effect. A missing ack never renews a claim. */
export function settleRemoteSetup(caseId, { root = ROOT, binding, action, returned = false } = {}) {
  ensure(ACTIONS.includes(action) && typeof returned === 'boolean', 'Bounded setup result required.');
  const { p } = current(caseId, root, binding, false);
  return withAuthorityLock(p, () => {
    const { s } = current(caseId, root, binding, false), claim = read(path.join(p.dir, action + '-claimed.json'));
    ensure(s.actions[action]?.captureId === claim.captureId, 'Host claim/state differs; stop.');
    const result = { action, dispatch: returned ? 'returned' : 'unconfirmed', returnedAt: new Date().toISOString() };
    writeExclusive(path.join(p.dir, action + '-result.json'), result);
    writeAtomic(p.state, { ...s, actions: { ...s.actions, [action]: { ...claim, ...result } } }); return result;
  });
}

export function recordRemoteReadiness(caseId, { root = ROOT, binding, material, modeProfile } = {}) {
  const { p } = current(caseId, root, binding);
  return withAuthorityLock(p, () => {
    const { s } = current(caseId, root, binding);
    ensure(Object.values(s.actions).every(a => a.dispatch === 'returned'), 'Uncertain setup action cannot qualify readiness.');
    ensure(s.readiness.length < 2, 'Two readiness observations are the bounded target.');
    const snapshot = capture(s, material), c = controls(snapshot);
    ensure(!s.readiness.some(r => r.captureId === snapshot.captureId), 'Use distinct fresh captures.');
    const latestAction = Object.values(s.actions).at(-1);
    ensure(!latestAction || Date.parse(snapshot.capturedAt) >= Date.parse(latestAction.returnedAt)
      && snapshot.captureId !== latestAction.captureId, 'Readiness needs a post-action capture.');
    const result = inspectFreshClaudeReadiness(snapshot, { scopeIndex: c.scope.index, composerIndex: c.composer.index,
      claudeModeIndex: c.chat.index, codeModeIndex: c.code.index, freshChat: true, now: Date.now(),
      ...(modeProfile === CLAUDE_UNIFIED_NO_SEND_PROFILE ? selectUnifiedNoSendControls(snapshot, c.scope.index)
        : modeProfile && { modeProfile, chatTabIndex: submode(snapshot, c.scope).chat.index,
        coworkTabIndex: submode(snapshot, c.scope).cowork.index }) });
    ensure(result.ready, 'Claude Chat readiness failed: ' + result.reason);
    ensure(!s.readiness.length || s.readiness[0].modeProfile === result.evidence.modeProfile,
      'Both readiness captures must establish the same explicit surface profile.');
    writeAtomic(p.state, { ...s, readiness: [...s.readiness, result.evidence] }); return result;
  });
}

export function finishRemoteReadiness(caseId, { root = ROOT, binding } = {}) {
  const { p } = current(caseId, root, binding, false);
  return withAuthorityLock(p, () => {
    const { s } = current(caseId, root, binding, false);
    const uncertain = Object.values(s.actions).some(a => a.dispatch !== 'returned');
    const passed = !uncertain && s.readiness.length === 2 && Date.now() <= Date.parse(s.deadlineAt);
    const unified = s.readiness[0]?.modeProfile === CLAUDE_UNIFIED_NO_SEND_PROFILE;
    const report = { schema: 'agent-art-bench/remote-readiness-result/1', caseId, authority: s.authority,
      contractSha256: s.contractSha256, finishedAt: new Date().toISOString(), passed,
      outcome: passed ? unified ? 'host-authority-and-claude-unified-no-send-readiness-observed'
        : 'host-authority-and-claude-chat-readiness-observed' : uncertain ? 'indeterminate-do-not-retry' : 'incomplete',
      actions: s.actions, readiness: s.readiness, scope: s.contract.scope,
      limits: ['Host controller, guest OS and native CUA are trusted; no independent witness.',
        'No typing, keypress, handoff or Send is provided or qualified.',
        'No guest authority replica; restoring the guest cannot restore host claims.',
        'Clock freshness and exclusive guest input remain controller assertions.',
        ...(unified ? ['Merged conversation controls are observed for no-Send diagnostics; legacy Chat, model behavior and disabled tool access are not established.'] : [])] };
    writeExclusive(path.join(p.dir, 'report.json'), report);
    writeAtomic(p.state, { ...s, status: 'finished' });
    fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); return report;
  });
}

if (typeof process !== 'undefined' && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const raw = fs.readFileSync(0, 'utf8'); ensure(Buffer.byteLength(raw) <= 9_000_000, 'Bounded request required.');
    const request = JSON.parse(raw), { op, caseId, ...options } = request;
    const methods = { prepare: prepareRemoteReadiness, claim: claimRemoteSetup, settle: settleRemoteSetup,
      ready: recordRemoteReadiness, finish: finishRemoteReadiness };
    ensure(Object.hasOwn(methods, op), 'Use only prepare, claim, settle, ready or finish.');
    const method = methods[op];
    console.log(JSON.stringify(op === 'prepare' ? await method(options) : method(caseId, options)));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
