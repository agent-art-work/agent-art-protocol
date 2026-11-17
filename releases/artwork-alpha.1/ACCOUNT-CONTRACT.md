# Participation account companion

Private candidate @agent-art/participation-account0.0.0-account.1, an optional
artwork SDK component for an artist working with a coding Agent. This source
guide is prepared for a future archive. No installed-consumer or application
support is established until the exact archive and consumer proof pass.

Keep @agent-art/artwork-sdk0.0.0-mcp.1 as the exact external peer. Match both
archive digests and the consumer lock, not just version strings. The named
cohort is Node22.23.4/macOS arm64 with the existing owner's SQLite profile.
The broader protocol, reading SDK and previous releases are separate.

## Imports and application composition

The root exports pure assembleParticipationAccount with its account/projection
schemas, bounds and error. The collect entry exports collectSelectedSnapshot
and supplied plan/permission/read contracts. The local-inspection entry exports
createLocalInspectionSource and its scope schema/error. Internal paths are not
supported imports. No owner, database, listener, identity provider or model client
is included; root assembly performs no I/O. No automatic prerequisite installation.

```js
import { collectSelectedSnapshot } from '@agent-art/participation-account/collect';
import { createLocalInspectionSource, SCOPE_SCHEMA }
  from '@agent-art/participation-account/local-inspection';

// The application already holds this owner, actual permission controls and refs.
const session = owner.bind(readAuthenticatedPrincipalJson);
const source = createLocalInspectionSource({
  inspect: session.inspect,
  scopeJson: JSON.stringify({ schema: SCOPE_SCHEMA,
    work: workRef, manifest: manifestRef, selection })
});
const result = await collectSelectedSnapshot(planJson, {
  source, gate: currentCopyPermission, clock, signal
});
```

This illustrates composition; identifiers are app inputs, not new SDK APIs.
Do not put an unconditional allow or caller approval boolean in place of current
copy authority. The app owns exact Work framing, enrollment/authentication,
Reports, Manifest selection, recipient/retention, trusted time, cancellation,
rendering and audience UI. Capture one bound session; never rebind per page.
The companion does not create, reopen or close that owner.

## Boundaries

The plan is the existing aap.sdk.selected-snapshot-plan.draft1 value: source,
exact work/manifest, recipient, deadline, DataRef omissions and selection for
inspection. Gate decisions use aap.sdk.collection-permission.draft1; allow binds
principal/source/notAfter. Check the exact selection/recipient at begin,
before-read, after-read and release; final release also receives the account
DataRef. The app must arrange cancellation while callbacks are pending.

collected returns an in-memory account and inert projection. stopped returns
no partial body; pending describes an unresolved callback at return, not its
termination. No retry, source-mode fallback, authority renewal, Report creation,
recursive fetch or rendering runs during collection. A subsequent file/viewer
or recipient transfer needs actual copy permission and its own app handling.

Selection limits are16 records/eight data entries; inspection takes at most25
reads,60 seconds in supplied time and4 MiB cumulative replies. The injected
owner mode remains fixture-tested; no native admin adapter is provided.
Only verified UTF-8 carriers are accepted. SVG-labelled source stays inert.
External SVG/PNG outputs may be exact Report refs with explicit omitted bytes;
do not list absent external bytes in Manifest.data or pretend PNG is text.

Source rights are checked through the final read; app copy permission is checked
at release. An independent allow gate may release a copy after a later owner
withdrawal. No atomic export or retraction of delivered copies is established.
Serialization adapts trusted local objects; it is not remote raw-wire validation.
Synchronous SQLite calls cannot be interrupted by this wrapper and may update
the owner's internal transaction/clock control state.

Receipt, attributed Act, app acceptance/transformation and observed display
remain distinct claims. Authentication/signatures do not prove model authorship,
complete private context, intention or artistic quality. Audiences interpret the
work. Fixture identity/copy/report checks cannot establish real informed consent.
Private chat, memory, hidden reasoning and unselected material are not defaults.

Original code is MIT. Bundled canonicalize and jsonc-parser retain their included
Apache-2.0 and MIT notices; consult the archive's THIRD-PARTY-NOTICES.md and
NOTICE-INVENTORY.json. No registry publication or deployment is implied.
