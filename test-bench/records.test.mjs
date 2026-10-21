import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, addObservation, summarizeRun, validateRun } from './records.mjs';

const contextSha256 = 'a'.repeat(64);
const manifest = () => ({ id: 'lab-reading', workId: 'https://agentart.work/#reading', workVersion: 'reading-2026-10-21', sdkVersion: '0.1.2', archiveSha256: 'b'.repeat(64), contextSha256, contextBytes: 983 });
const environment = () => ({ os: { name: 'macOS', version: '26.0' }, browser: { name: 'Google Chrome', version: '141.0.7390.0' }, apps: { 'claude-app': { version: '1.0.0' }, 'codex-app': { version: '1.2.3' } } });
const at = '2026-10-21T01:00:00.000Z';
const run = (overrides = {}) => createRun(manifest(), { id: 'run-lab-1', startedAt: at, environment: environment(), ...overrides });
const nativeRequest = overrides => ({ at, lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation', material: { kind: 'browser-event' }, ...overrides });
const desktopObservation = overrides => ({ at, lane: 'real-client', requestedClient: 'claude-app', claim: 'draft-arrived', status: 'observed', source: 'desktop-ui', actualSurface: 'claude-chat', material: { kind: 'desktop-ui-check', method: 'visual-inspection' }, ...overrides });

test('a new run records pins but leaves every native-client claim not-run', () => {
  const value = run();
  const summary = summarizeRun(value);
  assert.equal(validateRun(value).valid, true);
  assert.equal(summary.realClient.clients['claude-app']['draft-arrived'].status, 'not-run');
  assert.equal(summary.realClient.clients['codex-app'].completion.status, 'not-run');
  assert.equal(summary.startedAt, at);
  assert.deepEqual(summary.environment, environment());
  assert.ok(!('pass' in summary));
  assert.ok(!('genuine' in summary));
  assert.ok(summary.limits.some(limit => limit.includes('execution origin')));
});

test('a browser request cannot upgrade draft arrival, sending, reading or completion', () => {
  const value = addObservation(run(), nativeRequest());
  const summary = summarizeRun(value);
  assert.equal(summary.browser.clients['claude-app']['handoff-requested'].status, 'requested');
  for (const claim of ['draft-arrived', 'sent', 'source-access', 'completion']) assert.equal(summary.realClient.clients['claude-app'][claim].status, 'not-run');
  for (const claim of ['draft-arrived', 'sent', 'source-access', 'completion']) assert.throws(() => addObservation(run(), nativeRequest({ claim, status: 'observed' })), /browser observations cannot/);
});

test('browser automation cannot claim a real desktop result through a relabeled lane', () => {
  assert.throws(() => addObservation(run(), desktopObservation({ source: 'browser-automation', material: { kind: 'browser-event' } })), /browser automation cannot/);
  assert.throws(() => addObservation(run(), desktopObservation({ source: 'operator', material: { kind: 'operator-check' } })), /operator statements are operator-reported/);
});

test('desktop UI and operator reports retain their distinct provenance and actual destination', () => {
  let value = addObservation(run(), desktopObservation());
  value = addObservation(value, desktopObservation({ requestedClient: 'codex-app', actualSurface: 'chatgpt-work', status: 'operator-reported', source: 'operator', material: { kind: 'operator-check', method: 'operator-confirmation' } }));
  const summary = summarizeRun(value);
  assert.equal(summary.realClient.clients['claude-app']['draft-arrived'].status, 'observed');
  assert.equal(summary.realClient.clients['codex-app']['draft-arrived'].status, 'operator-reported');
  assert.equal(summary.realClient.clients['codex-app']['draft-arrived'].observations[0].actualSurface, 'chatgpt-work');
  assert.equal(summary.realClient.clients['codex-app'].sent.status, 'not-run');
});

test('positive observations require the actual OS, browser or requested app version', () => {
  assert.throws(() => addObservation(run({ environment: {} }), nativeRequest()), /OS and browser versions/);
  const withoutClaude = environment(); delete withoutClaude.apps['claude-app'];
  assert.throws(() => addObservation(run({ environment: withoutClaude }), desktopObservation()), /OS and requested app versions/);
  assert.throws(() => addObservation(run(), desktopObservation({ actualSurface: 'unknown' })), /actual desktop surface/);
  assert.throws(() => createRun(manifest(), { environment: { os: { name: 'macOS', version: 'unknown' } } }), /recorded public version/);
});

test('absence and failure can be recorded without invented app versions or desktop inspection', () => {
  const value = addObservation(run({ environment: {} }), desktopObservation({ status: 'not-observed', source: 'operator', actualSurface: 'unknown', reason: 'not-inspected', material: { kind: 'operator-check' } }));
  assert.equal(summarizeRun(value).realClient.clients['claude-app']['draft-arrived'].status, 'not-observed');
  const failed = addObservation(run({ environment: {} }), desktopObservation({ status: 'failed', reason: 'unavailable' }));
  assert.equal(validateRun(failed).valid, true);
});

test('visual inspection alone cannot certify exact context; a pinned comparison can', () => {
  assert.throws(() => addObservation(run(), desktopObservation({ claim: 'context-matches' })), /composer-utf8-sha256/);
  assert.throws(() => addObservation(run(), desktopObservation({ claim: 'context-matches', material: { kind: 'desktop-ui-check', method: 'composer-utf8-sha256', contextSha256: 'c'.repeat(64) } })), /matching public-context digest/);
  const value = addObservation(run(), desktopObservation({ claim: 'context-matches', material: { kind: 'desktop-ui-check', method: 'composer-utf8-sha256', contextSha256 } }));
  assert.equal(summarizeRun(value).realClient.clients['claude-app']['context-matches'].status, 'observed');
  assert.equal(summarizeRun(value).realClient.clients['claude-app']['draft-arrived'].status, 'not-run');
});

test('browser context digest checks remain scoped to the prepared payload', () => {
  const value = addObservation(run(), nativeRequest({ claim: 'context-matches', status: 'observed', material: { kind: 'browser-event', method: 'prepared-payload-sha256', contextSha256 } }));
  const summary = summarizeRun(value);
  assert.equal(summary.browser.clients['claude-app']['context-matches'].status, 'observed');
  assert.equal(summary.realClient.clients['claude-app']['context-matches'].status, 'not-run');
});

test('pasted-text comparison remains an operator report rather than raw composer-byte proof', () => {
  const material = { kind: 'operator-check', method: 'operator-pasted-text-sha256', contextSha256 };
  const value = addObservation(run(), desktopObservation({ claim: 'context-matches', source: 'operator', status: 'operator-reported', material }));
  const summary = summarizeRun(value);
  const finding = summary.realClient.clients['claude-app']['context-matches'];
  assert.equal(finding.status, 'operator-reported');
  assert.equal(finding.observations[0].material.method, 'operator-pasted-text-sha256');
  assert.ok(summary.limits.some(limit => /normalize line endings.*not proof of raw composer/u.test(limit)));
  assert.throws(() => addObservation(run(), desktopObservation({ claim: 'context-matches', material: { ...material, kind: 'desktop-ui-check' } })), /composer-utf8-sha256/);
  assert.throws(() => addObservation(run(), desktopObservation({ claim: 'context-matches', source: 'operator', status: 'operator-reported', material: { ...material, contextSha256: 'c'.repeat(64) } })), /matching public-context digest/);
  assert.throws(() => addObservation(run(), nativeRequest({ claim: 'context-matches', status: 'observed', material: { ...material, kind: 'browser-event' } })), /prepared-payload-sha256/);
  const external = addObservation(run(), desktopObservation({ claim: 'context-matches', source: 'operator', status: 'operator-reported', material: { ...material, method: 'composer-utf8-sha256' } }));
  assert.equal(validateRun(external).valid, true);
});

test('a readiness statement does not become observed source access', () => {
  assert.throws(() => addObservation(run(), desktopObservation({ claim: 'source-access' })), /visible-tool-result, not a readiness statement/);
  const direct = addObservation(run(), desktopObservation({ claim: 'source-access', material: { kind: 'desktop-ui-check', method: 'visible-tool-result' } }));
  assert.equal(summarizeRun(direct).realClient.clients['claude-app']['source-access'].status, 'observed');
  assert.equal(summarizeRun(direct).realClient.clients['claude-app'].completion.status, 'not-run');
  assert.throws(() => addObservation(run(), desktopObservation({ source: 'operator', status: 'operator-reported', material: { kind: 'operator-check' } })), /operator-confirmation/);
  const reported = addObservation(run(), desktopObservation({ claim: 'source-access', source: 'operator', status: 'operator-reported', material: { kind: 'operator-check', method: 'operator-confirmation' } }));
  assert.equal(summarizeRun(reported).realClient.clients['claude-app']['source-access'].status, 'operator-reported');
});

test('contradictory or repeated outcomes remain visible instead of last-result wins', () => {
  let value = addObservation(run(), desktopObservation());
  value = addObservation(value, desktopObservation({ status: 'failed', reason: 'destination-differs' }));
  const finding = summarizeRun(value).realClient.clients['claude-app']['draft-arrived'];
  assert.equal(finding.status, 'mixed');
  assert.deepEqual(finding.observations.map(item => item.status), ['observed', 'failed']);
});

test('chronology, timestamp format and observation IDs are checked without sorting history', () => {
  assert.throws(() => addObservation(run(), nativeRequest({ at: '2026-10-20T23:59:59.000Z' })), /precedes the run/);
  assert.throws(() => addObservation(run(), nativeRequest({ at: '2026-10-21T09:00:00+08:00' })), /ISO UTC/);
  assert.throws(() => addObservation(run(), nativeRequest({ at: '2026-02-30T01:00:00.000Z' })), /ISO UTC/);
  const value = addObservation(run(), nativeRequest({ id: 'request' }));
  assert.throws(() => addObservation(value, nativeRequest({ id: 'request' })), /duplicated/);
});

test('pin validation rejects malformed digest, unbounded input and unknown fields', () => {
  for (const change of [{ archiveSha256: 'b'.repeat(63) }, { contextSha256: 'A'.repeat(64) }, { contextBytes: 0 }, { contextBytes: 1.2 }, { sdkVersion: 'latest' }, { prompt: 'private text' }]) assert.throws(() => createRun({ ...manifest(), ...change }), /Invalid reading bench record/);
  const value = run(); value.privateTranscript = 'not supported';
  assert.equal(validateRun(value).valid, false);
  assert.throws(() => addObservation(run(), desktopObservation({ transcript: 'not supported' })), /transcript is not supported/);
});

test('evidence references and provenance cannot silently change observer class', () => {
  assert.throws(() => addObservation(run(), desktopObservation({ material: { kind: 'browser-event' } })), /must match its observer source/);
  for (const ref of ['/Users/private.png', '../private.png', 'shots/../private.png', 'https://private.invalid/chat', 'a//b.png']) assert.throws(() => addObservation(run(), desktopObservation({ material: { kind: 'desktop-ui-check', ref } })), /relative public evidence reference/);
  assert.equal(validateRun(addObservation(run(), desktopObservation({ material: { kind: 'desktop-ui-check', method: 'visual-inspection', ref: 'shots/claude-draft.png' } }))).valid, true);
  assert.throws(() => addObservation(run(), desktopObservation({ notes: 'private\ntranscript' })), /bounded public-only line/);
});

test('fact statuses and actual desktop surface are not derived from requested client ID', () => {
  const value = addObservation(run(), desktopObservation({ requestedClient: 'codex-app', actualSurface: 'chatgpt-chat' }));
  assert.equal(summarizeRun(value).realClient.clients['codex-app']['draft-arrived'].observations[0].actualSurface, 'chatgpt-chat');
  assert.throws(() => addObservation(run(), nativeRequest({ status: 'observed' })), /must retain requested status/);
  assert.throws(() => addObservation(run(), desktopObservation({ claim: 'completion', status: 'requested' })), /requested describes only/);
  assert.throws(() => addObservation(run(), nativeRequest({ actualSurface: 'codex' })), /browser cannot assert/);
});

test('creation, append and summary are detached from caller mutation', () => {
  const m = manifest(); const env = environment();
  const value = createRun(m, { id: 'detached', startedAt: at, environment: env });
  m.contextSha256 = 'c'.repeat(64); env.apps['claude-app'].version = '999';
  assert.equal(value.manifest.contextSha256, contextSha256);
  assert.equal(value.environment.apps['claude-app'].version, '1.0.0');
  const observation = nativeRequest();
  const appended = addObservation(value, observation);
  observation.material.kind = 'operator-check';
  assert.equal(value.observations.length, 0);
  assert.equal(appended.observations[0].material.kind, 'browser-event');
  const summary = summarizeRun(appended); summary.browser.clients['claude-app']['handoff-requested'].observations[0].status = 'failed';
  assert.equal(appended.observations[0].status, 'requested');
});

test('malformed imported records return validation errors rather than executing properties', () => {
  for (const value of [null, [], 'text', { schema: 'other' }]) assert.equal(validateRun(value).valid, false);
  const value = run(); value.observations = [null];
  assert.equal(validateRun(value).valid, false);
  let accessed = false;
  const getter = run(); Object.defineProperty(getter, 'id', { get() { accessed = true; throw new Error('must not execute'); } });
  assert.equal(validateRun(getter).valid, false);
  assert.equal(accessed, false);
  const unknownSource = run(); unknownSource.observations = [{ ...desktopObservation(), id: 'malformed', source: { toString() { throw new Error('must not execute'); } } }];
  assert.equal(validateRun(unknownSource).valid, false);
  const sparse = run(); sparse.observations = Array(2);
  assert.equal(validateRun(sparse).valid, false);
  const symbolic = run(); symbolic.id = Symbol('invalid');
  assert.equal(validateRun(symbolic).valid, false);
  const nestedGetter = run(); Object.defineProperty(nestedGetter.environment, 'os', { get() { throw new Error('must not execute'); } });
  nestedGetter.observations = [{ ...desktopObservation(), id: 'nested' }];
  assert.equal(validateRun(nestedGetter).valid, false);
  const materialGetter = run(); materialGetter.observations = [{ ...desktopObservation({ claim: 'context-matches' }), id: 'material' }];
  Object.defineProperty(materialGetter.observations[0].material, 'method', { get() { throw new Error('must not execute'); } });
  assert.equal(validateRun(materialGetter).valid, false);
  const itemGetter = run(); const item = desktopObservation(); Object.defineProperty(item, 'id', { get() { throw new Error('must not execute'); } }); itemGetter.observations = [item];
  assert.equal(validateRun(itemGetter).valid, false);
  assert.throws(() => addObservation(run(), item), /data fields/);
  const appendGetter = desktopObservation(); Object.defineProperty(appendGetter.material, 'method', { get() { throw new Error('must not execute'); } });
  assert.throws(() => addObservation(run(), appendGetter), /data fields/);
});
