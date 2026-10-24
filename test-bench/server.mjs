import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { createRun, addObservation, summarizeRun, validateRun } from './records.mjs';
import { loadBenchInputs, ROOT } from './inputs.mjs';
import { caseForRun, observeCase, pathsFor } from './desktop-runner.mjs';
import { writeAtomic } from './authority-store.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = new Set(['index.mjs', 'clients.mjs', 'reading.mjs', 'reading-ui.mjs', 'reading.css']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/;
const ISO_DATE = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/u;
const timestamp = value => typeof value === 'string' && ISO_DATE.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const exactFields = (value, fields) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));
const DISPATCH_FIELDS = ['client', 'lane', 'cancelled', 'isTrusted', 'at'];
function validateDispatch(value) {
  if (!exactFields(value, DISPATCH_FIELDS) || !['claude-app', 'codex-app'].includes(value.client)
      || !['browser', 'desktop'].includes(value.lane) || typeof value.cancelled !== 'boolean'
      || typeof value.isTrusted !== 'boolean' || !timestamp(value.at)) throw Error('Use only bounded dispatch event fields. No transcript, URL or target text.');
}
const HEADERS = {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
};

/** A local testing instrument, not a runtime service required by reading sites. */
export function createBenchServer({ inputs, storeDir = path.join(ROOT, '.local/test-bench/runs'), desktopRoot }) {
  const token = randomBytes(32).toString('hex');
  // Custom standalone stores retain the historical operator-only bench path.
  // A runner-aware store must name the same canonical run directory as its root.
  const caseRoot = desktopRoot ?? (path.resolve(storeDir) === path.join(ROOT, '.local/test-bench/runs') ? ROOT : undefined);
  if (caseRoot && path.resolve(storeDir) !== path.join(path.resolve(caseRoot), '.local/test-bench/runs')) throw Error('Desktop cases and bench observations must share one canonical run store.');
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
  const dispatchFile = id => path.join(storeDir, `${id}.dispatches.json`);
  const readDispatches = run => {
    if (JSON.stringify(run.manifest) !== JSON.stringify(inputs.manifest)) throw Error('This run belongs to different pinned inputs. Start a new run.');
    const file = dispatchFile(run.id);
    const value = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8'))
      : { provenance: 'owned-bench-run-receipt', runId: run.id, manifest: run.manifest, dispatches: [] };
    if (!exactFields(value, ['provenance', 'runId', 'manifest', 'dispatches'])
      || value.provenance !== 'owned-bench-run-receipt' || value.runId !== run.id
      || JSON.stringify(value.manifest) !== JSON.stringify(run.manifest)
      || !Array.isArray(value.dispatches) || value.dispatches.length > 4) throw Error('Stored bounded dispatch receipt failed validation.');
    value.dispatches.forEach((entry, index) => {
      if (!exactFields(entry, [...DISPATCH_FIELDS, 'recordedAt', 'ordinal']) || !timestamp(entry.recordedAt)
          || entry.ordinal !== index + 1) throw Error('Stored bounded dispatch receipt failed validation.');
      validateDispatch(Object.fromEntries(DISPATCH_FIELDS.map(key => [key, entry[key]])));
    });
    return value;
  };
  const appendDispatch = (run, value) => {
    validateDispatch(value);
    const age = Date.now() - Date.parse(value.at);
    if (age < -30000 || age > 120000 || Date.parse(value.at) < Date.parse(run.startedAt) - 30000) throw Error('Dispatch event timestamp is outside the bounded recording interval.');
    const record = readDispatches(run);
    if (record.dispatches.length >= 4) throw Error('This run has consumed its four dispatch receipt slots.');
    const entry = { ...value, recordedAt: new Date().toISOString(), ordinal: record.dispatches.length + 1 };
    const result = { ...record, dispatches: [...record.dispatches, entry] };
    // This is page/server-attributed browser evidence, never an authority claim
    // or independent proof that isTrusted, cancellation or native arrival is true.
    writeAtomic(dispatchFile(run.id), result);
    return result;
  };
  const json = (response, status, value) => {
    response.writeHead(status, { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
  };
  const appendToCase = async (caseId, observation) => {
    const mutex = pathsFor(caseId, caseRoot).mutex, deadline = Date.now() + 2000;
    for (;;) {
      try { return observeCase(caseId, observation, { root: caseRoot }); }
      catch (error) {
        // The lock is acquired before any mutation. Only this known pre-write
        // contention is safe to retry; validation/lifecycle failures are final.
        if (error.code !== 'EEXIST' || error.path !== mutex) throw error;
        if (Date.now() >= deadline) {
          const busy = Error('Desktop case is busy; this observation was not saved.');
          busy.statusCode = 409; throw busy;
        }
        await delay(10);
      }
    }
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
      const match = url.pathname.match(/^\/api\/runs\/([a-zA-Z0-9_-]+)(\/observations|\/dispatches)?$/);
      if (request.method === 'GET' && match?.[2] === '/dispatches') {
        json(response, 200, readDispatches(readRun(match[1]))); return;
      }
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
        if (match[2] === '/dispatches') {
          json(response, 201, appendDispatch(previous, value)); return;
        }
        const owner = caseRoot && caseForRun(match[1], { root: caseRoot });
        if (owner) {
          const result = await appendToCase(owner.id, value);
          json(response, 201, result); return;
        }
        const run = addObservation(previous, value);
        writeRun(run); json(response, 201, { run, summary: summarizeRun(run) }); return;
      }
      const staticFiles = { '/': 'index.html', '/bench.mjs': 'bench.mjs', '/after-dispatch.mjs': 'after-dispatch.mjs', '/bench.css': 'bench.css', '/ui-candidate-fixtures.mjs': 'ui-candidate-fixtures.mjs', '/ui-fixtures-014.mjs': 'ui-fixtures-014.mjs', '/ui-feedback-fixtures-014.mjs': 'ui-feedback-fixtures-014.mjs' };
      let file = staticFiles[url.pathname] && path.join(HERE, staticFiles[url.pathname]);
      if (url.pathname.startsWith('/sdk/') && ASSETS.has(url.pathname.slice(5))) file = path.join(inputs.packageDir, url.pathname.slice(5));
      // Reuse unchanged public synthetic UI fixtures against the current pinned
      // package. These are explicit local routes, never arbitrary file paths.
      if (url.pathname === '/ui-fixtures.mjs') file = path.join(ROOT, 'pilot/reading-sdk-012/ui-fixtures.mjs');
      if (url.pathname === '/assets/agent-art-reading-work.mjs') file = path.join(ROOT, 'pilot/reading-sdk-012/work.mjs');
      const fixturePrefix = '/assets/agent-art-sdk/';
      if (url.pathname.startsWith(fixturePrefix) && ASSETS.has(url.pathname.slice(fixturePrefix.length))) file = path.join(inputs.packageDir, url.pathname.slice(fixturePrefix.length));
      if (request.method !== 'GET' || !file) { json(response, 404, { error: 'Not found.' }); return; }
      response.writeHead(200, { ...HEADERS, 'Content-Type': TYPES[path.extname(file)] }); response.end(fs.readFileSync(file));
    } catch (error) {
      json(response, error.statusCode || (error.code === 'ENOENT' ? 404 : 400), { error: error.code === 'ENOENT' ? 'Run not found.' : error.message });
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
