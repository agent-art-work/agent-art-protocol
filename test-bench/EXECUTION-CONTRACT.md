# Desktop runner execution contract

Status: **candidate local bench contract, 2026-10-22**. This governs the
Agent-operated Lab → Claude desktop Chat test. It does not change SDK 0.1.4,
public reading requirements or the generic Agent Art protocol. Implementing
guards and passing synthetic checks do not qualify a live desktop path. See
[standing plan](AGENT-RUNNER.md), [agreed MVP scope](MVP-SCOPE.md) and
[dated findings](AGENT-QUALIFICATION.md).

## Dedicated environment feasibility scope

The current authorized phase is the dedicated environment's **no-Send**
feasibility check. Installation and VM boot establish prerequisites only. The
permitted controller must operate inside the guest and inspect guest-local
Claude; a host controller clicking a VM viewer or running a guest shell does
not establish that route. Guest login, protected authentication and OS/tool
permission grants remain explicit setup boundaries.

After the guest controller and owned fresh empty Chat are established, this
phase permits a public diagnostic marker to be typed, observed and cleared,
with fresh agreement between accessibility and pixels and a separately
assessed host/guest input boundary. It permits no Lab activation, Send or
inference in Claude under test. The coding Agent may operate its permitted
controller within this scope. The normal Send-authorized case builder below
must not be used to expand this narrower scope.
The [dedicated diagnostic](NO-SEND.md) implements that separate zero-handoff,
zero-Send authority; its CUA session exposes bounded composer input and effect
inspection, with no launch or submit method.

Readiness and interruption rules still apply. Durable case authority and
consumed attempts must survive guest restart and baseline restoration outside
disposable guest state; a restored image cannot renew an attempt. The external
store candidate and filesystem/crash fixtures now implement that separation
for their tested arrangement. Actual VM restore and host-mounted placement
remain unqualified, not an OS guarantee.
Developer-local reuse may reserve the whole Claude app instead of requiring
a VM, but cannot claim simultaneous personal use of that same instance.

## Minimum operating boundary

The environment must support dependable targeting and observation. The coding
Agent executes within the human's bounded authorization. The human supplies
protected access and resolves exceptions. A failed application test is a valid
result; uncertain execution remains uncertain.

| Environment requirement | Acceptance before consequential action | What remains trusted |
| --- | --- | --- |
| Identifiable targets | Declared client/browser configuration; an owned test tab, Claude window and fresh conversation binding | The controller's ownership attribution and the exposed application identity; a title match alone is insufficient |
| Controlled surfaces | One named controller; no competing human or software input across the target scope; the current bundle-targeted Claude interface requires app-wide reservation | The controller's observation of input isolation; the runner cannot lock other software out |
| Dependable observation | A complete fresh capture of the intended target; Agent-reviewed agreement between AX and pixels | OS/control-interface observations and the Agent's visual review; a Boolean does not independently prove pixel agreement |
| Accounted actions | Current readiness, exact scope and durable attempt reservation before dispatch; effect checked separately afterward | A control API return does not establish input delivery, application acceptance or model execution |
| Bounded recovery | Fixed deadline and one launch/one Send budget; interruptions invalidate current qualification | The local clock, journal and machine owner; uncertain Send consumes its attempt |
| Reviewable results | Separate bounded findings, trust limits, assistance, interruptions and cleanup | Local records can be fabricated by their owner; hashes provide bindings, not an independent witness |

The only lane selected here is the unchanged pinned public Lab invitation,
regular stable Chrome (`com.google.Chrome`) and Claude desktop
(`com.anthropic.claudefordesktop`) in Chat. Chrome Beta and ChatGPT/Codex desktop
control are excluded. Other clients, a different payload, private data,
configuration changes, THOUGHT and deployment need separate scope decisions.

Readiness is temporary. A qualified environment does not guarantee that Claude
will accept Send, access a source or return the expected introduction. Those
are individual observed results. Source denial can be an inspected application
outcome without establishing successful reading.

The present native interface binds Claude by application bundle and exposes no
stable native window identifier. Reserving only the test conversation is
insufficient if a human or another controller can change Claude's other modes
or windows. Reserve the whole app for the check and identify the owned surface
again from each current observation. The logical window identifier recorded
by the adapter is controller attribution, not independent native identity.
For normal runner use, provide a dedicated interactive test session/environment
whose reservation is established during setup. Repeated manual pauses and
window rescue are development scaffolding, not the intended operating flow.
Releasing that reservation ends the scope of its readiness assessment. A
historical pass cannot authorize later input or supply a fresh execution proof;
the next run needs a new reserved interval and current owned observations.

## Authority and human participation

One run authorization covers the expected steps of one fresh conversation:
inspect owned surfaces, activate the actual Lab component once, resolve a
covered external-app launch confirmation, compare the public draft, attempt
Send at most once, inspect source/reply results and perform bounded cleanup.
The deadline and attempt guards apply even when an action appears ineffective.
A command flag records authorization; it does not obtain it.

Within that authorized scope, normal navigation, preparation and cleanup of
verified owned disposable test surfaces do not require a new permission or
"Ready" response for each window. Check ownership and current state through
the permitted controls; ask the human only for protected access, new authority
or an exception that safe Agent inspection cannot resolve. A no-Send inspection
retains its narrower authority and does not inherit the trial's Send budget.

| Stage | Coding Agent | Human |
| --- | --- | --- |
| Commission | Pin destination, public payload, actions, budget, deadline and acceptance conditions | Authorize that concrete scope |
| Setup | Check permitted controls and report missing prerequisites | Unlock, sign in, complete protected authentication and grant needed access |
| Normal execution | Operate the owned test surfaces and record results automatically | No routine participation required |
| Unexpected authority or access | Stop the dependent action; identify the missing prerequisite | Grant or decline the specific new authority |
| Target/view conflict or interference | Stop consequential actions; preserve attempts and record the interruption | Restore the environment if safe Agent inspection cannot resolve it |
| Uncertain Send | Inspect without resending; retain uncertainty | Decide whether a separately bounded future run is warranted |
| Changed destination/payload/budget | Explain the change without performing it | Authorize the new scope |

The Agent cannot widen its permissions, change security/account/model settings,
inspect unrelated conversations or substitute another execution path merely to
make the test pass. The contract records controller identity and approved
scope; it does not acquire access or enforce OS privileges itself.

Human setup before readiness is compatible with an Agent-operated test.
Unexpected human action during execution is **assistance**, including finding a
lost target, pressing Send or supplying otherwise unavailable observations.
Record its bounded kind, actor and phase. Assistance cannot disappear after a
successful resumption, and an assisted run cannot qualify as unassisted.
Expected launch confirmation performed by the authorized Agent does not itself
make the run assisted. No prompt appearing proves neither permission nor its
absence.

No-Send diagnostics retain their explicitly authorized actions. A separately
authorized public typing probe does not authorize sending it, and cleanup is
limited to the verified owned diagnostic content. A returned Escape or typing
call does not establish focus restoration or input delivery; inspect a fresh
corresponding effect separately. If pixels and AX identify different targets,
or the intended main AX surface is unavailable, stop input and cleanup. Do not
replace missing observation with another human "Ready", an older capture or
an assumed window binding. The [focus recovery phase](composer-recovery.mjs)
does not type, clear or Send and supplies no new authority.

The 2026-10-22 controlled no-Send repeat passed focus, public typing and cleanup
checks after the operator paused other Claude use. That pause was human
development setup; the result does not qualify simultaneous personal and
runner use of Claude or prove that the native provider has been repaired.
See the [dated controlled findings](AGENT-QUALIFICATION.md#controlled-native-target-repeat-with-app-wide-reservation-2026-10-22).

## Qualification, interruption and resumption

A new case starts unqualified. Its controller assesses the declared lane,
permitted controls, account/device readiness, ownership, input isolation,
observation agreement and bounded authorization. Qualification is a recorded
controller attestation checked against fixed requirements, not a claim that
software independently proved the environment safe or reliable.

Each qualification belongs to a generation. Before launch, Send dispatch and
positive desktop findings, the controller supplies a fresh observation proof
for the same case, controller and generation. It must establish the intended
owned target and reviewed AX/pixel agreement. UI readiness/composer checks
remain separate and must pass from their own corresponding fresh capture.
Changing a timestamp or reusing an old capture cannot renew readiness.

Record an interruption when ownership becomes uncertain, views disagree,
competing input is observed, the device locks, access is lost or unexpected
human assistance is required. It invalidates qualification; old capture proofs
cannot be reused. Resumption records restoration, advances the generation and
requires a fresh assessment plus stage-appropriate readiness. It does not
restore a consumed launch or Send attempt, replace the public context, extend
the action budget, extend the fixed deadline or reopen a finished case. An uncertain Send remains
possibly attempted after recovery. A new case requires new authorization.

Deadline guards reject further actions; they are not an automatic watchdog.
After a controller crash, recovery must inspect the persisted case/journal and
explicitly finish the report. Missing finalization does not erase an attempt.

If the control interface cannot establish the target and resulting effect,
finish with that limitation. Do not accumulate retries or label an
operator-assisted observation as Agent-observed. Observed browser requests,
launch acceptance, draft arrival, dispatch entry/return, sent transition,
source access and reply completion remain separate findings.

## Local interfaces

The durable APIs live in [desktop-runner.mjs](desktop-runner.mjs):
`qualifyCase()` records the assessment, `assertExecutionReady()` reads the
current qualified contract/generation, `recordExecutionInterruption()`
invalidates it and `resumeExecution()` records restoration without restoring
attempts. `recordExecutionCleanup()` records actual owned-surface dispositions
before finish; it does not close tabs or clear drafts. Recording cleanup is
terminal for qualification, native actions and positive observations; read and
finish remain available. The pure [execution-contract.mjs](execution-contract.mjs) checks
`qualifyExecution()` and `inspectExecution()` inputs and emits bounded
controller-attributed proofs. The [controller guide](AGENT-RUNNER.md#agent-facing-cua-session)
shows their integration with `createDesktopSession()`; these APIs do not
provide an autonomous desktop driver or obtain permission themselves.

[External authority storage](authority-store.mjs) keeps new cases, journals,
attempt claims, canonical reading records and reports outside the disposable
workspace. Unavailable or replaced authority blocks actions. A recovered
workspace never supplies authoritative case/claim data. `reconcileCase()` and
`reconcileDiagnostic()` read external state, retain deadlines, consumed
attempts and terminal status, and require fresh qualification. Explicit
stopped-controller/exclusive-input attestations are required before abandoning
a stale writer lock; the code does not establish OS exclusion. Store placement,
filesystem durability and the authority owner remain trust dependencies.

For a model that must inspect returned pixels between tool calls, the preferred
session separates completed actions: `raiseForReview()` awaits Raise only,
then the Agent obtains and reviews a fresh paired AX/pixel capture through
the actual `getAXStateAndScreenshot()` API;
`submitReviewed()` validates that capture and completes claim/awaited click
in one call. An in-memory ticket binds the phases to the same session and
current qualification. The post-Raise capture has a distinct ID, the same
window/generation, a timestamp at or after Raise returned and a fixed
thirty-second freshness bound. No pending mutation crosses the review boundary.
A lost/stale ticket, stale capture or changed view cannot authorize Send.
The callback `submit()` is reserved for controllers actually able to provide
fresh reviewed captures during its invocation. These interfaces supply no
automatic visual judgment and no new live qualification.

A paired result from that API is not an established guarantee that AX and
pixels were acquired atomically from one native surface. Review their actual
correspondence; disagreement invalidates readiness even if a logical window
label or capture identifier matches. Separately acquired observations must
also retain their distinct acquisition boundaries.

## Completion and retained evidence

The first unassisted live acceptance condition is one owned fresh conversation,
verified public context, at most one runner Send dispatch, observed submission
and response, and separate source-access findings, with no human rescue from
readiness through result. This has **not** been established by implementing
this contract. Earlier completed and incomplete reports retain their original
qualifications and are not retrofitted.

The report must expose qualification status, controller-attributed trust,
assistance/interruption history, stage findings and cleanup disposition.
Close only known-owned test tabs/windows no longer needed. Clear an unsent
public draft only when its ownership is certain; preserve submitted public test
conversations when review is needed. Leave user/uncertain surfaces and private
drafts alone. Record retained or blocked cleanup explicitly.

Keep input pins, fixed finding codes, timestamps, bounded scope identifiers,
digests and selected observation references. Keep credentials, account details,
private conversation URLs/IDs, private transcripts, unrelated content and raw
AX captures out of persisted records. The OS, control interface, exposed app
state, controller interpretation and local record owner remain trust
boundaries. At most one runner dispatch is enforceable here; exactly-once
application delivery, model authorship and private intention are not.
