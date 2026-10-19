# Reading SDK 0.1.0 qualification

Checked 2026-10-19. This qualifies a private reading SDK and four isolated
local consumer integrations. It is not protocol certification, a claim of
Agent execution, or a production deployment. Earlier alpha observations are
retained in their original records and immutable source revisions.

## Package and contract

- Package: `@agent-art/protocol@0.1.0`, private, no runtime dependencies or
  lifecycle scripts. No reuse license or registry release selected.
- Archive SHA-256:
  `646b91e68a8ea175ca4a75f8d2af48fb7e41498798c1744726479e2b91a13af0`.
- Eleven allowlisted package files; all four patches contain this exact
  archive. Relative file dependencies and dependency locks are included.
- 27 SDK tests pass, including a fresh offline tarball installation/import,
  the installed UI/controller exports, exact context, invalid input, manual
  fallback, bounded receipts and verification.
- Strict TypeScript 5.8.3 consumption passes against an installed package,
  outside package self-resolution. Fresh/native and manual plans narrow by
  their discriminant; manual plans do not promise a URL.
- The earlier alpha-core receipt fixture still verifies. The experimental
  record schema remains separate from the SDK package version.
- The full protocol repository suite passes: **86 tests**, including the
  historical MVP/alpha regressions and loopback static-host boundary checks.

## Browser interface

Regular stable Google Chrome (`com.google.Chrome`, version 155.0.8059.84)
was verified explicitly. No Beta profile, tab or window was used.
Disposable headless profiles were closed by the check runner. Owned native
Chrome test window was closed; pre-existing user windows were left alone.

The final SDK passed eight UI regression cases in both 1440x1000 light and
390x844 dark viewports: default receipts off, explicit existing-conversation
copy, clipboard-denial selection of exact context, optional bounded receipt,
unresolved receipt callback, teardown/remount/duplicate protection, suppression
of stale receipts after route changes, and an ancestor-cancelled trusted click
producing no handoff observation. Fixture receipt checks use zero Participants,
Acts and Relations; integrity is supported and execution origin remains
not established. No external network or Agent was used in these fixture tests.

All four actual application builds are checked on desktop/light and
mobile/dark, including opening owner reading disclosures where applicable.
Checks cover visible native controls, exact offered context, existing-copy
behavior, no horizontal overflow and no website question entry. Screenshots
are visually inspected alongside DOM/network results. Exact routes, application
checks, source revisions and browser observations live in [Lab](lab.json),
[Inshell](inshell.json), [Pulse](pulse.json) and [Signatures](signatures.json).

## Native client observation and limits

| Path | What was checked | What remains unqualified |
| --- | --- | --- |
| Regular Chrome, Lab to installed Claude desktop, fresh conversation | Clicked the actual native link; Chrome requested one-time Open permission, with persistent permission unchecked. A fresh Claude chat view contained the public Lab context. No Send was performed. | Exact editable-composer byte readback, Send, index fetch, reading, answer and Agent execution |
| Codex fresh conversation | URL construction/controller tests and actual rendered link preparation | Browser-to-client arrival and draft placement for this release |
| Existing conversation or another client | Exact context copy/fallback, including synthetic clipboard denial | User-selected destination and subsequent sending/reading |

The website cannot reliably detect installed apps or receive confirmation of
native arrival. The native observation is platform/version specific. Browser
fixtures do not qualify a real client route. Sending and source acquisition
use the visitor's own Agent account, tools and permissions; no model call,
provider charge or Send action was part of this release check.

Automatic approval review blocked automated cleanup of the unsent Claude test
draft because the editable field's ownership was uncertain in an app containing
private conversations. No private contents were retained as evidence. The
operator elected to clear that public test draft manually. The observation
above is deliberately limited to the visible fresh view and public context;
no cleanup success or stronger client proof is claimed.

## Evidence boundary

Reading needs a Work frame and may stop with zero observed Acts. The supported
receipt events are only `handoff-requested`, `context-copied` and
`manual-context-selected`. Evidence is optional and disabled by default; the
browser mount keeps its current receipt in memory, with no persistent ledger.
The named browser observer and application are trusted for their statements.

The seal is unsigned SHA-256 and can be recomputed by an editor. It detects
incoherent edits relative to its retained material, not a coherent fabrication.
A receipt does not establish app arrival, source retrieval, comprehension,
model authorship, private intention or freedom from host/curator intervention.
It cannot establish artistic consequence. THOUGHT's contribution, authorization,
return, recovery, rendering and consequence work belongs to the next release;
its earlier experiment remains available with its original limits.

The four patches apply to their recorded base trees and reproduce all changed
files, including the SDK bytes. Original owner checkouts and public sites
remain untouched. Owner integration tests, builds and browser checks support
the reading integration; they do not measure adoption or total maintenance cost.
