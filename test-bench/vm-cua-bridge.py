"""Maintainer transport to published guest CUA; host owns all action authority.

No OS driver, model turn, guest authority replica or Send operation. JSONL on
stdin/stdout is transient Agent I/O, not a retained transcript. Image display
uses optional Pillow; raw native images work without it. The SSH profile is
ignored local configuration, validated by the read-only connection module.
"""
import argparse
import json, subprocess, selectors, time, os, base64, io, datetime, sys, hashlib
from pathlib import Path

def main():
 parser=argparse.ArgumentParser(description='Host-authorized readiness has zero typing/keys/handoffs/Sends. A separately authorized marker case permits one focus/type/clear and no Send.')
 parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parent.parent)
 parser.add_argument('--connection',type=Path,required=True,help='Ignored pinned SSH control profile')
 parser.add_argument('--environment',type=Path,required=True,help='Observed public guest OS/browser/Claude versions')
 parser.add_argument('--record',type=Path,required=True,help='Fresh ignored diagnostic status path; never overwrite')
 parser.add_argument('--authorize-setup',action='store_true',help='Record existing explicit human direction; does not obtain consent')
 parser.add_argument('--authorize-probe',action='store_true',help='Record explicit public marker and host-independence probe direction; never Send')
 parser.add_argument('--recover-case',help='Existing interrupted marker case; never a new budget')
 parser.add_argument('--cleanup-case',help='Finished marker origin; consumes its unused clear in a separate zero-focus/typing cleanup case')
 parser.add_argument('--capture-profile',choices=['no-send-reviewed-60s-v1'],help='Explicit operator-selected public no-Send 60-second profile; default stays 30 seconds')
 parser.add_argument('--timeout-ms',type=int,default=900000,help='New marker case duration, 1000..1800000 ms; never extends an existing case')
 parser.add_argument('--focus-recovery',action='store_true',help='Narrow no-Send restore check: one focus, zero typing/clearing/host input')
 parser.add_argument('--setup-profile',choices=['claude-file-new-chat-v1'],help='Explicit bounded native File-menu inspection during empty-target preparation')
 parser.add_argument('--previous-controller-stopped',action='store_true',help='Record actually verified prior process termination')
 parser.add_argument('--exclusive-input',action='store_true',help='Record actually established exclusive guest input')
 args=parser.parse_args()
 if args.authorize_setup==args.authorize_probe:parser.error('Explicit --authorize-setup or --authorize-probe direction is required, not both')
 marker_mode=args.authorize_probe
 if args.recover_case and not(marker_mode and args.previous_controller_stopped and args.exclusive_input):parser.error('Recovery requires marker scope, stopped prior controller and exclusive guest input')
 if args.capture_profile and (not marker_mode or args.recover_case):parser.error('The capture profile is only selectable for new public no-Send cases')
 if args.cleanup_case and (not marker_mode or args.recover_case):parser.error('Cleanup requires a separate public no-Send case')
 if not 1000<=args.timeout_ms<=1800000:parser.error('Case duration must be within the existing 1000..1800000 ms contract limit')
 if args.recover_case and args.timeout_ms!=900000:parser.error('Recovery cannot change the original duration')
 if args.focus_recovery and (not marker_mode or args.cleanup_case):parser.error('Focus recovery requires its own no-Send scope')
 if args.setup_profile and not args.authorize_setup:parser.error('Named menu preparation requires setup scope')
 root=args.root.resolve();env=args.record.resolve().parent
 profile_path=args.connection.resolve();environment_path=args.environment.resolve()
 profile=json.loads(profile_path.read_text());t=profile['transport'];task=profile.get('controller',{})
 transport_code='import fs from "node:fs"; const {sshControllerTransport}=await import('+json.dumps((root/'test-bench/controller-link.mjs').as_uri())+'); console.log(JSON.stringify(sshControllerTransport(JSON.parse(fs.readFileSync(0,"utf8")))));'
 transport_check=subprocess.run(['node','--input-type=module','-e',transport_code],input=json.dumps(profile),capture_output=True,text=True,timeout=10)
 if transport_check.returncode:raise RuntimeError('Approved SSH control transport unavailable; reconnect explicitly')
 transport=json.loads(transport_check.stdout)
 record=args.record.resolve()
 if record.exists():raise RuntimeError('Diagnostic record exists; do not renew its action budget')
 record.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
 p=subprocess.Popen([transport['command'],*transport['args']],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,bufsize=0)
 sel=selectors.DefaultSelector();sel.register(p.stdout,selectors.EVENT_READ,'out');sel.register(p.stderr,selectors.EVENT_READ,'err');buf=b'';seq=0;last=None;selected=False;selectionCount=0;observations=0;serverRequests=[];pendingApproval={}
 audit={'schema':'agent-art-bench/direct-cua-diagnostic/1','authorizedBy':'operator request to diagnose/fix via VM connection and session-only Claude observation grant, no input/Send','diagnosticHypothesis':'host-native authority guards guest setup clicks and fresh Chat readiness','operatorScope':'fix host/VM authority then qualify Claude Chat; no Send','hostAuthority':True,'observationResults':[],'outerToolDeadlineMs':150000,'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z'),'phase':'connecting','selectionsDispatched':0,'observationRequests':0,'uiInputs':0,'nativeActionRequests':0,'modelTurnsStarted':0,'claudeSends':0,'actionAuthority':False,'rawImagesOrAxSaved':False}
 if marker_mode:audit.update({'authorizedBy':'explicit operator direction for bounded public marker and host/VM input-independence test; no Send','operatorScope':'one guest focus, type and exact-marker clear; one owned host public typing probe; zero handoffs/keypresses/Sends','diagnosticHypothesis':'existing no-Send session uses host authority and published guest CUA','markerMode':True})
 def save():
  audit['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z');record.write_text(json.dumps(audit,indent=2)+'\n');record.chmod(0o600)
 def emit(event,data):print(json.dumps({'event':event,'data':data},ensure_ascii=False),flush=True)
 def send(x):p.stdin.write((json.dumps(x,separators=(',',':'))+'\n').encode());p.stdin.flush()
 def rpc(method,params,timeout=70):
  nonlocal seq,buf
  seq+=1;wanted=seq;send({'id':wanted,'method':method,'params':params});end=time.monotonic()+timeout
  while time.monotonic()<end:
   for key,_ in sel.select(min(1,max(0,end-time.monotonic()))):
    if key.data=='approval-input':
     response=json.loads(sys.stdin.readline())
     reqid=response.get('requestId')
     if response.get('op')!='approval-response' or reqid not in pendingApproval:raise RuntimeError('Only a pending approval response is accepted')
     decision=response.get('response',{})
     if decision.get('action')=='accept' and not(response.get('source')=='operator-reply' and response.get('humanReply')):raise RuntimeError('App approval requires an actual operator reply')
     if decision.get('action') not in ['accept','decline','cancel']:raise RuntimeError('Unsupported approval response')
     if decision.get('_meta',{}).get('persist') not in [None,'session']:raise RuntimeError('Persistent app grant outside this diagnostic')
     send({'id':reqid,'result':decision});pendingApproval.pop(reqid);audit['approvalResponse']={'action':decision['action'],'source':response.get('source')};save()
     if not pendingApproval:sel.unregister(sys.stdin)
     continue
    chunk=os.read(key.fileobj.fileno(),65536)
    if not chunk:
     sel.unregister(key.fileobj)
     if key.data=='out':raise RuntimeError('Guest RPC output closed')
     continue
    if key.data=='err':continue
    buf+=chunk
    if len(buf)>20000000:raise RuntimeError('RPC frame bound exceeded')
    while b'\n' in buf:
     line,buf=buf.split(b'\n',1)
     if not line:continue
     m=json.loads(line)
     if 'method' in m:
      if 'id' in m:
       serverRequests.append({'method':m['method']})
       if m['method']=='mcpServer/elicitation/request':
        params=m.get('params',{});meta=params.get('_meta',{})
        allowed_tools=['get_app_state','click']+(['type_text','set_value'] if marker_mode and not args.focus_recovery else [])
        if not(params.get('serverName')=='cua_repl' and params.get('mode')=='form' and meta.get('connector_id')=='computer-use' and meta.get('tool_name') in allowed_tools and meta.get('tool_params',{}).get('app')=='com.anthropic.claudefordesktop' and params.get('requestedSchema',{}).get('properties')=={}):
         send({'id':m['id'],'result':{'action':'cancel','content':None}})
         raise RuntimeError('Unexpected approval outside this Claude setup scope')
        pendingApproval[m['id']]=m
        if len(pendingApproval)==1:sel.register(sys.stdin,selectors.EVENT_READ,'approval-input')
        end=time.monotonic()+300
        audit['phase']='waiting-for-normal-app-approval';save();emit('approval-request',{'id':m['id'],'method':m['method'],'params':m.get('params')})
       else:send({'id':m['id'],'error':{'code':-32601,'message':'No approval or action delegation on this diagnostic connection'}})
      continue
     if m.get('id')==wanted:
      if 'error' in m:raise RuntimeError('RPC '+method+' rejected: '+str(m['error'])[:1000])
      return m['result']
  raise TimeoutError('Guest RPC response deadline exceeded')
 def unpack(result):
  if isinstance(result,dict) and isinstance(result.get('result'),dict) and 'content' in result['result']:return result['result']
  return result
 def authority(op,**options):
  payload={'op':op,'root':str(root),**options}
  if op!='prepare':payload.update({'caseId':hostCase['id'],'binding':binding})
  out=subprocess.run(['node',str(root/'test-bench/remote-readiness.mjs')],input=json.dumps(payload),capture_output=True,text=True,timeout=25,cwd=root)
  if out.returncode:raise RuntimeError('Host authority rejected: '+out.stderr.strip()[:500])
  return json.loads(out.stdout)
 def reviewed_material(request):
  observation=audit.get('lastObservation',{})
  if request.get('reviewedCaptureId')!=observation.get('captureId') or request.get('visualAgreement')!='agrees':raise RuntimeError('Review this exact paired capture before acting')
  blocks=unpack(last).get('content',[]);texts=[x.get('text','') for x in blocks if x.get('type')=='text']
  if observation.get('isError') or observation.get('imageCount')!=1 or len(texts)!=1:raise RuntimeError('One complete paired native observation required')
  return {'rawAX':texts[0],'captureId':observation['captureId'],'capturedAt':observation['returnedAt'],'visualAgreement':'agrees','inputOwnership':'exclusive'}
 def summary(result):
  r=unpack(result);blocks=r.get('content',[]) if isinstance(r,dict) else []
  return {'resultKeys':list(result) if isinstance(result,dict) else [],'isError':r.get('isError') if isinstance(r,dict) else None,'texts':[{'length':len(x.get('text','')),'head':x.get('text','')[:2400],'tail':x.get('text','')[-500:] if len(x.get('text',''))>2400 else ''} for x in blocks if x.get('type')=='text'],'images':[{'mimeType':x.get('mimeType'),'base64Length':len(x.get('data',''))} for x in blocks if x.get('type')=='image'],'serverRequestsSeen':serverRequests}
 marker_process=None
 def marker_rpc(op,**options):
  payload={'op':op,**options}
  if op!='prepare':payload['binding']=binding
  marker_process.stdin.write(json.dumps(payload)+'\n');marker_process.stdin.flush()
  while True:
   line=marker_process.stdout.readline()
   if not line:raise RuntimeError('Host marker authority process closed; no replay')
   response=json.loads(line)
   if response.get('event')=='error':raise RuntimeError('Host marker guard rejected: '+response['error'])
   if response.get('event')=='result':return response['result']
   if response.get('event')!='native-action':raise RuntimeError('Unexpected host authority response')
   action=response['action'];step=action.get('step');method=action.get('method');idx=action.get('index')
   if op=='focus' and step=='focus' and method=='click' and isinstance(idx,int) and idx>=0:code='await guestClaude.click('+str(idx)+');'
   elif op=='type' and step=='type' and method=='typeText' and __import__('re').fullmatch(r'agent-art-no-send-[a-f0-9-]{36}',action.get('text','')):code='await guestClaude.typeText('+json.dumps(action['text'])+');'
   elif op=='clear' and step=='clear' and method=='setValue' and isinstance(idx,int) and idx>=0 and action.get('text')=='':code='await guestClaude.setValue('+str(idx)+', "");'
   else:raise RuntimeError('Host requested an action outside the marker scope')
   audit['nativeActionRequests']+=1;audit['uiInputs']+=1;audit['phase']='host-claimed-marker-native-dispatch';save()
   emit('host-marker-claim-durable',{'caseId':hostCase['id'],'step':step,'method':method})
   try:
    result=rpc('mcpServer/tool/call',{'threadId':task['id'],'server':'cua_repl','tool':'js','arguments':{'code':code,'timeout_ms':150000,'title':'Host-claimed public no-Send marker '+step}},180)
    returned=not unpack(result).get('isError',False)
   except Exception:
    marker_process.stdin.write(json.dumps({'op':'native-result','requestId':response['requestId'],'returned':False})+'\n');marker_process.stdin.flush();raise
   marker_process.stdin.write(json.dumps({'op':'native-result','requestId':response['requestId'],'returned':returned})+'\n');marker_process.stdin.flush()
   emit('marker-native-return',{'step':step,'returned':returned,'effect':'not-observed'})
 hostCase=None;binding=None;hostFinished=False
 save()
 try:
  init=rpc('initialize',{'clientInfo':{'name':'agent_art_bench_native_diagnostic','title':'Agent Art Bench Native Read-only Diagnostic','version':'0.0.1'},'capabilities':{'experimentalApi':True}},25);send({'method':'initialized','params':{}})
  resumed=rpc('thread/start',{'ephemeral':True,'cwd':profile.get('guestWorkspace') or task.get('cwd'),'approvalPolicy':'on-request','sandbox':'read-only'},35)
  got=resumed.get('thread',{})
  if got.get('ephemeral') is not True or not got.get('id'):raise RuntimeError('Temporary runtime was not ephemeral')
  task={'id':got['id'],'name':'ephemeral-native-diagnostic'}
  audit['ephemeralRuntime']=True;audit['ephemeralRuntimeId']=task['id'];audit['approvalPolicyReturned']=resumed.get('approvalPolicy');audit['approvalsReviewerReturned']=resumed.get('approvalsReviewer');save()
  status=rpc('mcpServerStatus/list',{'threadId':task['id'],'serverName':'cua_repl','limit':1,'detail':'toolsAndAuthOnly'},35)
  servers=status.get('data',[])
  if len(servers)!=1 or 'js' not in servers[0].get('tools',{}):raise RuntimeError('Published guest CUA tool unavailable')
  binding={'connectionId':task['id'],'controllerId':'host-guest-claude-marker' if marker_mode else 'host-guest-claude-readiness'}
  if marker_mode:
   marker_process=subprocess.Popen(['node',str(root/'test-bench/remote-marker.mjs')],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,bufsize=1,cwd=root)
   recovery={'recoverCaseId':args.recover_case,'previousControllerStopped':True,'exclusiveInput':True} if args.recover_case else {}
   profile_option={'captureProfile':args.capture_profile} if args.capture_profile else {}
   cleanup_option={'cleanupCaseId':args.cleanup_case} if args.cleanup_case else {}
   focus_option={'focusOnly':True} if args.focus_recovery and not args.recover_case else {}
   prepared=marker_rpc('prepare',root=str(root),environment=json.loads(environment_path.read_text()),binding=binding,authorizeProbe=True,timeoutMs=args.timeout_ms,**recovery,**profile_option,**cleanup_option,**focus_option)
   if args.focus_recovery and prepared['contract']['diagnostic'].get('purpose')!='focus-recovery':raise RuntimeError('Existing case is not a focus-only recovery case')
   hostCase={'id':prepared['caseId']};audit['hostAuthorityCaseId']=hostCase['id'];save();emit('host-marker-prepared',{**prepared,'binding':binding})
  else:
   hostCase=authority('prepare',environment=json.loads(environment_path.read_text()),authorizeSetup=True,**binding,**({'setupProfile':args.setup_profile} if args.setup_profile else {}))
   audit['hostAuthorityCaseId']=hostCase['id'];save();emit('host-authority-prepared',{'caseId':hostCase['id'],'storeId':hostCase['authority']['storeId'],'scope':hostCase['contract']['scope']})
  scope='one delegated exact-marker clear only; zero focus, typing, host input, keypress, handoff or Send' if args.cleanup_case else 'host-claimed one focus/type/exact-marker clear plus separately claimed host input probe; no setup, keypress, handoff or Send' if marker_mode else 'host-authority-guarded select-chat/open-new-chat plus read-only observations; no typing, keypress or Send'
  audit['operatorScope']=scope
  if args.focus_recovery:audit['operatorScope']='one focus before restore; zero typing/clearing/host input; paused case stays consumed; fresh read-only recovery guard checks'
  audit['phase']='ready';audit['runtime']={'platformOs':init.get('platformOs'),'platformFamily':init.get('platformFamily')};save();emit('ready',{'nativeTool':'cua_repl.js','taskName':task['name'],'scope':audit['operatorScope'],'approvalPolicy':resumed.get('approvalPolicy'),'approvalsReviewer':resumed.get('approvalsReviewer')})
  for line in iter(input,''):
   request=json.loads(line);op=request.get('op')
   if op=='close':break
   if marker_mode and op in ['qualify','focus','type','clear','observe-focus','observe-marker','observe-empty','host-baseline','claim-host-type','settle-host-type','observe-host-token','observe-isolation','independence','interrupt','finish','pause-for-restore','inspect-restored-unqualified','observe-restored-readiness','verify-consumed-focus']:
    if args.cleanup_case and op not in ['qualify','clear','observe-marker','observe-empty','interrupt','finish']:raise RuntimeError('Cleanup-only scope cannot focus, type or operate the host probe')
    if args.recover_case and op in ['focus','type','host-baseline','claim-host-type','settle-host-type','observe-isolation','independence']:raise RuntimeError('Recovery transport is observation plus unused exact-marker cleanup only')
    options={k:v for k,v in request.items() if k!='op'}
    if op in ['focus','type','clear','observe-focus','observe-marker','observe-empty','observe-isolation','inspect-restored-unqualified','observe-restored-readiness','verify-consumed-focus']:options['material']=reviewed_material(request)
    try:result=marker_rpc(op,**options)
    except RuntimeError as ex:emit('marker-operation-blocked',{'op':op,'error':str(ex)});continue
    if op=='finish':hostFinished=True;audit['hostReportOutcome']=result['outcome'];save()
    emit('host-marker-result',{'op':op,'result':result})
    if op=='pause-for-restore':
     hostFinished=True;audit['casePausedForRestore']=True;audit['hostCaseFinished']=False;save();break
   elif op=='select':
    if selectionCount:raise RuntimeError('Selection budget consumed; no retry')
    selectionStart=time.monotonic();selectionCount+=1;audit['selectionsDispatched']=selectionCount;audit['phase']='select-dispatch-entered';save()
    last=rpc('mcpServer/tool/call',{'threadId':task['id'],'server':'cua_repl','tool':'js','arguments':{'code':'var guestClaude = await cua.getApp("/Applications/Claude.app");','timeout_ms':150000,'title':'Read-only Claude post-onboarding selection'}},180)
    result=summary(last);selected=not result['isError'];audit['phase']='selection-returned' if selected else 'selection-blocked';audit['selectionResult']={'isError':result['isError'],'imageCount':len(result['images']),'textBlockCount':len(result['texts']),'elapsedMs':round((time.monotonic()-selectionStart)*1000),'errorText':[x['head'] for x in result['texts'] if x['length']<2400] if result['isError'] else []};save();emit('selection-result',result)
   elif op=='observe':
    if not selected or request.get('documentationReviewed') is not True or observations>=(24 if marker_mode else 12):raise RuntimeError('Fresh observation prerequisites not satisfied')
    observationStart=time.monotonic();observations+=1;audit['observationRequests']=observations;audit['phase']='observation-dispatch-entered';save()
    last=rpc('mcpServer/tool/call',{'threadId':task['id'],'server':'cua_repl','tool':'js','arguments':{'code':'await guestClaude.getAXStateAndScreenshot({ disableDiffing: true });','timeout_ms':150000,'title':'Fresh read-only Claude observation'}},180)
    result=summary(last);audit['phase']='observation-returned';blocks=unpack(last).get('content',[]);audit['lastObservation']={'captureId':'capture-'+str(__import__('uuid').uuid4()),'ordinal':observations,'returnedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z'),'elapsedMs':round((time.monotonic()-observationStart)*1000),'isError':result['isError'],'imageCount':len(result['images']),'textSha256':[hashlib.sha256(x.get('text','').encode()).hexdigest() for x in blocks if x.get('type')=='text'],'imageSha256':[hashlib.sha256(base64.b64decode(x['data'])).hexdigest() for x in blocks if x.get('type')=='image']};audit['observationResults'].append(audit['lastObservation']);save();result['capture']=audit['lastObservation'];emit('observation-result',result)
   elif op in ['select-chat','open-new-chat','open-file-menu']:
    if marker_mode:raise RuntimeError('Marker scope has no mode selection or new-chat budget')
    try:claim=authority('claim',action=op,material=reviewed_material(request))
    except RuntimeError as ex:emit('setup-blocked',{'error':str(ex)});continue
    audit['nativeActionRequests']+=1;audit['uiInputs']+=1;audit['phase']='claimed-native-setup-dispatch';save()
    emit('host-claim-durable',{'caseId':hostCase['id'],'action':op,'controlIndex':claim['controlIndex'],'captureId':claim['captureId']})
    try:
     action_result=rpc('mcpServer/tool/call',{'threadId':task['id'],'server':'cua_repl','tool':'js','arguments':{'code':'await guestClaude.click('+str(claim['controlIndex'])+');','timeout_ms':150000,'title':'Host-guarded Claude Chat setup'}},180)
     returned=not unpack(action_result).get('isError',False)
    except Exception:
     authority('settle',action=op,returned=False);raise
    settlement=authority('settle',action=op,returned=returned);save();emit('setup-result',{'settlement':settlement,'effect':'not-observed','result':summary(action_result)})
   elif op=='ready':
    if marker_mode:raise RuntimeError('Use the marker session current qualification and observed effects')
    try:result=authority('ready',material=reviewed_material(request),modeProfile=request.get('modeProfile'))
    except RuntimeError as ex:emit('readiness-blocked',{'error':str(ex)});continue
    emit('host-readiness-recorded',result)
   elif op=='finish':
    result=authority('finish');hostFinished=True;audit['hostReportOutcome']=result['outcome'];save();emit('host-readiness-finished',result)
   elif op=='image':
    r=unpack(last);images=[x for x in r.get('content',[]) if x.get('type')=='image']
    if not images:
     emit('image-unavailable',{'reason':'native-result-has-no-image','captureId':audit.get('lastObservation',{}).get('captureId'),'furtherInput':'blocked-without-a-fresh-complete-reviewed-pair'});continue
    image=images[request.get('index',0)];raw=base64.b64decode(image['data'])
    try:
     from PIL import Image
    except ImportError:
     if len(raw)>4_000_000:raise RuntimeError('Raw display image exceeds output bound')
     emit('image',{'mimeType':image.get('mimeType'),'data':image['data'],'originalMimeType':image.get('mimeType')})
    else:
     im=Image.open(io.BytesIO(raw)).convert('RGB');im.thumbnail((1200,1000));b=io.BytesIO();im.save(b,format='JPEG',quality=65);data=b.getvalue()
     if len(data)>110000:raise RuntimeError('Display image exceeds output bound')
     emit('image',{'mimeType':'image/jpeg','data':base64.b64encode(data).decode(),'originalMimeType':image.get('mimeType'),'displaySize':im.size})
   elif op=='text':
    blocks=[x for x in unpack(last).get('content',[]) if x.get('type')=='text'];value=blocks[request.get('index',0)].get('text','');start=request.get('start',0);end=min(start+request.get('length',18000),len(value));emit('text',{'length':len(value),'start':start,'end':end,'text':value[start:end]})
   elif op=='status':emit('status',audit)
   else:raise RuntimeError('Unknown diagnostic operation')
 except EOFError:pass
 except Exception as e:
  audit['phase']='blocked';audit['error']=str(e)[:1200];save();emit('blocked',{'error':str(e)[:1200],'serverRequestsSeen':serverRequests})
 finally:
  if hostCase and not hostFinished:
   try:
    result=marker_rpc('finish') if marker_mode else authority('finish');audit['hostReportOutcome']=result['outcome'];emit('host-readiness-finished',result)
   except Exception as ex:audit['hostFinalizationError']=str(ex)[:500]
  audit['transportClosed']=True;save()
  try:p.stdin.close()
  except OSError:pass
  try:p.wait(timeout=3)
  except subprocess.TimeoutExpired:p.terminate();p.wait(timeout=3)
  if marker_process:
   try:marker_process.stdin.close();marker_process.wait(timeout=3)
   except (OSError,subprocess.TimeoutExpired):marker_process.terminate();marker_process.wait(timeout=3)
  sel.close()

if __name__=='__main__':
 main()
