# Private draft SDK

`@agent-art/protocol@0.1.0-alpha.0` packages the experimental core already used
by the Lab reading and THOUGHT participation studies. It is a private draft
SDK distributed as a local tarball, not a registry publication, stable wire
standard or conformance certification. It has no runtime dependencies. Modules
run in browsers with Web Crypto or Node.js 22.

The two infrastructure responsibilities are connection and bounded evidence.
Work, Participant, Act and Relation describe what those operations concern.
Using the connection capability does not require an Agent Act or qualify a
reading interaction as Agent Art.

## Pack and install

From this repository's root:

```sh
npm run sdk:pack
```

The intended artifact is
`.local/sdk/agent-art-protocol-0.1.0-alpha.0.tgz`. Install that file in a consumer;
for neighboring checkouts, for example:

```sh
npm install ../agent-art-protocol/.local/sdk/agent-art-protocol-0.1.0-alpha.0.tgz
```

Adjust the relative path for the consumer's location. No registry publication
or npm-account setup is required. Browser projects use the ESM package through
their existing build/import setup; a bare package import is not itself a
browser URL. The Lab preview and artwork adapters remain separate consumers.

Run the package checks from this repository's root with:

```sh
npm run test:sdk
```

Packing and installation checks are a separate qualification step from the
earlier source-module and artwork tests. Their actual results belong in
[the qualification record](https://github.com/agent-art-work/agent-art-protocol/blob/codex/protocol-lab-thought/pilot/PROTOCOL-QUALIFICATION.md). Neither a
tarball nor its package version upgrades Agent-origin evidence. Package
version `0.1.0-alpha.0` is separate from the experimental record schema.

This SDK supplies record factories, integrity/verification and prepared client
URLs. It does not supply a turnkey callback service, identity enrollment,
OAuth, access-grant lifecycle, durable storage, retry coordination, hosted
inference or independent execution attestation. Consumers retain those
responsibilities where needed, together with their artistic/source policies.
The preview's chooser UI and macOS open helper remain demonstration consumers;
they are not services bundled into the SDK.

## API

`index.mjs` exports synchronous `defineWork`, `participant`, `act`, `relation`
and `createRecord` factories; asynchronous `seal` and `verify`; and the pure
`buildClientHandoff` route builder. `sealRecord` and `verifyRecord` are aliases.
Adjacent `.d.mts` files describe the TypeScript interface.
The package exports `@agent-art/protocol` and the smaller
`@agent-art/protocol/clients` entry, both with TypeScript declarations. The
manifest is private and has no dependency or lifecycle-script requirement.

```js
import { defineWork, createRecord, seal, verify } from '@agent-art/protocol';

const work = defineWork({
  id: 'public-reading',
  version: 'reading-conditions-1',
  title: 'Read a public knowledge index',
  purpose: 'Discuss relevant public sources inside the visitor’s Agent.',
  capabilities: ['handoff'],
  context: [{
    id: 'knowledge-index', kind: 'reference', mode: 'live',
    url: 'https://agentart.work/agent-index.json',
  }],
  conditions: { questionsAndAnswers: 'Remain inside the visitor’s Agent.' },
});
const sealed = await seal(createRecord({ work }));
const assessment = await verify(sealed);
```

A Work is an identified participation frame: purpose, offered/discoverable
context and conditions. Its declaration version is distinct from an optional
encounter `instance`. An instance is required once Acts, Relations or artifacts
are retained; a handoff alone does not require one. Text context retains exact
content as a `snapshot`.
Reference context can be `live`; a `snapshot` reference requires an explicitly
declared `sha256:<hex>` digest. This module does not acquire referenced sources.
The presence of a digest is not evidence that a client fetched its bytes.

`capabilities` names `handoff`, `participation`, or both. Capabilities select
the supported operations; they do not assert that those operations occurred.
An initial reading record may contain only the Work. Empty collections are
normalized to `[]`. No Participant, encounter ledger, accepted contribution,
answer callback or artifact is required for reading.

Participation records can contain:

- Participants: `id`, declared `kind`, `label`, optional `roles` and `authority`.
- Acts: `id`, attributed `participant`, `kind`, exact JSON `content`, optional
  `context` binding the Work version and other Act identifiers.
- Relations: `id`, declaring `participant`, `kind`, source Act `from`, and
  `to: { type: 'work' | 'act', id }`. The Work target names the declaration;
  the enclosing record identifies any particular encounter.
- Observations: `id`, `observer`, `event`, bound `subjects`, optional public
  `material`, and explicit `trust` and `limits` arrays.
- Artifacts: `id`, `mediaType`, exact string `content`, optional `actIds` and
  application claim labels.

Identifiers are unique within the complete record, including context items.
Participant, Act, Relation, observation and artifact references must resolve
locally. An Act's declared Work version must match. Act kinds and Relation
kinds remain application-defined; no initiating participant, alternating turn
order, fixed round count or mandatory final synthesis is imposed. A recorded
refusal is retained as an Act; absence, host denial or network failure is not
converted into one.

## Bounded verification

Sealing adds `schema: 'agent-art-protocol/0.1-experimental'` and
`integrity: { algorithm: 'sha256', digest: '<lowercase hex>' }`.
Verification produces named `checks` with `supported`, `contradicted` or
`not-established` status, supporting detail, optional subject and explicit
general limits. There is no blanket genuineness, artistic-value or protocol
certification flag.

Core checks distinguish structure/references, record integrity, retained
Agent-attributed Acts, source acquisition and Agent execution origin.
Execution origin remains `not-established`. A selected client is not a
verified Agent Participant. A retained Agent-attributed Act supports only
the package's attribution and preservation; it does not establish model
authorship, private intention or freedom from curator/host intervention.

An application can declare `conditions.evidence.requireAgentAct` and/or
`requireConsequence`. These are checking obligations, not evidence of
completion. An encounter awaiting participation is valid. Missing required
material remains `not-established`, rather than proving a false claim.

The owner supplies consequence checks:

```js
const assessment = await verify(sealed, {
  checkConsequence: async record => [{
    claim: 'exact-pair-in-retained-artifact',
    subject: record.artifacts[0].id,
    status: 'supported', // The owner must actually check its rules here.
    detail: 'Describe the exact retained artifact and rule evaluated.',
  }],
});
```

The callback receives a defensive copy only after successful structure and
digest checks. Findings must identify retained artifact subjects and cannot
override reserved core claims. Required consequence is supported only when
every retained artifact has supported findings and no contrary/unavailable
finding. Those findings still depend on the supplied checker, retained input
and rules. They do not independently establish a rendered website observation
or artistic significance. Missing or failed checkers remain unestablished.
THOUGHT owns its exact pair, pin and SVG checks; no THOUGHT renderer is embedded
in this module.

The SHA-256 seal is unsigned and recomputable by any editor. It detects changes
relative to a particular digest. It cannot establish an independent original,
operator identity, execution origin or absence of earlier editing. Preserve
original contributions and attributable interventions in the application;
resealing edited content does not prove it came from an Agent.

## Native handoff preparation

```js
import { buildClientHandoff } from '@agent-art/protocol/clients';
const prepared = buildClientHandoff({
  client: 'claude-app', surface: 'chat', conversation: 'fresh',
  prompt: 'Public context offered to the visitor’s Agent.',
});
```

Allowlisted routes prepare a fresh composer and require the user's Send:
Codex uses `codex://new?prompt=...`; Claude reading uses
`claude://claude.ai/new?q=...`. The explicitly chosen Claude `surface: 'code'`
retains `claude://code/new?q=...` for THOUGHT's existing native-tool path.
This builder does not qualify those client capabilities. Current installation
and runtime observations belong in each integration's qualification record.
Existing conversations require manual copying and pasting into the user's
chosen chat; automatic private-history attachment is rejected.

The builder preserves exact text through query encoding and rejects malformed
Unicode, NUL, empty text and prompts larger than 12,000 UTF-8 bytes. It performs
no discovery, native opening, storage, hashing, logging, inference or callback.
A private scoped handoff may pass through it in memory, but must never be
retained in a public record. URL handlers and the chosen client receive the
prepared URL; applications must account for that trust boundary.

## Encoding and privacy limits

Factories reject unknown structural fields and return detached JSON values.
Strings retain exact Unicode and line endings: no trimming or normalization
is applied to retained content. The candidate encoding recursively sorts
object keys by JavaScript string order, preserves array order, and uses
JavaScript JSON escaping/number serialization. Numbers must be finite and not
negative zero. Strings/keys must be well-formed Unicode without NUL. Undefined,
functions, symbols, sparse/extended arrays, custom prototypes, accessors,
non-enumerable properties, cycles and nesting beyond 64 levels are rejected.
This is an explicitly bounded experimental encoding, not RFC 8785 compliance
or a language-independent numeric representation guarantee. The sealed body
includes every normalized collection; removing an empty field fails integrity.

Plain JSON is allowed inside declared conditions, contribution content,
authority and observation material. An allowlist of structural field names
cannot prove those values contain no secrets. Applications must construct
public exports from explicitly selected public fields, excluding credentials,
private handoff URLs, machine paths and private transcripts. The module does
not claim automatic redaction, trusted signatures or privacy certification.

Run the focused synthetic checks with:

```sh
node --test protocol/test/*.test.mjs
```

These checks exercise both lightweight reading and attributed artwork records,
including mutation detection, source pins, missing material, unsigned resealing,
owner consequence checks, direction/round independence and refusal retention.
They are not live-Agent trials or production transport qualification.
