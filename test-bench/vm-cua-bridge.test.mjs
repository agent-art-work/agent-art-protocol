/** CLI/import checks only; these fixtures do not connect to a VM or native app. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./vm-cua-bridge.py', import.meta.url));
test('guest bridge help describes the bounded zero-Send scope without opening a connection', () => {
  const r = spawnSync('python3', [script, '--help'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /zero typing\/keys\/handoffs\/Sends/);
  assert.match(r.stdout.replace(/\s+/gu, ' '), /does not obtain consent/);
});
test('guest bridge rejects missing authorization before reading profiles or dispatching', () => {
  const r = spawnSync('python3', [script, '--connection', '/nonexistent-connection', '--environment', '/nonexistent-environment',
    '--record', '/nonexistent-record'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(r.status, 2); assert.match(r.stderr, /Explicit --authorize-setup/);
  assert.doesNotMatch(r.stderr, /Traceback|No such file/);
});
test('importing the bridge performs no transport, authority or native startup', () => {
  const r = spawnSync('python3', ['-c', 'import runpy,sys; m=runpy.run_path(sys.argv[1],run_name="bench_bridge_import"); print(callable(m["main"]))', script],
    { encoding: 'utf8', timeout: 5000 });
  assert.equal(r.status, 0, r.stderr); assert.equal(r.stdout.trim(), 'True');
});

test('profile/duration selection cannot amend an existing case or enable the Send lane', () => {
  const required = ['--connection', '/nonexistent-connection', '--environment', '/nonexistent-environment', '--record', '/nonexistent-record'];
  for (const args of [
    ['--authorize-setup', '--capture-profile', 'no-send-reviewed-60s-v1'],
    ['--authorize-probe', '--recover-case', 'synthetic-old', '--previous-controller-stopped', '--exclusive-input', '--capture-profile', 'no-send-reviewed-60s-v1'],
    ['--authorize-probe', '--timeout-ms', '1800001']
  ]) {
    const r = spawnSync('python3', [script, ...required, ...args], { encoding: 'utf8', timeout: 5000 });
    assert.equal(r.status, 2); assert.doesNotMatch(r.stderr, /Traceback|No such file/);
  }
});
