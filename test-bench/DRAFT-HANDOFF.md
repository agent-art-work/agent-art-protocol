# Guest Lab handoff and unsent draft candidate

This is a local runner development path for one public Lab invitation through
regular Chrome into Claude desktop. It stops at an observed, compared, unsent
draft. It is not a general protocol requirement, a Send lane or a claim that an
Agent read or executed the invitation. One bounded case passed on
2026-10-24: native regular Chrome control, actual Lab handoff and an unsent
public draft in merged Claude. Presentation matched; exact exposed text did
not. See the [actual staged result](AGENT-QUALIFICATION.md#guest-chrome-and-lab-draft-only-handoff-2026-10-24).
This profile retains zero submission authority. A later separately authorized
[one-Send trial](READING-TRIAL.md) finished with a visible transition, completed
reply and inspected curl denial, but unconfirmed submitted invitation. Strict
application qualification and the full three-case MVP remain incomplete; no
further live action is selected.

Review the [standing runner plan](AGENT-RUNNER.md) before each slice. The earlier
[native readiness arrangement](HOST-AUTHORITY.md), [marker checks](REMOTE-MARKER.md)
and [cold-restore qualification](RESTORE-QUALIFICATION.md) retain their separate
scope. None supplies current handoff authority or qualifies future submission.

## Placement and authority

[`remote-reading.mjs`](remote-reading.mjs) owns the immutable
`lab-unified-draft-nosend-v1` contract, external host claims and bounded report.
The contract binds one ephemeral controller connection, observed guest versions,
logical owned tabs/window, loopback origin, SDK/archive/context pins, comparison
policy and original deadline. Changed bindings or inputs require a new case;
they cannot reopen a consumed action.

[`vm-reading-bridge.py`](vm-reading-bridge.py) carries published guest CUA over the
approved pinned SSH connection. Native app control runs inside the dedicated
guest. Regular Chrome is selected explicitly as
`/Applications/Google Chrome.app`, bundle `com.google.Chrome`; Chrome Beta is
excluded. Claude is observed through its own app handle. No host UI, VM viewer,
alternate native driver or model turn is used.

The host serves the pinned public bench fixture on loopback. The commissioned
SSH forward exposes that fixture only on guest loopback. Authority files stay
in the external host store: the guest receives no authority replica or mounted
authority directory. This fixture listener does not become a protocol service
required by reading sites.

SDK **0.1.4**, its archive and the pinned Lab context remain unchanged. The bench
imports the existing packaged handoff builder; it does not replace the SDK with
a test implementation. The route's requested `chat` surface does not establish
legacy Chat mode in Claude's merged conversation interface.

## Bounded operations

| Operation | Maximum | Required evidence |
| --- | --- | --- |
| Browser probe | 1 | Owned current bench component, pinned route, then a trusted canceled click receipt |
| Real component handoff | 1 | Passed probe, fresh empty Claude preflight and current pinned component |
| Native launch confirmation | 1 | Current unique `Open Claude?` prompt naming the expected loopback source, with exposed persistent permission unchecked |
| Claude typing, keys, clearing or Send | 0 | No such operation is available under this draft-only profile |

Companion browser lifecycle claims are separate from those zero Claude-input
limits. They allow one recognized startup-prompt dismissal, two owned new tabs,
two fixed loopback navigations and two owned-tab closes. Only Chrome receives
the fixed address/navigation/close keys. Optional cleanup of one earlier owned
browser-only probe requires its exact retained case and currently matching
public URL; unrelated tabs remain untouched. An API return alone does not prove
navigation or closure, so inspect the resulting surface before recording either.

Every consequential action is durably claimed before native dispatch. An
uncertain return consumes its attempt and blocks further input; a restore,
new process, new capture or receipt poll cannot renew it. Read-only observation
and receipt retrieval can continue within their bounds. Preserve incomplete
cases rather than retrying a possibly performed click.

## Operating sequence

Start with the approved connection, actual observed guest metadata and a fresh
ignored status file. These filenames are placeholders, not a ready environment:

```sh
python3 test-bench/vm-reading-bridge.py \
  --connection ACTUAL_APPROVED_CONNECTION.json \
  --environment ACTUAL_GUEST_ENVIRONMENT.json \
  --browser-origin http://127.0.0.1:4180 \
  --record .local/test-bench/FRESH_STATUS.json \
  --authorize-handoff
```

`--authorize-handoff` records existing operator direction; it does not obtain
consent or grant OS permissions. Normal app approvals remain session-scoped.
Protected setup, missing control or unexpected authority is a stop condition.

1. Select exact regular Chrome and review the returned CUA documentation. Take
   a fresh complete AX/screenshot pair. Check native control separately from
   the extension-backed browser adapter: `missing-turn-context` leaves that
   adapter unqualified, even if permitted native Chrome controls work.
2. Use the claimed lifecycle operations to prepare the owned browser lane.
   Review its actual document/address and descendant Claude link. Claim
   `browser-probe`, activate that component once, then settle its canceled
   post-dispatch receipt. This cannot establish desktop arrival.
3. Observe an owned empty Claude merged conversation with positive current
   controls, no existing messages and no response in progress. Record
   `preflight`; the older no-Send readiness result alone is insufficient.
4. Prepare the owned desktop lane and claim `handoff` against its current
   component. Activate once and settle the uncanceled receipt. If the expected
   native launch prompt appears, inspect and claim `confirm-launch` once.
5. Observe Claude again after launch resolution. Record `arrival` from that
   fresh paired capture, comparing the exposed composer with the canonical
   public context. Leave the draft unsent. Close only verified owned browser
   tabs, observe cleanup effects and finish with bounded cleanup facts.

For reviewed operations, supply the actual fresh identifier rather than copying
an old example:

```json
{"op":"preflight","reviewedCaptureId":"ACTUAL_CAPTURE_ID","visualAgreement":"agrees"}
{"op":"handoff","lane":"desktop","reviewedCaptureId":"ANOTHER_ACTUAL_CAPTURE_ID","visualAgreement":"agrees"}
{"op":"settle"}
{"op":"arrival","reviewedCaptureId":"POST_LAUNCH_CAPTURE_ID","visualAgreement":"agrees","launchResolved":true}
```

These are sequential examples, not a batch to dispatch without intermediate
capture review and effect checks. Case IDs such as `reading-draft-CASE_ID` name
the canonical host case; the ignored transport status is only a projection.

## Freshness, receipts and comparison

Capture age is **30 seconds**, including time spent awaiting normal app
approval. The bridge checks again before dispatch and before accepting a
mutating app approval. Mutations and non-observation results invalidate the
previous capture. The case's **30-minute** deadline is fixed at preparation.
Refreshing an observation does not extend the case or consumed budgets.

The bench's `afterDispatch` callback observes cancellation after the native
event listeners finish. Its separate host-stored receipt retains only bounded
client, lane, cancellation, trust flag and timing/ordinal facts. It persists no
draft, target text or route. Settlement requires the exact claimed page/run,
one matching event and current package pins. Read-only HTTP polling waits for
that receipt; it never repeats the component click or substitutes GET time for
event time.

Guest event timestamps are preserved. An explicit
`ssh-bracketed-guest-clock-v1` sample binds guest time and boot identity to a
host interval; its bracket is at most two seconds and its fixed drift allowance
is 100 ms. Correlation must establish event-after-claim ordering within the
original deadline. SSH attribution and stable clocks remain trusted; midpoint
retiming or an arbitrary tolerance cannot repair ambiguous ordering.

Native Chrome AX may expose the route directly. Otherwise the candidate can
pair the current owned native document/link with the trusted loopback fixture's
pinned SDK route. That supplements native evidence; it is not independently
observed DOM href identity. Browser receipts are page/server-attributed facts,
not proof of native arrival. Claude arrival requires its separate current
AX/pixel pair and composer comparison.

Exact exposed-text comparison is the default. The explicitly selected pinned
`lab-claude-ax-paragraphs-v1` policy also accepts the known Lab representation
with paragraph blank lines collapsed. It reports exact and presentation matches
separately. Neither comparison establishes transport-byte identity, submission,
source access, model execution, authorship, comprehension or intention.

Canonical reports retain bounded facts and digests; raw AX, screenshots, draft
text and route strings remain transient. Controller review, logical surface
ownership, exclusive guest input, OS/CUA/SSH identity, clocks and host storage
remain trust dependencies. This candidate produces no blanket genuineness or
environment reliability flag.
