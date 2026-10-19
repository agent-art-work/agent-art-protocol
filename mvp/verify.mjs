import { readFile } from 'node:fs/promises';
import { verifyEvidence } from './server/protocol.mjs';

const file = process.argv[2];
if (!file || process.argv.length !== 3) {
  console.error('Usage: npm run mvp:verify -- <exported-evidence.json>');
  process.exitCode = 2;
} else {
  try {
    const source = await readFile(file, 'utf8');
    if (Buffer.byteLength(source) > 2 * 1024 * 1024) throw new Error('The package exceeds the local 2 MiB limit.');
    const evidence = JSON.parse(source);
    if (evidence.schemaVersion !== 'agent-art-evidence-package/0.1-local') throw new Error('Unsupported evidence package.');
    const report = verifyEvidence(evidence);
    console.log(JSON.stringify(report, null, 2));
    if (report.claims.some(claim => claim.verdict === 'contradicted')) process.exitCode = 1;
  } catch (error) {
    console.error(`Cannot check package: ${error.message}`);
    process.exitCode = 2;
  }
}
