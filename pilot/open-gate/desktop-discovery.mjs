import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const APPS = [
  { id: 'codex-app', bundle: 'com.openai.codex', scheme: 'codex', files: ['Codex.app', 'ChatGPT.app'] },
  { id: 'claude-app', bundle: 'com.anthropic.claudefordesktop', scheme: 'claude', files: ['Claude.app'] },
];
function readBundle(file) {
  const result = spawnSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', path.join(file, 'Contents/Info.plist')], { encoding: 'utf8', timeout: 2000, maxBuffer: 256 * 1024, shell: false, stdio: ['ignore', 'pipe', 'ignore'] });
  if (result.error || result.status !== 0) return null;
  try { return JSON.parse(result.stdout); } catch { return null; }
}
function executable(file) {
  try { fs.accessSync(file, fs.constants.X_OK); return fs.statSync(file).isFile(); } catch { return false; }
}
/** Read only known app bundles. No launch, accounts, paths or broad app inventory. */
export function discoverDesktopAgents({ platform = process.platform, roots = ['/Applications', path.join(os.homedir(), 'Applications')], readApp = readBundle, isExecutable = executable } = {}) {
  const clients = [];
  if (platform === 'darwin') for (const app of APPS) {
    let detected = false;
    for (const root of roots) for (const name of app.files) {
      if (detected) continue;
      const location = path.join(root, name);
      const metadata = readApp(location);
      const schemes = Array.isArray(metadata?.CFBundleURLTypes) ? metadata.CFBundleURLTypes.flatMap(entry => Array.isArray(entry?.CFBundleURLSchemes) ? entry.CFBundleURLSchemes : []) : [];
      const binary = metadata?.CFBundleExecutable;
      if (metadata?.CFBundleIdentifier === app.bundle && schemes.includes(app.scheme) && typeof binary === 'string' && binary && path.basename(binary) === binary && binary !== '.' && binary !== '..' && isExecutable(path.join(location, 'Contents/MacOS', binary))) detected = true;
    }
    if (detected) clients.push({ id: app.id });
  }
  return { scope: 'loopback-preview-host', clients, checkedAt: new Date().toISOString(), basis: 'allowlisted-app-bundle-and-declared-url-scheme' };
}
let cached;
/** Same-origin, loopback-only module. Script delivery also works with connect-src none. */
export function handleDesktopDiscovery(request, response, { discover = discoverDesktopAgents } = {}) {
  const route = request.url?.split('?')[0];
  if (route !== '/__aap/desktop-clients.mjs') return false;
  const deny = status => { response.writeHead(status, { 'Cache-Control': 'no-store' }); response.end(); return true; };
  if (request.method !== 'GET') return deny(405);
  const port = request.socket?.localPort;
  const host = request.headers.host;
  if (![ `127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}` ].includes(host)) return deny(403);
  const remote = request.socket?.remoteAddress;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) return deny(403);
  if (request.headers.origin && request.headers.origin !== `http://${host}`) return deny(403);
  const site = request.headers['sec-fetch-site'];
  if (site && !['same-origin', 'none'].includes(site)) return deny(403);
  try {
    if (discover !== discoverDesktopAgents || !cached || Date.now() - cached.at > 5000) cached = { at: Date.now(), result: discover() };
    const detected = cached.result;
    const snapshot = { scope: 'loopback-preview-host', clients: APPS.filter(app => detected.clients?.some(client => client.id === app.id)).map(app => ({ id: app.id })), checkedAt: detected.checkedAt, basis: 'allowlisted-app-bundle-and-declared-url-scheme' };
    response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin', Vary: 'Origin, Sec-Fetch-Site' });
    response.end(`export default ${JSON.stringify(snapshot)};\n`);
  } catch { return deny(503); }
  return true;
}
