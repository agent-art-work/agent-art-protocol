import { setupTestAuthority } from './execution-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createBenchServer } from './server.mjs';
import { loadBenchInputs } from './inputs.mjs';
import * as runner from './desktop-runner.mjs';
import { controlledFixture } from './execution-fixture.mjs';
const clocked = new WeakSet();

const httpStatus = (url, headers) => new Promise((resolve, reject) => {
  const request = http.get(url, { headers }, response => { response.resume(); resolve(response.statusCode); });
  request.on('error', reject);
});

async function fixture(t, { desktop = false } = {}) {
  if (!clocked.has(t)) { t.mock.timers.enable({ apis: ['Date'], now: Date.now() }); clocked.add(t); }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-bench-test-'));
  setupTestAuthority(t, root);
  const directory = desktop ? path.join(root, '.local/test-bench/runs') : root;
  // Explicit synthetic metadata: test statements are never desktop findings.
  const environment = { os: { name: 'test-fixture', version: '1' }, browser: { name: 'test-fixture', version: '1' }, apps: { 'claude-app': { version: '1' }, 'codex-app': { version: '1' } } };
  const inputs = await loadBenchInputs({ environment });
  const server = createBenchServer({ inputs, storeDir: directory, ...(desktop && { desktopRoot: root }) });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); fs.rmSync(root, { recursive: true, force: true }); });
  const config = await (await fetch(origin + '/api/config')).json();
  const post = (route, body, headers = {}) => fetch(origin + route, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Bench-Token': config.token, ...headers }, body: JSON.stringify(body) });
  return { origin, root, directory, inputs, config, post };
}

test('pinned public Work and installed package are served without exposing package paths or launching a client', async t => {
  const { origin, config, inputs } = await fixture(t);
  assert.equal(config.manifest.sdkVersion, inputs.packagePin.sdkVersion);
  assert.equal(config.manifest.archiveSha256, inputs.packagePin.archiveSha256);
  assert.equal(config.manifest.contextBytes, 983);
  assert.equal(config.context, config.work.context[0].text);
  assert.equal(config.packageDir, undefined);
  const page = await fetch(origin + '/?lane=browser');
  assert.match(page.headers.get('content-security-policy'), /connect-src 'self'/);
  assert.doesNotMatch(page.headers.get('content-security-policy'), /unsafe-inline/);
  assert.match(await page.text(), /Browser checks/);
  assert.equal((await fetch(origin + '/sdk/reading-ui.mjs')).status, 200);
  assert.equal((await fetch(origin + '/sdk/package.json')).status, 404);
  assert.equal((await fetch(origin + '/ui-fixtures.mjs')).status, 200);
  assert.equal((await fetch(origin + '/ui-candidate-fixtures.mjs')).status, 200);
  assert.equal((await fetch(origin + '/assets/agent-art-reading-work.mjs')).status, 200);
  const fixtureUI = await fetch(origin + '/assets/agent-art-sdk/reading-ui.mjs');
  assert.equal(await fixtureUI.text(), await (await fetch(origin + '/sdk/reading-ui.mjs')).text());
  assert.equal((await fetch(origin + '/assets/agent-art-sdk/package.json')).status, 404);
});

test('local write capability, Origin and Host checks prevent cross-site record injection', async t => {
  const { origin, post } = await fixture(t);
  assert.equal((await post('/api/runs', {}, { 'X-Bench-Token': '' })).status, 403);
  assert.equal((await post('/api/runs', {}, { Origin: 'https://unrelated.invalid' })).status, 403);
  const hostileHostStatus = await httpStatus(origin + '/api/config', { Host: 'unrelated.invalid' });
  assert.equal(hostileHostStatus, 403);
  assert.equal((await post('/api/runs', { environment: { forged: true } })).status, 400);
});

test('cross-site top-level navigation can open the public page while API reads stay same-origin', async t => {
  const { origin } = await fixture(t);
  const headers = { 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };
  assert.equal(await httpStatus(origin + '/?lane=desktop', headers), 200);
  assert.equal(await httpStatus(origin + '/api/config', headers), 403);
});

test('append-only declarations preserve lane separation, contradictory reports and no private draft content', async t => {
  const { origin, post, directory, inputs } = await fixture(t);
  const created = await post('/api/runs', {}); assert.equal(created.status, 201);
  const { run } = await created.json();
  const route = `/api/runs/${run.id}/observations`;
  const request = { lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation', material: { kind: 'browser-event', ref: 'native-click' } };
  assert.equal((await post(route, request)).status, 201);
  assert.equal((await post(route, { ...request, claim: 'completion', status: 'observed' })).status, 400);
  const report = { lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat', claim: 'completion', status: 'operator-reported', source: 'operator', material: { kind: 'operator-check', method: 'operator-confirmation' } };
  assert.equal((await post(route, report)).status, 201);
  const last = await post(route, { ...report, status: 'failed', notes: 'Synthetic fixture: output unavailable.' });
  assert.equal(last.status, 201);
  const result = await last.json();
  assert.equal(result.summary.realClient.clients['claude-app'].completion.status, 'mixed');
  assert.equal(result.summary.realClient.clients['codex-app'].completion.status, 'not-run');
  assert.equal(result.run.observations.length, 3);
  assert.equal((await post(route, { ...report, transcript: 'must not be accepted' })).status, 400);
  const stored = fs.readFileSync(path.join(directory, run.id + '.json'), 'utf8');
  assert.equal(stored.includes(inputs.context), false);
  assert.equal(stored.includes('must not be accepted'), false);
  assert.equal((await (await fetch(origin + `/api/runs/${run.id}`)).json()).run.observations.length, 3);
});

test('exact composer claims require the explicit matching digest rather than a visual checkbox', async t => {
  const { post, inputs } = await fixture(t);
  const { run } = await (await post('/api/runs', {})).json();
  const route = `/api/runs/${run.id}/observations`;
  const observation = { lane: 'real-client', requestedClient: 'codex-app', actualSurface: 'codex', claim: 'context-matches', status: 'operator-reported', source: 'operator', material: { kind: 'operator-check', method: 'operator-confirmation' } };
  assert.equal((await post(route, observation)).status, 400);
  assert.equal((await post(route, { ...observation, material: { kind: 'operator-check', method: 'composer-utf8-sha256', contextSha256: 'a'.repeat(64) } })).status, 400);
  assert.equal((await post(route, { ...observation, material: { kind: 'operator-check', method: 'composer-utf8-sha256', contextSha256: inputs.manifest.contextSha256 } })).status, 201);
});

const nativeRequest = () => ({
  lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation',
  material: { kind: 'browser-event', ref: 'synthetic/component-click' },
});
const ownedDraft = () => ({
  lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat', claim: 'draft-arrived', status: 'observed', source: 'desktop-ui',
  material: { kind: 'desktop-ui-check', method: 'visual-inspection', ref: 'synthetic/owned-composer' },
});

async function prepareControlledCase(t, f) {
  const state = await runner.prepareCase({ root: f.root, inputs: f.inputs, allowSend: true });
  const control = controlledFixture(t, { state, root: f.root, inputs: f.inputs });
  control.handoff(); t.mock.timers.tick(1);
  return { state, control };
}

test('case-bound browser POSTs use the runner journal and retain its observer restrictions', async t => {
  const f = await fixture(t, { desktop: true });
  const { state, control } = await prepareControlledCase(t, f);
  const p = runner.pathsFor(state.id, f.root), route = `/api/runs/${state.runId}/observations`;
  const response = await f.post(route, nativeRequest());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).run.observations.length, 1);
  assert.ok(JSON.parse(fs.readFileSync(p.journal, 'utf8')).some(event => event.action === 'observed-handoff-requested-requested'));

  const operator = { ...ownedDraft(), source: 'operator', status: 'operator-reported', material: { kind: 'operator-check', method: 'operator-confirmation' } };
  assert.equal((await f.post(route, operator)).status, 400);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.directory, state.runId + '.json'), 'utf8')).observations.length, 1);
});

test('paused, finished and expired case-bound runs reject late browser writes without changing their records', async t => {
  for (const lifecycle of ['paused', 'finished', 'expired']) {
    const f = await fixture(t, { desktop: true });
    const { state, control } = await prepareControlledCase(t, f);
    const p = runner.pathsFor(state.id, f.root), file = path.join(f.directory, state.runId + '.json');
    if (lifecycle === 'paused') runner.pauseCase(state.id, { root: f.root, reason: 'inspection-approval' });
    if (lifecycle === 'finished') runner.finishCase(state.id, { root: f.root });
    if (lifecycle === 'expired') {
      const current = JSON.parse(fs.readFileSync(p.state, 'utf8'));
      fs.writeFileSync(p.state, JSON.stringify({ ...current, deadlineAt: '2000-01-01T00:00:00.000Z' }) + '\n');
    }
    const beforeRun = fs.readFileSync(file, 'utf8'), beforeState = fs.readFileSync(p.state, 'utf8');
    const beforeJournal = fs.readFileSync(p.journal, 'utf8');
    assert.equal((await f.post(`/api/runs/${state.runId}/observations`, nativeRequest())).status, 400, lifecycle);
    assert.equal(fs.readFileSync(file, 'utf8'), beforeRun, lifecycle);
    assert.equal(fs.readFileSync(p.state, 'utf8'), beforeState, lifecycle);
    assert.equal(fs.readFileSync(p.journal, 'utf8'), beforeJournal, lifecycle);
    assert.equal(fs.existsSync(p.claim), false, lifecycle);
  }
});

test('a browser append waits for the same case lock and retains a concurrent controller observation', { timeout: 5000 }, async t => {
  const f = await fixture(t, { desktop: true });
  const { state, control } = await prepareControlledCase(t, f);
  const p = runner.pathsFor(state.id, f.root), open = fs.openSync;
  const held = open(p.mutex, 'wx', 0o600);
  let releaseSignal;
  const attempted = new Promise(resolve => { releaseSignal = resolve; });
  t.mock.method(fs, 'openSync', function(file, ...args) {
    if (file === p.mutex) releaseSignal();
    return open.call(this, file, ...args);
  });
  const pending = f.post(`/api/runs/${state.runId}/observations`, nativeRequest());
  try { await attempted; }
  finally { fs.closeSync(held); fs.unlinkSync(p.mutex); }
  // This completes while the server is waiting after its known pre-write lock
  // conflict. The server must reread through observeCase, not replace this run
  // with the stale snapshot it read before obtaining the shared lock.
  const proof = control.proof(), draft = ownedDraft();
  runner.observeCase(state.id, { ...draft, material: { ...draft.material, captureId: proof.captureId, capturedAt: proof.capturedAt, snapshotSha256: proof.snapshotSha256 } }, { root: f.root, executionProof: proof });
  const response = await pending;
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.deepEqual(result.run.observations.map(observation => observation.claim), ['draft-arrived', 'handoff-requested']);
  const stored = JSON.parse(fs.readFileSync(path.join(f.directory, state.runId + '.json'), 'utf8'));
  assert.deepEqual(stored, result.run);
  assert.equal(new Set(stored.observations.map(observation => observation.id)).size, 2);
});

test('a case finishing after HTTP ownership lookup still prevents the append inside the shared lock', async t => {
  const f = await fixture(t, { desktop: true });
  const { state, control } = await prepareControlledCase(t, f);
  const p = runner.pathsFor(state.id, f.root), open = fs.openSync;
  let finished = false;
  t.mock.method(fs, 'openSync', function(file, ...args) {
    if (file === p.mutex && !finished) {
      finished = true;
      runner.finishCase(state.id, { root: f.root });
    }
    return open.call(this, file, ...args);
  });
  const before = fs.readFileSync(path.join(f.directory, state.runId + '.json'), 'utf8');
  assert.equal((await f.post(`/api/runs/${state.runId}/observations`, nativeRequest())).status, 400);
  assert.equal(finished, true);
  assert.equal(fs.readFileSync(path.join(f.directory, state.runId + '.json'), 'utf8'), before);
  assert.equal(JSON.parse(fs.readFileSync(p.state, 'utf8')).status, 'finished');
});

const dispatch = (overrides = {}) => ({ client: 'claude-app', lane: 'browser', cancelled: true,
  isTrusted: true, at: new Date().toISOString(), ...overrides });

test('bounded post-dispatch receipts persist independently of native-arrival observations', async t => {
  const f = await fixture(t);
  const { run } = await (await f.post('/api/runs', {})).json();
  const route = `/api/runs/${run.id}/dispatches`;
  assert.deepEqual((await (await fetch(f.origin + route)).json()).dispatches, []);
  const response = await f.post(route, dispatch()); assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.equal(receipt.provenance, 'owned-bench-run-receipt'); assert.equal(receipt.runId, run.id);
  assert.deepEqual(receipt.manifest, f.inputs.manifest);
  assert.deepEqual(receipt.dispatches[0], { ...dispatch(), recordedAt: new Date().toISOString(), ordinal: 1 });
  assert.equal(Object.hasOwn(receipt, 'token'), false); assert.equal(Object.hasOwn(receipt, 'context'), false);
  assert.equal((await (await fetch(f.origin + `/api/runs/${run.id}`)).json()).run.observations.length, 0,
    'a dispatch receipt must not silently append native arrival, execution or handoff assertions');
  const stored = fs.readFileSync(path.join(f.directory, run.id + '.dispatches.json'), 'utf8');
  assert.equal(stored.includes(f.inputs.context), false); assert.equal(stored.includes(f.config.token), false);
  const second = createBenchServer({ inputs: f.inputs, storeDir: f.directory });
  await new Promise(resolve => second.listen(0, '127.0.0.1', resolve));
  try {
    const freshOrigin = `http://127.0.0.1:${second.address().port}`;
    assert.deepEqual(await (await fetch(freshOrigin + route)).json(), receipt, 'fresh server reads the same persisted bounded receipt');
  } finally { second.closeAllConnections(); await new Promise(resolve => second.close(resolve)); }
});

test('dispatch receipt API retains token, same-origin and body-size restrictions', async t => {
  const f = await fixture(t), { run } = await (await f.post('/api/runs', {})).json();
  const route = `/api/runs/${run.id}/dispatches`;
  assert.equal((await f.post(route, dispatch(), { 'X-Bench-Token': '' })).status, 403);
  assert.equal((await f.post(route, dispatch(), { Origin: 'https://unrelated.invalid' })).status, 403);
  assert.equal((await f.post(route, dispatch(), { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal(await httpStatus(f.origin + route, { Origin: 'https://unrelated.invalid' }), 403);
  assert.equal(await httpStatus(f.origin + route, { Host: 'unrelated.invalid' }), 403);
  assert.equal((await f.post(route, { ...dispatch(), transcript: 'x'.repeat(13000) })).status, 400);
  assert.equal((await f.post(route, dispatch(), { 'Content-Type': 'text/plain' })).status, 403);
  assert.equal((await (await fetch(f.origin + route)).json()).dispatches.length, 0);
});

test('dispatch receipts accept exact bounded event fields only and never retain arbitrary text', async t => {
  const f = await fixture(t), { run } = await (await f.post('/api/runs', {})).json();
  const route = `/api/runs/${run.id}/dispatches`, sentinel = 'SYNTHETIC_PRIVATE_DISPATCH_SENTINEL';
  const bad = [null, [], {}, dispatch({ client: sentinel }), dispatch({ lane: 'real-client' }),
    dispatch({ cancelled: 'true' }), dispatch({ isTrusted: 1 }), dispatch({ at: sentinel }),
    dispatch({ at: new Date(Date.now() - 120001).toISOString() }), dispatch({ at: new Date(Date.now() + 30001).toISOString() }),
    { ...dispatch(), transcript: sentinel }, { ...dispatch(), href: 'https://unrelated.invalid/' + sentinel },
    { ...dispatch(), recordedAt: new Date().toISOString() }, { ...dispatch(), ordinal: 1 }];
  for (const value of bad) assert.equal((await f.post(route, value)).status, 400);
  const file = path.join(f.directory, run.id + '.dispatches.json'); assert.equal(fs.existsSync(file), false);
  assert.equal((await f.post(route, dispatch({ isTrusted: false }))).status, 201,
    'false trust is an observed event fact; the authority guard separately refuses it as a real activation');
  assert.equal(fs.readFileSync(file, 'utf8').includes(sentinel), false);
});

test('dispatch receipts require an existing current-pinned run and reject corrupt stored extra text', async t => {
  const f = await fixture(t), missing = '/api/runs/reading-missing/dispatches';
  assert.equal((await fetch(f.origin + missing)).status, 404); assert.equal((await f.post(missing, dispatch())).status, 404);
  const { run } = await (await f.post('/api/runs', {})).json(), route = `/api/runs/${run.id}/dispatches`;
  assert.equal((await f.post(route, dispatch())).status, 201);
  const file = path.join(f.directory, run.id + '.dispatches.json'), original = fs.readFileSync(file);
  const corrupt = JSON.parse(original); corrupt.dispatches[0].transcript = 'SYNTHETIC_PRIVATE'; fs.writeFileSync(file, JSON.stringify(corrupt));
  const blocked = await fetch(f.origin + route); assert.equal(blocked.status, 400); assert.equal((await blocked.text()).includes('SYNTHETIC_PRIVATE'), false);
  fs.writeFileSync(file, original);
  const runFile = path.join(f.directory, run.id + '.json'), changed = JSON.parse(fs.readFileSync(runFile));
  changed.manifest.archiveSha256 = '0'.repeat(64); fs.writeFileSync(runFile, JSON.stringify(changed));
  assert.equal((await fetch(f.origin + route)).status, 400); assert.equal((await f.post(route, dispatch())).status, 400);
});

test('four event slots retain ordered facts; a fifth cannot overwrite the earlier receipts', async t => {
  const f = await fixture(t), { run } = await (await f.post('/api/runs', {})).json();
  const route = `/api/runs/${run.id}/dispatches`;
  for (let index = 0; index < 4; index++) {
    const response = await f.post(route, dispatch({ lane: index % 2 ? 'desktop' : 'browser', cancelled: index % 2 === 0 }));
    assert.equal(response.status, 201); assert.equal((await response.json()).dispatches.at(-1).ordinal, index + 1);
  }
  const before = fs.readFileSync(path.join(f.directory, run.id + '.dispatches.json'));
  assert.equal((await f.post(route, dispatch())).status, 400);
  assert.deepEqual(fs.readFileSync(path.join(f.directory, run.id + '.dispatches.json')), before);
  assert.deepEqual((await (await fetch(f.origin + route)).json()).dispatches.map(item => item.ordinal), [1, 2, 3, 4]);
});
