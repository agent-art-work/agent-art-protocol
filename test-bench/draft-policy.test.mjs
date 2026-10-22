import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EXACT_POLICY, LAB_AX_POLICY, LAB_AX_PRESENTATION_SHA256, validateDraftPolicy, compareDraftText } from './draft-policy.mjs';

const work = JSON.parse(readFileSync(new URL('./lab-work.json', import.meta.url), 'utf8'));
const canonical = work.context.find(item => item.id === 'reading-invitation').text;
const collapsed = canonical.replaceAll('\n\n', '\n');
const digest = text => createHash('sha256').update(text, 'utf8').digest('hex');
const manifest = {
  id: 'synthetic-draft-policy-check',
  sdkVersion: '0.1.4',
  archiveSha256: 'e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430',
  contextSha256: 'ebef0c1f9ce1c03a6028f840086b9ff079cb3fc2df53d79e6053b9b4f6a8bde6',
  contextBytes: 983,
  workId: 'https://agentart.work/#reading',
  workVersion: '1',
};

test('exact policy preserves existing validated input choices; policies must be named', () => {
  assert.equal(validateDraftPolicy(EXACT_POLICY, { ...manifest, workId: 'https://public.example/#reading' }), EXACT_POLICY);
  for (const policy of [undefined, null, '', 'relaxed', {}, new String(EXACT_POLICY), true]) {
    assert.throws(() => validateDraftPolicy(policy, manifest), /Unknown draft comparison policy/u);
    if (policy !== undefined) assert.throws(() => compareDraftText(canonical, canonical, { policy }), /Unknown draft comparison policy/u);
  }
});

test('Lab presentation policy requires every public fixture pin without coercion', () => {
  assert.equal(validateDraftPolicy(LAB_AX_POLICY, manifest), LAB_AX_POLICY);
  const different = { sdkVersion: '0.1.5', archiveSha256: 'a'.repeat(64), contextSha256: 'b'.repeat(64), contextBytes: 982,
    workId: 'https://public.example/#reading', workVersion: 1 };
  for (const [key, value] of Object.entries(different)) {
    assert.throws(() => validateDraftPolicy(LAB_AX_POLICY, { ...manifest, [key]: value }), /pinned manifest/u);
    const missing = { ...manifest }; delete missing[key];
    assert.throws(() => validateDraftPolicy(LAB_AX_POLICY, missing), /pinned manifest/u);
  }
  assert.throws(() => validateDraftPolicy(LAB_AX_POLICY, null), /pinned manifest/u);
});

test('exact comparison reports only bounded facts with precise UTF-8 and code-point counts', () => {
  const sample = 'A🌙\nB';
  const comparison = compareDraftText(sample, sample);
  assert.deepEqual(comparison, {
    policy: EXACT_POLICY, exactMatches: true, presentationMatches: true, basis: 'exact',
    canonicalSha256: digest(sample), exposedSha256: digest(sample), canonicalBytes: 7, exposedBytes: 7,
    canonicalCharacters: 4, exposedCharacters: 4, canonicalNewlines: 1, exposedNewlines: 1,
  });
  assert.equal(JSON.stringify(comparison).includes(sample), false);
});

test('exact policy does not accept the Lab accessibility paragraph collapse', () => {
  const comparison = compareDraftText(canonical, collapsed);
  assert.equal(comparison.exactMatches, false);
  assert.equal(comparison.presentationMatches, false);
  assert.equal(comparison.basis, 'different');
});

test('pinned Lab policy distinguishes exact equality from the single observed paragraph presentation', () => {
  const exact = compareDraftText(canonical, canonical, { policy: LAB_AX_POLICY });
  assert.equal(exact.exactMatches, true); assert.equal(exact.presentationMatches, true); assert.equal(exact.basis, 'exact');
  const comparison = compareDraftText(canonical, collapsed, { policy: LAB_AX_POLICY });
  assert.equal(comparison.exactMatches, false);
  assert.equal(comparison.presentationMatches, true);
  assert.equal(comparison.basis, 'paragraph-blank-lines-collapsed');
  assert.equal(comparison.canonicalSha256, manifest.contextSha256);
  assert.equal(comparison.exposedSha256, LAB_AX_PRESENTATION_SHA256);
  assert.equal(digest(collapsed), LAB_AX_PRESENTATION_SHA256);
  assert.equal(comparison.canonicalBytes, 983);
  assert.equal(comparison.exposedBytes, 979);
  assert.equal(comparison.canonicalCharacters - comparison.exposedCharacters, 4);
  assert.equal(comparison.canonicalNewlines, 8);
  assert.equal(comparison.exposedNewlines, 4);
});

test('Lab presentation policy never tolerates changed policy, URL, spacing, Unicode or line endings', () => {
  const alternatives = [
    canonical.replace('GET the index', 'Skip the index'),
    collapsed.replace('agentart.work', 'example.org'),
    `${collapsed} `, ` ${collapsed}`, `${collapsed}\n`,
    collapsed.replace('With permitted', 'With  permitted'),
    canonical.replaceAll('\n', '\r\n'), collapsed.replaceAll('\n', '\r\n'),
    canonical.replaceAll('\n\n', ''), canonical.replace('\n\n', '\n'),
    collapsed.replace('Verify', 'Ｖerify'), collapsed.replace('UTF-8', 'UTF‑8'),
  ];
  for (const exposed of alternatives) {
    const comparison = compareDraftText(canonical, exposed, { policy: LAB_AX_POLICY });
    assert.equal(comparison.exactMatches, false);
    assert.equal(comparison.presentationMatches, false);
    assert.equal(comparison.basis, 'different');
  }
});

test('Lab comparison pins actual canonical bytes even independently of manifest validation', () => {
  assert.throws(() => compareDraftText('Different public context', 'Different public context', { policy: LAB_AX_POLICY }), /pinned canonical text/u);
  assert.throws(() => compareDraftText(collapsed, collapsed, { policy: LAB_AX_POLICY }), /pinned canonical text/u);
});

test('invalid strings and oversized UTF-8 are rejected without retaining raw input', () => {
  const bad = [undefined, null, 3, {}, new String('text'), '', '\ud800', '\udfff', `sensitive-\ud800`, 'a'.repeat(1_048_577), '🌙'.repeat(262_145)];
  for (const value of bad) {
    assert.throws(() => compareDraftText(value, 'safe'), error => error.message === 'Draft comparison requires nonempty bounded well-formed UTF-8 text.');
    assert.throws(() => compareDraftText('safe', value), error => error.message === 'Draft comparison requires nonempty bounded well-formed UTF-8 text.');
  }
  const boundary = 'a'.repeat(1_048_576);
  assert.equal(compareDraftText(boundary, boundary).exactMatches, true);
});
