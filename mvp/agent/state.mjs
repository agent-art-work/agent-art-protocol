import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

export function assertWorkId(value) {
  if (typeof value !== 'string' || !SAFE_ID.test(value)) throw new Error('Invalid Work identifier.');
  return value;
}

export function localOrigin(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Endpoint must be a loopback HTTP origin.'); }
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
      || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Endpoint must be a loopback HTTP origin with no credentials or path.');
  }
  return url.origin;
}

export function digest(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

// Persist complete bytes before any network write. Renaming a fully flushed file
// keeps a crash from turning an uncertain delivery into an empty outbox.
export function writePrivateJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.${randomUUID()}.tmp`;
  const fd = fs.openSync(temp, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  fs.renameSync(temp, file);
  fs.chmodSync(file, 0o600);
  const dir = fs.openSync(path.dirname(file), 'r');
  try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
}

export function readPrivateJson(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077)) {
    throw new Error('Private launch/outbox file must be a regular file readable only by its owner.');
  }
  if (typeof process.getuid === 'function' && stat.uid !== process.getuid()) {
    throw new Error('Private launch/outbox file must belong to the current user.');
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function acquireLock(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, 'bridge.lock');
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const fd = fs.openSync(file, 'wx', 0o600);
      fs.writeFileSync(fd, JSON.stringify({ pid: process.pid }));
      fs.closeSync(fd);
      return () => {
        try {
          if (readPrivateJson(file).pid === process.pid) fs.unlinkSync(file);
        } catch { /* A separate cleanup never authorizes deleting another lock. */ }
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let owner;
      try { owner = readPrivateJson(file); } catch { throw new Error('Bridge lock cannot be verified.'); }
      if (!Number.isSafeInteger(owner.pid) || owner.pid <= 0) throw new Error('Bridge lock cannot be verified.');
      try {
        process.kill(owner.pid, 0);
        throw new Error('Another Agent bridge is active for this Work. Close it before launching again.');
      } catch (probe) {
        if (probe.code !== 'ESRCH') throw probe;
      }
      fs.unlinkSync(file);
    }
  }
  throw new Error('Unable to acquire the Agent bridge lock.');
}

export class Outbox {
  constructor(dir, workId, grantId) {
    this.dir = dir;
    this.file = path.join(dir, 'outbox.json');
    this.data = fs.existsSync(this.file) ? readPrivateJson(this.file) : {
      version: 'agent-art-local-outbox/1', workId, grantId, intents: [],
    };
    if (this.data.workId !== workId || this.data.grantId !== grantId || !Array.isArray(this.data.intents)) {
      throw new Error('Outbox belongs to a different Work or grant.');
    }
    this.save();
  }

  save() { writePrivateJson(this.file, this.data); }

  rememberContext(value) {
    if (!value?.context?.id || value.work?.id !== this.data.workId) throw new Error('Service returned an invalid Work context.');
    const file = path.join(this.dir, 'contexts', `${digest(value.context.id)}.json`);
    if (fs.existsSync(file)) {
      const prior = readPrivateJson(file);
      if (JSON.stringify(prior.context) !== JSON.stringify(value.context)) throw new Error('Service changed an already identified context.');
    } else writePrivateJson(file, value);
    // An uncertain delivery must be resolved before allocating another creative
    // intent. Otherwise reconnecting could quietly reroll the Agent's line.
    let intent = this.data.intents.find(item => item.state === 'pending')
      || this.data.intents.find(item => item.state === 'ready' && item.contextId === value.context.id);
    if (!intent) {
      intent = { submissionId: randomUUID(), contextId: value.context.id, state: 'ready', createdAt: new Date().toISOString() };
      this.data.intents.push(intent);
      this.save();
    }
    return intent;
  }

  get(id) {
    const value = this.data.intents.find(item => item.submissionId === id);
    if (!value) throw new Error('Unknown submission identifier. Read the Work to obtain an adapter-issued identifier.');
    return value;
  }

  prepare(envelope) {
    const item = this.get(envelope.submissionId);
    if (item.contextId !== envelope.contextId) throw new Error('Submission context differs from the recorded intent.');
    const bytes = JSON.stringify(envelope);
    if (item.envelopeBytes && item.envelopeBytes !== bytes) {
      throw new Error('This submission identifier is already bound to different bytes. Recover it; do not rewrite it.');
    }
    if (!item.envelopeBytes) {
      item.envelopeBytes = bytes;
      item.envelopeDigest = digest(bytes);
      item.state = 'pending';
      this.save();
    }
    return item;
  }

  record(id, response) {
    const item = this.get(id);
    item.response = response;
    item.lastObservedAt = new Date().toISOString();
    if (response?.outcome === 'accepted') item.state = 'accepted';
    this.save();
    return item;
  }

  reject(id, status, code) {
    const item = this.get(id);
    item.state = 'rejected';
    item.rejection = { status, code, observedAt: new Date().toISOString() };
    this.save();
  }

  summary() {
    return this.data.intents.filter(item => item.state !== 'ready').map(item => ({
      submissionId: item.submissionId, contextId: item.contextId, state: item.state,
      ...(item.envelopeBytes ? { exactEnvelope: JSON.parse(item.envelopeBytes), envelopeDigest: item.envelopeDigest } : {}),
      ...(item.response ? { outcome: item.response } : {}),
    }));
  }
}
