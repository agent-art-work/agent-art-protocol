# Agent Art protocol v0.1 contract draft

Status: **candidate**, revised 2026-10-18. All requirements in this document are
proposed contract semantics. Field labels and operation names are explanatory, not a
stable JSON schema, RPC interface or released wire format. No implementation
or client conformance is claimed. [SCOPE.md](SCOPE.md) defines curator-Agent
bridges, participation evidence and verification as the first scope;
[ARCHITECTURE.md](../../ARCHITECTURE.md) supplies the
conceptual model and source context.

## 1. Contract invariants

1. Work, Participant, Act and Relation are the four participation primitives.
   Definitions, connections, grants, contexts, receipts and media are supporting
   records, not additional artistic primitives or compulsory creative stages.
2. No human Act is required before an Agent Act. An Act can address the Work
   without responding to another Act. There is no global turn counter,
   alternation, mandatory recipient or compulsory final merge.
3. Publishing, authorizing access, participating and operating infrastructure
   retain their own authority. A curator connecting an Agent is not thereby
   declared the origin of the Agent's later creative contribution.
4. Exact accepted contributions, their declared context and attribution remain
   identifiable. Revisions, selection and withdrawal do not silently replace
   originals. Retention/deletion limits remain visible.
5. Participation acceptance, verification results, artistic review, artifact
   derivation, presentation and external publication/minting are distinct
   outcomes. One exchange ending does not complete the Work.
6. Every evidence assertion has a subject, source and limited meaning. No
   credential, signature or aggregate flag certifies genuine Agent intention.
7. Participation and verification require no mint, chain, token or wallet.
   Consuming contracts choose their own admission and evidence policy; no
   universal artist or Agent mint-approval gate is part of this contract.

## 2. Shared record conventions

Every record has a stable reference and declared type/version. Work-scoped
records identify the Work instance and its pinned definition. Creative
attribution identifies the claimed Participant; administrative actions identify
the acting principal/role. Records identify the applicable protocol draft,
profile and evidence policy. The exact envelope and canonical encoding are open.

A reference is an identifier, not permission to read its subject. A digest
binds bytes only when the algorithm, byte representation and retained material
are available. Identifiers must not require a mandatory public/global identity.
Credentials and secrets do not appear in participation records or exports.

Unknown required protocol/profile features fail explicitly; an implementation
must not silently reinterpret them. Optional extensions must not change core
meaning without negotiation. Exact discovery and negotiation remain open.

### 2.1 Work: definition and instance

| Record | Candidate required information |
| --- | --- |
| Work definition | Definition reference/version; publishing artist claim and authority; exact conditions or resolvable content identity; permitted participants, Acts and Relations; validation, composition/review/completion rules; evidence/checking and access/retention policies |
| Work instance | Instance reference; pinned definition; creation/admission authority; operational status; context/state references and any attributable lifecycle changes |

Definitions and instances are two parts of Work, not two primitives. The artist
declares what the Agent can decide and how those decisions affect the work.
Publishing authority gives no right to author another Participant's Acts.

For this first scope, each instance pins one immutable definition. A different
definition uses a new instance with an explicit reference to prior material if
permitted. In-place definition migration is deferred. Infrastructure upgrades
cannot retroactively reinterpret accepted history.

Instances can remain open without a scheduled final round. A declared close
action prevents further creative submissions under that profile; access to
retained history/evidence follows its own policy. Expired grants, dead clients
and failed exchanges do not by themselves close a Work. Reopening, if supported,
requires an explicit profile rule and attributable transition.

### 2.2 Participant, connection and authority

| Record | Candidate required information |
| --- | --- |
| Participant | Participant reference; claimed kind such as human or Agent; Work admission/role; attribution label and its declared basis |
| Connection/access binding | Connection reference; authenticated principal and issuer claim; attributed Participant/role; Work scope; permitted operations; validity/revocation policy and binding authority |

Participant identity is distinct from an account, credential, client session,
model name and connection. Connection replacement preserves explicit binding
history under the policy; an operator must not silently assign an existing
Participant to another credential. A binding states its actual issuer and
evidence basis; service-maintained bindings alone remain operator assertions.

The Work names who can admit Participants and authorize connections. A curator
may hold that authority; the core does not require every Agent Act to carry a
fresh curator approval or human creative input. Standing access is limited by
its declared scope and lifetime, not by an assumed number of artistic turns.

The service checks the authenticated caller's authority rather than trusting a
submitted Participant reference. Artist publishing, curator contribution,
Agent contribution, relationship declaration and review powers are separately
defined. A host's approval controls remain outside that service's authority.
The shared bridge implements and qualifies the named setup, consent, context
and return paths; the artist integrates it with the artwork's session and
experience. No generic right to install a client, launch it, bypass host
permissions or infer a paid-subscription eligibility condition is supplied.

### 2.3 Act

| Field group | Candidate required information |
| --- | --- |
| Identity and attribution | Act reference; Work instance/definition; claimed contributing Participant and authority/binding used |
| Expression | Work-defined Act kind; exact content or identified media resources; declared content types |
| Context basis | References to the conditions, context snapshot and relevant prior material the submission declares it used |
| Relationships | References to accompanying or later separately attributed Relations; required Relations accompany acceptance |
| Outcome | Acceptance record reference; any later revision/withdrawal/review references, without replacing the original |

No first-person intention statement, reasoning trace or human-origin field is
universally required. The context basis is a declaration, not proof of the
model's full input or perception. A service-delivery observation and a
Participant's declared basis can differ and must not be conflated.

Questions, refusal, graphic proposals, revisions and text can be Acts when the
profile permits them. An explicit artistic refusal is a submitted expression;
network errors, host denial and silence are operational observations instead.
An artist's review can be an Act if it is artistic participation, or a separately
attributed administrative event under the profile. Its classification is explicit.

### 2.4 Relation

| Field group | Candidate required information |
| --- | --- |
| Identity and scope | Relation reference; Work instance/definition |
| Meaning | Work-defined relation kind; source Act; one or more target Acts or the Work instance |
| Attribution and authority | Declaring Participant/role; authority used; any agreement required by the profile and its supporting references |

A Relation is its declarer's assertion. Referencing another Participant's Act
does not claim that Participant's agreement or that the Agent understood it.
An authorized third party can declare a relation only under the Work's rules;
it retains that third party's attribution, not the source Act author's.

The example kinds `addresses`, `responds-to`, `revises`, `contests` and `combines`
are profile vocabulary, not a closed universal taxonomy. Targets must resolve
and be permitted. For this first scope, endpoints belong to the same Work
instance; cross-Work relations are deferred. Required targets must already be
accepted or included in the same valid atomic submission. Later Relations
cannot silently modify earlier declarations; corrections are new records.

## 3. Context and content

A context snapshot identifies the pinned conditions, relevant Acts/Relations,
state/resources, versions and disclosure policy offered for an operation. Its
contents need not include the entire Work history or private conversation.
Inaccessible or omitted material is explicit. A service must not substitute the
latest view for an identified older snapshot while claiming they are the same.

Inline text retains exact UTF-8 content without silent normalization, trimming
or rewriting. Any text constraints and intentional transformations belong to
the profile and preserve original versus derived values separately. Protocol
metadata canonicalization remains a separate encoding decision.

Each media reference declares content type, byte identity/digest specification,
access location or retrieval method, relevant rendering metadata and availability
policy. A mutable URL alone is insufficient to identify the contributed bytes.
An export identifies withheld, expired or missing assets; a digest alone cannot
reconstruct them. Safe derivative previews retain their own identity and link
to their source rather than masquerading as the submitted original.

SVG is untrusted content. The graphic profile must define a supported subset,
validation and isolation/rendering policy before implementation; accepting SVG
does not authorize script execution, external-resource loading or arbitrary
artist code. Fetching source bytes, displaying a preview and exposing an image
to the actual model are different observable events. None proves comprehension.

## 4. Abstract operations and durable outcomes

These are semantic capabilities, not one-to-one MCP tools or prescribed HTTP
endpoints. Their mapping, discovery and error encoding remain open.

| Operation | Contract obligation |
| --- | --- |
| Publish definition / open instance | Check the declared authority; preserve exact version identity; identify the instance and policy |
| Admit / connect / authorize | Bind the claimed Participant, caller, Work and permissions explicitly; separate setup from creative initiation |
| Read context or retained records | Enforce access, resolve pinned versions/media and report unavailable material |
| Submit Act with required Relations | Check authority, profile, context policy, content and references; accept all required records together or accept none |
| Declare later Relations | Check the declarer's separate authority, endpoints and any required agreement; preserve original declarations |
| Query submission status | Return the authorized caller's recorded outcome and accepted identities/values, or a precisely limited unresolved result |
| Review / revise / withdraw / close | Enforce the profile's authority and lifecycle rules; preserve attribution and history under retention policy |
| Revoke access | Apply the declared access/revocation policy without rewriting earlier participation |
| Collect / export evidence | Bind selected material to named subjects under disclosure/retention policy; identify sources, coverage, dependencies and unavailable material |
| Verify claims | Evaluate named claims using identified evidence, methods and policy; preserve per-claim results and processing/availability limits separately |

### 4.1 Submission identity, validation and acceptance

Each submission has a retry identity scoped to its acting principal, Work and
operation, bound to the complete submitted payload including context, content
and required Relations. A deliberate new Act uses a new submission identity;
repeated identical artistic content is not automatically a transport duplicate.

Acceptance atomically persists the Act, required Relations and its acceptance
record under one authoritative boundary. A success acknowledgment follows that
commit. A later renderer failure or external save/mint failure does not undo it
or justify replacing its bytes. A separately recorded review policy may control
whether an accepted Act enters a selected presentation.

The profile declares which formal checks, including any supported evidence
checks, are required for participation acceptance. Passing those checks is not
a universal certification of Agent execution or permission to mint. Evidence
verification can also occur after acceptance and report an unestablished or
contradicted claim without silently erasing the accepted history.

Before accepting a claim of preserved content, resolve and validate its bytes
and bind them to resources retained under the profile's policy. A mutable URL
or an unavailable resource cannot silently substitute for that obligation.
Later expiry/deletion is reported as an availability limit. The storage and
resource-lifetime mechanism must be settled before implementation.

An acceptance record identifies the issuer, submission/payload identity,
resulting Act/Relation references and exact accepted content identity, pinned
definition/context, authority used and evidence policy. It is the service's
statement. Its authentication/export-verification mechanism is still open.
Authorized retrieval must expose the exact accepted values/resources, not only
a success message or content digest, so the client and renderer can compare or
use the recorded contribution.

### 4.2 Outcomes and retry recovery

| Outcome | Meaning |
| --- | --- |
| Accepted | The required records have committed; the acknowledgment identifies them |
| Rejected | The service explicitly declined this attempt; no Act or required Relation from it was committed |
| Pending, if supported | A known attempt has no final outcome yet; it must be resolvable and is not accepted |
| Unknown to caller | The caller lacks a reliable outcome, for example after a lost response; this is not rejection, acceptance or refusal |

Within the disclosed retry/status window, the same identity and exact payload
resolve to the same durably recorded final outcome when the caller is authorized
to read it. Reusing that identity with changed bytes returns a conflict and
cannot create another Act. A rejection recorded without a durable retry entry
must say so; it must not pretend to guarantee a replayable outcome.

After uncertainty, query status or retry the same submission under the declared
policy. Absence from a non-authoritative/lagging view is not proof of no commit.
The implementation must define authoritative lookup, pending resolution and
the point at which a new identity is safe. Revoked credentials do not gain
status access merely by knowing an identifier; recovery access is explicit.

The retention design must preserve the necessary deduplication binding while
the same submission could still be accepted. Deleting payload bytes cannot
make an accepted identity reusable. Past the declared recovery window, report
the limitation rather than promising indefinite recovery.

### 4.3 Concurrency, revocation and preservation

Concurrent Acts may share an earlier context and remain separate branches.
Acceptance order describes service order, not artistic causality. Each profile
chooses whether stale context is admissible, a branch, or a reason to reject.
No universal last-writer-wins, overwrite or automatic merge is supplied.

Permission and Work-state checks must be ordered consistently with acceptance.
The implementation must resolve a revoke/close racing with submission at the
authoritative boundary. A later revocation does not retroactively erase an
already accepted Act; it prevents future use according to the declared policy.
Exact coordination mechanisms remain open before implementation.

Revision creates a new Act and attributed Relation to earlier material.
Withdrawal, discard and relation corrections create identifiable later events,
never silently relabeling original bytes or attribution. Content remains only
for the disclosed retention period; lawful/authorized deletion can remove
access under that policy. Any retained tombstone or export must state what is
unavailable and which verification can no longer be performed. Preserving
history does not mandate public storage or indefinite retention of private text.

## 5. Evidence across the four primitives

| Evidence element | Required meaning |
| --- | --- |
| Claim | A specific assertion and its scope, not an aggregate genuineness score |
| Subject | Identified Work/Participant/Act/Relation, definition/version and relevant context; may include several subjects and an identified artifact for consequence claims |
| Material | Exact permitted retained bytes, observations, authorizations, receipts or resolvable records; missing/withheld material marked |
| Source and class | Issuer/observer plus participant declaration, service observation, operator report, simulation or external witness |
| Trust and verification | Expected method/version and policy; trusted issuers/roots, execution/observation boundary and dependencies; limits and claims the material cannot support |

An assertion states a claim and its basis; a verification report states what a
checker could establish from identified evidence under a named policy. They
are supporting records, not additional participation primitives. A checker
does not certify arbitrary material merely because it was submitted as evidence.
Participant declarations, service observations, execution-origin evidence and
verification results remain distinguishable even when one operator supplies
several of them.

### 5.1 Bindings, coverage and exports

Evidence identifies the exact Work instance and pinned definition/version,
relevant context, attributed Participant/binding, Acts and Relations it covers.
The evidence method states which content, inputs and observations it binds,
which operations or time interval it covers, and any omissions or redactions.
An acceptance receipt binds the accepted payload and authority as described in
§4.1; this does not extend its scope to unobserved Agent execution.

An export identifies coverage and exclusions, definition/profile, records and
policy, supporting content/media or availability limits, and the receipt and
verification specifications it depends on. It exposes sufficient permitted
material to repeat the claimed checks, or explicitly identifies dependencies
that prevent independent repetition. A digest without retrievable bytes cannot
support content comparison. Missing or private authorization material is not
silently treated as valid authorization.

No mint receipt, transaction, token reference or chain identity is required.
A downstream consumer may attach such records with their own precise claims;
their presence does not upgrade an execution-origin or consequence claim.
Service clocks establish reported timestamps only. Acceptance order does not
establish artistic causality or completeness of private events.

### 5.2 Per-claim verification

| Report element | Candidate required information |
| --- | --- |
| Target | Exact claim and subjects evaluated; input evidence identities and availability |
| Checker | Verifier/issuer identity, method and implementation/version, applicable policy and required trust roots/dependencies |
| Performed checks | Reference/version resolution, byte identities, signatures/key bindings, authority, acceptance consistency, execution or consequence checks actually performed; unsupported or omitted checks explicit |
| Processing | Whether the requested check completed, was unsupported/unavailable, encountered invalid inputs or failed operationally; exact encoding remains open |
| Result and limits | Per-claim verdict, supporting reasons, conflicts, trust assumptions and material limits; no aggregate genuine/fake flag |

Use the following explanatory distinctions; these are not finalized wire enums:

| Per-claim result | Meaning |
| --- | --- |
| Supported under policy | The completed checks support this exact claim under the named policy, evidence and trust dependencies |
| Contradicted | Completed relevant checks establish a conflict with this exact claim, with the conflicting material and scope identified |
| Not established | The available material/checks cannot establish the claim, including missing evidence, inadequate coverage or an unqualified method |

A missing asset, unsupported execution-proof scheme, inaccessible private
record or checker outage is not proof that an Agent contribution was faked.
Invalidly encoded evidence is reported as invalid input; it must not masquerade
as a completed origin check. A failed signature check contradicts a claim of
signature validity under the named key/method, not automatically every claim
about the artwork. If an evidence policy's required check cannot complete, the
policy is not reported satisfied. A consumer may reject an unestablished claim,
but that decision does not convert the claim into a proven falsehood.

### 5.3 Execution and consequence are separate claims

Authentication identifies the credential used. A signature binds a key to its
signed statement under its verification assumptions. Neither alone establishes
that a model generated the Act, that an Agent process selected/submitted it,
or that its private intention was free from intervention. Independently rooted
enrollment, prior key binding and contribution signatures can reduce particular
operator-fabrication risks without proving those execution claims. A service
can sign its own fabricated, internally consistent history.

Any execution-origin claim needs an independently grounded method covering the
actual execution boundary claimed, with explicit issuer/runtime/model and other
trust dependencies. Covering only a wrapper or inference response cannot be
reported as covering an unobserved complete Agent loop. Exact methods and
qualified client support remain open. An operator receipt supports its narrower
receipt claim; it is not the fulfilled execution-origin requirement for v0.1.
Private intention and absence of all unobserved interventions remain unproven.

An artwork consequence claim identifies the relevant accepted Acts/Relations,
exact pinned conditions, relevant inputs and prior state, applicable transition
or renderer/checker version, and resulting state/artifact byte identity. The
artist supplies the artwork-specific rule or predicate; shared facilities
check its application using the method and material the report identifies.
Preserve original and transformed values separately. Merely including an Act
reference in metadata or running a renderer that ignores it does not establish
the declared consequence. A reproducible derivation supports only its specified
inputs, program and output claim; it does not independently establish that the
inputs came from an Agent or that the artistic significance is meaningful.

Artifact derivation and actual presentation require separate evidence when
both are claimed. A derived artifact does not prove which bytes a website
displayed. Origin, preservation, history consistency and consequence can have
different support and trust limits; no success in one silently supplies another.

### 5.4 Consuming contracts and publication

The protocol exposes participation records, evidence and verification results.
It does not authorize or block minting, mandate an artist/Agent publication
signature, choose a token/chain, or require an onchain step to finish checking.
An artwork can record an Agent's publication decision as an attributable Act or
administrative assertion under its profile without making that decision a
universal mint gate.

A consuming contract can accept unattested mints, record assertions, or enforce
specified evidence/proof/verifier requirements before admitting a mint. The
mechanism for consuming an offchain report, its trust root and bypass/upgrade
controls belong to that contract's design, not this core draft. A supported
claim does not guarantee admission; mint success does not establish the claim.
Contract admission/publication policy must not be confused with participation
acceptance (§4), the verifier's conclusion, or the website's presentation.

## 6. Profile obligations and candidate conformance cases

A profile states participant powers, available Agent decisions, permitted
content/Relations, required context, validation, stale/concurrent behavior,
review/presentation, refusal, lifecycle, evidence/checking, access and retention.
It names required claims, supported evidence methods, checker policies and
artwork-specific consequence rules. Its renderer identifies the accepted
records and definition it uses. A consuming contract's mint policy is separate.
Artistic constraints can be narrow, but cannot silently turn someone else's choices
into an attributed Agent Act.

Required design cases for the proposed core are: Agent origin with no human
Act; repeated Acts from one Participant; parallel branches; Agent–Agent
participation; revision retaining its source; explicit refusal versus host
denial; unauthorized or unresolved Relation targets; changed retry payload;
duplicate retry/lost acknowledgment; revoke/close races; missing media and
withheld evidence; authentic submission without execution-origin evidence;
unsupported or malformed evidence; a contradicted narrow claim; derivation
that ignores the claimed Act; and verification without any mint or chain
identity. These are future conformance obligations, not passed tests.

The [THOUGHT history](../../examples/THOUGHT.md#candidate-v01-history) and
[OPEN FIELD history](../../examples/OPEN-FIELD.md#3-hypothetical-history)
exercise complementary subsets in writing. They are invented traces, not
observations. Actual two-work reuse and real-client qualification remain unrun.

## 7. Remaining wire and implementation decisions

Before code: specify exact schemas and reference/identifier scope; canonical
metadata/content representation and digest choices; version/capability
negotiation; auth enrollment, grant/binding and invitation handling; required
execution/consequence claims, independently grounded evidence paths, receipt
authentication, verification inputs/policies and report semantics;
storage/atomicity and authoritative
recovery; concrete privacy/retention/media limits; safe validator/renderer
interfaces; client versions and reachability. An unqualified execution-origin
method remains a design gap, not permission to relabel service observations as
proof. No endpoint, OAuth setup, signing
algorithm, database, scheduler or hosted deployment is selected by these labels.
