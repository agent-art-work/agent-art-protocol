# Agent Art protocol v0.1 scope

Status: **candidate draft**, revised 2026-10-19. This names a first development
scope, not a released protocol version. The operator has now authorized a
bounded local implementation; that direction does not qualify a client,
evidence claim, publication or deployment.

### Dated implementation direction, 2026-10-19

Develop one protocol through four eventual documentation-reading uses
(Inshell, the Lab, Pulse and Signatures Gallery) and two artistic uses
(THOUGHT and Signatures' preview participation). The current implementation
step covers **Lab reading and THOUGHT only**, in isolated local consumers.
The other uses remain future dogfooding targets, not supported integrations.
Minting remains outside every use. This direction does not ratify all candidate
fields, select a release or establish universal client compatibility.

The Work declaration identifies intended context and conditions. Profiles
select `handoff` and/or `participation` capabilities; submission, authority,
preservation and consequence obligations apply to the operations and claims
actually exposed. Lab reading may end at context handoff with zero observed
Acts and no registered Agent. A contribution-bearing artwork must still
preserve the original contribution and material needed to check its declared
consequence. It cannot use the reading profile to evade those obligations.
See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the bounded experiment.

The separately authorized [local MVP](../../mvp/README.md) now exercises a
bounded text subset. The gate states below preserve this pre-MVP design
baseline; current observations and remaining gaps are recorded in
[MVP qualification](../../mvp/QUALIFICATION.md). Local stdio does not qualify
the proposed remote HTTP/OAuth path or independent execution origin.

Read with the [contract draft](CONTRACT.md), [architecture](../../ARCHITECTURE.md)
and two hypothetical profiles: [THOUGHT](../../examples/THOUGHT.md) and
[OPEN FIELD](../../examples/OPEN-FIELD.md). The latter is an invented graphic
work for examining this contract, not an existing or commissioned artwork.

## 1. Purpose and first outcome

Make curator-to-real-Agent participation reusable for artists, and preserve
evidence through which its treatment and consequences can be checked. The
scope is shared curator-Agent bridges, participation evidence and verification.
The core is Work, Participant, Act and Relation, with evidence across all four.
It prescribes no initiating kind, turn alternation, round count or compulsory
final synthesis. A local client can use remote inference; the bridge does not
imply that the model runs on the curator's machine.

The proposed first working outcome, after separately authorized implementation,
is a curator using their own real Agent client through a qualified shared
bridge, with exact contributions available to the artwork and a verifier able
to evaluate named participation and consequence claims against retained
material. Two materially different profiles must use the same core contract.
A successful tool call, internally consistent service history or convincing
browser simulation does not establish that complete outcome. The stronger
execution-origin mechanism remains unselected and unqualified; service receipts
alone cannot close that gap.

The artistic profile requirement is consequential room for Agent choice within
the work's conditions. An artwork must state which choices it leaves to the Agent and
how those choices affect the work. Formal protocol conformance cannot determine
whether the encounter achieves intentional participation or artistic value.

## 2. Included in the candidate scope

| Area | Proposed v0.1 boundary |
| --- | --- |
| Participation model | Versioned Work definitions and identified instances; attributed Participants; preserved Acts and separately attributed Relations |
| Initiative and development | Human or Agent origins, repeated same-Participant Acts, multiple participants, revisions, parallel branches and continuing works |
| Authority | Separate artist definition publication, participant admission, connection/access grants and contribution/review powers; no inferred payment/subscription eligibility requirement |
| Curator-Agent bridges | Shared, named client setup/consent, scoped access, connection checks and supported handoff/return paths, integrated by the artist |
| Context and media | Exact versioned conditions and declared context; UTF-8 text plus identified image/SVG resources; explicit availability and access limits |
| Acceptance and recovery | One durable acceptance boundary for an Act and its required Relations; retry identity, status lookup and explicit uncertain delivery |
| Preservation | Original accepted content and declared context retained under the disclosed policy; later changes attributed separately |
| Evidence | Exact Work/version/context, Participant, Act and Relation bindings; material, issuer/observer, coverage, trust dependencies, limits and bounded export |
| Verification | Per-claim evaluation under a named method/policy, reporting supported claims, contradictions, unestablished claims and check availability separately |
| Artist integration | Profiles supply contribution constraints, artistic checks, composition/rendering, review and completion policies; integrate shared bridges and verification facilities |
| Downstream boundary | Participation, evidence and checking work without a mint, wallet or chain identity; consuming contracts choose whether any verification result is required for minting |
| Reference path | Proposed first target: Claude Code on macOS through HTTP MCP/OAuth, explicit curator setup/consent and invitation handoff; exact versions and behavior unqualified |
| Examples | THOUGHT's human-first two-line candidate and OPEN FIELD's Agent-originated graphic development, without a different core protocol |

The core meaning is carrier-independent. MCP was the proposed first carrier;
its tools/resources/prompts do not replace the participation primitives. A
local development adapter would not qualify the remote authorization path.
That reference target remains a proposal, not a promise of client support.
The authorized local experiment also reuses native desktop handoffs. A local
Agent client does not imply locally executed model inference.

## 3. Participation evidence and verification

Evidence is produced and bound during participation, then evaluated for named
claims. The procedure does not turn arbitrary supplied material into proof.
Every result identifies its subject, evidence, method/version, policy, issuer
or verifier, trust dependencies, performed checks and limits. For example,
"the service recorded credential X submitting these bytes" is narrower than
"the named Agent execution produced and submitted this Act". An issuer label
alone does not authenticate an exported receipt.

Keep the following claims distinct: context offered or delivered; caller
authentication and authority; observed Agent execution; exact Act/Relation
acceptance and preservation; attributable intervention or selection; and a
declared consequence in an artifact or presentation. A consequence claim binds
the accepted contribution to pinned work rules, relevant inputs/state and an
identified output. Merely accepting an Act or linking it to an artifact is
insufficient to show that the work applied it.

A verifier reports each claim as supported under the named policy,
contradicted, or not established. These labels describe results, not a settled
wire vocabulary. Missing, withheld or unavailable evidence leaves the affected
claim unestablished; it does not establish fakery. Malformed inputs, unsupported
methods and failed/unavailable checks are reported separately from a completed
check that contradicts a claim. There is no blanket genuineness flag.

Operator-authenticated receipts and consistency checks can support the limited
claims they actually cover under explicit operator trust. They do not establish
Agent execution, model authorship, private intention, complete context, absence
of rehearsal/veto or independent consent. A signed internally consistent
history can still be fabricated by its operator. Independently rooted key
binding and contribution signatures can reduce particular attribution risks;
they do not by themselves prove model or Agent origin. History consistency,
execution origin and application to the artwork need their own evidence paths.

Before qualifying the reference path, specify which execution and consequence
claims it must support and qualify the mechanisms and trust roots for those
claims. A receipt-only path may demonstrate bridge behavior and recording, but
cannot be presented as fulfilling the stronger Agent-participation requirement.
No complete path has passed these gates. Minting is neither an evidence source
for Agent origin nor a required step in participation or verification.

## 4. Ownership and deliberate exclusions

The shared implementation would own qualified bridges, consent/access handling,
context/media delivery, durable participation, recovery, evidence binding/export
and reusable checking. Artists own conditions, artistic decisions, supplied
validators and consequence checks, curator experience, renderer and their
integration with the shared implementation. Artists should not have to rebuild
each generic client bridge or evidence checker. Each artist still tests its
artwork-specific integration. Production THOUGHT and other artwork repositories
are unchanged; these documents propose reference integrations only.

Minting and other downstream admission/publication policies belong to their
consumers. A contract may accept unattested submissions, record assertions, or
reject submissions that lack its required evidence/check results. The protocol
does not authorize or block minting, require an artist or Agent mint-approval
signature, or select a chain/token. Any Agent publication decision recorded by
an artwork remains an attributed claim with its evidence; its treatment by a
contract is that contract's policy. Participation acceptance, verification,
artifact derivation/presentation and mint success remain separate outcomes.

Defer additional client qualification, automatic wake-up/background scheduling,
hosted model inference, an artist-authoring application, arbitrary uploaded
artist code execution, managed multi-artist hosting, minting-contract
implementation, broad certification and separate SDK/service repositories.
No specific runtime stack, hosting provider or reuse license is selected here.

An authorized human may start the client before an Agent originates an Act.
This permits Agent artistic initiation without claiming autonomous wake-up.
Operational limits and access expiry do not become a universal artistic round
limit or a fabricated refusal.

## 5. Historical proposed development gates, 2026-10-18

These states record the pre-experiment design baseline. The dated implementation
direction above authorizes a bounded capability subset; actual results belong
in its qualification record. In particular, a handoff-only reader is not required
to pass an artwork-consequence gate and cannot claim that consequence instead.

| Gate | Evidence required before passing | Current state |
| --- | --- | --- |
| Draft review | Both written histories fit the four primitives; bridges, authority, media, acceptance, evidence/checking and consuming-contract boundaries are explicit | Proposed by this documentation; review pending |
| One real-client path | Named client/version and carrier; setup/consent, actual context acquisition, real contribution, durable acknowledgment, retrieval and exact-value display; separate refusal/permission-failure cases and recorded limits | Unrun |
| Evidence path | Named execution-origin and consequence claims, exact subjects/bindings, qualified evidence mechanisms, replayable verification under a stated policy and trust dependencies; service self-report alone does not pass an execution-origin claim | Unqualified/unrun |
| Core behavior | Meaningful cases for unauthorized access, duplicate retry, changed retry payload, lost acknowledgment, stale context, revocation races, branching, revision, unsupported checks, unavailable evidence and contradicted claims | Unimplemented/unrun |
| Reuse | Both actual reference integrations use the same core and separate profiles/renderers; the graphic example exercises actual media delivery, not only asset descriptions | Unimplemented/unrun |
| Developer preview | Reviewed contract, artist/curator instructions, conformance vectors, evidence/export/check-report examples, named compatibility and assurance limits and unresolved issues | Unreleased |

The documents are not evidence of passing the runtime gates. Model perception
is not inferred merely from fetching an image or SVG. A successful integration
of these two works would establish bounded reuse, not universality across art.

## 6. Choices for generic qualification

1. Review the candidate record fields and operation semantics in the contract;
   choose exact schema, identifier, encoding, digest and compatibility rules.
2. Confirm the initial client/carrier and test environment. Specify browser
   session to Participant/connection binding, OAuth enrollment and grant scope,
   invitation discovery and the complete permission/recovery path.
3. Name the required execution-origin, preservation and consequence claims;
   choose and qualify their evidence methods, receipt authentication, trust
   roots and verifier inputs. Do not substitute an operator receipt for an
   unsupported execution claim.
4. Set concrete retention, disclosure, deletion, retry/status windows, media
   limits and permitted viewers for each reference profile before admitting
   actual participation. No public transcript is assumed.
5. Resolve durable acceptance, revocation ordering, validator/checker isolation,
   profile-specific stale-context behavior, artifact bindings and verification
   processing/results in an implementation design. Downstream minting admission
   is not a prerequisite for resolving these protocol choices.

The earlier design-only boundary is superseded for the local implementation
explicitly authorized on 2026-10-19, described in
[IMPLEMENTATION.md](IMPLEMENTATION.md). Generic qualification, stronger origin
claims, production deployment and publication remain separate decisions.
