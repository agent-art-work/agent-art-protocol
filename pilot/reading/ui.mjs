import { createRecord, seal, verify } from '/__bridge/protocol/index.mjs';

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export async function mountReadingBridge({ element, apiBase = '/__bridge/api', appLabel = 'this site' }) {
  if (!element || element.dataset.bridgeMounted) return;
  element.dataset.bridgeMounted = 'true';
  element.classList.add('reading-bridge');
  if (!document.querySelector('link[data-reading-bridge]')) {
    const style = node('link'); style.rel = 'stylesheet'; style.href = '/__bridge/ui.css'; style.dataset.readingBridge = ''; document.head.append(style);
  }
  element.innerHTML = `
    <p class="rb-label">Local handoff preview</p>
    <h2 class="rb-heading">Read the Lab in your Agent.</h2>
    <p class="rb-intro"></p>
    <div class="rb-controls">
      <label for="rb-client">Your Agent</label>
      <select id="rb-client" disabled></select>
      <label for="rb-conversation">Where to continue</label>
      <select id="rb-conversation" disabled>
        <option value="fresh">New conversation</option>
        <option value="existing">Existing conversation</option>
      </select>
      <p class="rb-route"></p>
      <p class="rb-next"></p>
      <div class="rb-actions"><button type="button" class="rb-open" disabled>Open your Agent ↗</button><button type="button" class="rb-copy-button" disabled>Copy context</button></div>
    </div>
    <p class="rb-status" role="status" aria-live="polite">Checking installed desktop routes…</p>
    <details class="rb-context"><summary>Context carried to your Agent</summary><p>The public Lab index and reading policy. No question or private conversation history.</p><textarea class="rb-context-text" aria-label="Lab context to copy into your Agent" rows="9" readonly></textarea></details>
    <details class="rb-evidence" hidden><summary>Handoff evidence</summary><p class="rb-evidence-summary"></p><button type="button" class="rb-download">Download evidence</button></details>
    <p class="rb-limit">Ask and continue inside your Agent. Questions and answers stay there; this page receives no reading result.</p>
  `;
  const find = selector => element.querySelector(selector);
  find('.rb-intro').textContent = `Bring ${appLabel} context into your Agent, then ask your questions there.`;
  const clients = find('#rb-client'); const conversation = find('#rb-conversation');
  const open = find('.rb-open'); const copy = find('.rb-copy-button');
  const status = find('.rb-status'); const context = find('.rb-context-text');
  let config; let busy = false; let request; let evidence;
  async function showEvidence(record) {
    const report = await verify(record);
    evidence = record;
    find('.rb-evidence').hidden = false;
    find('.rb-evidence-summary').textContent = `This record identifies the offered context and the observed handoff event. It contains no questions or answers. ${report.checks.find(check => check.claim === 'record-integrity')?.status === 'supported' ? 'Its local integrity check passed.' : 'Its integrity could not be established.'} It does not establish that an Agent read the Lab.`;
  }
  async function recordCopy(event) {
    await showEvidence(await seal(createRecord({ work: config.work, observations: [{
      id: crypto.randomUUID(), observer: 'visitor-browser', event, subjects: [config.work.id],
      material: { client: clients.value, conversation: conversation.value, context: 'reading-invitation', observedAt: new Date().toISOString() },
      trust: ['The visitor browser is trusted for this local observation.'],
      limits: ['No paste, send, model exposure, reading or answer was observed.', 'This is a local browser statement, not an independently authenticated witness.'],
    }] })));
  }
  find('.rb-download').addEventListener('click', () => {
    if (!evidence) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2) + '\n'], { type: 'application/json' }));
    const link = node('a'); link.href = url; link.download = 'lab-handoff-evidence.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  async function api(route, options = {}) {
    const response = await fetch(`${apiBase}${route}`, { ...options, headers: { 'Content-Type': 'application/json', ...(config?.key ? { 'x-bridge-key': config.key } : {}), ...options.headers } });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error?.message || 'This step could not be completed.');
    return value;
  }
  const chosen = () => config?.clients.find(item => item.id === clients.value);
  function renderRoute() {
    const client = chosen(); const existing = conversation.value === 'existing';
    const native = !existing && !!client?.available;
    open.hidden = !native;
    open.textContent = client ? `Open ${client.name} ↗` : 'Open your Agent ↗';
    open.disabled = busy; copy.disabled = busy;
    clients.disabled = busy; conversation.disabled = busy;
    copy.textContent = native ? 'Copy context instead' : 'Copy context';
    find('.rb-route').textContent = existing
      ? 'Existing conversation · manual paste. Choose the conversation yourself inside your Agent; this page cannot attach to it.'
      : native
        ? 'New conversation · prepared draft. Your existing conversations are not continued.'
        : 'New conversation · manual paste. Open a new conversation in your Agent, then paste the context.';
    find('.rb-next').textContent = native
      ? `Opens the installed ${client.name}. Review and send the Lab context there, then ask your question. Nothing is sent automatically.`
      : existing
        ? 'Copy the Lab context, switch to your chosen conversation, review and send it, then ask there.'
        : `${client?.detail ? `${client.detail} ` : ''}Copy the Lab context and continue in a client that can fetch public web documents.`;
  }
  function changed() { request = undefined; evidence = undefined; find('.rb-evidence').hidden = true; renderRoute(); status.textContent = 'Ready. Choose where to continue, then open your Agent or copy the context.'; }
  clients.addEventListener('change', changed); conversation.addEventListener('change', changed);
  copy.addEventListener('click', async () => {
    if (busy) return;
    evidence = undefined; find('.rb-evidence').hidden = true;
    busy = true; renderRoute();
    try {
      try { await navigator.clipboard.writeText(config.context); }
      catch {
        find('.rb-context').open = true; context.focus(); context.select();
        status.textContent = 'Clipboard access is unavailable. Copy the selected context below and paste it into your chosen Agent conversation.';
        try { await recordCopy('manual-context-selected'); } catch { status.textContent += ' Evidence is unavailable for this action.'; }
        return;
      }
      status.textContent = conversation.value === 'existing'
        ? 'Context copied. Paste it into your chosen existing conversation. Review and send it, then ask there.'
        : 'Context copied. Paste it into a new conversation in your Agent. Review and send it, then ask there.';
      try { await recordCopy('context-copied'); } catch { status.textContent += ' Evidence is unavailable for this action.'; }
    } finally {
      busy = false; renderRoute();
    }
  });
  open.addEventListener('click', async () => {
    const client = chosen();
    if (busy || conversation.value !== 'fresh' || !client?.available) return;
    evidence = undefined; find('.rb-evidence').hidden = true;
    request ??= { id: crypto.randomUUID(), client: client.id };
    busy = true; renderRoute(); status.textContent = `Requesting a new conversation in ${client.name}…`;
    try {
      const opened = await api('/open', { method: 'POST', body: JSON.stringify({ client: request.client, conversation: 'fresh', consent: true, requestId: request.id }) });
      let evidenceAvailable = false;
      try { await showEvidence(opened.evidence); evidenceAvailable = true; } catch { /* Opening is separate from evidence availability. */ }
      status.textContent = `Open request sent to ${client.name}. Check for the Lab context draft there, review and send it, then ask your question. If it did not arrive, use Copy context instead.`;
      if (!evidenceAvailable) status.textContent += ' Evidence is unavailable for this action.';
      request = undefined;
    } catch (error) { status.textContent = `${error.message} Use Copy context instead. No automatic retry was made.`; }
    finally { busy = false; renderRoute(); }
  });
  try {
    config = await api('/config'); context.value = config.context;
    for (const client of config.clients) {
      const option = node('option', '', `${client.name}${client.available ? ' · installed' : ' · copy context'}`);
      option.value = client.id; clients.append(option);
    }
    const other = node('option', '', 'Another Agent · copy context'); other.value = 'copy'; clients.append(other);
    clients.value = config.clients.find(client => client.available)?.id || 'copy';
    renderRoute(); status.textContent = 'Ready. Opening prepares a draft; you review and send it inside your Agent.';
  } catch {
    status.textContent = 'The local bridge is unavailable. Use the original copy prompt below.';
  }
}
