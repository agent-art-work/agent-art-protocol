// Browser-only checks of the pinned Lab reading handoff. Never launches a native Agent.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createBenchServer } from './server.mjs';
import { loadBenchInputs } from './inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app';
const SCHEMA = 'agent-art.reading-bench.browser.v1';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const assert = (condition, message) => { if (!condition) throw Error(message); };
const exited = child => child.exitCode !== null || child.signalCode !== null;

export function verifyStableChrome() {
  const result = spawnSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleIdentifier', `${CHROME}/Contents/Info.plist`], { encoding: 'utf8', shell: false });
  assert(result.status === 0 && result.stdout.trim() === 'com.google.Chrome', 'Regular stable Chrome could not be verified. Restore regular Chrome access; no other browser is allowed.');
  const executable = `${CHROME}/Contents/MacOS/Google Chrome`;
  assert(fs.existsSync(executable), 'The verified regular Chrome executable is unavailable.');
  return executable;
}

// Pure checks are exported so negative evidence cases can be tested without opening a browser.
export function assessBrowserSnapshot(actual, coarse) {
  const expectedClients = ['codex-app', 'claude-app'];
  return {
    browserLane: actual.lane === 'browser',
    configuredRoutes: JSON.stringify(actual.apps?.map(app => app.client)) === JSON.stringify(expectedClients),
    exactNativePayloads: actual.apps?.length === 2 && actual.apps.every(app => app.exact && app.onlyContextParameter && app.expectedRoute),
    aboutIsSeparate: actual.about?.tag === 'A' && actual.about.href === 'https://agentart.work/ask-your-agent/' && actual.about.info && actual.about.separate,
    copyVisible: actual.copyVisible === true,
    oneLine: actual.oneLine === true,
    insideFrame: actual.withinBackground === true,
    withinViewport: actual.withinViewport === true && actual.noOverflow === true,
    pointerTargets: actual.minHeight >= (coarse ? 44 : 32) && actual.coarse === coarse,
    exactRetainedContext: actual.contextMatches === true && actual.contextBytes > 0,
    noEnrollmentOrCallback: actual.noEnrollmentOrCallback === true,
    noPersistentReceipt: actual.receiptHidden === true,
  };
}

export const browserSetupScript = `(() => {
  window.__benchClipboardCapture = [];
  window.__benchDenyClipboard = false;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async text => {
      if (window.__benchDenyClipboard) throw new DOMException('Test clipboard denial', 'NotAllowedError');
      window.__benchClipboardCapture.push(text);
    }
  }});
  window.__benchNativeGuard = [];
  // Last-resort cancellation also records whether the bench canceled first.
  // This catches a broken browser lane without ever reaching the OS handler.
  window.addEventListener('click', event => {
    const anchor = event.target.closest?.('a');
    if (!anchor || !/^(codex|claude):/i.test(anchor.href)) return;
    window.__benchNativeGuard.push({ client: anchor.dataset.client, cancelledByBench: event.defaultPrevented });
    event.preventDefault();
  });
})()`;

function connectCDP(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    const listeners = new Set();
    let sequence = 0;
    const opened = setTimeout(() => { socket.close(); reject(Error('Timed out opening owned Chrome target.')); }, 10000);
    socket.onerror = () => { clearTimeout(opened); reject(Error('Owned Chrome debugging connection failed.')); };
    socket.onclose = () => {
      for (const item of pending.values()) { clearTimeout(item.timer); item.reject(Error('Chrome target closed.')); }
      pending.clear();
    };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const item = pending.get(message.id); pending.delete(message.id); clearTimeout(item.timer);
        if (message.error) item.reject(Error(JSON.stringify(message.error))); else item.resolve(message.result);
      }
      if (message.method) for (const listener of listeners) listener(message);
    };
    socket.onopen = () => {
      clearTimeout(opened);
      const send = (method, params = {}) => new Promise((resolveCall, rejectCall) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); rejectCall(Error(`Chrome command timed out: ${method}`)); }, 10000);
        pending.set(id, { resolve: resolveCall, reject: rejectCall, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
      const evaluate = async expression => {
        const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        return result.result.value;
      };
      resolve({ send, evaluate, listen: listener => listeners.add(listener), close: () => socket.close() });
    };
  });
}

async function waitFor(check, message) {
  for (let index = 0; index < 150; index++) { if (await check()) return; await pause(50); }
  throw Error(message);
}

const snapshotScript = `(() => {
  const bench = window.bench, root = document.querySelector('.aap-reading');
  const row = root.querySelector('.aap-reading-row'), identity = root.querySelector('.aap-reading-title');
  const controls = [...root.querySelectorAll('a,button')].filter(item => item.getClientRects().length);
  const bounds = item => { const r = item.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
  const rect = bounds(row), title = bounds(identity), context = root.querySelector('.aap-reading-text').value;
  const encoded = new TextEncoder().encode(context);
  // The public reading frame has handoff only; no enrollment, callback or contribution records.
  const reading = bench.reading?.reading || bench.reading;
  const frame = reading?.frame;
  const work = reading?.work;
  return {
    lane: bench.lane || new URL(location.href).searchParams.get('lane'),
    about: { tag: identity.tagName, href: identity.href, info: identity.textContent.includes('ⓘ'), separate: !identity.classList.contains('aap-reading-agent') },
    row: rect, container: bounds(root), coarse: matchMedia('(pointer: coarse)').matches,
    controls: controls.map(item => ({ text: item.textContent, rect: bounds(item) })),
    apps: [...root.querySelectorAll('.aap-reading-agent')].map(item => {
      const url = new URL(item.href), client = item.dataset.client, parameter = client === 'codex-app' ? 'prompt' : 'q';
      return { client, exact: url.searchParams.get(parameter) === context,
        onlyContextParameter: [...url.searchParams.keys()].join(',') === parameter,
        expectedRoute: client === 'codex-app' ? url.protocol === 'codex:' && url.hostname === 'new' : url.protocol === 'claude:' && url.hostname === 'claude.ai' && url.pathname === '/new' };
    }),
    oneLine: controls.every(item => { const r = bounds(item); return Math.abs(r.top + r.height/2 - title.top - title.height/2) < 1; }),
    withinBackground: controls.every(item => { const r = bounds(item); return r.left >= rect.left && r.right <= rect.right && r.top >= rect.top && r.bottom <= rect.bottom; }),
    withinViewport: controls.every(item => { const r = bounds(item); return r.left >= 0 && r.right <= innerWidth; }),
    noOverflow: document.documentElement.scrollWidth <= innerWidth,
    minHeight: Math.min(...controls.map(item => bounds(item).height)),
    copyVisible: !!root.querySelector('.aap-reading-copy').getClientRects().length,
    contextMatches: context === bench.context,
    contextBytes: encoded.length,
    noEnrollmentOrCallback: !!work && JSON.stringify(work.capabilities) === JSON.stringify(['handoff']) && (!frame || (!frame.participants?.length && !frame.acts?.length && !frame.relations?.length)),
    receiptHidden: root.querySelector('.aap-reading-download').hidden,
    before: { requests: bench.requested.length, clipboard: window.__benchClipboardCapture.length },
  };
})()`;

export async function runBrowserChecks({ inputs, outputDir } = {}) {
  inputs ||= await loadBenchInputs();
  const executable = verifyStableChrome();
  const id = new Date().toISOString().replace(/[:.]/g, '-');
  outputDir = path.resolve(outputDir || path.join(ROOT, '.local/test-bench/browser', id));
  fs.mkdirSync(outputDir, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-reading-bench-'));
  const profile = path.join(temporary, 'profile');
  const server = createBenchServer({ inputs, storeDir: path.join(temporary, 'runs') });
  const runs = [];
  const report = {
    schema: SCHEMA, lane: 'browser', id, startedAt: new Date().toISOString(),
    manifest: inputs.manifest,
    environment: { platform: process.platform, architecture: process.arch, node: process.version },
    browser: { application: 'Google Chrome stable', bundleId: 'com.google.Chrome', identityVerifiedBeforeLaunch: true, disposableOwnedProfile: true },
    realClientResults: 'not-run', screenshotInspection: 'pending', runs,
    limits: ['Synthetic browser interaction only; native links canceled before OS launch.', 'Clipboard is isolated and stubbed; it never reads or writes the operating system clipboard.', 'No real-client arrival, conversation destination, Send, source reading, model execution or comprehension is established.', 'No callback, THOUGHT participation, registry publication or deployment is tested.'],
  };
  let chrome, active;
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    chrome = spawn(executable, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', 'about:blank'], { stdio: 'ignore', shell: false });
    let launchError;
    chrome.once('error', error => { launchError = error; });
    let debuggingPort;
    await waitFor(async () => {
      if (launchError) throw Error('The verified regular Chrome executable could not be launched.');
      if (exited(chrome)) throw Error('Owned regular Chrome exited before startup.');
      try { debuggingPort = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; return /^\d+$/.test(debuggingPort); } catch { return false; }
    }, 'Owned regular Chrome did not start.');
    const debugging = `http://127.0.0.1:${debuggingPort}`;
    const version = await (await fetch(debugging + '/json/version')).json();
    report.browser.version = version.Browser;
    for (const scenario of [
      { width: 1440, height: 1000, theme: 'light', coarse: false },
      { width: 1440, height: 1000, theme: 'dark', coarse: false },
      { width: 320, height: 900, theme: 'light', coarse: true },
      { width: 390, height: 844, theme: 'dark', coarse: true },
    ]) {
      const page = await (await fetch(debugging + '/json/new', { method: 'PUT' })).json();
      active = await connectCDP(page.webSocketDebuggerUrl);
      const { send, evaluate } = active;
      const network = [], blocked = [], errors = [];
      active.listen(message => {
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
        if (message.method === 'Network.requestWillBeSent') {
          const { requestId, request } = message.params;
          // Keep local routes, not native payload URLs or private query values.
          const url = new URL(request.url);
          network.push({ id: requestId, path: url.origin === origin ? url.pathname : '[outside-loopback]', method: request.method });
        }
        if (message.method === 'Network.responseReceived') {
          const row = network.find(item => item.id === message.params.requestId);
          if (row) row.status = message.params.response.status;
        }
        if (message.method === 'Fetch.requestPaused') {
          const { requestId, request } = message.params;
          let local = false;
          try { local = new URL(request.url).origin === origin; } catch {}
          if (!local) blocked.push({ reason: 'Outside owned loopback origin', protocol: new URL(request.url).protocol });
          void send(local ? 'Fetch.continueRequest' : 'Fetch.failRequest', local ? { requestId } : { requestId, errorReason: 'BlockedByClient' }).catch(error => errors.push(error.message));
        }
      });
      await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
      await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
      await send('Network.setCacheDisabled', { cacheDisabled: true });
      await send('Emulation.setDeviceMetricsOverride', { width: scenario.width, height: scenario.height, deviceScaleFactor: 1, mobile: false });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scenario.theme }] });
      await send('Emulation.setTouchEmulationEnabled', { enabled: scenario.coarse, maxTouchPoints: 1 });
      await send('Page.addScriptToEvaluateOnNewDocument', { source: browserSetupScript });
      await send('Page.navigate', { url: origin + '/?lane=browser' });
      await waitFor(() => evaluate('!!window.bench?.ready && document.querySelectorAll(".aap-reading-agent").length === 2'), 'Pinned reading component did not become ready.');
      const actual = await evaluate(snapshotScript);
      const checks = assessBrowserSnapshot(actual, scenario.coarse);
      assert(checks.browserLane && checks.configuredRoutes && checks.exactNativePayloads, 'Refusing interaction with an unexpected lane, native route or payload.');
      checks.noAutomaticAction = actual.before.requests === 0 && actual.before.clipboard === 0;
      checks.manifestMatches = await evaluate(`JSON.stringify(window.bench.manifest) === ${JSON.stringify(JSON.stringify(inputs.manifest))}`);
      const contextSha256 = await evaluate(`crypto.subtle.digest('SHA-256',new TextEncoder().encode(window.bench.context)).then(bytes=>Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join(''))`);
      checks.contextMatchesManifest = contextSha256 === inputs.manifest.contextSha256 && actual.contextBytes === inputs.manifest.contextBytes;
      const filename = `browser-${scenario.width}-${scenario.theme}.png`;
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(outputDir, filename), Buffer.from(screenshot.data, 'base64'));
      const click = async selector => {
        const target = await evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); node.scrollIntoView({block:'center'}); const r=node.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2 }; })()`);
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...target });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...target });
      };
      for (const client of ['codex-app', 'claude-app']) await click(`.aap-reading-agent[data-client="${client}"]`);
      await pause(80);
      const cancellation = await evaluate(`({ guards:window.__benchNativeGuard, requested:window.bench.requested, href:location.pathname+location.search, status:document.querySelector('.aap-reading-status').textContent, receiptHidden:document.querySelector('.aap-reading-download').hidden })`);
      checks.nativeCancelledByBench = cancellation.guards.length === 2 && cancellation.guards.every(item => item.cancelledByBench) && JSON.stringify(cancellation.guards.map(item => item.client)) === JSON.stringify(['codex-app', 'claude-app']);
      checks.requestedRecorded = cancellation.requested.length === 2 && cancellation.requested.every(item => item.cancelled === true && item.lane === 'browser') && JSON.stringify(cancellation.requested.map(item => item.client)) === JSON.stringify(['codex-app', 'claude-app']);
      checks.noBrowserArrivalClaim = !cancellation.status && cancellation.receiptHidden;
      checks.noNativeNavigation = cancellation.href === '/?lane=browser';
      await click('.aap-reading-copy');
      await waitFor(() => evaluate('!document.querySelector(".aap-reading-copy").disabled'), 'Copy did not settle.');
      const copy = await evaluate(`({ count:window.__benchClipboardCapture.length, exact:window.__benchClipboardCapture[0] === window.bench.context, status:document.querySelector('.aap-reading-status').textContent })`);
      checks.clipboardExact = copy.count === 1 && copy.exact;
      await evaluate('window.__benchDenyClipboard = true');
      await click('.aap-reading-copy');
      await waitFor(() => evaluate('!document.querySelector(".aap-reading-copy").disabled'), 'Clipboard denial did not settle.');
      const fallback = await evaluate(`(() => { const node = document.querySelector('.aap-reading-text'); return {visible:!node.hidden,readOnly:node.readOnly,exact:node.value===window.bench.context,selected:document.activeElement===node&&node.selectionStart===0&&node.selectionEnd===node.value.length,receiptHidden:document.querySelector('.aap-reading-download').hidden}; })()`);
      checks.manualFallbackExact = fallback.visible && fallback.readOnly && fallback.exact && fallback.selected && fallback.receiptHidden;
      checks.noExternalRequest = blocked.length === 0;
      checks.noScriptError = errors.length === 0;
      checks.noFailedResource = !network.some(item => item.status >= 400);
      const result = { ...scenario, passed: Object.values(checks).every(Boolean), checks, actual, cancellation, copy, fallback, blocked, errors, network, screenshot: filename, screenshotSha256: sha(fs.readFileSync(path.join(outputDir, filename))), realClientResults: 'not-run' };
      runs.push(result);
      console.log(JSON.stringify({ lane: 'browser', viewport: [scenario.width, scenario.height], theme: scenario.theme, passed: result.passed, failures: Object.entries(checks).filter(([, value]) => !value).map(([name]) => name), realClientResults: 'not-run' }));
      active.close(); active = undefined;
      await fetch(debugging + '/json/close/' + page.id);
    }
  } catch (error) { report.error = error.message; }
  finally {
    active?.close();
    if (chrome?.pid && !exited(chrome)) {
      chrome.kill('SIGTERM');
      for (let index = 0; index < 30 && !exited(chrome); index++) await pause(100);
      if (!exited(chrome)) { chrome.kill('SIGKILL'); await new Promise(resolve => chrome.once('exit', resolve)); }
    }
    if (server.listening) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    fs.rmSync(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    report.finishedAt = new Date().toISOString();
    report.passed = !report.error && runs.length === 4 && runs.every(run => run.passed);
    report.cleanup = { ownedChromeClosed: !chrome?.pid || exited(chrome), ownServerClosed: !server.listening, disposableProfileRemoved: !fs.existsSync(temporary), userTabsAccessed: false };
    fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
  return { report, reportPath: path.join(outputDir, 'report.json') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argumentsList = process.argv.slice(2);
  const outputIndex = argumentsList.indexOf('--output');
  assert(outputIndex < 0 || argumentsList[outputIndex + 1], 'Supply a directory after --output.');
  const { report, reportPath } = await runBrowserChecks({ outputDir: outputIndex < 0 ? undefined : argumentsList[outputIndex + 1] });
  console.log(JSON.stringify({ report: path.relative(ROOT, reportPath), passed: report.passed, realClientResults: 'not-run' }));
  if (!report.passed) process.exitCode = 1;
}
