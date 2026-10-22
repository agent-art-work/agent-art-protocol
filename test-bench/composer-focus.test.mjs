import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { claudeAXSnapshot } from './claude-ax.mjs';
import { inspectClaudeComposerFocus } from './composer-focus.mjs';
import { inspectFreshClaudeReadiness } from './readiness.mjs';

const at = '2026-10-22T01:00:00.000Z';
const now = '2026-10-22T01:00:01.000Z';
const tree = 'Window: "Claude", App: Claude.\n0 standard window Claude\n'
  + '\t1 HTML content Claude, URL: claude.ai/new\n'
  + '\t\t2 container Sidebar\n\t\t\t3 radio button Description: Claude, Value: 1\n\t\t\t4 radio button Description: Code, Value: 0\n'
  + '\t\t10 container Primary pane\n\t\t\t11 text entry area (settable) Description: Write your prompt to Claude, Value: \n\n'
  + '\t\t\t\t12 text Private placeholder that must not be returned\n\t\t\t13 button Add content\n'
  + '\t20 HTML content file:///test/find_in_page/private-synthetic-document.html\n\t\t21 text field Description: Private auxiliary search, Value: private-synthetic-search\n\n'
  + '\t30 menu bar\n\t\t31 menu Help\n';
const fixture = (footer = 'The focused UI element is 11 text entry area (settable) Description: Write your prompt to Claude, Value: \n') => claudeAXSnapshot(tree + footer,
  { owned: true, ownedWindowId: 'owned-test-window', capturedAt: at, captureId: 'focus-1' });
const options = () => ({ now, scopeIndex: 10, composerIndex: 11 });

test('focus diagnostics distinguish composer, descendant and auxiliary HTML without input-delivery claims', () => {
  for (const [footer, status, location, index] of [
    ['The focused UI element is 11 text entry area', 'composer', 'composer', 11],
    ['The focused UI element is 12 text Private placeholder', 'composer', 'within-composer', 12],
    ['The focused UI element is 13 button Add content', 'elsewhere', 'main-html-surface', 13],
    ['The focused UI element is 20 HTML content file:///test/find_in_page/private-synthetic-document.html', 'elsewhere', 'auxiliary-html-surface', 20],
    ['The focused UI element is 21 text field Description: Private auxiliary search', 'elsewhere', 'auxiliary-html-surface', 21],
    ['The focused UI element is 0 standard window Claude', 'elsewhere', 'other', 0],
  ]) {
    const result = inspectClaudeComposerFocus(fixture(footer), options());
    assert.equal(result.status, status); assert.equal(result.location, location);
    assert.equal(result.focused, status === 'composer'); assert.equal(result.evidence.focusedIndex, index);
    assert.equal(result.evidence.keyboardDelivery, 'not-established');
    assert.equal(result.evidence.attribution, 'cua-exposed-focus');
    assert.match(result.evidence.snapshotSha256, /^[a-f0-9]{64}$/u);
    for (const privateText of ['Private placeholder', 'private-synthetic', 'file:///', 'https://claude.ai']) assert.equal(JSON.stringify(result).includes(privateText), false);
  }
});

test('absent and ambiguous focus observations stay explicit, including historical snapshots without metadata', () => {
  const absent = fixture('');
  for (const state of [absent, (() => { const s = structuredClone(absent); delete s.focus; return s; })()]) {
    const result = inspectClaudeComposerFocus(state, options());
    assert.equal(result.status, 'not-exposed'); assert.equal(result.focused, false);
    assert.equal(result.location, 'not-established'); assert.equal(Object.hasOwn(result.evidence, 'focusedIndex'), false);
  }
  const result = inspectClaudeComposerFocus(fixture('The focused UI element is 11 text entry area\nThe focused UI element is 20 HTML content'), options());
  assert.equal(result.status, 'ambiguous'); assert.equal(result.focused, false);
  assert.equal(result.evidence.reason, 'multiple-footers');
});

test('focus elsewhere does not weaken or replace empty-Chat readiness', () => {
  const state = fixture('The focused UI element is 20 HTML content file:///test/find_in_page/private-synthetic-document.html');
  const readiness = inspectFreshClaudeReadiness(state, { ...options(), claudeModeIndex: 3, codeModeIndex: 4, freshChat: true });
  assert.equal(readiness.ready, true);
  assert.equal(inspectClaudeComposerFocus(state, options()).status, 'elsewhere');
  assert.equal(readiness.evidence.composerState, 'empty');
});

test('focus evidence is bound to its capture, target and exposed focus rather than a returned action', () => {
  const state = fixture(), first = inspectClaudeComposerFocus(state, options());
  assert.equal(first.evidence.captureId, 'focus-1'); assert.equal(first.evidence.capturedAt, at);
  assert.equal(first.evidence.windowId, 'owned-test-window');
  for (const change of [{ captureId: 'focus-2' }, { capturedAt: now }, { windowId: 'owned-test-window-2', ownedWindowId: 'owned-test-window-2' },
    { focus: { status: 'observed', index: 20 } }]) {
    const next = inspectClaudeComposerFocus({ ...state, ...change }, options());
    assert.notEqual(next.evidence.snapshotSha256, first.evidence.snapshotSha256);
  }
  const actionReturned = structuredClone(state); actionReturned.clickReturned = true; actionReturned.focus = { status: 'observed', index: 20 };
  assert.equal(inspectClaudeComposerFocus(actionReturned, options()).focused, false);
});

test('focus inspection rejects stale, unowned, conflicting or unbound inputs', () => {
  const state = fixture();
  for (const change of [{ capturedAt: '2026-10-22T00:59:00.000Z' }, { complete: false }, { owned: false }, { ownedWindowId: 'other' },
    { focus: { status: 'observed', index: 999 } }, { focus: { status: 'observed', index: 11, raw: 'private' } },
    { focus: { status: 'ambiguous', reason: 'private text' } }]) assert.throws(() => inspectClaudeComposerFocus({ ...state, ...change }, options()));
  for (const change of [{ scopeIndex: 13 }, { composerIndex: 21 }, { composerIndex: 10 }]) assert.throws(() => inspectClaudeComposerFocus(state, { ...options(), ...change }));
  for (const change of [{ visible: false }, { enabled: false }, { role: 'button' }]) {
    const altered = structuredClone(state); Object.assign(altered.nodes.find(node => node.index === 11), change);
    assert.throws(() => inspectClaudeComposerFocus(altered, options()));
  }
  assert.throws(() => inspectClaudeComposerFocus(state, { scopeIndex: 10, composerIndex: 11 }));
});

test('focus diagnostics accept plain captures from the controller JavaScript realm', () => {
  const crossRealm = vm.runInNewContext(`(${JSON.stringify(fixture())})`);
  assert.equal(inspectClaudeComposerFocus(crossRealm, options()).status, 'composer');
});
