/** Pure diagnostics for the focus exposed by one complete Claude CUA capture.
 * This does not perform input, infer focus from pixels, qualify Send, or prove
 * keyboard delivery. Raw labels, values and auxiliary document URLs stay out
 * of the bounded result.
 */
import { createHash } from 'node:crypto';
import { validateClaudeSnapshot } from './desktop-ui.mjs';
import { isPlainRecord } from './plain-record.mjs';

const SCHEMA = 'agent-art-bench/claude-composer-focus/1';
const role = value => String(value || '').replace(/^AX/u, '').replace(/[\s_-]/gu, '').toLowerCase();
const ambiguityReasons = new Set(['multiple-footers', 'invalid-footer', 'node-not-unique', 'footer-node-conflicts']);
const fail = message => { throw new TypeError(message); };

function selected(snapshot, index) {
  if (!Number.isSafeInteger(index)) fail('Select focus indices from this capture.');
  const node = snapshot.nodes.find(item => item.index === index);
  if (!node || !node.visible) fail('A selected focus node is not visibly established.');
  return node;
}

function ancestry(node, byIndex) {
  const found = [], seen = new Set();
  while (node && !seen.has(node.index)) {
    found.push(node); seen.add(node.index);
    node = byIndex.get(node.parentIndex);
  }
  return found;
}

function focusObservation(snapshot) {
  if (snapshot.focus === undefined) return { status: 'not-exposed' };
  const value = snapshot.focus;
  if (!isPlainRecord(value)) fail('Bounded exposed focus metadata is required.');
  const keys = Object.keys(value).sort().join(',');
  if (value.status === 'not-exposed' && keys === 'status') return value;
  if (value.status === 'ambiguous' && keys === 'reason,status' && ambiguityReasons.has(value.reason)) return value;
  if (value.status === 'observed' && keys === 'index,status' && Number.isSafeInteger(value.index)
      && value.index >= 0 && snapshot.nodes.some(node => node.index === value.index)) return value;
  fail('Invalid or unbound exposed focus metadata.');
}

/** The caller selects the owned main Chat region and its actual composer.
 * An auxiliary HTML surface is identified only by differing AX ancestry;
 * neither its visibility nor its purpose is inferred from a private URL.
 */
export function inspectClaudeComposerFocus(snapshot, { scopeIndex, composerIndex, now, maxAgeMs = 30000 } = {}) {
  validateClaudeSnapshot(snapshot, { now, maxAgeMs });
  const scope = selected(snapshot, scopeIndex), composer = selected(snapshot, composerIndex);
  if (!['group', 'section', 'article', 'container'].includes(role(scope.role))) fail('Select the owned main Chat region for focus inspection.');
  const byIndex = new Map(snapshot.nodes.map(node => [node.index, node]));
  const composerAncestors = ancestry(composer, byIndex);
  if (composer.index === scope.index || !composerAncestors.some(node => node.index === scope.index)) fail('The focus composer must belong to the selected main Chat region.');
  if (!['textarea', 'textentryarea', 'textfield'].includes(role(composer.role)) || !composer.enabled
      || typeof composer.value !== 'string') fail('Select an enabled owned composer for focus inspection.');
  const observation = focusObservation(snapshot);
  let status = observation.status, location = 'not-established';
  if (status === 'observed') {
    const focused = byIndex.get(observation.index), focusedAncestors = ancestry(focused, byIndex);
    if (focused.index === composer.index) { status = 'composer'; location = 'composer'; }
    else if (focusedAncestors.some(node => node.index === composer.index)) { status = 'composer'; location = 'within-composer'; }
    else {
      status = 'elsewhere';
      const mainHtml = composerAncestors.find(node => role(node.role) === 'htmlcontent');
      const focusedHtml = focusedAncestors.find(node => role(node.role) === 'htmlcontent');
      location = mainHtml && focusedHtml ? mainHtml.index === focusedHtml.index ? 'main-html-surface' : 'auxiliary-html-surface' : 'other';
    }
  }
  const evidence = { schema: SCHEMA, captureId: snapshot.captureId, capturedAt: snapshot.capturedAt,
    windowId: snapshot.windowId,
    snapshotSha256: createHash('sha256').update(JSON.stringify({ captureId: snapshot.captureId,
      capturedAt: snapshot.capturedAt, bundleId: snapshot.bundleId, windowId: snapshot.windowId,
      documentUrl: snapshot.documentUrl, nodes: snapshot.nodes, focus: observation }), 'utf8').digest('hex'),
    indices: [...new Set([scopeIndex, composerIndex, ...(observation.status === 'observed' ? [observation.index] : [])])],
    focusStatus: status, location,
    ...(observation.status === 'observed' && { focusedIndex: observation.index }),
    ...(observation.status === 'ambiguous' && { reason: observation.reason }),
    attribution: 'cua-exposed-focus', keyboardDelivery: 'not-established' };
  return { status, focused: status === 'composer', location, evidence };
}
