/** Agent-facing CUA session. Native handles come only from documented CUA APIs.
 * The Agent selects owned UI regions and interprets meaning; persistence and
 * Send guards are automatic. Never persist full AX trees or private replies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ROOT } from './inputs.mjs';
import { pathsFor, assertDesktopActionable, assertExecutionReady, recordExecutionInterruption, claimHandoff, claimSend, enterSendDispatch, settleSendDispatch, observeCase, finishCase } from './desktop-runner.mjs';
import { extractCanonicalComposer, extractPresentationComposer, findSubmitControl, extractSentMessage, classifyOwnedEvidence, publicDesktopNote } from './desktop-ui.mjs';
import { EXACT_POLICY, LAB_AX_POLICY, validateDraftPolicy } from './draft-policy.mjs';
import { inspectFreshClaudeReadiness, inspectClaudeArrival } from './readiness.mjs';
import { inspectExecution } from './execution-contract.mjs';
import { writeExclusive } from './authority-store.mjs';

export function createDesktopSession({ caseId, app, controllerId, root = ROOT }) {
  if (!app || typeof app.click !== 'function' || typeof app.getAXState !== 'function') throw Error('A documented Claude CUA App handle is required.');
  if (typeof controllerId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(controllerId)) throw Error('An explicit bounded controller identifier is required.');
  const p = pathsFor(caseId, root);
  const state = JSON.parse(fs.readFileSync(p.state, 'utf8'));
  const draftPolicy = validateDraftPolicy(state.draftPolicy ?? EXACT_POLICY, state.manifest);
  const invitation = fs.readFileSync(path.join(p.dir, 'public-context.txt'), 'utf8');
  function prepareMaterial(kind, evidence, detail = {}) {
    const name = kind + '-' + randomUUID() + '.json';
    // Evidence is a bounded digest and selected indices, never snapshot nodes.
    const value = { schema: 'agent-art-bench/desktop-material/1', caseId, kind, ...detail, evidence };
    return {
      ref: 'desktop/' + caseId + '/' + name,
      persist: () => {
        writeExclusive(path.join(p.dir, name), value);
        const projection = path.join(root, '.local/test-bench/desktop', caseId);
        fs.mkdirSync(projection, { recursive: true, mode: 0o700 });
        writeExclusive(path.join(projection, name), value);
      },
    };
  }
  function executionCheck(snapshot, assessment) {
    if (!assessment || assessment.controllerId !== controllerId) throw Error('This capture requires the session controller execution assessment.');
    const current = assertExecutionReady(caseId, { root });
    const checked = inspectExecution(current.contract, current.qualification, snapshot, assessment,
      { generation: current.generation, now: Date.now() });
    const ownedWindow = fs.existsSync(p.handoff) ? JSON.parse(fs.readFileSync(p.handoff, 'utf8')).readiness?.windowId : undefined;
    if (checked.ready && ownedWindow !== undefined && snapshot.windowId !== ownedWindow) {
      recordExecutionInterruption(caseId, { reason: 'target-lost', actor: 'agent', humanAction: 'none' }, { root });
      throw Error('The capture belongs to a different execution window. Requalification is required.');
    }
    if (!checked.ready) {
      const reason = checked.reason === 'observation-conflicts' ? 'observation-conflict'
        : checked.reason === 'input-not-exclusive' ? 'input-interference'
        : checked.reason === 'qualification-expired' ? 'timeout' : 'observation-unavailable';
      recordExecutionInterruption(caseId, { reason, actor: 'agent', humanAction: 'none' }, { root });
      throw Error('Execution readiness failed: ' + checked.reason + '. Requalification is required; no action retry is authorized.');
    }
    return checked.evidence;
  }
  function record(claim, status, { evidence, note, reason, method = 'visual-inspection', contextSha256, sourceUrl, payloadSha256, comparison, readiness, sourceDetails, executionProof } = {}) {
    const material = prepareMaterial(claim, evidence, { status, ...(reason && { reason }), ...(sourceUrl && { sourceUrl, rawByteIdentity: 'not-established' }), ...(payloadSha256 && { payloadSha256 }), ...(comparison && { comparison }), ...(readiness && { readiness }), ...(sourceDetails && { sourceDetails }) });
    const capture = evidence && { captureId: evidence.captureId, capturedAt: evidence.capturedAt, snapshotSha256: evidence.snapshotSha256 };
    const presentation = comparison && method === LAB_AX_POLICY && { canonicalSha256: comparison.canonicalSha256, exposedSha256: comparison.exposedSha256, basis: comparison.basis };
    return observeCase(caseId, { lane: 'real-client', requestedClient: 'claude-app', claim, status, source: 'desktop-ui',
      actualSurface: 'claude-chat', material: { kind: 'desktop-ui-check', method, ref: material.ref, ...capture, ...presentation, ...(contextSha256 && { contextSha256 }) },
      ...(note && { notes: note }), ...(reason && { reason }) }, { root, executionProof, persistMaterial: material.persist });
  }
  let pendingReview;
  async function raiseForReview(snapshot, selection) {
    assertDesktopActionable(caseId, { root });
    pendingReview = undefined;
    const executionProof = executionCheck(snapshot, selection.execution);
    if (!fs.existsSync(p.handoff)) throw Error('A successful owned empty-Chat preflight and launch claim are required before Send.');
    const handoff = JSON.parse(fs.readFileSync(p.handoff, 'utf8'));
    if (handoff.caseId !== caseId || handoff.runId !== state.runId || !handoff.readiness) throw Error('A successful owned empty-Chat preflight is required before Send.');
    if (selection.freshConversation !== true || selection.surface !== 'claude-chat') throw Error('An owned fresh Claude Chat conversation must be established before Send.');
    const arrival = inspectClaudeArrival(snapshot, { now: Date.now(), ...selection, freshChat: true,
      readiness: handoff.readiness, handoff });
    if (!arrival.arrived) throw Error('Claude arrival readiness failed: ' + arrival.reason + '. No Send attempted.');
    const windows = snapshot.nodes.filter(node => node.role === 'standard window' && node.visible);
    if (windows.length !== 1 || !windows[0].secondaryActions?.includes('Raise') || typeof app.performSecondaryAction !== 'function') {
      throw Error('The actual owned Claude window must expose a supported Raise action before Send.');
    }
    assertDesktopActionable(caseId, { root });
    await app.performSecondaryAction(windows[0].index, 'Raise');
    assertDesktopActionable(caseId, { root });
    const current = assertExecutionReady(caseId, { root });
    if (current.generation !== executionProof.generation) throw Error('Execution generation changed during Raise.');
    pendingReview = { preliminaryCaptureId: snapshot.captureId, windowId: snapshot.windowId,
      generation: current.generation, raisedAt: new Date().toISOString() };
    return { raised: true, captureAfter: pendingReview.raisedAt,
      next: 'Capture and review fresh AX and pixels. No Send is pending. Then call submitReviewed with that capture.' };
  }
  async function submitReviewed(snapshot, selection) {
    assertDesktopActionable(caseId, { root });
    if (!pendingReview) throw Error('Complete raiseForReview on this session before reviewed submission.');
    const executionProof = executionCheck(snapshot, selection.execution);
    if (snapshot.captureId === pendingReview.preliminaryCaptureId) throw Error('A distinct fresh capture after Raise is required before Send.');
    if (executionProof.generation !== pendingReview.generation || snapshot.windowId !== pendingReview.windowId
        || Date.parse(snapshot.capturedAt) < Date.parse(pendingReview.raisedAt)) throw Error('The reviewed capture must belong to the same post-Raise execution target.');
    const { composerIndex, freshConversation, surface, launchResolved, scopeIndex, claudeModeIndex, codeModeIndex } = selection;
    if (freshConversation !== true || surface !== 'claude-chat') throw Error('An owned fresh Claude Chat conversation must be established before Send.');
    const handoff = JSON.parse(fs.readFileSync(p.handoff, 'utf8'));
      const now = Date.now();
      const arrival = inspectClaudeArrival(snapshot, { now, composerIndex, scopeIndex, claudeModeIndex, codeModeIndex,
        freshChat: freshConversation, launchResolved, readiness: handoff.readiness, handoff });
      if (!arrival.arrived) throw Error('Claude arrival readiness failed: ' + arrival.reason + '. No Send attempted.');
      const composer = extractCanonicalComposer(snapshot, invitation, { composerIndex, now });
      record('draft-arrived', 'observed', { evidence: composer.evidence, executionProof, readiness: { ...arrival.evidence, raiseAndRecapture: true, windowBinding: 'controller-attributed' } });
      record('context-matches', composer.matches ? 'observed' : 'failed', { evidence: composer.evidence, note: composer.note,
        executionProof, method: 'composer-utf8-sha256', ...(composer.matches ? { contextSha256: composer.contextSha256 } : { reason: 'context-differs' }) });
      let accepted = composer;
      if (draftPolicy === LAB_AX_POLICY) {
        accepted = extractPresentationComposer(snapshot, invitation, { composerIndex, policy: draftPolicy, now });
        record('presentation-matches', accepted.matches ? 'observed' : 'failed', { evidence: accepted.evidence,
          note: accepted.note, executionProof, method: draftPolicy, comparison: accepted.comparison, ...(!accepted.matches && { reason: 'context-differs' }) });
      }
      if (!accepted.matches) throw Error('The public invitation does not match the selected policy. No Send attempted.');
      const submit = findSubmitControl(snapshot, accepted, { now });
      if (!submit.found) throw Error('No unique enabled Send control exists. No Send attempted.');
      claimSend(caseId, { root, arrival, executionProof });
      pendingReview = undefined;
      // Entered is a controller boundary, not proof the native driver received
      // the click. The claim and immutable markers never permit another Send.
      enterSendDispatch(caseId, { root, controlIndex: submit.index, executionProof });
      try { await app.click(submit.index); }
      catch (error) {
        let rejectionKind = error === null ? 'null' : typeof error;
        // A thrown opaque object may even reject prototype inspection. Its
        // diagnostics must never replace the original rejected value.
        try { if (error instanceof Error) rejectionKind = 'Error'; } catch {}
        // Preserve the original thrown value even when the case finished,
        // expired or diagnostic persistence failed while click was pending.
        try { settleSendDispatch(caseId, { root, stage: 'rejected', rejectionKind }); } catch {}
        throw error;
      }
      settleSendDispatch(caseId, { root, stage: 'returned' });
      return { attempted: true, sendIndex: submit.index, next: 'Inspect fresh AX; confirm exact public user message separately. Never retry Send.' };
  }
  return {
    caseId, runId: state.runId,
    /** Inspect the actual empty owned /new Chat, then reserve one native launch.
     * No launch is performed here. The controller operates the component once.
     */
    prepareLaunch(snapshot, selection) {
      const executionProof = executionCheck(snapshot, selection.execution);
      const readiness = inspectFreshClaudeReadiness(snapshot, { ...selection, now: Date.now(), maxAgeMs: 30000 });
      if (!readiness.ready) throw Error('Claude launch readiness failed: ' + readiness.reason + '. No launch claimed.');
      return claimHandoff(caseId, { root, readiness, executionProof });
    },
    /** Preferred model-facing phases: complete Raise, obtain and review a new
     * capture, then validate/claim/await Send in one bounded invocation.
     */
    raiseForReview,
    submitReviewed,
    /** For controllers able to provide genuinely reviewed captures in-call.
     * Never suspend this mutation across CUA calls for a model's visual review.
     */
    async submit(captureDraft) {
      if (typeof captureDraft !== 'function') throw Error('A fresh owned draft capture callback is required.');
      assertDesktopActionable(caseId, { root });
      const preliminary = await captureDraft();
      await raiseForReview(preliminary.snapshot, preliminary);
      const reviewed = await captureDraft();
      return submitReviewed(reviewed.snapshot, reviewed);
    },
    /** A post-click user-message node, selected from the owned new conversation. */
    confirmSent(snapshot, selection) {
      const executionProof = executionCheck(snapshot, selection.execution);
      const result = extractSentMessage(snapshot, invitation, { ...selection, policy: draftPolicy, now: Date.now(), maxAgeMs: 30000 });
      if (!fs.existsSync(p.claim)) throw Error('No Send was claimed for this case.');
      const claimed = JSON.parse(fs.readFileSync(p.claim, 'utf8'));
      if (claimed.caseId !== caseId || claimed.runId !== state.runId || (claimed.draftPolicy ?? EXACT_POLICY) !== draftPolicy
          || !Number.isFinite(Date.parse(claimed.claimedAt)) || Date.parse(snapshot.capturedAt) <= Date.parse(claimed.claimedAt)
          || snapshot.captureId === claimed.preSendCaptureId) throw Error('Sent confirmation requires a new capture after the Send claim.');
      return record('sent', 'observed', { evidence: result.evidence, executionProof, method: draftPolicy === EXACT_POLICY ? 'visual-inspection' : draftPolicy,
        comparison: result.comparison, ...(result.comparison.exactMatches && { contextSha256: result.comparison.canonicalSha256 }) });
    },
    /** The Agent selects semantic facts and actual tool-result regions in memory. */
    recordResult(snapshot, selection) {
      const executionProof = executionCheck(snapshot, selection.execution);
      if (!fs.existsSync(p.claim)) throw Error('A result requires this case\'s prior Send claim.');
      const claimed = JSON.parse(fs.readFileSync(p.claim, 'utf8'));
      const handoff = JSON.parse(fs.readFileSync(p.handoff, 'utf8'));
      if (Date.parse(snapshot.capturedAt) <= Date.parse(claimed.claimedAt) || snapshot.captureId === claimed.preSendCaptureId
          || snapshot.windowId !== handoff.readiness?.windowId) throw Error('Result inspection requires the owned window and a new post-Send capture.');
      const result = classifyOwnedEvidence(snapshot, { ...selection, now: Date.now(), maxAgeMs: 30000 });
      if (selection.reply !== undefined) record('completion', result.orientation.status, { evidence: result.orientation.evidence,
        note: result.orientation.note, executionProof, ...(result.orientation.status !== 'observed' && { reason: 'not-inspected' }) });
      if (result.sourceResults.length === 0) record('source-access', 'not-observed', { note: publicDesktopNote('source-unconfirmed'), reason: 'not-inspected' });
      for (const source of result.sourceResults) record('source-access', source.status, { evidence: source.evidence, note: source.note,
        executionProof, method: 'visible-tool-result', sourceUrl: source.sourceUrl, payloadSha256: source.payloadSha256,
        sourceDetails: { scope: source.scope, representation: source.representation, identityCheck: source.identityCheck,
          provenance: source.provenance, rawByteIdentity: source.rawByteIdentity ?? 'not-established' }, ...(source.reason && { reason: source.reason }) });
      return result;
    },
    finish: () => finishCase(caseId, { root }),
  };
}
