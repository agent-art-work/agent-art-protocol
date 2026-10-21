import { createReading } from './reading.mjs';

const NAMES = { 'codex-app': 'ChatGPT', 'claude-app': 'Claude' };
const ABOUT_URL = 'https://agentart.work/ask-your-agent/';
const mounts = new WeakMap();
let nextId = 0;

/** Compact desktop handoff. Discovery, when supplied, belongs to the host. */
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
  const root = node('div', 'aap-reading'); root.dataset.presentation = 'quiet-field';
  const row = node('div', 'aap-reading-row');
  const outline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  outline.classList.add('aap-reading-outline');
  outline.setAttribute('aria-hidden', 'true'); outline.setAttribute('focusable', 'false');
  outline.setAttribute('preserveAspectRatio', 'none');
  const contour = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  contour.setAttribute('vector-effect', 'non-scaling-stroke');
  outline.append(contour);
  const radiusBox = node('span', 'aap-reading-radius-box'); radiusBox.setAttribute('aria-hidden', 'true');
  const radiusProbe = node('span', 'aap-reading-radius-probe'); radiusBox.append(radiusProbe);
  const title = node('a', 'aap-reading-title'); title.href = ABOUT_URL;
  title.title = 'What is Ask your Agent?';
  title.setAttribute('aria-label', `${label} — about this component`);
  const mark = node('span', 'aap-reading-mark'); mark.setAttribute('aria-hidden', 'true');
  const info = node('span', 'aap-reading-info', 'ⓘ'); info.setAttribute('aria-hidden', 'true');
  title.append(mark, node('span', 'aap-reading-label', label), info);
  const actions = node('div', 'aap-reading-actions'); actions.setAttribute('role', 'group'); actions.setAttribute('aria-label', label);
  const apps = node('span', 'aap-reading-apps');
  const copy = node('button', 'aap-reading-copy'); copy.type = 'button'; copy.dataset.state = 'ready';
  copy.setAttribute('aria-label', 'Copy context for any Agent or conversation'); copy.title = 'Copy into any new or existing Agent conversation';
  const copyLabel = node('span', 'aap-reading-copy-label'); copyLabel.setAttribute('aria-hidden', 'true');
  copyLabel.append(node('span', 'aap-reading-copy-ready', 'Copy'), node('span', 'aap-reading-copy-done', 'Copied'));
  const copyIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  copyIcon.classList.add('aap-reading-copy-icon'); copyIcon.setAttribute('viewBox', '0 0 12 12');
  copyIcon.setAttribute('aria-hidden', 'true'); copyIcon.setAttribute('focusable', 'false');
  const readyGlyph = document.createElementNS('http://www.w3.org/2000/svg', 'g'); readyGlyph.classList.add('aap-reading-copy-ready-glyph');
  const rear = document.createElementNS('http://www.w3.org/2000/svg', 'path'); rear.setAttribute('d', 'M7.5 2.5V1.5H1.5V7.5H2.5');
  const front = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  for (const [name, value] of Object.entries({ x: 4.5, y: 4.5, width: 6, height: 6, rx: 1 })) front.setAttribute(name, String(value));
  readyGlyph.append(rear, front);
  const checkGlyph = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  checkGlyph.classList.add('aap-reading-copy-done-glyph'); checkGlyph.setAttribute('d', 'M2 6L4.5 8.5L10 3');
  copyIcon.append(readyGlyph, checkGlyph); copy.append(copyLabel, copyIcon);
  actions.append(apps, copy); row.append(title, actions, radiusBox, outline);
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
  // One contour avoids darker seams from overlapping translucent strokes.
  // Its coordinate system follows the row in CSS pixels, preserving the tiny
  // tail and corner radii when clients, fonts or the host container change.
  function drawOutline() {
    if (destroyed) return;
    const { width, height } = row.getBoundingClientRect();
    if (width < 32 || height < 12) return;
    // Let layout resolve lengths, percentages and calc(), rather than parsing
    // a CSS expression. Watching this probe also catches radius-only changes.
    const measured = radiusProbe.getBoundingClientRect();
    // Keep an eight-pixel straight run between the bottom corner tangents so
    // even a large radius leaves room for the tail without contour overlap.
    const scale = Math.min(1, (width - 9) / (2 * measured.width || 1), (height - 1) / (2 * measured.height || 1));
    const rx = measured.width * scale, ry = measured.height * scale;
    const left = .5, top = .5, right = width - .5, bottom = height - .5;
    const tailLeft = Math.min(Math.max(17, left + rx), right - rx - 8);
    row.style.setProperty('--_reading-tail-left', `${tailLeft}px`);
    outline.setAttribute('viewBox', `0 0 ${width} ${height + 4}`);
    contour.setAttribute('d', `M${left + rx} ${top} H${right - rx} A${rx} ${ry} 0 0 1 ${right} ${top + ry} V${bottom - ry} A${rx} ${ry} 0 0 1 ${right - rx} ${bottom} H${tailLeft + 8} L${tailLeft + 4} ${bottom + 4} L${tailLeft} ${bottom} H${left + rx} A${rx} ${ry} 0 0 1 ${left} ${bottom - ry} V${top + ry} A${rx} ${ry} 0 0 1 ${left + rx} ${top} Z`);
  }
  const outlineObserver = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(drawOutline) : undefined;
  outlineObserver?.observe(row);
  outlineObserver?.observe(radiusProbe);
  if (!outlineObserver) listen(window, 'resize', drawOutline);
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
    for (const id of ids) {
      const plan = reading.prepare({ client: id, conversation: 'fresh' });
      const anchor = node('a', 'aap-reading-agent'); anchor.href = plan.url; anchor.dataset.client = id;
      anchor.setAttribute('aria-describedby', hint.id);
      anchor.setAttribute('aria-label', `Open a new ${NAMES[id]} desktop conversation with this context`);
      anchor.setAttribute('aria-disabled', String(busy));
      anchor.title = `Requires ${NAMES[id]} desktop. Prefill a new conversation; review the app mode and send there.`;
      const arrow = node('span', 'aap-reading-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true');
      anchor.append(node('span', 'aap-reading-agent-name', NAMES[id]), arrow);
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
    drawOutline();
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
  drawOutline();
  const mounted = Object.freeze({ reading, destroy() {
    if (destroyed) return;
    destroyed = true; window.clearTimeout(deadline); window.clearTimeout(copyFeedbackTimer);
    outlineObserver?.disconnect(); generation++; retained = undefined;
    listeners.forEach(remove => remove()); root.remove(); mounts.delete(element);
  } });
  mounts.set(element, mounted);
  return mounted;
}
