/**
 * Read cancellation in a later task, after capture, target and bubble listeners.
 * A microtask can run between native event listeners and is too early for this.
 * This observes cancellation only; an uncanceled event does not prove arrival.
 */
export function afterDispatch(event, callback, setTimer = setTimeout) {
  return setTimer(() => callback(event.defaultPrevented, { isTrusted: event.isTrusted === true }), 0);
}

/** Format only bounded public event facts; never include a URL or event target. */
export function formatHandoffTrace({ client, lane, cancelled, isTrusted }) {
  const publicClient = ['claude-app', 'codex-app'].includes(client) ? client : 'unknown';
  const publicLane = ['browser', 'desktop'].includes(lane) ? lane : 'unknown';
  const flag = value => value === true ? 'true' : value === false ? 'false' : 'unknown';
  return `Last captured client click: ${publicClient} · lane=${publicLane} · cancelled=${flag(cancelled)} · isTrusted=${flag(isTrusted)}. App arrival unverified.`;
}
