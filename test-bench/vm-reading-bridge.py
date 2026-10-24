"""Bounded guest CUA transport for an explicitly authorized reading check.

All native/browser operations use published CUA. SSH only carries its RPC and
public test inputs. No model turn, host UI control, or arbitrary-code API.
"""
import argparse
import base64
import datetime
import io
import json
import os
from pathlib import Path
import selectors
import subprocess
import sys
import time
import uuid
import hashlib
import re
import urllib.request
from urllib.parse import urlsplit, urlunsplit


def empty_session_app_approval(params, allowed_native):
    """Recognize only the established empty form used for session app grants."""
    if not isinstance(params, dict):
        return False
    meta = params.get("_meta", {})
    schema = params.get("requestedSchema", {})
    if not isinstance(meta, dict) or not isinstance(schema, dict):
        return False
    tool_params = meta.get("tool_params", {})
    if not isinstance(tool_params, dict):
        return False
    app = tool_params.get("app")
    return (params.get("serverName") == "cua_repl" and params.get("mode") == "form"
            and meta.get("connector_id") == "computer-use" and schema.get("properties") == {}
            and schema.get("required", []) == [] and schema.get("type", "object") == "object"
            and app in allowed_native and meta.get("tool_name") in allowed_native[app])


def acquire_observation(slot, acquire):
    """A failed fresh read must leave no earlier capture available for action."""
    slot["capture"] = None
    return acquire()


def current_chrome_page_url(raw_ax):
    """Identify the active document/address; mentions elsewhere cannot own a tab."""
    if not isinstance(raw_ax, str) or not re.search(r"^Window:.*App: Google Chrome\.", raw_ax, re.M):
        raise RuntimeError("Actual regular Chrome native window required")
    documents, addresses, windows = [], [], []
    for line in raw_ax.splitlines():
        match = re.match(r"^\t*\d+ (.*)$", line)
        if not match:
            continue
        node = match.group(1)
        if re.match(r"^(?:standard window|window)(?: |$)", node):
            windows.append(node)
        if re.match(r"^HTML content(?: |$)", node):
            documents.append(re.search(r"(?:^|, )URL: (\S+)", node))
        elif re.match(r"^(?:text field|combo box)(?: |$)", node) and "(disabled)" not in node:
            suffix = re.sub(r"^(?:text field|combo box)\s*", "", node)
            suffix = re.sub(r"^\([^)]*\)\s*", "", suffix)
            label = re.search(r"(?:^|, )Description: (.*?)(?=, (?:Value|Help|ID|URL):|$)", suffix)
            plain_label = suffix.split(", Value:", 1)[0]
            if (label.group(1) if label else plain_label) == "Address and search bar":
                value = re.search(r"(?:^|, )Value: (.*)$", node)
                addresses.append(value.group(1) if value else None)
    if len(windows) != 1 or len(documents) != 1:
        raise RuntimeError("One actual current Chrome window/document required for owned tab input")
    if documents[0]:
        value = documents[0].group(1)
    elif len(addresses) == 1 and addresses[0]:
        value = addresses[0]
    else:
        raise RuntimeError("The active native document or unique address field must expose its URL")
    if value.startswith("127.0.0.1:"):
        value = "http://" + value
    try:
        parts = urlsplit(value)
        if (parts.scheme != "http" or parts.hostname != "127.0.0.1" or parts.username or parts.password
                or not parts.port or any(character.isspace() for character in value)):
            raise ValueError("Unexpected page URL")
    except ValueError as error:
        raise RuntimeError("The active native document must be the explicit owned loopback URL") from error
    return urlunsplit(parts)


def chrome_startup_close(raw_ax):
    """Only the native startup prompt; never a page's similarly named control."""
    if not re.search(r'^Window:.*App: Google Chrome\.$', raw_ax, re.M):
        raise RuntimeError("Actual regular Chrome startup surface required")
    block = raw_ax
    if not re.search(r'^Window: "Restore pages\?", App: Google Chrome\.$', raw_ax, re.M):
        lines = raw_ax.splitlines()
        candidates = [i for i, line in enumerate(lines)
                      if re.fullmatch(r'\t\t\d+ container Restore pages\?', line)]
        if len(candidates) != 1:
            raise RuntimeError("One native Chrome startup restore container required")
        start = candidates[0]
        end = next((i for i in range(start+1, len(lines))
                    if re.match(r'^\t{0,2}\d+ ', lines[i])), len(lines))
        block = "\n".join(lines[start:end])
    buttons = re.findall(r'^\t*(\d+) button Close$', block, re.M)
    if (len(buttons) != 1 or not re.search(r'^\t*\d+ heading Restore pages\?$', block, re.M)
            or "Chrome didn't shut down correctly." not in block
            or not re.search(r'^\t*\d+ checkbox Help make Google Chrome better by sending crash reports and usage statistics to Google, Value: 0$', block, re.M)):
        raise RuntimeError("Exact restore prompt, unique Close and unchecked startup telemetry required")
    return int(buttons[0])


def main():
    parser = argparse.ArgumentParser(description="Guest regular Chrome and Lab reading; draft-only by default, separate one-Send trial.")
    parser.add_argument("--connection", type=Path, required=True)
    parser.add_argument("--record", type=Path, required=True)
    parser.add_argument("--environment", type=Path)
    parser.add_argument("--browser-origin", help="The owned public loopback bench origin only")
    parser.add_argument("--retained-probe-case", help="An earlier owned canceled-probe case whose public browser tab needs cleanup")
    parser.add_argument("--authorize-handoff", action="store_true", help="Record existing operator authorization; does not obtain consent")
    parser.add_argument("--authorize-submit", action="store_true", help="Separate fresh one-Send Lab application trial; requires actual operator direction")
    parser.add_argument("--trial-profile", choices=["lab-unified-reading-trial-v1", "lab-unified-reading-trial-v2", "lab-unified-reading-trial-v3"], help="Explicit fixed application preparation profile")
    parser.add_argument("--submitted-policy", choices=["claude-inline-static-v1"], help="Explicit new-case rendered-message observation policy; no transport-byte claim")
    parser.add_argument("--previous-case", help="Finished owned public trial; only its verified two-message conversation may seed New")
    args = parser.parse_args()
    if not args.authorize_handoff:
        parser.error("Explicit no-Send handoff authorization required")
    if args.trial_profile and not args.authorize_submit:
        parser.error("A trial profile requires separate submission authorization")
    if args.submitted_policy and not args.authorize_submit:
        parser.error("A submitted-message policy requires separate submission authorization")
    if args.previous_case and (not args.authorize_submit or not re.fullmatch(r"reading-trial-[a-f0-9-]{36}", args.previous_case)):
        parser.error("A previous case requires submission authorization and a finished public trial ID")
    if args.authorize_submit and not (args.environment and args.browser_origin):
        parser.error("Submission requires the full observed environment and owned browser origin")
    if bool(args.environment) != bool(args.browser_origin):
        parser.error("Full handoff requires both observed environment and owned browser origin")
    if args.browser_origin and not re.fullmatch(r"http://127\.0\.0\.1:[1-9][0-9]{3,4}", args.browser_origin):
        parser.error("Only the owned loopback origin is allowed")
    if args.browser_origin and not 1024 <= int(args.browser_origin.rsplit(":", 1)[1]) <= 65535:
        parser.error("The owned loopback port must be within 1024..65535")
    if args.retained_probe_case and (not args.browser_origin or not re.fullmatch(r"reading-draft-[a-f0-9-]{36}", args.retained_probe_case)):
        parser.error("Retained probe cleanup requires its exact owned case and full no-Send scope")
    root = Path(__file__).resolve().parent.parent
    profile = json.loads(args.connection.read_text())
    code = 'import fs from "node:fs";const {sshControllerTransport}=await import(' + json.dumps((root / "test-bench/controller-link.mjs").as_uri()) + ');console.log(JSON.stringify(sshControllerTransport(JSON.parse(fs.readFileSync(0,"utf8")))));'
    checked = subprocess.run(["node", "--input-type=module", "-e", code], input=json.dumps(profile), text=True, capture_output=True, check=True)
    transport = json.loads(checked.stdout)
    record = args.record.resolve()
    if record.exists():
        raise RuntimeError("Fresh diagnostic record required; do not replay an existing session")
    record.parent.mkdir(parents=True, exist_ok=True)
    audit = {"schema": "agent-art-bench/guest-reading-transport/1", "startedAt": None,
             "claudeSends": 0, "claudeTypes": 0, "claudeDraftResets": 0, "modelTurnsStarted": 0,
             "rawImagesOrAxSaved": False, "browserBundleId": "com.google.Chrome",
             "submissionAuthorized": args.authorize_submit,
             "observations": [], "actions": [], "ownedTabs": []}
    now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    def save():
        audit["updatedAt"] = now()
        record.write_text(json.dumps(audit, indent=2) + "\n")
        record.chmod(0o600)
    def emit(event, data):
        print(json.dumps({"event": event, "data": data}, ensure_ascii=False), flush=True)
    audit["startedAt"] = now()
    save()
    proc = subprocess.Popen([transport["command"], *transport["args"]], stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0)
    selector = selectors.DefaultSelector()
    selector.register(proc.stdout, selectors.EVENT_READ, "stdout")
    selector.register(proc.stderr, selectors.EVENT_READ, "stderr")
    buffer = b""
    sequence = 0
    pending = {}
    allowed_native = {}
    mutation_capture_at = None
    def send(value):
        proc.stdin.write((json.dumps(value) + "\n").encode())
        proc.stdin.flush()
    def rpc(method, params, timeout=180):
        nonlocal buffer, sequence
        sequence += 1
        wanted = sequence
        send({"id": wanted, "method": method, "params": params})
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            for key, _ in selector.select(min(1, max(0, deadline - time.monotonic()))):
                if key.data == "approval":
                    reply = json.loads(sys.stdin.readline())
                    rid = reply.get("requestId")
                    if reply.get("op") != "approval-response" or rid not in pending:
                        raise RuntimeError("Only the actual pending app approval may be answered")
                    decision = reply.get("response", {})
                    if decision.get("action") == "accept" and not (reply.get("source") == "operator-reply" and reply.get("humanReply")):
                        raise RuntimeError("Existing actual human direction required")
                    if decision.get("action") not in ["accept", "decline", "cancel"] or decision.get("_meta", {}).get("persist") not in [None, "session"]:
                        raise RuntimeError("No persistent approval is available in this check")
                    if decision.get("action") == "accept" and mutation_capture_at and (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(mutation_capture_at.replace("Z", "+00:00"))).total_seconds() > 30:
                        send({"id": rid, "result": {"action": "cancel", "content": None}})
                        raise RuntimeError("Capture expired during app approval; the action claim remains consumed")
                    send({"id": rid, "result": decision})
                    pending.pop(rid)
                    audit.setdefault("sessionApprovals", []).append({"action": decision["action"], "source": reply.get("source")})
                    save()
                    if not pending:
                        selector.unregister(sys.stdin)
                    continue
                chunk = os.read(key.fileobj.fileno(), 65536)
                if not chunk:
                    selector.unregister(key.fileobj)
                    if key.data == "stdout":
                        raise RuntimeError("Guest transport closed")
                    continue
                if key.data == "stderr":
                    continue
                buffer += chunk
                if len(buffer) > 20000000:
                    raise RuntimeError("Bounded guest RPC frame exceeded")
                while b"\n" in buffer:
                    line, buffer = buffer.split(b"\n", 1)
                    if not line:
                        continue
                    message = json.loads(line)
                    if "method" in message:
                        if "id" not in message:
                            continue
                        if message["method"] != "mcpServer/elicitation/request":
                            send({"id": message["id"], "error": {"code": -32601, "message": "No action delegation on this connection"}})
                            continue
                        params = message.get("params", {})
                        meta = params.get("_meta", {})
                        if not empty_session_app_approval(params, allowed_native):
                            send({"id": message["id"], "result": {"action": "cancel", "content": None}})
                            raise RuntimeError("Unexpected approval mode/schema or app/action scope; only empty session app forms are permitted")
                        pending[message["id"]] = message
                        if len(pending) == 1:
                            selector.register(sys.stdin, selectors.EVENT_READ, "approval")
                        emit("approval-request", {"id": message["id"], "params": params})
                        deadline = time.monotonic() + 300
                        continue
                    if message.get("id") == wanted:
                        if "error" in message:
                            raise RuntimeError("Guest RPC rejected: " + str(message["error"])[:500])
                        return message["result"]
        raise TimeoutError("Guest RPC deadline exceeded")
    def unpack(result):
        return result["result"] if isinstance(result.get("result"), dict) and "content" in result["result"] else result
    last = None
    observation_slot = {"capture": None}
    def cua(code, title, native=None, capture_at=None):
        nonlocal allowed_native, mutation_capture_at
        allowed_native = native or {"com.google.Chrome": ["get_app_state"], "com.anthropic.claudefordesktop": ["get_app_state"]}
        mutation_capture_at = capture_at
        if capture_at and (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(capture_at.replace("Z", "+00:00"))).total_seconds() > 30:
            raise RuntimeError("Capture expired before native dispatch; do not retry its claim")
        return unpack(rpc("mcpServer/tool/call", {"threadId": runtime_id, "server": "cua_repl", "tool": "js",
                     "arguments": {"code": code, "timeout_ms": 150000, "title": title}}))
    def show_summary(result):
        blocks = result.get("content", [])
        emit("tool-result", {"isError": result.get("isError", False),
             "texts": [{"length": len(b.get("text", "")), "head": b.get("text", "")[:1300]} for b in blocks if b.get("type") == "text"],
             "imageCount": sum(b.get("type") == "image" for b in blocks)})
    host_case = None
    host_finished = False
    binding = None
    active_lane = None
    page_urls = {}
    pending_action = None
    def authority(op, **options):
        value = {"op": op, "root": str(root), **options}
        if op not in ["prepare", "prepare-trial"]:
            value.update({"caseId": host_case["id"], "binding": binding})
        result = subprocess.run(["node", str(root / "test-bench/remote-reading.mjs")], input=json.dumps(value), text=True, capture_output=True, timeout=25)
        if result.returncode:
            raise RuntimeError("Host authority rejected: " + result.stderr.strip()[:700])
        return json.loads(result.stdout)
    def material(request, target):
        last_capture = observation_slot["capture"]
        if not last_capture or last_capture["target"] != target or last_capture["isError"] or last_capture["imageCount"] != 1:
            raise RuntimeError("One complete actual paired capture from the selected app required")
        if request.get("reviewedCaptureId") != last_capture["captureId"] or request.get("visualAgreement") != "agrees":
            raise RuntimeError("Review the exact current capture first")
        if (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(last_capture["capturedAt"].replace("Z", "+00:00"))).total_seconds() > 30:
            raise RuntimeError("Actual capture expired; do not reuse it for input")
        texts = [b["text"] for b in last.get("content", []) if b.get("type") == "text"]
        if len(texts) != 1:
            raise RuntimeError("One full AX tree required")
        return {**last_capture, "rawAX": texts[0], "complete": True, "visualAgreement": "agrees", "inputOwnership": "exclusive",
                "bundleId": "com.google.Chrome" if target == "chrome" else "com.anthropic.claudefordesktop"}
    def lifecycle(action, facts):
        # Companion host-native authority: the guest never sees or writes it.
        script = '''import fs from 'node:fs';import {createHash} from 'node:crypto';import {authorityCasePaths,assertAuthorityCase,withAuthorityLock,writeExclusive} from './test-bench/authority-store.mjs';
const q=JSON.parse(fs.readFileSync(0,'utf8')),p=authorityCasePaths(q.caseId,q.root),s=JSON.parse(fs.readFileSync(p.state));assertAuthorityCase(p,s);
if(s.status!=='active'||s.contract.connectionId!==q.binding.connectionId||s.contract.controllerId!==q.binding.controllerId||Date.now()>Date.parse(s.deadlineAt))throw Error('Current owned lifecycle authority required');
if(q.stage==='claimed'&&Object.values(s.actions).some(a=>a.dispatch!=='returned'))throw Error('Uncertain component action blocks lifecycle input');
const allowed=['dismiss-startup','new-tab-browser','new-tab-desktop','navigate-browser','navigate-desktop','close-tab-browser','close-tab-desktop','close-retained-probe'];if(!allowed.includes(q.action))throw Error('Unknown browser lifecycle action');
withAuthorityLock(p,()=>writeExclusive(p.dir+'/browser-'+q.action+'-'+q.stage+'.json',{schema:'agent-art-bench/browser-lifecycle/1',action:q.action,stage:q.stage,at:new Date().toISOString(),binding:q.binding,maximumAttempts:1,claudeInput:false,...q.facts}));console.log(JSON.stringify({durable:true}));'''
        data = {"caseId": host_case["id"], "root": str(root), "binding": binding, "action": action, "stage": facts.pop("stage", "claimed"), "facts": facts}
        result = subprocess.run(["node", "--input-type=module", "-e", script], input=json.dumps(data), text=True, capture_output=True, timeout=15, cwd=root)
        if result.returncode:
            raise RuntimeError("Browser lifecycle authority rejected: " + result.stderr.strip()[:500])
    def lifecycle_call(action, code, m, native):
        nonlocal last
        if any(item["dispatch"] in ["entered", "unconfirmed"] for item in audit["actions"]):
            raise RuntimeError("Uncertain previous native input blocks further lifecycle input")
        facts = {"captureId": m["captureId"], "capturedAt": m["capturedAt"], "snapshotSha256": hashlib.sha256(m["rawAX"].encode()).hexdigest()}
        lifecycle(action, facts.copy())
        audit["actions"].append({"action": action, "dispatch": "entered", "captureId": m["captureId"]})
        save()
        observation_slot["capture"] = None
        result = cua(code, "Owned regular Chrome " + action, {"com.google.Chrome": native}, m["capturedAt"])
        last = result
        returned = not result.get("isError", False)
        lifecycle(action, {"stage": "returned", "returned": returned})
        audit["actions"][-1]["dispatch"] = "returned" if returned else "unconfirmed"
        save()
        show_summary(result)
        if not returned:
            raise RuntimeError("Browser lifecycle returned an error; do not replay")
    def browser_material(request):
        m = material(request, "chrome")
        lane = request.get("lane")
        if lane not in ["browser", "desktop"] or active_lane != lane:
            raise RuntimeError("The currently owned tab/lane must match")
        url = current_chrome_page_url(m["rawAX"])
        if not re.fullmatch(re.escape(args.browser_origin) + r"/\?lane=" + lane + r"(?:[&#A-Za-z0-9_=.-]*)", url):
            raise RuntimeError("The current native Chrome AX must expose the owned loopback page")
        page_urls[lane] = url
        config = json.load(urllib.request.urlopen(args.browser_origin + "/api/config", timeout=5))
        route_script = 'import {loadBenchInputs} from "./test-bench/inputs.mjs";import {pathToFileURL} from "node:url";import path from "node:path";const i=await loadBenchInputs();const {buildClientHandoff}=await import(pathToFileURL(path.join(i.packageDir,"clients.mjs")));console.log(buildClientHandoff({client:"claude-app",prompt:i.context,conversation:"fresh",surface:"chat"}).url);'
        route = subprocess.check_output(["node", "--input-type=module", "-e", route_script], text=True, cwd=root).strip()
        tab_id = host_case["contract"]["probeTabId" if lane == "browser" else "browserTabId"]
        receipt = {"provenance": "owned-loopback-component", "tabId": tab_id, "url": url, "href": route,
                   "client": "claude-app", "captureId": m["captureId"], **config["manifest"]}
        return {**m, "provenance": "native-ax", "url": url, "lane": lane, "tabId": tab_id, "manifest": config["manifest"],
                "component": {**config["manifest"], "client": "claude-app", "href": route,
                              "hrefBasis": "trusted-loopback-component-receipt", "receipt": receipt}}
    try:
        rpc("initialize", {"clientInfo": {"name": "agent_art_reading_nosend", "version": "0.0.1"}, "capabilities": {"experimentalApi": True}}, 25)
        send({"method": "initialized", "params": {}})
        started = rpc("thread/start", {"ephemeral": True, "cwd": profile["guestWorkspace"], "approvalPolicy": "on-request", "sandbox": "read-only"}, 35)
        if started.get("thread", {}).get("ephemeral") is not True:
            raise RuntimeError("Ephemeral guest CUA context required")
        runtime_id = started["thread"]["id"]
        audit["runtimeId"] = runtime_id
        save()
        status = rpc("mcpServerStatus/list", {"threadId": runtime_id, "serverName": "cua_repl", "limit": 1, "detail": "toolsAndAuthOnly"}, 35)
        if len(status.get("data", [])) != 1 or "js" not in status["data"][0].get("tools", {}):
            raise RuntimeError("Published guest CUA unavailable")
        selected = set()
        if args.browser_origin:
            binding = {"connectionId": runtime_id, "controllerId": "host-guest-lab-reading-trial" if args.authorize_submit else "host-guest-lab-draft-nosend"}
            # Metadata only: a guest timestamp bracketed in the host's clock.
            # No OS/UI scripting or authority file is executed in the guest.
            correlation_command = 'exec ' + __import__('shlex').quote('/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node') + ' -e ' + __import__('shlex').quote('const cp=require("node:child_process");const bootSessionId=cp.execFileSync("/usr/sbin/sysctl",["-n","kern.bootsessionuuid"],{encoding:"utf8"}).trim();console.log(JSON.stringify({guestAt:new Date().toISOString(),bootSessionId}));')
            stamp_started = now()
            clock_read = subprocess.run([transport["command"], *transport["args"][:-1], correlation_command], capture_output=True, text=True, timeout=10, check=True)
            stamp_finished = now()
            clock = {"profile": "ssh-bracketed-guest-clock-v1", "hostStartedAt": stamp_started,
                     "hostFinishedAt": stamp_finished, **json.loads(clock_read.stdout), "driftAllowanceMs": 100}
            host_case = authority("prepare-trial" if args.authorize_submit else "prepare", environment=json.loads(args.environment.read_text()), **binding,
                                  **({"authorizeSend": True, **({"profile": args.trial_profile} if args.trial_profile else {}),
                                      **({"submittedPolicy": args.submitted_policy} if args.submitted_policy else {}),
                                      **({"previousCaseId": args.previous_case} if args.previous_case else {})} if args.authorize_submit else {}),
                                  authorizeHandoff=True, browserOrigin=args.browser_origin,
                                  browserTabId="guest-desktop-" + str(uuid.uuid4()), probeTabId="guest-browser-" + str(uuid.uuid4()),
                                  draftPolicy="lab-claude-ax-paragraphs-v1", clockCorrelation=clock)
            audit["hostCaseId"] = host_case["id"]
            audit["browserLifecycleScope"] = {"maximumStartupDismissals": 1, "maximumNewTabs": 2, "maximumAddressNavigations": 2,
                                              "maximumOwnedTabCloses": 2, "knownLoopbackOnly": True, "claudeInput": False}
            if args.retained_probe_case:
                audit["browserLifecycleScope"]["maximumRetainedProbeCloses"] = 1
            save()
            emit("host-case", {"caseId": host_case["id"], "scope": host_case["contract"]["scope"]})
        emit("ready", {"scope": ("one fresh public Lab application trial; one Claude Send, zero typing/keys, one known-public reset" if args.trial_profile == "lab-unified-reading-trial-v3" else "one fresh public Lab application trial; one Claude Send, zero typing/keys/clear") if args.authorize_submit else "regular Chrome qualification and one public Lab draft; zero Claude typing/Send", "runtimeId": runtime_id})
        for line in iter(input, ""):
            try:
                request = json.loads(line)
                op = request.get("op")
                if op == "close":
                    break
                if op in ["select-chrome", "select-claude"]:
                    target = op.removeprefix("select-")
                    if target in selected:
                        raise RuntimeError("One selection per app; do not reset a consumed context")
                    selected.add(target)
                    app_path = "/Applications/Google Chrome.app" if target == "chrome" else "/Applications/Claude.app"
                    var_name = "guestChrome" if target == "chrome" else "guestClaude"
                    observation_slot["capture"] = None
                    last = cua("var " + var_name + " = await cua.getApp(" + json.dumps(app_path) + ");", "Select exact guest " + target)
                    show_summary(last)
                elif op == "browser":
                    if "chrome" not in selected or request.get("documentationReviewed") is not True:
                        raise RuntimeError("Verify regular native Chrome and review its docs first")
                    observation_slot["capture"] = None
                    last = cua('var guestBrowser = await cua.getBrowser({ id: "chrome" });', "Select regular Chrome browser connection")
                    show_summary(last)
                    if last.get("isError"):
                        audit["browserAdapter"] = {"qualified": False, "reason": "missing-turn-context" if any("Missing required Codex turn metadata" in b.get("text", "") for b in last.get("content", [])) else "unavailable"}
                        save()
                elif op == "dismiss-startup":
                    m = material(request, "chrome")
                    control = chrome_startup_close(m["rawAX"])
                    lifecycle_call(op, "await guestChrome.click(" + str(control) + ");", m, ["click"])
                elif op == "new-tab":
                    lane = request.get("lane")
                    m = material(request, "chrome")
                    if lane not in ["browser", "desktop"] or "Restore pages?" in m["rawAX"]:
                        raise RuntimeError("Current regular Chrome main window required for the owned new tab")
                    lifecycle_call("new-tab-" + lane, 'await guestChrome.pressKey("super+t");', m, ["press_key"])
                    active_lane = lane
                    audit["ownedTabs"].append({"lane": lane, "state": "created-api-returned", "binding": "controller-attributed"})
                    save()
                elif op == "cleanup-retained-probe":
                    if not args.retained_probe_case:
                        raise RuntimeError("No earlier owned probe selected for cleanup")
                    m = material(request, "chrome")
                    binding_file = json.loads((root / ".local/test-bench/authority-binding.json").read_text())
                    source = json.loads((Path(binding_file["directory"]) / "cases" / args.retained_probe_case / "case.json").read_text())
                    claim = source.get("actions", {}).get("browser-probe")
                    if source.get("status") != "finished" or not claim or source.get("actions", {}).get("handoff"):
                        raise RuntimeError("Only the session's finished browser-only probe may supply cleanup ownership")
                    actual_url = current_chrome_page_url(m["rawAX"])
                    if (not re.fullmatch(re.escape(args.browser_origin) + r"/\?lane=browser[&#A-Za-z0-9_=.-]*", actual_url)
                            or hashlib.sha256(actual_url.encode()).hexdigest() != claim["pageSha256"]):
                        raise RuntimeError("Current native Chrome must expose that exact owned public probe URL")
                    lifecycle_call("close-retained-probe", 'await guestChrome.pressKey("super+w");', m, ["press_key"])
                    audit["retainedProbeCleanup"] = {"sourceCaseId": args.retained_probe_case, "closeApiReturned": True, "observedClosed": False}
                    save()
                elif op == "navigate":
                    m = material(request, "chrome")
                    lane = request.get("lane")
                    if lane not in ["browser", "desktop"] or active_lane != lane:
                        raise RuntimeError("Only the newly created owned tab may navigate")
                    fields = re.findall(r"^\t*(\d+) text field.*(?:Address and search bar|Address bar).*", m["rawAX"], re.M)
                    if len(fields) != 1 or not ("New Tab" in m["rawAX"] or "chrome://newtab" in m["rawAX"]):
                        raise RuntimeError("Fresh owned New Tab address field required")
                    if not re.search(r"^The focused UI element is " + re.escape(fields[0]) + r" text field.*Address and search bar", m["rawAX"], re.M):
                        raise RuntimeError("The newly owned address field must already have observed focus")
                    url = args.browser_origin + "/?lane=" + lane + "&controller=agent"
                    code = "await guestChrome.setValue(" + fields[0] + ", " + json.dumps(url) + '); await guestChrome.pressKey("Return");'
                    lifecycle_call("navigate-" + lane, code, m, ["set_value", "press_key"])
                elif op in ["preflight", "arrival"]:
                    m = material(request, "claude")
                    result = authority(op, material=m, **({"launchResolved": True} if op == "arrival" and request.get("launchResolved") is True else {}))
                    emit("host-result", {"op": op, "result": result})
                elif op in ["browser-probe", "handoff", "confirm-launch"]:
                    if pending_action:
                        raise RuntimeError("Settle the observed outcome of the consumed action before further input")
                    if op == "confirm-launch":
                        m = material(request, "chrome")
                        m.update({"url": page_urls.get("desktop"), "lane": "desktop", "tabId": host_case["contract"]["browserTabId"]})
                    else:
                        m = browser_material(request)
                    claim = authority("claim", action=op, material=m)
                    emit("host-claim", {"action": op, "controlIndex": claim["controlIndex"], "caseId": host_case["id"]})
                    observation_slot["capture"] = None
                    result = cua("await guestChrome.click(" + str(claim["controlIndex"]) + ");", "Host-claimed no-Send " + op, {"com.google.Chrome": ["click"]}, m["capturedAt"])
                    last = result
                    pending_action = {"action": op, "returned": not result.get("isError", False), "url": m["url"], "tabId": m["tabId"], "lane": m["lane"]}
                    audit["actions"].append({"action": op, "dispatch": "returned" if pending_action["returned"] else "unconfirmed", "effect": "not-observed"})
                    save()
                    emit("native-return", pending_action)
                elif op in ["setup-raise", "new-conversation", "reset-public-draft", "raise", "send", "inspect-tool"]:
                    if not args.authorize_submit:
                        raise RuntimeError("A separately authorized new application trial is required")
                    if pending_action:
                        raise RuntimeError("Settle the consumed action before further input")
                    m = material(request, "claude")
                    claim = authority("claim", action=op, material=m,
                                      **({"selection": request.get("selection")} if op in ["inspect-tool", "setup-raise", "new-conversation"] else {}))
                    emit("host-claim", {"action": op, "controlIndex": claim["controlIndex"], "caseId": host_case["id"]})
                    observation_slot["capture"] = None
                    if op == "reset-public-draft":
                        audit["claudeDraftResets"] += 1
                        save()
                    if op == "send":
                        audit["claudeSends"] += 1  # attempts, including an uncertain native return
                        save()
                    native_method = ("perform_secondary_action" if op in ["setup-raise", "raise"]
                                     else "set_value" if op == "reset-public-draft" else "click")
                    code = ("await guestClaude.performSecondaryAction(" + str(claim["controlIndex"]) + ', "Raise");'
                            if op in ["setup-raise", "raise"]
                            else "await guestClaude.setValue(" + str(claim["controlIndex"]) + ", \"\");" if op == "reset-public-draft"
                            else "await guestClaude.click(" + str(claim["controlIndex"]) + ");")
                    result = cua(code, "Host-claimed Lab application " + op,
                                 {"com.anthropic.claudefordesktop": [native_method]}, m["capturedAt"])
                    last = result
                    pending_action = {"action": claim.get("action", op), "returned": not result.get("isError", False), "nativeApp": "claude"}
                    audit["actions"].append({"action": pending_action["action"], "dispatch": "returned" if pending_action["returned"] else "unconfirmed", "effect": "not-observed"})
                    save()
                    emit("native-return", pending_action)
                elif op in ["sent", "transition", "result", "request-denial"]:
                    if not args.authorize_submit:
                        raise RuntimeError("Submission/result inspection requires the separate trial contract")
                    m = material(request, "claude")
                    result = authority(op, material=m, selection=request.get("selection", {}))
                    emit("host-result", {"op": op, "result": result})
                elif op == "settle":
                    if not pending_action:
                        raise RuntimeError("No consumed action awaits settlement")
                    options = {"action": pending_action["action"], "returned": pending_action["returned"]}
                    if pending_action["action"] in ["browser-probe", "handoff"]:
                        url = pending_action["url"]
                        run = re.search(r"#(reading-[A-Za-z0-9_-]+)$", url)
                        if not run:
                            raise RuntimeError("The owned page must expose its actual generated run ID")
                        deadline = time.monotonic() + 3
                        while True:
                            receipt = json.load(urllib.request.urlopen(args.browser_origin + "/api/runs/" + run.group(1) + "/dispatches", timeout=5))
                            events = [e for e in receipt["dispatches"] if e["client"] == "claude-app" and e["lane"] == pending_action["lane"]]
                            if events or time.monotonic() >= deadline:
                                break
                            time.sleep(0.1)  # bounded HTTP receipt wait; never repeats UI input
                        if not events:
                            emit("receipt-pending", {"action": pending_action["action"], "nativeRetry": False})
                            continue
                        if len(events) != 1:
                            raise RuntimeError("Exactly one actual owned component dispatch receipt required")
                        entry = events[0]
                        options["browserEffect"] = {"provenance": "owned-bench-run-receipt", "captureId": "dispatch-" + run.group(1) + "-" + str(entry["ordinal"]),
                                                   "capturedAt": entry["recordedAt"], "url": url, "tabId": pending_action["tabId"], "manifest": receipt["manifest"],
                                                   "runId": receipt["runId"], "ordinal": entry["ordinal"], "eventAt": entry["at"], "recordedAt": entry["recordedAt"],
                                                   "client": "claude-app", "lane": pending_action["lane"], "clickCount": 1,
                                                   "cancelled": entry["cancelled"], "isTrusted": entry["isTrusted"]}
                    settled = authority("settle", **options)
                    pending_action = None
                    emit("host-result", {"op": op, "result": settled})
                elif op == "close-tab":
                    m = browser_material(request)
                    lane = m["lane"]
                    lifecycle_call("close-tab-" + lane, 'await guestChrome.pressKey("super+w");', m, ["press_key"])
                    audit["ownedTabs"][-1]["state"] = "close-api-returned"
                    active_lane = None
                    save()
                elif op == "finish":
                    result = authority("finish", cleanup=request.get("cleanup", {}))
                    host_finished = True
                    emit("host-result", {"op": op, "result": result})
                elif op in ["observe-chrome", "observe-claude"]:
                    target = op.removeprefix("observe-")
                    if target not in selected or request.get("documentationReviewed") is not True or len(audit["observations"]) >= (60 if args.authorize_submit else 24):
                        raise RuntimeError("Owned selected app, documentation and observation budget required")
                    app = "guestChrome" if target == "chrome" else "guestClaude"
                    last = acquire_observation(observation_slot, lambda: cua(
                        "await " + app + ".getAXStateAndScreenshot({ disableDiffing: true });", "Observe guest " + target))
                    blocks = last.get("content", [])
                    last_capture = {"captureId": "capture-" + str(uuid.uuid4()), "capturedAt": now(), "target": target,
                                    "isError": last.get("isError", False), "imageCount": sum(b.get("type") == "image" for b in blocks),
                                    "textSha256": [hashlib.sha256(b.get("text", "").encode()).hexdigest() for b in blocks if b.get("type") == "text"]}
                    observation_slot["capture"] = last_capture
                    audit["observations"].append(last_capture)
                    save()
                    emit("observation", last_capture)
                elif op == "text":
                    texts = [b.get("text", "") for b in last.get("content", []) if b.get("type") == "text"]
                    text = texts[request.get("index", 0)]
                    start = request.get("start", 0)
                    emit("text", {"length": len(text), "text": text[start:start + min(request.get("length", 12000), 26000)]})
                elif op == "image":
                    images = [b for b in last.get("content", []) if b.get("type") == "image"]
                    if not images:
                        emit("image-unavailable", {"capture": observation_slot["capture"]})
                        continue
                    item = images[request.get("index", 0)]
                    from PIL import Image
                    image = Image.open(io.BytesIO(base64.b64decode(item["data"]))).convert("RGB")
                    image.thumbnail((1200, 1000))
                    out = io.BytesIO()
                    image.save(out, format="JPEG", quality=65)
                    emit("image", {"mimeType": "image/jpeg", "data": base64.b64encode(out.getvalue()).decode()})
                else:
                    raise RuntimeError("Unknown bounded reading operation")
            except RuntimeError as error:
                emit("operation-blocked", {"op": request.get("op"), "error": str(error)[:700], "nativeRetry": False})
                audit.setdefault("operationBlocks", []).append({"op": request.get("op"), "at": now(), "error": str(error)[:700]})
                save()
    except EOFError:
        pass
    except Exception as error:
        audit["error"] = str(error)[:700]
        emit("blocked", {"error": str(error)[:700]})
    finally:
        if host_case and not host_finished:
            try:
                result = authority("finish", cleanup={"browserTabs": "blocked" if audit["ownedTabs"] else "not-created", "claudeDraft": "blocked"})
                emit("host-result", {"op": "finish-on-close", "result": result})
            except Exception as error:
                audit["hostFinalizationError"] = str(error)[:500]
        audit["transportClosed"] = True
        save()
        proc.stdin.close()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.terminate()
            proc.wait(timeout=3)
        selector.close()


if __name__ == "__main__":
    main()
