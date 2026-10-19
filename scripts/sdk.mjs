#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, '.local/sdk');
const CACHE = path.join(OUTPUT, 'npm-cache');

function npm(args, cwd) {
  const result = spawnSync('npm', [...args, '--cache', CACHE], {
    cwd, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Offline SDK ${args[0]} failed. No registry fallback or install scripts were enabled.`);
  }
  return result.stdout;
}

export function packSDK() {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const staging = fs.mkdtempSync(path.join(OUTPUT, '.pack-'));
  try {
    const metadata = JSON.parse(npm([
      'pack', '--offline', '--ignore-scripts', '--json', '--pack-destination', staging,
    ], path.join(ROOT, 'protocol')))[0];
    if (!metadata || path.basename(metadata.filename) !== metadata.filename) throw new Error('Unexpected SDK archive name.');
    const staged = path.join(staging, metadata.filename);
    const bytes = fs.readFileSync(staged);
    const hash = createHash('sha256').update(bytes).digest('hex');
    const archive = path.join(OUTPUT, 'archives', `${hash}.tgz`);
    fs.mkdirSync(path.dirname(archive), { recursive: true });
    try { fs.writeFileSync(archive, bytes, { flag: 'wx' }); }
    catch (error) {
      if (error.code !== 'EEXIST' || !fs.readFileSync(archive).equals(bytes)) throw error;
    }
    const tarball = path.join(OUTPUT, metadata.filename);
    fs.renameSync(staged, tarball);
    return { tarball, archive, hash, version: metadata.version };
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
}

let prepared;
export function prepareSDK() {
  if (prepared) return prepared;
  const packed = packSDK();
  // Each archive gets its own immutable local installation. Preparing another
  // candidate never removes files a running preview may still be using.
  const consumer = path.join(OUTPUT, 'consumers', packed.hash);
  const packageDir = path.join(consumer, 'node_modules/@agent-art/protocol');
  if (!fs.existsSync(path.join(packageDir, 'package.json'))) {
    fs.mkdirSync(consumer, { recursive: true });
    fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }) + '\n');
    npm(['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--save-exact', packed.archive], consumer);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  if (manifest.name !== '@agent-art/protocol' || manifest.version !== packed.version || manifest.private !== true) {
    throw new Error('The installed local SDK does not match this private candidate.');
  }
  // Let the Lab's Node helper use the same normal package import as consumers.
  // Only this helper's own symlink may be changed; never replace another install.
  const link = path.join(ROOT, 'node_modules/@agent-art/protocol');
  fs.mkdirSync(path.dirname(link), { recursive: true });
  const stat = fs.lstatSync(link, { throwIfNoEntry: false });
  if (stat) {
    if (!stat.isSymbolicLink() || !fs.realpathSync(link).startsWith(path.join(OUTPUT, 'consumers') + path.sep)) {
      throw new Error('Another protocol package is installed in this checkout. No package was replaced.');
    }
    if (fs.realpathSync(link) !== fs.realpathSync(packageDir)) fs.unlinkSync(link);
  }
  if (!fs.existsSync(link)) fs.symlinkSync(packageDir, link, 'dir');
  prepared = { ...packed, tarball: packed.archive, packageDir };
  return prepared;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] || 'pack';
  if (!['pack', 'install'].includes(mode)) throw new Error('Use sdk.mjs pack or sdk.mjs install.');
  const result = mode === 'pack' ? packSDK() : prepareSDK();
  console.log(`Private draft SDK ${result.version}: ${path.relative(ROOT, result.tarball)}`);
  if (result.packageDir) console.log('Installed archive verified for local pilot package imports.');
}
