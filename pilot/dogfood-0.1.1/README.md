# SDK 0.1.1: four-site dogfooding candidates

The operator requested integration of the tagged reading component into the
four owned sites while discussing public release. The candidate records below
describe the initial isolated feature branches and their checks. That preparation
changed no owner checkout, live site, repository visibility or immutable SDK
release. The protocol repository remains private; no reuse license is selected.

## Lab rollout authorization, 2026-10-21

The operator subsequently directed the Lab session to commit, push and roll its
integration out to **agentart.work**. This authorizes the Lab-owned site change,
including its unchanged vendored SDK 0.1.1 and browser assets. Lab owns final
review, its repository's merge/release procedure, deployment and live checks.
Its later invitation, asset-versioning and receiving-layout work is separate
from the initial candidate patch retained here.

The earlier Lab publication hold is therefore lifted for that integration.
The instruction does not authorize protocol-repository visibility changes, an npm
release, license selection, SDK byte changes or rollout to the other three sites.
Their candidate records remain local preparation, not deployment evidence.

## Lab rollout completed, 2026-10-21

The Lab session reports its rollout independently verified live at
[agentart.work](https://agentart.work/). Its release record identifies
[PR #9](https://github.com/agent-art-work/Agent-Art-Lab/pull/9), candidate
`7c82082`, merge `fc8366c`, and successful
[Pages run 39570200399](https://github.com/agent-art-work/Agent-Art-Lab/actions/runs/39570200399).
Lab reports:

- All 60 served files matched its release build.
- All 18 document downloads passed structural, identity, revision,
  decompressed-body and source-byte checks, with the index revision recomputed.
- Live regular-Chrome desktop/light and mobile/dark checks passed invitation
  payload, native-link/Copy, paragraph-layout and fallback checks. Native
  activation was canceled during those browser checks.
- The vendored SDK 0.1.1 and its archive bytes remained unchanged.

Reported content identities:

```text
Index revision: sha256:c5524cb67f10052ba9bde27e212e75f901a67bce1e3462a147b96fea80d7a637
Invitation UTF-8 bytes: 983
Invitation SHA-256: ebef0c1f9ce1c03a6028f840086b9ff079cb3fc2df53d79e6053b9b4f6a8bde6
```

These are Lab-owned release findings supplied in its completion report, not a
repeat of the full live checks by this protocol session. A protocol-side web
retrieval attempt could not fetch the site, index or PR through that tool;
it supplied no independent live-byte confirmation. The receiving-app layout
evidence remains Lab's bounded Claude native observation and the operator's
ChatGPT screenshot, not a new universal routing, submission or execution claim.

This completes the authorized Lab site rollout. It does not publish this
protocol repository or an npm package, select a reuse license, change the SDK
or establish a release of the other three sites. Initial patches and
qualification records below retain their original scope.

The later operator-approved identity/About-link change uses SDK 0.1.2 and has
its own [completed Lab rollout record](../reading-sdk-012/README.md#lab-site-rollout-completed).
It does not replace the 0.1.1 archive or these initial candidate records.

## Initial candidate records

| Site | Reading surface | Release base | Candidate record |
| --- | --- | --- | --- |
| Agent Art Lab | Homepage | Lab main | [Lab](lab.json), [full patch](lab.patch) |
| Inshell | `/docs` | Inshell staging | [Inshell](inshell.json), [full patch](inshell.patch) |
| Pulse | Homepage and `/projects` | Pulse main | [Pulse](pulse.json), [full patch](pulse.patch) |
| signatures.gallery | `/about`, production/staging preview-only package | Signatures main | [Signatures](signatures.json), [full patch](signatures.patch) |

Each integration uses the exact same immutable SDK archive:

```text
@agent-art/protocol@0.1.1
SHA-256 2c179f487aa71cd0b769c5c70cca8786275111e33f1936de11536531b4012c18
```

The component comes from `@agent-art/protocol/reading-ui` and `reading.css`.
There is no independently maintained presentation implementation in a site.
Each owner retains its canonical invitation, source index, answer policy and
manual fallback. ChatGPT desktop prefill, Claude and Copy appear inline; the
label is noninteractive and destination app mode is not forced. The site's
questions and answers stay in the visitor's Agent.

These public-shaped adapters omit installed-app discovery. They offer native
routes without claiming installation; Copy is always available. A successful
handoff request does not establish arrival, sending, source acquisition,
reading or Agent execution. Native actions are canceled during browser tests.
Signatures artwork/assessment/minting and Pulse Core remain outside this work.

## Local candidates and checks

The prepared isolated clones are ignored `.local/dogfood-v011-lab`,
`.local/dogfood-v011-inshell`, `.local/dogfood-v011-pulse` and
`.local/dogfood-v011-signatures`. Each has a `codex/reading-sdk-0.1.1` feature
branch. Original unrelated local edits are preserved. Their patches apply
independently to the recorded base using `git apply --binary --unidiff-zero`;
do not stack them on the older 0.1.0 or Open gate trials.

[Qualification](QUALIFICATION.json) records site checks, the installed archive,
patch integrity and browser observations. Individual records retain dependency
setup limitations; a passing application build does not prove a full clean
installation unless explicitly checked. Inshell's staging and production
promotion rules remain in force. Signatures uses its existing read-only
preview package, with minting, wallets, RPC and model requests disabled.

The common [browser runner](check-ui.mjs) uses verified regular stable Chrome
in disposable profiles and accepts a local candidate URL:

```sh
node pilot/dogfood-0.1.1/check-ui.mjs lab http://127.0.0.1:4184/ 1440 1000 light
node pilot/dogfood-0.1.1/check-ui.mjs inshell http://127.0.0.1:4186/docs 390 844 dark
```

It checks exact native context, the Open bubble/Seal mark, compact one-line
layout, visible Copy, fine/coarse target sizes, no app-discovery calls, canceled
native links and synthetic clipboard-denial fallback. It does not send a draft
or access a private conversation. Temporary site servers are stopped after
checking; the existing Lab SDK reference preview remains the normal dev entry.

## Proposed public release sequence

For broader publication beyond the specifically authorized Lab rollout above,
the recommendation is to complete owner review and normal staging/live
verification of these integrations before a broader adoption announcement.
Then select reuse terms and make the repository public with a clearly scoped
**reading SDK preview** release. The broader Agent Art participation contract
remains candidate; THOUGHT and stronger execution-origin evidence can follow.
This broader sequence remains a recommendation, not additional authorization
to publish or deploy.

Making a repository public, creating a GitHub Release, publishing to npm and
deploying a website are separate operations. A private repository's Release
remains available only to its authorized readers. `private: true` in the npm
manifest prevents npm publication; it need not prohibit public source or a
reviewed downloadable archive. No npm publication is needed to dogfood here.

No license is chosen by these candidates. Before inviting third-party reuse,
select a license and its scope, including source code versus research/media,
and review disclosure across repository history and embedded consumer patches.
The [publication check](PUBLICATION-CHECK.json) records bounded redacted pattern
scanning; it is not a legal or comprehensive privacy certification. GitHub's
[licensing guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
explains the public-repository and reuse-rights distinction.

Preserve `v0.1.1` and its archive bytes. If licensing or public-facing changes
alter packaged inputs, create a new patch version and matching archive/consumer
locks instead of replacing the existing tag or artifact. No generic protocol
freeze, universal client compatibility, certified Agent execution, service
hosting or registry publication is implied by a public reading preview.
