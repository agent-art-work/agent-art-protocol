/** Durable controller for one authorized Lab -> Claude GUI case. No UI driver. */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadBenchInputs, ROOT } from './inputs.mjs';
import { createRun, addObservation, summarizeRun, validateRun } from './records.mjs';
import { validatePublicDesktopNote } from './desktop-ui.mjs';
import { EXACT_POLICY, LAB_AX_POLICY, validateDraftPolicy, compareDraftText } from './draft-policy.mjs';
import { createExecutionContract, qualifyExecution, validateExecutionQualification, validateExecutionInspection, executionConfigurationSha256 } from './execution-contract.mjs';
import { isPlainRecord } from './plain-record.mjs';
import { bindAuthorityStore, hasAuthorityBinding, resolveAuthorityStore, authorityCasePaths, registerAuthorityCase,
  assertAuthorityCase, withAuthorityLock, abandonStoppedControllerLock, writeAtomic, writeExclusive, syncDirectory } from './authority-store.mjs';

export const SDK_SHA256 = 'e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430';
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/u;
const CAPTURE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const INTERRUPTION_REASONS = ['permission-required', 'target-lost', 'observation-conflict', 'observation-unavailable', 'input-interference', 'configuration-changed', 'controller-unavailable', 'operator-revoked', 'timeout'];
const HUMAN_ACTIONS = ['none', 'restore-access', 'locate-target', 'send', 'report-result'];
const MAX_INTERVENTIONS = 8;
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
function boundedRecord(value, allowed) {
  return isPlainRecord(value) && Reflect.ownKeys(value).length === allowed.length
    && Reflect.ownKeys(value).every(key => typeof key === 'string' && allowed.includes(key)
      && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'));
}
const atomic = writeAtomic;
const ensure = (condition, message) => { if (!condition) throw Error(message); };
export function pathsFor(id, root = ROOT) {
  ensure(typeof id === 'string' && ID.test(id), 'Invalid desktop case identifier.');
  if (hasAuthorityBinding(root)) {
    const external = authorityCasePaths(id, root);
    const historical = path.join(root, '.local/test-bench/desktop', id, 'case.json');
    if (fs.existsSync(external.state) || !fs.existsSync(historical)) return external;
  }
  const base = path.join(root, '.local/test-bench/desktop'), dir = path.join(base, id);
  return { base, dir, state: path.join(dir, 'case.json'), journal: path.join(dir, 'journal.json'),
    claim: path.join(dir, 'send-claimed.json'), handoff: path.join(dir, 'handoff-claimed.json'),
    dispatchEntered: path.join(dir, 'send-dispatch-entered.json'), dispatchResult: path.join(dir, 'send-dispatch-result.json'),
    mutex: path.join(dir, 'mutation.lock'), active: path.join(base, 'active-claude.json') };
}

/** Find the case binding without ignoring finished or paused ownership. Server
 * observations must use that case's lock and lifecycle, never a second writer.
 */
export function caseForRun(runId, { root = ROOT } = {}) {
  ensure(typeof runId === 'string' && ID.test(runId), 'Invalid run identifier.');
  const bases = [path.join(root, '.local/test-bench/desktop')];
  if (hasAuthorityBinding(root)) bases.push(path.join(resolveAuthorityStore(root).directory, 'cases'));
  let owner;
  for (const base of bases) for (const entry of fs.existsSync(base) ? fs.readdirSync(base, { withFileTypes: true }) : []) {
    if (!entry.isDirectory()) continue;
    const stateFile = path.join(base, entry.name, 'case.json');
    if (!fs.existsSync(stateFile)) continue;
    const state = read(stateFile);
    if (state.runId !== runId) continue;
    ensure(state.schema === 'agent-art-bench/desktop-case/1' && state.id === entry.name && state.client === 'claude-app', 'Invalid desktop case binding.');
    ensure(!owner, 'Multiple desktop cases own this run; preserve its records instead of appending.');
    owner = { id: state.id, status: state.status };
  }
  return owner;
}

const locked = withAuthorityLock;
function journal(p, action) {
  const events = fs.existsSync(p.journal) ? read(p.journal) : [];
  events.push({ at: new Date().toISOString(), action }); atomic(p.journal, events);
}
function runPath(root, runId) { ensure(ID.test(runId), 'Invalid run identifier.'); return path.join(root, '.local/test-bench/runs', runId + '.json'); }
function checkedRun(file) {
  const run = read(file), check = validateRun(run); ensure(check.valid, 'Stored bench run failed validation.'); return run;
}
function ownedCase(id, root) {
  const p = pathsFor(id, root), state = read(p.state);
  assertAuthorityCase(p, state);
  ensure(state.schema === 'agent-art-bench/desktop-case/1' && state.id === id && state.client === 'claude-app', 'Invalid desktop case.');
  ensure(state.status === 'active', 'This case has finished; its UI actions cannot resume.');
  ensure(read(p.active).id === id, 'This case does not own the active Claude runner lock.');
  return { p, state, file: p.run };
}
function activeCase(id, root) {
  const current = ownedCase(id, root);
  ensure(Date.now() <= Date.parse(current.state.deadlineAt), 'Desktop case deadline expired. Finish and record the incomplete attempt; do not retry Send.');
  return current;
}

/** Fail before any native mutation, including Raise, on a closed, expired or
 * possibly submitted case. Recheck after awaited capture work as well.
 */
export function assertDesktopActionable(id, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = activeCase(id, root);
    executionReady(state);
    ensure(!fs.existsSync(p.claim), 'Send was already claimed; no further native action is permitted.');
    return true;
  });
}

/** Qualification is an attributed environment assessment, never automatic probing. */
function executionReady(state) {
  ensure(state.executionContract && state.execution, 'This historical case has no execution contract; preserve it without new native actions.');
  const execution = state.execution;
  ensure(!execution.cleanup, 'Cleanup was recorded; finish this case without further native actions.');
  ensure(execution.status !== 'blocked', 'Execution is blocked; restore access and resume the same case before fresh qualification.');
  ensure(execution.status === 'qualified' && execution.qualification?.qualified === true, 'Execution is unqualified; explicitly qualify the environment first.');
  ensure(execution.controllerId === execution.qualification.evidence?.controllerId
    && execution.generation === execution.qualification.evidence?.generation
    && state.executionContract.contractSha256 === execution.qualification.evidence?.contractSha256,
  'Execution qualification is not bound to the current controller and generation.');
  validateExecutionQualification(state.executionContract, execution.qualification);
  return { contract: state.executionContract, qualification: execution.qualification, generation: execution.generation };
}

export function assertExecutionReady(id, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => executionReady(activeCase(id, root).state));
}

/** Inspect-derived evidence is bounded and bound to the exact current capture.
 * It remains a controller assertion; it is not an independent OS attestation.
 */
function checkedExecutionProof(state, proof, capture) {
  const { contract, qualification, generation } = executionReady(state), e = proof?.evidence ?? proof, q = qualification.evidence;
  ensure(e && typeof e === 'object', 'A current execution inspection proof is required.');
  validateExecutionInspection(contract, qualification, { ready: e?.ready === true, evidence: e }, { generation, now: Date.now() });
  ensure(e?.ready === true && e && e.contractSha256 === contract.contractSha256
    && e.configurationSha256 === contract.configurationSha256 && e.controllerId === state.execution.controllerId
    && e.generation === generation && e.qualifiedAt === q.qualifiedAt && e.attribution === 'controller',
  'A current controller-bound execution inspection proof is required.');
  const age = Date.now() - Date.parse(e.capturedAt);
  ensure(CAPTURE_ID.test(e.captureId) && SHA256.test(e.snapshotSha256) && age >= 0 && age <= 30000
    && (Number.isSafeInteger(e.windowId) && e.windowId >= 0 || typeof e.windowId === 'string' && CAPTURE_ID.test(e.windowId)),
  'Execution proof requires a fresh bounded owned capture.');
  ensure(capture && capture.captureId === e.captureId && capture.capturedAt === e.capturedAt
    && SHA256.test(capture.snapshotSha256) && (capture.windowId === undefined || capture.windowId === e.windowId),
  'Execution proof must match the readiness or observation capture exactly.');
  // Readiness/composer helpers retain their historical digest scopes. Capture
  // identity, time and window bind them; their differing hashes are not equated.
  return Object.fromEntries(['schema', 'ready', 'assessedAt', 'windowBinding', 'contractSha256', 'configurationSha256', 'controllerId', 'generation', 'qualifiedAt',
    'captureId', 'capturedAt', 'windowId', 'snapshotSha256', 'inputOwnership', 'visualAgreement', 'attribution'].map(key => [key, e[key]]));
}

export function qualifyCase(id, assessment, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = activeCase(id, root);
    ensure(state.executionContract && state.execution, 'Historical cases cannot gain a retrofitted execution contract.');
    const execution = state.execution;
    ensure(!execution.cleanup, 'Cleanup was recorded; finish this case.');
    ensure(execution.status !== 'blocked', 'Blocked execution must resume the same case before qualification.');
    if (execution.qualifications.length >= 16) {
      atomic(p.state, { ...state, execution: { ...execution, status: 'blocked', generation: execution.generation + 1, blockedReason: 'controller-unavailable', budgetExhausted: 'qualification' } });
      journal(p, 'execution-qualification-budget-exhausted');
      throw Error('Environment qualification assessment budget exhausted; finish this case.');
    }
    // A new assessment invalidates every earlier inspection, even if it succeeds.
    const generation = execution.qualifications.length ? execution.generation + 1 : execution.generation;
    const qualification = qualifyExecution(state.executionContract, assessment, { generation, now: Date.now() });
    ensure(!execution.controllerId || execution.controllerId === qualification.evidence.controllerId, 'A different controller requires a separately authorized case.');
    const next = { ...state, execution: { ...execution, generation,
      status: qualification.qualified ? 'qualified' : 'unqualified', qualification,
      ...(qualification.qualified && { controllerId: assessment.controllerId }),
      qualifications: [...execution.qualifications, qualification] } };
    atomic(p.state, next); journal(p, 'execution-qualification-' + (qualification.qualified ? 'qualified' : 'unqualified'));
    return { ...qualification, generation };
  });
}

export function recordExecutionInterruption(id, interruption, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = ownedCase(id, root);
    ensure(state.executionContract && state.execution, 'Historical cases cannot gain retrofitted execution events.');
    ensure(boundedRecord(interruption, ['reason', 'actor', 'humanAction']), 'Only bounded interruption fields are permitted.');
    const { reason, actor, humanAction } = interruption;
    ensure(INTERRUPTION_REASONS.includes(reason) && ['agent', 'human'].includes(actor) && HUMAN_ACTIONS.includes(humanAction), 'Use a known interruption, actor and human action code.');
    ensure(actor === 'human' || humanAction === 'none', 'Only a human interruption may declare a human action.');
    ensure(reason === 'timeout' || Date.now() <= Date.parse(state.deadlineAt), 'The case deadline expired; only a timeout may be recorded before finish.');
    const execution = state.execution;
    const started = fs.existsSync(p.handoff) || fs.existsSync(p.claim) || execution.qualifications.some(q => q.qualified === true);
    const assisted = actor === 'human' && humanAction !== 'none' && (started || ['send', 'report-result'].includes(humanAction));
    const event = { at: new Date().toISOString(), reason, actor, humanAction, phase: started ? 'execution' : 'setup',
      classification: assisted ? 'human-assistance' : actor === 'human' && humanAction !== 'none' ? 'human-setup' : 'interruption' };
    // Human Send consumes this case's one attempt even when no runner claimed it.
    if (humanAction === 'send' && !fs.existsSync(p.claim)) {
      const claim = { caseId: id, runId: state.runId, claimedAt: event.at, contextSha256: state.manifest.contextSha256,
        draftPolicy: state.draftPolicy, maximumAttempts: 1, actor: 'human', claimOrigin: 'human-reported',
        limit: 'Human-reported submission consumes the attempt; runner dispatch and delivery are not established. Never resend.' };
      writeExclusive(p.claim, claim);
    }
    if (execution.interventions.length >= MAX_INTERVENTIONS) {
      atomic(p.state, { ...state, execution: { ...execution, status: 'blocked', generation: execution.generation + 1, blockedReason: reason, budgetExhausted: 'intervention', overflowIntervention: event,
        humanAssisted: execution.humanAssisted || assisted, humanSetup: execution.humanSetup || event.classification === 'human-setup', revoked: execution.revoked === true || reason === 'operator-revoked' } });
      journal(p, 'execution-intervention-budget-exhausted');
      throw Error('The bounded intervention budget is exhausted; finish the case.');
    }
    const next = { ...state, execution: { ...execution, status: 'blocked', generation: execution.generation + 1,
      blockedReason: reason, revoked: execution.revoked === true || reason === 'operator-revoked',
      humanAssisted: execution.humanAssisted || assisted,
      humanSetup: execution.humanSetup || event.classification === 'human-setup',
      interventions: [...execution.interventions, event] } };
    atomic(p.state, next); journal(p, 'execution-interrupted-' + reason); return next;
  });
}

export function resumeExecution(id, { controllerId, confirmedHumanAction = false } = {}, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = activeCase(id, root), execution = state.execution;
    ensure(state.executionContract && execution?.status === 'blocked', 'Resume requires this same blocked execution contract.');
    ensure(!execution.revoked, 'Operator authority was revoked; this case cannot resume. Finish it.');
    ensure(!execution.cleanup && !execution.budgetExhausted, 'Cleanup or an exhausted budget requires finishing this case.');
    ensure(typeof controllerId === 'string' && CAPTURE_ID.test(controllerId)
      && (!execution.controllerId || controllerId === execution.controllerId), 'Resume requires the same bounded controller identity.');
    ensure(typeof confirmedHumanAction === 'boolean', 'Use a boolean human-action confirmation.');
    const last = execution.interventions.at(-1);
    ensure(last.actor !== 'human' || confirmedHumanAction === true, 'Confirm the recorded human action before resuming.');
    const next = { ...state, execution: { ...execution, status: 'unqualified', generation: execution.generation + 1,
      blockedReason: undefined, resumedAt: new Date().toISOString(),
      actionMode: fs.existsSync(p.claim) ? 'observation-only' : 'normal' } };
    atomic(p.state, next); journal(p, 'execution-resumed-requalification-required'); return next;
  });
}

/** Explicit allowSend describes the human's authorization, never screen content. */
export async function prepareCase({ root = ROOT, authorityRoot, inputs, runId, allowSend = false, timeoutMs = 900000, draftPolicy = EXACT_POLICY } = {}) {
  ensure(allowSend === true, 'Explicit authorization for this one public invitation Send is required.');
  ensure(Number.isSafeInteger(timeoutMs) && timeoutMs >= 1000 && timeoutMs <= 1800000, 'Use a bounded case deadline.');
  inputs ||= await loadBenchInputs();
  ensure(inputs.manifest.sdkVersion === '0.1.4' && inputs.manifest.archiveSha256 === SDK_SHA256, 'Only the unchanged qualified SDK 0.1.4 package is allowed.');
  validateDraftPolicy(draftPolicy, inputs.manifest);
  if (draftPolicy === LAB_AX_POLICY) compareDraftText(inputs.context, inputs.context, { policy: draftPolicy });
  const executionContract = createExecutionContract({ manifest: inputs.manifest, environment: inputs.environment, timeoutMs });
  bindAuthorityStore({ root, authorityRoot });
  const id = 'desktop-' + randomUUID(), p = pathsFor(id, root);
  fs.mkdirSync(p.base, { recursive: true, mode: 0o700 });
  let created = false;
  writeExclusive(p.active, { id, createdAt: new Date().toISOString() });
  try {
    fs.mkdirSync(p.dir, { mode: 0o700 }); created = true;
    syncDirectory(p.base);
    const authority = registerAuthorityCase(p, { id, kind: 'desktop', contractSha256: executionContract.contractSha256 });
    let run;
    if (runId) {
      ensure(caseForRun(runId, { root })?.status !== 'finished', 'A finished case already owns this run; preserve its history and prepare a new run.');
      for (const entry of fs.readdirSync(p.base, { withFileTypes: true })) {
        const priorState = path.join(p.base, entry.name, 'case.json');
        if (entry.isDirectory() && fs.existsSync(priorState)) {
          const prior = read(priorState);
          ensure(prior.runId !== runId || prior.status !== 'finished', 'A finished case already owns this run; preserve its history and prepare a new run.');
        }
      }
      run = checkedRun(runPath(root, runId));
      ensure(JSON.stringify(run.manifest) === JSON.stringify(inputs.manifest), 'Existing run has different pinned inputs.');
      ensure(executionConfigurationSha256(run.environment) === executionContract.configurationSha256, 'Existing run has different recorded execution configuration.');
      ensure(run.observations.every(o => o.lane === 'browser' && o.requestedClient === 'claude-app'), 'Only an owned browser-only Claude run may be adopted.');
      ensure(run.observations.filter(o => o.claim === 'handoff-requested').length <= 1, 'The case cannot adopt repeated native launches.');
    } else {
      run = createRun(inputs.manifest, { id: 'reading-' + randomUUID(), environment: inputs.environment });
      fs.mkdirSync(path.dirname(runPath(root, run.id)), { recursive: true, mode: 0o700 }); atomic(runPath(root, run.id), run);
    }
    atomic(p.run, run);
    const state = { schema: 'agent-art-bench/desktop-case/1', id, runId: run.id, client: 'claude-app', status: 'active', draftPolicy, authority,
      startedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + timeoutMs).toISOString(), manifest: inputs.manifest,
      authorization: { source: 'explicit-user-direction', publicContextOnly: true, freshConversation: true, maximumSends: 1, allowSend: true },
      boundaries: { codexDesktop: 'excluded', sdkChanges: 'excluded', deployment: 'excluded' },
      executionContract,
      execution: { status: 'unqualified', generation: 1, qualifications: [], interventions: [], humanAssisted: false, humanSetup: false } };
    atomic(p.state, state); fs.writeFileSync(path.join(p.dir, 'public-context.txt'), inputs.context, { mode: 0o600, flag: 'wx' });
    journal(p, runId ? 'prepared-adopting-owned-browser-run' : 'prepared-new-owned-run');
    journal(p, 'selected-draft-policy-' + draftPolicy);
    return { ...state, caseDirectory: path.relative(root, p.dir), viewerFragment: '#' + run.id };
  } catch (error) {
    if (fs.existsSync(p.active) && read(p.active).id === id) fs.unlinkSync(p.active);
    if (created) fs.rmSync(p.dir, { recursive: true }); throw error;
  }
}

/** Claim before touching Send. A crash or ambiguous UI outcome never reopens it. */
export function claimSend(id, { root = ROOT, arrival, executionProof } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state, file } = activeCase(id, root), run = checkedRun(file);
    const proof = checkedExecutionProof(state, executionProof, arrival?.evidence);
    ensure(!fs.existsSync(p.claim), 'Send was already claimed; never retry Send.');
    ensure(arrival !== undefined, 'Current execution requires fresh arrival readiness.');
    const summary = summarizeRun(run), client = summary.realClient.clients['claude-app'];
    ensure(summary.browser.clients['claude-app']['handoff-requested'].status === 'requested', 'Observe the Lab browser handoff before claiming Send.');
    const policy = validateDraftPolicy(state.draftPolicy ?? EXACT_POLICY, state.manifest);
    const direct = claim => client[claim].status === 'observed' && run.observations.some(o => o.lane === 'real-client' && o.claim === claim && o.status === 'observed' && o.source === 'desktop-ui' && o.actualSurface === 'claude-chat');
    ensure(direct('draft-arrived'), 'Observe an uncontradicted owned Claude Chat draft before claiming Send.');
    if (policy === EXACT_POLICY) ensure(direct('context-matches'), 'Observe an uncontradicted exact owned Claude Chat draft before claiming Send.');
    else {
      ensure(summary.browser.clients['claude-app']['context-matches'].status === 'observed', 'The named policy requires exact prepared browser payload evidence.');
      ensure(direct('presentation-matches'), 'Observe an uncontradicted presentation comparison under the selected policy before claiming Send.');
      const presentation = run.observations.filter(o => o.lane === 'real-client' && o.claim === 'presentation-matches').at(-1).material;
      const arrival = run.observations.filter(o => o.lane === 'real-client' && o.claim === 'draft-arrived').at(-1).material;
      const age = Date.now() - Date.parse(presentation.capturedAt);
      ensure(presentation.method === policy && age >= 0 && age <= 30000 && arrival.captureId === presentation.captureId && arrival.snapshotSha256 === presentation.snapshotSha256 && arrival.capturedAt === presentation.capturedAt, 'The named policy requires one fresh matching owned draft capture.');
    }
    ensure(!run.observations.some(o => o.claim === 'sent'), 'A Send observation already exists.');
    const comparison = run.observations.filter(o => o.lane === 'real-client' && o.claim === (policy === EXACT_POLICY ? 'context-matches' : 'presentation-matches') && o.status === 'observed').at(-1)?.material;
    const draftMaterial = run.observations.filter(o => o.lane === 'real-client' && o.claim === 'draft-arrived' && o.status === 'observed').at(-1)?.material;
    const comparisonClaim = policy === EXACT_POLICY ? 'context-matches' : 'presentation-matches';
    const currentStage = name => {
      const stage = state.execution.stageProofs?.[name];
      return stage?.generation === proof.generation && stage.controllerId === proof.controllerId
        && stage.qualifiedAt === proof.qualifiedAt && stage.captureId === proof.captureId
        && stage.capturedAt === proof.capturedAt && stage.windowId === proof.windowId
        && stage.snapshotSha256 === proof.snapshotSha256;
    };
    ensure(currentStage('draft-arrived') && currentStage(comparisonClaim)
      && draftMaterial?.captureId === proof.captureId && comparison?.captureId === proof.captureId
      && draftMaterial?.capturedAt === proof.capturedAt && comparison?.capturedAt === proof.capturedAt
      && draftMaterial?.snapshotSha256 === comparison?.snapshotSha256,
    'Send requires current arrival and policy comparison from the same qualified capture.');
    let arrivalReadiness;
    if (arrival !== undefined) {
      const e = arrival.evidence, handoff = read(p.handoff), age = Date.now() - Date.parse(e?.capturedAt);
      const observed = run.observations.filter(o => o.lane === 'real-client' && o.claim === 'draft-arrived').at(-1)?.material;
      ensure(arrival.arrived === true && e?.schema === 'agent-art-bench/claude-readiness/1' && e.phase === 'after-handoff'
        && e.reason === undefined && e.freshChatOwned === true && e.newChatObserved === true && e.launchResolved === true
        && e.composerState === 'nonempty' && e.preflightCaptureId === handoff.readiness?.captureId
        && e.handoffClaimedAt === handoff.claimedAt && e.windowId === handoff.readiness?.windowId
        && e.captureId === observed?.captureId && e.capturedAt === observed?.capturedAt
        && /^[a-f0-9]{64}$/u.test(e.snapshotSha256) && age >= 0 && age <= 30000,
      'A fresh post-launch arrival proof bound to this handoff is required.');
      arrivalReadiness = Object.fromEntries(['schema', 'phase', 'captureId', 'capturedAt', 'windowId', 'snapshotSha256',
        'preflightCaptureId', 'handoffClaimedAt', 'freshChatOwned', 'newChatObserved', 'composerState', 'launchResolved'].map(key => [key, e[key]]));
    }
    const value = { caseId: id, runId: state.runId, claimedAt: new Date().toISOString(), contextSha256: state.manifest.contextSha256, draftPolicy: policy, maximumAttempts: 1,
      executionProof: proof, ...(arrivalReadiness && { arrivalReadiness }),
      ...(comparison?.captureId && { preSendCaptureId: comparison.captureId }),
      limit: 'Claimed means possibly attempted. Missing UI confirmation never permits another Send.' };
    writeExclusive(p.claim, value);
    journal(p, 'one-send-claimed-before-ui-action'); return value;
  });
}

const REJECTION_KINDS = ['Error', 'null', 'undefined', 'string', 'number', 'boolean', 'bigint', 'symbol', 'object', 'function'];
function checkedDispatch(p, state) {
  if (!fs.existsSync(p.dispatchEntered)) {
    ensure(!fs.existsSync(p.dispatchResult), 'A dispatch result requires its entered record.');
    return undefined;
  }
  const entered = read(p.dispatchEntered), claim = read(p.claim);
  ensure(entered.schema === 'agent-art-bench/send-dispatch/1' && entered.stage === 'entered'
    && entered.caseId === state.id && entered.runId === state.runId && entered.sendClaimedAt === claim.claimedAt
    && claim.caseId === state.id && claim.runId === state.runId
    && Number.isSafeInteger(entered.controlIndex) && entered.controlIndex >= 0
    && Number.isFinite(Date.parse(entered.enteredAt)), 'Invalid controller dispatch record.');
  return entered;
}

/** The controller reached the app.click boundary. This precedes invocation and
 * proves neither native dispatch nor delivery. A failed write prevents click.
 */
export function enterSendDispatch(id, { root = ROOT, controlIndex, executionProof } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = activeCase(id, root);
    ensure(fs.existsSync(p.claim), 'Dispatch requires the durable one-Send claim.');
    const claim = read(p.claim);
    ensure(claim.caseId === id && claim.runId === state.runId && claim.maximumAttempts === 1, 'Invalid Send claim binding.');
    const proof = checkedExecutionProof(state, executionProof, claim.arrivalReadiness);
    ensure(JSON.stringify(proof) === JSON.stringify(claim.executionProof), 'Dispatch requires the same current execution proof as its Send claim.');
    ensure(claim.actor !== 'human', 'Human submission consumed the attempt; runner dispatch cannot follow.');
    ensure(Number.isSafeInteger(controlIndex) && controlIndex >= 0, 'Dispatch requires a selected bounded control index.');
    ensure(!fs.existsSync(p.dispatchEntered) && !fs.existsSync(p.dispatchResult), 'Dispatch was already entered; never invoke Send again.');
    const value = { schema: 'agent-art-bench/send-dispatch/1', caseId: id, runId: state.runId, stage: 'entered',
      enteredAt: new Date().toISOString(), sendClaimedAt: claim.claimedAt, controlIndex,
      limit: 'Controller boundary reached before app.click invocation. Native dispatch and delivery are not established; never retry Send.' };
    writeExclusive(p.dispatchEntered, value);
    journal(p, 'send-dispatch-controller-boundary-entered');
    return value;
  });
}

/** A fulfilled/rejected app.click promise is controller evidence only. Persist
 * under lifecycle checks so late completion cannot append to a finished case.
 */
export function settleSendDispatch(id, { root = ROOT, stage, rejectionKind } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = activeCase(id, root), entered = checkedDispatch(p, state);
    ensure(entered, 'A dispatch result requires its entered record.');
    ensure(stage === 'returned' || stage === 'rejected', 'Use a bounded dispatch result stage.');
    ensure(stage === 'rejected' ? REJECTION_KINDS.includes(rejectionKind) : rejectionKind === undefined, 'Use only the bounded rejection kind.');
    ensure(!fs.existsSync(p.dispatchResult), 'The dispatch result is immutable.');
    const value = { schema: 'agent-art-bench/send-dispatch/1', caseId: id, runId: state.runId, stage,
      enteredAt: entered.enteredAt, settledAt: new Date().toISOString(), ...(stage === 'rejected' && { rejectionKind }),
      limit: 'Only the app.click promise result is recorded. Native delivery and sent confirmation remain unestablished; never retry Send.' };
    writeExclusive(p.dispatchResult, value);
    journal(p, 'send-dispatch-promise-' + stage);
    return value;
  });
}

function summarizeDispatch(p, state) {
  const entered = checkedDispatch(p, state);
  const result = fs.existsSync(p.dispatchResult) ? read(p.dispatchResult) : undefined;
  if (result) ensure(result.schema === 'agent-art-bench/send-dispatch/1' && result.caseId === state.id
    && result.runId === state.runId && result.enteredAt === entered.enteredAt
    && ['returned', 'rejected'].includes(result.stage) && Number.isFinite(Date.parse(result.settledAt))
    && (result.stage === 'rejected' ? REJECTION_KINDS.includes(result.rejectionKind) : result.rejectionKind === undefined),
  'Invalid controller dispatch result.');
  return { status: result?.stage ?? (entered ? 'entered' : 'not-recorded'), boundary: 'controller-app-click', nativeDelivery: 'not-established',
    ...(result?.stage === 'rejected' && { rejectionKind: result.rejectionKind }) };
}

/** Reserve the only native launch before activating the real Lab link. */
export function claimHandoff(id, { root = ROOT, readiness, executionProof } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state, file } = activeCase(id, root), run = checkedRun(file);
    const proof = checkedExecutionProof(state, executionProof, readiness?.evidence);
    ensure(readiness !== undefined, 'Current execution requires fresh preflight readiness.');
    ensure(!fs.existsSync(p.claim), 'Send was already claimed; no new handoff is permitted.');
    ensure(!run.observations.some(o => o.claim === 'handoff-requested'), 'A handoff was already requested; inspect its outcome without another launch.');
    let preflight;
    if (readiness !== undefined) {
      const e = readiness.evidence, age = Date.now() - Date.parse(e?.capturedAt);
      ensure(readiness.ready === true && e?.schema === 'agent-art-bench/claude-readiness/1'
        && e.phase === 'before-handoff' && e.reason === undefined && e.freshChatOwned === true
        && e.newChatObserved === true && e.composerState === 'empty'
        && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(e.captureId)
        && /^[a-f0-9]{64}$/u.test(e.snapshotSha256) && age >= 0 && age <= 30000
        && (Number.isSafeInteger(e.windowId) && e.windowId >= 0 || typeof e.windowId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(e.windowId))
        && Array.isArray(e.indices) && e.indices.length === 4 && e.indices.every(n => Number.isSafeInteger(n) && n >= 0),
      'A fresh successful owned empty-Chat preflight is required before launch.');
      // Whitelist bounded facts; never spread controller nodes or raw values.
      preflight = Object.fromEntries(['schema', 'phase', 'captureId', 'capturedAt', 'windowId', 'snapshotSha256',
        'indices', 'freshChatOwned', 'newChatObserved', 'composerState'].map(key => [key, e[key]]));
    }
    const value = { caseId: id, runId: state.runId, claimedAt: new Date().toISOString(), maximumAttempts: 1,
      executionProof: proof, ...(preflight && { readiness: preflight, preflightCaptureId: preflight.captureId }),
      limit: 'Claimed means possibly activated. A detached browser command never permits another launch.' };
    writeExclusive(p.handoff, value);
    journal(p, 'one-handoff-claimed-before-ui-action'); return value;
  });
}

/** A direct-URI diagnostic must never qualify the SDK component's click path. */
export function markUriControl(id, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = activeCase(id, root);
    ensure(!fs.existsSync(p.claim), 'Declare the URI control before any Send claim.');
    ensure(!state.testPath || state.testPath === 'native-uri-control', 'The declared test path cannot change.');
    const next = { ...state, testPath: 'native-uri-control' };
    atomic(p.state, next); journal(p, 'declared-native-uri-control-not-component-click'); return next;
  });
}

/** Cleanup is a bounded controller report, not automatic ownership detection. */
export function recordExecutionCleanup(id, cleanup, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state } = ownedCase(id, root);
    ensure(state.executionContract && state.execution, 'Historical cleanup must not be retrofitted.');
    ensure(boundedRecord(cleanup, ['browser', 'native', 'ownership']), 'Use only bounded cleanup fields.');
    ensure(['closed', 'retained-for-review', 'not-created', 'blocked'].includes(cleanup.browser)
      && ['unsent-draft-retained', 'conversation-retained', 'not-created', 'blocked'].includes(cleanup.native)
      && cleanup.ownership === 'owned-only', 'Use known cleanup dispositions for owned surfaces only.');
    ensure(!state.execution.cleanup, 'The recorded cleanup disposition is immutable.');
    const value = { status: 'recorded', at: new Date().toISOString(), browser: cleanup.browser, native: cleanup.native,
      ownership: 'owned-only', attribution: 'controller' };
    atomic(p.state, { ...state, execution: { ...state.execution, cleanup: value } });
    journal(p, 'execution-cleanup-recorded'); return value;
  });
}

/** Compatibility entry points retain deadline and attempt budgets. New cases
 * resume unqualified; neither wrapper supplies authority or setup attestation.
 */
export function pauseCase(id, { root = ROOT, reason = 'mac-locked' } = {}) {
  ensure(['mac-locked', 'inspection-approval'].includes(reason), 'Use a known desktop-unavailable reason.');
  return recordExecutionInterruption(id, { reason: reason === 'mac-locked' ? 'controller-unavailable' : 'permission-required', actor: 'agent', humanAction: 'none' }, { root });
}

export function resumeCase(id, { root = ROOT, controllerId, confirmedUnlocked = false, confirmedAccess = false } = {}) {
  ensure(confirmedUnlocked === true || confirmedAccess === true, 'Resume requires confirmed desktop access.');
  const state = read(pathsFor(id, root).state);
  ensure(state.execution?.status === 'blocked', 'Resume requires this same blocked execution contract.');
  ensure(!state.execution.revoked, 'Operator authority was revoked; this case cannot resume.');
  ensure(typeof controllerId === 'string' && CAPTURE_ID.test(controllerId)
    && (!state.execution.controllerId || state.execution.controllerId === controllerId), 'Resume requires the same bounded controller identity.');
  recordExecutionInterruption(id, { reason: state.execution.blockedReason, actor: 'human', humanAction: 'restore-access' }, { root });
  return resumeExecution(id, { controllerId, confirmedHumanAction: true }, { root });
}

export function observeCase(id, observation, { root = ROOT, persistMaterial, executionProof } = {}) {
  ensure(persistMaterial === undefined || typeof persistMaterial === 'function', 'Material persistence requires a local callback.');
  const p = pathsFor(id, root);
  return locked(p, () => {
    const { state, file } = activeCase(id, root);
    ensure(observation.requestedClient === 'claude-app', 'The runner never operates or records a Codex desktop case.');
    ensure(observation.source !== 'operator', 'An agent-operated result cannot be relabeled as a human report.');
    ensure(observation.actualSurface === undefined || observation.actualSurface === 'claude-chat', 'A mismatched destination cannot qualify this case.');
    ensure(observation.notes === undefined || validatePublicDesktopNote(observation.notes), 'Only fixed public desktop notes may be persisted.');
    let proof;
    if (observation.lane === 'browser' && observation.claim === 'handoff-requested' && observation.status === 'requested') {
      executionReady(state);
      ensure(fs.existsSync(p.handoff), 'Reserve the one handoff before recording requested browser activation.');
      const handoff = read(p.handoff);
      ensure(handoff.caseId === id && handoff.runId === state.runId && handoff.executionProof?.generation === state.execution.generation,
        'Browser activation requires this current qualified handoff reservation.');
    }
    const postSend = ['sent', 'completion', 'source-access'].includes(observation.claim);
    const inspectedResult = postSend && ['observed', 'failed'].includes(observation.status);
    if (observation.lane === 'real-client' && (observation.status === 'observed' || inspectedResult)) {
      if (observation.claim === 'permission') {
        // Browser launch permission is a separate attributed observation. It is
        // not a Claude capture and cannot populate a qualified desktop stage.
        executionReady(state);
        ensure(fs.existsSync(p.handoff), 'Permission observations require the owned handoff reservation.');
      } else {
        proof = checkedExecutionProof(state, executionProof, observation.material);
        const beforeSend = ['draft-arrived', 'context-matches', 'presentation-matches'].includes(observation.claim);
        const claimFile = postSend ? p.claim : beforeSend ? p.handoff : undefined;
        if (claimFile) {
          ensure(fs.existsSync(claimFile), postSend ? 'Claim Send before a submitted-message, source or reply observation.' : 'Claim handoff before observing native draft arrival or comparison.');
          const action = read(claimFile), capture = postSend ? action.arrivalReadiness : action.readiness;
          const ownedWindow = capture?.windowId ?? action.executionProof?.windowId;
          const previousCapture = capture?.captureId ?? action.preSendCaptureId;
          ensure(action.caseId === id && action.runId === state.runId && ownedWindow !== undefined
            && proof.windowId === ownedWindow && proof.captureId !== previousCapture
            && Date.parse(proof.capturedAt) > Date.parse(action.claimedAt),
          postSend ? 'A distinct post-Send capture in the same owned window is required.' : 'A distinct post-handoff capture in the same owned window is required.');
        }
      }
    }
    if (observation.lane === 'real-client' && observation.claim === 'source-access' && inspectedResult) ensure(observation.material?.method === 'visible-tool-result', 'Inspected source findings require the visible-tool-result method.');
    if (observation.claim === 'presentation-matches' || observation.material?.method === LAB_AX_POLICY) ensure((state.draftPolicy ?? EXACT_POLICY) === LAB_AX_POLICY, 'This case did not select the named presentation policy at preparation.');
    if (observation.claim === 'sent') ensure(fs.existsSync(p.claim), 'Claim Send durably before any Send observation.');
    const run = checkedRun(file); ensure(run.id === state.runId, 'Run identity changed.');
    const next = addObservation(run, observation);
    // The session's bounded material is created only after lifecycle and record
    // validation, under the same lock as finish. Rejected old sessions write nothing.
    persistMaterial?.();
    atomic(file, next);
    atomic(runPath(root, state.runId), next); // Disposable UI projection, never authority.
    if (proof) atomic(p.state, { ...state, execution: { ...state.execution, stageProofs: { ...state.execution.stageProofs, [observation.claim]: proof } } });
    journal(p, 'observed-' + observation.claim + '-' + observation.status);
    return { run: next, summary: summarizeRun(next) };
  });
}

export function finishCase(id, { root = ROOT } = {}) {
  const p = pathsFor(id, root);
  return locked(p, () => {
    const state = read(p.state);
    if (state.status === 'finished') {
      if (fs.existsSync(p.active) && read(p.active).id === id) fs.unlinkSync(p.active);
      return read(path.join(p.dir, 'report.json'));
    }
    ensure(['active', 'paused'].includes(state.status) && read(p.active).id === id, 'This case does not own the Claude runner.');
    const run = checkedRun(p.run), summary = summarizeRun(run);
    const client = summary.realClient.clients['claude-app'];
    const checks = Object.fromEntries(['draft-arrived', 'context-matches', 'sent', 'completion'].map(claim => [claim, client[claim].status === 'observed']));
    checks['handoff-requested'] = summary.browser.clients['claude-app']['handoff-requested'].status === 'requested';
    const draftPolicy = validateDraftPolicy(state.draftPolicy ?? EXACT_POLICY, state.manifest);
    checks['presentation-matches'] = client['presentation-matches'].status === 'observed';
    const sentMaterial = run.observations.filter(o => o.lane === 'real-client' && o.claim === 'sent' && o.status === 'observed').at(-1)?.material;
    const composerFidelity = checks['context-matches'] ? 'exact-exposed-text' : checks['presentation-matches'] ? 'named-presentation-match' : 'not-established';
    let submittedFidelity = 'not-established';
    if (checks.sent) {
      if (sentMaterial?.method === LAB_AX_POLICY) submittedFidelity = sentMaterial.basis === 'exact' ? 'exact-exposed-text' : 'named-presentation-match';
      else submittedFidelity = sentMaterial?.contextSha256 === state.manifest.contextSha256 ? 'exact-exposed-text' : 'visual-transition-only';
    }
    const exactContextQualified = checks['context-matches'] && (draftPolicy === EXACT_POLICY || submittedFidelity === 'exact-exposed-text');
    const fidelityAccepted = draftPolicy === EXACT_POLICY ? checks['context-matches'] : checks['presentation-matches'];
    const interactionPassed = ['draft-arrived', 'sent', 'completion', 'handoff-requested'].every(claim => checks[claim]) && fidelityAccepted;
    const sourceAccess = client['source-access'].status;
    const handoffClaim = fs.existsSync(p.handoff) ? read(p.handoff) : undefined;
    const sendClaim = fs.existsSync(p.claim) ? read(p.claim) : undefined;
    const readiness = { policy: 'owned-fresh-chat-v1',
      preflight: handoffClaim?.readiness ? 'observed' : 'not-checked',
      arrival: sendClaim?.arrivalReadiness ? 'observed' : 'not-checked', windowBinding: 'controller-attributed' };
    const testPath = state.testPath || 'lab-component';
    let execution;
    if (state.executionContract) {
      const e = state.execution, current = proof => proof?.generation === e.generation && proof?.controllerId === e.controllerId
        && proof?.qualifiedAt === e.qualification?.evidence?.qualifiedAt && proof?.contractSha256 === state.executionContract.contractSha256;
      const coherent = current(handoffClaim?.executionProof) && current(sendClaim?.executionProof)
        && ['draft-arrived', draftPolicy === EXACT_POLICY ? 'context-matches' : 'presentation-matches', 'sent', 'completion'].every(claim => current(e.stageProofs?.[claim]));
      const cleanupComplete = e.cleanup && e.cleanup.browser !== 'blocked' && e.cleanup.native !== 'blocked';
      const contractQualified = interactionPassed && e.status === 'qualified' && e.qualification?.qualified === true && coherent && !e.humanAssisted && Boolean(cleanupComplete);
      execution = { contractVersion: state.executionContract.schema, setup: e.humanSetup ? 'human-setup-recorded' : 'not-recorded',
        qualificationStatus: e.status, controllerAttributed: true, generation: e.generation,
        mode: e.humanAssisted ? 'human-assisted' : e.status === 'qualified' ? 'agent-operated-after-human-setup' : 'unqualified',
        contractQualified, coherentStageProofs: Boolean(coherent), cleanup: e.cleanup ?? { status: 'not-recorded' }, ...(e.blockedReason && { blockedReason: e.blockedReason }),
        interventions: e.interventions, recoveries: e.recoveries ?? [], ...(e.overflowIntervention && { overflowIntervention: e.overflowIntervention }),
        outcome: fs.existsSync(p.claim) && !checks.sent ? 'indeterminate' : e.status === 'blocked' ? 'blocked' : interactionPassed ? 'completed'
          : Object.values(client).some(stage => stage.status === 'failed') ? 'failed' : 'incomplete' };
    }
    const report = { schema: 'agent-art-bench/desktop-result/1', caseId: id, runId: state.runId, manifest: state.manifest, authority: state.authority,
      testPath, draftPolicy, readiness, composerFidelity, submittedFidelity, exactContextQualified, fidelityAccepted, transportBytes: 'not-established',
      componentPathQualified: testPath === 'lab-component' && interactionPassed && exactContextQualified && (!execution || execution.contractQualified),
      ...(execution && { execution }),
      componentPathObservedUnderPolicy: testPath === 'lab-component' && interactionPassed,
      finishedAt: new Date().toISOString(), checks, interactionPassed, sourceAccess,
      outcome: interactionPassed ? !exactContextQualified ? 'interaction-completed-under-presentation-policy' : sourceAccess === 'observed' ? 'interaction-and-visible-source-result-observed' : 'interaction-completed-source-access-limited' : 'interaction-incomplete-or-failed',
      sendClaimed: fs.existsSync(p.claim), sendDispatch: summarizeDispatch(p, state),
      sendRecovery: fs.existsSync(p.claim) && !checks.sent ? 'possibly-attempted-do-not-resend' : 'no-retry',
      summary, limits: ['Attributed GUI observations, not independent execution-origin or intention proof.',
        'A completed interaction under a named presentation policy does not establish exact exposed composer or transport bytes.',
        'Source-access results and visible orientation remain separate; neither certifies raw response bytes.',
        'Only this owned public Lab case is in scope. No SDK mutation, Codex draft action or deployment.'] };
    atomic(path.join(p.dir, 'report.json'), report); atomic(p.state, { ...state, status: 'finished', finishedAt: report.finishedAt });
    journal(p, 'finished-' + report.outcome);
    if (read(p.active).id === id) fs.unlinkSync(p.active); return report;
  });
}

/** Read canonical external state after a controller crash or workspace restore.
 * Never import the workspace's case/claims, extend a deadline or renew attempts.
 */
export function reconcileCase(id, { root = ROOT, controllerId, previousControllerStopped = false, exclusiveInput = false } = {}) {
  const p = pathsFor(id, root);
  ensure(typeof controllerId === 'string' && CAPTURE_ID.test(controllerId), 'A bounded controller identity is required.');
  abandonStoppedControllerLock(p, { previousControllerStopped, exclusiveInput });
  return locked(p, () => {
    const state = read(p.state);
    ensure(state.schema === 'agent-art-bench/desktop-case/1', 'Only a desktop case may use this reconciliation.');
    if (state.status === 'finished') {
      const report = read(path.join(p.dir, 'report.json'));
      if (fs.existsSync(p.active) && read(p.active).id === id) { fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); }
      return { terminal: true, sendClaimed: fs.existsSync(p.claim), report };
    }
    ensure(read(p.active).id === id && state.execution && !state.execution.cleanup, 'Only the owned unfinished case may recover.');
    ensure(!state.execution.controllerId || state.execution.controllerId === controllerId, 'Recovery requires the same controller identity.');
    ensure(!state.execution.revoked && !state.execution.budgetExhausted, 'Revoked or exhausted authority cannot recover; finish the case.');
    const recoveryCount = (state.execution.recoveryCount ?? 0) + 1;
    ensure(recoveryCount <= 16, 'Recovery budget exhausted; finish this case.');
    const expired = Date.now() > Date.parse(state.deadlineAt);
    const next = { ...state, status: 'active', execution: { ...state.execution, generation: state.execution.generation + 1,
      recoveries: [...(state.execution.recoveries ?? []), { at: new Date().toISOString(), controllerId,
        previousControllerStopped: true, exclusiveInput: true, attribution: 'controller' }],
      recoveryCount, status: expired ? 'blocked' : 'unqualified', qualification: undefined,
      blockedReason: expired ? 'timeout' : undefined, actionMode: fs.existsSync(p.claim) ? 'observation-only' : 'normal' } };
    atomic(p.state, next);
    const run = checkedRun(p.run);
    fs.mkdirSync(path.dirname(runPath(root, run.id)), { recursive: true, mode: 0o700 });
    atomic(runPath(root, run.id), run);
    const projection = path.join(root, '.local/test-bench/desktop', id);
    fs.mkdirSync(projection, { recursive: true, mode: 0o700 });
    for (const name of fs.readdirSync(p.dir)) {
      if (!/^(?:draft-arrived|context-matches|presentation-matches|sent|source-access|completion)-[a-f0-9-]{36}\.json$/u.test(name)) continue;
      const material = read(path.join(p.dir, name));
      if (material.schema === 'agent-art-bench/desktop-material/1' && material.caseId === id) atomic(path.join(projection, name), material);
    }
    journal(p, 'external-authority-reconciled-fresh-qualification-required');
    return { state: next, handoffClaimed: fs.existsSync(p.handoff), sendClaimed: fs.existsSync(p.claim),
      dispatchEntered: fs.existsSync(p.dispatchEntered), freshQualificationRequired: true, previousControllerStopped: true,
      trust: 'Controller attests prior controller stopped and exclusive input; no OS exclusion lock is established.' };
  });
}

if (typeof process !== 'undefined' && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  try {
    let result;
    if (command === 'prepare') {
      if (args.includes('--draft-policy')) ensure(args[args.indexOf('--draft-policy') + 1] && !args[args.indexOf('--draft-policy') + 1].startsWith('--'), 'Name the explicit draft policy after --draft-policy.');
      result = await prepareCase({ allowSend: args.includes('--authorize-send'), authorityRoot: args.includes('--authority-dir') ? args[args.indexOf('--authority-dir') + 1] : undefined, runId: args.includes('--run') ? args[args.indexOf('--run') + 1] : undefined,
        draftPolicy: args.includes('--draft-policy') ? args[args.indexOf('--draft-policy') + 1] : EXACT_POLICY });
    }
    else if (command === 'authority-init') result = bindAuthorityStore({ root: ROOT, authorityRoot: args[0] });
    else if (command === 'reconcile') result = reconcileCase(args[0], { controllerId: args.includes('--controller') ? args[args.indexOf('--controller') + 1] : undefined,
      previousControllerStopped: args.includes('--previous-controller-stopped'), exclusiveInput: args.includes('--exclusive-input') });
    else if (command === 'qualify') { ensure(args[1] === '--file' && args[2], 'Use qualify <case-id> --file <assessment.json>.'); result = qualifyCase(args[0], read(args[2])); }
    else if (command === 'interrupt') {
      const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
      result = recordExecutionInterruption(args[0], { reason: option('--reason'), actor: option('--actor'), humanAction: option('--human-action') });
    }
    else if (command === 'resume-execution') {
      const controllerId = args.includes('--controller') ? args[args.indexOf('--controller') + 1] : undefined;
      result = resumeExecution(args[0], { controllerId, confirmedHumanAction: args.includes('--confirmed-human-action') });
    }
    else if (command === 'claim-send') { ensure(args[1] === '--file' && args[2], 'Use claim-send <case-id> --file <bounded-proof.json>.'); result = claimSend(args[0], { ...read(args[2]), root: ROOT }); }
    else if (command === 'claim-handoff') { ensure(args[1] === '--file' && args[2], 'Use claim-handoff <case-id> --file <bounded-proof.json>.'); result = claimHandoff(args[0], { ...read(args[2]), root: ROOT }); }
    else if (command === 'mark-uri-control') result = markUriControl(args[0]);
    else if (command === 'pause-locked') result = pauseCase(args[0]);
    else if (command === 'pause-approval') result = pauseCase(args[0], { reason: 'inspection-approval' });
    else if (command === 'resume-unlocked') result = resumeCase(args[0], { confirmedUnlocked: args.includes('--confirmed-unlocked'), controllerId: args.includes('--controller') ? args[args.indexOf('--controller') + 1] : undefined });
    else if (command === 'resume-access') result = resumeCase(args[0], { confirmedAccess: args.includes('--confirmed-access'), controllerId: args.includes('--controller') ? args[args.indexOf('--controller') + 1] : undefined });
    else if (command === 'observe') { ensure(args[1] === '--file' && args[2], 'Use observe <case-id> --file <bounded-observation.json>.'); const input = read(args[2]); result = observeCase(args[0], input.observation ?? input, { executionProof: input.executionProof }); }
    else if (command === 'cleanup') { ensure(args[1] === '--file' && args[2], 'Use cleanup <case-id> --file <bounded-cleanup.json>.'); result = recordExecutionCleanup(args[0], read(args[2])); }
    else if (command === 'finish') result = finishCase(args[0]);
    else if (command === 'show') result = read(pathsFor(args[0]).state);
    else throw Error('Use prepare --authorize-send, qualify <case-id> --file <json>, claim-handoff|claim-send|observe <case-id> --file <json>, interrupt <case-id> --reason <code> --actor <code> --human-action <code>, resume-execution <case-id> --controller <id>, cleanup <case-id> --file <json>, finish <case-id>, or show <case-id>.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
