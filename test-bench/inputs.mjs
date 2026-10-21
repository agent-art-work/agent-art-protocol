import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const sha256 = value => createHash('sha256').update(value).digest('hex');

function command(binary, args) {
  const result = spawnSync(binary, args, { encoding: 'utf8', shell: false, timeout: 3000 });
  return result.status === 0 ? result.stdout.trim() : undefined;
}
function bundle(name, expected) {
  const file = `/Applications/${name}.app/Contents/Info.plist`;
  if (!fs.existsSync(file)) return undefined;
  const read = key => command('/usr/libexec/PlistBuddy', ['-c', `Print :${key}`, file]);
  if (read('CFBundleIdentifier') !== expected) return undefined;
  const version = read('CFBundleShortVersionString');
  return version ? { version } : undefined;
}
export function inspectEnvironment() {
  const environment = { os: { name: os.platform(), version: os.release() }, apps: {} };
  if (os.platform() === 'darwin') {
    environment.os = { name: 'macOS', version: command('/usr/bin/sw_vers', ['-productVersion']) || os.release() };
    const chrome = bundle('Google Chrome', 'com.google.Chrome');
    if (chrome) environment.browser = { name: 'Google Chrome', version: chrome.version };
    const claude = bundle('Claude', 'com.anthropic.claudefordesktop');
    const codex = bundle('ChatGPT', 'com.openai.codex') || bundle('Codex', 'com.openai.codex');
    if (claude) environment.apps['claude-app'] = claude;
    if (codex) environment.apps['codex-app'] = codex;
  }
  return environment;
}

/** Select a new package without rewriting the invitation's historical source pin. */
export function selectPackagePin(source, candidate) {
  const pin = candidate || { sdkVersion: source.sdkVersion, archiveSha256: source.archiveSha256, qualification: 'pilot/reading-sdk-012/QUALIFICATION.json' };
  if (!/^0\.1\.\d+$/.test(pin.sdkVersion) || !/^[a-f0-9]{64}$/.test(pin.archiveSha256)
      || !/^pilot\/reading-sdk-[a-z0-9-]+\/QUALIFICATION\.json$/.test(pin.qualification)) throw Error('Invalid bench SDK candidate pin.');
  if (candidate && (candidate.contextSha256 !== source.contextSha256 || candidate.workSha256 !== source.workSha256)) throw Error('Candidate package must retain the canonical Lab invitation and Work.');
  return { sdkVersion: pin.sdkVersion, archiveSha256: pin.archiveSha256, qualification: pin.qualification };
}

/** Read immutable public inputs; never build Lab, fetch sources or launch an app. */
export async function loadBenchInputs({ archive, packageDir, environment, packagePin } = {}) {
  const source = JSON.parse(fs.readFileSync(path.join(HERE, 'lab-source.json'), 'utf8'));
  const candidatePath = path.join(HERE, 'sdk-candidate.json');
  const candidate = packagePin === null ? undefined : packagePin || (fs.existsSync(candidatePath) ? JSON.parse(fs.readFileSync(candidatePath, 'utf8')) : undefined);
  const pin = selectPackagePin(source, candidate);
  const workBytes = fs.readFileSync(path.join(HERE, 'lab-work.json'));
  if (sha256(workBytes) !== source.workSha256) throw Error('The pinned Lab Work changed; update its source record explicitly.');
  const work = JSON.parse(workBytes);
  const context = work.context.find(item => item.id === 'reading-invitation')?.text;
  if (typeof context !== 'string' || sha256(context) !== source.contextSha256 || Buffer.byteLength(context) !== source.contextBytes) throw Error('Lab invitation bytes do not match the source pin.');
  const archivePath = path.resolve(archive || path.join(ROOT, '.local/sdk/archives', `${pin.archiveSha256}.tgz`));
  if (!fs.existsSync(archivePath)) throw Error('Prepare the offline SDK first: npm run sdk:prepare');
  if (sha256(fs.readFileSync(archivePath)) !== pin.archiveSha256) throw Error('SDK archive does not match this bench pin. Qualify a new SDK explicitly.');
  const installed = path.resolve(packageDir || path.join(ROOT, '.local/sdk/consumers', pin.archiveSha256, 'node_modules/@agent-art/protocol'));
  const qualification = JSON.parse(fs.readFileSync(path.join(ROOT, pin.qualification), 'utf8'));
  if (qualification.package.archiveSha256 !== pin.archiveSha256 || !Object.keys(qualification.package.packagedFiles || {}).length) throw Error('SDK qualification/archive mismatch.');
  for (const [name, digest] of Object.entries(qualification.package.packagedFiles)) {
    if (path.basename(name) !== name || sha256(fs.readFileSync(path.join(installed, name))) !== digest) throw Error('Installed SDK differs from the qualified archive. Run npm run sdk:prepare.');
  }
  const lock = JSON.parse(fs.readFileSync(path.resolve(installed, '../../..', 'package-lock.json'), 'utf8'));
  const integrity = `sha512-${createHash('sha512').update(fs.readFileSync(archivePath)).digest('base64')}`;
  if (lock.packages?.['node_modules/@agent-art/protocol']?.integrity !== integrity) throw Error('Installed dependency lock does not match the archive.');
  const installedManifest = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
  if (installedManifest.version !== pin.sdkVersion || installedManifest.name !== '@agent-art/protocol' || installedManifest.private !== true) throw Error('Installed package identity/version does not match the bench pin.');
  const { createReading } = await import(pathToFileURL(path.join(installed, 'reading.mjs')).href);
  const reading = createReading({ work });
  if (reading.context !== context) throw Error('Installed SDK changed the offered context.');
  const manifest = {
    id: `lab-reading-${source.contextSha256.slice(0, 12)}-sdk-${pin.sdkVersion}`,
    workId: work.id, workVersion: work.version, sdkVersion: pin.sdkVersion,
    archiveSha256: pin.archiveSha256, contextSha256: source.contextSha256, contextBytes: source.contextBytes,
  };
  return { manifest, work, context, source, packagePin: pin, environment: environment || inspectEnvironment(), packageDir: installed };
}
