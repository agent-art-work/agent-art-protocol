/** Host-owned adapter for the existing no-Send marker session.
 * Native dispatch is supplied by the published guest CUA transport. No Send,
 * URI, keypress or arbitrary-code/action API. Raw paired UI stays in memory.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import readline from 'node:readline';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT, loadBenchInputs } from './inputs.mjs';
import { authorityCasePaths, writeExclusive, writeAtomic } from './authority-store.mjs';
import { claudeAXSnapshot } from './claude-ax.mjs';
import { inspectDiagnosticComposer, CLAUDE_UNIFIED_NO_SEND_PROFILE } from './readiness.mjs';
import { inspectClaudeComposerFocus } from './composer-focus.mjs';
import { validateClaudeSnapshot } from './desktop-ui.mjs';
import { prepareDiagnostic, qualifyDiagnostic, createDiagnosticSession,
  recordDiagnosticIndependence, interruptDiagnostic, finishDiagnostic, reconcileDiagnostic } from './no-send-runner.mjs';
import { executionConfigurationSha256, executionCaptureMaxAgeMs, inspectExecution } from './execution-contract.mjs';

const ensure = (ok, message) => { if (!ok) throw Error(message); };
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = text => createHash('sha256').update(text).digest('hex');
const safeId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(value);
const now = () => new Date().toISOString();

export async function createRemoteMarker({ root = ROOT, authorityRoot, inputs, environment,
  binding, authorizeProbe = false, timeoutMs = 900000, nativeDispatch,
  recoverCaseId, previousControllerStopped = false, exclusiveInput = false, captureProfile, cleanupCaseId, focusOnly = false } = {}) {
  ensure(authorizeProbe === true && safeId(binding?.connectionId) && safeId(binding?.controllerId),
    'Explicit marker authorization and pinned guest runtime/controller required.');
  ensure(typeof nativeDispatch === 'function', 'Permitted guest-native dispatch required.');
  inputs ||= await loadBenchInputs({ environment });
  ensure(!(cleanupCaseId && recoverCaseId), 'Cleanup is a separate reduced scope, not original-case recovery.');
  if (cleanupCaseId) {
    const originBinding = read(path.join(authorityCasePaths(cleanupCaseId, root).dir, 'remote-binding.json'));
    ensure(originBinding.controllerId === binding.controllerId, 'Cleanup must retain the original controller identity.');
  }
  let state, original;
  if (recoverCaseId) {
    ensure(captureProfile === undefined, 'Recovery cannot amend an existing capture profile.');
    ensure(previousControllerStopped === true && exclusiveInput === true, 'Recovery requires stopped prior controller and exclusive guest input.');
    const priorPaths = authorityCasePaths(recoverCaseId, root);
    original = read(path.join(priorPaths.dir, 'remote-binding.json'));
    const prior = read(priorPaths.state);
    ensure(original.controllerId === binding.controllerId && original.connectionId !== binding.connectionId
      && prior.executionContract.configurationSha256 === executionConfigurationSha256(inputs.environment), 'Recovery binding/configuration differs.');
    const result = reconcileDiagnostic(recoverCaseId, { root, controllerId: binding.controllerId, previousControllerStopped, exclusiveInput });
    ensure(!result.terminal, 'Finished marker cases cannot resume.'); state = result.state;
  } else state = await prepareDiagnostic({ root, authorityRoot, inputs, authorizeProbe, timeoutMs, captureProfile, cleanupCaseId, focusOnly });
  const recoveryScope = state.executionContract.diagnostic.purpose === 'focus-recovery';
  const p = authorityCasePaths(state.id, root), windowId = original?.windowId ?? state.windowId ?? 'guest-marker-' + randomUUID();
  const hostSurfaceId = original?.hostSurfaceId ?? 'host-probe-' + randomUUID(), hostMarker = original?.hostMarker ?? 'agent-art-host-' + randomUUID();
  const bindingFile = path.join(p.dir, 'remote-binding.json');
  const pinned = original ?? { schema: 'agent-art-bench/remote-marker-binding/1', ...binding, windowId,
    contractSha256: state.executionContract.contractSha256, hostSurfaceId, hostMarker,
    hostScope: { maximumTypes: 1, maximumSends: 0, maximumKeypresses: 0,
      observationInterface: 'cua-browser-tab-ax-and-pixels', inputInterface: 'cua-browser-tab-typeText' } };
  if (!original) writeExclusive(bindingFile, pinned);
  const runtimeFile = path.join(p.dir, 'remote-controller.json'), runtime = { ...binding, generation: state.execution.generation };
  if (original) {
    writeExclusive(path.join(p.dir, 'remote-recovery-' + state.execution.recoveryCount + '.json'), {
      at: now(), originalConnectionId: original.connectionId, ...runtime, previousControllerStopped: true,
      exclusiveInput: true, authority: 'unused-input-only; no attempt/deadline renewal' });
    writeAtomic(runtimeFile, runtime);
  } else writeExclusive(runtimeFile, runtime);
  const record = (name, value) => writeExclusive(path.join(p.dir, name + '.json'), value);
  const stored = name => read(path.join(p.dir, name + '.json'));
  let activeStep;
  const app = {
    click: index => nativeDispatch({ step: activeStep, method: 'click', index }),
    typeText: text => nativeDispatch({ step: activeStep, method: 'typeText', text }),
    setValue: (index, text) => nativeDispatch({ step: activeStep, method: 'setValue', index, text }),
  };
  const session = createDiagnosticSession({ caseId: state.id, root, controllerId: binding.controllerId, app });
  function current(request) {
    ensure(JSON.stringify(read(bindingFile)) === JSON.stringify(pinned), 'Remote binding changed.');
    ensure(JSON.stringify(read(runtimeFile)) === JSON.stringify(runtime), 'Remote controller superseded by explicit recovery.');
    ensure(request.binding?.connectionId === binding.connectionId && request.binding?.controllerId === binding.controllerId,
      'Guest runtime/controller changed; no reconnect or replay.');
    const s = read(p.state);
    ensure(s.status === 'active' && read(p.active).id === state.id, 'This marker case is no longer active.');
    ensure(Date.now() <= Date.parse(s.deadlineAt), 'Marker case deadline expired.');
    return s;
  }
  function capture(request) {
    const m = request.material;
    ensure(m?.visualAgreement === 'agrees' && m.inputOwnership === 'exclusive', 'Fresh paired visual review and exclusive guest input required.');
    const snapshot = claudeAXSnapshot(m.rawAX, { owned: true, ownedWindowId: windowId,
      captureId: m.captureId, capturedAt: m.capturedAt });
    ensure(snapshot.nodes.filter(n => n.role === 'standard window').length === 1, 'One owned guest window required.');
    const selection = { ...request.selection, freshChat: true, execution: {
      controllerId: binding.controllerId, generation: read(p.state).execution.generation,
      inputOwnership: m.inputOwnership, visualAgreement: m.visualAgreement } };
    ensure(['claude-chat-cowork-v1', CLAUDE_UNIFIED_NO_SEND_PROFILE].includes(selection.modeProfile), 'Explicit current no-Send surface profile required.');
    return { snapshot, selection };
  }
  function inspectMarker(request) {
    const { snapshot, selection } = capture(request);
    const options = { ...selection, now: Date.now(), maxAgeMs: executionCaptureMaxAgeMs(state.executionContract) };
    const checked = inspectDiagnosticComposer(snapshot, { ...options, expected: 'marker', marker: state.marker });
    ensure(checked.ready && inspectClaudeComposerFocus(snapshot, options).focused,
      'Fresh exact guest marker and exposed composer focus required.');
    session.observeMarker(snapshot, selection);
    return checked.evidence;
  }
  function hostCapture(value, expected) {
    ensure(value && safeId(value.captureId) && value.surfaceId === hostSurfaceId
      && value.bundleId === 'com.google.Chrome' && value.method === 'cua-browser-tab-ax-and-pixels'
      && value.visualAgreement === 'agrees' && value.focused === true && value.value === expected,
    'Owned regular-Chrome probe, exact public value, paired review and exposed focus required.');
    const time = Date.parse(value.capturedAt);
    ensure(Number.isFinite(time) && new Date(time).toISOString() === value.capturedAt
      && time <= Date.now() && Date.now() - time <= executionCaptureMaxAgeMs(state.executionContract), 'Host probe capture is stale or invalid.');
    return { captureId: value.captureId, capturedAt: value.capturedAt, surfaceId: hostSurfaceId,
      bundleId: value.bundleId, method: value.method, valueSha256: sha(expected), focused: true };
  }
  async function command(request) {
    if (request.op === 'finish') {
      ensure(request.binding?.connectionId === binding.connectionId && request.binding?.controllerId === binding.controllerId, 'Pinned binding required.');
      ensure(JSON.stringify(read(runtimeFile)) === JSON.stringify(runtime), 'Remote controller superseded by explicit recovery.');
      return finishDiagnostic(state.id, { root });
    }
    const s = current(request);
    if (recoveryScope) ensure(['qualify', 'focus', 'observe-focus', 'pause-for-restore', 'inspect-restored-unqualified', 'observe-restored-readiness', 'verify-consumed-focus', 'interrupt'].includes(request.op), 'Focus-recovery scope has no typing, clear or host-input authority.');
    if (s.cleanupOrigin) ensure(['qualify', 'clear', 'observe-marker', 'observe-empty', 'interrupt'].includes(request.op), 'Cleanup-only scope cannot focus, type or test host independence.');
    if (request.op === 'qualify') {
      ensure(request.assessment?.controllerId === binding.controllerId, 'Pinned assessment controller required.');
      return qualifyDiagnostic(state.id, request.assessment, { root });
    }
    if (request.op === 'pause-for-restore') {
      ensure(recoveryScope && !original && s.execution.status === 'qualified'
        && s.actions?.focus?.dispatch === 'returned' && s.checks.focus?.generation === s.execution.generation,
        'Pause requires an owned observed focus-only case with no pending input.');
      record('restore-checkpoint', { at: now(), contractSha256: s.executionContract.contractSha256,
        deadlineAt: s.deadlineAt, qualification: s.execution.qualification,
        focusClaimSha256: sha(fs.readFileSync(path.join(p.dir, 'diagnostic-focus-claimed.json'))) });
      interruptDiagnostic(state.id, 'controller-unavailable', { root });
      return { caseId: state.id, pausedForRestore: true, contractSha256: s.executionContract.contractSha256,
        deadlineAt: s.deadlineAt, consumedInputs: ['focus'], furtherInput: 'blocked-until-explicit-reconciliation' };
    }
    if (request.op === 'inspect-restored-unqualified') {
      ensure(recoveryScope && original && s.execution.status === 'unqualified', 'Inspect the reconciled unqualified recovery case first.');
      const { snapshot, selection } = capture(request), settings = { generation: s.execution.generation, now: Date.now() };
      validateClaudeSnapshot(snapshot, { now: Date.now(), maxAgeMs: executionCaptureMaxAgeMs(s.executionContract) });
      const prior = stored('restore-checkpoint');
      const absent = inspectExecution(s.executionContract, s.execution.qualification, snapshot, selection.execution, settings);
      const old = inspectExecution(s.executionContract, prior.qualification, snapshot, selection.execution, settings);
      ensure(!absent.ready && absent.reason === 'qualification-not-established' && !old.ready && old.reason === 'generation-differs'
        && prior.contractSha256 === s.executionContract.contractSha256 && prior.deadlineAt === s.deadlineAt
        && prior.focusClaimSha256 === sha(fs.readFileSync(path.join(p.dir, 'diagnostic-focus-claimed.json'))), 'Restored authority/qualification differs from the declared checkpoint.');
      const result = { at: now(), captureId: snapshot.captureId, capturedAt: snapshot.capturedAt,
        missingQualification: absent.reason, priorQualification: old.reason,
        contractUnchanged: true, deadlineUnchanged: true, focusClaimUnchanged: true, nativeInputs: 0 };
      record('restored-unqualified-check', result); return result;
    }
    if (request.op === 'observe-restored-readiness') {
      ensure(recoveryScope && original && s.execution.status === 'qualified', 'Fresh restored qualification required.');
      stored('restored-unqualified-check');
      const { snapshot, selection } = capture(request);
      const execution = inspectExecution(s.executionContract, s.execution.qualification, snapshot, selection.execution,
        { generation: s.execution.generation, now: Date.now() });
      const composer = inspectDiagnosticComposer(snapshot, { ...selection, expected: 'empty', marker: state.marker,
        now: Date.now(), maxAgeMs: executionCaptureMaxAgeMs(s.executionContract) });
      ensure(execution.ready && composer.ready, 'Fresh empty restored Chat readiness required.');
      const result = { at: now(), execution: execution.evidence, composer: composer.evidence, nativeInputs: 0 };
      record('restored-readiness', result); return result;
    }
    if (request.op === 'verify-consumed-focus') {
      ensure(recoveryScope && original && s.execution.status === 'qualified', 'First establish fresh restored readiness.');
      ensure(stored('restored-readiness').execution.generation === s.execution.generation, 'First establish fresh restored readiness.');
      stored('restored-unqualified-check');
      const { snapshot, selection } = capture(request); let callbackEntered = false, reason;
      const forbidden = async () => { callbackEntered = true; throw Error('Replay guard failed; no native dispatch is permitted.'); };
      const auditSession = createDiagnosticSession({ caseId: state.id, root, controllerId: binding.controllerId,
        app: { click: forbidden, typeText: forbidden, setValue: forbidden } });
      try { await auditSession.focus(snapshot, selection); } catch (error) { reason = error.code; }
      ensure(reason === 'EEXIST' && !callbackEntered, 'Consumed focus was not rejected by the durable claim guard.');
      const result = { at: now(), consumedFocusRejected: true, reason, nativeCallbackEntered: false,
        restoredReadinessObserved: true, nativeInputs: 0, attribution: 'host-guard-checked-against-real-restored-capture' };
      record('restored-consumed-focus-check', result); return result;
    }
    if (['focus', 'type', 'clear'].includes(request.op)) {
      const { snapshot, selection } = capture(request); activeStep = request.op;
      try { return await session[{ focus: 'focus', type: 'typeMarker', clear: 'clearMarker' }[request.op]](snapshot, selection); }
      finally { activeStep = undefined; }
    }
    if (['observe-focus', 'observe-marker', 'observe-empty'].includes(request.op)) {
      const { snapshot, selection } = capture(request);
      return session[{ 'observe-focus': 'observeFocus', 'observe-marker': 'observeMarker', 'observe-empty': 'observeEmpty' }[request.op]](snapshot, selection);
    }
    if (request.op === 'host-baseline') {
      ensure(!s.actions?.focus, 'Record the host baseline before guest focus/type.');
      const evidence = hostCapture(request.host, ''); record('host-baseline', evidence); return evidence;
    }
    if (request.op === 'claim-host-type') {
      const baseline = stored('host-baseline'), afterGuest = hostCapture(request.host, '');
      // Only the input target needs a fresh capture here. The guest effect was
      // already reviewed/accepted and this claim cannot act on the guest.
      const accepted = s.checks.marker, type = s.actions.type;
      ensure(s.execution.status === 'qualified' && accepted?.generation === s.execution.generation
        && type?.dispatch === 'returned', 'First record the current guest marker effect.');
      const guest = accepted.proof;
      ensure(Date.parse(baseline.capturedAt) <= Date.parse(type.claimedAt)
        && Date.parse(afterGuest.capturedAt) >= Date.parse(type.returnedAt)
        && afterGuest.captureId !== baseline.captureId, 'Observe unchanged host input after actual guest typing.');
      const claim = { claimedAt: now(), method: 'cua-browser-tab-typeText', textSha256: sha(hostMarker),
        baseline, afterGuest, guest, dispatch: 'entered' };
      record('host-type-claimed', claim); return { ...claim, text: hostMarker };
    }
    if (request.op === 'settle-host-type') {
      stored('host-type-claimed');
      ensure(typeof request.returned === 'boolean', 'Explicit native host result required.');
      const result = { returnedAt: now(), dispatch: request.returned ? 'returned' : 'unconfirmed' };
      record('host-type-result', result);
      if (!request.returned) interruptDiagnostic(state.id, 'controller-unavailable', { root });
      return result;
    }
    if (request.op === 'observe-host-token') {
      const returned = stored('host-type-result');
      ensure(returned.dispatch === 'returned', 'Uncertain host typing cannot qualify independence.');
      const host = hostCapture(request.host, hostMarker);
      ensure(Date.parse(host.capturedAt) >= Date.parse(returned.returnedAt), 'Fresh post-host-input capture required.');
      record('host-token-observed', host); return host;
    }
    if (request.op === 'observe-isolation') {
      const returned = stored('host-type-result'), host = stored('host-token-observed');
      ensure(returned.dispatch === 'returned', 'Uncertain host typing cannot qualify independence.');
      const guest = inspectMarker(request);
      ensure(Date.parse(guest.capturedAt) >= Date.parse(host.capturedAt), 'Observe the unchanged guest after accepting host arrival.');
      const evidence = { schema: 'agent-art-bench/input-independence/1', host, guest,
        hostType: returned, guestToHost: 'observed-unchanged', hostToGuest: 'observed-unchanged',
        attribution: 'controller', limit: 'Bounded probe only; no OS isolation or arbitrary concurrency guarantee.' };
      record('input-independence-before-cleanup', evidence); return evidence;
    }
    if (request.op === 'independence') {
      const prior = stored('input-independence-before-cleanup'), host = hostCapture(request.host, hostMarker);
      // Aggregate already accepted evidence; this is no new UI observation or
      // input authority. Rechecking the older guest capture here races the
      // host observation against the 30-second action freshness boundary.
      const currentState = read(p.state), empty = currentState.checks.empty, clear = currentState.actions.clear;
      ensure(empty?.generation === currentState.execution.generation && currentState.execution.status === 'qualified'
        && Date.parse(empty.proof.capturedAt) >= Date.parse(clear.returnedAt), 'First record fresh observed guest cleanup.');
      ensure(Date.parse(host.capturedAt) >= Date.parse(empty.proof.assessedAt) && host.captureId !== prior.host.captureId,
        'Observe the unchanged host probe after accepted guest cleanup.');
      const proof = { ...prior, afterGuestCleanup: { host, guest: empty.proof } };
      record('input-independence-proof', proof);
      recordDiagnosticIndependence(state.id, { status: 'observed', source: 'controller' }, { root });
      return proof;
    }
    if (request.op === 'interrupt') return interruptDiagnostic(state.id, request.reason, { root });
    throw Error('Unknown marker operation; no setup, arbitrary click, keypress, handoff or Send.');
  }
  return { state, hostSurfaceId, hostMarker, command: async request => {
    try { return await command(request); }
    catch (error) {
      if (request.binding?.connectionId === binding.connectionId && request.binding?.controllerId === binding.controllerId
        && ['focus', 'type', 'clear', 'observe-focus', 'observe-marker', 'observe-empty',
          'observe-isolation', 'independence'].includes(request.op)) {
        try { if (read(p.state).execution.status !== 'blocked') interruptDiagnostic(state.id, 'observation-unavailable', { root }); } catch {}
      }
      throw error;
    }
  }, finish: () => {
    ensure(JSON.stringify(read(runtimeFile)) === JSON.stringify(runtime), 'Remote controller superseded by explicit recovery.');
    return finishDiagnostic(state.id, { root });
  } };
}

/** An owned, disposable host-only textarea; it has no form or send action. */
export async function hostInputProbe(surfaceId) {
  ensure(safeId(surfaceId), 'Bounded public host probe identity required.');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${surfaceId}</title></head>
<body><h1>Host input independence probe</h1><p>${surfaceId}</p>
<label for="host-probe">Owned host probe ${surfaceId}</label>
<textarea id="host-probe" autofocus rows="6" cols="70" spellcheck="false"></textarea>
<p>No form, submission or Agent request. Only the generated public diagnostic token belongs here.</p></body></html>`;
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' || req.url !== '/' + surfaceId) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'",
      'X-Content-Type-Options': 'nosniff' }); res.end(html);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { url: `http://127.0.0.1:${server.address().port}/${surfaceId}`,
    close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const lines = readline.createInterface({ input: process.stdin });
  let controller, probe, pending, sequence = 0, queue = Promise.resolve(), pausedForRestore = false;
  const emit = value => process.stdout.write(JSON.stringify(value) + '\n');
  const dispatch = action => new Promise((resolve, reject) => {
    ensure(!pending, 'Only one native dispatch can be pending.');
    const requestId = ++sequence, timer = setTimeout(() => { pending = undefined; reject(Error('Guest native acknowledgement lost; attempt consumed.')); }, 200000);
    pending = { requestId, resolve, reject, timer }; emit({ event: 'native-action', requestId, action });
  });
  lines.on('line', line => {
    let request;
    try { ensure(Buffer.byteLength(line) <= 9_000_000, 'Bounded request required.'); request = JSON.parse(line); }
    catch (error) { emit({ event: 'error', error: error.message }); return; }
    if (request.op === 'native-result') {
      if (!pending || pending.requestId !== request.requestId) { emit({ event: 'error', error: 'No matching pending native action.' }); return; }
      const item = pending; pending = undefined; clearTimeout(item.timer);
      if (request.returned === true) item.resolve(); else item.reject(Error('Guest native action unconfirmed; attempt consumed.'));
      return;
    }
    queue = queue.then(async () => {
      try {
        let result;
        if (request.op === 'prepare') {
          ensure(!controller, 'One marker case per transport; no new budget.');
          controller = await createRemoteMarker({ ...request, nativeDispatch: dispatch });
          probe = await hostInputProbe(controller.hostSurfaceId);
          result = { caseId: controller.state.id, contract: controller.state.executionContract,
            hostSurfaceId: controller.hostSurfaceId, hostMarker: controller.hostMarker, hostProbeUrl: probe.url };
        } else { ensure(controller, 'Prepare one host marker case first.'); result = await controller.command(request); }
        emit({ event: 'result', op: request.op, result });
        if (request.op === 'pause-for-restore' && result.pausedForRestore) pausedForRestore = true;
        if (request.op === 'finish' || pausedForRestore) { await probe?.close(); lines.close(); process.stdin.destroy(); }
      } catch (error) {
        if (request.op === 'prepare' && controller) {
          try { controller.finish(); } catch {}
        }
        emit({ event: 'error', op: request.op, error: error.message });
      }
    });
  });
  lines.on('close', () => {
    if (pending) { clearTimeout(pending.timer); pending.reject(Error('Host transport closed; native result unknown.')); pending = undefined; }
    queue = queue.finally(async () => {
      if (controller && !pausedForRestore) { try { controller.finish(); } catch {} }
      await probe?.close();
    });
  });
}
