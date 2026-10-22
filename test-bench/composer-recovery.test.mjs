import test from 'node:test';
import assert from 'node:assert/strict';
import { createComposerFocusRecovery } from './composer-recovery.mjs';

const snapshot = (focusIndex = 20, changes = {}) => ({
  captureId: 'before', capturedAt: new Date().toISOString(),
  bundleId: 'com.anthropic.claudefordesktop', windowId: 'owned', ownedWindowId: 'owned',
  owned: true, complete: true, documentUrl: 'https://claude.ai/new',
  nodes: [
    { index: 0, role: 'standard window', label: 'Claude', visible: true, enabled: true },
    { index: 1, parentIndex: 0, role: 'HTML content', label: 'Chat', visible: true, enabled: true },
    { index: 2, parentIndex: 1, role: 'radio button', label: 'Claude', value: '1', visible: true, enabled: true },
    { index: 3, parentIndex: 1, role: 'radio button', label: 'Code', value: '0', visible: true, enabled: true },
    { index: 10, parentIndex: 1, role: 'container', label: 'Primary pane', visible: true, enabled: true },
    { index: 11, parentIndex: 10, role: 'text entry area', label: 'Write your prompt to Claude', value: '', visible: true, enabled: true },
    { index: 20, parentIndex: 0, role: 'HTML content', label: 'Synthetic auxiliary surface', visible: true, enabled: true },
  ], focus: { status: 'observed', index: focusIndex }, ...changes,
});
const selection = { controllerId: 'controller', visualAgreement: 'agrees', inputOwnership: 'exclusive',
  scopeIndex: 10, composerIndex: 11, claudeModeIndex: 2, codeModeIndex: 3, freshChat: true };

test('one awaited Escape and a distinct reviewed capture can establish focus without keyboard or Send claims', async () => {
  const keys = [], app = { async pressKey(key) { keys.push(key); } };
  const recovery = createComposerFocusRecovery({ app, controllerId: 'controller' });
  const result = await recovery.restoreAuxiliaryFocus(snapshot(), selection);
  assert.deepEqual(keys, ['Escape']); assert.equal(result.attempted, true);
  const inspected = recovery.inspectRestoration(snapshot(11, { captureId: 'after' }), selection);
  assert.equal(inspected.status, 'focus-observed');
  assert.equal(inspected.keyboardDelivery, 'not-established');
  assert.equal(inspected.sendQualification, 'not-established');
  await assert.rejects(recovery.restoreAuxiliaryFocus(snapshot(), selection), /consumed/);
});

test('a returned dispatch with unchanged focus stays unconfirmed; reads cannot repeat the action', async () => {
  let presses = 0;
  const recovery = createComposerFocusRecovery({ app: { async pressKey() { presses++; } }, controllerId: 'controller' });
  await recovery.restoreAuxiliaryFocus(snapshot(), selection);
  for (const captureId of ['after-1', 'after-2']) {
    assert.equal(recovery.inspectRestoration(snapshot(20, { captureId }), selection).status, 'focus-not-established');
  }
  assert.equal(presses, 1);
});

test('missing ownership, nonempty Chat, stale or incoherent observations dispatch no key', async () => {
  let presses = 0;
  const recovery = createComposerFocusRecovery({ app: { async pressKey() { presses++; } }, controllerId: 'controller' });
  for (const options of [{ ...selection, controllerId: 'other' }, { ...selection, visualAgreement: 'conflicts' },
    { ...selection, visualAgreement: 'not-reviewed' }, { ...selection, inputOwnership: 'unknown' }]) {
    await assert.rejects(recovery.restoreAuxiliaryFocus(snapshot(), options));
  }
  for (const changes of [{ capturedAt: new Date(Date.now() - 31000).toISOString() }, { owned: false },
    { documentUrl: 'https://claude.ai/chat/synthetic' }, { focus: { status: 'not-exposed' } }]) {
    await assert.rejects(recovery.restoreAuxiliaryFocus(snapshot(20, changes), selection));
  }
  const nonempty = snapshot(); nonempty.nodes.find(n => n.index === 11).value = 'existing draft';
  await assert.rejects(recovery.restoreAuxiliaryFocus(nonempty, selection), /composer-not-empty/);
  assert.equal(presses, 0);
});

test('rejected or pending native dispatch cannot authorize another attempt or restored-focus evidence', async () => {
  const failure = new Error('synthetic controller rejection');
  const rejected = createComposerFocusRecovery({ app: { async pressKey() { throw failure; } }, controllerId: 'controller' });
  await assert.rejects(rejected.restoreAuxiliaryFocus(snapshot(), selection), error => error === failure);
  await assert.rejects(rejected.restoreAuxiliaryFocus(snapshot(), selection), /consumed/);
  assert.throws(() => rejected.inspectRestoration(snapshot(11, { captureId: 'after' }), selection), /completed/);
  let finish;
  const pending = createComposerFocusRecovery({ app: { pressKey: () => new Promise(resolve => { finish = resolve; }) }, controllerId: 'controller' });
  const operation = pending.restoreAuxiliaryFocus(snapshot(), selection);
  await assert.rejects(pending.restoreAuxiliaryFocus(snapshot(), selection), /consumed/);
  assert.throws(() => pending.inspectRestoration(snapshot(11, { captureId: 'after' }), selection), /completed/);
  finish(); await operation;
});

test('restoration rejects stale, pre-return, reused and changed-target captures without reset', async () => {
  const before = snapshot(20, { captureId: 'before', capturedAt: new Date(Date.now() - 1000).toISOString() });
  const recovery = createComposerFocusRecovery({ app: { async pressKey() {} }, controllerId: 'controller' });
  await recovery.restoreAuxiliaryFocus(before, selection);
  for (const changes of [{ captureId: 'before' }, { captureId: 'after', capturedAt: before.capturedAt },
    { captureId: 'after', capturedAt: new Date(Date.now() - 31000).toISOString() },
    { captureId: 'after', windowId: 'other', ownedWindowId: 'other' }]) {
    assert.throws(() => recovery.inspectRestoration(snapshot(11, changes), selection));
  }
});

test('already focused composer causes no Escape and still supplies no delivery proof', async () => {
  let presses = 0;
  const recovery = createComposerFocusRecovery({ app: { async pressKey() { presses++; } }, controllerId: 'controller' });
  const result = await recovery.restoreAuxiliaryFocus(snapshot(11), selection);
  assert.equal(result.attempted, false); assert.equal(result.alreadyFocused, true);
  assert.equal(result.focus.evidence.keyboardDelivery, 'not-established'); assert.equal(presses, 0);
});
