#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createStaticReadingServer } from './reading-consumers/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_REVISION = 'd658be2cc19307d113e64bd3fa0b2ad56a0a4bfc';
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const port = Number(option('--port', process.env.LAB_PILOT_PORT || '4174'));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a local port from 1024 through 65535.');
const clone = path.join(ROOT, '.local/reading-v010-lab');
const source = path.resolve(option('--lab-source', path.join(ROOT, '../Agent-Art-Lab')));
function run(command, argv, cwd = ROOT, capture = false) {
  const result = spawnSync(command, argv, { cwd, encoding: 'utf8', shell: false, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
  if (result.error || result.status !== 0) throw new Error('Local preview preparation failed. No source checkout was replaced.');
  return result.stdout?.trim();
}
if (!fs.existsSync(path.join(clone, '.git'))) {
  fs.mkdirSync(path.dirname(clone), { recursive: true });
  run('git', ['clone', '--no-hardlinks', '--quiet', source, clone]);
  run('git', ['switch', '--detach', SOURCE_REVISION], clone);
  run('git', ['switch', '-c', 'codex/reading-sdk-v010'], clone);
}
if (run('git', ['rev-parse', 'HEAD'], clone, true) !== SOURCE_REVISION) throw new Error('The isolated Lab clone is on another revision. No checkout was changed.');
const patch = path.join(ROOT, 'pilot/reading-consumers/lab.patch');
if (!fs.existsSync(path.join(clone, 'site/assets/agent-art-reading.mjs'))) {
  run('git', ['apply', '--check', '--binary', '--unidiff-zero', patch], clone);
  run('git', ['apply', '--binary', '--unidiff-zero', patch], clone);
} else {
  run('git', ['apply', '--reverse', '--check', '--binary', '--unidiff-zero', patch], clone);
}
if (!fs.existsSync(path.join(clone, 'node_modules/@agent-art/protocol/package.json'))) {
  // Locked, offline, no lifecycle scripts. A missing dependency cache is an
  // explicit setup error; this command never silently downloads packages.
  run('npm', ['ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', path.join(ROOT, '.local/sdk/npm-cache')], clone);
}
const installed = path.join(clone, 'node_modules/@agent-art/protocol');
for (const name of ['package.json', 'index.mjs', 'clients.mjs', 'reading.mjs', 'reading-ui.mjs', 'reading.css']) {
  if (!fs.readFileSync(path.join(installed, name)).equals(fs.readFileSync(path.join(ROOT, 'protocol', name)))) throw new Error('Refresh the isolated Lab install from its vendored SDK archive. The installed package differs from this release.');
}
if (!args.includes('--no-build')) run(process.execPath, ['scripts/build-site.mjs'], clone);
if (args.includes('--prepare-only')) process.exit(0);
const server = createStaticReadingServer({ directory: path.join(clone, '_site') });
server.listen(port, '127.0.0.1', () => {
  console.log(`Agent Art Lab SDK reading preview: http://127.0.0.1:${port}/`);
  console.log('Static browser handoff only. Review and send inside your Agent. No local Agent service.');
});
const stop = () => server.close(() => process.exit(0));
process.once('SIGINT', stop); process.once('SIGTERM', stop);
