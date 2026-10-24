/** Read-only task/result access. This is not a desktop driver or action authority. */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const READ_METHODS = new Set(['thread/list', 'thread/read', 'thread/turns/list', 'thread/items/list']);
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";

export class ReadOnlyControllerClient {
  #process; #buffer = Buffer.alloc(0); #pending = new Map(); #nextId = 1;
  #failure; #ready = false; #closed = false; #timeoutMs; #maxBytes;

  constructor({ command, args = [], timeoutMs = 15000, maxMessageBytes = 1048576 }) {
    ensure(typeof command === 'string' && command.length > 0 && Array.isArray(args)
      && args.every(x => typeof x === 'string'), 'Explicit executable and argument array required.');
    ensure(Number.isInteger(timeoutMs) && timeoutMs > 0 && Number.isInteger(maxMessageBytes)
      && maxMessageBytes > 0, 'Positive transport bounds required.');
    this.#timeoutMs = timeoutMs; this.#maxBytes = maxMessageBytes;
    this.#process = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false });
    // Consume stderr without retaining potentially private runtime logs.
    this.#process.stderr.on('data', () => {});
    this.#process.stdin.on('error', () => this.#fail(Error('Controller transport input closed.')));
    this.#process.on('error', () => this.#fail(Error('Controller transport could not start.')));
    this.#process.on('close', () => {
      if (!this.#closed) this.#fail(Error('Controller transport closed.'));
    });
    this.#process.stdout.on('data', chunk => this.#consume(chunk));
  }

  #fail(error) {
    if (this.#failure || this.#closed) return;
    this.#failure = error;
    for (const p of this.#pending.values()) { clearTimeout(p.timer); p.reject(error); }
    this.#pending.clear();
    this.#process.kill();
  }

  #send(message) {
    if (this.#failure) throw this.#failure;
    ensure(!this.#closed, 'Controller client is closed.');
    this.#process.stdin.write(JSON.stringify(message) + '\n');
  }

  #consume(chunk) {
    if (this.#failure || this.#closed) return;
    try {
      this.#buffer = Buffer.concat([this.#buffer, chunk]);
      let end;
      while ((end = this.#buffer.indexOf(10)) !== -1) {
        ensure(end <= this.#maxBytes, 'Controller message exceeds the byte limit.');
        const line = this.#buffer.subarray(0, end); this.#buffer = this.#buffer.subarray(end + 1);
        if (!line.length) continue;
        const message = JSON.parse(line.toString('utf8'));
        ensure(message && typeof message === 'object' && !Array.isArray(message), 'Invalid controller message.');
        if (typeof message.method === 'string') {
          if (Object.hasOwn(message, 'id')) this.#send({ id: message.id,
            error: { code: -32601, message: 'Read-only result client does not grant approvals or execute actions.' } });
          continue; // Never retain unsolicited notifications or UI contents.
        }
        const pending = this.#pending.get(message.id);
        ensure(pending, 'Unexpected controller response ID.');
        ensure(message.error || Object.hasOwn(message, 'result'), 'Controller response has no result.');
        this.#pending.delete(message.id); clearTimeout(pending.timer);
        if (message.error) pending.reject(Error(`Read-only RPC ${pending.method} failed (${message.error.code}).`));
        else pending.resolve(message.result);
      }
      ensure(this.#buffer.length <= this.#maxBytes, 'Controller message exceeds the byte limit.');
    } catch (error) { this.#fail(error instanceof SyntaxError ? Error('Invalid controller JSON.') : error); }
  }

  #request(method, params) {
    if (this.#failure) return Promise.reject(this.#failure);
    if (this.#closed) return Promise.reject(Error('Controller client is closed.'));
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.#fail(Error(`Read-only RPC ${method} timed out.`)), this.#timeoutMs);
      this.#pending.set(id, { method, resolve, reject, timer });
      try { this.#send({ id, method, params }); }
      catch (error) { this.#fail(error); }
    });
  }

  async connect() {
    ensure(!this.#ready, 'Controller client is already initialized.');
    const runtime = await this.#request('initialize', { clientInfo: {
      name: 'agent_art_bench_readonly', title: 'Agent Art Bench Read-only Result Client', version: '0.0.1'
    }, capabilities: { experimentalApi: false } });
    this.#send({ method: 'initialized', params: {} }); this.#ready = true;
    return { userAgent: runtime.userAgent, platformFamily: runtime.platformFamily, platformOs: runtime.platformOs };
  }

  read(method, params = {}) {
    ensure(READ_METHODS.has(method), 'Only stored task/result reads are permitted.');
    ensure(this.#ready, 'Initialize the controller client first.');
    return this.#request(method, params);
  }

  async close() {
    if (this.#closed) return;
    this.#closed = true;
    for (const p of this.#pending.values()) { clearTimeout(p.timer); p.reject(Error('Controller client closed.')); }
    this.#pending.clear();
    const process = this.#process;
    if (process.exitCode !== null || process.signalCode !== null) return;
    await new Promise(resolve => {
      const timer = setTimeout(() => { process.kill(); resolve(); }, 1000);
      process.once('close', () => { clearTimeout(timer); resolve(); });
      process.stdin.end();
    });
  }
}

export async function findController(client, name) {
  ensure(typeof name === 'string' && name.length > 0 && name.length < 200, 'Exact controller name required.');
  const matches = []; let cursor;
  for (let page = 0; page < 5; page++) {
    const result = await client.read('thread/list', { searchTerm: name, limit: 20,
      sortKey: 'updated_at', sortDirection: 'desc', ...(cursor ? { cursor } : {}) });
    ensure(Array.isArray(result.data), 'Controller search returned no task array.');
    matches.push(...result.data.filter(x => x.name === name));
    cursor = result.nextCursor;
    if (!cursor) {
      ensure(matches.length === 1, 'Controller name must resolve to exactly one task; pin its ID.');
      return matches[0];
    }
  }
  throw Error('Controller search pagination bound reached; do not select a partial match.');
}

export async function readController(client, expected, { includeReplies = false, limit = 4 } = {}) {
  ensure(expected && typeof expected.id === 'string' && typeof expected.name === 'string'
    && typeof expected.cwd === 'string', 'Pinned controller ID, name and workspace required.');
  ensure(Number.isInteger(limit) && limit > 0 && limit <= 10, 'Bounded turn count required.');
  const { thread } = await client.read('thread/read', { threadId: expected.id });
  ensure(thread?.id === expected.id && thread.name === expected.name && thread.cwd === expected.cwd,
    'Controller identity/workspace changed; stop before reading history.');
  const result = await client.read('thread/turns/list', { threadId: expected.id, limit,
    sortDirection: 'desc', itemsView: includeReplies ? 'full' : 'notLoaded' });
  ensure(Array.isArray(result.data), 'Controller returned no turn array.');
  return {
    thread: { id: thread.id, name: thread.name, cwd: thread.cwd, readerStatus: thread.status },
    statusLimit: 'Status comes from this reader process. notLoaded does not establish that another desktop process is idle.',
    turns: result.data.map(turn => ({ id: turn.id, status: turn.status,
      ...(includeReplies ? {
        finalReplies: (turn.items ?? []).filter(x => x.type === 'agentMessage' && x.phase === 'final_answer')
          .map(x => ({ text: String(x.text ?? '').slice(0, 16000), truncated: String(x.text ?? '').length > 16000 })),
        changedFiles: (turn.items ?? []).filter(x => x.type === 'fileChange')
          .flatMap(x => (x.changes ?? []).map(y => y.path)).filter(x => typeof x === 'string')
      } : {}) }))
  };
}

export function sshControllerTransport(profile) {
  ensure(profile?.schema === 'agent-art-bench/controller-connection/1'
    && profile.transport?.type === 'ssh-control-stdio', 'Explicit SSH controller connection required.');
  const t = profile.transport;
  ensure(typeof t.host === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(t.host)
    && typeof t.user === 'string' && /^[A-Za-z_][A-Za-z0-9_-]*$/u.test(t.user), 'Invalid SSH destination.');
  for (const key of ['controlSocket', 'knownHostsFile', 'codexPath']) {
    ensure(typeof t[key] === 'string' && path.isAbsolute(t[key]) && !/[\0\r\n]/u.test(t[key]), 'Absolute transport paths required.');
  }
  ensure(fs.statSync(t.controlSocket).isSocket(), 'Reconnect the approved SSH control session first.');
  ensure((fs.statSync(path.dirname(t.controlSocket)).mode & 0o077) === 0, 'SSH control directory must be private.');
  ensure(fs.lstatSync(t.knownHostsFile).isFile(), 'Pinned regular SSH known-hosts file required.');
  return { command: '/usr/bin/ssh', args: ['-F', '/dev/null', '-S', t.controlSocket,
    '-o', 'ControlMaster=no', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8',
    '-o', 'IdentityAgent=none', '-o', 'IdentityFile=none', '-o', 'PubkeyAuthentication=no',
    '-o', 'PasswordAuthentication=no', '-o', 'KbdInteractiveAuthentication=no',
    '-o', 'ForwardAgent=no', '-o', 'ClearAllForwardings=yes', '-o', 'StrictHostKeyChecking=yes',
    '-o', 'UserKnownHostsFile=' + t.knownHostsFile, t.user + '@' + t.host,
    'exec ' + quote(t.codexPath) + ' app-server --listen stdio://'] };
}

export async function runControllerRead(profile, { includeReplies = false } = {}) {
  const client = new ReadOnlyControllerClient(sshControllerTransport(profile));
  try {
    const runtime = await client.connect();
    const result = await readController(client, profile.controller, { includeReplies });
    return { schema: 'agent-art-bench/controller-read/1', checkedAt: new Date().toISOString(),
      runtime, ...result, uiInputs: 0, modelTurnsStarted: 0, controllerMessagesSent: 0,
      qualification: 'Stored task/result access only; native control and action authority remain separate.' };
  } finally { await client.close(); }
}

if (typeof process !== 'undefined' && process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [mode = 'status', ...args] = process.argv.slice(2);
    ensure(['status', 'read'].includes(mode) && (args.length === 0
      || (args.length === 2 && args[0] === '--connection')), 'Use status|read [--connection FILE].');
    const file = args[1] ?? path.resolve('.local/test-bench/controller-connection.json');
    const profile = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(JSON.stringify(await runControllerRead(profile, { includeReplies: mode === 'read' }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
