/** Synthetic host-guard checks. None invokes Chrome, Claude, a VM or inference. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadBenchInputs } from './inputs.mjs';
import { authorityCasePaths } from './authority-store.mjs';
import { LAB_AX_POLICY } from './draft-policy.mjs';
import { INLINE_SUBMITTED_POLICY } from './submitted-message.mjs';
import { READING_DRAFT_PROFILE, prepareRemoteReading, claimRemoteReading, settleRemoteReading,
  preflightRemoteReading, arrivalRemoteReading, finishRemoteReading, validateClockCorrelation,
  correlateGuestEvent, READING_TRIAL_PROFILE, prepareRemoteReadingTrial, sentRemoteReading,
  transitionRemoteReading, resultRemoteReading, READING_TRIAL_SETUP_PROFILE,
  READING_TRIAL_RESET_PROFILE, requestDenialRemoteReading } from './remote-reading.mjs';

async function fixture(t, override = {}) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-remote-reading-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const root = path.join(base, 'host'), authorityRoot = path.join(base, 'authority'); fs.mkdirSync(root);
  const binding = { controllerId: 'synthetic-controller', connectionId: 'synthetic-runtime' };
  const environment = { os: { name: 'synthetic-macOS', version: '1' }, browser: { name: 'synthetic-stable-Chrome', version: '1' },
    apps: { 'claude-app': { version: '1' } } };
  const inputs = await loadBenchInputs({ environment });
  const { buildClientHandoff } = await import(pathToFileURL(path.join(inputs.packageDir, 'clients.mjs')).href);
  const route = buildClientHandoff({ client: 'claude-app', prompt: inputs.context }).url;
  const args = { root, authorityRoot, environment, ...binding, authorizeHandoff: true,
    browserOrigin: 'http://127.0.0.1:4180', browserTabId: 'synthetic-desktop-tab', probeTabId: 'synthetic-probe-tab',
    clockCorrelation: { profile: 'ssh-bracketed-guest-clock-v1', hostStartedAt: new Date().toISOString(),
      hostFinishedAt: new Date().toISOString(), guestAt: new Date().toISOString(),
      bootSessionId: '00000000-0000-4000-8000-000000000001', driftAllowanceMs: 100 }, ...override };
  const state = await (override.trial ? prepareRemoteReadingTrial(args) : prepareRemoteReading(args)), options = { root, binding }, p = authorityCasePaths(state.id, root);
  let serial = 0;
  const common = bundleId => { t.mock.timers.tick(1); return { captureId: 'synthetic-capture-' + ++serial,
    capturedAt: new Date().toISOString(), complete: true, imageCount: 1, visualAgreement: 'agrees', inputOwnership: 'exclusive', bundleId }; };
  const url = lane => args.browserOrigin + '/?lane=' + lane + '&controller=agent#reading-synthetic-' + lane;
  const tab = lane => lane === 'browser' ? args.probeTabId : args.browserTabId;
  const manifest = () => ({ sdkVersion: inputs.manifest.sdkVersion, archiveSha256: inputs.manifest.archiveSha256,
    contextSha256: inputs.manifest.contextSha256, contextBytes: inputs.manifest.contextBytes });
  const browser = (lane = 'browser') => ({ ...common('com.google.Chrome'), provenance: 'browser-dom',
    url: url(lane), lane, tabId: tab(lane), manifest: manifest(), context: inputs.context,
    links: [{ role: 'link', label: 'Claude', client: 'claude-app', index: 7, href: route, visible: true, enabled: true }] });
  const nativeBrowser = (lane = 'browser', receipt = false) => {
    const m = browser(lane); delete m.links; m.provenance = 'native-ax';
    m.rawAX = 'Window: "Synthetic test", App: Google Chrome.\n0 standard window Synthetic test\n\t1 HTML content Synthetic public bench, URL: ' + m.url + '\n\t\t7 link Claude' + (receipt ? '' : ', URL: ' + route) + '\n';
    m.component = { ...manifest(), client: 'claude-app', href: route, hrefBasis: receipt ? 'trusted-loopback-component-receipt' : 'native-ax',
      ...(receipt && { receipt: { ...manifest(), provenance: 'owned-loopback-component', tabId: m.tabId, url: m.url,
        client: 'claude-app', href: route, captureId: m.captureId } }) };
    return m;
  };
  const claude = (value = '') => ({ ...common('com.anthropic.claudefordesktop'), rawAX:
    'Window: "Claude", App: Claude.\n0 standard window Claude\n\t1 HTML content New session - Claude, URL: claude.ai/new\n'
    + '\t\t2 radio button Description: Claude, Value: 1\n\t\t3 radio button Description: Code, Value: 0\n'
    + '\t\t4 container Primary pane\n\t\t\t5 text entry area (settable) Description: Write your prompt to Claude, Value: ' + value + '\n'
    + '\t\t\t6 heading New session\n\t\t\t7 pop up button Project or folder\n\t\t\t8 pop up button Manual\n\t\t\t9 toggle button Browser, Value: 0\n' });
  const effect = (lane = 'browser') => { t.mock.timers.tick(250); const m = common('com.google.Chrome'); return { ...m, provenance: 'owned-bench-run-receipt',
    tabId: tab(lane), url: url(lane), lane, client: 'claude-app', clickCount: 1, isTrusted: true,
    cancelled: lane === 'browser', manifest: manifest(), runId: 'reading-synthetic-' + lane,
    ordinal: 1, eventAt: m.capturedAt, recordedAt: m.capturedAt }; };
  const prompt = () => ({ ...common('com.google.Chrome'), url: url('desktop'), tabId: tab('desktop'),
    rawAX: 'Window: "Synthetic test", App: Google Chrome.\n0 standard window Synthetic test\n\t1 dialog Open Claude?\n'
    + '\t\t2 text http://127.0.0.1:4180 wants to open this application.\n\t\t3 button Open Claude\n'
    + '\t\t4 check box Always allow, Value: 0\n\t\t5 button Cancel\n' });
  const claim = (action, material, selection) => claimRemoteReading(state.id, { ...options, action, material, selection });
  const settle = (action, returned, browserEffect) => settleRemoteReading(state.id, { ...options, action, returned, browserEffect });
  const probe = async () => { await claim('browser-probe', browser()); await settle('browser-probe', true, effect()); };
  const preflight = m => preflightRemoteReading(state.id, { ...options, material: m ?? claude() });
  const launch = async () => { await probe(); await preflight(); await claim('handoff', browser('desktop')); await settle('handoff', true, effect('desktop')); };
  const arrival = m => arrivalRemoteReading(state.id, { ...options, material: m ?? claude(inputs.context), launchResolved: true });
  const draft = () => { const m = claude(inputs.context); m.rawAX = m.rawAX.replace('standard window Claude', 'standard window Claude, Secondary Actions: Raise');
    m.rawAX += '\t\t\t10 button Send message\n'; return m; };
  const sent = (material, selection) => sentRemoteReading(state.id, { ...options, material, selection });
  const result = (material, selection) => resultRemoteReading(state.id, { ...options, material, selection });
  const submit = async () => { await launch(); await arrival(); await claim('raise', draft()); await settle('raise', true);
    const claimResult = await claim('send', draft()); await settle('send', true); return claimResult; };
  const submitted = () => { const m = claude(); m.rawAX = m.rawAX.replace('claude.ai/new', 'claude.ai/chat/synthetic-owned');
    m.rawAX += '\t\t\t20 group User message\n\t\t\t\t21 text ' + inputs.context + '\n'
      + '\t\t\t30 group Assistant reply\n'
      + '\t\t\t\t31 text This public Agent Art collection introduces articles, studies and working notes.\n'
      + '\t\t\t\t32 text Access and verification are limited to the source results visible in this test.\n'
      + '\t\t\t\t33 text What would you like to explore about the collection next?\n'
      + '\t\t\t\t34 button Copy response\n'
      + '\t\t\t40 group Source tool result\n'
      + '\t\t\t\t41 button Fetch https://agentart.work/agent-index.json\n'
      + '\t\t\t\t42 text https://agentart.work/agent-index.json\n'
      + '\t\t\t\t43 text {"schema":"synthetic-index/1","revision":"synthetic-revision"}\n'; return m; };
  const selection = m => ({ reply: { owned: true, captureId: m.captureId, scopeIndex: 30, finishedControlIndex: 34,
    observedFacts: { collectionIntroduction: 31, accessLimits: 32, followupInvitation: 33 } },
    toolResults: [{ owned: true, captureId: m.captureId, scopeIndex: 40, urlIndex: 42, bodyIndex: 43,
      sourceUrl: 'https://agentart.work/agent-index.json', representation: 'raw-json-result',
      expectedJsonFields: { schema: 'synthetic-index/1', revision: 'synthetic-revision' },
      provenance: { kind: 'expanded-tool-result', captureId: m.captureId, toolControlIndex: 41 } }] });
  return { args, state, options, p, root, authorityRoot, binding, inputs, route, browser, nativeBrowser, claude, effect, prompt,
    claim, settle, probe, preflight, launch, arrival, draft, submit, submitted, selection, sent, result,
    finish: cleanup => finishRemoteReading(state.id, { ...options, cleanup }) };
}

test('new immutable scope permits one probe/handoff/confirmation and zero model input or Send', async t => {
  const f = await fixture(t);
  assert.deepEqual(f.state.contract.scope, { maximumBrowserProbes: 1, maximumHandoffs: 1, maximumLaunchConfirmations: 1,
    maximumSends: 0, maximumTypes: 0, maximumKeypresses: 0, maximumClears: 0 });
  assert.equal(f.state.contract.maximumCaptureAgeMs, 30000); assert.equal(f.state.contract.timeoutMs, 1800000);
  assert.equal(f.state.contract.profile, READING_DRAFT_PROFILE);
  for (const action of ['send', 'click', 'type', 'clear', 'keypress', 'select-chat']) {
    await assert.rejects(f.claim(action, f.browser()), /Only browser-probe/);
  }
  const denied = { ...f.args, authorizeHandoff: false };
  await assert.rejects(prepareRemoteReading(denied), /Explicit no-Send/);
});

test('complete browser dry-run, component activation and unsent exact draft remain separate observations', async t => {
  const f = await fixture(t); await f.launch();
  const draft = await f.arrival(); assert.equal(draft.arrived, true); assert.equal(draft.comparison.exactMatches, true);
  const report = await f.finish({ browserTabs: 'closed', claudeDraft: 'unsent-draft-retained' });
  assert.equal(report.passed, true); assert.equal(report.browser.passed, true);
  assert.equal(report.realClient.sendAttempts, 0); assert.equal(report.realClient.agentExecution, 'not-tested');
  assert.equal(report.realClient.arrival.modeProfile, READING_DRAFT_PROFILE);
  assert.equal(fs.existsSync(f.p.active), false);
  await assert.rejects(f.claim('handoff', f.browser('desktop')), /Active host-owned/);
});

test('an API return alone supplies no browser effect or native arrival', async t => {
  const f = await fixture(t); await f.claim('browser-probe', f.browser()); await f.settle('browser-probe', true);
  await f.preflight(); await assert.rejects(f.claim('handoff', f.browser('desktop')), /Two actual browser checks/);
  const report = await f.finish(); assert.equal(report.passed, false); assert.equal(report.browser.passed, false);
  assert.equal(report.realClient.arrival, null);
});

test('actual native AX may expose the SDK href or pair with an explicit trusted-loopback receipt', async t => {
  const f = await fixture(t);
  const claim = await f.claim('browser-probe', f.nativeBrowser()); assert.equal(claim.controlIndex, 7); assert.equal(claim.provenance, 'native-ax');
  await f.settle('browser-probe', true, f.effect()); await f.preflight();
  const handoff = await f.claim('handoff', f.nativeBrowser('desktop', true));
  assert.equal(handoff.controlIndex, 7); assert.equal(handoff.provenance, 'native-ax-and-trusted-loopback-route');
});

test('native receipt without current capture/tab/page binding cannot stand in for the component route', async t => {
  const f = await fixture(t), m = f.nativeBrowser('browser', true);
  m.component.receipt.captureId = 'different';
  await assert.rejects(f.claim('browser-probe', m), /bind this actual page/);
  assert.equal(fs.existsSync(path.join(f.p.dir, 'browser-probe-claimed.json')), false);
});

test('native component receipts cannot select a Claude link on another page or outside the actual owned document', async t => {
  const f = await fixture(t);
  const wrongPage = f.nativeBrowser('browser', true);
  wrongPage.rawAX = wrongPage.rawAX.replace(wrongPage.url, 'https://unrelated.invalid/');
  await assert.rejects(f.claim('browser-probe', wrongPage), /Native document URL differs/);
  const wrongScope = f.nativeBrowser('browser', true);
  wrongScope.rawAX = wrongScope.rawAX.replace('\t\t7 link', '\t7 link');
  await assert.rejects(f.claim('browser-probe', wrongScope), /One current enabled/);
  const missingURL = f.nativeBrowser('browser', true);
  missingURL.rawAX = missingURL.rawAX.replace(', URL: ' + missingURL.url, '');
  await assert.rejects(f.claim('browser-probe', missingURL), /same-capture native address/);
  missingURL.rawAX += '\t8 text field Description: Address and search bar, Value: ' + missingURL.url + '\n';
  assert.equal((await f.claim('browser-probe', missingURL)).controlIndex, 7);
});

test('observed native Chrome shape accepts only the exact accessible SDK label and full URL Value', async t => {
  const f = await fixture(t), m = f.nativeBrowser();
  m.rawAX = m.rawAX.replace(', URL: ' + m.url, ', URL: ' + m.url.replace('http://', ''))
    .replace('7 link Claude, URL: ', '7 link Open a new Claude desktop conversation with this context, Value: ');
  const wrongLabel = { ...m, rawAX: m.rawAX.replace('with this context', 'and send it') };
  await assert.rejects(f.claim('browser-probe', wrongLabel), /One current enabled/);
  const relative = { ...m, rawAX: m.rawAX.replace(m.url.replace('http://', ''), '/?lane=browser') };
  await assert.rejects(f.claim('browser-probe', relative), /Native document URL differs/);
  const wrongRoute = { ...m, rawAX: m.rawAX.replace(f.route, 'claude://claude.ai/new?q=different') };
  await assert.rejects(f.claim('browser-probe', wrongRoute), /One current enabled/);
  const result = await f.claim('browser-probe', m);
  assert.equal(result.controlIndex, 7); assert.equal(result.provenance, 'native-ax');
});

test('wrong app, tab, URL, route, duplicate control or payload pin rejects before claiming', async t => {
  const f = await fixture(t);
  const variants = [
    m => { m.bundleId = 'com.google.Chrome.beta'; }, m => { m.tabId = 'unowned'; },
    m => { m.url = 'https://agentart.work/'; }, m => { m.url = 'http://127.0.0.1:9999/?lane=browser'; },
    m => { m.links[0].href = 'claude://claude.ai/new?q=wrong'; }, m => { m.links.push({ ...m.links[0], index: 8 }); },
    m => { m.manifest.archiveSha256 = '0'.repeat(64); }, m => { m.links[0].enabled = false; },
    m => { m.links[0].label = 'Send'; }, m => { m.context = 'SYNTHETIC_PRIVATE_DRAFT'; },
    m => { m.imageCount = 0; }, m => { m.visualAgreement = 'conflicts'; }, m => { m.complete = false; },
  ];
  for (const mutate of variants) { const m = f.browser(); mutate(m); await assert.rejects(f.claim('browser-probe', m)); }
  assert.equal(fs.existsSync(path.join(f.p.dir, 'browser-probe-claimed.json')), false);
  assert.equal(fs.readFileSync(f.p.state, 'utf8').includes('SYNTHETIC_PRIVATE_DRAFT'), false);
});

test('only a distinct trusted canceled browser probe is accepted; invalid settlement consumes no new attempt', async t => {
  const f = await fixture(t), m = f.browser(); await f.claim('browser-probe', m);
  for (const mutate of [e => { e.cancelled = false; }, e => { e.isTrusted = false; },
    e => { e.clickCount = 2; }, e => { e.captureId = m.captureId; }, e => { e.provenance = 'api-return'; }]) {
    const e = f.effect(); mutate(e); await assert.rejects(f.settle('browser-probe', true, e));
  }
  await assert.rejects(f.claim('browser-probe', f.browser()), /Uncertain/);
  assert.equal((await f.finish()).outcome, 'indeterminate-do-not-retry');
});

test('GET time cannot refresh an old receipt, another run, or a duplicated event into a new action', async t => {
  const f = await fixture(t), m = f.browser(), before = new Date().toISOString(); await f.claim('browser-probe', m);
  for (const mutate of [e => { e.eventAt = before; }, e => { e.ordinal = 2; }, e => { e.runId = 'reading-another-run'; },
    e => { e.url += '-different'; }, e => { e.recordedAt = before; }]) {
    const e = f.effect(); mutate(e); await assert.rejects(f.settle('browser-probe', true, e));
  }
  assert.equal((await f.finish()).passed, false);
});

test('preflight uses positive merged surface markers and cannot accept existing drafts, messages, streaming or Code', async t => {
  const f = await fixture(t);
  for (const mutate of [m => { m.rawAX = m.rawAX.replace('Claude, Value: 1', 'Claude, Value: 0').replace('Code, Value: 0', 'Code, Value: 1'); },
    m => { m.rawAX = m.rawAX.replace('heading New session', 'heading Different'); },
    m => { m.rawAX += '\t\t\t10 button Stop response\n'; },
    m => { m.rawAX += '\t\t\t10 group User message\n'; }, m => { m.rawAX = m.rawAX.replace('pop up button Manual', 'pop up button Auto'); }]) {
    const m = f.claude(); mutate(m); await assert.rejects(f.preflight(m));
  }
  await assert.rejects(f.preflight(f.claude('SYNTHETIC_PRIVATE_DRAFT')), /composer-not-empty/);
  assert.equal(JSON.parse(fs.readFileSync(f.p.state)).preflights.length, 0);
});

test('stale route, preflight or post-click effect cannot authorize a handoff', async t => {
  const f = await fixture(t), stale = f.browser(); t.mock.timers.tick(30001);
  await assert.rejects(f.claim('browser-probe', stale), /expired/);
  await f.probe(); await f.preflight(); t.mock.timers.tick(30001);
  await assert.rejects(f.claim('handoff', f.browser('desktop')), /Fresh empty/);
  assert.equal(fs.existsSync(path.join(f.p.dir, 'handoff-claimed.json')), false);
});

test('runtime changes, contract tampering and missing authority fail closed', async t => {
  const f = await fixture(t);
  await assert.rejects(claimRemoteReading(f.state.id, { ...f.options, binding: { ...f.binding, connectionId: 'new-runtime' },
    action: 'browser-probe', material: f.browser() }), /binding changed/);
  const original = fs.readFileSync(f.p.state), changed = JSON.parse(original); changed.contract.scope.maximumSends = 1;
  fs.writeFileSync(f.p.state, JSON.stringify(changed)); await assert.rejects(f.claim('browser-probe', f.browser()), /contract/);
  fs.writeFileSync(f.p.state, original);
  fs.renameSync(f.authorityRoot, f.authorityRoot + '-offline');
  await assert.rejects(f.claim('browser-probe', f.browser()), /ENOENT/); assert.equal(fs.existsSync(f.authorityRoot), false);
});

test('workspace rollback cannot renew durable host activation claims, including a returned action', async t => {
  const f = await fixture(t), backup = path.join(f.root, '..', 'saved-workspace'); fs.cpSync(f.root, backup, { recursive: true });
  await f.claim('browser-probe', f.browser()); await f.settle('browser-probe', true, f.effect());
  const claimBytes = fs.readFileSync(path.join(f.p.dir, 'browser-probe-claimed.json'));
  fs.rmSync(f.root, { recursive: true }); fs.cpSync(backup, f.root, { recursive: true });
  await assert.rejects(f.claim('browser-probe', f.browser()), /EEXIST/);
  assert.deepEqual(fs.readFileSync(path.join(f.p.dir, 'browser-probe-claimed.json')), claimBytes);
});

test('confirmation must be the unique current Open Claude prompt from the expected origin, with persistent permission unchecked', async t => {
  const f = await fixture(t); await f.launch();
  for (const mutate of [m => { m.rawAX = m.rawAX.replace('button Open Claude', 'button Send'); },
    m => { m.rawAX = m.rawAX.replace('127.0.0.1:4180', '127.0.0.1:9999'); },
    m => { m.rawAX = m.rawAX.replace('Always allow, Value: 0', 'Always allow, Value: 1'); },
    m => { m.rawAX += '\t\t6 button Open Claude\n'; }]) {
    const m = f.prompt(); mutate(m); await assert.rejects(f.claim('confirm-launch', m));
  }
  const confirmation = await f.claim('confirm-launch', f.prompt()); assert.equal(confirmation.controlIndex, 3);
  await f.settle('confirm-launch', true); await assert.rejects(f.claim('confirm-launch', f.prompt()), /EEXIST/);
  assert.equal((await f.arrival()).fidelityAccepted, true);
});

test('observed native Chrome window-role Open Claude popup is accepted without weakening owned page checks', async t => {
  const f = await fixture(t); await f.launch();
  const m = f.prompt();
  m.rawAX = 'Window: "Open Claude?", App: Google Chrome.\n0 window Open Claude?, Secondary Actions: Raise\n'
    + '\t1 container Open Claude?\n\t\t2 container\n\t\t\t3 heading Open Claude?\n'
    + '\t\t\t4 container\n\t\t\t\t5 scroll area\n\t\t\t\t\t6 text http://127.0.0.1:4180 wants to open this application.\n'
    + '\t\t\t\t7 checkbox Always allow http://127.0.0.1:4180 to open links of this type in the associated app, Value: 0\n'
    + '\t\t\t8 container\n\t\t\t\t9 button Cancel\n\t\t\t\t10 button Open Claude\n11 menu bar\n';
  const claim = await f.claim('confirm-launch', m);
  assert.equal(claim.controlIndex, 10); assert.equal(claim.persistentPermission, 'observed-unchecked');
});

test('draft arrival requires observed uncanceled handoff, resolved launch, current fresh surface and no response', async t => {
  const f = await fixture(t);
  await assert.rejects(f.arrival(), /Observed handoff/); await f.launch();
  await assert.rejects(arrivalRemoteReading(f.state.id, { ...f.options, material: f.claude(f.inputs.context), launchResolved: false }), /resolved launch/);
  await assert.rejects(f.arrival(f.claude()), /must contain the draft/);
  const m = f.claude(f.inputs.context); m.rawAX += '\t\t\t10 group User message\n';
  await assert.rejects(f.arrival(m), /no messages/);
  assert.equal(JSON.parse(fs.readFileSync(f.p.state)).arrival, null);
});

test('arrival and exact comparison differ; a mismatched exposed draft never passes', async t => {
  const f = await fixture(t); await f.launch();
  const arrived = await f.arrival(f.claude('SYNTHETIC_WRONG_PUBLIC_DRAFT'));
  assert.equal(arrived.arrived, true); assert.equal(arrived.fidelityAccepted, false);
  const report = await f.finish(); assert.equal(report.passed, false);
  const files = fs.readdirSync(f.p.dir).filter(name => name.endsWith('.json')).map(name => fs.readFileSync(path.join(f.p.dir, name), 'utf8')).join('\n');
  assert.equal(files.includes('SYNTHETIC_WRONG_PUBLIC_DRAFT'), false); assert.equal(files.includes('rawAX'), false);
  assert.equal(files.includes(f.route), false); assert.equal(files.includes(f.inputs.context), false);
});

test('named pinned Lab presentation policy stays separate from exact comparison and execution', async t => {
  const f = await fixture(t, { draftPolicy: LAB_AX_POLICY }); await f.launch();
  const arrival = await f.arrival(f.claude(f.inputs.context.replaceAll('\n\n', '\n')));
  assert.equal(arrival.comparison.exactMatches, false); assert.equal(arrival.comparison.presentationMatches, true);
  assert.equal(arrival.fidelityAccepted, true); assert.equal(arrival.execution, 'not-tested');
  assert.equal((await f.finish()).passed, true);
});

test('no-send result and deadline remain immutable and consumed after finishing', async t => {
  const f = await fixture(t); await f.claim('browser-probe', f.browser()); t.mock.timers.tick(1800001);
  await assert.rejects(f.preflight(), /deadline expired/);
  const report = await f.finish(); assert.equal(report.passed, false); assert.equal(report.realClient.sendAttempts, 0);
  const bytes = fs.readFileSync(path.join(f.p.dir, 'report.json'));
  await assert.rejects(f.finish(), /Active host-owned/);
  await assert.rejects(f.settle('browser-probe', true), /Active host-owned/);
  assert.deepEqual(fs.readFileSync(path.join(f.p.dir, 'report.json')), bytes);
});

test('only bounded actual cleanup facts can be appended; cleanup grants no clearing operation', async t => {
  const f = await fixture(t);
  await assert.rejects(f.finish({ rawAX: 'SYNTHETIC_PRIVATE' }), /bounded actual cleanup/);
  await assert.rejects(f.finish({ claudeDraft: 'cleared' }), /bounded actual cleanup/);
  assert.equal((await f.finish({ browserTabs: 'not-created', claudeDraft: 'not-created' })).passed, false);
});

const clockBase = Date.parse('2026-10-24T02:38:00.000Z');
const clockAt = milliseconds => new Date(clockBase + milliseconds).toISOString();
const clockSample = () => ({ profile: 'ssh-bracketed-guest-clock-v1', hostStartedAt: clockAt(0), hostFinishedAt: clockAt(20),
  guestAt: clockAt(18), bootSessionId: '00000000-0000-4000-8000-000000000001', driftAllowanceMs: 100 });

test('SSH clock correlation preserves a guest clock 8ms ahead without retiming event or GET refresh', () => {
  const sample = clockSample();
  assert.equal(validateClockCorrelation(sample, { now: clockBase + 100 }), true);
  const result = correlateGuestEvent(sample, { eventAt: clockAt(1008), claimedAt: clockAt(500),
    recordedAt: clockAt(1000), deadlineAt: clockAt(1800000) });
  assert.equal(result.guestEventAt, clockAt(1008));
  assert.equal(result.earliestHostAt, clockAt(890)); assert.equal(result.latestHostAt, clockAt(1110));
  assert.equal(result.driftAllowanceMs, 100);
});

test('SSH clock sample validation fixes profile, drift, bracket duration and preparation freshness', () => {
  for (const sample of [{ ...clockSample(), profile: 'arbitrary-skew' }, { ...clockSample(), driftAllowanceMs: 101 },
    { ...clockSample(), hostFinishedAt: clockAt(-1) }, { ...clockSample(), hostFinishedAt: clockAt(2001) },
    { ...clockSample(), bootSessionId: 'not-observed' }, { ...clockSample(), arbitraryTolerance: 30000 }]) {
    assert.throws(() => validateClockCorrelation(sample, { now: clockBase + 10000 }));
  }
  assert.throws(() => validateClockCorrelation(clockSample(), { now: clockBase + 60021 }), /within 60 seconds/);
  assert.throws(() => validateClockCorrelation(clockSample(), { now: clockBase + 19 }), /within 60 seconds/);
});

test('clock correlation rejects definite preclaim events, ambiguous claim bounds, future events and expired sample interval', () => {
  for (const [eventAt, claimedAt, recordedAt] of [[clockAt(400), clockAt(500), clockAt(1000)],
    [clockAt(608), clockAt(500), clockAt(1000)], [clockAt(3000), clockAt(500), clockAt(1000)],
    [clockAt(1800019), clockAt(500), clockAt(1800020)]]) {
    assert.throws(() => correlateGuestEvent(clockSample(), { eventAt, claimedAt, recordedAt, deadlineAt: clockAt(1800000) }));
  }
});

test('owned guest receipts require a new-case clock sample; browser-event fixtures retain their own clock boundary', async t => {
  const f = await fixture(t, { clockCorrelation: undefined }); await f.claim('browser-probe', f.browser());
  await assert.rejects(f.settle('browser-probe', true, f.effect()), /explicit clock correlation/);
  const legacy = f.effect(); legacy.provenance = 'browser-event';
  assert.equal((await f.settle('browser-probe', true, legacy)).effectObserved, true);
  assert.equal((await f.finish()).realClient.sendAttempts, 0);
});

test('fresh application trial requires explicit separate one-Send authorization and preserves old no-Send scope', async t => {
  await assert.rejects(fixture(t, { trial: true }), /Explicit fresh one-Send/);
});

test('new trial has fixed bounded budgets and does not turn the no-Send profile into Send authority', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true });
  assert.equal(f.state.contract.profile, READING_TRIAL_PROFILE);
  assert.equal(f.state.contract.scope.maximumSends, 1); assert.equal(f.state.contract.scope.maximumNewConversations, 1);
  assert.equal(f.state.contract.scope.maximumRaises, 1); assert.equal(f.state.contract.scope.maximumToolInspections, 12);
  for (const key of ['maximumTypes', 'maximumKeypresses', 'maximumClears']) assert.equal(f.state.contract.scope[key], 0);
  for (const action of ['type', 'clear', 'keypress', 'click']) await assert.rejects(f.claim(action, f.draft()));
  await assert.rejects(f.claim('send', f.draft()), /Accepted arrival/);
  const changed = JSON.parse(fs.readFileSync(f.p.state)); changed.contract.profile = READING_DRAFT_PROFILE;
  fs.writeFileSync(f.p.state, JSON.stringify(changed)); await assert.rejects(f.claim('new-conversation', f.claude()), /contract/);
});

test('new-conversation is one actual Sidebar New button and accepts only the pinned old public draft or empty surface', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true, draftPolicy: LAB_AX_POLICY });
  const previous = value => { const m = f.claude(value); m.rawAX += '\t\t11 container Sidebar\n\t\t\t12 button New\n'; return m; };
  await assert.rejects(f.claim('new-conversation', previous('SYNTHETIC_PRIVATE_DRAFT')), /known public/);
  const other = previous(); other.rawAX = other.rawAX.replace('container Sidebar', 'container History');
  await assert.rejects(f.claim('new-conversation', other), /Sidebar/);
  const claim = await f.claim('new-conversation', previous(f.inputs.context.replaceAll('\n\n', '\n')));
  assert.equal(claim.controlIndex, 12); assert.equal(claim.comparison.presentationMatches, true);
  await f.settle('new-conversation', true); await assert.rejects(f.claim('new-conversation', previous()), /EEXIST/);
  assert.equal((await f.preflight()).ready, true);
});

test('only actual current post-Raise draft comparison can consume one Send and uncertainty never permits retry', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.launch(); await f.arrival();
  await assert.rejects(f.claim('send', f.draft()), /post-Raise/);
  const raising = f.draft(); await f.claim('raise', raising); await f.settle('raise', true);
  await assert.rejects(f.claim('send', raising), /post-Raise/);
  const wrong = f.draft(); wrong.rawAX = wrong.rawAX.replace(f.inputs.context, 'SYNTHETIC_WRONG_PUBLIC');
  await assert.rejects(f.claim('send', wrong), /differs/);
  const ambiguous = f.draft(); ambiguous.rawAX += '\t\t\t11 button Send\n';
  await assert.rejects(f.claim('send', ambiguous), /enabled Send/);
  const sending = await f.claim('send', f.draft()); assert.equal(sending.controlIndex, 10);
  await assert.rejects(f.claim('send', f.draft()), /Uncertain/);
  await f.settle('send', true); await assert.rejects(f.claim('send', f.draft()), /EEXIST/);
  const report = await f.finish(); assert.equal(report.realClient.sendAttempts, 1);
  assert.equal(report.realClient.sendRecovery, 'possibly-attempted-do-not-resend'); assert.equal(report.passed, false);
});

test('retained no-Send draft contract cannot supply new-conversation, Raise, submission or result authority', async t => {
  const f = await fixture(t); await f.launch(); await f.arrival();
  for (const action of ['new-conversation', 'raise', 'send', 'inspect-tool']) await assert.rejects(f.claim(action, f.draft()), /draft-only/);
  await assert.rejects(f.sent(f.submitted(), { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true }), /draft-only/);
  await assert.rejects(f.result(f.submitted(), {}), /draft-only/);
  const report = await f.finish(); assert.equal(report.passed, true); assert.equal(report.realClient.sendAttempts, 0);
});

test('submitted user text, source acquisition and reply completion are separately observed and only bounded digests persist', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const m = f.submitted();
  const sent = await f.sent(m, { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true });
  assert.equal(sent.matches, true); assert.equal(sent.comparison.exactMatches, true);
  const result = await f.result(m, f.selection(m));
  assert.equal(result.orientation.status, 'observed'); assert.equal(result.sourceResults[0].status, 'observed');
  const report = await f.finish({ browserTabs: 'closed', claudeDraft: 'submitted-conversation-retained' });
  assert.equal(report.passed, true); assert.equal(report.interactionPassed, true);
  assert.equal(report.outcome, 'reading-interaction-and-visible-source-observed'); assert.equal(report.realClient.sendAttempts, 1);
  assert.equal(report.realClient.agentExecution, 'not-independently-attested');
  const saved = fs.readdirSync(f.p.dir).filter(name => name.endsWith('.json')).map(name => fs.readFileSync(path.join(f.p.dir, name), 'utf8')).join('\n');
  for (const raw of [f.inputs.context, f.route, 'This public Agent Art collection introduces', 'synthetic-index/1', 'rawAX']) assert.equal(saved.includes(raw), false);
});

test('a new explicit submitted-message policy binds split static parts without widening old default contracts', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true, submittedPolicy: INLINE_SUBMITTED_POLICY });
  assert.equal(f.state.contract.submittedPolicy, INLINE_SUBMITTED_POLICY);
  await f.submit(); const m=f.submitted();
  m.rawAX=m.rawAX.replace('20 group User message\n\t\t\t\t21 text '+f.inputs.context+'\n',
    '20 container Message 1 of 2\n\t\t\t\t22 text You said: public invitation\n'
    +'\t\t\t\t23 container\n\t\t\t\t\t21 text '+f.inputs.context.replace(/\n+/gu,' ')+'\n');
  const r=await f.sent(m,{scopeIndex:20,messageIndex:23,partIndices:[21],ownedUserMessage:true});
  assert.equal(r.matches,true);assert.equal(r.comparison.exactMatches,false);
  assert.equal(r.comparison.policy,INLINE_SUBMITTED_POLICY);
  await assert.rejects(f.sent(m,{scopeIndex:20,messageIndex:23,partIndices:[21],ownedUserMessage:true}),/already recorded/);
});

test('draft-only preparation cannot opt into submitted-message observation', async t => {
  await assert.rejects(fixture(t,{submittedPolicy:INLINE_SUBMITTED_POLICY}),/explicit new trial/);
});

test('repeat preparation can open New only from the finished prior public conversation with empty composer', async t => {
  const f=await fixture(t,{trial:true,authorizeSend:true});await f.submit();await f.finish();
  const state=await prepareRemoteReadingTrial({...f.args,authorizeSend:true,profile:READING_TRIAL_RESET_PROFILE,
    submittedPolicy:INLINE_SUBMITTED_POLICY,previousCaseId:f.state.id});
  const m=f.submitted();
  m.rawAX=m.rawAX.replace('standard window Claude','standard window Claude, Secondary Actions: Raise')
    .replace('20 group User message\n\t\t\t\t21 text '+f.inputs.context+'\n',
      '20 container Message 1 of 2\n\t\t\t\t22 text You said: public invitation\n'
      +'\t\t\t\t23 container\n\t\t\t\t\t21 text '+f.inputs.context.replace(/\n+/gu,' ')+'\n')
    .replace('30 group Assistant reply','30 container Message 2 of 2')
    +'\t\t80 container Sidebar\n\t\t\t81 button New\n';
  const claim=await claimRemoteReading(state.id,{...f.options,action:'setup-raise',material:m,
    selection:{messageIndex:23,partIndices:[21]}});
  assert.equal(claim.controlIndex,0);assert.equal(claim.previousCaseId,f.state.id);
  await settleRemoteReading(state.id,{...f.options,action:'setup-raise',returned:true});
  const stale={...m,captureId:'new-capture',capturedAt:new Date(Date.now()+1).toISOString()};t.mock.timers.tick(2);
  stale.rawAX=stale.rawAX.replace('Value: \n','Value: private draft\n');
  await assert.rejects(claimRemoteReading(state.id,{...f.options,action:'new-conversation',material:stale,
    selection:{messageIndex:23,partIndices:[21]}}));
});

test('inspected source denial remains a failed acquisition even with confirmed submitted invitation and complete reply', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const m = f.submitted(); m.rawAX = m.rawAX.replace('{"schema":"synthetic-index/1","revision":"synthetic-revision"}', 'HTTP 403 Forbidden');
  await f.sent(m, { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true });
  const selected = f.selection(m); selected.toolResults[0].representation = 'access-denial';
  await f.result(m, selected); const report = await f.finish();
  assert.equal(report.interactionPassed, true); assert.equal(report.realClient.sourceAccess, 'failed');
  assert.equal(report.outcome, 'reading-interaction-completed-source-access-failed');
});

test('assistant fetch claims and orientation alone leave source access unobserved', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit(); const m = f.submitted();
  await f.sent(m, { scopeIndex: 20, messageIndex: 21, ownedUserMessage: true });
  await f.result(m, { reply: f.selection(m).reply }); const report = await f.finish();
  assert.equal(report.interactionPassed, true); assert.equal(report.realClient.sourceAccess, 'not-observed');
  assert.equal(report.passed, false); assert.equal(report.outcome, 'reading-interaction-completed-source-access-unobserved');
});

test('tool inspection is separately claimed, bounded and rejects permission, response, missing source and unrelated source controls', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const selection = { scopeIndex: 40, controlIndex: 41, sourceUrl: 'https://agentart.work/agent-index.json' };
  for (const label of ['Allow', 'Copy response', 'Send', 'Retry', 'Approve fetch', 'Delete']) {
    const m = f.submitted(); m.rawAX = m.rawAX.replace('button Fetch https://agentart.work/agent-index.json', 'button ' + label);
    await assert.rejects(f.claim('inspect-tool', m, selection));
  }
  await assert.rejects(f.claim('inspect-tool', f.submitted(), { ...selection, sourceUrl: 'https://other.example/index.json' }), /public Lab/);
  const noUrl = f.submitted(); noUrl.rawAX = noUrl.rawAX.replaceAll('https://agentart.work/agent-index.json', 'https://other.example/index.json');
  await assert.rejects(f.claim('inspect-tool', noUrl, selection), /exact public Lab/);
  for (let i = 1; i <= 12; i++) {
    const claim = await f.claim('inspect-tool', f.submitted(), selection); assert.equal(claim.action, 'inspect-tool-' + i);
    assert.equal(claim.controlIndex, 41); await f.settle(claim.action, true);
  }
  await assert.rejects(f.claim('inspect-tool', f.submitted(), selection), /budget exhausted/);
});

test('result inspection rejects stale/pre-Send observations, other public sources and absent expanded provenance', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); const before = f.submitted();
  await assert.rejects(f.result(before, f.selection(before)), /prior returned/);
  await f.submit(); await assert.rejects(f.result(before, f.selection(before)), /post-Send/);
  const m = f.submitted(), other = f.selection(m); other.toolResults[0].sourceUrl = 'https://other.example/index.json';
  await assert.rejects(f.result(m, other), /only the public Lab/);
  const unproven = f.selection(m); delete unproven.toolResults[0].provenance;
  await assert.rejects(f.result(m, unproven), /provenance/);
  t.mock.timers.tick(30001); await assert.rejects(f.result(m, f.selection(m)), /expired/);
});

test('visible transition stays weaker than confirmed submitted invitation and cannot pass the full interaction', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit(); const m = f.submitted();
  const transition = await transitionRemoteReading(f.state.id, { ...f.options, material: m, selection: { messageBoundaryIndex: 20 } });
  assert.equal(transition.submittedInvitation, 'not-confirmed'); await f.result(m, f.selection(m));
  const report = await f.finish(); assert.equal(report.realClient.submission, 'visible-transition-observed');
  assert.equal(report.interactionPassed, false); assert.equal(report.passed, false);
});

test('an in-progress response cannot count as completed orientation even if a Copy control is already exposed', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit(); const m = f.submitted();
  m.rawAX += '\t\t\t50 button Stop response\n';
  const result = await f.result(m, f.selection(m));
  assert.equal(result.orientation.status, 'not-observed'); assert.equal(result.orientation.reason, 'response-in-progress');
  assert.equal(result.sourceResults[0].status, 'observed');
});

test('v2 explicitly adds one setup Raise while default v1 scope and no-Send scope remain unchanged', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true, profile: READING_TRIAL_SETUP_PROFILE });
  assert.equal(f.state.contract.profile, READING_TRIAL_SETUP_PROFILE);
  assert.equal(f.state.contract.scope.maximumSetupRaises, 1); assert.equal(f.state.contract.scope.maximumRaises, 1);
  assert.equal(f.state.contract.scope.maximumNewConversations, 1); assert.equal(f.state.contract.scope.maximumSends, 1);
  for (const key of ['maximumTypes', 'maximumKeypresses', 'maximumClears']) assert.equal(f.state.contract.scope[key], 0);
});

test('v2 setup Raise accepts only the known public draft or empty owned surface, then New requires a distinct post-Raise capture', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true, profile: READING_TRIAL_SETUP_PROFILE, draftPolicy: LAB_AX_POLICY });
  const setup = value => { const m = f.claude(value); m.rawAX = m.rawAX.replace('standard window Claude', 'standard window Claude, Secondary Actions: Raise');
    m.rawAX += '\t\t11 container Sidebar\n\t\t\t12 button New\n'; return m; };
  await assert.rejects(f.claim('new-conversation', setup()), /after setup Raise/);
  await assert.rejects(f.claim('setup-raise', setup('SYNTHETIC_PRIVATE_DRAFT')), /known public/);
  const old = setup(f.inputs.context.replaceAll('\n\n', '\n'));
  const raised = await f.claim('setup-raise', old); assert.equal(raised.controlIndex, 0); assert.equal(raised.nativeAction, 'Raise');
  await f.settle('setup-raise', true);
  await assert.rejects(f.claim('new-conversation', old), /after setup Raise/);
  await assert.rejects(f.claim('setup-raise', setup()), /EEXIST/);
  const fresh = setup(f.inputs.context.replaceAll('\n\n', '\n'));
  assert.equal((await f.claim('new-conversation', fresh)).controlIndex, 12); await f.settle('new-conversation', true);
  assert.equal((await f.preflight()).ready, true);
  assert.equal(fs.existsSync(path.join(f.p.dir, 'raise-claimed.json')), false);
  assert.equal(fs.existsSync(path.join(f.p.dir, 'send-claimed.json')), false);
});

test('v1 rejects setup Raise without changing its immutable scope or consuming a native claim', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); const m = f.draft();
  assert.equal(f.state.contract.profile, READING_TRIAL_PROFILE);
  assert.equal(Object.hasOwn(f.state.contract.scope, 'maximumSetupRaises'), false);
  await assert.rejects(f.claim('setup-raise', m), /Only the v2/);
  assert.equal(fs.existsSync(path.join(f.p.dir, 'setup-raise-claimed.json')), false);
});

test('unknown trial profile cannot prepare or manufacture extra setup authority', async t => {
  await assert.rejects(fixture(t, { trial: true, authorizeSend: true, profile: 'arbitrary-setup' }), /named v1 or v2/);
});

async function resetFixture(t) {
  const f = await fixture(t, { trial: true, authorizeSend: true, profile: READING_TRIAL_RESET_PROFILE, draftPolicy: LAB_AX_POLICY });
  const setup = value => { const m = f.claude(value === undefined ? f.inputs.context.replaceAll('\n\n', '\n') : value);
    m.rawAX = m.rawAX.replace('standard window Claude', 'standard window Claude, Secondary Actions: Raise');
    m.rawAX += '\t\t11 container Sidebar\n\t\t\t12 button New\n'; return m; };
  const start = async () => { await f.claim('setup-raise', setup()); await f.settle('setup-raise', true);
    await f.claim('new-conversation', setup()); await f.settle('new-conversation', true); };
  return { ...f, setup, start };
}

test('v3 provides only one exact public-draft reset and requires its actual empty post-result before preflight', async t => {
  const f = await resetFixture(t);
  assert.equal(f.state.contract.scope.maximumKnownPublicDraftResets, 1); assert.equal(f.state.contract.scope.maximumClears, 1);
  assert.equal(f.state.contract.scope.maximumTypes, 0); assert.equal(f.state.contract.scope.maximumKeypresses, 0);
  assert.equal(f.state.contract.scope.maximumSends, 1); assert.equal(f.state.contract.scope.maximumRaises, 1);
  await assert.rejects(f.claim('reset-public-draft', f.setup()), /returned setup Raise and New/);
  await f.start(); await assert.rejects(f.preflight(f.setup('')), /after the known-public reset/);
  const previous = f.setup(); const claim = await f.claim('reset-public-draft', previous);
  assert.equal(claim.controlIndex, 5); assert.equal(claim.nativeAction, 'setValueEmpty');
  assert.equal(claim.comparison.presentationMatches, true); assert.equal(claim.maximumAttempts, 1);
  await assert.rejects(f.preflight(f.setup('')), /Uncertain/);
  await f.settle('reset-public-draft', true);
  await assert.rejects(f.claim('reset-public-draft', f.setup()), /EEXIST/);
  await assert.rejects(f.preflight(previous), /composer-not-empty/);
  assert.equal((await f.preflight(f.setup(''))).ready, true);
  const report = await f.finish(); assert.equal(report.realClient.knownPublicDraftReset.action, 'reset-public-draft');
  assert.equal(report.realClient.sendAttempts, 0);
});

test('v3 cannot reset private, modified, empty, nonsettable or existing-message surfaces', async t => {
  const f = await resetFixture(t); await f.start();
  for (const value of ['SYNTHETIC_PRIVATE_DRAFT', f.inputs.context + ' changed', '']) await assert.rejects(f.claim('reset-public-draft', f.setup(value)));
  const readonly = f.setup(); readonly.rawAX = readonly.rawAX.replace('text entry area (settable)', 'text entry area');
  await assert.rejects(f.claim('reset-public-draft', readonly), /explicitly expose settable/);
  const message = f.setup(); message.rawAX = message.rawAX.replace('\t\t11 container Sidebar', '\t\t\t15 group User message\n\t\t11 container Sidebar');
  await assert.rejects(f.claim('reset-public-draft', message), /no messages/);
  assert.equal(fs.existsSync(path.join(f.p.dir, 'reset-public-draft-claimed.json')), false);
  const persisted = fs.readFileSync(f.p.state, 'utf8');
  assert.equal(persisted.includes('SYNTHETIC_PRIVATE_DRAFT'), false); assert.equal(persisted.includes(f.inputs.context), false);
});

for (const profile of [READING_TRIAL_PROFILE, READING_TRIAL_SETUP_PROFILE]) {
  test(profile + ' retains zero clears and rejects the v3 known-public reset', async t => {
    const f = await fixture(t, { trial: true, authorizeSend: true, profile });
    assert.equal(f.state.contract.scope.maximumClears, 0);
    assert.equal(Object.hasOwn(f.state.contract.scope, 'maximumKnownPublicDraftResets'), false);
    await assert.rejects(f.claim('reset-public-draft', f.draft()), /Only v3/);
    assert.equal(fs.existsSync(path.join(f.p.dir, 'reset-public-draft-claimed.json')), false);
  });
}

test('actual collapsed Read agentart.work disclosure may be inspected without inventing its hidden source URL', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const m = f.submitted(); m.rawAX = m.rawAX.replace('40 group Source tool result', '40 container Currently streaming message')
    .replace('41 button Fetch https://agentart.work/agent-index.json', '41 button Read agentart.work')
    .replace('\t\t\t\t42 text https://agentart.work/agent-index.json\n', '')
    .replace('\t\t\t\t43 text {"schema":"synthetic-index/1","revision":"synthetic-revision"}\n', '');
  const claim = await f.claim('inspect-tool', m, { scopeIndex: 40, controlIndex: 41, sourceUrl: 'https://agentart.work/agent-index.json' });
  assert.equal(claim.controlIndex, 41); assert.equal(claim.expectedSourceUrl, 'https://agentart.work/agent-index.json');
  assert.equal(claim.sourceBinding, 'expected-index-not-yet-observed'); assert.equal(Object.hasOwn(claim, 'sourceUrl'), false);
  await f.settle(claim.action, true);
  const report = await f.finish(); assert.equal(report.realClient.sourceAccess, 'not-observed');
});

test('collapsed tool exception rejects lookalike domains, controls, message boundaries and unrelated expected sources', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const make = (label = 'Read agentart.work', boundary = 'container Currently streaming message') => {
    const m = f.submitted(); m.rawAX = m.rawAX.replace('40 group Source tool result', '40 ' + boundary)
      .replace('41 button Fetch https://agentart.work/agent-index.json', '41 button ' + label)
      .replace('\t\t\t\t42 text https://agentart.work/agent-index.json\n', '')
      .replace('\t\t\t\t43 text {"schema":"synthetic-index/1","revision":"synthetic-revision"}\n', ''); return m;
  };
  const proof = { scopeIndex: 40, controlIndex: 41, sourceUrl: 'https://agentart.work/agent-index.json' };
  for (const label of ['Read agentart.work.evil.example', 'Read other.example', 'Read agentart.work/other',
    'Read agentart.work approve', 'Allow Read agentart.work', 'Copy response', 'Send']) await assert.rejects(f.claim('inspect-tool', make(label), proof));
  for (const boundary of ['container User message', 'container Assistant reply', 'group Currently streaming message']) await assert.rejects(f.claim('inspect-tool', make('Read agentart.work', boundary), proof));
  await assert.rejects(f.claim('inspect-tool', make(), { ...proof, sourceUrl: 'https://other.example/index.json' }));
  assert.equal(fs.readdirSync(f.p.dir).some(name => /^inspect-tool-.*-claimed\.json$/u.test(name)), false);
});

test('observed two-file two-command native summary permits local inspection only when its owned scope visibly identifies the index', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const make = (label = 'Created 2 files, ran 2 commands') => { const m = f.submitted();
    m.rawAX = m.rawAX.replace('41 button Fetch https://agentart.work/agent-index.json', '41 button ' + label); return m; };
  const selected = { scopeIndex: 40, controlIndex: 41, sourceUrl: 'https://agentart.work/agent-index.json' };
  for (const label of ['Created 3 files, ran 2 commands', 'Created 2 files, ran 1 command', 'Created 2 files, ran 2 commands Allow',
    'Run 2 commands', 'Approve commands', 'Copy response']) await assert.rejects(f.claim('inspect-tool', make(label), selected));
  const noUrl = make(); noUrl.rawAX = noUrl.rawAX.replace('\t\t\t\t42 text https://agentart.work/agent-index.json\n', '');
  await assert.rejects(f.claim('inspect-tool', noUrl, selected), /exact public Lab index/);
  const claim = await f.claim('inspect-tool', make(), selected);
  assert.equal(claim.controlIndex, 41); assert.equal(claim.disclosure, 'created-two-files-two-commands');
  assert.equal(claim.sourceBinding, 'index-url-visible'); await f.settle(claim.action, true);
  assert.equal((await f.finish()).realClient.sourceAccess, 'not-observed');
});

function curlDenialMaterial(f, { request = 'cd "$(pwd)" && curl -sS --max-time 20 -o agent-index.raw.json -w \'HTTP %{http_code} | %{content_type} | %{size_download} bytes\\n\' https://agentart.work/agent-index.json ; echo "exit=$?"',
  response = 'curl: (56) CONNECT tunnel failed, response 403\nHTTP 000 |  | 0 bytes\nexit=56' } = {}) {
  const m = f.submitted(); m.rawAX = m.rawAX.slice(0, m.rawAX.indexOf('\t\t\t40 group Source tool result\n'))
    + '\t\t\t40 container Fetch the index raw bytes once from the shell\n'
    + '\t\t\t\t41 button Fetch the index raw bytes once from the shell\n'
    + '\t\t\t\t42 text Request\n\t\t\t\t43 text ' + request + '\n'
    + '\t\t\t\t44 text Response\n\t\t\t\t45 text ' + response + '\n';
  return m;
}
const curlDenialSelection = () => ({ scopeIndex: 40, controlIndex: 41, requestLabelIndex: 42, requestIndex: 43,
  responseLabelIndex: 44, bodyIndex: 45, sourceUrl: 'https://agentart.work/agent-index.json' });

test('named expanded curl request and CONNECT403 zero-byte response records a failed request without loosening source-success URL proofs', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const m = curlDenialMaterial(f), selected = curlDenialSelection();
  const result = await requestDenialRemoteReading(f.state.id, { ...f.options, material: m, selection: selected });
  assert.equal(result.sourceResults[0].status, 'failed'); assert.equal(result.sourceResults[0].reason, 'access-failed');
  assert.equal(result.sourceResults[0].scope, 'visible-tool-access-denial');
  assert.equal(result.sourceResults[0].requestUrlBinding, 'visible-curl-request-single-explicit-url');
  assert.equal(result.sourceResults[0].rawByteIdentity, 'not-established');
  const report = await f.finish(); assert.equal(report.realClient.sourceAccess, 'failed'); assert.equal(report.passed, false);
  const stored = fs.readdirSync(f.p.dir).filter(name => name.endsWith('.json')).map(name => fs.readFileSync(path.join(f.p.dir, name), 'utf8')).join('\n');
  assert.equal(stored.includes('curl -sS'), false); assert.equal(stored.includes('exit=56'), false);
  assert.equal(stored.includes('HTTP 000 |  | 0 bytes'), false);
});

test('result selection can route only one isolated named request-denial object without changing the live controller binding', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit(); const m = curlDenialMaterial(f);
  const selected = { requestDenial: curlDenialSelection() };
  const result = await f.result(m, selected); assert.equal(result.sourceResults[0].status, 'failed');
  await assert.rejects(f.result(m, { ...selected, reply: {} }), /separate from reply/);
});

test('request-denial rejects multiple or unrelated URLs, noncurl/configured requests and success or unbound outputs', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit(); const selected = curlDenialSelection();
  const requests = ['curl https://other.example/index.json', 'curl https://agentart.work/agent-index.json https://other.example/',
    'curl https://agentart.work/agent-index.json; curl https://agentart.work/agent-index.json', 'printf https://agentart.work/agent-index.json',
    'curl --config settings https://agentart.work/agent-index.json', 'curl --request POST https://agentart.work/agent-index.json'];
  for (const request of requests) await assert.rejects(f.result(curlDenialMaterial(f, { request }), { requestDenial: selected }), /one curl/);
  for (const response of ['HTTP 200 | application/json | 12 bytes\nexit=0', 'The assistant says access was denied.',
    'curl: (56) CONNECT tunnel failed, response 403\nHTTP 000 |  | 1 bytes\nexit=56']) await assert.rejects(f.result(curlDenialMaterial(f, { response }), { requestDenial: selected }), /CONNECT403/);
  const broad = curlDenialMaterial(f); broad.rawAX = broad.rawAX.replace('40 container Fetch the index raw bytes once from the shell', '40 container Assistant reply');
  await assert.rejects(f.result(broad, { requestDenial: selected }), /expanded raw-index tool boundary/);
  const swapped = curlDenialMaterial(f); swapped.rawAX = swapped.rawAX.replace('42 text Request', '42 text Request quoted by assistant');
  await assert.rejects(f.result(swapped, { requestDenial: selected }), /exact Request and Response/);
  assert.equal(JSON.parse(fs.readFileSync(f.p.state)).inspections.length, 0);
});

function siblingCurlDenialMaterial(f) {
  const m = f.submitted(); m.rawAX = m.rawAX.slice(0, m.rawAX.indexOf('\t\t\t40 group Source tool result\n'))
    + '\t\t\t173 container Message 2 of 2\n\t\t\t\t174 container\n'
    + '\t\t\t\t\t189 container Fetch the index raw bytes once from the shell\n'
    + '\t\t\t\t\t\t190 text Fetch the index raw bytes once from the shell\n'
    + '\t\t\t\t\t\t191 button Fetch the index raw bytes once from the shell\n'
    + '\t\t\t\t\t192 container\n\t\t\t\t\t\t193 text Request\n'
    + '\t\t\t\t\t\t194 container\n\t\t\t\t\t\t\t195 text curl -sS --max-time 20 -o agent-index.raw.json https://agentart.work/agent-index.json\n'
    + '\t\t\t\t\t\t196 text Response\n\t\t\t\t\t\t197 text curl: (56) CONNECT tunnel failed, response 403\nHTTP 000 |  | 0 bytes\nexit=56\n';
  return m;
}
const siblingCurlDenialSelection = () => ({ scopeIndex: 189, contentIndex: 192, controlIndex: 191,
  requestLabelIndex: 193, requestIndex: 195, responseLabelIndex: 196, bodyIndex: 197,
  sourceUrl: 'https://agentart.work/agent-index.json' });

test('actual raw-curl tool header and adjacent sibling content bind one completed assistant tool denial', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit();
  const result = await f.result(siblingCurlDenialMaterial(f), { requestDenial: siblingCurlDenialSelection() });
  assert.equal(result.sourceResults[0].status, 'failed');
  assert.equal(result.sourceResults[0].evidence.contentBoundary, 'adjacent-tool-sibling-v1');
  assert.equal(result.sourceResults[0].evidence.indices.includes(173), true);
  assert.equal(result.sourceResults[0].evidence.indices.includes(192), true);
});

test('sibling request-denial rejects unrelated content, another tool, intervening siblings and uncompleted boundaries', async t => {
  const f = await fixture(t, { trial: true, authorizeSend: true }); await f.submit(); const selection = siblingCurlDenialSelection();
  const variants = [
    m => { m.rawAX = m.rawAX.replace('\t\t\t\t\t192 container', '\t\t\t\t192 container'); },
    m => { m.rawAX = m.rawAX.replace('189 container Fetch the index raw bytes once from the shell', '189 container Another tool'); },
    m => { m.rawAX = m.rawAX.replace('\t\t\t\t\t192 container', '\t\t\t\t\t198 container Different tool output\n\t\t\t\t\t192 container'); },
    m => { m.rawAX = m.rawAX.replace('173 container Message 2 of 2', '173 container User message'); },
    m => { m.rawAX = m.rawAX.replace('173 container Message 2 of 2', '173 container Currently streaming message'); },
    m => { m.rawAX += '\t\t\t\t\t199 button Stop response\n'; },
    m => { m.rawAX = m.rawAX.replace('\t\t\t\t\t\t191 button', '\t\t\t\t\t191 button'); },
  ];
  for (const mutate of variants) { const m = siblingCurlDenialMaterial(f); mutate(m); await assert.rejects(f.result(m, { requestDenial: selection })); }
  await assert.rejects(f.result(siblingCurlDenialMaterial(f), { requestDenial: { ...selection, contentIndex: 174 } }));
  assert.equal(JSON.parse(fs.readFileSync(f.p.state)).inspections.length, 0);
});

test('generic curl denial adapter binds actual Fetch title and Error response without inventing byte count', async t => {
  const f=await fixture(t,{trial:true,authorizeSend:true});await f.submit();
  const reply=f.submitted();await f.result(reply,{reply:f.selection(reply).reply});
  const m=siblingCurlDenialMaterial(f);
  m.rawAX=m.rawAX.replaceAll('Fetch the index raw bytes once from the shell','Fetch public index to check its bytes')
    .replace('191 button Fetch public index to check its bytes','191 button Fetch public index to check its bytes Failed')
    .replace('196 text Response','196 text Error')
    .replace('curl: (56) CONNECT tunnel failed, response 403\nHTTP 000 |  | 0 bytes\nexit=56',
      'Exit code 2\nHTTP/1.1 403 Forbidden\nContent-Length: 71\n\ncurl: (56) CONNECT tunnel failed, response 403\nexit=56');
  const selection={...siblingCurlDenialSelection(),adapterVersion:'curl-request-denial-v2'};
  const r=await f.result(m,{requestDenial:selection});
  assert.equal(r.sourceResults[0].status,'failed');assert.equal(r.sourceResults[0].evidence.byteCount,'not-established');
  for(const response of ['HTTP/1.1 200 OK','Assistant says access denied','HTTP/1.1 403 Forbidden\nHTTP/1.1 200 OK']) {
    const wrong=siblingCurlDenialMaterial(f);
    wrong.rawAX=wrong.rawAX.replace('curl: (56) CONNECT tunnel failed, response 403\nHTTP 000 |  | 0 bytes\nexit=56',response);
    await assert.rejects(f.result(wrong,{requestDenial:selection}));
  }
});

test('completed owned source activity can be opened before its hidden target is exposed, without claiming acquisition', async t => {
  const f=await fixture(t,{trial:true,authorizeSend:true});await f.submit();
  const m=f.submitted();await f.sent(m,{scopeIndex:20,messageIndex:21,ownedUserMessage:true});
  await f.result(m,{reply:f.selection(m).reply});
  const actual=f.submitted();actual.rawAX=actual.rawAX.replace('30 group Assistant reply','30 container Message 2 of 2')
    .replace('34 button Copy response','34 button Copy response\n\t\t\t\t35 button Read a page, ran a command, 1 failed');
  const claim=await f.claim('inspect-tool',actual,{scopeIndex:30,controlIndex:35,sourceUrl:'https://agentart.work/agent-index.json'});
  assert.equal(claim.sourceBinding,'expected-index-not-yet-observed');assert.equal(claim.disclosure,'owned-completed-source-activity');
  await f.settle(claim.action,true);assert.equal((await f.finish()).realClient.sourceAccess,'not-observed');
});

test('owned completed native tool headers are structural, not a fixed verb whitelist', async t => {
  const f=await fixture(t,{trial:true,authorizeSend:true});await f.submit();
  const m=f.submitted();await f.sent(m,{scopeIndex:20,messageIndex:21,ownedUserMessage:true});
  await f.result(m,{reply:f.selection(m).reply});
  const actual=f.submitted();actual.rawAX=actual.rawAX.replace('30 group Assistant reply','30 container Message 2 of 2')
    .replace('34 button Copy response','34 button Copy response\n\t\t\t\t35 container Download public index\n'
      +'\t\t\t\t\t36 text Download public index\n\t\t\t\t\t37 button Download public index Failed');
  const selection={scopeIndex:35,controlIndex:37,sourceUrl:'https://agentart.work/agent-index.json'};
  for(const word of ['Approve','Delete','Send']) {
    const wrong={...actual,rawAX:actual.rawAX.replaceAll('Download public index',word+' public index')};
    await assert.rejects(f.claim('inspect-tool',wrong,selection));
  }
  assert.equal((await f.claim('inspect-tool',actual,selection)).controlIndex,37);
});
