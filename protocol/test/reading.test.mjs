import test from 'node:test';
import assert from 'node:assert/strict';
import { createReading } from '../reading.mjs';
import { verify } from '../index.mjs';

const context = 'Read only relevant indexed public sources.\r\nPreserve evidence limits. 意图 & ? # + %\nWait for my question.';
function work() {
  return {
    id: 'urn:agent-art:reading:synthetic', version: 'reading-frame-1', title: 'Read a public site',
    purpose: 'Carry the publisher’s reading context into the visitor’s Agent.', capabilities: ['handoff'],
    context: [
      { id: 'invitation', kind: 'text', mode: 'snapshot', text: context },
      { id: 'index', kind: 'reference', mode: 'live', url: 'https://agentart.work/agent-index.json' },
    ], conditions: { conversation: 'Questions and answers stay inside the visitor’s Agent.' },
  };
}
const status = (report, claim) => report.checks.find(item => item.claim === claim)?.status;

test('the reading frame is detached and deeply frozen; preparation preserves the exact publisher text', () => {
  const source = work();
  const reading = createReading({ work: source });
  source.context[0].text = 'Changed source';
  source.conditions.conversation = 'Changed source';
  assert.equal(reading.context, context);
  assert.equal(reading.work.context[0].text, context);
  assert.notEqual(reading.work.conditions.conversation, 'Changed source');
  assert.ok(Object.isFrozen(reading));
  assert.ok(Object.isFrozen(reading.work.conditions));
  assert.ok(Object.isFrozen(reading.work.context));
  assert.ok(Object.isFrozen(reading.clients));
  assert.throws(() => { reading.work.context[0].text = 'Mutation'; }, TypeError);
  for (const [client, origin, parameter] of [['codex-app', 'codex://new', 'prompt'], ['claude-app', 'claude://claude.ai/new', 'q']]) {
    const plan = reading.prepare({ client, conversation: 'fresh' });
    const url = new URL(plan.url);
    assert.equal(plan.kind, 'native'); assert.equal(plan.context, context);
    assert.equal(`${url.protocol}//${url.hostname}${url.pathname}`, origin);
    assert.equal(url.searchParams.get(parameter), context);
    assert.equal(plan.requiresSend, true);
    assert.ok(Object.isFrozen(plan));
  }
});

test('existing conversations and another Agent use manual copying without private conversation identifiers', () => {
  const reading = createReading({ work: work() });
  for (const client of ['codex-app', 'claude-app', 'manual']) {
    for (const conversation of client === 'manual' ? ['fresh', 'existing'] : ['existing']) {
      const plan = reading.prepare({ client, conversation });
      assert.equal(plan.kind, 'manual'); assert.equal(plan.context, context);
      assert.equal(plan.conversation, conversation); assert.equal(plan.url, undefined);
    }
  }
  assert.throws(() => reading.prepare({ client: 'claude-app', conversation: 'private-chat-id' }), /fresh or existing/);
  assert.throws(() => reading.prepare({ client: 'claude-app', conversation: 'existing', threadId: 'private-id' }), /not supported/);
});

test('client configuration always retains manual fallback and rejects unknown or duplicate clients', () => {
  assert.deepEqual(createReading({ work: work(), clients: ['claude-app'] }).clients, ['claude-app', 'manual']);
  assert.deepEqual(createReading({ work: work(), clients: [] }).clients, ['manual']);
  const manual = createReading({ work: work(), clients: ['manual'] });
  assert.throws(() => manual.prepare({ client: 'codex-app' }), /configured reading client/);
  for (const clients of [['chrome'], ['codex-app', 'codex-app'], 'claude-app']) assert.throws(() => createReading({ work: work(), clients }), /Reading clients/);
});

test('large public reading context remains copyable rather than being truncated into a native URL', async () => {
  const source = work(); source.context[0].text = '意'.repeat(4001);
  const reading = createReading({ work: source });
  const plan = reading.prepare({ client: 'claude-app' });
  assert.equal(plan.kind, 'manual'); assert.equal(plan.url, undefined);
  assert.equal(plan.context, source.context[0].text);
  await assert.rejects(reading.receipt({ event: 'handoff-requested', client: 'claude-app', observer: 'test-browser' }), /fresh native/);
  const receipt = await reading.receipt({ event: 'context-copied', client: 'claude-app', observer: 'test-browser' });
  assert.equal(receipt.work.context[0].text, source.context[0].text);
});

test('reading needs a retained exact context and rejects ambiguous, substituted or blank invitations', () => {
  const source = work(); source.context.push({ id: 'second-text', kind: 'text', mode: 'snapshot', text: 'A second public invitation.' });
  assert.throws(() => createReading({ work: source }), /Select context explicitly/);
  assert.equal(createReading({ work: source, context }).context, context);
  assert.throws(() => createReading({ work: source, context: context.replace('\r\n', '\n') }), /exactly match/);
  assert.throws(() => createReading({ work: source, context: 'An unretained prompt' }), /exactly match/);
  const blank = work(); blank.context[0].text = ' ';
  assert.throws(() => createReading({ work: blank }), /exactly match/);
  const referenceOnly = work(); referenceOnly.context.shift();
  assert.throws(() => createReading({ work: referenceOnly, context }), /exactly match/);
});

test('the reading profile requires HTTPS source references without acquiring or certifying those sources', () => {
  for (const url of [
    'http://agentart.work/agent-index.json', 'https://localhost/index.json', 'https://localhost./index.json',
    'https://127.0.0.1/index.json', 'https://0x7f000001/index.json', 'https://10.0.0.1/index.json',
    'https://[::1]/index.json', 'https://docs.local/index.json', 'https://docs.internal/index.json',
    'https://user:password@agentart.work/agent-index.json',
  ]) {
    const source = work(); source.context[1].url = url;
    assert.throws(() => createReading({ work: source }), /HTTPS|credentials/);
  }
  const source = work(); source.context.pop();
  assert.throws(() => createReading({ work: source }), /index or source reference/);
  let fetched = false;
  const savedFetch = globalThis.fetch;
  globalThis.fetch = () => { fetched = true; throw new Error('Network must not be used'); };
  try {
    const reading = createReading({ work: work() });
    reading.prepare({ client: 'claude-app' });
    assert.equal(fetched, false);
  } finally { globalThis.fetch = savedFetch; }
});

test('participation obligations and private request fields do not enter the selected reading profile', () => {
  for (const mutation of [
    source => { source.capabilities.push('participation'); },
    source => { source.conditions.evidence = { requireAgentAct: true }; },
    source => { source.conditions.evidence = { requireConsequence: true }; },
  ]) {
    const source = work(); mutation(source);
    assert.throws(() => createReading({ work: source }), /handoff capability|cannot require/);
  }
  assert.throws(() => createReading({ work: work(), question: 'Private question' }), /not supported/);
  assert.throws(() => createReading({ work: work(), conversationHistory: [] }), /not supported/);
});

test('optional receipts preserve zero Acts and name the caller observation without claiming reading or execution', async () => {
  const reading = createReading({ work: work() });
  for (const [event, client, conversation] of [
    ['handoff-requested', 'claude-app', 'fresh'],
    ['context-copied', 'manual', 'existing'],
    ['manual-context-selected', 'codex-app', 'existing'],
  ]) {
    const receipt = await reading.receipt({ event, client, conversation, observer: 'synthetic-browser', observedAt: '2026-10-19T00:00:00.000Z' });
    for (const key of ['participants', 'acts', 'relations', 'artifacts']) assert.deepEqual(receipt[key], []);
    assert.equal(receipt.instance, undefined);
    assert.equal(receipt.observations[0].event, event);
    assert.equal(receipt.observations[0].observer, 'synthetic-browser');
    assert.equal(receipt.observations[0].material.context, 'invitation');
    assert.equal(receipt.observations[0].material.conversation, conversation);
    assert.ok(receipt.observations[0].trust.some(item => item.includes('actually observed')));
    assert.ok(receipt.observations[0].limits.some(item => item.includes('No Send, model exposure, reading, answer')));
    const report = await verify(receipt);
    assert.equal(status(report, 'record-integrity'), 'supported');
    assert.equal(status(report, 'agent-execution-origin'), 'not-established');
    assert.equal(status(report, 'attributed-agent-contribution-preserved'), 'not-established');
    receipt.work.context[0].text += ' Changed';
    assert.equal(status(await verify(receipt), 'record-integrity'), 'contradicted');
  }
});

test('receipt input cannot upgrade an observation or attach arbitrary private material', async () => {
  const reading = createReading({ work: work() });
  const request = { client: 'claude-app', conversation: 'fresh', observer: 'synthetic-browser' };
  for (const event of ['opened', 'agent-read', 'agent-participated', 'os-open-accepted']) await assert.rejects(reading.receipt({ ...request, event }), /Only handoff-requested/);
  for (const [client, conversation] of [['manual', 'fresh'], ['claude-app', 'existing']]) await assert.rejects(reading.receipt({ ...request, client, conversation, event: 'handoff-requested' }), /fresh native/);
  await assert.rejects(reading.receipt({ ...request, event: 'context-copied', material: { token: 'synthetic' } }), /not supported/);
  await assert.rejects(reading.receipt({ ...request, event: 'context-copied', observer: '' }), /Name the application/);
  for (const observedAt of ['today', '2026-10-19', '2026-10-19T00:00:00Z']) await assert.rejects(reading.receipt({ ...request, event: 'context-copied', observedAt }), /ISO timestamp/);
});

// Generated once using seal() from immutable alpha commit aa293d6, not the
// current implementation. All material is synthetic public fixture content.
const ALPHA_RECEIPT = {
  schema: 'agent-art-protocol/0.1-experimental',
  work: {
    capabilities: ['handoff'], conditions: { contributionReturn: false },
    context: [
      { id: 'reading-invitation', kind: 'text', mode: 'snapshot', text: 'Read public sources. Report missing access.\nWait for my question.' },
      { id: 'public-index', kind: 'reference', mode: 'live', url: 'https://agentart.work/agent-index.json' },
    ],
    id: 'urn:agent-art:reading:alpha-fixture', purpose: 'Preserve backward verification of a public handoff statement.',
    title: 'Synthetic alpha reading receipt', version: '0.1-experimental',
  },
  participants: [], acts: [], relations: [], artifacts: [],
  observations: [{
    event: 'context-copied', id: 'alpha-copy-observation', limits: ['No paste, Send, reading or answer was observed.'],
    material: { client: 'copy', context: 'reading-invitation', conversation: 'existing', observedAt: '2026-10-19T00:00:00.000Z' },
    observer: 'visitor-browser', subjects: ['urn:agent-art:reading:alpha-fixture'], trust: ['Synthetic caller observation.'],
  }],
  integrity: { algorithm: 'sha256', digest: '46bbf92479197f005e752a88e0911a173629895d5ddadb5d7821c6f8ff1af304' },
};

test('the alpha receipt fixture remains verifiable with its original schema, bytes and bounded claims', async () => {
  const report = await verify(ALPHA_RECEIPT);
  assert.equal(status(report, 'record-structure-and-references'), 'supported');
  assert.equal(status(report, 'record-integrity'), 'supported');
  assert.equal(status(report, 'agent-execution-origin'), 'not-established');
  assert.equal(status(report, 'attributed-agent-contribution-preserved'), 'not-established');
});
