import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { isPlainRecord } from './plain-record.mjs';
import { createRun, addObservation, validateRun } from './records.mjs';
import { CLAUDE_BUNDLE_ID, extractCanonicalComposer, findSubmitControl } from './desktop-ui.mjs';

const foreignJSON = value => vm.runInNewContext('JSON.parse(serialized)', { serialized: JSON.stringify(value) });

test('plain records from another realm are accepted without admitting arrays or class instances', () => {
  const record = vm.runInNewContext('({ publicFact: true })');
  assert.notEqual(Object.getPrototypeOf(record), Object.prototype);
  assert.equal(isPlainRecord(record), true);
  assert.equal(isPlainRecord(vm.runInNewContext('Object.assign(Object.create(null), { publicFact: true })')), true);
  for (const value of [[], vm.runInNewContext('[{publicFact:true}]'), vm.runInNewContext('new (class Observation { constructor(){ this.publicFact=true; } })()'),
    vm.runInNewContext('new (class Object { constructor(){ this.publicFact=true; } })()'), new Date(), null, () => {}]) {
    assert.equal(isPlainRecord(value), false);
  }
});

test('cross-realm run records, observation records and their arrays retain schema validation', () => {
  const manifest = { id: 'foreign-public-fixture', workId: 'https://public.example/#reading', workVersion: '1', sdkVersion: '0.1.4',
    archiveSha256: 'a'.repeat(64), contextSha256: 'b'.repeat(64), contextBytes: 20 };
  const run = foreignJSON(createRun(manifest, { id: 'reading-foreign-fixture', environment: { os: { name: 'synthetic', version: '1' }, browser: { name: 'synthetic', version: '1' } } }));
  assert.equal(validateRun(run).valid, true);
  const observation = foreignJSON({ lane: 'browser', requestedClient: 'claude-app', claim: 'handoff-requested', status: 'requested', source: 'browser-automation', material: { kind: 'browser-event' } });
  assert.equal(validateRun(addObservation(run, observation)).valid, true);
  const arrayObservation = vm.runInNewContext('[]');
  assert.throws(() => addObservation(run, arrayObservation), /plain object/);
  const classObservation = vm.runInNewContext('new (class Observation { constructor(){ Object.assign(this, JSON.parse(serialized)); } })()', { serialized: JSON.stringify(observation) });
  assert.throws(() => addObservation(run, classObservation), /plain object/);
});

test('foreign AX snapshot and node records support exact comparison while class envelopes remain rejected', () => {
  const capturedAt = new Date().toISOString(), context = 'Synthetic exact public invitation.';
  const source = { captureId: 'foreign-ax-capture', capturedAt, bundleId: CLAUDE_BUNDLE_ID, complete: true, owned: true, windowId: 17, ownedWindowId: 17,
    nodes: [{ index: 5, role: 'AXTextArea', label: 'Reply to Claude', value: context, enabled: true, visible: true },
      { index: 6, role: 'AXButton', label: 'Send', enabled: true, visible: true }] };
  const snapshot = foreignJSON(source), composer = extractCanonicalComposer(snapshot, context, { composerIndex: 5, now: capturedAt });
  assert.equal(composer.matches, true); assert.equal(findSubmitControl(snapshot, composer, { now: capturedAt }).index, 6);
  const instance = vm.runInNewContext('new (class Snapshot { constructor(){ Object.assign(this, JSON.parse(serialized)); } })()', { serialized: JSON.stringify(source) });
  assert.throws(() => extractCanonicalComposer(instance, context, { composerIndex: 5, now: capturedAt }), /owned Claude/);
});
