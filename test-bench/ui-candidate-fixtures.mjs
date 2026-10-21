/** Candidate observer lifecycle checks. Public synthetic Work; no native clicks. */
export async function checkCandidateUI() {
  const [{ mountReading }, { default: work }] = await Promise.all([
    import('/assets/agent-art-sdk/reading-ui.mjs'), import('/assets/agent-art-reading-work.mjs'),
  ]);
  const NativeResizeObserver = window.ResizeObserver;
  const observers = [], host = document.createElement('section');
  document.body.append(host);
  const waitFrames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  class TrackedResizeObserver {
    constructor(callback) {
      this.callback = callback; this.observed = []; this.disconnected = false;
      this.native = new NativeResizeObserver((entries, observer) => callback(entries, observer));
      observers.push(this);
    }
    observe(target, options) { this.observed.push(target); this.native.observe(target, options); }
    unobserve(target) { this.native.unobserve(target); }
    disconnect() { this.disconnected = true; this.native.disconnect(); }
  }
  let mounted;
  try {
    assert(typeof NativeResizeObserver === 'function', 'ResizeObserver is available');
    window.ResizeObserver = TrackedResizeObserver;
    mounted = mountReading(host, { work }); await waitFrames();
    const first = observers[0], row = host.querySelector('.aap-reading-row'), path = host.querySelector('.aap-reading-outline path');
    assert(first && first.observed.length === 2 && first.observed.includes(row), 'row and radius probe are observed');
    assert(path.getAttribute('d')?.endsWith('Z'), 'initial contour is drawn');
    const before = path.getAttribute('d');
    mounted.destroy();
    assert(first.disconnected && !host.children.length, 'destroy disconnects the observer and removes the component');
    row.style.width = '150px';
    first.callback([], first); // Simulate an already queued delivery after teardown.
    await waitFrames();
    assert(path.getAttribute('d') === before, 'queued observer delivery cannot update a destroyed contour');
    mounted = mountReading(host, { work }); await waitFrames();
    assert(observers.length === 2 && observers[1].observed.length === 2, 'remount creates one fresh observer for both targets');
    assert(host.querySelector('.aap-reading-outline path').getAttribute('d')?.endsWith('Z'), 'remounted contour draws');
    mounted.destroy(); mounted = undefined;
    assert(observers.every(observer => observer.disconnected) && !host.children.length, 'all owned observers disconnect');
    return { passed: true, results: [{ name: 'outline observer disconnects, suppresses queued delivery and permits remount', passed: true }], boundary: 'Synthetic observer instrumentation with real browser layout. No native Agent activation, clipboard access or source fetch.' };
  } catch (error) {
    return { passed: false, results: [{ name: 'outline observer disconnects, suppresses queued delivery and permits remount', passed: false, error: error.message }] };
  } finally {
    mounted?.destroy(); observers.forEach(observer => observer.disconnect());
    window.ResizeObserver = NativeResizeObserver; host.remove();
  }
}
