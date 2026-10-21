import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRun, addObservation, summarizeRun, validateRun } from './records.mjs';
import { loadBenchInputs, ROOT } from './inputs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = new Set(['index.mjs', 'clients.mjs', 'reading.mjs', 'reading-ui.mjs', 'reading.css']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/;
const HEADERS = {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
};

/** A local testing instrument, not a runtime service required by reading sites. */
export function createBenchServer({ inputs, storeDir = path.join(ROOT, '.local/test-bench/runs') }) {
  const token = randomBytes(32).toString('hex');
  fs.mkdirSync(storeDir, { recursive: true, mode: 0o700 });
  const runFile = id => {
    if (!ID.test(id)) throw Error('Invalid run ID.');
    return path.join(storeDir, `${id}.json`);
  };
  const readRun = id => {
    const run = JSON.parse(fs.readFileSync(runFile(id), 'utf8'));
    const check = validateRun(run);
    if (!check.valid) throw Error('Stored run failed validation.');
    return run;
  };
  const writeRun = run => {
    const destination = runFile(run.id);
    const temporary = destination + `.${randomBytes(8).toString('hex')}.tmp`;
    try { fs.writeFileSync(temporary, JSON.stringify(run, null, 2) + '\n', { mode: 0o600, flag: 'wx' }); fs.renameSync(temporary, destination); }
    finally { fs.rmSync(temporary, { force: true }); }
  };
  const json = (response, status, value) => {
    response.writeHead(status, { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
  };
  const server = http.createServer(async (request, response) => {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const publicNavigation = request.method === 'GET' && request.url.split('?')[0] === '/' && request.headers['sec-fetch-mode'] === 'navigate' && request.headers['sec-fetch-dest'] === 'document';
    if (request.headers.host !== new URL(origin).host || (!publicNavigation && ((request.headers.origin && request.headers.origin !== origin) || request.headers['sec-fetch-site'] === 'cross-site'))) {
      json(response, 403, { error: 'This bench accepts same-origin loopback requests only.' }); return;
    }
    try {
      const url = new URL(request.url, origin);
      if (request.method === 'GET' && url.pathname === '/favicon.ico') { response.writeHead(204, HEADERS); response.end(); return; }
      if (request.method === 'GET' && url.pathname === '/api/config') {
        json(response, 200, { manifest: inputs.manifest, work: inputs.work, context: inputs.context, source: inputs.source, environment: inputs.environment, token }); return;
      }
      const match = url.pathname.match(/^\/api\/runs\/([a-zA-Z0-9_-]+)(\/observations)?$/);
      if (request.method === 'GET' && match && !match[2]) {
        const run = readRun(match[1]); json(response, 200, { run, summary: summarizeRun(run) }); return;
      }
      if (request.method === 'POST' && (url.pathname === '/api/runs' || match?.[2])) {
        if (request.headers['x-bench-token'] !== token || !/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) {
          json(response, 403, { error: 'Use this bench page to create or append local observations.' }); return;
        }
        const chunks = []; let length = 0;
        for await (const chunk of request) { length += chunk.length; if (length > 12000) throw Error('Observation is too large. Do not submit transcripts.'); chunks.push(chunk); }
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (url.pathname === '/api/runs') {
          if (Object.keys(value).length) throw Error('Run inputs are pinned by the bench, not supplied by the browser.');
          const run = createRun(inputs.manifest, { id: `reading-${randomUUID()}`, environment: inputs.environment });
          writeRun(run); json(response, 201, { run, summary: summarizeRun(run) }); return;
        }
        const previous = readRun(match[1]);
        if (JSON.stringify(previous.manifest) !== JSON.stringify(inputs.manifest)) throw Error('This run belongs to different pinned inputs. Start a new run.');
        const run = addObservation(previous, value);
        writeRun(run); json(response, 201, { run, summary: summarizeRun(run) }); return;
      }
      const staticFiles = { '/': 'index.html', '/bench.mjs': 'bench.mjs', '/bench.css': 'bench.css' };
      let file = staticFiles[url.pathname] && path.join(HERE, staticFiles[url.pathname]);
      if (url.pathname.startsWith('/sdk/') && ASSETS.has(url.pathname.slice(5))) file = path.join(inputs.packageDir, url.pathname.slice(5));
      if (request.method !== 'GET' || !file) { json(response, 404, { error: 'Not found.' }); return; }
      response.writeHead(200, { ...HEADERS, 'Content-Type': TYPES[path.extname(file)] }); response.end(fs.readFileSync(file));
    } catch (error) {
      json(response, error.code === 'ENOENT' ? 404 : 400, { error: error.code === 'ENOENT' ? 'Run not found.' : error.message });
    }
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const port = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : 4180;
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Choose a loopback port from 1024 to 65535.');
  const inputs = await loadBenchInputs();
  const server = createBenchServer({ inputs });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Reading test bench: http://127.0.0.1:${server.address().port}/?lane=browser`);
    console.log('Browser mode cancels native launches. Desktop mode enables explicit operator clicks; no automatic Send.');
  });
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Port occupied. Choose another --port; no process was stopped.' : error.message); process.exitCode = 1; });
  const stop = () => server.close(() => process.exit(0)); process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
