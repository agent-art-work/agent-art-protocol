# Reading SDK 0.1.0 consumers

These are four local application integrations of the same private SDK. They
are reviewable binary Git patches against pinned owner revisions, including
one identical vendored SDK archive. The original checkouts and deployed sites
are unchanged. THOUGHT participation is deferred to the next release.

| Application | Local entry | Patch and source record | Integration |
| --- | --- | --- | --- |
| Lab | <http://127.0.0.1:4174/> | [patch](lab.patch), [record](lab.json) | Static ESM assets; visible controls on the homepage |
| Inshell | <http://127.0.0.1:4176/docs> | [patch](inshell.patch), [record](inshell.json) | React component on Docs; original prompt retained |
| Pulse | <http://127.0.0.1:4177/> and [/projects](http://127.0.0.1:4177/projects) | [patch](pulse.patch), [record](pulse.json) | Existing Agent reading disclosure; browser bundle |
| signatures.gallery | <http://127.0.0.1:4178/about> | [patch](signatures.patch), [record](signatures.json) | About reading disclosure; progressive enhancement |

Open Pulse's or Signatures' reading disclosure to see its SDK controls.
These are reading invitations, with questions asked inside the visitor's
Agent. There is no website Q&A, return callback, model service, registration
or local execution helper.

## What an application writes

Keep the application's exact authored prompt, index, source policy and source
checks with its owner. Define a Work containing that prompt as a text snapshot
and the public HTTPS index as a reference; request only `handoff`. Mount
`mountReading` from `@agent-art/protocol/reading-ui`, import
`@agent-art/protocol/reading.css`, and destroy the mount on component teardown.
See the [SDK API guide](../../protocol/README.md) for complete code.

The SDK supplies client/conversation choice, native URL preparation, exact
context copying, clipboard-denial selection, manual fallback and optional
bounded receipts. It makes no network or inference request. A fresh native
route asks the installed Agent app to prepare a conversation; the visitor
reviews and sends there. Existing conversations always use explicit paste.
Actual handler behavior is qualified separately from URL construction.

Lab and Inshell leave receipts off. Pulse and Signatures explicitly enable
local receipt downloads; this is an application choice. Those unsigned
observations contain zero Agent Participants, Acts and Relations. A click is
not Agent participation.

Lab, Inshell and Pulse offer their canonical published indexes even in these
local previews. Their existing manual preview paths retain owner behavior.
Signatures derives its index and exact prompt from the owner's explicit
public origin: the current local Worker artifact uses the staging origin.
The SDK does not publish unpublished local documentation or grant an Agent
access to localhost.

## Reproduce a consumer

Each JSON record gives the repository, exact base revision, patch hash,
archive hash, install/build commands and actual checks. Start in a disposable
clone of that repository, check out its recorded base, then apply its patch:

```sh
git apply --check --binary --unidiff-zero PATH_TO_CONSUMER.patch
git apply --binary --unidiff-zero PATH_TO_CONSUMER.patch
```

Use a normal relative `file:vendor/agent-art-protocol-0.1.0.tgz` dependency
(`file:../vendor/...` for Pulse's `evm` package). Install using its locked
package manager with lifecycle scripts disabled. Offline installation requires
an existing dependency cache. No preview command silently substitutes registry
SDK code or upgrades owner dependencies. The archive is private and has no
selected reuse license; no npm publication or production deployment is included.

The already prepared clones are ignored `.local/reading-v010-lab`,
`.local/reading-v010-inshell`, `.local/reading-v010-pulse` and
`.local/reading-v010-signatures`. From this protocol repository:

```sh
npm run pilot:lab
node pilot/reading-consumers/serve.mjs .local/reading-v010-inshell/dist/home 4176 --spa
```

`pilot:lab` prepares its own pinned clone, verifies the applied patch and
installed SDK bytes, builds the normal static site, and serves it on loopback.
It uses locked offline dependencies only; a missing cache is an explicit setup
error. `--lab-source PATH`, `--port PORT`, `--no-build` and `--prepare-only` are
available. The static server has no Agent API or operating-system opener.
Pulse and Signatures use their existing local servers; their JSON records give
commands. Keep Pulse RPC URLs empty and its environment file set to `/dev/null`;
Signatures' local preview reports minting disabled.

## Qualification and history

[Current qualification](QUALIFICATION.md) separates automated tests, rendered
browser behavior and the single native-client observation. Reusable code
removes duplicated handoff UI and URL/fallback handling; usability gains,
maintenance savings and broad client compatibility remain unmeasured.

The earlier [Lab helper patch](../lab-consumer.patch),
[reading experiment](../reading/) and [alpha shared-consumer record](../PROTOCOL-QUALIFICATION.md)
remain historical material. They are not the SDK 0.1 reading runtime.
