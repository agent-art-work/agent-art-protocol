import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createBenchServer } from './server.mjs';
import { loadBenchInputs } from './inputs.mjs';

const httpStatus = (url, headers) => new Promise((resolve, reject) => {
  const request = http.get(url, { headers }, response => { response.resume(); resolve(response.statusCode); });
  request.on('error', reject);
});

async function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-bench-test-'));
  // Explicit synthetic metadata: test statements are never desktop findings.
  const environment = { os: { name: 'test-fixture', version: '1' }, browser: { name: 'test-fixture', version: '1' }, apps: { 'claude-app': { version: '1' }, 'codex-app': { version: '1' } } };
  const inputs = await loadBenchInputs({ environment });
  const server = createBenchServer({ inputs, storeDir: directory });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); fs.rmSync(directory, { recursive: true, force: true }); });
  const config = await (await fetch(origin + '/api/config')).json();
  const post = (route, body, headers = {}) => fetch(origin + route, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Bench-Token': config.token, ...headers }, body: JSON.stringify(body) });
  return { origin, directory, inputs, config, post };
}

test('pinned public Work and installed package are served without exposing package paths or launching a client', async t => {
  const { origin, config } = await fixture(t);
  assert.equal(config.manifest.sdkVersion, '0.1.2');
  assert.equal(config.manifest.contextBytes, 983);
  assert.equal(config.context, config.work.context[0].text);
  assert.equal(config.packageDir, undefined);
  const page = await fetch(origin + '/?lane=browser');
  assert.match(page.headers.get('content-security-policy'), /connect-src 'self'/);
  assert.doesNotMatch(page.headers.get('content-security-policy'), /unsafe-inline/);
  assert.match(await page.text(), /Browser checks/);
  assert.equal((await fetch(origin + '/sdk/reading-ui.mjs')).status, 200);
  assert.equal((await fetch(origin + '/sdk/package.json')).status, 404);
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
