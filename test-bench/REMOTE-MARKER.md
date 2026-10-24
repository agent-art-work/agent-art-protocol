# Host-authorized guest marker diagnostic

Candidate maintainer tooling, checked 2026-10-23. This connects the existing
[no-Send session](NO-SEND.md) to guest-native CUA through host-owned authority.
The latest bounded case observed focus, exact public marker delivery, exact
cleanup and unchanged input in both directions. See the
[dated findings](AGENT-QUALIFICATION.md#host-authorized-guest-marker-and-input-independence-2026-10-23).
It does not qualify a Lab handoff, Send, source access, inference, VM restore,
arbitrary concurrent host use or a production testing service.

## Responsibilities and limits

The coding Agent reviews real paired captures and supplies current selections.
[remote-marker.mjs](remote-marker.mjs) reuses
`createDiagnosticSession`, whose guard claims each action durably on the host
before the [VM bridge](vm-cua-bridge.py) dispatches published guest CUA.
No guest authority replica, viewer automation or alternative native driver is
used. The guest never reads the host's authority files. API return and observed
effect remain separate.

| Surface | Observation and input | Scope |
| --- | --- | --- |
| Guest Claude Chat | Published native CUA, complete AX and pixels; current selected Chat and unselected Code/Cowork; exposed composer focus | One focus, one generated public marker type, one exact-marker clear |
| Owned host probe | Stable Chrome tab's `getAXStateAndScreenshot` and `typeText(null, token)` wrapper | One separate public token; no form, submit action or Agent request |
| Host authority | Existing external host-native store, immutable input claims and final reports | No guest mount, public authority endpoint or renewed attempts |

Host browser-tab focus is browser-exposed focus. It is **not** native macOS AX
focus, physical keyboard routing, a guarantee about unrelated host apps or proof
that two humans/controllers can simultaneously type in either target. The
observed claim is sequential, bounded non-interference between these two owned
surfaces. Guest Claude remains reserved to the test controller; personal host
apps are not reserved or driven except the disposable owned Chrome field.

## Explicit timing profile

The contract's default capture age stays **30,000 ms**. New public no-Send
cases may explicitly select `no-send-reviewed-60s-v1`, which records
`captureProfile: { id, maximumAgeMs: 60000 }` in the hashed execution contract.
It applies to the guest execution/composer/focus checks and the host probe's
new observations. It is rejected on the Send lane. Existing case descriptors,
deadlines and reports are not amended, including earlier failures at 30 seconds.
No caller-supplied arbitrary age override is accepted by the execution contract.

Capture age and total case duration are different. `--timeout-ms` declares a
new marker case's fixed duration, up to the existing 1,800,000 ms contract
limit. The bridge default remains 900,000 ms. A new 30-minute case was used
for the successful reviewed run after the 15-minute case expired during final
recording. Recovery cannot change the duration or profile. Neither option
renews an input claim, authorizes Send or obtains human consent.

## Maintainer entry point

First review the [standing plan](AGENT-RUNNER.md), dated findings and existing
[connection prerequisites](HOST-AUTHORITY.md#coding-agent-use). Only run within
actual operator authorization. Keep machine-local connection, environment and
record paths ignored. For the approved profile:

```sh
python3 test-bench/vm-cua-bridge.py \
  --connection .local/test-bench/controller-connection.json \
  --environment .local/test-bench/environment/observed-guest.json \
  --record .local/test-bench/environment/fresh-marker-result.json \
  --authorize-probe --capture-profile no-send-reviewed-60s-v1 \
  --timeout-ms 1800000
```

This opens a transient tool context, not a model turn. Its JSONL interface
exposes only named diagnostic operations. App approvals are forwarded only
from actual operator direction, for the diagnostic session; unexpected access
still stops the check. Never persist raw AX, images, private chat titles or
transcripts in the report. Record bounded facts/digests and actual assistance.
The SDK's 0.1.4 archive remains pinned and unchanged.

1. `qualify` records actual configuration and capability assessment. Open only
   the generated owned host probe URL, verify stable Chrome, review its paired
   empty focused field and record `host-baseline` before guest input.
2. `select` uses exactly the documented single `cua.getApp` call. Review its
   documentation, then `observe` a complete paired guest capture. Review the
   actual Chat controls, owned empty composer and AX/pixel agreement.
3. `focus` consumes its claim before native dispatch. Obtain/review a distinct
   post-action capture and record `observe-focus`. With that same still-fresh
   owned empty composer and exposed focus, `type` consumes the one marker claim.
4. Obtain/review a distinct post-type capture and promptly record
   `observe-marker`. Review the host again; `claim-host-type` uses fresh host
   evidence plus the already accepted current-generation guest marker effect.
   It authorizes no guest input. Type the returned public host token once and
   record `settle-host-type` separately from observed arrival.
5. Review/record fresh host arrival using `observe-host-token`, then obtain and
   review the guest again. `observe-isolation` checks its unchanged exact marker
   and exposed focus after the host capture. Only that fresh guest observation
   may authorize the exact-marker `clear`.
6. Obtain/review a distinct post-clear guest capture. Record `observe-empty`
   immediately. Then capture the unchanged host token/focus and record
   `independence`; it aggregates already accepted cleanup evidence and grants
   no further input. `finish` must still occur inside the fixed case deadline.
7. Close owned probe tabs/server and the transient connection. Leave user tabs,
   the VM console, existing access setup and the host Codex draft alone.

Each `observe` returns a capture identity. Display its image and the relevant
current AX region; pass that exact `reviewedCaptureId`, `visualAgreement` and
current selection for guest checks. Do not hard-code element indices from an
earlier capture or claim visual agreement before reviewing the image.

Accepted historical evidence can be aggregated without recapturing every
surface at once. It cannot authorize new input: each action's target must
still pass its own current freshness, ownership, value and focus checks.
A rejected stale read-only host observation may be replaced with a fresh one;
that supplies no repeated typing. A target conflict or uncertain native action
invalidates readiness and retains consumed claims.

## Interrupted cases and retained public marker cleanup

`--recover-case` requires verified prior-controller termination and exclusive
guest input. It reuses the original marker, deadline, contract and claims,
records a new runtime binding and reconciles the existing authority generation.
It cannot amend the capture profile, retype, reopen a finished case or renew
an uncertain clear. Only unused exact cleanup plus observations remain exposed.
Recovery never qualifies an unassisted full pass by itself.

If the original case is finished, `--cleanup-case <origin-id>` creates a
**separate reduced contract** with zero focus/types, one exact clear and no
host probe input. It retains the original marker, configuration, controller
and logical target; durably delegates the origin's unused clear before any
new native input. It requires fresh reviewed exact-marker evidence and a
separate observed-empty result. A second delegation is rejected. Its report
records `cleanupOnly` and `originCaseId`; it cannot pass the full marker or
independence gate or rewrite the original failed report. If clear was already
claimed, the unrelated draft changed, or ownership is uncertain, stop.

## Current acceptance

One actual guest case passed the bounded marker gate with the explicit
60-second profile and declared 30-minute case budget. All three guest effects
were observed in the same generation, no input was repeated, and the final
host token/focus remained unchanged after guest cleanup. A prior read-only
host capture expired and was refreshed; no action was dispatched from it.
Earlier 30-second failures, a separate successful cleanup and the 15-minute
expired case remain immutable and separately documented.

This is controller-attributed evidence under trust in the OS, CUA, Agent review,
local clock, external host store and machine owner. It is not independent
execution attestation. At this marker milestone, actual guest restore/reconnect, guest stable-Chrome
handoff/permission handling, Lab trial/source/reply, and a second reusable app
profile remain later qualification work. No new live submission follows.

## Later restore/reconnect check

The initial [actual restore qualification](RESTORE-QUALIFICATION.md) observed a cold
baseline rollback, byte-identical selected host authority files, rejection of a
finished consumed case and a fresh pinned SSH connection. The restored Claude
surface differed and ordinary Chat readiness was rejected as ambiguous. The
active in-flight native recovery path was not qualified by that attempt. The configured
source guest is preserved, and the ignored default connection now selects the
verified restored test clone. Historical findings above remain unchanged.

The later explicit `claude-unified-no-send-v1` surface profile passed readiness
and a separate active focus-only cold-restore check. Old qualification was
rejected; fresh empty readiness was observed, and the retained focus claim
refused replay before native dispatch without deadline renewal. See the
[follow-up findings](RESTORE-QUALIFICATION.md#merged-conversation-and-active-case-follow-up-2026-10-23).
This does not qualify complete marker typing/cleanup on the merged surface,
arbitrary crashes, the application handoff or Send. The profile cannot authorize
handoff or arrival; default/legacy surface checks remain unchanged.
