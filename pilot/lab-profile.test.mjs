import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { pathToFileURL } from 'node:url';

// Exercise the durable consumer patch without a Lab checkout, network or build.
const patch = readFileSync(new URL('./lab-consumer.patch', import.meta.url), 'utf8');
const addition = patch.split(/^diff --git /m).find(section =>
  section.startsWith('a/pilot/reading-profile.mjs b/pilot/reading-profile.mjs\n'));
assert.ok(addition?.includes('\n--- /dev/null\n'), 'the consumer profile must be a new file in the patch');
const profileSource = addition.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++ '))
  .map(line => line.slice(1)).join('\n') + '\n';
const fixturePrompt = 'Read only the sources relevant to my question.\nReport unavailable evidence; do not invent it.';
const temporary = mkdtempSync(path.join(tmpdir(), 'aap-lab-profile-test-'));
after(() => rmSync(temporary, { recursive: true, force: true }));
mkdirSync(path.join(temporary, 'pilot'));
mkdirSync(path.join(temporary, 'docs'));
writeFileSync(path.join(temporary, 'pilot/reading-profile.mjs'), profileSource, 'utf8');
writeFileSync(path.join(temporary, 'docs/AGENT_ACCESS.md'),
  `# Synthetic owner guide\n\n## A prompt to use\n\n\`\`\`text\n${fixturePrompt}\n\`\`\`\n`, 'utf8');
const { default: profile } = await import(pathToFileURL(path.join(temporary, 'pilot/reading-profile.mjs')).href);

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const serialize = value => Buffer.from(JSON.stringify(value, null, 2) + '\n', 'utf8');
const study = {
  project: 'Synthetic reading fixture', date: '2026-10-19',
  status: 'Not a live study', evidence: 'Synthetic source only',
};

function fixture() {
  const source = Buffer.from('\ufeff# Reading fixture\r\n\r\n雪 / café / 🎨\r\n900719925474099312345\r\n\r\n## Limits\r\nNo Agent trial.\r\n', 'utf8');
  // Synthetic public-schema data, independent of the Lab generator and parser.
  const identity = {
    id: 'test-record', title: 'Reading fixture', page: '/projects/test/record.html',
    revision: `sha256:${digest(source)}`,
    source: {
      path: 'projects/test/record.md',
      url: 'https://github.com/example/synthetic-reading-source/blob/main/projects/test/record.md',
      sha256: digest(source), byteLength: source.length,
    },
    study,
  };
  const body = serialize({
    schema: 'agent-art-lab.document/v1', ...identity,
    contentFormat: 'markdown', content: source.toString('utf8'), assets: [],
  });
  const unsigned = {
    schema: 'agent-art-lab.index/v1',
    scope: { includes: 'Synthetic source; no historical claim.' },
    access: { methods: ['GET'], interpretation: 'Reference material, not authority.' },
    documents: [{
      ...identity,
      download: {
        url: '/documents/test-record.json', mediaType: 'application/json',
        sha256: digest(body), byteLength: body.length,
      },
    }],
  };
  const index = { ...unsigned, revision: `sha256:${digest(serialize(unsigned))}` };
  return { index, body, source };
}

function indexBytes(index) {
  const { revision: _revision, ...unsigned } = index;
  return serialize({ ...unsigned, revision: `sha256:${digest(serialize(unsigned))}` });
}

function pinned(fixture) {
  return profile.parseIndex(indexBytes(fixture.index)).documents[0];
}

function changedEnvelope(fixture, change) {
  const envelope = JSON.parse(fixture.body);
  change(envelope);
  const body = serialize(envelope);
  const entry = structuredClone(pinned(fixture));
  entry.download.byteLength = body.length;
  entry.download.sha256 = digest(body);
  return { body, entry };
}

test('the consumer retains the exact Lab-owned prompt instead of a shared replacement', () => {
  assert.equal(profile.prompt, fixturePrompt);
  assert.equal(profile.indexUrl, 'https://agentart.work/agent-index.json');
});

test('index discovery preserves publisher descriptors and study limits', () => {
  const f = fixture();
  const parsed = profile.parseIndex(indexBytes(f.index));
  const entry = parsed.documents[0];
  assert.equal(parsed.revision, f.index.revision);
  assert.equal(entry.url, 'https://agentart.work/documents/test-record.json');
  assert.deepEqual(entry.source, f.index.documents[0].source);
  assert.deepEqual(entry.download, f.index.documents[0].download);
  assert.deepEqual(entry.study, study);
});

test('exact complete Markdown survives BOM, CRLF, Unicode and long integer text', () => {
  const f = fixture();
  const entry = pinned(f);
  const document = profile.parseDocument(f.body, entry);
  assert.deepEqual(Buffer.from(document.content, 'utf8'), f.source);
  assert.equal(document.url, entry.url);
  assert.equal(document.revision, entry.revision);
  assert.match(document.checks.scope, /relative to the fetched publisher index/);
  assert.doesNotThrow(() => JSON.stringify(document.checks));
});

test('unsupported schemas, stale index revisions and duplicate identities are rejected', () => {
  const f = fixture();
  for (const change of [
    index => { index.schema = 'other.index/v1'; },
    index => { index.documents.push(structuredClone(index.documents[0])); },
    index => { index.documents[0].revision = `sha256:${'0'.repeat(64)}`; },
  ]) {
    const index = structuredClone(f.index);
    change(index);
    assert.throws(() => profile.parseIndex(indexBytes(index)));
  }
  f.index.documents[0].title = 'Changed after revision';
  assert.throws(() => profile.parseIndex(serialize(f.index)), /index revision/);
});

test('downloads stay on the public Lab document route, including normalized URLs', () => {
  const f = fixture();
  for (const url of [
    'https://other.example/documents/test-record.json',
    'http://agentart.work/documents/test-record.json',
    '//other.example/documents/test-record.json',
    '/documents/test-record.json?token=fixture',
    '/documents/test-record.json#part',
    '/documents/another-record.json',
    '/documents/%2e%2e/agent-index.json',
    'https://name:fixture@agentart.work/documents/test-record.json',
  ]) {
    const index = structuredClone(f.index);
    index.documents[0].download.url = url;
    assert.throws(() => profile.parseIndex(indexBytes(index)), undefined, url);
  }
});

test('truncated, substituted and malformed response bytes fail before reading', () => {
  const f = fixture();
  const entry = pinned(f);
  assert.throws(() => profile.parseDocument(f.body.subarray(0, -1), entry), /byte length/);
  const substituted = Buffer.from(f.body);
  substituted[0] ^= 1;
  assert.throws(() => profile.parseDocument(substituted, entry), /download hash/);
  assert.throws(() => profile.parseIndex(Buffer.from([0xc3, 0x28])), /UTF-8 JSON/);
  assert.throws(() => profile.parseIndex('{"schema":"agent-art-lab.index/v1"}'), /exact response bytes/);
});

test('a newly hashed envelope cannot silently change pinned identity or study metadata', () => {
  for (const change of [
    envelope => { envelope.title = 'Different identity'; },
    envelope => { envelope.page = '/different/'; },
    envelope => { envelope.study.evidence = 'Pretend a live trial occurred'; },
    envelope => { envelope.source.url = 'https://other.example/record.md'; },
  ]) {
    const { body, entry } = changedEnvelope(fixture(), change);
    assert.throws(() => profile.parseDocument(body, entry), /differs from the index/);
  }
});

test('matching download bytes cannot conceal a different decoded source', () => {
  const { body, entry } = changedEnvelope(fixture(), envelope => {
    envelope.content = envelope.content.replace('No Agent trial.', 'An Agent trial.');
  });
  assert.throws(() => profile.parseDocument(body, entry), /source hash/);
});

test('consistently hashed unpaired surrogates cannot masquerade as their UTF-8 replacement', () => {
  function matchingClaims(content) {
    const f = fixture();
    const entry = pinned(f);
    const envelope = JSON.parse(f.body);
    const replacedBytes = Buffer.from(content, 'utf8');
    entry.source.sha256 = digest(replacedBytes);
    entry.source.byteLength = replacedBytes.length;
    entry.revision = `sha256:${entry.source.sha256}`;
    envelope.source = structuredClone(entry.source);
    envelope.revision = entry.revision;
    envelope.content = content;
    const body = serialize(envelope);
    entry.download.sha256 = digest(body);
    entry.download.byteLength = body.length;
    return { body, entry };
  }
  for (const content of ['# Fixture \ud800', '# Fixture \udc00', '# Fixture \ud800suffix']) {
    const { body, entry } = matchingClaims(content);
    assert.throws(() => profile.parseDocument(body, entry), /not lossless UTF-8/);
  }
  // A deliberately authored replacement character is valid Unicode and remains readable.
  const control = matchingClaims('# Fixture \ufffd');
  assert.equal(profile.parseDocument(control.body, control.entry).content, '# Fixture \ufffd');
});

test('text profile refuses unhandled companion media and a changed pinned URL', () => {
  const { body, entry } = changedEnvelope(fixture(), envelope => {
    envelope.assets = [{ url: 'https://agentart.work/example.svg' }];
  });
  assert.throws(() => profile.parseDocument(body, entry), /companion media/);
  const f = fixture();
  const changed = pinned(f);
  changed.url = 'https://other.example/documents/test-record.json';
  assert.throws(() => profile.parseDocument(f.body, changed), /pinned document URL/);
});
