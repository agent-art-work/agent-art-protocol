import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadReadingProfile, prepareReadingProfileCase } from './reading-profile.mjs';
import { loadBenchInputs } from './inputs.mjs';
import { setupTestAuthority } from './execution-fixture.mjs';
import { pathsFor } from './desktop-runner.mjs';

const profile = name => new URL(`./profiles/${name}.json`, import.meta.url);
const environment = { os: {name:'synthetic',version:'1'}, browser:{name:'synthetic-stable-Chrome',version:'1'}, apps:{'claude-app':{version:'synthetic-1'}} };
test('Lab profile retains exact installed SDK and invitation while a second profile changes only app inputs', async () => {
  const base=await loadBenchInputs({environment});
  const lab=await loadReadingProfile(profile('lab'),{environment});
  const inshell=await loadReadingProfile(profile('inshell'),{environment});
  assert.equal(lab.context,base.context);
  for(const inputs of [lab,inshell]) {
    assert.equal(inputs.manifest.sdkVersion,'0.1.4');
    assert.equal(inputs.manifest.archiveSha256,base.manifest.archiveSha256);
    assert.equal(inputs.packageDir,base.packageDir);
    assert.equal(inputs.work.conditions.contributionReturn,false);
    assert.equal(inputs.source.kind,'developer-authored-public-reading-fixture');
  }
  assert.notEqual(inshell.manifest.contextSha256,lab.manifest.contextSha256);
  assert.equal(inshell.manifest.contextBytes,459);
});
test('profile rejects changed invitation, executable options, identity and unbounded input', async t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'aap-profile-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const base=JSON.parse(fs.readFileSync(profile('inshell'),'utf8'));
  for(const [value,pattern] of [[{...base,contextSha256:'0'.repeat(64)},/digest/],
    [{...base,driver:'run'},/declarative/],[{...base,id:'../escape'},/declarative/]]) {
    const file=path.join(root,'profile.json');fs.writeFileSync(file,JSON.stringify(value));
    await assert.rejects(loadReadingProfile(file,{environment}),pattern);
  }
  const file=path.join(root,'large.json');fs.writeFileSync(file,' '.repeat(1048577));
  await assert.rejects(loadReadingProfile(file),/Bounded/);
});
test('second reading uses the existing desktop case and canonical report schema, without qualifying any UI',async t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'aap-profile-case-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  setupTestAuthority(t,root);
  await assert.rejects(prepareReadingProfileCase(profile('inshell'),{root}),/commissioned/);
  const state=await prepareReadingProfileCase(profile('inshell'),{root,allowSend:true,environment});
  assert.equal(state.schema,'agent-art-bench/desktop-case/1');
  assert.equal(state.execution.status,'unqualified');
  assert.equal(state.authorization.maximumSends,1);
  const context=fs.readFileSync(path.join(pathsFor(state.id,root).dir,'public-context.txt'),'utf8');
  assert.match(context,/https:\/\/inshell.art\/docs\/agent-index.json/);
  assert.equal(state.manifest.sdkVersion,'0.1.4');
});
