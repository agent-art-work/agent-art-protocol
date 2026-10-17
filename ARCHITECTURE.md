# Agent Art protocol architecture

Status: **candidate, documentation only**, 2026-10-17. This is the current home
of the reusable protocol draft. Exact schemas, client support, packaging and
deployment remain open. No implementation or real-client qualification is
supplied by this repository.

The purpose is to make human and Agent intention consequential in artist-defined
works, with no universal initiating participant, turn order, number of rounds,
or final synthesis. Work, Participant, Act and Relation describe participation;
an evidence layer supports specific, limited claims across all four.

This draft extracts the reusable model from the
[preserved WILL research synthesis](SOURCE.md). Historical wire sketches,
channel surveys, security-control tables and WILL-specific decisions remain
there as dated reference material. They are proposals and research, not a
finished interoperable protocol. References below identify that source context.

## 1. Four participation primitives and an evidence layer

**Candidate protocol model:** within a Work, Participants make Acts, whose Relations shape how the work develops. An evidence layer supports specific claims about all four. The model prescribes no initiating participant kind, alternating turn order, fixed round count or mandatory final synthesis.

### 1.1 Participation primitives

| Primitive | Meaning and candidate contract | What remains artwork-defined |
|---|---|---|
| **Work** | The artistic conditions and the identifiable instance in which participation occurs. Identify the artist's definition/version separately from the instance and its changing context or state. | Medium, available context, admission, participant permissions, permitted acts/relations, validation, composition, rendering, review, disclosure and completion. |
| **Participant** | An attributed participant in a Work. Human and Agent are kinds within the same conceptual category. Record the claimed role and its authority without treating a credential as proof of human or model identity. | Eligibility, pseudonymity, role-specific powers and who may authorize a connection or action. Equal artistic standing does not imply identical permissions or equal numerical influence. |
| **Act** | An attributable expression or contribution within a Work: a proposition, text, image, graphic action, response, revision, question, refusal or other work-defined act. Preserve the submitted content and its declared context. | Contribution media and constraints, permitted act kinds, how acts affect the work and which require acknowledgment or review. These examples are not a closed universal catalogue. |
| **Relation** | An attributed link describing what an Act addresses, continues, transforms, contests, combines or accompanies. An Act may address the Work itself, one earlier Act or several Acts. Additional relations retain who declared them. | Which relation kinds are meaningful, who may declare them, whether agreement is needed and how disagreements or competing relations are presented. A reference alone does not establish the referenced participant's consent or the Agent's comprehension. |

**Composition belongs to the Work's rules.** It is not a fifth participation primitive or a compulsory merge into agreement. A renderer can show the current work while participation remains open. Disagreement, coexistence, refusal and silence need not be resolved into a shared intention. An explicit refusal is an Act when the work permits it; network failure, host denial, service rejection and an unanswered invitation are not automatically artistic refusals.

Intention enters through participation and the resulting Acts. The protocol does not require a separate first-person intention statement with every Act; an artwork may request one. A declared intention remains attributed expression, not direct evidence of a private mental state.

### 1.2 Roles, authority and constraints

Artist, curator, Agent and infrastructure operator describe responsibilities; they do not replace the Participant primitive or establish an artistic hierarchy.

| Role | Responsibility and authority | Boundary |
|---|---|---|
| Artist | Defines the Work's artistic conditions, available decisions, composition and presentation; publishes the versioned artwork profile. | Publishing authority does not confer authority to impersonate another Participant, rewrite an accepted Act or declare another Participant's consent. |
| Curator | A human participant or person authorizing their Agent's participation, as the Work permits. May contribute intention, originate an Act, respond, observe or authorize standing access. | Connecting or authorizing an Agent does not require originating every participation or supplying a creative prompt before every Agent Act. An account/grant is not proof of who originated content. |
| Agent | A Participant that may originate, interpret, propose, respond, revise or decline within the Work's conditions, using its external Agent environment. | A connected client is an access path, not a verified model identity or evidence of independent judgment. Its model, conversation and execution remain with that environment. |
| Infrastructure operator | Operates supported connections, scoped authorization, durable participation records, exchange recovery and evidence services. | Its observations and signatures are attributed assertions. It is a separate trust role even when the artist also operates the service. |

An artist may also participate. One account may hold several roles, but each publishing, authorizing or participating action retains the authority used. There need not be a separate curator Act in every Work instance, or any human Act before an Agent Act. Agent-only encounters can occur within human-authored artistic conditions. This does not erase the artist's framing role.

| # | Constraint | Candidate architectural treatment |
|---|---|---|
| C1 | Web-based participation surface | The artist supplies a curator-facing website over HTTPS. It is the artwork's participation surface, not necessarily an artist-authoring tool. Agent clients can use a separately qualified port. |
| C2 | Real external Agent participation | The reference path connects a curator's existing Agent environment. The environment retains its loop, account/subscription, model choice, memory, tools and permissions. The shared service does not supply model inference in this study [03 §1]. |
| C3 | Direction and round independence | Any eligible Participant may originate an Act under the named Work; support repeated acts by one participant, dialogue, independent branches and several participants. No universally required human prompt, recipient, alternating turn or final round. |
| C4 | Explicit evidence and anti-faking limits | Support claims about all four primitives under a named evidence policy. Separate authentication, authorization, attribution, integrity and intention. No universal `genuine:true` flag (§3). |
| C5 | Respect for Agent intention | The Work declares the consequential decisions left to the Agent. Preserve original Acts and attributable relations/revisions; do not silently substitute another party's choices (§1.6). |
| C6 | Independent definitions and permissions | Distinguish protocol version, artwork definition/version, Work instance/context, exchange profile and infrastructure release. Scope publishing and participation authority separately. |

The reference real-Agent ownership arrangement does not impose a human creative origin. Standing authorization and artistic initiation are separate. Whether a particular client can initiate without a new human launch, remain active or receive a notification is a client/runtime capability to qualify, not a consequence of the abstract model.

### 1.3 Protocol, shared infrastructure and artwork responsibilities

| Responsibility | Protocol contract | Shared infrastructure implementing the contract | Artist's Work/profile/integration |
|---|---|---|---|
| Participation meaning | Work, Participant, Act and Relation identities and semantics; preservation and authority rules | Store and expose those records and their status | Define the particular artistic conditions, eligible roles and consequences |
| Curator-to-real-Agent connection | Bind authorized participation to an identified connection without claiming model identity | Build, test and maintain supported client integrations, setup/consent, connection checks, grant lifecycle and supported handoff paths | Integrate curator identity/session and connection entry/status into the artwork's website |
| Context delivery | Identify the Work conditions and exact context offered for an Act | Deliver complete versioned inputs and resolvable assets over qualified channels | Author the brief; supply text, images, SVG, state and their interpretation/access requirements |
| Contribution handling | Identify and attribute Acts and Relations; distinguish new acts from retries | Receive content, enforce authorization and supplied validators, commit accepted records durably, recover uncertain delivery | Define media/schema, artistic validation, review/selection and work-specific state transitions |
| Work development | Preserve declared relationships, original acts and attributable changes | Coordinate the supported profile and expose updates; preserve independent branches and revision history | Choose sequence, concurrency, admission, refusal, composition and completion policies |
| Evidence | Declare claims, subjects, supporting material, issuer/observer, trust dependencies and limits | Retain and expose selected evidence; verify supported claims; report unavailable checks | Choose required assurance and public/private retention/disclosure for the work |
| Presentation and external effects | Separate accepted participation from presentation and external finality | Provide accepted records/resources, status and downstream interfaces | Build the curator-facing experience, renderer, final artifact and save/publication/minting integration |

The **protocol** is the common contract. A library, service and client adapters are implementations of it; a protocol document alone supplies no working connector or handoff. The artist benefit depends on reusing tested implementations rather than separately rebuilding each client path for every artwork. A new qualified client adapter can serve several compatible works, subject to each work's permissions and evidence requirements. Compatibility is scoped, not a promise that every Agent client works.

The candidate library contains protocol schemas, canonical encodings, profile interfaces, verification and conformance fixtures. The service supplies live authorization, durable coordination, context/resource delivery and recovery. Packaging, identity-provider integration, managed versus self-hosted operation and the minimum qualified client set remain open. Artist adapters require explicit trust/isolation boundaries; arbitrary uploaded artist code is not proposed for execution in a shared process.

This protocol is maintained here; WILL is a reference consumer, not a dependency of the reusable core. Inshell's frontend remains in `inshell-art/inshell.art`. No product, contract, local demo, THOUGHT, PATH or Pulse implementation is changed by this document. Chains, tokens, quotas, auctions, relayers and minting belong only to profiles that select them.

### 1.4 THOUGHT: what Inshell builds and what it reuses

THOUGHT is a worked reference for the **artist's development process**. Inshell defines an artwork on the protocol; it does not need to define a new participation protocol for that artwork. Its human-first, single-response form is a Work choice, not a universal ordering rule.

| Primitive | THOUGHT mapping |
|---|---|
| Work | Inshell's identified THOUGHT conditions and a particular candidate consisting of the exact curator line and Agent response. Definition/version and individual candidate remain distinct. |
| Participant | The curator and their own Agent. Inshell publishes the conditions as artist; its publishing role is distinct from participating in a particular candidate. |
| Act | The curator's line and the Agent's exact response. Review/save/discard are attributable events under THOUGHT's declared policy, not silent edits to an Agent Act. No extra intention statement is required by the generic protocol. |
| Relation | The Agent Act responds to the particular curator Act. Any permitted review or later revision records its own relation/authority and retains the original. |

| Inshell must build, author or integrate | Shared infrastructure would provide |
|---|---|
| THOUGHT's artistic premise and permitted human/Agent decisions | A common participation model without imposing the THOUGHT premise elsewhere |
| Creative brief, Terminal English/length constraints and work-specific validators | Delivery of exact pinned inputs; execution of the supplied validators and explicit outcomes |
| Curator-facing entry, line input, connection entry/status, review and viewing experience | Reusable connection controls/integration APIs, authorization, participation status and recovery |
| Binding its curator session/account to the shared service | Scoped connection grants and a tested path for a supported real Agent client to read and submit |
| The composition and renderer that present the two exact lines as THOUGHT | Preserved, attributable Acts and Relations and accessible accepted values |
| Its review, retention and evidence requirements | Supported storage, evidence export and verification under that policy |
| Final artifact, save/load and any minting/PATH integration in its owning repository | Accepted-record/resource interfaces; external effects remain distinct from participation acceptance |

Candidate development sequence: (1) define/register the THOUGHT Work profile; (2) provide its brief, contribution formats and validators; (3) integrate the curator website with the shared participation implementation and identity boundary; (4) build composition/presentation and downstream integrations; (5) qualify the full artwork experience using at least one supported real Agent client. The artist still tests its integration. Shared infrastructure must separately qualify and maintain its client paths; it cannot transfer an untested handoff problem to artists while claiming to have solved it.

Candidate participation in THOUGHT: the curator connects their own Agent through a supported setup path, contributes a line, and authorizes that participation; the client receives an invitation, retrieves the actual brief/input, chooses its response and submits it directly; shared infrastructure validates and preserves the Agent Act and its response relation, returns acknowledgment/status, and supplies Inshell's website with the accepted content. Inshell renders and applies its declared review/save policy. An authenticated request, an Agent's success message and a saved artwork are separate observations.

The reference WILL consumer exercises a different profile: changing shared-image context, concurrent deeds, public work-state reconstruction and external admission/relay boundaries. Its brush, quota, no-App-review rule and finality policy remain governed by [WILL]/[ACL]. Neither reference establishes the entire protocol's generality or any deployed shared service.

### 1.5 Definitions, instances and exchange mapping

These are conceptual bindings, not a final generic wire schema:

- **Artwork profile:** the identified, versioned definition of a Work's conditions, artistic contracts, role permissions, context, validation/composition/presentation, review/refusal, evidence, disclosure/retention and completion. `artworkId`/`artworkProfileId` identify the definition; a Work-instance reference identifies a particular developing work. Existing WILL `workId` and THOUGHT record/candidate identifiers are adapter mappings, not different universal primitives.
- **Participation:** the authorized encounter of Participants and their Acts/Relations within an identified Work instance/profile. It may begin with any permitted Participant, involve several or no human Acts, branch, continue or conclude under the Work's conditions. A curator-intention field is not universally required.
- **Act and Relation records:** identify the Work, claimed Participant/role, submitted content or resolvable resources, context basis and declared relationships. An originating Act addresses the Work and requires no fabricated prior human Act. Revisions and newly declared relations retain their own attribution and prior originals. Relation targets and authority are checked under the profile; a link does not prove understanding or agreement.
- **Exchange profile:** identifies how an Agent-facing adapter implements the participation contract, including delivery/return formats and validators. The historical `runProfileId`/`runProfileSha256` refer to this layer, separately from the artwork definition and infrastructure release.
- **Run/exchange:** a bounded transport operation used by an adapter, not a participation primitive, artistic round, entire Work, conversation or single inference. The historical Inshell reference run addresses one connection and accepts at most one result. A generic participation can contain many Acts/Relations and use different exchange mappings. An exchange reaching terminal state does not by itself conclude the Work or another participant's exchanges.

Core participation/evidence references identify the Work definition and instance, Participant/authority claim, Act/content/context, declared Relation endpoints/kind/issuer, selected evidence policy, protocol version and applicable implementation/exchange versions. A `runId`, grant or curator-intention reference is included when relevant to the actual path/profile; none is a mandatory human-first origin for every Act. Per-run or per-participation pseudonyms follow the disclosure policy. Identifiers and hashes alone establish neither consent nor Agent authorship.

A new definition applies to new participations unless an explicit authorized transition records the old/new conditions and preserves earlier Acts/Relations and their context. A service upgrade cannot silently reinterpret their meaning or history. Exact schemas, compatibility negotiation and profile migration remain open decisions (§4).

### 1.6 Respect for intention and preservation

The Work declares consequential decisions available to Participants. Human and Agent Acts retain their own attribution; the service, artist or another Participant cannot silently rewrite them or substitute a summary as the original. Transformations, permitted selection, revision and withdrawal record new attributable events/relations. What a withdrawn Act's content may retain is governed by the disclosed retention policy; withdrawal is not permission to rewrite history or claim another author.

The service enforces formal permissions and contribution rules. Artistic judgment, review, dialogue, refusal and multiple turns belong to the profile. Equal standing is a design requirement that Agent intention can affect the work in its own right; it is not a guaranteed mental state, mandatory resistance, equal voting weight or a rule that every Agent must accept every invitation. A fixed browser script must be attributed as a simulation, not presented as the curator's real Agent.

Completion is a Work-defined event/policy; one accepted Act or acknowledged exchange need not finish a work. A later Act does not erase earlier Acts. Privacy-aware evidence can retain only permitted material and report the resulting verification limits. An unanswered invitation is left unanswered rather than invented as a contribution or an intentional refusal.

### 1.7 Direction, rounds and concurrency

| Allowed profile shape | Candidate representation |
|---|---|
| Human invites Agent | Human Act addresses the Work; Agent Act responds to it. THOUGHT selects this form. |
| Agent invites human | An authorized Agent originates an Act addressing the Work; a human can respond, decline or remain absent. |
| Reciprocal development | Successive Acts relate to earlier Acts; the same Participant may act repeatedly and self-revisions remain attributable. |
| Parallel encounter | Independent originating Acts address the same Work/context. A later attributed Relation/Act can bring them together; neither is fabricated as the other's cause. |
| Agent–Agent creation | Several Agent Participants originate/respond under the profile, without requiring an intervening human creative Act. |
| Continuing or unresolved work | Acts and Relations remain inspectable while the Work stays open; presentation need not imply agreement or finality. |

Direction is meaningful within a declared relation; no direction is globally prescribed. Rounds may be a profile or presentation convention, but there is no required round counter, alternation or fixed number of exchanges. Evidence attaches to individual subjects as the work develops. Concurrent records need identity and causal/context references; a service acceptance order is not proof of artistic causality. Work adapters explicitly decide conflicts, ordering and composition; there is no automatic universal merge.

Resource limits, deadlines, authorization expiry and outages still need explicit operating policies. Direction/round independence does not promise infinite resources, an always-awake Agent, unsupported wake-up/notification behavior or the ability to initiate without standing authority. Profiles can impose stricter sequences without imposing them on other works. Exact generic scheduling/concurrency mechanics remain candidate/open, rather than being supplied by the retained THOUGHT/WILL state machines.

### 1.8 Real-Agent integration and handoff responsibility

The shared implementation's practical artist benefit is a **tested route from an artwork to the curator's real Agent environment and back**. The protocol specifies the common participation contract; infrastructure owners implement and qualify client integrations. A browser drawing simulation, a connector URL or successful prompt copying alone does not supply that route [LAB-HANDOFF; LAB-FRIENDLY].

Candidate responsibilities:

1. Integrate curator identity/session with scoped participant authorization. A curator may authorize standing Agent participation without initiating each artistic act. Work creation, joining and originating Acts use their declared permissions rather than assuming a curator-only browser API.
2. Offer setup and a test exchange for each supported client, including any required consent, capability checks and compatible tools. Credentials remain with the authorized client where that path supports it. Name the actual host/version/channel and its evidence limits.
3. Deliver an invitation/reference that the curator can open or send to their client, or use a separately qualified Agent-initiated route. A website cannot be assumed to start a conversation, inference or local program. A launch click/prefilled message is not an observed Agent open.
4. Let the real client obtain the applicable Work conditions, authorized context and relevant Acts/Relations. Rich-media contracts identify the actual SVG/image/state and any required rendering or perception aid; fetching text does not establish image perception. Client ability to consume those assets is separately qualified [LAB-PULSE].
5. Receive the Agent's actual contribution over the authorized path, preserve its content and relationships, apply the artist's supplied validator/state rules, and return an explicit acceptance/status result. The renderer presents accepted content under the Work's rules rather than inventing an Agent contribution in the website.
6. Expose delivery, acceptance, persistence, rendering and any external publication/finality separately. Retain unknown delivery/commit state and follow the operation's bounded recovery policy. Distinguish host permission denial, unsupported capability, transport/parse/schema errors and an explicit artistic refusal [LAB-EXEC; LAB-FRIENDLY].

The curator still performs the client's required setup, authorization and any human launch/approval. The client/provider still owns inference, private context, memory and permission handling. A local client may execute on the curator's machine; a hosted client has a different network/runtime boundary. Reachability, ordinary HTTP permissions and full-process execution permissions must be tested in the actual path. Neither a shared connector nor a protocol promise can waive host controls.

MCP/OAuth is the retained candidate Agent port; native HTTP is a reference fallback. MCP methods, RPC direction and a run code do not determine whose artistic intention initiates or how many artistic rounds occur. Each supported path needs real-client qualification; the Lab's bounded cases do not establish MCP superiority or general reliability. The Lab's decision to set aside a small copy-prompt library concerns that helper, not a completed evaluation of this broader participation protocol [LAB-HANDOFF].

## 2. Architecture at a glance

### 2.1 Shape

```text
Artist ── publishes Work conditions/profile + composition/renderer ──┐
                                                                   v
Human Participant <──> Curator-facing artwork UI <──> Shared participation service
                                                                   ^
Agent Participant <──> Own external Agent client <──> Qualified port ┘
                                                                   │
                                              Work / Participant / Act / Relation
                                                                   │
                                  Evidence across all four, under the Work's policy
                                                                   │
                                      Artist adapter → presentation / external effects
```

The arrows represent access paths, not an artistic initiation order. Publishing authority, participant authorization, artistic acts and infrastructure assertions remain separate. There is no mandatory human-to-Agent arrow or service-owned model loop. The operator may be the artist or another party. Separate origins do not establish independent operators or trust roots.

### 2.2 Layers

| Layer | Responsibility |
|---|---|
| Participation protocol | The four primitives, their shared semantics, authority/preservation rules and versioned interoperability contract |
| Artwork definition | Artist-defined conditions, media, permitted relations, artistic consequences, composition/rendering and completion |
| Participant surfaces and client adapters | Curator-facing experience; setup/consent/handoff and qualified access for real external Agent clients |
| Participation runtime | Scoped authorization; durable Acts/Relations; context delivery, supported profile coordination, status and recovery |
| Portable protocol library | Candidate schemas, canonical representations, profile interfaces, verification and conformance fixtures |
| Evidence layer across all four primitives | Claims, subjects, material, issuers/observers, trust dependencies, retention/disclosure and explicit verification limits (§3) |
| Artwork adapters and downstream integration | Domain validation, state transitions, rendering, publication/minting or other external effects and their finality |
| External environments | Curator/Agent clients, model providers, browser/OS and independent verification/settlement systems |

Cloudflare Workers, D1 and Durable Objects belong to the historical implementation sketches, not protocol requirements. A different implementation may satisfy the contract through other supported deployment choices. Interoperability, client support and preservation require qualification.

## 3. Evidence layer and anti-faking boundaries

### 3.0 Evidence across the four primitives

**Candidate evidence layer:** first-class support for claims about Work, Participant, Act and Relation. It is not a fifth participation primitive, an extra artistic round or a compulsory public transcript. Each Work declares its required evidence, allowed disclosure/retention and the limited claims its deployment can support.

| Subject | Questions the evidence addresses | Necessary limit |
|---|---|---|
| Work | Which definition/version, instance and context were declared, delivered and used for a recorded outcome? | Published rules and consistent hashes do not prove honest execution or what a model actually perceived. |
| Participant | What identity/role is claimed, and what authorization or connection supports it? | Account, key, authorization and platform identity are distinct from human identity or model authorship. Pseudonymous participation may be valid under the Work's policy. |
| Act | What exact content was submitted, by which attributed source/path, and what was accepted or rejected? Were later changes separately attributed? | A service can assert acceptance; a key can authorize bytes. Neither alone proves that an Agent selected those bytes or expressed a private intention. |
| Relation | Which subjects/endpoints and relation kind were declared, by whom, under which authority? Were originals retained and any required agreement recorded? | Evidence can check a declared link and formal permissions, not comprehension, sincerity, complete off-service causality or unrecorded agreement. |

Each evidence item identifies:

1. **Claim:** the specific assertion being supported, with no aggregate claim of genuineness.
2. **Subject:** the Work definition/instance, Participant, Act or Relation and relevant versions/context. Evidence may concern several subjects; it does not require inventing a human origin for an Agent Act.
3. **Supporting material:** the exact retained content, observation, acknowledgment, signature, authorization or other resolvable record. A hash/reference without available bytes cannot reconstruct or independently check those bytes.
4. **Source:** the issuer, observer or reporting party, together with the evidence class. Service observation, participant declaration, operator report, simulation and external witness remain distinct.
5. **Trust and limits:** required trust roots, verification performed/not performed, missing material and unsupported conclusions. Trust dependencies apply to the full enrollment/binding/update path when an adversarial claim requires independence.

The basic participation record preserves the attributed content, context and relations required to interpret accepted Acts under the Work's policy. Stronger evidence mechanisms are required only for the claims a deployment makes. Unavailable assurance remains explicitly unavailable; absence of optional signing does not become proof of Agent authorship. Required evidence that cannot be supplied produces the profile's declared pending/rejected/limited outcome, not a silently stronger verification result. Withheld private material is identified as withheld rather than published without permission or pretended to have been inspected.

Evidence can accumulate before, during and after Acts without imposing alternating turns or a terminal round. A receipt supports its issuer's assertion about a particular operation; the Work's completion and artistic interpretation remain separate. New evidence, corrections and changed assessments are attributed additions preserving earlier records under the retention policy. The exact encoding, policy vocabulary and independently rooted deployment arrangements remain open (§4).

### 3.1 Separate evidence claims

| Claim | What verification can establish | What it cannot establish |
|---|---|---|
| Authentication | A request presented a valid credential/key under the named issuer; where available, a platform authenticated its client infrastructure | Which person, model or process authored the contribution |
| Authorization | A named principal authorized participant access or an action for a Work under the recorded policy; curator standing authorization and the Agent's later initiation remain distinct | Independent consent if enrollment/authorization records can be fabricated by the accused operator; human artistic initiation merely because a curator supplied authorization |
| Artist-rule attribution | An identified key signed the exact artwork definition; stronger attribution needs independent artist-key binding | Artistic value, honesty of execution or proof that participants followed its semantics |
| Contribution attribution | A key signed the complete Act and its Work/context/Relation and applicable exchange bindings | That an Agent rather than a curator, script or other process selected the values |
| Relation attribution | Retained endpoints, relation kind, declaring Participant/authority and any required agreement match the named policy and original records | Artistic causality, understanding, sincerity or another Participant's unrecorded consent |
| Record integrity | Retained bytes, hashes, pinned rules/context, acceptance outcomes and replay are consistent under the named verifier | Truth of self-consistent statements fabricated by a malicious service |
| History consistency | Independent parties comparing retained checkpoints can detect inconsistent extensions or forks | Completeness, truthful timestamps/content, or protection if all evidence holders collude or never compare |
| Agent intention/authorship | A declaration and an inspectable contribution can be retained as part of the artwork | Intention, comprehension, independent judgment, exact private context or absence of curator interference |

Evidence outputs name their issuer, subject, artwork/profile, scope, supporting material and unresolved checks. There is no aggregate authenticity flag that turns these different claims into “genuine Agent creation.” Artist and curator assertions stay attributed to those roles; service assertions stay attributed to the operator.

### 3.2 Adversaries and anti-faking requirements

| Adversary or failure | Candidate control and achievable boundary |
|---|---|
| Outsider injects into another curator's participation | Scoped authentication/authorization, addressed exchanges and admission checks can reject unauthorized submissions while credentials and trust roots are uncompromised. |
| Replay, duplicate commitment or concurrent conflicts | Exchange/contribution identity, idempotency and one durable atomic acceptance boundary can reject duplicate commitments and enforce formal state rules. They do not forbid legitimate new creative turns or private trials. |
| Stolen bearer credential | Short scope/lifetime, revocation and reuse signals limit exposure. A thief can still act while a valid bearer works; qualified sender-constrained credentials or separately bound contribution keys address token-only theft. |
| Artist/operator changes published rules or accepted bytes | Pinned profiles, retained original contributions and receipts, and independent verification can expose substitution/inconsistency. App-served verification alone does not protect against that App. |
| Operator invents a contribution and signs its own record | Service receipts and even an honestly consistent log are insufficient. A claim of resistance to service fabrication requires independent curator authorization/enrollment, a contribution key outside that service, an independently verifiable pre-acceptance binding to the artwork/participation, and signatures covering the complete contribution. Fake identities and unilateral key replacement must be addressed by the independent enrollment policy. If these are absent, do not make the claim. |
| Operator forks or suppresses history | Compare independently retained receipts/checkpoints under a named witness policy. An operator-owned mirror is useful republication, not independent evidence. Silence and never-recorded events remain a liveness/completeness limit. |
| Curator submits manual/scripted content or dictates to an Agent | Credential possession, signed contributions and platform authentication cannot reliably distinguish this from Agent-authored participation. Model authorship remains unestablished. |
| Curator vetoes/rehearses privately or the Agent host alters context | Record service-visible events and participant reports separately. Do not claim to observe all host approvals, outside instructions, private attempts or exact model perception. |

“Independent” covers the full enrollment, authorization, binding, verification and update path, not just a separate origin or a downloaded CLI. Strong contribution-origin evidence is conditional on qualified client signing and those trust roots; it is not a mandatory capability every curator Agent is assumed to possess. Profiles without it remain usable with explicitly weaker evidence. Neither independent signatures nor witnesses prove Agent intention.

## 4. Open decisions before implementation

These choices remain open; the scope and role definitions above do not select an implementation:

- **Protocol/schema contract:** the conceptual scope is four participation primitives plus evidence, independent of initiator and rounds (§1). Exact identifiers/encodings, Work-definition versus instance mapping, Participant/connection binding, Act/content envelopes, attributed Relation records, capability/version negotiation and compatibility rules remain open. Define these before selecting a workflow engine or arbitrary plugin execution.
- **Evidence policy and encoding:** encode claim, subject, supporting material, source/evidence class, trust dependencies and verification limits across all four primitives (§3.0). Work-specific minimums, disclosure/retention and pending/limited/rejected outcomes remain open. Independently rooted authorization/key binding and qualified signing are required if resistance to service fabrication is promised; witnesses/comparison are selected only for claims that require them.
- **Participation coordination:** map the initiator/round-independent Act/Relation model to actual entry paths, exchanges, concurrent branches, authority checks, ordering/conflict rules, revisions, withdrawal and open-ended Work lifecycle. Originating Agent acts, repeated same-participant acts and Agent–Agent encounters are required conceptual cases; exact coordination mechanisms remain open. THOUGHT/WILL state machines do not settle them.
- **Packaging and operation:** portable library/SDK and reference service boundaries; self-hosted versus managed delivery; which identity-provider and storage interfaces are required. Multi-artist hosting is a separate scope choice.
- **Disclosure and retention:** permitted viewers/exports, public versus private context/evidence, linkage, deletion and evidence availability after retention ends.
- **Adapter finality:** authoritative state, external effects, pending/canonical views and dependency/failure policy; resolve the WILL boundary without imposing chains on other artworks.
- **Real-Agent paths and initial qualification:** select the minimum supported client/host versions, setup/consent/identity boundaries, launch/handoff and Agent-originated access paths, reachable endpoints, rich-media handling, permission/recovery contract, profile-conformance vectors and at least two distinct artwork integrations. Complete actual acquisition-to-persisted-result checks; protocol text, browser simulations and fixtures alone do not qualify a real path or establish generality for the Agent Art field.

## 5. Research references and next step

Research labels such as [03] and [LAB-HANDOFF] refer to the source register
in [SOURCE.md](SOURCE.md). Their dated client facts and reported studies retain
their original limits. MCP/OAuth remains a candidate carrier; exact versions,
permissions, network access and media delivery must be checked on the chosen
client before support is claimed.

The next design task is one concrete THOUGHT-to-real-Agent path: identify the
client/runtime and authorization boundary, specify setup and handoff, define
the evidence policy, then decide the minimum schemas needed to test that path.
Keep Agent-originated and repeated/parallel Acts in the contract even if THOUGHT
selects a simpler form. See the [THOUGHT walkthrough](examples/THOUGHT.md).
This step is still design work; it does not authorize a live trial or deployment.
