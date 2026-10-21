import fs from 'node:fs';
import { summarizeRun, validateRun } from './records.mjs';

const filename = process.argv[2];
if (!filename) throw Error('Usage: node test-bench/report.mjs <local-run.json>');
const input = JSON.parse(fs.readFileSync(filename, 'utf8'));
const run = input.run || input;
const check = validateRun(run);
if (!check.valid) { console.error(JSON.stringify(check, null, 2)); process.exitCode = 1; }
else console.log(JSON.stringify(summarizeRun(run), null, 2));
