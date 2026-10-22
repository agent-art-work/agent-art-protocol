/** A bounded, no-Send recovery phase for an owned empty Claude Chat.
 * The permitted CUA handle and reviewed captures come from the coding Agent.
 * This issues at most one Escape per instance, never types, clears or sends.
 */
import { inspectFreshClaudeReadiness } from './readiness.mjs';
import { inspectClaudeComposerFocus } from './composer-focus.mjs';

export function createComposerFocusRecovery({ app, controllerId }) {
  if (!app || typeof app.pressKey !== 'function') throw TypeError('A permitted Claude CUA handle with pressKey is required.');
  if (typeof controllerId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(controllerId)) {
    throw TypeError('An explicit bounded controller identifier is required.');
  }
  let attempt;
  function inspect(snapshot, selection) {
    if (selection?.controllerId !== controllerId || selection.visualAgreement !== 'agrees'
        || selection.inputOwnership !== 'exclusive') {
      throw Error('This capture requires the same controller and reviewed owned AX/pixel agreement without competing input.');
    }
    const options = { ...selection, now: Date.now(), maxAgeMs: 30000 };
    const readiness = inspectFreshClaudeReadiness(snapshot, options);
    if (!readiness.ready) throw Error('Empty Chat recovery preflight failed: ' + readiness.reason + '.');
    return inspectClaudeComposerFocus(snapshot, options);
  }
  return {
    async restoreAuxiliaryFocus(snapshot, selection) {
      if (attempt) throw Error('The single Escape attempt is consumed. Do not retry this recovery.');
      const focus = inspect(snapshot, selection);
      if (focus.focused) return { attempted: false, alreadyFocused: true, focus };
      if (focus.status !== 'elsewhere' || focus.location !== 'auxiliary-html-surface') {
        throw Error('A positively identified auxiliary focus surface is required before Escape.');
      }
      attempt = { controllerId, preCaptureId: snapshot.captureId, windowId: snapshot.windowId,
        claimedAt: new Date().toISOString(), dispatch: 'entered', before: focus.evidence };
      try { await app.pressKey('Escape'); }
      catch (error) { attempt.dispatch = 'rejected'; throw error; }
      attempt.dispatch = 'returned';
      attempt.returnedAt = new Date().toISOString();
      return { attempted: true, dispatch: 'returned', captureAfter: attempt.returnedAt,
        next: 'Obtain and review a distinct complete AX/pixel capture. Focus and input delivery are not yet established.' };
    },
    inspectRestoration(snapshot, selection) {
      if (!attempt || attempt.dispatch !== 'returned') throw Error('A completed Escape dispatch is required for restoration inspection.');
      const focus = inspect(snapshot, selection);
      if (snapshot.captureId === attempt.preCaptureId || snapshot.windowId !== attempt.windowId
          || Date.parse(snapshot.capturedAt) < Date.parse(attempt.returnedAt)) {
        throw Error('Restoration requires a distinct fresh capture of the same target after Escape returned.');
      }
      return { status: focus.focused ? 'focus-observed' : 'focus-not-established',
        focus, evidence: { controllerId, claimedAt: attempt.claimedAt, returnedAt: attempt.returnedAt,
          dispatch: attempt.dispatch, before: attempt.before, after: focus.evidence },
        keyboardDelivery: 'not-established', sendQualification: 'not-established' };
    },
  };
}
