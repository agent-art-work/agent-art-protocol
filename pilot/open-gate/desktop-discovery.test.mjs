import assert from 'node:assert/strict';
import { test } from 'node:test';
import { discoverDesktopAgents, handleDesktopDiscovery } from './desktop-discovery.mjs';

const codex = { CFBundleIdentifier: 'com.openai.codex', CFBundleExecutable: 'Codex', CFBundleURLTypes: [{ CFBundleURLSchemes: ['codex'] }] };
const claude = { CFBundleIdentifier: 'com.anthropic.claudefordesktop', CFBundleExecutable: 'Claude', CFBundleURLTypes: [{ CFBundleURLSchemes: ['claude'] }] };
test('discovery requires exact bundle, declared route and executable; returns no paths/accounts', () => {
  const probed = [];
  const snapshot = discoverDesktopAgents({ platform: 'darwin', roots: ['/fixture'], readApp: file => { probed.push(file); return file.endsWith('/Claude.app') ? claude : file.endsWith('/Codex.app') ? codex : null; }, isExecutable: () => true });
  assert.ok(probed.some(file => file.endsWith('/Codex.app')));
  assert.ok(probed.some(file => file.endsWith('/Claude.app')));
  assert.deepEqual(snapshot.clients, [{ id: 'codex-app' }, { id: 'claude-app' }]);
  assert.equal(snapshot.scope, 'loopback-preview-host');
  assert.ok(!JSON.stringify(snapshot).includes('/fixture'));
  for (const metadata of [{ ...claude, CFBundleIdentifier: 'unrelated' }, { ...claude, CFBundleURLTypes: [] }, { ...claude, CFBundleExecutable: '../escape' }]) {
    assert.deepEqual(discoverDesktopAgents({ platform: 'darwin', roots: ['/fixture'], readApp: () => metadata, isExecutable: () => true }).clients, []);
  }
  assert.deepEqual(discoverDesktopAgents({ platform: 'darwin', roots: ['/fixture'], readApp: () => claude, isExecutable: () => false }).clients, []);
  assert.deepEqual(discoverDesktopAgents({ platform: 'linux', readApp: () => { throw Error('Do not probe'); } }).clients, []);
});

test('module endpoint limits discovery to loopback and same origin and sanitizes output', () => {
  const request = { method: 'GET', url: '/__aap/desktop-clients.mjs', socket: { localPort: 4174, remoteAddress: '127.0.0.1' }, headers: { host: '127.0.0.1:4174', origin: 'http://127.0.0.1:4174', 'sec-fetch-site': 'same-origin' } };
  const invoke = overrides => {
    const result = {}; const response = { writeHead(status, headers) { Object.assign(result, { status, headers }); }, end(body) { result.body = body; } };
    result.handled = handleDesktopDiscovery({ ...request, ...overrides }, response, { discover: () => ({ clients: [{ id: 'claude-app', path: '/private/ignored' }, { id: 'codex-app' }, { id: 'arbitrary' }], checkedAt: 'fixture' }) });
    return result;
  };
  const ok = invoke({}); assert.equal(ok.status, 200); assert.match(ok.body, /export default/); assert.ok(!ok.body.includes('/private/ignored')); assert.ok(!ok.body.includes('arbitrary')); assert.ok(ok.body.includes('codex-app'));
  assert.equal(ok.headers['Cross-Origin-Resource-Policy'], 'same-origin'); assert.equal(ok.headers['Cache-Control'], 'no-store'); assert.equal(ok.headers['Access-Control-Allow-Origin'], undefined);
  assert.equal(invoke({ method: 'POST' }).status, 405);
  assert.equal(invoke({ headers: { ...request.headers, host: 'evil.example' } }).status, 403);
  assert.equal(invoke({ headers: { ...request.headers, origin: 'https://evil.example' } }).status, 403);
  assert.equal(invoke({ headers: { ...request.headers, 'sec-fetch-site': 'cross-site' } }).status, 403);
  assert.equal(invoke({ headers: { ...request.headers, 'sec-fetch-site': 'same-site' } }).status, 403);
  assert.equal(invoke({ socket: { localPort: 4174, remoteAddress: '192.0.2.8' } }).status, 403);
  assert.equal(invoke({ url: '/' }).handled, false);
});
