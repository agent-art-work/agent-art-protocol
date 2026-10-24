# Agent-operated desktop reading runner

This runner lets a coding Agent exercise the real reading handoff and append
bounded results without asking an operator to fill in the bench's observation
form. It is a local development instrument, separate from the SDK and public
reading component.

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
See [three-case findings](AGENT-QUALIFICATION.md#three-authorized-fixed-code-lab-cases-2026-10-24).

It requires a coding Agent with permitted **Computer Use through CUA**, regular
stable Chrome and access to Claude desktop. The CLI manages pinned inputs,
durable run state and records. The [execution contract](EXECUTION-CONTRACT.md)
defines environment prerequisites, controller authority and human intervention.
The Agent-facing session joins those guards, observed UI checks, the one-Send
guard, actual CUA click and recording. The Agent supplies the
permitted CUA handle and fresh captures; no desktop driver is embedded in the CLI.
Running one shell command alone does not establish a completed desktop trial.

## Development target and standing plan

This guide is the runner's working plan as well as its operating procedure.
The [agreed MVP scope](MVP-SCOPE.md) separates our dedicated environment from
local developer reuse and names the completion conditions and exclusions.
Review it, this section and the [dated findings](AGENT-QUALIFICATION.md) at the
start of every runner development slice. Keep the implementation, immediate
next step and completion claim aligned with that plan; update it when the
operator changes the target or a checked result changes what remains.

| Role | Responsibility |
| --- | --- |
| Human developer | Commissions the test, authorizes its scope and submission, supplies required account/device access and reviews the findings |
| Developer's coding Agent | Operates permitted browser/native controls, identifies owned fresh test UI, interprets the observations and uses the runner to record them |
| Runner | Checks pinned inputs, validates bounded observations, enforces durable attempt guards and produces the local report |
| Claude desktop | Real Agent client under test; receives the public invitation and, after a permitted Send, attempts the reading task |

The MVP target is **one dedicated maintainer environment qualifying Lab
reading through Claude desktop Chat, plus reusable local developer tooling**.
An integrating developer need not install a VM. The coding Agent should
perform the interaction and recording; the human should not have to submit
the invitation or fill in an observation form. Required unlock, sign-in,
launch or tool permissions remain normal
environment boundaries. The runner is separate from the production SDK and
component; site visitors do not install or invoke it.

The earlier completed phase is **dedicated environment no-Send handoff and
draft qualification**. One case on 2026-10-24 passed native regular Chrome
control, the actual Lab component handoff, launch confirmation and an unsent
public draft under the explicit Lab presentation policy. Exact exposed text
did not match. The later one-Send trial below does not amend that completed
no-Send case. The full MVP has not passed.
Host-owned setup, marker/cleanup/input checks, merged-surface readiness and
active-case cold-restore findings remain separate earlier results. See
[draft-only procedure](DRAFT-HANDOFF.md),
[draft-only dated result](AGENT-QUALIFICATION.md#guest-chrome-and-lab-draft-only-handoff-2026-10-24),
[host authority and guest-native readiness](HOST-AUTHORITY.md) for the reusable
entry point and [dated results](AGENT-QUALIFICATION.md#host-authority-and-guest-chat-readiness-2026-10-23)
for evidence and limits.

Canonical state/claims now stay on the host-native external store. The approved
SSH/app-server connection carries documented guest CUA; the guest never reads
or writes an authority replica. Native UI execution remains inside the guest.
This supersedes the initial coding-Agent-inside-guest placement requirement;
host viewer automation and SSH alone still cannot qualify native control.
The stale shared authority mount remains unavailable and unqualified. The
draft-only slice forwarded the public host-loopback fixture only to guest
loopback; that forward is now removed. It exposed no authority replica or
mount. No reverse authority service, public listener or new desktop driver
was added.

The actual setup used two host-claimed mode actions and then two distinct fresh
reviewed native pairs to establish an empty Chat composer. Claude's shared
Chat/Cowork umbrella initially restored Cowork, so the explicit named profile
requires inner Chat selected and Cowork unselected. `/new` alone is insufficient.
A later recheck of the parameterized entry point accepted one readiness capture,
then rejected an expired second capture and finished incomplete with no setup
input. Preserve both results; no stale observation or historical pass authorizes
future input. The setup lane retains zero typing, keypress, clearing, handoff and Send
operations. The separately authorized marker lane below supplies its own
limited focus/type/clear contract.

**Marker slice acceptance (now observed):** connect the existing bounded no-Send marker guards to the
host-owned authority arrangement, then qualify guest composer focus, exact
public-marker delivery, bounded cleanup and input independence while host apps
remain usable. Use fresh current ownership/readiness and separate observed
effects after each action. No such input was performed in the setup slice.
At that marker milestone, actual guest restore/reconnect was still unqualified;
the follow-up below supplies a separate bounded live result. Filesystem/crash
fixtures are not a VM restore test. No Lab trial or inference follows without
its own later scope. SDK 0.1.4 stays unchanged, the host Codex draft remains
untouched and unsent, and no deployment/publication follows.

The operator has now authorized that marker/independence slice. The new
`remote-marker.mjs` adapter reuses the existing no-Send session on the host;
`vm-cua-bridge.py --authorize-probe` carries only its claimed focus/type/clear
calls to guest-native CUA. A disposable owned host Chrome textarea and a
separate single-use public host typing claim support a bounded check in both
directions. Acceptance requires fresh reviewed focus, exact guest marker,
unchanged host input after guest typing, unchanged guest marker after host
typing, exact-marker-only cleanup and unchanged host input after cleanup.
The [remote marker guide](REMOTE-MARKER.md) records the actual passing bounded
case, explicit 60-second no-Send profile and declared 30-minute case budget.
Earlier capture-expiry failures and the expired 15-minute case remain failed.
Code/fixture checks alone cannot pass that live gate. Preserve any incomplete
case without repeating its consumed action; no setup or Send budget is added.

**Initial restore slice result:** actual cold baseline rollback preserved selected host
files and a consumed finished-case claim. Fresh SSH reconnect was checked.
The restored Claude surface differed and was rejected as ambiguous, so that
attempt did not qualify active in-flight recovery. See [restore findings](RESTORE-QUALIFICATION.md).

**Follow-up restore result, 2026-10-23:** Anthropic documents a gradual merger of
Chat and Cowork with no separate mode selector. This is consistent with the
observed restored UI; account rollout state is not independently attested.
The opt-in `claude-unified-no-send-v1` profile positively identifies that surface
for no-Send checks only. Two fresh reviewed native pairs passed before restore;
a separate one-focus case then paused, underwent an actual cold baseline clone,
and reconnected. Old qualification was rejected; fresh restored empty readiness
passed. The host refused replay of the consumed focus claim before its native
callback, retaining the original contract and deadline. One native focus click
occurred before restore; zero input followed restore. The general marker report
remains indeterminate, separate from the bounded recovery safety finding.

**Draft-only result, 2026-10-24:** case
`reading-draft-afe8a5ce-53e0-4135-8c13-a5176e1b4d9f` passed the separate
`lab-unified-draft-nosend-v1` contract. Native CUA observed regular Chrome
156.0.8078.47, a trusted canceled browser probe, one trusted uncanceled desktop
component activation and one `Open Claude?` confirmation with persistent
permission unchecked. Claude 3.6556.2 changed from an empty owned merged
conversation to the unsent public Lab draft. Exact comparison failed;
`lab-claude-ax-paragraphs-v1` matched (983 to 979 bytes, eight to four newlines).
No Claude typing, keys, clearing, Send or model turn occurred. Both owned tabs
were closed with a post-close view showing only the original New Tab; the
Claude draft was retained unsent and the host Codex draft was untouched.
SDK 0.1.4 remained unchanged. The extension-backed browser adapter separately
failed for missing `session_id`/`turn_id` metadata; native Chrome success does
not qualify that adapter.

**Completed application trial, 2026-10-24:** the operator's single submission
was used in case `reading-trial-3007e7a6-f30b-4864-b6b1-791889e4708c` under
the explicit `lab-unified-reading-trial-v3` contract. Its one known-public draft
reset produced observed empty readiness; browser probe, actual handoff, launch
confirmation and named-policy draft arrival passed. One durable Send returned.
The fresh post-Send user-message boundary and empty composer established a
visible transition, but split text/link nodes and flattened whitespace left
the submitted invitation unconfirmed. No comparison policy was relaxed.

A completed collection introduction, access limits and follow-up were observed.
The expanded raw-index request showed CONNECT403/HTTP000/zero bytes/exit56;
that specific denial was recorded under the narrow adjacent tool-content
boundary. An unexposed successful WebFetch body remains assistant-reported.
The canonical report is `reading-interaction-incomplete`, `passed=false` and
`interactionPassed=false`. Source denial and reply completion do not repair
missing submitted-message confirmation. The current case's two owned tabs
were closed and the submitted public conversation retained; an older v1 tab
remains retained after its cleanup capture expired. The bridge/server/fixture
forward are closed; the guest console remains open. See the
[trial guide and report pins](READING-TRIAL.md).

**Current phase: evaluate the recorded repeat gate; no further live actions.**
Three authorized submissions are complete, but two source inspections remain
unobserved because activity-summary matching is too narrow. The next code
slice should model the actual owned activity boundary and rejection cases,
then separately qualify a new frozen candidate if authorized. Do not add
another prose-title exception and claim these old reports passed. Preserve
the fixed 30-second capture age; the controller needed repeated fresh reads
when its own round trips made preflight stale. Environment expansion, new
clients and provider policy changes are outside this target. See [three-case findings](AGENT-QUALIFICATION.md#three-authorized-fixed-code-lab-cases-2026-10-24).

**Continuation commissioned, 2026-10-24:** the operator approved completing the
recommendation: finish the read-only observation adapter, qualify three
consecutive fresh Lab cases, then exercise a second reading fixture through
the same small app profile. Each live case retains its own one-Send claim,
current environment/input bindings and fixed limits. A new opt-in submitted
rendering policy may identify complete ordered static text/link parts without
claiming model-received bytes or changing old comparisons/reports. Preparing
the next conversation may refer to a finished public trial, but must inspect
its complete known public user message and empty composer before New. Freeze
the environment; no provider-internal work, new client, SDK change or deployment.
Success requires separate stage evidence, no human rescue and unchanged runner
inputs across the three-case streak. Source denial stays a tested failure
outcome; unavailable successful-source evidence must remain unverified.
The marker result covers sequential non-interference between
owned host browser-tab input and guest-native Claude; it is not a universal
physical-keyboard or arbitrary-concurrency guarantee. The operator-selected restore slice used disposable clones and preserved
the configured source guest. No further environment expansion is selected.

Earlier boot/provisioning, shared-storage failure, blocked CUA selections,
protected permission repair, welcome-screen partial capture and complete Code
observations retain their original dated findings. One-time human OS grants
and Claude sign-in remain recorded assistance. The current Agent can inspect
and prepare the guest through the connection without per-test Ready, manual
submission or result relaying; protected setup and unexpected new authority
remain human exceptions. The existing stored-task reader is still read-only.

The standing sequence is:

| Phase | Acceptance for this phase | Current boundary |
| --- | --- | --- |
| Environment prerequisites | Host capacity and guest/runtime suitability checked; native tools execute in the guest; access/login/permissions identified | Clone, boot, bundle integrity, runtime and offline inputs checked. One-time protected permission/onboarding setup followed by actual native capture. Security-baseline choice remains separate. Host authority replaces the excluded stale mount; installed browser metadata does not qualify browser control |
| Guest controller and targets | Guest-local stable Chrome and owned fresh Claude conversation have declared versions, complete fresh reviewed AX/pixels and one available controller | Earlier Chat/Cowork and merged readiness results remain separate. The 2026-10-24 draft-only case observed regular Chrome 156.0.8078.47 native CUA and Claude 3.6556.2. The extension-backed browser adapter remains unqualified for missing turn metadata |
| No-Send independence and cleanup | Guest composer focus, exact public marker delivery, bounded clear and empty readiness have observed effects while host apps remain usable; interruption blocks input | One host-authorized guest-native case passed focus, exact type/clear and two-direction owned-surface non-interference under the explicit 60-second profile. Historical failures remain unchanged. No handoff, Send or Claude inference |
| Lab draft-only qualification | Actual canceled browser probe, one component handoff, covered native launch confirmation, fresh draft/policy comparison and owned-tab cleanup; zero Claude input or Send | One 2026-10-24 case passed the distinct draft-only contract. Presentation matched; exact exposed bytes did not. Draft retained unsent, SDK and Codex draft unchanged |
| Full Lab application qualification | One Send attempt, confirmed submitted invitation, source/reply and cleanup produce separate findings; three consecutive fresh cases complete without human rescue | The separate three-case repeat recorded three submitted rendering matches and completed replies. One case inspected a request denial; two source inspections were blocked by unsupported activity titles. Three-pass gate not met; all three Sends consumed. Historical v3 report unchanged |
| Durable reporting and recovery | Stage/provenance/assistance remain explicit; stale/conflicting targets stop actions; consumed attempts survive controller restart and guest baseline restoration | Initial finished-claim retention and ambiguous-target rejection remain unchanged. Follow-up active focus-only case observed cold rollback, retained claim/deadline, old-generation rejection, fresh merged-surface readiness and host replay refusal before native dispatch. Orderly pause was checked; arbitrary crashes, Send and malicious rollback remain unqualified |
| Thin profile and local reuse | A second local reading fixture uses the same small app profile, guards and report format without core changes; browser and real-client results remain distinct | Lab and Inshell declarative fixtures passed the same 11-scenario browser matrix and reuse case/report preparation. Inshell native interaction is not qualified; guest automation remains Lab-specific. Developer-local reuse needs no mandatory VM |

The first qualified lane retains the pinned SDK and public Lab invitation.
Browser checks must pass independently before a later live case; they never
establish desktop arrival. Exact comparison remains strict by default, with
the existing Lab-only presentation policy kept explicitly opt-in. Source
access and reply completion stay separate even if the interaction finishes.
The three-case target is bounded smoke qualification, not universal reliability.

For each slice, identify the target phase, the previous observed blocker and
the smallest change that resolves it. Before declaring completion, check the
relevant rejection/recovery cases, report what was actually exercised and name
the next unmet acceptance condition. Preserve earlier case records and their
original qualification; a code fix does not retroactively pass them.

The implemented candidate uses a narrow, opt-in Lab AX presentation policy,
`lab-claude-ax-paragraphs-v1`: accept exact exposed text or the canonical
invitation with each `\n\n` replaced by `\n`. It is restricted to the pinned
public Lab invitation and current SDK 0.1.4 archive. This is not arbitrary
whitespace cleanup, semantic equivalence or a universal Agent Art text policy.
It does not prove that Claude retained/submitted exact bytes. Exact comparison
remains separate and strict by default. Focused positive/rejection checks and
subsequently authorized live cases are recorded in the dated
findings. Adopting the policy alone supplies no live result or authorization.

The earlier bounded live milestone records arrival, a named-policy draft
comparison, one Send, a visible transition and a completed introduction with
source access explicitly unobserved. Later readiness cases remained incomplete
after a single Send claim, including the actual Raise/recapture case. Those
results and the AX/pixel disagreement remain historical findings; implementing
the execution contract neither fixes them nor upgrades their qualification.

The implemented contract starts new cases unqualified, requires current
generation-bound evidence for consequential actions, invalidates qualification
on interruption, preserves consumed attempts and retains recorded assistance.
The contract implementation's 284-test and focus-repair 301-test baselines
remain historical. The later controlled-repeat slice passed 302 repository
tests, as recorded below; synthetic checks do not qualify the live recovery
path. Only separately authorized live work can assess reliable control and
observation. An inspected source-access failure can be a completed application
outcome; it cannot be presented as successful reading. The one-trial commission
above is consumed and supplies no future live authority.
SDK 0.1.4 stays unchanged. Other clients, THOUGHT, deployment and a published
runner product remain later scope decisions.

### No-Send focus diagnostics

The [focus helper](composer-focus.mjs) preserves the distinction between
exposed composer focus, focus elsewhere, ambiguous metadata and missing focus.
It does not prove keyboard delivery or infer an auxiliary surface's purpose
from a private URL. The [recovery phase](composer-recovery.mjs) permits at most
one Escape per instance after a fresh, empty, owned Chat preflight with reviewed
AX/pixel agreement and positively exposed auxiliary focus. It awaits dispatch,
then requires a distinct fresh reviewed capture of the same attributed target
to inspect restoration. It never types, clears a draft or sends. A successful
Escape return establishes dispatch only.

The manual equivalent Escape and a separately authorized public typing probe
were observed during development; they do not qualify this helper's live path.
Missing main-window AX or disagreement between the observed targets blocks
repeat qualification. A delayed probe appearance is recorded separately from
the immediate empty sample; neither observation can erase the later target
conflict. Additional input or cleanup requires current coherent ownership and
its own applicable authority. See the [dated findings](AGENT-QUALIFICATION.md).

The complete repository suite passed 301 tests with zero failures,
cancellations or skips; the focused slice passed 34. Parser ambiguity checks
reject footer-like payloads and indexed nodes after a focus footer. One
supported controller-session reset followed by explicit Claude rebinding still
exposed only the app shell. Repeated no-Send qualification rejected the missing
main HTML/composer before any recovery Escape or other input. These are guard
and blocked-environment findings, not a successful live recovery trial.

### Controlled native-target repeat, 2026-10-22

The later [controlled repeat](AGENT-QUALIFICATION.md#controlled-native-target-repeat-with-app-wide-reservation-2026-10-22)
passed the bounded no-Send environment checks after the operator reserved the
whole Claude app. The previously retained exact public marker was cleared and
the empty result observed. A composer click exposed the actual composer as
focused; one public typing probe appeared exactly in both AX and pixels and
was cleared with an observed empty result. A fresh explicit-bundle handle
retained complete empty-Chat readiness. No handoff, Send or model call occurred.
The reservation has ended; that past pass is not current qualification for a
later action. Any future run needs a newly reserved app and fresh observations.

The operator confirmed concurrent Claude use before pausing it. Shared control
is therefore the leading working explanation for the target drift, while the
cause of every earlier mismatch and shell-only AX result remains unproven.
This is a successful controlled repeat, not a patch to native CUA or proof that
concurrent use is reliable. The pause is recorded human development setup.

For the present bundle-targeted native interface, input reservation must cover
the entire Claude app, including other modes and conversations, rather than
only the test Chat. No stable native window identity is exposed here. The
normal runner needs a dedicated interactive test session/environment with this
reservation established during setup, not repeated requests to pause or find
windows. The controller cannot enforce an OS lock or exclude other software.

The repeat also exposed a narrower readiness bug: the unselected Code radio
can have the exact label `Code, awaiting your input`. The helper now accepts
that observed variant while still requiring an enabled radio with value `0`
and the actual Claude radio selected with value `1`. Near matches, wrong roles
and selected Code remain rejected. All 13 readiness tests passed, and the
freshly imported helper passed the owned empty Chat during this live repeat.
This label fix does not establish focus, ownership or native Send delivery.
The complete repository suite subsequently passed 302 tests with zero
failures, cancellations or skips. Synthetic checks remain separate from the
bounded real-client findings.

"Paired" means AX and pixels returned through the documented
`getAXStateAndScreenshot()` API and actually reviewed together. It does not
claim atomic same-target acquisition by the provider. Earlier uses of
"atomic" in the historical account below are not an independently established
provider guarantee; those original observations and their limits remain.

## Agent-facing CUA session

Use [desktop-session.mjs](desktop-session.mjs) for the actual Agent-operated
Claude continuation. The coding Agent obtains the exact permitted Claude App
handle through documented CUA APIs, tracks ownership of the fresh test
conversation and supplies its actual current UI captures. The session does
not acquire app permissions, choose a window or parse arbitrary AX text itself.

Read the [execution contract](EXECUTION-CONTRACT.md) before preparing a case.
Preparation records the authorized scope, but does not qualify the environment.
The controller must attest its permitted interface, pinned configuration,
access, exclusive input and observation capability using `qualifyCase()`. It
then supplies fresh `inspectExecution()` proofs from actual owned captures.
AX/pixel agreement requires an Agent visual review; the code checks that the
attestation is present, current and bound, not that it is true.

The controller records actual verified version metadata in `currentEnvironment`
with the same `{ os, browser, apps }` shape as the bench environment. It must
inspect present controls and access before attesting the remaining fields; do
not copy an earlier qualification or treat this example as evidence:

```js
qualifyCase(caseId, {
  controllerId,
  configuration: currentEnvironment,
  interface: 'cua',
  browserBundleId: 'com.google.Chrome',
  clientBundleId: 'com.anthropic.claudefordesktop',
  permissions: 'ready',
  inputOwnership: 'exclusive',
  observation: 'ax-and-pixels',
});
const session = createDesktopSession({ caseId, app: claudeApp, controllerId });
session.prepareLaunch(emptyOwnedChatSnapshot, {
  ...emptyChatSelection, execution: emptyChatExecutionAssessment,
});
// Activate the owned browser component once; resolve its actual launch prompt.
await session.raiseForReview(arrivalSnapshot, {
  ...arrivalSelection, execution: arrivalExecutionAssessment,
});
// Raise has settled. Obtain a distinct fresh paired AX/pixel capture and review agreement.
await session.submitReviewed(reviewedSnapshot, {
  ...reviewedSelection, execution: reviewedExecutionAssessment,
});
session.confirmSent(postClickSnapshot, {
  scopeIndex, messageIndex, ownedUserMessage: true,
  execution: postClickExecutionAssessment,
});
session.recordResult(resultSnapshot, {
  ...ownedResultSelection, execution: resultExecutionAssessment,
});
recordExecutionCleanup(caseId, cleanupDisposition);
session.finish();
```

Import `qualifyCase`, `assertExecutionReady` and `recordExecutionCleanup` from
`test-bench/desktop-runner.mjs`, and
`createDesktopSession` from `test-bench/desktop-session.mjs` in the Agent's
local controller. Each `execution` assessment has
`{ controllerId, generation, inputOwnership: 'exclusive', visualAgreement: 'agrees' }`.
Those positive values must come from actual fresh observation and Agent visual
review of that specific capture. They are not constants to copy blindly. The
session applies `inspectExecution()` and saves its bounded proof; conflicting,
unreviewed or interrupted state blocks the action and invalidates qualification.
The preferred split interface lets the Agent review a distinct fresh capture
between completed actions. Resuming or requalifying changes the generation,
so obtain it through `assertExecutionReady()` again.

This is a controller interface, not a standalone script with supplied fixtures.
Its input callbacks and selections must come from permitted live CUA inspection.

Use `raiseForReview()` to validate the owned arrival and **await completion of
Raise only**. That call returns without claiming or clicking Send and leaves
no pending UI mutation. Then acquire a distinct fresh paired AX/screenshot
capture using the actual `getAXStateAndScreenshot()` API in a read-only CUA
call, review its actual view and invoke
`submitReviewed()` with that capture's execution assessment. The final call
performs validation, the durable claim and the awaited click in one CUA
invocation. The two methods must use the same session instance and its
short-lived in-memory Raise ticket. The new capture must have a distinct ID,
the same window/generation and a timestamp at or after Raise returned (at
millisecond resolution), within the fixed thirty-second bound. A lost ticket
blocks Send; only an otherwise permitted new Raise phase can replace it. The durable Send guard still applies.

Do not carry an unfinished mutation promise across CUA calls or pause it for
an inter-call visual-review gate. A completed Raise followed by a separate
read-only review is different from suspending a Send operation. Never copy a
prior visual review onto a changed capture or replace capture timestamps.
The post-Raise capture must remain fresh within the fixed thirty-second bound;
if review takes too long, obtain and review another fresh capture within a
valid ticket or stop. Do not label separately acquired AX/pixel reads atomic.
These guards do not establish that live dispatch works.

The session methods enforce these boundaries:

- `prepareLaunch()` checks a fresh complete owned Claude capture at
  `https://claude.ai/new`, the selected main region and its empty composer,
  and the actual Claude-selected/Code-unselected radio controls in that window.
  Only an empty value or the adapter's lone formatting LF counts as empty;
  a previous draft, messages, streaming response or wrong destination blocks
  the launch claim. The session saves bounded preflight evidence, then reserves
  the single native activation. This method does not click or launch an app.
- `raiseForReview(snapshot, selection)` checks current execution qualification
  and fresh owned arrival in the same window strictly after the handoff claim.
  The selected route must be fresh Chat with the intended modes, a nonempty
  composer, no prior messages/streaming and a resolved launch prompt. It awaits
  the actual exposed supported `Raise` action, discards preliminary indices and
  creates a short-lived in-memory ticket. It performs no Send. Changed or
  revoked qualification, a failed Raise, a closed/expired case or a consumed
  Send attempt blocks this path.
- `submitReviewed(snapshot, selection)` requires that same session's current
  Raise ticket and a distinct fresh post-Raise capture with actual Agent-reviewed
  AX/pixel agreement. It rechecks route, mode, ownership and selected composer
  policy, then finds a unique enabled Send control. It writes separate
  draft/comparison observations, durably claims the one attempt and awaits
  `app.click` within that final CUA invocation. Exact text and a named
  presentation match remain distinct. The ticket cannot authorize a second
  Send; a click exception or interruption after the claim remains ambiguous.
  The bounded `send-dispatch-entered.json` and `send-dispatch-result.json`
  diagnostics identify the controller boundary and promise settlement only,
  never native delivery or an observed sent message.
- `submit(captureOwnedFreshDraft)` remains available to a controller capable of
  supplying actual fresh reviewed captures during one awaited invocation. Its
  callback returns `{ snapshot, composerIndex, scopeIndex, claudeModeIndex,
  codeModeIndex, freshConversation: true, surface: 'claude-chat',
  launchResolved: true, execution }` twice, including after Raise. It cannot
  suspend a pending mutation across CUA calls to obtain a model's visual review.
  Ordinary coding-Agent use should prefer the split interface above. Historical
  live Raise/recapture observations predate this split and do not qualify it.
- `confirmSent()` takes a fresh post-click capture and the controller-selected
  visible **user-message** node for the public invitation. It checks the
  selected case policy again and retains submitted-text fidelity separately
  from composer fidelity. Its capture identifier must differ from the pre-Send
  capture, and its capture timestamp must be strictly after the durable Send
  claim. The controller must establish that the message
  belongs to the owned new conversation; matching text somewhere in the window
  alone is insufficient. Confirmation records a UI observation, not independent
  transport or model exposure.
  If rendered text cannot meet that comparison, do not flatten/reconstruct it
  to force a match. A separately supported lower-level visual-transition
  observation may establish that Send occurred; it retains
  `submittedFidelity: 'visual-transition-only'` and cannot qualify submitted
  text. The earlier completed case used that weaker, explicit finding. The
  latest case has no observed submitted message and retains
  `submittedFidelity: 'not-established'`.
- `recordResult()` uses the pure helper's selected owned reply/tool-result
  regions. It writes completion and source-access observations separately and
  persists only bounded material. The Agent retains responsibility for the
  semantic meaning of its selected evidence. Source-only inspection does not
  append or replace completion. Result captures must belong to the same owned
  window, follow the Send claim and meet the fixed thirty-second freshness
  bound; caller-supplied options cannot widen it.
- `finish()` creates the final report after bounded cleanup dispositions have
  been recorded. The session does not close windows or delete conversations.

Fresh captures, execution assessments and observations are supplied by the
coding Agent from permitted actual UI inspection. No operator observation form
is required. Pure tests exercise synthetic
handles and snapshots; they cannot establish that the live handoff worked.

## Commands and records

Use the repository's installed, pinned SDK. **Do not run `prepare` until the
operator has authorized this fresh conversation and its single public Send.**
The flag records that direction; it does not acquire authorization itself.

```sh
node test-bench/desktop-runner.mjs prepare --authorize-send
```

A newly prepared case has an execution contract but remains unqualified. Its
controller must complete the assessment described above before launch or Send;
the CLI cannot establish ownership or inspect the apps itself.

The default case policy is `exact`. The candidate Lab-only presentation
comparison is an explicit alternative when preparing a **new**, separately
authorized case:

```sh
node test-bench/desktop-runner.mjs prepare --authorize-send --draft-policy lab-claude-ax-paragraphs-v1
```

The programmatic equivalent is
`prepareCase({ allowSend: true, draftPolicy: 'lab-claude-ax-paragraphs-v1' })`
with the required pinned inputs. The policy is fixed in the case; do not
upgrade a finished or failed case, reuse its findings as a new result, or run
both preparation examples for one authorization. Naming a policy does not
authorize a live trial.

The JSON output supplies the case `id`, `runId`, deadline and `viewerFragment`.
Keep those exact identifiers for the remaining operations. If the controlling
Agent already owns a browser-only Claude run with matching inputs and at most
one recorded handoff, adopt it instead of creating a second run:

```sh
node test-bench/desktop-runner.mjs prepare --authorize-send --run <owned-run-id>
```

These are alternatives, not consecutive steps. Another active Claude case
blocks preparation. The fixed default deadline is fifteen minutes. Lock,
permission and recovery interruptions do not freeze or extend it. After expiry,
record the limitation and finish the same case without repeating Send. There
is no watchdog that automatically writes a final report when a controller
crashes: recovery reads the persisted case/journal and explicitly calls
`finish`. An attempt record remains consumed even without a final report.

For lost access, record an interruption with a supported reason. This example
covers a locked device; unavailable inspection permission instead uses
`permission-required`:

```sh
node test-bench/desktop-runner.mjs interrupt <case-id> --reason controller-unavailable --actor agent --human-action none
```

After the human actually restores access, record that action and resume the
same case and controller within its remaining deadline:

```sh
node test-bench/desktop-runner.mjs interrupt <case-id> --reason controller-unavailable --actor human --human-action restore-access
node test-bench/desktop-runner.mjs resume-execution <case-id> --controller <controller-id> --confirmed-human-action
node test-bench/desktop-runner.mjs qualify <case-id> --file <fresh-assessment.json>
```

The confirmation records the human's response; it does not unlock the Mac or
acquire permission. Restoration leaves execution unqualified until that fresh
assessment and new stage checks pass. Human aid after the first successful
qualification remains assistance, including before handoff. Setup before
qualification is recorded separately. Consumed launch/Send attempts remain
consumed, and a revoked authorization cannot resume.

The compatibility commands `pause-locked`/`resume-unlocked --confirmed-unlocked
--controller <controller-id>` and `pause-approval`/`resume-access
--confirmed-access --controller <controller-id>` route through the same contract
interruption/restoration logic. They do not extend the deadline or restore
qualification. The current limits are eight intervention records and sixteen
qualification assessments; exhaustion durably blocks further execution.

Before the single actual browser activation, reserve the native handoff:

```sh
node test-bench/desktop-runner.mjs claim-handoff <case-id> --file <bounded-proof.json>
```

This is also exported as `claimHandoff()` for a lower-level controller. The
Agent-facing session instead uses `prepareLaunch()` with actual readiness
and current execution evidence before activation. Lower-level `claimHandoff()`
and the CLI file require both `readiness` and `executionProof` from the same
capture. Historical claims without them remain unchecked; they cannot qualify
new native actions.
The claim
reserves the attempt before the real CUA click; it does not launch an app or
establish activation. Record the actual browser event separately. If an
adopted run already contains the one requested handoff, inspect that outcome
instead of claiming or launching again. A detached or uncertain click must
not cause another launch within that case.

For a separately authorized direct-URI diagnostic, declare the control before
Send with `node test-bench/desktop-runner.mjs mark-uri-control <case-id>`.
That case's report identifies `native-uri-control` and always keeps
`componentPathQualified` false. A successful address-bar control cannot qualify
the SDK component's click path. Preserve failed component attempts separately;
never adopt a run already bound to a finished case.

The controller generates bounded observation JSON from actual permitted CUA
observations, then appends each finding with:

```sh
node test-bench/desktop-runner.mjs observe <case-id> --file <bounded-observation.json>
node test-bench/desktop-runner.mjs show <case-id>
```

`observe` validates scope and persists automatically; it does not inspect the
app. Positive desktop findings require `{ observation, executionProof }` in the
file, with the proof bound to that observation's fresh capture and current
qualification. Browser-only records remain separate. Session supporting material is persisted only after the
active-case and record checks, under the same case lock as observation append
and finish. A rejected operation on a finished, paused or expired case writes
neither supporting material nor a new observation. Only browser
activation/context checks belong in the
browser lane. Actual Claude findings use `desktop-ui` provenance, the
`real-client` lane and the observed `claude-chat` surface. An Agent must not
label its own observation as an operator report. The controller uses fixed
public finding notes and keeps raw AX input out of the JSON file.

The session's `submitReviewed()` and callback `submit()` perform this claim
automatically. For a
lower-level controller, after observing draft arrival and the positive
comparison required by the case's policy, obtain fresh CUA state and its
matching unique Submit control, then claim before clicking:

```sh
node test-bench/desktop-runner.mjs claim-send <case-id> --file <bounded-proof.json>
```

The lower-level file requires `arrival` and `executionProof` from the same
current capture; the session supplies these automatically. The claim requires
direct owned Claude Chat draft arrival and the positive
comparison required by the selected policy. The named Lab policy additionally
requires exact prepared browser-payload evidence and a stored presentation
capture no older than thirty seconds, with the same capture identifier,
timestamp and snapshot digest as draft arrival. The default `exact` policy
retains the existing guard; its controller must establish freshness using the
helper before the actual action. A second claim fails even if no Send
confirmation was saved. Append the observed Send transition and later findings
with `observe`; do not infer success from the claim file.

Finish after collecting the permitted results, or when blocked:

```sh
node test-bench/desktop-runner.mjs finish <case-id>
npm run bench:report -- .local/test-bench/runs/<run-id>.json
```

`finish` writes a structured report and releases the active case lock. It
retains incomplete or failed results; it does not click, retry or close apps.
`show` displays the case state. These commands do not resume UI actions after
finish. The controller owns browser/draft cleanup. Record its bounded actual outcomes
through `recordExecutionCleanup()` before `finish()`; a missing record remains
`not-recorded`. This does not perform cleanup or authorize touching uncertain
surfaces. Keep any additional public review material separately. The cleanup shape is
`{ browser, native, ownership: 'owned-only' }`. Browser dispositions are
`closed`, `retained-for-review`, `not-created` or `blocked`; native dispositions
are `unsent-draft-retained`, `conversation-retained`, `not-created` or `blocked`.
Choose only what was actually established, and record once. Cleanup is terminal:
no further qualification, native actions or positive observations follow it;
read and finish remain available. The CLI equivalent
is `cleanup <case-id> --file <bounded-cleanup.json>`. A blocked or missing
cleanup disposition cannot qualify the complete execution contract.

Files are local and ignored:

- `.local/test-bench/desktop/<case-id>/case.json`: input pins, authorization
  scope, deadline and lifecycle state.
- `journal.json`: bounded controller events in that case directory.
- `send-claimed.json`: the durable one-attempt claim, when created.
- `send-dispatch-entered.json` and `send-dispatch-result.json`: bounded
  controller-boundary and promise-settlement diagnostics when recorded; these
  are separate from native delivery and the actual sent-message observation.
- `handoff-claimed.json`: the durable single native-activation reservation,
  with bounded empty-Chat readiness evidence when created by `prepareLaunch()`.
- `public-context.txt`: the exact public invitation retained for the case.
- `report.json`: final stage outcomes and limits.
- `.local/test-bench/runs/<run-id>.json`: the ordinary bench record and its
  automatically appended observations.

Run `npm run bench` and open its loopback URL with
`?lane=desktop&controller=agent` and the returned `viewerFragment` to inspect
the same record. This Agent-operated view refreshes automatically and hides
the manual observation form and New run button.
Viewing does not require entering the operator form or launching an Agent.
It configures the unchanged SDK with Claude and Copy only; the ordinary bench
lanes retain both desktop clients. The Agent-operated view cannot launch Codex.

## What is exercised

1. Load and check the installed candidate archive, dependency lock, package
   files and canonical public invitation before creating a run.
2. Establish an empty owned Claude Chat through CUA and pass `prepareLaunch()`.
   Open an owned local bench tab in regular Chrome and activate the installed
   SDK's Claude link once. Resolve the actual native-launch prompt. A browser
   request and launch permission remain separate from destination arrival.
3. Inspect actual post-launch arrival in that owned fresh Claude window through
   CUA, after the prompt has closed. Compare the
   exposed composer text with the exact invitation and retain that finding.
   If the case explicitly selects the restricted Lab presentation policy,
   check and record it separately; do not relabel it exact equality or
   substitute a visually complete-looking draft for either comparison.
4. Claim the one permitted Send durably before activating a unique enabled
   Send control. Inspect the owned conversation for the actual resulting
   state. Never replay an uncertain Send.
5. Inspect source access and the completed visible introduction separately.
   Append the named findings automatically, then expose the run through the
   ordinary local bench viewer and report.
6. Clean up owned browser tabs and any unsent test draft only when ownership
   is certain. Preserve a submitted test conversation when needed for review;
   record that it remains rather than deleting it implicitly.

The invitation is passed unchanged: no extra question, case identifier,
callback, completion token or instruction to report back is inserted. The
runner does not alter the SDK package, the Lab site or another consumer.

## UI-driver boundary

The live controller uses only the documented CUA browser and native-app APIs.
It verifies `/Applications/Google Chrome.app` as `com.google.Chrome` before
browser reads, navigation or clicks. Chrome Beta is excluded. Claude is
identified as `com.anthropic.claudefordesktop`. If either permitted surface is
unavailable or app access is denied, preserve that failure and stop the
dependent operation.

The controller tracks the source tab and the newly opened test conversation.
Existing conversations, ambiguous windows and private drafts are outside its
scope. A normalized snapshot identifies one owned Claude window, the current
capture and its visible AX nodes. The pure helpers in
[desktop-ui.mjs](desktop-ui.mjs) validate that envelope and reject stale,
incomplete, mismatched or ambiguous evidence. They perform no UI actions.

The native [Claude AX adapter](claude-ax.mjs) preserves multiline static-source
payloads and composer whitespace, and recognizes links and the current
document surface. It removes only CUA's node separator; it does not trim source
text or reconstruct an answer. Raw AX, private URLs and node values stay in
memory. The [readiness helpers](readiness.mjs) check the observable new-Chat
route and scoped main-region state, plus the current-window mode controls.
They do not prove the controller's ownership statement or operate the app.
The window identifier is a controller-attributed logical handle, not an
independently authenticated stable native-window identity. Raising a window
can expose a different surface; the controller must reacquire and identify
the actual owned UI rather than trusting its old handle or indices.

`extractCanonicalComposer()` remains a strict exact-exposed-text comparison.
The separate `extractPresentationComposer()` accepts only the named Lab policy
and compares the same explicitly selected composer against its permitted
forms. `findSubmitControl()` requires a matching result under the selected
policy from the same fresh capture and a unique enabled Send/Submit button. Node
indices must come from that capture; an index from an earlier snapshot is not
an action plan. Reacquiring UI state requires a fresh comparison.

`classifyOwnedEvidence()` keeps the visible introduction and individual source
results separate. The controller explicitly selects the public introduction,
access-limit and follow-up material in the owned reply subtree; a completed
reply control must also be visible. Source selections require an explicitly
identified expanded tool-result boundary and its actual disclosure control;
a broad reply subtree cannot stand in for that provenance. The named public
URL may be exposed as exact text or an actual link. Raw JSON results require
parsed public schema and identity fields; processed results require separately
selected exact visible identity fields and remain labeled processed. An
inspected denial must be selected as `access-denial` before a visible 403 or
CONNECT rejection becomes a failed source-access finding. A Read label or an
Agent's prose alone does not establish any of these source outcomes. The new
classification paths have synthetic coverage; this slice's live case did not
reach a source result. Raw response-byte identity remains
`not-established`. These are normalized evidence helpers; their tests do not
establish that every Claude build exposes a compatible AX representation.

The CLI cannot verify that a controller's ownership statement or supplied
snapshot is truthful. A coding Agent must actually obtain the state through
permitted CUA control before recording it. Synthetic helper tests exercise
rejection and classification logic; they do not qualify a native handoff.

**ChatGPT/Codex desktop control is excluded.** OpenAI's Computer Use guidance
states that the feature cannot automate ChatGPT itself. The runner does not
work around that block using shell UI control, AppleScript, accessibility
scraping, private app storage or injected CDP. Codex CLI, SDK and app-server
runs are distinct execution paths and cannot qualify the desktop handoff.
See [OpenAI Computer Use safety guidance](https://learn.chatgpt.com/docs/computer-use#safety-guidance).

## One Send and recovery

One authorized attempt means one fresh conversation and at most one Send.
The durable claim precedes the UI action. If a process stops after claiming,
the next process must treat sending as possibly attempted; it must not acquire
another claim or click Send again merely because a completion record is absent.
This can leave an authorized attempt unused, which is preferable to a duplicate
submission.

An uncertain browser launch, a missing draft, an ambiguous Submit control,
permission denial, access error or timeout is a result to retain, not a reason
for an automatic second conversation or Send. A subsequent live attempt needs
separate operator direction and a fresh run. A fixture or new run identifier
must not be used to evade the single-attempt boundary.

Permission prompts remain normal client prompts. The Agent may resolve a
launch confirmation within the existing authorization. Protected unlock,
sign-in and permission grants belong to the human; the runner does not change
system security, account or model settings.

When control, ownership or observations become uncertain, use
`recordExecutionInterruption()` with a supported reason and actor before
further consequential actions. It invalidates the current qualification.
Record unexpected human action as assistance, even when it helps the run pass.
After restoration, `resumeExecution()` requires the same controller (and an
explicit human-restoration confirmation where applicable), advances the
generation and leaves it unqualified. Run `qualifyCase()` again and acquire
fresh stage-appropriate observations. Neither resumption nor requalification
restores an attempt, extends its authority or reopens a finished case. A Send
claim still prohibits another Send. The CLI equivalents are `qualify`,
`interrupt` and `resume-execution`; their assessments use the exact schema in
[execution-contract.mjs](execution-contract.mjs), with rejection examples in
[execution-contract.test.mjs](execution-contract.test.mjs). Existing lock/access
pause commands retain their distinct human-restoration requirements and must
not bypass execution qualification.

## Findings and retained material

The automatic report retains execution qualification, controller attribution,
assistance, interruptions and bounded cleanup separately from application results. A human-assisted
run cannot be qualified as unassisted. Historical cases without the contract
remain unchecked rather than being retrofitted. Each application stage remains
separate:

| Finding | Supporting observation | Limit |
| --- | --- | --- |
| Handoff requested | Actual browser activation of the prepared native URL | Does not prove OS acceptance or draft arrival |
| Draft arrived | Owned Claude composer visible through CUA | Does not establish exact equality |
| Context matches | Exact exposed composer comparison and matching public-context digest | Does not establish raw transport bytes |
| Presentation matches | Explicit Lab-only case policy accepts exact text or its one declared AX blank-line transformation | Does not establish exact exposed, application or transport bytes; not a generic whitespace or semantic match |
| Sent | Observed transition after the claimed Send action | Does not establish source retrieval or completion |
| Permission | Actually observed permission lifecycle | No prompt seen does not prove no permissions apply |
| Source access | Visible owned tool result for the named public source, or an explicit access failure | Agent readiness/self-description is insufficient; rendered results do not prove raw-byte verification |
| Completion | Completed owned reply visibly introduces the public collection | May coexist with source-access failure; does not prove complete reading, comprehension or model origin |

The named presentation material uses
`method: 'lab-claude-ax-paragraphs-v1'`, distinct canonical and exposed digests,
and a `basis` of `exact`, `paragraph-blank-lines-collapsed` or `different`.
It binds the selected observation through `captureId`, `capturedAt` and
`snapshotSha256`. These fields support the case guard and review; they do not
independently authenticate the controller's capture.

Reports expose `draftPolicy`, `composerFidelity`, `submittedFidelity` and
`exactContextQualified` separately; `transportBytes` remains
`not-established`. A completed case under the named policy may have
`interactionPassed: true` and
`outcome: 'interaction-completed-under-presentation-policy'` while
`componentPathQualified` stays false. Its separate
`componentPathObservedUnderPolicy` identifies only the completed component
interaction under the declared policy. In a named-policy case, exact
qualification requires both the composer and the observed submitted message
to match exactly; a collapsed presentation at either stage cannot pass that
claim. Neither report outcome establishes successful source acquisition.
The separate `readiness` object reports `preflight` and `arrival` as observed
only when their bounded proofs were saved. Historical cases without those
checks remain `not-checked`; they are not retroactively qualified. A durable
Send claim or a resolved click call is not a `sent` observation.

New reports also expose `sendDispatch.status` as `not-recorded`, `entered`,
`returned` or `rejected`, with `boundary: 'controller-app-click'` and
`nativeDelivery: 'not-established'`. This diagnostic identifies only how far
the controller recorded its own App-call path. It is not a new participation,
execution or Send claim. Historical reports remain unchanged; absence of
these later records supplies no evidence about whether an earlier click was
dispatched. Never append diagnostics to a finished case to fill that gap.

Persist only input pins, environment versions, bounded states, timestamps,
digests and supported public-only finding codes. Keep private conversation
identifiers, answer text, account details, cookies and raw AX captures out of
the stored report and tracked files. UI snapshots are transient input to
classification. A snapshot digest binds the selected observation but is not
an independent witness or proof of authorship.

Runner state and bench run files remain in ignored local storage. The viewer
and `bench:report` read the resulting structured record; the Agent does not
need to enter the operator observation form. Neither a valid record nor a
completed introduction produces an overall genuine/read/participated verdict.

## Historical qualification status: execution-contract slice

This section preserves the execution-contract slice's status and relative
terms such as "current", "latest" and "immediate" below. It predates the
controlled no-Send repeat and dedicated-environment decision. That historical
target was offline submitted-message extraction and source-adapter inspectability;
the standing sequence above carries the latest result; newer dated findings do not retroactively
qualify these cases.

Helper/unit tests and journal recovery checks are synthetic. Browser checks
cancel native launches. A real desktop trial requires its own dated record,
exact candidate/input pins, actual client versions and attributed observations.
The historical [initial qualification](QUALIFICATION.md) is not qualification
of this runner or a changed SDK archive. Current live results remain pending
until the controlling Agent records the actual authorized trial and cleanup.

The [runner qualification record](AGENT-QUALIFICATION.md) distinguishes the
expired locked-host attempt, component click attempts and direct-URI control.
An existing conversation without the canonical invitation never qualifies
draft arrival, exact context or Send. Current real-client findings must come
from those named records, not from synthetic tests or historical qualification.
The candidate readiness/source-inspection code and dispatch diagnostics passed
the historical **251-test repository baseline** before this execution-contract
slice. The current execution-contract implementation passed all **284 repository
tests**, with zero failures, cancellations or skips, using synthetic App/UI
fixtures and loopback HTTP. These checks are not a new live result. An earlier
authorized actual case records one Send and a completed introduction under the named policy. That report retains failed
exact composer equality, visual-transition-only submitted fidelity and
unobserved source access. Later authorized cases passed the new readiness
checks and their composer policy, then durably claimed one native Send attempt
without an observed submitted message or response. They remain incomplete with
`sendRecovery: 'possibly-attempted-do-not-resend'`; source access and completion
were not run. The latest case actually exercised Raise and fresh recapture;
the cause of its missing sent transition remains unproven. A lifecycle
regression checks that repeated, closed or expired attempts cannot perform
Raise. Earlier case results remain unchanged.

Before the latest additional trial, an atomic native AX/screenshot read exposed
incompatible views: AX described a completed public Lab exchange while the
screenshot showed `/new` with the public unsent draft. The controller stopped
actions. The operator then identified the actual visible view as the finished
Lab reply, and fresh AX and pixels agreed before a new owned Chat was prepared.
That restoration permitted the separately authorized additional trial; it did
not bind the previously unowned exchange to the finished ambiguous case.
After the additional trial's Send claim, two atomic AX/pixel captures agreed
on `/new` with the same public draft and no response. The controller did not
retry Send. The immediate target is the execution contract and its rejection/
recovery checks. Reliable native Send dispatch and acknowledgement, then owned
tool-result inspection, remain later live acceptance conditions. No further
live authorization follows from this standing plan.
