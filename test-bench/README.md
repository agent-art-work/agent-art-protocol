# Reading interoperability test bench

A local development instrument for Lab reading through Claude desktop and the
Codex desktop URL handler. Browser checks and real-client observations have
separate reports and provenance. This is not a visitor-side helper or a new
protocol requirement. THOUGHT and artwork return paths remain deferred.

The bench imports the installed private **0.1.4 local candidate**, selected by
[sdk-candidate.json](sdk-candidate.json). It does not use a replacement component.
The historical 0.1.2 and 0.1.3 packages and findings remain preserved. Its public invitation is
copied exactly from the Lab's pinned canonical source, without adding a case
ID, a question, a callback URL or instructions to an Agent to report back.

The bench is a developer test page, not another public reading application or
a service between a site and its visitor's Agent. The component at its top is
the installed SDK under test. The two result tables below distinguish what
the browser requested from what was actually observed or reported in a desktop
client. A run is one local test record tied to exact package/context pins;
**New run** starts a fresh record, not an Agent conversation. **Download local
run JSON** exports that record and its summary, not an Agent transcript.

The [0.1.3 design](../spec/0.1/COMPONENT.md#quiet-field-default-in-the-013-local-candidate)
replaced the default presentation with Quiet field. The current
[0.1.4 candidate](../spec/0.1/COMPONENT.md#action-and-copy-feedback-in-the-014-local-candidate)
retains it and refines action glyphs and inline Copy feedback. It has its own
archive, explicit input pins, matching consumer lock and
[qualification](../pilot/reading-sdk-014/README.md).
Earlier green tests or desktop observations cannot be relabeled as results for
that candidate. An older running bench keeps the inputs loaded at startup;
use a fresh run on a newly started candidate bench instead of reusing an old
run fragment.

## Declarative local reading profiles

The candidate [profile adapter](READING-PROFILES.md) runs Lab and a second
public Inshell reading fixture through the existing installed SDK, server,
browser checker and report schema. Both browser matrices passed 11 scenarios;
native launches were canceled. This checks local reuse, not an Inshell site
integration or real-client qualification. A developer does not need a VM for
these checks. The dedicated guest-native automation remains Lab-specific.

## Current real-client result

Three explicitly authorized fresh Lab → Claude desktop cases have finished.
Each used exactly one Send and recorded matching submitted rendering plus a
completed collection introduction, without human window rescue, manual Send
or result relaying. The same 15 pinned runner/input files remained unchanged.
Case 2 inspected the actual raw-index HTTP403/CONNECT403 denial and passed the
runner with source failure recorded. Cases 1 and 3 could not inspect source
activity because their native summary titles were unsupported; source access
remains unobserved. The three-consecutive-pass gate and full MVP have **not
passed**. All three submission permissions are consumed; no further live test
is authorized. SDK 0.1.4 and the Codex draft remain unchanged; no deployment.
See [three-case findings](AGENT-QUALIFICATION.md#three-authorized-fixed-code-lab-cases-2026-10-24) and the
[bounded report](results/2026-10-24-lab-three-case.json). Browser matrices and
synthetic guards remain separate from those real-client findings.

## Start

```sh
npm run sdk:prepare
npm run bench
```

Open `http://127.0.0.1:4180/?lane=browser`. Use `-- --port 4181` to choose a
different port. An occupied port is reported; no existing process is stopped.

- **Browser checks** cancel native links before OS launch. Copy remains the
  real SDK action when used interactively.
- **Desktop trial** enables ordinary explicit native clicks. Review the
  destination and draft in the app, then send there when testing continuation.
  No automatic Send, app-mode setting, permission change or retry is supplied.
- Both views share a run through its URL fragment. Refreshing the page retains
  that run. **New run** starts an empty record with the current pinned inputs.

This server binds only to loopback. Same-origin APIs and an in-memory write
capability protect the local observation endpoints; ordinary top-level page
navigation remains possible. These are development safeguards under trust in
the machine owner, not remote authentication or an independent witness.

## Agent-operated desktop runner

The [guest controller connection](CONTROLLER-CONNECTION.md) reads the selected
guest task's stored status, final replies and report paths over SSH and the
documented app-server API. It removes manual result relaying; it does not
start a model turn, operate the controller UI or qualify native Computer Use.
Use `npm run bench:controller -- status` or `read` with the prepared ignored
connection profile. This maintainer helper is separate from the SDK.

The separate [host-authority/native-CUA bridge](HOST-AUTHORITY.md) now keeps
canonical setup claims on the host and operates the published native tool
inside the guest. One actual bounded setup reached empty Claude Chat with two
fresh reviewed readiness pairs. A later parameterized-script recheck finished
incomplete after its second capture expired; it performed no setup input.
Neither setup result qualifies marker input or a Lab submission. The separate
[remote marker adapter](REMOTE-MARKER.md) now has an actual bounded guest pass
for focus, exact public typing/cleanup and sequential owned-surface input
non-interference. The stored-task reader remains read-only.

The later [restore follow-up](RESTORE-QUALIFICATION.md#merged-conversation-and-active-case-follow-up-2026-10-23)
passed explicit merged-conversation no-Send readiness and a bounded active-case
pause/cold-restore/reconciliation audit. The consumed focus could not replay;
its original deadline was retained. This is separate from the full marker and
application gates. A later separate
[draft-only case](DRAFT-HANDOFF.md) passed on 2026-10-24: native regular Chrome
156.0.8078.47 control, one actual Lab component handoff, one covered launch
confirmation and an unsent public draft in merged Claude 3.6556.2. Its named
paragraph presentation matched; exact exposed text did not. Two owned browser
tabs were closed and the draft was retained unsent. The extension-backed
browser adapter independently failed for missing `session_id`/`turn_id`
metadata; native success does not qualify that adapter. See the
[actual staged result](AGENT-QUALIFICATION.md#guest-chrome-and-lab-draft-only-handoff-2026-10-24).
No Claude Send follows from any of these results.

The [no-Send diagnostic and external authority guide](NO-SEND.md) describes
the separate zero-handoff/zero-Send workflow, initial persistent-store binding,
crash recovery and remaining VM qualification. New cases require external
authority storage; workspace-local historical cases remain read-only.

The [agreed MVP scope](MVP-SCOPE.md) is a reusable runner toolkit plus one
dedicated maintainer environment, initially Lab → Claude desktop Chat. The
completed phase is no-Send feasibility through native guest control, bounded
marker/cleanup, orderly active-case cold restore and the later draft-only Lab
handoff. These are distinct bounded results, not general environment
reliability. A separately authorized
[one-Send application trial](AGENT-QUALIFICATION.md#guest-lab-one-send-application-trial-2026-10-24)
then recorded a visible submitted-message transition, completed reply and an
actual curl access denial. Split text/link presentation left the exact submitted
invitation unconfirmed, and a successful WebFetch body was not exposed; source
success remains assistant-reported. Its strict result is incomplete. The next
target is offline submitted-message extraction and source-adapter inspectability
before a separately authorized retest. No further live trial is authorized;
the three-case MVP remains unqualified.
Controlling the VM viewer from the host cannot substitute for guest CUA.
SDK 0.1.4 stays unchanged and the Codex draft remains untouched and unsent.

Developers can later reuse browser checks and an optional reserved local
desktop path without installing a VM. They bring their coding Agent,
permitted Computer Use, clients and access. A thin app profile is planned;
today's runner is Lab-specific. No hosted testing service, remote preview
tunnel, queue or multi-tenant platform is supplied by this bench. The
draft-only check temporarily forwarded only the public host-loopback fixture
to guest loopback; that forward has been removed. Canonical authority stayed
on the host, with no guest authority replica or mount.

The [Agent runner guide](AGENT-RUNNER.md) describes the coding-Agent flow for
one fresh Claude Chat handoff, separate exact and opt-in pinned presentation
comparisons, at most one
authorized Send and separate source-access/completion findings. Its
Agent-facing session combines fresh captures, the durable Send guard, the
actual permitted CUA click and automatic records. The CLI retains case/journal
state. The Agent supplies its permitted Claude handle and selects actual owned
UI evidence; the operator does not fill in the observation form for this path.

The [execution contract](EXECUTION-CONTRACT.md) requires declared owned targets,
one controller, exclusive input, fresh Agent-reviewed AX/pixel agreement and
current qualification before consequential actions. The code binds and checks
controller attestations; it cannot independently prove visual agreement or
input isolation. Interruptions require requalification, preserve consumed
attempts and keep human assistance visible. This contract is implemented for
local qualification, not yet qualified as a reliable live desktop environment.

This requires a coding Agent and permitted app access; it is not an unattended
shell command or a visitor-side helper. The runner excludes ChatGPT/Codex
desktop control, preserves the SDK inputs and does not retry an uncertain
Send. Its synthetic tests, actual browser checks and real-client observations
remain distinct. A live trial needs its own attributed result and cleanup
record; earlier qualification does not qualify this runner.

The [2026-10-22 findings](AGENT-QUALIFICATION.md) include one completed
Agent-operated interaction under the Lab presentation policy. Sending and a
finished introduction were observed; exact submitted text and source access
remain unestablished. This is a bounded local result, not qualification of an
unattended runner or every desktop client.

## The two result lanes

| Lane | What is checked or recorded | Boundary |
| --- | --- | --- |
| Browser | Exact retained invitation, decoded native payloads, Copy/fallback, canceled navigation, layout and installed package pins | Does not establish desktop arrival, sending, retrieval or visible completion |
| Real client | Draft arrival, actual surface, exact public-draft comparison when available, sending, permission, source access and visible orientation | Attributed UI observations or operator reports; no independent model-origin or private-intention proof |

```sh
npm run test:bench
npm run bench:browser
npm run bench:report -- .local/test-bench/runs/<run-id>.json
```

`test:bench` uses synthetic declarations and disposable loopback fixtures. It
does not invoke an Agent. The repository's `npm test` includes these tests.

`bench:browser` verifies regular stable Chrome's bundle before launching an
owned disposable profile. The Quiet field browser cases cover desktop
light/dark, 320px light/dark, 390px dark and signal-only/independent public
color overrides. The 0.1.4 checks also inspect the stable-width **Copied**
state, name-only underlines, coherent Copy glyph, three-second reset, repeated
Copy attempts, denied clipboard fallback and cleanup on destroy. Both Copy
states must fit the recorded 257px container in a 320px viewport; wider
site-preview fit does not substitute for that check. The suite also checks
runtime radius changes, reused DOM behavior fixtures and observer teardown.
The historical 0.1.2 selection retains its
original four viewport cases. Native clicks have a second cancellation guard, and clipboard
success/denial is isolated from the OS clipboard. External requests are
blocked. Its report and screenshots go into a new ignored
`.local/test-bench/browser/<timestamp>/` directory. `-- --output <directory>`
selects a destination explicitly. Each report says `realClientResults: not-run`;
successful browser tests never populate desktop results. Screenshot inspection
is a separately recorded human/agent activity.

The [initial qualification](QUALIFICATION.md) preserves the 0.1.2 failure at
320px. The preserved [0.1.3 qualification](../pilot/reading-sdk-013/README.md)
records its own fit results. The 0.1.4 candidate must check both ready and
copied states under default system fonts; neither a prior pass nor a failed
preliminary archive is relabeled as this archive's result. Explicit
`packagePin: null` in the input
loader selects the historical 0.1.2 package and qualification.

## Real-client procedure

1. Enter **Desktop trial** with one known run. Inspect **Build, source and
   environment**. The bench records installed macOS/browser/app bundle versions;
   it does not claim those identify a model, runtime policy or account.
2. Choose Claude or ChatGPT once. The ChatGPT label requests `codex://new`;
   record the destination actually observed, including Work or Codex. Accepting
   a browser open prompt is distinct from draft arrival.
3. Inspect only the new test composer. Record draft arrival separately from
   exact-text equality. The optional public-draft comparison hashes text locally,
   clears the text, and stores only a matching digest when the operator appends
   that observation. The recorded method is `operator-pasted-text-sha256`;
   textarea line endings may be normalized. It cannot authenticate where pasted
   text came from or prove raw composer/transport bytes.
4. When testing continuation, review and send once in the app. Use its normal
   permissions. Record denied/expired approval, access failures and unavailable
   results explicitly. The bench does not replay an uncertain operation.
5. Inspect index access and the visible orientation independently. A tool's
   processed representation, raw response bytes, an Agent's own retrieval claim
   and complete document reading are different observations. The canonical
   no-question invitation asks for an introduction, not a whole-corpus download.
6. Append results using the form and download the local record if needed. App
   inspection restrictions leave direct observations unavailable; an operator
   report retains that source class. Manual Copy into an existing conversation
   is a separate chosen path, not automatic conversation attachment.

The form offers operator reports. A desktop UI observer can append scoped
`desktop-ui` observations through the same validated local API. Browser
automation cannot claim real-client facts. Positive real-client observations
require pinned OS/app versions, the actual destination and a named method.

Results retain `requested`, `observed`, `operator-reported`, `failed`,
`not-observed` or `not-run` for individual claims. Contradictory declarations
remain in the record and produce a `mixed` summary. No all-client success,
genuineness, Agent authorship or intention flag is produced.

## Public pins and private local records

[lab-work.json](lab-work.json) reproduces the public Work from Lab commit
`225d09591ae6ba012176f1cc002738e9d6fef11f`.
[lab-source.json](lab-source.json) records its public source path, source/Work
digests, exact invitation digest/byte count and SDK archive pin. The Work's
reference index remains live; pinning the invitation does not pin fetched index
bytes. Loading the bench performs no source acquisition or inference.

`loadBenchInputs()` checks the archive, all 11 installed SDK files and dependency
lock, then asks the installed SDK to retain that exact Work. A changed SDK or
Lab invitation requires explicit source/pin updates and new checks. A stale
tab or previously opened client draft is not refreshed by updating these files.

Run files are private local JSON in ignored `.local/test-bench/runs/`. Each
pins the inputs and environment and appends bounded observations. Downloaded
JSON includes the run and its summary; `bench:report` accepts either that
download or a stored run. Validation establishes structural consistency and
scope, under trust in the named observer and local operator. An operator can
fabricate or edit a coherent record. These are bench records, not SDK receipts.

No private conversation IDs, account identifiers, transcript or answers are
collected automatically. Notes are optional, limited to 240 characters and
must contain only public test facts. Draft comparison text stays in the browser
and is discarded. Screenshots from automated browser checks contain only the
public local bench. Review any additional evidence before sharing it.

The server has no Agent callback, model API, document-fetch service, enrollment
or persistent browser storage. Local files remain until the machine owner
deletes them; no background retention service is added to public reading sites.

## Later restore/reconnect check

The [actual restore qualification](RESTORE-QUALIFICATION.md) observed a cold
baseline rollback, byte-identical selected host authority files, rejection of a
finished consumed case and a fresh pinned SSH connection. The restored Claude
surface differed and ordinary Chat readiness was rejected as ambiguous. The
initial attempt did not qualify active in-flight recovery. The configured
source guest is preserved, and the ignored default connection now selects the
verified restored test clone. Historical findings above remain unchanged.

The [subsequent bounded follow-up](RESTORE-QUALIFICATION.md#merged-conversation-and-active-case-follow-up-2026-10-23)
qualified orderly active-case pause/cold-restore/reconciliation and consumed
focus refusal. It did not qualify arbitrary crashes or Send recovery. The
later [draft-only handoff result](DRAFT-HANDOFF.md) is another separate case;
neither result rewrites the initial ambiguous-target rejection.
