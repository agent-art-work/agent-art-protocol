import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, output } from './prepare.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = new Set(['index.mjs', 'clients.mjs', 'reading.mjs', 'reading-ui.mjs', 'reading.css']);
export function createFixtureServer({ packageDir }) {
  return http.createServer((request, response) => {
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'" };
    if (request.method !== 'GET') { response.writeHead(405, headers); response.end(); return; }
    const route = request.url.split('?')[0];
    if (route === '/favicon.ico') { response.writeHead(204, headers); response.end(); return; }
    const files = { '/': 'index.html', '/fixture.css': 'fixture.css', '/fixture.mjs': 'fixture.mjs',
      '/ui-behavior-fixtures.mjs': 'ui-behavior-fixtures.mjs', '/ui-feedback-fixtures.mjs': 'ui-feedback-fixtures.mjs' };
    let file = files[route] && path.join(HERE, files[route]);
    const prefix = '/assets/agent-art-sdk/';
    if (route.startsWith(prefix) && ASSETS.has(route.slice(prefix.length))) file = path.join(packageDir, route.slice(prefix.length));
    if (route === '/assets/agent-art-reading-work.mjs') {
      const work = fs.readFileSync(path.join(ROOT, 'test-bench/lab-work.json'), 'utf8');
      response.writeHead(200, { ...headers, 'Content-Type': 'text/javascript; charset=utf-8' }); response.end('export default ' + work + ';'); return;
    }
    if (!file || !fs.existsSync(file)) { response.writeHead(404, headers); response.end(); return; }
    const type = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript' }[path.extname(file)];
    response.writeHead(200, { ...headers, 'Content-Type': type + '; charset=utf-8' }); response.end(fs.readFileSync(file));
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const record = JSON.parse(fs.readFileSync(path.join(output, 'candidate.json')));
  const server = createFixtureServer({ packageDir: path.join(ROOT, record.packageDir) });
  server.listen(0, '127.0.0.1', () => console.log('Flat-label fixture: http://127.0.0.1:' + server.address().port + '/'));
}
