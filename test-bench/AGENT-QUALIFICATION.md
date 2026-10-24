# Agent-operated runner observations

Started: 2026-10-21. Updated: 2026-10-24.
Candidate local runner. One actual Lab → Claude interaction, including Send
and a completed introduction, is now observed under the named presentation
policy. Exact submitted-text fidelity and source acquisition remain
unestablished; the strict component path is not qualified. A later authorized
case passed new readiness checks but ended after one native Send attempt with
no observed sent transition. Its sources and reply were not run.

The dedicated guest now also has a separately authorized
[one-Send application result](#guest-lab-one-send-application-trial-2026-10-24):
the real component handed off a public draft, one Send returned, a user-message
transition and completed introduction were observed, and the expanded raw-index
request reported a CONNECT 403 denial with zero bytes. Exact submitted-text
fidelity and successful WebFetch acquisition remain unverified, so strict
qualification is incomplete. The earlier
[draft-only finding](#guest-chrome-and-lab-draft-only-handoff-2026-10-24)
and all historical host/guest cases retain their original outcomes and limits.

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

## Completed direct image and bounded first boot, 2026-10-23

The existing direct-only continuation completed at 01:24 Asia/Shanghai with
clone exit code zero and configuration exit code zero. Its original process
record and start time were retained; no download restart followed the
operator's instruction. The finalized local VM and pinned OCI cache entry were
both listed as stopped before first boot. The local guest configuration was
ARM64, four CPUs, 6144 MiB memory and a 1440×900 display. Its disk had a
50,000,000,000-byte logical size. Successful clone finalization is separate
from the earlier sampled retained-chunk lower bound and process counter.

The owned VM was then booted for this no-Send feasibility slice with shared
NAT, clipboard/audio/USB sharing disabled, the staged application share
read-only and only the selected external authority directory writable. No
personal home, browser profile or credential store was mounted. Tart listed
the guest as running, and a read-only console screenshot showed the guest
desktop. Host CUA exposed only the Tart window and its controls; it did not
expose guest-native Claude accessibility or establish a guest controller.
No clicks, typing or other guest UI input were performed.

The prebuilt image displayed a restored terminal containing historical
security-setting commands. They were not executed or treated as instructions;
the guest's effective security baseline remains unverified. Do not infer a
normal personal-device security posture from the vanilla image label.

An ignored offline kit was staged on the read-only app share: the committed
repository snapshot, unchanged SDK 0.1.4 archive and qualified installed
consumer files/lock, plus setup instructions. It excludes host authentication,
conversations, profiles, authority binding and VM/download state. The guest
Node.js runtime and extracted workspace remain unqualified. No source or SDK
bytes were changed to build the kit.

The no-Send gate remains **blocked at guest controller/account/permission
setup**. The operator must handle protected sign-in and OS/tool grants inside
the guest, and a guest-local or supported paired controller must be established
before diagnostic input. The writable authority share was supplied at VM
launch; actual guest mount access, store identity, durability across restore
and guest workspace binding remain unverified. The host authority store still
had zero cases and no active reservation; no diagnostic was prepared.

SDK 0.1.4 and its pinned archive were unchanged. The existing Codex draft was
untouched and unsent. No Lab handoff, Send, Claude inference, publication or
deployment occurred. The idle guest was stopped while waiting for setup, then
reopened with the same shares after the operator selected setup now. Its
console is intentionally left available at that explicit request; no download
was restarted. Protected setup remains pending. The offline kit was extracted
into a temporary host fixture and passed `loadBenchInputs` against the exact
archive and dependency lock. That host check does not establish guest execution.

## Agent-assisted guest application setup, 2026-10-23

The operator explicitly asked the Agent to perform guest setup. Host CUA was
used through the owned VM console for Finder operations only, followed by
launching the installed Claude application. This is authorized provisioning
assistance, not the guest-native controller required by the no-Send contract.

Guest Finder exposed the two selected mounted-share folders. The read-only
application folder contained ChatGPT, Claude, regular stable Google Chrome
and the offline runner kit. Only the three application bundles were selected
and copied to the guest Applications folder. Finder displayed a 4.71 GB copy,
then the progress dialog disappeared and all three bundles were visibly
present in Applications. No host account data, preferences or browser profile
was copied. Installed guest versions/signatures were not independently read;
the earlier staged-bundle verification retains its narrower meaning.

Launching that installed Claude produced an application window displaying
`ERR_CONNECTION_CLOSED` and automatic retry before sign-in. This establishes
launch and a visible connectivity failure, not usable account access or a
network-route diagnosis. A read-only host proxy inspection supplied no usable
configuration details. No VPN/proxy/DNS setting was changed, no bypass was
attempted and the completed image download was not restarted.

Controller authentication and protected OS/tool grants still require operator
setup. ChatGPT itself was not automated through the viewer. No credential was
entered, no protected permission was approved, and no Claude composer or Send
was used. Guest authority mount identity/writeability, workspace/runtime,
guest-native AX/pixels and input independence remain unqualified. No diagnostic
case was created. The owned VM console is left open at the operator's request.
SDK 0.1.4, its pinned archive and the host Codex draft remain unchanged; no
publication or deployment occurred.

## Guest SSH provisioning and authority-share diagnostics, 2026-10-23

The existing VM remained running. Its selected private IP accepted SSH using
the image vendor's [documented default account](https://tart.run/quick-start/).
The connection ignored host SSH configuration and used no host user keys or
agent forwarding. A separate known-hosts file retained the
first observed key. This is trust on first use, not cryptographic proof binding
that SSH key to the image digest. No host credential or account data was copied.

Read-only guest checks observed macOS 26.6.2 build 25G83, ARM64, Claude
3.1623.1, stable Chrome 156.0.8078.47 with `com.google.Chrome`, and controller
26.1016.61520. Deep strict signature verification succeeded for all three
installed bundles. That checks bundle integrity; it does not establish
Gatekeeper/notarization acceptance or the effective security posture.
The installed controller's bundled Node reported v24.21.0.
`spctl --status` reported assessments disabled. That actual baseline must be
resolved before signing in; the vanilla-image label is not a security guarantee.
No Gatekeeper, permission or credential setting was changed.

The guest had no explicit system HTTP/HTTPS proxy and inherited DNS responses
in the host proxy's synthetic address range. Public Lab HTTPS returned 200 with
certificate verification passing. Claude and another public HTTPS probe closed
during TLS. A bounded Claude request explicitly using the already-running host
proxy completed verified TLS and returned a Cloudflare challenge response, as
did the host comparison. This supports a usable proxy transport for that probe;
it establishes neither Claude login nor the exact cause of the app failure.
The host proxy's existing domain rules selected a proxy route for Claude and
DIRECT for Lab. No rules, listeners, host VPN, DNS or proxy settings were changed.
Automatic approval review rejected persistent guest proxy configuration because
that routing change lacked specific authorization. Operator approval was
requested; the guest setting remained unchanged during these checks.

The verified offline source and SDK archives were extracted into a fresh
guest-local workspace. `loadBenchInputs` passed there against the unchanged
SDK 0.1.4 digest, installed file hashes, dependency lock, Work and exact 983-byte
Lab invitation. The guest checkout was bound to the mounted external authority
store after its identity matched the selected host store. No case or active
reservation existed. A uniquely owned guest probe was written and synchronized;
the host observed its exact content, removed it and synchronized its directory.
The application share rejected an owned guest write probe with `EPERM`.

The first guest check still reported the host-deleted probe present. A later
content read returned `ENOENT`. A second host-created probe was read correctly
in the guest. After the host deleted it, a bounded guest sample exposed a
stronger disagreement: content reads returned `ENOENT` while `existsSync` and
`statSync` continued reporting the previous file and inode. Six samples at
two-second intervals retained that disagreement through the end of the sample.
Both probes were confirmed absent on the host after cleanup. This blocks the
share as canonical mutable authority storage; successful synchronization and
workspace binding do not qualify coherent revocation, locks or attempt claims.
No VM restore was attempted. The exact cache mechanism remains unestablished.
[Tart's reported host/guest stale-file issue](https://github.com/cirruslabs/tart/issues/1271)
corroborates this failure class but is not proof of this observation's cause.

All these actions were provisioning/filesystem/network diagnostics. No guest
GUI controller, AX/pixel pair, marker delivery, cleanup or independent input
was qualified. No diagnostic case, Lab handoff, Send or target-Claude inference
occurred. SDK 0.1.4 and its archive were unchanged, the host Codex draft was
untouched and unsent, and no publication or deployment occurred. The VM console
remains open at the operator's request. The completed image was not restarted.

## Approved guest-only proxy configuration, 2026-10-23

The operator explicitly approved the pending VM-only HTTP/HTTPS proxy change.
Both guest Ethernet settings were initially disabled with no server configured.
The supported guest network configuration tool enabled them against the
already-running host proxy, and fresh guest reads confirmed the configured
values and enabled states. No host proxy/VPN/DNS/routing rule or listener was
changed. Disabling the two guest proxy states restores the previous operational
routing choice; the observed before/after settings are retained privately.

Two bounded OS-native `nscurl` HEAD probes then used NSURLSession without an
explicit proxy argument, insecure TLS options or authentication. Lab returned
HTTP 200; Claude returned HTTP 403, consistent with its earlier web challenge.
Both commands completed successfully. This qualifies those configured-system
transport probes, not Claude login, its application session or source reading.

The owned console still displayed Claude's old `ERR_CONNECTION_CLOSED` screen.
Two coordinate attempts to activate Reload returned `noWindowsAvailable`.
Rebinding the owned Tart application gave fresh matching window/read access,
but did not restore coordinate input. Tart's own View menu could be opened by
AX and was cancelled without changing display mode. No successful Reload,
guest keyboard event or application reconnection is claimed. No alternative
UI automation or shell-driven app manipulation was substituted.

Gatekeeper assessments remain disabled. The earlier setup recommendation is
not a technical prohibition on sign-in or a universal protocol requirement.
Apple's ordinary supported [Gatekeeper setting](https://support.apple.com/en-au/102445)
is a separate security-baseline choice; any protected authentication or OS/tool
permission grant stays with the operator. This proxy approval does not authorize
those changes. The stale authority-share finding is unchanged, and no case,
handoff, Send or Claude inference began. SDK 0.1.4, its archive and the host
Codex draft remain unchanged. The VM is left open; no deployment occurred.

## Read-only guest controller bootstrap prepared, 2026-10-23

The standing plan and findings were reviewed before this slice. The immediate
acceptance target is now the [guest controller's read-only gate](GUEST-CONTROLLER.md):
two fresh, coherent guest-native Claude AX/pixel observations, with no target
input. The first route to test is a controller task running inside the guest
desktop app. This host session has no verified selector for guest CUA.

Current official [Computer Use setup](https://learn.chatgpt.com/docs/computer-use)
documents the desktop plugin and separate guest OS/app permissions.
[Remote connections](https://learn.chatgpt.com/docs/remote-connections)
documents device pairing separately from remote SSH project files and shell.
Neither establishes that our particular ARM macOS VM is eligible or that this
already-running host chat can select its Computer Use. Those remain live
checks. A guest-local task avoids assuming that pairing or chat movement works.

An isolated documentation overlay containing the current runner gates and
read-only controller prompt was copied into the existing guest workspace.
The archive digest matched in the guest and the installed controller-guide
digest matched the host source. It contains no SDK files, credentials or
account data; the earlier source/SDK archives were preserved. Operator setup
was requested for the guest controller's sign-in, plugin and OS grants. Those
protected steps cannot be substituted by host viewer automation. This is
one-time environment commissioning, not manual Send during normal test runs.

No guest controller result has been observed. No diagnostic case, authority
write, guest UI input, handoff, Send or Claude inference occurred in this
slice. The writable authority mount remains unqualified, and its case count
remains zero. SDK 0.1.4 and the existing Codex draft are unchanged. No download
restart, deployment or publication occurred. The VM remains available for the
operator setup.

## Reported controller sign-in and prepared setup shortcuts, 2026-10-23

The operator reported completing guest sign-in and requested that the Agent
handle remaining configuration. That is operator-reported sign-in, not an
observed authenticated controller or granted Computer Use permissions.
The available plugin-management tools were checked for a supported guest
configuration route; discovery returned no usable Computer Use installation
or guest-server/skill configuration capability. This is a limit of the checked
tools, not proof that no other product capability exists.

Official [setup](https://learn.chatgpt.com/docs/computer-use) still places the
plugin/server/skill switches in the desktop application. The explicit
[local security boundary](https://learn.chatgpt.com/docs/enterprise/chatgpt-work-local-security)
excludes automating ChatGPT itself and OS security grants. No viewer input,
internal API, credential/config copying or permission-database change was
used to bypass that boundary.

The Agent created a named setup folder on the guest desktop. It contains a
short setup card, a settings shortcut and a workspace-bound read-only task
shortcut using the [documented deep-link forms](https://learn.chatgpt.com/docs/reference/commands).
The prepared task's URL encoding round-tripped, and its guide digest matched
the installed verified guide. These files were created through scoped guest
filesystem provisioning; neither shortcut was opened or submitted. Their
contents contain no credential and do not auto-send. Creation does not qualify
the links' actual UI behavior, plugin enablement or account eligibility.
Both `.webloc` files passed guest property-list validation. A fresh bundle
metadata read declared controller version 26.1016.62342, newer than the earlier
26.1016.61520 observation. The cause of that change was not observed; do not
reuse earlier bundle verification or client qualification for changed bytes.
Fresh deep strict integrity verification of the current controller bundle
subsequently succeeded; guest GUI capability remains unqualified.
The read-only controller result file was absent at inspection.

Guest-native CUA remains unobserved. No case, authority mutation, target input,
handoff, Send or Claude inference occurred. The guest's previously approved
HTTPS proxy setting was still enabled. SDK 0.1.4, its archive and the host
Codex draft remain unchanged; the completed image was not restarted. No
deployment or publication occurred.

## Reported guest permissions and controller-start boundary, 2026-10-23

After the macOS permission-location clarification, the operator indicated that
the requested grants were available. This is recorded as operator-reported
guest permission completion. No permission database was read or modified,
and no repeated grant or login request is selected without an actual failure.

A scoped guest read found no read-only controller result file. Current host
tool metadata still listed only the local destination; no verified guest-CUA
route appeared. OS grants inside the guest do not establish that this host
chat can select its controller. The prepared task must be commissioned once
inside the guest, or a supported paired route must be established separately.
The operator was asked whether the prepared guest task had started, rather
than to find a Claude window, grant permissions again or Send in Claude.

An independent read-only code review proposed host-native named authority
transitions for one no-Send case, with guest-local CUA and reports remaining
separate. Generic remote filesystem CRUD would retain freshness/race hazards.
Lost acknowledgments must not recreate input permits; deadlines, generations,
consumed claims and restore reconciliation remain host-owned. This is a future
design recommendation after the controller gate, not implementation or live
qualification. No listener, capability, endpoint or security setting was created.

No guest-native observation result, case, marker, handoff, Send or target-Claude
inference was observed in this slice. SDK 0.1.4 and the host Codex draft remain
unchanged; no deployment or download restart occurred.

## Finder shortcut rejection and plain-text repair, 2026-10-23

The operator supplied a screenshot of Finder reporting that the document
could not be opened because its content was unreadable or in the wrong format.
The earlier `.webloc` files had passed property-list validation, but their
actual opening behavior had never been qualified. The screenshot establishes
a failed file handoff, not a failure of granted permissions or guest-native
CUA. The exact failing dispatch/handler layer remains unestablished.

The Agent added a plain UTF-8 prompt to the owned guest desktop setup folder.
It contains the exact prepared controller-guide prompt with the owned guest
workspace made explicit. Direct guest reads verified its 2,132 bytes,
UTF-8/LF/no-BOM content and source-guide digest. This avoids relying on the
unqualified URL shortcut for commissioning. It does not auto-open ChatGPT,
send a task or qualify an application's ability to open the file.

Both old shortcuts matched their recorded hashes and were moved into a
separate unqualified-shortcuts folder for preservation. The known unchanged
setup card was updated to name the text prompt and avoid repeated sign-in or
permission grants. No URL handler, security setting or native route was changed.
The operator can copy the prompt inside the guest and commission its controller
once; no new instance should be started if one is already running.

No controller result, diagnostic case, marker, handoff, Send or target-Claude
inference was produced by the repair. The authority share remains unqualified.
SDK 0.1.4 and the host Codex draft are unchanged. No download restart,
publication or deployment occurred.

## Submitted guest controller and duplicate-exposure repair, 2026-10-23

The operator submitted the prepared read-only prompt inside the VM. A scoped
guest read collected its actual bounded result and preserved a host copy.
The original report is **blocked**, with **zero** paired native observations;
its SHA-256 is
`c5631143c160ea1aa7e8e316ae068f72a8f9edc0a2dfe74f5fcf7190177ab42b`.
It records a documented CUA API, but selecting Claude by bundle identity found
both installed and mounted source copies. Selection by the verified installed
path then timed out with a reported kernel reset. Neither call returned usable
app state or pixels. No Claude surface, app permission or Chat readiness was
established. The report attributes its controller execution to the virtual
guest using OS and owned-workspace checks; this is not independent locality
attestation. Saving the report required a filesystem permission grant.

Fresh installed metadata declared Claude version 3.6556.2, compared with the
earlier observed 3.1623.1. The change mechanism and running-process build were
not established. Fresh deep strict verification of the installed Claude
signature passed. Controller metadata remained 26.1016.62342 and regular Chrome
156.0.8078.47. Earlier integrity checks do not qualify changed application bytes
or their native-control behavior.

The running Claude and controller executable paths were observed under the
guest's installed Applications directory; no executable from the shared source
folder was observed. Only filtered executable paths were read, without process
arguments or private app content. The unused staged software bundles were then
preserved outside the exported installer folder. Guest directory enumeration
no longer listed those apps, but direct `stat` and `lstat` still exposed old
directories and their content reads failed. This repeated metadata staleness
meant host-side removal alone did not establish guest absence.

A normal, non-forced unmount of the temporary shared volume succeeded. Fresh
guest checks then returned `ENOENT` from both `stat` and `lstat` for all three
source app paths, while installed app metadata remained present. This removes
duplicate filesystem exposure, not necessarily a CUA inventory cache. It does
not establish that duplicate apps caused the installed-path timeout. No app,
VM or download restart occurred, and installed bundles were not modified.

Unmounting also makes the already-unqualified external authority mount
unavailable. Its host-owned records remain preserved; the last direct host
check found zero cases and no active reservation. No storage-coherence or
restore qualification is claimed. A case or diagnostic marker remains blocked.

The next acceptance is one fresh documented guest-native selection followed
by two complete, coherent AX/pixel observations of the same attributable
Claude surface. Stop at ambiguity, timeout, incomplete or inconsistent state,
or a protected prompt. Even a connection-error surface can pass observation
feasibility, but cannot pass Chat readiness. The original blocked report must
remain intact, and a recheck uses a separate result file. A prepared plain-text
continuation is a setup handoff; it is not an observed automated continuation.

No case, reservation, claim, marker, Claude input, handoff, Send or target-Claude
inference occurred in this slice. Guest-native CUA, canonical authority,
keyboard delivery, cleanup, independent input, restore and Lab reading remain
unqualified. SDK 0.1.4 and the existing host Codex draft remain unchanged; no
deployment, publication or download restart occurred.

## Recheck submitted with result still missing, 2026-10-23

The operator reported submitting the read-only continuation. A bounded
150-second poll found no new result at the requested owned report path. A
later direct guest check also found neither that file nor a same-named report
at the owned workspace root. The original blocked report remained unchanged.
The temporary installer/authority volume remained unmounted.

Filtered executable-name checks found both installed controller and Claude
processes. No process arguments, private configuration, histories, raw UI or
unrelated files were read. Executable presence establishes neither task
progress nor app-window visibility. The operator reported seeing the guest
desktop and was unsure whether the task had finished. The recheck's outcome
therefore remains **unknown**, not another confirmed CUA failure. No new
selection or trial was started. The operator was asked to return to the
existing guest controller chat and provide its last reply or status; this host
has no verified guest-task result API and does not automate the controller UI.

This exposes a missing diagnostic result channel. Future commissioning must
write bounded per-attempt acceptance/start before CUA, followed by phase,
update time, terminal status and result identity or a bounded error. This
requirement is recorded in the [controller guide](GUEST-CONTROLLER.md#result-channel-requirement-exposed-by-commissioning);
it is not implemented, not action authority, and not retrospective evidence
for this task. Missing or stale status must not renew attempts.

No target-Claude input, handoff, Send, marker or diagnostic case occurred.
SDK 0.1.4 and the existing host Codex draft remain unchanged. No deployment,
publication or VM/download restart occurred.

## Operator-provided recheck final reply, 2026-10-23

The operator returned to the existing controller task and supplied a screenshot
of its final reply. It reports that the one fresh installed-path CUA selection
timed out again, returning zero paired observations, with cause unestablished.
It also reports preserving the original result, verifying installed Claude
3.6556.2 without establishing the running build, and performing no UI input
or Send. It links an 81-line edited JSON report by filename.

The linked JSON was absent from the checked owned guest workspace/setup paths.
A bounded exact-filename search in the guest's generated visualization-artifact
directory also found no match. No private configuration, histories or unrelated
file contents were inspected. The operator was asked to paste the existing
linked JSON, without another task or target-client action. The final reply is
operator-provided evidence of the reported blocked outcome; detailed error,
report bytes and recheck execution locality remain unverified. Do not infer
that the underlying cause is VM incompatibility, permission denial or the
protocol. New native selections, marker work and live trials are stopped.

The earlier result-missing observation remains historical, not a contradictory
claim about a completed test. A filename-only result link has not supplied a
verified guest filesystem path. This reinforces the diagnostic status/result
channel requirement; executable liveness and a prepared prompt cannot stand
in for task acceptance, progress or completion.

No new CUA selection, target-Claude input, Send, handoff or diagnostic case was
performed during collection. SDK 0.1.4 and the host Codex draft remain unchanged.
No deployment, publication or VM/download restart occurred.

## Direct guest task connection and collected results, 2026-10-23

The operator rejected using the human as a repeated relay for guest task
instructions and results. The Agent established a private SSH control session
and inspected the installed CLI's documented app-server interface. The default
proxy reported no running control socket. A standalone stdio app-server reader
then initialized successfully inside the guest, using CLI 0.163.0-alpha.11.2
on macOS 26.6.2 ARM64. No network app-server listener, model turn, new task or
controller message was created. The guest task was not resumed.

An exact-name API search found the existing **Check guest controller
feasibility** task. Its metadata supplied a dated Codex workspace distinct
from the requested repository. Stored turn reads returned all three completed
turns, including the final diagnostic reply and the recheck's actual outputs
path. Earlier filesystem checks had not covered that path. The difference was
the task's writable workspace, not evidence that the report was missing or
that execution happened in the cloud. Host desktop project registration and
guest task/result access are separate capabilities.

The recheck report's exact 3,402 bytes were collected and preserved. SHA-256:
`ccbf3afcd247ef624cc30e86a88a42230f4f27db820cfa0939da6fb55d4fee12`.
This matches the digest in the existing diagnostic turn's command output.
The original report still matches
`c5631143c160ea1aa7e8e316ae068f72a8f9edc0a2dfe74f5fcf7190177ab42b`.
The recheck records one fresh `cua.getApp('/Applications/Claude.app')` attempt,
`js execution timed out; kernel reset`, no returned documentation, no further
CUA calls and zero paired observations. Its local OS/workspace basis identifies
the virtual guest but is not independent VM attestation. Saving under the
task's permitted outputs directory avoided another write-permission request.

The stored CUA tool items were also inspected without another call. Both
installed-path selections have failed MCP items with telemetry error code
`execution_timeout`: the original lasted 57,114 ms and the fresh recheck
34,888 ms. The recheck arguments contain only the installed-path `getApp`
entry point, with no explicit timeout override. These records establish the
reported failure boundary, not the internal reason for the hang or a suitable
timeout setting. The earlier ambiguous bundle lookup remains a separate item.

The existing read-only diagnostic turn reported invalid signature validation
for Claude, ChatGPT and the bundled CUA Node executable inside the Agent's
command sandbox. Process inspection there was denied. Exact existing command
outputs were read through the task API, without raw configuration/authentication
or history-file access. A separate approved SSH read-only check repeated strict
verification, including deep verification of both application bundles: all
three checks returned exit code zero and valid-on-disk/designated-requirement
messages. No repair, signing, reinstall or permission change was performed.
These are different observed contexts; the reason for their disagreement and
the CUA timeout remain unestablished. Do not upgrade the sandbox result into a
confirmed corrupted install or a proven timeout cause. The denied process
inspection was not rerun as a workaround.

The reusable [controller connection](CONTROLLER-CONNECTION.md) now pins task
ID, exact name and workspace before reading history. Its real guest `status`
and `read` commands retrieved stored completed-turn states, final replies and
changed-file paths automatically. A new reader reports `notLoaded` for this
stored task; that does not prove the desktop process is idle. Eleven bounded
subprocess fixtures passed, covering response ordering, mutation denial,
refusal of server-initiated approvals, malformed/oversized response rejection,
timeout closure, identity/workspace mismatch, ambiguous/incomplete search,
result projection and SSH guards. They qualify the client behavior, not CUA.

The active SSH session uses a private local control socket and strict pinned
host checking, without stored passwords, copied credentials, agent forwarding
or a public listener. It is intentionally retained for subsequent guest reads.
Session expiry or VM restart requires reconnection; unattended restoration is
not qualified. Host-key trust remains the existing dedicated-store TOFU basis,
not image attestation. This reader rejects inference/mutation methods and
cannot dispatch a controller task or grant an approval. Per-attempt startup
status and action authority remain separate requirements.

Both reports stay blocked. Guest-native CUA, keyboard delivery, cleanup,
independent input, canonical authority, restore and Lab reading remain
unqualified. SDK 0.1.4 and its archive/pin remain unchanged. The host Codex draft
was untouched and unsent. No new Claude selection, UI input, handoff, Send,
target-Claude inference, deployment, publication or VM/download restart occurred.

## Direct CUA diagnostic and session approval, 2026-10-23

The operator authorized investigating and fixing the timeout through the VM
connection without relaying prompts/results. The read-only result client is
unchanged in scope. A separate ignored diagnostic used the installed public
app-server MCP interface and the published `cua_repl.js` tool, with an exact
`cua.getApp('/Applications/Claude.app')` entry point. It started no model turn,
controller message or target-Claude inference, and exposed no network listener.
An attempt to attach the existing desktop-owned task was rejected for an
active writer; the diagnostic preserved that lock and used temporary in-memory
runtime contexts instead. Those contexts were closed afterward.

The deny-all diagnostic policy returned an explicit unapproved-Claude error.
Changing the diagnostic to normal `on-request` handling surfaced the real MCP
app-approval request. One pending request was canceled before any grant while
correcting the planned observation method to the documented
`getAXStateAndScreenshot`; that correction did not dispatch an observation.
The operator then expressly allowed this diagnostic session. The actual answer
was forwarded to the pending app request as a session-only grant, without an
always-allow rule or permission-database change. No automatic approval was
invented. These events establish the working approval-relay boundary, not a
repair of the historical timeout.

The approved selection still returned `js execution timed out; kernel reset`
at the 30-second REPL deadline. It produced zero observations. Public installed
runtime source gives native requests a 120-second default. A distinct bounded
diagnostic therefore used a 150-second outer tool deadline, preserving the
same read-only target and session authorization. It returned a tool error
after roughly two minutes, with zero observations. The earlier failures remain
unchanged; neither a renewed run identifier nor a larger timeout passes the
gate. No further selection or paired-observation request followed.

Read-only process/socket metadata showed the native helper running with its
expected owner and native socket. The normal app-approval request is reached
after the helper's policy lookup resolves Claude, according to the public
installed source. This establishes some native communication, not AX/capture
health. Helper version was 26.1015.1001540; packaged CUA runtime was 0.0.33,
with `@oai/cua` 0.2.6, `@oai/cua-repl` 0.1.2 and `@oai/sky` 0.7.12. No package
was updated, patched, reinstalled or re-signed.

Narrow helper diagnostics were projected into event classes; a short terminal
error read returned `Broken pipe` after the short-deadline attempt. A two-second
read-only helper stack sample returned run-loop/wait frames and an app-server
event-observer connection queue, without identifying a cause. Raw stacks,
AX and screenshots were not saved. These records do not establish an AX
deadlock, missing macOS permissions, VM incompatibility, damaged installation
or a network cause. The 30-second outer deadline can hide a later native
outcome; the longer failed diagnostic shows that simply increasing it is not
a demonstrated repair.

The result connection's twelve fixtures passed, including the new regression
for library import without a global `process` in a REPL. This extends the
earlier eleven-fixture record; it does not rewrite it or qualify CUA. SDK
0.1.4, its archive and bench pin remain unchanged. No Claude input, clearing,
handoff, Send, host Codex draft operation, deployment, publication, VM restart
or download restart occurred. Diagnostic contexts were closed; the approved
SSH connection and requested VM console remain available. Canonical action
authority remains unavailable and unqualified. The current blocker is native
Claude observation, with cause unresolved; no marker/action case was started.

## Native setup blocker identified, 2026-10-23

The operator renewed the request to find a concrete repair through the VM
connection. Read-only console metadata reported the guest unlocked and on
console, with the intended user owning the console. This rules out a current
locked console; it does not establish native observation readiness. The
installed proxy help and process socket metadata were checked without private
configuration reads. An unsupported `lsof +E` option returned an error; no
endpoint relationship was inferred from it. A narrow helper-specific OS
permission-log query returned no events; absence was not treated as permission
success. Helper stack sampling again returned wait/run-loop frames without
establishing a native deadlock. No service restart or permission reset followed.

One distinct bounded documented CUA selection separated the short terminal
error from the returned API documentation. The actual tool returned after
130,341 ms: **Computer Use permissions are still pending**, stating that
Accessibility and Screen Recording steps in the **ChatGPT Computer Use**
window have not been completed. This is the first retained specific setup
error; the earlier timeout reports stay unchanged. The native error was
received directly through the VM connection, not relayed by the operator.
The session-only Claude app-approval grant was forwarded from the existing
actual human answer; no always-allow rule or invented consent was used.

Public installed helper metadata confirms display name `ChatGPT Computer Use`,
bundle name `Codex Computer Use`, identity `com.openai.sky.CUAService`, version
26.1015.1001540. The current concrete repair is to complete that helper's
pending protected setup steps **inside the guest**, then verify fresh native
observations. This is separate from Claude access approval. Individual OS
grant states were not read from a permission database or independently proven;
the native error names both required capabilities. It establishes a current
setup blocker, not proof that permission completion will resolve every later
capture or control issue.

The failed local report is preserved, SHA-256
`f10febddc1135338cbaa3f12196a5a7bfa9fadb45ab51b0b0694f2968f8d98af`.
A separate bounded readiness projection binds that digest to `setup-blocked`
and `permissions-not-ready`, with zero observations/input/Sends, no action
authority and no automatic retry. Its native assertion that the user is
almost done is not evidence of human progress or permission to loop. The
operator has been asked only to complete the protected security step; result
copying and new controller-prompt submission are not required. The diagnostic
context was closed. The approved SSH connection and VM console remain open.

The existing execution contract already accepts `permissions: 'human-required'`
and rejects qualification with `permissions-not-ready`. An active action case
would record `permission-required`; none was created here. No SDK or action
driver implementation changed. All fourteen execution-contract fixtures passed,
including refusal of both human-required and unknown permissions; these are
synthetic checks, not OS-grant or capture verification. Documentation links,
UTF-8/LF formatting, diff whitespace and redacted credential-pattern checks
passed. SDK 0.1.4/archive/pin, the host Codex draft,
Claude contents and the unavailable canonical action store remain unchanged.
No Claude Send, deployment, publication, VM/download restart or raw AX/image
retention occurred. Repair verification is pending the actual protected setup
step, then two fresh coherent guest-native Claude AX/screenshot pairs.

## Post-permission capture verification, 2026-10-23

The operator confirmed **Guest permission steps completed**. One distinct
installed-Claude selection then succeeded, followed by two documented
`getAXStateAndScreenshot({ disableDiffing: true })` calls, each returning AX
text and one native image without error. The diagnostic used the existing
VM connection and published CUA MCP tool, not a host view of the VM. Selection
returned in 16,202 ms; the two observation calls returned in 15,198 and
13,795 ms, including bridge/approval handling. These are end-to-end call times,
not isolated capture latency. The native permission-pending error did not
recur. The checked capture failure is therefore cleared after the protected
setup step; this does not prove a shared cause for every historical timeout.

Both images were inspected transiently. They show Claude's **Get started**
welcome screen. Both AX results contain the same window-shell/menu elements,
but omit the rendered welcome text and Get started control. The selected
native target and window label agree; complete content coverage does not.
Two successful paired calls establish observed capture transport, not the
full read-only gate, empty Chat, composer access or reliable input. No claim
is made that the client is signed out merely from the welcome screen.

The closed diagnostic report SHA-256 is
`3874c411616590d5ba140ed57811f1658767b28e95764fad0f82dee99233d140`.
It retains both calls' times, error/image counts and AX/image digests without
raw captures. A separate controller review binds that report to
`nativeCaptureRequestsSucceeded: 2`, `axCoverage: window-shell-only` and
`fullReadOnlyGate: not-qualified`. The original setup-pending report and its
projection remain unchanged. SDK 0.1.4/archive/pin are unchanged.

Normal Claude app-access requests were relayed using the actual existing
human grant, with session persistence only. No always-allow permission or
automatic consent was invented. Guest OS setup is recorded as human assistance,
separately from the Agent's successful observation calls. No model turn,
Claude input, clearing, launch handoff, Send or host Codex draft operation
occurred. No raw AX/image was saved. Diagnostic context/transport were closed;
the approved SSH master and requested VM console remain available.

The operator was asked to finish Claude's one-time guest onboarding/sign-in,
leave an empty Chat and send no message. Authentication remains a protected
human step, not a recurring test Ready/Send requirement or result relay.
After that, inspect fresh native captures for actual complete content before
qualifying the target. Canonical action storage, marker input/cleanup and
independent host use remain unqualified. No Lab trial follows from this result.

## Post-onboarding native observation verified, 2026-10-23

The operator reported **Claude setup complete; empty Chat open**. A new bounded
installed-path selection succeeded, followed by two documented full paired
AX/screenshot requests through the existing VM connection. All returned
without error, exposing application content, mode controls and an empty prompt
composer. Both screenshots were reviewed transiently and agree with those AX
facts. This verifies native read-only Claude observation beyond the earlier
shell-only welcome screen. Selection took 24,562 ms; the two observation calls
took 15,313 and 13,969 ms, including bridge/approval handling. The 150-second
diagnostic outer deadline was retained; no separate default-deadline reliability
claim follows from these call times.

The actual selected mode is **Code**, with a new-session surface. Its mode
control and empty composer agree in both observations. This differs from the
operator's reported Chat mode. The Agent left it unchanged: read-only Claude
observation is now observed on this specific Code surface, while Lab Claude
Chat readiness remains unqualified. No active Chat conversation, Chat-specific
composer behavior, typing or keyboard dispatch is established. Other visible
account/history material was not used, exported into local records or copied
into tracked files. No message was sent.

Fresh read-only public metadata identifies guest macOS 26.6.2, build 25G83,
ARM64, hardware model VirtualMac2,1; installed Claude 3.6556.2 with identity
`com.anthropic.claudefordesktop`; Computer Use helper 26.1015.1001540 with
identity `com.openai.sky.CUAService`. Guest/installed-runtime metadata and the
controlling Agent remain trusted; this is not independent VM attestation.

The closed diagnostic report SHA-256 is
`c928d01ff61d97185a66873477364fac7e43e776d742ef50fbedea85a0a37cb6`.
A separate bounded review binds it to two successful captures,
`axCoverage: application-content-and-empty-composer`, matching visible content,
`nativeReadOnlyObservation: observed-for-current-code-surface` and
`labClaudeChatReadiness: not-qualified-mode-is-code`. Both earlier blocked and
shell-only reports remain unchanged. The specific permission-pending capture
repair is verified in this checked path; universal reliability and a common
cause for every historical timeout are not claimed.

The existing actual human consent was relayed to the normal app-access
requests with session persistence only. OS permissions and Claude onboarding
are recorded as one-time human setup assistance, not per-test Ready/Send or
result relays. No controller model turn, mode change, composer focus, typing,
clear, handoff, Claude Send, host Codex draft operation or raw capture retention
occurred. The temporary diagnostic context was closed. The approved SSH master
and requested VM console remain available; no browser tab was opened.

SDK 0.1.4/source/archive/pin remain unchanged. No deployment, publication,
permission reset, software reinstall, VM restart or bulk download occurred.
Canonical authority, controlled input/cleanup, independent host use, stable
Chrome control and Lab Chat interaction remain separate unqualified checks.
Resolve the host-native authority transport before a new controlled-input case;
then qualify the intended actual Chat surface with the permitted controller.
The operator should not have to manually submit a test or relay its result.

## Host authority and guest Chat readiness, 2026-10-23

The operator authorized fixing host/VM authority and qualifying Claude Chat
for the no-Send test, retaining SDK 0.1.4, the unsent host Codex draft and no
Claude Send. The slice selected a smaller host-orchestrated arrangement:
canonical claims remain on the host-native external store; the existing
approved SSH/app-server connection carries published guest-native CUA only.
The stale shared mount stays unmounted/unqualified. No reverse authority
service, authority replica, public listener or substitute UI engine was added.
The placement clarification is reflected in the MVP scope and execution
contract: native control executes inside the guest; the reviewing coding Agent
and authority guard may run on the host.

The new [remote readiness guard](remote-readiness.mjs) binds one controller and
ephemeral guest runtime. Its scope permits at most one shared-mode selection
and one empty-Chat preparation action, with zero typing, keypresses, clearing,
handoffs and Sends. Exclusive host claims are persisted and synchronized
before dispatch; native API return and observed effect remain separate. An
uncertain claim stays consumed, blocks subsequent input and cannot be renewed
by restoring the guest/workspace or reconnecting another runtime. These are
runner guards under trusted host/guest control, not OS enforcement against
their owner or exactly-once UI delivery.

The actual first run started on the observed empty Code surface. One expired
capture was rejected before a setup claim or native dispatch. A fresh reviewed
pair then allowed the host to claim the shared Chat/Cowork selection before
the actual guest CUA click. The following capture showed **Cowork selected**
on `/new`. The shared umbrella and URL alone therefore cannot establish Chat.
The guard gained an explicit `claude-chat-cowork-v1` profile and a bounded
empty-Cowork-to-Chat preparation branch, within the original one fresh-Chat
action budget. Historical default checks and prior reports were preserved.

A new reviewed Cowork capture allowed that second host claim, followed by its
actual guest-native click. Fresh post-action captures then showed the shared
umbrella selected, Code unselected, **inner Chat selected/Cowork unselected**,
`/new`, complete primary-region AX, an empty composer and no submitted message.
Both actual paired screenshots were reviewed transiently and agreed. The
host accepted two distinct fresh readiness records and finished the case with
`host-authority-and-claude-chat-readiness-observed`. This is bounded Chat
readiness and observed mode preparation, not composer focus/input qualification.

The canonical passing report SHA-256 is
`c01e25e51c35f95e5391877ab8595489b3d64cfff0c1e6822be99fc364195dfc`.
Its closed diagnostic projection SHA-256 is
`a6fa05df38764815a009d04e08bdeb5b5baa3de3d5a9e569082927c866c2a3d1`.
It records two actual native setup requests, two accepted readiness pairs,
zero model turns, zero Claude Sends and no raw AX/image files. The host's
external state was inspected directly; no authority files were mounted into
or copied back from the guest.

The transport was then parameterized as [vm-cua-bridge.py](vm-cua-bridge.py),
with explicit ignored connection/environment/fresh-record arguments, an
authorization flag, strict existing-SSH validation and bounded JSONL operations.
It calls only the documented guest `cua_repl.js` surface. This separately
checked entry point performed a new installed-Claude selection and two native
paired observations of the prepared empty Chat, with **no setup input**. The
first reviewed readiness record was accepted; the second capture expired
during Agent review/context handling and was rejected by the unchanged
30-second freshness rule. That case finished **incomplete**, with one accepted
readiness record, and was closed without retrying any action. Do not relabel it
as a second passing readiness qualification or as a native capture failure.

The parameterized-entry report SHA-256 is
`71fcde79929ddfe3416098c4d940d6da8c3b3577195789e9a90f32e2c25d8bef`.
Its closed diagnostic projection SHA-256 is
`95bf08468c433b53549fb28a900eb794fcff93bf238ea0dcf0650ccf7c304a30`.
The passing setup run used the local predecessor transport; its findings do
not automatically qualify every byte of the later parameterized script.
Both used the same host guard and guest-native API. The separate recheck
establishes bounded transport/guard operation while retaining its incomplete
terminal result.

Actual public environment pins: guest macOS 26.6.2 (25G83), ARM64,
VirtualMac2,1; Claude 3.6556.2 (`com.anthropic.claudefordesktop`); Computer Use
helper 26.1015.1001540 (`com.openai.sky.CUAService`); installed guest CLI
0.163.0-alpha.11.2. Stable Chrome 156.0.8078.47 bundle metadata was checked
as `com.google.Chrome`; no browser UI was operated. These are trusted guest
metadata/controller observations, not independent environment attestation.

Synthetic checks remain separate: 24 focused remote-authority/readiness tests
passed. The complete bench suite then passed **257 tests**, including durable
claim/replay, workspace rollback, replaced/missing authority, lost/rejected
dispatch, stale/conflicted captures, mode selection, expiry and two-distinct-
capture readiness checks. Its initial restricted run had eleven `EPERM`
fixture-listener failures; rerunning with local listener access passed all
257. Three subsequently added CLI/import checks for the parameterized bridge
also passed. No fixture constitutes native-client qualification.

The final focused rerun passed all 27 readiness/remote-authority/bridge checks.
Documentation verification resolved 101 local links across the changed/new
bench files, with UTF-8/LF, whitespace and redacted secret/path scans clean.
The unchanged SDK archive SHA-256 remains
`e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430`;
SDK source and the candidate pin have no diff in this slice.

Both owned ephemeral native contexts were closed, both host cases finished
and no active Claude reservation remained. The approved SSH master and
requested VM console stay open. No browser tab was created. Existing applicable
human direction was relayed only to the actual normal Claude app requests with
session persistence. No new operator Ready, window rescue, manual submission
or result relay was needed in this slice. The earlier protected permission and
onboarding steps remain attributed one-time human setup.

No composer focus, typing, keypress, clearing, handoff, Claude Send, model
inference or host Codex draft operation occurred. Incidental account/sidebar
history was not used or retained as raw local evidence. SDK source, archive
and candidate pin remain unchanged. No deployment, publication, VM restart,
permission reset, software reinstall or download occurred. Actual guest
restore/reconnect, independent host use, marker input/cleanup, stable Chrome
interaction, Lab handoff, source retrieval and Send remain **unqualified**.

## Host-authorized guest marker and input independence, 2026-10-23

The operator commissioned connection of the no-Send marker session to host
canonical authority, followed by focus, typing, cleanup and host/VM input
checks. They explicitly selected the named 60-second public no-Send capture
profile after real reviewed action delivery repeatedly exceeded the existing
30-second limit. The default remains 30 seconds and the Send lane rejects the
profile. This slice changed no SDK inputs and performed no Claude Send.

The [remote marker adapter](REMOTE-MARKER.md) reuses the original no-Send
session. Host-native exclusive claims precede the published guest CUA calls;
there is no guest authority replica or viewer input. Regular host Chrome was
verified by installed bundle ID. Guest public metadata remained macOS 26.6.2,
Claude 3.6556.2 and regular Chrome 156.0.8078.47. Only guest Claude native input
and the disposable host Chrome-tab probe were exercised; installed guest
Chrome metadata does not qualify guest browser interaction.

The following local canonical reports remain immutable. Digests identify
bounded controller-attributed files under trust in the host owner/store; they
are not independent authentication or proof of OS isolation.

| Case | Original result and observed limit | Report SHA-256 |
| --- | --- | --- |
| `diagnostic-b451926b-dbbb-4eef-ac13-c1975b8d5bf3` | 30-second profile; one focus/type/clear, host token typed once. Guest empty was visible, but its recording arrived after 36.461 seconds, invalidating qualification. Overall indeterminate; no retrospective pass or cleanup-field rewrite | `5a2b0ebea798fb0e64487efffad2414c099dd5eb723b9a5b119c64fb48f5220f` |
| `diagnostic-e3806046-9d6a-4883-8a79-9bf79a76506d` | 30-second profile; focus/type consumed, marker remained unsent. Expired observations rejected without host typing or clear. Verified stopped original controller, explicit same-case recovery and fresh qualification did not renew the deadline or profile; another expired capture blocked cleanup. Finished indeterminate | `1b396b1d361a31e6aef7924209aab08f2d402d2908c595349dc88a549393fdb4` |
| `diagnostic-388b0250-ef6c-452e-89fc-d8d99ebd34e5` | Separate 60-second cleanup-only contract, zero focus/types, one delegated unused clear from the preceding origin. Fresh exact marker and post-clear empty were accepted. `cleanupOnly: true`, `markerCleanup: observed-empty`; full-gate outcome remains incomplete | `82bb1380e32aaa73edd304d5b61fcd69c8d401a490c6322f3df82c4135245164` |
| `diagnostic-c79c3157-7b49-4a71-810b-9cd07782453e` | 60-second profile; focus, exact type, unchanged guest after host typing and post-clear empty all accepted. Final independence recording arrived after the original 15-minute deadline, which was not extended. Overall indeterminate; historical accepted effects remain in its checks, despite conservative current-generation fields | `7ba2aaaf78d99b5f711a09bfe1502daa38c1750b4069094241f47acc73cdf570` |
| `diagnostic-bd29aa3d-1480-4e30-a1ce-33d21a798683` | Fresh 60-second contract with a declared 30-minute case budget within the preexisting ceiling. One focus/type/clear, each effect accepted in generation 1; unchanged input checked both directions and after cleanup. `bounded-no-send-gate-observed`, passed, no uncertain inputs, interruptions or recoveries | `31e4dd3bee4e8c5691216af737ed621ad4cbe481526ba37cfafb7383fc5a9fec` |

The original 30-second contract bytes and failed reports were not amended.
The separate cleanup durably delegated the origin's unused clear exactly once;
it did not reopen the origin or repeat focus/type. No expired observation was
used for native input. Historical metadata for the first host observation used
a generic native-CUA label; its actual observed host path was the browser-tab
wrapper described below. That old field stays unchanged, and is not evidence
of native macOS AX page focus.

The successful case's transport projection SHA-256 is
`d896f0a451146e87b17b82a092ec7f0e9fd94b7e0552e1e86d0909a7536783ab`.
It records five paired guest observations, three native guest input calls,
zero model turns, zero Claude Sends, no retained raw images/AX and a closed
transport. Its separate two-direction plus post-cleanup proof SHA-256 is
`60e47e8ddd6fb40c73626dde56240b07649b542db06d944a65ab220b17ea1a49`.
The case contract SHA-256 is
`2f79c178218c6a1d94246f429f25ac4381b1ba785ad40dbb84013dbc402a2a6c`.
The final paired guest empty capture was returned at 12:48:08.163Z, accepted
at 12:48:54.273Z. The host token and browser-exposed focus remained unchanged
in a later capture at 12:49:37.049Z. Final recording finished at
12:50:15.127Z, before the case's 13:00:36.395Z deadline.

One read-only host-token capture in that passing case expired before
recording. It dispatched no action and stored no positive finding. A fresh
paired host observation replaced it while the owned field remained unchanged;
that was accepted before the guest isolation check. This was a new observation,
not another host type, relaxed freshness requirement or renewed action budget.
Normal session-only app approvals were forwarded from existing human scope.
No per-case Ready, manual test submission, window rescue or result relaying
was required. Earlier one-time guest sign-in and OS permission setup remain
recorded prerequisites; no permission database change or new persistent app
permission was performed in this slice.

The host native-app AX view initially omitted webpage content despite the
visible probe. The actual qualified host interface was explicitly
`cua-browser-tab-ax-and-pixels` plus `cua-browser-tab-typeText`, targeting only
the owned stable-Chrome textarea. Guest input used native Claude CUA. The
observed claim is sequential non-interference between those owned surfaces:
guest typing did not enter the host field, host token typing did not change
the guest marker/focus, and guest cleanup did not change the host token/focus.
It does not prove physical keyboard isolation, arbitrary parallel typing,
control of unrelated host apps or the absence of all possible competing input.
Logical guest window IDs and exclusive input remain controller attributions.

All owned host probe tabs from this slice were closed; their loopback servers
and transient SSH/app-server contexts were closed on finalization. The stopped
original controller's partial projection remains preserved with its separate
verified-stop record; it was not rewritten to claim normal closure. The VM
console and existing approved access remain available for later work. No host
Claude or Codex input, SDK/archive change, download restart, deployment,
publication or repository visibility change occurred.

The complete bench guard suite passed **277/277** after the named profile,
separate-clock evidence flow, cleanup-only scope and per-new-case duration
selection. Those synthetic/loopback checks are separate from the real case
above. Earlier 270/272-test adapter checks, the original readonly/setup results
and all earlier failures retain their historical meaning.

**Next unmet environment condition:** verify actual guest restore/reconnect
reconciles host-owned claims, rejects consumed attempts and demands fresh
ownership/readiness. No restart is selected here. Guest stable-Chrome launch
handling, Lab component handoff, draft fidelity, Send/source/reply, three-case
application qualification and a second reusable reading profile remain later
work. The marker pass does not authorize a Lab trial. SDK 0.1.4 and the host
Codex draft remain unchanged and unsent.

## Actual guest rollback and fresh target rejection, 2026-10-23

The operator selected the next restore/reconnect phase after the bounded
marker pass. The configured source guest was observed stopped, and its old
SSH master refused connection. It was preserved while two disposable local
copy-on-write clones exercised a cold baseline rollback. A generated public
nonce created only in the first clone disappeared in the restored clone;
boot-session identity changed and public versions remained macOS 26.6.2,
regular Chrome 156.0.8078.47 and Claude 3.6556.2. No image download, source
replacement, authority mount, new OS permission or Send was performed.

The same host store identity and pinned case/registration/report/claim files
were byte-identical after guest rollback. The later File-menu claim survived
although the guest returned to its earlier disk state. The actual host guard
rejected reopening its finished case without dispatch. A separate finished
no-Send case remained terminal. This checks the observed finished-case and
host-storage boundary; active in-flight native recovery remains unqualified.

An owned SSH master still reported running after its clone stopped. It was
explicitly closed; a fresh strict pinned-key connection was established for
the restored clone. No host-key bypass, new access key, forwarded agent or
stored password was used. The ignored default connection now selects that
verified fresh endpoint and preserves the prior profile separately. The
stored-task reader returned through the new connection with zero UI input,
model turns or controller messages; `notLoaded` retains its existing limit.

Fresh Claude observations before and after rollback exposed an empty
**New session** / **Project or folder** surface without the earlier explicit
Chat/Cowork selectors, despite unchanged version metadata. Its cause is
unestablished. The reduced focus-only case finished without using its one
focus action. The separate named File-menu preparation claimed one header
click, whose API returned; the subsequent native result had AX but no image.
No further menu action was permitted. The initial image-display index error
closed that context; its incomplete report stays unchanged. The bridge now
emits bounded image-unavailable information while retaining the strict paired
review prerequisite.

The updated readiness helper rejects that owned session surface as
`chat-surface-ambiguous`, rather than accepting `/new`, a generic Claude radio
and empty text as ordinary Chat. The actual restored capture was rejected by
that guard and its case finished incomplete with zero native input. Thus the
fresh-target gate worked; a complete Claude recovery pass was not obtained.

| Actual case | Outcome | Immutable report SHA-256 |
| --- | --- | --- |
| `diagnostic-e1729ed0-ad9d-4403-b291-c3112b0d850f` | Focus-only case; target differed, no focus/type/clear or Send; incomplete | `b9db996c818867f4e3f33815d15ae12458ffdf42ab92cd0bedbaeca107fb2fd4` |
| `readiness-98ecf9cb-55ad-424d-8585-30fa08219e42` | One consumed File-header click; menu effect lacked paired image, no readiness, incomplete | `5850c4dfa84f0b784cfdee42ce7fea1adc9ef4fa60cb731d71381b941f6367dc` |
| `readiness-c5346e88-7605-4abc-b777-b5bc65cc31f0` | Fresh restored native capture; readiness rejected as ambiguous, zero native actions, incomplete | `f70bbaf379206575761cf48f68ec9133346f9aebefee06875b6e2a3cca9f6c66` |

The preserved consumed File claim SHA-256 is
`13924329d825068105b8c45d179b5076976b56cd22a92fda63585411ddc5df40`.
The local bounded restore aggregate SHA-256 is
`5e2f497b618080f90e21dd3fdb3d4f96a5ddffa08199dbac2ade86eb0f2f1a66`.
Its actual disk/boot facts and host digest comparisons remain attributed to
the controller, SSH endpoint, host filesystem, runtime and machine owner;
none is an independent witness or universal storage/VM guarantee. No raw
AX, image, private transcript or account state was committed as evidence.

The complete bench guard suite passed **282/282** after this slice.
The new focus-only checkpoint, pause, fresh-generation checks, fail-closed
consumed-focus audit and superseded-controller finalization guards are
synthetically checked candidates. They did not run as an actual active-case
restore because preflight refused the different target. See the
[restore qualification guide](RESTORE-QUALIFICATION.md) for exact scope.
The original configured guest and first clone are retained stopped; the
restored console and fresh approved connection remain available. All three
cases and transient contexts are closed; no active authority reservation or
owned browser tab remains from this slice. SDK 0.1.4, its archive and the host
Codex draft remain unchanged. No Claude message, deployment, publication or
visibility change occurred.

**Next unmet condition:** qualify reproducible ordinary Chat preparation after
cold boot/restore with complete reviewed AX/pixels. Then qualify the active
focus-only recovery path. A new transport, matching versions, generic `/new`
or a historical pass cannot replace that live target check. No additional
native trial or Lab submission follows from this record.

## Merged conversation and active-case recovery, 2026-10-23

This follows the initial ambiguous-target rejection; it does not rewrite any
earlier case. Anthropic's [official merged-experience explanation](https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude)
documents a gradual Chat/Cowork merger with no separate mode selector.
That is consistent with the observed guest surface. The exact account rollout
flag remains unobserved. No mode, permission, model, folder or incognito setting
was changed to force the earlier UI.

The opt-in `claude-unified-no-send-v1` readiness profile now requires positive
owned merged-surface controls and refuses drafts, messages, streaming,
conflicting modes, duplicate controls or missing scoped markers. It records
merged-conversation observation while explicitly withholding legacy Chat mode.
The default/legacy ambiguity rejection remains. Handoff and arrival guards
reject this no-Send-only profile; the application lane was not expanded.

Actual readiness case `readiness-bf8e6539-5cad-48ad-94f1-02ab00b4c3c6`
passed two fresh distinct complete reviewed AX/image captures with no UI input.
The separate focus-only case
`diagnostic-9ec92067-2346-4f56-968a-963d19cd7355` then observed one returned
native composer click and post-click exposed focus, paused without closing
its canonical host case, and underwent an actual cold baseline clone.
The public nonce disappeared and boot identity changed; strictly pinned new
SSH, unchanged declared versions and retained host digests were checked.

After reconciliation, the original contract/deadline/focus claim remained.
An actual restored paired capture rejected absent qualification and the old
generation. Fresh qualification plus a new native pair established the empty
merged composer. An actual host guard audit using that reviewed material
refused the consumed focus claim with `EEXIST` before a fail-closed callback.
No second native focus or other post-restore input was dispatched.

| Finding | Outcome | Immutable SHA-256 |
| --- | --- | --- |
| Initial two-capture merged readiness | Observed, zero native input | `2cada971ae9c4a42ec658a7ab0c9827f180265a2a960854ff025061ae6c07be1` |
| General no-Send report | Indeterminate; focus-only case has no typing/cleanup/independence pass | `bf6e04d4e88038749c5da7f595d48cdcb88ca9dd78bbf2d3543c066ba03a22a1` |
| Separate recovery aggregate | Twelve bounded checks passed | `94788a205e1924b29591bcdd34f888588d911630301071895e7268ca062d80a8` |

The [restore guide](RESTORE-QUALIFICATION.md#merged-conversation-and-active-case-follow-up-2026-10-23)
records supporting claim, fresh-readiness and replay-audit digests. The aggregate
is a local controller-attributed summary of canonical host evidence and VM
observations. It is not an independent witness, a full marker pass or a blanket
environment flag. Orderly pause/cold clone was exercised; arbitrary crashes,
suspend, lost native acknowledgements and malicious-owner resistance were not.
No Lab handoff, Claude inference/source access or Agent intention was established.

The complete bench guard suite passed **289/289** after the final changes.
Both cases and ephemeral CUA contexts are closed; there is no active host
Claude reservation. The preserved source and earlier test clones are stopped;
the latest restored console and its fresh pinned connection remain available.
No browser tabs were opened. This slice required no new human Ready reply,
message submission or result relaying. Existing session authorization covered
normal Claude app approvals; no persistent or OS permission was granted.
SDK 0.1.4/archive and the host Codex draft remained untouched. No typing,
clear, handoff, Claude Send, deployment or publication occurred in this slice.

**Next unmet environment gate:** qualify guest stable Chrome control and the
actual Lab component-to-Claude draft path under an explicit application-surface
policy. The no-Send merged profile cannot authorize that path or a future Send.

## Guest Chrome and Lab draft-only handoff, 2026-10-24

The operator commissioned regular Chrome qualification followed by the public
Lab handoff and draft inspection, with **zero Claude Send**. The new explicit
`lab-unified-draft-nosend-v1` contract in
[remote-reading.mjs](remote-reading.mjs) and its
[guest bridge](DRAFT-HANDOFF.md) provide that narrow application lane. They do
not widen the earlier setup, marker or merged-readiness contracts. SDK 0.1.4,
its archive/context pins, the host Codex draft and production sites stayed
unchanged.

The existing guest SSH socket had expired. A new strict pinned connection to
the same observed guest was established; no host-key bypass, permission reset
or VM restart was used. Canonical case authority stayed on the host-native
external store. A temporary guest-loopback SSH forward delivered only the
host's public bench fixture; it exposed no authority directory or service.
Native CUA executed inside the guest, with no model turn, host viewer driver
or substitute UI automation. The tested guest declared macOS 26.6.2, stable
Google Chrome 156.0.8078.47 (`com.google.Chrome`) and Claude 3.6556.2
(`com.anthropic.claudefordesktop`). Those identities are controller-attributed.

**Native Chrome and the extension-backed browser adapter are separate.**
Selecting stable Chrome through its explicit installed path returned complete
paired AX/screenshots and supported the owned navigation and component clicks
below. The separate extension-backed selection returned `Missing required
Codex turn metadata: session_id, turn_id`; that adapter remains unqualified.
Native success neither diagnoses nor repairs that metadata failure. Chrome
Beta and the host's personal browser were not used.

| Attempt | Actual outcome |
| --- | --- |
| `reading-draft-98fd5b7f-2966-48f7-b306-c0993cac9ff9` | Prepared then closed incomplete with no input, before capture invalidation and approval-time freshness checks were repaired. |
| `reading-draft-dd37845d-10cb-46f2-9aca-6d3aa5479704` | One canceled browser probe API returned; immediate receipt inspection ran before the deferred callback. Finished indeterminate without a handoff. A later receipt is supplementary evidence only; the immutable failed report is unchanged. |
| `reading-draft-afe8a5ce-53e0-4135-8c13-a5176e1b4d9f` | Fresh separately bounded case passed native browser probe, actual component handoff, one launch confirmation and observed unsent draft under the named presentation policy. No Claude input or Send. |

The first probe exposed two concrete instrumentation issues: receipt delivery
can lag the native click return, and guest/host timestamps differed by
milliseconds. The corrected bridge waits up to three seconds for the actual
post-dispatch receipt without repeating the click. Each new case declares an
SSH-bracketed guest clock sample and fixed 100 ms drift allowance. Original
guest event and host receipt times remain separate; a bounded host-time
interval must establish the event followed its claim. A later GET time never
replaces event time. Clock stability and SSH attribution remain trusted.
Failed earlier cases were not retimed or relabeled.

The passing case used these distinct observations:

| Stage | Observed result | Boundary |
| --- | --- | --- |
| Browser-only probe | One actual native component activation; deferred receipt `isTrusted=true`, `cancelled=true`; fresh paired Chrome capture showed that trace | Does not establish an app launch or draft arrival |
| Claude preflight | Fresh owned empty merged conversation; Claude selected, Code unselected, Manual control and Browser off | Explicit draft-only profile; legacy Chat mode and disabled tool access are not established |
| Desktop component | One actual native component activation from the pinned SDK; receipt `isTrusted=true`, `cancelled=false` | Does not itself establish native arrival |
| Launch confirmation | Actual `Open Claude?` prompt named the owned loopback origin; persistent permission observed unchecked; one claimed confirmation returned | No persistent launch preference was granted |
| Draft arrival | Fresh paired Claude capture showed the offered public Lab invitation in the same attributed new composer, unsent | Does not establish submitted text, reading or execution |
| Draft comparison | `exactMatches=false`, `presentationMatches=true` under `lab-claude-ax-paragraphs-v1`; 983 canonical bytes/8 newlines became 979 exposed bytes/4 newlines | Only the pinned blank-line presentation difference is accepted; transport-byte identity is unproved |
| Caution banner | Claude visibly warned about running the incoming prompt | Banner left untouched; nothing was submitted |
| Cleanup | Both owned case tabs and the earlier known-owned browser-only probe tab were closed; final paired Chrome capture showed only the original New Tab | Claude public draft deliberately retained unsent; no conversation deletion |

The passing report has SHA-256
`bf75caed38cf51c27a87ff64511e644958398639010c64e8542b1053aa5ec953`.
The separate bounded cleanup/environment aggregate has SHA-256
`b51f2136d3a3aa5e9fd07823cb326f5e6f2412d89ae625599f11f6db6ba92465`.
Its final cleanup capture is `capture-12d865b1-44ef-4780-843a-e30036f1102d`,
with AX digest
`4a4d82bd35a30d3db18b6e5f322a66383c97ae1423bbfd4a055339f76574c27a`.
Raw AX, screenshots, private titles and account details were not saved. The
bridge's API-return bookkeeping remains distinct from the aggregate's actual
post-action cleanup observation; the earlier failed report was not edited.

Normal session-only app approvals were forwarded under the operator's existing
scope. No repeated Ready reply, prompt/result relaying, protected setup or
persistent permission was needed in this slice. The case and ephemeral CUA
context are closed; the owned fixture server is stopped and its loopback
forward removed. The guest console and verified connection remain available;
the configured source and earlier clones remain stopped. Claude Sends, typing,
keypresses and clears were zero; controller model turns were zero. The host
Codex draft was untouched and unsent. No publication or deployment occurred.

The initial **325/325 bench tests** passed after the live-path changes.
Post-run review also identified three future-action guard gaps: cleanup could
accept an owned URL mentioned outside the active document, the approval handler
needed the original empty-form schema restriction, and a failed recapture
needed to invalidate the preceding capture before the call. These were narrowed
without changing the canonical live reports or granting further input. Their
rejection checks are synthetic; no additional live trial followed those fixes.
The final complete bench suite passed **328/328**, with zero failures,
cancellations or skips. Python syntax, local Markdown links/anchors, UTF-8/LF,
`git diff --check` and a redacted secret/machine-path scan also passed. Nothing
is staged or published. Fixtures cannot replace the live results above. This
is one bounded controller-attributed success, dependent on host authority, guest OS/CUA,
exclusive input, owned page/server receipts and visual interpretation. It is
not an independent witness or general desktop reliability qualification.

## Guest Lab one-Send application trial, 2026-10-24

The operator separately commissioned one fresh Lab → Claude desktop test,
one submission of the unchanged public invitation, source/reply inspection
and automatic recording. The host controller operated guest-native CUA through
the existing pinned connection. No Ready reply, manual submission or result
relaying was needed. SDK 0.1.4 and its archive/context pins stayed unchanged.
Stable Chrome was 156.0.8078.47 and Claude was 3.6556.2 on guest macOS 26.6.2;
these are controller-attributed environment observations.

Preparation cases remain failed and immutable:

| Case | Profile | Observed preparation result |
| --- | --- | --- |
| `reading-trial-c0313498-6a40-4234-a590-30f232753764` | v1 | New returned but the exact known public draft remained. Empty readiness failed; zero Send. One owned tab's close claim expired during approval before native dispatch, leaving it open. |
| `reading-trial-69b6b9a2-0d0a-4550-a097-ac422b2f6264` | v2 | Controller orchestration treated a startup event as operation completion and queued a dependent call across approval. Bridge failed closed; zero native input, handoff or Send. The orchestration was corrected to wait for the actual terminal event. |
| `reading-trial-1c29b7f0-478e-4cf1-8e9a-02a15d458dcf` | v2 | Setup Raise and New returned, but the exact known draft remained. This does not establish an inactive-window cause. Zero Send or browser tabs. |

These preparations did not consume the commissioned single Send. The explicit
v3 profile added one reset of the exact pinned public draft after returned
setup Raise and New, followed by a distinct fresh observed empty-composer
preflight. It permits no arbitrary clearing. Earlier profiles, budgets and
completed reports were not widened. The 30-second capture bound and fixed
30-minute case deadline remained unchanged.

The actual application case was
`reading-trial-3007e7a6-f30b-4864-b6b1-791889e4708c`, under
`lab-unified-reading-trial-v3`:

| Stage | Actual observed result | Limit |
| --- | --- | --- |
| Empty readiness | After one known-public reset, a fresh pair showed an empty owned merged conversation with no messages | Legacy Chat mode and disabled tool access are not established |
| Browser probe | Actual component activation; trusted deferred receipt was canceled | Browser check only, no native arrival claim |
| Desktop handoff | Actual component activation; trusted receipt uncanceled; one covered Open Claude confirmation with persistent permission unchecked | Receipt and API return alone do not establish arrival |
| Draft arrival | Fresh Claude pair matched `lab-claude-ax-paragraphs-v1`; exact match false | 983 canonical bytes/8 newlines versus 979 exposed bytes/4 newlines; no transport-byte claim |
| Send | One durable claim and one actual native Send returned at 03:33:14.495 UTC | No retry, second message or further Send |
| Submission transition | Fresh owned user-message boundary and empty composer recorded at 03:33:23 UTC | Text split across text/link nodes with flattened paragraphs; exact submitted invitation remains unconfirmed |
| Completed reply | Collection introduction, access limits, follow-up invitation and finished reply control recorded at 03:37:04 UTC | Semantic observation by the controller, not proof of source reading |
| Raw-index source request | Expanded actual Request named the exact public index; Response reported curl 56, CONNECT 403, HTTP 000 and zero bytes | This proves only the observed curl-path failure; no successful source acquisition or independent network attestation |
| WebFetch | Activity showed the exact index URL; the reply reported fetching and reconstructing JSON | Actual source body/identity was not exposed in that tool view. Success, revision matching and document counts remain assistant-reported |
| Cleanup | Current case's two owned tabs closed; fresh Chrome pair showed only the original New Tab and the older retained v1 tab | Older close claim was already consumed/expired and was not silently retried; submitted Claude conversation retained |

The public invitation requested an introduction from the index, without bulk
document reading. Claude's completed reply distinguished index metadata from
documents read, disclosed the shell denial and raw-byte limits, and invited a
follow-up question. These reply facts were inspected separately from source
proof. Its reconstructed JSON and claimed matching revision are not promoted
to verified retrieval. No documents are established as read by this case.

Native inspection exposed tool-layout differences. The actual raw-fetch
header/control and Request/Response content were adjacent sibling containers,
inside the owned completed assistant message. A narrow read-only inspector now
checks that exact adjacency, ancestry, labels, single explicit index URL and
named zero-byte denial. It stores indices and digests, not the command/output.
It cannot classify success or relax the existing source-success classifier.
The first rejected nested-boundary selection remains a rejected inspection;
no extra native input or Send followed it.

The canonical report finished at 03:44:07.692 UTC with `passed=false`,
`interactionPassed=false`, `outcome=reading-interaction-incomplete`,
`sendAttempts=1`, `submission=visible-transition-observed`,
`sourceAccess=failed` and `reply.status=observed`. Here `sourceAccess=failed`
refers to the inspected raw request, not a claim that every possible source
path failed. Exact submitted-text confirmation is the strict interaction gate
still missing. The conservative `possibly-attempted-do-not-resend` recovery
state does not erase the separately observed message transition or reply.

Canonical contract SHA-256:
`813949c190e71e57b01b876b651c9a55e7e12583f50ee14a7443b482f0bdaf62`.
Canonical report SHA-256:
`dc59a2b398775b62043c3e4a6899d9226c014a79da2de8d0d860c8c6b74d9b2c`.
Separate bounded environment/cleanup aggregate SHA-256:
`2ba899a23895042479ecacf9b2fabb8faca73857ce917332e1792eeb9e6127a0`.
All four preparation/application reports together contain exactly one Send
claim. The ephemeral bridge is closed, fixture server stopped and temporary
guest-loopback forward removed. The guest console and pinned connection stay
available. One known public draft reset occurred; Claude typing/keyboarding
and controller model turns were zero. Raw captures, private history and
credentials were not saved. The host Codex draft remained untouched and
unsent; no SDK change, publication or deployment occurred.

The complete bench suite passed **358/358 tests**, with zero failures,
cancellations or skips. A subsequent bridge guard check also covered the
explicit v3 profile and passed **11/11**. Installed SDK file digests, consumer
lock integrity and the archive pin matched 0.1.4; protocol and SDK candidate
files were unchanged. Python syntax, local Markdown links/anchors, UTF-8/LF,
diff checks and redacted secret/machine-path scans passed. Nothing is staged.
These code checks do not turn the incomplete live qualification into a pass.

## Next target: submitted-message and source inspection

First improve and test submitted-message extraction for the observed split
text/link representation, with an explicit comparison policy and rejection
cases. Do not silently normalize old evidence or rewrite this failed report.
Investigate what the actual WebFetch view exposes before claiming a supported
successful-source proof. A separate new live trial would need fresh operator
direction; the current one-Send commission is consumed. The three-consecutive-
case MVP remains unqualified and is not selected.

Source evidence must still come from an actual owned expanded tool result and
its named public identity, or an inspected denial. Assistant prose cannot
replace it. The extension-backed Chrome metadata issue, historical ambiguous
Send cases, security-baseline questions, other clients and THOUGHT remain
separate. SDK 0.1.4 and production sites stay unchanged.

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

## Submitted-message adapter development and second fixture, 2026-10-24

This continuation preserves all earlier contracts and findings. New contracts
can select `claude-inline-static-v1` for the complete ordered static text/link
body of the first owned submitted invitation. All parts are required; only
the declared LF-to-space rendering is accepted. Exact exposure remains false,
transport/model-received bytes remain unestablished, and historical failed
comparisons stay unchanged. A finished public trial may seed a new conversation
only after its matching complete user message and empty composer are observed.

Two development submissions completed before the fixed-code repeat gate:

| Development case | Actual result |
| --- | --- |
| `reading-trial-89560bcd-49b7-4993-a582-f0feef5a2093` | Zero Send; v3 preparation required a public-draft reset after New produced an empty surface. Preserved incomplete; subsequent cases explicitly selected v2. |
| `reading-trial-3265fdf8-15b6-4bf0-94c4-49cc0e5765c6` | Zero Send; browser address navigation expired before Return. Its consumed/uncertain lifecycle action was not replayed. |
| `reading-trial-636bb4b2-95a4-4b93-8487-4de362d63056` | One Send, submitted rendering match, completed orientation, inspected raw-index denial. `passed=true`, outcome `reading-interaction-completed-source-access-failed`. |
| `reading-trial-6354bed0-8bae-46c7-9a96-c12eab002d27` | One Send, submitted rendering match, completed orientation, inspected raw-index denial. Same bounded outcome. |

The two passing development cases exposed source-adapter changes during their
operation, so neither counts toward a fixed-code three-case qualification.
The request-denial v2 adapter checks an actual owned tool header and adjacent
Request/Response or Error content, one explicit expected-source curl request,
and observed HTTP403/CONNECT403. It establishes a named failed request only.
A successful WebFetch body remained unexposed and assistant-reported. No
successful acquisition, raw-byte verification, model origin or comprehension
was inferred. Native browser navigation now requires already observed address
focus and uses setValue/Return without a redundant click; the 30-second bound
was not extended.

Automatic approval review rejected a subsequent launch for lacking explicit
three-test submission authorization. No rejected launch process started. The
operator then explicitly authorized all three fresh tests and reaffirmed that
direction after interruption. This is commission/approval, not a manual Send
or window-rescue result. The next section records those cases separately.

Interruption stopped the existing dedicated VM and expired its SSH master.
The existing recovery-c guest was booted and its strictly pinned connection and
public-fixture guest-loopback forward restored. Public metadata remained macOS
26.6.2, regular stable Chrome 156.0.8078.47 (`com.google.Chrome`) and Claude
3.6556.2. No clone, new share, permission repair or provider setting was added.
A fresh preparation case, `reading-trial-a123bfc8-8f7b-4e8b-9988-617c6de8362c`,
finished incomplete with zero native input and zero Send: Chrome exposed its
startup restore prompt as a main-window native container rather than the
separate window expected by the guard. A narrowly scoped parser now handles
both native forms, requires the exact prompt/unchecked telemetry/unique Close,
and rejects page imitations and changed telemetry. Its 12 focused tests passed.
The three submitted cases use the same code after this fix. Failed preparation
and its original report remain unchanged.

The declarative local reading profile adapter reuses the installed SDK, server,
browser checker, existing desktop preparation and report schemas. Lab retains
its exact public input; Inshell is a developer-authored second public fixture,
not a deployed consumer or a fetched source. Both full browser matrices passed
11 scenarios with native launches canceled. The first interrupted Inshell run
preserved a Runtime.evaluate timeout and clean browser/server teardown; the
fresh later run passed. Separate visual inspection covered Lab at 320px/light
and Inshell at 1440px/dark. Browser results establish neither desktop arrival
nor reading. Synthetic second-profile preparation starts unqualified under the
same one-Send contract; local reuse needs no VM, while the guest-native driver
and named paragraph policy remain Lab-specific. See [profile guide](READING-PROFILES.md).

After the startup fix, all **376 bench tests** passed with zero failures,
cancellations or skips. Python syntax and the unchanged SDK/archive/lock pins
were checked. These checks do not replace the following live outcomes.

## Three authorized fixed-code Lab cases, 2026-10-24

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

The bounded [aggregate report](results/2026-10-24-lab-three-case.json) binds
all three canonical contract/report digests and unchanged input pins. This is
a separate repeat sequence; earlier development passes do not fill its failed
source-inspection gates. The first submitted case began after the startup
parser fix. The controller reduced orchestration polling latency during the
sequence; no pinned runner/fixture/contract comparison input changed.

| Case | Send / submitted rendering / completed reply | Source inspection | Canonical pass | Owned-tab cleanup |
| --- | --- | --- | --- | --- |
| 1: `reading-trial-c7e42e2f-3265-4002-8f8e-5896eedf5139` | 1 / matched / observed | not-observed | false | closed |
| 2: `reading-trial-c7222de0-2ee6-41a3-a16a-f2a2d72fd0f5` | 1 / matched / observed | failed | true | closed |
| 3: `reading-trial-7940c2ee-252a-4b18-8d8d-e61e6a3cd812` | 1 / matched / observed | not-observed | false | blocked |

Case 1's completed native activity title was “Created a file, read a page, and
3 more steps”; case 3's was “Created 2 files, read a page, ran 2 commands”. The
current inspector rejected both before a disclosure click. Assistant claims
about fetching or shell denial were not substituted for actual source-tool
results. Case 2 exposed a supported Read summary and a structurally owned
Fetch header. Its expanded Request named the exact public index, and Error
showed HTTP403/CONNECT403 and curl56. The v2 denial adapter recorded only that
failed request, with response/source byte identity unestablished. An unexposed
WebFetch response and Claude's verification claims remain unverified in every
case. No successful source acquisition or complete-document reading was proved.

All three draft comparisons matched the explicit paragraph policy, not exact
exposed text. Submitted text/link parts matched `claude-inline-static-v1`, not
exact canonical bytes. Every case had one durable returned Send; zero Claude
typing, keypresses, clears or controller model turns occurred. GUI submission
and completed orientation are attributed observations under trust in the host
controller, CUA, guest OS, source UI and provider. They do not independently
attest model authorship, model-received bytes, comprehension or intention.

The 30-second freshness guard rejected several preflight-to-handoff checks
before any claim/click. Fresh reads were reacquired; no consumed action or Send
was retried. The fixed bound was not relaxed. This is safe rejection evidence,
while repeated observations and latency remain an operational weakness. No
human window rescue, Ready step, manual Send or result relaying occurred during
the three cases. Earlier OS grants, onboarding and account setup remain human
setup assistance and are not erased by this result.

Cases 1 and 2 closed their two owned tabs with post-close captures showing the
original New Tab. Case 3 closed its canceled browser-probe tab. Automatic
approval review rejected the last desktop-tab close approval as a duplicate
execution after the tests. The host journal identifies that pending claim as
Chrome cleanup with `claudeInput=false`, with no native return recorded. No
approval replay or alternate UI control followed. The tab was last observed
open and may remain; cleanup is **blocked**, not closed.

The canonical third report was finalized through the same host authority API
with that blocked cleanup and the observed submitted conversation retained.
The pending bridge was interrupted and its guest app-server connection closed;
its fallback finalizer reported that the case was already finished. It did not
rewrite the canonical report. All three bridge transports are closed, the
fixture server is stopped and its temporary guest-loopback forward is removed.
The guest console and configured SSH connection are retained. The earlier
unclosed historical tabs were not restored at startup; their old failed close
claims remain unchanged. No unrelated/user-owned tab was closed. All three
public submitted Claude conversations are retained; the host Codex draft was
untouched and unsent.

The next development target is the owned completed activity-summary boundary
and rejection coverage, followed by a separately authorized qualification of
new code. Adding another prose-title exception or relabeling these reports
would not satisfy the original three-consecutive-pass gate. SDK 0.1.4, source
pins and production sites remain unchanged. No commit, push, publication,
visibility change or deployment occurred in this continuation.
