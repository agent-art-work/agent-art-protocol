#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { prepareSDK } from '../scripts/sdk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PIN = '25206674f669dc39589dacaa8806440d003c7630';
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const clone = path.join(ROOT, '.local/thought-protocol-site');
const source = path.resolve(option('--thought-source', fs.existsSync(path.join(ROOT, '../inshell.art')) ? path.join(ROOT, '../inshell.art') : path.join(ROOT, '../../projects/inshell.art')));
const port = Number(option('--port', '4175'));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a loopback port from 1024 through 65535.');
const run = (command, argv, cwd = ROOT) => {
  const result = spawnSync(command, argv, { cwd, stdio: 'inherit', shell: false });
  if (result.error || result.status !== 0) throw new Error('THOUGHT preview preparation failed. See the command result above.');
};
const readGit = argv => {
  const result = spawnSync('git', argv, { cwd: clone, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], shell: false });
  if (result.error || result.status !== 0) throw new Error('The isolated THOUGHT source could not be checked.');
  return result.stdout.trim();
};
if (!fs.existsSync(path.join(clone, '.git'))) {
  fs.mkdirSync(path.dirname(clone), { recursive: true });
  run('git', ['clone', '--no-hardlinks', '--quiet', source, clone]);
  run('git', ['switch', '--detach', PIN], clone);
  run('git', ['switch', '-c', 'codex/protocol-dogfood'], clone);
}
if (readGit(['rev-parse', 'HEAD']) !== PIN) throw new Error('The isolated THOUGHT clone is on another revision. No checkout was changed.');
if (!fs.existsSync(path.join(clone, 'apps/thought/src/plain-return/protocol.ts'))) run('git', ['apply', '--unidiff-zero', path.join(ROOT, 'pilot/thought-consumer.patch')], clone);
if (!fs.existsSync(path.join(clone, 'node_modules/tsx'))) {
  const store = option('--pnpm-store', path.join(os.homedir(), 'Library/pnpm/store/v3'));
  // Reuse existing locked dependencies only. No downloads or install hooks.
  run('pnpm', ['install', '--offline', '--frozen-lockfile', '--ignore-scripts', '--store-dir', store], clone);
}
const sdk = await prepareSDK();
const localPackage = path.join(clone, 'node_modules/@agent-art/protocol');
const ownerMarker = '.aap-thought-local-sdk.json';
const owner = 'agent-art-protocol-thought-preview';
const tarballSha256 = createHash('sha256').update(fs.readFileSync(sdk.tarball)).digest('hex');
const installed = JSON.parse(fs.readFileSync(path.join(sdk.packageDir, 'package.json'), 'utf8'));
if (installed.name !== '@agent-art/protocol' || installed.version !== sdk.version) throw new Error('The prepared SDK package identity does not match this preview.');
let currentMarker;
if (fs.existsSync(localPackage)) {
  const stat = fs.lstatSync(localPackage);
  if (stat.isSymbolicLink()) {
    if (fs.realpathSync(localPackage) !== fs.realpathSync(sdk.packageDir)) throw new Error('A different protocol package link is present. No file was replaced.');
    fs.unlinkSync(localPackage);
  } else {
    const metadata = JSON.parse(fs.readFileSync(path.join(localPackage, 'package.json'), 'utf8'));
    const marker = path.join(localPackage, ownerMarker);
    if (fs.existsSync(marker)) currentMarker = JSON.parse(fs.readFileSync(marker, 'utf8'));
    const knownWrapper = metadata.name === '@agent-art/protocol' && metadata.version === undefined
      && fs.readdirSync(localPackage).sort().join(',') === 'index.d.mts,index.mjs,package.json'
      && ['index.mjs', 'index.d.mts'].every(name => {
        const file = path.join(localPackage, name);
        return fs.lstatSync(file).isSymbolicLink() && fs.realpathSync(file) === fs.realpathSync(path.join(ROOT, 'protocol', name));
      });
    const ownedCopy = metadata.name === '@agent-art/protocol' && currentMarker?.owner === owner;
    if (!knownWrapper && !ownedCopy) throw new Error('A different protocol package is installed. No file was replaced.');
    if (!ownedCopy || currentMarker.tarballSha256 !== tarballSha256) fs.rmSync(localPackage, { recursive: true, force: true });
  }
}
if (!fs.existsSync(localPackage)) {
  fs.mkdirSync(path.dirname(localPackage), { recursive: true });
  // Copy the installed tarball consumer, rather than aliasing SDK source.
  // All browser modules remain within Vite's existing workspace allowance.
  fs.cpSync(sdk.packageDir, localPackage, { recursive: true, dereference: true });
  fs.writeFileSync(path.join(localPackage, ownerMarker), JSON.stringify({ owner, tarballSha256 }) + '\n');
}
if (args.includes('--test')) {
  run(process.execPath, ['--import', 'tsx', '--test', 'apps/thought/src/plain-return/plain-return.test.ts', 'apps/thought/src/plain-return/protocol.test.ts'], clone);
  run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'apps/thought/src/plain-return/tsconfig.json'], clone);
  run(process.execPath, ['scripts/check-pub-boundary.mjs'], clone);
}
if (args.includes('--prepare-only') || args.includes('--test')) process.exit(0);
const app = path.join(clone, 'apps/thought');
const stateDir = path.join(ROOT, '.local/thought-protocol-state');
fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
const origin = `http://127.0.0.1:${port}`;
const environment = { ...process.env,
  THOUGHT_PLAIN_HTTP_ENABLED: 'true', THOUGHT_PLAIN_HTTP_ORIGIN: origin,
  THOUGHT_PLAIN_HTTP_SQLITE_PATH: path.join(stateDir, 'plain-returns.sqlite'),
  INSHELL_THOUGHT_USE_CONTRACT_RUNTIME: '0', INSHELL_THOUGHT_USE_LOCKED_SURFACE: '1',
  // The product plain-return plugin serves its own local API. Never proxy an
  // unrelated local preview request to a production API as a fallback.
  INSHELL_THOUGHT_DEV_API_ORIGIN: 'http://127.0.0.1:9',
  VITE_DEPLOY_ENV: 'preview', VITE_THOUGHT_ROUTE_BASE: '/thought',
  VITE_THOUGHT_URL: '/thought', VITE_THOUGHT_DETAIL_BASE_URL: '/thought',
};
const vite = path.join(app, 'node_modules/vite/bin/vite.js');
if (!fs.existsSync(vite)) throw new Error('The pinned THOUGHT Vite dependency is unavailable.');
const child = spawn(process.execPath, [vite, '--configLoader', 'runner', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: app, env: environment, stdio: 'inherit', shell: false });
console.log(`THOUGHT protocol preview: ${origin}/thought/`);
console.log('Existing THOUGHT return service, artistic rules and renderer; shared protocol records/routes. No wallet, chain or model is started by this command.');
const stop = signal => { if (!child.killed) child.kill(signal); };
process.once('SIGINT', () => stop('SIGINT')); process.once('SIGTERM', () => stop('SIGTERM'));
child.once('error', () => { console.error('The local Vite process could not start.'); process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
