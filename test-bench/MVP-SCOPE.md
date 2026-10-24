# Agent-operated bench MVP

Agreed scope, 2026-10-22. The MVP is a reusable runner toolkit plus **one
dedicated maintainer test environment**. Its first qualification lane is
regular stable Chrome → the pinned public Lab reading component using SDK
0.1.4 → one fresh Claude desktop Chat. It is separate from the SDK, the public
reading flow and a future hosted testing service.

**Current bounded status, 2026-10-24:** Three explicitly authorized fresh Lab → Claude desktop cases have finished.
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
The original completion criteria below are unchanged. The next code target is
the remaining activity-inspection gap after the repeat gate and local fixture
checks; further environment expansion is not a new MVP deliverable.

The initial operator direction authorized documenting this scope and starting the dedicated
environment's **no-Send feasibility check**. This does not authorize another
Lab handoff, Send or inference in Claude under test. The coding Agent may
operate the permitted controller within this no-Send scope. SDK 0.1.4 stays unchanged, the existing
Codex draft stays untouched and unsent, and no deployment/publication follows.
Actual observations belong in [dated findings](AGENT-QUALIFICATION.md), with
the next phase maintained in the [runner plan](AGENT-RUNNER.md). The
[dedicated environment runbook](DEDICATED-ENVIRONMENT.md) records setup pins
and the initial operator/controller boundary.

## Maintainer environment

A local macOS VM is the preferred candidate, subject to resource and controller
qualification. **Placement clarification, 2026-10-23:** native Computer Use
must execute inside the guest, with guest-local regular Chrome, Claude and the
local Lab preview. The coding Agent and canonical authority may run on the
host through the published guest tool connection. This replaces the initial
requirement that the coding Agent itself also run in the guest. Host commands,
clicking the VM viewer or SSH alone do not qualify native targeting/capture.
The [host-authority bridge](HOST-AUTHORITY.md) is the current narrow candidate;
it uses the installed guest CUA, not a substitute desktop-control engine.

The maintainer supplies and qualifies one environment, one controller and one
job at a time. Initial installation, account login, protected authentication
and OS/tool permission grants are setup boundaries. A dedicated test account is
preferred; a separate desktop does not isolate cloud history, quota or account
state when the same Claude identity is used.

The target operating condition is that the human continues using host apps,
including personal Claude, while the guest owns the test desktop. Repeated
manual pauses, finding windows, pasting, pressing Send or entering observation
forms must not become the normal runner workflow. Guest permissions and
controller availability still need actual checks; a VM is not sufficient by
itself.

Recoverable guest baselines may simplify preparation, but case authority and
consumed attempts must live in durable storage **outside disposable guest
state**. Before any future action, recovery must reconcile that authoritative
journal. Restoring a guest baseline must never silently restore a Send budget
or reopen a finished case. The [external-store candidate](NO-SEND.md) now
implements this separation and explicit recovery, with filesystem/crash
fixtures. Path checks cannot prove host placement outside a VM baseline;
actual orderly active-case restore was checked later under a separate bounded
contract. That does not qualify arbitrary crashes or Send recovery. The later
guest marker/input result is recorded separately below.
The stale shared authority mount is excluded. The current bridge instead
persists claims on the host's native external store before guest dispatch;
that bounded setup/readiness path has been exercised. The separate
[remote marker lane](REMOTE-MARKER.md) now connects marker typing/cleanup and
owned-surface input checks. A remote Lab trial has now used one Send and
recorded its reply and raw-request denial; full application qualification is
still incomplete as summarized above.

## Toolkit and local developer reuse

The toolkit supplies pinned input checks, browser checks, bounded interaction
guards, draft/source/reply inspection helpers, interruption/recovery accounting
and structured reports. It uses the coding Agent's permitted Computer Use;
building another desktop-control engine is outside this MVP.

The guest-native automation remains Lab-specific. A declarative local
[profile adapter](READING-PROFILES.md) now reuses the server, checker, case
preparation and report schema for Lab and Inshell. Both browser matrices passed;
Inshell native interaction is unqualified. The intended broader ownership split
remains:

| Developer supplies | Shared toolkit supplies |
| --- | --- |
| Local preview URL and actual component locator | Browser interaction and decoded payload checks |
| Expected public invitation and source references | Separately named draft, source and reply checks |
| Bounded expected outcome and authorized actions/limits | Attempt guards, interruption handling and reports |
| Coding Agent, permitted Computer Use, stable Chrome, signed-in Claude and device access | The procedure for operating those existing controls |

Local reuse must require no VM. Browser checks can run without a Claude
submission. An optional real-client run on a developer's personal desktop
requires app-wide Claude reservation for the full run under the current
bundle-targeted interface. It cannot qualify concurrent personal use of that
same Claude instance. Initial access and run authorization remain human setup;
the Agent performs normal interaction and recording.

The profile must reuse the same guards and report format rather than copy a
new runner per application. Exact comparison stays strict by default. The
existing opt-in `lab-claude-ax-paragraphs-v1` exception stays restricted to its
named Lab invitation and package pins; it must not become generic whitespace
normalization.

## First gate: dedicated no-Send feasibility

At this gate's initial assessment it was **not yet passed**; the later bounded
results are summarized above and do not establish the full MVP. The earlier no-Send pass under a temporary
host app-wide reservation is historical evidence, not guest qualification.
Guest-native observation, host-owned setup claims and two reviewed empty-Chat
readiness captures are now observed. A later host-authorized guest case also
passed focus, exact marker delivery/cleanup and sequential non-interference
between the owned host browser field and guest-native Claude. Earlier expiry
results remain unchanged. The subsequent orderly active-case restore/reconnect
result is separate from the marker gate; arbitrary crash and Send recovery
remain unqualified. This bounded marker result is not the full MVP.

1. Check host capacity, a supported guest/runtime and the permitted native
   controller inside the guest. The reviewing Agent/authority may run on the
   host through the published guest tool connection. Report missing
   installation, login or permission prerequisites rather than assuming them.
2. Establish a guest-owned fresh empty Claude Chat, actual target identities,
   controller availability and complete fresh AX/pixels whose contents agree.
3. With host personal apps remaining usable, focus the guest composer, type
   one public diagnostic marker, observe its exact arrival, clear only that
   verified marker and observe empty readiness. Record host/guest input
   independence and any assistance separately.
4. Check interruption behavior: lost control, stale observation, competing
   input or disagreement invalidates readiness and blocks further input.
   Reconnection must require fresh qualification rather than replaying an
   unfinished action.
5. Record cleanup, environment versions, bounded evidence references and
   resource findings. If any target/effect is uncertain, stop and leave that
   portion unqualified. Do not Send, invoke Claude inference or activate the
   Lab handoff in this gate.

The [execution contract](EXECUTION-CONTRACT.md) governs authority, freshness,
interruption and assistance. Passing this gate establishes only bounded guest
control, observation, input independence and cleanup under recorded conditions.
It does not establish successful handoff, native Send or source acquisition.

## Later MVP acceptance

After the no-Send gate, separately authorized application trials must:

- Complete **three consecutive fresh Lab cases** without human window rescue,
  manual submission or report entry. Each case needs its own bounded scope and
  authorization; a standing plan grants no future Sends. The later explicit three-case
  commission is now consumed, as recorded above.
- Exercise the actual installed component and retain separate outcomes for
  browser behavior, launch permission, draft arrival/fidelity, attempted Send,
  observed submission, source access, reply completion and cleanup. Inspected
  source denial is an application outcome, not successful reading.
- Stop safely on stale/conflicting targets, permission loss and uncertain
  sending. Preserve consumed attempts across restart and baseline restoration;
  never retry an uncertain Send or infer delivery from an API return.
- Run a second local public-reading fixture through the same thin profile,
  guards and report format without modifying the core runner. Name any actual
  real-client checks separately from browser/fixture checks.

These checks are a bounded smoke qualification, not universal client support
or an independent execution-origin attestation. Reports retain controller and
local-operator trust, checked material and unchecked conclusions. No raw
private conversation content, account identifiers or unrelated UI is persisted.

## Out of scope

- Hosted QA, remote preview tunnels, public job submission, queues,
  multi-tenancy and account provisioning/billing.
- Requiring SDK consumers to install a VM or desktop automation. The bench is
  optional developer/maintainer tooling, not a visitor-side protocol helper.
- ChatGPT/Codex under-test control, THOUGHT, artwork participation, private
  content, existing conversations and multiple-round scenarios.
- Concurrent personal use of the same Claude instance under test, or bypassing
  OS/client permissions to obtain it.
- Rebuilding an OS/Computer Use controller, fixing its provider internals or
  treating API/CLI inference as a substitute for the desktop lane.
- Registry publication, repo visibility/licensing changes, deployment and
  certification of Agent intention, authorship or independent execution origin.
