#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createStaticReadingServer } from './reading-consumers/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidateDir = path.join(ROOT, 'pilot/reading-sdk-012');
const candidate = JSON.parse(fs.readFileSync(path.join(candidateDir, 'lab.json'), 'utf8'));
const SOURCE_REVISION = candidate.baseCommit;
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const port = Number(option('--port', process.env.LAB_PILOT_PORT || '4174'));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a local port from 1024 through 65535.');
const clone = path.join(ROOT, '.local/reading-v012-lab');
const source = path.resolve(option('--lab-source', path.join(ROOT, '../Agent-Art-Lab')));
const desktopDiscovery = !args.includes('--no-desktop-discovery');
function run(command, argv, cwd = ROOT, capture = false) {
  const result = spawnSync(command, argv, { cwd, encoding: 'utf8', shell: false, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
  if (result.error || result.status !== 0) throw new Error('Local preview preparation failed. No source checkout was replaced.');
  return result.stdout?.trim();
}
if (!fs.existsSync(path.join(clone, '.git'))) {
  fs.mkdirSync(path.dirname(clone), { recursive: true });
  run('git', ['clone', '--no-hardlinks', '--quiet', source, clone]);
  run('git', ['switch', '--detach', SOURCE_REVISION], clone);
  run('git', ['switch', '-c', 'codex/reading-sdk-v012'], clone);
}
if (run('git', ['rev-parse', 'HEAD'], clone, true) !== SOURCE_REVISION) throw new Error('The isolated Lab clone is on another revision. No checkout was changed.');
const patch = path.join(candidateDir, candidate.patch);
if (createHash('sha256').update(fs.readFileSync(patch)).digest('hex') !== candidate.patchSha256) throw new Error('The pinned Lab patch has changed.');
if (!fs.existsSync(path.join(clone, candidate.sdk.archive))) {
  run('git', ['apply', '--check', '--binary', '--unidiff-zero', patch], clone);
  run('git', ['apply', '--index', '--binary', '--unidiff-zero', patch], clone);
} else {
  // Validate the prepared clone without resetting uncommitted operator work.
  run('git', ['apply', '--reverse', '--check', '--binary', '--unidiff-zero', patch], clone);
}
if (run('git', ['write-tree'], clone, true) !== candidate.resultTree) throw new Error('The prepared Lab tree differs from the pinned owner candidate.');
run('git', ['diff', '--exit-code'], clone);
for (const [name, expected] of [['package.json', candidate.consumer.packageJsonSha256], ['package-lock.json', candidate.consumer.packageLockSha256]]) {
  if (createHash('sha256').update(fs.readFileSync(path.join(clone, name))).digest('hex') !== expected) throw new Error('The Lab dependency inputs differ from the pinned candidate.');
}
const archive = path.join(clone, candidate.sdk.archive);
const digest = createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
if (digest !== candidate.sdk.sha256) throw new Error('The Lab archive differs from this qualified SDK candidate.');
if (!fs.existsSync(path.join(clone, 'node_modules/@agent-art/protocol/package.json'))) {
  // Locked, offline, no lifecycle scripts. A missing dependency cache is an
  // explicit setup error; this command never silently downloads packages.
  run('npm', ['ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', path.resolve(option('--dependency-cache', path.join(ROOT, '.local/sdk/npm-cache')))], clone);
}
const lock = JSON.parse(fs.readFileSync(path.join(clone, 'package-lock.json'), 'utf8'));
if (lock.packages?.['node_modules/@agent-art/protocol']?.integrity !== candidate.sdk.integrity) throw new Error('The installed Lab dependency lock differs from the archive integrity.');
const installed = path.join(clone, 'node_modules/@agent-art/protocol');
for (const name of ['package.json', ...JSON.parse(fs.readFileSync(path.join(ROOT, 'protocol/package.json'), 'utf8')).files]) {
  if (!fs.readFileSync(path.join(installed, name)).equals(fs.readFileSync(path.join(ROOT, 'protocol', name)))) throw new Error('Refresh the isolated Lab install from its vendored SDK archive. The installed package differs from this release.');
}
if (!args.includes('--no-build')) run(process.execPath, ['scripts/build-site.mjs'], clone);
if (args.includes('--prepare-only')) process.exit(0);
const server = createStaticReadingServer({ directory: path.join(clone, '_site'), desktopDiscovery });
server.listen(port, '127.0.0.1', () => {
  console.log(`Agent Art Lab SDK ${candidate.sdk.version} reading preview: http://127.0.0.1:${port}/`);
  console.log('ChatGPT desktop prefill, Claude and Copy. Review the destination app mode and send there.');
});
const stop = () => server.close(() => process.exit(0));
process.once('SIGINT', stop); process.once('SIGTERM', stop);
