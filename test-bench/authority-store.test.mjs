/** Filesystem/crash/rollback fixtures only. No VM, client or network. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { bindAuthorityStore, resolveAuthorityStore, writeExclusive } from './authority-store.mjs';
import * as runner from './desktop-runner.mjs';
import { controlledFixture, TEST_CONTROLLER, qualifyTestCase } from './execution-fixture.mjs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
function fixture(t) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-reset-synthetic-'));
  const root = path.join(directory, 'guest-workspace'), store = path.join(directory, 'host-authority');
  fs.mkdirSync(root); fs.mkdirSync(store); t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const context = 'Synthetic public input for reset guards.';
  const inputs = { context, manifest: { id: 'synthetic-reset', workId: 'https://public.example/#reading', workVersion: '1',
    sdkVersion: '0.1.4', archiveSha256: runner.SDK_SHA256, contextSha256: createHash('sha256').update(context).digest('hex'), contextBytes: Buffer.byteLength(context) },
    environment: { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-Chrome', version: '1' }, apps: { 'claude-app': { version: '1' } } } };
  return { root, store, inputs, directory, prepare: () => runner.prepareCase({ root, authorityRoot: store, inputs, allowSend: true }) };
}
function restore(f, snapshot) { fs.rmSync(f.root, { recursive: true }); fs.cpSync(snapshot, f.root, { recursive: true }); }
const recovery = (f, id) => runner.reconcileCase(id, { root: f.root, controllerId: TEST_CONTROLLER, previousControllerStopped: true, exclusiveInput: true });
function ready(t, f, state) {
  const c = controlledFixture(t, { state, root: f.root, inputs: f.inputs });
  c.handoff(); runner.observeCase(state.id, { lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested',
    source: 'browser-automation', material: { kind: 'browser-event', ref: 'synthetic/launch' } }, { root: f.root });
  return { c, arrival: c.arrival() };
}

test('new cases require explicit separate storage; nested and symlink aliases are rejected', async t => {
  const f = fixture(t);
  await assert.rejects(runner.prepareCase({ root: f.root, inputs: f.inputs, allowSend: true }), /authority-dir/);
  assert.throws(() => bindAuthorityStore({ root: f.root, authorityRoot: path.join(f.root, 'inside') }), /separate/);
  fs.symlinkSync(f.root, path.join(f.directory, 'workspace-alias'));
  assert.throws(() => bindAuthorityStore({ root: f.root, authorityRoot: path.join(f.directory, 'workspace-alias', 'inside') }), /separate/);
  const state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  assert.ok(p.dir.startsWith(fs.realpathSync(f.store) + path.sep));
  assert.equal(fs.existsSync(path.join(f.root, '.local/test-bench/desktop', state.id, 'case.json')), false);
  assert.equal(read(p.run).id, state.runId);
  assert.equal(fs.statSync(p.claim.replace('send-claimed.json', 'registration.json')).mode & 0o777, 0o600);
});

test('missing or substituted bound authority fails closed without recreating it', async t => {
  const f = fixture(t), state = await f.prepare();
  fs.renameSync(f.store, f.store + '-preserved');
  t.after(() => fs.rmSync(f.store + '-preserved', { recursive: true, force: true }));
  assert.throws(() => runner.pathsFor(state.id, f.root), /ENOENT/);
  assert.throws(() => bindAuthorityStore({ root: f.root, authorityRoot: f.store }), /ENOENT/);
  assert.equal(fs.existsSync(f.store), false);
  fs.mkdirSync(f.store);
  fs.writeFileSync(path.join(f.store, 'authority-store.json'), JSON.stringify({ schema: 'agent-art-bench/authority-store/1', storeId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }));
  assert.throws(() => resolveAuthorityStore(f.root), /identity changed/);
});

test('restoring workspace cannot undo Send or dispatch claims; reconciliation revokes old captures', async t => {
  const f = fixture(t), state = await f.prepare(), { arrival } = ready(t, f, state), p = runner.pathsFor(state.id, f.root);
  const snapshot = path.join(f.directory, 'workspace-snapshot'); fs.cpSync(f.root, snapshot, { recursive: true });
  runner.claimSend(state.id, { root: f.root, ...arrival });
  runner.enterSendDispatch(state.id, { root: f.root, controlIndex: 3, executionProof: arrival.executionProof });
  const sendBytes = fs.readFileSync(p.claim), dispatchBytes = fs.readFileSync(p.dispatchEntered);
  restore(f, snapshot);
  const result = recovery(f, state.id);
  assert.equal(result.sendClaimed, true); assert.equal(result.dispatchEntered, true);
  assert.equal(result.state.execution.status, 'unqualified');
  assert.equal(result.state.execution.actionMode, 'observation-only');
  assert.ok(result.state.execution.generation > arrival.executionProof.generation);
  assert.deepEqual(fs.readFileSync(p.claim), sendBytes); assert.deepEqual(fs.readFileSync(p.dispatchEntered), dispatchBytes);
  assert.throws(() => runner.enterSendDispatch(state.id, { root: f.root, controlIndex: 3, executionProof: arrival.executionProof }), /unqualified/);
  qualifyTestCase(state, f);
  assert.throws(() => runner.claimSend(state.id, { root: f.root, ...arrival }), /bound|generation|inspection|claimed/);
  assert.throws(() => runner.assertDesktopActionable(state.id, { root: f.root }), /already claimed/);
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
  assert.equal(report.sendDispatch.status, 'entered');
});

test('finished external cases remain terminal after restore and retain their canonical report', async t => {
  const f = fixture(t), state = await f.prepare(), snapshot = path.join(f.directory, 'snapshot');
  fs.cpSync(f.root, snapshot, { recursive: true });
  const report = runner.finishCase(state.id, { root: f.root });
  restore(f, snapshot);
  const recovered = recovery(f, state.id);
  assert.equal(recovered.terminal, true); assert.deepEqual(recovered.report, report);
  assert.throws(() => runner.assertDesktopActionable(state.id, { root: f.root }), /finished/);
  await assert.rejects(runner.prepareCase({ root: f.root, inputs: f.inputs, allowSend: true, runId: state.runId }), /finished case/);
});

test('a crashed writer leaves its durable claim and lock; explicit recovery preserves both attempts and deadline', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  const script = `import { writeExclusive } from ${JSON.stringify(new URL('./authority-store.mjs', import.meta.url).href)};
    writeExclusive(${JSON.stringify(p.mutex)}, {schema:'agent-art-bench/authority-lock/1',nonce:'synthetic-crashed-controller'});
    writeExclusive(${JSON.stringify(p.claim)}, {caseId:${JSON.stringify(state.id)},runId:${JSON.stringify(state.runId)},maximumAttempts:1,claimedAt:new Date().toISOString(),limit:'synthetic uncertain crash'});
    process.exit(17);`;
  const crashed = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' });
  assert.equal(crashed.status, 17);
  assert.throws(() => runner.qualifyCase(state.id, {}, { root: f.root }), /EEXIST/);
  assert.throws(() => runner.reconcileCase(state.id, { root: f.root, controllerId: TEST_CONTROLLER }), /confirmed stopped/);
  const result = recovery(f, state.id);
  assert.equal(result.sendClaimed, true); assert.equal(result.state.deadlineAt, state.deadlineAt);
  assert.ok(fs.readdirSync(p.dir).some(name => name.startsWith('abandoned-lock-')));
  assert.equal(fs.existsSync(p.claim), true);
});

test('reconciliation preserves expiry and operator revocation', async t => {
  const f = fixture(t), state = await f.prepare();
  runner.recordExecutionInterruption(state.id, { reason: 'operator-revoked', actor: 'human', humanAction: 'none' }, { root: f.root });
  assert.throws(() => recovery(f, state.id), /Revoked/);
  runner.finishCase(state.id, { root: f.root });
  const next = await f.prepare(); t.mock.timers.tick(900001);
  const recovered = recovery(f, next.id);
  assert.equal(recovered.state.execution.status, 'blocked'); assert.equal(recovered.state.deadlineAt, next.deadlineAt);
  assert.throws(() => runner.assertDesktopActionable(next.id, { root: f.root }), /expired/);
});
