import { createReading } from './reading.mjs';

const NAMES = { 'codex-app': 'ChatGPT', 'claude-app': 'Claude' };
const ABOUT_URL = 'https://agentart.work/ask-your-agent/';
const mounts = new WeakMap();
let nextId = 0;

/** Flat-label candidate. Discovery, when supplied, belongs to the host. */
export function mountReading(element, options) {
  if (!element?.ownerDocument || typeof element.replaceChildren !== 'function') throw new TypeError('Choose a DOM element for the reading controls.');
  if (mounts.has(element)) throw new TypeError('Reading controls are already mounted here. Destroy them before mounting again.');
  const { label = 'Ask your Agent', evidence = false, onReceipt, discoverClients, ...input } = options || {};
  if (typeof label !== 'string' || !label.trim() || typeof evidence !== 'boolean'
      || (onReceipt !== undefined && typeof onReceipt !== 'function')
      || (discoverClients !== undefined && typeof discoverClients !== 'function')) throw new TypeError('Invalid reading interface options.');
  const reading = createReading(input);
  const document = element.ownerDocument;
  const window = document.defaultView;
  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  const root = node('div', 'aap-reading'); root.dataset.presentation = 'flat-label';
  const row = node('div', 'aap-reading-row');
  const title = node('a', 'aap-reading-title'); title.href = ABOUT_URL;
  title.title = 'What is Ask your Agent?';
  title.setAttribute('aria-label', `${label} — about this component`);
  title.append(node('span', 'aap-reading-label', label));
  const actions = node('div', 'aap-reading-actions'); actions.setAttribute('role', 'group'); actions.setAttribute('aria-label', label);
  const sizing = node('div', 'aap-reading-actions-size'); sizing.setAttribute('aria-hidden', 'true');
  sizing.append(node('span', '', 'Copied')); // Copy is usable even before discovery resolves.
  const actionRow = node('div', 'aap-reading-actions-row');
  const apps = node('span', 'aap-reading-apps');
  const copy = node('button', 'aap-reading-copy'); copy.type = 'button'; copy.dataset.state = 'ready';
  copy.setAttribute('aria-label', 'Copy context for any Agent or conversation'); copy.title = 'Copy into any new or existing Agent conversation';
  const copyLabel = node('span', 'aap-reading-copy-label'); copyLabel.setAttribute('aria-hidden', 'true');
  copyLabel.append(node('span', 'aap-reading-copy-ready', 'Copy'), node('span', 'aap-reading-copy-done', 'Copied'));
  copy.append(copyLabel);
  actionRow.append(apps, copy); actions.append(sizing, actionRow); row.append(title, actions);
  const hint = node('p', 'aap-reading-hint'); hint.id = `aap-reading-${++nextId}-hint`;
  copy.setAttribute('aria-describedby', hint.id);
  const status = node('p', 'aap-reading-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const announcement = node('p', 'aap-reading-announcement');
  announcement.setAttribute('role', 'status'); announcement.setAttribute('aria-live', 'polite'); announcement.setAttribute('aria-atomic', 'true');
  const context = node('textarea', 'aap-reading-text'); context.readOnly = true; context.rows = 6; context.hidden = true;
  context.value = reading.context; context.setAttribute('aria-label', `${reading.work.title}: context to copy`);
  const download = node('button', 'aap-reading-download', 'Download handoff receipt'); download.type = 'button'; download.hidden = true;
  root.append(row, hint, status, announcement, context, download); element.append(root);
  let destroyed = false, busy = false, generation = 0, retained, deadline, copyFeedbackTimer;
  const listeners = [];
  const listen = (target, event, handler) => { target.addEventListener(event, handler); listeners.push(() => target.removeEventListener(event, handler)); };
  function clearReceipt() { generation++; retained = undefined; download.hidden = true; }
  function clearCopyFeedback() {
    window.clearTimeout(copyFeedbackTimer); copyFeedbackTimer = undefined;
    copy.dataset.state = 'ready'; announcement.textContent = '';
  }
  function copied(expected) {
    if (destroyed || generation !== expected) return;
    copy.dataset.state = 'copied';
    announcement.textContent = 'Context copied. Paste it into any new or existing Agent conversation.';
    copyFeedbackTimer = window.setTimeout(() => {
      if (!destroyed && generation === expected) { copy.dataset.state = 'ready'; copyFeedbackTimer = undefined; }
    }, 3000);
  }
  function copyBusy(value) {
    busy = value; copy.disabled = value;
    for (const anchor of apps.children) anchor.setAttribute('aria-disabled', String(value));
  }
  async function recordNative(client, expected) {
    if (!evidence) return;
    try {
      const receipt = await reading.receipt({ event: 'handoff-requested', client, conversation: 'fresh', observer: 'visitor-browser' });
      if (destroyed || generation !== expected) return;
      retained = receipt; download.hidden = false;
      if (onReceipt) void Promise.resolve().then(() => {
        if (!destroyed && generation === expected) return onReceipt(receipt);
      }).catch(() => {
        if (!destroyed && generation === expected) status.textContent += ' The receipt callback failed; the local receipt is still available.';
      });
    } catch { if (!destroyed && generation === expected) status.textContent += ' A receipt is unavailable for this action.'; }
  }
  const nativeIds = Object.keys(NAMES).filter(id => reading.clients.includes(id) && reading.prepare({ client: id, conversation: 'fresh' }).kind === 'native');
  function renderClients(ids) {
    if (destroyed) return;
    // The hidden row reserves Copied width; visible items share the spare
    // space equally in both states. Discovery updates both rows together.
    sizing.replaceChildren(...ids.map(id => node('span', '', NAMES[id])), node('span', '', 'Copied'));
    for (const id of ids) {
      const plan = reading.prepare({ client: id, conversation: 'fresh' });
      const anchor = node('a', 'aap-reading-agent'); anchor.href = plan.url; anchor.dataset.client = id;
      anchor.setAttribute('aria-describedby', hint.id);
      anchor.setAttribute('aria-label', `Open a new ${NAMES[id]} desktop conversation with this context`);
      anchor.setAttribute('aria-disabled', String(busy));
      anchor.title = `Requires ${NAMES[id]} desktop. Prefill a new conversation; review the app mode and send there.`;
      anchor.append(node('span', 'aap-reading-agent-name', NAMES[id]));
      listen(anchor, 'click', event => {
        if (destroyed || busy || event.defaultPrevented) { event.preventDefault(); return; }
        clearReceipt(); clearCopyFeedback(); const expected = generation;
        // Keep navigation on the ordinary visitor click; never launch from a timer.
        window.setTimeout(() => {
          if (destroyed || event.defaultPrevented || generation !== expected) return;
          status.textContent = `Handoff requested. Your browser may ask to open ${NAMES[id]}. Review the app mode and draft there. This page cannot confirm arrival.`;
          void recordNative(id, expected);
        }, 0);
      });
      apps.append(anchor);
    }
  }
  listen(copy, 'click', async event => {
    if (destroyed || busy || event.defaultPrevented) return;
    clearReceipt(); clearCopyFeedback(); const expected = generation; copyBusy(true);
    try {
      try { await window.navigator.clipboard.writeText(reading.context); }
      catch {
        if (destroyed || generation !== expected) return;
        context.hidden = false; context.focus(); context.select();
        status.textContent = 'Copy the selected context into any new or existing Agent conversation.';
        return;
      }
      copied(expected);
      // This compact action declares no destination conversation, so issues no receipt.
    } finally { if (!destroyed) copyBusy(false); }
  });
  listen(download, 'click', () => {
    if (!retained || destroyed) return;
    const url = window.URL.createObjectURL(new window.Blob([JSON.stringify(retained, null, 2) + '\n'], { type: 'application/json' }));
    const anchor = node('a'); anchor.href = url; anchor.download = 'agent-reading-receipt.json'; anchor.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  });
  const offeredHint = nativeIds.length
    ? 'Desktop links require installed apps; availability has not been checked. Review the destination app mode. Copy works in any conversation.'
    : 'Copy context into any new or existing Agent conversation. No configured native route can carry this context.';
  if (!discoverClients || !nativeIds.length) {
    renderClients(nativeIds); hint.textContent = offeredHint;
  } else {
    hint.textContent = 'Checking app availability with the host integration. Copy is always available.';
    void Promise.race([
      Promise.resolve().then(() => { if (!destroyed) return discoverClients(); }),
      new Promise((_, reject) => { deadline = window.setTimeout(() => reject(new Error('Discovery timed out.')), 2500); }),
    ]).then(snapshot => {
      if (destroyed) return;
      if (!snapshot || !Array.isArray(snapshot.clients)) throw new Error('Invalid host discovery result.');
      const ids = nativeIds.filter(id => snapshot.clients.some(client => client?.id === id));
      renderClients(ids);
      hint.textContent = ids.length
        ? 'App availability reported by the host integration. Review the destination app mode and draft. Copy works in any conversation.'
        : 'The host integration reported no configured desktop apps. Copy works in any Agent conversation.';
    }).catch(() => {
      if (destroyed) return;
      renderClients(nativeIds); hint.textContent = `App availability could not be checked. ${offeredHint}`;
    }).finally(() => window.clearTimeout(deadline));
  }
  const mounted = Object.freeze({ reading, destroy() {
    if (destroyed) return;
    destroyed = true; window.clearTimeout(deadline); window.clearTimeout(copyFeedbackTimer);
    generation++; retained = undefined;
    listeners.forEach(remove => remove()); root.remove(); mounts.delete(element);
  } });
  mounts.set(element, mounted);
  return mounted;
}
