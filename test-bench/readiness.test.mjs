import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CLAUDE_BUNDLE_ID } from './desktop-ui.mjs';
import { inspectFreshClaudeReadiness, inspectClaudeArrival } from './readiness.mjs';

const at = '2026-10-22T01:00:00.000Z';
const claimedAt = '2026-10-22T01:00:01.000Z';
const after = '2026-10-22T01:00:02.000Z';
const now = '2026-10-22T01:00:03.000Z';
const node = (index, role, label, value, parentIndex = 10) => ({ index, role, label,
  ...(value === undefined ? {} : { value }), parentIndex, visible: true, enabled: true });
const fixture = () => ({ captureId: 'ready-1', capturedAt: at, documentUrl: 'https://claude.ai/new',
  bundleId: CLAUDE_BUNDLE_ID, complete: true, owned: true, windowId: 3, ownedWindowId: 3,
  nodes: [node(10, 'container', 'Primary pane', undefined, null),
    node(11, 'text entry area', 'Write your prompt to Claude', ''),
    node(12, 'radio button', 'Claude', '1', 20), node(13, 'radio button', 'Code', '0', 20),
    node(20, 'container', 'Sidebar', undefined, null)] });
const options = () => ({ now, scopeIndex: 10, composerIndex: 11, claudeModeIndex: 12, codeModeIndex: 13, freshChat: true });
const arrival = (overrides = {}) => {
  const before = fixture(), readiness = inspectFreshClaudeReadiness(before, options());
  const state = { ...fixture(), captureId: 'arrived-1', capturedAt: after };
  state.nodes[1].value = 'Public invitation';
  return { state, options: { ...options(), readiness, handoff: { claimedAt, preflightCaptureId: before.captureId }, launchResolved: true, ...overrides } };
};

test('preflight requires an empty owned /new Chat with Claude selected and Code unselected', () => {
  const state = fixture();
  for (const empty of ['', '\n']) {
    state.nodes[1].value = empty;
    const result = inspectFreshClaudeReadiness(state, options());
    assert.equal(result.ready, true); assert.equal(result.evidence.composerState, 'empty');
    assert.equal(result.evidence.newChatObserved, true);
    assert.match(result.evidence.snapshotSha256, /^[a-f0-9]{64}$/u);
  }
});

test('preflight refuses any prior draft without trimming and withholds raw draft and document URL', () => {
  const state = fixture();
  for (const draft of [' ', '\r\n', '\n\n', '\t', 'Unrelated private draft']) {
    state.nodes[1].value = draft;
    const result = inspectFreshClaudeReadiness(state, options());
    assert.equal(result.ready, false); assert.equal(result.reason, 'composer-not-empty');
    assert.equal(Object.hasOwn(result, 'value'), false);
    assert.equal(JSON.stringify(result).includes('Unrelated private draft'), false);
    assert.equal(JSON.stringify(result).includes('https://'), false);
  }
});

test('observable /new and explicit fresh ownership are required separately', () => {
  const state = fixture();
  assert.equal(inspectFreshClaudeReadiness(state, { ...options(), freshChat: false }).reason, 'ownership-not-established');
  for (const url of [undefined, 'claude.ai/new', 'https://claude.ai/chat/private-id', 'https://claude.ai/new?private=value',
    'https://claude.ai/new#private', 'https://claude.ai/new/', 'https://evil.example/new', 'http://claude.ai/new',
    'https://user:password@claude.ai/new']) {
    state.documentUrl = url;
    const result = inspectFreshClaudeReadiness(state, options());
    assert.equal(result.reason, 'new-chat-not-established');
    assert.equal(JSON.stringify(result).includes('private'), false);
  }
});

test('mode selection cannot be inferred from labels or an unselected radio value', () => {
  for (const change of [{ role: 'button' }, { value: '0' }, { label: 'Claude Code' }, { enabled: false }]) {
    const state = fixture(); Object.assign(state.nodes[2], change);
    assert.equal(inspectFreshClaudeReadiness(state, options()).reason, 'chat-mode-not-established');
  }
  const state = fixture(); state.nodes[3].value = '1';
  assert.equal(inspectFreshClaudeReadiness(state, options()).reason, 'chat-mode-not-established');
});

test('the observed background Code awaiting-input label still requires explicit unselected mode', () => {
  const state = fixture(); state.nodes[3].label = 'Code, awaiting your input';
  assert.equal(inspectFreshClaudeReadiness(state, options()).ready, true);
  for (const change of [{ value: '1' }, { value: undefined }, { role: 'button' }, { enabled: false },
    { label: 'Code, awaiting your input now' }]) {
    const changed = structuredClone(state); Object.assign(changed.nodes[3], change);
    assert.equal(inspectFreshClaudeReadiness(changed, options()).reason, 'chat-mode-not-established');
  }
  for (const change of [{ value: '0' }, { role: 'button' }, { label: 'Claude Code' }]) {
    const changed = structuredClone(state); Object.assign(changed.nodes[2], change);
    assert.equal(inspectFreshClaudeReadiness(changed, options()).reason, 'chat-mode-not-established');
  }
  const { state: arrived, options: settings } = arrival();
  arrived.nodes[3].label = 'Code, awaiting your input';
  assert.equal(inspectClaudeArrival(arrived, settings).arrived, true);
  arrived.nodes[3].value = '1';
  assert.equal(inspectClaudeArrival(arrived, settings).reason, 'chat-mode-not-established');
});

test('existing messages and response activity block readiness even with an empty composer', () => {
  for (const label of ['Message', 'Message 1', 'Message 1 of 2', 'User message', 'Assistant message', 'You said: public text', 'Claude said: text']) {
    const state = fixture(); state.nodes.push(node(14, 'container', label));
    assert.equal(inspectFreshClaudeReadiness(state, options()).reason, 'existing-message-present');
  }
  for (const [role, label] of [['button', 'Stop response'], ['button', 'Stop generating'], ['text', 'Claude is responding'], ['container', 'Currently streaming message']]) {
    const state = fixture(); state.nodes.push(node(14, role, label));
    assert.equal(inspectFreshClaudeReadiness(state, options()).reason, 'response-in-progress');
  }
});

test('main-region scoping excludes unrelated sidebar labels but not old Chat messages', () => {
  const state = fixture();
  state.nodes.push(node(21, 'text', 'Message 1 of 2', undefined, 20));
  assert.equal(inspectFreshClaudeReadiness(state, options()).ready, true);
  state.nodes[5].parentIndex = 10;
  assert.equal(inspectFreshClaudeReadiness(state, options()).reason, 'existing-message-present');
});

test('readiness rejects stale, partial, wrong-app, unowned and ambiguous snapshots', () => {
  for (const change of [{ complete: false }, { owned: false }, { bundleId: 'com.openai.codex' }, { ownedWindowId: 4 },
    { capturedAt: '2026-10-22T00:59:00.000Z' }]) {
    assert.throws(() => inspectFreshClaudeReadiness({ ...fixture(), ...change }, options()));
  }
  const state = fixture(); state.nodes.push({ ...state.nodes[1] });
  assert.throws(() => inspectFreshClaudeReadiness(state, options()), /ambiguous/u);
});

test('composer must be a visible descendant of the selected owned main region', () => {
  for (const change of [{ parentIndex: 999 }, { parentIndex: 11 }, { visible: false }]) {
    const state = fixture(); Object.assign(state.nodes[1], change);
    assert.throws(() => inspectFreshClaudeReadiness(state, options()), /visible|main Chat region/u);
  }
  const state = fixture(); state.nodes[0].role = 'text';
  assert.throws(() => inspectFreshClaudeReadiness(state, options()), /main Chat region/u);
});

test('arrival requires a distinct post-claim capture, resolved launch and same ready window', () => {
  const { state, options: settings } = arrival();
  const result = inspectClaudeArrival(state, settings);
  assert.equal(result.arrived, true); assert.equal(result.evidence.draftFidelity, 'not-compared');
  assert.equal(result.evidence.preflightCaptureId, 'ready-1');
  assert.equal(JSON.stringify(result).includes('Public invitation'), false);
  assert.equal(inspectClaudeArrival(state, { ...settings, launchResolved: false }).reason, 'launch-not-resolved');
  assert.equal(inspectClaudeArrival({ ...state, captureId: 'ready-1' }, settings).reason, 'arrival-not-after-handoff');
  assert.equal(inspectClaudeArrival({ ...state, capturedAt: claimedAt }, settings).reason, 'arrival-not-after-handoff');
  assert.equal(inspectClaudeArrival({ ...state, windowId: 4, ownedWindowId: 4 }, settings).reason, 'window-differs');
});

test('an empty post-launch composer or existing messages cannot count as draft arrival', () => {
  const { state, options: settings } = arrival();
  for (const value of ['', '\n']) {
    state.nodes[1].value = value;
    assert.equal(inspectClaudeArrival(state, settings).reason, 'draft-not-arrived');
  }
  state.nodes[1].value = 'Public invitation'; state.nodes.push(node(14, 'container', 'Message 1 of 2'));
  assert.equal(inspectClaudeArrival(state, settings).reason, 'existing-message-present');
});

test('failed, replayed or incomplete preflight cannot authorize arrival', () => {
  const { state, options: settings } = arrival();
  for (const readiness of [undefined, { ...settings.readiness.evidence, reason: 'composer-not-empty' },
    { ...settings.readiness, ready: false },
    { ...settings.readiness.evidence, composerState: 'nonempty' }, { ...settings.readiness.evidence, freshChatOwned: false },
    { ...settings.readiness.evidence, capturedAt: after }, { ...settings.readiness.evidence, snapshotSha256: 'bad' }]) {
    assert.throws(() => inspectClaudeArrival(state, { ...settings, readiness }), /preflight/u);
  }
  assert.throws(() => inspectClaudeArrival(state, { ...settings, handoff: { claimedAt, preflightCaptureId: 'other' } }), /preflight/u);
  assert.throws(() => inspectClaudeArrival(state, { ...settings, handoff: { claimedAt: '2026-10-22T01:00:31.000Z' } }), /preflight/u);
});

test('plain JSON snapshots and metadata from another JavaScript realm are accepted', () => {
  const { state, options: settings } = arrival();
  const crossRealm = vm.runInNewContext(`(${JSON.stringify({ state, settings })})`);
  assert.equal(inspectClaudeArrival(crossRealm.state, crossRealm.settings).arrived, true);
});
