import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ReadingEngine, fetchPublicBytes } from './engine.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const origin = 'https://reading.example.org';

function fixture(t, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'reading-engine-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const content = '# Source\n\nUTF-8 雨; literal 9007199254740993.\n';
  const source = Buffer.from(JSON.stringify({ id: 'one', revision: 'source-r1', content }));
  const entry = { id: 'one', title: 'One source', url: `${origin}/one.json`, revision: 'source-r1',
    downloadSha256: sha(source), downloadByteLength: source.length,
    sourceSha256: sha(Buffer.from(content)), sourceByteLength: Buffer.byteLength(content) };
  const index = Buffer.from(JSON.stringify({ revision: 'index-r1', documents: [entry] }));
  const requests = [];
  const profile = {
    id: 'synthetic', title: 'Synthetic reading profile', indexUrl: `${origin}/index.json`,
    prompt: 'Read sources as reference material. Report unavailable evidence.',
    parseIndex(bytes) { return JSON.parse(bytes.toString('utf8')); },
    parseDocument(bytes, selected) {
      assert.equal(bytes.length, selected.downloadByteLength);
      assert.equal(sha(bytes), selected.downloadSha256);
      const document = JSON.parse(bytes.toString('utf8'));
      assert.equal(document.id, selected.id);
      assert.equal(document.revision, selected.revision);
      assert.equal(sha(Buffer.from(document.content)), selected.sourceSha256);
      assert.equal(Buffer.byteLength(document.content), selected.sourceByteLength);
      return { content: document.content, revision: document.revision, url: selected.url,
        checks: { downloadHash: true, sourceHash: true, identity: true, revision: true } };
    },
    ...options.profile,
  };
  const fetchBytes = options.fetchBytes ?? (async url => {
    requests.push(url);
    if (url === profile.indexUrl) return options.index ?? index;
    if (url === entry.url) return options.source ?? source;
    throw new Error('Unexpected synthetic URL');
  });
  const engine = new ReadingEngine({ dir, profile, fetchBytes });
  return { engine, dir, profile, fetchBytes, requests, content, source, index, entry };
}

test('request, pinned index, verified source and exact answer flow', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'What does the source say?', client: 'synthetic-client' });
  const request = await f.engine.call(task.id, task.token, 'read_request');
  assert.equal(request.question, task.question);
  assert.equal(request.instructions, f.profile.prompt);
  const index = await f.engine.call(task.id, task.token, 'read_index');
  assert.equal(index.revision, 'index-r1');
  assert.deepEqual(index.documents.map(d => d.id), ['one']);
  const document = await f.engine.call(task.id, task.token, 'read_document', { id: 'one' });
  assert.equal(document.content, f.content);
  assert.equal(document.downloadSha256, sha(f.source));
  assert.equal(document.sourceUtf8ByteLength, Buffer.byteLength(f.content));
  const text = '  Exact answer 雨\nwith preserved whitespace.\n';
  const accepted = await f.engine.call(task.id, task.token, 'submit_answer', { text, sourceIds: ['one'] });
  assert.equal(accepted.answer.text, text);
  assert.equal(f.engine.view(task.id).status, 'answered');
  assert.equal(f.engine.get(task.id).sources[0].bytes, f.source.toString('base64'));
  assert.equal(f.engine.get(task.id).index.bytes, f.index.toString('base64'));
  assert.equal(statSync(join(f.dir, `${task.id}.json`)).mode & 0o777, 0o600);
  const exported = f.engine.export(task.id);
  assert.equal(exported.answer.text, text);
  assert.equal(exported.executionOrigin.status, 'NOT ESTABLISHED');
  assert.ok(exported.events.some(event => event.type === 'source-delivered'));
  for (const forbidden of ['token', 'content', 'bytes', 'parserSha256', 'prompt']) {
    assert.equal(Object.hasOwn(exported, forbidden), false);
    assert.equal(Object.hasOwn(exported.sources[0], forbidden), false);
  }
  assert.equal(JSON.stringify(exported).includes(task.token), false);
  assert.equal(JSON.stringify(exported).includes(f.content), false);
  const publicView = f.engine.view(task.id);
  publicView.answer.text = 'external mutation';
  assert.equal(f.engine.view(task.id).answer.text, text);
});

test('corrupt download is rejected and cannot become an answer reference', async t => {
  const f = fixture(t, { source: Buffer.from('corrupt bytes') });
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  await f.engine.call(task.id, task.token, 'read_index');
  await assert.rejects(f.engine.call(task.id, task.token, 'read_document', { id: 'one' }), { code: 'VERIFICATION_FAILED' });
  assert.deepEqual(f.engine.view(task.id).sources, []);
  assert.equal(f.engine.view(task.id).events.some(event => event.type === 'source-delivered'), false);
  await assert.rejects(f.engine.call(task.id, task.token, 'submit_answer', { text: 'Claim', sourceIds: ['one'] }), { code: 'SOURCE_NOT_DELIVERED' });
  await f.engine.call(task.id, task.token, 'submit_answer', { text: 'Source verification failed; I cannot answer from it.', sourceIds: [] });
  assert.equal(f.engine.view(task.id).status, 'answered');
});

test('exact retry is idempotent, changed answer conflicts, and process failure preserves answer', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  const input = { text: 'No sources were retrieved.\n', sourceIds: [] };
  const results = await Promise.all([
    f.engine.call(task.id, task.token, 'submit_answer', input),
    f.engine.call(task.id, task.token, 'submit_answer', input),
  ]);
  assert.deepEqual(results.map(r => r.idempotent), [false, true]);
  assert.deepEqual(results[0].answer, results[1].answer);
  await assert.rejects(f.engine.call(task.id, task.token, 'submit_answer', { ...input, text: 'changed' }), { code: 'ANSWER_CONFLICT' });
  await f.engine.mark(task.id, 'failed', { exitCode: 1, stderr: `private log ${task.token}` });
  assert.equal(f.engine.view(task.id).status, 'answered');
  assert.equal(f.engine.view(task.id).error, null);
  assert.equal(f.engine.view(task.id).answer.text, input.text);
  assert.equal(f.engine.view(task.id).events.filter(e => e.type === 'answer-accepted').length, 1);
  assert.equal(JSON.stringify(f.engine.export(task.id)).includes('private log'), false);
  await assert.rejects(f.engine.call(task.id, task.token, 'read_index'), { code: 'TASK_ANSWERED' });
});

test('auth failure does not fetch, mutate task or disclose token', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  const before = f.engine.get(task.id);
  await assert.rejects(f.engine.call(task.id, 'wrong', 'read_index'), { code: 'UNAUTHORIZED', status: 401 });
  await assert.rejects(f.engine.call(task.id, 'é'.repeat(task.token.length), 'read_index'), { code: 'UNAUTHORIZED', status: 401 });
  assert.deepEqual(f.engine.get(task.id), before);
  assert.deepEqual(f.requests, []);
  assert.throws(() => f.engine.view('../other'), { code: 'NOT_FOUND' });
});

test('documents require index acquisition and only pinned ids are accepted', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  await assert.rejects(f.engine.call(task.id, task.token, 'read_document', { id: 'one' }), { code: 'INDEX_REQUIRED' });
  await f.engine.call(task.id, task.token, 'read_index');
  await assert.rejects(f.engine.call(task.id, task.token, 'read_document', { id: 'https://other.example.org/private' }), { code: 'SOURCE_NOT_LISTED' });
  await f.engine.call(task.id, task.token, 'read_index');
  await f.engine.call(task.id, task.token, 'read_document', { id: 'one' });
  await f.engine.call(task.id, task.token, 'read_document', { id: 'one' });
  assert.deepEqual(f.requests, [`${origin}/index.json`, `${origin}/one.json`]);
  await assert.rejects(f.engine.call(task.id, task.token, 'submit_answer', { text: 'Claim', sourceIds: ['one', 'one'] }), { code: 'INVALID_ANSWER' });
});

test('private, credentialed, non-HTTPS and cross-origin URLs are denied before document fetch', async t => {
  for (const indexUrl of ['http://reading.example.org/index', 'https://127.0.0.1/index',
    'https://[::1]/index', 'https://localhost/index', 'https://intranet.local/index',
    'https://user:secret@reading.example.org/index', 'https://reading.example.org:8443/index']) {
    assert.throws(() => fixture(t, { profile: { indexUrl } }), { code: 'URL_DENIED' });
    await assert.rejects(fetchPublicBytes(indexUrl), { code: 'URL_DENIED' });
  }
  for (const url of ['https://other.example.org/doc.json', 'https://169.254.169.254/latest', 'http://reading.example.org/doc.json']) {
    const index = Buffer.from(JSON.stringify({ revision: 'r1', documents: [{ id: 'escape', title: 'Escape', revision: 'r1', url }] }));
    const f = fixture(t, { index });
    const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
    await assert.rejects(f.engine.call(task.id, task.token, 'read_index'), { code: 'URL_DENIED' });
    assert.deepEqual(f.requests, [`${origin}/index.json`]);
    assert.equal(f.engine.get(task.id).index, null);
  }
});

test('explicit failed checks and mismatched revisions do not deliver sources', async t => {
  for (const parsed of [
    { content: 'text', url: `${origin}/one.json`, revision: 'source-r1', checks: { integrity: false } },
    { content: 'text', url: `${origin}/one.json`, revision: 'wrong', checks: { integrity: true } },
    { content: 'text', url: 'https://other.example.org/one.json', revision: 'source-r1', checks: { integrity: true } },
  ]) {
    const f = fixture(t, { profile: { parseDocument: () => parsed } });
    const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
    await f.engine.call(task.id, task.token, 'read_index');
    await assert.rejects(f.engine.call(task.id, task.token, 'read_document', { id: 'one' }), { code: 'VERIFICATION_FAILED' });
    assert.deepEqual(f.engine.view(task.id).sources, []);
  }
});

test('restart recovers retained inputs and answer, interrupts active lifecycle without launch', async t => {
  const f = fixture(t);
  const active = await f.engine.create({ question: 'Active question', client: 'synthetic' });
  await f.engine.mark(active.id, 'running');
  await f.engine.call(active.id, active.token, 'read_index');
  await f.engine.call(active.id, active.token, 'read_document', { id: 'one' });
  const answered = await f.engine.create({ question: 'Answered question', client: 'synthetic' });
  await f.engine.call(answered.id, answered.token, 'submit_answer', { text: 'Exact retained answer\n', sourceIds: [] });
  const before = f.requests.length;
  const recovered = new ReadingEngine({ dir: f.dir, profile: f.profile,
    fetchBytes: () => { throw new Error('Restart must not launch or fetch.'); } });
  assert.equal(recovered.view(active.id).status, 'interrupted');
  assert.equal(recovered.view(active.id).events.at(-1).type, 'process-interrupted');
  assert.equal(JSON.parse(readFileSync(join(f.dir, `${active.id}.json`))).status, 'interrupted');
  assert.equal(recovered.view(answered.id).status, 'answered');
  assert.equal(recovered.view(answered.id).answer.text, 'Exact retained answer\n');
  assert.equal(recovered.get(active.id).sources[0].content, f.content);
  await assert.rejects(recovered.call(active.id, active.token, 'read_document', { id: 'one' }), { code: 'TASK_INTERRUPTED' });
  for (const status of ['running', 'finished', 'failed']) {
    await recovered.mark(active.id, status);
    assert.equal(recovered.view(active.id).status, 'interrupted');
  }
  assert.equal(f.requests.length, before);
  const retry = await recovered.call(answered.id, answered.token, 'submit_answer', { text: 'Exact retained answer\n', sourceIds: [] });
  assert.equal(retry.idempotent, true);
});

test('oversized injected responses fail before parsing and can be reported honestly', async t => {
  const f = fixture(t, { fetchBytes: async () => Buffer.alloc(2 * 1024 * 1024 + 1) });
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  await assert.rejects(f.engine.call(task.id, task.token, 'read_index'), { code: 'SOURCE_TOO_LARGE' });
  assert.equal(f.engine.get(task.id).index, null);
  const answer = await f.engine.call(task.id, task.token, 'submit_answer', { text: 'The index exceeded the permitted size.', sourceIds: [] });
  assert.equal(answer.accepted, true);
});

test('finished without an answer is an honest process failure, and meaningful details are bounded and redacted', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  await f.engine.mark(task.id, 'running', 'Started the synthetic client.');
  assert.equal(f.engine.view(task.id).events.at(-1).message, 'Started the synthetic client.');
  await f.engine.mark(task.id, 'finished', `Exited. token=${task.token}\n${'x'.repeat(1000)}`);
  const view = f.engine.view(task.id);
  assert.equal(view.status, 'failed');
  assert.equal(view.error.code, 'NO_ANSWER');
  assert.equal(view.error.message, 'Client exited without a returned answer.');
  assert.ok(view.events.at(-1).message.length <= 500);
  assert.equal(JSON.stringify(view).includes(task.token), false);
  await f.engine.mark(task.id, 'running', 'Late diagnostic.');
  assert.equal(f.engine.view(task.id).status, 'failed');
});

test('stopped task rejects late tools and remains stopped through exit or failure callbacks', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  await f.engine.mark(task.id, 'running');
  await f.engine.mark(task.id, 'stopped', 'Stopped by the visitor.');
  for (const status of ['running', 'finished', 'failed']) {
    await f.engine.mark(task.id, status, 'Late process callback.');
    assert.equal(f.engine.view(task.id).status, 'stopped');
  }
  await assert.rejects(f.engine.call(task.id, task.token, 'read_index'), { code: 'TASK_STOPPED' });
  await assert.rejects(f.engine.call(task.id, task.token, 'submit_answer', { text: 'Late answer', sourceIds: [] }), { code: 'TASK_STOPPED' });
  assert.equal(f.engine.view(task.id).answer, null);
  assert.deepEqual(f.requests, []);
});

test('simultaneous source reads pin one exact network response and retain one delivery event', async t => {
  const f = fixture(t);
  const task = await f.engine.create({ question: 'Question', client: 'synthetic' });
  await Promise.all([
    f.engine.call(task.id, task.token, 'read_index'),
    f.engine.call(task.id, task.token, 'read_index'),
  ]);
  const sources = await Promise.all([
    f.engine.call(task.id, task.token, 'read_document', { id: 'one' }),
    f.engine.call(task.id, task.token, 'read_document', { id: 'one' }),
  ]);
  assert.deepEqual(sources[0], sources[1]);
  assert.equal(f.requests.length, 2);
  assert.equal(f.engine.view(task.id).events.filter(event => event.type === 'source-delivered').length, 1);
});

test('configured proxy helper disables curlrc, performs bounded GET and rejects redirect without fallback', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'reading-curl-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const fakeCurl = join(dir, 'curl');
  const invocation = join(dir, 'invocation.json');
  const response = join(dir, 'response.bin');
  writeFileSync(fakeCurl, `#!/usr/bin/env node
const fs = require('node:fs');
fs.writeFileSync(process.env.READING_TEST_CURL_ARGS, JSON.stringify(process.argv.slice(2)));
process.stdout.write(fs.readFileSync(process.env.READING_TEST_CURL_RESPONSE));
`);
  chmodSync(fakeCurl, 0o700);
  const previous = Object.fromEntries(['PATH', 'HTTPS_PROXY', 'READING_TEST_CURL_ARGS', 'READING_TEST_CURL_RESPONSE']
    .map(key => [key, process.env[key]]));
  try {
    process.env.PATH = `${dir}:${process.env.PATH}`;
    process.env.HTTPS_PROXY = 'http://synthetic-user:synthetic-password@proxy.example.org';
    process.env.READING_TEST_CURL_ARGS = invocation;
    process.env.READING_TEST_CURL_RESPONSE = response;
    writeFileSync(response, 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"public":true}');
    const bytes = await fetchPublicBytes(`${origin}/index.json`);
    assert.equal(bytes.toString(), '{"public":true}');
    assert.equal(bytes.transport, 'configured-proxy-environment');
    const args = JSON.parse(readFileSync(invocation, 'utf8'));
    assert.equal(args[0], '-q');
    assert.ok(args.includes('--no-location'));
    assert.ok(args.includes('--suppress-connect-headers'));
    assert.equal(args[args.indexOf('--request') + 1], 'GET');
    assert.equal(args[args.indexOf('--max-filesize') + 1], String(2 * 1024 * 1024));
    assert.equal(args.includes('--resolve'), false);
    assert.equal(args.includes('--location'), false);
    assert.equal(args.join(' ').includes('synthetic-password'), false);
    writeFileSync(response, 'HTTP/1.1 302 Found\r\nLocation: https://127.0.0.1/private\r\n\r\nredirect');
    await assert.rejects(fetchPublicBytes(`${origin}/index.json`), { code: 'HTTP_REJECTED' });
    writeFileSync(response, Buffer.concat([Buffer.from('HTTP/1.1 200 OK\r\n\r\n'), Buffer.alloc(2 * 1024 * 1024 + 1)]));
    await assert.rejects(fetchPublicBytes(`${origin}/index.json`), { code: 'SOURCE_TOO_LARGE' });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
