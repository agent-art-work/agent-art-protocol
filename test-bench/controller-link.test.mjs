import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawnSync } from 'node:child_process';
import { ReadOnlyControllerClient, findController, readController, sshControllerTransport } from './controller-link.mjs';

const expected = { id: 'owned-controller', name: 'Owned diagnostic task', cwd: '/test/workspace' };
const fixture = mode => `
  import readline from 'node:readline';
  const mode = ${JSON.stringify(mode)};
  const send = x => process.stdout.write(JSON.stringify(x) + '\\n');
  const received = []; let denied = false; let held;
  for await (const line of readline.createInterface({ input: process.stdin })) {
    const x = JSON.parse(line);
    if (x.id === 777 && x.error) { denied = x.error.code === -32601; send({ id: held, result: { platformOs: 'macos' } }); continue; }
    if (!x.method) continue;
    received.push(x.method);
    if (x.method === 'initialize') {
      if (mode === 'approval') { held = x.id; send({ id: 777, method: 'item/commandExecution/requestApproval', params: { command: 'forbidden' } }); }
      else send({ id: x.id, result: { platformOs: 'macos' } });
    } else if (x.method === 'initialized') continue;
    else if (mode === 'timeout') continue;
    else if (mode === 'oversize') process.stdout.write('x'.repeat(3000) + '\\n');
    else if (mode === 'invalid') process.stdout.write('not-json\\n');
    else if (mode === 'missing-result') send({ id: x.id });
    else if (x.method === 'thread/read') {
      const reply = { thread: { ...${JSON.stringify(expected)}, name: mode === 'wrong-task' ? 'Other task' : ${JSON.stringify(expected.name)}, status: { type: 'notLoaded' } }, received, denied };
      if (mode === 'out-of-order') setTimeout(() => send({ id: x.id, result: reply }), 60);
      else send({ id: x.id, result: reply });
    } else if (x.method === 'thread/turns/list') send({ id: x.id, result: { data: [{ id: 'turn-1', status: 'completed', items: [
      { type: 'reasoning', content: 'do not export' },
      { type: 'commandExecution', aggregatedOutput: 'do not export' },
      { type: 'agentMessage', phase: 'commentary', text: 'intermediate' },
      { type: 'agentMessage', phase: 'final_answer', text: 'Public bounded finding' },
      { type: 'fileChange', changes: [{ path: '/test/workspace/outputs/report.json' }] }
    ] }] } });
    else throw Error('Unexpected method');
  }
`;

function client(mode = 'normal', options = {}) {
  return new ReadOnlyControllerClient({ command: process.execPath,
    args: ['--input-type=module', '-e', fixture(mode)], timeoutMs: 1500, ...options });
}

test('multiplexed stored reads accept out-of-order replies without mixing results', async () => {
  const c = client('out-of-order');
  try {
    await c.connect();
    const [a, b] = await Promise.all([c.read('thread/read', { threadId: expected.id }),
      c.read('thread/turns/list', { threadId: expected.id })]);
    assert.equal(a.thread.id, expected.id); assert.equal(b.data[0].id, 'turn-1');
  } finally { await c.close(); }
});

test('mutation, inference, filesystem and process methods are rejected before dispatch', async () => {
  const c = client();
  try {
    assert.throws(() => c.read('thread/read'), /Initialize/);
    await c.connect();
    for (const method of ['turn/start', 'turn/steer', 'thread/resume', 'thread/start',
      'thread/archive', 'thread/delete', 'fs/readFile', 'process/spawn', 'account/login/start']) {
      assert.throws(() => c.read(method, {}), /Only stored task/);
    }
    const r = await c.read('thread/read', { threadId: expected.id });
    assert.deepEqual(r.received, ['initialize', 'initialized', 'thread/read']);
  } finally { await c.close(); }
});

test('server-initiated approval receives an unsupported error, never approval', async () => {
  const c = client('approval');
  try { await c.connect(); assert.equal((await c.read('thread/read')).denied, true); }
  finally { await c.close(); }
});

for (const [mode, message] of [['oversize', /byte limit/], ['invalid', /Invalid controller JSON/],
  ['missing-result', /no result/], ['timeout', /timed out/]]) {
  test(`${mode} fails closed and blocks subsequent requests`, async () => {
    const c = client(mode, { maxMessageBytes: 2048, timeoutMs: 300 });
    try {
      await c.connect(); await assert.rejects(c.read('thread/read'), message);
      await assert.rejects(c.read('thread/turns/list'), message);
    } finally { await c.close(); }
  });
}

test('pinned identity/workspace mismatch stops before history is read', async () => {
  const calls = [];
  const c = { read: async (method) => { calls.push(method); return { thread: { ...expected, cwd: '/other' } }; } };
  await assert.rejects(readController(c, expected, { includeReplies: true }), /identity\/workspace changed/);
  assert.deepEqual(calls, ['thread/read']);
});

test('name lookup rejects ambiguous matches and incomplete pagination', async () => {
  await assert.rejects(findController({ read: async () => ({ data: [expected, { ...expected, id: 'other' }] }) }, expected.name), /exactly one/);
  let calls = 0;
  await assert.rejects(findController({ read: async () => { calls++; return { data: [expected], nextCursor: 'more' }; } }, expected.name), /pagination bound/);
  assert.equal(calls, 5);
});

test('result projection exposes final replies and file paths, not command or reasoning contents', async () => {
  const c = client();
  try {
    await c.connect();
    const summary = await readController(c, expected);
    assert.equal(summary.turns[0].status, 'completed');
    assert.equal(summary.turns[0].finalReplies, undefined);
    const detail = await readController(c, expected, { includeReplies: true });
    assert.deepEqual(detail.turns[0].finalReplies, [{ text: 'Public bounded finding', truncated: false }]);
    assert.deepEqual(detail.turns[0].changedFiles, ['/test/workspace/outputs/report.json']);
    assert.equal(JSON.stringify(detail).includes('do not export'), false);
    assert.match(detail.statusLimit, /notLoaded does not establish/);
  } finally { await c.close(); }
});

test('library import works in a REPL without a global process object', () => {
  const moduleUrl = new URL('./controller-link.mjs', import.meta.url).href;
  const code = `const saved = globalThis.process; globalThis.process = undefined;
    const module = await import(${JSON.stringify(moduleUrl)});
    globalThis.process = saved;
    console.log(typeof module.ReadOnlyControllerClient);`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'function');
});

test('SSH uses a private existing control socket, pinned host and noninteractive auth policy', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-link-')); fs.chmodSync(dir, 0o700);
  const socket = path.join(dir, 's'); const server = net.createServer();
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(socket, resolve); });
    const known = path.join(dir, 'known-hosts'); fs.writeFileSync(known, 'test public host-key fixture\n');
    const profile = { schema: 'agent-art-bench/controller-connection/1', transport: {
      type: 'ssh-control-stdio', host: 'test-vm', user: 'tester', controlSocket: socket,
      knownHostsFile: known, codexPath: "/Applications/Test App's CLI/codex" } };
    const t = sshControllerTransport(profile);
    assert.equal(t.command, '/usr/bin/ssh');
    for (const v of ['BatchMode=yes', 'StrictHostKeyChecking=yes', 'PasswordAuthentication=no',
      'IdentityAgent=none', 'ForwardAgent=no', 'ClearAllForwardings=yes']) assert.ok(t.args.includes(v));
    assert.equal(t.args.at(-1), "exec '/Applications/Test App'\\''s CLI/codex' app-server --listen stdio://");
    assert.throws(() => sshControllerTransport({ ...profile, transport: { ...profile.transport, host: '-oProxyCommand=bad' } }), /destination/);
    fs.chmodSync(dir, 0o755); assert.throws(() => sshControllerTransport(profile), /private/);
  } finally {
    await new Promise(resolve => server.close(resolve)); fs.rmSync(dir, { recursive: true, force: true });
  }
});
