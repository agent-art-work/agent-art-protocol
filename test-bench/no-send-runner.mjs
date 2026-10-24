/** Bounded environment diagnostic. No handoff, Send, prompt or model API.
 * The coding Agent supplies permitted CUA and freshly reviewed captures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT, loadBenchInputs } from './inputs.mjs';
import { SDK_SHA256 } from './desktop-runner.mjs';
import { bindAuthorityStore, authorityCasePaths, registerAuthorityCase, assertAuthorityCase,
  withAuthorityLock, writeExclusive, writeAtomic, abandonStoppedControllerLock, syncDirectory } from './authority-store.mjs';
import { createNoSendExecutionContract, qualifyExecution, inspectExecution, validateExecutionContract, executionCaptureMaxAgeMs, NO_SEND_LANE } from './execution-contract.mjs';
import { inspectDiagnosticComposer } from './readiness.mjs';
import { inspectClaudeComposerFocus } from './composer-focus.mjs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const REASONS = ['permission-required', 'target-lost', 'observation-conflict', 'observation-unavailable', 'input-interference', 'controller-unavailable', 'timeout', 'operator-revoked'];
const STEPS = ['focus', 'type', 'clear'];
function event(p, code) {
  const events = fs.existsSync(p.journal) ? read(p.journal) : [];
  events.push({ at: new Date().toISOString(), code }); writeAtomic(p.journal, events);
}
function stateFor(p, { deadline = true } = {}) {
  const state = read(p.state); assertAuthorityCase(p, state);
  ensure(state.schema === 'agent-art-bench/no-send-case/1', 'A dedicated no-Send diagnostic case is required.');
  validateExecutionContract(state.executionContract);
  ensure(/^agent-art-no-send-[a-f0-9-]{36}$/u.test(state.marker)
    && createHash('sha256').update(state.marker).digest('hex') === state.executionContract.payload.contextSha256, 'Diagnostic marker binding differs.');
  ensure(state.executionContract.lane === NO_SEND_LANE && state.executionContract.authority.maximumHandoffs === 0
    && state.executionContract.authority.maximumSends === 0, 'Diagnostic authority must remain zero handoffs and zero Sends.');
  ensure(state.status === 'active' && read(p.active).id === state.id, 'This diagnostic has finished or lost ownership.');
  if (deadline) ensure(Date.now() <= Date.parse(state.deadlineAt), 'Diagnostic deadline expired; record a blocked result without more input.');
  return state;
}
const claimPath = (p, step) => path.join(p.dir, 'diagnostic-' + step + '-claimed.json');

export async function prepareDiagnostic({ root = ROOT, authorityRoot, inputs, authorizeProbe = false, timeoutMs = 180000, captureProfile, cleanupCaseId, focusOnly = false } = {}) {
  ensure(authorizeProbe === true, 'Explicit authorization for the public no-Send probe is required.');
  ensure(typeof focusOnly === 'boolean', 'Explicit Boolean focus-only scope required.');
  inputs ||= await loadBenchInputs();
  ensure(inputs.manifest.sdkVersion === '0.1.4' && inputs.manifest.archiveSha256 === SDK_SHA256, 'The SDK 0.1.4 pin must remain unchanged.');
  let origin, originPaths;
  if (cleanupCaseId) {
    originPaths = authorityCasePaths(cleanupCaseId, root); origin = read(originPaths.state);
    assertAuthorityCase(originPaths, origin); validateExecutionContract(origin.executionContract);
    ensure(origin.schema === 'agent-art-bench/no-send-case/1' && origin.status === 'finished'
      && origin.executionContract.lane === NO_SEND_LANE && !origin.cleanupOrigin && origin.actions?.type?.dispatch === 'returned'
      && !fs.existsSync(claimPath(originPaths, 'clear')), 'Cleanup requires a finished original marker case with returned type and unused clear.');
    ensure(origin.executionContract.configurationSha256 === createNoSendExecutionContract({ manifest: origin.executionContract.payload, environment: inputs.environment, timeoutMs }).configurationSha256, 'Cleanup environment differs.');
  }
  const marker = origin?.marker ?? 'agent-art-no-send-' + randomUUID();
  const manifest = { id: 'public-environment-marker', workId: 'https://agentart.work/#environment-check', workVersion: '1',
    sdkVersion: '0.1.4', archiveSha256: SDK_SHA256, contextSha256: createHash('sha256').update(marker).digest('hex'), contextBytes: Buffer.byteLength(marker) };
  const cleanupOrigin = origin && { caseId: origin.id, contractSha256: origin.executionContract.contractSha256 };
  const contract = createNoSendExecutionContract({ manifest, environment: inputs.environment, timeoutMs,
    ...(captureProfile !== undefined && { captureProfile }), ...(cleanupOrigin && { cleanupOrigin }), ...(focusOnly && { focusOnly: true }) });
  bindAuthorityStore({ root, authorityRoot });
  const id = 'diagnostic-' + randomUUID(), p = authorityCasePaths(id, root);
  writeExclusive(p.active, { id, createdAt: new Date().toISOString() });
  try {
    fs.mkdirSync(p.dir, { mode: 0o700 });
    syncDirectory(p.base);
    const authority = registerAuthorityCase(p, { id, kind: 'diagnostic', contractSha256: contract.contractSha256 });
    const state = { schema: 'agent-art-bench/no-send-case/1', id, status: 'active', authority, marker,
      startedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + timeoutMs).toISOString(), executionContract: contract,
      execution: { status: 'unqualified', generation: 1, qualificationCount: 0, recoveryCount: 0 }, checks: {}, interruptions: [] };
    if (origin) {
      state.cleanupOrigin = { ...cleanupOrigin, type: origin.actions.type };
      state.windowId = origin.windowId;
      withAuthorityLock(originPaths, () => {
        ensure(read(originPaths.state).status === 'finished', 'The origin must remain finished.');
        writeExclusive(claimPath(originPaths, 'clear'), { step: 'clear', dispatch: 'delegated-to-cleanup-only-case', caseId: id, claimedAt: new Date().toISOString(), contractSha256: contract.contractSha256 });
      });
    }
    writeAtomic(p.state, state); event(p, 'prepared-zero-handoff-zero-send'); return state;
  } catch (error) {
    if (fs.existsSync(p.active) && read(p.active).id === id) fs.unlinkSync(p.active);
    throw error;
  }
}

export function qualifyDiagnostic(id, assessment, { root = ROOT } = {}) {
  const p = authorityCasePaths(id, root);
  return withAuthorityLock(p, () => {
    const state = stateFor(p), e = state.execution;
    ensure(e.status !== 'blocked', 'Interrupted diagnostic requires explicit reconciliation before qualification.');
    ensure(e.qualificationCount < 16, 'Diagnostic qualification budget exhausted.');
    ensure(!e.controllerId || e.controllerId === assessment.controllerId, 'The diagnostic controller cannot change.');
    const generation = e.generation + (e.qualificationCount ? 1 : 0);
    const qualification = qualifyExecution(state.executionContract, assessment, { generation, now: Date.now() });
    const next = { ...state, execution: { ...e, generation, qualificationCount: e.qualificationCount + 1,
      status: qualification.qualified ? 'qualified' : 'unqualified', qualification,
      ...(qualification.qualified && { controllerId: assessment.controllerId }) } };
    writeAtomic(p.state, next); event(p, 'qualification-' + (qualification.qualified ? 'passed' : 'blocked'));
    return { ...qualification, generation };
  });
}

export function interruptDiagnostic(id, reason, { root = ROOT } = {}) {
  ensure(REASONS.includes(reason), 'Use a bounded diagnostic interruption reason.');
  const p = authorityCasePaths(id, root);
  return withAuthorityLock(p, () => {
    const state = stateFor(p, { deadline: false });
    ensure(state.interruptions.length < 16, 'Diagnostic interruption budget exhausted.');
    const next = { ...state, interruptions: [...state.interruptions, { at: new Date().toISOString(), reason }],
      execution: { ...state.execution, status: 'blocked', generation: state.execution.generation + 1,
        revoked: state.execution.revoked === true || reason === 'operator-revoked' } };
    writeAtomic(p.state, next); event(p, 'interrupted-' + reason); return next;
  });
}

/** Reconcile external state, never a restored workspace copy. Consumed input
 * attempts remain consumed; recovery cannot retype or reclear an uncertain input.
 */
export function reconcileDiagnostic(id, { root = ROOT, controllerId, previousControllerStopped = false, exclusiveInput = false } = {}) {
  const p = authorityCasePaths(id, root);
  ensure(typeof controllerId === 'string' && ID.test(controllerId), 'A bounded controller is required.');
  abandonStoppedControllerLock(p, { previousControllerStopped, exclusiveInput });
  return withAuthorityLock(p, () => {
    const state = read(p.state);
    ensure(state.schema === 'agent-art-bench/no-send-case/1', 'A diagnostic case is required.');
    if (state.status === 'finished') {
      const report = read(path.join(p.dir, 'report.json'));
      if (fs.existsSync(p.active) && read(p.active).id === id) { fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); }
      return { terminal: true, report };
    }
    stateFor(p, { deadline: false });
    const e = state.execution;
    ensure(!e.revoked && e.recoveryCount < 8, 'Revoked or exhausted diagnostic cannot resume.');
    ensure(!e.controllerId || e.controllerId === controllerId, 'Recovery requires the same controller.');
    const expired = Date.now() > Date.parse(state.deadlineAt);
    const actions = { ...state.actions };
    for (const step of STEPS) if (fs.existsSync(claimPath(p, step)) && !actions[step]) actions[step] = read(claimPath(p, step));
    const next = { ...state, actions, recoveries: [...(state.recoveries ?? []), { at: new Date().toISOString(), controllerId,
      previousControllerStopped: true, exclusiveInput: true, attribution: 'controller' }],
      execution: { ...e, generation: e.generation + 1, recoveryCount: e.recoveryCount + 1,
      status: expired ? 'blocked' : 'unqualified', qualification: undefined } };
    writeAtomic(p.state, next); event(p, 'reconciled-fresh-qualification-required');
    return { state: next, consumedInputs: STEPS.filter(step => fs.existsSync(claimPath(p, step))), freshQualificationRequired: true };
  });
}

function inspectOwned(p, state, snapshot, selection, controllerId, expected, focused) {
  ensure(state.execution.status === 'qualified' && state.execution.controllerId === controllerId, 'Current diagnostic qualification is required.');
  const checked = inspectExecution(state.executionContract, state.execution.qualification, snapshot, selection.execution,
    { generation: state.execution.generation, now: Date.now() });
  ensure(checked.ready, 'Diagnostic execution inspection failed: ' + checked.reason + '.');
  if (state.windowId !== undefined) ensure(snapshot.windowId === state.windowId, 'Diagnostic target window differs.');
  const options = { ...selection, expected, marker: state.marker, now: Date.now(), maxAgeMs: executionCaptureMaxAgeMs(state.executionContract) };
  const composer = inspectDiagnosticComposer(snapshot, options);
  ensure(composer.ready, 'Diagnostic composer check failed: ' + composer.reason + '.');
  const focus = focused ? inspectClaudeComposerFocus(snapshot, options) : undefined;
  if (focused) ensure(focus.focused, 'Fresh exposed composer focus is required.');
  return { ...checked.evidence, ...(focus && { focus: focus.evidence }) };
}

function afterAction(state, snapshot, action) {
  const claim = action === 'type' && state.cleanupOrigin ? state.cleanupOrigin.type : state.actions?.[action];
  ensure(claim && ['entered', 'returned'].includes(claim.dispatch), 'A consumed diagnostic action is required before effect inspection.');
  ensure(snapshot.captureId !== claim.captureId && Date.parse(snapshot.capturedAt) >= Date.parse(claim.returnedAt ?? claim.claimedAt), 'Inspect a distinct post-action capture.');
}

/** There is deliberately no launch, handoff, keypress or Send method here.
 * setValue clears only the exactly observed generated marker, with no shortcut.
 */
export function createDiagnosticSession({ caseId, app, controllerId, root = ROOT }) {
  ensure(app && ['click', 'typeText', 'setValue'].every(key => typeof app[key] === 'function'), 'A permitted CUA handle with click, typeText and setValue is required.');
  ensure(typeof controllerId === 'string' && ID.test(controllerId), 'A bounded diagnostic controller is required.');
  const p = authorityCasePaths(caseId, root);
  async function input(step, snapshot, selection) {
    let proof, claim;
    try {
      withAuthorityLock(p, () => {
        const state = stateFor(p);
        ensure(state.executionContract.diagnostic[{ focus: 'maximumFocuses', type: 'maximumTypes', clear: 'maximumClears' }[step]] === 1, 'This diagnostic scope has no authority for that action.');
        proof = inspectOwned(p, state, snapshot, selection, controllerId, step === 'clear' ? 'marker' : 'empty', step === 'type');
        if (step === 'type') ensure(state.checks.focus?.generation === state.execution.generation, 'Observe focus before typing.');
        if (step === 'clear') ensure(state.checks.marker?.generation === state.execution.generation, 'Observe the exact marker before clearing.');
        if (step === 'type') afterAction(state, snapshot, 'focus');
        if (step === 'clear') afterAction(state, snapshot, 'type');
        claim = { step, claimedAt: new Date().toISOString(), captureId: snapshot.captureId, generation: state.execution.generation,
          dispatch: 'entered', composerIndex: selection.composerIndex, proof };
        writeExclusive(claimPath(p, step), claim);
        writeAtomic(p.state, { ...state, windowId: snapshot.windowId, actions: { ...state.actions, [step]: claim } });
        event(p, 'input-' + step + '-claimed-before-dispatch');
      });
    } catch (error) {
      // A conflicting or stale inspected target revokes qualification. A prior
      // claimed input is never made available again by this failure.
      try { interruptDiagnostic(caseId, 'observation-unavailable', { root }); } catch {}
      throw error;
    }
    try {
      if (step === 'focus') await app.click(claim.composerIndex);
      else if (step === 'type') await app.typeText(read(p.state).marker);
      else await app.setValue(claim.composerIndex, '');
    } catch (error) {
      try { interruptDiagnostic(caseId, 'controller-unavailable', { root }); } catch {}
      throw error;
    }
    return withAuthorityLock(p, () => {
      const state = stateFor(p);
      ensure(state.execution.status === 'qualified' && state.execution.generation === claim.generation, 'Input was interrupted; its return cannot restore qualification.');
      const returned = { ...claim, dispatch: 'returned', returnedAt: new Date().toISOString() };
      writeAtomic(p.state, { ...state, actions: { ...state.actions, [step]: returned } });
      event(p, 'input-' + step + '-returned-effect-unobserved');
      return { step, dispatch: 'returned', effect: 'not-observed', next: 'Obtain a fresh paired capture and review its actual effect.' };
    });
  }
  function observe(stage, action, expected, focused, snapshot, selection) {
    try {
      return withAuthorityLock(p, () => {
        const state = stateFor(p);
        const proof = inspectOwned(p, state, snapshot, selection, controllerId, expected, focused);
        afterAction(state, snapshot, action);
        const check = { generation: state.execution.generation, proof };
        writeAtomic(p.state, { ...state, checks: { ...state.checks, [stage]: check } });
        event(p, 'observed-' + stage); return check;
      });
    } catch (error) {
      try { interruptDiagnostic(caseId, 'observation-unavailable', { root }); } catch {}
      throw error;
    }
  }
  return {
    focus: (snapshot, selection) => input('focus', snapshot, selection),
    observeFocus: (snapshot, selection) => observe('focus', 'focus', 'empty', true, snapshot, selection),
    typeMarker: (snapshot, selection) => input('type', snapshot, selection),
    observeMarker: (snapshot, selection) => observe('marker', 'type', 'marker', false, snapshot, selection),
    clearMarker: (snapshot, selection) => input('clear', snapshot, selection),
    observeEmpty: (snapshot, selection) => observe('empty', 'clear', 'empty', false, snapshot, selection),
  };
}

export function recordDiagnosticIndependence(id, { status, source }, { root = ROOT } = {}) {
  ensure(['observed', 'failed', 'not-observed'].includes(status) && ['controller', 'operator-report'].includes(source), 'Use bounded attributed input-independence findings.');
  const p = authorityCasePaths(id, root);
  return withAuthorityLock(p, () => {
    const state = stateFor(p, { deadline: false });
    ensure(!state.independence, 'Input-independence finding is immutable.');
    if (status === 'observed') ensure(state.checks.empty?.generation === state.execution.generation && state.execution.status === 'qualified', 'Observed input independence requires completed current marker cleanup.');
    writeAtomic(p.state, { ...state, independence: { status, source, attribution: source } });
    event(p, 'independence-' + status + '-' + source);
  });
}

export function finishDiagnostic(id, { root = ROOT } = {}) {
  const p = authorityCasePaths(id, root);
  return withAuthorityLock(p, () => {
    const state = read(p.state);
    ensure(state.schema === 'agent-art-bench/no-send-case/1', 'A diagnostic case is required.');
    if (state.status === 'finished') return read(path.join(p.dir, 'report.json'));
    stateFor(p, { deadline: false });
    const current = stage => state.checks[stage]?.generation === state.execution.generation;
    const interactionObserved = ['focus', 'marker', 'empty'].every(current);
    const deadlineValid = Date.now() <= Date.parse(state.deadlineAt);
    const cleanupOnly = Boolean(state.cleanupOrigin);
    const passed = !cleanupOnly && interactionObserved && deadlineValid && state.execution.status === 'qualified'
      && state.independence?.status === 'observed' && state.independence.source === 'controller' && state.interruptions.length === 0
      && state.execution.recoveryCount === 0;
    const consumedInputs = STEPS.filter(step => fs.existsSync(claimPath(p, step)));
    const uncertain = consumedInputs.filter(step => !current({ focus: 'focus', type: 'marker', clear: 'empty' }[step]));
    const report = { schema: 'agent-art-bench/no-send-result/1', caseId: id, finishedAt: new Date().toISOString(),
      maximumHandoffs: 0, maximumSends: 0, sdkVersion: '0.1.4', outcome: passed ? 'bounded-no-send-gate-observed'
        : uncertain.length ? 'indeterminate' : state.execution.status === 'blocked' || !deadlineValid ? 'blocked' : 'incomplete',
      passed, interactionObserved, ...(cleanupOnly && { cleanupOnly: true, originCaseId: state.cleanupOrigin.caseId }), checks: state.checks, consumedInputs, uncertainInputs: uncertain,
      // Accepted past observations survive a later interruption. They neither
      // restore present readiness nor override the case deadline/pass result.
      observedEffects: Object.fromEntries(Object.entries(state.checks).map(([stage, check]) => [stage, {
        generation: check.generation, capturedAt: check.proof.capturedAt, assessedAt: check.proof.assessedAt,
        captureId: check.proof.captureId, currentGeneration: current(stage) }])),
      markerCleanup: current('empty') ? 'observed-empty' : fs.existsSync(claimPath(p, 'type')) ? 'unconfirmed-public-marker-may-remain' : 'marker-not-typed',
      independence: state.independence ?? { status: 'not-observed' }, interruptions: state.interruptions, recoveries: state.recoveries ?? [],
      authority: state.authority, limits: ['Controller-attributed captures and input ownership, not an independent witness.',
        'No handoff, Send, source reading, reply or Agent intention is qualified.',
        'An external path does not prove storage is outside a VM baseline; placement must be verified during setup.',
        'Operator-reported host independence cannot substitute for controller observation.'] };
    writeAtomic(path.join(p.dir, 'report.json'), report);
    writeAtomic(p.state, { ...state, status: 'finished', finishedAt: report.finishedAt }); event(p, 'finished-' + report.outcome);
    if (read(p.active).id === id) { fs.unlinkSync(p.active); syncDirectory(path.dirname(p.active)); }
    return report;
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2), option = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
  try {
    let result;
    if (command === 'prepare') result = await prepareDiagnostic({ authorizeProbe: args.includes('--authorize-probe'), authorityRoot: option('--authority-dir') });
    else if (command === 'qualify') result = qualifyDiagnostic(args[0], read(option('--file')));
    else if (command === 'interrupt') result = interruptDiagnostic(args[0], option('--reason'));
    else if (command === 'reconcile') result = reconcileDiagnostic(args[0], { controllerId: option('--controller'), previousControllerStopped: args.includes('--previous-controller-stopped'), exclusiveInput: args.includes('--exclusive-input') });
    else if (command === 'finish') result = finishDiagnostic(args[0]);
    else if (command === 'show') result = read(authorityCasePaths(args[0], ROOT).state);
    else throw Error('Use prepare --authorize-probe --authority-dir <external-dir>, qualify <id> --file <assessment>, interrupt <id> --reason <code>, reconcile <id> --controller <id> --previous-controller-stopped --exclusive-input, finish <id>, or show <id>.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
