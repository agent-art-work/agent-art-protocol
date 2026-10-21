/** Focused 0.1.4 feedback checks. Clipboard and 3000ms feedback timers are isolated. */
export async function checkFeedbackUI() {
  const [{ mountReading }, { default: work }] = await Promise.all([
    import('/assets/agent-art-sdk/reading-ui.mjs'), import('/assets/agent-art-reading-work.mjs'),
  ]);
  const originalTimeout = window.setTimeout, originalClear = window.clearTimeout;
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const timers = [], results = [], frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const clipboard = writeText => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  const bounds = element => {
    const { left, top, width, height, right, bottom } = element.getBoundingClientRect();
    return { left, top, width, height, right, bottom };
  };
  const sameRect = (a, b) => ['left', 'top', 'width', 'height'].every(key => Math.abs(a[key] - b[key]) < .02);
  window.setTimeout = (callback, delay, ...args) => {
    if (delay !== 3000) return originalTimeout.call(window, callback, delay, ...args);
    const timer = { id: 900000 + timers.length, callback: () => callback(...args), delay, cleared: false };
    timers.push(timer); return timer.id;
  };
  window.clearTimeout = id => {
    const timer = timers.find(item => item.id === id);
    if (timer) timer.cleared = true; else originalClear.call(window, id);
  };
  const latest = () => timers.at(-1);
  const fire = timer => { assert(!!timer, 'success creates a 3000ms timer'); timer.callback(); };
  let mounted, host;
  try {
    for (const width of [257, 265]) {
      host = document.createElement('section'); host.style.width = `${width}px`;
      document.body.append(host); mounted = mountReading(host, { work });
      const root = host.querySelector('.aap-reading'), row = root.querySelector('.aap-reading-row');
      const copy = root.querySelector('.aap-reading-copy'), status = root.querySelector('.aap-reading-status');
      const announcement = root.querySelector('.aap-reading-announcement');
      const below = document.createElement('div'); below.textContent = 'Content below the component'; host.append(below);
      const capture = () => ({ state: copy.dataset.state, row: bounds(row), root: bounds(root), below: bounds(below), controls: [...row.querySelectorAll('a,button')].map(bounds) });
      const unchanged = (before, after) => sameRect(before.row, after.row) && sameRect(before.root, after.root) && sameRect(before.below, after.below) && before.controls.every((rect, index) => sameRect(rect, after.controls[index]));
      const assertState = state => {
        assert(copy.dataset.state === state, `Copy state is ${state}`);
        const visible = state === 'copied' ? '.aap-reading-copy-done' : '.aap-reading-copy-ready';
        const invisible = state === 'copied' ? '.aap-reading-copy-ready' : '.aap-reading-copy-done';
        assert(getComputedStyle(copy.querySelector(visible)).opacity === '1' && getComputedStyle(copy.querySelector(invisible)).opacity === '0', 'only the selected label state is visible');
        const glyph = state === 'copied' ? '.aap-reading-copy-done-glyph' : '.aap-reading-copy-ready-glyph';
        assert(getComputedStyle(copy.querySelector(glyph)).opacity === '1', 'the selected SVG glyph is visible');
      };
      const settle = async () => { await frame(); assert(!copy.disabled, 'clipboard action settles'); };
      const clickSuccess = async () => { clipboard(async () => {}); copy.click(); await settle(); assertState('copied'); };
      await frame();
      assertState('ready');
      const initial = capture();
      assert(Math.abs(initial.root.width - width) < .02, 'requested narrow container is retained');
      assert(initial.controls.every(rect => rect.left >= initial.row.left && rect.right <= initial.row.right && rect.height >= 44), 'all controls fit and retain coarse touch targets');
      const svg = copy.querySelector('svg.aap-reading-copy-icon');
      assert(svg && svg.getAttribute('viewBox') === '0 0 12 12' && bounds(svg).width === 12 && bounds(svg).height === 12, 'Copy uses the 12px SVG glyph');
      assert(copy.querySelector('.aap-reading-copy-label').getAttribute('aria-hidden') === 'true' && svg.getAttribute('aria-hidden') === 'true', 'visual states are decorative within the named button');
      assert(copy.getAttribute('aria-label') === 'Copy context for any Agent or conversation', 'Copy accessible name is stable');
      assert(announcement?.getAttribute('role') === 'status' && announcement.getAttribute('aria-live') === 'polite' && announcement.getAttribute('aria-atomic') === 'true', 'dedicated polite atomic announcer exists');
      const announceRect = bounds(announcement), announceStyle = getComputedStyle(announcement);
      assert(announceRect.width <= 1 && announceRect.height <= 1 && announceStyle.position === 'absolute', 'success announcer is visually hidden');
      for (const anchor of root.querySelectorAll('.aap-reading-agent')) {
        assert(getComputedStyle(anchor).textDecorationLine === 'none', 'native anchor does not propagate underlining to its arrow');
        assert(getComputedStyle(anchor.querySelector('.aap-reading-agent-name')).textDecorationLine.includes('underline'), 'native name is underlined');
        assert(getComputedStyle(anchor.querySelector('.aap-reading-arrow')).textDecorationLine === 'none', 'native arrow is unadorned');
      }
      await clickSuccess(); const success = capture(), first = latest();
      assert(announcement.textContent.trim().length > 0 && !status.textContent && !status.getClientRects().length, 'success announces without a visible paragraph');
      assert(unchanged(initial, success), 'success causes no control, row or below-content movement');
      fire(first); await frame(); assertState('ready'); const reset = capture();
      assert(unchanged(initial, reset), 'reset preserves component and below-content geometry');
      await clickSuccess(); const second = latest();
      await clickSuccess(); const repeatedTimer = latest(), repeated = capture();
      assert(second !== repeatedTimer && second.cleared && repeatedTimer.delay === 3000, 'repeat copy starts a fresh three-second timer');
      fire(second); assertState('copied'); // A cleared callback may already be queued.
      assert(unchanged(initial, repeated), 'repeat success preserves component and below-content geometry');
      fire(repeatedTimer); await frame(); assertState('ready');
      results.push({ name: `${width}px container keeps Copy/Copied/reset/repeat geometry stable`, passed: true, initial, success, reset, repeated });
      if (width === 257) {
        await clickSuccess(); const prior = latest();
        let resolveClipboard;
        clipboard(() => new Promise(resolve => { resolveClipboard = resolve; }));
        copy.click();
        assertState('ready'); assert(copy.disabled && prior.cleared, 'pending attempt immediately invalidates previous success and timer');
        assert(!announcement.textContent, 'pending attempt clears prior success announcement');
        fire(prior); assertState('ready');
        resolveClipboard(); await settle(); assertState('copied'); const pendingSuccess = latest();
        fire(prior); assertState('copied');
        fire(pendingSuccess); await frame(); assertState('ready');
        results.push({ name: 'pending copy invalidates old timer and suppresses queued success reset', passed: true });
        await clickSuccess(); const deniedPrior = latest();
        clipboard(async () => { throw new DOMException('Synthetic denial', 'NotAllowedError'); });
        copy.click(); await settle(); assertState('ready');
        const text = root.querySelector('.aap-reading-text');
        assert(deniedPrior.cleared && !text.hidden && text.readOnly && text.value === mounted.reading.context, 'denial clears success and exposes exact manual fallback');
        assert(document.activeElement === text && text.selectionStart === 0 && text.selectionEnd === text.value.length, 'denied Copy selects exact fallback text');
        assert(!!status.textContent && !!status.getClientRects().length && !announcement.textContent, 'fallback remains visible and has no stale success announcement');
        results.push({ name: 'denial preserves visible exact selected manual fallback', passed: true });
        await clickSuccess(); const teardownTimer = latest();
        mounted.destroy(); mounted = undefined;
        const state = copy.dataset.state, spoken = announcement.textContent;
        assert(teardownTimer.cleared && !root.isConnected, 'destroy cancels its feedback timer');
        fire(teardownTimer); await frame();
        assert(copy.dataset.state === state && announcement.textContent === spoken && !root.isConnected, 'queued feedback callback has no effect after destroy');
        results.push({ name: 'destroy clears feedback timer and ignores queued delivery', passed: true });
      }
      mounted?.destroy(); mounted = undefined; host.remove(); host = undefined;
    }
    return { passed: true, results, feedbackDelayMs: 3000, timersCreated: timers.length, boundary: 'Synthetic browser layout at 257px and 265px available widths. Clipboard writes and three-second timer callbacks are stubbed; no native Agent launch or inference.' };
  } catch (error) {
    results.push({ name: '0.1.4 feedback acceptance', passed: false, error: error.message });
    return { passed: false, results, feedbackDelayMs: 3000 };
  } finally {
    mounted?.destroy(); host?.remove();
    window.setTimeout = originalTimeout; window.clearTimeout = originalClear;
    if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor); else delete navigator.clipboard;
  }
}
