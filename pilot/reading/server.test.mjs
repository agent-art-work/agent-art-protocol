import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import http from 'node:http';
import { createReadingServer, readingContext } from './server.mjs';
import { verify } from '../../protocol/index.mjs';

const profile = { id: 'test-reading', title: 'Synthetic reading fixture 意图 🌗', indexUrl: 'https://example.org/index.json', prompt: 'Preserve this exact publisher request.\nRead complete sources and report failures.' };
async function fixture(t, { failOpen = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-handoff-test-'));
  fs.mkdirSync(path.join(dir, 'site')); fs.writeFileSync(path.join(dir, 'site/index.html'), '<!doctype html><title>Fixture</title>');
  let opens = 0; let observed;
  const result = await createReadingServer({ siteDir: path.join(dir, 'site'), entryFile: path.join(dir, 'entry.mjs'), profile,
    discover: async () => [{ id: 'synthetic', name: 'Synthetic client fixture', available: true }, { id: 'other', name: 'Other fixture', available: true }, { id: 'absent', name: 'Absent fixture', available: false }],
    open: async options => { opens++; observed = options; await new Promise(resolve => setTimeout(resolve, 10)); if (failOpen) throw new Error('Synthetic failure'); },
  });
  result.server.listen(0, '127.0.0.1'); await once(result.server, 'listening');
  const origin = `http://127.0.0.1:${result.server.address().port}`;
  const headers = { 'Content-Type': 'application/json', 'x-bridge-key': result.key, Origin: origin };
  t.after(async () => { result.shutdown(); result.server.close(); await once(result.server, 'close'); fs.rmSync(dir, { recursive: true, force: true }); });
  const input = { client: 'synthetic', conversation: 'fresh', requestId: randomUUID(), consent: true };
  const post = (value = input, override = {}) => fetch(`${origin}/__bridge/api/open`, { method: 'POST', headers, body: JSON.stringify(value), ...override });
  return { ...result, origin, headers, input, post, opens: () => opens, observed: () => observed };
}
test('page load carries exact publisher context but starts no client; questions and callbacks have no route', async t => {
  const f = await fixture(t);
  assert.equal((await fetch(f.origin)).status, 200);
  const config = await (await fetch(`${f.origin}/__bridge/api/config`)).json();
  assert.equal(config.context, readingContext(profile));
  assert.ok(config.context.endsWith(profile.prompt));
  assert.ok(config.context.includes('No question has been asked yet'));
  assert.equal(f.opens(), 0);
  for (const route of ['/tasks', '/tasks/old/export']) assert.equal((await fetch(`${f.origin}/__bridge/api${route}`, { method: 'POST', headers: f.headers, body: '{}' })).status, 404);
  assert.equal((await fetch(`${f.origin}/__bridge/agent/old/call`, { method: 'POST', headers: f.headers, body: '{}' })).status, 405);
  assert.equal((await f.post({ ...f.input, question: 'Do not collect this' })).status, 400);
  assert.equal((await f.post({ ...f.input, prompt: 'Do not accept arbitrary prompts' })).status, 400);
  assert.equal(f.opens(), 0);
});
test('loopback authority, same origin, explicit action, fresh conversation and detected client are required', async t => {
  const f = await fixture(t);
  assert.equal((await f.post(f.input, { headers: { 'Content-Type': 'application/json' } })).status, 403);
  assert.equal((await f.post(f.input, { headers: { ...f.headers, Origin: 'https://example.org' } })).status, 403);
  assert.equal((await f.post(f.input, { headers: { ...f.headers, 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
  assert.equal((await f.post({ ...f.input, consent: false })).status, 400);
  assert.equal((await f.post({ ...f.input, conversation: 'existing' })).status, 422);
  assert.equal((await f.post({ ...f.input, client: 'absent' })).status, 422);
  assert.equal((await f.post({ ...f.input, client: 'arbitrary-app' })).status, 422);
  assert.equal((await f.post({ ...f.input, requestId: '../../bad' })).status, 400);
  assert.equal((await fetch(`${f.origin}/.local/secret.json`)).status, 404);
  assert.equal((await fetch(`${f.origin}/__bridge/api/config?unexpected=1`)).status, 400);
  assert.equal(f.opens(), 0);
});
test('concurrent duplicate delivery opens one fresh draft, with only server-authored context and honest status', async t => {
  const f = await fixture(t);
  const responses = await Promise.all([f.post(), f.post()]);
  assert.deepEqual(responses.map(item => item.status), [202, 202]);
  const result = await responses[0].json();
  const { evidence, ...status } = result;
  assert.deepEqual(status, { requested: true, client: 'synthetic', conversation: 'fresh', requiresSend: true });
  assert.equal(evidence.work.context[0].text, readingContext(profile));
  assert.equal(evidence.work.context[1].mode, 'live');
  assert.deepEqual(evidence.acts, []); assert.deepEqual(evidence.participants, []);
  assert.deepEqual(evidence.relations, []);
  const report = await verify(evidence);
  assert.equal(report.checks.find(check => check.claim === 'record-integrity').status, 'supported');
  assert.equal(report.checks.find(check => check.claim === 'agent-execution-origin').status, 'not-established');
  const replay = await (await f.post()).json();
  assert.deepEqual(replay.evidence, evidence, 'same request returns exactly the same handoff evidence');
  assert.equal(f.opens(), 1);
  assert.deepEqual(f.observed(), { client: 'synthetic', conversation: 'fresh', prompt: readingContext(profile) });
  assert.equal((await f.post({ ...f.input, client: 'other' })).status, 409);
  assert.equal((await f.post()).status, 202); assert.equal(f.opens(), 1);
});
test('a failed native open is not automatically retried on repeated delivery', async t => {
  const f = await fixture(t, { failOpen: true });
  assert.equal((await f.post()).status, 422);
  assert.equal((await f.post()).status, 422); assert.equal(f.opens(), 1);
});
test('HTTP chunk boundaries preserve UTF-8 request validation and reject malformed encoding', async t => {
  const f = await fixture(t);
  async function chunked(bytes, split) {
    return new Promise((resolve, reject) => {
      const req = http.request(`${f.origin}/__bridge/api/open`, { method: 'POST', headers: f.headers }, res => {
        res.resume(); res.on('end', () => resolve(res.statusCode));
      });
      req.on('error', reject); req.write(bytes.subarray(0, split)); setImmediate(() => req.end(bytes.subarray(split)));
    });
  }
  const bytes = Buffer.from(JSON.stringify({ ...f.input, client: '意图 🌗' }));
  assert.equal(await chunked(bytes, bytes.indexOf(Buffer.from('意')) + 1), 422);
  assert.equal(await chunked(Buffer.from([0x7b, 0x22, 0xff, 0x22, 0x3a, 0x31, 0x7d]), 3), 400);
  assert.equal(f.opens(), 0);
});
