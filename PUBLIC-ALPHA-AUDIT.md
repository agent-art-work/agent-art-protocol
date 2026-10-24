# Public-alpha preparation audit

2026-10-24. **Preparation complete; publication approval is still pending.**
This is a bounded disclosure, provenance and release-readiness review, not a
security certification or legal clearance. The initial audit made no license,
visibility, release, tag, registry or deployment change.

**License follow-up, 2026-10-24:** the operator selected MIT. A root
[LICENSE](LICENSE) and root package license field now cover original project
material under the [licensing scope](LICENSING.md). SDK 0.1.4 remains unchanged.
Imported-material rights and history disclosure still require review. No
visibility change or publication has occurred; initial scan findings below
retain their original snapshot scope.

**Release follow-up:** [0.1.5-alpha.1](releases/0.1.5-alpha.1/RELEASE.md) is now
prepared locally with MIT, a fresh archive/consumer lock, 26 installed runtime
tests, export/receipt and type checks, and 11 passed browser scenarios. Six
representative captures were inspected. No native trial or publication follows.
Pinned Inshell and Pulse MIT license texts were subsequently retrieved and
preserved in [third-party notices](THIRD-PARTY-NOTICES.md). This narrows their
earlier license uncertainty; it does not clear every upstream revision/asset
or private-derived material. Original scan counts below remain dated findings.
The subsequent source/history rescan covered 252 current files and 453 reachable
file blobs, with no credential candidates. A separate read-only GitHub check
found zero issues/PRs, issue comments or review comments; Actions logs/artifact
contents remain outside the review. Source snapshot selection excludes the
unrelated flat-label prototype and retains the experimental runner's limits.

**Publication approval, 2026-10-24:** the operator explicitly approved disclosure
of the existing history, non-noreply email and WILL-derived/site-patch material,
confirmed authority to publish it, and approved making this repository public
and publishing the 0.1.5-alpha.1 GitHub prerelease. This is owner authorization,
not an independent rights adjudication. Preserve original source references and
applicable notices. See the [release record](releases/0.1.5-alpha.1/RELEASE.md).
The initial findings and historical qualifications below retain their original
scope; no registry publication, deployment or new Agent trial is authorized.

## Snapshot and method

The audit started on `codex/agent-operated-claude-runner` at
`f31ed5f3f4f5d47ce898173d04c29a46771e54e3`, with existing uncommitted runner
work and a separate flat-label prototype. Neither has been silently committed,
removed or promoted to a released SDK. The final public source snapshot still
needs curation and review.

| Surface | Checked |
| --- | --- |
| Working tree | 241 tracked/nonignored files, including pending runner code, bounded reports, the separate prototype and preparation documents |
| Reachable history | All 9 commits, 4 annotated tags and all local refs; 443 unique file blobs, totaling 6,490,654 bytes |
| Ordinary branch/tag history | 284 unique blobs; the remaining 159 blobs are additional local snapshot/checkpoint material, also scanned |
| Git metadata | Author/committer/tagger identity categories and commit/tag messages; identities are not reproduced here |
| Remote comparison | All 13 advertised GitHub branch/tag refs match audited local counterparts; no fetch or remote mutation |
| GitHub release state | Repository PRIVATE, default branch main, no detected license and no GitHub Releases, including drafts, at check time |
| SDK package | Existing 0.1.4 archive's 11 regular files, source/installed digests, consumer lock integrity and retained qualification pins |

Used `git rev-list --objects --all`, object-type/content reads, commit-tree
enumeration and working-tree enumeration. Pattern checks covered common
provider/GitHub/AWS tokens, private-key headers, quoted credential assignments,
HTTP userinfo, emails, home paths and private IPs. Reviewed flagged locations
without copying potentially sensitive values into this report. Checked paths,
file sizes, binary/UTF-8 status, symlinks/submodules, source references and
attribution. Read remote metadata through the authenticated GitHub CLI.

No unreachable objects, reflogs, personal browser/chat history, ignored runtime
state, VM disks or credentials were inspected for publication. GitHub issues,
PR discussions, Actions logs/artifacts, forks and registry state are outside
this scan. Remote history was compared through advertised refs; hidden/server
refs are not attested. Do not push a mirror or local controller state as part
of publication.

## Findings

| Finding | Result / required action |
| --- | --- |
| Credential candidates | No token, private-key or literal credential-assignment candidates detected in scanned material; no credential incident identified by this review |
| Flagged strings | HTTP userinfo, email-like strings, private IP and home paths are synthetic validation/rejection fixtures; retain their tests |
| Personal Git metadata | One non-noreply email identity occurs in author/committer/tagger metadata. Owner must accept public disclosure or authorize a separate history strategy; no identity or history was rewritten |
| Files/history hygiene | All 443 reachable blobs are UTF-8, LF and BOM-free; no binary blobs, files over 1 MiB, symlinks or submodules found |
| Excluded runtime material | No `.local/`, `node_modules/`, environment files, VM images, archives, raw image captures or key/database files found in reachable Git paths or prospective working-tree files |
| Ignore boundary | `.local/`, `node_modules/`, `.env` and `.env.*` are ignored; local VM/controller/authority data remains outside source distribution |
| Licensing | Initially unselected, with Apache-2.0 recommended. Superseded by the operator's MIT selection in the follow-up above; third-party rights review remains open |
| Imported material | WILL-derived architecture/research and 16 historical consumer patches need an explicit disclosure/redistribution decision and applicable notices |
| Public claims | Reading is implemented; generic participation remains candidate; full runner MVP and successful source acquisition remain unqualified |
| Release state | Source tags exist for 0.1.0, 0.1.1, 0.1.2 and 0.1.4. These do not constitute a new public-alpha package or GitHub Release |

A pattern scan cannot prove the absence of all secrets or private material.
No high-entropy classification, full penetration test or independent audit was
performed. Lack of a flagged token is not a claim about rights, safety of every
execution path, or runtime credentials on an operator's machine.

## Provenance and rights inventory

| Material | Observed provenance / clearance boundary |
| --- | --- |
| Architecture and research continuation | [SOURCE.md](SOURCE.md) pins the original WILL commit/digest and Claude research attribution. WILL currently reports private visibility and no detected license; access and derivative disclosure require owner clearance |
| Lab/agentart.work examples and patches | Historical `Agent-Art-Lab` repository metadata now resolves to public `agent-art-work/agentart.work`, with no detected license. Preserve pinned historical references; public availability is not a reuse grant |
| Inshell and Pulse patch context | Current upstream metadata identifies MIT. This does not establish the license at every pinned source revision or clear every embedded asset. Preserve applicable MIT notices and review the actual included context |
| signatures.gallery patch context | Referenced upstream reports public visibility and no detected license; confirm redistribution scope with the owner |
| THOUGHT patch and scenarios | Keep production-owner code, isolated prototype findings and invented walkthroughs distinct. Confirm inclusion rights; do not license the artwork itself by implication |
| External standards/provider docs | References support dated research. They do not transfer copyright, authorize provider marks, or independently qualify installed clients |

The 16 patches are in `pilot/reading-consumers/`,
`pilot/dogfood-0.1.1/`, `pilot/open-gate/consumers/`,
`pilot/reading-sdk/`, `pilot/reading-sdk-012/`, plus
`pilot/lab-consumer.patch` and `pilot/thought-consumer.patch`.
Unchanged context and embedded public-document data still count as disclosed
material. No upstream license text was silently adopted or rewritten here.
Current metadata checks are not historical license verification.

Keep provenance useful even when the original source stays private: the
architecture and examples must be understandable from this repository, while
private source pointers remain attribution rather than required installation
steps. Do not publish the original private source repository just to make a
reference clickable. If material must be excluded, changing the current tree
alone will not remove its already-reachable historical versions.

## Package preservation and checks

The retained `v0.1.4` tag object is
`d62a54bd8467192ff613fc53f79b172efa3cf1b4`; its commit is
`fdb13e5e4bc3965d58d819f0f3f0e338b2ea94bb`. The current `protocol/` Git tree is
`18824fd34dbf0368cc7d29bb037d274eabd53664`.

SDK archive SHA-256 remains
`e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430`.
The [0.1.4 qualification](pilot/reading-sdk-014/QUALIFICATION.json),
[bench pin](test-bench/sdk-candidate.json), package sources, retained archive
and installed consumer remain unchanged. No pack/build was run for this edit.

Checks performed for this preparation:

- All 27 SDK tests passed, without native launches or submissions.
- The README example's Work and native/manual/existing-conversation plans
  passed against the installed, qualified 0.1.4 package. The mount was stubbed;
  this is a documentation/data/API check, not a fresh DOM or desktop test.
- The existing bench input loader verified the archive, all 11 installed
  packaged-file digests and dependency-lock integrity.
- New Markdown local targets/anchors, UTF-8/LF, whitespace, final redacted scan
  and unchanged-file baseline checks passed. The staging area remains empty.

Historical browser and native findings were not rerun or strengthened.
The [three-case report](test-bench/results/2026-10-24-lab-three-case.json) remains
two unobserved-source outcomes and one inspected source-denial outcome. It
does not establish successful reading or a fully qualified runner.

## Decisions before making anything public

1. **Complete rights scope review.** MIT is selected for original project
   material, with a contributor copyright notice in LICENSE. Confirm applicable
   upstream notices, approve disclosure of private-derived material and resolve
   third-party permissions/exclusions. See [licensing scope](LICENSING.md).
2. **Approve history disclosure.** Decide whether the existing Git identity and
   all reachable branch/tag material may become public. No detected secret
   requires a rewrite, but metadata and source rights remain owner decisions.
   Any history rewrite, fresh public export or attribution changes require a
   separate plan; historical 0.1.4 evidence must retain its identity.
3. **Review the actual release snapshot.** Curate the large pending runner slice
   and prototype independently of the small documentation preparation. Review
   staged files and rerun the disclosure scan against the chosen commit/refs;
   do not stage everything automatically. Inspect any additional GitHub-hosted
   surfaces intended to become public.
4. **Prepare fresh release bytes.** Recommend a newly selected `0.1.5-alpha.1`;
   add approved licensing/metadata only there, pack it, inspect every archive
   member, refresh consumer locks/digests and qualify it. Earlier 0.1.4 results
   remain historical support, not qualification of changed packaged inputs.
5. **Authorize publication explicitly.** Changing visibility, publishing a GitHub
   prerelease, publishing a package and deploying sites remain separate actions.
   An ongoing project should issue immutable versioned alphas with dated scope
   and findings, rather than keep replacing a moving release artifact.

The [roadmap](ROADMAP.md) separates these publication gates from completing the
bench and developing artwork participation. Those incomplete areas must remain
visible limitations; they need not prevent a truthfully scoped reading alpha.
