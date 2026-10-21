// Offline package qualification only. Browser and real-client results stay separate.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareSDK } from '../../scripts/sdk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const oldArchive = path.join(ROOT, '.local/sdk/agent-art-protocol-0.1.2.tgz');
const oldDigest = '0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5';
assert.equal(sha(fs.readFileSync(oldArchive)), oldDigest, 'Historical 0.1.2 archive changed.');
const packed = prepareSDK();
assert.equal(packed.version, '0.1.3');
const manifest = JSON.parse(fs.readFileSync(path.join(packed.packageDir, 'package.json'), 'utf8'));
assert.equal(manifest.private, true);
const owned = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-013-package-'));
try {
  const unpack = spawnSync('tar', ['-xzf', packed.archive, '-C', owned], { encoding: 'utf8', shell: false });
  assert.equal(unpack.status, 0, 'Candidate archive could not be inspected.');
  const packagedFiles = {};
  for (const name of ['package.json', ...manifest.files]) {
    assert.equal(path.basename(name), name);
    const bytes = fs.readFileSync(path.join(owned, 'package', name));
    assert.deepEqual(bytes, fs.readFileSync(path.join(packed.packageDir, name)), `Installed ${name} differs.`);
    assert.deepEqual(bytes, fs.readFileSync(path.join(ROOT, 'protocol', name)), `Source ${name} differs.`);
    packagedFiles[name] = sha(bytes);
  }
  const lockBytes = fs.readFileSync(path.resolve(packed.packageDir, '../../..', 'package-lock.json'));
  const lock = JSON.parse(lockBytes);
  const lockIntegrity = `sha512-${createHash('sha512').update(fs.readFileSync(packed.archive)).digest('base64')}`;
  assert.equal(lock.packages['node_modules/@agent-art/protocol'].integrity, lockIntegrity);
  assert.equal(lock.packages['node_modules/@agent-art/protocol'].version, '0.1.3');
  const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'test-bench/lab-source.json'), 'utf8'));
  const qualification = {
    schema: 'agent-art.reading-sdk-browser-qualification.v1', date: '2026-10-21',
    status: 'private-local-0.1.3-package-verified-browser-pending',
    package: { name: manifest.name, version: manifest.version, private: true,
      archive: path.relative(ROOT, packed.archive), archiveSha256: packed.hash,
      packagedFiles, installedAndSourceMatchArchive: true,
      installedArchiveFilesChecked: Object.keys(packagedFiles).length,
      installLockSha256: sha(lockBytes), lockIntegrity },
    reading: { workSha256: source.workSha256, contextSha256: source.contextSha256, contextBytes: source.contextBytes },
    historical012ArchiveUnchanged: true, realClientResults: 'not-run',
    limits: ['Package identity and byte equality only; browser and actual-site checks require separate results.',
      'No native Agent launch, Send, source reading, publication or deployment.'],
  };
  fs.writeFileSync(path.join(ROOT, 'pilot/reading-sdk-013/QUALIFICATION.json'), JSON.stringify(qualification, null, 2) + '\n');
  fs.writeFileSync(path.join(ROOT, 'test-bench/sdk-candidate.json'), JSON.stringify({
    sdkVersion: packed.version, archiveSha256: packed.hash,
    qualification: 'pilot/reading-sdk-013/QUALIFICATION.json',
    contextSha256: source.contextSha256, workSha256: source.workSha256,
  }, null, 2) + '\n');
  assert.equal(sha(fs.readFileSync(oldArchive)), oldDigest);
  console.log(JSON.stringify({ version: packed.version, archive: path.relative(ROOT, packed.archive), sha256: packed.hash,
    packagedFiles: Object.keys(packagedFiles).length, historical012ArchiveUnchanged: true }));
} finally { fs.rmSync(owned, { recursive: true, force: true }); }
