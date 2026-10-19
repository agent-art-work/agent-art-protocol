import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApi } from './server/api.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be an integer from 1024 to 65535.');
const api = await createApi({ dataDir: path.resolve(root, '../.local/mvp') });
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.mjs', ['app.mjs', 'text/javascript; charset=utf-8']],
  ['/theme.mjs', ['theme.mjs', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);
const server = http.createServer(async (req, res) => {
  try {
    const expected = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
    if (!expected.has(req.headers.host)) { res.writeHead(403); res.end('Loopback access only.'); return; }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if (req.url?.startsWith('/api/')) { await api.handle(req, res); return; }
    const entry = files.get(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
    if (!entry || req.method !== 'GET') { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': entry[1] });
    res.end(await readFile(path.join(root, 'web', entry[0])));
  } catch {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Local service error. Check the terminal.' }));
  }
});
server.on('error', async error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Try PORT=4174 npm run dev.` : error.message); await api.close?.(); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Agent Art local MVP: http://127.0.0.1:${port}/\nPrivate state stays in .local/mvp. Agent launch is a separate curator action.`));
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { if (stopping) return; stopping = true; server.close(async () => { await api.close?.(); process.exit(0); }); });
