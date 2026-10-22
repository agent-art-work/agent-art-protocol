import { setupTestAuthority } from './execution-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as runner from './desktop-runner.mjs';
import { TEST_CONTROLLER, controlledFixture, qualifyTestCase } from './execution-fixture.mjs';
const clocked = new WeakSet();

// These are synthetic record-classification tests. No browser, desktop app,
// model or network is invoked, and no passing fixture qualifies a live path.
function fixture(t) {
  if (!clocked.has(t)) { t.mock.timers.enable({ apis: ['Date'], now: Date.now() }); clocked.add(t); }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-control-path-test-'));
  setupTestAuthority(t, root);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const context = 'Synthetic public Lab invitation for route classification.';
  const inputs = {
    context,
    manifest: {
      id: 'synthetic-lab-route-sdk014', workId: 'https://public.example/#reading', workVersion: '1',
      sdkVersion: '0.1.4', archiveSha256: runner.SDK_SHA256,
      contextSha256: createHash('sha256').update(context).digest('hex'), contextBytes: Buffer.byteLength(context),
    },
    environment: {
      os: { name: 'synthetic-macOS', version: '1' },
      browser: { name: 'synthetic-stable-Chrome', version: '1' },
      apps: { 'claude-app': { version: 'synthetic-1' } },
    },
  };
  return { root, inputs, t, prepare: () => runner.prepareCase({ root, inputs, allowSend: true }) };
}

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const observed = (claim, material = {}) => ({
  lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat',
  claim, status: 'observed', source: 'desktop-ui',
  material: { kind: 'desktop-ui-check', method: 'visual-inspection', ...material },
});

function readyForSend(state, f) {
  f.control = controlledFixture(f.t, { state, root: f.root, inputs: f.inputs });
  f.control.handoff();
  runner.observeCase(state.id, {
    lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation',
    material: { kind: 'browser-event', ref: 'synthetic/uri-control-request' },
  }, { root: f.root });
  f.sendOptions = { root: f.root, ...f.control.arrival() };
}
function recordOwned(state, f, claim, material = {}) {
  f.t.mock.timers.tick(1);
  const proof = f.control.proof();
  return runner.observeCase(state.id, observed(claim, { ...material, captureId: proof.captureId,
    capturedAt: proof.capturedAt, snapshotSha256: proof.snapshotSha256 }), { root: f.root, executionProof: proof });
}

test('a complete native URI control reports interaction success without qualifying the Lab component path', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  runner.markUriControl(state.id, { root: f.root });
  assert.equal(read(p.state).testPath, 'native-uri-control');
  assert.ok(read(p.journal).some(event => /native-uri-control/u.test(event.action)));

  readyForSend(state, f);
  runner.claimSend(state.id, f.sendOptions);
  recordOwned(state, f, 'sent');
  recordOwned(state, f, 'source-access', { method: 'visible-tool-result' });
  recordOwned(state, f, 'completion');
  const report = runner.finishCase(state.id, { root: f.root });

  assert.equal(report.interactionPassed, true, 'the baseline still records its observed interaction stages');
  assert.equal(report.sourceAccess, 'observed');
  assert.equal(report.testPath, 'native-uri-control');
  assert.equal(report.componentPathQualified, false, 'URI dispatch must not upgrade an untested component click');
  assert.equal(read(path.join(p.dir, 'report.json')).componentPathQualified, false);
  assert.equal(report.summary.realClient.clients['codex-app'].sent.status, 'not-run');
});

test('an unmarked case retains the Lab component path declaration', async t => {
  const f = fixture(t), state = await f.prepare();
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.testPath, 'lab-component');
  assert.equal(report.interactionPassed, false);
  assert.equal(report.componentPathQualified, false, 'a default route label alone is not qualification');
});

test('route classification cannot be changed after Send is claimed, including an ambiguous attempt', async t => {
  for (const confirmSent of [false, true]) {
    const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
    readyForSend(state, f);
    runner.claimSend(state.id, f.sendOptions);
    if (confirmSent) recordOwned(state, f, 'sent');
    const beforeState = fs.readFileSync(p.state, 'utf8');
    const beforeJournal = fs.readFileSync(p.journal, 'utf8');
    const beforeClaim = fs.readFileSync(p.claim, 'utf8');

    assert.throws(() => runner.markUriControl(state.id, { root: f.root }), /send|attempt|claim/i);
    assert.equal(fs.readFileSync(p.state, 'utf8'), beforeState);
    assert.equal(fs.readFileSync(p.journal, 'utf8'), beforeJournal);
    assert.equal(fs.readFileSync(p.claim, 'utf8'), beforeClaim);
  }
});

test('a finished case cannot be relabeled as a native URI control', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  const report = runner.finishCase(state.id, { root: f.root });
  assert.throws(() => runner.markUriControl(state.id, { root: f.root }), /finished|active|own/i);
  assert.equal(read(p.state).status, 'finished');
  assert.deepEqual(read(path.join(p.dir, 'report.json')), report);
});

test('an inspection interruption preserves guards and deadline and requires fresh qualification', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  runner.markUriControl(state.id, { root: f.root });
  readyForSend(state, f);
  const handoffGuard = fs.readFileSync(p.handoff, 'utf8');
  const paused = runner.pauseCase(state.id, { root: f.root, reason: 'inspection-approval' });
  assert.equal(paused.execution.status, 'blocked');
  assert.equal(paused.execution.blockedReason, 'permission-required');
  assert.equal(read(p.active).id, state.id);
  assert.throws(() => runner.claimSend(state.id, f.sendOptions), /blocked/);
  t.mock.timers.tick(120000);
  const resumed = runner.resumeCase(state.id, { root: f.root, controllerId: TEST_CONTROLLER, confirmedAccess: true });
  assert.equal(resumed.execution.status, 'unqualified');
  assert.equal(resumed.deadlineAt, state.deadlineAt, 'recovery does not extend the authorized run');
  assert.equal(resumed.execution.humanAssisted, true);
  assert.equal(fs.readFileSync(p.handoff, 'utf8'), handoffGuard);
  assert.equal(fs.existsSync(p.claim), false);
  assert.throws(() => runner.claimSend(state.id, f.sendOptions), /unqualified/);
  qualifyTestCase(state, { root: f.root, inputs: f.inputs });
  assert.throws(() => runner.claimSend(state.id, f.sendOptions), /generation|bound|current|qualification/);
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root }), /already|claimed|proof/);
});
