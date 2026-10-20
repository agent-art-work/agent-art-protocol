#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleDesktopDiscovery } from '../open-gate/desktop-discovery.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

/** Static preview; optional read-only desktop detection, no OS opener. */
export function createStaticReadingServer({ directory, spa = false, desktopDiscovery = false }) {
  const root = fs.realpathSync(directory);
  return http.createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    const port = response.socket.localPort;
    const allowed = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!allowed.includes(request.headers.host)) { response.writeHead(403); response.end(); return; }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    if (desktopDiscovery && handleDesktopDiscovery(request, response)) return;
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const decoded = decodeURIComponent(url.pathname);
      if (decoded.includes('\0') || decoded.split('/').some(part => part.startsWith('.'))) throw new Error('Not a public asset.');
      let file = path.resolve(root, `.${decoded}`);
      if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Not a public asset.');
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) && spa && !path.extname(decoded)) file = path.join(root, 'index.html');
      const real = fs.realpathSync(file);
      if (!real.startsWith(root + path.sep) || !fs.statSync(real).isFile()) throw new Error('Not a public asset.');
      const contentType = TYPES[path.extname(file)];
      if (!contentType) throw new Error('Not a public asset.');
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(request.method === 'HEAD' ? undefined : fs.readFileSync(real));
    } catch { response.writeHead(404); response.end(); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = process.argv[2]; const port = Number(process.argv[3] || '4176');
  if (!directory || !Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Use serve.mjs DIRECTORY PORT [--spa].');
  const server = createStaticReadingServer({ directory, spa: process.argv.includes('--spa'), desktopDiscovery: process.argv.includes('--desktop-agents') });
  server.listen(port, '127.0.0.1', () => console.log(`Static reading preview: http://127.0.0.1:${port}/`));
  const stop = () => server.close(() => process.exit(0));
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
