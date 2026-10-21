// Actual installed-archive UI checks with disposable stable Chrome; no native Agent trial.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createFixtureServer } from './serve.mjs';
import { checkReadingUI } from './ui-fixtures.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const archive = path.resolve(option('--archive') || path.join(ROOT, '.local/sdk/agent-art-protocol-0.1.2.tgz'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const archiveSha256 = sha(fs.readFileSync(archive));
const packageDir = path.resolve(option('--package-dir') || path.join(ROOT, '.local/sdk/consumers', archiveSha256, 'node_modules/@agent-art/protocol'));
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
if (manifest.version !== '0.1.2' || manifest.private !== true) throw Error('Only the fresh installed private 0.1.2 archive is accepted.');
const ownTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-sdk-012-qa-'));
const profile = path.join(ownTemp, 'chrome-profile');
const archiveContents = path.join(ownTemp, 'archive'); fs.mkdirSync(archiveContents);
const unpack = spawnSync('tar', ['-xzf', archive, '-C', archiveContents], { encoding: 'utf8', shell: false });
if (unpack.status !== 0) throw Error('Could not inspect the supplied archive.');
const packagedFiles = {};
for (const name of ['package.json', ...manifest.files]) {
  const packed = fs.readFileSync(path.join(archiveContents, 'package', name));
  if (!packed.equals(fs.readFileSync(path.join(packageDir, name)))) throw Error(`Installed package differs from archive: ${name}`);
  if (!packed.equals(fs.readFileSync(path.join(ROOT, 'protocol', name)))) throw Error(`Package source differs from tested archive: ${name}`);
  packagedFiles[name] = sha(packed);
}
const lock = path.resolve(packageDir, '../../..', 'package-lock.json');
const lockText = fs.readFileSync(lock);
const lockValue = JSON.parse(lockText);
const dependency = lockValue.packages?.['node_modules/@agent-art/protocol'];
const expectedIntegrity = `sha512-${createHash('sha512').update(fs.readFileSync(archive)).digest('base64')}`;
if (dependency?.version !== '0.1.2' || dependency?.integrity !== expectedIntegrity) throw Error('Installed SDK dependency lock does not match archive.');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const bundle = spawnSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleIdentifier', '/Applications/Google Chrome.app/Contents/Info.plist'], { encoding: 'utf8', shell: false });
if (bundle.status !== 0 || bundle.stdout.trim() !== 'com.google.Chrome') throw Error('Stable Chrome identity could not be verified.');
const output = path.join(ROOT, '.local/qa/reading-sdk-012'); fs.mkdirSync(output, { recursive: true });
const server = createFixtureServer({ packageDir });
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;
const port = 18200 + Math.floor(Math.random() * 1000);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--disable-gpu', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore', shell: false });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const runs = [];
let browserVersion;
try {
  for (let index = 0; index < 100; index++) {
    try { const result = await fetch(`http://127.0.0.1:${port}/json/version`); if (result.ok) { browserVersion = await result.json(); break; } } catch {}
    await sleep(100);
  }
  if (!browserVersion) throw Error('Owned stable Chrome did not start.');
  for (const { width, height, theme, coarse, fixtures } of [
    { width: 1440, height: 1000, theme: 'light', coarse: false, fixtures: true },
    { width: 1440, height: 1000, theme: 'dark', coarse: false },
    { width: 390, height: 844, theme: 'dark', coarse: true },
    { width: 320, height: 720, theme: 'light', coarse: true },
  ]) {
    const page = await (await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' })).json();
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0; const pending = new Map(), network = [], errors = [], blocked = [];
    const send = (method, params = {}) => { const call = ++id; socket.send(JSON.stringify({ id: call, method, params })); return new Promise((resolve, reject) => pending.set(call, { resolve, reject })); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id) { const item = pending.get(message.id); if (item) { pending.delete(message.id); message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result); } }
      if (message.method === 'Network.requestWillBeSent') network.push({ id: message.params.requestId, url: message.params.request.url, method: message.params.request.method });
      if (message.method === 'Network.responseReceived') { const row = network.find(item => item.id === message.params.requestId); if (row) row.status = message.params.response.status; }
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === 'Fetch.requestPaused') {
        const { requestId, request } = message.params;
        if (new URL(request.url).origin === origin) void send('Fetch.continueRequest', { requestId });
        else { blocked.push(request.url); void send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }); }
      }
    };
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    await send('Page.enable'); await send('Network.enable'); await send('Runtime.enable');
    await send('Fetch.enable', { patterns: [{ urlPattern: 'http://*' }, { urlPattern: 'https://*' }] });
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
    if (coarse) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await send('Page.navigate', { url: origin + '/' });
    let ready = false;
    for (let index = 0; index < 100; index++) { if (await evaluate('document.querySelectorAll(".aap-reading-agent").length === 2')) { ready = true; break; } await sleep(50); }
    if (!ready) throw Error('Installed component did not mount.');
    const actual = await evaluate(`(() => {
      const root = document.querySelector('.aap-reading'), row = root.querySelector('.aap-reading-row'), identity = root.querySelector('.aap-reading-title');
      const label = root.querySelector('.aap-reading-label'), mark = root.querySelector('.aap-reading-mark');
      const controls = [...root.querySelectorAll('a,button')].filter(item => item.getClientRects().length);
      const bounds = item => { const r = item.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
      const rect = bounds(row), title = bounds(identity), markRect = bounds(mark), labelRect = bounds(label);
      const text = root.querySelector('.aap-reading-text').value;
      const outline = getComputedStyle(mark, '::before'), tail = getComputedStyle(mark, '::after');
      return {
        label: label.textContent, identity: { tag: identity.tagName, href: identity.href, name: identity.getAttribute('aria-label'), title: identity.title, text: identity.textContent, rect: title, infoHidden: [...identity.querySelectorAll('[aria-hidden=true]')].some(item => item.textContent === 'ⓘ') },
        presentation: root.dataset.presentation, mark: { openLeft: outline.clipPath.includes('24% 72%'), tailLeft: Math.abs(parseFloat(tail.left) / markRect.width - .14) < .02, beforeLabel: markRect.right <= labelRect.left },
        row: rect, container: bounds(root), coarse: matchMedia('(pointer: coarse)').matches,
        controls: controls.map(item => ({ text: item.textContent, className: item.className, tag: item.tagName, rect: bounds(item) })),
        oneLine: controls.every(item => { const r = bounds(item); return Math.abs((r.top + r.height / 2) - (title.top + title.height / 2)) < 1; }),
        withinBackground: controls.every(item => { const r = bounds(item); return r.left >= rect.left && r.right <= rect.right && r.top >= rect.top && r.bottom <= rect.bottom; }),
        withinViewport: controls.every(item => { const r = bounds(item); return r.left >= 0 && r.right <= innerWidth; }),
        noOverflow: document.documentElement.scrollWidth <= innerWidth,
        minHeight: Math.min(...controls.map(item => bounds(item).height)),
        sharedBackground: getComputedStyle(row).backgroundColor, sealBackground: getComputedStyle(identity).backgroundColor,
        apps: [...root.querySelectorAll('.aap-reading-agent')].map(item => { const url = new URL(item.href); return { client: item.dataset.client, exact: url.searchParams.get(item.dataset.client === 'codex-app' ? 'prompt' : 'q') === text, params: [...url.searchParams.keys()] }; }),
        copyVisible: !!root.querySelector('.aap-reading-copy').getClientRects().length,
        noPanel: !root.querySelector('details,select,[aria-expanded],.aap-reading-panel'),
        hint: root.querySelector('.aap-reading-hint').textContent,
      };
    })()`);
    await evaluate('document.body.tabIndex = -1; document.body.focus();');
    const keyboard = [];
    for (let index = 0; index < 4; index++) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      keyboard.push(await evaluate(`(() => { const item = document.activeElement, style = getComputedStyle(item); return { className: item.className, focusVisible: item.matches(':focus-visible'), outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle }; })()`));
    }
    // Geometry and keyboard-focus evidence are retained above; capture normal appearance separately.
    await evaluate('document.activeElement.blur();');
    const prefix = path.join(output, `fixture-${width}-${theme}`);
    const screen = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(prefix + '.png', Buffer.from(screen.data, 'base64'));
    if (width === 1440 && theme === 'light') {
      const r = actual.row;
      const crop = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.left - 10, y: r.top - 10, width: r.width + 20, height: r.height + 20, scale: 2 } });
      fs.writeFileSync(path.join(output, 'component.png'), Buffer.from(crop.data, 'base64'));
    }
    const checks = fixtures ? await evaluate(`(${checkReadingUI.toString()})()`) : undefined;
    const failures = network.filter(item => item.status >= 400);
    const identityOK = actual.identity.tag === 'A' && actual.identity.href === 'https://agentart.work/ask-your-agent/' && actual.identity.infoHidden && /ask your agent/i.test(actual.identity.name) && /about/i.test(actual.identity.name);
    const keyboardOK = JSON.stringify(keyboard.map(item => item.className)) === JSON.stringify(['aap-reading-title', 'aap-reading-agent', 'aap-reading-agent', 'aap-reading-copy']) && keyboard.every(item => item.focusVisible && parseFloat(item.outlineWidth) >= 2 && item.outlineStyle === 'solid');
    const routesOK = JSON.stringify(actual.apps.map(item => item.client)) === JSON.stringify(['codex-app', 'claude-app']) && actual.apps.every(item => item.exact && item.params.length === 1 && ['prompt', 'q'].includes(item.params[0]));
    const passed = identityOK && keyboardOK && routesOK && actual.mark.openLeft && actual.mark.tailLeft && actual.mark.beforeLabel && actual.presentation === 'seal' && actual.label === 'Ask your Agent' && actual.oneLine && actual.withinBackground && actual.withinViewport && actual.noOverflow && actual.minHeight >= (coarse ? 44 : 32) && actual.coarse === coarse && actual.row.width <= 380 && actual.row.height <= 52 && actual.copyVisible && actual.noPanel && actual.sharedBackground !== actual.sealBackground && actual.hint.includes('not been checked') && !errors.length && !failures.length && !blocked.length && (!checks || checks.passed);
    const result = { viewport: [width, height], theme, coarsePointer: coarse, passed, actual, keyboard, fixtures: checks, network, errors, failures, blocked, boundary: 'Installed archive, synthetic public-reading Work. Native clicks canceled or same-page fragments; About navigation canceled; clipboard/discovery stubs. No Agent launch, source fetch or model execution.' };
    fs.writeFileSync(prefix + '.json', JSON.stringify(result, null, 2) + '\n');
    runs.push({ ...result, network: undefined, rawEvidence: path.relative(ROOT, prefix + '.json'), rawEvidenceSha256: sha(fs.readFileSync(prefix + '.json')), screenshot: path.relative(ROOT, prefix + '.png'), screenshotSha256: sha(fs.readFileSync(prefix + '.png')) });
    console.log(JSON.stringify({ viewport: [width, height], theme, passed, row: actual.row, minHeight: actual.minHeight, keyboardOK, identityOK, routesOK, fixtures: checks && { passed: checks.passed, count: checks.results.length, failures: checks.results.filter(item => !item.passed) }, errors, failures, blocked }));
    socket.close(); socket = undefined;
    await fetch(`http://127.0.0.1:${port}/json/close/${page.id}`);
  }
} finally {
  socket?.close(); chrome.kill('SIGTERM'); await sleep(500);
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(ownTemp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
const pins = {};
for (const name of ['check-ui.mjs', 'ui-fixtures.mjs', 'serve.mjs', 'fixture.mjs', 'index.html', 'work.mjs']) pins[name] = sha(fs.readFileSync(path.join(HERE, name)));
const qualification = {
  schema: 'agent-art.reading-sdk-browser-qualification.v1', date: '2026-10-21', status: runs.every(item => item.passed) ? 'private-local-0.1.2-browser-checks-passed' : 'private-local-0.1.2-browser-checks-failed',
  package: { name: manifest.name, version: manifest.version, private: manifest.private, archive: path.relative(ROOT, archive), archiveSha256, packagedFiles, installedAndSourceMatchArchive: true, installedArchiveFilesChecked: Object.keys(packagedFiles).length, installLockSha256: sha(lockText), lockIntegrity: expectedIntegrity },
  fixture: { purpose: 'Synthetic public Lab-index reading frame; actual Lab adoption is qualified separately by its owner.', files: pins },
  browser: { application: '/Applications/Google Chrome.app', bundleId: 'com.google.Chrome', verifiedBeforeLaunch: true, version: browserVersion.Browser, profile: 'Disposable owned headless profile', runs },
  screenshotInspection: 'Pending human/agent visual inspection; automated success alone is insufficient.',
  limits: ['No native Agent launch, Send, source reading, model execution, deployment or registry publication.', 'Prepared URLs and synthetic browser events do not qualify desktop app delivery or output.', 'About destination is canonical but navigation is canceled; this test does not qualify the live About page.', 'Each test-owned Chrome target/profile and fixture server closed; no user tabs touched.', 'Historical 0.1.1 archive and qualifications remain unchanged.'],
};
fs.writeFileSync(path.join(HERE, 'QUALIFICATION.json'), JSON.stringify(qualification, null, 2) + '\n');
if (!runs.every(item => item.passed)) process.exitCode = 1;
