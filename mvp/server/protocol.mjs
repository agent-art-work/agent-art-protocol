import { createHash, randomUUID } from 'node:crypto';

export const id = (prefix) => `${prefix}_${randomUUID()}`;
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export const digest = value => `sha256:${createHash('sha256').update(typeof value === 'string' ? value : canonical(value), 'utf8').digest('hex')}`;
export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export function assert(condition, status, code, message) { if (!condition) throw new ApiError(status, code, message); }
export function exactKeys(object, allowed) {
  assert(object && !Array.isArray(object) && typeof object === 'object', 400, 'invalid_object', 'A JSON object is required.');
  assert(Object.keys(object).every(k => allowed.includes(k)), 400, 'unsupported_field', 'The request contains an unsupported field.');
}
export function line(text, max = 280) {
  assert(typeof text === 'string' && text.trim().length > 0 && [...text].length <= max && !/[\u0000-\u001f\u007f]/u.test(text), 400, 'invalid_text', `Supply one nonempty line of at most ${max} characters, without control characters.`);
  assert(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(text), 400, 'invalid_unicode', 'Text must be valid Unicode.');
  return text;
}

const definitionBody = {
  protocol: 'agent-art-local-mvp/0.1',
  name: 'THOUGHT — local participation study',
  profile: 'thought-local-text/1',
  status: 'candidate local MVP; not production THOUGHT rules',
  artist: { name: 'Inshell', role: 'artistic framing; this MVP adapts the documented THOUGHT example' },
  conditions: {
    brief: 'Encounter the curator’s exact opening line. Contribute one line that responds on your own terms, or explicitly refuse. You may submit further responses or revise your own earlier response. Your exact contribution is preserved; the curator separately chooses a candidate for presentation.',
    agentDecisions: ['choose exact response', 'explicit refusal', 'submit another response', 'revise own earlier response'],
    text: { encoding: 'UTF-8', normalization: 'none', maxCodePoints: 280, lines: 1 },
    relations: ['addresses', 'responds-to', 'revises'],
    staleContext: 'Branches may share an older retained context; relation targets must occur in that context.',
    renderer: 'thought-exact-pair/1',
    disclosure: 'Records are stored locally. Launching the Agent shares the offered Work context with its selected model/provider. Export is a separate curator action. No private Agent conversation is collected by the service.',
    retention: 'Local records and launch capability remain until the machine owner deletes the private data directory. No automatic expiry or backup is supplied.',
    recovery: 'Submission identity is retained for the life of this local Work. Revocation blocks new operations but retains this token’s scoped recovery access to its previous submissions.',
    evidence: 'Operator-trusted records and byte checks. Independent execution origin is not established. No minting integration.',
  },
};
export const DEFINITION = Object.freeze({ ...definitionBody, id: `definition_${digest(definitionBody).slice(7)}`, digest: digest(definitionBody) });

export function createWork({ title = 'An encounter', curatorName = 'Curator' } = {}) {
  line(title, 120); line(curatorName, 80);
  const workId = id('work'), curatorId = id('participant');
  return {
    work: { id: workId, title, definitionId: DEFINITION.id, status: 'open', createdAt: new Date().toISOString(), curatorId, selectedActId: null },
    definition: structuredClone(DEFINITION),
    participants: [{ id: curatorId, workId, kind: 'human', name: curatorName, role: 'curator', attribution: 'local browser session declaration' }],
    acts: [], relations: [], contexts: [], grants: [], acceptances: [], submissions: {}, events: [],
  };
}

export function snapshot(record, participantId) {
  const body = {
    schemaVersion: 'agent-art-context/1', workId: record.work.id, definitionId: record.definition.id,
    participantId, definition: record.definition, acts: record.acts, relations: record.relations,
    selectedActId: record.work.selectedActId,
    coverage: 'Exact service-offered Work context. Does not cover private prompts, memory or comprehension.',
  };
  return { ...structuredClone(body), id: `context_${digest(body).slice(7)}`, digest: digest(body) };
}

export function accept(record, participant, payload, authority) {
  const now = new Date().toISOString();
  const actBody = {
    id: id('act'), workId: record.work.id, definitionId: record.definition.id,
    participantId: participant.id, kind: payload.kind, text: payload.text,
    contentType: 'text/plain;charset=utf-8', contentDigest: digest(payload.text),
    contextId: payload.contextId, acceptedAt: now, serviceOrder: record.acts.length + 1,
  };
  const act = { ...actBody, digest: digest(actBody) };
  const relations = payload.relations.map(r => ({ id: id('relation'), workId: record.work.id, definitionId: record.definition.id, source: act.id, kind: r.kind, target: r.target, declaredBy: participant.id }));
  const receiptBody = {
    id: id('receipt'), issuer: 'local-participation-service', evidenceClass: 'service-observation',
    submissionId: payload.submissionId, payloadDigest: digest(payload), workId: record.work.id,
    definitionId: record.definition.id, contextId: payload.contextId, participantId: participant.id,
    authority, actId: act.id, actDigest: act.digest, relationIds: relations.map(r => r.id), acceptedAt: now,
    limits: ['Operator-trusted unsigned receipt.', 'Authentication does not establish Agent or model execution.', 'Service time is not independently witnessed.'],
  };
  const receipt = { ...receiptBody, digest: digest(receiptBody) };
  record.acts.push(act); record.relations.push(...relations); record.acceptances.push(receipt);
  const result = { outcome: 'accepted', submissionId: payload.submissionId, act, relations, receipt };
  record.submissions[`${participant.id}:${payload.submissionId}`] = { payloadDigest: digest(payload), payload: structuredClone(payload), result };
  record.events.push({ id: id('event'), type: 'act-accepted', actId: act.id, participantId: participant.id, at: now });
  return result;
}

export function artifact(record) {
  const response = record.acts.find(a => a.id === record.work.selectedActId);
  if (!response || response.kind !== 'line') return null;
  const relation = record.relations.find(r => r.source === response.id && r.kind === 'responds-to');
  const opening = record.acts.find(a => a.id === relation?.target);
  if (!opening) return null;
  const body = {
    schemaVersion: 'agent-art-artifact/1', renderer: 'thought-exact-pair/1', workId: record.work.id,
    definitionId: record.definition.id,
    lines: [opening, response].map(a => ({ actId: a.id, participantId: a.participantId, text: a.text, contentDigest: a.contentDigest })),
    text: `${opening.text}\n${response.text}`,
    coverage: 'Exact derived pair; no claim about browser display, artistic meaning or execution origin.',
  };
  return { ...body, id: `artifact_${digest(body).slice(7)}`, digest: digest(body) };
}

export function exportEvidence(record) {
  return {
    schemaVersion: 'agent-art-evidence-package/0.1-local',
    policy: 'local-operator-trust/1',
    work: structuredClone(record.work), definition: structuredClone(record.definition),
    participants: structuredClone(record.participants), acts: structuredClone(record.acts), relations: structuredClone(record.relations),
    contexts: structuredClone(record.contexts), grants: record.grants.map(({ tokenHash, ...grant }) => structuredClone(grant)),
    acceptances: structuredClone(record.acceptances), events: structuredClone(record.events), artifact: artifact(record),
    coverage: { media: 'Inline UTF-8 text only.', executionOrigin: 'No independently grounded execution-origin material is collected.', privateAgentHistory: 'Not collected.', secrets: 'Capabilities and credential hashes excluded.', minting: 'Outside scope.' },
  };
}

export function verifyEvidence(evidence) {
  assert(evidence?.schemaVersion === 'agent-art-evidence-package/0.1-local' && evidence.policy === 'local-operator-trust/1', 400, 'unsupported_evidence', 'Unsupported evidence schema or policy.');
  assert(evidence.definition?.profile === 'thought-local-text/1' && evidence.work && ['acts', 'relations', 'contexts', 'participants', 'grants', 'acceptances'].every(key => Array.isArray(evidence[key])), 400, 'invalid_evidence', 'Unsupported or malformed local evidence package.');
  const unique = records => new Set(records.map(record => record.id)).size === records.length;
  const uniqueRecords = ['acts', 'relations', 'contexts', 'participants', 'grants', 'acceptances'].every(key => unique(evidence[key]));
  const claims = [];
  const add = (id, verdict, reasons, trust = ['Trust in the local service and machine owner; this package is not independently signed.']) => claims.push({ id, processing: 'completed', verdict, reasons, trust });
  const definitionBody = (({ id: ignoredId, digest: ignoredDigest, ...body }) => body)(evidence.definition);
  const actChecks = evidence.acts.every(a => digest(a.text) === a.contentDigest && digest((({ digest: ignored, ...body }) => body)(a)) === a.digest);
  const receiptChecks = uniqueRecords && evidence.acts.length === evidence.acceptances.length && evidence.acts.every(a => evidence.acceptances.filter(r => r.actId === a.id).length === 1) && evidence.relations.every(rel => evidence.acceptances.filter(r => r.relationIds.includes(rel.id)).length === 1) && evidence.acceptances.every(r => {
    const act = evidence.acts.find(a => a.id === r.actId && a.digest === r.actDigest);
    const relations = r.relationIds.map(id => evidence.relations.find(rel => rel.id === id && rel.source === r.actId));
    if (!act || relations.some(r => !r)) return false;
    const payload = { submissionId: r.submissionId, contextId: r.contextId, kind: act.kind, text: act.text, relations: relations.map(({ kind, target }) => ({ kind, target })) };
    return relations.length >= 1 && new Set(r.relationIds).size === r.relationIds.length && digest((({ digest: ignored, ...body }) => body)(r)) === r.digest && digest(payload) === r.payloadDigest && act.workId === evidence.work.id && r.workId === act.workId && r.definitionId === act.definitionId && r.participantId === act.participantId && act.contextId === r.contextId && relations.every(rel => rel.declaredBy === act.participantId && rel.workId === act.workId && rel.definitionId === act.definitionId && (rel.target === evidence.work.id || evidence.acts.some(target => target.id === rel.target && target.workId === act.workId)));
  });
  const contextsValid = evidence.contexts.every(c => {
    const calculated = digest((({ id: ignoredId, digest: ignoredDigest, ...body }) => body)(c));
    return calculated === c.digest && c.id === `context_${calculated.slice(7)}` && c.workId === evidence.work.id && c.definitionId === evidence.definition.id && canonical(c.definition) === canonical(evidence.definition) && c.acts.every(a => evidence.acts.some(original => canonical(original) === canonical(a))) && c.relations.every(r => evidence.relations.some(original => canonical(original) === canonical(r)));
  });
  const rootsValid = digest(definitionBody) === evidence.definition.digest && evidence.definition.id === `definition_${evidence.definition.digest.slice(7)}` && evidence.work.definitionId === evidence.definition.id && evidence.acts.every(a => a.definitionId === evidence.definition.id && evidence.contexts.some(c => c.id === a.contextId && c.participantId === a.participantId));
  add('retained-byte-bindings', actChecks && receiptChecks && contextsValid && rootsValid ? 'supported-under-policy' : 'contradicted', [actChecks && receiptChecks && contextsValid && rootsValid ? 'Definition, context, content, Act and receipt digests agree within this package.' : 'At least one retained byte binding conflicts.']);
  const attribution = receiptChecks && evidence.participants.every(p => p.workId === evidence.work.id) && evidence.acceptances.every(r => {
    const participant = evidence.participants.find(p => p.id === r.participantId);
    if (!participant) return false;
    if (r.authority.kind === 'local-curator-session') return participant.kind === 'human' && participant.id === evidence.work.curatorId && r.authority.participantId === participant.id;
    return r.authority.kind === 'agent-capability' && participant.kind === 'agent' && evidence.grants.some(g => g.id === r.authority.grantId && g.participantId === r.participantId && g.workId === r.workId && g.authorizedBy === evidence.work.curatorId);
  });
  add('authorized-connection-attribution', attribution ? 'supported-under-policy' : 'contradicted', ['Acceptance records identify the declared participant and local authority. Enrollment and records are service assertions.']);
  add('independent-agent-execution-origin', 'not-established', ['No independent provider receipt, witness or attested execution is available.', 'A real client tool call, token, local runtime declaration or acceptance receipt cannot establish model authorship or the complete Agent loop.']);
  const selected = evidence.acts.find(a => a.id === evidence.work.selectedActId);
  const responseRelation = evidence.relations.find(r => r.source === selected?.id && r.kind === 'responds-to');
  const opening = evidence.acts.find(a => a.id === responseRelation?.target);
  const candidate = evidence.artifact;
  if (!candidate) add('selected-artifact-exact-pair', 'not-established', ['No response pair has been selected for this Work.']);
  else {
    const expected = artifact(evidence);
    const matches = actChecks && receiptChecks && contextsValid && rootsValid && opening?.kind === 'line' && opening.participantId === evidence.work.curatorId && selected?.kind === 'line' && evidence.participants.some(p => p.id === selected.participantId && p.kind === 'agent') && evidence.relations.filter(r => r.source === selected.id && r.kind === 'responds-to').length === 1 && expected && canonical(candidate) === canonical(expected);
    add('selected-artifact-exact-pair', matches ? 'supported-under-policy' : 'contradicted', [matches ? 'Both exact accepted lines occupy their declared positions in the identified derived artifact.' : 'The artifact conflicts with the selected accepted pair.', 'This checks the declared consequence in these bytes, not artistic significance.']);
  }
  add('website-presentation', 'not-established', ['No independent observation of a browser surface/session is included.']);
  const body = {
    schemaVersion: 'agent-art-verification-report/0.1-local', checker: 'local-reference-checker/1',
    policy: 'local-operator-trust/1', evidenceDigest: digest(evidence),
    trustConfiguration: { operator: 'local service and machine owner', independentExecutionRoots: [] },
    claims, limits: ['Not a global genuineness verdict.', 'A machine owner can rewrite and rehash an internally consistent package.', 'Private intention, private rerolls and unobserved intervention are not established.'],
  };
  return { ...body, id: `report_${digest(body).slice(7)}`, digest: digest(body) };
}

export function publicView(record) {
  const evidence = exportEvidence(record);
  return { ...evidence, verification: verifyEvidence(evidence) };
}
