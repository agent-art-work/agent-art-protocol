import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { Readable, Writable } from 'node:stream';
import { buildClaudeLaunch, discoverClients, launchClient } from './clients.mjs';
import { assertBridgeConfig, ReadingBridge, serveStdio, TOOLS } from './mcp.mjs';

const task = { id: 'reading-fixture', token: 'synthetic_test_token_0123456789', question: 'A synthetic question, not a real Agent encounter.' };
const config = { taskId: task.id, token: task.token, endpoint: 'http://127.0.0.1:4173' };
const fixtureProbe = id => ({ id, binary: '/synthetic/client', installed: true, supported: id === 'claude-code', version: '2.1.278' });

test('launcher scopes only the four reading tools without bypassing client permissions', () => {
  const args = buildClaudeLaunch({ mcpConfig: '/synthetic/private/mcp.json', taskId: task.id });
  assert.equal(args[args.indexOf('--tools') + 1], '');
  for (const flag of ['--restricted', '--strict-mcp-config', '--disable-slash-commands', '--no-chrome', '--print', '--no-session-persistence']) assert.ok(args.includes(flag));
  assert.equal(args[args.indexOf('--permission-mode') + 1], 'dontAsk');
  assert.equal(args[args.indexOf('--max-budget-usd') + 1], '1');
  assert.deepEqual(args[args.indexOf('--allowedTools') + 1].split(','), TOOLS.map(tool => `mcp__reading__${tool.name}`));
  assert.ok(!args.some(value => /dangerously|bypassPermissions|--continue|--resume|--add-dir|--chrome$/.test(value)));
  assert.ok(!args.join(' ').includes(task.token));
  assert.ok(!args.join(' ').includes(task.question));
});

test('discovery distinguishes installed clients from a supported launcher', () => {
  const clients = discoverClients({ probe: fixtureProbe });
  assert.equal(clients[0].available, true);
  assert.equal(clients[1].installed, true);
  assert.equal(clients[1].available, false);
  assert.match(clients[1].detail, /isolation.*not qualified/i);
});

test('only an exact loopback origin can receive a private bridge capability', () => {
  assert.equal(assertBridgeConfig(config).endpoint, config.endpoint);
  for (const endpoint of ['https://127.0.0.1:4173', 'http://localhost:4173', 'http://127.0.0.1.evil.test', 'http://127.0.0.1:4173/private', 'http://user:pass@127.0.0.1:4173', 'http://127.0.0.1:4173?query=1', 'http://127.0.0.1:4173#fragment', 'http://127.1:4173']) assert.throws(() => assertBridgeConfig({ ...config, endpoint }));
  assert.throws(() => assertBridgeConfig({ ...config, taskId: '../other' }));
  assert.throws(() => assertBridgeConfig({ ...config, token: 'short' }));
});

test('private launch files are owned, minimal, and removed after client exit', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-client-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'keep.txt'), 'Unrelated fixture file.');
  const child = new EventEmitter();
  child.kill = () => true;
  let launch;
  let exit;
  const diagnostics = [];
  await launchClient({ client: 'claude-code', task, endpoint: config.endpoint, runDir: root, onExit: value => { exit = value; }, onDiagnostic: value => diagnostics.push(value) }, {
    probe: fixtureProbe,
    spawnProcess: (command, args, options) => { launch = { command, args, options }; return child; },
  });
  assert.equal(launch.options.shell, false);
  assert.deepEqual(launch.options.stdio, ['ignore', 'ignore', 'ignore']);
  assert.equal(fs.statSync(launch.options.cwd).mode & 0o777, 0o700);
  const mcpFile = launch.args[launch.args.indexOf('--mcp-config') + 1];
  assert.equal(fs.statSync(mcpFile).mode & 0o777, 0o600);
  const mcp = JSON.parse(fs.readFileSync(mcpFile, 'utf8'));
  assert.deepEqual(Object.keys(mcp.mcpServers), ['reading']);
  const bridgeFile = mcp.mcpServers.reading.args.at(-1);
  assert.equal(fs.statSync(bridgeFile).mode & 0o777, 0o600);
  assert.deepEqual(JSON.parse(fs.readFileSync(bridgeFile, 'utf8')), config);
  assert.ok(!diagnostics.join(' ').includes(task.token));
  child.emit('exit', 0, null);
  child.emit('error', new Error('A synthetic duplicate event.'));
  assert.deepEqual(exit, { code: 0, signal: null, timedOut: false });
  assert.ok(!fs.existsSync(launch.options.cwd));
  assert.equal(fs.readFileSync(path.join(root, 'keep.txt'), 'utf8'), 'Unrelated fixture file.');
});

test('unavailable routes and missing isolation flags fail before creating private files', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-client-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const args = { task, endpoint: config.endpoint, runDir: root };
  await assert.rejects(launchClient({ ...args, client: 'codex-cli' }), /no qualified scoped launcher/);
  await assert.rejects(launchClient({ ...args, client: 'claude-code' }, { probe: () => ({ supported: false }) }), /unavailable/);
  assert.deepEqual(fs.readdirSync(root), []);
});

test('bounded cancellation signals only the owned child and reports timeout', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-client-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const child = new EventEmitter();
  const signals = [];
  child.kill = signal => { signals.push(signal); if (signal === 'SIGKILL') queueMicrotask(() => child.emit('exit', null, 'SIGKILL')); return true; };
  let resolveExit;
  const exited = new Promise(resolve => { resolveExit = resolve; });
  await launchClient({ client: 'claude-code', task, endpoint: config.endpoint, runDir: root, onExit: resolveExit }, { probe: fixtureProbe, spawnProcess: () => child, timeoutMs: 20, killDelayMs: 20 });
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    const result = await exited;
    assert.equal(result.timedOut, true);
    assert.equal(result.signal, 'SIGKILL');
    assert.deepEqual(signals.slice(0, 2), ['SIGTERM', 'SIGKILL']);
    assert.deepEqual(fs.readdirSync(root), []);
  } finally { clearTimeout(keepAlive); }
});

test('stdio framing supports legacy negotiation and modern discovery without logging private data', async () => {
  const bridge = new ReadingBridge(config);
  const meta = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {} };
  const messages = [
    '{invalid',
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '2025-11-25' } }),
    JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list' }),
    JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'server/discover', params: { _meta: meta } }),
  ];
  let output = '';
  await serveStdio(bridge, { input: Readable.from([`${messages.join('\n')}\n`]), output: new Writable({ write(chunk, encoding, done) { output += chunk.toString(); done(); } }) });
  const replies = output.trim().split('\n').map(line => JSON.parse(line));
  assert.equal(replies.length, 5);
  assert.equal(replies[0].error.code, -32700);
  assert.equal(replies[1].error.code, -32600);
  assert.equal(replies[2].result.protocolVersion, '2025-11-25');
  assert.deepEqual(replies[3].result.tools.map(tool => tool.name), TOOLS.map(tool => tool.name));
  assert.equal(replies[4].result.resultType, 'complete');
  assert.equal(replies[4].result.cacheScope, 'private');
  assert.ok(!output.includes(task.token));
});

test('transport binds one capability to one local task, preserves exact answer bytes, and sanitizes rejection', async t => {
  const observed = [];
  const server = http.createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    const value = JSON.parse(body);
    observed.push({ url: request.url, authorization: request.headers.authorization, value });
    response.setHeader('Content-Type', 'application/json');
    if (value.name === 'read_document') {
      response.statusCode = 403;
      response.end(JSON.stringify({ error: { code: 'source_not_allowed', message: `A secret that must not be forwarded: ${task.token}` } }));
    } else response.end(JSON.stringify({ result: { outcome: 'returned', exactText: value.arguments.text ?? null } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const bridge = new ReadingBridge({ ...config, endpoint: `http://127.0.0.1:${server.address().port}` });
  const text = '  Exact answer\nUnicode: 意图\n';
  const result = await bridge.call('submit_answer', { text, sourceIds: ['guidance'] });
  assert.equal(result.exactText, text);
  assert.equal(observed[0].url, `/__bridge/agent/${task.id}/call`);
  assert.equal(observed[0].authorization, `Bearer ${task.token}`);
  assert.deepEqual(observed[0].value, { name: 'submit_answer', arguments: { text, sourceIds: ['guidance'] } });
  await assert.rejects(bridge.call('read_document', { id: 'not-indexed' }), error => /403, source_not_allowed/.test(error.message) && !error.message.includes(task.token));
  await assert.rejects(bridge.call('read_request', { url: 'https://private.example' }), /no arguments/);
  await assert.rejects(bridge.call('run_shell', { command: 'echo no' }), /Unknown/);
  assert.equal(observed.length, 2);
});

test('redirects and broken local responses never become successful tool results', async () => {
  const rejectRedirect = new ReadingBridge(config, { fetchRequest: async (url, options) => { assert.equal(options.redirect, 'error'); throw new Error(`private ${task.token}`); } });
  await assert.rejects(rejectRedirect.call('read_index'), error => /unavailable/.test(error.message) && !error.message.includes(task.token));
  const broken = new ReadingBridge(config, { fetchRequest: async () => new Response('{broken', { status: 200 }) });
  await assert.rejects(broken.call('read_index'), /unreadable/);
  const wrongEnvelope = new ReadingBridge(config, { fetchRequest: async () => Response.json({ arbitrary: true }) });
  await assert.rejects(wrongEnvelope.call('read_index'), /invalid result envelope/);
});
