import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import http from 'node:http';
import { test } from 'node:test';
import { createStaticReadingServer } from './reading-consumers/serve.mjs';

test('reading preview serves public assets and SPA routes without an Agent API', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-static-'));
  fs.writeFileSync(path.join(directory, 'index.html'), '<main>Reading</main>');
  fs.writeFileSync(path.join(directory, 'reading.mjs'), 'export const ready=true;');
  fs.writeFileSync(path.join(directory, '.private'), 'private');
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-outside-'));
  fs.writeFileSync(path.join(outside, 'secret.txt'), 'private');
  fs.symlinkSync(path.join(outside, 'secret.txt'), path.join(directory, 'escape.txt'));
  const server = createStaticReadingServer({ directory, spa: true });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); fs.rmSync(directory, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = async (route, options) => { const response = await fetch(base + route, options); return { status: response.status, text: await response.text(), type: response.headers.get('content-type') }; };
  assert.deepEqual(await get('/docs'), { status: 200, text: '<main>Reading</main>', type: 'text/html; charset=utf-8' });
  assert.equal((await get('/reading.mjs')).type, 'text/javascript; charset=utf-8');
  assert.equal((await get('/reading.mjs', { method: 'HEAD' })).text, '');
  for (const route of ['/.private', '/escape.txt', '/missing.mjs', '/%00']) assert.equal((await get(route)).status, 404);
  assert.equal((await get('/__bridge/handoff', { method: 'POST' })).status, 405);
  const hostileHostStatus = await new Promise((resolve, reject) => {
    const request = http.get(base, { headers: { host: 'untrusted.invalid' } }, response => {
      response.resume(); resolve(response.statusCode);
    });
    request.on('error', reject);
  });
  assert.equal(hostileHostStatus, 403);
});
