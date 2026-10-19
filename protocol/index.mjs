// Experimental, dependency-free reference records. No inference, transport,
// signing authority or model-origin attestation is provided by this module.
export { buildClientHandoff } from './clients.mjs';
export const SCHEMA = 'agent-art-protocol/0.1-experimental';

const encoder = new TextEncoder();
const own = (value, name) => Object.hasOwn(value, name);
const STATUSES = new Set(['supported', 'contradicted', 'not-established']);
const ALGORITHM = 'sha256';
const MAX_DEPTH = 64;

function fail(message) { throw new TypeError(message); }
function object(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
      || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(`${label} must be a plain object.`);
  return value;
}
function text(value, label, { empty = false } = {}) {
  if (typeof value !== 'string' || (!empty && !value.trim()) || !value.isWellFormed() || value.includes('\u0000')) fail(`${label} must be well-formed text${empty ? '' : ' with a nonempty value'}.`);
  return value;
}
function fields(value, allowed, required, label) {
  object(value, label);
  if (Object.getOwnPropertySymbols(value).length) fail(`${label} must not contain symbol keys.`);
  for (const key of Object.getOwnPropertyNames(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!own(descriptor, 'value') || !descriptor.enumerable) fail(`${label} must use enumerable JSON data properties.`);
  }
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${label}.${key} is not a supported field.`);
  for (const key of required) if (!own(value, key)) fail(`${label}.${key} is required.`);
}
function list(value, label) { if (!Array.isArray(value)) fail(`${label} must be an array.`); return value; }
function stringList(value, label) {
  list(value, label).forEach(item => text(item, label));
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicate values.`);
  return value;
}

// Key-sorted JSON, without Unicode or line-ending normalization. This is an
// explicitly specified experimental encoding, not a claim of RFC 8785 support.
export function canonicalJSON(value) {
  const ancestors = new Set();
  const encode = (item, depth) => {
    if (depth > MAX_DEPTH) fail('JSON nesting exceeds 64 levels.');
    if (item === null || typeof item === 'boolean') return JSON.stringify(item);
    if (typeof item === 'string') { text(item, 'JSON string', { empty: true }); return JSON.stringify(item); }
    if (typeof item === 'number') {
      if (!Number.isFinite(item) || Object.is(item, -0)) fail('JSON numbers must be finite and must not be negative zero.');
      return JSON.stringify(item);
    }
    if (typeof item !== 'object') fail('Records accept JSON values only; undefined, functions and other non-JSON values are rejected.');
    if (ancestors.has(item)) fail('JSON values must not be cyclic.');
    ancestors.add(item);
    let encoded;
    if (Array.isArray(item)) {
      if (Object.keys(item).length !== item.length || Object.getOwnPropertyNames(item).length !== item.length + 1 || Object.getOwnPropertySymbols(item).length) fail('JSON arrays must be dense without extra properties.');
      for (let index = 0; index < item.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(item, String(index));
        if (!descriptor || !own(descriptor, 'value') || !descriptor.enumerable) fail('JSON arrays must contain enumerable data properties.');
      }
      encoded = `[${item.map(entry => encode(entry, depth + 1)).join(',')}]`;
    } else {
      object(item, 'JSON value');
      if (Object.getOwnPropertySymbols(item).length) fail('JSON symbol keys are not supported.');
      if (Object.getOwnPropertyNames(item).length !== Object.keys(item).length) fail('JSON properties must be enumerable.');
      encoded = `{${Object.keys(item).sort().map(key => {
        text(key, 'JSON key', { empty: true });
        const descriptor = Object.getOwnPropertyDescriptor(item, key);
        if (!own(descriptor, 'value')) fail('JSON accessors are not supported.');
        return `${JSON.stringify(key)}:${encode(descriptor.value, depth + 1)}`;
      }).join(',')}}`;
    }
    ancestors.delete(item);
    return encoded;
  };
  return encode(value, 0);
}

const copy = value => JSON.parse(canonicalJSON(value));

function contextItem(value) {
  fields(value, ['id', 'kind', 'text', 'url', 'mode', 'digest'], ['id', 'kind', 'mode'], 'context');
  text(value.id, 'context.id');
  if (!['text', 'reference'].includes(value.kind)) fail('context.kind must be text or reference.');
  if (!['snapshot', 'live'].includes(value.mode)) fail('context.mode must be snapshot or live.');
  if (value.kind === 'text') {
    text(value.text, 'context.text', { empty: true });
    if (own(value, 'url') || value.mode !== 'snapshot') fail('Text context is an exact snapshot, without a URL.');
  } else {
    text(value.url, 'context.url');
    let url;
    try { url = new URL(value.url); } catch { fail('Context references need absolute HTTP(S) URLs.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail('Context references need HTTP(S) URLs without embedded credentials.');
    if (own(value, 'text')) fail('Reference context cannot also contain text.');
    if (value.mode === 'snapshot' && !value.digest) fail('Snapshot references need a digest; a live URL does not pin fetched bytes.');
  }
  if (own(value, 'digest') && !/^sha256:[a-f0-9]{64}$/.test(value.digest)) fail('Context digest must be sha256:<lowercase hexadecimal>.');
}

export function defineWork(value) {
  value = copy(value);
  fields(value, ['id', 'version', 'title', 'purpose', 'capabilities', 'context', 'conditions', 'publisher'], ['id', 'version', 'title', 'purpose', 'capabilities', 'context', 'conditions'], 'work');
  for (const key of ['id', 'version', 'title', 'purpose']) text(value[key], `work.${key}`);
  stringList(value.capabilities, 'work.capabilities');
  if (!value.capabilities.length || value.capabilities.some(item => !['handoff', 'participation'].includes(item))) fail('Work capabilities must name handoff and/or participation.');
  list(value.context, 'work.context').forEach(contextItem);
  if (new Set(value.context.map(item => item.id)).size !== value.context.length) fail('Work context identifiers must be unique.');
  object(value.conditions, 'work.conditions');
  if (value.conditions.evidence !== undefined) {
    fields(value.conditions.evidence, ['requireAgentAct', 'requireConsequence'], [], 'work.conditions.evidence');
    for (const flag of Object.values(value.conditions.evidence)) if (typeof flag !== 'boolean') fail('Evidence requirement flags must be boolean.');
  }
  if (value.publisher !== undefined) {
    fields(value.publisher, ['id', 'label'], ['id', 'label'], 'work.publisher');
    text(value.publisher.id, 'work.publisher.id'); text(value.publisher.label, 'work.publisher.label');
  }
  return value;
}

export function participant(value) {
  value = copy(value);
  fields(value, ['id', 'kind', 'label', 'roles', 'authority'], ['id', 'kind', 'label'], 'participant');
  text(value.id, 'participant.id'); text(value.label, 'participant.label');
  if (!['human', 'agent', 'service'].includes(value.kind)) fail('Participant kind must be human, agent or service.');
  if (value.roles !== undefined) stringList(value.roles, 'participant.roles');
  return value;
}

export function act(value) {
  value = copy(value);
  fields(value, ['id', 'participant', 'kind', 'content', 'context'], ['id', 'participant', 'kind', 'content'], 'act');
  for (const key of ['id', 'participant', 'kind']) text(value[key], `act.${key}`);
  if (value.context !== undefined) {
    fields(value.context, ['workVersion', 'actIds'], ['workVersion'], 'act.context');
    text(value.context.workVersion, 'act.context.workVersion');
    if (value.context.actIds !== undefined) stringList(value.context.actIds, 'act.context.actIds');
  }
  return value;
}

export function relation(value) {
  value = copy(value);
  fields(value, ['id', 'participant', 'kind', 'from', 'to'], ['id', 'participant', 'kind', 'from', 'to'], 'relation');
  for (const key of ['id', 'participant', 'kind', 'from']) text(value[key], `relation.${key}`);
  fields(value.to, ['type', 'id'], ['type', 'id'], 'relation.to');
  if (!['work', 'act'].includes(value.to.type)) fail('Relation target type must be work or act.');
  text(value.to.id, 'relation.to.id');
  return value;
}

function observation(value) {
  value = copy(value);
  fields(value, ['id', 'observer', 'event', 'subjects', 'material', 'trust', 'limits'], ['id', 'observer', 'event', 'subjects', 'trust', 'limits'], 'observation');
  for (const key of ['id', 'observer', 'event']) text(value[key], `observation.${key}`);
  for (const key of ['subjects', 'trust', 'limits']) stringList(value[key], `observation.${key}`);
  return value;
}

function artifact(value) {
  value = copy(value);
  fields(value, ['id', 'mediaType', 'content', 'actIds', 'claims'], ['id', 'mediaType', 'content'], 'artifact');
  text(value.id, 'artifact.id'); text(value.mediaType, 'artifact.mediaType'); text(value.content, 'artifact.content', { empty: true });
  for (const key of ['actIds', 'claims']) if (value[key] !== undefined) stringList(value[key], `artifact.${key}`);
  return value;
}

export function createRecord(value) {
  value = copy(value);
  fields(value, ['schema', 'work', 'instance', 'participants', 'acts', 'relations', 'observations', 'artifacts'], ['work'], 'record');
  if (value.schema !== undefined && value.schema !== SCHEMA) fail('Unsupported record schema.');
  if (value.instance !== undefined) text(value.instance, 'record.instance');
  const record = {
    schema: SCHEMA,
    work: defineWork(value.work),
    ...(value.instance !== undefined ? { instance: value.instance } : {}),
    participants: list(value.participants ?? [], 'record.participants').map(participant),
    acts: list(value.acts ?? [], 'record.acts').map(act),
    relations: list(value.relations ?? [], 'record.relations').map(relation),
    observations: list(value.observations ?? [], 'record.observations').map(observation),
    artifacts: list(value.artifacts ?? [], 'record.artifacts').map(artifact),
  };
  if ((record.acts.length || record.relations.length || record.artifacts.length) && !record.instance) fail('Retained participation requires an identifiable encounter instance.');
  const identifiers = [record.work.id, ...record.work.context.map(item => item.id), ...(record.instance ? [record.instance] : []), ...['participants', 'acts', 'relations', 'observations', 'artifacts'].flatMap(key => record[key].map(item => item.id))];
  if (new Set(identifiers).size !== identifiers.length) fail('Record identifiers must be unique across the record.');
  const participants = new Set(record.participants.map(item => item.id));
  const acts = new Set(record.acts.map(item => item.id));
  const subjects = new Set(identifiers);
  for (const item of record.acts) {
    if (!participants.has(item.participant)) fail(`Act ${item.id} references an unknown Participant.`);
    if (item.context && item.context.workVersion !== record.work.version) fail(`Act ${item.id} addresses a different Work version.`);
    if (item.context?.actIds?.some(id => !acts.has(id) || id === item.id)) fail(`Act ${item.id} context contains an unknown or self Act reference.`);
  }
  for (const item of record.relations) {
    if (!participants.has(item.participant) || !acts.has(item.from)) fail(`Relation ${item.id} has an unknown declarer or source Act.`);
    if (item.to.type === 'work' ? item.to.id !== record.work.id : !acts.has(item.to.id)) fail(`Relation ${item.id} has an unknown target.`);
  }
  for (const item of record.observations) if (item.subjects.some(id => !subjects.has(id))) fail(`Observation ${item.id} has an unknown subject.`);
  for (const item of record.artifacts) if (item.actIds?.some(id => !acts.has(id))) fail(`Artifact ${item.id} has an unknown Act reference.`);
  if (!record.work.capabilities.includes('participation') && (record.acts.length || record.relations.length || record.artifacts.length)) fail('Participation records require the participation capability.');
  return record;
}

async function digest(value) {
  return digestBytes(encoder.encode(canonicalJSON(value)));
}

async function digestBytes(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto SHA-256 is required.');
  const output = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(output), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function seal(value) {
  const record = createRecord(value);
  return { ...record, integrity: { algorithm: ALGORITHM, digest: await digest(record) } };
}

export async function verify(value, { checkConsequence } = {}) {
  const checks = [];
  const add = (claim, status, detail, subject) => checks.push({ claim, status, detail, ...(subject ? { subject } : {}) });
  const limits = [
    'The seal is an unsigned, recomputable digest. It detects changes relative to this digest; it does not establish an independent original, issuer identity or provenance.',
    'Participant attribution, observations and declared trust dependencies remain supplied assertions. No credential, model execution, private intention or absence of host intervention is independently established.',
    'Consequence checks execute application-supplied rules on retained material. They do not establish artistic significance or a live website display.',
  ];
  let record;
  try {
    fields(value, ['schema', 'work', 'instance', 'participants', 'acts', 'relations', 'observations', 'artifacts', 'integrity'], ['work', 'integrity'], 'sealed record');
    const { integrity, ...body } = copy(value);
    record = createRecord(body);
    fields(integrity, ['algorithm', 'digest'], ['algorithm', 'digest'], 'integrity');
    if (integrity.algorithm !== ALGORITHM || !/^[a-f0-9]{64}$/.test(integrity.digest)) fail('Unsupported integrity declaration.');
    add('record-structure-and-references', 'supported', 'Declared fields, Work version bindings, identifier uniqueness and local references are valid.');
    try {
      const matches = await digest(body) === integrity.digest;
      add('record-integrity', matches ? 'supported' : 'contradicted', matches ? 'Retained values match the declared SHA-256 digest under the experimental encoding.' : 'Retained values differ from the declared digest.');
      if (!matches) record = null;
    } catch {
      add('record-integrity', 'not-established', 'SHA-256 could not be evaluated in this runtime.');
      record = null;
    }
  } catch (error) {
    add('record-structure-and-references', 'contradicted', error instanceof Error ? error.message : 'Invalid record.');
    add('record-integrity', 'not-established', 'A valid, exactly interpretable sealed record is required.');
  }
  add('agent-execution-origin', 'not-established', 'This verifier has no independent model-origin or execution attestation.');
  if (!record) return { checks, limits };

  for (const item of record.work.context) {
    if (item.kind === 'text' && item.digest) {
      const matches = `sha256:${await digestBytes(encoder.encode(item.text))}` === item.digest;
      add('context-snapshot-digest', matches ? 'supported' : 'contradicted', matches ? 'Exact retained UTF-8 context bytes match the declared digest.' : 'Retained text differs from its declared context digest.', item.id);
    } else if (item.kind === 'reference') {
      add('referenced-context-acquisition', 'not-established', item.mode === 'live' ? 'A live context reference identifies a discovery location, not any fetched content.' : 'A reference digest identifies intended bytes; this verifier did not fetch and compare the source.', item.id);
    }
  }

  const agentIds = new Set(record.participants.filter(item => item.kind === 'agent').map(item => item.id));
  const agentActs = record.acts.filter(item => agentIds.has(item.participant));
  const required = record.work.conditions.evidence ?? {};
  add('attributed-agent-contribution-preserved', agentActs.length ? 'supported' : 'not-established', agentActs.length
    ? `${agentActs.length} retained Act(s) are attributed to declared Agent Participants. This checks preservation and attribution within the package, not authorship or intention.`
    : required.requireAgentAct ? 'This Work requires an Agent-attributed Act, but none is retained. The encounter may still be awaiting participation; absence is not proof of a false claim.' : 'No Agent Act is required or inferred for this encounter.');

  let consequenceChecks = [];
  if (checkConsequence !== undefined) {
    try {
      if (typeof checkConsequence !== 'function') fail('checkConsequence must be a function.');
      const output = await checkConsequence(copy(record));
      list(output, 'consequence checks');
      consequenceChecks = output.map(item => {
        fields(item, ['claim', 'status', 'detail', 'subject'], ['claim', 'status', 'detail', 'subject'], 'consequence check');
        text(item.claim, 'consequence check.claim'); text(item.detail, 'consequence check.detail');
        if (['record-integrity', 'record-structure-and-references', 'agent-execution-origin', 'attributed-agent-contribution-preserved', 'required-artifact-consequence', 'context-snapshot-digest', 'referenced-context-acquisition'].includes(item.claim)) fail('Application consequence findings must not replace core verification claims.');
        if (!STATUSES.has(item.status)) fail('Invalid consequence check status.');
        if (!record.artifacts.some(artifact => artifact.id === item.subject)) fail('A consequence check must identify a retained artifact.');
        return copy(item);
      });
      checks.push(...consequenceChecks);
    } catch {
      add('artifact-consequence', 'not-established', 'The application consequence checker failed or returned unbound findings.');
    }
  }
  if (required.requireConsequence) {
    const covered = record.artifacts.length > 0 && record.artifacts.every(artifact => consequenceChecks.some(item => item.subject === artifact.id && item.status === 'supported') && !consequenceChecks.some(item => item.subject === artifact.id && item.status !== 'supported'));
    add('required-artifact-consequence', covered ? 'supported' : consequenceChecks.some(item => item.status === 'contradicted') ? 'contradicted' : 'not-established', covered
      ? 'Application-supplied consequence findings support every retained artifact under their stated checking scope.'
      : 'This Work requires consequence checking; complete supported artifact findings are unavailable or contradicted.');
  } else if (!consequenceChecks.length && checkConsequence === undefined) {
    add('artifact-consequence', 'not-established', 'No consequence check was requested; a handoff does not imply a contribution or resulting artifact.');
  }
  return { checks, limits };
}

export const sealRecord = seal;
export const verifyRecord = verify;
