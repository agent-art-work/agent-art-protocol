/** Synthetic UI/authority fixtures only; no native client or model execution. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRemoteMarker } from './remote-marker.mjs';
import { authorityCasePaths } from './authority-store.mjs';
import { SDK_SHA256 } from './desktop-runner.mjs';

async function fixture(t, options = {}) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-remote-marker-')), root = path.join(base, 'host'), authorityRoot = path.join(base, 'authority');
  fs.mkdirSync(root); t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const environment = { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-Chrome', version: '1' }, apps: { 'claude-app': { version: '1' } } };
  const inputs = { manifest: { sdkVersion: '0.1.4', archiveSha256: SDK_SHA256 }, environment };
  const binding = { connectionId: 'synthetic-guest-runtime', controllerId: 'synthetic-host-marker' }, calls = [];
  let value = '', focused = false, sequence = 0, rejectInput = false, controller, p;
  controller = await createRemoteMarker({ root, authorityRoot, inputs, binding, authorizeProbe: true,
    ...options, nativeDispatch: async action => {
      const s = JSON.parse(fs.readFileSync(p.state));
      assert.equal(s.actions[action.step].dispatch, 'entered');
      assert.equal(fs.existsSync(path.join(p.dir, 'diagnostic-' + action.step + '-claimed.json')), true);
      calls.push(action);
      if (action.method === 'click') focused = true;
      else if (action.method === 'typeText') value = action.text;
      else if (action.method === 'setValue') value = action.text;
      else throw Error('No arbitrary native method');
      if (rejectInput) throw Error('Synthetic native acknowledgement lost');
    } });
  p = authorityCasePaths(controller.state.id, root);
  const current = () => JSON.parse(fs.readFileSync(p.state));
  const capture = () => { t.mock.timers.tick(1); return {
    material: { captureId: 'synthetic-guest-' + ++sequence, capturedAt: new Date().toISOString(), visualAgreement: 'agrees', inputOwnership: 'exclusive',
      rawAX: `Window: "Claude", App: Claude.\n0 standard window Claude\n\t1 HTML content Claude, URL: claude.ai/new\n\t\t2 radio button Description: Chat and Cowork, Value: 1\n\t\t3 radio button Description: Code, Value: 0\n\t\t4 container Primary pane\n\t\t\t5 text entry area (settable) Description: Prompt, Value: ${value}\n\t\t\t6 radio button Chat, Value: 1\n\t\t\t7 radio button Cowork, Value: 0\nThe focused UI element is ${focused ? 5 : 4} ${focused ? 'text entry area' : 'container'}\n` },
    selection: { scopeIndex: 4, composerIndex: 5, claudeModeIndex: 2, codeModeIndex: 3,
      modeProfile: 'claude-chat-cowork-v1', chatTabIndex: 6, coworkTabIndex: 7 } }; };
  const host = (value = '') => { t.mock.timers.tick(1); return { captureId: 'synthetic-host-' + ++sequence,
    capturedAt: new Date().toISOString(), surfaceId: controller.hostSurfaceId, bundleId: 'com.google.Chrome',
    method: 'cua-browser-tab-ax-and-pixels', visualAgreement: 'agrees', focused: true, value }; };
  const cmd = (op, extra = {}) => controller.command({ op, binding, ...extra });
  const qualify = () => cmd('qualify', { assessment: { controllerId: binding.controllerId, configuration: environment,
    interface: 'cua', browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop',
    permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels' } });
  const focus = async () => { await cmd('focus', capture()); await cmd('observe-focus', capture()); };
  const type = async () => { await focus(); await cmd('type', capture()); await cmd('observe-marker', capture()); };
  const f = { controller, inputs, root, p, current, binding, calls, capture, host, cmd, qualify, focus, type,
    setValue: text => { value = text; }, rejectInput: () => { rejectInput = true; } };
  await qualify(); return f;
}

test('remote adapter reuses durable marker actions and requires both directions plus cleanup for independence', async t => {
  const f = await fixture(t); await f.cmd('host-baseline', { host: f.host() }); await f.type();
  const claim = await f.cmd('claim-host-type', { ...f.capture(), host: f.host() });
  assert.equal(claim.text, f.controller.hostMarker); assert.equal(claim.dispatch, 'entered');
  assert.equal(fs.existsSync(path.join(f.p.dir, 'host-type-claimed.json')), true);
  await f.cmd('settle-host-type', { returned: true });
  await f.cmd('observe-host-token', { host: f.host(claim.text) });
  await f.cmd('observe-isolation', f.capture());
  await f.cmd('clear', f.capture()); await f.cmd('observe-empty', f.capture());
  await f.cmd('independence', { ...f.capture(), host: f.host(claim.text) });
  const report = await f.cmd('finish');
  assert.equal(report.passed, true); assert.equal(report.markerCleanup, 'observed-empty');
  assert.deepEqual(f.calls.map(x => x.method), ['click', 'typeText', 'setValue']);
  assert.equal(report.maximumSends, 0); assert.equal(report.maximumHandoffs, 0);
});

test('unknown actions and changed remote bindings cannot dispatch or reopen a case', async t => {
  const f = await fixture(t);
  for (const op of ['send', 'keypress', 'select-chat', 'native-code', 'click']) await assert.rejects(f.cmd(op), /Unknown marker/);
  await assert.rejects(f.controller.command({ op: 'focus', ...f.capture(), binding: { ...f.binding, connectionId: 'other-runtime' } }), /runtime\/controller changed/);
  assert.deepEqual(f.calls, []); await f.cmd('finish'); await assert.rejects(f.cmd('focus', f.capture()), /no longer active/);
});

test('focus-only remote scope accepts explicit merged no-Send controls without gaining typing or Send', async t => {
  const f = await fixture(t, { focusOnly: true });
  const capture = () => { const c = f.capture(); c.material.rawAX = c.material.rawAX
    .replace('Description: Chat and Cowork', 'Description: Claude')
    .replace('Description: Prompt', 'Description: Write your prompt to Claude')
    .replace('\t\t\t6 radio button Chat, Value: 1\n\t\t\t7 radio button Cowork, Value: 0',
      '\t\t\t8 heading New session\n\t\t\t9 pop up button Project or folder\n\t\t\t10 pop up button Manual\n\t\t\t11 toggle button Browser, Value: 0');
    c.selection = { scopeIndex: 4, composerIndex: 5, claudeModeIndex: 2, codeModeIndex: 3,
      modeProfile: 'claude-unified-no-send-v1', unifiedHeadingIndex: 8, projectControlIndex: 9, permissionControlIndex: 10, browserControlIndex: 11 };
    return c;
  };
  await f.cmd('focus', capture()); await f.cmd('observe-focus', capture());
  for (const op of ['type', 'clear', 'send']) await assert.rejects(f.cmd(op, capture()), /no typing/);
  assert.deepEqual(f.calls.map(c => c.method), ['click']);
  const result = await f.cmd('finish'); assert.equal(result.passed, false); assert.equal(result.maximumSends, 0);
});

test('private capture never reaches the remote native callback or persistent evidence', async t => {
  const f = await fixture(t); f.setValue('SYNTHETIC_PRIVATE_DRAFT');
  await assert.rejects(f.cmd('focus', f.capture()), /composer/); assert.deepEqual(f.calls, []);
  assert.equal(fs.readFileSync(f.p.state, 'utf8').includes('SYNTHETIC_PRIVATE_DRAFT'), false);
});

for (const kind of ['stale', 'unreviewed', 'Cowork']) test(kind + ' capture blocks before remote native dispatch', async t => {
  const f = await fixture(t), request = f.capture();
  if (kind === 'stale') t.mock.timers.tick(30001);
  if (kind === 'unreviewed') request.material.visualAgreement = 'not-reviewed';
  if (kind === 'Cowork') request.material.rawAX = request.material.rawAX.replace('6 radio button Chat, Value: 1', '6 radio button Chat, Value: 0').replace('7 radio button Cowork, Value: 0', '7 radio button Cowork, Value: 1');
  await assert.rejects(f.cmd('focus', request)); assert.deepEqual(f.calls, []);
});

test('lost native acknowledgement consumes the existing claim and cannot be retried', async t => {
  const f = await fixture(t); f.rejectInput(); await assert.rejects(f.cmd('focus', f.capture()), /acknowledgement lost/);
  assert.equal(f.current().execution.status, 'blocked'); await assert.rejects(f.cmd('focus', f.capture()), /qualification/);
  assert.equal(f.calls.length, 1); assert.equal((await f.cmd('finish')).outcome, 'indeterminate');
});

test('host input has its own exclusive claim and cannot target another page or clear an unexpected value', async t => {
  const f = await fixture(t); await f.cmd('host-baseline', { host: f.host() }); await f.type();
  const host = f.host(); host.surfaceId = 'different-owned-or-private-page';
  await assert.rejects(f.cmd('claim-host-type', { ...f.capture(), host }), /Owned regular-Chrome/);
  const claim = await f.cmd('claim-host-type', { ...f.capture(), host: f.host() });
  await assert.rejects(f.cmd('claim-host-type', { ...f.capture(), host: f.host() }), /EEXIST/);
  await f.cmd('settle-host-type', { returned: true });
  await f.cmd('observe-host-token', { host: f.host(claim.text) });
  f.setValue('SYNTHETIC_CHANGED_GUEST_DRAFT');
  await assert.rejects(f.cmd('observe-isolation', { ...f.capture(), host: f.host(claim.text) }), /exact guest marker/);
  await assert.rejects(f.cmd('clear', f.capture()), /composer|qualification/);
  assert.equal(f.calls.some(x => x.method === 'setValue'), false);
});

test('a bare independence declaration or host-only result cannot pass the gate', async t => {
  const f = await fixture(t); await f.type(); await f.cmd('clear', f.capture()); await f.cmd('observe-empty', f.capture());
  await assert.rejects(f.cmd('independence', { ...f.capture(), host: f.host(f.controller.hostMarker) }), /ENOENT/);
  const report = await f.cmd('finish'); assert.equal(report.passed, false); assert.equal(report.interruptions.length > 0, true);
  assert.equal(report.independence.status, 'not-observed');
});

test('reporting independence reuses accepted cleanup evidence without granting freshness or another input', async t => {
  const f = await fixture(t); await f.cmd('host-baseline', { host: f.host() }); await f.type();
  const claim = await f.cmd('claim-host-type', { ...f.capture(), host: f.host() });
  await f.cmd('settle-host-type', { returned: true });
  await f.cmd('observe-host-token', { host: f.host(claim.text) });
  await f.cmd('observe-isolation', f.capture());
  await f.cmd('clear', f.capture()); await f.cmd('observe-empty', f.capture());
  const accepted = f.current().checks.empty; t.mock.timers.tick(31000);
  await f.cmd('independence', { host: f.host(claim.text) });
  assert.deepEqual(f.current().checks.empty, accepted); assert.equal(f.calls.length, 3);
  assert.equal((await f.cmd('finish')).passed, true);
});

test('host observation interface is explicit; native-app or DOM-only declarations are not silently substituted', async t => {
  const f = await fixture(t);
  for (const method of ['native-cua-ax-and-pixels', 'dom-only', 'operator-report']) {
    const host = f.host(); host.method = method;
    await assert.rejects(f.cmd('host-baseline', { host }), /Owned regular-Chrome/);
  }
  assert.deepEqual(f.calls, []);
});

test('CLI transports a claimed action and acknowledgement, closes its owned probe and reports no independence', async t => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-marker-worker-')), root = path.join(base, 'host'), authorityRoot = path.join(base, 'authority');
  fs.mkdirSync(root);
  const child = spawn(process.execPath, [fileURLToPath(new URL('./remote-marker.mjs', import.meta.url))], { stdio: ['pipe', 'pipe', 'pipe'] });
  const output = readline.createInterface({ input: child.stdout });
  const messages = [], waiters = [];
  output.on('line', line => { const item = JSON.parse(line); const waiter = waiters.shift(); if (waiter) waiter(item); else messages.push(item); });
  const next = () => messages.length ? Promise.resolve(messages.shift()) : new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Synthetic worker response timed out')), 5000);
    waiters.push(item => { clearTimeout(timer); resolve(item); });
  });
  const send = request => child.stdin.write(JSON.stringify(request) + '\n');
  let closed = false;
  t.after(() => { if (!closed) child.kill(); output.close(); fs.rmSync(base, { recursive: true, force: true }); });
  const environment = { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-Chrome', version: '1' }, apps: { 'claude-app': { version: '1' } } };
  const binding = { connectionId: 'synthetic-cli-runtime', controllerId: 'synthetic-cli-controller' };
  send({ op: 'prepare', root, authorityRoot, binding, authorizeProbe: true,
    inputs: { manifest: { sdkVersion: '0.1.4', archiveSha256: SDK_SHA256 }, environment } });
  const prepared = await next(); assert.equal(prepared.event, 'result', JSON.stringify(prepared));
  const response = await fetch(prepared.result.hostProbeUrl);
  assert.match(response.headers.get('content-security-policy'), /form-action 'none'/);
  const html = await response.text(); assert.match(html, /textarea[^>]+autofocus/); assert.doesNotMatch(html, /<form|<script|<button/);
  send({ op: 'qualify', binding, assessment: { controllerId: binding.controllerId, configuration: environment,
    interface: 'cua', browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop',
    permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels' } });
  assert.equal((await next()).result.qualified, true);
  send({ op: 'focus', binding, material: { captureId: 'synthetic-cli-capture', capturedAt: new Date().toISOString(),
    visualAgreement: 'agrees', inputOwnership: 'exclusive', rawAX: 'Window: "Claude", App: Claude.\n0 standard window Claude\n\t1 HTML content Claude, URL: claude.ai/new\n\t\t2 radio button Description: Chat and Cowork, Value: 1\n\t\t3 radio button Description: Code, Value: 0\n\t\t4 container Primary pane\n\t\t\t5 text entry area (settable) Description: Prompt, Value: \n\t\t\t6 radio button Chat, Value: 1\n\t\t\t7 radio button Cowork, Value: 0\n' },
    selection: { scopeIndex: 4, composerIndex: 5, claudeModeIndex: 2, codeModeIndex: 3, modeProfile: 'claude-chat-cowork-v1', chatTabIndex: 6, coworkTabIndex: 7 } });
  const native = await next(); assert.equal(native.event, 'native-action'); assert.equal(native.action.method, 'click');
  const p = authorityCasePaths(prepared.result.caseId, root);
  assert.equal(JSON.parse(fs.readFileSync(path.join(p.dir, 'diagnostic-focus-claimed.json'))).dispatch, 'entered');
  send({ op: 'native-result', requestId: native.requestId, returned: true });
  assert.equal((await next()).result.effect, 'not-observed');
  const exited = new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Error('Worker did not close')), 5000); child.once('exit', code => { clearTimeout(timer); resolve(code); }); });
  send({ op: 'finish', binding }); const report = await next(); assert.equal(report.result.passed, false);
  assert.equal(report.result.independence.status, 'not-observed'); assert.equal(await exited, 0); closed = true;
  await assert.rejects(fetch(prepared.result.hostProbeUrl));
});

// Separate clocks: evidence aggregation is historical; input target freshness
// remains mandatory for every actual native dispatch.
test('host input can use accepted guest effect while each new target is checked freshly', async t => {
  const f = await fixture(t); await f.cmd('host-baseline', { host: f.host() }); await f.type();
  t.mock.timers.tick(31000);
  const claim = await f.cmd('claim-host-type', { host: f.host() });
  await f.cmd('settle-host-type', { returned: true });
  await f.cmd('observe-host-token', { host: f.host(claim.text) });
  t.mock.timers.tick(31000);
  await f.cmd('observe-isolation', f.capture());
  await f.cmd('clear', f.capture()); await f.cmd('observe-empty', f.capture());
  await f.cmd('independence', { host: f.host(claim.text) });
  assert.equal((await f.cmd('finish')).passed, true);
});

test('explicit 60-second profile reaches composer and focus guards; default does not change', async t => {
  const f = await fixture(t, { captureProfile: 'no-send-reviewed-60s-v1' });
  const request = f.capture(); t.mock.timers.tick(59000);
  await f.cmd('focus', request);
  const observed = f.capture(); t.mock.timers.tick(59000);
  await f.cmd('observe-focus', observed);
  const typed = f.capture(); t.mock.timers.tick(59000);
  await f.cmd('type', typed);
  assert.deepEqual(f.calls.map(x => x.method), ['click', 'typeText']);
  const stale = f.capture(); t.mock.timers.tick(60001);
  await assert.rejects(f.cmd('observe-marker', stale), /snapshot-stale/);
});

test('separate cleanup consumes original unused clear without renewing original contract or report', async t => {
  const f = await fixture(t); await f.type();
  const old = await f.cmd('finish'), oldReport = fs.readFileSync(path.join(f.p.dir, 'report.json'), 'utf8');
  const originContract = f.current().executionContract; const binding = { ...f.binding, connectionId: 'synthetic-cleanup-runtime' };
  const inputs = { manifest: { sdkVersion: '0.1.4', archiveSha256: SDK_SHA256 }, environment: {
    os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-Chrome', version: '1' }, apps: { 'claude-app': { version: '1' } } } };
  const effects = [];
  const cleanup = await createRemoteMarker({ root: f.root, inputs, binding, authorizeProbe: true,
    cleanupCaseId: old.caseId, captureProfile: 'no-send-reviewed-60s-v1', nativeDispatch: async action => {
      assert.equal(fs.existsSync(path.join(f.p.dir, 'diagnostic-clear-claimed.json')), true);
      effects.push(action); f.setValue(action.text);
    } });
  const cmd = (op, extra = {}) => cleanup.command({ op, binding, ...extra });
  await cmd('qualify', { assessment: { controllerId: binding.controllerId, configuration: inputs.environment,
    interface: 'cua', browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop',
    permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels' } });
  assert.equal(cleanup.state.executionContract.diagnostic.maximumFocuses, 0);
  assert.equal(cleanup.state.executionContract.diagnostic.maximumTypes, 0);
  await cmd('observe-marker', f.capture());
  await cmd('clear', f.capture()); await cmd('observe-empty', f.capture());
  const report = await cmd('finish');
  assert.equal(report.cleanupOnly, true); assert.equal(report.passed, false);
  assert.equal(report.markerCleanup, 'observed-empty'); assert.equal(report.originCaseId, old.caseId);
  assert.deepEqual(effects.map(x => x.method), ['setValue']);
  assert.equal(fs.readFileSync(path.join(f.p.dir, 'report.json'), 'utf8'), oldReport);
  assert.deepEqual(f.current().executionContract, originContract);
  await assert.rejects(createRemoteMarker({ root: f.root, inputs, binding, authorizeProbe: true,
    cleanupCaseId: old.caseId, nativeDispatch: async () => {} }), /unused clear/);
});

test('focus-only restore checkpoint preserves claim and requires current qualification after reconnect', async t => {
  const f = await fixture(t, { focusOnly: true, captureProfile: 'no-send-reviewed-60s-v1', timeoutMs: 1800000 });
  const originalContract = f.current().executionContract, deadline = f.current().deadlineAt;
  await f.focus();
  const claimFile = path.join(f.p.dir, 'diagnostic-focus-claimed.json'), originalClaim = fs.readFileSync(claimFile, 'utf8');
  const paused = await f.cmd('pause-for-restore'); assert.equal(paused.pausedForRestore, true);
  assert.equal(f.current().status, 'active'); assert.equal(f.current().execution.status, 'blocked');
  assert.equal(originalContract.diagnostic.maximumTypes, 0); assert.equal(originalContract.diagnostic.maximumClears, 0);
  const binding = { ...f.binding, connectionId: 'synthetic-restored-runtime' };
  let nativeAfterReconnect = 0;
  const recovered = await createRemoteMarker({ root: f.root, inputs: f.inputs, binding, authorizeProbe: true,
    recoverCaseId: f.controller.state.id, previousControllerStopped: true, exclusiveInput: true,
    nativeDispatch: async () => { nativeAfterReconnect++; throw Error('No native replay allowed'); } });
  const cmd = (op, extra = {}) => recovered.command({ op, binding, ...extra });
  assert.equal(f.current().execution.status, 'unqualified'); assert.equal(f.current().execution.qualification, undefined);
  assert.throws(() => f.controller.finish(), /superseded/);
  await assert.rejects(f.cmd('finish'), /superseded/);
  assert.deepEqual(f.current().executionContract, originalContract); assert.equal(f.current().deadlineAt, deadline);
  const rejected = await cmd('inspect-restored-unqualified', f.capture());
  assert.equal(rejected.missingQualification, 'qualification-not-established');
  assert.equal(rejected.priorQualification, 'generation-differs');
  await assert.rejects(f.cmd('qualify', { assessment: {} }), /superseded/);
  await cmd('qualify', { assessment: { controllerId: binding.controllerId, configuration: f.inputs.environment,
    interface: 'cua', browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop',
    permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels' } });
  await cmd('observe-restored-readiness', f.capture());
  const audit = await cmd('verify-consumed-focus', f.capture());
  assert.equal(audit.consumedFocusRejected, true); assert.equal(audit.nativeCallbackEntered, false);
  assert.equal(nativeAfterReconnect, 0); assert.equal(f.calls.length, 1);
  assert.equal(fs.readFileSync(claimFile, 'utf8'), originalClaim);
  const report = await cmd('finish'); assert.equal(report.passed, false); assert.deepEqual(report.consumedInputs, ['focus']);
});

test('focus-only recovery cannot type or clear even through the remote API', async t => {
  const f = await fixture(t, { focusOnly: true });
  for (const op of ['type', 'clear', 'host-baseline', 'claim-host-type']) await assert.rejects(f.cmd(op, f.capture()), /Focus-recovery scope/);
  assert.equal(f.calls.length, 0);
});
