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

const close = (actual, expected, tolerance = .02) => Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
function color(value) {
  if (typeof value !== 'string') return;
  const hex = /^#([a-f\d]{6})$/i.exec(value);
  if (hex) return [...hex[1].match(/../g).map(item => parseInt(item, 16) / 255), 1];
  const values = value.match(/[\d.]+/g)?.map(Number);
  if (/^color\(srgb /.test(value) && values?.length >= 3) return [...values.slice(0, 3), values[3] ?? 1];
  if (/^rgba?\(/.test(value) && values?.length >= 3) return [...values.slice(0, 3).map(item => item / 255), values[3] ?? 1];
}
const sameColor = (actual, expected) => {
  const a = color(actual), b = Array.isArray(expected) ? expected : color(expected);
  return !!a && !!b && a.every((value, index) => close(value, b[index], .006));
};

/** Candidate-only presentation assertions, separate from handoff and client claims. */
export function assessQuietFieldSnapshot(actual, scenario) {
  const quiet = actual.quietField || {}, outline = quiet.outline || {}, dot = quiet.dot || {};
  const ink = color(quiet.ink), paper = color(quiet.paper), palette = color(scenario.theme === 'dark' ? '#b9937b' : '#a77c62');
  const overrides = scenario.customProperties || {};
  const signal = overrides['--aap-signal'] ? color(overrides['--aap-signal']) : ink && palette.map((value, index) => index < 3 ? .95 * value + .05 * ink[index] : 1);
  const frame = overrides['--aap-frame'] || signal?.map((value, index) => index === 3 ? .5 : value);
  const field = overrides['--aap-label-surface'] || signal?.map((value, index) => index < 3 ? .15 * value + .85 * paper[index] : 1);
  return {
    quietFieldDefault: actual.presentation === 'quiet-field',
    staticEightPixelDot: close(dot.width, 8) && close(dot.height, 8) && dot.radius === '50%' && dot.animation === 'none',
    closedOnePixelOutline: outline.hidden === true && outline.pointerEvents === 'none' && outline.fill === 'none' && close(Number.parseFloat(outline.strokeWidth), 1) && /z\s*$/i.test(outline.path || ''),
    cssPixelOutlineGeometry: close(outline.width, actual.row.width) && close(outline.height, actual.row.height + 4) && outline.radiusFive === true && outline.tailEightByFour === true,
    neutralText: sameColor(quiet.labelInk, quiet.ink) && sameColor(quiet.actionInk, quiet.ink),
    signalMark: sameColor(dot.color, overrides['--aap-mark'] || signal),
    signalCopyIcon: sameColor(quiet.copyIcon, overrides['--aap-copy-icon'] || signal),
    independentFrameColor: sameColor(outline.stroke, frame),
    independentLabelField: sameColor(quiet.labelSurface, field),
    systemFontDefault: /system-ui/.test(quiet.fontFamily || ''),
    narrowContainerRetained: scenario.width !== 320 || close(actual.container.width, scenario.containerWidth || 257, .1),
  };
}

/** Copy success must preserve actual control geometry and following content. */
export function assessFeedbackGeometry(before, after) {
  const same = (a, b) => !!a && !!b && ['left', 'top', 'width', 'height'].every(key => close(a[key], b[key]));
  return !!before && !!after && same(before.row, after.row) && close(before.belowY, after.belowY)
    && before.controls.length === after.controls.length && before.controls.every((rect, index) => same(rect, after.controls[index]));
}

/** The tiny tail must fit between the normalized bottom-corner tangents. */
export function assessTailGeometry(actual) {
  const epsilon = .03, tail = actual.tail || {}, triangle = actual.triangle || {};
  const near = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b) < epsilon;
  const left = .5+actual.rx, right = actual.width-.5-actual.rx, baseline = actual.height-.5;
  return {
    normalizedCornerRun: actual.rx >= 0 && actual.ry >= 0 && right-left >= 8-epsilon && actual.ry*2 <= actual.height-1+epsilon,
    tailBetweenTangents: tail.left >= left-epsilon && tail.right <= right+epsilon,
    noBottomBacktracking: right >= tail.right-epsilon && tail.right >= tail.tipX-epsilon && tail.tipX >= tail.left-epsilon && tail.left >= left-epsilon,
    tinyTailGeometry: near(tail.right-tail.left,8) && near(tail.tipX,(tail.left+tail.right)/2) && near(tail.baseline,baseline) && near(tail.tipY-tail.baseline,4),
    alignedBackgroundTriangle: near(triangle.left,tail.left) && near(triangle.width,8) && near(triangle.height,4) && near(actual.height-triangle.bottom-triangle.height,tail.baseline) && triangle.pointed === true,
  };
}

export const browserSetupScript = `(() => {
  window.__benchClipboardCapture = [];
  window.__benchDenyClipboard = false;
  window.__benchHoldClipboard = false;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async text => {
      if (window.__benchDenyClipboard) throw new DOMException('Test clipboard denial', 'NotAllowedError');
      if (window.__benchHoldClipboard) await new Promise(resolve => { window.__benchReleaseClipboard = resolve; });
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
  const dot = root.querySelector('.aap-reading-mark'), outline = root.querySelector('.aap-reading-outline'), path = outline?.querySelector('path');
  const css = item => item ? getComputedStyle(item) : {};
  const d = path?.getAttribute('d') || '';
  const tokens = d.match(/[a-zA-Z]|-?[\\d.]+/g) || [];
  const tail = tokens.findIndex((token,index) => token.toUpperCase() === 'H' && +tokens[index+1] === 25 && tokens[index+2]?.toUpperCase() === 'L' && +tokens[index+3] === 21);
  const tailTop = tail < 0 ? NaN : +tokens[tail+7], tailBottom = tail < 0 ? NaN : +tokens[tail+4];
  const encoded = new TextEncoder().encode(context);
  // The public reading frame has handoff only; no enrollment, callback or contribution records.
  const reading = bench.reading?.reading || bench.reading;
  const frame = reading?.frame;
  const work = reading?.work;
  return {
    lane: bench.lane || new URL(location.href).searchParams.get('lane'),
    presentation: root.dataset.presentation,
    quietField: {
      ink: css(root).color, paper: css(root.querySelector('.aap-reading-text')).backgroundColor,
      labelInk: css(identity).color, actionInk: css(root.querySelector('.aap-reading-agent')).color,
      labelSurface: css(identity).backgroundColor, copyIcon: css(root.querySelector('.aap-reading-copy-icon')).color,
      fontFamily: css(row).fontFamily,
      dot: { width:dot?.getBoundingClientRect().width, height:dot?.getBoundingClientRect().height, radius:css(dot).borderRadius, color:css(dot).backgroundColor, animation:css(dot).animationName },
      outline: { hidden:outline?.getAttribute('aria-hidden') === 'true', pointerEvents:css(outline).pointerEvents,
        width:outline?.viewBox?.baseVal.width, height:outline?.viewBox?.baseVal.height,
        path:d, stroke:css(path).stroke, strokeWidth:css(path).strokeWidth, fill:css(path).fill,
        radiusFive: (d.match(/A\\s*5[ ,]+5/gi) || []).length === 4,
        tailEightByFour: tail >= 0 && +tokens[tail+6] === 17 && Math.abs(tailBottom-tailTop-4) < .02 },
    },
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

// Resolve the expected radii from the public CSS values and row dimensions,
// independently of the SDK's hidden measurement probe.
const dynamicRadiusScript = (tailSafe, selectedValue) => `(async () => {
  const tailSafe = ${JSON.stringify(tailSafe)};
  const selectedValue = ${JSON.stringify(selectedValue) || 'undefined'};
  const assessTailGeometry = ${assessTailGeometry.toString()};
  const root = document.querySelector('#reading .aap-reading');
  const row = root.querySelector('.aap-reading-row'), contour = root.querySelector('.aap-reading-outline path');
  const results = [], frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const snapshot = () => {
    const d=contour.getAttribute('d')||'', match=d.match(/A([\\d.]+) ([\\d.]+)/), rect=row.getBoundingClientRect();
    const tail=d.match(/H([\\d.]+) L([\\d.]+) ([\\d.]+) L([\\d.]+) ([\\d.]+) H/), triangle=getComputedStyle(row,'::before');
    return { rx:Number(match?.[1]), ry:Number(match?.[2]), width:rect.width, height:rect.height,
      tail:{right:Number(tail?.[1]),tipX:Number(tail?.[2]),tipY:Number(tail?.[3]),left:Number(tail?.[4]),baseline:Number(tail?.[5])},
      triangle:{left:parseFloat(triangle.left),width:parseFloat(triangle.width),height:parseFloat(triangle.height),bottom:parseFloat(triangle.bottom),pointed:triangle.clipPath.startsWith('polygon(')&&triangle.clipPath.includes('50% 100%')},
    };
  };
  const trials = [
    { name:'runtime pixel radius', value:'9px', pixels:9 },
    { name:'runtime calc radius', value:'calc(1rem - 1px)', rem:true },
    { name:'runtime percentage radius', value:'10%', percent:.1 },
    ...(tailSafe ? [
      { name:'near-pill radius reserves the tiny-tail run', value:'50%', percent:.5 },
      { name:'oversized radius normalizes without corner-tail overlap', value:'999px', pixels:999 },
    ] : []),
    { name:'legacy radius alias', alias:'11px', pixels:11 },
    { name:'explicit radius precedes alias', value:'7px', alias:'11px', pixels:7 },
    { name:'restore default radius', pixels:5 },
  ];
  for (const trial of trials.filter(item=>!selectedValue || item.value===selectedValue)) {
    root.style.removeProperty('--aap-radius'); root.style.removeProperty('--aap-gate-radius');
    if (trial.value) root.style.setProperty('--aap-radius',trial.value);
    if (trial.alias) root.style.setProperty('--aap-gate-radius',trial.alias);
    await frames();
    const actual = snapshot(), requested = trial.rem ? parseFloat(getComputedStyle(document.documentElement).fontSize)-1 : trial.pixels;
    const rx = trial.percent ? actual.width*trial.percent : requested, ry = trial.percent ? actual.height*trial.percent : requested;
    const scale = Math.min(1,(actual.width-1-(tailSafe?8:0))/(2*rx||1),(actual.height-1)/(2*ry||1));
    const expected = { rx:rx*scale, ry:ry*scale };
    const geometry=tailSafe ? assessTailGeometry(actual) : undefined;
    const passed = Math.abs(actual.rx-expected.rx)<.03 && Math.abs(actual.ry-expected.ry)<.03 && (!geometry || Object.values(geometry).every(Boolean));
    results.push({ name:trial.name, value:trial.value || trial.alias || 'default', actual, expected, geometry, passed });
  }
  return { passed:results.every(result=>result.passed), results, boundary:'Public runtime CSS variables only; no remount or native activation.' };
})()`;

const feedbackSnapshotScript = `(() => {
  const root=document.querySelector('#reading .aap-reading'),copy=root.querySelector('.aap-reading-copy');
  const bounds=element=>{const r=element.getBoundingClientRect();return {left:r.left+scrollX,top:r.top+scrollY,width:r.width,height:r.height};};
  const announcement=root.querySelector('.aap-reading-announcement'),status=root.querySelector('.aap-reading-status');
  return {row:bounds(root.querySelector('.aap-reading-row')),controls:[...root.querySelector('.aap-reading-row').querySelectorAll('a,button')].map(bounds),belowY:document.querySelector('#results-heading').getBoundingClientRect().top+scrollY,state:copy.dataset.state,announcement:announcement?.textContent,visibleStatus:status.textContent,statusVisible:!!status.getClientRects().length};
})()`;

export async function runBrowserChecks({ inputs, outputDir, firstScenarioOnly = false } = {}) {
  inputs ||= await loadBenchInputs();
  const executable = verifyStableChrome();
  const id = new Date().toISOString().replace(/[:.]/g, '-');
  outputDir = path.resolve(outputDir || path.join(ROOT, '.local/test-bench/browser', id));
  fs.mkdirSync(outputDir, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-reading-bench-'));
  const profile = path.join(temporary, 'profile');
  const server = createBenchServer({ inputs, storeDir: path.join(temporary, 'runs') });
  const runs = [];
  const quietCandidate = ['0.1.3', '0.1.4'].includes(inputs.manifest.sdkVersion);
  const feedbackCandidate = inputs.manifest.sdkVersion === '0.1.4';
  const scenarios = [
    { width: 1440, height: 1000, theme: 'light', coarse: false },
    { width: 1440, height: 1000, theme: 'dark', coarse: false },
    { width: 320, height: 900, theme: 'light', coarse: true },
    { width: 390, height: 844, theme: 'dark', coarse: true },
  ];
  if (quietCandidate) {
    scenarios.push({ width: 320, height: 900, theme: 'dark', coarse: true });
    for (const theme of ['light', 'dark']) {
      scenarios.push({ width: 1440, height: 1000, theme, coarse: false, name: 'signal-hook', customProperties: { '--aap-signal': '#446d83' } });
      scenarios.push({ width: 1440, height: 1000, theme, coarse: false, name: 'public-hooks', customProperties: {
        '--aap-signal': '#446d83', '--aap-frame': 'rgba(29, 71, 89, 0.4)',
        '--aap-label-surface': theme === 'light' ? '#e2e8eb' : '#27333d', '--aap-mark': '#315f75', '--aap-copy-icon': '#4b7186',
      } });
    }
  }
  if (feedbackCandidate) for (const theme of ['light', 'dark']) scenarios.push({ width: 320, height: 900, theme, coarse: true, name: 'site-width265', containerWidth: 265 });
  if (firstScenarioOnly) scenarios.splice(1);
  const report = {
    schema: SCHEMA, lane: 'browser', id, startedAt: new Date().toISOString(),
    manifest: inputs.manifest,
    environment: { platform: process.platform, architecture: process.arch, node: process.version },
    browser: { application: 'Google Chrome stable', bundleId: 'com.google.Chrome', identityVerifiedBeforeLaunch: true, disposableOwnedProfile: true },
    realClientResults: 'not-run', screenshotInspection: 'pending', runs,
    scope: firstScenarioOnly ? 'focused-first-scenario-comparison' : 'full-browser-matrix',
    limits: ['Synthetic browser interaction only; native links canceled before OS launch.', 'Clipboard is isolated and stubbed; it never reads or writes the operating system clipboard.', 'No real-client arrival, conversation destination, Send, source reading, model execution or comprehension is established.', 'No callback, THOUGHT participation, registry publication or deployment is tested.'],
  };
  if (quietCandidate) report.fixtureInputs = Object.fromEntries([
    'pilot/reading-sdk-012/ui-fixtures.mjs', 'pilot/reading-sdk-012/work.mjs', 'test-bench/ui-candidate-fixtures.mjs',
    ...(feedbackCandidate ? ['test-bench/ui-fixtures-014.mjs', 'test-bench/ui-feedback-fixtures-014.mjs'] : []),
  ].map(name => [name, sha(fs.readFileSync(path.join(ROOT, name)))]));
  if (feedbackCandidate) report.fixtureAdapter = {
    source: 'pilot/reading-sdk-012/ui-fixtures.mjs', adapted: 'test-bench/ui-fixtures-014.mjs',
    changes: ['Final Copy action is identified by its stable aria-label instead of whole textContent, because both Copy and Copied state text remain in the DOM.'],
    limits: 'This compatibility change does not qualify feedback behavior; targeted 0.1.4 fixtures check actual visibility, geometry and timers.',
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
    for (const scenario of scenarios) {
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
      if (scenario.containerWidth) await evaluate(`document.querySelector('#reading').style.width = ${JSON.stringify(scenario.containerWidth + 'px')}`);
      if (scenario.customProperties) await evaluate(`(() => { const root = document.querySelector('.aap-reading'); for (const [name,value] of Object.entries(${JSON.stringify(scenario.customProperties)})) root.style.setProperty(name,value); })()`);
      // The outline tracks measured CSS-pixel geometry through ResizeObserver.
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      let radiusTrials, radiusScreenshots;
      if (quietCandidate && scenario.theme === 'light' && !scenario.name && [1440,320].includes(scenario.width)) radiusTrials = await evaluate(dynamicRadiusScript(feedbackCandidate));
      if (feedbackCandidate && radiusTrials) {
        radiusScreenshots = [];
        for (const value of ['10%','50%','999px']) {
          const measured=await evaluate(dynamicRadiusScript(true,value));
          const name=`radius-${scenario.width}-${scenario.theme}-${value.replace('%','pct')}.png`;
          const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}),bytes=Buffer.from(capture.data,'base64');
          fs.writeFileSync(path.join(outputDir,name),bytes);
          radiusScreenshots.push({value,path:name,sha256:sha(bytes),measurement:measured});
        }
        await evaluate('document.querySelector("#reading .aap-reading").style.removeProperty("--aap-radius"); new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      }
      const actual = await evaluate(snapshotScript);
      const checks = assessBrowserSnapshot(actual, scenario.coarse);
      if (quietCandidate) Object.assign(checks, assessQuietFieldSnapshot(actual, scenario));
      if (radiusTrials) checks.runtimeRadiusUpdates = radiusTrials.passed;
      if (radiusScreenshots) checks.largeRadiusSamples = radiusScreenshots.every(item=>item.measurement.passed);
      assert(checks.browserLane && checks.configuredRoutes && checks.exactNativePayloads, 'Refusing interaction with an unexpected lane, native route or payload.');
      checks.noAutomaticAction = actual.before.requests === 0 && actual.before.clipboard === 0;
      checks.manifestMatches = await evaluate(`JSON.stringify(window.bench.manifest) === ${JSON.stringify(JSON.stringify(inputs.manifest))}`);
      const contextSha256 = await evaluate(`crypto.subtle.digest('SHA-256',new TextEncoder().encode(window.bench.context)).then(bytes=>Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join(''))`);
      checks.contextMatchesManifest = contextSha256 === inputs.manifest.contextSha256 && actual.contextBytes === inputs.manifest.contextBytes;
      const filename = `browser-${scenario.width}-${scenario.theme}${scenario.name ? '-' + scenario.name : ''}.png`;
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(outputDir, filename), Buffer.from(screenshot.data, 'base64'));
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await evaluate('document.querySelector(".aap-reading-title").focus()');
      const keyboard = [];
      for (let index = 0; index < 4; index++) {
        keyboard.push(await evaluate(`(() => { const element=document.activeElement, css=getComputedStyle(element); return {className:element.className,name:element.getAttribute('aria-label'),focusVisible:element.matches(':focus-visible'),outlineWidth:css.outlineWidth,outlineStyle:css.outlineStyle}; })()`));
        if (index < 3) {
          await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        }
      }
      checks.keyboardOrderAndFocus = JSON.stringify(keyboard.map(item => item.className)) === JSON.stringify(['aap-reading-title', 'aap-reading-agent', 'aap-reading-agent', 'aap-reading-copy']) && keyboard.every(item => item.name && item.focusVisible && Number.parseFloat(item.outlineWidth) >= 2 && item.outlineStyle !== 'none');
      let keyboardCopyFocus;
      if (scenario.width === 1440 && scenario.theme === 'light' && !scenario.name) {
        const focusState = `(() => { const copy=document.querySelector('#reading .aap-reading-copy'), active=document.activeElement; return {activeTag:active.tagName,activeClass:active.className,copyFocused:active===copy,copyDisabled:copy.disabled,clipboardCount:window.__benchClipboardCapture.length}; })()`;
        const before = await evaluate(focusState);
        await evaluate('window.__benchHoldClipboard = true');
        try {
          await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
          await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
          await waitFor(() => evaluate('typeof window.__benchReleaseClipboard === "function"'), 'Keyboard activation did not reach the isolated clipboard.');
          const pending = await evaluate(focusState);
          await evaluate('window.__benchHoldClipboard = false; window.__benchReleaseClipboard(); delete window.__benchReleaseClipboard');
          await waitFor(() => evaluate('!document.querySelector("#reading .aap-reading-copy").disabled'), 'Keyboard Copy did not settle.');
          const after = await evaluate(focusState);
          keyboardCopyFocus = {before,pending,after,activationConfirmed:before.copyFocused&&pending.copyDisabled&&after.clipboardCount===before.clipboardCount+1&&!after.copyDisabled,retainedAfterCompletion:after.copyFocused,boundary:'Real browser keyboard activation with an isolated pending clipboard promise. Focus retention is diagnostic, separate from the release scope checks.'};
        } catch (error) {
          keyboardCopyFocus = {before,error:error.message,activationConfirmed:false,boundary:'Keyboard diagnostic was inconclusive; no SDK failure is inferred.'};
        } finally {
          await evaluate('window.__benchHoldClipboard = false; window.__benchReleaseClipboard?.(); delete window.__benchReleaseClipboard');
        }
        await evaluate('window.__benchClipboardCapture.length = 0');
      }
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
      const feedbackBefore = feedbackCandidate ? await evaluate(feedbackSnapshotScript) : undefined;
      await click('.aap-reading-copy');
      await waitFor(() => evaluate('!document.querySelector(".aap-reading-copy").disabled'), 'Copy did not settle.');
      const copy = await evaluate(`({ count:window.__benchClipboardCapture.length, exact:window.__benchClipboardCapture[0] === window.bench.context, status:document.querySelector('.aap-reading-status').textContent })`);
      checks.clipboardExact = copy.count === 1 && copy.exact;
      const feedbackAfter = feedbackCandidate ? await evaluate(feedbackSnapshotScript) : undefined;
      let successScreenshot;
      if (feedbackCandidate) {
        checks.successHasNoPageJump = assessFeedbackGeometry(feedbackBefore, feedbackAfter);
        checks.successIsInlineAndAnnounced = feedbackAfter.state === 'copied' && !!feedbackAfter.announcement && !feedbackAfter.visibleStatus && !feedbackAfter.statusVisible;
        if (scenario.width === 320 || (scenario.width === 1440 && scenario.theme === 'light' && !scenario.name)) {
          const copiedName=filename.replace('.png','-copied.png'), copiedCapture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
          const bytes=Buffer.from(copiedCapture.data,'base64'); fs.writeFileSync(path.join(outputDir,copiedName),bytes);
          successScreenshot={path:copiedName,sha256:sha(bytes)};
        }
      }
      await evaluate('window.__benchDenyClipboard = true');
      await click('.aap-reading-copy');
      await waitFor(() => evaluate('!document.querySelector(".aap-reading-copy").disabled'), 'Clipboard denial did not settle.');
      const fallback = await evaluate(`(() => { const node = document.querySelector('.aap-reading-text'); return {visible:!node.hidden,readOnly:node.readOnly,exact:node.value===window.bench.context,selected:document.activeElement===node&&node.selectionStart===0&&node.selectionEnd===node.value.length,receiptHidden:document.querySelector('.aap-reading-download').hidden}; })()`);
      checks.manualFallbackExact = fallback.visible && fallback.readOnly && fallback.exact && fallback.selected && fallback.receiptHidden;
      let fixtures, observerLifecycle, feedbackFixtures;
      if (quietCandidate && scenario.width === 1440 && scenario.theme === 'light' && !scenario.name) {
        fixtures = await evaluate(`import(${JSON.stringify(feedbackCandidate ? '/ui-fixtures-014.mjs' : '/ui-fixtures.mjs')}).then(module=>module.checkReadingUI())`);
        checks.reusedUIFixtures = fixtures.passed === true;
        observerLifecycle = await evaluate("import('/ui-candidate-fixtures.mjs').then(module=>module.checkCandidateUI())");
        checks.outlineObserverLifecycle = observerLifecycle.passed === true;
      }
      if (feedbackCandidate && scenario.width === 320 && scenario.theme === 'light' && !scenario.name) {
        feedbackFixtures = await evaluate("import('/ui-feedback-fixtures-014.mjs').then(module=>module.checkFeedbackUI())");
        checks.inlineFeedbackFixtures = feedbackFixtures.passed === true;
      }
      checks.noExternalRequest = blocked.length === 0;
      checks.noScriptError = errors.length === 0;
      checks.noFailedResource = !network.some(item => item.status >= 400);
      const result = { ...scenario, passed: Object.values(checks).every(Boolean), checks, actual, radiusTrials, radiusScreenshots, keyboard, keyboardCopyFocus, cancellation, copy, feedbackBefore, feedbackAfter, successScreenshot, fallback, fixtures, observerLifecycle, feedbackFixtures, blocked, errors, network, screenshot: filename, screenshotSha256: sha(fs.readFileSync(path.join(outputDir, filename))), realClientResults: 'not-run' };
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
    report.passed = !report.error && runs.length === scenarios.length && runs.every(run => run.passed);
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
