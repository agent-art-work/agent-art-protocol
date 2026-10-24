// Build and qualify a separate archive; never mutate the retained 0.1.4 SDK.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../..');
export const output = path.join(ROOT, '.local/releases/0.1.5-alpha.2');
export const sha = data => createHash('sha256').update(data).digest('hex');
export const VERSION = '0.1.5-alpha.2';
export const BASE_SHA = 'e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'pilot/reading-sdk-014/QUALIFICATION.json')));
const manifest = JSON.parse(fs.readFileSync(path.join(HERE, 'package.json')));
assert.equal(manifest.name, '@agent-art/protocol');
assert.equal(manifest.version, '0.1.5-alpha.2');
assert.equal(manifest.private, true);
assert.equal(manifest.license, 'MIT');
assert.equal(base.package.archiveSha256, 'e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430');
const retained = path.join(ROOT, '.local/sdk/archives', `${base.package.archiveSha256}.tgz`);
const hasRetainedArchive = fs.existsSync(retained);
if (hasRetainedArchive) assert.equal(sha(fs.readFileSync(retained)), base.package.archiveSha256);
for (const [name, digest] of Object.entries(base.package.packagedFiles)) {
  assert.equal(path.basename(name), name);
  assert.equal(sha(fs.readFileSync(path.join(ROOT, 'protocol', name))), digest, `Retained SDK source changed: ${name}`);
}
fs.mkdirSync(output, { recursive: true });
const temp = fs.mkdtempSync(path.join(output, '.prepare-'));
const userConfig = path.join(temp, 'user.npmrc'), globalConfig = path.join(temp, 'global.npmrc');
fs.writeFileSync(userConfig, ''); fs.writeFileSync(globalConfig, '');
const env = { ...process.env, npm_config_userconfig: userConfig, npm_config_globalconfig: globalConfig,
  npm_config_offline: 'true', npm_config_ignore_scripts: 'true', npm_config_audit: 'false',
  npm_config_fund: 'false', npm_config_cache: path.join(output, 'npm-cache') };
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', shell: false, timeout: 120000 });
  if (result.error || result.status !== 0) {
    fs.writeFileSync(path.join(output, 'last-check.log'), `${result.stdout || ''}\n${result.stderr || ''}`);
    throw Error(`${path.basename(command)} check failed; inspect the ignored last-check.log. No network fallback or install scripts were enabled.`);
  }
  return result.stdout;
}
function immutable(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) assert.deepEqual(fs.readFileSync(file), bytes, 'An immutable release artifact changed.');
  else fs.writeFileSync(file, bytes, { flag: 'wx' });
}
try {
  const stage = path.join(temp, 'package'); fs.mkdirSync(stage);
  for (const name of manifest.files) {
    assert.equal(path.basename(name), name);
    const source = ['reading-ui.mjs', 'reading.css'].includes(name) ? path.join(HERE, name) : name === 'LICENSE' ? path.join(ROOT, name)
      : name === 'README.md' ? path.join(HERE, name) : path.join(ROOT, 'protocol', name);
    fs.copyFileSync(source, path.join(stage, name));
  }
  fs.copyFileSync(path.join(HERE, 'package.json'), path.join(stage, 'package.json'));
  const packed = JSON.parse(run('npm', ['pack', '--offline', '--ignore-scripts', '--json', '--pack-destination', temp], stage))[0];
  assert.equal(packed.filename, 'agent-art-protocol-0.1.5-alpha.2.tgz');
  const bytes = fs.readFileSync(path.join(temp, packed.filename)), digest = sha(bytes);
  const archive = path.join(output, 'archives', `${digest}.tgz`);
  immutable(archive, bytes);
  immutable(path.join(output, packed.filename), bytes);
  const consumer = path.join(output, 'consumers', digest); fs.mkdirSync(consumer, { recursive: true });
  if (!fs.existsSync(path.join(consumer, 'package.json'))) fs.writeFileSync(path.join(consumer, 'package.json'), '{"private":true,"type":"module"}\n');
  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--save-exact', `../../archives/${digest}.tgz`], consumer);
  const installed = path.join(consumer, 'node_modules/@agent-art/protocol');
  const members = run('tar', ['-tzf', archive], ROOT).trim().split('\n').sort();
  const names = ['package.json', ...manifest.files].sort();
  assert.deepEqual(members, names.map(name => `package/${name}`).sort(), 'Unexpected archive content.');
  const unpack = path.join(temp, 'unpacked'); fs.mkdirSync(unpack);
  run('tar', ['-xzf', archive, '-C', unpack], ROOT);
  const files = {};
  for (const name of names) {
    const actual = fs.readFileSync(path.join(unpack, 'package', name));
    assert.deepEqual(actual, fs.readFileSync(path.join(stage, name)));
    assert.deepEqual(actual, fs.readFileSync(path.join(installed, name)));
    files[name] = sha(actual);
  }
  const runtime = names.filter(name => !['package.json', 'README.md', 'LICENSE'].includes(name));
  const unchanged = runtime.filter(name => !['reading-ui.mjs', 'reading.css'].includes(name));
  for (const name of unchanged) assert.equal(files[name], base.package.packagedFiles[name]);
  const lockBytes = fs.readFileSync(path.join(consumer, 'package-lock.json'));
  const dependency = JSON.parse(lockBytes).packages['node_modules/@agent-art/protocol'];
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  assert.equal(dependency.version, manifest.version); assert.equal(dependency.integrity, integrity);
  const tests = path.join(consumer, 'release-tests'); fs.mkdirSync(tests, { recursive: true });
  const testFiles = ['records.test.mjs', 'clients.test.mjs', 'reading.test.mjs'];
  for (const file of testFiles) {
    let source = fs.readFileSync(path.join(ROOT, 'protocol/test', file), 'utf8');
    for (const name of ['index.mjs', 'clients.mjs', 'reading.mjs']) {
      source = source.replaceAll(`'../${name}'`, `'../node_modules/@agent-art/protocol/${name}'`);
    }
    fs.writeFileSync(path.join(tests, file), source);
  }
  const tap = run(process.execPath, ['--test', ...testFiles.map(file => path.join(tests, file))], consumer);
  fs.writeFileSync(path.join(output, 'runtime-tests.tap'), tap);
  const testCount = Number(/# tests (\d+)/.exec(tap)?.[1]);
  assert(testCount > 0 && /# fail 0\b/.test(tap));
  fs.copyFileSync(path.join(HERE, 'installed-check.mjs'), path.join(consumer, 'installed-check.mjs'));
  run(process.execPath, ['installed-check.mjs'], consumer);
  fs.copyFileSync(path.join(ROOT, 'protocol/test/type-consumer.mts'), path.join(consumer, 'type-consumer.mts'));
  const tsc = process.env.AAP_RELEASE_TSC
    || path.join(ROOT, '.local/reading-v010-inshell/node_modules/typescript/lib/tsc.js');
  let types = 'pending-local-compiler-unavailable';
  if (fs.existsSync(tsc)) {
    run(process.execPath, [tsc, '--strict', '--noEmit', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--lib', 'ES2022,DOM', 'type-consumer.mts'], consumer);
    types = 'passed';
  }
  const report = {
    schema: 'agent-art.release-qualification.v1', version: manifest.version, status: 'package-checked-browser-pending',
    package: { name: manifest.name, version: manifest.version, license: manifest.license, private: true,
      archive: path.relative(ROOT, archive), archiveSha256: digest, files, installedFilesChecked: names.length,
      consumer: path.relative(ROOT, consumer), lockSha256: sha(lockBytes), lockIntegrity: integrity },
    runtime: { base: '0.1.4', unchangedFiles: unchanged, changedFiles: ['reading-ui.mjs', 'reading.css'], filesChecked: runtime.length, testsPassed: testCount,
      installedExportsAndReceipts: 'passed', types },
    retained014ArchiveUnchanged: hasRetainedArchive
      ? sha(fs.readFileSync(retained)) === base.package.archiveSha256 : 'not-present-in-this-checkout',
    browser: { status: 'pending' }, realClients: { status: 'not-run-for-this-archive' },
    limits: ['Local candidate only; no visibility, Git tag, release, registry publication or deployment.',
      'Seven runtime/type files match 0.1.4; UI and CSS changed. Historical findings do not qualify this archive.',
      'Package checks establish neither source reading nor Agent execution or intentional participation.'],
  };
  fs.writeFileSync(path.join(output, 'candidate.json'), JSON.stringify({ version: VERSION, archive: path.relative(ROOT, archive), archiveSha256: digest, packageDir: path.relative(ROOT, installed), packagedFiles: files, lockSha256: sha(lockBytes), lockIntegrity: integrity, baseArchiveSha256: BASE_SHA }, null, 2) + '\n');
  fs.writeFileSync(path.join(HERE, 'QUALIFICATION.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ version: manifest.version, archive: path.relative(ROOT, archive), sha256: digest,
    packagedFiles: names.length, runtimeTests: testCount, types, sdk014Unchanged: report.retained014ArchiveUnchanged }));
} finally { fs.rmSync(temp, { recursive: true, force: true }); }

}
