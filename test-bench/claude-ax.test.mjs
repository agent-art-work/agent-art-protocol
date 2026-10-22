import test from 'node:test';
import assert from 'node:assert/strict';
import { claudeAXSnapshot } from './claude-ax.mjs';

const prefix = 'Window: "Claude", App: Claude.\n0 standard window Claude\n\t1 HTML content Claude, URL: claude.ai/new\n';
const options = { ownedWindowId: 'owned-test-window', owned: true };
test('native adapter preserves actual composer paragraphs, modes and link targets', () => {
  const raw = prefix + '\t\t2 radio button Description: Claude, Value: 1\n\t\t3 radio button Description: Code, Value: 0\n\t\t4 container Main\n\t\t\t5 text entry area (settable) Description: Write your prompt, Value: First\n\nSecond\n\n\t\t\t6 link Description: https://public.example/index.json, Value: public.example/index.json\n\t\t\t7 button (disabled) Send message\n';
  const s = claudeAXSnapshot(raw, options);
  assert.equal(s.documentUrl, 'https://claude.ai/new');
  assert.equal(s.nodes.find(n => n.index === 5).value, 'First\n\nSecond');
  assert.equal(s.nodes.find(n => n.index === 5).parentIndex, 4);
  assert.equal(s.nodes.find(n => n.index === 2).value, '1');
  assert.equal(s.nodes.find(n => n.index === 6).role, 'link');
  assert.equal(s.nodes.find(n => n.index === 6).value, 'public.example/index.json');
  assert.equal(s.nodes.find(n => n.index === 7).enabled, false);
});
test('native adapter represents empty CUA composer without inventing public content', () => {
  const s = claudeAXSnapshot(prefix + '\t\t2 text entry area (settable) Description: Reply, Value: \n\n\t\t3 button Send\n', options);
  assert.equal(s.nodes.find(n => n.index === 2).value, '');
});
test('native adapter rejects incomplete, unowned or ambiguous window captures', () => {
  assert.throws(() => claudeAXSnapshot(prefix, { ...options, owned: false }), /owned/);
  assert.throws(() => claudeAXSnapshot(prefix.replace('0 standard window Claude', '')), /complete/);
  assert.throws(() => claudeAXSnapshot(prefix + '\t2 HTML content Claude, URL: claude.ai/chat/synthetic\n', options), /Multiple/);
});
test('native static tool output preserves multiline JSON and denial continuations', () => {
  const s = claudeAXSnapshot(prefix + '\t\t2 text {\n  "schema": "public.index/v1",\n  "revision": "test-revision"\n}\n\n\t\t3 paragraph Request failed:\nHTTP 403 Forbidden\n\n\t\t4 button Done\n', options);
  assert.deepEqual(JSON.parse(s.nodes.find(n => n.index === 2).label), { schema: 'public.index/v1', revision: 'test-revision' });
  assert.equal(s.nodes.find(n => n.index === 3).label, 'Request failed:\nHTTP 403 Forbidden');
});
test('native static payload whitespace and field-like text are never normalized', () => {
  const s = claudeAXSnapshot(prefix + '\t\t2 text   public-revision  \n\t\t3 text Description: literal, Value: source data\n', options);
  assert.equal(s.nodes.find(n => n.index === 2).label, '  public-revision  ');
  assert.equal(s.nodes.find(n => n.index === 3).label, 'Description: literal, Value: source data');
  assert.equal(s.nodes.find(n => n.index === 3).value, undefined);
});
test('native adapter retains one exposed focused index without copying its duplicate payload', () => {
  const raw = prefix + '\t\t2 container Primary pane\n\t\t\t3 text entry area (settable) Description: Write your prompt to Claude, Value: First\n\nSecond\n\n'
    + '\t4 menu bar\n\t\t5 menu Help\n'
    + 'The focused UI element is 3 text entry area (settable) Description: Write your prompt to Claude, Value: First\n\nSecond\n';
  const s = claudeAXSnapshot(raw, options);
  assert.deepEqual(s.focus, { status: 'observed', index: 3 });
  assert.equal(s.nodes.find(n => n.index === 3).value, 'First\n\nSecond');
  assert.equal(s.nodes.length, 6, 'the duplicate focused description does not become tree nodes');
});
test('native adapter preserves auxiliary HTML nodes while exposing their focus separately', () => {
  const s = claudeAXSnapshot(prefix + '\t\t2 container Primary pane\n\t\t\t3 text entry area (settable) Description: Write your prompt to Claude, Value: \n\n'
    + '\t4 HTML content file:///test/find_in_page/find-in-page.html\n'
    + 'The focused UI element is 4 HTML content file:///test/find_in_page/find-in-page.html\n', options);
  assert.deepEqual(s.focus, { status: 'observed', index: 4 });
  assert.equal(s.nodes.find(n => n.index === 3).value, '');
  assert.equal(s.nodes.find(n => n.index === 4).visible, true, 'focus diagnostics do not hide an auxiliary node');
  assert.equal(s.documentUrl, 'https://claude.ai/new');
});
test('missing, malformed and conflicting focus footers never guess a focused node', () => {
  const raw = prefix + '\t\t2 text entry area (settable) Description: Reply, Value: \n\n\t3 menu bar\n';
  assert.deepEqual(claudeAXSnapshot(raw, options).focus, { status: 'not-exposed' });
  for (const [footer, reason] of [
    ['The focused UI element is unavailable', 'invalid-footer'],
    ['The focused UI element is 9007199254740992 text entry area', 'invalid-footer'],
    ['The focused UI element is 99 text entry area', 'node-not-unique'],
    ['The focused UI element is 2 button Reply', 'footer-node-conflicts'],
    ['The focused UI element is 2 text entry area\nThe focused UI element is 2 text entry area', 'multiple-footers'],
    ['The focused UI element is 2 text entry area\nThe focused UI element is 1 HTML content', 'multiple-footers'],
  ]) {
    const s = claudeAXSnapshot(raw + footer + '\n', options);
    assert.deepEqual(s.focus, { status: 'ambiguous', reason });
    assert.equal(s.nodes.find(n => n.index === 2).value, '', 'footer metadata does not alter the empty composer');
  }
  const s = claudeAXSnapshot(raw + '\t\t2 text entry area (settable) Description: Duplicate, Value: \n\n'
    + '\t4 menu bar\n'
    + 'The focused UI element is 2 text entry area\n', options);
  assert.deepEqual(s.focus, { status: 'ambiguous', reason: 'node-not-unique' });
});
test('footer-like literal composer and static payloads fail closed instead of truncating content', () => {
  for (const payload of [
    '\t\t2 text entry area (settable) Description: Reply, Value: \nThe focused UI element is 2 text entry area\n\n\t\t3 button Send\n',
    '\t\t2 text entry area (settable) Description: Reply, Value: Important draft\nThe focused UI element is 2 text entry area\n\n',
    '\t\t2 text Public source text\nThe focused UI element is 2 text\n\n\t\t3 button Done\n',
    '\t\t2 paragraph Public source text\nThe focused UI element is unavailable\n\n\t\t3 button Done\n',
  ]) assert.throws(() => claudeAXSnapshot(prefix + payload, options), /Ambiguous.*payload/u);
});
test('a footer followed by indexed content is rejected instead of dropping later tree nodes', () => {
  assert.throws(() => claudeAXSnapshot(prefix + '\t\t2 button Done\nThe focused UI element is 2 button Done\n\t\t3 button Send\n', options), /Ambiguous AX tree content/u);
});
