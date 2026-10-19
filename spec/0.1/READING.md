# SDK 0.1.0 reading profile

Selected 2026-10-19. This is the supported public-document reading scope of
private `@agent-art/protocol@0.1.0`. The wider Agent Art architecture and
participation contract remain candidate. New THOUGHT/artwork participation is
deferred to a later compatible release; earlier experimental APIs remain.

## Purpose and ownership

Carry a publisher's public context into the visitor's own Agent, where the
visitor asks questions and continues the conversation. The same protocol can
later support richer participation; reading does not need an artwork ledger.

| Owner | Responsibility |
| --- | --- |
| Publisher/application | Canonical invitation, source/index references, usage/answer policy, placement and disclosure, original manual fallback |
| SDK | Browser interface/controller, prepared client routes, explicit fresh/existing behavior, exact context carriage, copy fallback and optional bounded receipts |
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
| `@agent-art/protocol/reading.css` | Explicit stylesheet import or static asset, with host typography and configurable colors |

`prepare({ client, conversation })` returns a native URL plan or a manual-copy
plan; it performs no navigation. The supplied UI binds a native URL to an
explicit visitor click. It offers Claude, Codex and manual copying; a
configured subset always retains manual fallback. No installation detection,
hidden launch, reload launch or automatic retry is supplied.

- **Fresh conversation:** a supported native route prepares a context draft.
  The visitor reviews and sends it inside the Agent. Draft arrival is not a
  browser-confirmed outcome.
- **Existing conversation:** copy and paste into the conversation the visitor
  chooses; no conversation ID or private history is obtained.
- **Another Agent or oversized context:** manual copying, without truncation.
- **Clipboard denied:** reveal and select the exact text for manual copying.

The publisher keeps the original prompt accessible when JavaScript is absent
or client/clipboard access is unavailable. The SDK does not replace existing
source formats, impose a new knowledge corpus or enforce the offered policy
inside an external Agent.

## Optional evidence

The interface defaults to `evidence: false`: no receipt is created. When
explicitly enabled, a local receipt may be downloaded or delivered to an
application-provided callback. Persistence is the application's decision;
using the protocol does not require collecting a visitor's reading history.

The controller's `receipt()` accepts only `handoff-requested`, `context-copied`
and `manual-context-selected`, with the selected client/conversation, named
observer and optional exact timestamp. Call it only after actually observing
that action. The SDK preserves a caller statement; it is not an independent
witness and does not establish a human's identity or motivation.

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

The release candidate archive's SHA-256 is
`646b91e68a8ea175ca4a75f8d2af48fb7e41498798c1744726479e2b91a13af0`.
The [consumer guide](../../pilot/reading-consumers/README.md) identifies four
isolated integrations: Lab, Inshell Docs, Pulse and Signatures Gallery About.
They are local consumer work, not deployed changes. No registry publication,
license selection or production rollout is implied by SDK version `0.1.0`.

The [qualification record](../../pilot/reading-consumers/QUALIFICATION.md)
separates 27 SDK tests, installed-type checks, browser fixtures, consumer
checks and one bounded Lab-to-Claude native Open. That Open reached a fresh
conversation containing the public Lab context; full composer-byte equality
was not checked, and no Send, reading or inference was performed. Earlier
alpha/MVP encounters retain their own evidence boundaries. Native routes and
source policy compliance remain qualified per actual client and environment.
