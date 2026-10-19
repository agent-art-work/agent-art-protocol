import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { Bridge } from './bridge.mjs';
import { localOrigin, Outbox, writePrivateJson } from './state.mjs';
import { createApi } from '../server/api.mjs';

// Deliberately synthetic fixture: no Claude process, model or provider is called.
let server;
let endpoint;
let temp;
let lostAcknowledgment = false;
const accepted = new Map();
let writes = 0;
const launch = { workId: 'fixture-work', grantId: 'fixture-grant', token: 'fixture-local-test-capability' };
const context = { work: { id: launch.workId }, definition: { id: 'fixture-definition' }, context: { id: 'fixture-context', workId: launch.workId, acts: [] }, openingAct: { id: 'fixture-opening' } };

before(async () => {
  temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-art-bridge-test-'));
  server = http.createServer(async (request, response) => {
    if (request.headers.authorization !== `Bearer ${launch.token}`) { response.writeHead(401).end('{}'); return; }
    const json = (code, value) => { response.writeHead(code, { 'content-type': 'application/json' }); response.end(JSON.stringify(value)); };
    if (request.url === '/api/agent/context') return json(200, context);
    if (request.url === '/api/agent/observations') return json(201, { observed: true });
    if (request.url.startsWith('/api/agent/submissions/')) {
      const id = decodeURIComponent(request.url.split('/').at(-1));
      return accepted.has(id) ? json(200, accepted.get(id)) : json(404, { outcome: 'not_found', error: { code: 'submission_not_found' } });
    }
    if (request.url === '/api/agent/acts') {
      let body = '';
      for await (const part of request) body += part;
      const envelope = JSON.parse(body);
      writes += 1;
      if (!accepted.has(envelope.submissionId)) accepted.set(envelope.submissionId, { outcome: 'accepted', submissionId: envelope.submissionId, act: { id: `fixture-act-${writes}`, workId: launch.workId, contextId: envelope.contextId, kind: envelope.kind, text: envelope.text }, relations: envelope.relations });
      if (lostAcknowledgment) { lostAcknowledgment = false; request.socket.destroy(); return; }
      return json(200, accepted.get(envelope.submissionId));
    }
    return json(404, {});
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  endpoint = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

const metadata = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {}, 'io.modelcontextprotocol/clientInfo': { name: 'synthetic-test', version: '1' } };

test('loopback-only endpoint rejects credentials, remote hosts and paths', () => {
  assert.equal(localOrigin('http://127.0.0.1:4174/'), 'http://127.0.0.1:4174');
  for (const value of ['https://127.0.0.1', 'http://example.com', 'http://localhost/private', 'http://secret@localhost:4174', 'http://localhost:4174/?token=secret']) assert.throws(() => localOrigin(value));
});

test('modern discovery, strict version validation and separate legacy initialization', async () => {
  const bridge = new Bridge({ launch, endpoint, outboxDir: path.join(temp, 'modern') });
  const discovery = await bridge.handle({ jsonrpc: '2.0', id: 1, method: 'server/discover', params: { _meta: metadata } });
  assert.equal(discovery.resultType, 'complete');
  assert.deepEqual(discovery.supportedVersions, ['2026-07-28']);
  const tools = await bridge.handle({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: { _meta: metadata } });
  assert.equal(tools.tools.length, 4);
  await assert.rejects(bridge.handle({ jsonrpc: '2.0', id: 3, method: 'tools/list' }), /initialize/);
  await assert.rejects(bridge.handle({ jsonrpc: '2.0', id: 4, method: 'tools/list', params: { _meta: { ...metadata, 'io.modelcontextprotocol/protocolVersion': '2099-01-01' } } }), error => error.rpcCode === -32022);
  const legacy = await bridge.handle({ jsonrpc: '2.0', id: 5, method: 'initialize', params: { protocolVersion: '2025-11-25', clientInfo: { name: 'synthetic', version: '1' } } });
  assert.equal(legacy.protocolVersion, '2025-11-25');
  assert.equal((await bridge.handle({ jsonrpc: '2.0', id: 6, method: 'tools/list' })).tools.length, 4);
});

test('lost acknowledgment recovers exact accepted bytes across adapter restart', async () => {
  const outboxDir = path.join(temp, 'recovery');
  const bridge = new Bridge({ launch, endpoint, outboxDir });
  const value = await bridge.call('read_work', {});
  const envelope = { submissionId: value.adapter.submissionId, contextId: value.adapter.contextId, kind: 'line', text: 'Synthetic fixture: exact bytes e\u0301, 😀 and two  spaces.', relations: [{ kind: 'responds-to', target: 'fixture-opening' }] };
  lostAcknowledgment = true;
  await assert.rejects(bridge.call('submit_act', envelope), /response lost/);
  const stored = new Outbox(outboxDir, launch.workId, launch.grantId).get(envelope.submissionId);
  assert.equal(stored.envelopeBytes, JSON.stringify(envelope));
  assert.equal(fs.statSync(path.join(outboxDir, 'outbox.json')).mode & 0o777, 0o600);
  const restart = new Bridge({ launch, endpoint, outboxDir });
  assert.equal((await restart.call('read_work', {})).adapter.submissionId, envelope.submissionId, 'reconnection must recover a pending intent before creating another');
  const priorWrites = writes;
  const recovered = await restart.call('retry_submission', { submissionId: envelope.submissionId });
  assert.equal(recovered.outcome, 'accepted');
  assert.equal(recovered.act.text, envelope.text);
  assert.equal(writes, priorWrites, 'retry should recover acceptance rather than repeat a known committed write');
  await assert.rejects(restart.call('submit_act', { ...envelope, text: 'A changed fixture line.' }), /different bytes/);
  const next = await restart.call('read_work', {});
  assert.notEqual(next.adapter.submissionId, envelope.submissionId, 'a new Act must have a distinct identity');
});

test('unknown-outcome recovery never regenerates the contribution', async () => {
  const outboxDir = path.join(temp, 'retry');
  const bridge = new Bridge({ launch, endpoint, outboxDir });
  const value = await bridge.call('read_work', {});
  const envelope = { submissionId: value.adapter.submissionId, contextId: value.adapter.contextId, kind: 'refusal', text: 'Synthetic fixture refusal.', relations: [{ kind: 'responds-to', target: 'fixture-opening' }] };
  bridge.outbox.prepare(envelope); // Crash before any network send.
  const restart = new Bridge({ launch, endpoint, outboxDir });
  assert.equal((await restart.call('recover_submission', { submissionId: envelope.submissionId })).outcome, 'not_found');
  const result = await restart.call('retry_submission', { submissionId: envelope.submissionId });
  assert.equal(result.outcome, 'accepted');
  assert.equal(result.act.text, envelope.text);
});

test('same context identifier cannot silently change retained context', () => {
  const outbox = new Outbox(path.join(temp, 'context'), launch.workId, launch.grantId);
  outbox.rememberContext(context);
  assert.throws(() => outbox.rememberContext({ ...context, context: { ...context.context, acts: [{ id: 'unexpected' }] } }), /changed/);
});

test('stdio subprocess frames real JSON-RPC requests and closes without leaving its lock', async () => {
  const dir = path.join(temp, 'stdio');
  const launchFile = path.join(dir, 'launch.json');
  const config = path.join(dir, 'config.json');
  const outboxDir = path.join(dir, 'outbox');
  writePrivateJson(launchFile, launch);
  writePrivateJson(config, { workId: launch.workId, grantId: launch.grantId, launchFile, endpoint, outboxDir });
  const child = spawn(process.execPath, [fileURLToPath(new URL('./bridge.mjs', import.meta.url)), '--config', config], { stdio: ['pipe', 'pipe', 'pipe'] });
  const lines = createInterface({ input: child.stdout });
  const pending = new Map();
  let nextId = 0;
  let stderr = '';
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  lines.on('line', line => {
    const message = JSON.parse(line);
    const waiter = pending.get(message.id);
    if (waiter) { clearTimeout(waiter.timer); pending.delete(message.id); waiter.resolve(message); }
  });
  const rpc = (method, args = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('Synthetic stdio fixture timed out.')); }, 5000);
    pending.set(id, { resolve, timer });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params: { ...args, _meta: metadata } })}\n`);
  });
  const exited = new Promise(resolve => child.once('exit', resolve));
  try {
    const discovery = await rpc('server/discover');
    assert.equal(discovery.result.resultType, 'complete');
    const read = await rpc('tools/call', { name: 'read_work', arguments: {} });
    const value = JSON.parse(read.result.content[0].text);
    assert.equal(value.work.id, launch.workId);
    assert.equal(read.result.isError, false);
    child.stdin.end();
    assert.equal(await exited, 0);
    assert.equal(stderr, '');
    assert.equal(fs.existsSync(path.join(outboxDir, 'bridge.lock')), false);
  } finally {
    child.kill('SIGTERM');
    for (const waiter of pending.values()) clearTimeout(waiter.timer);
    lines.close();
  }
});

test('actual local API accepts, records connection, rejects changed relation, and recovers after revocation', async () => {
  const dataDir = path.join(temp, 'actual-api');
  const api = await createApi({ dataDir });
  const service = http.createServer(async (request, response) => { if (!await api.handle(request, response)) response.writeHead(404).end(); });
  await new Promise(resolve => service.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${service.address().port}`;
  try {
    const { sessionToken } = await (await fetch(`${origin}/api/bootstrap`)).json();
    const browserPost = async (route, body) => {
      const response = await fetch(`${origin}${route}`, { method: 'POST', headers: { authorization: `Bearer ${sessionToken}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const value = await response.json();
      assert.ok(response.ok, `Synthetic integration failed: ${response.status} ${value.error?.code}`);
      return value;
    };
    const work = await browserPost('/api/works', { title: 'Synthetic bridge integration', curatorName: 'Synthetic curator' });
    await browserPost(`/api/works/${work.work.id}/human-acts`, { text: 'Synthetic fixture opening.' });
    const { grant } = await browserPost(`/api/works/${work.work.id}/agent-grants`, { agentName: 'Synthetic bridge, not a model' });
    const localLaunch = JSON.parse(fs.readFileSync(path.join(dataDir, 'launch', `${work.work.id}.json`), 'utf8'));
    assert.equal(localLaunch.endpoint, origin);
    const bridge = new Bridge({ launch: localLaunch, endpoint: origin, outboxDir: path.join(temp, 'actual-api-outbox'), runtime: { name: 'Synthetic fixture', version: '1' } });
    await bridge.handle({ jsonrpc: '2.0', id: 1, method: 'server/discover', params: { _meta: metadata } });
    const context = await bridge.call('read_work', {});
    const invalid = { submissionId: context.adapter.submissionId, contextId: context.adapter.contextId, kind: 'line', text: 'Synthetic deliberate relation rejection.', relations: [{ kind: 'responds-to', target: 'act_not_offered' }] };
    await assert.rejects(bridge.call('submit_act', invalid), /400/);
    assert.equal(bridge.outbox.get(invalid.submissionId).state, 'rejected');
    let next = await bridge.call('read_work', {});
    assert.notEqual(next.adapter.submissionId, invalid.submissionId);
    const retryInvalid = { ...invalid, submissionId: next.adapter.submissionId, contextId: next.adapter.contextId };
    bridge.outbox.prepare(retryInvalid); // An earlier rejected response could have been lost.
    await assert.rejects(bridge.call('retry_submission', { submissionId: retryInvalid.submissionId }), /400/);
    assert.equal(bridge.outbox.get(retryInvalid.submissionId).state, 'rejected');
    next = await bridge.call('read_work', {});
    const valid = { submissionId: next.adapter.submissionId, contextId: next.adapter.contextId, kind: 'line', text: 'Synthetic integration exact response.', relations: [{ kind: 'responds-to', target: next.openingAct.id }] };
    const acceptance = await bridge.call('submit_act', valid);
    assert.equal(acceptance.outcome, 'accepted');
    await browserPost(`/api/works/${work.work.id}/grants/${grant.id}/revoke`, {});
    const fresh = new Bridge({ launch: localLaunch, endpoint: origin, outboxDir: path.join(temp, 'actual-api-outbox') });
    const recovery = await fresh.call('read_work', {});
    assert.equal(recovery.recoveryOnly, true);
    assert.equal(recovery.context, undefined, 'the private outbox must not pretend to be a freshly authorized service context');
    const retainedId = recovery.adapter.priorSubmissions.find(item => item.state === 'accepted').submissionId;
    const recovered = await fresh.call('recover_submission', { submissionId: retainedId });
    assert.equal(recovered.act.id, acceptance.act.id);
    const view = await (await fetch(`${origin}/api/works/${work.work.id}`, { headers: { authorization: `Bearer ${sessionToken}` } })).json();
    assert.ok(view.events.some(event => event.type === 'client-connected'), 'the scoped connection observation must not be silently lost');
  } finally {
    await new Promise(resolve => service.close(resolve));
    await api.close();
  }
});
