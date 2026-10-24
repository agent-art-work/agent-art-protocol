/** Pure Claude Chat readiness checks. No UI actions, clocks, or raw-text output. */
import { createHash } from 'node:crypto';
import { validateClaudeSnapshot } from './desktop-ui.mjs';
import { isPlainRecord } from './plain-record.mjs';

const SCHEMA = 'agent-art-bench/claude-readiness/1';
// This opt-in identifies the observed merged conversation surface for no-Send
// diagnostics only. It does not establish legacy Chat or restrict Claude's tools.
export const CLAUDE_UNIFIED_NO_SEND_PROFILE = 'claude-unified-no-send-v1';
const sha256 = value => createHash('sha256').update(value, 'utf8').digest('hex');
const role = value => String(value || '').replace(/^AX/u, '').replace(/[\s_-]/gu, '').toLowerCase();
const fail = message => { throw new TypeError(message); };
const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const safeId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(value);

function captureDigest(snapshot) {
  return sha256(JSON.stringify({ captureId: snapshot.captureId, capturedAt: snapshot.capturedAt,
    bundleId: snapshot.bundleId, windowId: snapshot.windowId, documentUrl: snapshot.documentUrl,
    nodes: snapshot.nodes }));
}

function selected(snapshot, index) {
  if (!Number.isSafeInteger(index)) fail('Select readiness indices from this capture.');
  const node = snapshot.nodes.find(item => item.index === index);
  if (!node || !node.visible) fail('A selected readiness node is not visible.');
  return node;
}

function under(node, scope, byIndex) {
  const seen = new Set();
  let current = node;
  while (current && !seen.has(current.index)) {
    if (current.index === scope.index) return true;
    seen.add(current.index);
    current = byIndex.get(current.parentIndex);
  }
  return false;
}

function newChatUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.origin === 'https://claude.ai' && url.pathname === '/new'
      && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}

/** Select positive public controls from one actual owned main region. */
export function selectUnifiedNoSendControls(snapshot, scopeIndex) {
  const scope = selected(snapshot, scopeIndex);
  const byIndex = new Map(snapshot.nodes.map(node => [node.index, node]));
  const one = predicate => {
    const matches = snapshot.nodes.filter(node => node.visible && node.enabled && under(node, scope, byIndex) && predicate(node));
    if (matches.length !== 1) fail('Unique scoped unified no-Send controls required.');
    return matches[0].index;
  };
  return { modeProfile: CLAUDE_UNIFIED_NO_SEND_PROFILE,
    unifiedHeadingIndex: one(node => role(node.role) === 'heading' && node.label === 'New session'),
    projectControlIndex: one(node => role(node.role) === 'popupbutton' && node.label === 'Project or folder'),
    permissionControlIndex: one(node => role(node.role) === 'popupbutton' && node.label === 'Manual'),
    browserControlIndex: one(node => role(node.role) === 'togglebutton' && node.label === 'Browser' && node.value === '0') };
}

function assess(snapshot, { scopeIndex, composerIndex, claudeModeIndex, codeModeIndex, freshChat,
  modeProfile, chatTabIndex, coworkTabIndex, unifiedHeadingIndex, projectControlIndex, permissionControlIndex, browserControlIndex }) {
  const scope = selected(snapshot, scopeIndex), composer = selected(snapshot, composerIndex);
  const claude = selected(snapshot, claudeModeIndex), code = selected(snapshot, codeModeIndex);
  if (!['group', 'section', 'article', 'container'].includes(role(scope.role))) fail('Select the owned main Chat region.');
  const byIndex = new Map(snapshot.nodes.map(node => [node.index, node]));
  // Claude's actual mode radios live in its Sidebar, outside Primary pane.
  // They still belong to the one complete owned-window capture. Only the
  // composer must be inside the selected main Chat region.
  if (composer.index === scope.index || !under(composer, scope, byIndex)) fail('The readiness composer must belong to the selected main Chat region.');
  if (!['textarea', 'textentryarea', 'textfield'].includes(role(composer.role)) || !composer.enabled || typeof composer.value !== 'string') fail('Select an enabled owned composer.');
  const scoped = snapshot.nodes.filter(node => node.visible && under(node, scope, byIndex));
  const messagePresent = scoped.some(node => /^(?:message(?:\s+\d+(?:\s+of\s+\d+)?)?|user message|assistant message|currently streaming message)$/iu.test(node.label)
    || /^(?:you|claude) said:/iu.test(node.label));
  const streaming = scoped.some(node => (role(node.role) === 'button' && /^(?:stop|stop response|stop generating)$/iu.test(node.label))
    || /^(?:currently streaming message|claude is responding)$/iu.test(node.label));
  // The default/legacy profiles still refuse this different surface. Only a
  // separately named no-Send profile may positively identify the merged UI.
  const sessionSurface = scoped.some(node => role(node.role) === 'heading' && node.label === 'New session'
    || role(node.role) === 'popupbutton' && node.label === 'Project or folder');
  if (modeProfile !== undefined && !['claude-chat-cowork-v1', CLAUDE_UNIFIED_NO_SEND_PROFILE].includes(modeProfile)) fail('Select a supported named mode profile.');
  const named = modeProfile === 'claude-chat-cowork-v1';
  const unified = modeProfile === CLAUDE_UNIFIED_NO_SEND_PROFILE;
  let unifiedSelected = false;
  if (unified) {
    const actual = selectUnifiedNoSendControls(snapshot, scopeIndex);
    unifiedSelected = actual.unifiedHeadingIndex === unifiedHeadingIndex && actual.projectControlIndex === projectControlIndex
      && actual.permissionControlIndex === permissionControlIndex && actual.browserControlIndex === browserControlIndex
      && role(scope.role) === 'container' && scope.label === 'Primary pane'
      && composer.label === 'Write your prompt to Claude'
      && snapshot.nodes.filter(node => node.visible && role(node.role) === 'container' && node.label === 'Primary pane').length === 1
      && snapshot.nodes.filter(node => node.visible && ['textarea', 'textentryarea', 'textfield'].includes(role(node.role))).length === 1
      && snapshot.nodes.filter(node => node.visible && role(node.role) === 'radiobutton' && node.label === 'Claude').length === 1
      && snapshot.nodes.filter(node => node.visible && role(node.role) === 'radiobutton' && /^Code(?:,|$)/u.test(node.label)).length === 1
      && !scoped.some(node => role(node.role) === 'radiobutton' && ['Chat', 'Cowork'].includes(node.label));
  }
  let chatSelected = true;
  if (named) {
    const chat = selected(snapshot, chatTabIndex), cowork = selected(snapshot, coworkTabIndex);
    chatSelected = chat.index !== cowork.index && under(chat, scope, byIndex) && under(cowork, scope, byIndex)
      && role(chat.role) === 'radiobutton' && chat.label === 'Chat' && chat.enabled && chat.value === '1'
      && role(cowork.role) === 'radiobutton' && cowork.label === 'Cowork' && cowork.enabled && cowork.value === '0';
  }
  const modes = role(claude.role) === 'radiobutton' && claude.label === (named ? 'Chat and Cowork' : 'Claude') && claude.enabled && claude.value === '1'
    && role(code.role) === 'radiobutton' && ['Code', 'Code, unread activity', 'Code, awaiting your input'].includes(code.label) && code.enabled && code.value === '0';
  return { composer, reason: freshChat !== true ? 'ownership-not-established'
    : !newChatUrl(snapshot.documentUrl) ? 'new-chat-not-established'
    : sessionSurface && !unified ? 'chat-surface-ambiguous'
    : !modes || !chatSelected || unified && !unifiedSelected ? 'chat-mode-not-established'
    : streaming ? 'response-in-progress'
    : messagePresent ? 'existing-message-present' : undefined };
}

function evidence(snapshot, options, phase, reason, composerState) {
  return { schema: SCHEMA, phase, captureId: snapshot.captureId, capturedAt: snapshot.capturedAt,
    windowId: snapshot.windowId, snapshotSha256: captureDigest(snapshot),
    indices: [options.scopeIndex, options.composerIndex, options.claudeModeIndex, options.codeModeIndex,
      ...(options.modeProfile === 'claude-chat-cowork-v1' ? [options.chatTabIndex, options.coworkTabIndex] : []),
      ...(options.modeProfile === CLAUDE_UNIFIED_NO_SEND_PROFILE ? [options.unifiedHeadingIndex, options.projectControlIndex,
        options.permissionControlIndex, options.browserControlIndex] : [])],
    ...(options.modeProfile && { modeProfile: options.modeProfile }),
    ...(options.modeProfile === CLAUDE_UNIFIED_NO_SEND_PROFILE && { surfaceClaim: 'merged-conversation-observed-no-send-only', legacyChatMode: 'not-established' }),
    freshChatOwned: options.freshChat === true, newChatObserved: newChatUrl(snapshot.documentUrl),
    composerState, ...(reason ? { reason } : {}) };
}

/** Establish an empty, owned /new Chat before any native launch is requested. */
export function inspectFreshClaudeReadiness(snapshot, options = {}) {
  validateClaudeSnapshot(snapshot, { now: options.now, ...(options.maxAgeMs === undefined ? {} : { maxAgeMs: options.maxAgeMs }) });
  const checked = assess(snapshot, options);
  // A lone LF is the adapter's observed empty AX formatting representation.
  // Spaces, CRLF, and arbitrary whitespace are deliberately not trimmed.
  const empty = checked.composer.value === '' || checked.composer.value === '\n';
  const reason = checked.reason ?? (!empty ? 'composer-not-empty' : undefined);
  return { ready: !reason, ...(reason ? { reason } : {}), evidence: evidence(snapshot, options, 'before-handoff', reason, empty ? 'empty' : 'nonempty') };
}

/** Exact public marker/empty check for the zero-handoff, zero-Send diagnostic.
 * Shares actual Chat/mode/ancestry checks without rewriting a capture.
 */
export function inspectDiagnosticComposer(snapshot, options = {}) {
  validateClaudeSnapshot(snapshot, { now: options.now, maxAgeMs: options.maxAgeMs ?? 30000 });
  const checked = assess(snapshot, options);
  const empty = checked.composer.value === '' || checked.composer.value === '\n';
  if (options.expected !== 'empty' && (typeof options.marker !== 'string' || !/^agent-art-no-send-[a-f0-9-]{36}$/u.test(options.marker))) fail('Only the generated public diagnostic marker is allowed.');
  const matches = options.expected === 'empty' ? empty : checked.composer.value === options.marker;
  const reason = checked.reason ?? (!matches ? 'diagnostic-composer-differs' : undefined);
  return { ready: !reason, ...(reason ? { reason } : {}), evidence: evidence(snapshot, options, 'no-send-diagnostic', reason, empty ? 'empty' : 'nonempty') };
}

/** Establish actual post-launch arrival; the submit path still compares text. */
export function inspectClaudeArrival(snapshot, options = {}) {
  if (options.modeProfile === CLAUDE_UNIFIED_NO_SEND_PROFILE) fail('The unified no-Send profile cannot qualify handoff arrival or submission.');
  validateClaudeSnapshot(snapshot, { now: options.now, ...(options.maxAgeMs === undefined ? {} : { maxAgeMs: options.maxAgeMs }) });
  const preflight = options.readiness?.evidence ?? options.readiness;
  const handoff = options.handoff;
  if ((options.readiness?.evidence !== undefined && options.readiness.ready !== true)
      || !isPlainRecord(preflight) || preflight.schema !== SCHEMA || preflight.phase !== 'before-handoff'
      || preflight.reason !== undefined || preflight.freshChatOwned !== true || preflight.newChatObserved !== true
      || preflight.composerState !== 'empty' || !safeId(preflight.captureId) || !timestamp(preflight.capturedAt)
      || typeof preflight.snapshotSha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(preflight.snapshotSha256)
      || !isPlainRecord(handoff) || !timestamp(handoff.claimedAt)
      || Date.parse(preflight.capturedAt) > Date.parse(handoff.claimedAt)
      || Date.parse(handoff.claimedAt) - Date.parse(preflight.capturedAt) > (options.maxAgeMs ?? 30000)
      || (handoff.preflightCaptureId !== undefined && handoff.preflightCaptureId !== preflight.captureId)) fail('A successful preflight and subsequent handoff claim are required.');
  const checked = assess(snapshot, options);
  const nonempty = checked.composer.value !== '' && checked.composer.value !== '\n';
  const reason = options.launchResolved !== true ? 'launch-not-resolved'
    : snapshot.windowId !== preflight.windowId ? 'window-differs'
    : snapshot.captureId === preflight.captureId || Date.parse(snapshot.capturedAt) <= Date.parse(handoff.claimedAt) ? 'arrival-not-after-handoff'
    : checked.reason ?? (!nonempty ? 'draft-not-arrived' : undefined);
  return { arrived: !reason, ...(reason ? { reason } : {}), evidence: {
    ...evidence(snapshot, options, 'after-handoff', reason, nonempty ? 'nonempty' : 'empty'),
    preflightCaptureId: preflight.captureId, handoffClaimedAt: handoff.claimedAt,
    launchResolved: options.launchResolved === true,
    // Arrival is a UI-state fact only. The separate selected-policy comparison
    // must succeed on this same capture before submission is considered.
    draftFidelity: 'not-compared',
  } };
}
