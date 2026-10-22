import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterDispatch, formatHandoffTrace } from './after-dispatch.mjs';
import { createBenchServer } from './server.mjs';

for (const phase of ['target', 'bubble']) {
  test(`cancellation by a later ${phase} listener cannot become a requested handoff`, async () => {
    const event = new Event('click', { cancelable: true });
    const requested = [], traces = [];
    const settled = new Promise(resolve => afterDispatch(event, (cancelled, facts) => {
      traces.push(formatHandoffTrace({ client: 'claude-app', lane: 'desktop', cancelled, ...facts }));
      if (!cancelled) requested.push('handoff-requested');
      resolve(cancelled);
    }));
    const target = new EventTarget(), bubble = new EventTarget();
    target.addEventListener('click', current => { if (phase === 'target') current.preventDefault(); });
    bubble.addEventListener('click', current => { if (phase === 'bubble') current.preventDefault(); });

    // Native dispatch may perform a microtask checkpoint before invoking the
    // next listener. This was the old recorder's premature claim boundary.
    let earlyCancellation;
    queueMicrotask(() => { earlyCancellation = event.defaultPrevented; });
    await Promise.resolve();
    assert.equal(earlyCancellation, false);
    assert.deepEqual(requested, []);

    // Model both remaining phases with a checkpoint between them. This is a
    // synthetic dispatch-order regression, not a native-browser qualification.
    target.dispatchEvent(event);
    await Promise.resolve();
    assert.deepEqual(requested, []);
    bubble.dispatchEvent(event);

    assert.equal(await settled, true);
    assert.deepEqual(requested, []);
    assert.deepEqual(traces, ['Last captured client click: claude-app · lane=desktop · cancelled=true · isTrusted=false. App arrival unverified.']);
  });
}

test('an uncanceled event is reported once only after the listener work finishes', async () => {
  const event = new Event('click', { cancelable: true });
  const order = ['capture'];
  const reports = [];
  const settled = new Promise(resolve => afterDispatch(event, cancelled => {
    reports.push(cancelled);
    order.push('after-dispatch');
    resolve();
  }));
  await Promise.resolve();
  order.push('target', 'bubble');
  assert.deepEqual(reports, []);
  await settled;
  assert.deepEqual(reports, [false]);
  assert.deepEqual(order, ['capture', 'target', 'bubble', 'after-dispatch']);
});

test('capture-phase cancellation remains canceled without changing the event', async () => {
  const event = new Event('click', { cancelable: true });
  event.preventDefault();
  const cancelled = await new Promise(resolve => afterDispatch(event, resolve));
  assert.equal(cancelled, true);
  assert.equal(event.defaultPrevented, true);
});

test('settled event facts include the trust flag without retaining target or URL content', async () => {
  const secret = 'private-target-sentinel';
  const event = { defaultPrevented: false, isTrusted: true, target: { textContent: secret }, href: `https://invalid.test/${secret}` };
  const result = await new Promise(resolve => afterDispatch(event, (cancelled, facts) => resolve({ cancelled, ...facts })));
  assert.deepEqual(result, { cancelled: false, isTrusted: true });
  assert.equal(JSON.stringify(result).includes(secret), false);
  assert.equal(formatHandoffTrace({ client: 'claude-app', lane: 'browser', ...result }), 'Last captured client click: claude-app · lane=browser · cancelled=false · isTrusted=true. App arrival unverified.');
});

test('the public trace bounds unexpected values instead of rendering arbitrary content', () => {
  const secret = 'private-input-sentinel';
  const trace = formatHandoffTrace({ client: secret, lane: secret, cancelled: secret, isTrusted: secret, context: secret });
  assert.equal(trace, 'Last captured client click: unknown · lane=unknown · cancelled=unknown · isTrusted=unknown. App arrival unverified.');
  assert.equal(trace.includes(secret), false);
});

test('the bench imports the explicit served after-dispatch module', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-dispatch-test-'));
  const server = createBenchServer({ inputs: {}, storeDir: directory });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const page = await (await fetch(origin)).text();
  assert.match(page, /id="handoff-trace"[^>]*>No client click event captured on this page\./);
  const benchSource = await (await fetch(`${origin}/bench.mjs`)).text();
  const dependency = /import\s*\{[^}]*\bafterDispatch\b[^}]*\}\s*from\s*['"]([^'"]+)['"]/.exec(benchSource);
  assert.ok(dependency, 'the live bench must use the deferred cancellation helper');
  const response = await fetch(new URL(dependency[1], origin));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/javascript/);
  assert.equal(await response.text(), fs.readFileSync(new URL('./after-dispatch.mjs', import.meta.url), 'utf8'));
  assert.equal((await fetch(`${origin}/after-dispatch.test.mjs`)).status, 404);
});
