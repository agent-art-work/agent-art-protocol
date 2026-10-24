// Runs from the isolated archive consumer, using ordinary package exports.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { defineWork, createRecord, seal, verify, buildClientHandoff } from '@agent-art/protocol';
import { createReading } from '@agent-art/protocol/reading';
import { mountReading } from '@agent-art/protocol/reading-ui';
const manifest = JSON.parse(fs.readFileSync('node_modules/@agent-art/protocol/package.json'));
assert.equal(manifest.version, '0.1.5-alpha.1'); assert.equal(manifest.license, 'MIT');
assert.equal(manifest.dependencies, undefined); assert.equal(manifest.scripts, undefined);
assert.equal(typeof mountReading, 'function');
assert.match(fs.readFileSync('node_modules/@agent-art/protocol/LICENSE', 'utf8'), /^MIT License/);
const work = defineWork({ id: 'release-reading', version: '1', title: 'Reading alpha', purpose: 'Check archive imports.',
  capabilities: ['handoff'], conditions: {}, context: [
    { id: 'invitation', kind: 'text', mode: 'snapshot', text: 'Public reading context. 意图' },
    { id: 'index', kind: 'reference', mode: 'live', url: 'https://agentart.work/agent-index.json' },
  ] });
const reading = createReading({ work });
for (const client of ['codex-app', 'claude-app']) {
  const plan = reading.prepare({ client }); assert.equal(plan.kind, 'native'); assert.equal(plan.requiresSend, true);
  assert.equal(new URL(plan.url).searchParams.get(client === 'codex-app' ? 'prompt' : 'q'), reading.context);
  assert.equal(reading.prepare({ client, conversation: 'existing' }).kind, 'manual');
}
assert.equal(reading.prepare({ client: 'manual' }).kind, 'manual');
assert.equal(buildClientHandoff({client:'claude-app',prompt:reading.context}).requiresSend, true);
const record = await seal(createRecord({ work })), report = await verify(record);
assert.equal(report.checks.find(check => check.claim === 'record-integrity').status, 'supported');
assert.equal(report.checks.find(check => check.claim === 'agent-execution-origin').status, 'not-established');
const receipt = await reading.receipt({ event: 'context-copied', client: 'manual', observer: 'release-check' });
assert.equal((await verify(receipt)).checks.find(check => check.claim === 'record-integrity').status, 'supported');
assert.equal(record.acts.length, 0);
await assert.rejects(import('@agent-art/protocol/test/records.test.mjs'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
console.log('Installed alpha exports, payloads, receipt integrity and evidence limits passed; no UI or Send.');
