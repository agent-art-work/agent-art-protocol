/** Synthetic contract checks only. No browser, native app or actual permission. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createExecutionContract, executionConfiguration, executionConfigurationSha256,
  qualifyExecution, inspectExecution, validateExecutionContract, validateExecutionQualification,
  validateExecutionInspection, executionSnapshotSha256 } from './execution-contract.mjs';

const at = '2026-10-22T01:00:00.000Z';
const capturedAt = '2026-10-22T01:00:01.000Z';
const now = '2026-10-22T01:00:02.000Z';
const settings = () => ({ generation: 1, now });
const config = () => ({ os: { name: 'synthetic-macOS', version: '26.7.1' },
  browser: { name: 'synthetic-stable-Chrome', version: '156.0.8078.47' },
  apps: { 'claude-app': { version: 'synthetic-2.37337.1' } } });
const manifest = () => ({ id: 'synthetic-public-lab-sdk014', workId: 'https://public.example/#reading', workVersion: '1',
  sdkVersion: '0.1.4', archiveSha256: 'a'.repeat(64), contextSha256: 'b'.repeat(64), contextBytes: 983 });
const contract = overrides => createExecutionContract({ manifest: manifest(), environment: config(), timeoutMs: 900000, ...overrides });
const assessment = overrides => ({ controllerId: 'synthetic-controller', configuration: config(), interface: 'cua',
  browserBundleId: 'com.google.Chrome', clientBundleId: 'com.anthropic.claudefordesktop',
  permissions: 'ready', inputOwnership: 'exclusive', observation: 'ax-and-pixels', ...overrides });
const active = overrides => ({ controllerId: 'synthetic-controller', generation: 1, inputOwnership: 'exclusive', visualAgreement: 'agrees', ...overrides });
const snapshot = overrides => ({ captureId: 'synthetic-capture-1', capturedAt, bundleId: 'com.anthropic.claudefordesktop',
  complete: true, owned: true, windowId: 'synthetic-owned-window', ownedWindowId: 'synthetic-owned-window',
  documentUrl: 'https://claude.ai/chat/SYNTHETIC_PRIVATE_CONVERSATION', nodes: [
    { index: 1, role: 'AXStaticText', label: 'SYNTHETIC_PRIVATE_TRANSCRIPT', enabled: true, visible: true }], ...overrides });
function fixture() {
  const descriptor = contract();
  const qualification = qualifyExecution(descriptor, assessment(), { generation: 1, now: at });
  return { descriptor, qualification };
}

test('contract fixes bounded authority and payload pins without retaining raw environment', () => {
  const value = contract();
  assert.equal(validateExecutionContract(value), true);
  assert.deepEqual(value.authority, { source: 'explicit-user-direction', publicContextOnly: true, freshConversation: true,
    maximumHandoffs: 1, maximumSends: 1, maximumDurationMs: 900000 });
  assert.deepEqual(value.payload, manifest());
  assert.equal(Object.isFrozen(value), true); assert.equal(Object.isFrozen(value.authority), true);
  assert.equal(Object.isFrozen(value.payload), true);
  assert.equal(JSON.stringify(value).includes('synthetic-macOS'), false);
  assert.equal(JSON.stringify(value).includes('synthetic-2.37337.1'), false);
  assert.throws(() => { value.authority.maximumSends = 2; }, TypeError);
});

test('configuration and contract digests are canonical and exclude only the known unused client', () => {
  const a = config(), b = { apps: { 'codex-app': { version: '999' }, 'claude-app': { version: 'synthetic-2.37337.1' } },
    browser: { version: '156.0.8078.47', name: 'synthetic-stable-Chrome' }, os: { version: '26.7.1', name: 'synthetic-macOS' } };
  assert.equal(executionConfigurationSha256(a), executionConfigurationSha256(b));
  assert.deepEqual(executionConfiguration(b), a);
  assert.equal(contract({ environment: a }).contractSha256, contract({ environment: b }).contractSha256);
  b.apps['claude-app'].version = 'synthetic-next';
  assert.notEqual(executionConfigurationSha256(a), executionConfigurationSha256(b));
  assert.notEqual(contract().contractSha256, contract({ timeoutMs: 1000 }).contractSha256);
  assert.notEqual(contract().contractSha256, contract({ manifest: { ...manifest(), contextSha256: 'c'.repeat(64) } }).contractSha256);
});

test('creation rejects unknown/private fields, accessors, paths and unavailable versions', () => {
  for (const environment of [{ ...config(), profile: '/Users/private' },
    { ...config(), apps: { ...config().apps, 'unknown-client': { version: '1' } } },
    { ...config(), browser: { ...config().browser, profilePath: '/Users/private' } },
    { ...config(), os: { name: 'macOS', version: '/Users/private' } },
    { ...config(), browser: { name: 'Chrome', version: 'unknown' } }]) assert.throws(() => contract({ environment }), TypeError);
  const accessor = config();
  Object.defineProperty(accessor, 'os', { get() { throw Error('Accessor was evaluated'); }, enumerable: true });
  assert.throws(() => executionConfiguration(accessor), /non-data/u);
  assert.throws(() => contract({ privateNote: 'SYNTHETIC_SECRET' }), /Unsupported/u);
  assert.throws(() => contract({ manifest: { ...manifest(), transcript: 'private' } }), /Unsupported/u);
  for (const workId of ['/Users/private', 'file:///Users/private', 'https://user:password@public.example/', 'https://public.example/?token=private']) {
    assert.throws(() => contract({ manifest: { ...manifest(), workId } }), /payload/u);
  }
  for (const timeoutMs of [0, 999, 1800001, NaN, Infinity]) assert.throws(() => contract({ timeoutMs }), /duration/u);
});

test('contract validation detects authority and digest changes', () => {
  const copy = structuredClone(contract()); copy.payload.contextBytes++;
  assert.throws(() => validateExecutionContract(copy), /digest/u);
  copy.authority.maximumSends = 2;
  assert.throws(() => validateExecutionContract(copy), /authority/u);
  assert.throws(() => validateExecutionContract({ ...contract(), permissionBypass: true }), /Unsupported/u);
});

test('qualification records bounded controller capabilities rather than native proof', () => {
  const { descriptor, qualification } = fixture();
  assert.equal(qualification.qualified, true);
  assert.equal(validateExecutionQualification(descriptor, qualification), true);
  assert.equal(qualification.evidence.attribution, 'controller');
  assert.equal(qualification.evidence.generation, 1);
  assert.equal(qualification.evidence.qualifiedAt, at);
  assert.equal(qualification.evidence.configurationSha256, descriptor.configurationSha256);
  const saved = JSON.stringify(qualification);
  assert.equal(saved.includes('synthetic-macOS'), false); assert.equal(saved.includes('2.37337.1'), false);
});

test('qualification refuses changed configuration, unsupported controls, missing permissions and interference', () => {
  const changed = config(); changed.browser.version = '157';
  for (const [change, reason] of [
    [{ configuration: changed }, 'configuration-differs'], [{ interface: 'other-control' }, 'unsupported-interface'],
    [{ browserBundleId: 'com.google.Chrome.beta' }, 'unsupported-browser'],
    [{ clientBundleId: 'com.openai.codex' }, 'unsupported-client'],
    [{ permissions: 'human-required' }, 'permissions-not-ready'], [{ permissions: 'unknown' }, 'permissions-not-ready'],
    [{ inputOwnership: 'interrupted' }, 'input-not-exclusive'], [{ inputOwnership: 'unknown' }, 'input-not-exclusive'],
    [{ observation: 'unavailable' }, 'observation-unavailable'],
  ]) {
    const result = qualifyExecution(contract(), assessment(change), settings());
    assert.equal(result.qualified, false); assert.equal(result.reason, reason);
    assert.throws(() => validateExecutionQualification(contract(), result));
  }
});

test('strict assessments reject private notes, accessors, unsupported states and invalid generations', () => {
  for (const change of [{ notes: 'private' }, { permissions: true }, { inputOwnership: 'probably-exclusive' },
    { observation: 'agent-says-so' }, { controllerId: '/Users/private' }]) {
    assert.throws(() => qualifyExecution(contract(), assessment(change), settings()), TypeError);
  }
  for (const generation of [0, -1, 1.5, '1', Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => qualifyExecution(contract(), assessment(), { generation, now }), /generation/u);
  }
  assert.throws(() => qualifyExecution(contract(), assessment(), { ...settings(), now: undefined }), /time/u);
  assert.throws(() => qualifyExecution(contract(), assessment(), { ...settings(), maxAgeMs: 999999 }), /Unsupported/u);
  const input = assessment(); Object.defineProperty(input, 'permissions', { get() { throw Error('Accessor evaluated'); }, enumerable: true });
  assert.throws(() => qualifyExecution(contract(), input, settings()), /non-data/u);
});

test('fresh actual capture and agreeing visual assessment produce a bound revocable inspection', () => {
  const { descriptor, qualification } = fixture(), state = snapshot();
  const result = inspectExecution(descriptor, qualification, state, active(), settings());
  assert.equal(result.ready, true);
  assert.equal(result.evidence.captureId, state.captureId);
  assert.equal(result.evidence.snapshotSha256, executionSnapshotSha256(state));
  assert.equal(result.evidence.windowBinding, 'controller-attributed');
  assert.equal(validateExecutionInspection(descriptor, qualification, result, settings()), true);
  const saved = JSON.stringify(result);
  assert.equal(saved.includes('SYNTHETIC_PRIVATE'), false);
  assert.equal(saved.includes('https://'), false); assert.equal(saved.includes('"nodes"'), false);
  assert.equal(saved.includes('SYNTHETIC_PRIVATE_CONVERSATION'), false);
});

test('inspection rejects changed controller/generation and conflicted, unknown or interrupted input', () => {
  const { descriptor, qualification } = fixture();
  for (const [change, reason] of [
    [{ controllerId: 'other-controller' }, 'controller-differs'], [{ generation: 2 }, 'generation-differs'],
    [{ inputOwnership: 'interrupted' }, 'input-not-exclusive'], [{ inputOwnership: 'unknown' }, 'input-not-exclusive'],
    [{ visualAgreement: 'conflicts' }, 'observation-conflicts'], [{ visualAgreement: 'not-reviewed' }, 'visual-review-required'],
  ]) {
    const result = inspectExecution(descriptor, qualification, snapshot(), active(change), settings());
    assert.equal(result.ready, false); assert.equal(result.reason, reason);
  }
  assert.equal(inspectExecution(descriptor, qualification, snapshot(), active(), { generation: 2, now }).reason, 'generation-differs');
  assert.throws(() => inspectExecution(descriptor, qualification, snapshot(), active({ privateNote: 'private' }), settings()), /Unsupported/u);
});

test('fixed thirty-second freshness and valid owned complete snapshots cannot be loosened', () => {
  const { descriptor, qualification } = fixture();
  assert.equal(inspectExecution(descriptor, qualification, snapshot(), active(), { generation: 1, now: Date.parse(capturedAt) + 30000 }).ready, true);
  assert.equal(inspectExecution(descriptor, qualification, snapshot(), active(), { generation: 1, now: Date.parse(capturedAt) + 30001 }).reason, 'snapshot-stale');
  assert.equal(inspectExecution(descriptor, qualification, snapshot({ capturedAt: '2026-10-22T01:00:03.000Z' }), active(), settings()).reason, 'snapshot-stale');
  for (const change of [{ owned: false }, { complete: false }, { ownedWindowId: 'another-window' },
    { bundleId: 'com.openai.codex' }, { nodes: [{ ...snapshot().nodes[0], value: 9 }] }]) {
    assert.equal(inspectExecution(descriptor, qualification, snapshot(change), active(), settings()).reason, 'snapshot-invalid');
  }
  assert.throws(() => inspectExecution(descriptor, qualification, snapshot(), active(), { ...settings(), maxAgeMs: 999999 }), /Unsupported/u);
});

test('failed, forged, expired or future qualifications cannot authorize a capture', () => {
  const { descriptor, qualification } = fixture();
  for (const changed of [undefined, { ...qualification, qualified: false },
    { ...qualification, evidence: { ...qualification.evidence, qualified: false } },
    { ...qualification, evidence: { ...qualification.evidence, contractSha256: 'c'.repeat(64) } },
    { ...qualification, evidence: { ...qualification.evidence, permissions: 'unknown' } },
    { ...qualification, evidence: { ...qualification.evidence, extra: 'private' } }]) {
    assert.equal(inspectExecution(descriptor, changed, snapshot(), active(), settings()).reason, 'qualification-not-established');
  }
  assert.equal(inspectExecution(descriptor, qualification, snapshot(), active(), { generation: 1, now: Date.parse(at) - 1 }).reason, 'qualification-time-invalid');
  assert.equal(inspectExecution(descriptor, qualification, snapshot(), active(), { generation: 1, now: Date.parse(at) + 900001 }).reason, 'qualification-expired');
  const later = qualifyExecution(descriptor, assessment(), { generation: 1, now: capturedAt });
  assert.equal(inspectExecution(descriptor, later, snapshot({ capturedAt: at }), active(), settings()).reason, 'capture-before-qualification');
});

test('persisted successful inspection validation rejects changed pins, stale state and broad claims', () => {
  const { descriptor, qualification } = fixture();
  const result = inspectExecution(descriptor, qualification, snapshot(), active(), settings());
  for (const change of [{ controllerId: 'different' }, { generation: 2 }, { ready: false },
    { qualifiedAt: capturedAt }, { visualAgreement: 'conflicts' }, { inputOwnership: 'unknown' },
    { snapshotSha256: 'invalid' }, { windowBinding: 'independent-proof' }, { genuine: true }]) {
    assert.throws(() => validateExecutionInspection(descriptor, qualification, { ...result, evidence: { ...result.evidence, ...change } }, settings()));
  }
  assert.throws(() => validateExecutionInspection(descriptor, qualification, result, { generation: 1, now: Date.parse(capturedAt) + 30001 }), /fresh/u);
  assert.throws(() => validateExecutionInspection(descriptor, qualification, result, { generation: 2, now }), /fresh/u);
});

test('snapshot identity covers route, text and ownership without returning them', () => {
  const state = snapshot(), original = executionSnapshotSha256(state);
  for (const changed of [{ documentUrl: 'https://claude.ai/chat/ANOTHER_PRIVATE_ID' }, { owned: false },
    { nodes: [{ ...state.nodes[0], label: 'ANOTHER_PRIVATE_TEXT' }] }]) {
    assert.notEqual(executionSnapshotSha256({ ...state, ...changed }), original);
  }
});

test('plain cross-realm JSON remains compatible with the controller runtime', () => {
  const { descriptor, qualification } = fixture();
  const cloned = vm.runInNewContext(`(${JSON.stringify({ descriptor, qualification, snapshot: snapshot(), active: active(), settings: settings() })})`);
  assert.equal(inspectExecution(cloned.descriptor, cloned.qualification, cloned.snapshot, cloned.active, cloned.settings).ready, true);
});
