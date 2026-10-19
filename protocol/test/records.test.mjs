import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SCHEMA, defineWork, participant, act, relation, createRecord, canonicalJSON, seal, verify } from '../index.mjs';

const finding = (result, claim) => result.checks.find(check => check.claim === claim);
const clone = value => JSON.parse(JSON.stringify(value));
const work = () => defineWork({
  id: 'lab-reading', version: 'reading-context-1', title: 'Read the Lab', purpose: 'Discuss relevant public Lab material inside the visitor’s Agent.',
  capabilities: ['handoff'], context: [
    { id: 'public-index', kind: 'reference', mode: 'live', url: 'https://agentart.work/agent-index.json' },
    { id: 'reading-policy', kind: 'text', mode: 'snapshot', text: 'Fetch relevant sources. Cite actual fetched revisions. Report missing sources.\nWait for my question.' },
  ], conditions: { conversation: 'Questions and answers remain inside the Agent.' },
});

function artwork() {
  const definition = defineWork({
    id: 'pair-study', version: 'pair-conditions-1', title: 'Synthetic pair', purpose: 'Check preservation of a consequential pair without claiming artistic significance.',
    capabilities: ['handoff', 'participation'], context: [{ id: 'pair-brief', kind: 'text', mode: 'snapshot', text: 'An Agent may respond or explicitly refuse. Preserve the exact contribution.' }],
    conditions: { choices: ['respond', 'refuse'], evidence: { requireAgentAct: true, requireConsequence: true } },
  });
  return createRecord({ work: definition, instance: 'pair-encounter-1', participants: [
    participant({ id: 'curator', kind: 'human', label: 'Synthetic curator', roles: ['curator'] }),
    participant({ id: 'agent', kind: 'agent', label: 'Attributed synthetic Agent', authority: { assertion: 'Operator supplied; model origin unestablished.' } }),
  ], acts: [
    act({ id: 'line-one', participant: 'curator', kind: 'line', content: 'A room remembers its windows.', context: { workVersion: definition.version } }),
    act({ id: 'line-two', participant: 'agent', kind: 'line', content: 'Light leaves without closing the door.', context: { workVersion: definition.version, actIds: ['line-one'] } }),
  ], relations: [relation({ id: 'response-link', participant: 'agent', kind: 'responds-to', from: 'line-two', to: { type: 'act', id: 'line-one' } })],
  observations: [{ id: 'accepted-pair', observer: 'local-test-adapter', event: 'contribution-accepted', subjects: ['line-one', 'line-two', 'response-link'], trust: ['Local adapter attribution'], limits: ['No independent model-origin evidence'] }],
  artifacts: [{ id: 'pair-text', mediaType: 'text/plain', content: 'A room remembers its windows.\nLight leaves without closing the door.', actIds: ['line-one', 'line-two'], claims: ['exact-pair-in-order'] }],
  });
}

function pairChecker(record) {
  const expected = record.acts.map(item => item.content).join('\n');
  return record.artifacts.map(item => ({ claim: 'exact-pair-consequence', subject: item.id,
    status: item.content === expected ? 'supported' : 'contradicted', detail: 'Synthetic owner checker compares the exact pair and order in retained text; no live display claim.' }));
}

test('reading handoff needs no encounter ledger, Participant, Agent Act or returned answer', async () => {
  const record = createRecord({ work: work() });
  assert.equal(record.schema, SCHEMA);
  assert.equal(record.instance, undefined);
  for (const key of ['participants', 'acts', 'relations', 'observations', 'artifacts']) assert.deepEqual(record[key], []);
  const checked = await verify(await seal(record));
  assert.equal(finding(checked, 'record-integrity').status, 'supported');
  assert.equal(finding(checked, 'attributed-agent-contribution-preserved').status, 'not-established');
  assert.equal(finding(checked, 'referenced-context-acquisition').status, 'not-established');
  assert.equal(finding(checked, 'agent-execution-origin').status, 'not-established');
  assert.ok(!checked.checks.some(item => item.claim.includes('genuine')));
});

test('bounded handoff evidence binds exact public context and observed route, without inventing an Agent', async () => {
  const record = createRecord({ work: work(), observations: [{
    id: 'open-observation', observer: 'local-handoff-helper', event: 'handoff-open-requested', subjects: ['lab-reading'],
    material: { context: 'Exact public handoff context.\n意图', client: 'claude-app', surface: 'chat', conversation: 'fresh', outcome: 'os-open-accepted' },
    trust: ['Local helper observed an OS return code.'], limits: ['Composer arrival, Send, reading and answering are unobserved.'],
  }] });
  const sealed = await seal(record);
  const tampered = clone(sealed); tampered.observations[0].material.context += '\nchanged';
  assert.equal(finding(await verify(tampered), 'record-integrity').status, 'contradicted');
  assert.deepEqual(sealed.participants, []);
});

test('seals preserve exact Unicode and line endings with stable object-key ordering', async () => {
  const a = work(); a.conditions = { z: 1, a: 'é\r\n意图' };
  const b = clone(a); b.conditions = { a: 'é\r\n意图', z: 1 };
  assert.equal((await seal({ work: a })).integrity.digest, (await seal({ work: b })).integrity.digest);
  b.conditions.a = 'e\u0301\r\n意图';
  assert.notEqual((await seal({ work: a })).integrity.digest, (await seal({ work: b })).integrity.digest);
  b.conditions.a = 'é\n意图';
  assert.notEqual((await seal({ work: a })).integrity.digest, (await seal({ work: b })).integrity.digest);
});

test('the unsigned digest does not authenticate origin, even when an editor reseals a changed package', async () => {
  const record = artwork(); record.acts[1].content = 'An editor substituted this line.';
  const checked = await verify(await seal(record), { checkConsequence: pairChecker });
  assert.equal(finding(checked, 'record-integrity').status, 'supported');
  assert.equal(finding(checked, 'agent-execution-origin').status, 'not-established');
  assert.equal(finding(checked, 'required-artifact-consequence').status, 'contradicted');
  assert.ok(checked.limits.some(item => /unsigned, recomputable/.test(item)));
});

test('artwork verification distinguishes preserved attributed contributions from their consequence', async () => {
  const sealed = await seal(artwork());
  const withoutChecker = await verify(sealed);
  assert.equal(finding(withoutChecker, 'attributed-agent-contribution-preserved').status, 'supported');
  assert.equal(finding(withoutChecker, 'required-artifact-consequence').status, 'not-established');
  const checked = await verify(sealed, { checkConsequence: pairChecker });
  assert.equal(finding(checked, 'required-artifact-consequence').status, 'supported');
  assert.equal(finding(checked, 'agent-execution-origin').status, 'not-established');
  assert.ok(checked.limits.some(item => /application-supplied/.test(item)));
});

test('missing required participation remains unestablished, including an encounter awaiting its Agent', async () => {
  const original = artwork();
  const waiting = createRecord({ work: original.work, instance: 'awaiting-agent' });
  const checked = await verify(await seal(waiting));
  assert.equal(finding(checked, 'attributed-agent-contribution-preserved').status, 'not-established');
  assert.equal(finding(checked, 'required-artifact-consequence').status, 'not-established');
});

test('Agent initiation, consecutive Agent Acts, branches and explicit refusal are representable', async () => {
  const record = artwork();
  record.acts = [
    act({ id: 'agent-origin', participant: 'agent', kind: 'proposal', content: { graphic: '<svg/>', intention: 'A synthetic origin, not a measured private state.' }, context: { workVersion: record.work.version } }),
    act({ id: 'agent-revision', participant: 'agent', kind: 'revision', content: '<svg><circle/></svg>', context: { workVersion: record.work.version, actIds: ['agent-origin'] } }),
    act({ id: 'human-response', participant: 'curator', kind: 'proposal', content: 'Consider a square.', context: { workVersion: record.work.version, actIds: ['agent-origin'] } }),
    act({ id: 'agent-refusal', participant: 'agent', kind: 'refusal', content: 'I decline that proposed change.', context: { workVersion: record.work.version, actIds: ['human-response'] } }),
  ];
  record.relations = [
    relation({ id: 'origin-address', participant: 'agent', kind: 'addresses', from: 'agent-origin', to: { type: 'work', id: record.work.id } }),
    relation({ id: 'revision-address', participant: 'agent', kind: 'revises', from: 'agent-revision', to: { type: 'act', id: 'agent-origin' } }),
    relation({ id: 'refusal-address', participant: 'agent', kind: 'declines', from: 'agent-refusal', to: { type: 'act', id: 'human-response' } }),
  ];
  record.observations = []; record.artifacts = [];
  const sealed = await seal(record);
  assert.equal(sealed.acts[0].participant, 'agent');
  assert.equal(sealed.acts[1].participant, 'agent');
  assert.equal(sealed.acts[3].content, 'I decline that proposed change.');
  assert.equal(finding(await verify(sealed), 'record-integrity').status, 'supported');
});

test('dangling references, duplicate identities and wrong Work versions fail before export', () => {
  const changes = [
    record => { record.acts[1].participant = 'missing'; },
    record => { record.acts[1].context.workVersion = 'wrong-version'; },
    record => { record.acts[1].context.actIds = ['missing']; },
    record => { record.relations[0].from = 'missing'; },
    record => { record.relations[0].to.id = 'missing'; },
    record => { record.observations[0].subjects.push('missing'); },
    record => { record.artifacts[0].actIds.push('missing'); },
    record => { record.participants[1].id = record.participants[0].id; },
    record => { delete record.instance; },
  ];
  for (const change of changes) { const record = artwork(); change(record); assert.throws(() => createRecord(record)); }
});

test('altered seals stop application verification; deleting even an empty normalized field changes the sealed body', async () => {
  const sealed = await seal(artwork()); sealed.acts[1].content += '!';
  let invoked = false;
  const checked = await verify(sealed, { checkConsequence: () => { invoked = true; return []; } });
  assert.equal(invoked, false);
  assert.equal(finding(checked, 'record-integrity').status, 'contradicted');
  const empty = await seal({ work: work() }); delete empty.acts;
  assert.equal(finding(await verify(empty), 'record-integrity').status, 'contradicted');
});

test('factory results are detached from caller-owned objects and reject hidden root fields', () => {
  const source = work(); const record = createRecord({ work: source });
  source.conditions.conversation = 'changed';
  assert.notEqual(record.work.conditions.conversation, 'changed');
  assert.throws(() => createRecord({ work: work(), token: 'synthetic-not-a-secret' }), /not a supported field/);
  assert.throws(() => participant({ id: 'p', kind: 'agent', label: 'Agent', genuine: true }), /not a supported field/);
});

test('non-JSON values, invalid Unicode, sparse arrays and accessors are rejected without executing them', () => {
  for (const value of [undefined, NaN, Infinity, -0, 1n, new Date(), new Map(), '\ud800', { a: undefined }, [, 1]]) assert.throws(() => canonicalJSON(value));
  const cycle = {}; cycle.self = cycle; assert.throws(() => canonicalJSON(cycle), /cyclic/);
  let executed = false;
  const value = {}; Object.defineProperty(value, 'x', { enumerable: true, get() { executed = true; return 1; } });
  assert.throws(() => canonicalJSON(value), /accessors/);
  const array = [1]; Object.defineProperty(array, '0', { enumerable: true, get() { executed = true; return 1; } });
  assert.throws(() => canonicalJSON(array), /data properties/);
  const definition = work(); definition.conditions = value;
  assert.throws(() => defineWork(definition), /accessors/);
  assert.equal(executed, false);
});

test('verification rejects root accessors before reading any purported sealed values', async () => {
  let executed = false;
  const value = { integrity: { algorithm: 'sha256', digest: '0'.repeat(64) } };
  Object.defineProperty(value, 'work', { enumerable: true, get() { executed = true; return work(); } });
  const checked = await verify(value);
  assert.equal(executed, false);
  assert.equal(finding(checked, 'record-structure-and-references').status, 'contradicted');
  assert.equal(finding(checked, 'record-integrity').status, 'not-established');
});

test('context pins distinguish retained exact text from referenced content that was never fetched', async () => {
  const definition = work();
  definition.context[1].digest = `sha256:${createHash('sha256').update(definition.context[1].text).digest('hex')}`;
  assert.equal(finding(await verify(await seal({ work: definition })), 'context-snapshot-digest').status, 'supported');
  definition.context[1].text += '!';
  assert.equal(finding(await verify(await seal({ work: definition })), 'context-snapshot-digest').status, 'contradicted');
  definition.context[0].mode = 'snapshot';
  assert.throws(() => defineWork(definition), /Snapshot references need a digest/);
  definition.context[0].digest = `sha256:${'0'.repeat(64)}`;
  assert.equal(finding(await verify(await seal({ work: definition })), 'referenced-context-acquisition').status, 'not-established');
});

test('consequence requires all retained artifact subjects and cannot overwrite core claims', async () => {
  const record = artwork(); record.artifacts.push({ ...record.artifacts[0], id: 'pair-copy' });
  const sealed = await seal(record);
  const incomplete = await verify(sealed, { checkConsequence: value => pairChecker(value).slice(0, 1) });
  assert.equal(finding(incomplete, 'required-artifact-consequence').status, 'not-established');
  const wrongSubject = await verify(sealed, { checkConsequence: () => [{ claim: 'pair-consequence', subject: 'missing', status: 'supported', detail: 'Unsupported test' }] });
  assert.equal(finding(wrongSubject, 'required-artifact-consequence').status, 'not-established');
  const spoofed = await verify(sealed, { checkConsequence: () => [{ claim: 'agent-execution-origin', subject: 'pair-text', status: 'supported', detail: 'Unsupported test' }] });
  assert.equal(finding(spoofed, 'agent-execution-origin').status, 'not-established');
  assert.equal(finding(spoofed, 'required-artifact-consequence').status, 'not-established');
});
