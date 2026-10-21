# SDK 0.1 reading profile

Selected 2026-10-19; compact component update selected 2026-10-20; identity/About
link selected 2026-10-21 for the private `@agent-art/protocol@0.1.2` candidate.
This remains the public-document reading scope of the SDK.
The wider Agent Art architecture and participation contract remain candidate.
New THOUGHT/artwork participation is deferred to a later compatible release;
earlier experimental APIs remain. Version 0.1.0 and its archive are preserved
as historical release inputs.

## Purpose and ownership

Carry a publisher's public context into the visitor's own Agent, where the
visitor asks questions and continues the conversation. The same protocol can
later support richer participation; reading does not need an artwork ledger.

| Owner | Responsibility |
| --- | --- |
| Publisher/application | Canonical invitation, source/index references, usage/answer policy, component theme and placement, disclosure, original manual fallback |
| SDK | Ask your Agent component's mark, structure and control behavior; browser controller, prepared native draft routes, exact context carriage, copy fallback and optional bounded native-handoff receipts; explicit fresh/existing plans remain available headlessly |
| Visitor and Agent client | Choosing the conversation, reviewing/sending context, permissions, source retrieval, questions and answers |

The SDK supplies no inference, source fetch, answer service, conversation
inspection, account enrollment or automatic Send. Public reading requires no
additional backend, local helper, callback, database or persistent evidence storage.

## Work and the four primitives

The common vocabulary remains **Work, Participant, Act and Relation**, with
evidence across them. Here, a Work identifies the public reading frame:
purpose, offered context and conditions. It has an `id` and declaration
`version`, title, `capabilities: ['handoff']`, context and conditions.

The reading controller requires an exact text snapshot and at least one
HTTPS DNS source/index reference. If the Work contains several text snapshots,
the caller explicitly selects an exactly matching `context`. References must
exclude obvious local/IP destinations and embedded credentials. This is a
syntactic boundary; the SDK does not resolve DNS, establish public access or
check whether supplied JSON/text contains secrets. Applications must supply
only material they intend to carry publicly to the chosen client.

The frame and prepared plans are detached and frozen. Offered Unicode and
line endings are retained without normalization or truncation. A live index
reference identifies a discovery location; it does not pin subsequently
retrieved content or establish that any source was read.

Reading may retain zero Participants, Acts and Relations, and needs no
encounter instance. App selection is not enrollment of an authenticated Agent.
Questions and answers inside the client are unobserved. The reading controller
does not accept Agent-Act or artifact-consequence obligations; the earlier
participation APIs remain separate experimental capabilities in the same SDK.
This profile imposes no human-first rule, fixed rounds or final synthesis on
the broader protocol.

## Developer interface

Install the private vendored archive using the consumer's existing package
manager and lock its integrity. See the [installation/API guide](../../protocol/README.md).
The reading entry points are:

| Entry | Contract |
| --- | --- |
| `@agent-art/protocol/reading` | `createReading({ work, context?, clients? })` returns the frozen public frame plus `prepare()` and `receipt()` |
| `@agent-art/protocol/reading-ui` | `mountReading(element, options)` returns `{ reading, destroy() }`; destroy on framework unmount |
| `@agent-art/protocol/reading.css` | Explicit stylesheet import or static asset, with supported theme hooks for colors, font family and radius |

`prepare({ client, conversation })` returns a native URL plan or a manual-copy
plan; it performs no navigation. The supplied UI binds a native URL to an
explicit visitor click. Its compact, single-line presentation uses the small
**Ask your Agent** label and Open bubble mark, followed by **ChatGPT**,
**Claude** and always-visible **Copy**. In 0.1.2 the mark, label and ⓘ form one
ordinary About link to `https://agentart.work/ask-your-agent/`; the client links
and Copy remain separate. The identity is not an Agent-launch button or heading.
A configured subset always retains manual fallback. Oversized native context
also falls back to copying without truncation.

Without a discovery callback, configured native links appear synchronously as
offered routes requiring the installed apps. Their presence is not an
installation finding. The SDK does not probe apps, fetch discovery data or
contact localhost by default. There is no hidden launch, reload launch or
automatic retry.

`mountReading` retains `work`, `context?`, `clients?`, `label?`, `evidence?` and
`onReceipt?`, and adds optional `discoverClients`. A host callback returns
`{ clients: [{ id }] }`; the SDK recognizes only its configured supported IDs
and constructs routes itself. No supplied URLs, markup or executable modules
are accepted as client routes. Successful empty discovery leaves Copy. Failure,
timeout or unusable discovery leaves the configured native links available
with installation unverified. A successful snapshot is a host-reported
availability claim, not an independent SDK attestation. The host owns any
source, permissions or requests behind its callback. Lab injects its existing
loopback-host detector for local testing; that helper is outside the package
and is not a public-site requirement.

- **Fresh desktop conversation:** a supported native route prepares a context
  draft. The visitor reviews the app mode and draft, then sends it inside the
  Agent. Draft arrival is not a browser-confirmed outcome.
- **Existing conversation:** copy and paste into the conversation the visitor
  chooses; no conversation ID or private history is obtained.
- **Another Agent or oversized context:** manual copying, without truncation.
- **Clipboard denied:** reveal and select the exact text for manual copying.

The publisher keeps the original prompt accessible when JavaScript is absent
or client/clipboard access is unavailable. The SDK does not replace existing
source formats, impose a new knowledge corpus or enforce the offered policy
inside an external Agent.

The **ChatGPT** label retains the internal `codex-app` ID and
`codex://new?prompt=…` route. It does not request or promise ordinary Chat,
Work or Codex mode; the destination application decides. **Claude** uses its
`claude://claude.ai/new?q=…` Chat route. No browser extension is required by
these native links. The component does not select an account, model or app
preference and performs no Send action.

For Claude, choosing the Chat endpoint is deliberate even if Code was active.
The lower-level client builder also supports a separate Claude Code route; the
reading controller/component does not expose that option. Its existing
`surface: 'chat'` builder field is not sent as a ChatGPT mode parameter.
[Native destination guidance](../../pilot/reading-sdk/NATIVE-HANDOFF.md) records
current source checks and user-reported destinations without promising a
universal active-surface rule.

The publisher owns readable invitation paragraphs and intentional line breaks.
Prepare the retained snapshot after editorial formatting; the SDK does not
reflow it. Native payload and clipboard-call checks do not establish identical
recipient rendering or byte-for-byte manual paste.

The stylesheet retains the public `aap-reading` namespace and
`--aap-ink`, `--aap-paper`, `--aap-muted`, `--aap-line`, `--aap-radius`
properties, with the selected Seal/Open bubble presentation's customization
aliases. It is imported explicitly and performs no remote asset requests.

Call the whole interface the **Ask your Agent component**. The SDK owns the
mark and structure; sites control theme and placement. The
[component styling guide](COMPONENT.md) lists all supported CSS properties,
fallbacks and compatibility aliases, separates private implementation tokens,
and defines the selected 0.1.2 identity link. The historical 0.1.1 label remains
noninteractive in its preserved archive. The About link carries no Work/prompt
query or SDK handoff/receipt action.

## Optional evidence

The interface defaults to `evidence: false`: no receipt is created. When
explicitly enabled, a requested native handoff can produce a local receipt
for download or an application-provided callback. Persistence is the
application's decision; using the protocol does not require collecting a
visitor's reading history.

The compact Copy control works with any new or existing conversation and does
not ask the visitor to declare one. It therefore creates no Copy receipt,
including when clipboard denial reveals and selects the exact context. The
0.1.0 selector UI had explicit client/conversation selections; this changed
presentation must not invent those selections merely to create a receipt.

The unchanged headless controller's `receipt()` accepts only
`handoff-requested`, `context-copied` and `manual-context-selected`, with the
selected client/conversation, named observer and optional exact timestamp.
Call it only after actually observing that action. The SDK preserves a caller
statement; it is not an independent witness and does not establish a human's
identity or motivation.

| Observation | What it does not establish |
| --- | --- |
| Native URL handoff requested | Installation, OS acceptance, composer placement or sending |
| Clipboard copying reported | Paste, delivery or model exposure |
| Context selected for manual copying | Clipboard copying, paste or delivery |

Receipts retain the exact public Work context and observation, with zero
Agent Participants, Acts and Relations. They contain no question, answer,
private-history identifier or return credential. The core verifies named
structure/reference and digest claims; Agent execution origin remains
`not-established`. The SHA-256 seal is unsigned and recomputable. It can
detect a change relative to its digest, but an operator can fabricate and
reseal a coherent statement. There is no genuine/read/participated verdict.

## Compatibility and qualification

The root and `/clients` alpha APIs remain available; the original experimental
record schema and earlier receipt verification are retained. New artwork
capabilities must preserve existing reading calls and defaults. They must not
silently require enrollment, storage, callbacks or contribution records for
reading. This backward compatibility does not promise that older strict
verifiers understand future fields, schemas or capability claims.

The 0.1.2 candidate archive's SHA-256 is
`0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5`.
Its new package and browser checks are recorded under
[0.1.2 qualification](../../pilot/reading-sdk-012/). Lab remains the active
site integration and owns its matching dependency lock and page release.

The preserved 0.1.1 archive's SHA-256 is
`2c179f487aa71cd0b769c5c70cca8786275111e33f1936de11536531b4012c18`. Its local test consumer was **Lab**. Its
package, browser and Lab checks are recorded in
[0.1.1 qualification](../../pilot/reading-sdk/QUALIFICATION.json). The compact
component and the updated installed archive require their own checks; earlier
preview or 0.1.0 results do not qualify changed packaged inputs.

The immutable 0.1.0 archive's SHA-256 remains
`646b91e68a8ea175ca4a75f8d2af48fb7e41498798c1744726479e2b91a13af0`.
The [earlier consumer guide](../../pilot/reading-consumers/README.md) identifies
its four isolated integrations: Lab, Inshell Docs, Pulse and Signatures
Gallery About. Those records and pins remain historical. Only Lab is updated
and maintained as the active SDK test consumer for this change; there is no
need to keep the other three development servers running. No registry
publication, license selection or public deployment is implied by SDK
version `0.1.1`.

The [0.1.0 qualification record](../../pilot/reading-consumers/QUALIFICATION.md)
separates 27 SDK tests, installed-type checks, browser fixtures, consumer
checks and one bounded Lab-to-Claude native Open. That Open reached a fresh
conversation containing the public Lab context; full composer-byte equality
was not checked, and no Send, reading or inference was performed. Earlier
alpha/MVP encounters retain their own evidence boundaries. Native routes and
source policy compliance remain qualified per actual client and environment.

In prior compact-preview testing, the operator reported a prefilled Lab draft
in Codex. After selecting ChatGPT → Chat and invoking the same handoff, the
operator reported Work and submitted it. These are attributed prior inputs;
they do not establish a universal routing policy or constitute a fresh native
test of the 0.1.1 SDK archive. They support preserving desktop prefill while
leaving the destination mode under application control.
