# Guest controller connection: stored task and result access

Candidate maintainer tooling, checked 2026-10-23. This connection removes the
need for an operator to copy guest task status, final replies and report paths
to the host. It does not qualify guest Computer Use or supply action authority.
Integrating developers do not need a VM or this maintainer connection.

## What is connected

The host opens the guest's installed Codex app server over an already approved
SSH control connection. Its documented stdio API supplies stored task reads.
The client uses `initialize`/`initialized`, then only `thread/list`,
`thread/read`, `thread/turns/list` or `thread/items/list`.
See the [official app-server documentation](https://learn.chatgpt.com/docs/app-server).

The initial installed proxy reported no default control socket. A standalone
stdio reader succeeded and found the existing named controller task. It did
not start a model turn or resume that task. The task's own workspace differed
from the requested repository, and its recheck report was in that workspace's
outputs directory. Retrieving that path through the API resolved the earlier
missing-report problem; no raw authentication or history files were opened.

The reusable client pins task ID, exact name and workspace. It checks those
before history access. `status` reads stored turn states. `read` additionally
projects final Agent replies and changed-file paths, omitting reasoning,
command output and intermediate commentary. Report paths are discovery
material, not instructions to run or automatically read arbitrary files.

## Use the current connection

The maintainer's machine-specific profile is ignored:
`.local/test-bench/controller-connection.json`. It contains SSH destination,
pinned known-hosts file, private control-socket path, installed CLI path and
the selected task identity. It contains no password, API key or copied app
credentials. Never commit that profile or guest account state.

```sh
npm run bench:controller -- status
npm run bench:controller -- read
```

Use `--connection /absolute/path/to/profile.json` to select another explicitly
prepared profile. The command has no write-method or arbitrary-RPC flag.

The selected transport is `ssh-control-stdio`. An existing approved SSH master
must own the control socket in a private directory. Known-host verification
is strict; agent forwarding and additional port forwards are disabled. The
reader cannot prompt for a password or fall back to another authentication
method. If the master expires, the VM restarts or the socket disappears,
reconnect the approved transport and update the ignored profile before use.
This slice establishes a live session, not automatic recovery after VM reset.
Initial host-key trust remains operator-attributed; it is not VM attestation.

The command starts an owned stdio reader for each query and closes it afterward.
It exposes no app-server TCP listener, changes no macOS permissions and does
not operate the controller app's own UI. SSH shell/file access remains a
separate provisioning capability; this reader does not expose arbitrary
remote shell or file methods through RPC.

## Limits and trust

- Stored status and completed turns establish what the selected app server
  persisted. A fresh reader's `notLoaded` is not evidence that the desktop
  task is idle or that no other process is running it.
- Agent prose and report bytes remain attributed claims. The guest OS,
  installed app-server binary, trusted SSH endpoint and machine owner remain
  trusted. This is neither independent witnessing nor malicious-owner defense.
- GUI observation, current app permissions, compositor focus, keyboard
  delivery, cleanup, independent input and VM restore need their own actual
  checks. The two blocked CUA attempts retain their original results.
- Reading a task does not authorize resuming it, messaging it, starting a
  model turn, granting a tool approval or retrying a consumed attempt. The
  reader rejects mutation/inference methods and every server-initiated action
  request. Stale or absent status cannot renew authority.
- Historical files remain immutable. The stale shared authority mount stays
  unavailable/unqualified; this stored-result reader is not its replacement.
  The separate [host-authority bridge](HOST-AUTHORITY.md) now keeps canonical
  setup state on the host and calls the guest-native tool directly. It adds
  no methods to this reader.

## Actual checks

Twelve subprocess/protocol fixtures passed: out-of-order replies, denied
mutation methods, refused server-initiated approval, malformed/oversized
responses, timeout closure, pinned identity/workspace mismatch, ambiguous or
incomplete name search, bounded result projection, SSH option/path guards and
import into a REPL without a global `process` object.
They establish local client behavior, not native client support.

The real guest check used CLI 0.163.0-alpha.11.2 on macOS 26.6.2 ARM64. It found
the intended existing task, read its three completed turns and discovered the
recheck's actual file path. Exact report bytes were collected separately and
matched the digest in the existing diagnostic output. No new Agent turn,
controller message, Claude selection, UI input, handoff or Send occurred.
SDK 0.1.4 and its bench pin remain unchanged; no deployment or publication.

See [dated findings](AGENT-QUALIFICATION.md#direct-guest-task-connection-and-collected-results-2026-10-23)
and the [standing plan](AGENT-RUNNER.md). Local automatic task/result retrieval
is now observed. Native controller feasibility was still blocked at this
stage; later native checks below and host-authority findings are separate.

## Separate read-only native diagnostic

The operator subsequently authorized diagnosing the CUA timeout directly over
the VM connection. This does not add methods to `controller-link.mjs`. An
ignored, single-purpose diagnostic used the installed app server's documented
`mcpServerStatus/list` and `mcpServer/tool/call` APIs, calling only the published
`cua_repl.js` tool. No model turn or substitute desktop driver was started.
Temporary in-memory contexts were closed after each bounded diagnostic. An
attempt to resume the existing desktop-owned task was rejected for an active
writer; its lock was preserved, not taken over.

The diagnostic first exposed a policy distinction: `approvalPolicy: never`
rejected Claude access, whereas `on-request` surfaced the normal MCP app
approval. The operator explicitly allowed this diagnostic session. That answer
was forwarded to the actual pending request with session persistence only;
the connection did not manufacture consent or set an always-allow rule. MCP
elicitation is documented by the
[app-server interface](https://learn.chatgpt.com/docs/app-server).

The approved installed-path selection still timed out at the 30-second REPL
deadline, with zero observations. Public installed runtime source uses a
120-second native request default. One subsequent diagnostic therefore used
a 150-second outer deadline to let a native result/error return. It also
returned an error after roughly two minutes, with zero observations; a longer
timeout did not qualify or repair observation. No further selection followed.

Read-only metadata established a running native helper and its socket. Its
policy lookup resolved the installed Claude identity before eliciting approval.
A later helper log contained `Broken pipe`. A short stack sample did not
establish an AX deadlock, missing OS permission, incompatible VM or corrupted
installation. These findings narrow the boundary but do not prove the cause.
No private permission/configuration database, credentials, raw AX or screenshot
was saved. No UI input, Claude Send or target-Claude inference occurred.

Do not treat session approval, a working socket or a larger deadline as native
qualification. The gate still requires two coherent, freshly reviewed Claude
AX/screenshot pairs. Restarting software, resetting permissions or trying
another driver has not been selected as a proven repair. The canonical action
store remains unavailable and unqualified; no marker or action case follows.

The operator renewed the diagnostic direction. A fresh bounded call separated
the short native error from its long API documentation and returned a specific
setup blocker after 130,341 ms: the runtime reports pending Accessibility and
Screen Recording steps in **ChatGPT Computer Use**. The VM console was unlocked.
The installed helper's public metadata confirms display name `ChatGPT Computer
Use`, bundle name `Codex Computer Use` and identity `com.openai.sky.CUAService`.
This is now an observed native setup requirement, rather than a speculative
permission repair. Individual OS grant states were not independently inspected.

The repair requires the operator to complete the pending security steps inside
the guest helper's setup window. The Agent can retrieve and verify the result
without a human relay, but cannot grant those OS permissions. A separate local
readiness record binds the exact failed report digest to `setup-blocked` and
`permissions-not-ready`; the failed attempt remains unchanged. There is no
automatic retry while setup is pending. See the
[guest setup repair](GUEST-CONTROLLER.md#continuing-a-blocked-read-only-check).

The operator subsequently completed the protected guest setup. One new
installed-Claude selection succeeded, followed by two successful paired
AX/screenshot calls. The previous permission-pending error did not recur.
Both images show the welcome screen with **Get started**; AX contains only
window-shell/menu elements. This is observed native capture transport and a
cleared setup blocker, not complete AX coverage, empty-Chat readiness or input
qualification. The operator was asked to complete Claude's one-time guest
onboarding/sign-in, with no message submission. Native diagnostics were closed
after the two captures; raw images/AX were not saved. The original blocked
report and its readiness projection are preserved separately from this result.

After the operator completed Claude setup, a further bounded selection and
two paired captures succeeded with full application-content/composer AX and
matching pixels. The actual surface is **Code/new session**, with an empty
composer. Claude read-only observation is now checked on that surface. Lab
Chat readiness, input delivery and authority remain unqualified; the Agent
did not switch modes, type or Send. The VM connection supplied the result
directly; its temporary diagnostic context was closed after the two captures.
The approved SSH master remains available. Raw captures and unrelated
visible account/history material were not saved in local records or tracked
files. Human permission/onboarding setup remains explicitly attributed.

## Host-authorized Chat preparation

The subsequent [host-authority bridge](HOST-AUTHORITY.md) parameterizes the
published guest-CUA transport and binds it to canonical host claims. It keeps
all authority files on the host, starts no model turn and supplies no arbitrary
tool, code, typing, keypress or Send interface. This is a separate entry point;
`controller-link.mjs` remains a stored-result reader with no action methods.

Actual setup reached an empty Chat with two reviewed native pairs. The then-observed
Claude UI required explicit inner Chat selection in the shared Chat/Cowork
surface; the URL alone was insufficient. The later parameterized entry-point
check retained an incomplete report when its second capture expired. Both
owned temporary tool contexts were closed; the approved SSH master remains.
See [dated findings](AGENT-QUALIFICATION.md#host-authority-and-guest-chat-readiness-2026-10-23)
for the separate results and limits. Full no-Send input/cleanup and independent
host use remain unqualified.

## Later restore/reconnect check

The initial [actual restore qualification](RESTORE-QUALIFICATION.md) observed a cold
baseline rollback, byte-identical selected host authority files, rejection of a
finished consumed case and a fresh pinned SSH connection. The restored Claude
surface differed and ordinary Chat readiness was rejected as ambiguous. The
active in-flight native recovery path was not qualified by that attempt. The configured
source guest is preserved, and the ignored default connection now selects the
verified restored test clone. Historical findings above remain unchanged.

The subsequent merged no-Send readiness and active focus-only cold-restore
check now have separate bounded live findings in the restore guide. Fresh
connection identity did not inherit readiness: the old generation was rejected,
fresh native material was required, and the consumed focus could not replay.
The original deadline remained. This stored-task reader remains read-only;
it supplies no native control or Agent-execution qualification by itself.
