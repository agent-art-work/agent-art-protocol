import { setupTestAuthority } from './execution-fixture.mjs';
/** Synthetic contract checks only: the CUA handle is fake. No client is opened. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createDesktopSession } from './desktop-session.mjs';
import { TEST_CONTROLLER, qualifyTestCase, withExecutionAssessments, testExecutionProof } from './execution-fixture.mjs';
import { prepareCase, pathsFor, claimHandoff, claimSend, observeCase } from './desktop-runner.mjs';
import { CLAUDE_BUNDLE_ID } from './desktop-ui.mjs';
import { LAB_AX_POLICY, LAB_AX_PRESENTATION_SHA256 } from './draft-policy.mjs';

const work = JSON.parse(fs.readFileSync(new URL('./lab-work.json', import.meta.url), 'utf8'));
const context = work.context.find(item => item.id === 'reading-invitation').text;
const collapsed = context.replaceAll('\n\n', '\n');
const canonicalSha256 = 'ebef0c1f9ce1c03a6028f840086b9ff079cb3fc2df53d79e6053b9b4f6a8bde6';
const manifest = { id: 'synthetic-pinned-lab-presentation', workId: work.id, workVersion: work.version,
  sdkVersion: '0.1.4', archiveSha256: 'e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430',
  contextSha256: canonicalSha256, contextBytes: 983 };
const environment = { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-stable-Chrome', version: '1' },
  apps: { 'claude-app': { version: 'synthetic-1' } } };
const node = (index, role, label, extras = {}) => ({ index, role, label, visible: true, enabled: true, ...extras });
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const selection = { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true };
const clockedTests = new WeakSet();

function temporaryRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-synthetic-presentation-session-'));
  setupTestAuthority(t, root);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

async function fixture(t, { draftPolicy = LAB_AX_POLICY, browserContext = true } = {}) {
  if (!clockedTests.has(t)) {
    t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
    clockedTests.add(t);
  }
  const root = temporaryRoot(t);
  const state = await prepareCase({ root, inputs: { context, manifest, environment }, allowSend: true,
    ...(draftPolicy === 'omit-policy-for-test' ? {} : { draftPolicy }) });

  if (browserContext) observeCase(state.id, { lane: 'browser', requestedClient: 'claude-app', claim: 'context-matches', status: 'observed',
    source: 'browser-automation', material: { kind: 'browser-event', method: 'prepared-payload-sha256', contextSha256: canonicalSha256 } }, { root });
  let captures = 0;
  const snapshot = nodes => ({ captureId: `synthetic-presentation-capture-${++captures}`, capturedAt: new Date().toISOString(),
    bundleId: CLAUDE_BUNDLE_ID, windowId: 88, ownedWindowId: 88, owned: true, complete: true, documentUrl: 'https://claude.ai/new', nodes });
  const draft = (text = collapsed) => snapshot([
    node(0, 'standard window', 'Claude', { secondaryActions: ['Raise'] }),
    node(1, 'AXGroup', 'Synthetic owned fresh public draft'),
    node(2, 'AXTextArea', 'Reply to Claude', { value: text, parentIndex: 1 }),
    node(3, 'AXButton', 'Send', { parentIndex: 1 }),
    node(4, 'AXRadioButton', 'Claude', { value: '1' }),
    node(5, 'AXRadioButton', 'Code', { value: '0' }),
  ]);
  const sent = (text = collapsed) => snapshot([
    node(20, 'AXGroup', 'Synthetic owned public user message'),
    node(21, 'AXStaticText', text, { parentIndex: 20 }),
  ]);
  const clicks = [];
  const app = { async performSecondaryAction() {}, async getAXState() { return draft(); }, async click(index) { clicks.push(index); t.mock.timers.tick(1); } };
  qualifyTestCase(state, { root, inputs: { context, manifest, environment } });
  const session = () => withExecutionAssessments(createDesktopSession({ caseId: state.id, app, root, controllerId: TEST_CONTROLLER }));
  session().prepareLaunch(draft(''), { freshChat: true, scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4, codeModeIndex: 5 });
  t.mock.timers.tick(1);
  observeCase(state.id, { lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested',
    source: 'browser-automation', material: { kind: 'browser-event', ref: 'synthetic/native-click' } }, { root });
  const capture = async () => ({ snapshot: await app.getAXState(), composerIndex: 2, scopeIndex: 1, claudeModeIndex: 4, codeModeIndex: 5, freshConversation: true, surface: 'claude-chat', launchResolved: true });
  const run = () => read(path.join(root, '.local/test-bench/runs', `${state.runId}.json`));
  function complete(activeSession) {
    const observed = snapshot([
      node(30, 'AXGroup', 'Synthetic owned assistant response'),
      node(31, 'AXStaticText', 'This synthetic public collection introduces research and reading material.', { parentIndex: 30 }),
      node(32, 'AXStaticText', 'Only the selected visible result is known; full document reading is unestablished.', { parentIndex: 30 }),
      node(33, 'AXStaticText', 'Which part of this public collection would you like to explore next?', { parentIndex: 30 }),
      node(34, 'AXButton', 'Copy response', { parentIndex: 30 }),
    ]);
    return activeSession.recordResult(observed, { reply: { owned: true, captureId: observed.captureId, scopeIndex: 30,
      observedFacts: { collectionIntroduction: 31, accessLimits: 32, followupInvitation: 33 }, finishedControlIndex: 34 } });
  }
  return { root, state, draft, sent, snapshot, clicks, app, session, capture, run, complete };
}

test('explicit Lab policy sends the collapsed draft once without upgrading exact-context evidence', async t => {
  const f = await fixture(t), session = f.session();
  const result = await session.submit(f.capture);
  assert.equal(result.attempted, true); assert.deepEqual(f.clicks, [3]);
  const observations = f.run().observations.filter(item => item.lane === 'real-client');
  assert.deepEqual(observations.map(item => [item.claim, item.status]), [
    ['draft-arrived', 'observed'], ['context-matches', 'failed'], ['presentation-matches', 'observed'],
  ]);
  const presentation = observations.find(item => item.claim === 'presentation-matches').material;
  assert.equal(presentation.method, LAB_AX_POLICY);
  assert.equal(presentation.basis, 'paragraph-blank-lines-collapsed');
  assert.equal(presentation.canonicalSha256, canonicalSha256);
  assert.equal(presentation.exposedSha256, LAB_AX_PRESENTATION_SHA256);
  assert.match(presentation.captureId, /^synthetic-presentation-capture-/u);
  assert.equal(Number.isFinite(Date.parse(presentation.capturedAt)), true);
  assert.match(presentation.snapshotSha256, /^[a-f0-9]{64}$/u);
  assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), true);
  await assert.rejects(session.submit(f.capture), /claimed|already|EEXIST/iu);
  await assert.rejects(f.session().submit(f.capture), /claimed|already|EEXIST/iu);
  assert.deepEqual(f.clicks, [3]);
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
});

test('policy-based sent confirmation retains its comparison basis and observed digests', async t => {
  const f = await fixture(t), session = f.session(); await session.submit(f.capture);
  const confirmation = session.confirmSent(f.sent(), selection);
  const sent = confirmation.run.observations.at(-1);
  assert.equal(sent.claim, 'sent'); assert.equal(sent.status, 'observed');
  assert.equal(sent.material.method, LAB_AX_POLICY);
  assert.equal(sent.material.basis, 'paragraph-blank-lines-collapsed');
  assert.equal(sent.material.canonicalSha256, canonicalSha256);
  assert.equal(sent.material.exposedSha256, LAB_AX_PRESENTATION_SHA256);
  assert.equal(confirmation.run.observations.some(item => item.lane === 'real-client' && item.claim === 'context-matches' && item.status === 'observed'), false);
});

test('sent confirmation rejects a pre-claim capture and a replayed pre-Send capture identity', async t => {
  const f = await fixture(t), session = f.session(), beforeClaim = f.sent();
  t.mock.timers.tick(1);
  await session.submit(f.capture);
  const claim = read(pathsFor(f.state.id, f.root).claim);
  assert.equal(Date.parse(beforeClaim.capturedAt) < Date.parse(claim.claimedAt), true);
  assert.throws(() => session.confirmSent(beforeClaim, selection), /new capture after the Send claim/iu);
  const replayedIdentity = f.sent();
  replayedIdentity.captureId = claim.preSendCaptureId;
  assert.equal(Date.parse(replayedIdentity.capturedAt) > Date.parse(claim.claimedAt), true);
  assert.throws(() => session.confirmSent(replayedIdentity, selection), /new capture after the Send claim/iu);
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
  session.confirmSent(f.sent(), selection);
  assert.equal(f.run().observations.at(-1).claim, 'sent');
  assert.deepEqual(f.clicks, [3]);
});

test('a collapsed sent observation cannot forge an exact context digest', async t => {
  const f = await fixture(t), session = f.session(); await session.submit(f.capture);
  const captured = f.sent();
  const material = { kind: 'desktop-ui-check', method: LAB_AX_POLICY, basis: 'paragraph-blank-lines-collapsed',
    canonicalSha256, exposedSha256: LAB_AX_PRESENTATION_SHA256, contextSha256: canonicalSha256,
    captureId: captured.captureId, capturedAt: captured.capturedAt,
    snapshotSha256: createHash('sha256').update(JSON.stringify({ captureId: captured.captureId, capturedAt: captured.capturedAt,
      bundleId: captured.bundleId, windowId: captured.windowId, nodes: captured.nodes })).digest('hex') };
  assert.throws(() => observeCase(f.state.id, { lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat',
    claim: 'sent', status: 'observed', source: 'desktop-ui', material }, { root: f.root, executionProof: testExecutionProof(f.state, f.root, captured) }), /transformed presentation|exact context digest/iu);
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
});

test('completed synthetic policy interaction stays separate from exact component qualification and source access', async t => {
  const f = await fixture(t), session = f.session(); await session.submit(f.capture);
  session.confirmSent(f.sent(), selection); f.complete(session);
  const report = session.finish();
  assert.equal(report.draftPolicy, LAB_AX_POLICY);
  assert.equal(report.interactionPassed, true);
  assert.equal(report.componentPathObservedUnderPolicy, true);
  assert.equal(report.exactContextQualified, false);
  assert.equal(report.componentPathQualified, false);
  assert.equal(report.sourceAccess, 'not-observed');
  assert.equal(report.summary.realClient.clients['codex-app'].sent.status, 'not-run');
  assert.equal(report.summary.realClient.clients['claude-app']['context-matches'].status, 'failed');
});

test('sent and completion must both be observed before policy interaction can pass', async t => {
  for (const observed of ['neither', 'sent-only', 'completion-only']) {
    const f = await fixture(t), session = f.session(); await session.submit(f.capture);
    if (observed === 'sent-only') session.confirmSent(f.sent(), selection);
    if (observed === 'completion-only') f.complete(session);
    const report = session.finish();
    assert.equal(report.interactionPassed, false, observed);
    assert.equal(report.componentPathObservedUnderPolicy, false, observed);
    assert.equal(report.exactContextQualified, false, observed);
    assert.equal(report.componentPathQualified, false, observed);
  }
});

test('missing opt-in retains the exact-only no-Send guard', async t => {
  const f = await fixture(t, { draftPolicy: 'omit-policy-for-test' }), session = f.session();
  await assert.rejects(session.submit(f.capture), /does not match|exact/iu);
  assert.deepEqual(f.clicks, []);
  assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
  assert.equal(f.run().observations.some(item => item.claim === 'presentation-matches' && item.status === 'observed'), false);
});

test('wrong manifest pins cannot opt into the Lab presentation policy', async t => {
  const root = temporaryRoot(t);
  for (const [key, value] of Object.entries({ sdkVersion: '0.1.5', archiveSha256: 'a'.repeat(64), contextSha256: 'b'.repeat(64),
    contextBytes: 979, workId: 'https://public.example/#reading', workVersion: '2' })) {
    await assert.rejects(prepareCase({ root, allowSend: true, draftPolicy: LAB_AX_POLICY,
      inputs: { context, manifest: { ...manifest, [key]: value }, environment } }), /pin|qualified|context|manifest/iu);
    assert.equal(fs.existsSync(path.join(root, '.local/test-bench/desktop/active-claude.json')), false);
  }
});

test('content changes and partial whitespace collapse cannot use the presentation Send policy', async t => {
  for (const text of [collapsed.replace('GET the index', 'Skip the index'), collapsed + '\n', context.replace('\n\n', '\n')]) {
    const f = await fixture(t), session = f.session(); f.app.getAXState = async () => f.draft(text);
    await assert.rejects(session.submit(f.capture), /does not match|presentation|policy/iu);
    assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
    assert.equal(f.run().observations.some(item => item.claim === 'presentation-matches' && item.status === 'observed'), false);
  }
});

test('the presentation policy cannot bypass stale snapshots or ambiguous and unavailable Send controls', async t => {
  for (const variant of ['stale', 'ambiguous', 'disabled']) {
    const f = await fixture(t), session = f.session();
    f.app.getAXState = async () => {
      const snapshot = f.draft();
      if (variant === 'stale') snapshot.capturedAt = new Date(Date.now() - 31_000).toISOString();
      if (variant === 'ambiguous') snapshot.nodes.push(node(6, 'AXButton', 'Submit', { parentIndex: 1 }));
      if (variant === 'disabled') snapshot.nodes.find(n => n.index === 3).enabled = false;
      return snapshot;
    };
    await assert.rejects(session.submit(f.capture), /stale|unique enabled Send/iu);
    assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
  }
});

test('an exact browser payload observation remains mandatory before policy-based Send', async t => {
  const f = await fixture(t, { browserContext: false }), session = f.session();
  await assert.rejects(session.submit(f.capture), /browser|payload|context/iu);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('unbound positive observations cannot bypass the execution capture requirement', async t => {
  const f = await fixture(t), captured = f.draft();
  const executionProof = testExecutionProof(f.state, f.root, captured);
  const observation = { lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat',
    claim: 'draft-arrived', status: 'observed', source: 'desktop-ui', material: { kind: 'desktop-ui-check', method: 'visual-inspection' } };
  assert.throws(() => observeCase(f.state.id, observation, { root: f.root, executionProof }), /capture|metadata|bound/iu);
  assert.throws(() => claimSend(f.state.id, { root: f.root }), /fresh|capture|metadata|bound|presentation|plain|proof/iu);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('a stored presentation observation cannot claim Send after its capture becomes stale', async t => {
  const f = await fixture(t), captured = f.draft();
  const capture = { captureId: captured.captureId, capturedAt: captured.capturedAt,
    snapshotSha256: createHash('sha256').update(JSON.stringify({ captureId: captured.captureId, capturedAt: captured.capturedAt,
      bundleId: captured.bundleId, windowId: captured.windowId, nodes: captured.nodes })).digest('hex') };
  const executionProof = testExecutionProof(f.state, f.root, captured);
  const observation = (claim, status, material) => ({ lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat',
    claim, status, source: 'desktop-ui', material: { kind: 'desktop-ui-check', ...material } });
  observeCase(f.state.id, observation('draft-arrived', 'observed', { method: 'visual-inspection', ...capture }), { root: f.root, executionProof });
  observeCase(f.state.id, observation('context-matches', 'failed', { method: 'composer-utf8-sha256' }), { root: f.root });
  observeCase(f.state.id, observation('presentation-matches', 'observed', { method: LAB_AX_POLICY, ...capture,
    basis: 'paragraph-blank-lines-collapsed', canonicalSha256, exposedSha256: LAB_AX_PRESENTATION_SHA256 }), { root: f.root, executionProof });
  t.mock.method(Date, 'now', () => Date.parse(captured.capturedAt) + 31_000);
  assert.throws(() => claimSend(f.state.id, { root: f.root, executionProof }), /fresh|stale|capture/iu);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});

test('a policy-based sent-looking message needs the durable claim and the owned static user region', async t => {
  const f = await fixture(t), session = f.session();
  assert.throws(() => session.confirmSent(f.sent(), selection), /claimed/iu);
  await session.submit(f.capture);
  assert.throws(() => session.confirmSent(f.sent(collapsed.replace('GET', 'SKIP')), selection), /sent|public message|presentation/iu);
  assert.throws(() => session.confirmSent(f.sent(), { ...selection, ownedUserMessage: false }), /owned|user.message/iu);
  const composer = f.sent(); composer.nodes[1].role = 'AXTextArea';
  assert.throws(() => session.confirmSent(composer, selection), /sent|static|message/iu);
  assert.equal(f.run().observations.some(item => item.claim === 'sent'), false);
});

test('an ambiguous policy Send remains one attempt even across recreated sessions', async t => {
  const f = await fixture(t), session = f.session();
  f.app.click = async index => { f.clicks.push(index); throw Error('Synthetic uncertain click'); };
  await assert.rejects(session.submit(f.capture), /uncertain click/u);
  await assert.rejects(f.session().submit(f.capture), /claimed|already|EEXIST/iu);
  assert.deepEqual(f.clicks, [3]);
  const report = session.finish();
  assert.equal(report.sendClaimed, true); assert.equal(report.sendRecovery, 'possibly-attempted-do-not-resend');
  assert.equal(report.interactionPassed, false);
});

test('finished cases cannot reopen policy-based Submit or sent confirmation', async t => {
  const f = await fixture(t), session = f.session(); session.finish();
  await assert.rejects(session.submit(f.capture), /finished|active|own/iu);
  assert.throws(() => session.confirmSent(f.sent(), selection), /finished|claimed|active/iu);
  assert.deepEqual(f.clicks, []); assert.equal(fs.existsSync(pathsFor(f.state.id, f.root).claim), false);
});
