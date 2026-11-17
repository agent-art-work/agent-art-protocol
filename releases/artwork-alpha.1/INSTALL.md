# Install the prepared artwork alpha

This guide prepares a local coding environment. It does not connect an account,
start a listener, send an Agent request or publish an artwork.

## Exact supported environment

Use **macOS on Apple silicon**, **Node.js 22.23.4**, its **SQLite 3.53.4** and
**npm 10.9.9**. Those are the installed-proof cohort, not a promise of support
for every Node 22 build. The package metadata restricts Node/platform/CPU.
Python 3 is needed only for the file verifier. Prerequisites are not bundled or
automatically installed. Ask for guidance if your environment differs.

The prepared full bundle is `agent-art-artwork-alpha.1.tar.gz`. It is currently
a local preparation artifact; no live download URL or registry release exists.
After an approved release, obtain it and its accompanying `BUNDLE.json` from the
same trusted release channel. Compare its SHA-256 with that metadata before
extracting it. Checksums detect differences from the selected source; they do
not authenticate an independently supplied checksum.

```sh
shasum -a 256 agent-art-artwork-alpha.1.tar.gz
tar -xzf agent-art-artwork-alpha.1.tar.gz
cd artwork-alpha.1
python3 -B verify.py
```

The verifier reads only this snapshot and the contained archives. It does not
extract or import SDK code, install packages, open stores or make network calls.
Stop if verification fails; obtain the exact cohort rather than editing hashes.

## Fresh scratch consumer

The bundle's `consumer/` is intentionally minimal and contains no app or credentials.
Its package name retains the previous clean-consumer proof's name so its manifest
and lock remain byte-for-byte identical. This is a bootstrap scratch directory,
not an installer for an existing project.

```sh
cd consumer
node --version
npm --version
```

Expected prerequisite versions are `v22.23.4` and `10.9.9`. All selected package
dependencies are bundled in the two local archives; no registry lookup or
lifecycle script is needed. The prepared package-lock contains 13 entries.
Node's builtin SQLite may issue its experimental-feature warning when imported.
This is not an account sign-in or a request to a model.

Continue only if those prerequisite versions match. The retained qualification
used a fresh cache and empty user/global npm configs. Create task-local empty
config files and install into this fresh consumer:

```sh
mkdir .npm-cache
touch .npm-userconfig .npm-globalconfig
npm ci --offline --ignore-scripts --no-audit --no-fund --bin-links=false --update-notifier=false --logs-max=0 --cache ./.npm-cache --userconfig ./.npm-userconfig --globalconfig ./.npm-globalconfig
```

These task-local paths preserve your ordinary npm configuration. Other process
environment settings remain your responsibility; do not infer a fully controlled
host or network policy from package verification.

Only use `npm ci` in this fresh scratch consumer: it replaces that directory's
`node_modules`. It does not migrate a Work or an artist's existing app. For an
existing project, let the coding Agent add the exact local archive dependencies
with that project's package manager, retain its own lock and run its own fixture
tests. The scratch lock must not replace an application's existing lock. A
different dependency composition needs its own consumer qualification.

## Imports

```js
import { recordReference, payloadReference } from '@agent-art/artwork-sdk';
import { ParticipationOwner } from '@agent-art/artwork-sdk/owner';
import { createParticipationAdapter } from '@agent-art/artwork-sdk/mcp';
import { assembleParticipationAccount } from '@agent-art/participation-account';
import { collectSelectedSnapshot } from '@agent-art/participation-account/collect';
import { createLocalInspectionSource, SCOPE_SCHEMA }
  from '@agent-art/participation-account/local-inspection';
```

These are available exports, not a complete app initialization. Read
[CORE-CONTRACT.md](CORE-CONTRACT.md) before owner setup. The separate
`@agent-art/artwork-sdk/testing/inert-resolver` is for declared synthetic tests
only; it cannot authenticate a real curator.

The core archive includes `examples/no-client/{app.mjs,works.json,smoke.mjs}`.
Your coding Agent can inspect and adapt them in a new scratch app, retaining
their fixture labels. Running the example writes temporary synthetic Work
stores, records scripted returns, checks reopen/recovery and removes its own
stores. It makes no model call. It is optional; this release-preparation slice
did not rerun that already-qualified proof.

## Add a permitted participation account

The app already holds an open owner, actual authenticated principal and exact
selected Work/Manifest. Capture one bound session for the whole collection:

```js
const session = owner.bind(readAuthenticatedPrincipalJson);
const source = createLocalInspectionSource({
  inspect: session.inspect,
  scopeJson: JSON.stringify({
    schema: SCOPE_SCHEMA, work: workRef, manifest: manifestRef,
    selection: 'selected'
  })
});
const outcome = await collectSelectedSnapshot(planJson, {
  source, gate: currentCopyPermission, clock, signal
});
```

This is a composition sketch. The app supplies the referenced values; its exact
plan and scope must agree. The gate checks separate copy permission at begin,
before-read, after-read and release. Do not replace it with a public approval
boolean, participation credential or unconditional allow. The app owns real-time
deadline cancellation and the owner's lifetime while callbacks remain pending.

`collected` returns an in-memory account and inert projection. `stopped` returns
no partial body. File download, another recipient, browser display and retention
need their own app handling and consent. External SVG/PNG outputs remain exact
references with explicit omitted-byte gaps; collection does not fetch or render
them. See [SUPPORT.md](SUPPORT.md) before making evidence or availability claims.
