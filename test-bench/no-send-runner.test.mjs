/** Synthetic CUA handles and rollback fixtures; no app, model or network. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createNoSendExecutionContract, validateExecutionContract } from './execution-contract.mjs';
import * as diagnostic from './no-send-runner.mjs';
import * as runner from './desktop-runner.mjs';
import { authorityCasePaths } from './authority-store.mjs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
async function fixture(t) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-no-send-synthetic-'));
  const root = path.join(base, 'guest'), authorityRoot = path.join(base, 'host-authority'); fs.mkdirSync(root); fs.mkdirSync(authorityRoot);
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const environment = { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-Chrome', version: '1' }, apps: { 'claude-app': { version: '1' } } };
  const inputs = { manifest: { sdkVersion: '0.1.4', archiveSha256: runner.SDK_SHA256 }, environment };
  const prepare = options => diagnostic.prepareDiagnostic({ root, authorityRoot, inputs, authorizeProbe: true, ...options });
  const state = await prepare(), p = authorityCasePaths(state.id, root), controllerId = 'synthetic-diagnostic-controller';
  const capabilities = { controllerId, configuration: environment, interface: 'cua', browserBundleId: 'com.google.Chrome',
    clientBundleId: 'com.anthropic.claudefordesktop', permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels' };
  let value = '', focused = false, sequence = 0;
  const calls = [];
  const app = { async click(index) { calls.push(['click', index]); focused = true; }, async typeText(text) { calls.push(['typeText', text]); value = text; },
    async setValue(index, text) { calls.push(['setValue', index, text]); value = text; }, async pressKey() { throw Error('No keypress allowed'); } };
  const node = (index, role, label, extra = {}) => ({ index, role, label, visible: true, enabled: true, ...extra });
  const capture = () => { t.mock.timers.tick(1); return { captureId: 'synthetic-no-send-' + ++sequence, capturedAt: new Date().toISOString(),
    bundleId: 'com.anthropic.claudefordesktop', windowId: 88, ownedWindowId: 88, owned: true, complete: true, documentUrl: 'https://claude.ai/new',
    focus: { status: 'observed', index: focused ? 2 : 1 }, nodes: [node(1, 'group', 'Owned synthetic Chat'), node(2, 'text entry area', 'Composer', { value, parentIndex: 1 }),
      node(3, 'button', 'Send', { parentIndex: 1 }), node(4, 'radio button', 'Claude', { value: '1' }), node(5, 'radio button', 'Code', { value: '0' }),
      node(99, 'static text', 'SYNTHETIC_PRIVATE_SENTINEL', { visible: false })] }; };
  const selection = () => ({ freshChat: true, scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4, codeModeIndex: 5,
    execution: { controllerId, generation: read(p.state).execution.generation, inputOwnership: 'exclusive', visualAgreement: 'agrees' } });
  const session = () => diagnostic.createDiagnosticSession({ caseId: state.id, app, controllerId, root });
  const qualify = () => diagnostic.qualifyDiagnostic(state.id, capabilities, { root });
  const reconcile = () => diagnostic.reconcileDiagnostic(state.id, { root, controllerId, previousControllerStopped: true, exclusiveInput: true });
  const f = { base, root, authorityRoot, inputs, prepare, state, p, controllerId, calls, app, capture, selection, session, qualify, reconcile,
    setValue: text => { value = text; } };
  f.focus = async () => { const s = session(); await s.focus(capture(), selection()); s.observeFocus(capture(), selection()); return s; };
  f.marker = async () => { const s = await f.focus(); await s.typeMarker(capture(), selection()); s.observeMarker(capture(), selection()); return s; };
  return f;
}

test('dedicated contract is pinned to zero handoffs/Sends; normal APIs cannot launch or submit it', async t => {
  const f = await fixture(t), contract = f.state.executionContract;
  assert.equal(contract.authority.maximumHandoffs, 0); assert.equal(contract.authority.maximumSends, 0);
  assert.equal(validateExecutionContract(contract), true);
  assert.throws(() => validateExecutionContract({ ...contract, authority: { ...contract.authority, maximumSends: 1 } }), /authority/);
  await assert.rejects(f.prepare({ authorizeProbe: false }), /authorization/);
  assert.throws(() => runner.claimSend(f.state.id, { root: f.root }), /Invalid desktop case/);
  assert.throws(() => runner.claimHandoff(f.state.id, { root: f.root }), /Invalid desktop case/);
  assert.deepEqual(f.calls, []);
});

test('complete public marker flow records effects separately and never calls Send or keys', async t => {
  const f = await fixture(t); f.qualify(); const session = await f.marker();
  const returned = await session.clearMarker(f.capture(), f.selection());
  assert.equal(returned.effect, 'not-observed');
  session.observeEmpty(f.capture(), f.selection());
  diagnostic.recordDiagnosticIndependence(f.state.id, { status: 'observed', source: 'controller' }, { root: f.root });
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.passed, true); assert.equal(report.markerCleanup, 'observed-empty');
  assert.deepEqual(f.calls, [['click', 2], ['typeText', f.state.marker], ['setValue', 2, '']]);
  assert.equal(fs.existsSync(f.p.claim), false); assert.equal(fs.existsSync(f.p.handoff), false);
  assert.equal(JSON.stringify(report).includes('SYNTHETIC_PRIVATE_SENTINEL'), false);
  assert.equal(JSON.stringify(read(f.p.state)).includes('SYNTHETIC_PRIVATE_SENTINEL'), false);
});

test('unqualified, private/nonempty, stale and conflicting surfaces block before any input', async t => {
  const f = await fixture(t);
  await assert.rejects(f.session().focus(f.capture(), f.selection()), /qualification/);
  assert.deepEqual(f.calls, []);
  f.reconcile(); f.qualify();
  f.setValue('SYNTHETIC_PRIVATE_DRAFT');
  await assert.rejects(f.session().focus(f.capture(), f.selection()), /composer/);
  assert.equal(JSON.stringify(read(f.p.state)).includes('SYNTHETIC_PRIVATE_DRAFT'), false);
  f.reconcile(); f.qualify(); f.setValue('');
  const stale = f.capture(); t.mock.timers.tick(30001);
  await assert.rejects(f.session().focus(stale, f.selection()), /inspection/);
  f.reconcile(); f.qualify();
  const selection = f.selection(); selection.execution.visualAgreement = 'conflicts';
  await assert.rejects(f.session().focus(f.capture(), selection), /inspection/);
  assert.deepEqual(f.calls, []);
});

test('effects require distinct post-action captures and current focus before typing', async t => {
  const f = await fixture(t); f.qualify(); const session = f.session(), before = f.capture();
  await session.focus(before, f.selection());
  assert.throws(() => session.observeFocus(before, f.selection()), /focus|post-action/);
  f.reconcile(); f.qualify(); session.observeFocus(f.capture(), f.selection());
  const wrongFocus = f.capture(); wrongFocus.focus.index = 1;
  await assert.rejects(session.typeMarker(wrongFocus, f.selection()), /focus/);
  assert.equal(f.calls.filter(call => call[0] === 'typeText').length, 0);
});

test('a rejected input stays consumed across recreated sessions and workspace rollback', async t => {
  const f = await fixture(t); f.qualify(); const session = await f.focus();
  const snapshot = path.join(f.base, 'snapshot'); fs.cpSync(f.root, snapshot, { recursive: true });
  f.app.typeText = async text => { f.calls.push(['typeText', text]); throw Error('synthetic uncertain delivery'); };
  await assert.rejects(session.typeMarker(f.capture(), f.selection()), /uncertain delivery/);
  fs.rmSync(f.root, { recursive: true }); fs.cpSync(snapshot, f.root, { recursive: true });
  const recovered = f.reconcile(); assert.deepEqual(recovered.consumedInputs, ['focus', 'type']);
  f.qualify();
  await assert.rejects(f.session().typeMarker(f.capture(), f.selection()), /focus|EEXIST/);
  assert.equal(f.calls.filter(call => call[0] === 'typeText').length, 1);
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.outcome, 'indeterminate'); assert.equal(report.passed, false);
  assert.equal(report.markerCleanup, 'unconfirmed-public-marker-may-remain');
});

test('clear never touches changed content and interrupted effects cannot produce a pass', async t => {
  const f = await fixture(t); f.qualify(); const session = await f.marker();
  f.setValue('SYNTHETIC_UNRELATED_DRAFT');
  await assert.rejects(session.clearMarker(f.capture(), f.selection()), /composer/);
  assert.equal(f.calls.some(call => call[0] === 'setValue'), false);
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.passed, false); assert.equal(report.markerCleanup, 'unconfirmed-public-marker-may-remain');
  assert.equal(JSON.stringify(report).includes('SYNTHETIC_UNRELATED_DRAFT'), false);
});

test('operator-reported independence stays attributed and cannot pass the unassisted gate', async t => {
  const f = await fixture(t); f.qualify(); const s = await f.marker(); await s.clearMarker(f.capture(), f.selection()); s.observeEmpty(f.capture(), f.selection());
  diagnostic.recordDiagnosticIndependence(f.state.id, { status: 'observed', source: 'operator-report' }, { root: f.root });
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.interactionObserved, true); assert.equal(report.passed, false);
  assert.equal(report.independence.source, 'operator-report');
});

test('expired and terminal cases cannot input or regain attempts through recovery', async t => {
  const f = await fixture(t); f.qualify(); t.mock.timers.tick(180001);
  await assert.rejects(f.session().focus(f.capture(), f.selection()), /deadline/);
  assert.deepEqual(f.calls, []);
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.passed, false);
  const recovered = f.reconcile(); assert.equal(recovered.terminal, true);
  await assert.rejects(f.session().focus(f.capture(), f.selection()), /finished/);
});

test('an uncertain typed marker may be observed and safely cleared after recovery without retyping', async t => {
  const f = await fixture(t); f.qualify(); const s = await f.focus();
  f.app.typeText = async text => { f.calls.push(['typeText', text]); f.setValue(text); throw Error('synthetic ambiguous return'); };
  await assert.rejects(s.typeMarker(f.capture(), f.selection()), /ambiguous return/);
  const consumed = f.reconcile(); assert.deepEqual(consumed.consumedInputs, ['focus', 'type']); f.qualify();
  const recovered = f.session(); recovered.observeMarker(f.capture(), f.selection());
  await recovered.clearMarker(f.capture(), f.selection()); recovered.observeEmpty(f.capture(), f.selection());
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.markerCleanup, 'observed-empty'); assert.equal(report.passed, false);
  assert.equal(f.calls.filter(call => call[0] === 'typeText').length, 1);
});

test('focus and clear claims cannot be repeated by recreated sessions', async t => {
  const f = await fixture(t); f.qualify(); const s = await f.focus();
  await assert.rejects(f.session().focus(f.capture(), f.selection()), /EEXIST/);
  assert.equal(f.calls.filter(call => call[0] === 'click').length, 1);
  f.reconcile(); f.qualify(); s.observeFocus(f.capture(), f.selection());
  await s.typeMarker(f.capture(), f.selection()); s.observeMarker(f.capture(), f.selection());
  await s.clearMarker(f.capture(), f.selection()); s.observeEmpty(f.capture(), f.selection());
  f.setValue(f.state.marker);
  await assert.rejects(f.session().clearMarker(f.capture(), f.selection()), /EEXIST/);
  assert.equal(f.calls.filter(call => call[0] === 'setValue').length, 1);
});

test('interruption during an awaited native call cannot make a late return requalify the case', async t => {
  const f = await fixture(t); f.qualify(); let release;
  f.app.click = () => new Promise(resolve => { release = resolve; });
  const pending = f.session().focus(f.capture(), f.selection());
  diagnostic.interruptDiagnostic(f.state.id, 'input-interference', { root: f.root });
  release(); await assert.rejects(pending, /interrupted/);
  assert.equal(read(f.p.state).execution.status, 'blocked');
  assert.equal(diagnostic.finishDiagnostic(f.state.id, { root: f.root }).outcome, 'indeterminate');
});

test('controller recovery is retained and cannot be reported as an uninterrupted diagnostic pass', async t => {
  const f = await fixture(t); f.qualify(); f.reconcile(); f.qualify();
  const s = await f.marker(); await s.clearMarker(f.capture(), f.selection()); s.observeEmpty(f.capture(), f.selection());
  diagnostic.recordDiagnosticIndependence(f.state.id, { status: 'observed', source: 'controller' }, { root: f.root });
  const report = diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  assert.equal(report.interactionObserved, true); assert.equal(report.passed, false);
  assert.equal(report.recoveries.length, 1); assert.equal(report.recoveries[0].attribution, 'controller');
});

test('durability failure prevents native typing while retaining the consumed attempt', async t => {
  const f = await fixture(t); f.qualify(); const s = await f.focus();
  const target = path.join(f.p.dir, 'diagnostic-type-claimed.json');
  const open = fs.openSync, sync = fs.fsyncSync; let targetFd;
  t.mock.method(fs, 'openSync', function (file, ...args) {
    const fd = open.call(this, file, ...args); if (file === target) targetFd = fd; return fd;
  });
  t.mock.method(fs, 'fsyncSync', function (fd) {
    if (fd === targetFd) { targetFd = undefined; throw Error('Synthetic claim fsync failure'); }
    return sync.call(this, fd);
  });
  await assert.rejects(s.typeMarker(f.capture(), f.selection()), /fsync failure/);
  assert.equal(f.calls.some(call => call[0] === 'typeText'), false);
  assert.equal(fs.existsSync(target), true);
  f.reconcile(); f.qualify(); s.observeFocus(f.capture(), f.selection());
  await assert.rejects(f.session().typeMarker(f.capture(), f.selection()), /EEXIST/);
  assert.equal(f.calls.some(call => call[0] === 'typeText'), false);
});

test('diagnostic and normal cases share the same exclusive Claude reservation', async t => {
  const f = await fixture(t);
  const inputs = { ...f.inputs, context: f.state.marker, manifest: f.state.executionContract.payload };
  await assert.rejects(runner.prepareCase({ root: f.root, inputs, allowSend: true }), /EEXIST/);
  diagnostic.finishDiagnostic(f.state.id, { root: f.root });
  await runner.prepareCase({ root: f.root, inputs, allowSend: true });
  await assert.rejects(f.prepare(), /EEXIST/);
  assert.deepEqual(f.calls, []);
});
