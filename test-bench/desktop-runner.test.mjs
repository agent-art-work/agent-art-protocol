import { setupTestAuthority } from './execution-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import * as runner from './desktop-runner.mjs';
import { createRun } from './records.mjs';
import { publicDesktopNote } from './desktop-ui.mjs';
import { inspectClaudeArrival, inspectFreshClaudeReadiness, selectUnifiedNoSendControls } from './readiness.mjs';
import { controlledFixture, qualifyTestCase, TEST_CONTROLLER, testExecutionProof } from './execution-fixture.mjs';

const clocks = new WeakSet();
function fixture(t) {
  if (!clocks.has(t)) { t.mock.timers.enable({ apis: ['Date'], now: Date.now() }); clocks.add(t); }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-desktop-controller-test-'));
  setupTestAuthority(t, root);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const context = 'Synthetic public Lab invitation. No native application is used.';
  const inputs = { context, manifest: { id: 'synthetic-public-lab-sdk014', workId: 'https://public.example/#reading', workVersion: '1',
    sdkVersion: '0.1.4', archiveSha256: runner.SDK_SHA256,
    contextSha256: createHash('sha256').update(context).digest('hex'), contextBytes: Buffer.byteLength(context) },
  environment: { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-stable-Chrome', version: '1' },
    apps: { 'claude-app': { version: 'synthetic-1' } } } };
  const controls = new Map(), arrivals = new Map();
  const f = { root, inputs, prepare: options => runner.prepareCase({ root, inputs, allowSend: true, ...options }),
    control(state) { if (!controls.has(state.id)) controls.set(state.id, controlledFixture(t, { state, root, inputs })); return controls.get(state.id); },
    ready(state) { const c = f.control(state); c.handoff(); runner.observeCase(state.id, browserRequest(), { root });
      const arrived = c.arrival(); arrivals.set(state.id, arrived); return arrived; },
    send(state) { return runner.claimSend(state.id, { root, ...arrivals.get(state.id) }); },
    observe(state, claim, overrides = {}) { t.mock.timers.tick(1); const proof = f.control(state).proof();
      const observation = desktop(claim, overrides);
      observation.material = { ...observation.material, captureId: proof.captureId, capturedAt: proof.capturedAt, snapshotSha256: proof.snapshotSha256 };
      return runner.observeCase(state.id, observation, { root, executionProof: proof }); }
  };
  return f;
}
const browserRequest = () => ({ lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation',
  material: { kind: 'browser-event', ref: 'synthetic/native-click' } });
const desktop = (claim, overrides = {}) => ({ lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat', claim, status: 'observed', source: 'desktop-ui',
  material: { kind: 'desktop-ui-check', method: 'visual-inspection', ref: 'synthetic/owned-ui' }, ...overrides });
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const benchRun = (root, id) => path.join(root, '.local/test-bench/runs', id + '.json');
const interruption = (reason, actor = 'agent', humanAction = 'none') => ({ reason, actor, humanAction });
const resume = (state, f, extra = {}) => runner.resumeExecution(state.id, { controllerId: TEST_CONTROLLER, ...extra }, { root: f.root });

test('preparation requires authorization and package pins but never qualifies capabilities', async t => {
  const f = fixture(t);
  await assert.rejects(f.prepare({ allowSend: false }), /authorization/i);
  await assert.rejects(f.prepare({ timeoutMs: 0 }), /bounded/i);
  await assert.rejects(f.prepare({ inputs: { ...f.inputs, manifest: { ...f.inputs.manifest, archiveSha256: 'a'.repeat(64) } } }), /qualified SDK/);
  const state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  assert.equal(state.execution.status, 'unqualified'); assert.equal(state.execution.generation, 1);
  assert.equal(state.executionContract.authority.maximumSends, 1);
  assert.equal(read(p.state).authorization.maximumSends, 1);
  assert.equal(fs.readFileSync(path.join(p.dir, 'public-context.txt'), 'utf8'), f.inputs.context);
  assert.throws(() => runner.assertExecutionReady(state.id, { root: f.root }), /unqualified/i);
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root }), /unqualified/i);
  assert.throws(() => runner.assertDesktopActionable(state.id, { root: f.root }), /unqualified/i);
  await assert.rejects(f.prepare(), /EEXIST/);
  for (const id of ['../other', '/tmp/other', 'a/b', '']) assert.throws(() => runner.pathsFor(id, f.root), /identifier/);
});

test('qualification persists only bounded attributed findings and pins the successful controller', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  const assessment = { controllerId: TEST_CONTROLLER, configuration: f.inputs.environment, interface: 'cua',
    browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop', permissions: 'unknown',
    inputOwnership: 'exclusive', observation: 'ax-and-pixels' };
  const failed = runner.qualifyCase(state.id, assessment, { root: f.root });
  assert.equal(failed.qualified, false); assert.equal(failed.reason, 'permissions-not-ready');
  assert.equal(read(p.state).execution.status, 'unqualified');
  assert.throws(() => runner.qualifyCase(state.id, { ...assessment, privateText: 'private' }, { root: f.root }), /field/);
  const good = runner.qualifyCase(state.id, { ...assessment, permissions: 'ready' }, { root: f.root });
  assert.equal(good.qualified, true); assert.equal(good.generation, 2);
  assert.equal(runner.assertExecutionReady(state.id, { root: f.root }).generation, 2);
  assert.throws(() => runner.qualifyCase(state.id, { ...assessment, permissions: 'ready', controllerId: 'other' }, { root: f.root }), /different controller/);
  assert.equal(read(p.state).execution.qualifications.length, 2);
  assert.equal(JSON.stringify(read(p.state)).includes('privateText'), false);
});

test('handoff requires current inspection and actual fresh readiness and is claimed only once', async t => {
  const f = fixture(t), state = await f.prepare(), c = f.control(state);
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root }), /proof|inspection/i);
  const proof = c.proof();
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root, executionProof: proof }), /capture|readiness/i);
  const claim = c.handoff(); assert.equal(claim.executionProof.controllerId, TEST_CONTROLLER);
  assert.throws(() => c.handoff(), /EEXIST|already|claimed/i);
});

test('merged no-Send readiness cannot consume a desktop handoff even with current execution proof', async t => {
  const f = fixture(t), state = await f.prepare(), c = f.control(state), snapshot = c.snapshot('');
  snapshot.nodes[1].label = 'Primary pane';
  for (const [index, role, label, value] of [[6, 'heading', 'New session'], [7, 'pop up button', 'Project or folder'],
    [8, 'pop up button', 'Manual'], [9, 'toggle button', 'Browser', '0']]) {
    snapshot.nodes.push({ index, role, label, ...(value === undefined ? {} : { value }), parentIndex: 1, visible: true, enabled: true });
  }
  const readiness = inspectFreshClaudeReadiness(snapshot, { scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4,
    codeModeIndex: 5, freshChat: true, now: Date.now(), ...selectUnifiedNoSendControls(snapshot, 1) });
  assert.equal(readiness.ready, true);
  const executionProof = testExecutionProof(state, f.root, snapshot);
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root, readiness, executionProof }), /no-Send profile cannot qualify/);
  assert.equal(fs.existsSync(runner.pathsFor(state.id, f.root).handoff), false);
});

test('Send requires fresh arrival and current generation and never reopens its durable claim', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  const arrived = f.ready(state);
  assert.throws(() => runner.claimSend(state.id, { root: f.root }), /proof|inspection/i);
  const changed = { ...arrived.executionProof, generation: arrived.executionProof.generation + 1 };
  assert.throws(() => runner.claimSend(state.id, { root: f.root, arrival: arrived.arrival, executionProof: changed }), /bound|generation|inspection/i);
  assert.equal(fs.existsSync(p.claim), false);
  const claim = f.send(state), stored = fs.readFileSync(p.claim, 'utf8');
  assert.equal(claim.contextSha256, f.inputs.manifest.contextSha256); assert.equal(claim.maximumAttempts, 1);
  assert.equal(fs.statSync(p.claim).mode & 0o777, 0o600);
  assert.throws(() => f.send(state), /already|claimed/i);
  assert.equal(fs.readFileSync(p.claim, 'utf8'), stored);
});

test('explicit later mismatch invalidates a positive context without consuming Send', async t => {
  const f = fixture(t), state = await f.prepare(); f.ready(state);
  runner.observeCase(state.id, desktop('context-matches', { status: 'failed', reason: 'context-differs',
    material: { kind: 'desktop-ui-check', method: 'composer-utf8-sha256' } }), { root: f.root });
  assert.throws(() => f.send(state), /draft|context|observed/i);
  assert.equal(fs.existsSync(runner.pathsFor(state.id, f.root).claim), false);
});

test('positive desktop facts need a current capture proof; unrelated private notes never persist', async t => {
  const f = fixture(t), state = await f.prepare(); f.control(state);
  assert.throws(() => runner.observeCase(state.id, desktop('draft-arrived'), { root: f.root }), /proof|inspection/i);
  assert.throws(() => f.observe(state, 'draft-arrived', { notes: 'Unrelated private draft content' }), /public|note/i);
  f.control(state).handoff();
  const result = f.observe(state, 'draft-arrived', { notes: publicDesktopNote('composer-matches') });
  assert.equal(result.run.observations.at(-1).notes, publicDesktopNote('composer-matches'));
  assert.throws(() => f.observe(state, 'draft-arrived', { requestedClient: 'codex-app' }), /Codex/);
  assert.throws(() => f.observe(state, 'draft-arrived', { actualSurface: 'claude-code' }), /mismatched/);
  assert.throws(() => f.observe(state, 'sent'), /Claim Send/);
});

test('dispatch rechecks the same current inspection and records promise return separately', async t => {
  const f = fixture(t), state = await f.prepare(), arrived = f.ready(state); f.send(state);
  assert.throws(() => runner.enterSendDispatch(state.id, { root: f.root, controlIndex: 3 }), /proof|inspection/);
  const entered = runner.enterSendDispatch(state.id, { root: f.root, controlIndex: 3, executionProof: arrived.executionProof });
  assert.equal(entered.stage, 'entered');
  assert.throws(() => runner.enterSendDispatch(state.id, { root: f.root, controlIndex: 3, executionProof: arrived.executionProof }), /already/);
  runner.settleSendDispatch(state.id, { root: f.root, stage: 'returned' });
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.sendDispatch.status, 'returned'); assert.equal(report.sendDispatch.nativeDelivery, 'not-established');
  assert.equal(report.execution.outcome, 'indeterminate'); assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
});

test('interference invalidates readiness and stale proofs before any dispatch', async t => {
  const f = fixture(t), state = await f.prepare(), arrived = f.ready(state); f.send(state);
  const p = runner.pathsFor(state.id, f.root), before = fs.readFileSync(p.claim, 'utf8');
  runner.recordExecutionInterruption(state.id, interruption('input-interference'), { root: f.root });
  assert.throws(() => runner.enterSendDispatch(state.id, { root: f.root, controlIndex: 3, executionProof: arrived.executionProof }), /blocked/);
  assert.equal(fs.existsSync(p.dispatchEntered), false);
  const resumed = resume(state, f); assert.equal(resumed.execution.actionMode, 'observation-only');
  qualifyTestCase(state, f);
  assert.throws(() => f.send(state), /bound|generation|already|claimed|inspection/i);
  assert.throws(() => runner.assertDesktopActionable(state.id, { root: f.root }), /already claimed/i);
  assert.equal(fs.readFileSync(p.claim, 'utf8'), before);
  assert.equal(runner.finishCase(state.id, { root: f.root }).execution.outcome, 'indeterminate');
});

test('pre-run human setup stays separate while post-handoff human help marks assistance', async t => {
  const f = fixture(t), state = await f.prepare();
  runner.recordExecutionInterruption(state.id, interruption('permission-required', 'human', 'restore-access'), { root: f.root });
  assert.throws(() => resume(state, f), /Confirm/);
  const restored = resume(state, f, { confirmedHumanAction: true });
  assert.equal(restored.deadlineAt, state.deadlineAt); assert.equal(restored.execution.humanSetup, true);
  assert.equal(restored.execution.humanAssisted, false); assert.equal(restored.execution.status, 'unqualified');
  f.control(state).handoff();
  runner.recordExecutionInterruption(state.id, interruption('target-lost', 'human', 'locate-target'), { root: f.root });
  resume(state, f, { confirmedHumanAction: true }); qualifyTestCase(state, f);
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.execution.mode, 'human-assisted'); assert.equal(report.execution.contractQualified, false);
  assert.equal(report.execution.interventions[0].classification, 'human-setup');
  assert.equal(report.execution.interventions[1].classification, 'human-assistance');
});

test('human submission consumes the attempt and cannot be relabeled runner dispatch', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root); f.control(state);
  runner.recordExecutionInterruption(state.id, interruption('input-interference', 'human', 'send'), { root: f.root });
  assert.equal(read(p.claim).actor, 'human'); assert.equal(read(p.claim).claimOrigin, 'human-reported');
  resume(state, f, { confirmedHumanAction: true }); qualifyTestCase(state, f);
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root, executionProof: f.control(state).proof() }), /capture|already|claimed|readiness/);
  assert.throws(() => runner.assertDesktopActionable(state.id, { root: f.root }), /already claimed/);
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.execution.mode, 'human-assisted'); assert.equal(report.sendDispatch.status, 'not-recorded');
  assert.equal(report.execution.outcome, 'indeterminate');
});

test('revocation is terminal for execution; finish retains prior claims and authority', async t => {
  const f = fixture(t), state = await f.prepare(); f.ready(state);
  runner.recordExecutionInterruption(state.id, interruption('operator-revoked', 'human'), { root: f.root });
  assert.throws(() => resume(state, f, { confirmedHumanAction: true }), /revoked/);
  assert.throws(() => qualifyTestCase(state, f), /Blocked/);
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.execution.outcome, 'blocked'); assert.equal(report.execution.blockedReason, 'operator-revoked');
  assert.equal(report.sendClaimed, false);
});

test('interruption codes, budgets and controller identity are bounded without free text', async t => {
  const f = fixture(t), state = await f.prepare(); f.control(state);
  assert.throws(() => runner.recordExecutionInterruption(state.id, { ...interruption('target-lost'), notes: 'private' }, { root: f.root }), /bounded/);
  assert.throws(() => runner.recordExecutionInterruption(state.id, interruption('invented'), { root: f.root }), /known/);
  assert.throws(() => runner.recordExecutionInterruption(state.id, interruption('target-lost', 'agent', 'send'), { root: f.root }), /human/);
  runner.recordExecutionInterruption(state.id, interruption('target-lost'), { root: f.root });
  assert.throws(() => runner.resumeExecution(state.id, { controllerId: 'another-controller' }, { root: f.root }), /same/);
  resume(state, f);
  for (let i = 1; i < 8; i++) runner.recordExecutionInterruption(state.id, interruption('target-lost'), { root: f.root });
  assert.throws(() => runner.recordExecutionInterruption(state.id, interruption('target-lost'), { root: f.root }), /budget/);
  assert.equal(runner.finishCase(state.id, { root: f.root }).execution.interventions.length, 8);
});

test('expired cases cannot resume or mutate but can record timeout and finish', async t => {
  const f = fixture(t), state = await f.prepare({ timeoutMs: 1000 }); f.control(state);
  runner.pauseCase(state.id, { root: f.root }); t.mock.timers.tick(1001);
  assert.throws(() => resume(state, f), /expired/);
  assert.throws(() => runner.assertDesktopActionable(state.id, { root: f.root }), /expired/);
  runner.recordExecutionInterruption(state.id, interruption('timeout'), { root: f.root });
  const report = runner.finishCase(state.id, { root: f.root }); assert.equal(report.execution.outcome, 'blocked');
  assert.equal(read(runner.pathsFor(state.id, f.root).state).deadlineAt, state.deadlineAt);
});

test('successful interaction and inspected denial stay separate from contract and source claims', async t => {
  const f = fixture(t), state = await f.prepare(); f.ready(state); f.send(state);
  f.observe(state, 'sent');
  f.observe(state, 'source-access', { status: 'failed', reason: 'access-failed', notes: publicDesktopNote('source-denied'),
    material: { kind: 'desktop-ui-check', method: 'visible-tool-result', ref: 'synthetic/access-failure' } });
  f.observe(state, 'completion', { notes: publicDesktopNote('orientation-visible') });
  runner.recordExecutionCleanup(state.id, { browser: 'closed', native: 'conversation-retained', ownership: 'owned-only' }, { root: f.root });
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.interactionPassed, true); assert.equal(report.sourceAccess, 'failed');
  assert.equal(report.execution.outcome, 'completed'); assert.equal(report.execution.contractQualified, true);
  assert.equal(report.outcome, 'interaction-completed-source-access-limited');
  assert.equal(report.summary.realClient.clients['codex-app'].sent.status, 'not-run');
});

test('cleanup is explicit, bounded, attributed, immutable and cannot be added after finish', async t => {
  const f = fixture(t), state = await f.prepare();
  assert.throws(() => runner.recordExecutionCleanup(state.id, { browser: 'closed', native: 'conversation-retained', ownership: 'owned-only', transcript: 'private' }, { root: f.root }), /bounded/);
  assert.throws(() => runner.recordExecutionCleanup(state.id, { browser: 'closed', native: 'conversation-retained', ownership: 'all-windows' }, { root: f.root }), /known/);
  const cleanup = runner.recordExecutionCleanup(state.id, { browser: 'retained-for-review', native: 'unsent-draft-retained', ownership: 'owned-only' }, { root: f.root });
  assert.equal(cleanup.attribution, 'controller'); assert.equal(cleanup.status, 'recorded');
  assert.throws(() => runner.recordExecutionCleanup(state.id, { browser: 'closed', native: 'not-created', ownership: 'owned-only' }, { root: f.root }), /immutable/);
  const report = runner.finishCase(state.id, { root: f.root }); assert.deepEqual(report.execution.cleanup, cleanup);
  assert.throws(() => runner.recordExecutionCleanup(state.id, { browser: 'closed', native: 'not-created', ownership: 'owned-only' }, { root: f.root }), /finished/);
});

test('unrecorded cleanup cannot qualify an otherwise completed contract', async t => {
  const f = fixture(t), state = await f.prepare(); f.ready(state); f.send(state);
  f.observe(state, 'sent'); f.observe(state, 'completion');
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.interactionPassed, true); assert.equal(report.execution.coherentStageProofs, true);
  assert.equal(report.execution.contractQualified, false); assert.equal(report.componentPathQualified, false);
  assert.deepEqual(report.execution.cleanup, { status: 'not-recorded' });
});

test('a human rescue after qualification is assistance even before the first handoff', async t => {
  const f = fixture(t), state = await f.prepare(); f.control(state);
  runner.recordExecutionInterruption(state.id, interruption('target-lost', 'human', 'locate-target'), { root: f.root });
  const report = runner.finishCase(state.id, { root: f.root });
  assert.equal(report.execution.interventions[0].phase, 'execution');
  assert.equal(report.execution.mode, 'human-assisted');
});

test('legacy resume wrappers record actual human restoration without extending the deadline', async t => {
  const f = fixture(t), state = await f.prepare(); f.control(state);
  runner.pauseCase(state.id, { root: f.root }); t.mock.timers.tick(500);
  const resumed = runner.resumeCase(state.id, { root: f.root, controllerId: TEST_CONTROLLER, confirmedUnlocked: true });
  assert.equal(resumed.deadlineAt, state.deadlineAt); assert.equal(resumed.execution.status, 'unqualified');
  assert.equal(resumed.execution.humanAssisted, true);
  assert.equal(resumed.execution.interventions.at(-1).humanAction, 'restore-access');
});

test('new qualifications invalidate earlier generation proofs even without interference', async t => {
  const f = fixture(t), state = await f.prepare(), arrived = f.ready(state);
  qualifyTestCase(state, f);
  assert.throws(() => runner.claimSend(state.id, { root: f.root, ...arrived }), /bound|inspection|generation/i);
  assert.equal(fs.existsSync(runner.pathsFor(state.id, f.root).claim), false);
});

test('finished reports are immutable and old cases cannot gain native action authority', async t => {
  const f = fixture(t), state = await f.prepare(), p = runner.pathsFor(state.id, f.root);
  const raw = read(p.state); delete raw.execution; delete raw.executionContract;
  fs.writeFileSync(p.state, JSON.stringify(raw) + '\n');
  assert.throws(() => runner.claimHandoff(state.id, { root: f.root }), /historical/i);
  assert.throws(() => qualifyTestCase(state, f), /Historical/);
  const report = runner.finishCase(state.id, { root: f.root }); assert.equal(report.execution, undefined);
  const before = fs.readFileSync(path.join(p.dir, 'report.json'), 'utf8');
  fs.writeFileSync(p.active, JSON.stringify({ id: state.id }) + '\n');
  assert.deepEqual(runner.finishCase(state.id, { root: f.root }), report);
  assert.equal(fs.existsSync(p.active), false); assert.equal(fs.readFileSync(path.join(p.dir, 'report.json'), 'utf8'), before);
  assert.throws(() => runner.claimSend(state.id, { root: f.root }), /finished/);
  const next = await f.prepare(); runner.finishCase(state.id, { root: f.root }); assert.equal(read(p.active).id, next.id);
});

test('a competing finish under the mutation lock cannot leave a new Send claim', async t => {
  const f = fixture(t), state = await f.prepare(); f.ready(state);
  const p = runner.pathsFor(state.id, f.root), open = fs.openSync; let competed = false;
  t.mock.method(fs, 'openSync', function(file, ...args) {
    if (file === p.mutex && !competed) { competed = true; runner.finishCase(state.id, { root: f.root }); }
    return open.call(this, file, ...args);
  });
  assert.throws(() => f.send(state), /finished|active|own/i);
  assert.equal(competed, true); assert.equal(fs.existsSync(p.claim), false);
});

test('run ownership lookup and adoption preserve consumed historical guards', async t => {
  for (const claimed of [false, true]) {
    const f = fixture(t), state = await f.prepare(); if (claimed) f.control(state).handoff();
    assert.deepEqual(runner.caseForRun(state.runId, { root: f.root }), { id: state.id, status: 'active' });
    runner.finishCase(state.id, { root: f.root });
    await assert.rejects(f.prepare({ runId: state.runId }), /bound|adopt|case|consumed/i);
    assert.deepEqual(runner.caseForRun(state.runId, { root: f.root }), { id: state.id, status: 'finished' });
  }
});

test('an adopted browser run cannot silently reset a requested handoff', async t => {
  const f = fixture(t), run = createRun(f.inputs.manifest, { id: 'reading-adopt-owned', environment: f.inputs.environment });
  run.observations.push({ id: 'obs-1', at: run.startedAt, ...browserRequest() });
  fs.mkdirSync(path.dirname(benchRun(f.root, run.id)), { recursive: true }); fs.writeFileSync(benchRun(f.root, run.id), JSON.stringify(run) + '\n');
  const state = await f.prepare({ runId: run.id }); assert.throws(() => f.control(state).handoff(), /already|handoff|launch/i);
});

test('adopted run configuration must match the new contract without rewriting original metadata', async t => {
  const f = fixture(t), environment = { ...f.inputs.environment, browser: { name: 'synthetic-stable-Chrome', version: 'different-2' } };
  const run = createRun(f.inputs.manifest, { id: 'reading-different-environment', environment });
  fs.mkdirSync(path.dirname(benchRun(f.root, run.id)), { recursive: true });
  fs.writeFileSync(benchRun(f.root, run.id), JSON.stringify(run) + '\n');
  const before = fs.readFileSync(benchRun(f.root, run.id), 'utf8');
  await assert.rejects(f.prepare({ runId: run.id }), /different recorded execution configuration/);
  assert.equal(fs.readFileSync(benchRun(f.root, run.id), 'utf8'), before);
  assert.equal(fs.existsSync(path.join(f.root, '.local/test-bench/desktop/active-claude.json')), false);
});

test('browser activation requires a current qualified reservation, while negative observations remain read only', async t => {
  const f = fixture(t), state = await f.prepare();
  assert.throws(() => runner.observeCase(state.id, browserRequest(), { root: f.root }), /unqualified/);
  const c = f.control(state);
  assert.throws(() => runner.observeCase(state.id, browserRequest(), { root: f.root }), /Reserve/);
  c.handoff(); runner.recordExecutionInterruption(state.id, interruption('input-interference'), { root: f.root });
  assert.throws(() => runner.observeCase(state.id, browserRequest(), { root: f.root }), /blocked/);
  runner.observeCase(state.id, { ...browserRequest(), status: 'not-observed', reason: 'unavailable' }, { root: f.root });
  assert.equal(read(benchRun(f.root, state.runId)).observations.at(-1).status, 'not-observed');
});

test('positive native stages cannot precede their action claim', async t => {
  const f = fixture(t), state = await f.prepare(); f.control(state);
  for (const claim of ['draft-arrived', 'context-matches', 'presentation-matches']) {
    assert.throws(() => f.observe(state, claim), /Claim handoff/);
  }
  for (const claim of ['sent', 'completion', 'source-access']) {
    for (const status of ['observed', 'failed']) assert.throws(() => f.observe(state, claim, { status, ...(status === 'failed' && { reason: 'access-failed' }) }), /Claim Send/);
  }
  assert.equal(read(benchRun(f.root, state.runId)).observations.length, 0);
});

function captureObservation(f, state, snapshot, claim, overrides = {}) {
  const executionProof = testExecutionProof(state, f.root, snapshot);
  const observation = desktop(claim, overrides);
  observation.material = { ...observation.material, captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, snapshotSha256: executionProof.snapshotSha256 };
  return { observation, executionProof };
}

test('draft observations require a distinct post-handoff capture in its owned window', async t => {
  const f = fixture(t), state = await f.prepare(), c = f.control(state), handoff = c.handoff();
  const before = { ...desktop('draft-arrived'), material: { kind: 'desktop-ui-check', method: 'visual-inspection',
    captureId: handoff.executionProof.captureId, capturedAt: handoff.executionProof.capturedAt, snapshotSha256: handoff.executionProof.snapshotSha256 } };
  assert.throws(() => runner.observeCase(state.id, before, { root: f.root, executionProof: handoff.executionProof }), /distinct post-handoff/);
  t.mock.timers.tick(1); const other = c.snapshot(f.inputs.context); other.windowId = 99; other.ownedWindowId = 99;
  const candidate = captureObservation(f, state, other, 'draft-arrived');
  assert.throws(() => runner.observeCase(state.id, candidate.observation, { root: f.root, executionProof: candidate.executionProof }), /same owned window/);
  assert.equal(read(benchRun(f.root, state.runId)).observations.length, 0);
});

test('post-Send facts reject the pre-Send capture and another owned window, including inspected failures', async t => {
  const f = fixture(t), state = await f.prepare(), arrived = f.ready(state); f.send(state);
  const pre = { ...desktop('completion'), material: { kind: 'desktop-ui-check', method: 'visual-inspection',
    captureId: arrived.executionProof.captureId, capturedAt: arrived.executionProof.capturedAt, snapshotSha256: arrived.executionProof.snapshotSha256 } };
  assert.throws(() => runner.observeCase(state.id, pre, { root: f.root, executionProof: arrived.executionProof }), /distinct post-Send/);
  t.mock.timers.tick(1);
  const other = f.control(state).snapshot(f.inputs.context); other.windowId = 99; other.ownedWindowId = 99;
  for (const claim of ['sent', 'completion', 'source-access']) for (const status of ['observed', 'failed']) {
    const candidate = captureObservation(f, state, other, claim, { status, ...(status === 'failed' && { reason: 'access-failed' }) });
    assert.throws(() => runner.observeCase(state.id, candidate.observation, { root: f.root, executionProof: candidate.executionProof }), /same owned window/);
  }
  assert.throws(() => runner.observeCase(state.id, desktop('source-access', { status: 'failed', reason: 'access-failed' }), { root: f.root }), /inspection proof/);
  f.observe(state, 'source-access', { status: 'failed', reason: 'access-failed', material: { kind: 'desktop-ui-check', method: 'visible-tool-result' } });
  assert.equal(read(benchRun(f.root, state.runId)).observations.at(-1).status, 'failed');
});

test('Send cannot reuse a prior-generation exact comparison for a freshly qualified arrival', async t => {
  const f = fixture(t), state = await f.prepare(); f.ready(state); qualifyTestCase(state, f); t.mock.timers.tick(1);
  const snapshot = f.control(state).snapshot(f.inputs.context), p = runner.pathsFor(state.id, f.root), handoff = read(p.handoff);
  const arrival = inspectClaudeArrival(snapshot, { freshChat: true, scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4,
    codeModeIndex: 5, launchResolved: true, readiness: handoff.readiness, handoff, now: Date.now() });
  const candidate = captureObservation(f, state, snapshot, 'draft-arrived');
  runner.observeCase(state.id, candidate.observation, { root: f.root, executionProof: candidate.executionProof });
  assert.throws(() => runner.claimSend(state.id, { root: f.root, arrival, executionProof: candidate.executionProof }), /same qualified capture/);
  assert.equal(fs.existsSync(p.claim), false);
  const compared = captureObservation(f, state, snapshot, 'context-matches', { material: { kind: 'desktop-ui-check', method: 'composer-utf8-sha256', contextSha256: f.inputs.manifest.contextSha256 } });
  runner.observeCase(state.id, compared.observation, { root: f.root, executionProof: compared.executionProof });
  assert.equal(runner.claimSend(state.id, { root: f.root, arrival, executionProof: candidate.executionProof }).maximumAttempts, 1);
});

test('launch permission stays a separate bounded observation and cannot qualify native capture stages', async t => {
  const f = fixture(t), state = await f.prepare(); f.control(state).handoff();
  runner.observeCase(state.id, desktop('permission'), { root: f.root });
  const saved = read(runner.pathsFor(state.id, f.root).state);
  assert.equal(saved.execution.stageProofs?.permission, undefined);
  assert.throws(() => runner.observeCase(state.id, desktop('draft-arrived'), { root: f.root }), /inspection proof/);
  const report = runner.finishCase(state.id, { root: f.root }); assert.equal(report.execution.contractQualified, false);
});

test('the controller module imports in a VM with no process global', () => {
  const script = `import assert from 'node:assert/strict'; import fs from 'node:fs'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
    const entry = process.argv[1], context = vm.createContext({ console, URL });
    assert.equal(vm.runInContext('typeof process', context), 'undefined');
    const module = new vm.SourceTextModule(fs.readFileSync(fileURLToPath(entry), 'utf8'), { context, identifier: entry, initializeImportMeta(meta) { meta.url = entry; } });
    await module.link(async specifier => { const namespace = await import(specifier.startsWith('.') ? new URL(specifier, entry).href : specifier), names = Object.keys(namespace);
      return new vm.SyntheticModule(names, function() { for (const name of names) this.setExport(name, namespace[name]); }, { context }); });
    await module.evaluate(); assert.equal(typeof module.namespace.qualifyCase, 'function'); process.stdout.write('process-less import passed');`;
  const result = spawnSync(process.execPath, ['--experimental-vm-modules', '--no-warnings', '--input-type=module', '-e', script,
    new URL('./desktop-runner.mjs', import.meta.url).href], { encoding: 'utf8', shell: false, timeout: 10000 });
  assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, 'process-less import passed');
});
