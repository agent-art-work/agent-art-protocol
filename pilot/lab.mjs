#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { prepareSDK } from '../scripts/sdk.mjs';

prepareSDK();
const { createReadingServer } = await import('./reading/server.mjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_REVISION = 'd658be2cc19307d113e64bd3fa0b2ad56a0a4bfc';
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const port = Number(option('--port', process.env.LAB_PILOT_PORT || '4174'));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a local port from 1024 through 65535.');
const clone = path.join(ROOT, '.local/lab-reading-site');
const source = path.resolve(option('--lab-source', path.join(ROOT, '../Agent-Art-Lab')));
function run(command, argv, cwd = ROOT, env = process.env) {
  const result = spawnSync(command, argv, { cwd, env, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw new Error('Local preview preparation failed. See the command result above.');
}
if (!fs.existsSync(path.join(clone, '.git'))) {
  fs.mkdirSync(path.dirname(clone), { recursive: true });
  run('git', ['clone', '--no-hardlinks', '--quiet', source, clone]);
  run('git', ['switch', '--detach', SOURCE_REVISION], clone);
  run('git', ['switch', '-c', 'codex/local-reading-pilot'], clone);
}
if (!fs.existsSync(path.join(clone, 'pilot/reading-profile.mjs'))) run('git', ['apply', '--unidiff-zero', path.join(ROOT, 'pilot/lab-consumer.patch')], clone);
if (!fs.existsSync(path.join(clone, 'node_modules'))) {
  const existing = path.join(source, 'node_modules');
  if (!fs.existsSync(path.join(existing, 'markdown-it'))) throw new Error('The Lab build dependencies are unavailable. Restore them in the Lab checkout before building this preview.');
  fs.symlinkSync(existing, path.join(clone, 'node_modules'), 'dir');
}
if (!args.includes('--no-build')) run(process.execPath, ['scripts/build-site.mjs'], clone, { ...process.env, LAB_READING_BRIDGE: '1' });
const profile = (await import(pathToFileURL(path.join(clone, 'pilot/reading-profile.mjs')))).default;
const { server, shutdown } = await createReadingServer({ siteDir: path.join(clone, '_site-reading-pilot'), entryFile: path.join(clone, 'site/assets/reading-bridge.mjs'), profile });
server.listen(port, '127.0.0.1', () => {
  console.log(`Agent Art Lab reading pilot: http://127.0.0.1:${port}/`);
  console.log('Local clone and native Agent handoff. Open prepares a new conversation draft; review and send inside your Agent.');
});
const stop = () => { shutdown(); server.close(() => process.exit(0)); };
process.once('SIGINT', stop); process.once('SIGTERM', stop);
