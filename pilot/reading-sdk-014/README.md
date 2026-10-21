# Reading SDK 0.1.4 local candidate

This private local candidate retains Quiet field and refines name-only action
underlines, the Copy SVG and clipboard feedback. Successful copying briefly
shows **Copied** and a check inside a stable-width button for three seconds,
with a visually hidden polite announcement. Denied clipboard access retains
the visible, selected exact-text fallback. Repeated attempts reset feedback;
unmounting cancels pending cleanup. No new public option or theme hook is added.

The reading API, About/native destinations, exact invitation and receipt
verification remain unchanged. Historical 0.1.2 and 0.1.3 archives and their
qualifications are preserved. This is neither a release nor a deployment.

## Current package and qualification

Current archive SHA-256:
`e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430`.

Its immutable local archive is
`.local/sdk/archives/e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430.tgz`.
The convenience copy is `.local/sdk/agent-art-protocol-0.1.4.tgz`.
[QUALIFICATION.json](QUALIFICATION.json) records source/archive/installed-file
equality for all 11 package files and the consumer dependency-lock integrity.
For this exact digest, all 121 repository tests and 11 controlled browser
scenarios passed. The 16 adapted compatibility cases, five focused feedback
cases, observer lifecycle and runtime-radius checks also passed. All 22 ready,
Copied and large-radius screenshots were inspected. The browser report is
`.local/test-bench/browser/sdk014-radius-final/report.json`; its digest and fixture
inputs are recorded in the qualification. These are controlled browser results,
separate from the site-owner findings below and from real Agent execution.

The bench selects this package through
[sdk-candidate.json](../../test-bench/sdk-candidate.json). It keeps the pinned
983-byte Lab invitation without changing questions, routes or source policy.
See the [component contract](../../spec/0.1/COMPONENT.md#action-and-copy-feedback-in-the-014-local-candidate)
for the feedback behavior and the [bench guide](../../test-bench/README.md)
for the separation between browser checks and desktop observations.

## Reproduce checks

```sh
node pilot/reading-sdk-014/qualify-package.mjs
npm test
npm run bench:browser
node test-bench/server.mjs --port 4181
```

The package qualifier installs offline, compares packaged/source/installed
bytes and the lock, and writes current bench pins. It resets browser status to
pending and expects the preserved 0.1.2 and 0.1.3 local archives to be available
for their immutability checks. Browser checks use owned stable Chrome, block external requests and
cancel native activation; they never populate the real-client result lane.
Screenshots require their own inspection. Use a fresh run on a newly started
bench; an older server or draft retains its original package/context.

Ready **Copy**, successful **Copied**, repeat and reset retain identical row,
control and below-content geometry at 257px and 265px available widths. In the
257px frame, Copy's right edge is 279.703125px, inside the frame's 281px edge;
coarse-pointer actions remain at least 44px high. The suite checks light/dark
appearance, public styling hooks, exact payloads, denied-copy selection, the
three-second timer, stale callback suppression and teardown. A real keyboard
activation with a synthetic held clipboard promise retained Copy focus before,
while pending and after completion. The polite live region's presence and
content were checked; actual assistive-technology speech remains unqualified.

Before the contour fix below, the initial optional keyboard probe could not activate the button because its
CDP Enter event omitted text. That inconclusive harness attempt is preserved at
`.local/test-bench/browser/sdk014-fit-fixed-probe-inconclusive/report.json`.
The corrected keyboard event reached the held clipboard promise in the final
run for the earlier archive; the SDK package was unchanged between those two runs.

## Earlier site-owner local checks

The Lab owner reports that the earlier archive
`51b4c10d8c742aeadb018362ab2df74b059078f9cf75cac551f17d08e29ac9ba`
passed the actual site's 1440px
and 320px light/dark checks. Ready, Copied, repeat and reset produced zero change
in row/button size, following-block and section positions, scroll position and
document height. The site's mobile component is 257.703125px wide within 265px
available space. The owner also reports exact 983-byte synthetic clipboard
output, name-only underlines, denied-copy fallback, a separate hidden polite
announcement, keyboard focus and the no-JavaScript prompt passed, along with
25 Node tests, 29 pages and 21 HTTP document exports. Site screenshots were
inspected by that owner. These are attributed owner reports; the SDK maintainer
did not rerun the site checks. No native activation or deployment was reported.
Those findings retain their scope in
[the preserved earlier qualification](QUALIFICATION-51b4c10d.json). They do
not qualify the changed archive above; its owner-side integration is checked
separately.

## Large-radius contour correction

The earlier archive's radius checks validated resolved arc values but missed
the tail overlapping the lower-left curve for a large percentage override.
Final review found this at `10%`. The final archive normalizes large radii to
retain an 8px straight run and moves the tail and its fill between the lower
corner tangents. Default 5px corners and the original tail position are
unchanged. Fresh qualification checks contour ordering and fill alignment for
eight runtime-radius cases at both 1440px and 320px, including `10%`, `50%`
and `999px`. Earlier passing results do not establish those stronger checks.
At an extreme `50%` radius, the independently rounded label tint can extend
beyond the elliptical outline. The large-radius checks establish contour and
tail geometry, not arbitrary-pill surface aesthetics. The default 5px
appearance is unchanged.

## Preserved preliminary failure

The earlier 0.1.4 archive
`fa5201dcde126565fcb33e6b014a88d94e177dcb56c396eb4d4e3e0ef1e2db0b`
failed 257px frame containment at 320px in light and dark browser cases. The
Copy glyph extended outside the outline. At the separately checked 265px
site-preview width, ready and copied states fit; that did not satisfy the
bench's narrower criterion. The light case also failed its inline-feedback
fixture result. The raw report remains in ignored local evidence at
`.local/test-bench/browser/sdk014-final/report.json`, with the archive digest
in its manifest and a scoped screenshot-inspection note. It remains a failed
preliminary result and does not qualify the new archive above.

The qualification includes no native Agent launch, Codex Send, registry
publication, tag or deployment. The operator separately authorized committing
and pushing this source update on its private feature branch. Site integration
and release remain with the site owner. No reuse license has been selected.
