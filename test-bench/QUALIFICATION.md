# Initial reading-bench qualification

Date: 2026-10-21. Bounded local checks of the new bench, using unchanged private
SDK 0.1.2 and the pinned Lab invitation. This is not a general client-support
certificate. The source branch is `codex/reading-test-bench`.

## Input identity

- SDK archive SHA-256:
  `0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5`.
- Exact public invitation: 983 UTF-8 bytes; SHA-256
  `ebef0c1f9ce1c03a6028f840086b9ff079cb3fc2df53d79e6053b9b4f6a8bde6`.
- Lab source commit `225d09591ae6ba012176f1cc002738e9d6fef11f`,
  `docs/AGENT_ACCESS.md`; the full source pin is in
  [lab-source.json](lab-source.json).
- The invitation identifies a live public index. No exact retrieved index
  bytes or later document bodies are pinned by the handoff itself.

## Synthetic and browser checks

All **113 repository tests passed**, including **25 new bench tests** for scope
separation, version/provenance requirements, exact-context claims, conflicting
observations, hostile Host/Origin requests, local write capability, persistence,
and the second native-launch cancellation guard. These use synthetic inputs.

Regular stable Chrome 156.0.8078.47 was verified by bundle ID before isolated
headless testing. Exact payloads, isolated Copy success/denial, fallback,
canceled native activation, receipt absence and error/resource checks passed.
The installed archive, its 11 files and dependency lock matched the pins.

| Browser case | Result |
| --- | --- |
| 1440px light | Passed |
| 1440px dark | Passed |
| 390px dark, coarse pointer | Passed |
| 320px light, coarse pointer | Failed: a control extends beyond the component frame |

The failing case uses the SDK's default system UI font. With the tested 257px
container the row occupies x=24–281, but Copy extends to about x=286.6. The
control remains within the viewport; the joined-frame containment check fails.
The earlier SDK fixture explicitly selected Arial and does not cover this
default-font result. No private sizing override or change to the immutable SDK
was made to conceal the finding. A future SDK fix needs a new archive and
consumer qualification. Host geometry varies with scrollbar, fonts and width;
these observations do not establish an exact universal failing interval.

The first attempt also encountered a missing favicon and a host-header test
whose fetch implementation ignored the supplied Host. The bench now serves
favicon requests explicitly, and the Host test uses an actual HTTP request.
Those bench/test issues were repaired; the default-font SDK finding remains.

Ignored browser evidence is in
`.local/test-bench/browser/final-2026-10-21/`, with earlier attempts retained
in `initial-2026-10-21/`, `lab-gutters-2026-10-21/` and
`geometry-2026-10-21/`. Automated reports
explicitly keep real-client results `not-run`. Screenshots were inspected
separately. All owned automated profiles, targets and fixture servers closed.

## Real desktop observations

The live operator-assisted run is
`reading-031cab16-e43b-4c4e-be45-32addcdbc0ec`, retained locally under
`.local/test-bench/runs/`. Installed bundle versions were recorded by the bench:
Claude 2.37337.1 and the ChatGPT/Codex handler 26.1013.40934, with the actual OS
and stable-browser versions. Bundle metadata does not identify a model or its
server execution policy.

| Stage | Claude desktop | Codex desktop route |
| --- | --- | --- |
| Native request | Observed browser event; one Chrome open prompt accepted | Observed browser event; one Chrome open prompt accepted |
| Actual destination/draft | Fresh Claude Chat draft directly observed through desktop UI | Operator reported “Codex with the Lab draft” |
| Exact composer UTF-8 equality | Not observed; complete-looking public draft is not a byte comparison | Not observed |
| Send | Sent once; directly observed | Kept unsent |
| Tool permission lifecycle | Not separately observed | Not run |
| Raw index access | Visible download failed with HTTP 403 / CONNECT tunnel / agent-proxy `connect_rejected` | Not run |
| Visible orientation | Completed, with collection overview and access/verification limits | Not run |

Claude displayed a separate Read tool entry and described index-only access.
The observed raw-download tool failed. This record therefore does not establish
raw index identity, successful hash verification or document reading. A visible
introduction and raw-download failure coexist; neither is silently promoted
into complete reading success or a claim that no execution occurred.

Direct inspection of the Codex application was blocked by the app-control
tool. No alternate inspection path was used to bypass that restriction. Draft
arrival is preserved as the human operator's report, not a desktop UI finding.
The owned test draft remains unsent. No global application permission, proxy,
allowed-domain or security setting was changed.

The public Claude test conversation remains available for review. No private
transcript or conversation identifier is retained in this qualification. No
other application sessions or user-opened browser tabs were modified or closed.

The local form successfully saved Codex's unsent stage as `not-run` and reset
its controls. Later interactive Chrome access stopped with an extension-update
request. This interruption is not a native-handoff or SDK execution result.
The isolated automated regression run completed separately with the results
above.

After the operator updated the extension, regular Chrome reconnected. The saved
run loaded with the same two result lanes and survived switching lanes and
refreshing. Its downloaded JSON matched the stored run and recomputed summary
exactly. Automation timed out waiting for the download event, but Chrome's
download UI showed the named file and the actual saved file validated; the
download was not repeated.

A separate disposable run exercised missing-run recovery, enabled form controls,
matching and mismatching public-text comparisons, cleared comparison input and
the absence of automatically appended observations. This exposed a stale
comparison message after **New run**. The bench now clears that message, the
comparison input and observation form; the corrected reset was verified in
Chrome. Keyboard Tab navigation moved from the About identity to ChatGPT,
Claude and Copy without activating a native route. The disposable tab closed.
The browser's keep-tab marker still requested an extension update; this did not
prevent functional checks, screenshot capture or disposable-tab cleanup.

The final live-run screenshot and export validation are retained in ignored
`.local/test-bench/live/`. No new Agent was launched or sent to during these
follow-up checks, and the original live record was left unchanged. Codex's
draft remains unsent. The full 113-test suite passed again after the reset fix.

## Limits and next checks

The bench is usable, and its browser qualification is incomplete because of
the recorded narrow layout defect. Real-client results cover only the named
builds, invitation, environment and observed stages. Further Codex continuation,
an actual composer comparison and source-access success remain unqualified.

These results establish no model authorship, private intention, freedom from
intervention or cross-client artistic participation. THOUGHT, artwork return
paths, remote OAuth, minting, deployment and registry publication were outside
this task. SDK source/archive/tag and the Lab production site remain unchanged.
