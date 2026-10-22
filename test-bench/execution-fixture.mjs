/** Synthetic test helpers only. Never use these as a live controller. */
import { qualifyCase, assertExecutionReady, claimHandoff, observeCase } from './desktop-runner.mjs';
import { inspectExecution } from './execution-contract.mjs';
import { inspectFreshClaudeReadiness, inspectClaudeArrival } from './readiness.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { bindAuthorityStore } from './authority-store.mjs';

export function setupTestAuthority(t, root) {
  const authorityRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aap-synthetic-authority-'));
  t.after(() => fs.rmSync(authorityRoot, { recursive: true, force: true }));
  return bindAuthorityStore({ root, authorityRoot });
}

export const TEST_CONTROLLER = 'synthetic-cua-controller';
export const executionAssessment = (generation = 1) => ({ controllerId: TEST_CONTROLLER, generation,
  inputOwnership: 'exclusive', visualAgreement: 'agrees' });

/** Explicit synthetic assessments keep old helper tests focused on their stage. */
export function withExecutionAssessments(session) {
  const selected = selection => ({ ...selection, execution: selection?.execution ?? executionAssessment() });
  return { ...session,
    prepareLaunch: (snapshot, selection) => session.prepareLaunch(snapshot, selected(selection)),
    submit: capture => session.submit(async () => selected(await capture())),
    confirmSent: (snapshot, selection) => session.confirmSent(snapshot, selected(selection)),
    recordResult: (snapshot, selection) => session.recordResult(snapshot, selected(selection)),
  };
}

export function qualifyTestCase(state, { root, inputs }) {
  return qualifyCase(state.id, { controllerId: TEST_CONTROLLER, configuration: inputs.environment,
    interface: 'cua', browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop',
    permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels' }, { root });
}

export function testExecutionProof(state, root, snapshot) {
  const current = assertExecutionReady(state.id, { root });
  return inspectExecution(current.contract, current.qualification, snapshot,
    executionAssessment(current.generation), { generation: current.generation, now: Date.now() }).evidence;
}

/** Uses actual pure readiness helpers against explicitly synthetic captures. */
export function controlledFixture(t, { state, root, inputs }) {
  let sequence = 0, handoff;
  const node = (index, role, label, extra = {}) => ({ index, role, label, visible: true, enabled: true, ...extra });
  const snapshot = value => ({ captureId: 'synthetic-contract-' + ++sequence, capturedAt: new Date().toISOString(),
    bundleId: 'com.anthropic.claudefordesktop', windowId: 88, ownedWindowId: 88, owned: true, complete: true,
    documentUrl: 'https://claude.ai/new', nodes: [node(0, 'standard window', 'Claude', { secondaryActions: ['Raise'] }),
      node(1, 'container', 'Owned synthetic Chat'), node(2, 'text entry area', 'Write your prompt to Claude', { value, parentIndex: 1 }),
      node(3, 'button', 'Send message', { parentIndex: 1 }), node(4, 'radio button', 'Claude', { value: '1' }),
      node(5, 'radio button', 'Code', { value: '0' })] });
  const selection = { scopeIndex: 1, composerIndex: 2, claudeModeIndex: 4, codeModeIndex: 5, freshChat: true };
  qualifyTestCase(state, { root, inputs });
  return {
    handoff() {
      const capture = snapshot(''), executionProof = testExecutionProof(state, root, capture);
      const readiness = inspectFreshClaudeReadiness(capture, { ...selection, now: Date.now() });
      handoff = claimHandoff(state.id, { root, readiness, executionProof });
      return handoff;
    },
    arrival() {
      t.mock.timers.tick(1);
      const capture = snapshot(inputs.context), executionProof = testExecutionProof(state, root, capture);
      const arrival = inspectClaudeArrival(capture, { ...selection, launchResolved: true, now: Date.now(),
        readiness: handoff.readiness, handoff });
      observeCase(state.id, { lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat',
        claim: 'draft-arrived', status: 'observed', source: 'desktop-ui',
        material: { kind: 'desktop-ui-check', method: 'visual-inspection', captureId: capture.captureId,
          capturedAt: capture.capturedAt, snapshotSha256: executionProof.snapshotSha256 } }, { root, executionProof });
      observeCase(state.id, { lane: 'real-client', requestedClient: 'claude-app', actualSurface: 'claude-chat',
        claim: 'context-matches', status: 'observed', source: 'desktop-ui', material: { kind: 'desktop-ui-check',
          method: 'composer-utf8-sha256', contextSha256: inputs.manifest.contextSha256,
          captureId: capture.captureId, capturedAt: capture.capturedAt, snapshotSha256: executionProof.snapshotSha256 } }, { root, executionProof });
      return { arrival, executionProof };
    },
    proof() { return testExecutionProof(state, root, snapshot(inputs.context)); },
    snapshot,
  };
}
