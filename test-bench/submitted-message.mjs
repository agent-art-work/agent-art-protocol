/** Read-only Claude rendered-message adapter. No native actions or raw-text output. */
import { createHash } from 'node:crypto';
import { validateClaudeSnapshot } from './desktop-ui.mjs';

export const INLINE_SUBMITTED_POLICY = 'claude-inline-static-v1';
const sha = value => createHash('sha256').update(value).digest('hex');
const ensure = (value, message) => { if (!value) throw TypeError(message); };
const textRole = node => ['text', 'paragraph', 'static text'].includes(node.role);
const text = node => node.value ?? node.label;
function within(nodes, node, scope) {
  const seen = new Set();
  while (node && !seen.has(node.index)) {
    if (node.index === scope.index) return true;
    seen.add(node.index); node = nodes.find(item => item.index === node.parentIndex);
  }
  return false;
}

/** Explicitly selected GUI serialization: preserve every character except that
 * each authored LF paragraph boundary is displayed as one space. Full link
 * targets replace only their matching scheme-less AX display labels. Neither
 * comparison proves the bytes submitted to, or perceived by, a model.
 */
export function extractInlineSubmittedMessage(snapshot, canonical, {
  policy, scopeIndex, messageIndex, partIndices, ownedUserMessage, ...freshness
} = {}) {
  validateClaudeSnapshot(snapshot, freshness);
  ensure(policy === INLINE_SUBMITTED_POLICY && ownedUserMessage === true,
    'An explicit rendered-submission policy and owned user message are required.');
  ensure(typeof canonical === 'string' && canonical.length > 0 && canonical.length <= 1048576
    && canonical.isWellFormed() && !canonical.includes('\r'), 'Bounded LF public context required.');
  const node = index => {
    const selected = snapshot.nodes.find(item => item.index === index);
    ensure(Number.isSafeInteger(index) && selected?.visible && selected.enabled, 'Select current visible enabled message nodes.');
    return selected;
  };
  const scope = node(scopeIndex), body = node(messageIndex);
  ensure(scope.role === 'container' && /^Message 1 of [12]$/u.test(scope.label)
    && body.role === 'container' && body.index !== scope.index && within(snapshot.nodes, body, scope),
  'Select the first owned submitted user-message boundary and its distinct body.');
  ensure(snapshot.nodes.some(item => ['heading', 'text', 'static text'].includes(item.role) && /^You said:/u.test(item.label)
    && within(snapshot.nodes, item, scope)), 'The selected boundary must expose its user heading.');
  const descendants = snapshot.nodes.filter(item => item.index !== body.index && within(snapshot.nodes, item, body));
  ensure(descendants.length > 0 && descendants.length <= 100
    && descendants.every(item => item.visible && item.enabled && ['container', 'text', 'paragraph', 'static text', 'link'].includes(item.role)),
  'Only the complete static message body and inline links may be selected.');
  const parts = descendants.filter(item => textRole(item) || item.role === 'link');
  ensure(Array.isArray(partIndices) && parts.length === partIndices.length
    && parts.length > 0 && parts.every((item, index) => item.index === partIndices[index])
    && new Set(partIndices).size === partIndices.length,
  'Select every message text/link part once in actual tree order.');
  const rendered = parts.map(item => {
    if (textRole(item)) return text(item);
    const targets = [item.url, item.label].filter(value => typeof value === 'string' && /^https:\/\//u.test(value));
    ensure(targets.length > 0 && targets.every(value => value === targets[0]), 'Inline links need one consistent explicit HTTPS target.');
    const target = targets[0], url = new URL(target);
    ensure(!url.username && !url.password && (item.value === target || item.value === target.slice(8)),
      'Inline link display must match its actual full or scheme-less target.');
    return target;
  }).join('');
  const exactMatches = rendered === canonical;
  const presentationMatches = rendered === canonical.replace(/\n+/gu, ' ');
  ensure(exactMatches || presentationMatches, 'Rendered message differs from the declared public invitation.');
  return { matches: true, comparison: { policy, exactMatches, presentationMatches: true,
    basis: exactMatches ? 'exact-static-parts' : 'line-breaks-rendered-as-spaces',
    canonicalSha256: sha(canonical), exposedSha256: sha(rendered),
    canonicalBytes: Buffer.byteLength(canonical), exposedBytes: Buffer.byteLength(rendered) },
  evidence: { captureId: snapshot.captureId, capturedAt: snapshot.capturedAt, windowId: snapshot.windowId,
    snapshotSha256: sha(JSON.stringify(snapshot)), indices: [scopeIndex, messageIndex, ...partIndices], method: policy },
  claim: 'submitted-public-invitation-visible-under-rendering-policy',
  limits: ['The controller attributes the selected owned UI; model-received bytes and private execution are not established.',
    'This explicit submitted-message rendering policy does not alter draft comparison or historical reports.'] };
}
