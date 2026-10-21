# Quiet field SDK 0.1.3 local candidate

This private candidate replaces the default Ask your Agent presentation with
Quiet field. It preserves the reading API, native destinations, About link,
Copy and manual fallback, canonical invitation and optional bounded receipts.
It adds no model execution, answer callback or participation capability.

## Package and source

Current archive SHA-256:
`a1a80c260e48c2b0ee61ab28c381cc3732f817c9ca33f476018a46f7e6e9a805`.

The immutable local archive is
`.local/sdk/archives/a1a80c260e48c2b0ee61ab28c381cc3732f817c9ca33f476018a46f7e6e9a805.tgz`.
The version-named convenience copy is `.local/sdk/agent-art-protocol-0.1.3.tgz`.
[QUALIFICATION.json](QUALIFICATION.json) records package/source/installed-file
equality, the installed consumer lock integrity, and separate check results.
The 11 package files match the fresh archive; 0.1.2's archive remains unchanged.

[design-brief.json](design-brief.json) snapshots the Lab-owned local preset
selected by the operator. It is design input, not a source commit or proof of
the site's integration. Its appearance is implemented by the SDK; page branding,
context, placement and site release remain with the site owner. Existing public
site and index URLs are unchanged by its repository rename.

The public API still uses `mountReading(element, options)` and the same
stylesheet import. Quiet field is the default and needs no presentation flag.
See the [component contract](../../spec/0.1/COMPONENT.md) for new semantic color
hooks, legacy-hook precedence, fixed geometry and the explicit underline-default
change. Consumers should use public hooks and their own relative vendored
archive dependency, not private selectors or machine-specific dependency paths.

## Reproduce local checks

These historical commands require the original 0.1.3 packaged inputs in an
isolated checkout. They do not reproduce 0.1.3 from the current 0.1.4 source:
the qualifier prepares the checkout's package before checking its version.
For the current candidate, use the [0.1.4 guide](../reading-sdk-014/README.md).
The archive and qualification results recorded here remain unchanged.

```sh
node pilot/reading-sdk-013/qualify-package.mjs
npm test
npm run bench:browser
node test-bench/server.mjs --port 4181
```

Package qualification packs and installs offline, checks the actual archive,
source and installed files and lock, then writes the current bench package pin.
It resets browser qualification to pending; a changed archive needs a fresh
browser report. The browser command uses owned stable Chrome and a disposable
profile, blocks external requests and cancels native activation. Its results
never populate the real-client lane. Screenshots require separate inspection.

Use a fresh run on `http://127.0.0.1:4181/?lane=browser`. An existing 0.1.2 server
continues to use its startup inputs. Old run records cannot be appended as if
they used this new package.

## Qualification boundary

For the archive above, 118 automated repository tests and all 9 controlled
browser scenarios passed. The fresh installed package also passed 16 reused
DOM behavior cases, observer teardown/remount checks, and six runtime-radius
checks at each of 1440px and 320px. All nine final screenshots were inspected.
At the recorded 320px viewport, the frame is 257px wide and Copy's right edge
is 279.796875px, inside the frame's 281px edge; coarse-pointer controls remain
44px high. Browser/profile/fixture-server cleanup completed.

The final raw report is
`.local/test-bench/browser/sdk013-final/report.json`; its digest and fixture
input digests are in the qualification. Earlier preliminary-archive checks
remain separate ignored attempts and do not qualify this digest.

The final candidate must pass system-font light/dark checks, the recorded
257px container in a 320px viewport, fully visible Copy, keyboard focus and
touch targets, independent color overrides, radius changes after mount and
preserved reading behavior. The [initial bench qualification](../../test-bench/QUALIFICATION.md)
retains the old 0.1.2 layout failure and partial Claude/Codex observations;
those are not new 0.1.3 client results.

Actual site integration is separately checked by its owner against this exact
archive. No fresh native Agent trial, Codex Send, registry publication, Git tag,
source push or deployment is included. The package remains private and no reuse
license has been selected.

The site owner subsequently reported a successful local v2 integration in
`agent-art-work/agentart.work`, branch `codex/agentart-work-v2`, using this exact
digest and all 11 matching package files without private-selector overrides.
Its reported 1440px/320px light/dark checks cover geometry, Copy containment,
colors, keyboard focus, exact synthetic 983-byte Copy/manual prompt, denied
clipboard selection, no-JavaScript disclosure and canceled native URLs.
The owner reports 39 Python and 25 Node tests, 29 pages and 21 HTTP document
exports passed, with screenshots inspected. These are attributed site-owner
results; raw evidence remains with the owner and was not rerun by the SDK
maintainer. No native trial, push or deployment was reported.
