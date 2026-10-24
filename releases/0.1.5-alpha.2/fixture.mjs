import { mountReading } from '/assets/agent-art-sdk/reading-ui.mjs';
import work from '/assets/agent-art-reading-work.mjs';
window.nativeRequests = []; window.clipboardWrites = [];
Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => window.clipboardWrites.push(text) } });
document.addEventListener('click', event => {
  const a = event.target.closest('a');
  if (!a) return;
  if (/^(claude|codex):/.test(a.href)) { event.preventDefault(); window.nativeRequests.push({ client: a.dataset.client, canceled: true }); }
  if (a.classList.contains('aap-reading-title')) event.preventDefault();
}, true);
window.component = mountReading(document.querySelector('#reading'), { work, evidence: false });
window.work = work;
