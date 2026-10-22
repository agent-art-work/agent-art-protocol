import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAUDE_BUNDLE_ID, classifyOwnedEvidence, extractCanonicalComposer, findSubmitControl, publicDesktopNote, validateClaudeSnapshot, validatePublicDesktopNote } from './desktop-ui.mjs';

const at = '2026-10-21T12:00:00.000Z';
const now = '2026-10-21T12:00:01.000Z';
const canonical = 'Public invitation\n\nKeep exact Unicode: 意.\r\n';
const node = (index, role, label, value) => ({ index, role, label, ...(value === undefined ? {} : { value }), enabled: true, visible: true });
const snapshot = () => ({ captureId: 'claude-capture-1', capturedAt: at, bundleId: CLAUDE_BUNDLE_ID, complete: true,
  owned: true, windowId: 44, ownedWindowId: 44, nodes: [node(10, 'AXTextArea', 'Reply to Claude', canonical), node(11, 'AXButton', 'Send')] });

test('composer equality preserves exact text and binds the fresh submit index to its capture', () => {
  const state = snapshot(), composer = extractCanonicalComposer(state, canonical, { composerIndex: 10, now });
  assert.equal(composer.matches, true); assert.equal(composer.text, canonical);
  assert.equal(composer.contextBytes, Buffer.byteLength(canonical, 'utf8'));
  assert.equal(findSubmitControl(state, composer, { now }).index, 11);
  state.captureId = 'claude-capture-2';
  assert.throws(() => findSubmitControl(state, composer, { now }), /this capture/);
});

test('mismatched composer text is withheld and does not qualify Send', () => {
  const state = snapshot(); state.nodes[0].value = 'Unrelated private draft';
  const comparison = extractCanonicalComposer(state, canonical, { composerIndex: 10, now });
  assert.equal(comparison.matches, false); assert.equal(Object.hasOwn(comparison, 'text'), false);
  assert.equal(JSON.stringify(comparison).includes('Unrelated private'), false);
  assert.throws(() => findSubmitControl(state, comparison, { now }), /exact composer/);
});

test('snapshot validation rejects stale, other-app, unowned and ambiguous indices', () => {
  assert.throws(() => validateClaudeSnapshot(snapshot(), { now: '2026-10-21T12:00:31.000Z' }), /stale/);
  for (const override of [{ bundleId: 'com.openai.codex' }, { owned: false }, { ownedWindowId: 45 }, { complete: false }]) {
    assert.throws(() => validateClaudeSnapshot({ ...snapshot(), ...override }, { now }), /owned Claude/);
  }
  const duplicate = snapshot(); duplicate.nodes.push({ ...duplicate.nodes[0] });
  assert.throws(() => validateClaudeSnapshot(duplicate, { now }), /ambiguous/);
});

test('submit requires a unique visible enabled button and rejects changed same-id captures', () => {
  const state = snapshot(), composer = extractCanonicalComposer(state, canonical, { composerIndex: 10, now });
  state.nodes[1].enabled = false;
  assert.throws(() => findSubmitControl(state, composer, { now }), /this capture/);
  const comparison = extractCanonicalComposer(state, canonical, { composerIndex: 10, now });
  assert.equal(findSubmitControl(state, comparison, { now }).found, false);
  state.nodes[1].enabled = true; state.nodes.push(node(12, 'AXButton', 'Submit'));
  const ambiguous = extractCanonicalComposer(state, canonical, { composerIndex: 10, now });
  assert.equal(findSubmitControl(state, ambiguous, { now }).found, false);
});

test('desktop notes admit fixed bounded public facts rather than arbitrary UI text', () => {
  assert.equal(validatePublicDesktopNote(publicDesktopNote('source-denied')), true);
  assert.equal(validatePublicDesktopNote('Unrelated private answer'), false);
  assert.throws(() => publicDesktopNote('Unrelated private answer'), /Unknown/);
});

const resultSnapshot = () => ({ ...snapshot(), nodes: [
  node(20, 'AXGroup', 'Owned assistant response'),
  { ...node(21, 'AXStaticText', 'This public collection introduces research material and the next useful reading choices.'), parentIndex: 20 },
  { ...node(22, 'AXStaticText', 'Access is limited to the named visible sources; complete document reading is unestablished.'), parentIndex: 20 },
  { ...node(23, 'AXStaticText', 'Which part of this public collection would you like to explore next?'), parentIndex: 20 },
  { ...node(24, 'AXButton', 'Copy response'), parentIndex: 20 },
  node(30, 'AXGroup', 'Owned tool result'),
  { ...node(31, 'AXStaticText', 'https://public.example/index.json'), parentIndex: 30 },
  { ...node(32, 'AXStaticText', 'HTTP 403 Forbidden; CONNECT tunnel failed; connect_rejected'), parentIndex: 30 },
  { ...node(33, 'AXButton', 'Download the public index file with headers'), parentIndex: 30 },
] });
const toolProof = () => ({ owned: true, captureId: 'claude-capture-1', scopeIndex: 30, urlIndex: 31, bodyIndex: 32, sourceUrl: 'https://public.example/index.json', representation: 'access-denial', provenance: { kind: 'expanded-tool-result', captureId: 'claude-capture-1', toolControlIndex: 33 } });

test('Read labels and unproven reply presence do not establish orientation or source acquisition', () => {
  const state = resultSnapshot(); state.nodes[1].label = 'Read';
  const facts = classifyOwnedEvidence(state, { now, reply: { owned: true, captureId: state.captureId, scopeIndex: 20 } });
  assert.equal(facts.orientation.status, 'not-observed'); assert.deepEqual(facts.sourceResults, []);
  const labelOnly = { owned: true, captureId: state.captureId, scopeIndex: 20, finishedControlIndex: 24,
    observedFacts: { collectionIntroduction: 21, accessLimits: 21, followupInvitation: 21 } };
  assert.equal(classifyOwnedEvidence(state, { now, reply: labelOnly }).orientation.status, 'not-observed');
});

test('orientation requires explicit semantic evidence and a finished control in the same owned region', () => {
  const state = resultSnapshot();
  const reply = { owned: true, captureId: state.captureId, scopeIndex: 20, finishedControlIndex: 24,
    observedFacts: { collectionIntroduction: 21, accessLimits: 22, followupInvitation: 23 } };
  assert.equal(classifyOwnedEvidence(state, { now, reply }).orientation.status, 'observed');
  state.nodes[4].parentIndex = 30;
  assert.throws(() => classifyOwnedEvidence(state, { now, reply }), /selected owned region/);
});

test('visible 403 or CONNECT failures remain failed even alongside a completed orientation', () => {
  const state = resultSnapshot(), result = classifyOwnedEvidence(state, { now, toolResults: [toolProof()] });
  assert.equal(result.sourceResults[0].status, 'failed');
  assert.equal(result.rawByteIdentity, 'not-established');
  assert.equal(JSON.stringify(result).includes('connect_rejected'), false);
});

test('positive source-result evidence requires matching public raw JSON identity, not an assistant retrieval claim', () => {
  const state = resultSnapshot(), proof = toolProof();
  state.nodes[7].label = 'I read the index and all the documents.';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
  state.nodes[7].label = '{"schema":"public-index/1","revision":"public-revision"}';
  proof.representation = 'raw-json-result'; proof.expectedJsonFields = { schema: 'public-index/1', revision: 'public-revision' };
  const observed = classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0];
  assert.equal(observed.status, 'observed'); assert.equal(observed.rawByteIdentity, 'not-established');
  assert.equal(Object.hasOwn(observed, 'text'), false);
  proof.expectedJsonFields.revision = 'different';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
});

test('tool evidence rejects private/local URL forms and material outside its selected result region', () => {
  for (const sourceUrl of ['https://user:secret@public.example/index.json', 'https://public.example/index.json?token=secret', 'https://127.0.0.1/index.json', 'https://host.local/index.json']) {
    assert.throws(() => classifyOwnedEvidence(resultSnapshot(), { now, toolResults: [{ ...toolProof(), sourceUrl }] }), /public-source/);
  }
  const state = resultSnapshot(); state.nodes[7].parentIndex = 20;
  assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [toolProof()] }), /selected owned region/);
});


test('split AXLink description and scheme-less visible value establish only the exact named URL', () => {
  const state = resultSnapshot(), proof = toolProof();
  state.nodes[6] = { ...state.nodes[6], role: 'AXLink', label: proof.sourceUrl, value: 'public.example/index.json' };
  const denied = classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0];
  assert.equal(denied.status, 'failed'); assert.equal(denied.scope, 'visible-tool-access-denial');
  state.nodes[6].url = 'https://other.example/index.json';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
  delete state.nodes[6].url; state.nodes[6].label = 'public.example/index.json';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
});

test('source URL text cannot be a substring, prefix, quoted claim or mismatching link target', () => {
  for (const label of ['https://public.example/index.json.evil', 'https://public.example/index.json?altered=1',
    'I fetched https://public.example/index.json', '"https://public.example/index.json"']) {
    const state = resultSnapshot(); state.nodes[6].label = label;
    assert.equal(classifyOwnedEvidence(state, { now, toolResults: [toolProof()] }).sourceResults[0].status, 'not-observed');
  }
  const state = resultSnapshot(); state.nodes[6].label = 'URL: https://public.example/index.json';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [toolProof()] }).sourceResults[0].status, 'failed');
});

const processedSnapshot = () => {
  const state = resultSnapshot();
  state.nodes[7].label = 'A processed public index representation returned by the fetch tool.';
  state.nodes.push({ ...node(34, 'AXStaticText', 'schema: public-index/1'), parentIndex: 30 },
    { ...node(35, 'AXStaticText', 'public-revision'), parentIndex: 30 });
  return state;
};
const processedProof = () => ({ ...toolProof(), representation: 'processed-source-result',
  expectedJsonFields: { schema: 'public-index/1', revision: 'public-revision' },
  identityFields: [{ field: 'schema', index: 34, format: 'field-line' }, { field: 'revision', index: 35, format: 'value' }] });

test('processed source result is a distinct limited observation with selected exact public identity', () => {
  const result = classifyOwnedEvidence(processedSnapshot(), { now, toolResults: [processedProof()] }).sourceResults[0];
  assert.equal(result.status, 'observed'); assert.equal(result.scope, 'visible-processed-source-result');
  assert.equal(result.representation, 'processed-source-result'); assert.equal(result.identityCheck, 'selected-exact-fields');
  assert.equal(result.rawByteIdentity, 'not-established'); assert.equal(result.provenance, 'controller-selected-expanded-tool-result');
  assert.equal(JSON.stringify(result).includes('A processed public index representation'), false);
  assert.equal(validatePublicDesktopNote(result.note), true);
});

test('processed representation without exact identity selections remains unobserved', () => {
  const state = processedSnapshot(), proof = processedProof();
  delete proof.identityFields;
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
  proof.identityFields = processedProof().identityFields; state.nodes.at(-1).label = ' public-revision';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
  state.nodes.at(-1).label = 'public-revision'; proof.expectedJsonFields.revision = 'changed-public-revision';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
});

test('processed identity field selections reject duplicates, unknown formats and escaped region evidence', () => {
  for (const change of [p => { p.identityFields[1].field = 'schema'; }, p => { p.identityFields[0].format = 'trimmed'; },
    p => { p.identityFields[0].field = 'name'; }]) {
    const proof = processedProof(); change(proof);
    assert.throws(() => classifyOwnedEvidence(processedSnapshot(), { now, toolResults: [proof] }), /exact visible identity/);
  }
  const state = processedSnapshot(); state.nodes.at(-1).parentIndex = 20;
  assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [processedProof()] }), /selected owned region/);
});

test('literal processed identity formats do not broadly parse prose or normalize whitespace', () => {
  const state = processedSnapshot(), proof = processedProof();
  proof.identityFields[0].format = 'json-member-comma'; state.nodes.at(-2).label = '"schema": "public-index/1",';
  proof.identityFields[1].format = 'json-member'; state.nodes.at(-1).label = '"revision": "public-revision"';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'observed');
  state.nodes.at(-1).label = 'According to the index, "revision": "public-revision"';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
});

test('assistant prose, text Read labels and response controls cannot masquerade as tool provenance', () => {
  for (const override of [undefined, { kind: 'assistant-reply', captureId: 'claude-capture-1', toolControlIndex: 33 },
    { kind: 'expanded-tool-result', captureId: 'different-capture', toolControlIndex: 33 }]) {
    const proof = toolProof(); proof.provenance = override;
    assert.throws(() => classifyOwnedEvidence(resultSnapshot(), { now, toolResults: [proof] }), /expanded-tool-result provenance/);
  }
  for (const roleName of ['AXStaticText', 'AXParagraph']) {
    const state = resultSnapshot(); state.nodes.at(-1).role = roleName; state.nodes.at(-1).label = 'Read a page';
    assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [toolProof()] }), /actual disclosure control/);
  }
  for (const label of ['Copy response', 'Copy', 'Retry', 'Send', 'Show more']) {
    const state = resultSnapshot(); state.nodes.at(-1).label = label;
    assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [toolProof()] }), /actual disclosure control/);
  }
  const state = resultSnapshot(); state.nodes[5].label = 'Owned assistant response';
  assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [toolProof()] }), /assistant or user-message/);
});

test('broad assistant region and cross-region tool controls are rejected', () => {
  const state = resultSnapshot(), proof = toolProof();
  proof.scopeIndex = 20; proof.urlIndex = 21; proof.bodyIndex = 22; proof.provenance.toolControlIndex = 24;
  assert.throws(() => classifyOwnedEvidence(state, { now, reply: { owned: true, captureId: state.captureId, scopeIndex: 20 }, toolResults: [proof] }), /broad assistant/);
  proof.scopeIndex = 30; proof.urlIndex = 31; proof.bodyIndex = 32;
  assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [proof] }), /selected owned region/);
  state.nodes[5].label = 'Message 2 of 2'; proof.provenance.toolControlIndex = 33;
  assert.throws(() => classifyOwnedEvidence(state, { now, toolResults: [proof] }), /assistant or user-message/);
});

test('source proofs reject stale captures and retain inspected denial over identity-shaped output', () => {
  assert.throws(() => classifyOwnedEvidence(resultSnapshot(), { now: '2026-10-21T12:00:31.000Z', toolResults: [toolProof()] }), /stale/);
  assert.throws(() => classifyOwnedEvidence(resultSnapshot(), { now, toolResults: [{ ...toolProof(), captureId: 'other' }] }), /current owned/);
  const state = processedSnapshot(), proof = processedProof(); state.nodes[7].label = 'HTTP 403 Forbidden';
  const unconfirmed = classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0];
  assert.equal(unconfirmed.status, 'not-observed');
  proof.representation = 'access-denial';
  const result = classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0];
  assert.equal(result.status, 'failed'); assert.equal(result.identityCheck, 'not-established');
});


test('raw or processed source content mentioning denial is not automatically an inspected access failure', () => {
  const state = resultSnapshot(), proof = toolProof();
  proof.representation = 'raw-json-result';
  state.nodes[7].label = '{"schema":"public-index/1","revision":"public-revision","topic":"access denied"}';
  proof.expectedJsonFields = { schema: 'public-index/1', revision: 'public-revision' };
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
  proof.representation = 'access-denial'; state.nodes[7].label = 'The source result has no failure indication.';
  assert.equal(classifyOwnedEvidence(state, { now, toolResults: [proof] }).sourceResults[0].status, 'not-observed');
});
