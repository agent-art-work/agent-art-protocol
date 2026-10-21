import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadBenchInputs, selectPackagePin } from './inputs.mjs';

const source = JSON.parse(fs.readFileSync(new URL('./lab-source.json', import.meta.url), 'utf8'));
const candidate = { sdkVersion: '0.1.3', archiveSha256: 'a'.repeat(64), qualification: 'pilot/reading-sdk-013/QUALIFICATION.json', contextSha256: source.contextSha256, workSha256: source.workSha256 };

test('a fresh candidate selects its own qualification without changing historical invitation provenance', () => {
  assert.equal(selectPackagePin(source).sdkVersion, '0.1.2');
  assert.deepEqual(selectPackagePin(source, candidate), { sdkVersion: '0.1.3', archiveSha256: 'a'.repeat(64), qualification: candidate.qualification });
  assert.equal(source.sdkVersion, '0.1.2');
  assert.equal(source.archiveSha256, '0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5');
});

test('candidate pins reject changed invitation hashes and qualification path escapes', () => {
  assert.throws(() => selectPackagePin(source, { ...candidate, contextSha256: 'b'.repeat(64) }), /canonical/);
  assert.throws(() => selectPackagePin(source, { ...candidate, workSha256: 'b'.repeat(64) }), /canonical/);
  assert.throws(() => selectPackagePin(source, { ...candidate, qualification: '../private.json' }), /Invalid/);
  assert.throws(() => selectPackagePin(source, { ...candidate, archiveSha256: 'unqualified' }), /Invalid/);
});

test('the immutable 0.1.2 archive can still be checked explicitly', async () => {
  const inputs = await loadBenchInputs({ packagePin: null, environment: { os: { name: 'synthetic', version: '1' }, apps: {} } });
  assert.equal(inputs.manifest.sdkVersion, '0.1.2');
  assert.equal(inputs.manifest.archiveSha256, source.archiveSha256);
  assert.equal(inputs.manifest.contextSha256, source.contextSha256);
  assert.equal(inputs.context.length > 0, true);
});
