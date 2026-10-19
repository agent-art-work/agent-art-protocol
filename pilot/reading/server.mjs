import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { discoverHandoffClients, openHandoff } from './handoff.mjs';
import { defineWork, createRecord, seal } from '@agent-art/protocol';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SDK = path.dirname(fileURLToPath(import.meta.resolve('@agent-art/protocol')));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };
const fail = (status, code, message) => Object.assign(new Error(message), { status, code });
function equal(a, b) {
  const left = Buffer.from(String(a || '')); const right = Buffer.from(String(b || ''));
  return left.length === right.length && timingSafeEqual(left, right);
}
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw fail(415, 'json_required', 'Send a JSON request.');
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 48 * 1024) throw fail(413, 'too_large', 'Request is too large.'); chunks.push(chunk); }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); } catch { throw fail(400, 'invalid_json', 'Request is not valid UTF-8 JSON.'); }
}
function json(res, value, status = 200) { res.writeHead(status, { 'Content-Type': TYPES['.json'] }); res.end(JSON.stringify(value)); }

export function readingContext(profile) {
  return `I want to read ${profile.title} with you in this conversation.

Start by fetching the public index at ${profile.indexUrl} and the relevant reading/access policy it identifies. No question has been asked yet; do not invent one. After fetching the index, briefly confirm readiness, or report any access failure. I will ask my questions here.

Use the publisher's reading request below for my subsequent questions:

${profile.prompt}`;
}

export async function createReadingServer({ siteDir, entryFile, profile, discover = discoverHandoffClients, open = openHandoff }) {
  const clients = await discover();
  const context = readingContext(profile);
  const definition = profile.work || {
    id: `urn:agent-art:reading:${profile.id}`, version: '0.1-experimental',
    title: profile.title, purpose: 'Read the publisher’s public material inside the visitor’s Agent.',
    capabilities: ['handoff'], conditions: { readingPolicy: profile.prompt, contributionReturn: false },
  };
  const work = defineWork({ ...definition, context: [
    { id: 'reading-invitation', kind: 'text', text: context, mode: 'snapshot' },
    { id: 'public-index', kind: 'reference', url: profile.indexUrl, mode: 'live' },
  ] });
  const key = randomBytes(32).toString('hex');
  // In-memory deduplication for this preview process only. No transcript or
  // reading-result ledger; restarting never opens a client automatically.
  const requests = new Map();
  async function begin(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)
        || Object.keys(input).some(name => !['client', 'conversation', 'consent', 'requestId'].includes(name))) {
      throw fail(400, 'invalid_request', 'Only a client and new-conversation open request are accepted.');
    }
    if (input.consent !== true) throw fail(400, 'consent_required', 'Choose Open to request a prepared Agent draft.');
    if (input.conversation !== 'fresh') throw fail(422, 'copy_required', 'For an existing conversation, copy the context and paste it into the conversation you choose.');
    if (typeof input.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(input.requestId)) throw fail(400, 'request_id_required', 'An open request identifier is required.');
    const client = clients.find(item => item.id === input.client);
    if (!client?.available) throw fail(422, 'client_unavailable', 'This native client route is unavailable. Copy the Lab context instead.');
    const prior = requests.get(input.requestId);
    if (prior) {
      if (prior.client !== input.client) throw fail(409, 'request_conflict', 'This identifier belongs to a different open request.');
      return prior.operation;
    }
    if (requests.size >= 256) throw fail(429, 'request_limit', 'This local preview reached its open-request limit. Use Copy context.');
    const operation = Promise.resolve().then(() => open({ client: input.client, conversation: 'fresh', prompt: context }))
      .then(async () => ({ requested: true, client: input.client, conversation: 'fresh', requiresSend: true,
        evidence: await seal(createRecord({ work, observations: [{
          id: randomUUID(), observer: 'local-handoff-helper', event: 'native-open-request-accepted',
          subjects: [work.id],
          material: { client: input.client, conversation: 'fresh', context: 'reading-invitation', outcome: 'OS accepted open request', observedAt: new Date().toISOString() },
          trust: ['Local helper and operating system are trusted for this observation.'],
          limits: ['No composer placement, sending, model exposure, reading or answer was observed.', 'The index URL is live; its fetched bytes are not retained by this handoff.'],
        }] })),
      }))
      .catch(() => { throw fail(422, 'open_failed', 'The app open request could not be confirmed. Check your Agent or use Copy context.'); });
    requests.set(input.requestId, { client: input.client, operation });
    return operation;
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    try {
      const port = server.address()?.port;
      const allowedHosts = [`127.0.0.1:${port}`, `localhost:${port}`];
      if (!allowedHosts.includes(req.headers.host)) throw fail(403, 'host_rejected', 'This pilot is available only on loopback.');
      const origin = `http://${req.headers.host}`;
      if (req.headers.origin && req.headers.origin !== origin) throw fail(403, 'origin_rejected', 'Cross-origin requests are not allowed.');
      if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) throw fail(403, 'site_rejected', 'Cross-site requests are not allowed.');
      const url = new URL(req.url, origin);
      if (url.search && url.pathname.startsWith('/__bridge/')) throw fail(400, 'query_rejected', 'Bridge routes do not accept query parameters.');
      const route = decodeURIComponent(url.pathname);
      if (route.startsWith('/__bridge/api/')) {
        if (route === '/__bridge/api/config' && req.method === 'GET') return json(res, {
          key, profile: { id: profile.id, title: profile.title, indexUrl: profile.indexUrl, prompt: profile.prompt }, context, clients, work,
        });
        if (route === '/__bridge/api/open' && req.method === 'POST') {
          if (!equal(req.headers['x-bridge-key'], key)) throw fail(403, 'authority_required', 'Reload this local preview before continuing.');
          return json(res, await begin(await body(req)), 202);
        }
        throw fail(404, 'not_found', 'Unknown handoff route.');
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw fail(405, 'method_rejected', 'Only local bridge routes accept changes.');
      let file;
      const protocolModule = /^\/__bridge\/protocol\/([a-z-]+\.mjs)$/.exec(route);
      if (protocolModule && ['index.mjs', 'clients.mjs'].includes(protocolModule[1])) file = path.join(SDK, protocolModule[1]);
      else if (route === '/__bridge/ui.mjs') file = path.join(HERE, 'ui.mjs');
      else if (route === '/__bridge/ui.css') file = path.join(HERE, 'ui.css');
      else if (route === '/__bridge/lab-entry.mjs') file = entryFile;
      else {
        if (route.startsWith('/__bridge/') || route.includes('\0') || route.split('/').some(part => part.startsWith('.'))) throw fail(404, 'not_found', 'Not found.');
        file = path.resolve(siteDir, `.${route}${route.endsWith('/') ? 'index.html' : ''}`);
        if (!file.startsWith(`${path.resolve(siteDir)}${path.sep}`)) throw fail(404, 'not_found', 'Not found.');
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      }
      if (!file || !TYPES[path.extname(file)] || !fs.existsSync(file) || !fs.statSync(file).isFile()) throw fail(404, 'not_found', 'Not found.');
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] });
      return req.method === 'HEAD' ? res.end() : res.end(fs.readFileSync(file));
    } catch (error) {
      if (res.headersSent) return res.end();
      json(res, { error: { code: error.code || 'bridge_error', message: error.status ? error.message : 'The local bridge could not complete this step.' } }, error.status || 500);
    }
  });
  const shutdown = () => { /* No model process or callback listener to stop. */ };
  return { server, key, shutdown };
}
