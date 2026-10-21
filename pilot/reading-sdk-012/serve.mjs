import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const ASSETS = new Set(['index.mjs', 'clients.mjs', 'reading.mjs', 'reading-ui.mjs', 'reading.css']);

/** Serve an already-installed SDK archive. This helper never packs, installs or fetches. */
export function createFixtureServer({ packageDir }) {
  const installed = path.resolve(packageDir);
  const manifest = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
  if (manifest.name !== '@agent-art/protocol' || manifest.version !== '0.1.2' || manifest.private !== true) throw new Error('Supply the installed private SDK 0.1.2 archive.');
  return http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    let file;
    if (pathname === '/') file = path.join(HERE, 'index.html');
    else if (['/fixture.mjs', '/work.mjs', '/ui-fixtures.mjs'].includes(pathname)) file = path.join(HERE, pathname.slice(1));
    else if (pathname === '/assets/agent-art-reading-work.mjs') file = path.join(HERE, 'work.mjs');
    else if (pathname.startsWith('/assets/agent-art-sdk/') && ASSETS.has(pathname.slice('/assets/agent-art-sdk/'.length))) file = path.join(installed, pathname.slice('/assets/agent-art-sdk/'.length));
    if (request.method !== 'GET' || !file) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': TYPES[path.extname(file)], 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'" });
    response.end(fs.readFileSync(file));
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--package-dir');
  if (index < 0 || !process.argv[index + 1]) throw new Error('Pass --package-dir for an already-installed SDK 0.1.2.');
  const server = createFixtureServer({ packageDir: process.argv[index + 1] });
  server.listen(0, '127.0.0.1', () => console.log(`Packaged SDK fixture: http://127.0.0.1:${server.address().port}/`));
  const stop = () => server.close(() => process.exit(0));
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
