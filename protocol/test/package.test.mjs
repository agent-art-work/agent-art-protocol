import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));

test('the actual private SDK tarball installs offline and exposes only its intended entry points', { timeout: 30000 }, () => {
  const owned = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-sdk-package-'));
  const packed = path.join(owned, 'packed');
  const consumer = path.join(owned, 'consumer');
  fs.mkdirSync(packed); fs.mkdirSync(consumer);
  const userConfig = path.join(owned, 'user.npmrc');
  const globalConfig = path.join(owned, 'global.npmrc');
  fs.writeFileSync(userConfig, ''); fs.writeFileSync(globalConfig, '');
  const environment = { ...process.env,
    npm_config_userconfig: userConfig, npm_config_globalconfig: globalConfig,
    npm_config_cache: path.join(owned, 'cache'), npm_config_offline: 'true',
    npm_config_ignore_scripts: 'true', npm_config_audit: 'false', npm_config_fund: 'false',
  };
  const run = (command, args, cwd) => {
    const result = spawnSync(command, args, { cwd, env: environment, encoding: 'utf8', shell: false, timeout: 20000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, `${command} failed: ${result.stderr || result.stdout}`);
    return result.stdout;
  };
  try {
    const output = run('npm', ['pack', '--offline', '--ignore-scripts', '--json', '--pack-destination', packed], packageRoot);
    const [tarball] = JSON.parse(output);
    assert.equal(tarball.name, '@agent-art/protocol');
    assert.equal(tarball.version, '0.1.0-alpha.0');
    assert.deepEqual(tarball.files.map(item => item.path).sort(), ['README.md', 'clients.d.mts', 'clients.mjs', 'index.d.mts', 'index.mjs', 'package.json']);
    fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ name: 'sdk-boundary-smoke', private: true, type: 'module' }));
    run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', '--save-exact', path.join(packed, tarball.filename)], consumer);
    const manifest = JSON.parse(fs.readFileSync(path.join(consumer, 'node_modules/@agent-art/protocol/package.json'), 'utf8'));
    assert.equal(manifest.private, true);
    assert.equal(manifest.license, undefined);
    assert.equal(manifest.dependencies, undefined);
    assert.equal(manifest.scripts, undefined);
    for (const route of Object.values(manifest.exports)) assert.ok(fs.statSync(path.join(consumer, 'node_modules/@agent-art/protocol', route.types)).isFile());
    const result = run(process.execPath, ['--input-type=module', '--eval', `
      import assert from 'node:assert/strict';
      import { defineWork, createRecord, seal, verify, buildClientHandoff } from '@agent-art/protocol';
      import { buildClientHandoff as fromClients } from '@agent-art/protocol/clients';
      assert.equal(buildClientHandoff, fromClients);
      const record = await seal(createRecord({ work: defineWork({
        id: 'sdk-smoke-reading', version: '1', title: 'Package boundary',
        purpose: 'Check installed imports without an Agent call.', capabilities: ['handoff'],
        context: [{ id: 'offered-context', kind: 'text', mode: 'snapshot', text: 'Public context. 意图' }],
        conditions: { answers: 'Remain inside the visitor’s Agent.' },
      }) }));
      const report = await verify(record);
      assert.equal(report.checks.find(item => item.claim === 'record-integrity').status, 'supported');
      assert.equal(report.checks.find(item => item.claim === 'agent-execution-origin').status, 'not-established');
      assert.equal(record.acts.length, 0);
      const prepared = fromClients({ client: 'claude-app', surface: 'code', prompt: 'Public context. 意图' });
      assert.equal(new URL(prepared.url).searchParams.get('q'), 'Public context. 意图');
      await assert.rejects(import('@agent-art/protocol/test/records.test.mjs'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
      process.stdout.write('installed SDK smoke passed');
    `], consumer);
    assert.equal(result, 'installed SDK smoke passed');
  } finally {
    fs.rmSync(owned, { recursive: true, force: true });
  }
});
