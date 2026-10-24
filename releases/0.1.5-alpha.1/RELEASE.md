# Reading alpha release checklist

**Reading SDK 0.1.5-alpha.1 — approved GitHub prerelease.**
Release preparation takes priority; runner development and live Agent trials
are on hold. The operator approved public repository/history disclosure and
publication of this exact alpha on 2026-10-24. Registry publication and site
deployment are not selected.

[Release and assets](https://github.com/agent-art-work/agent-art-protocol/releases/tag/v0.1.5-alpha.1).

## Release contents and checks

| Item | Result |
| --- | --- |
| Runtime/API | Nine runtime/type files match retained 0.1.4 digests exactly |
| License | MIT and contributor notice included in the 12-file package |
| Package | Fresh archive installed offline with a matching relative dependency lock; every installed/archive/staged file compared |
| Runtime checks | 26 existing runtime tests run against installed alpha code; separate package-export/payload/receipt smoke check passed |
| Types | Strict installed-package TypeScript consumer check passed using an existing local compiler |
| Reproduction | A source-only checkout reproduced the exact archive and passed runtime/type checks plus one focused browser bootstrap without the old SDK cache |
| Browser | 11 fresh stable Chrome scenarios passed; native launches canceled; six representative screenshots inspected |
| Cleanup | Owned Chrome, loopback server and disposable browser profile closed/removed; no user tabs accessed |
| Operations | [Announcement and claims brief](OPERATIONS.md) drafted; no announcement sent |
| Source selection | [SOURCE-SNAPSHOT.json](SOURCE-SNAPSHOT.json) records the exact current source files/digests; unrelated flat-label prototype excluded |
| Historical package | 0.1.4 sources, tag, qualification pins, archives and installed consumer remain unchanged |

Archive: `agent-art-protocol-0.1.5-alpha.1.tgz`.

SHA-256:
`5989cfb0eec3fd35df4a583df460696a35643c83a190708458e8b8b0796f7f55`.

The local convenience file is
`.local/releases/0.1.5-alpha.1/agent-art-protocol-0.1.5-alpha.1.tgz`.
The immutable copy is selected by digest in
[QUALIFICATION.json](QUALIFICATION.json), which also records the consumer lock
and exact per-file hashes. Local SDK archives, caches and consumers stay ignored;
only explicitly reviewed archive/checksum/qualification files become assets.

## Reproduce locally

```sh
npm run release:prepare
npm run release:browser
```

Preparation stages the unchanged 0.1.4 runtime with this directory's versioned
manifest/guide and root LICENSE, then packs and installs it offline. It neither
edits `protocol/` nor repoints the existing bench's 0.1.4 dependency.
The source hashes are mandatory; the old archive is additionally checked when
present. A clean checkout need not possess an ignored historical archive.

Type checking uses an existing local TypeScript compiler. Set
`AAP_RELEASE_TSC` to its `lib/tsc.js` to choose one explicitly. If unavailable,
preparation records types as pending instead of downloading tooling or claiming
a pass. Browser qualification requires permitted loopback listening and regular
stable Chrome; it does not require a VM or signed-in Agent.

Repreparing resets browser/visual status to pending. A browser check resets
visual inspection to pending. Inspect actual screenshots and bind the report
to the same archive before claiming qualification. Changed package bytes require
a fresh archive and checks. Once published, a version must never be replaced.

## Publication workflow and authorization

1. **Disclosure approved.** The operator confirmed authority and approved
   exposure of existing Git history, its non-noreply email identity and included
   WILL-derived research/site patches. Original source attribution and applicable
   [third-party notices](../../THIRD-PARTY-NOTICES.md) remain intact. Other
   repositories retain their own access and terms.
2. **Source selected.** [SOURCE-SNAPSHOT.json](SOURCE-SNAPSHOT.json) identifies
   the reviewed files. It includes experimental bench code/tests needed by the
   release checks, preserving incomplete runner findings. It excludes the
   unrelated flat-label prototype and ignored runtime state. Verify its hashes
   before staging and commit only that selection on the release feature branch.
3. **Publish approved artifacts.** Fast-forward main to the reviewed source
   commit, retain old tags, change only this repository to public, and create
   `v0.1.5-alpha.1` as a GitHub prerelease with
   [RELEASE-NOTES.md](RELEASE-NOTES.md). Attach the exact SDK archive,
   QUALIFICATION.json and SHA256SUMS; never repack the approved bytes.
4. **Verify anonymously.** Check public repository/release access, download the
   archive without account credentials, compare its digest and install it in a
   fresh isolated consumer with scripts disabled. Verify package exports and
   receipt semantics before handing operations the live links.
5. **Preserve scope.** The qualification JSON records checks conducted before
   publication; its local paths/status do not claim later native execution.
   The GitHub release records publication status. Announcements, npm publication,
   consumer rollout and site deployment remain separate owner actions.

Do not attach guest/controller profiles, authority state, raw screenshots,
private transcripts, machine credentials, caches or VM data. Native trials were
not run for this archive; old desktop results remain historical findings.
