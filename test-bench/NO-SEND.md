# Dedicated no-Send diagnostic

This is local bench tooling, separate from SDK 0.1.4. It supplies a diagnostic
case and an Agent-facing CUA session with **zero handoffs and zero Sends**.
It does not launch an app, select a conversation, grant permissions or judge
pixels automatically. The coding Agent supplies the permitted guest-local
Claude handle, normalized complete captures and its actual AX/pixel review.

The implementation and synthetic checks do not qualify the VM. The image is
still provisioning; guest setup and the real no-Send gate remain pending.
See [standing plan](AGENT-RUNNER.md), [execution contract](EXECUTION-CONTRACT.md)
and [dedicated setup](DEDICATED-ENVIRONMENT.md).

## External authority setup

Choose an absolute persistent directory **outside the disposable workspace**.
For a VM, this must actually reside on storage outside the guest baseline;
a second folder inside the VM is insufficient. A supported mounted directory
can supply filesystem access. This code does not deploy a remote authority
service or set up a share. Verify that placement during guest setup.
Bind a fresh guest checkout to the mounted path it can actually access; do not
copy a host-local binding whose absolute path is invalid in the guest.

```sh
npm run bench:desktop -- authority-init /absolute/persistent/bench-authority
npm run bench:no-send -- prepare --authorize-probe
```

Alternatively pass `--authority-dir /absolute/persistent/bench-authority` to
the first `prepare`. The disposable workspace retains a local store reference;
the external store retains its identity, active-case ownership, case state,
journal, immutable input claims and final report. The regular Lab runner now
uses the same store for handoff/Send claims, dispatch entry, bounded materials
and canonical reading records. Workspace browser reports are projections.

Paths are checked through their real filesystem locations: nested or
symlink-aliased workspace storage is rejected. An unavailable or substituted
bound store blocks operations; it is never silently recreated. Earlier
workspace-local case records remain historical and read-only. They are not
imported, requalified or granted fresh attempts.

## Coding Agent workflow

The `--authorize-probe` option records existing human direction; it does not
obtain permission. Only prepare a real case when the environment and operator
scope permit it. Record actual guest OS/browser/Claude versions through
`loadBenchInputs({ environment })` and pass those `inputs` when preparing;
the SDK archive pin remains unchanged.

```js
import {
  prepareDiagnostic, qualifyDiagnostic, createDiagnosticSession,
  recordDiagnosticIndependence, interruptDiagnostic, finishDiagnostic,
} from './test-bench/no-send-runner.mjs';

const state = await prepareDiagnostic({
  root: workspaceRoot, inputs, authorizeProbe: true,
  authorityRoot: persistentDirectory, timeoutMs: 180000,
});
const qualification = qualifyDiagnostic(state.id, actualCapabilities, { root: workspaceRoot });
const session = createDiagnosticSession({
  caseId: state.id, root: workspaceRoot, app: permittedClaudeApp, controllerId,
});
```

`actualCapabilities` has the same bounded fields as the
[execution assessment](AGENT-RUNNER.md#agent-facing-cua-session). An unsuccessful
qualification blocks input. It is a controller assertion, not an OS witness.

Each following call receives a **fresh, actually reviewed** normalized capture
and current selection. Selection contains `freshChat`, `scopeIndex`,
`composerIndex`, `claudeModeIndex`, `codeModeIndex` and
`execution: { controllerId, generation, inputOwnership, visualAgreement }`.
Use the current returned generation; do not copy positive values blindly.

1. `await session.focus(snapshot, selection)` clicks only the selected owned
   empty composer. Capture and review again; call `session.observeFocus()`.
2. With current exposed composer focus, `await session.typeMarker()` types the
   generated public marker once. Capture and review again;
   `session.observeMarker()` must establish the exact marker.
3. `await session.clearMarker()` uses `setValue(index, '')` only after the
   exact marker is freshly observed. Capture and review again;
   `session.observeEmpty()` must establish empty readiness.
4. Record actual host/guest input independence with
   `recordDiagnosticIndependence(id, { status, source }, { root })`.
   Status is `observed`, `failed` or `not-observed`; source is `controller`
   or `operator-report`. A human report remains attributed and cannot pass
   the controller-observed gate.
5. `finishDiagnostic(id, { root })` writes the bounded outcome and cleanup
   disposition. It performs no UI cleanup itself.

There is no handoff, Send, Enter-key, URI or model API in this session.
The normal Send-authorized runner rejects a diagnostic case. Each focus,
typing and clearing attempt is claimed durably before dispatch and cannot be
renewed by recreating the session. An API return establishes dispatch only;
effects require a distinct post-action capture. Selected snapshots, unrelated
text and private conversation routes are never persisted; only bounded facts,
digests, timestamps and the generated public marker are stored.

Conflicting, missing, stale, non-owned, changed-window or nonempty unexpected
captures block input and revoke qualification. Unexpected marker changes block
clearing. Use `interruptDiagnostic(id, reason, { root })` for a lock, competing
input or lost control. A late native-call return cannot restore qualification.
An unconfirmed typed marker is explicitly reported as possibly remaining.

## Crash and workspace-restore recovery

Stop the old controller and establish exclusive input **before** recovery.
These are controller-attested conditions, not an OS lock this toolkit supplies.
Do not steal a live writer's lock. Protected or uncertain access remains an
operator exception under the execution contract.

```sh
npm run bench:no-send -- reconcile diagnostic-CASE-ID \
  --controller CONTROLLER-ID --previous-controller-stopped --exclusive-input

npm run bench:desktop -- reconcile desktop-CASE-ID \
  --controller CONTROLLER-ID --previous-controller-stopped --exclusive-input
```

Reconciliation reads canonical external records, preserves fixed deadlines,
all consumed attempts and terminal status, and advances the execution
generation. Previous qualification/captures cannot authorize another action.
A stale lock is preserved as an abandoned-lock record only after those explicit
recovery attestations. Missing, corrupted or mismatched authority blocks
recovery; it is not a reason to create a replacement empty store.

Requalify from current guest observations. In an uncertain diagnostic, a fresh
exact-marker observation can permit the still-unused bounded clear, while a
consumed type or clear cannot repeat. An uncertain Send remains consumed and
observation-only. Finished cases stay finished. No recovery extends a deadline
or renews authority. A diagnostic interrupted during execution cannot become
an uninterrupted pass.

Claims and checkpoints use exclusive creation or atomic replacement, file
`fsync` and directory `fsync`. Filesystem fixtures exercise workspace restore,
an actual child-process exit after claim persistence, stale locks and replay
rejection. Actual VM restore, mounted-storage durability and independent guest
input remain live qualification gates. Store placement, filesystem behavior,
controller attestations and the machine owner remain trusted; this does not
resist a malicious authority owner or prove exactly-once application delivery.
