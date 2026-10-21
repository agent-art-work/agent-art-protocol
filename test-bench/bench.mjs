import { mountReading } from '/sdk/reading-ui.mjs';

const lane = new URL(location.href).searchParams.get('lane') === 'desktop' ? 'desktop' : 'browser';
const bench = window.bench = { ready: false, lane, requested: [], clipboardCapture: [] };
const labels = { 'claude-app': 'Claude desktop', 'codex-app': 'Codex desktop handler' };
const claimLabels = { 'handoff-requested': 'Native handoff requested', 'draft-arrived': 'Draft arrived', 'context-matches': 'Exact context matches', sent: 'Sent', permission: 'Permission', 'source-access': 'Public index access', completion: 'Visible orientation' };
const error = document.querySelector('#error');
const compareHashes = new Map();
let config, mounted;

function fail(message) { error.textContent = message; error.hidden = false; }
function clearError() { error.hidden = true; error.textContent = ''; }
async function api(url, value) {
  const response = await fetch(url, value === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Bench-Token': config.token }, body: JSON.stringify(value) });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || 'Bench request failed.');
  return result;
}
function element(tag, text) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; }
function render(result) {
  bench.run = result.run;
  bench.summary = result.summary;
  const root = document.querySelector('#results'); root.replaceChildren();
  for (const [key, title] of [['browser', 'Browser observations'], ['realClient', 'Real-client observations']]) {
    const area = element('div'); area.className = 'result-lane'; area.append(element('h3', title));
    const wrapper = element('div'); wrapper.className = 'table-wrap';
    const table = element('table'), head = element('thead'), line = element('tr');
    line.append(element('th', 'Stage'), ...Object.values(labels).map(name => element('th', name))); head.append(line); table.append(head);
    const body = element('tbody');
    const clients = result.summary[key].clients;
    for (const claim of Object.keys(clients['claude-app'])) {
      const row = element('tr'); row.append(element('td', claimLabels[claim]));
      for (const client of Object.keys(labels)) { const cell = element('td', clients[client][claim].status); cell.className = 'status'; row.append(cell); }
      body.append(row);
    }
    table.append(body); wrapper.append(table); area.append(wrapper); root.append(area);
  }
  document.querySelector('#run-id').textContent = `Run ${result.run.id} · ${result.run.startedAt}`;
  const download = document.querySelector('#download'); download.hidden = false; download.href = `/api/runs/${result.run.id}`; download.download = `${result.run.id}.json`;
  history.replaceState(null, '', `${location.pathname}${location.search}#${result.run.id}`);
  for (const id of ['browser-lane', 'desktop-lane']) document.getElementById(id).hash = result.run.id;
}
async function newRun() {
  compareHashes.clear();
  document.querySelector('#draft-compare').value = '';
  document.querySelector('#compare-result').textContent = '';
  document.querySelector('#observation-form').reset();
  render(await api('/api/runs', {})); bench.ready = true; clearError();
  document.querySelector('#new-run').disabled = false;
  document.querySelector('#save-observation').disabled = false;
}
async function append(observation) { clearError(); render(await api(`/api/runs/${bench.run.id}/observations`, observation)); }

document.querySelector('#lane-label').textContent = lane === 'desktop' ? 'Real desktop trial' : 'Browser-only lane';
document.querySelector('#lane-boundary').textContent = lane === 'desktop'
  ? 'Client links are live. Click once, inspect the new draft, then review and send inside the app when testing continuation.'
  : 'Native launches are canceled here. These checks cannot establish desktop arrival, sending, source access or completion.';
document.querySelector(`#${lane}-lane`).setAttribute('aria-current', 'page');
document.querySelector('#observation-panel').hidden = lane !== 'desktop';

// A canceled browser check cannot accidentally reach the OS, create an SDK
// handoff receipt, or establish that a desktop client received the context.
document.querySelector('#reading').addEventListener('click', event => {
  const anchor = event.target.closest('.aap-reading-agent');
  if (!anchor) return;
  if (lane === 'browser') event.preventDefault();
  const entry = { client: anchor.dataset.client, cancelled: event.defaultPrevented, lane, at: new Date().toISOString() };
  bench.requested.push(entry);
  if (lane === 'desktop') queueMicrotask(() => {
    entry.cancelled = event.defaultPrevented;
    if (!entry.cancelled) append({ lane: 'browser', requestedClient: entry.client, claim: 'handoff-requested', status: 'requested', source: 'browser-automation', material: { kind: 'browser-event', ref: 'component-native-click' } }).catch(reason => fail(reason.message));
  });
}, true);

document.querySelector('#new-run').addEventListener('click', () => newRun().catch(reason => fail(reason.message)));
document.querySelector('#observation-form').addEventListener('submit', async event => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const client = form.get('client'), claim = form.get('claim'), status = form.get('status');
  const material = { kind: 'operator-check', method: 'operator-confirmation' };
  if (claim === 'context-matches' && status === 'operator-reported') {
    const match = compareHashes.get(client);
    if (match !== bench.manifest.contextSha256) { fail('Compare the public draft for this client before claiming exact context equality.'); return; }
    material.method = 'operator-pasted-text-sha256'; material.contextSha256 = match;
  }
  const observation = { lane: 'real-client', requestedClient: client, actualSurface: form.get('surface'), claim, status, source: 'operator', material };
  const notes = form.get('notes').trim(); if (notes) observation.notes = notes;
  const button = document.querySelector('#save-observation'); button.disabled = true;
  try { await append(observation); formElement.reset(); }
  catch (reason) { fail(reason.message); }
  finally { button.disabled = false; }
});
document.querySelector('#compare').addEventListener('click', async () => {
  const field = document.querySelector('#draft-compare'), client = document.querySelector('[name=client]').value;
  const bytes = new TextEncoder().encode(field.value);
  field.value = '';
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
  const matches = digest === bench.manifest.contextSha256;
  if (matches) compareHashes.set(client, digest); else compareHashes.delete(client);
  document.querySelector('#compare-result').textContent = `${labels[client]}: ${matches ? 'entered text matches the public context' : 'different entered text'} (${bytes.length} UTF-8 bytes). Text discarded; no observation appended. This is not a raw composer/transport-byte check.`;
});

try {
  config = await api('/api/config');
  bench.manifest = config.manifest; bench.context = config.context;
  document.querySelector('#sdk-version').textContent = config.manifest.sdkVersion;
  document.querySelector('#context').textContent = config.context;
  document.querySelector('#pins').textContent = JSON.stringify({ manifest: config.manifest, source: config.source, environment: config.environment }, null, 2);
  mounted = mountReading(document.querySelector('#reading'), { work: config.work, evidence: false });
  bench.reading = mounted.reading;
  const previous = location.hash.slice(1);
  if (/^reading-[a-zA-Z0-9_-]+$/.test(previous)) {
    const result = await api(`/api/runs/${previous}`);
    if (JSON.stringify(result.run.manifest) !== JSON.stringify(config.manifest)) throw Error('This run has different pinned inputs. Choose New run to test this build.');
    render(result);
  } else await newRun();
  bench.ready = true;
  document.querySelector('#new-run').disabled = false;
  document.querySelector('#save-observation').disabled = false;
} catch (reason) { fail(reason.message); document.querySelector('#new-run').disabled = !config; }
window.addEventListener('pagehide', () => mounted?.destroy(), { once: true });
