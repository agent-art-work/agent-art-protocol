// Superseded website Q&A experiment; not imported by the current native handoff server.
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { spawn } from 'node:child_process';
import { isIP } from 'node:net';
import { resolve, join } from 'node:path';
import {
  mkdirSync, readdirSync, readFileSync, openSync, writeFileSync,
  fsyncSync, closeSync, renameSync, unlinkSync,
} from 'node:fs';

const MAX_BYTES = 2 * 1024 * 1024;
const ACTIVE = new Set(['starting', 'launching', 'running', 'reading']);
const STATUSES = new Set(['created', ...ACTIVE, 'exited', 'finished', 'failed', 'stopped', 'interrupted']);
const TERMINAL = new Set(['exited', 'failed', 'stopped', 'interrupted']);
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const copy = value => structuredClone(value);
const now = () => new Date().toISOString();

function failure(code, message, status = 400) {
  return Object.assign(new Error(message), { code, status });
}

// This pilot deliberately accepts only public DNS names, HTTPS and port 443.
// Actual addresses are checked and pinned by the default HTTP helper below.
function publicURL(value, base) {
  let url;
  try { url = new URL(value, base); } catch { throw failure('URL_DENIED', 'Invalid source URL.'); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.hash
      || (url.port && url.port !== '443') || isIP(host.replace(/^\[|\]$/g, ''))
      || !host.includes('.') || host.endsWith('.')
      || /(?:^|\.)(?:localhost|local|internal|lan|home|test|invalid|onion|arpa)$/.test(host)) {
    throw failure('URL_DENIED', 'Only permitted public HTTPS source URLs are accepted.');
  }
  return url;
}

function publicAddress(address) {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2))))
      || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
      || (a === 203 && b === 0 && c === 113));
  }
  const normalized = address.toLowerCase();
  return isIP(address) === 6 && /^[23]/.test(normalized)
    && !/^(?:2001:db8:|2001:0:|2002:)/.test(normalized);
}

/** Bounded GET only. Configured HTTPS transport is trusted; direct DNS is pinned. */
export async function fetchPublicBytes(value) {
  const url = publicURL(value);
  // Only presence is examined. Proxy credentials/settings are never retained.
  const configuredProxy = Boolean(process.env.https_proxy || process.env.HTTPS_PROXY
    || process.env.all_proxy || process.env.ALL_PROXY);
  const route = [];
  if (!configuredProxy) {
    let dnsTimeout;
    let addresses;
    try {
      addresses = await Promise.race([
        lookup(url.hostname, { all: true, verbatim: true }),
        new Promise((_, reject) => {
          dnsTimeout = setTimeout(() => reject(failure('FETCH_FAILED', 'Source DNS lookup timed out.', 502)), 5_000);
        }),
      ]);
    } finally { clearTimeout(dnsTimeout); }
    if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) {
      throw failure('URL_DENIED', 'Source DNS did not resolve exclusively to public addresses.');
    }
    const address = addresses[0].address;
    const pinned = address.includes(':') ? `[${address}]` : address;
    route.push('--noproxy', '*', '--resolve', `${url.hostname}:443:${pinned}`);
  }
  const transport = configuredProxy ? 'configured-proxy-environment' : 'direct-public-dns-pin';
  const args = ['-q', '--silent', '--show-error', '--fail', '--http1.1', '--no-location', '--suppress-connect-headers',
    '--proto', '=https', '--request', 'GET', '--connect-timeout', '5', '--max-time', '20',
    '--max-filesize', String(MAX_BYTES), ...route,
    '--dump-header', '-', '--output', '-', '--url', url.href];
  return new Promise((accept, reject) => {
    const child = spawn('curl', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    let total = 0;
    let settled = false;
    const stop = error => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(error);
    };
    const timeout = setTimeout(() => stop(failure('FETCH_FAILED', 'Source GET timed out.', 502)), 22_000);
    child.stdout.on('data', chunk => {
      total += chunk.length;
      if (total > MAX_BYTES + 64 * 1024) stop(failure('SOURCE_TOO_LARGE', 'Source exceeds the byte limit.', 413));
      else chunks.push(chunk);
    });
    // Consume diagnostics without retaining raw process output or exposing it.
    child.stderr.resume();
    child.on('error', () => { clearTimeout(timeout); stop(failure('FETCH_FAILED', 'Public source GET failed.', 502)); });
    child.on('close', code => {
      clearTimeout(timeout);
      if (settled) return;
      settled = true;
      if (code !== 0) return reject(failure('FETCH_FAILED', 'Public source GET failed.', 502));
      const response = Buffer.concat(chunks);
      const boundary = response.indexOf('\r\n\r\n');
      if (boundary < 0 || boundary > 64 * 1024
          || !/^HTTP\/1\.[01] 200(?:\s|$)/.test(response.subarray(0, boundary).toString('ascii'))) {
        return reject(failure('HTTP_REJECTED', 'Source GET must return HTTP 200 without redirects.', 502));
      }
      const bytes = response.subarray(boundary + 4);
      if (bytes.length > MAX_BYTES) return reject(failure('SOURCE_TOO_LARGE', 'Source exceeds the byte limit.', 413));
      Object.defineProperty(bytes, 'transport', { value: transport });
      accept(bytes);
    });
  });
}

function bytesOf(value) {
  if (!(value instanceof Uint8Array)) throw failure('FETCH_FAILED', 'HTTP helper must return bytes.', 502);
  const bytes = Buffer.from(value);
  if (bytes.length > MAX_BYTES) throw failure('SOURCE_TOO_LARGE', 'Source exceeds the byte limit.', 413);
  const transport = ['configured-proxy-environment', 'direct-public-dns-pin'].includes(value.transport)
    ? value.transport : 'injected-fetch-helper';
  Object.defineProperty(bytes, 'transport', { value: transport });
  return bytes;
}

function checkedJSON(value, depth = 0) {
  if (depth > 6) throw failure('VERIFICATION_FAILED', 'Invalid verification checks.');
  if (value === false) throw failure('VERIFICATION_FAILED', 'Source verification failed.');
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (/^(?:failed|mismatch|invalid|rejected|contradicted)$/i.test(value)) {
      throw failure('VERIFICATION_FAILED', 'Source verification failed.');
    }
    return value.slice(0, 500);
  }
  if (Array.isArray(value)) return value.map(item => checkedJSON(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) =>
      !/token|secret|password|content|prompt|stdout|stderr|raw|logs?/i.test(key))
      .map(([key, item]) => [key.slice(0, 100), checkedJSON(item, depth + 1)]));
  }
  throw failure('VERIFICATION_FAILED', 'Verification checks must be JSON data.');
}

function profileSnapshot(profile) {
  if (!profile || typeof profile.id !== 'string' || !profile.id || typeof profile.title !== 'string'
      || typeof profile.prompt !== 'string' || typeof profile.parseIndex !== 'function'
      || typeof profile.parseDocument !== 'function') throw failure('INVALID_PROFILE', 'Invalid trusted reading profile.');
  return {
    id: profile.id, title: profile.title, indexUrl: publicURL(profile.indexUrl).href,
    prompt: profile.prompt,
    parserSha256: hash(`${profile.parseIndex.toString()}\n${profile.parseDocument.toString()}`),
  };
}

function sourceView(source) {
  const { id, title, url, revision, checks, downloadSha256, downloadByteLength,
    sourceUtf8Sha256, sourceUtf8ByteLength, deliveredAt, transport } = source;
  return copy({ id, title, url, revision, checks, downloadSha256, downloadByteLength,
    sourceUtf8Sha256, sourceUtf8ByteLength, deliveredAt, transport });
}

function lifecycleMessage(detail, token) {
  if (typeof detail !== 'string') return null;
  return detail.split(token).join('[redacted]')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/\b(?:token|authorization|password|secret)\s*[:=]\s*\S+/gi, '[redacted]')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 500) || null;
}

/** Experimental local reading bridge; not a frozen protocol or origin attestation. */
export class ReadingEngine {
  constructor({ dir, profile, fetchBytes = fetchPublicBytes }) {
    this.dir = resolve(dir);
    this.profile = profile;
    this.context = profileSnapshot(profile);
    this.fetchBytes = fetchBytes;
    this.tasks = new Map();
    this.queue = Promise.resolve();
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    for (const file of readdirSync(this.dir).filter(name => ID.test(name.slice(0, -5)) && name.endsWith('.json'))) {
      const state = JSON.parse(readFileSync(join(this.dir, file), 'utf8'));
      if (state.schema !== 'reading-task/v1' || `${state.id}.json` !== file) {
        throw failure('INVALID_STATE', 'Unrecognized private reading state.', 500);
      }
      if (ACTIVE.has(state.status)) {
        state.status = 'interrupted';
        state.events.push({ type: 'process-interrupted', at: now(), reason: 'engine-restart',
          message: 'The engine restarted; the former client process was not relaunched.' });
        this.persist(state);
      }
      this.tasks.set(state.id, state);
    }
  }

  serial(operation) {
    const result = this.queue.then(operation);
    this.queue = result.catch(() => {});
    return result;
  }

  persist(state) {
    const path = join(this.dir, `${state.id}.json`);
    const temp = `${path}.${randomUUID()}.tmp`;
    let descriptor;
    try {
      descriptor = openSync(temp, 'wx', 0o600);
      writeFileSync(descriptor, JSON.stringify(state));
      fsyncSync(descriptor);
      closeSync(descriptor);
      descriptor = undefined;
      renameSync(temp, path);
    } finally {
      if (descriptor !== undefined) closeSync(descriptor);
      try { unlinkSync(temp); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }

  commit(state) { this.persist(state); this.tasks.set(state.id, state); }

  state(id) {
    if (!ID.test(id ?? '') || !this.tasks.has(id)) throw failure('NOT_FOUND', 'Reading task not found.', 404);
    return this.tasks.get(id);
  }

  get(id) { return copy(this.state(id)); }

  view(id) {
    const state = this.state(id);
    const { question, client, status, createdAt, events, answer, error } = state;
    return copy({ id: state.id, question, client, status, createdAt, events,
      sources: state.sources.map(sourceView), answer, error });
  }

  create({ question, client }) {
    return this.serial(() => {
      if (typeof question !== 'string' || !question.trim() || Buffer.byteLength(question) > 20_000
          || typeof client !== 'string' || !client.trim() || client.length > 120) {
        throw failure('INVALID_REQUEST', 'A question and client label are required.');
      }
      const createdAt = now();
      const state = { schema: 'reading-task/v1', id: randomUUID(), token: randomBytes(32).toString('hex'),
        question, client, status: 'created', createdAt, profile: copy(this.context),
        events: [{ type: 'task-created', at: createdAt, message: 'Private reading task created.' }],
        index: null, sources: [], answer: null, error: null };
      this.commit(state);
      return copy(state);
    });
  }

  mark(id, status, detail = {}) {
    return this.serial(() => {
      if (!STATUSES.has(status)) throw failure('INVALID_STATUS', 'Unknown process status.');
      const state = this.get(id);
      const event = { type: 'process-status', at: now(), status,
        message: lifecycleMessage(detail, state.token) ?? `Client process reported ${status}.` };
      if (Number.isInteger(detail?.exitCode)) event.exitCode = detail.exitCode;
      if (typeof detail?.signal === 'string' && /^SIG[A-Z0-9]+$/.test(detail.signal)) event.signal = detail.signal;
      state.events.push(event);
      if (!state.answer && !['stopped', 'interrupted'].includes(state.status) && !(TERMINAL.has(state.status) && ACTIVE.has(status))) {
        state.status = status === 'finished' ? 'failed' : status;
        if (status === 'finished') state.error = { code: 'NO_ANSWER', message: 'Client exited without a returned answer.' };
        if (status === 'failed') state.error = { code: 'PROCESS_FAILED', message: 'Client process failed before answer acceptance.' };
        if (status === 'stopped') state.error = { code: 'PROCESS_STOPPED', message: 'Client process was stopped before answer acceptance.' };
      } else if (!state.answer && (ACTIVE.has(status) || ['stopped', 'interrupted'].includes(state.status))) {
        event.message = 'Late process diagnostic retained; terminal task status preserved.';
      }
      this.commit(state);
      return this.view(id);
    });
  }

  call(id, token, name, args = {}) {
    return this.serial(async () => {
      const state = this.get(id);
      const suppliedToken = typeof token === 'string' ? Buffer.from(token, 'utf8') : Buffer.alloc(0);
      const expectedToken = Buffer.from(state.token, 'utf8');
      if (suppliedToken.length !== expectedToken.length || !timingSafeEqual(suppliedToken, expectedToken)) {
        throw failure('UNAUTHORIZED', 'Invalid reading task token.', 401);
      }
      try {
        const result = await this.operation(state, name, args);
        this.commit(state);
        return copy(result);
      } catch (error) {
        const safe = error?.code && error?.status ? error
          : failure('OPERATION_FAILED', 'Reading operation failed.', 502);
        const operation = ['read_request', 'read_index', 'read_document', 'submit_answer'].includes(name) ? name : 'unknown';
        state.events.push({ type: 'operation-failed', at: now(), operation, message: safe.message,
          error: { code: safe.code, message: safe.message } });
        if (!state.answer) state.error = { code: safe.code, message: safe.message };
        this.commit(state);
        throw safe;
      }
    });
  }

  async fetch(url) {
    try { return bytesOf(await this.fetchBytes(url)); } catch (error) {
      if (['URL_DENIED', 'SOURCE_TOO_LARGE', 'HTTP_REJECTED'].includes(error?.code)) throw error;
      throw failure('FETCH_FAILED', 'Permitted public source GET failed.', 502);
    }
  }

  matchingProfile(state) {
    if (JSON.stringify(state.profile) !== JSON.stringify(this.context)) {
      throw failure('PROFILE_CHANGED', 'Pinned reading profile differs from the active profile.', 409);
    }
  }

  async operation(state, name, args) {
    if (!args || typeof args !== 'object' || Array.isArray(args)) throw failure('INVALID_ARGUMENTS', 'Tool arguments must be an object.');
    if (state.status === 'stopped') throw failure('TASK_STOPPED', 'Reading task was stopped.', 409);
    if (state.status === 'interrupted') throw failure('TASK_INTERRUPTED', 'Reading task was interrupted; create a new task to retry.', 409);
    if (name === 'read_request') {
      state.events.push({ type: 'request-delivered', at: now(), message: 'Question and profile instructions delivered.' });
      return { question: state.question, profile: copy(state.profile), instructions: state.profile.prompt };
    }
    if (name === 'submit_answer') {
      if (typeof args.text !== 'string' || !args.text.trim() || Buffer.byteLength(args.text) > MAX_BYTES
          || !Array.isArray(args.sourceIds) || args.sourceIds.some(id => typeof id !== 'string')
          || new Set(args.sourceIds).size !== args.sourceIds.length) {
        throw failure('INVALID_ANSWER', 'An exact answer and unique sourceIds array are required.');
      }
      if (state.answer) {
        if (state.answer.text !== args.text || JSON.stringify(state.answer.sourceIds) !== JSON.stringify(args.sourceIds)) {
          throw failure('ANSWER_CONFLICT', 'An exact answer was already accepted.', 409);
        }
        return { accepted: true, idempotent: true, answer: copy(state.answer) };
      }
      if (args.sourceIds.some(id => !state.sources.some(source => source.id === id))) {
        throw failure('SOURCE_NOT_DELIVERED', 'Answers may reference only delivered sources.');
      }
      state.answer = { text: args.text, sourceIds: copy(args.sourceIds), acceptedAt: now(),
        sha256: hash(Buffer.from(args.text, 'utf8')), byteLength: Buffer.byteLength(args.text) };
      state.status = 'answered';
      state.error = null;
      state.events.push({ type: 'answer-accepted', at: state.answer.acceptedAt,
        sha256: state.answer.sha256, sourceIds: copy(args.sourceIds), message: 'Exact answer accepted and retained.' });
      return { accepted: true, idempotent: false, answer: copy(state.answer) };
    }
    if (name === 'read_index') {
      if (!state.index) {
        if (state.answer) throw failure('TASK_ANSWERED', 'Cannot acquire new sources after answer acceptance.', 409);
        this.matchingProfile(state);
        const bytes = await this.fetch(state.profile.indexUrl);
        let index;
        try { index = await this.profile.parseIndex(Buffer.from(bytes)); }
        catch { throw failure('INDEX_INVALID', 'Reading index verification failed.', 502); }
        if (!index || typeof index.revision !== 'string' || !index.revision || !Array.isArray(index.documents)) {
          throw failure('INDEX_INVALID', 'Reading index requires a revision and document entries.', 502);
        }
        const documents = index.documents.map(entry => {
          if (!entry || typeof entry.id !== 'string' || !entry.id || typeof entry.title !== 'string'
              || typeof entry.revision !== 'string' || !entry.revision || typeof entry.url !== 'string') {
            throw failure('INDEX_INVALID', 'Invalid reading index entry.', 502);
          }
          const url = publicURL(entry.url, state.profile.indexUrl);
          if (url.origin !== new URL(state.profile.indexUrl).origin) throw failure('URL_DENIED', 'Index documents must share the trusted index origin.');
          return { ...copy(entry), url: url.href };
        });
        if (new Set(documents.map(entry => entry.id)).size !== documents.length) throw failure('INDEX_INVALID', 'Duplicate reading document identifiers.', 502);
        state.index = { url: state.profile.indexUrl, revision: index.revision,
          sha256: hash(bytes), byteLength: bytes.length, transport: bytes.transport,
          bytes: bytes.toString('base64'), documents };
      }
      state.events.push({ type: 'index-delivered', at: now(), revision: state.index.revision,
        message: 'Pinned index and document list delivered.' });
      return { revision: state.index.revision,
        documents: state.index.documents.map(({ id, title, url, revision }) => ({ id, title, url, revision })) };
    }
    if (name === 'read_document') {
      if (!state.index) throw failure('INDEX_REQUIRED', 'Read the pinned index before selecting a document.');
      const entry = state.index.documents.find(document => document.id === args.id);
      if (!entry) throw failure('SOURCE_NOT_LISTED', 'Document is absent from the pinned index.');
      const retained = state.sources.find(source => source.id === entry.id);
      if (retained) return { ...sourceView(retained), content: retained.content };
      if (state.answer) throw failure('TASK_ANSWERED', 'Cannot acquire new sources after answer acceptance.', 409);
      this.matchingProfile(state);
      const url = publicURL(entry.url);
      if (url.origin !== new URL(state.profile.indexUrl).origin) throw failure('URL_DENIED', 'Source is outside the trusted origin.');
      const bytes = await this.fetch(url.href);
      let document;
      try { document = await this.profile.parseDocument(Buffer.from(bytes), copy(entry)); }
      catch { throw failure('VERIFICATION_FAILED', 'Source document verification failed.', 502); }
      if (!document || typeof document.content !== 'string' || document.revision !== entry.revision
          || typeof document.url !== 'string' || publicURL(document.url, entry.url).href !== entry.url
          || document.checks === undefined) throw failure('VERIFICATION_FAILED', 'Source identity or revision does not match the pinned index.', 502);
      const checks = checkedJSON(document.checks);
      const source = { id: entry.id, title: entry.title, url: entry.url, revision: entry.revision,
        checks, downloadSha256: hash(bytes), downloadByteLength: bytes.length,
        sourceUtf8Sha256: hash(Buffer.from(document.content, 'utf8')),
        sourceUtf8ByteLength: Buffer.byteLength(document.content), deliveredAt: now(), transport: bytes.transport,
        bytes: bytes.toString('base64'), content: document.content };
      state.sources.push(source);
      state.events.push({ type: 'source-delivered', at: source.deliveredAt, sourceId: source.id,
        url: source.url, revision: source.revision, message: 'Verified source delivered; comprehension is not established.' });
      return { ...sourceView(source), content: source.content };
    }
    throw failure('UNKNOWN_TOOL', 'Unknown reading tool.');
  }

  export(id) {
    const state = this.state(id);
    const { id: profileId, title, indexUrl } = state.profile;
    const index = state.index && { url: state.index.url, revision: state.index.revision,
      sha256: state.index.sha256, byteLength: state.index.byteLength, transport: state.index.transport };
    return copy({ schema: 'reading-export/v1', ...this.view(id), profile: { id: profileId, title, indexUrl }, index,
      executionOrigin: { status: 'NOT ESTABLISHED',
        reason: 'Local token-authenticated tool observations do not establish model authorship or independent execution.' },
      observationScope: 'This local service recorded request delivery, pinned index/source delivery and exact answer acceptance.',
      limits: ['Source delivery does not establish comprehension or answer accuracy.',
        'Integrity checks depend on the trusted profile, index, local service and retained state.',
        'Configured HTTPS proxy settings, when present, are trusted local transport; routing and DNS are not independently verified on that path. No denial triggers an automatic transport fallback.',
        'Client labels and lifecycle reports are local declarations, not provider attestations.',
        'No private intention, absence of intervention, broad client compatibility or Agent Art certification is established.'] });
  }
}
