/** Adapter for a complete native Claude CUA accessibility capture. The caller
 * supplies actual window ownership. Raw AX, URLs and nodes stay in memory;
 * persist only the bounded evidence emitted by the bench helpers.
 */
import { randomUUID } from 'node:crypto';
import { CLAUDE_BUNDLE_ID } from './desktop-ui.mjs';

const roles = ['standard window', 'text entry area', 'text field', 'pop up button',
  'radio button', 'toggle button', 'content list', 'tab group', 'menu bar',
  'HTML content', 'AXListMarker', 'container', 'disclosure triangle', 'button',
  'heading', 'splitter', 'toolbar', 'section', 'article', 'paragraph', 'text',
  'link', 'tab', 'group', 'menu'];

export function claudeAXSnapshot(raw, { ownedWindowId, owned = false,
  capturedAt = new Date().toISOString(), captureId = randomUUID() } = {}) {
  if (typeof raw !== 'string' || raw.length > 8_000_000 || !/^Window:.*App: Claude\./m.test(raw)
      || owned !== true || ownedWindowId === undefined) throw TypeError('An actual complete owned Claude CUA capture is required.');
  const nodes = [], stack = [], focusFooters = [];
  let continuation, documentUrl, insideFocusFooter = false;
  const finishContinuation = () => {
    if (continuation?.node[continuation.field].endsWith('\n')) {
      continuation.node[continuation.field] = continuation.node[continuation.field].slice(0, -1);
    }
    continuation = undefined;
  };
  for (const line of raw.split('\n')) {
    if (/^The focused UI element is(?: |$)/u.test(line)) {
      // A column-zero payload line can look exactly like CUA's footer. With
      // an open multiline value there is no safe serialization boundary:
      // reject the capture rather than truncate a draft into an empty one.
      if (continuation) throw TypeError('Ambiguous focused-element footer inside an AX payload.');
      // CUA appends a focused-element description after the tree. Its value
      // may itself be multiline; none of that duplicate description is a
      // continuation of the last tree node's payload.
      finishContinuation();
      insideFocusFooter = true;
      const match = /^The focused UI element is (\d+) (.+)$/u.exec(line);
      const index = match ? Number(match[1]) : undefined;
      const focusedRole = match && roles.find(name => match[2] === name || match[2].startsWith(name + ' '));
      focusFooters.push(Number.isSafeInteger(index) && focusedRole ? { index, role: focusedRole } : null);
      continue;
    }
    if (insideFocusFooter) {
      // The footer is terminal. Indexed lines afterward could be a tree
      // continuation or a duplicate multiline value; neither is safe to guess.
      if (/^\t*\d+ /u.test(line)) throw TypeError('Ambiguous AX tree content after a focused-element footer.');
      continue;
    }
    const match = /^(\t*)(\d+) (.*)$/.exec(line);
    if (!match) {
      // CUA prints multiline AXValue on following non-indexed lines. The one
      // final blank line separates AX nodes; remove that separator below.
      if (continuation) continuation.node[continuation.field] += '\n' + line;
      continue;
    }
    finishContinuation();
    const [, tabs, indexText, rest] = match, depth = tabs.length;
    const role = roles.find(name => rest === name || rest.startsWith(name + ' ')) || 'unknown';
    const suffix = rest.slice(role === 'unknown' ? 0 : role.length).replace(/^\s*\([^)]*\)\s*/u, '').trimStart();
    const description = /(?:^|, )Description: ([\s\S]*?)(?=, (?:Value|Help|ID|Secondary Actions):|$)/u.exec(suffix)?.[1];
    const staticText = ['text', 'paragraph'].includes(role);
    const value = staticText ? undefined : /(?:^|, )Value: ([\s\S]*)/u.exec(suffix)?.[1];
    // Static payload is source data. Remove only CUA's one role separator;
    // don't trim whitespace or reinterpret literal Description:/Value: text.
    const label = staticText ? rest.slice(role.length + (rest[role.length] === ' ' ? 1 : 0))
      : description ?? suffix.replace(/(?:^|, )(?:Value|Help|ID|Secondary Actions):[\s\S]*/u, '').trim();
    while (stack.length && stack.at(-1).depth >= depth) stack.pop();
    const node = { index: Number(indexText), role, label: label || role,
      enabled: !/\(disabled\)/u.test(rest), visible: true,
      ...(role === 'standard window' && /(?:^|, )Secondary Actions: Raise(?:,|$)/u.test(suffix) && { secondaryActions: ['Raise'] }),
      ...(stack.length && { parentIndex: stack.at(-1).index }), ...(value !== undefined && { value }) };
    nodes.push(node); stack.push({ depth, index: node.index });
    if (['text entry area', 'text field'].includes(role) && value !== undefined) continuation = { node, field: 'value' };
    else if (['text', 'paragraph'].includes(role)) continuation = { node, field: value === undefined ? 'label' : 'value' };
    if (role === 'HTML content') {
      const route = /(?:^|, )URL: (https:\/\/claude\.ai\/[^\s]+|claude\.ai\/[^\s]+)/u.exec(suffix)?.[1];
      if (route) {
        if (documentUrl) throw TypeError('Multiple Claude document surfaces require explicit window isolation.');
        documentUrl = route.startsWith('https://') ? route : 'https://' + route;
      }
    }
  }
  finishContinuation();
  if (!nodes.some(node => node.index === 0 && node.role === 'standard window') || !documentUrl) throw TypeError('A complete Claude window and document surface are required.');
  // Focus is an exposed CUA observation, not proof of keyboard delivery. A
  // missing, malformed or conflicting footer must not select a likely node.
  const footer = focusFooters[0];
  const focusedNodes = footer ? nodes.filter(node => node.index === footer.index) : [];
  const focus = !focusFooters.length ? { status: 'not-exposed' }
    : focusFooters.length !== 1 ? { status: 'ambiguous', reason: 'multiple-footers' }
      : !footer ? { status: 'ambiguous', reason: 'invalid-footer' }
        : focusedNodes.length !== 1 ? { status: 'ambiguous', reason: 'node-not-unique' }
          : focusedNodes[0].role !== footer.role ? { status: 'ambiguous', reason: 'footer-node-conflicts' }
            : { status: 'observed', index: footer.index };
  return { captureId, capturedAt, bundleId: CLAUDE_BUNDLE_ID,
    windowId: ownedWindowId, ownedWindowId, owned, complete: true, documentUrl, nodes, focus };
}
