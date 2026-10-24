/** Synthetic host/guest rollback and native-dispatch boundary fixtures only. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prepareRemoteReadiness, claimRemoteSetup, settleRemoteSetup, recordRemoteReadiness,
  finishRemoteReadiness } from './remote-readiness.mjs';
import { authorityCasePaths } from './authority-store.mjs';
import { SDK_SHA256 } from './desktop-runner.mjs';

async function fixture(t, overrides = {}) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-remote-authority-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const root = path.join(base, 'host-controller'), authorityRoot = path.join(base, 'host-authority'); fs.mkdirSync(root);
  const binding = { connectionId: 'synthetic-guest-runtime', controllerId: 'synthetic-host-controller' };
  const inputs = { manifest: { sdkVersion: '0.1.4', archiveSha256: SDK_SHA256 }, environment: {
    os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-Chrome', version: '1' },
    apps: { 'claude-app': { version: '1' } } } };
  const state = await prepareRemoteReadiness({ root, authorityRoot, inputs, ...binding, authorizeSetup: true, ...overrides });
  const options = { root, binding }; let sequence = 0;
  const material = (value = '', code = true) => { t.mock.timers.tick(1); return {
    captureId: 'synthetic-capture-' + ++sequence, capturedAt: new Date().toISOString(), visualAgreement: 'agrees', inputOwnership: 'exclusive',
    rawAX: `Window: "Claude", App: Claude.\n0 standard window Claude\n\t1 HTML content Claude, URL: claude.ai/${code ? 'epitaxy' : 'new'}\n\t\t2 radio button Description: Claude, Value: ${code ? '0' : '1'}\n\t\t3 radio button Description: Code, Value: ${code ? '1' : '0'}\n\t\t4 container Primary pane\n\t\t\t5 text entry area (settable) Description: Prompt, Value: ${value}\n\t\t6 button New chat\n\t\t7 button Send message\n` }; };
  const claim = (m = material()) => claimRemoteSetup(state.id, { ...options, action: 'select-chat', material: m });
  return { root, authorityRoot, state, options, binding, inputs, material, claim, p: authorityCasePaths(state.id, root) };
}

test('host-only authority binds runtime and excludes typing, keys, arbitrary clicks and Send', async t => {
  const f = await fixture(t);
  for (const action of ['send', 'click', 'type', 'clear', 'keypress']) {
    assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action, material: f.material() }), /Only select-chat/);
  }
  const bad = { ...f.options, binding: { ...f.binding, connectionId: 'restored-guest-runtime' } };
  assert.throws(() => claimRemoteSetup(f.state.id, { ...bad, action: 'select-chat', material: f.material() }), /binding changed/);
  assert.equal(f.state.contract.scope.maximumSends, 0);
  assert.equal(f.state.contract.scope.maximumTypes, 0);
  assert.equal(fs.readdirSync(f.authorityRoot).includes('cases'), true);
});

test('claim is durable before dispatch and neither guest nor workspace rollback renews it', async t => {
  const f = await fixture(t), backup = path.join(f.root, '..', 'workspace-backup'); fs.cpSync(f.root, backup, { recursive: true });
  const claim = f.claim(); assert.equal(claim.controlIndex, 2);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.p.dir, 'select-chat-claimed.json'))).dispatch, 'entered');
  fs.rmSync(f.root, { recursive: true }); fs.cpSync(backup, f.root, { recursive: true });
  assert.throws(() => f.claim(), /uncertain/);
  const result = finishRemoteReadiness(f.state.id, f.options);
  assert.equal(result.outcome, 'indeterminate-do-not-retry'); assert.equal(result.passed, false);
  assert.throws(() => f.claim(), /Active host-owned/);
});

test('returned actions remain single-use; a new session cannot steal the active app reservation', async t => {
  const f = await fixture(t); f.claim();
  settleRemoteSetup(f.state.id, { ...f.options, action: 'select-chat', returned: true });
  assert.throws(() => f.claim(), /EEXIST/);
  await assert.rejects(prepareRemoteReadiness({ root: f.root, authorityRoot: f.authorityRoot, inputs: f.inputs,
    ...f.binding, authorizeSetup: true }), /EEXIST/);
});

test('missing authority or replaced store identity blocks before another dispatch', async t => {
  const f = await fixture(t);
  const metadata = path.join(f.authorityRoot, 'authority-store.json'); const before = fs.readFileSync(metadata);
  fs.writeFileSync(metadata, JSON.stringify({ schema: 'agent-art-bench/authority-store/1', storeId: '00000000-0000-0000-0000-000000000000' }));
  assert.throws(() => f.claim(), /identity changed/); fs.writeFileSync(metadata, before);
  fs.renameSync(f.authorityRoot, f.authorityRoot + '-offline');
  assert.throws(() => f.claim(), /ENOENT/);
  assert.equal(fs.existsSync(f.authorityRoot), false);
});

test('stale, nonempty, conflicted or missing captures never consume or dispatch a mode click', async t => {
  const f = await fixture(t);
  const stale = f.material(); t.mock.timers.tick(30001);
  for (const m of [stale, f.material('SYNTHETIC_PRIVATE_DRAFT'), { ...f.material(), visualAgreement: 'conflicts' },
    { ...f.material(), capturedAt: undefined }, { ...f.material(), inputOwnership: 'interrupted' }]) assert.throws(() => f.claim(m));
  assert.equal(fs.existsSync(path.join(f.p.dir, 'select-chat-claimed.json')), false);
  assert.equal(fs.readFileSync(f.p.state, 'utf8').includes('SYNTHETIC_PRIVATE_DRAFT'), false);
});

test('readiness requires two distinct complete post-action Chat captures; API return is insufficient', async t => {
  const f = await fixture(t); f.claim();
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: f.material('', false) }), /Uncertain/);
  settleRemoteSetup(f.state.id, { ...f.options, action: 'select-chat', returned: true });
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: f.material() }), /new-chat|chat-mode/);
  const a = f.material('', false); recordRemoteReadiness(f.state.id, { ...f.options, material: a });
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: a }), /distinct/);
  recordRemoteReadiness(f.state.id, { ...f.options, material: f.material('', false) });
  const report = finishRemoteReadiness(f.state.id, f.options);
  assert.equal(report.passed, true); assert.equal(report.readiness.length, 2);
  assert.equal(report.scope.maximumSends, 0); assert.equal(fs.existsSync(f.p.active), false);
  assert.equal(JSON.stringify(report).includes('rawAX'), false);
});

test('explicit merged no-Send readiness needs two actual-profile captures, zero preparation input', async t => {
  const f = await fixture(t);
  const material = () => { const m = f.material('', false);
    m.rawAX = m.rawAX.replace('Description: Prompt', 'Description: Write your prompt to Claude')
      .replace('\t\t6 button New chat', '\t\t\t8 heading New session\n\t\t\t9 pop up button Project or folder\n\t\t\t10 pop up button Manual\n\t\t\t11 toggle button Browser, Value: 0\n\t\t6 button New chat');
    return m;
  };
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: material() }), /ambiguous/);
  for (let i = 0; i < 2; i++) {
    assert.equal(recordRemoteReadiness(f.state.id, { ...f.options, material: material(), modeProfile: 'claude-unified-no-send-v1' }).ready, true);
  }
  const result = finishRemoteReadiness(f.state.id, f.options);
  assert.equal(result.passed, true); assert.deepEqual(result.actions, {});
  assert.equal(result.outcome, 'host-authority-and-claude-unified-no-send-readiness-observed');
  assert.equal(result.readiness.every(r => r.legacyChatMode === 'not-established'), true);
});

test('two different conversation profiles cannot combine into one readiness pass', async t => {
  const f = await fixture(t);
  recordRemoteReadiness(f.state.id, { ...f.options, material: f.material('', false) });
  const m = f.material('', false);
  m.rawAX = m.rawAX.replace('Description: Prompt', 'Description: Write your prompt to Claude')
    .replace('\t\t6 button New chat', '\t\t\t8 heading New session\n\t\t\t9 pop up button Project or folder\n\t\t\t10 pop up button Manual\n\t\t\t11 toggle button Browser, Value: 0\n\t\t6 button New chat');
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: m, modeProfile: 'claude-unified-no-send-v1' }), /same explicit surface/);
  assert.equal(finishRemoteReadiness(f.state.id, f.options).passed, false);
});

test('late or rejected dispatch cannot qualify; finished scope cannot be reopened', async t => {
  const f = await fixture(t); f.claim();
  settleRemoteSetup(f.state.id, { ...f.options, action: 'select-chat', returned: false });
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: f.material('', false) }), /Uncertain/);
  const report = finishRemoteReadiness(f.state.id, f.options);
  assert.equal(report.passed, false);
  assert.throws(() => settleRemoteSetup(f.state.id, { ...f.options, action: 'select-chat', returned: true }), /Active/);
});

test('expired scope blocks input while still permitting an honest incomplete report', async t => {
  const f = await fixture(t); t.mock.timers.tick(1800001);
  assert.throws(() => f.claim(), /deadline/);
  assert.equal(finishRemoteReadiness(f.state.id, f.options).passed, false);
});

test('New chat is one named setup action and cannot substitute a Send control', async t => {
  const f = await fixture(t);
  assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', material: f.material() }), /Chat mode/);
  const missing = f.material('', false); missing.rawAX = missing.rawAX.replace('6 button New chat', '6 button Send');
  assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', material: missing }), /New chat control|Chat\/Cowork selectors/);
  const claim = claimRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', material: f.material('', false) });
  assert.equal(claim.controlIndex, 6);
  settleRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', returned: true });
  assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', material: f.material('', false) }), /EEXIST/);
});

test('current empty Cowork /new form may prepare Chat once, but cannot already qualify as Chat', async t => {
  const f = await fixture(t);
  const m = () => { const x = f.material('', false); x.rawAX = x.rawAX.replace('Description: Claude', 'Description: Chat and Cowork')
    .replace('\t\t6 button New chat', '\t\t\t6 radio button Chat, Value: 0\n\t\t\t8 radio button Cowork, Value: 1'); return x; };
  assert.throws(() => recordRemoteReadiness(f.state.id, { ...f.options, material: m(), modeProfile: 'claude-chat-cowork-v1' }), /chat-mode/);
  const claim = claimRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', material: m() }); assert.equal(claim.controlIndex, 6);
  settleRemoteSetup(f.state.id, { ...f.options, action: 'open-new-chat', returned: true });
  for (let i = 0; i < 2; i++) {
    const ready = m(); ready.rawAX = ready.rawAX.replace('6 radio button Chat, Value: 0', '6 radio button Chat, Value: 1')
      .replace('8 radio button Cowork, Value: 1', '8 radio button Cowork, Value: 0');
    assert.equal(recordRemoteReadiness(f.state.id, { ...f.options, material: ready, modeProfile: 'claude-chat-cowork-v1' }).ready, true);
  }
  assert.equal(finishRemoteReadiness(f.state.id, f.options).passed, true);
});

test('File-menu discovery needs its named scope and one unique control beneath the actual menu bar', async t => {
  const f = await fixture(t, { setupProfile: 'claude-file-new-chat-v1' });
  const m = f.material('', false); m.rawAX += '8 menu bar\n\t9 File\n';
  const claim = claimRemoteSetup(f.state.id, { ...f.options, action: 'open-file-menu', material: m });
  assert.equal(claim.controlIndex, 9); assert.equal(f.state.contract.scope.maximumMenuOpens, 1);
  assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action: 'open-file-menu', material: f.material('', false) }));
  settleRemoteSetup(f.state.id, { ...f.options, action: 'open-file-menu', returned: true });
  assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action: 'open-file-menu', material: m }), /EEXIST/);
  assert.equal(finishRemoteReadiness(f.state.id, f.options).passed, false);
});

test('the historical setup scope cannot open native menus', async t => {
  const f = await fixture(t), m=f.material('', false); m.rawAX += '8 menu bar\n\t9 File\n';
  assert.throws(() => claimRemoteSetup(f.state.id, { ...f.options, action: 'open-file-menu', material: m }), /named preparation scope/);
});
