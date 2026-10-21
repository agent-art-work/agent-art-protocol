# Ask your Agent component: SDK 0.1.2

Private candidate, 2026-10-21. The Open bubble mark, **Ask your Agent** label
and visible **ⓘ** form one ordinary link to
[What is Ask your Agent?](https://agentart.work/ask-your-agent/). ChatGPT, Claude
and always-visible Copy remain separate actions in the same compact row.

The identity link uses the existing component theme, receives keyboard focus,
and opens normally in the same tab. Its accessible name includes the visible
label and “about this component”; the mark and ⓘ are decorative within that
one link. It has no SDK event handler, Work/prompt query, handoff receipt or
clipboard action. Native routes, Copy fallback, existing options and receipt
verification are unchanged. No Agent launch or Send is added.

The [component contract](../../spec/0.1/COMPONENT.md) records ownership and
supported CSS hooks. Lab owns the destination page, its public invitation,
asset-versioned adapter and site release. The SDK owns the shared component.

## Lab site rollout completed

Lab reports the combined page and component live on 2026-10-21 via
[PR #10](https://github.com/agent-art-work/Agent-Art-Lab/pull/10), candidate
`1586c332262be621b44a2d49412d4106f07b7151`, merge
`552e34cd26abf0266800f2ecaed8d3c3b8c5ff1e`, and successful
[Pages run 39572860723](https://github.com/agent-art-work/Agent-Art-Lab/actions/runs/39572860723).
Its live checks compared all 62 served files to the release build and verified
all 19 document exports plus the recomputed index revision. Actual About-link
clicks in regular Chrome at desktop/light and mobile/dark reached the
explanation page. Layout, focus, native payloads, Copy and fallbacks passed,
with no asset failures or runtime errors. Native activation was canceled.

Those are owner-reported live findings, separate from this repository's local
SDK checks and independently reproduced Lab candidate. They establish no new
Agent trial, universal native behavior or model execution. That site deployment
made no protocol tag, npm publication, repository visibility or license change.
The operator subsequently authorized committing and pushing the SDK source
update separately; no main merge or new tag is selected by that instruction.
The exact site pins are also in [Lab metadata](lab.json).

## Immutable package inputs

```text
@agent-art/protocol@0.1.2
.local/sdk/agent-art-protocol-0.1.2.tgz
SHA-256 0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5
```

All 11 installed files match this archive and the packaged sources. The browser
[qualification](QUALIFICATION.json) pins their hashes and the actual install's
dependency-lock SHA-256 and SHA-512 integrity. Consumers must install this new
archive and update their own lock; renaming the old archive is not an upgrade.

The historical 0.1.1 archive is preserved at SHA-256
`2c179f487aa71cd0b769c5c70cca8786275111e33f1936de11536531b4012c18`.
Its [qualification](../reading-sdk/QUALIFICATION.json), browser scripts and
earlier consumer patches retain their original scope and bytes.

## Checks and reproduction

The [Lab metadata](lab.json) pins its owner base commit, complete
[binary patch](lab.patch), result tree, fresh archive and dependency lock. The
current `npm run pilot:lab` prepares `.local/reading-v012-lab` at those pins,
checks all 11 installed files and serves its build. It does not edit the owner
checkout. `--prepare-only` builds without serving; `--dependency-cache` can
select an existing npm cache for its locked offline install. The 0.1.1 isolated
clone is preserved separately. The owner candidate's page/adapter/SDK asset
directory are versioned together to prevent reuse of earlier SDK assets on the
tested fresh loading path.

```sh
npm run test:sdk
tsc --strict --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --lib ES2022,DOM protocol/test/type-consumer.mts
npm run test:reading-ui
```

The 27 SDK tests passed, including offline installation of the real archive and
earlier receipt verification. Strict TypeScript consumer checking passed against
the installed package. All 88 repository tests passed with loopback fixtures
permitted. The first broader-suite attempt could not complete because the
execution sandbox denied binding to `127.0.0.1`; no product failure or security
setting change was required to run the authorized local fixtures.

The standalone [browser checker](check-ui.mjs) serves a deliberately synthetic
public Lab-index reading frame with the installed archive's five browser assets.
It is not Lab's canonical invitation or an Agent conversation. It verifies:

- One About anchor around mark/label/ⓘ, its exact canonical URL, no context query,
  keyboard order and visible focus; canceled About navigation has no handoff,
  clipboard or receipt side effect.
- Two unchanged native route payloads, exact Copy input, discovery failures,
  manual fallback, optional receipts and teardown across 16 DOM scenarios.
- Single-line layout, shared surface, visible Copy, no overflow and minimum
  pointer targets at desktop light/dark and 390px/320px mobile sizes.

Only regular stable Chrome is used, with its bundle identity verified before
launch and an owned disposable profile. All About/native navigation is canceled
or replaced by same-page fragments; clipboard and discovery are synthetic.
No private conversations, source fetching, inference or real-Agent execution
are tested. Test-owned pages, profile and server are cleaned up. Screenshots and
bounded raw results are ignored under `.local/qa/reading-sdk-012/`.

Browser qualification does not establish that the live About page is deployed,
that an app receives a draft, or that an Agent reads any source. Lab's page and
consumer checks are separate. No npm release, protocol-repository visibility
change, license selection or other-site upgrade is part of this patch.
