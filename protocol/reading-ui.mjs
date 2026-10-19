import { createReading } from './reading.mjs';

const NAMES = { 'claude-app': 'Claude', 'codex-app': 'Codex', manual: 'Another Agent' };
let nextId = 0;
const mounts = new WeakMap();

/** Mount a reading handoff. The host supplies the Work and imports reading.css. */
export function mountReading(element, options) {
  if (!element?.ownerDocument || typeof element.replaceChildren !== 'function') throw new TypeError('Choose a DOM element for the reading controls.');
  if (mounts.has(element)) throw new TypeError('Reading controls are already mounted here. Destroy them before mounting again.');
  const { label = 'Ask your Agent', evidence = false, onReceipt, ...input } = options || {};
  if (typeof label !== 'string' || !label.trim() || typeof evidence !== 'boolean' || (onReceipt !== undefined && typeof onReceipt !== 'function')) throw new TypeError('Invalid reading interface options.');
  const reading = createReading(input);
  const document = element.ownerDocument;
  const window = document.defaultView;
  const id = `aap-reading-${++nextId}`;
  let destroyed = false;
  let busy = false;
  let generation = 0;
  let retained;
  const listeners = [];
  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  const listen = (item, event, handler) => { item.addEventListener(event, handler); listeners.push(() => item.removeEventListener(event, handler)); };
  const root = node('div', 'aap-reading');
  const selectors = node('div', 'aap-reading-options');
  const agentLabel = node('label', '', 'Your Agent');
  const client = node('select', 'aap-reading-client');
  client.id = `${id}-client`; agentLabel.htmlFor = client.id;
  for (const name of reading.clients) {
    const option = node('option', '', NAMES[name]); option.value = name; client.append(option);
  }
  // A route is offered, never inferred to be installed from browser heuristics.
  client.value = reading.clients.includes('claude-app') ? 'claude-app' : reading.clients[0];
  agentLabel.append(client);
  const conversationLabel = node('label', '', 'Conversation');
  const conversation = node('select', 'aap-reading-conversation');
  conversation.id = `${id}-conversation`; conversationLabel.htmlFor = conversation.id;
  for (const [value, text] of [['fresh', 'New conversation'], ['existing', 'Existing conversation · copy']]) {
    const option = node('option', '', text); option.value = value; conversation.append(option);
  }
  conversationLabel.append(conversation); selectors.append(agentLabel, conversationLabel);
  const actions = node('div', 'aap-reading-actions');
  const open = node('a', 'aap-reading-open', label);
  const copy = node('button', 'aap-reading-copy', 'Copy context'); copy.type = 'button';
  actions.append(open, copy);
  const route = node('p', 'aap-reading-route'); route.id = `${id}-route`; open.setAttribute('aria-describedby', route.id);
  const status = node('p', 'aap-reading-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const contextDetails = node('details', 'aap-reading-context');
  contextDetails.append(node('summary', '', 'Context for your Agent'));
  const context = node('textarea', 'aap-reading-text');
  context.value = reading.context; context.readOnly = true; context.rows = 7;
  context.setAttribute('aria-label', `${reading.work.title}: context to copy`); contextDetails.append(context);
  const receiptDetails = node('details', 'aap-reading-evidence'); receiptDetails.hidden = true;
  receiptDetails.append(node('summary', '', 'Handoff receipt'));
  receiptDetails.append(node('p', '', 'This browser recorded an action with the offered public context. It does not establish app arrival, sending, Agent reading or execution.'));
  const download = node('button', 'aap-reading-download', 'Download receipt'); download.type = 'button'; receiptDetails.append(download);
  root.append(selectors, actions, route, status, contextDetails, receiptDetails);
  element.append(root);

  function clearReceipt() { retained = undefined; receiptDetails.hidden = true; receiptDetails.open = false; generation++; }
  function plan() { return reading.prepare({ client: client.value, conversation: conversation.value }); }
  function render() {
    const prepared = plan();
    open.hidden = prepared.kind !== 'native';
    if (prepared.kind === 'native') open.href = prepared.url; else open.removeAttribute('href');
    open.setAttribute('aria-label', `${label}: ${NAMES[client.value]}, new conversation`);
    copy.textContent = prepared.kind === 'native' ? 'Copy context instead' : 'Copy context';
    copy.disabled = busy; client.disabled = busy; conversation.disabled = busy;
    open.setAttribute('aria-disabled', String(busy));
    route.textContent = prepared.kind === 'native'
      ? `New ${NAMES[client.value]} conversation. Requires the installed app. Review and send the draft there, then ask your questions. If no draft appears, copy the context instead.`
      : conversation.value === 'existing'
        ? 'Copy into the existing conversation you choose inside your Agent. This page cannot attach to its private history.'
        : 'Copy into a new conversation in your Agent. Review and send it there, then ask your questions.';
  }
  function changed() { clearReceipt(); render(); status.textContent = ''; }
  async function record(event, selected, expectedGeneration) {
    if (!evidence) return;
    try {
      const receipt = await reading.receipt({ event, client: selected.client, conversation: selected.conversation, observer: 'visitor-browser' });
      if (destroyed || expectedGeneration !== generation) return;
      retained = receipt; receiptDetails.hidden = false;
      if (onReceipt) {
        void Promise.resolve().then(() => onReceipt(receipt)).catch(() => {
          if (!destroyed && expectedGeneration === generation) status.textContent += ' The receipt callback failed; the local receipt is still available.';
        });
      }
    } catch {
      if (!destroyed && expectedGeneration === generation) status.textContent += ' A receipt is unavailable for this action.';
    }
  }
  listen(client, 'change', changed); listen(conversation, 'change', changed);
  listen(open, 'click', event => {
    if (destroyed || busy || event.defaultPrevented) { event.preventDefault(); return; }
    const selected = plan();
    if (selected.kind !== 'native') { event.preventDefault(); return; }
    clearReceipt();
    const expectedGeneration = generation;
    // Do not await Web Crypto or a callback before the browser's trusted click
    // follows the native URL. There is no hidden launch, timer or auto-retry.
    window.setTimeout(() => {
      if (event.defaultPrevented || destroyed || expectedGeneration !== generation) return;
      status.textContent = `Handoff requested. Check ${NAMES[selected.client]} for the draft. This page cannot confirm whether it arrived.`;
      void record('handoff-requested', selected, expectedGeneration);
    }, 0);
  });
  listen(copy, 'click', async () => {
    if (destroyed || busy) return;
    const selected = plan(); clearReceipt(); const expectedGeneration = generation;
    busy = true; render();
    try {
      try { await window.navigator.clipboard.writeText(reading.context); }
      catch {
        if (destroyed) return;
        contextDetails.open = true; context.focus(); context.select();
        status.textContent = 'Clipboard access is unavailable. Copy the selected context and paste it into your chosen Agent conversation.';
        void record('manual-context-selected', selected, expectedGeneration);
        return;
      }
      if (destroyed) return;
      status.textContent = conversation.value === 'existing'
        ? 'Context copied. Paste into your chosen existing conversation, review and send it, then ask there.'
        : 'Context copied. Paste into a new conversation, review and send it, then ask there.';
      void record('context-copied', selected, expectedGeneration);
    } finally { if (!destroyed) { busy = false; render(); } }
  });
  listen(download, 'click', () => {
    if (!retained || destroyed) return;
    const url = window.URL.createObjectURL(new window.Blob([JSON.stringify(retained, null, 2) + '\n'], { type: 'application/json' }));
    const link = node('a'); link.href = url; link.download = 'agent-reading-receipt.json'; link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  });
  const mounted = Object.freeze({ reading, destroy() {
    if (destroyed) return;
    destroyed = true; generation++; retained = undefined; listeners.forEach(remove => remove()); root.remove(); mounts.delete(element);
  } });
  mounts.set(element, mounted); render();
  return mounted;
}
