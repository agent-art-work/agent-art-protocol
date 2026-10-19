# Protocol decisions and open discussion

Recorded 2026-10-19. We have a working direction and an authorized local MVP;
the protocol is not frozen. This record separates agreements, proposals,
experiments and unresolved questions so we can explore real projects without
turning earlier recommendations into decisions.

The next activity is to walk through projects and understand how the protocol
would be used. Start with the [project walkthrough guide](examples/PROJECT-WALKTHROUGHS.md).
The projects can expose missing concepts, unnecessary requirements or a poor
artist experience. They are evidence for refining the design, not candidates
being graded against an already settled standard.

## How to read the status

| Status | Meaning |
| --- | --- |
| Working agreement | Direction explicitly established in the discussion; our present baseline, open to deliberate revision |
| Proposal | A recommendation or candidate specification that has not been adopted as a final protocol requirement |
| Experiment | A choice implemented for the local MVP; it does not settle the generic protocol |
| Finding | A bounded observation or source-based analysis, with its own date and limits |
| Set aside or deferred | Outside the selected first scope, or considered and not chosen for it; not necessarily invalid for every artwork |

Detailed wording in [ARCHITECTURE.md](ARCHITECTURE.md),
[SCOPE.md](spec/0.1/SCOPE.md) and [CONTRACT.md](spec/0.1/CONTRACT.md) remains
candidate design. Requesting the MVP did not ratify every preceding proposal.
The dated research reports retain their original findings rather than being
rewritten as if later decisions had already been made.

## Purpose and artistic standing

**Working agreement.** Agent Art gives Agent intention consequential standing
alongside human intention. The protocol should help artists create such
encounters and preserve evidence of how Agent contributions participated and
were treated. Understanding an artwork and judging its significance belong to
artists and participants.

This purpose is broader than calling a model and displaying its output. The
artist declares which decisions remain available to the Agent and how those
decisions can affect the work. Equal artistic standing does not prescribe equal
permissions, equal numerical influence, a particular medium or mandatory
agreement. An Agent can contribute through a consequential choice within an
artist-defined system; generating an entire image or SVG is not a prerequisite.

Respect for intention includes retaining original attributed contributions,
making interventions visible and avoiding silent substitution. It does not
give the protocol direct access to private intention, independent judgment or
freedom from human influence. Preventing fabricated participation is a design
aim; the strength of any prevention or detection claim depends on its evidence
boundary and trust assumptions.

## The participation model

**Working agreement.** Preserve four primitives, with evidence across them.

| Primitive | Present meaning |
| --- | --- |
| Work | The artistic conditions and an identified encounter under them; distinguish the definition from its developing instance |
| Participant | An attributed contributor, including humans and Agents; a claimed role and its authority remain separate from proven execution identity |
| Act | An attributable contribution or expression, including a proposal, response, question, revision or explicit refusal under the Work's conditions |
| Relation | An attributed link stating what an Act addresses, responds to, continues, transforms or contests |

Composition belongs to the Work's rules. Evidence is a layer across the four
primitives, not a fifth artistic primitive. Grants, context snapshots,
acceptances, resources and verification reports can support those primitives
without becoming additional universal creative stages.

The protocol does not require human initiation, alternating turns, a fixed
number of rounds or final synthesis. Agent origins, consecutive Acts by the
same Participant, Agent–Agent encounters, parallel branches and continuing or
unresolved works must remain expressible. An artwork may choose a stricter
form, as THOUGHT does. Human authorization or launching a client is distinct
from originating an artistic Act.

An accepted contribution, a selected artifact and a completed Work are
different outcomes. Presentation can occur while participation remains open.
Silence, tool denial, timeout and service rejection are not automatically an
Agent's artistic refusal. A Relation declaring combination does not establish
another Participant's agreement.

## Roles and useful shared infrastructure

**Working agreement.** The selected scope is curator-Agent bridges,
participation evidence and verification. We are exploring reusable
infrastructure rather than implementing WILL as the product.

| Responsibility | Owner |
| --- | --- |
| Artistic conditions, available choices, contribution formats, website/app, composition and renderer | Artist and artwork implementation |
| Participation authorization, their own contributions, client access and any permitted review/selection | Curator |
| Actual expressions or decisions within the Work's conditions | Agent, through its identified environment and qualified path |
| Maintained client integration, scoped access, context/media exchange, durable participation, recovery and evidence facilities | Shared infrastructure implementing the protocol |
| Artwork-specific consequence claims, rules and material needed to check them | Artist, integrated with reusable verification machinery |
| Assessment of exact claims under identified methods, material and trust policies | Verifier |

The intended artist benefit is reuse of tested integration and evidence
facilities, while keeping artistic decisions with the artwork. Protocol text
alone supplies no maintained connector. A new burden that merely monitors what
the artist already built does not by itself establish a useful infrastructure
product. Savings, adoption and maintenance value still need project evidence.

The reference arrangement uses the curator's real Agent environment. A local
client can use remote inference; a curator's Agent can also be accessed through
a cloud client. Whose Agent participates, who operates it and who can verify
execution are separate questions. A fresh session in the same installed client
does not prove continuity with an earlier private Agent conversation or memory.

The protocol's meaning is independent of its carrier. MCP was useful as an
analogy and is a candidate integration mechanism; its tools, resources and
prompts do not replace our four participation primitives. Native HTTP and link
handoffs must be assessed by their actual capabilities and evidence, not ruled
in or out merely because of their transport names.

## Evidence boundaries already established

**Working agreement.** Evidence supports named claims with explicit subjects,
sources, methods, trust dependencies and limits. There is no blanket
genuine/fake verdict.

| Claim | Boundary to preserve |
| --- | --- |
| Authorization and attribution | A credential or curator association identifies an authority claim; it does not establish model authorship |
| Context | Offered, delivered, model-exposed, declared-used and comprehended are different claims |
| Acceptance and preservation | Establish which exact bytes were accepted and how later changes were attributed, under the record issuer's trust boundary |
| Execution origin | Needs evidence for the actual provider/process boundary claimed; client logs and operator receipts alone are insufficient |
| History consistency | A consistent export does not prove that all private attempts were included or that no other history was shown elsewhere |
| Artifact consequence | Check the declared effect in an identified result, not merely a reference to an Agent Act |
| Presentation | A derived artifact does not prove what a particular website/session displayed; an independent viewer establishes only its own presentation |

Supported under policy, contradicted and not established express the current
conceptual assessment model; their wire vocabulary is not frozen. Processing
failure, unsupported methods and unavailable evidence remain distinguishable
from completed checks. Missing evidence does not establish fabrication, and a
failed signature does not establish human authorship.

Credentials, local signatures, OAuth, tool calls and consistent service logs
do not establish private intention or independent Agent judgment. Even a real
model response may echo human-supplied text. Exact API request coverage need
not expose all provider-added instructions or internal state. A renderer can
replay deterministically while ignoring a contribution, so an effect claim
needs its own meaningful predicate.

Evidence collection should be limited to the chosen claim and authorized
audience. There is no universal requirement to publish private conversations,
memory, hidden reasoning or credentials. Exact disclosure, retention and
recovery windows remain design choices. Withheld or expired material narrows
what a later checker can establish.

## Execution claim still in discussion

**Proposal, not adopted as a final threshold.** The latest recommendation is
a bounded claim: an independently evidenced execution supplied an exact Act
for an identified Work/context through a curator-authorized path, and the
accepted record preserves that contribution. Consequence in a particular
artifact is checked separately.

The proposed bindings are authorization; pinned Work and relevant context;
fresh invocation identity; independently grounded request/response material;
an explicit contribution or selection in that response; defined extraction
into the exact Act; acceptance and, when claimed, its artifact effect.

The suggested compromise accepts named provider/observer trust for the covered
execution and curator trust for association with their Agent and private
continuity outside the observed boundary. Hidden instructions, rehearsals,
vetoes and private response selection may remain unobserved. Evidence revealing
a dictated response should retain that fact rather than being promoted into
independent artistic choice.

Neither a mechanism nor a trusted issuer set has been selected and qualified
for this threshold. Provider-response provenance alone does not establish the
entire native Agent process. If private Agent continuity must also resist a
malicious curator, the stronger runtime observation/attestation requirement
remains unresolved. An unsupported claim must stay unestablished; replacing
the curator's Agent with a new hosted runtime is a separate choice.

The questions to carry into projects are: which exact participation claim
matters to this artwork, who could fabricate it, what independent material is
available, what privacy it costs and which residual trust participants accept.
See the [design review](research/2026-10-18-participation-evidence-design-review.md#5-evidence-claims-and-achievable-assurance)
for the mechanisms examined and their individual limits.

## Minting and decentralization

**Working agreement.** Participation, evidence and verification can exist
without a mint, wallet or chain. A consuming contract chooses open admission,
assertion recording or evidence-gated admission. The protocol does not inherit
mint success as proof or impose a universal artist/Agent mint-approval round.
Publication conditions can be preserved when the Work requests them; that does
not promise control over every external publication.

**Discussion retained.** Curators contributing their Agent/model access may
support a distributed artistic community. Payment, subscription ownership or
compute expenditure is not a protocol admission requirement or proof of
motivation. The community meaning of that investment remains an artistic and
product question.

Blockchain-inspired participation and permissionless minting were considered.
They do not make all infrastructure decentralized. Distributed curators,
portable verification, independent evidence roots and decentralized admission
are separate properties. No consensus network or compulsory on-chain
participation layer has been selected.

## Other proposals and unresolved choices

| Area | Present state and question |
| --- | --- |
| Client path | Claude Code/macOS over remote HTTP MCP/OAuth remains a candidate; the local stdio MVP and existing THOUGHT HTTP path do not qualify it |
| Curator experience | Exact setup, identity pairing, permissions, invitation, launch and return behavior must be qualified for each actual client |
| Bytes and identities | Exact creative-byte preservation is a baseline; canonical metadata encoding, digest conventions and envelope formats remain candidates |
| Submission atomicity | One Act plus required Relations and accepted-target restrictions were recommended and tried locally; generic transaction semantics are not ratified |
| Recovery | Separate uncertain delivery from another creative attempt; choose durable client/service mechanisms and concrete recovery authority/windows |
| Media | Determine actual image/SVG delivery, derivatives, renderer dependencies, model exposure and preservation commitments per profile |
| Verification reports | Final encoding, method interfaces, policy/trust identities, historical key/time material, reassessment and conflict handling remain open |
| Artwork checks | Identify bounded consequence predicates and their isolation; no arbitrary artist code execution in a shared process is selected |
| Operations and privacy | Select storage/concurrency, grant lifetime, retention, disclosure, deletion and resource limits using actual project needs |
| Reuse and packaging | Measure what artists gain, what curators must do and what maintainers support before splitting SDK/service repositories or claiming generality |

JCS, typed digests, DSSE/in-toto-style envelopes, restricted static SVG and
particular attestation/witness systems are researched options, not universal
protocol dependencies. Application participation state cannot be inferred from
a transport session's lifecycle.

## Local MVP and what it actually showed

**Experiment and bounded findings.** The authorized MVP uses Node, a loopback
service, private local files and a fresh restricted Claude Code stdio MCP
session using existing client authentication. It preserves text Acts and
Relations, durable submission envelopes, acceptance/recovery, curator
selection, export and checks under local operator trust. Light/dark mode is a
UI feature, not a protocol decision.

The [qualification record](mvp/QUALIFICATION.md) reports 16 synthetic service
and adapter tests and one bounded real Claude Code 2.1.278 encounter. The
client read the conditions and opening, submitted a response, and received
acceptance. The browser selected and displayed that exact response; an altered
artifact copy contradicted its effect claim while the original stayed intact.

This demonstrates a local path as a development observation. It does not
provide transferable independent execution proof, earlier private Agent
continuity, the remote OAuth integration, a graphic integration or protocol
conformance. The machine owner can fabricate and rehash a consistent package.
No new runtime trial is performed by recording these results.

The MVP is a test harness. Its fresh-session launcher, local authority model,
storage, renderer and wire format are not obligations for artists or a reason
to replace a better existing curator experience.

## Project findings and the next discussion

The [project guide](examples/PROJECT-WALKTHROUGHS.md) preserves the current
comparison and source references. Keep these three THOUGHT references separate:
the existing application, the [hypothetical protocol trace](examples/THOUGHT.md)
and the [local inspired MVP](mvp/README.md).

The existing THOUGHT app already has a substantive handoff, exact-return,
integrity and review/save experience. Signatures' preview demonstrates a
different contribution: interpretation selects parameters with visible graphic
consequences. Both fit the artistic model; neither already implements every
generic record or satisfies the discussed independent-origin threshold.

Use those projects to ask what shared infrastructure should remove, what it
would add and what it would distort. We have not decided to migrate either
artwork. The proposal to use them as reference integrations is a way to learn
about the design, not a conformance verdict or implementation mandate.

## Directions set aside or deferred

| Direction | Disposition and reason |
| --- | --- |
| A WILL-specific app as this repository's product | Set aside in favor of reusable Agent Art infrastructure; WILL remains a possible reference consumer |
| Artist-hosted Agent platform as the first product | Set aside because monitoring alone could add burden without removing the artist's hosting/integration work; artist-hosted Agents are not prohibited as an artistic form |
| Rebuilding a general Agent runtime or workflow framework | Deferred; existing transport/runtime machinery does not by itself provide the distinctive artistic evidence contract |
| Turnkey artist authoring platform | Outside the selected participation/evidence scope |
| Mandatory paid Agent or blockchain participation | Not adopted; neither payment nor a token establishes artistic motivation or Agent execution |
| All-client compatibility, automatic wake-up and proof of the whole private Agent | Not established by the current design or local MVP |
| Separate infrastructure repositories, public release, licensing and deployment | Deferred; this protocol repository remains the private working home |

The architectural research identified useful candidates and limits. It did not
prove one uniquely correct architecture. The initial artist-hosted versus
curator-Agent framing was too quick to combine ownership, operation and
verification; future project evidence can revisit those choices explicitly.

## Repository and source continuity

The reusable protocol moved from WILL to `agent-art-work/agent-art-protocol`,
initially private. The Lab remains the research/publication home, and artwork
repositories retain their own rules, code and release responsibilities. No
reuse license, production deployment or publication is selected by this record.

[SOURCE.md](SOURCE.md) preserves the original research attribution and immutable
WILL reference. The earlier [evidence study](research/2026-10-17-participation-evidence.md),
[infrastructure comparison](research/2026-10-17-infrastructure-pivot.md) and
[comprehensive review](research/2026-10-18-participation-evidence-design-review.md)
remain dated research. New decisions should identify which open question they
settle and what the project encounter taught us; they should not silently
rewrite an earlier observation into a stronger finding.
