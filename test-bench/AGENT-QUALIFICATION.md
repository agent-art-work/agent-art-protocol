# Agent-operated runner observations

Started: 2026-10-21. Updated: 2026-10-22.
Candidate local runner. One actual Lab → Claude interaction, including Send
and a completed introduction, is now observed under the named presentation
policy. Exact submitted-text fidelity and source acquisition remain
unestablished; the strict component path is not qualified. A later authorized
case passed new readiness checks but ended after one native Send attempt with
no observed sent transition. Its sources and reply were not run.

The current phase is the dedicated environment's no-Send feasibility gate.
Its [provisioning record](#dedicated-environment-provisioning-started-2026-10-22)
checks host/runtime prerequisites and records an in-progress image download;
no guest boot or guest-local control is qualified yet. Earlier host trials
below retain their original scope and limits.

## Inputs and boundary

The installed SDK stays at private **0.1.4**, archive SHA-256
`e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430`.
The exact pinned public Lab invitation has 983 UTF-8 bytes, SHA-256
`ebef0c1f9ce1c03a6028f840086b9ff079cb3fc2df53d79e6053b9b4f6a8bde6`.
Its source attribution remains in [lab-source.json](lab-source.json).

The operator authorized one fresh Claude conversation and one public-invitation
Send, with Codex's existing draft unsent, no SDK changes and no deployment.
The first six named attempts below had no Send claim or attempt. A later
authorized continuation completed exactly one actual Send; two intervening
setup attempts also stopped without a Send claim. A separately authorized
readiness/source-inspection trial later made one durable Send claim and native
click attempt, without establishing that the invitation was submitted.
Browser navigation requests do not establish actual native delivery.

## Live attempts

Ignored state, journals and reports are under `.local/test-bench/desktop/`;
ordinary run records are under `.local/test-bench/runs/`.

| Case | Run | Observation |
| --- | --- | --- |
| `desktop-288115f8-f8dd-4951-9fdf-90757ad011ca` | `reading-f62e144d-ffb4-4a1b-b6a1-a3f361d70b5c` | Browser request recorded; exact fresh draft not established. Mac locked; bounded pause expired. Finished incomplete without Send. |
| `desktop-3d63c8d6-b5b7-48ca-b983-895f4c27bf4f` | `reading-8fd4e641-59fc-4044-b0b7-19a69beb6812` | Browser Playwright click recorded; no matching fresh Claude draft observed. Finished incomplete without Send. |
| `desktop-95d0d1b4-0139-4b65-8bc8-2e0ce4621fd8` | `reading-a8377312-cff9-41da-b74b-0eceda365ef9` | Browser Tab native-input click recorded; no launch prompt or matching draft observed. Finished incomplete without Send. |
| `desktop-7cd93c77-bf84-486a-8b56-0e28b9b1188d` | `reading-cc2bb342-fead-4b19-81df-27291249bd1f` | Separate direct-URI address-bar control. No matching draft established; approval pause expired. Finished incomplete without Send. This path cannot qualify the component click. |
| `desktop-e44151d8-3c71-4535-b9c5-046691d9130f` | `reading-d58215a4-ad61-42d5-aa75-dc84bc972b4d` | Corrected observer captured no component click event or browser request; SDK status stayed empty and no matching fresh Claude draft was established. Finished incomplete without Send. |
| `desktop-8d8bcc70-fdea-4989-9c75-7a1d67421324` | `reading-a79aaf43-8de4-451a-9e83-7e7a815bcd3b` | Uncanceled trusted component click, native launch permission and fresh Claude Chat draft observed. Exact composer guard failed on the AX newline presentation; Send refused. Finished `interaction-incomplete-or-failed`, `sendClaimed=false`; source access and completion not run. |
| `desktop-efcaffd1-b563-4857-82f8-912e159076b0` | `reading-93c18606-a446-4f58-ace2-e49f5789a2e9` | Setup reached an old owned public draft containing duplicate invitation text. Guard refused; only that owned public draft was cleared. Finished incomplete, `sendClaimed=false`. This is a controller-readiness error, not evidence of a product failure. |
| `desktop-8658cae7-4e8e-4f06-bd14-43a61136fd53` | `reading-e6a369cf-1af6-44df-81ef-c5e3957fc7cf` | Draft inspection occurred while the native launch dialog was still open. Guard refused the premature capture; launch prompt canceled. Finished incomplete, `sendClaimed=false`. This is a controller sequencing error, not a qualified draft-delivery failure. |
| `desktop-eda74959-215b-4809-88b8-d947c4ff1e80` | `reading-29e8d671-a46b-4aa5-9167-7ed41a2b6264` | Named-policy composer match, one actual Send and a completed owned introduction observed. Submitted-text fidelity is `visual-transition-only`; source access is `not-observed`. Finished `interaction-completed-under-presentation-policy`, `componentPathQualified=false`. |
| `desktop-2b8a4134-1ade-48a4-860a-c7f79d6b3147` | `reading-3800faba-b664-4656-ba67-6c1e939fc05d` | New empty-Chat preflight and post-launch arrival checks passed; composer matched the named policy. One durable Send claim and native click attempt produced no observed user message or response. Finished incomplete, `sendRecovery=possibly-attempted-do-not-resend`; source access and completion are `not-run`. |

Limited Claude inspection was explicitly authorized after automatic approval
review blocked a full-window read that could include unrelated conversations.
Unrelated conversation content is not retained or used as test evidence.
Chrome inspection initially encountered a similar privacy approval boundary.
By 2026-10-22, limited Claude and Chrome inspection were both explicitly
authorized. Missing inspection approval is no longer the current blocker.
The earlier approval boundary remains an instrument-access limitation, not
evidence that the SDK or Claude rejected the invitation.

In the fifth attempt, ordinary disclosure clicks, coordinate clicks and
in-page Enter activation also failed to produce the expected page response.
Native Chrome menu actions and Return did work. The enabled unpacked Codex
control extension was observed at version **1.1.5**. After the existing
extension was reloaded, browser provider `1` became unavailable. The native
extension popup subsequently showed **Connected**, while binding the same
owned report tab through provider `1` still failed as unavailable. These
observations disagree; the cause of the page-control failure and provider
loss remains unproven.

The operator then reconnected regular Chrome. Provider `1` remained stale;
a new regular Chrome connection through provider `4` restored access. The
old owned tab `923808689` still showed no page response and was closed. In
fresh owned browser-only tab `923808717`, the disclosure expanded and the
Claude component click was captured with `cancelled=true` and
`isTrusted=true`, without an OS launch. Control recovered with a fresh
Chrome connection and fresh tab; packaged SDK bytes did not change. This
recovery does not establish the original cause of the failure.

In the sixth case, the component click was captured with `cancelled=false`
and `isTrusted=true`. Initially the native Chrome handle exposed only the
Extensions window. After the operator brought the regular Chrome Lab window
to the front, Chrome's **Open Claude?** prompt became visible. The controller
clicked **Open Claude** once and left persistent **Always allow** unchecked.
A fresh Claude Chat surface at `claude.ai/new` arrived, with Claude selected
and Code unselected, and the public invitation's words exposed in its composer.

The actual composer AXValue exposed **979 characters and 4 newlines**; the
exact browser context had **983 characters and 8 newlines**. The exposed value
equaled `canonical.replaceAll('\n\n', '\n')`, with identical words. This is
an observed AX presentation difference. It does not establish application or
transport loss; Accessibility may normalize the presentation.

The Agent-facing `session.submit` ran against the fresh actual AX snapshot
in the runner's normalized envelope. Its strict context guard automatically
recorded failed/context-differs and refused Send. Draft arrival and launch
permission were recorded separately as observed, using bounded public
material. The sixth case finished `interaction-incomplete-or-failed` with
`sendClaimed=false`; source access and completion remain not run.
Its ignored case materials include `composer-presentation.json` and
`launch-permission.json`; no raw AX tree or transcript was saved.

## Runner findings

The earlier check had **167 repository tests passing** after these fixes,
including synthetic runner, session, cross-realm, control-path and
late-cancellation regressions.
On 2026-10-22, all **169 repository tests passed**, including the added public
event-trace checks. A subsequent check passed all **174 repository tests**,
including case-bound HTTP observation-append locking, late-write guards for
finished, paused and expired cases, and concurrency regressions. These results
do not establish a completed real-client trial.

Live integration exposed two controller compatibility bugs: an unguarded
shell-only `process` reference and plain-object checks that rejected JSON
records from another JavaScript realm. Both are fixed in bench code, with
regressions; packaged SDK bytes are untouched.

The bench's browser click observer also assessed cancellation too early in a
microtask. It now waits until dispatch has completed. Synthetic tests reproduce
late target/bubble cancellation. This defect can overstate a browser request;
it does not establish why the named live attempts failed to reach Claude.
Earlier records keep their original findings and this qualification limitation.

A visible fixed-field handoff trace now distinguishes no captured click,
dispatch pending and the settled client, lane, cancellation and `isTrusted`
values, even for canceled events. The browser request remains a separate
observation. The trace contains no URL, context or private content; neither
a captured event, its trust flag nor an uncanceled request proves native
execution, draft delivery or sending.

## Subsequent bench-only presentation-policy slice

On 2026-10-22 the operator requested continued runner development with a
standing target/plan review. The working plan and per-slice acceptance checks
are now explicit in [AGENT-RUNNER.md](AGENT-RUNNER.md) and repository guidance.

The candidate `lab-claude-ax-paragraphs-v1` policy is an explicit option for a
new case, pinned to this exact Lab Work, public invitation and SDK archive.
It accepts exact exposed text or that canonical text with each double LF
replaced by a single LF. It does not trim, change words or URLs, normalize
Unicode or tolerate other whitespace. The default remains `exact`.
An independent `presentation-matches` finding records the comparison rule,
canonical/exposed digests and capture identity. A failed exact comparison
remains failed; it is not upgraded by the presentation finding.

The Send gate additionally requires exact prepared browser payload evidence
and one matching fresh owned draft capture for the named policy. Confirmation
requires an owned static user message in a distinct capture strictly after
the durable Send claim. Reports distinguish composer and submitted fidelity,
the selected policy and exact-context qualification. A completed interaction
under a transformed presentation can retain `componentPathQualified=false`
while separately recording the observed policy-scoped path. Raw transport
bytes remain unestablished.

Review also fixed pre-Send capture replay, contradictory transformed/exact
digest declarations and orphan material writes from rejected closed sessions.
Material persistence now occurs inside the case lock after lifecycle and
observation validation. Finished and expired-session tests verify that no
new supporting files are written on rejection.

All **201 repository tests passed**, including the new policy, fake-CUA,
freshness, contradiction and recovery checks. Those synthetic checks are not
a live qualification. The earlier sixth case and its refused Send remain
unchanged. No new Agent conversation, Send, SDK archive, publication or
deployment was performed during that bench-only slice. The subsequently
authorized live continuation is recorded separately below.

## Authorized live continuation under the named policy

The operator subsequently authorized one fresh conversation with the public
invitation. The two setup cases above stopped before a Send claim. In the
first, a previous owned draft contained 1,959 characters of duplicated public
context; the guard refused submission, and only that owned public draft was
cleared. In the second, a premature composer capture exposed one newline
while the browser launch dialog was still open. Its guard also refused Send,
and the prompt was canceled. These controller setup mistakes do not establish
that Claude or the SDK duplicated or lost the invitation.

The final actual case used the same SDK/archive/context pins. The prepared
browser payload matched the exact 983-byte public invitation. After launch
permission and fresh Chat arrival, the composer exposed 979 characters under
the same four-blank-line collapse observed earlier. Its exact comparison
remained failed; `presentation-matches` was separately observed under
`lab-claude-ax-paragraphs-v1`. The fresh-capture policy and unique Submit guard
passed, the runner durably claimed the one Send, and the controller actually
submitted once. There was no second Send or retry.

The post-Send user-message rendering flattened text and split its URL into
separate AX nodes. The strict submitted-text helper did not establish either
exact equality or the named paragraph comparison from that representation.
Instead, the controller recorded a supported lower-level **visual transition**
observation with bounded material under the case lock. The report therefore
keeps `submittedFidelity: 'visual-transition-only'`, distinct from
`composerFidelity: 'named-presentation-match'`.

A completed owned Claude reply was actually inspected through AX. Selected
public evidence established the collection introduction, access-limit
statement and follow-up invitation, together with a completed-reply Copy
control. The helper recorded `completion: observed` automatically. These
semantic selections are attributed controller observations; no raw reply,
private conversation identifier or AX tree was saved.

The reply described a shell/proxy 403 and a processed web-fetch result. The
underlying actual tool results were not independently inspected. A subsequent
tool disclosure click did not yield a usable frame, and native scrolling
then reported no available windows. These are inspection limitations, not
verified source acquisition or a verified source failure. The saved finding
is **`source-access: not-observed`**, with `reason: not-inspected`; assistant
prose alone was not upgraded into a source result.

The finished report records:

| Field | Actual result |
| --- | --- |
| `outcome` | `interaction-completed-under-presentation-policy` |
| `interactionPassed` | `true` under that named policy |
| `composerFidelity` | `named-presentation-match` |
| `submittedFidelity` | `visual-transition-only` |
| `exactContextQualified` | `false` |
| `componentPathQualified` | `false` |
| `componentPathObservedUnderPolicy` | `true` |
| `transportBytes` | `not-established` |
| `sourceAccess` | `not-observed` |
| `sendClaimed` | `true`; exactly one actual Send observed |

This establishes the owned GUI interaction under the named policy, rather
than exact submitted bytes, successful reading, model authorship or intention.
All 201 repository tests remain the checked code baseline. SDK 0.1.4 source
and archive are unchanged; no deployment or publication occurred.

## Readiness and source-inspection slice, 2026-10-22

The operator explicitly requested readiness and source-result inspection fixes,
then one fresh Lab → Claude desktop test. This slice kept SDK 0.1.4 and its
archive unchanged, left the existing Codex draft untouched and made no
deployment or publication.

The new native AX adapter preserves multiline static-source text and composer
whitespace rather than trimming or dropping continuation lines. It recognizes
links and keeps the current Claude document URL only in memory. New readiness
guards require a complete fresh owned `/new` Chat, an empty composer, Claude
selected and Code unselected, with no existing messages or streaming response.
The session's `prepareLaunch()` saves bounded readiness evidence before the
single native handoff claim. Before Send, actual draft arrival must be in the
same window, in a distinct post-claim capture, after the controller has resolved
the launch prompt. The selected draft policy still has its separate comparison.

Source-result classification now requires an explicitly selected expanded
tool-result boundary and its actual disclosure control. It handles exact URL
text or links, distinguishes visible raw JSON from processed source identity,
and records an inspected explicit denial separately. Processed identity needs
each expected visible field; assistant prose and a Read label remain
insufficient. `recordResult()` no longer changes completion when only a source
is inspected. The session enforces a fixed thirty-second freshness bound and
the owned post-Send window. Reports identify new readiness observations while
leaving historical unchecked cases as `not-checked`.

Before the fresh trial, all **233 repository tests passed**, including adapter
continuation/whitespace,
readiness, source provenance/identity/denial, source-only recording, freshness
and recovery regressions. These are synthetic checks. They do not establish a
live source result or retroactively change an earlier case.

### Actual fresh trial

The case finished at `2026-10-22T08:07:37.694Z`. Its environment record identifies
macOS 26.7.1, regular Google Chrome 156.0.8078.47 and Claude desktop 2.37337.1.
The public Work, 983-byte invitation and SDK archive pins are unchanged from
the input table above.

The controller selected Chat and New, dismissed a promotional notice, and
actually observed an empty owned Claude Chat. `prepareLaunch()` passed and
saved the new bounded preflight. The one browser click returned a detached
control error, but its settled event was independently visible as trusted,
uncanceled and requested; the controller did not activate it again. Bringing
the exact owned regular Chrome test tab forward exposed the **Open Claude?**
prompt. The controller accepted it once, left persistent **Always allow**
unchecked, and verified prompt closure.

The prepared browser payload matched the exact 983-byte public invitation.
The actual Claude composer again exposed its 979-character paragraph
presentation. Post-launch arrival passed the new readiness guard, the exact
composer comparison remained failed, and the separately named Lab paragraph
comparison passed.

`session.submit()` then durably claimed one Send and called the actual native
App handle's click once. The call returned `attempted: true`. Repeated fresh
AX captures and a screenshot nevertheless showed `/new` with the same public
draft, no submitted user message and no response activity. The controller
recorded `sent: not-observed` and finished the case; it did not repeat Send,
create another trial or infer that a successful click return meant submission.
The cause remains unproven. This observation alone does not identify an SDK,
Claude, focus or input-control defect.

| Field | Actual result |
| --- | --- |
| `readiness.preflight` | `observed` |
| `readiness.arrival` | `observed` |
| `composerFidelity` | `named-presentation-match` |
| `submittedFidelity` | `not-established` |
| `exactContextQualified` | `false` |
| `componentPathQualified` | `false` |
| `componentPathObservedUnderPolicy` | `false` |
| `interactionPassed` | `false` |
| `sent` | `not-observed` |
| `sourceAccess` | `not-run` |
| `completion` | `not-run` |
| `sendClaimed` | `true` |
| `sendRecovery` | `possibly-attempted-do-not-resend` |
| `outcome` | `interaction-incomplete-or-failed` |

This qualifies the actual empty-Chat preflight and arrival observations for
this case, rather than a completed interaction. The new source-result paths
were not exercised live because the conversation never visibly started. The
earlier completed case and its weaker submitted-text/source findings remain
immutable and separate.

### Post-trial foreground guard

The failed attempt was preserved before a further code change. The adapter
now records the standard window's `Raise` secondary action only when CUA
actually exposes it. Before claiming Send, `submit()` checks preliminary
arrival, invokes that supported native action, discards all preliminary
indices, and calls its capture callback again. The second capture must be
distinct and must pass the route, mode, ownership, draft and unique-Send
checks afresh. Raise failure or a different surface blocks the claim rather
than reusing the previous composer or button index.

All **236 repository tests passed** after this hardening, including three new
regressions for Raise failure, a changed destination after Raise and a changed
Send index. There was no second live trial. These checks therefore do not
establish that the new foreground guard resolves the observed native input
problem. The window identity remains a controller-attributed logical handle;
the runner cannot independently prove stable native-window identity or the
truth of the controller's ownership statement.

### Additional authorization and inconsistent native views

The operator subsequently authorized **one additional fresh test**. At that
point no case or conversation had been prepared or started under that
additional authorization.
After reset and reconnect, Claude's AX view described a completed public Lab
exchange containing the same invitation, but no binding to the finished case
`desktop-2b8a4134-1ade-48a4-860a-c7f79d6b3147` was established. The native
screenshot simultaneously showed `/new` with the public unsent draft. A single
atomic `getAXStateAndScreenshot()` call confirmed the conflicting AX and pixel
views in the same observation.

This is an instrument/view inconsistency, not proof of a delayed Send, a late
completion or a source result for the finished case. Its report is unchanged.
The controller stopped all native actions and asked the operator to bring
Claude Chat forward and identify the actual visible view, without sending.
At that point the additional run authorization remained pending environment
restoration; native inspection was not qualified to start it.

The final code check passed all **237 repository tests**. The added lifecycle
regression verifies guards before capture and before Raise, including repeated,
closed and expired attempts that must not invoke Raise. This synthetic check
does not resolve the AX/pixel discrepancy or independently establish stable
native-window identity. No additional live trial had followed it at that point.

### Separately authorized additional trial after view restoration

The operator identified the actual visible Claude Chat as the **finished Lab
reply**. Fresh native AX and screenshot views then agreed. The controller
created a new owned empty Chat under the already granted additional-run
authorization. This restoration did not establish that the earlier unbound
exchange belonged to the finished ambiguous case, and that case was not
reopened or upgraded.

The additional case is `desktop-8e3bd934-2a0b-4b81-bf6c-73fb25e46619`, with run
`reading-ba28a54f-ce48-47bf-ba95-e4b97e0b212f`. It retains the same public Work,
SDK/archive, invitation and environment pins. Empty-Chat readiness passed,
one actual SDK component activation was recorded, and the controller accepted
one **Open Claude?** prompt without enabling persistent permission. The exact
prepared browser payload matched the 983-byte invitation. The actual fresh
composer again exposed 979 characters, with failed exact equality and the
separately observed named paragraph presentation.

The controller also exercised the actual native **Raise** action, discarded
preliminary indices and obtained a distinct post-Raise capture. The selected
owned route, Claude mode, composer, draft policy and unique Send control passed
again. Two earlier controller review attempts stopped before the durable Send
claim, including a capture rejected by the fixed thirty-second freshness guard;
neither performed Send or another browser activation. The successful pre-Send
guard wrote one durable Send claim at `2026-10-22T08:31:21.897Z` and continued
the controller action path.

No submitted user message or response was observed. Two post-attempt atomic
AX/screenshot captures agreed on `/new` with the same public draft. A controller
async-review gate returned an ambiguous result, so actual native dispatch and
a resolved click return are not established. The cause of the missing sent
transition remains unproven;
the record does not identify a specific SDK, Claude, focus or input-control
defect. No retry, second Send claim or additional fresh conversation followed.

The case therefore retains `sent: not-observed`,
`submittedFidelity: 'not-established'`, `sourceAccess: 'not-run'` and
`completion: 'not-run'`. Readiness preflight and arrival, the named composer
comparison and actual Raise/recapture are observed; completed interaction,
exact submitted text and source-result inspection are not. The recovery
boundary remains `possibly-attempted-do-not-resend`. Actual exercise of the
foreground guard did not demonstrate that it fixes native Send. The 237-test
code baseline and unchanged SDK 0.1.4 archive remain separate from this live
incomplete result. The case finished at `2026-10-22T08:32:18.858Z`; its report
retains `interactionPassed: false` and
`outcome: 'interaction-incomplete-or-failed'`.

### Subsequent controller dispatch diagnostics

After preserving the incomplete case, the runner added bounded diagnostics
around the controller's `app.click` boundary. `send-dispatch-entered.json`
records that the controller reached that boundary after its durable claim,
before invocation. `send-dispatch-result.json` records only promise fulfillment
or rejection; rejection stores a bounded kind without the error text or stack.
New reports expose `sendDispatch.status` as `not-recorded`, `entered`,
`returned` or `rejected`, with `nativeDelivery: 'not-established'`. These are
controller diagnostics, not observations of native delivery or sending.
Interruption after a claim or boundary record still forbids retry.

This is a bench-only change checked with synthetic App handles, not another
live trial. The finished additional-case report was not regenerated or
modified, and no missing dispatch records were retrofitted to it. Its native
dispatch remains unestablished. The controller guide also now requires its
fresh capture, Raise, revalidation, claim and awaited click to stay within one
CUA invocation after a separate initial read-only visual review. It must not
carry an unfinished mutation promise across CUA calls or manufacture fresh
capture timestamps. That precaution does not establish why the previous
controller action was ambiguous.

All **251 repository tests passed**, with no failures, cancellations or skips,
after the dispatch diagnostics. These are synthetic checks, including App
handle and lifecycle regressions; no additional live Send or conversation was
performed. The earlier 237-test baseline and the already finished live reports
retain their historical scope. SDK 0.1.4 source and archive remain unchanged.

## Execution-contract implementation, 2026-10-22

After the ambiguous native Send cases, the operator paused live trials to
settle the environment's execution contract, then authorized implementation.
The selected [contract](EXECUTION-CONTRACT.md) separates environment
requirements, controller attestations, bounded Agent authority and human
setup/assistance. This slice changes the local runner only; it authorizes no
fresh conversation, launch or Send.

New cases bind the fixed Lab/regular-Chrome/Claude-Chat lane and public input
pins to a contract. They start unqualified. Qualification records the named
controller's assessment of configuration, permitted control, access,
exclusive input and AX/pixel observation capability. Stage proofs bind fresh
owned captures and an explicit Agent-reviewed AX/pixel agreement to the
current contract/controller/generation. The software cannot establish that a
controller's statements are true, identify pixels semantically without that
review or stop a second program from typing.

Interruption invalidates qualification and retains its bounded reason, actor
and any human assistance. Restoration advances the generation and requires a
new assessment and fresh stage checks. Consumed launch/Send attempts remain
consumed; uncertain Send cannot be retried. Human assistance remains visible
in the final qualification, even if the application interaction subsequently
completes. Cleanup records are bounded and immutable; missing or blocked cleanup
cannot qualify the whole execution contract. Recording cleanup does not perform
it or authorize touching uncertain surfaces. Requested action, controller dispatch and observed application
effect remain distinct.

The current controller interface also resolves the practical review boundary.
`raiseForReview()` awaits Raise without claiming or clicking Send. A subsequent
read-only atomic capture can be returned to the Agent for actual visual review;
`submitReviewed()` then validates that fresh capture, claims once and awaits
its click in one invocation. A short-lived same-session ticket binds the two
phases. This supersedes the earlier all-in-one guidance for an ordinary coding
Agent; unfinished mutations still cannot cross CUA calls. The callback path
remains for controllers that can genuinely supply fresh reviewed captures
within an invocation. No successful live dispatch follows from this change.

Fixed deadline guards reject later actions but do not automatically finalize a
report if the controller is lost. Recovery uses the persisted case/journal and
an explicit finish. Restoration does not extend the deadline. Cleanup recording
is terminal for qualification, native actions and positive observations, with
read/finish still available.

This is implementation and synthetic rejection/recovery checking, not a live
qualification. The earlier 251-test baseline and every already finished
report retain their original meaning; no contract or dispatch evidence is
retrofitted. SDK 0.1.4 source and archive, the unsent Codex draft and production
sites remain unchanged.

All **284 repository tests passed**, with zero failures, cancellations or skips,
after this implementation. They use synthetic snapshots/App handles and
loopback HTTP fixtures; no live Agent, app launch or Send was performed. The
local verification log is `.local/test-bench/execution-contract-tests.log`.
These checks cover contract qualification, fresh stage proofs, interruptions,
assistance, consumed attempts, split Raise/review/Send, cleanup and recovery.
They do not qualify the installed control interface or establish dependable
native dispatch.

## No-Send environment inspection, 2026-10-22

The operator authorized checking the actual desktop environment against the
contract before another Lab trial, expressly without sending anything. This
inspection reserved **zero Agent handoffs and zero Sends**. No normal desktop
case was prepared: the current case API requires explicit Send authorization
and creates a one-handoff/one-Send contract, so it cannot honestly represent
this narrower scope. A separate bounded local assessment records the findings
in `.local/test-bench/environment/no-send-20261022/assessment.json`. It is an
inspection record, not a successful execution qualification or an upgrade to
any historical case.

The installed metadata identifies macOS `26.7.1`, regular Google Chrome
`156.0.8078.47` and Claude `2.37337.1`. These are installed-version findings;
the running client/browser versions were not independently established.
Regular Chrome was explicitly targeted as `com.google.Chrome`; Claude was
targeted as `com.anthropic.claudefordesktop`. Chrome Beta and Codex desktop
were not controlled.

| Check | Actual finding | Limit or remaining condition |
| --- | --- | --- |
| Regular Chrome browser control | One button activation in an owned loopback fixture changed its marker and disabled the button | A browser action/effect sample, not native launch or Send qualification |
| Native Chrome targeting | The owned fixture tab was selected through native control; reviewed paired AX and pixels agreed | Agreement applies to that capture; continuing input exclusivity is not established |
| Claude access and harmless navigation | Native control was readable; the Agent selected Chat once and reviewed agreeing paired AX/pixel state | Mode navigation does not establish Send delivery or source access |
| Claude draft handling | A pre-existing public Lab draft was visible after selecting Chat and was preserved unsent | A fresh empty owned conversation has not been reserved |
| Exclusive input | Unknown | Human setup must reserve the test surface and avoid competing human or software input during the check |
| Running Chrome version | The internal version-page check was blocked by browser policy; inspection stopped without an alternate route | Installed metadata is retained separately; the owned blank version tab was closed |
| Running Claude version | No separate About inspection was performed | Installed metadata only |
| External-app launch permission | Not run | No Lab activation or Agent handoff was performed |
| Send, source acquisition and reply | Not run | Explicitly outside this inspection's authority |

The current result is **partial; execution remains unqualified**. Real browser
input and harmless native navigation now have observed action/effect samples;
they do not settle the previous missing Send transition. No raw private UI,
unrelated conversation content, private conversation identifiers or account
details were retained. The browser fixture screenshot contains the public
fixture only. User/uncertain tabs and the existing Codex draft were untouched.

At that inspection, the operator was asked to preserve the existing Claude
draft as needed, reserve a fresh empty Claude Chat and confirm an interval
without competing input. Confirmation was pending then; it would not have
independently proved exclusivity. Cleanup closed the owned fixture tab and
blank version-check tab and stopped the owned loopback fixture server. The
existing Claude draft was preserved unsent. No additional native action
followed that reviewed Chat sample before the read-only follow-through below.

### No-Send follow-through: remove routine human confirmation, 2026-10-22

The operator clarified that the runner should avoid frequent requests for
control of desktop applications. The additional "Ready" request was redundant
coordination, not a missing grant of app-control authority, and is withdrawn.
The existing direction already covers ordinary permitted no-Send inspection
and setup. It does not authorize a handoff, Send or new live Lab trial.

A fresh read-only Claude inspection did not establish the earlier owned public
draft. The current route was not the fresh `/new` surface, and the known public
draft composer was absent. A primary pane and Claude/Code mode controls were
exposed, but their normalized values did not establish the selected mode.
The reason for this target drift is unknown; no human action is inferred.
No draft was cleared and no native click was attempted in this follow-through.
Neither an empty Chat nor an owned current conversation is qualified.

The current blocker is a stable runner-owned surface and established input
isolation, rather than a pending human confirmation. Input isolation remains
a controller-attributed observation within a bounded check; the runner cannot
independently lock out other software. The assessment preserves the initial
checks and adds these later findings. It retains zero handoffs and zero Sends,
and no raw UI, private conversation identifier or unrelated content is stored.

### No-Send continuation after development setup, 2026-10-22

The operator clarified the distinction between development coordination and
normal runner use: a human developer can prepare the environment and answer
"Ready" while the runner is being built, but repeated manual preparation and
submission must not become the user's ordinary workflow. The earlier withdrawal
above remains a historical finding. The operator then confirmed a fresh empty
Claude Chat and explicitly authorized continuing environment qualification
without sending anything. That confirmation records human development setup;
it does not independently establish input isolation or grant Send authority.

Fresh complete Claude captures passed
[empty-Chat preflight](readiness.mjs) before and after one supported Raise:
the route was `/new`, Claude and Code radio values were `1` and `0`, the
composer was empty and no message or streaming state was found. Reviewed
pixels agreed with AX about that main Chat surface. Complete native captures
required `disableDiffing: true`; the initial incomplete diff and a helper call
without its required current-clock input were rejected before native actions.
No guard was weakened to accept them.

The supported Raise returned and subsequent captures retained the empty Chat.
One harmless AX click on the composer also returned, but its intended focus
effect was **not established**: fresh AX focus remained on a separate embedded
find surface, with no corresponding visible composer caret or focus change.
Main-surface agreement therefore does not establish focus correspondence or
dependable input delivery. The readiness helper does not check focus; its
passing result is a UI preflight finding, not full execution qualification.

The result is **partial-input-effect-unresolved**. Window identifiers supplied
to the adapter are controller-assigned bindings, not independently obtained
native identities. Input isolation remains a bounded controller observation,
with no OS lock against competing input. These samples do not establish a
stable isolated test surface or qualify native Send delivery.

There were **zero handoffs, typing actions, Sends and source calls**, and no
normal trial case was prepared. No new tabs or windows were opened. The
human-prepared empty Chat was retained; the existing Codex draft stayed
untouched and unsent. No raw private UI or unrelated content was retained.
Only these documentation findings and the separate bounded local assessment
were updated; runner code and SDK 0.1.4 stayed unchanged.

### Focus diagnosis and blocked repeat qualification, 2026-10-22

The operator next authorized diagnosing the focus issue, fixing the bounded
runner checks and repeating no-Send environment qualification. From the fresh
empty Chat, one native Escape returned at `10:30:23.109Z`. A fresh complete
paired capture at `10:30:23.596Z` exposed composer focus rather than the earlier
auxiliary find-surface focus. This was a manual diagnostic recovery, not a live
qualification of the subsequently added recovery module.

One separately authorized public typing probe, `agent-art-focus-check`, was
issued at `10:31:02.547Z`. The immediate `10:31:03Z` capture still exposed an
empty composer, but a later fresh AX capture contained the exact marker.
The immediate empty sample therefore did not prove typing failure. No Send
or model execution followed the probe.

A later standalone screenshot showed a different Code surface while AX still
reported the fresh Chat with the marker. This was a controller/target
observation-coherence failure; its cause is unknown. Rebinding the explicit
Claude bundle also showed Code. Native main-window selection was initially
rejected by automatic approval review because the private window had not been
verified. The operator then explicitly authorized limited selection/inspection
and cleanup of only the exact public diagnostic marker. The approved
`Show Main Window` action returned; later pixels at `10:35:21Z` showed the
owned fresh Chat and marker, but complete AX exposed only the app shell, with
no main HTML/composer. Existing handles and a freshly rebound handle had the
same observation limitation. Window identity remained controller-assigned,
not independently established by a native identifier.

One screenshot-based cleanup selection attempt failed with
`noWindowsAvailable`. No clear or Send occurred, and **diagnostic-marker
cleanup is unconfirmed**. The public marker may remain unsent. No new tabs or
windows were opened; no user/uncertain content was cleared. The Codex draft
was untouched. This slice had zero Agent handoffs and zero Sends, one public
typing probe and no normal Send-authorized trial case or source call.

The candidate adapter now retains bounded focus metadata, and a new
[pure focus helper](composer-focus.mjs) separates exposed composer focus from
elsewhere, ambiguous and unavailable findings. The
[bounded recovery module](composer-recovery.mjs) requires a fresh empty owned
Chat, reviewed coherent AX/pixels and positively identified auxiliary focus
before one awaited Escape per instance. Restoration requires a distinct fresh
reviewed capture of the same attributed target. It never types, clears or
sends; a returned action is not proof of delivery. Parser ambiguity checks now
fail closed for footer-like payloads and indexed nodes following the focus
footer. The focused slice passed **34 tests**. The complete `npm test` run
passed **301 tests**, with zero failures, cancellations or skips; the local
log is `.local/test-bench/focus-repair-tests-20261022.log`. These synthetic
checks do not qualify the recovery module's live path.

One supported CUA JavaScript-session reset, followed by a fresh explicit-bundle
Claude handle, still exposed only the app shell. Repeated no-Send qualification
with fresh imports completed at `10:41:53.977Z` and rejected the missing
complete main HTML/composer before any new recovery Escape or other input.
There were zero recovery attempts in that repeat and no further UI trial.

The current outcome is **blocked-controller-target-observation-unavailable**.
Repeat qualification must reject the missing main AX rather than infer a
composer from pixels or reuse the earlier capture. Input isolation remains a
bounded controller observation, with no OS lock. This is an environment/control
boundary, not the earlier approval rejection, missing blanket user authority
or another "Ready" response. The later explicit approval did not restore
dependable observation. Diagnostic cleanup remains unconfirmed and the public
marker may remain unsent. SDK 0.1.4 and its archive remain unchanged; the archive
SHA-256 is `e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430`.
Earlier captures, results and qualification limits retain their original
meaning.

### Controlled native-target repeat with app-wide reservation, 2026-10-22

The operator requested diagnosis of the differing AX/pixel targets and a fix
for native control. An initial fresh complete paired read at `10:46:05Z`
exposed Code in both AX and pixels. That was coherent but not the owned test
Chat; its unrelated draft was not edited. The operator then confirmed other
concurrent Claude use and paused it for a bounded three-minute development
check. This establishes a relevant source of competing control, not the cause
of every historical mismatch or missing accessibility tree.

The controlled interval ran from 18:48:25 to 18:50:55 Asia/Shanghai
(UTC+08:00) on 2026-10-22. The technical capture timestamps below retain their
explicit UTC `Z` form. The interval began at `10:48:25.624Z`. Reviewed AX and pixels agreed
on the owned `/new` Chat containing the exact public `agent-art-focus-check`
marker. One guarded value-clear operation was followed by observed empty
AX/pixel state at `10:48:42.925Z`. Cleanup of that earlier diagnostic marker is
therefore **now confirmed**; the preceding record of unconfirmed cleanup
retains its original meaning.

One click on the currently identified composer was followed by exposed focus
on that same composer at `10:49:26.674Z`. The readiness helper initially
rejected the mode controls despite Claude selected (`1`) and Code unselected
(`0`): the actual Code radio label was `Code, awaiting your input`, a status
variant absent from the existing exact-label allowlist. The helper now accepts
only that additional observed variant, preserving the radio role, enabled
state, selected Claude and unselected Code requirements. Near matches, wrong
roles, missing values and selected Code remain rejected. All 13 readiness
tests passed; the freshly imported corrected helper passed the owned empty
Chat at `10:50:15.760Z`.
The complete repository suite subsequently passed **302 tests**, with zero
failures, cancellations or skips; the local log is
`.local/test-bench/native-binding-tests-20261022.log`. These synthetic and
loopback checks remain separate from the actual native observations.

One public typing probe was issued at `10:50:15.824Z`. The exact marker appeared
in paired AX and pixels at `10:50:16.764Z`. One guarded value-clear operation
at `10:50:31.752Z` was followed by empty-Chat readiness and agreeing pixels at
`10:50:32.685Z`. A freshly acquired explicit-bundle handle then exposed the
same owned empty Chat, complete AX and composer focus; readiness passed at
`10:50:55.321Z`. The interval ended and the operator was released at
`10:50:55.323Z`. The fresh binding observed the same owned UI; it did not expose
an independently authenticated native window identifier.

The current result is **bounded-no-send-passed-under-app-wide-reservation**.
Target observation, composer click/focus, public input delivery, exact-marker
cleanup and empty readiness had observed effects within this controlled
interval. The operator's pause was human development setup. There were zero
Agent handoffs, Sends, model calls and mode switches during the controlled
check. No private Code draft, unrelated conversation or Codex draft was edited;
no new tabs or windows were opened. The owned Chat was left empty. Raw private
AX, screenshots, routes and unrelated text were not retained.

Shared-control interference is the leading working diagnosis because the
operator confirmed concurrent use and the app-wide reserved repeat succeeded.
It is not a demonstrated explanation for every earlier mismatch, nor evidence
that an underlying CUA defect was patched. This result does not qualify
concurrent Claude use, native Send, source acquisition or model execution. It
also does not live-qualify the separate Escape recovery helper, whose path was
not required by this controlled repeat. SDK 0.1.4 and its archive are unchanged.

The native control scope matters: bundle targeting exposes no stable native
window ID here, so competing use anywhere in Claude can invalidate the assumed
test surface. App-wide reservation is required for this interface, rather than
only a promise not to touch the test conversation. Normal runner operation
needs a dedicated interactive test session/environment; repeated requests for
manual pauses must not become its user workflow. Reservation remains a
controller/human setup assertion, not an OS-enforced exclusion of other input.
The reservation is now released, so this interval's pass is historical and its
readiness no longer applies to subsequent actions. Future checks need a newly
reserved app and fresh owned observations; no normal Send-authorized case was
prepared by this inspection.

Terminology clarification: paired captures above use the documented
`getAXStateAndScreenshot()` API with actual Agent review. The historical word
"atomic" elsewhere in this record does not establish that the provider
acquires both observations simultaneously or from an independently identified
native window. The reviewed contents must correspond on each capture. The
readiness label fix is local code; no native-provider patch is claimed.

## Dedicated environment provisioning started, 2026-10-22

The operator agreed to the [MVP scope](MVP-SCOPE.md), requested its recording
and plan update, and authorized starting a dedicated **no-Send** feasibility
check. This is a new prerequisite phase, not another Lab trial or permission
to retry an ambiguous Send. The [setup runbook](DEDICATED-ENVIRONMENT.md)
identifies the selected candidate and remaining operator boundary.

Read-only checks found no Tart CLI/workspace or common VM application in the
standard locations examined. That is not an exhaustive filesystem inventory.
The host reports macOS 26.7.1, 18 GiB memory and hypervisor support
(`kern.hv_support=1`); approximately 160 GiB was free at the initial check.
The restricted sysctl reads failed, while the separately approved unsandboxed
read-only checks returned those values. These are host prerequisites, not a
successful guest boot or resource/load qualification.

Tart 2.41.1 was downloaded into ignored repository-local storage from its
[official release](https://github.com/openai/tart/releases/tag/2.41.1).
The archive matched the publisher's SHA-256
`e680a734febccfce7d4e910c1f7f13fc3b00f19a181c945e2d746de3214c32c2`.
Restricted signature verification could not validate the app; unsandboxed
`codesign --verify --deep --strict` subsequently passed. Its bundled CLI
reported 2.41.1 and exposed the inspected configuration/run options. No global
package manager installation or host GUI interaction occurred.

The public registry manifest for vanilla macOS 26.6.2 was fetched directly.
Its computed and registry-reported digest both matched
`sha256:eeec54bfe1f076e27786c5d92b89187a05b1d109b5071eb2dcdf02d596e34640`;
the manifest declares 23,990,480,836 compressed bytes in 96 layers. A clone of
that immutable image into the private local VM workspace started at
`2026-10-22T11:29:08Z`. At `11:35:01Z` the downloader reported 4%, with
approximately 158 GiB free. This is an in-progress snapshot, not proof of a
completed or verified local image. The continuation configures four CPUs,
6144 MiB memory and a 1440×900 display after a successful clone; it does not
automatically boot the VM or operate any UI.

Software bundles were staged for guest installation, without copying account
state, preferences, browser profiles, credentials or conversations:

| Software | Bundle | Version | Actual finding |
| --- | --- | --- | --- |
| Guest controller application | `com.openai.codex` | 26.1016.61520, build 21421 | Source and staged app signatures verified; not installed/running in a guest |
| Claude desktop | `com.anthropic.claudefordesktop` | 3.1623.1 | Source and staged signatures verified; no guest login or control observed |
| Regular stable Chrome | `com.google.Chrome` | 156.0.8078.47 | Host strict verification was blocked by Finder/resource-fork metadata. Only those two metadata attribute types were removed from the disposable staged copy; its original signature then verified. The host bundle, security attributes and sessions were not changed |

The documented current host CUA interface exposes no guest-host selector.
Reviewing that interface does not prove an available guest controller.
[Official remote connection guidance](https://learn.chatgpt.com/docs/remote-connections)
places Computer Use and permissions on the connected host; a project SSH shell
alone is not guest-native AX/pixel/input qualification. Guest app login,
protected authentication, OS/tool permission grants and any selected host
pairing remain initial operator setup. This phase has not reached that setup
or requested routine human window preparation.

Current outcome: **prerequisites checked; image provisioning in progress;
dedicated no-Send gate not run**. Guest boot, controller availability, guest
Claude target ownership, diagnostic typing/cleanup and host/guest input
independence remain unobserved. Zero guest UI inputs, Lab handoffs, Sends and
Claude inference calls occurred. No host app or browser surface was controlled;
only CUA API documentation was read. No new tabs/windows require cleanup.
SDK 0.1.4 and its pinned archive remain unchanged, the Codex draft remains
untouched and unsent, and no publication/deployment occurred.

Ignored provisioning assessment/logs and staged software live below the local
dedicated-environment directory. They are setup material, not a normal
Send-authorized runner case or an independent witness. A later image-complete
record must not be relabeled as passing guest control. No VM is currently
booted by this provisioning operation.

## Direct image transport verified, 2026-10-22

While the image was still incomplete, the operator requested direct traffic
instead of VPN use. The original download reached 8% before being paused.
Stash's local connection API required authentication. An attempt to reveal its
API secret was rejected by automatic approval review because route inspection
did not authorize credential extraction. No actual secret was revealed to or
captured by the Agent. The installed vendor CLI subsequently provided the
needed route inspection using its own local authentication, without an API
secret being extracted, printed, copied or saved by the Agent.

The selected original image connection was observed on
`pkg-containers.githubusercontent.com`, with a Hong Kong proxy node in its
chain, matching `DOMAIN-KEYWORD,github`; its reported download total was
2,207,079,594 bytes. The registry host's current rule resolved to DIRECT.
These are selected connection/rule observations, not a guess from the presence
of proxy environment variables. Unrelated connections and configuration were
not retained.

Read-only network checks found system HTTP/HTTPS proxying and tunnel-based
DNS/routing. Ordinary DNS returned synthetic tunnel addresses for the source
hosts. Even independently resolved public addresses had a tunnel route, so
environment-variable removal alone could not establish direct traffic. The
original downloader was paused while a per-transfer alternative was prepared;
no global proxy/VPN/DNS/rule selection was changed. Protected API-secret access
was not retried through another mechanism.

Bounded curl samples with proxies disabled, explicit public DNS addresses and
physical-interface binding succeeded directly. Direct registry metadata also
worked. A temporary ignored loopback-only adapter was then prepared for the
single immutable image. Its upstream curl requests all bind `en0`, disable
proxies, resolve the selected public addresses explicitly and retain HTTPS
certificate checks. It validates the pinned manifest, allowed blob identities,
compressed range lengths and destination host. There is no proxy fallback.
The adapter's eight in-memory tests passed; those tests are separate from
the actual transfer checks below.

Before the switch, an actual local manifest fetch matched
`sha256:eeec54bfe1f076e27786c5d92b89187a05b1d109b5071eb2dcdf02d596e34640`.
An actual 509-byte metadata blob also matched its declared SHA-256. The
original process identity was revalidated, then it was stopped with SIGTERM
and resumed only to deliver that pending termination, rather than invoking
Tart's SIGINT cancellation cleanup. Its partial image remained present and
was copied for the loopback source's cache identity. This preserves a
checkpoint; Tart's layer-hash checks, rather than the copy operation, decide
which completed ranges can be reused.

The direct clone began at `2026-10-22T12:00:20Z` from a loopback registry
address carrying the same manifest digest. HTTP is permitted solely for
that loopback leg; external requests remain verified HTTPS. Four actual curl
workers connected to the CDN's public address. macOS `nettop` observed two
selected workers' sockets on **`en0`**, with respectively 1,470,365 and
1,535,419 received bytes at the sampled check. These are actual image-body
transfers on the physical interface, not only configured flags or a metadata
probe. The clone log had advanced to 2% after the transport change; it is a
new progress counter, not proof that all original 8% was retained.

Current outcome: **image transfer resumed over verified direct-only transport;
image incomplete; guest no-Send feasibility not run**. The local continuation
configures the guest only after a successful clone and requests shutdown of
the owned adapter afterward. It does not automatically boot a guest, invoke
Claude or touch the Codex draft. Temporary settings/dialogs opened for routing
inspection were closed or canceled without saving changes. No new browser tab
was deliberately created. The existing Stash main window was left alone.
SDK 0.1.4, its archive and installed app profiles remain unchanged; no
publication/deployment occurred. Earlier provisioning observations retain
their original meanings.

## Dedicated prerequisite recheck and segmented transfer, 2026-10-22

The operator requested another download check and continuation of the same
dedicated no-Send gate. The image was incomplete: the original direct clone's
latest log showed 6%, four transfer retries and no completed local VM in the
runtime inventory. Four actual image workers were still receiving CDN bytes
on the physical interface. Four earlier upstream streams had each ended short
at 30 MiB; neither the uniform size nor ongoing traffic establishes the cause
or eventual download completion.

The temporary ignored adapter was narrowed to available-byte forwarding in
reads of at most 64 KiB and individually validated upstream ranges of at most
8 MiB. Its thirteen in-memory checks passed, including range coverage, partial
streaming, one downstream response, later-segment failure and fail-closed
cleanup. A separate loopback-only live probe used a 1 MiB segment limit and
received exactly 2,097,153 bytes over three ranges. The pinned manifest and a
complete small metadata blob matched their expected SHA-256 digests. An actual
probe socket used the physical interface. The range's recorded hash binds the
received sample only; it is not a verified complete-layer digest. Segmentation
is a tested bounded mitigation, not an established explanation or full-image
fix.

The old owned downloader was stopped without SIGINT and its existing temporary
checkpoint remained present. The probe listener and old adapter were stopped.
The new continuation resumed the same pinned source using the same loopback
cache identity. Four new image sockets were observed on the physical interface;
the new progress counter had reached 3% at that sample. This does not assert
retention of all earlier 6%. There is no VPN fallback or global routing change.
The continuation configures the guest only after a successful clone, stops its
owned adapter afterward and never boots the guest automatically.

Other prerequisite checks can proceed before completion. Staged controller and
Claude executables are ARM64; stable Chrome includes ARM64. All three declare
macOS 13 minimum, which fits the pinned guest's macOS 26.6.2 at the metadata
level. No guest application launch is established. Installed runtime help
confirms the selected default shared NAT, disabled clipboard/audio/USB and
read-only app-bundle share flags. Available host storage was about 156 GiB at
this check.

Official [remote connection documentation](https://learn.chatgpt.com/docs/remote-connections)
describes connected-host Computer Use where that feature is available; an SSH
shell alone does not establish native control. The
[Computer Use documentation](https://learn.chatgpt.com/docs/computer-use)
describes controller enablement, OS permissions and app approvals. Neither
document qualifies this particular macOS guest. Actual guest sign-in,
protected setup and guest-local AX/pixel/input checks remain pending.

Current outcome: **direct clone active; image incomplete; dedicated no-Send
gate not run**. No guest boot, guest UI input, Lab handoff, Send, Claude
inference or host-app control occurred. The SDK 0.1.4 archive still matched its
pinned SHA-256 and its tracked SDK paths had no changes. The existing Codex
draft remained untouched and unsent. No publication or deployment occurred.

## Resume audit: retained chunks versus displayed progress, 2026-10-22

The operator questioned the new 3% counter after the earlier 6%. A read-only
audit checked the first sixteen disk chunks against the pinned manifest's
uncompressed SHA-256 annotations. Seven matched: manifest layers 1–6 and 8,
totalling 3,758,096,384 uncompressed bytes and representing 1,577,032,482
compressed bytes. This is **6.58% of the compressed disk stream**, already
present in the retained file. It is a sampled lower bound, not a full-disk
audit or evidence of image completion. Mismatches include incomplete and
potentially concurrently written chunks.

The same loopback cache identity and disk inode were retained across the latest
restart. The pinned
[DiskV2 source](https://github.com/openai/tart/blob/2.41.1/Sources/tart/OCI/Layerizer/DiskV2.swift#L85-L219)
preserves an existing disk, hashes complete chunks and skips matching content.
A new process starts an incomplete chunk's compressed offset at zero; retries
within its running task retain that offset. Thus this is **completed-chunk
resumption with possible partial-chunk retransfer**, rather than starting the
whole image again or guaranteeing byte-for-byte continuation.

Each pull creates a new progress counter, and concurrent tasks update its
shared completed-unit value. The exact reason that this invocation displayed
3% despite the verified retained content is not established; a lost-update
explanation remains a hypothesis. The display must not be reported as total
verified progress. No downloader restart or progress patch followed this
audit. The active direct-only clone continues; guest boot, handoff and Send
remain unperformed. SDK 0.1.4, the Codex draft and deployment remain unchanged.

## Zero-Send diagnostic and external authority implementation, 2026-10-22

The operator authorized completing two implementation tasks while the direct
image download continues without more restarts. The dedicated
[diagnostic workflow](NO-SEND.md) now creates a distinct contract whose
maximum handoffs and Sends are both zero. It generates one public marker and
offers only bounded composer focus, marker typing, exact-marker clearing and
separate effect inspection. Each input is durably claimed once before its
native call. Fresh owned Chat checks, current exposed focus before typing,
exact content before clearing, current generation and reviewed AX/pixel
agreement are required. An API return supplies no effect finding.

Interrupted, stale, mismatched or unexpected content blocks input. Pending
calls cannot restore qualification after interruption. Recovery preserves input
claims; a fresh marker observation may permit the still-unused clear without
retyping. Reports retain uncertain cleanup, interruptions and attributed
recovery. Operator-reported host independence cannot become a controller
observation, and a recovered diagnostic cannot become an uninterrupted pass.

New Lab and diagnostic cases now require an explicitly bound external
filesystem store. It holds canonical case state, claims, dispatch entry,
reading records, bounded materials and final reports; workspace browser files
are disposable projections. Writes use exclusive creation or atomic replacement
with file/directory synchronization. Missing or changed store identity blocks
actions without recreating authority. Earlier workspace-local cases remain
historical and read-only rather than being migrated or gaining new attempts.

Explicit reconciliation reads canonical records, retains fixed deadlines and
terminal status, and invalidates earlier qualifications/captures. A stale lock
may be abandoned only after the controller attests the previous controller
stopped and input is exclusive; the old lock is retained. This is not an OS
exclusion guarantee. The physical placement outside a guest baseline and the
filesystem/authority owner remain trusted setup requirements.

The full repository regression suite passed **322 tests**, with zero failures,
cancellations or skips. These include filesystem workspace-snapshot restore,
an actual child-process exit after durable claim creation, stale-lock recovery,
preserved Send/dispatch attempts and closed cases, rejected old capture proofs,
no-Send input limits, changed-draft cleanup rejection and late-call interruption.
The first restricted full-suite run could not bind loopback listeners; the
successful run used approved loopback access. All clients and model activity
in these checks were synthetic fixtures; no desktop interaction or inference
was performed. These results do not qualify actual guest control or VM restore.

A host-only persistent authority store was initialized outside the repository
and bound to this workspace. Its identity matched the saved reference; it had
zero cases and no active reservation. No diagnostic or Send case was started.
The guest share and guest binding remain unconfigured until guest setup.

The SDK 0.1.4 implementation and pinned archive remain unchanged. The existing
Codex draft remains untouched and unsent. No real Lab handoff, guest boot,
desktop input, publication or deployment occurred in this slice. No download
process, transport or cache identity was restarted or changed.

## Next target: dedicated environment no-Send feasibility

Finish and inspect the pinned clone, then establish and qualify a permitted
controller inside the dedicated guest. Boot/setup progress, guest-native
observation/control, bounded marker delivery/cleanup and input independence
while host apps are used remain separate gates. Stop at protected setup or
missing control; do not substitute another shared-host trial or a host Agent
clicking the VM viewer. Record assistance and actual effects. The earlier
reserved-host pass and cleared public marker retain their historical meaning;
they cannot qualify the guest. Any later application trial needs separately
bounded Send authorization. SDK 0.1.4 remains unchanged.

Reliable native Send dispatch and acknowledgement remain the next application
acceptance conditions, followed by owned source-result inspection. Preserve
both ambiguous cases without another Send. Source evidence must come from an
actual owned expanded tool-result region and its named public URL/identity,
or a selected inspected denial. Unavailable control or extraction stays
`not-observed`; the assistant's prose cannot replace it. Keep composer,
submitted message, source access and reply completion separate. No additional
live trial follows from this plan.

## Evidence limits and cleanup

Synthetic guards and fake CUA handles do not qualify a real desktop path.
Actual source retrieval, response completion and exact submitted context must
be observed separately in an owned fresh conversation. No CLI or API execution
is substituted for desktop interaction. No model origin, comprehension or
private intention is established by GUI observations.

The earlier `markHandoff` was unavailable, so retention across that turn was
not guaranteed. After reconnect, the old owned tab `923808689` was closed as
recorded above. Manage Extension activated a Chrome Extensions page that may
have reused an existing tab. Its ownership was uncertain, so it was left alone.

A final public report screenshot was saved as `final-report.png`. Reads and
clicks worked through provider `4`, but `markDeliverable` failed with a request
to update the ChatGPT extension; keep-tab marking was unsupported at the
installed version. The report tab was last observed open; retention across
the turn is not guaranteed, and no successful preservation mark is claimed.

At the end of the sixth case, its owned fresh Claude Chat draft was left
unsent for review and no additional Send had been attempted at that point.
That historical outcome remains unchanged by the later continuation.

The earlier completed case's public bench-only screenshot is saved locally as
`report.png`. Its submitted owned Claude conversation is retained for review;
no conversation deletion is implied. On 2026-10-22, after saving the screenshot,
the controller successfully closed both the latest regular Chrome report tab
and the earlier known-owned sixth-case report tab. Uncertain/user-owned tabs
were left alone. Retention marking remained unavailable with an
extension-update message. The existing Codex draft remains untouched and
unsent. No private transcripts or unrelated conversation content were saved,
and production sites remain untouched.

For the later readiness trial, the public bench report screenshot is saved as
`report.png` in that case's ignored directory, and owned regular Chrome report
tab `923808726` was closed. Cleanup of its public unsent Claude draft is
**unconfirmed; the draft may remain**. Setting the freshly verified draft's
value failed with an invalid-element-ID error. After the controller raised
the window and captured fresh state, a different Claude surface was exposed;
it stopped mutations rather than touching another draft. Unrelated visible
content was not saved or used. The Codex draft and other user drafts remain
untouched, and no additional Send was attempted.

For the separately authorized additional case, public bench-only `report.png`
and `result-stages.png` were saved in the ignored case directory. The latter
shows the stage outcomes. Owned regular Chrome report tabs `923808730` and
`923808734` were closed, and the owned loopback server was stopped. The second
tab only reviewed the report; it did not activate the component or Send. The
owned public Claude draft remains
**unsent and retained for review**; no cleanup or conversation deletion is
claimed. The existing Codex draft remains untouched and unsent. No SDK change,
deployment or publication followed this trial.
