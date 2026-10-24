# Host authority and guest-native Claude readiness

Candidate maintainer tooling, checked 2026-10-23. The host owns canonical
authority and the coding Agent's review; native Computer Use executes inside
the VM. This is a bounded preparation path for the dedicated no-Send test,
not the complete marker test or a Lab application trial. It changes no SDK
inputs and provides no inference or Send operation.

## Placement and authority

The earlier mutable host-folder mount returned stale guest metadata. It stays
unmounted and unqualified. This arrangement removes it from the authority path:

1. The host runs [remote-readiness.mjs](remote-readiness.mjs), using the existing
   external [authority store](NO-SEND.md#external-authority-setup) on the host's
   native filesystem, outside the repository and disposable guest baseline.
2. The [VM bridge](vm-cua-bridge.py) opens the installed guest app server over an
   already approved SSH control connection. It creates an ephemeral tool
   context, starts no model turn, and calls only the published `cua_repl.js`
   interface and its documented native API inside the guest.
3. The coding Agent reviews complete paired AX/screenshots transiently. The
   host validates the current target, empty composer, mode, freshness and scope,
   then persists an exclusive action claim **before** native dispatch.
4. A native API return is recorded separately from its observed effect. Two
   distinct fresh reviewed Chat captures are needed for readiness. Missing or
   rejected dispatch acknowledgement leaves the claim consumed and blocks
   further input. A changed controller/runtime binding cannot replay it.

There is no guest authority replica, reverse authority service, public listener,
authority-volume mount or host viewer automation. The guest never reads or
writes the canonical case files. Restoring guest state therefore cannot restore
those host claims; actual VM restore and reconnect behavior are still untested.
Do not replace a missing host store or invent a fresh budget to resume a case.

The current fixed scope is:

| Operation | Maximum | Condition |
| --- | --- | --- |
| Select the shared Chat/Cowork mode | 1 | Actual empty Code surface, unique observed controls and reviewed fresh capture |
| Prepare an empty Chat form | 1 | Actual New chat control, or the observed empty Cowork form's explicit Chat selector |
| Record readiness | 2 | Distinct fresh complete paired captures; actual Chat selected, empty owned composer and no existing messages |
| Type, keypress, clear, handoff, Send | 0 | Not exposed by this bridge |

Each setup action remains single-use even after its API returns. A failed
precondition consumes no native action. Finished cases cannot be reopened.
This setup lane supplies no marker input or Lab submission. The separately
authorized [remote marker lane](REMOTE-MARKER.md) now connects the existing
no-Send session to this host/guest arrangement and has its own bounded result.
The Lab submission path remains unqualified.

## Coding Agent use

The maintainer supplies Node.js 22 or later, Python 3, the installed guest
app-server/CUA runtime, an unlocked dedicated guest and authorized account/tool
access. Optional Pillow only resizes returned images for transient display;
without it the bridge returns bounded original native images. It is not a new
desktop driver. An integrating developer does not need this VM arrangement.

Keep machine-specific profiles and records ignored. Use the SSH profile from
[controller connection](CONTROLLER-CONNECTION.md#use-the-current-connection):
`transport` pins the existing private control socket, strict known-hosts file,
destination and installed guest CLI. Optional `guestWorkspace` selects the
ephemeral context's guest working directory; otherwise `controller.cwd` is
used. The existing task reader remains read-only and gains no mutation method.

Supply observed guest versions separately, using the bench environment shape:

```json
{
  "os": { "name": "macOS", "version": "ACTUAL_GUEST_VERSION" },
  "browser": { "name": "Google Chrome", "version": "ACTUAL_STABLE_VERSION" },
  "apps": { "claude-app": { "version": "ACTUAL_CLAUDE_VERSION" } }
}
```

These are controller-attributed observations, not VM attestation. Browser
bundle metadata does not qualify browser control. The unchanged SDK archive,
installed files and lock are checked by the normal input loader.

After explicit human authorization of this setup scope, run:

```sh
python3 test-bench/vm-cua-bridge.py \
  --connection .local/test-bench/controller-connection.json \
  --environment .local/test-bench/environment/observed-guest.json \
  --record .local/test-bench/environment/fresh-readiness-status.json \
  --authorize-setup
```

The authorization flag records existing human direction; it does not obtain
consent. Use a new status path; never overwrite a prior case or active record.
The bridge binds one ephemeral runtime and uses the existing host authority
binding. An expired SSH master fails closed without authentication fallback.
Do not silently reconnect and replay. The normal Claude app-access request may
still require an actual human grant. The Agent may relay existing applicable
human direction to that exact request with session persistence only; it must
not manufacture consent, widen the grant or automate OS security prompts.

The Agent operates JSONL over the process's stdin/stdout:

```json
{"op":"select"}
{"op":"observe","documentationReviewed":true}
{"op":"image","index":0}
```

Read the returned CUA documentation before observing. Review the actual image
and complete AX from that exact observation. The bridge offers transient
`text` inspection; do not export unrelated sidebar history or account material.
If a normal app approval is pending, respond only to its actual request ID
using the actual human direction. Unexpected approvals are rejected.

Only if mode preparation is required and covered by the human's scope:

```json
{"op":"select-chat","reviewedCaptureId":"ACTUAL_FRESH_CAPTURE_ID","visualAgreement":"agrees"}
```

Capture and review again before the optional `open-new-chat` action. The host
derives the permitted control index from the current capture; the caller cannot
provide an arbitrary click target. Do not copy an old positive review into a
new request. Observations older than 30 seconds are rejected. Capture time,
exclusive guest input and visual agreement remain controller assertions.

After the actual Chat form is present, capture, review and record readiness:

```json
{"op":"ready","reviewedCaptureId":"ACTUAL_FRESH_CAPTURE_ID","visualAgreement":"agrees","modeProfile":"claude-chat-cowork-v1"}
```

Repeat only the fresh observation/review/readiness recording for the second
distinct pair, then use `finish` and `close`. This is two observations, not two
message submissions. `status` returns bounded diagnostic state. A failed or
incomplete report is valid and must remain as recorded; it is not permission
to repeat a consumed native action.

The named mode profile is based on the observed Claude 3.6556.2 UI. It requires
the shared Chat/Cowork umbrella selected, Code unselected, **inner Chat selected
and Cowork unselected inside the owned primary region**, `/new`, empty composer
and no existing messages or streaming response. Cowork also uses `/new`, so
that URL and the umbrella alone cannot pass. Historical default mode checks
remain unchanged. An unknown profile or changed UI must fail rather than guess.

## Reports and limits

### Merged-conversation no-Send profile

If the actual owned capture shows the merged UI documented by Anthropic,
use the separately named profile for **readiness only**:

```json
{"op":"ready","reviewedCaptureId":"ACTUAL_FRESH_CAPTURE_ID","visualAgreement":"agrees","modeProfile":"claude-unified-no-send-v1"}
```

It requires the actual positive controls listed in the
[restore follow-up](RESTORE-QUALIFICATION.md#merged-conversation-and-active-case-follow-up-2026-10-23).
Two distinct reviewed pairs must use the same profile; default/legacy checks
remain conservative. This does not recreate separate Chat, restrict model
tools, authorize setup actions or qualify handoff/Send. The actual merged
readiness case passed with zero setup input. The separate active-case recovery
check retained host authority and refused consumed focus after cold restore.
Preserve the earlier blocked/incomplete reports and their original meaning.

Canonical reports stay in the external host store. The fresh ignored status
file records startup, dispatch counts, timings, capture hashes and terminal
outcome; it is a projection, not authority. Raw AX/images live only in the
native tool and transient Agent I/O. Do not retain them as files or transcripts.
The report records claims, native returns and readiness separately. Close the
owned ephemeral context after recording the result; the console and approved
SSH master may remain for the next commissioned phase.

Actual setup plus two Chat readiness observations passed. A later parameterized
entry-point check produced one accepted readiness observation, then rejected
an expired second capture and finished incomplete without any setup input.
Both reports are preserved in [dated findings](AGENT-QUALIFICATION.md#host-authority-and-guest-chat-readiness-2026-10-23).
Neither report qualifies focus, keyboard delivery, marker clearing, simultaneous
host use, Chrome interaction, Lab handoff, source reading or Send. A later case
needs fresh current observations; this historical readiness report grants no
future action authority.

The host, guest OS/runtime, SSH endpoint, local storage/clock and controlling
Agent remain trusted. A privileged owner can fabricate records or bypass the
bridge. Logical window ownership and visual agreement are attributed, not
independently authenticated. Durable claims prevent this runner's replay; they
cannot make native UI execution exactly once or prove model authorship, reading
or intention. No blanket environment or Agent-participation flag is produced.
