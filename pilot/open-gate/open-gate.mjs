const mounts = new WeakMap();
const names = { 'codex-app': 'ChatGPT', 'claude-app': 'Claude' };

async function localDiscovery(window) {
  if (window.location.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)) throw new Error('Local discovery is unavailable.');
  const endpoint = new URL('/__aap/desktop-clients.mjs', window.location.origin).href;
  return (await import(/* @vite-ignore */ endpoint)).default;
}

/** Preview presentation using the unchanged headless reading SDK. */
export function mountOpenGate(element, { createReading, label = 'Ask your Agent', evidence = false, onReceipt, discoverClients, ...options }) {
  if (!element?.ownerDocument || typeof createReading !== 'function') throw new TypeError('Choose a host and the installed SDK createReading function.');
  if (mounts.has(element)) throw new TypeError('Agent links are already mounted here.');
  const reading = createReading(options);
  const document = element.ownerDocument;
  const window = document.defaultView;
  const node = (tag, className, text) => { const item = document.createElement(tag); if (className) item.className = className; if (text !== undefined) item.textContent = text; return item; };
  const root = node('div', 'aap-gate'); root.dataset.presentation = 'seal';
  const row = node('div', 'aap-gate-row');
  const title = node('span', 'aap-gate-title');
  const mark = node('span', 'aap-gate-mark'); mark.setAttribute('aria-hidden', 'true'); mark.append(node('b'));
  title.append(mark, node('span', 'aap-gate-label', label));
  const actions = node('div', 'aap-gate-actions'); actions.setAttribute('role', 'group'); actions.setAttribute('aria-label', label);
  const apps = node('span', 'aap-gate-apps');
  const copy = node('button', 'aap-gate-copy', 'Copy'); copy.type = 'button'; copy.setAttribute('aria-label', 'Copy context for any Agent or conversation'); copy.title = 'Copy into any new or existing Agent conversation';
  const copyIcon = node('span', 'aap-gate-copy-icon'); copyIcon.setAttribute('aria-hidden', 'true'); copy.append(copyIcon);
  actions.append(apps, copy); row.append(title, actions);
  const hint = node('p', 'aap-gate-hint', 'Checking desktop Agents. Copy is always available.');
  const status = node('p', 'aap-gate-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const context = node('textarea', 'aap-gate-context'); context.readOnly = true; context.rows = 6; context.hidden = true; context.value = reading.context; context.setAttribute('aria-label', 'Context to copy into your Agent');
  const download = node('button', 'aap-gate-download', 'Download handoff receipt'); download.type = 'button'; download.hidden = true;
  root.append(row, hint, status, context, download); element.append(root);
  let destroyed = false, busy = false, generation = 0, retained;
  const listeners = [];
  const listen = (target, event, callback) => { target.addEventListener(event, callback); listeners.push(() => target.removeEventListener(event, callback)); };
  function clearReceipt() { generation++; retained = undefined; download.hidden = true; }
  async function recordNative(client, expected) {
    if (!evidence) return;
    try {
      const receipt = await reading.receipt({ event: 'handoff-requested', client, conversation: 'fresh', observer: 'visitor-browser' });
      if (destroyed || generation !== expected) return;
      retained = receipt; download.hidden = false;
      if (onReceipt) void Promise.resolve().then(() => onReceipt(receipt)).catch(() => {});
    } catch { if (!destroyed && generation === expected) status.textContent += ' A receipt is unavailable.'; }
  }
  listen(copy, 'click', async () => {
    if (busy || destroyed) return;
    busy = true; copy.disabled = true; clearReceipt();
    try {
      try { await window.navigator.clipboard.writeText(reading.context); }
      catch {
        if (destroyed) return;
        context.hidden = false; context.focus(); context.select();
        status.textContent = 'Copy the selected context into any new or existing Agent conversation.';
        return;
      }
      if (!destroyed) status.textContent = 'Context copied. Paste it into any new or existing Agent conversation.';
    } finally { if (!destroyed) { busy = false; copy.disabled = false; } }
  });
  listen(download, 'click', () => {
    if (!retained || destroyed) return;
    const url = window.URL.createObjectURL(new window.Blob([JSON.stringify(retained, null, 2) + '\n'], { type: 'application/json' }));
    const anchor = node('a'); anchor.href = url; anchor.download = 'agent-reading-receipt.json'; anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  });
  let deadline;
  void Promise.race([
    Promise.resolve().then(() => discoverClients ? discoverClients() : localDiscovery(window)),
    new Promise((_, reject) => { deadline = window.setTimeout(() => reject(new Error('Discovery timed out.')), 2500); }),
  ]).then(snapshot => {
    if (destroyed) return;
    if (snapshot?.scope !== 'loopback-preview-host' || !Array.isArray(snapshot.clients)) throw new Error('No local discovery.');
    const ids = Object.keys(names).filter(id => snapshot.clients.some(client => client?.id === id) && reading.clients.includes(id));
    for (const id of ids) {
      const plan = reading.prepare({ client: id, conversation: 'fresh' });
      if (plan.kind !== 'native') continue;
      const anchor = node('a', 'aap-gate-agent', names[id]); anchor.href = plan.url; anchor.dataset.client = id;
      anchor.setAttribute('aria-label', `Open a new ${names[id]} desktop conversation with this context`);
      anchor.title = `Prefill a new ${names[id]} desktop conversation. Review the app mode and send there.`;
      const arrow = node('span', 'aap-gate-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true'); anchor.append(arrow);
      listen(anchor, 'click', event => {
        if (destroyed || event.defaultPrevented) return;
        clearReceipt(); const expected = generation;
        window.setTimeout(() => {
          if (destroyed || event.defaultPrevented || generation !== expected) return;
          status.textContent = `Handoff requested. Review and send inside ${names[id]}. This page cannot confirm arrival.`;
          void recordNative(id, expected);
        }, 0);
      });
      apps.append(anchor);
    }
    hint.textContent = apps.children.length ? 'Detected on this Mac. Desktop links prefill a new conversation; review the app mode and send there. Copy works in any conversation.' : 'No supported desktop apps were detected. Copy works in any Agent conversation.';
  }).catch(() => { if (!destroyed) hint.textContent = 'Desktop app detection is unavailable. Copy works in any Agent conversation.'; }).finally(() => window.clearTimeout(deadline));
  const result = Object.freeze({ reading, destroy() {
    if (destroyed) return;
    destroyed = true; window.clearTimeout(deadline); generation++; retained = undefined; listeners.forEach(remove => remove()); root.remove(); mounts.delete(element);
  } });
  mounts.set(element, result);
  return result;
}
