// Qualify the newly installed alpha without changing the default bench's pins.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspectEnvironment } from '../../test-bench/inputs.mjs';
import { runBrowserChecks } from '../../test-bench/check-browser.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
const file = path.join(HERE, 'QUALIFICATION.json');
const qualification = JSON.parse(fs.readFileSync(file));
assert.equal(qualification.version, '0.1.5-alpha.1');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const archive = path.join(ROOT, qualification.package.archive);
assert.equal(sha(fs.readFileSync(archive)), qualification.package.archiveSha256);
const consumer = path.join(ROOT, qualification.package.consumer);
const packageDir = path.join(consumer, 'node_modules/@agent-art/protocol');
for (const [name, digest] of Object.entries(qualification.package.files)) {
  assert.equal(path.basename(name), name);
  assert.equal(sha(fs.readFileSync(path.join(packageDir, name))), digest);
}
const lockBytes = fs.readFileSync(path.join(consumer, 'package-lock.json'));
assert.equal(sha(lockBytes), qualification.package.lockSha256);
assert.equal(JSON.parse(lockBytes).packages['node_modules/@agent-art/protocol'].integrity, qualification.package.lockIntegrity);
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'test-bench/lab-source.json')));
const workBytes = fs.readFileSync(path.join(ROOT, 'test-bench/lab-work.json'));
assert.equal(sha(workBytes), source.workSha256);
const work = JSON.parse(workBytes);
const context = work.context.find(item => item.id === 'reading-invitation')?.text;
assert.equal(typeof context, 'string');
assert.equal(sha(context), source.contextSha256);
assert.equal(Buffer.byteLength(context), source.contextBytes);
const inputs = { work, context, source, environment: inspectEnvironment(), packageDir,
  manifest: { id: 'lab-reading-sdk-0.1.5-alpha.1', workId: work.id, workVersion: work.version,
    sdkVersion: qualification.version, archiveSha256: qualification.package.archiveSha256,
    contextSha256: source.contextSha256, contextBytes: source.contextBytes },
  packagePin: { sdkVersion: qualification.version, archiveSha256: qualification.package.archiveSha256,
    qualification: 'releases/0.1.5-alpha.1/QUALIFICATION.json' },
};
const { report, reportPath } = await runBrowserChecks({ inputs,
  outputDir: path.join(ROOT, '.local/releases/0.1.5-alpha.1/browser') });
qualification.status = report.passed ? 'package-and-browser-checked-visual-review-pending' : 'browser-failed';
qualification.browser = { status: report.passed ? 'passed' : 'failed', report: path.relative(ROOT, reportPath),
  reportSha256: sha(fs.readFileSync(reportPath)), scenarios: report.runs.length,
  passedScenarios: report.runs.filter(run => run.passed).length, cleanup: report.cleanup,
  screenshotInspection: 'pending', fixtures: report.fixtureInputs };
fs.writeFileSync(file, JSON.stringify(qualification, null, 2) + '\n');
console.log(JSON.stringify({ version: qualification.version, browser: qualification.browser.status,
  scenarios: qualification.browser.scenarios, report: qualification.browser.report }));
if (!report.passed) process.exitCode = 1;
