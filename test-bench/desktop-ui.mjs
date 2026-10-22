/**
 * Pure helpers for an explicitly owned Claude Desktop UI observation.
 * No application control, persistence, clock reads, or transcript collection.
 * Snapshot metadata is the controller's statement, not independent authority.
 */
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { isPlainRecord } from './plain-record.mjs';
import { EXACT_POLICY, LAB_AX_POLICY, compareDraftText } from './draft-policy.mjs';

export const CLAUDE_BUNDLE_ID = 'com.anthropic.claudefordesktop';
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const sha256 = value => createHash('sha256').update(value, 'utf8').digest('hex');
const role = value => String(value || '').replace(/^AX/u, '').replace(/[\s_-]/gu, '').toLowerCase();
const timestamp = value => typeof value === 'string' && DATE.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const plain = isPlainRecord;
const safeId = value => typeof value === 'string' && ID.test(value);
const windowId = value => Number.isSafeInteger(value) && value >= 0 || safeId(value);
const fail = message => { throw new TypeError(message); };

const NOTES = Object.freeze({
  'composer-matches': 'The owned Claude composer exposes the exact public invitation; raw transport bytes remain unobserved.',
  'composer-differs': 'The owned composer does not expose the exact public invitation; exact exposed-text equality is not established.',
  'presentation-matches': 'The owned Lab composer matches the named paragraph presentation policy; exact composer and transport bytes remain unestablished.',
  'presentation-differs': 'The owned Lab composer does not match the named paragraph presentation policy. No Send is qualified under that policy.',
  'submit-unavailable': 'No unique enabled submit control is established in the current owned snapshot.',
  'orientation-visible': 'A completed owned reply visibly introduces the public collection; this does not establish source reading.',
  'reply-unconfirmed': 'A completed public-collection introduction is not established by the selected UI evidence.',
  'source-denied': 'The owned tool result visibly reports an access failure; source acquisition is not established.',
  'source-result-visible': 'An owned tool result exposes the named public raw JSON source result; raw response-byte identity remains unobserved.',
  'processed-source-visible': 'An owned processed tool result exposes the named public source and selected identity fields; raw acquisition and response-byte identity remain unestablished.',
  'source-unconfirmed': 'The selected UI evidence does not establish public source acquisition.',
});

/** Fixed public facts only. Never pass AX text, an answer, or arbitrary notes. */
export function publicDesktopNote(code) {
  if (!Object.hasOwn(NOTES, code)) fail('Unknown public desktop note code.');
  return NOTES[code];
}

export function validatePublicDesktopNote(value) {
  return typeof value === 'string' && value.length <= 240 && Object.values(NOTES).includes(value);
}

/**
 * Validate a normalized, complete snapshot. The UI adapter supplies nodes from
 * one fresh AX capture; the controller supplies ownership and the current time.
 */
export function validateClaudeSnapshot(snapshot, { now, maxAgeMs = 30000 } = {}) {
  if (!plain(snapshot) || !safeId(snapshot.captureId) || !timestamp(snapshot.capturedAt)
      || snapshot.bundleId !== CLAUDE_BUNDLE_ID || snapshot.complete !== true
      || snapshot.owned !== true || !windowId(snapshot.windowId)
      || snapshot.windowId !== snapshot.ownedWindowId) fail('A complete owned Claude snapshot is required.');
  const current = typeof now === 'number' ? now : timestamp(now) ? Date.parse(now) : NaN;
  if (!Number.isFinite(current) || !Number.isSafeInteger(maxAgeMs) || maxAgeMs < 0
      || current < Date.parse(snapshot.capturedAt) || current - Date.parse(snapshot.capturedAt) > maxAgeMs) fail('The Claude snapshot is stale or its time is invalid.');
  if (!Array.isArray(snapshot.nodes) || snapshot.nodes.length > 20000) fail('Bounded AX nodes are required.');
  const seen = new Set();
  for (const node of snapshot.nodes) {
    if (!plain(node) || !Number.isSafeInteger(node.index) || node.index < 0 || seen.has(node.index)
        || typeof node.role !== 'string' || !node.role || node.role.length > 80
        || typeof node.label !== 'string' || node.label.length > 8192
        || (node.value !== undefined && (typeof node.value !== 'string' || node.value.length > 1048576))
        || (node.url !== undefined && (typeof node.url !== 'string' || node.url.length > 8192))
        || typeof node.enabled !== 'boolean' || typeof node.visible !== 'boolean') fail('Invalid or ambiguous AX node.');
    seen.add(node.index);
  }
  return true;
}

function captureDigest(snapshot) {
  return sha256(JSON.stringify({ captureId: snapshot.captureId, capturedAt: snapshot.capturedAt,
    bundleId: snapshot.bundleId, windowId: snapshot.windowId, nodes: snapshot.nodes }));
}

function evidence(snapshot, indices, method) {
  return { captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, windowId: snapshot.windowId,
    snapshotSha256: captureDigest(snapshot), indices: [...indices], method };
}

function selectedNode(snapshot, index) {
  if (!Number.isSafeInteger(index)) fail('Select a node index from this AX capture.');
  const node = snapshot.nodes.find(item => item.index === index);
  if (!node || !node.visible) fail('The selected AX node is not visibly established.');
  return node;
}

/** Exact equality only; mismatches never return the observed composer text. */
export function extractCanonicalComposer(snapshot, canonicalText, { composerIndex, ...freshness } = {}) {
  validateClaudeSnapshot(snapshot, freshness);
  if (typeof canonicalText !== 'string' || !canonicalText || canonicalText.length > 1048576 || !canonicalText.isWellFormed()) fail('A bounded canonical public invitation is required.');
  const node = selectedNode(snapshot, composerIndex);
  if (!['textarea', 'textentryarea', 'textfield'].includes(role(node.role)) || !node.enabled || typeof node.value !== 'string') fail('The selected node is not an enabled composer.');
  const material = evidence(snapshot, [node.index], 'composer-utf8-sha256');
  if (node.value !== canonicalText) return { matches: false, reason: 'context-differs', evidence: material, note: publicDesktopNote('composer-differs') };
  return { matches: true, text: canonicalText, contextSha256: sha256(canonicalText), contextBytes: Buffer.byteLength(canonicalText, 'utf8'),
    composerIndex: node.index, evidence: material, note: publicDesktopNote('composer-matches') };
}

/** Separate Lab-only observation. Never reconstruct or return exposed text. */
export function extractPresentationComposer(snapshot, canonicalText, { composerIndex, policy, ...freshness } = {}) {
  validateClaudeSnapshot(snapshot, freshness);
  if (policy !== LAB_AX_POLICY) fail('Select the named Lab presentation policy.');
  const node = selectedNode(snapshot, composerIndex);
  if (!['textarea', 'textentryarea', 'textfield'].includes(role(node.role)) || !node.enabled || typeof node.value !== 'string') fail('The selected node is not an enabled composer.');
  const comparison = compareDraftText(canonicalText, node.value, { policy });
  return { matches: comparison.presentationMatches, comparison, composerIndex: node.index,
    evidence: evidence(snapshot, [node.index], policy),
    note: publicDesktopNote(comparison.presentationMatches ? 'presentation-matches' : 'presentation-differs') };
}

/** An index is actionable only against the exact snapshot used for comparison. */
export function findSubmitControl(snapshot, composer, freshness = {}) {
  validateClaudeSnapshot(snapshot, freshness);
  if (!composer?.matches || composer.evidence?.captureId !== snapshot.captureId
      || composer.evidence?.windowId !== snapshot.windowId || composer.evidence?.snapshotSha256 !== captureDigest(snapshot)
      || !['composer-utf8-sha256', LAB_AX_POLICY].includes(composer.evidence?.method)) fail('Submit requires an exact composer or selected-policy comparison from this capture.');
  const candidates = snapshot.nodes.filter(node => node.visible && node.enabled && role(node.role) === 'button'
    && /^(?:send|send message|submit|submit prompt)$/iu.test(node.label));
  if (candidates.length !== 1) return { found: false, reason: 'submit-unavailable', note: publicDesktopNote('submit-unavailable') };
  const node = candidates[0];
  return { found: true, index: node.index, label: node.label, evidence: evidence(snapshot, [node.index], 'visual-inspection') };
}

function scopedNodes(snapshot, scopeIndex, indices) {
  const scope = selectedNode(snapshot, scopeIndex);
  if (!['group', 'section', 'article', 'container', 'dialog'].includes(role(scope.role))) fail('Select the owned reply or tool-result region.');
  if (!Array.isArray(indices) || !indices.length || indices.length > 100) fail('Bounded UI evidence indices are required.');
  return indices.map(index => {
    const node = selectedNode(snapshot, index), seen = new Set();
    let parent = node;
    while (parent && parent.index !== scope.index && !seen.has(parent.index)) {
      seen.add(parent.index);
      parent = snapshot.nodes.find(item => item.index === parent.parentIndex);
    }
    if (parent?.index !== scope.index) fail('UI evidence must belong to the selected owned region.');
    return node;
  });
}

const exposedText = node => typeof node.value === 'string' ? node.value : node.label;

/** The controller identifies the owned submitted user-message region. Text
 * equality alone cannot distinguish a user message from an assistant quote. */
export function extractSentMessage(snapshot, canonicalText, { scopeIndex, messageIndex, ownedUserMessage, policy = EXACT_POLICY, ...freshness } = {}) {
  validateClaudeSnapshot(snapshot, freshness);
  if (ownedUserMessage !== true || typeof canonicalText !== 'string' || !canonicalText) fail('Select the owned submitted public user-message region.');
  const [message] = scopedNodes(snapshot, scopeIndex, [messageIndex]);
  if (!['statictext', 'text', 'paragraph'].includes(role(message.role))) fail('The sent public message is not visibly established as static text.');
  const comparison = compareDraftText(canonicalText, exposedText(message), { policy });
  if (!comparison.presentationMatches) fail('The sent public message does not match the selected comparison policy; exact text is required by default.');
  return { matches: true, comparison, evidence: evidence(snapshot, [scopeIndex, messageIndex], policy === EXACT_POLICY ? 'visual-inspection' : policy) };
}

const denial = value => /(?:\bHTTP\s*(?:status\s*)?403\b|\b403\s+Forbidden\b|connect_rejected|CONNECT\s+tunnel[^\n]*(?:failed|failure|403)|(?:access|permission)\s+(?:was\s+)?denied|download\s+failed)/iu.test(value);

function publicSource(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash
      && /[a-z]/iu.test(url.hostname) && url.hostname.includes('.') && !/\.(?:localhost|local|internal)$/iu.test(url.hostname)
      && !['localhost', 'localhost.localdomain'].includes(url.hostname) && !url.hostname.includes(':');
  } catch { return false; }
}

const sourceIdentityKeys = new Set(['schema', 'id', 'revision', 'version']);
const textRoles = new Set(['statictext', 'text', 'paragraph']);
const disallowedToolControls = /^(?:copy(?: response)?|retry(?: response)?|send(?: message)?|submit(?: prompt)?|edit|show more|show less|stop(?: response)?)$/iu;

function validatedExpectedFields(expected) {
  if (!plain(expected) || Object.keys(expected).length < 2 || Object.keys(expected).length > 4
      || !Object.hasOwn(expected, 'schema') || !['id', 'revision', 'version'].some(key => Object.hasOwn(expected, key))
      || !Object.entries(expected).every(([key, value]) => sourceIdentityKeys.has(key)
        && (typeof value === 'string' && value.length > 0 && value.length <= 2048 || typeof value === 'number' && Number.isFinite(value)))) return null;
  return expected;
}

/** The controller must identify an actual expanded tool-output boundary. A
 * heading, Read label or assistant assertion alone cannot supply provenance.
 * This rejects obvious reply/control substitutions; a lying controller remains
 * outside this instrument's trust boundary, as with every GUI observation.
 */
function validateToolProvenance(snapshot, proof, reply) {
  const p = proof.provenance;
  if (!plain(p) || p.kind !== 'expanded-tool-result' || p.captureId !== snapshot.captureId
      || !Number.isSafeInteger(p.toolControlIndex)) fail('Select current expanded-tool-result provenance with an actual tool control.');
  if (reply && proof.scopeIndex === reply.scopeIndex) fail('A broad assistant reply region cannot stand in for a tool result.');
  const [control] = scopedNodes(snapshot, proof.scopeIndex, [p.toolControlIndex]);
  if (!['button', 'disclosuretriangle'].includes(role(control.role)) || !control.enabled || !control.label
      || disallowedToolControls.test(control.label)) fail('Tool-result provenance requires its actual disclosure control, not reply prose or response controls.');
  const scope = selectedNode(snapshot, proof.scopeIndex);
  if (/\b(?:assistant (?:reply|response)|you said|user message)\b|^message\s*\d+\s*of\s*\d+$/iu.test(scope.label)) fail('An assistant or user-message boundary is not tool-result provenance.');
  return [control.index];
}

/** URL labels are exact, never substring matches. AXLink descriptions may
 * expose the full URL while their value exposes a scheme-less display label.
 * A conflicting explicit full target disqualifies the selection. Optional url
 * must be a real AX target supplied by the adapter, never reconstructed.
 */
function matchesSourceUrl(node, sourceUrl) {
  const kind = role(node.role);
  if (textRoles.has(kind)) return exposedText(node) === sourceUrl || exposedText(node) === `URL: ${sourceUrl}`;
  if (kind !== 'link') return false;
  const candidates = [node.url, node.label, node.value].filter(value => typeof value === 'string' && /^https?:\/\//u.test(value));
  return candidates.length > 0 && candidates.every(value => value === sourceUrl);
}

function validateIdentitySelections(proof) {
  const expected = validatedExpectedFields(proof.expectedJsonFields);
  if (!expected || !Array.isArray(proof.identityFields) || proof.identityFields.length !== Object.keys(expected).length
      || proof.identityFields.length > 4) fail('Processed source evidence needs each bounded expected identity field.');
  const seen = new Set();
  for (const item of proof.identityFields) {
    if (!plain(item) || !sourceIdentityKeys.has(item.field) || !Object.hasOwn(expected, item.field) || seen.has(item.field)
        || !Number.isSafeInteger(item.index) || !['value', 'field-line', 'json-member', 'json-member-comma'].includes(item.format)) fail('Select one exact visible identity field with a named literal format.');
    seen.add(item.field);
  }
  return proof.identityFields;
}

function identityTextMatches(node, item, expected) {
  if (!textRoles.has(role(node.role))) return false;
  const rendered = item.format === 'value' ? String(expected)
    : item.format === 'field-line' ? `${item.field}: ${String(expected)}`
      : `${JSON.stringify(item.field)}: ${JSON.stringify(expected)}${item.format === 'json-member-comma' ? ',' : ''}`;
  return exposedText(node) === rendered;
}

/**
 * Classification uses controller-selected evidence from the owned region.
 * A reply's meaning is an attributed desktop-UI observation: each positive
 * semantic fact needs its own selected visible node plus a finished control.
 * Raw source bytes, model origin and comprehension are never inferred.
 */
export function classifyOwnedEvidence(snapshot, { reply, toolResults = [], ...freshness } = {}) {
  validateClaudeSnapshot(snapshot, freshness);
  let orientation = { status: 'not-observed', note: publicDesktopNote('reply-unconfirmed') };
  if (reply !== undefined) {
    if (!plain(reply) || reply.owned !== true || reply.captureId !== snapshot.captureId) fail('Reply evidence must be explicitly owned by this capture.');
    const facts = ['collectionIntroduction', 'accessLimits', 'followupInvitation'];
    if (plain(reply.observedFacts) && facts.every(key => Number.isSafeInteger(reply.observedFacts[key]))
        && Number.isSafeInteger(reply.finishedControlIndex)) {
      const indices = [...facts.map(key => reply.observedFacts[key]), reply.finishedControlIndex];
      const nodes = scopedNodes(snapshot, reply.scopeIndex, indices);
      const finished = nodes.at(-1);
      if (nodes.slice(0, -1).every(node => ['statictext', 'text', 'paragraph'].includes(role(node.role)) && exposedText(node).trim().length >= 20)
          && role(finished.role) === 'button' && /^(?:copy|copy response|retry|retry response)$/iu.test(finished.label) && finished.enabled) {
        orientation = { status: 'observed', scope: 'visible-collection-orientation',
          evidence: evidence(snapshot, indices, 'visual-inspection'), note: publicDesktopNote('orientation-visible'),
          limits: ['Semantic facts are the controller\'s attributed UI observations, not keyword-derived proof.', 'Orientation does not establish raw source access or complete document reading.'] };
      }
    }
  }
  if (!Array.isArray(toolResults) || toolResults.length > 20) fail('Bounded tool-result proofs are required.');
  const sourceResults = toolResults.map(proof => {
    if (!plain(proof) || proof.owned !== true || proof.captureId !== snapshot.captureId || !publicSource(proof.sourceUrl)) fail('A current owned public-source tool proof is required.');
    if (proof.representation !== undefined && !['raw-json-result', 'processed-source-result', 'access-denial'].includes(proof.representation)) fail('Select a supported tool-result representation.');
    const provenanceIndices = validateToolProvenance(snapshot, proof, reply);
    const identitySelections = proof.identityFields === undefined ? [] : validateIdentitySelections(proof);
    const indices = [...new Set([proof.scopeIndex, ...provenanceIndices, proof.urlIndex, proof.bodyIndex, ...identitySelections.map(item => item.index)])];
    const selected = scopedNodes(snapshot, proof.scopeIndex, [proof.urlIndex, proof.bodyIndex, ...identitySelections.map(item => item.index)]);
    const [urlNode, bodyNode] = selected;
    if (!['statictext', 'text', 'paragraph'].includes(role(bodyNode.role))) fail('Tool proof must reference visible result text.');
    const bodyText = exposedText(bodyNode), material = evidence(snapshot, indices, 'visible-tool-result');
    const base = { sourceUrl: proof.sourceUrl, representation: proof.representation ?? 'unspecified', evidence: material,
      provenance: 'controller-selected-expanded-tool-result', rawByteIdentity: 'not-established' };
    if (!matchesSourceUrl(urlNode, proof.sourceUrl)) return { ...base, status: 'not-observed', note: publicDesktopNote('source-unconfirmed') };
    if (denial(bodyText)) return proof.representation === 'access-denial'
      ? { ...base, status: 'failed', scope: 'visible-tool-access-denial', reason: 'access-failed',
        note: publicDesktopNote('source-denied'), identityCheck: 'not-established' }
      : { ...base, status: 'not-observed', note: publicDesktopNote('source-unconfirmed'), identityCheck: 'not-established' };
    // A Read/search label or an assistant's claim is insufficient. The selected
    // result boundary and actual tool control establish only controller-trusted
    // UI provenance. Source bytes and tool/model execution remain unestablished.
    let payload;
    try { payload = JSON.parse(bodyText); } catch {}
    const expected = validatedExpectedFields(proof.expectedJsonFields);
    if (proof.representation === 'raw-json-result' && plain(payload) && expected
        && Object.entries(expected).every(([key, value]) => payload[key] === value)) {
      return { ...base, status: 'observed', scope: 'visible-raw-json-result', identityCheck: 'parsed-json-fields',
        payloadSha256: sha256(bodyText), note: publicDesktopNote('source-result-visible') };
    }
    if (proof.representation === 'processed-source-result' && expected && identitySelections.length === Object.keys(expected).length
        && identitySelections.every((item, index) => identityTextMatches(selected[index + 2], item, expected[item.field]))) {
      return { ...base, status: 'observed', scope: 'visible-processed-source-result', identityCheck: 'selected-exact-fields',
        payloadSha256: sha256(bodyText), note: publicDesktopNote('processed-source-visible') };
    }
    return { ...base, status: 'not-observed', note: publicDesktopNote('source-unconfirmed'), identityCheck: 'not-established' };
  });
  return { orientation, sourceResults, rawByteIdentity: 'not-established',
    limits: ['A helper validates evidence selection and structure under trust in the controller.', 'No UI label alone establishes source acquisition, Agent execution or comprehension.'] };
}
