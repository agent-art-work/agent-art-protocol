// Installed-archive browser qualification. All native activation is canceled.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ROOT, HERE, VERSION, BASE_SHA, sha, output } from './prepare.mjs';
import { createFixtureServer } from './serve.mjs';
import { verifyStableChrome } from '../../test-bench/check-browser.mjs';
const assert = (ok,message) => { if(!ok)throw Error(message); };
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
const meta=JSON.parse(fs.readFileSync(path.join(output,'candidate.json')));
const archive=path.join(ROOT,meta.archive), packageDir=path.join(ROOT,meta.packageDir);
assert(meta.version===VERSION && sha(fs.readFileSync(archive))===meta.archiveSha256,'Candidate archive identity differs.');
if(fs.existsSync(path.join(ROOT,'.local/sdk/archives',BASE_SHA+'.tgz'))) assert(sha(fs.readFileSync(path.join(ROOT,'.local/sdk/archives',BASE_SHA+'.tgz')))===BASE_SHA,'Historical SDK archive changed.');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'aap-flat-label-browser-'));
const artifacts=path.join(output,'browser',meta.archiveSha256);fs.mkdirSync(artifacts,{recursive:true});
const unpackDir=path.join(temporary,'archive');fs.mkdirSync(unpackDir);
const unpack=spawnSync('tar',['-xzf',archive,'-C',unpackDir],{encoding:'utf8',shell:false});assert(unpack.status===0,'Cannot inspect archive.');
for(const [name,digest] of Object.entries(meta.packagedFiles)) {
 const bytes=fs.readFileSync(path.join(unpackDir,'package',name));
 assert(sha(bytes)===digest && bytes.equals(fs.readFileSync(path.join(packageDir,name))),'Installed/archived candidate differs: '+name);
 const source=['reading-ui.mjs','reading.css','README.md','package.json'].includes(name)?path.join(HERE,name):name==='LICENSE'?path.join(ROOT,'LICENSE'):path.join(ROOT,'protocol',name);
 assert(bytes.equals(fs.readFileSync(source)),'Qualification source differs: '+name);
}
const lock=fs.readFileSync(path.resolve(packageDir,'../../..','package-lock.json'));
const integrity='sha512-'+createHash('sha512').update(fs.readFileSync(archive)).digest('base64');
assert(sha(lock)===meta.lockSha256 && JSON.parse(lock).packages['node_modules/@agent-art/protocol'].integrity===integrity,'Installed lock differs.');
const smoke=`import assert from 'node:assert/strict';
 import {defineWork,createRecord,seal,verify,buildClientHandoff} from '@agent-art/protocol';
 import {createReading} from '@agent-art/protocol/reading';
 import {mountReading} from '@agent-art/protocol/reading-ui';
 import {buildClientHandoff as alias} from '@agent-art/protocol/clients';
 import fs from 'node:fs';
 const work=defineWork(JSON.parse(fs.readFileSync(${JSON.stringify(path.join(ROOT,'test-bench/lab-work.json'))})));
 const reading=createReading({work});assert.equal(typeof mountReading,'function');assert.equal(alias,buildClientHandoff);
 assert.equal(new URL(reading.prepare({client:'codex-app',conversation:'fresh'}).url).searchParams.get('prompt'),reading.context);
 assert.equal(reading.prepare({client:'claude-app',conversation:'existing'}).kind,'manual');
 const receipt=await reading.receipt({event:'handoff-requested',client:'claude-app',conversation:'fresh',observer:'visitor-browser'});
 const report=await verify(receipt);assert.equal(report.checks.find(x=>x.claim==='record-integrity').status,'supported');
 assert.equal(report.checks.find(x=>x.claim==='agent-execution-origin').status,'not-established');
 const record=await seal(createRecord({work}));assert.equal((await verify(record)).checks.find(x=>x.claim==='record-integrity').status,'supported');
 console.log('candidate imports, reading and receipt verification passed');`;
const smokeResult=spawnSync(process.execPath,['--input-type=module','-e',smoke],{cwd:path.resolve(packageDir,'../../..'),encoding:'utf8',shell:false,timeout:15000});
assert(smokeResult.status===0,smokeResult.stderr||'Candidate package smoke failed.');
const chromePath=verifyStableChrome();
const server=createFixtureServer({packageDir});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin='http://127.0.0.1:'+server.address().port;
const profile=path.join(temporary,'chrome-profile');
const chrome=spawn(chromePath,['--headless=new','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-gpu','about:blank'],{stdio:'ignore',shell:false});
let socket,port;const runs=[];
function connect(url) {
 return new Promise((resolve,reject)=>{
  socket=new WebSocket(url);let id=0;const pending=new Map(),handlers=[];
  socket.onopen=()=>resolve({send(method,params={}){const key=++id;socket.send(JSON.stringify({id:key,method,params}));return new Promise((res,rej)=>pending.set(key,{res,rej}));},on(fn){handlers.push(fn);},close(){socket.close();}});
  socket.onerror=reject;socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.rej(Error(JSON.stringify(m.error))):p.res(m.result);}}else handlers.forEach(fn=>fn(m));};
 });
}
const measure=`(() => {
 const root=document.querySelector('#reading .aap-reading'), row=root.querySelector('.aap-reading-row'), title=root.querySelector('.aap-reading-title'), actions=root.querySelector('.aap-reading-actions');
 const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
 const controls=[title,...root.querySelectorAll('.aap-reading-agent'),root.querySelector('.aap-reading-copy')], items=controls.slice(1).map(rect), ar=rect(actions), tr=rect(title);
 const gaps=[items[0].left-ar.left,...items.slice(1).map((r,i)=>r.left-items[i].right),ar.right-items.at(-1).right];
 const color=css=>{const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.fillStyle=css;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
 return {row:rect(row),title:tr,actions:ar,controls:controls.map(el=>({className:el.className,...rect(el)})),gaps,
  withinViewport:controls.every(el=>{const r=rect(el);return r.left>=0&&r.right<=innerWidth&&r.top>=rect(row).top&&r.bottom<=rect(row).bottom;}),noOverflow:document.documentElement.scrollWidth<=innerWidth,
  sameLine:controls.every(el=>Math.abs(rect(el).top-tr.top)<4.1), font:getComputedStyle(row).fontSize,family:getComputedStyle(row).fontFamily,weight:getComputedStyle(row).fontWeight,
  py:getComputedStyle(title).paddingTop,px:getComputedStyle(title).paddingLeft,radius:getComputedStyle(row).borderRadius,border:getComputedStyle(row).borderTopWidth,pseudo:getComputedStyle(row,'::before').content,
  field:color(getComputedStyle(actions).backgroundColor),rowColor:color(getComputedStyle(row).backgroundColor),label:color(getComputedStyle(title).backgroundColor),
  noDecorations:!root.querySelector('svg,.aap-reading-mark,.aap-reading-info,.aap-reading-arrow,.aap-reading-copy-icon,.aap-reading-outline'),
  titleText:title.textContent,titleUrl:title.href,titleTooltip:title.title,copyName:controls.at(-1).getAttribute('aria-label'),tooltips:controls.map(el=>el.title),
  contextExact:root.querySelector('textarea').value===window.component.reading.context,contextBytes:new TextEncoder().encode(window.component.reading.context).length,
  routeChecks:[...root.querySelectorAll('.aap-reading-agent')].map(el=>{const u=new URL(el.href),k=el.dataset.client==='codex-app'?'prompt':'q';return {client:el.dataset.client,exact:u.searchParams.get(k)===window.component.reading.context,parameters:[...u.searchParams.keys()]};}),
  copyState:controls.at(-1).dataset.state,statusText:root.querySelector('.aap-reading-status').textContent,belowTop:document.querySelector('#below').getBoundingClientRect().top,
  copyUnderline:{button:getComputedStyle(controls.at(-1)).textDecorationLine,text:getComputedStyle(root.querySelector('.aap-reading-copy-label')).textDecorationLine,thickness:getComputedStyle(root.querySelector('.aap-reading-copy-label')).textDecorationThickness,offset:getComputedStyle(root.querySelector('.aap-reading-copy-label')).textUnderlineOffset},
  hiddenSizer:{ariaHidden:root.querySelector('.aap-reading-actions-size').getAttribute('aria-hidden'),focusable:root.querySelector('.aap-reading-actions-size').querySelectorAll('a,button,[tabindex]').length},
  nativeRequests:window.nativeRequests.length};
})()`;
try {
 for(let i=0;i<100;i++){try{const text=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8');port=Number(text.split('\n')[0]);break;}catch{}await sleep(100);}assert(port,'Owned Chrome did not start.');
 for(const [width,height,theme] of [[1440,900,'light'],[1440,900,'dark'],[390,844,'light'],[390,844,'dark'],[320,720,'light'],[320,720,'dark']]) {
  const page=await(await fetch('http://127.0.0.1:'+port+'/json/new',{method:'PUT'})).json();
  const client=await connect(page.webSocketDebuggerUrl);const {send}=client;const errors=[],network=[],blocked=[];
  client.on(m=>{
   if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
   if(m.method==='Network.responseReceived')network.push({url:m.params.response.url,status:m.params.response.status});
   if(m.method==='Fetch.requestPaused'){const own=m.params.request.url.startsWith(origin+'/');if(!own)blocked.push(m.params.request.url);void send(own?'Fetch.continueRequest':'Fetch.failRequest',{requestId:m.params.requestId,...(!own&&{errorReason:'Aborted'})});}
  });
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]});await send('Page.navigate',{url:origin+'/'});
  let ready=false;for(let i=0;i<100;i++){if(await evaluate('!!window.component')){ready=true;break;}await sleep(50);}assert(ready,'Candidate component did not mount.');
  const before=await evaluate(measure);const minGap=g=>Math.min(...g)>=11.95&&Math.max(...g)-Math.min(...g)<.06;
  const expectedField=theme==='light'?[168,118,50,38]:[217,182,111,38],expectedLabel=theme==='light'?[168,118,50,77]:[217,182,111,77];
  // Canvas stores premultiplied 8-bit channels; compare premultiplied RGB
  // so low-alpha unpremultiplication rounding is not mistaken for a CSS error.
  const closeColor=(a,b)=>Math.abs(a[3]-b[3])<=1&&a.slice(0,3).every((v,i)=>Math.abs(v*a[3]/255-b[i]*b[3]/255)<=1);
  const keyChecks=[];await evaluate('document.body.tabIndex=-1;document.body.focus();');
  for(let i=0;i<4;i++){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});keyChecks.push(await evaluate(`({className:document.activeElement.className,visible:document.activeElement.matches(':focus-visible'),outline:getComputedStyle(document.activeElement).outlineWidth})`));}
  await evaluate('document.activeElement.blur();');
  const hover=[];
  for(const selector of ['.aap-reading-title','.aap-reading-agent','.aap-reading-copy']) {
   const r=await evaluate(`(()=>{const r=document.querySelector('#reading ${selector}').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y});await sleep(30);
   hover.push(await evaluate(`({selector:${JSON.stringify(selector)},line:getComputedStyle(document.querySelector('#reading ${selector}')).textDecorationLine,copyText:getComputedStyle(document.querySelector('#reading .aap-reading-copy-label')).textDecorationLine})`));
  }
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
  const prefix=width+'-'+theme;
  const save=async name=>{const s=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(artifacts,name),Buffer.from(s.data,'base64'));};
  await save(prefix+'-copy.png');
  await evaluate(`document.querySelector('#reading .aap-reading-copy').click();`);await sleep(50);const copied=await evaluate(measure);await save(prefix+'-copied.png');
  const feedbackChecks={equalBefore:minGap(before.gaps),equalCopied:minGap(copied.gaps),stableOuter:['left','top','width','height'].every(k=>Math.abs(before.row[k]-copied.row[k])<.05),stableBelow:Math.abs(before.belowTop-copied.belowTop)<.05,copied:copied.copyState==='copied',noVisibleSuccess:!copied.statusText};
  let behavior,feedback,themeHooks;
  if(width===1440&&theme==='light') {
   await sleep(3050);assert(await evaluate(`document.querySelector('#reading .aap-reading-copy').dataset.state==='ready'`),'Real three-second feedback timer did not reset.');
   behavior=await evaluate(`(async () => (await import('/ui-behavior-fixtures.mjs')).checkReadingUI())()`);
   feedback=await evaluate(`(async () => (await import('/ui-feedback-fixtures.mjs')).checkFeedbackUI())()`);
   themeHooks=await evaluate(`(async()=>{
    const {mountReading}=await import('/assets/agent-art-sdk/reading-ui.mjs');
    const host=document.createElement('div');host.style.cssText='width:800px;--aap-font-size:16px;--aap-padding-block:8px;--aap-label-padding-inline:20px;--aap-action-gap:18px;--aap-surface:rgb(10,20,30);--aap-seal-surface:rgb(40,50,60);--aap-label-surface:rgb(70,80,90);--aap-seal-paper:rgb(100,110,120);--aap-focus:rgb(130,140,150);--aap-font-family:monospace';document.body.append(host);
    const mounted=mountReading(host,{work:window.work,evidence:false});
    try{
     const row=host.querySelector('.aap-reading-row'),label=host.querySelector('.aap-reading-title'),actions=host.querySelector('.aap-reading-actions');
     const sized={font:getComputedStyle(row).fontSize==='16px',family:getComputedStyle(row).fontFamily==='monospace',py:getComputedStyle(label).paddingTop==='8px',px:getComputedStyle(label).paddingLeft==='20px'};
     const actionRects=[...host.querySelectorAll('.aap-reading-agent,.aap-reading-copy')].map(el=>el.getBoundingClientRect()),ar=actions.getBoundingClientRect();
     const gaps=[actionRects[0].left-ar.left,...actionRects.slice(1).map((v,i)=>v.left-actionRects[i].right),ar.right-actionRects.at(-1).right];
     const gapOkay=Math.min(...gaps)>=17.95&&Math.max(...gaps)-Math.min(...gaps)<.06;
     const specificColors=getComputedStyle(actions).backgroundColor==='rgb(10, 20, 30)'&&getComputedStyle(label).backgroundColor==='rgb(70, 80, 90)';
     host.style.removeProperty('--aap-surface');host.style.removeProperty('--aap-label-surface');
     const legacyColors=getComputedStyle(actions).backgroundColor==='rgb(40, 50, 60)'&&getComputedStyle(label).backgroundColor==='rgb(100, 110, 120)';
     host.style.setProperty('--aap-padding-block','0px');host.style.setProperty('--aap-label-padding-inline','0px');host.style.setProperty('--aap-action-gap','0px');
     const minimums=getComputedStyle(label).paddingTop==='4px'&&getComputedStyle(label).paddingLeft==='12px'&&getComputedStyle(host.querySelector('.aap-reading-actions-size')).columnGap==='12px';
     return {...sized,gapOkay,specificColors,legacyColors,minimums};
    }finally{mounted.destroy();host.remove();}
   })()`);
  }
  const checks={noDecorations:before.noDecorations,flat:before.border==='0px'&&before.radius==='0px'&&['none','normal'].includes(before.pseudo),density:before.font==='14px'&&before.py==='4px'&&before.px==='12px'&&before.weight==='400'&&before.family.includes('system-ui'),
   canonicalContext:before.contextExact&&before.contextBytes===983,routes:before.routeChecks.length===2&&before.routeChecks.every(x=>x.exact&&x.parameters.length===1),
   about:before.titleText==='Ask your Agent'&&before.titleUrl==='https://agentart.work/ask-your-agent/'&&before.titleTooltip==='What is Ask your Agent?',tooltips:before.tooltips.every(Boolean),actionFieldRight:Math.abs(before.actions.right-before.row.right)<.05&&Math.abs(copied.actions.right-copied.row.right)<.05,
   colors:closeColor(before.field,expectedField)&&closeColor(before.label,expectedLabel)&&before.rowColor[3]===0,visible:before.withinViewport&&before.noOverflow,
   underline:before.copyUnderline.button==='none'&&before.copyUnderline.text==='underline'&&before.copyUnderline.thickness==='1px'&&before.copyUnderline.offset==='3px',
   hover:hover[0].line==='underline'&&hover[1].line==='none'&&hover[2].line==='none'&&hover[2].copyText==='none',
   keyboard:JSON.stringify(keyChecks.map(x=>x.className))===JSON.stringify(['aap-reading-title','aap-reading-agent','aap-reading-agent','aap-reading-copy'])&&keyChecks.every(x=>x.visible&&parseFloat(x.outline)>=2),
   hiddenSizer:before.hiddenSizer.ariaHidden==='true'&&before.hiddenSizer.focusable===0,noNativeLaunch:before.nativeRequests===0&&copied.nativeRequests===0,
   ...(behavior&&{behavior:behavior.passed}),...(feedback&&{feedback:feedback.passed}),...(themeHooks&&{publicThemeHooks:Object.values(themeHooks).every(Boolean)}),...feedbackChecks};
  const passed=Object.values(checks).every(Boolean)&&!errors.length&&!blocked.length&&network.every(x=>x.status<400);
  const run={viewport:[width,height],theme,passed,checks,before,copied,keyChecks,hover,behavior,feedback,themeHooks,errors,network,blocked,screenshots:[prefix+'-copy.png',prefix+'-copied.png']};runs.push(run);fs.writeFileSync(path.join(artifacts,prefix+'.json'),JSON.stringify(run,null,2)+'\n');
  console.log(JSON.stringify({viewport:[width,height],theme,passed,failed:Object.keys(checks).filter(k=>!checks[k]),gaps:{copy:before.gaps,copied:copied.gaps},width:before.row.width,oneLine:before.sameLine,behavior:behavior?.results.filter(x=>!x.passed),feedbackError:feedback?.error,errors,blocked}));
  client.close();socket=undefined;await fetch('http://127.0.0.1:'+port+'/json/close/'+page.id);
 }
} finally {
 socket?.close();chrome.kill('SIGTERM');await sleep(500);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
const report={schema:'agent-art.reading-flat-label-qualification/1',date:'2026-10-24',status:runs.every(x=>x.passed)?'browser-checks-passed':'browser-checks-failed',package:meta,
 packageSmoke:smokeResult.stdout.trim(),browser:{bundleId:'com.google.Chrome',disposableProfile:true,runs},screenshotInspection:'pending',siteIntegration:'pending-site-owner-qualification',
 limits:['Browser-only installed-archive checks; native navigation canceled and nonlocal requests blocked.','Clipboard and discovery use synthetic fixtures; no real Agent launch, Send, source retrieval or model execution.','Narrow containers wrap the whole label/action group instead of reducing font/gaps.','Owned Chrome targets, profile and fixture server closed; user tabs untouched.','Existing SDK 0.1.4 source/archive/bench pin remain unchanged; no commit/push/publication/deployment.']};
fs.writeFileSync(path.join(artifacts,'report.json'),JSON.stringify(report,null,2)+'\n');
const qualificationPath=path.join(HERE,'QUALIFICATION.json');
const qualification=JSON.parse(fs.readFileSync(qualificationPath));
assert(qualification.package.archiveSha256===meta.archiveSha256,'Package qualification differs.');
qualification.status=report.status==='browser-checks-passed'?'package-and-browser-checks-passed':'browser-checks-failed';
qualification.browser={status:report.status,bundleId:'com.google.Chrome',scenarios:runs.length,report:path.relative(ROOT,path.join(artifacts,'report.json')),checks:runs.map(r=>({viewport:r.viewport,theme:r.theme,passed:r.passed,checks:r.checks})),screenshotInspection:'pending',limits:report.limits};
fs.writeFileSync(qualificationPath,JSON.stringify(qualification,null,2)+'\n');
console.log('Report: '+path.relative(ROOT,path.join(artifacts,'report.json')));if(!runs.every(x=>x.passed))process.exitCode=1;
