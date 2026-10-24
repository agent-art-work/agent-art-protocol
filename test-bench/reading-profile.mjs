/** Thin developer input adapter. Reuses the installed SDK, bench server,
 * browser checker and existing desktop authority; supplies no UI driver. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadBenchInputs, sha256 } from './inputs.mjs';
import { runBrowserChecks } from './check-browser.mjs';
import { prepareCase } from './desktop-runner.mjs';

const ensure = (value, message) => { if (!value) throw Error(message); };
export async function loadReadingProfile(file, options = {}) {
  const bytes=fs.readFileSync(file);
  ensure(bytes.length<=1048576,'Bounded public reading profile required.');
  const profile=JSON.parse(bytes.toString('utf8'));
  ensure(profile.schema==='agent-art-bench/reading-profile/1'
    && /^[a-z][a-z0-9-]{0,69}$/u.test(profile.id)
    && Object.keys(profile).every(k=>['schema','id','work','contextSha256'].includes(k)),
  'Use a declarative reading profile with no executable options.');
  const installed=await loadBenchInputs(options);
  const {createReading}=await import(pathToFileURL(path.join(installed.packageDir,'reading.mjs')).href);
  const reading=createReading({work:profile.work});
  ensure(profile.contextSha256===sha256(reading.context),'Profile public invitation digest differs.');
  const manifest={...installed.manifest,id:`${profile.id}-${profile.contextSha256.slice(0,12)}`,
    workId:reading.work.id,workVersion:reading.work.version,contextSha256:profile.contextSha256,
    contextBytes:Buffer.byteLength(reading.context)};
  return {...installed,manifest,work:reading.work,context:reading.context,
    source:{kind:'developer-authored-public-reading-fixture',profileId:profile.id,profileSha256:sha256(bytes),
      contextSha256:profile.contextSha256,limits:'Profile identity is not evidence that any referenced source was fetched.'}};
}
export async function prepareReadingProfileCase(file,{allowSend=false,...options}={}) {
  ensure(allowSend===true,'An actually commissioned one-Send desktop case is required.');
  const inputs=await loadReadingProfile(file,{environment:options.environment});
  return prepareCase({...options,inputs,allowSend:true});
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const [command,file,...extra]=process.argv.slice(2);
    ensure(['inspect','browser'].includes(command)&&file,'Use inspect|browser PROFILE.json [OUTPUT_DIRECTORY].');
    ensure(extra.length<=1,'Only one optional browser output directory is supported.');
    const inputs=await loadReadingProfile(file);
    if(command==='inspect') console.log(JSON.stringify({manifest:inputs.manifest,source:inputs.source,
      desktopResults:'not-run',vmRequiredForLocalReuse:false},null,2));
    else {
      const {report,reportPath}=await runBrowserChecks({inputs,outputDir:extra[0]});
      console.log(JSON.stringify({report:reportPath,passed:report.passed,realClientResults:'not-run'}));
      if(!report.passed)process.exitCode=1;
    }
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
