# Reusing the reading bench

Candidate developer tooling; separate from the SDK and visitor-facing component.
A developer supplies a declarative public Work and exact invitation digest.
Their coding Agent runs the checks. The JSON profile grants no permissions and
contains no executable UI driver. A VM is optional for local reuse; our dedicated
VM isolates maintainer tests from personal host apps.

```sh
node test-bench/reading-profile.mjs inspect test-bench/profiles/lab.json
node test-bench/reading-profile.mjs browser test-bench/profiles/lab.json
node test-bench/reading-profile.mjs browser test-bench/profiles/inshell.json
```

`profiles/lab.json` retains the pinned Lab invitation. `profiles/inshell.json`
is a developer-authored fixture using the operator's public Inshell reading
prompt. It is not an integration deployed on Inshell, a retrieved index or a
real-client qualification. Both use the same installed SDK 0.1.4, server,
component, browser assertions and browser report schema. The fixture heading
comes from Work.title. Each browser run opens disposable regular stable Chrome,
cancels native launches and closes its own browser/server. It does not operate
personal Chrome tabs or submit an Agent message.

The profile schema is `agent-art-bench/reading-profile/1`: `id`, `work` and
`contextSha256` are the only additional fields. The installed SDK validates the
Work. The loader verifies the public invitation digest and existing package,
archive and consumer-lock pins. Source references identify expected sources;
they do not assert that those sources were fetched.

For a separately commissioned local desktop case, a coding Agent can import
`prepareReadingProfileCase` from `reading-profile.mjs`. It calls the existing
`desktop-runner.mjs` preparation with those inputs; its case starts unqualified,
with the same external authority, one-Send guard and desktop report schema.
The Agent must supply actual permitted CUA, fresh paired observations, owned
UI and account access, then satisfy the existing execution contract. Passing
`allowSend: true` records actual authorization; it cannot create authorization.
The synthetic preparation test performs no native input and cannot qualify UI.

Current guest-native VM automation and its named paragraph policy remain
Lab-specific. The profile loader does not generalize the VM driver to Inshell
or support arbitrary preview URLs/locators. Integrating an existing app's
preview still requires its owned component binding and source/reply evidence
selection. Do not infer desktop-client support from a profile or browser pass.

The developer owns their Work, public context, source policy and expected
outcomes. The toolkit saves repeated package/payload checks, fixture UI,
attempt/recovery accounting and report plumbing. Their Agent supplies desktop
operation and interpretation through approved controls; the toolkit is not a
new desktop-control engine or proof of model authorship.
