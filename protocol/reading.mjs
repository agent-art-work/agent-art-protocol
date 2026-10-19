import { canonicalJSON, defineWork, createRecord, seal } from './index.mjs';
import { buildClientHandoff } from './clients.mjs';

const CLIENTS = ['codex-app', 'claude-app', 'manual'];
const EVENTS = ['handoff-requested', 'context-copied', 'manual-context-selected'];

function options(value, allowed, label) {
  const copied = JSON.parse(canonicalJSON(value));
  if (!copied || typeof copied !== 'object' || Array.isArray(copied)) throw new TypeError(`${label} must be a plain object.`);
  for (const key of Object.keys(copied)) if (!allowed.includes(key)) throw new TypeError(`${label}.${key} is not supported.`);
  return copied;
}

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}

function publicReference(value) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  // No DNS resolution or network request is performed. Requiring an HTTPS DNS
  // name excludes obvious local/IP destinations, not private DNS resolution.
  if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.')
      || host.includes(':') || /^[\d.]+$/.test(host)
      || ['localhost', 'local', 'internal', 'test', 'invalid', 'example'].some(suffix => host === suffix || host.endsWith(`.${suffix}`))) {
    throw new TypeError('Reading references must use public HTTPS DNS URLs, without credentials or local/IP destinations. DNS reachability and public access are not checked.');
  }
}

function clientList(value) {
  if (!Array.isArray(value) || value.some(client => !CLIENTS.includes(client)) || new Set(value).size !== value.length) {
    throw new TypeError('Reading clients must be unique codex-app, claude-app or manual identifiers.');
  }
  return value.includes('manual') ? value : [...value, 'manual'];
}

function timestamp(value) {
  if (typeof value !== 'string') throw new TypeError('observedAt must be an ISO timestamp.');
  try { if (new Date(value).toISOString() === value) return value; } catch { /* Invalid dates remain invalid. */ }
  throw new TypeError('observedAt must be an exact ISO timestamp.');
}

/**
 * Prepare public reading context and optional caller-observed receipts.
 * This controller performs no DOM operation, app opening, clipboard operation,
 * fetch, storage, Agent enrollment, inference or conversation inspection.
 */
export function createReading(input) {
  const configuration = options(input, ['work', 'context', 'clients'], 'reading');
  const work = defineWork(configuration.work);
  if (work.capabilities.length !== 1 || work.capabilities[0] !== 'handoff') throw new TypeError('The reading profile requires only the handoff capability.');
  if (work.conditions.evidence?.requireAgentAct || work.conditions.evidence?.requireConsequence) throw new TypeError('Reading handoff cannot require an Agent Act or artifact consequence.');
  const references = work.context.filter(item => item.kind === 'reference');
  if (!references.length) throw new TypeError('Reading needs a public HTTPS index or source reference.');
  references.forEach(item => publicReference(item.url));
  const offered = work.context.filter(item => item.kind === 'text');
  const context = configuration.context ?? (offered.length === 1 ? offered[0].text : undefined);
  if (typeof context !== 'string' || !context.trim() || !offered.some(item => item.text === context)) {
    throw new TypeError('Reading context must exactly match a retained text snapshot. Select context explicitly when several text snapshots exist.');
  }
  const contextId = offered.find(item => item.text === context).id;
  const clients = clientList(configuration.clients ?? CLIENTS);
  // Validate the offered native context limits once; manual copying remains
  // available even when a public context is too large for a native URL.
  let nativeContextSupported = true;
  try { buildClientHandoff({ client: 'codex-app', prompt: context }); }
  catch { nativeContextSupported = false; }
  const frame = freeze({ work, context, clients });

  function prepare(input) {
    const request = options(input, ['client', 'conversation'], 'reading request');
    const { client, conversation = 'fresh' } = request;
    if (!clients.includes(client)) throw new TypeError('Choose a configured reading client.');
    if (!['fresh', 'existing'].includes(conversation)) throw new TypeError('Conversation must be fresh or existing. Existing conversations always require manual paste.');
    if (client === 'manual' || conversation === 'existing' || !nativeContextSupported) {
      return freeze({ kind: 'manual', client, conversation, context, requiresSend: true });
    }
    const prepared = buildClientHandoff({ client, conversation: 'fresh', surface: 'chat', prompt: context });
    return freeze({ kind: 'native', client, conversation: 'fresh', context, url: prepared.url, requiresSend: true });
  }

  async function receipt(input) {
    const observation = options(input, ['event', 'client', 'conversation', 'observer', 'observedAt'], 'reading observation');
    if (!EVENTS.includes(observation.event)) throw new TypeError('Only handoff-requested, context-copied or manual-context-selected observations are supported.');
    const plan = prepare({ client: observation.client, ...(observation.conversation !== undefined ? { conversation: observation.conversation } : {}) });
    if (observation.event === 'handoff-requested' && plan.kind !== 'native') throw new TypeError('A handoff-requested receipt requires a fresh native handoff plan. Manual copying is a separate observation.');
    if (typeof observation.observer !== 'string' || !observation.observer.trim()) throw new TypeError('Name the application or browser reporting this observation.');
    if (!globalThis.crypto?.randomUUID) throw new Error('Web Crypto randomUUID is required to identify a reading observation.');
    const observedAt = observation.observedAt === undefined ? new Date().toISOString() : timestamp(observation.observedAt);
    return seal(createRecord({ work: frame.work, observations: [{
      id: `reading-observation:${crypto.randomUUID()}`,
      observer: observation.observer,
      event: observation.event,
      subjects: [work.id, contextId],
      material: { client: plan.client, conversation: plan.conversation, context: contextId, observedAt },
      trust: ['The named calling application or browser is trusted to report only an action it actually observed.', 'The SDK preserves the supplied public frame and statement; it is not an independent witness.'],
      limits: [
        observation.event === 'handoff-requested'
          ? 'A native URL handoff was requested. Installation, OS acceptance and composer placement were not established.'
          : observation.event === 'context-copied'
            ? 'The caller reports copying the context. A subsequent paste or delivery was not established.'
            : 'The caller reports selecting context for manual copying. Copying or delivery was not established.',
        'No Send, model exposure, reading, answer, existing conversation identity or private history was observed.',
        'Reference URLs identify offered source locations. Their fetched bytes, reachability and public access were not checked.',
        'This is an unsigned, recomputable local statement and does not establish Agent execution origin.',
      ],
    }] }));
  }

  return Object.freeze({ ...frame, prepare, receipt });
}
