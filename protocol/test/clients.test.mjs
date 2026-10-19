import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClientHandoff } from '../clients.mjs';

test('client routes preserve exact context and separate Claude reading from native-tool Code surface', () => {
  const prompt = '意图\n&?+#% $(not-a-command) https://example.invalid/task?token=synthetic-private-token';
  for (const [client, surface, expected, parameter] of [
    ['codex-app', 'chat', 'codex://new', 'prompt'],
    ['claude-app', 'chat', 'claude://claude.ai/new', 'q'],
    ['claude-app', 'code', 'claude://code/new', 'q'],
  ]) {
    const prepared = buildClientHandoff({ client, surface, prompt });
    const url = new URL(prepared.url);
    assert.equal(`${url.protocol}//${url.hostname}${url.pathname}`, expected);
    assert.equal(url.searchParams.get(parameter), prompt);
    assert.deepEqual([...url.searchParams.keys()], [parameter]);
    assert.equal(prepared.requiresSend, true);
    assert.equal(prepared.behavior, 'prefill-new-composer');
    assert.deepEqual(Object.keys(prepared).sort(), ['behavior', 'client', 'conversation', 'requiresSend', 'surface', 'url']);
  }
});

test('existing conversations stay manual, unknown clients/surfaces and invalid or large text fail', () => {
  assert.throws(() => buildClientHandoff({ client: 'claude-app', prompt: 'context', conversation: 'existing' }), /copy the context/);
  for (const client of ['file:///private/example', 'chrome', '--args']) assert.throws(() => buildClientHandoff({ client, prompt: 'context' }), /supported Agent app/);
  for (const surface of ['private-conversation-id', '--args']) assert.throws(() => buildClientHandoff({ client: 'claude-app', surface, prompt: 'context' }), /Unsupported Agent surface/);
  assert.throws(() => buildClientHandoff({ client: 'codex-app', surface: 'code', prompt: 'context' }), /Unsupported Agent surface/);
  for (const prompt of ['', ' ', '\u0000', '\ud800', 'x'.repeat(12001), '意'.repeat(4001)]) assert.throws(() => buildClientHandoff({ client: 'codex-app', prompt }), /handoff context/);
});
