import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request as httpRequest } from 'node:http';
import { mkdtemp, readFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/api.mjs';
import { digest } from '../server/protocol.mjs';

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'agent-art-local-test-'));
  let api, server, endpoint, session;
  async function start() {
    api = await createApi({ dataDir: dir });
    server = createServer(async (req, res) => { if (!await api.handle(req, res)) { res.writeHead(404); res.end(); } });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    endpoint = `http://127.0.0.1:${server.address().port}`;
    session = (await (await fetch(`${endpoint}/api/bootstrap`)).json()).sessionToken;
  }
  async function stop() { await new Promise(resolve => server.close(resolve)); await api.close(); }
  await start();
  t.after(async () => { await stop(); await rm(dir, { recursive: true, force: true }); });
  async function request(path, { method = 'GET', value, token = session, headers = {} } = {}) {
    if (headers.host) return new Promise((resolve, reject) => {
      const req = httpRequest(`${endpoint}${path}`, { method, headers }, response => { let text = ''; response.on('data', chunk => { text += chunk; }); response.on('end', () => resolve({status: response.statusCode, value: JSON.parse(text), headers: new Headers(response.headers)})); });
      req.on('error', reject); req.end();
    });
    const response = await fetch(`${endpoint}${path}`, { method, headers: { authorization: `Bearer ${token}`, ...(value !== undefined ? { 'content-type': 'application/json' } : {}), ...headers }, ...(value !== undefined ? { body: JSON.stringify(value) } : {}) });
    return { status: response.status, value: await response.json(), headers: response.headers };
  }
  async function encounter(text = 'A room remembers its windows.') {
    const created = await request('/api/works', { method: 'POST', value: { title: 'Synthetic test encounter', curatorName: 'Test curator' } });
    assert.equal(created.status, 201);
    const workId = created.value.work.id;
    const human = await request(`/api/works/${workId}/human-acts`, { method: 'POST', value: { text } });
    assert.equal(human.status, 201);
    const grant = await request(`/api/works/${workId}/agent-grants`, { method: 'POST', value: { agentName: 'Synthetic test principal' } });
    assert.equal(grant.status, 201);
    const launch = JSON.parse(await readFile(join(dir, 'launch', `${workId}.json`), 'utf8'));
    assert.equal(launch.endpoint, endpoint);
    assert.equal(grant.value.token, undefined);
    const context = await request('/api/agent/context', { token: launch.token });
    assert.equal(context.status, 200);
    return { workId, grantId: grant.value.grant.id, token: launch.token, participantId: launch.participantId, context: context.value.context, opening: human.value.act };
  }
  return { dir, request, encounter, restart: async () => { await stop(); await start(); } };
}

function payload(encounter, overrides = {}) {
  return { submissionId: 'synthetic-submission-1', contextId: encounter.context.id, kind: 'line', text: 'Light leaves without closing the door.', relations: [{ kind: 'responds-to', target: encounter.opening.id }], ...overrides };
}

test('exact UTF-8 Acts, Relations, selected consequence and honest evidence boundaries', async t => {
  const f = await fixture(t);
  const e = await f.encounter('  A window holds 🌒.  ');
  const exact = '  I leave the night unlatched.  ';
  const response = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { text: exact }) });
  assert.equal(response.status, 201);
  assert.equal(response.value.act.text, exact);
  assert.equal(response.value.relations[0].target, e.opening.id);
  const view = await f.request(`/api/works/${e.workId}/select`, { method: 'POST', value: { actId: response.value.act.id } });
  assert.deepEqual(view.value.artifact.lines.map(a => a.text), ['  A window holds 🌒.  ', exact]);
  const claims = view.value.verification.claims;
  assert.equal(claims.find(c => c.id === 'retained-byte-bindings').verdict, 'supported-under-policy');
  assert.equal(claims.find(c => c.id === 'selected-artifact-exact-pair').verdict, 'supported-under-policy');
  assert.equal(claims.find(c => c.id === 'independent-agent-execution-origin').verdict, 'not-established');
  assert.equal(claims.find(c => c.id === 'website-presentation').verdict, 'not-established');
  const exported = await f.request(`/api/works/${e.workId}/export`);
  const serialized = JSON.stringify(exported.value);
  assert(!serialized.includes(e.token));
  assert(!serialized.includes('tokenHash'));
  assert.equal((await stat(join(f.dir, 'state.json'))).mode & 0o777, 0o600);
  assert.equal((await stat(join(f.dir, 'launch', `${e.workId}.json`))).mode & 0o777, 0o600);
});

test('lost acknowledgment recovers after restart and revocation without another Act', async t => {
  const f = await fixture(t), e = await f.encounter();
  const exactPayload = payload(e);
  // The caller deliberately discards the acknowledgment before restarting the service.
  await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: exactPayload });
  await f.restart();
  const status = await f.request(`/api/agent/submissions/${exactPayload.submissionId}`, { token: e.token });
  assert.equal(status.status, 200);
  const originalId = status.value.act.id;
  await f.request(`/api/works/${e.workId}/grants/${e.grantId}/revoke`, { method: 'POST', value: {} });
  const replay = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: exactPayload });
  assert.equal(replay.status, 200); assert.equal(replay.value.replayed, true); assert.equal(replay.value.act.id, originalId);
  const changed = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: { ...exactPayload, text: 'Changed payload.' } });
  assert.equal(changed.status, 409); assert.equal(changed.value.error.code, 'submission_conflict');
  const fresh = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: { ...exactPayload, submissionId: 'fresh-submission' } });
  assert.equal(fresh.status, 403); assert.equal(fresh.value.error.code, 'grant_revoked');
  const after = await f.request(`/api/works/${e.workId}`);
  assert.equal(after.value.acts.length, 2); assert.equal(after.value.relations.length, 2);
  assert.equal(after.value.acceptances.length, 2);
  assert.equal((await f.request('/api/agent/context', { token: e.token })).status, 403);
});

test('concurrent duplicates commit atomically once; changed bytes conflict', async t => {
  const f = await fixture(t), e = await f.encounter();
  const both = await Promise.all([1, 2].map(() => f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e) })));
  assert.deepEqual(both.map(x => x.status).sort(), [200, 201]);
  assert.equal(both[0].value.act.id, both[1].value.act.id);
  const conflict = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { relations: [{ kind: 'responds-to', target: e.opening.id }, { kind: 'revises', target: e.opening.id }] }) });
  assert.equal(conflict.status, 409);
  const view = await f.request(`/api/works/${e.workId}`);
  assert.equal(view.value.acts.length, 2); assert.equal(view.value.relations.length, 2);
});

test('scoped capabilities, exact context and atomic validation reject foreign targets and unsupported media', async t => {
  const f = await fixture(t), e = await f.encounter(), other = await f.encounter('Another encounter.');
  const invalid = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { relations: [{ kind: 'responds-to', target: other.opening.id }] }) });
  assert.equal(invalid.status, 400);
  const wrongContext = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { contextId: other.context.id }) });
  assert.equal(wrongContext.status, 409);
  const media = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: { ...payload(e), media: { url: 'https://example.invalid/image.svg' } } });
  assert.equal(media.status, 400); assert.equal(media.value.error.code, 'unsupported_field');
  const multiline = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { text: 'One\nTwo' }) });
  assert.equal(multiline.status, 400);
  assert.equal((await f.request(`/api/works/${other.workId}`, { token: e.token })).status, 401);
  const view = await f.request(`/api/works/${e.workId}`);
  assert.equal(view.value.acts.length, 1); assert.equal(view.value.relations.length, 1);
  const accepted = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e) });
  assert.equal(accepted.status, 201, 'Rejected validation did not partially occupy the submission identity.');
});

test('refusal is retained without manufacturing a pair; revision preserves original contribution', async t => {
  const f = await fixture(t), e = await f.encounter();
  const refusal = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { kind: 'refusal', text: 'I decline this invitation.' }) });
  assert.equal(refusal.status, 201);
  assert.equal((await f.request(`/api/works/${e.workId}/select`, { method: 'POST', value: { actId: refusal.value.act.id } })).status, 400);
  const next = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { submissionId: 'response-after-refusal' }) });
  const context = await f.request('/api/agent/context', { token: e.token });
  const revision = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e, { submissionId: 'revision', contextId: context.value.context.id, text: 'Light leaves the door undecided.', relations: [{ kind: 'responds-to', target: e.opening.id }, { kind: 'revises', target: next.value.act.id }] }) });
  assert.equal(revision.status, 201);
  const view = await f.request(`/api/works/${e.workId}`);
  assert(view.value.acts.some(a => a.id === next.value.act.id && a.text === 'Light leaves without closing the door.'));
  assert.equal(view.value.artifact, null);
});

test('offline verification identifies tampered artifact and Act without upgrading origin', async t => {
  const f = await fixture(t), e = await f.encounter();
  const accepted = await f.request('/api/agent/acts', { method: 'POST', token: e.token, value: payload(e) });
  await f.request(`/api/works/${e.workId}/select`, { method: 'POST', value: { actId: accepted.value.act.id } });
  const exported = (await f.request(`/api/works/${e.workId}/export`)).value;
  exported.artifact.lines[1].text = 'Silently replaced.';
  let report = await f.request('/api/verify', { method: 'POST', value: { package: exported } });
  assert.equal(report.status, 200);
  assert.equal(report.value.claims.find(c => c.id === 'selected-artifact-exact-pair').verdict, 'contradicted');
  assert.equal(report.value.claims.find(c => c.id === 'retained-byte-bindings').verdict, 'supported-under-policy');
  exported.acts[1].text = 'Also replaced.';
  report = await f.request('/api/verify', { method: 'POST', value: { package: exported } });
  assert.equal(report.value.claims.find(c => c.id === 'retained-byte-bindings').verdict, 'contradicted');
  assert.equal(report.value.claims.find(c => c.id === 'independent-agent-execution-origin').verdict, 'not-established');
  const unchanged = await f.request(`/api/works/${e.workId}`);
  assert.equal(unchanged.value.acts[1].text, 'Light leaves without closing the door.');
});

test('browser boundary rejects cross-origin, hostile Host and cross-site requests', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/api/bootstrap', { headers: { origin: 'https://untrusted.invalid' } })).status, 403);
  assert.equal((await f.request('/api/bootstrap', { headers: { host: 'untrusted.invalid:4174' } })).status, 403);
  assert.equal((await f.request('/api/bootstrap', { headers: { 'sec-fetch-site': 'cross-site' } })).status, 403);
  const normal = await f.request('/api/bootstrap');
  assert.equal(normal.status, 200); assert.equal(normal.headers.get('access-control-allow-origin'), null);
});

test('verification rejects missing receipts and rehashed artifact transplants', async t => {
  const f = await fixture(t), e = await f.encounter();
  const response = await f.request('/api/agent/acts', {method:'POST',token:e.token,value:payload(e)});
  await f.request(`/api/works/${e.workId}/select`, {method:'POST',value:{actId:response.value.act.id}});
  const original = (await f.request(`/api/works/${e.workId}/export`)).value;
  const missing = structuredClone(original); missing.acceptances = [];
  const omitted = await f.request('/api/verify', {method:'POST',value:{package:missing}});
  assert.equal(omitted.value.claims.find(c => c.id === 'retained-byte-bindings').verdict, 'contradicted');
  for (const [field,value] of [['workId','another-work'],['definitionId','another-definition'],['renderer','a-different-renderer']]) {
    const copy = structuredClone(original); copy.artifact[field] = value;
    const {id:ignoredId,digest:ignoredDigest,...body} = copy.artifact;
    copy.artifact.digest = digest(body); copy.artifact.id = `artifact_${copy.artifact.digest.slice(7)}`;
    const result = await f.request('/api/verify', {method:'POST',value:{package:copy}});
    assert.equal(result.value.claims.find(c => c.id === 'selected-artifact-exact-pair').verdict, 'contradicted', field);
  }
  const unsupported = {...original,policy:'trust-everything/1'};
  assert.equal((await f.request('/api/verify', {method:'POST',value:{package:unsupported}})).status, 400);
});

test('curator retry recovers an accepted opening after closure and conflicts on changed text', async t => {
  const f = await fixture(t);
  const created = await f.request('/api/works', {method:'POST',value:{title:'Curator recovery test'}});
  const workId = created.value.work.id, input = {text:'An exact opening.',submissionId:'curator-intent-1'};
  const accepted = await f.request(`/api/works/${workId}/human-acts`, {method:'POST',value:input});
  await f.request(`/api/works/${workId}/close`, {method:'POST',value:{}});
  const recovered = await f.request(`/api/works/${workId}/human-acts`, {method:'POST',value:input});
  assert.equal(recovered.status, 200); assert.equal(recovered.value.act.id, accepted.value.act.id);
  assert.equal((await f.request(`/api/works/${workId}/human-acts`, {method:'POST',value:{...input,text:'A substituted opening.'}})).status, 409);
  assert.equal((await f.request(`/api/works/${workId}`)).value.acts.length, 1);
});
