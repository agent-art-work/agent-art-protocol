import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { buildHandoff, discoverHandoffClients, openHandoff } from './handoff.mjs';

const prompt = 'Read the Lab index: https://agentart.work/agent-index.json\nWhen ready, say: Ask me anything. 意图 & ? # + % $(not-a-command)';
const installed = {
  platform: 'darwin',
  readAppBundle: path => path.endsWith('/ChatGPT.app')
    ? { CFBundleIdentifier: 'com.openai.codex', CFBundleShortVersionString: 'synthetic-test', CFBundleURLTypes: [{ CFBundleURLSchemes: ['codex'] }] }
    : path.endsWith('/Claude.app')
      ? { CFBundleIdentifier: 'com.anthropic.claudefordesktop', CFBundleURLTypes: [{ CFBundleURLSchemes: ['claude'] }] }
      : null,
};

test('client URLs preserve the exact public context without injecting other query parameters', () => {
  for (const [client, scheme, host, parameter] of [
    ['codex-app', 'codex:', 'new', 'prompt'],
    ['claude-app', 'claude:', 'claude.ai', 'q'],
  ]) {
    const handoff = buildHandoff({ client, prompt, conversation: 'fresh' });
    const url = new URL(handoff.url);
    assert.equal(url.protocol, scheme); assert.equal(url.hostname, host);
    assert.equal(url.searchParams.get(parameter), prompt);
    assert.deepEqual([...url.searchParams.keys()], [parameter]);
    assert.equal(handoff.conversation, 'fresh');
    assert.equal(handoff.requiresSend, true);
    assert.equal(handoff.behavior, 'prefill-new-composer');
  }
});

test('native handoff refuses arbitrary clients, existing-conversation attachment, and oversized or invalid text', () => {
  for (const client of ['file:///private/example', 'chrome', 'claude://code/private', 'codex-cli', '--args']) assert.throws(() => buildHandoff({ client, prompt }), /supported Agent app/);
  for (const conversation of ['existing', 'private-conversation-id', null, false]) assert.throws(() => buildHandoff({ client: 'codex-app', prompt, conversation }), /copy the context/i);
  for (const text of ['', '   ', '\u0000', '\ud800', 'x'.repeat(12001), '意'.repeat(4001)]) assert.throws(() => buildHandoff({ client: 'codex-app', prompt: text }), /handoff context/);
});

test('metadata detection requires the allowlisted bundle ID and registered scheme', () => {
  const clients = discoverHandoffClients(installed);
  assert.deepEqual(clients.map(({ id, available, conversation }) => ({ id, available, conversation })), [
    { id: 'codex-app', available: true, conversation: 'fresh' },
    { id: 'claude-app', available: true, conversation: 'fresh' },
  ]);
  assert.ok(discoverHandoffClients({ platform: 'linux' }).every(client => !client.available));
  assert.ok(discoverHandoffClients({ platform: 'darwin', readAppBundle: () => ({ CFBundleIdentifier: 'wrong.app', CFBundleURLTypes: [{ CFBundleURLSchemes: ['codex', 'claude'] }] }) }).every(client => !client.available));
  assert.ok(discoverHandoffClients({ platform: 'darwin', readAppBundle: () => ({ CFBundleIdentifier: 'com.openai.codex', CFBundleURLTypes: [{ CFBundleURLSchemes: ['https'] }] }) }).every(client => !client.available));
});

test('open uses a fixed URL-only command and explicit verified bundle, without sending or changing Agent settings', async () => {
  for (const [client, bundleId] of [['codex-app', 'com.openai.codex'], ['claude-app', 'com.anthropic.claudefordesktop']]) {
    let invocation;
    const result = await openHandoff({ client, prompt }, { ...installed, spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      const child = new EventEmitter(); child.kill = () => true;
      queueMicrotask(() => child.emit('exit', 0));
      return child;
    } });
    assert.equal(invocation.command, '/usr/bin/open');
    assert.deepEqual(invocation.args.slice(0, 3), ['-b', bundleId, '-u']);
    assert.equal(invocation.args[3], buildHandoff({ client, prompt }).url);
    assert.equal(invocation.options.shell, false);
    assert.deepEqual(invocation.options.stdio, ['ignore', 'ignore', 'ignore']);
    assert.deepEqual(result, { requested: true, conversation: 'fresh', client });
  }
});

test('unavailable apps and declined OS requests remain failures with a copy fallback', async () => {
  let called = false;
  await assert.rejects(openHandoff({ client: 'codex-app', prompt }, { platform: 'darwin', readAppBundle: () => null, spawnProcess: () => { called = true; } }), /unavailable.*Copy/);
  assert.equal(called, false);
  await assert.rejects(openHandoff({ client: 'codex-app', prompt, conversation: 'existing' }, { ...installed, spawnProcess: () => { called = true; } }), /copy the context/i);
  assert.equal(called, false);
  await assert.rejects(openHandoff({ client: 'claude-app', prompt }, { ...installed, spawnProcess: () => {
    const child = new EventEmitter(); child.kill = () => true;
    queueMicrotask(() => child.emit('exit', 1)); return child;
  } }), /did not accept/);
});
