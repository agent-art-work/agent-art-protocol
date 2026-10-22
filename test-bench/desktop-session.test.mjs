import { setupTestAuthority } from './execution-fixture.mjs';
import { resolveAuthorityStore } from './authority-store.mjs';
/** Contract tests with a fake CUA handle. No browser or native app is used. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createDesktopSession } from './desktop-session.mjs';
import { TEST_CONTROLLER, qualifyTestCase, withExecutionAssessments, testExecutionProof, executionAssessment } from './execution-fixture.mjs';
import { SDK_SHA256, prepareCase, pathsFor, claimHandoff, observeCase } from './desktop-runner.mjs';
import { CLAUDE_BUNDLE_ID } from './desktop-ui.mjs';

const privateSentinel = 'SYNTHETIC_UNRELATED_AX_PRIVATE_SENTINEL';
const node = (index, role, label, overrides = {}) => ({ index, role, label, visible: true, enabled: true, ...overrides });
async function fixture(t) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-desktop-session-contract-'));
  setupTestAuthority(t, root);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const context = 'Synthetic public invitation for the Lab reading trial.\n\nExact Unicode: 意.\r\n';
  const inputs = { context, manifest: { id: 'synthetic-public-session-sdk014', workId: 'https://public.example/#reading', workVersion: '1', sdkVersion: '0.1.4', archiveSha256: SDK_SHA256,
    contextSha256: createHash('sha256').update(context).digest('hex'), contextBytes: Buffer.byteLength(context) },
  environment: { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-stable-Chrome', version: '1' }, apps: { 'claude-app': { version: 'synthetic-1' } } } };
  const state = await prepareCase({ root, inputs, allowSend: true });

  let captures = 0;
  const snapshot = nodes => ({ captureId: `synthetic-capture-${++captures}`, capturedAt: new Date().toISOString(), bundleId: CLAUDE_BUNDLE_ID,
    windowId: 88, ownedWindowId: 88, owned: true, complete: true, documentUrl: 'https://claude.ai/new', nodes });
  const draft = (text = context) => snapshot([
    node(0, 'standard window', 'Claude', { secondaryActions: ['Raise'] }),
    node(1, 'AXGroup', 'Owned new conversation'),
    node(2, 'AXTextArea', 'Reply to Claude', { value: text, parentIndex: 1 }),
    node(3, 'AXButton', 'Send', { parentIndex: 1 }),
    node(4, 'AXRadioButton', 'Claude', { value: '1' }),
    node(5, 'AXRadioButton', 'Code', { value: '0' }),
    node(99, 'AXStaticText', privateSentinel, { visible: false }),
  ]);
  const sent = (text = context, role = 'AXStaticText') => snapshot([
    node(20, 'AXGroup', 'Owned public user message'),
    node(21, role, text, { parentIndex: 20 }),
    node(99, 'AXStaticText', privateSentinel, { visible: false }),
  ]);
  const clicks = [], raises = [], app = { async performSecondaryAction(index, action) { raises.push([index, action]); }, async getAXState() { return draft(); }, async click(index) { clicks.push(index); t.mock.timers.tick(1); } };
  qualifyTestCase(state, { root, inputs: inputs });
  const session = () => withExecutionAssessments(createDesktopSession({ caseId: state.id, app, root, controllerId: TEST_CONTROLLER }));
  session().prepareLaunch(draft(''), { freshChat: true, scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4, codeModeIndex: 5 });
  t.mock.timers.tick(1);
  observeCase(state.id, { lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation', material: { kind: 'browser-event', ref: 'synthetic/native-click' } }, { root });
  const capture = async () => ({ snapshot: await app.getAXState(), composerIndex: 2, scopeIndex: 1, claudeModeIndex: 4, codeModeIndex: 5, freshConversation: true, surface: 'claude-chat', launchResolved: true });
  const run = () => JSON.parse(fs.readFileSync(path.join(root, '.local/test-bench/runs', state.runId + '.json'), 'utf8'));
  return { root, context, inputs, state, snapshot, draft, sent, clicks, raises, app, session, capture, run };
}
function storedText(root) {
  const visit = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? visit(path.join(dir, entry.name)) : [fs.readFileSync(path.join(dir, entry.name), 'utf8')]);
  return [...visit(root), ...visit(resolveAuthorityStore(root).directory)].join('\n');
}

test('one exact fresh draft invokes the selected control once and records evidence automatically', async t => {
  const f = await fixture(t), session = f.session();
  const result = await session.submit(f.capture);
  assert.equal(result.attempted, true); assert.equal(result.sendIndex, 3); assert.deepEqual(f.clicks, [3]);
  const observations = f.run().observations;
  assert.deepEqual(observations.map(item => item.claim), ['handoff-requested', 'draft-arrived', 'context-matches']);
  assert.equal(observations[2].material.contextSha256, f.inputs.manifest.contextSha256);
  assert.equal(observations[2].material.method, 'composer-utf8-sha256');
  assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), true);
  assert.equal(observations.some(item => item.claim === 'sent'), false, 'a click alone never records delivery');
  const dispatch = session.finish().sendDispatch;
  assert.deepEqual(dispatch, { status: 'returned', boundary: 'controller-app-click', nativeDelivery: 'not-established' });
  const persisted = storedText(f.root);
  assert.equal(persisted.includes(privateSentinel), false); assert.equal(persisted.includes('"nodes"'), false);
  assert.equal(persisted.includes(f.root), false, 'material references remain relative');
});

test('repeat and recreated sessions cannot click Send twice after an uncertain click failure', async t => {
  const f = await fixture(t);
  f.app.click = async index => { f.clicks.push(index); throw Error('Synthetic ambiguous click failure'); };
  const first = f.session();
  await assert.rejects(first.submit(f.capture), /ambiguous click/);
  await assert.rejects(first.submit(f.capture), /EEXIST|claimed|already/i);
  await assert.rejects(f.session().submit(f.capture), /EEXIST|claimed|already/i);
  assert.deepEqual(f.clicks, [3]); assert.equal(f.raises.length, 1);
  const report = first.finish();
  assert.equal(report.sendClaimed, true); assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
});

test('a mismatch makes no click and persists no AX text or private composer value', async t => {
  const f = await fixture(t), session = f.session();
  f.app.getAXState = async () => f.draft(privateSentinel);
  await assert.rejects(session.submit(f.capture), /does not match/);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
  const mismatch = f.run().observations.at(-1);
  assert.equal(mismatch.claim, 'context-matches'); assert.equal(mismatch.status, 'failed');
  const persisted = storedText(f.root);
  assert.equal(persisted.includes(privateSentinel), false); assert.equal(persisted.includes('"nodes"'), false);
  assert.equal(persisted.includes('"value"'), false); assert.equal(persisted.includes('"label"'), false);
});

test('old conversations, wrong surfaces and ambiguous submit controls never click', async t => {
  const f = await fixture(t), session = f.session();
  for (const overrides of [{ freshConversation: false }, { surface: 'claude-code' }]) {
    await assert.rejects(session.submit(async () => ({ ...await f.capture(), ...overrides })), /fresh Claude Chat/);
  }
  const duplicate = f.draft(); duplicate.nodes.push(node(6, 'AXButton', 'Submit', { parentIndex: 1 }));
  await assert.rejects(session.submit(async () => ({ ...await f.capture(), snapshot: f.snapshot(duplicate.nodes) })), /unique enabled Send/);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('sent confirmation requires exact static public text in the selected owned user-message region', async t => {
  const f = await fixture(t), session = f.session(); await session.submit(f.capture);
  const selection = { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true };
  assert.throws(() => session.confirmSent(f.sent('A complete-looking but different public message.'), selection), /exact|public message/i);
  assert.throws(() => session.confirmSent(f.sent(f.context, 'AXTextArea'), selection), /static|message|sent/i);
  assert.throws(() => session.confirmSent(f.sent(), { ...selection, ownedUserMessage: false }), /owned|user.message/i);
  const wrongScope = f.sent(); wrongScope.nodes.push(node(30, 'AXGroup', 'Different region')); wrongScope.nodes[1].parentIndex = 30;
  assert.throws(() => session.confirmSent(wrongScope, selection), /region|scope|belong/i);
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
  const actual = f.sent(), result = session.confirmSent(actual, selection);
  const observed = result.run.observations.at(-1);
  assert.equal(observed.claim, 'sent'); assert.equal(observed.status, 'observed');
  const material = JSON.parse(fs.readFileSync(path.join(f.root, '.local/test-bench', observed.material.ref), 'utf8'));
  const expectedDigest = createHash('sha256').update(JSON.stringify({ captureId: actual.captureId, capturedAt: actual.capturedAt,
    bundleId: actual.bundleId, windowId: actual.windowId, nodes: actual.nodes })).digest('hex');
  assert.equal(material.evidence.snapshotSha256, expectedDigest, 'sent material binds the original AX capture');
  assert.equal(storedText(f.root).includes(privateSentinel), false);
});

test('a sent-looking message before a durable claim cannot establish Send', async t => {
  const f = await fixture(t), session = f.session();
  assert.throws(() => session.confirmSent(f.sent(), { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true }), /claimed/i);
  assert.deepEqual(f.clicks, []); assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
});

test('a pre-Send capture or reused draft capture cannot confirm the later Send', async t => {
  const f = await fixture(t), session = f.session();
  const before = f.sent();
  await session.submit(f.capture);
  const selection = { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true };
  assert.throws(() => session.confirmSent(before, selection), /new capture after/);
  const claimed = JSON.parse(fs.readFileSync(pathsFor(f.state.id, f.root).claim, 'utf8'));
  const replay = f.sent(); replay.captureId = claimed.preSendCaptureId;
  assert.throws(() => session.confirmSent(replay, selection), /new capture after/);
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
  assert.deepEqual(f.clicks, [3], 'rejected confirmation never repeats the action');
  assert.equal(session.confirmSent(f.sent(), selection).run.observations.at(-1).claim, 'sent');
});

test('finished sessions cannot add orphan material when submit or confirmation is rejected', async t => {
  const f = await fixture(t), session = f.session();
  await session.submit(f.capture); session.finish();
  const directory = pathsFor(f.state.id, f.root).dir;
  const before = fs.readdirSync(directory).sort();
  await assert.rejects(session.submit(f.capture), /finished/);
  assert.throws(() => session.confirmSent(f.sent(), { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true }), /finished/);
  assert.deepEqual(fs.readdirSync(directory).sort(), before);
  assert.deepEqual(f.clicks, [3]); assert.equal(f.raises.length, 1);
});

test('an expired session rejects its fresh capture without adding material', async t => {
  const f = await fixture(t), session = f.session();
  const directory = pathsFor(f.state.id, f.root).dir;
  const before = fs.readdirSync(directory).sort();
  t.mock.timers.tick(900001);
  await assert.rejects(session.submit(f.capture), /expired/);
  assert.deepEqual(fs.readdirSync(directory).sort(), before);
  assert.deepEqual(f.clicks, []); assert.equal(f.raises.length, 0);
});

test('session rejects a legacy launch claim without its empty-Chat readiness proof', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root);
  const claim = JSON.parse(fs.readFileSync(p.handoff)); delete claim.readiness;
  fs.writeFileSync(p.handoff, JSON.stringify(claim));
  const before = f.run().observations.length;
  await assert.rejects(f.session().submit(f.capture), /empty-Chat preflight/);
  assert.deepEqual(f.clicks, []); assert.equal(f.run().observations.length, before);
  assert.equal(fs.existsSync(p.claim), false);
});

test('pending launch, empty composer and old Chat cannot be recorded as arrived', async t => {
  const f = await fixture(t), session = f.session(), before = f.run().observations.length;
  for (const change of [
    value => ({ ...value, launchResolved: false }),
    value => ({ ...value, snapshot: f.draft('\n') }),
    value => ({ ...value, snapshot: { ...value.snapshot, documentUrl: 'https://claude.ai/chat/synthetic-owned-old' } }),
  ]) await assert.rejects(session.submit(async () => change(await f.capture())), /arrival readiness failed/);
  assert.deepEqual(f.clicks, []); assert.equal(f.run().observations.length, before);
  assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('preflight rejects owned leftover draft and cannot reserve a second launch', async t => {
  const f = await fixture(t), session = f.session();
  const select = { freshChat: true, scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4, codeModeIndex: 5 };
  assert.throws(() => session.prepareLaunch(f.draft('Synthetic previous public draft'), select), /composer-not-empty/);
  assert.throws(() => session.prepareLaunch(f.draft(''), select), /EEXIST|already|claimed/);
  assert.deepEqual(f.clicks, []);
});

test('source-only recording retains inspected denial scope and never asserts reply completion', async t => {
  const f = await fixture(t), session = f.session();
  await session.submit(f.capture);
  const s = f.snapshot([
    node(30, 'AXGroup', 'Expanded HTTP tool output'),
    node(31, 'AXButton', 'Download index headers', { parentIndex: 30 }),
    node(32, 'AXLink', 'https://public.example/index.json', { value: 'public.example/index.json', parentIndex: 30 }),
    node(33, 'AXStaticText', 'HTTP 403 Forbidden', { parentIndex: 30 }),
  ]);
  const classified = session.recordResult(s, { toolResults: [{ owned: true, captureId: s.captureId, scopeIndex: 30,
    urlIndex: 32, bodyIndex: 33, sourceUrl: 'https://public.example/index.json', representation: 'access-denial',
    provenance: { kind: 'expanded-tool-result', captureId: s.captureId, toolControlIndex: 31 } }] });
  assert.equal(classified.sourceResults[0].status, 'failed');
  const o = f.run().observations.at(-1);
  const material = JSON.parse(fs.readFileSync(path.join(f.root, '.local/test-bench', o.material.ref)));
  assert.equal(material.sourceDetails.scope, 'visible-tool-access-denial');
  assert.equal(material.sourceDetails.representation, 'access-denial');
  assert.equal(material.sourceDetails.rawByteIdentity, 'not-established');
  assert.equal(f.run().observations.some(item => item.claim === 'completion'), false);
  assert.equal(storedText(f.root).includes('HTTP 403 Forbidden'), false);
});

test('Agent selections cannot relax the fixed post-Send freshness bound', async t => {
  const f = await fixture(t), session = f.session(); await session.submit(f.capture);
  const stale = f.sent(), before = f.run().observations.length;
  t.mock.timers.tick(30001);
  assert.throws(() => session.confirmSent(stale, { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true, maxAgeMs: 999999 }), /stale/);
  assert.throws(() => session.recordResult(stale, { toolResults: [], maxAgeMs: 999999 }), /stale|blocked/);
  assert.equal(f.run().observations.length, before); assert.deepEqual(f.clicks, [3]);
});

test('Raise failure leaves Send unclaimed and records no draft-arrival success', async t => {
  const f = await fixture(t), session = f.session();
  f.app.performSecondaryAction = async () => { throw Error('Synthetic Raise failure'); };
  await assert.rejects(session.submit(f.capture), /Raise failure/);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
  assert.equal(f.run().observations.some(o => o.claim === 'draft-arrived'), false);
});

test('a different surface after Raise cannot consume the Send claim', async t => {
  const f = await fixture(t), session = f.session();
  f.app.performSecondaryAction = async () => {
    f.app.getAXState = async () => ({ ...f.draft(), documentUrl: 'https://claude.ai/chat/synthetic-unowned-surface' });
  };
  await assert.rejects(session.submit(f.capture), /new-chat-not-established/);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
  assert.equal(f.run().observations.some(o => o.claim === 'draft-arrived'), false);
});

test('Send uses only the new control index observed after Raise', async t => {
  const f = await fixture(t), session = f.session(); let raised = false;
  f.app.performSecondaryAction = async (index, action) => { assert.equal(index, 0); assert.equal(action, 'Raise'); raised = true; };
  f.app.getAXState = async () => { const s = f.draft(); if (raised) s.nodes.find(n => n.index === 3).index = 8; return s; };
  await session.submit(f.capture);
  assert.deepEqual(f.clicks, [8]);
  const material = JSON.parse(fs.readFileSync(path.join(f.root, '.local/test-bench', f.run().observations.find(o => o.claim === 'draft-arrived').material.ref)));
  assert.equal(material.readiness.raiseAndRecapture, true);
  assert.equal(material.readiness.windowBinding, 'controller-attributed');
});

test('a case finishing during the awaited first capture cannot Raise or Send', async t => {
  const f = await fixture(t), session = f.session();
  await assert.rejects(session.submit(async () => {
    const captured = await f.capture(); session.finish(); return captured;
  }), /finished/);
  assert.deepEqual(f.raises, []); assert.deepEqual(f.clicks, []);
  assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('entered dispatch is durable before invoking the handle and records no native delivery', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session();
  f.app.click = async index => {
    f.clicks.push(index);
    const entered = JSON.parse(fs.readFileSync(p.dispatchEntered, 'utf8'));
    assert.equal(entered.stage, 'entered'); assert.equal(entered.controlIndex, index);
    assert.equal(entered.caseId, f.state.id); assert.equal(entered.runId, f.state.runId);
    assert.equal(entered.sendClaimedAt, JSON.parse(fs.readFileSync(p.claim, 'utf8')).claimedAt);
    assert.equal(fs.existsSync(p.dispatchResult), false);
    return { syntheticPrivateReturn: privateSentinel };
  };
  await session.submit(f.capture);
  assert.equal(JSON.parse(fs.readFileSync(p.dispatchResult)).stage, 'returned');
  assert.equal(f.run().observations.some(o => o.claim === 'sent'), false);
  assert.equal(storedText(f.root).includes(privateSentinel), false);
  assert.equal(session.finish().sendDispatch.nativeDelivery, 'not-established');
});

test('Error and primitive click rejections retain their original values with bounded diagnostics', async t => {
  const opaque = new Proxy({}, { getPrototypeOf() { throw Error(privateSentinel); } });
  for (const [value, kind] of [[Error(privateSentinel), 'Error'], [undefined, 'undefined'], [null, 'null'], [privateSentinel, 'string'], [opaque, 'object']]) {
    await t.test(kind, async child => {
      const f = await fixture(child), p = pathsFor(f.state.id, f.root), session = f.session();
      f.app.click = async index => { f.clicks.push(index); throw value; };
      let caught = false;
      try { await session.submit(f.capture); } catch (error) { caught = true; assert.equal(error, value); }
      assert.equal(caught, true);
      const result = JSON.parse(fs.readFileSync(p.dispatchResult));
      assert.equal(result.stage, 'rejected'); assert.equal(result.rejectionKind, kind);
      assert.equal(storedText(f.root).includes(privateSentinel), false);
      await assert.rejects(session.submit(f.capture), /claimed/);
      assert.deepEqual(f.clicks, [3]);
      assert.equal(session.finish().sendDispatch.status, 'rejected');
      assert.equal(f.run().observations.some(o => o.claim === 'sent'), false);
    });
  }
});

test('a pending dispatch remains ambiguous without retry and writes nothing after finish', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session();
  let resolveClick, entered;
  const invocation = new Promise(resolve => { entered = resolve; });
  f.app.click = index => { f.clicks.push(index); entered(); return new Promise(resolve => { resolveClick = resolve; }); };
  const pending = session.submit(f.capture); await invocation;
  await assert.rejects(f.session().submit(f.capture), /claimed/);
  assert.deepEqual(f.clicks, [3], 'even an unsettled invocation keeps the one-Send guard');
  const report = session.finish(), before = fs.readdirSync(p.dir).sort();
  assert.equal(report.sendDispatch.status, 'entered');
  assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
  await assert.rejects(f.session().submit(f.capture), /finished/);
  resolveClick(); await assert.rejects(pending, /finished/);
  assert.deepEqual(fs.readdirSync(p.dir).sort(), before);
  assert.equal(fs.existsSync(p.dispatchResult), false);
  assert.deepEqual(f.clicks, [3]);
  assert.deepEqual(session.finish(), report, 'finished report remains immutable after the pending handle settles');
});

test('a dispatch promise settling after deadline creates no terminal material', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session();
  let resolveClick, entered;
  const invocation = new Promise(resolve => { entered = resolve; });
  f.app.click = index => { f.clicks.push(index); entered(); return new Promise(resolve => { resolveClick = resolve; }); };
  const pending = session.submit(f.capture); await invocation;
  const before = fs.readdirSync(p.dir).sort(); t.mock.timers.tick(900001);
  resolveClick(); await assert.rejects(pending, /expired/);
  assert.deepEqual(fs.readdirSync(p.dir).sort(), before);
  assert.equal(fs.existsSync(p.dispatchResult), false);
  assert.equal(session.finish().sendDispatch.status, 'entered');
  assert.deepEqual(f.clicks, [3]);
});

test('failure to persist entered dispatch prevents click while preserving the Send claim', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session();
  const original = fs.openSync;
  t.mock.method(fs, 'openSync', function (file, ...args) {
    if (file === p.dispatchEntered) throw Error('Synthetic entered write failure');
    return original.call(this, file, ...args);
  });
  await assert.rejects(session.submit(f.capture), /entered write failure/);
  assert.equal(fs.existsSync(p.claim), true); assert.equal(fs.existsSync(p.dispatchEntered), false);
  assert.deepEqual(f.clicks, []);
  await assert.rejects(f.session().submit(f.capture), /claimed/);
  assert.equal(session.finish().sendDispatch.status, 'not-recorded');
});

test('rejection diagnostic write failure never replaces the original click rejection', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session(), primary = Error(privateSentinel);
  const original = fs.openSync;
  t.mock.method(fs, 'openSync', function (file, ...args) {
    if (file === p.dispatchResult) throw Error('Synthetic diagnostic write failure');
    return original.call(this, file, ...args);
  });
  f.app.click = async index => { f.clicks.push(index); throw primary; };
  await assert.rejects(session.submit(f.capture), error => error === primary);
  assert.equal(fs.existsSync(p.dispatchResult), false);
  assert.equal(session.finish().sendDispatch.status, 'entered');
  assert.equal(storedText(f.root).includes(privateSentinel), false);
  await assert.rejects(session.submit(f.capture), /finished/);
  assert.deepEqual(f.clicks, [3]);
});

test('a returned click with failed terminal persistence remains ambiguous and cannot be repeated', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session();
  const original = fs.openSync;
  t.mock.method(fs, 'openSync', function (file, ...args) {
    if (file === p.dispatchResult) throw Error('Synthetic returned diagnostic write failure');
    return original.call(this, file, ...args);
  });
  await assert.rejects(session.submit(f.capture), /returned diagnostic write failure/);
  assert.equal(fs.existsSync(p.dispatchResult), false);
  await assert.rejects(f.session().submit(f.capture), /claimed/);
  assert.deepEqual(f.clicks, [3]);
  const report = session.finish(); assert.equal(report.sendDispatch.status, 'entered');
  assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
  assert.equal(f.run().observations.some(o => o.claim === 'sent'), false);
});

test('late rejected click preserves its original rejection without writing into a finished case', async t => {
  const f = await fixture(t), p = pathsFor(f.state.id, f.root), session = f.session(), primary = Error(privateSentinel);
  let rejectClick, entered;
  const invocation = new Promise(resolve => { entered = resolve; });
  f.app.click = index => { f.clicks.push(index); entered(); return new Promise((resolve, reject) => { rejectClick = reject; }); };
  const pending = session.submit(f.capture); await invocation;
  const report = session.finish(), before = fs.readdirSync(p.dir).sort();
  rejectClick(primary); await assert.rejects(pending, error => error === primary);
  assert.deepEqual(fs.readdirSync(p.dir).sort(), before);
  assert.equal(fs.existsSync(p.dispatchResult), false);
  assert.deepEqual(session.finish(), report);
  assert.equal(storedText(f.root).includes(privateSentinel), false);
});

// Execution-contract integration: these are fake App handles, not live qualification.
test('split review finishes Raise before a separately reviewed single Send', async t => {
  const f = await fixture(t);
  const session = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const preliminary = { ...await f.capture(), execution: executionAssessment() };
  const ticket = await session.raiseForReview(preliminary.snapshot, preliminary);
  assert.equal(ticket.raised, true); assert.deepEqual(f.clicks, []); assert.equal(f.raises.length, 1);
  assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false, 'visual review has no pending Send');
  const reviewed = { ...await f.capture(), execution: executionAssessment() };
  const result = await session.submitReviewed(reviewed.snapshot, reviewed);
  assert.equal(result.attempted, true); assert.deepEqual(f.clicks, [3]);
  await assert.rejects(session.submitReviewed(reviewed.snapshot, reviewed), /claimed/);
});

test('a recreated session cannot use a review ticket from another session', async t => {
  const f = await fixture(t), first = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const preliminary = { ...await f.capture(), execution: executionAssessment() };
  await first.raiseForReview(preliminary.snapshot, preliminary);
  const recreated = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const capture = { ...await f.capture(), execution: executionAssessment() };
  await assert.rejects(recreated.submitReviewed(capture.snapshot, capture), /raiseForReview/);
  assert.deepEqual(f.clicks, []);
});

test('conflicting pixels stop before Raise and invalidate execution readiness', async t => {
  const f = await fixture(t), session = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const capture = { ...await f.capture(), execution: { ...executionAssessment(), visualAgreement: 'conflicts' } };
  await assert.rejects(session.raiseForReview(capture.snapshot, capture), /observation-conflicts/);
  assert.deepEqual(f.raises, []); assert.deepEqual(f.clicks, []);
  const state = JSON.parse(fs.readFileSync(pathsFor(f.state.id, f.root).state));
  assert.equal(state.execution.status, 'blocked'); assert.equal(state.execution.generation, 2);
  assert.equal(session.finish().execution.outcome, 'blocked');
});

test('input interference during the review gap consumes no Send and requires requalification', async t => {
  const f = await fixture(t), session = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const preliminary = { ...await f.capture(), execution: executionAssessment() };
  await session.raiseForReview(preliminary.snapshot, preliminary);
  const reviewed = { ...await f.capture(), execution: { ...executionAssessment(), inputOwnership: 'interrupted' } };
  await assert.rejects(session.submitReviewed(reviewed.snapshot, reviewed), /input-not-exclusive/);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
  assert.equal(session.finish().execution.blockedReason, 'input-interference');
});

test('missing fresh visual review cannot be replaced with an earlier capture assessment', async t => {
  const f = await fixture(t), session = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const preliminary = { ...await f.capture(), execution: executionAssessment() };
  await session.raiseForReview(preliminary.snapshot, preliminary);
  const reviewed = { ...await f.capture(), execution: { ...executionAssessment(), visualAgreement: 'not-reviewed' } };
  await assert.rejects(session.submitReviewed(reviewed.snapshot, reviewed), /visual-review-required/);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('missing controller assessment is rejected without creating readiness or performing Raise', async t => {
  const f = await fixture(t), session = createDesktopSession({ caseId: f.state.id, app: f.app, root: f.root, controllerId: TEST_CONTROLLER });
  const preliminary = await f.capture();
  await assert.rejects(session.raiseForReview(preliminary.snapshot, preliminary), /execution assessment/);
  assert.deepEqual(f.raises, []); assert.deepEqual(f.clicks, []);
});

test('a different post-Send window cannot confirm the owned submission', async t => {
  const f = await fixture(t), session = f.session(); await session.submit(f.capture);
  const wrong = f.sent(); wrong.windowId = 999; wrong.ownedWindowId = 999;
  assert.throws(() => session.confirmSent(wrong, { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true }), /different execution window/);
  assert.equal(f.run().observations.some(o => o.claim === 'sent'), false);
  const report = session.finish();
  assert.equal(report.execution.blockedReason, 'target-lost');
  assert.equal(report.execution.outcome, 'indeterminate');
  assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
});
