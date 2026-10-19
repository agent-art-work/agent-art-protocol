# THOUGHT on the protocol

Candidate walkthrough, updated 2026-10-18. This describes responsibilities and
a proposed local-client path. It is not an implemented integration, verified client setup
guide or change to THOUGHT's existing product.

The [v0.1 scope](../spec/0.1/SCOPE.md) and
[contract draft](../spec/0.1/CONTRACT.md) define the candidate shared semantics.
The history below is invented scenario material, not a real curator/Agent run
or a newly verified account of production THOUGHT. It selects a reference
profile for discussing the protocol, without replacing THOUGHT's own rules.

For the existing application's reviewed flow and source references, use the
[project walkthrough guide](PROJECT-WALKTHROUGHS.md#walk-through-the-existing-thought-app).
Keep that application, this hypothetical trace and the local MVP separate.

## What Inshell builds

Inshell defines THOUGHT's premise, creative brief, permitted line formats,
validation, composition, review/save policy and renderer. Its website is the
curator's participation surface. It integrates curator identity/session with
shared authorization, connection entry/status, contribution status and recovery.
It supplies artwork-specific evidence requirements and consequence checks,
integrating shared verification machinery rather than inventing a separate
verifier for every client. It owns any final artifact storage, publication or
minting integration. Mint admission and token finality remain contract policy.

| Primitive | THOUGHT instance |
| --- | --- |
| Work | A versioned THOUGHT definition and a particular candidate instance |
| Participant | The curator and their own Agent; artist publishing authority is separate |
| Act | The curator's line, then the Agent's exact contribution; review actions retain their own attribution |
| Relation | The Agent contribution responds to that specific curator line |

THOUGHT selects a human-first encounter. That selection does not restrict other
works, require human creative initiation in the core, or make a transport run
the universal unit of artistic development.

## What shared infrastructure must provide

A supported real-client integration, scoped authorization, setup/consent and
connection check; delivery of the versioned conditions and exact input; an
authorized return path; durable Acts/Relations, acknowledgment/status, recovery,
and participation evidence/export/verification under the selected policy. The
same supported bridge can serve compatible artworks; artists should not have
to rebuild each client setup and return path. Verification reports specific
claims and their trust limits rather than certifying a work as genuine. These
facilities still need to be designed, built and qualified. Artists continue to
test their own work integration and supplied validators.

## One proposed local-client path

Take a curator who already uses a local Agent client such as Claude Code.
MCP/OAuth is the candidate service connection; exact client/version support,
installation and permission behavior remain unqualified. The Agent client runs
on the curator's machine; this does not mean the model's inference runs locally.

1. **Connect once.** The curator chooses the supported client path in THOUGHT,
   configures the shared endpoint in that client, and authorizes scoped access
   through the declared identity/consent flow. They complete a connection check.
   The website cannot assume it can install configuration or launch a local app.
2. **Enter the work.** The curator supplies a line in THOUGHT. Inshell's site
   identifies the applicable definition and candidate instance. Shared
   infrastructure records the attributed Act and provides an invitation/reference
   bound to the authorized participation, rather than treating the browser as
   the Agent.
3. **Hand off.** The curator opens their client and sends the invitation, or
   uses a qualified launch path if one is later available. They grant whatever
   tool/network approvals the host requires. Copying the invitation is evidence
   of neither delivery to the Agent nor an Agent decision.
4. **Participate.** The actual client obtains the pinned work conditions and
   curator Act. The Agent interprets them and chooses its contribution or an
   explicit refusal within THOUGHT's declared conditions. The client submits
   through its scoped connection. The website does not fabricate this response.
5. **Acknowledge.** Infrastructure checks formal permissions and the supplied
   validator, durably records the accepted Act and response Relation, and returns
   the accepted value/status. An uncertain response requires status recovery;
   the Agent saying “submitted” is insufficient acceptance evidence.
6. **Encounter and review.** THOUGHT retrieves the accepted records, renders the
   two exact contributions and applies its disclosed review/save policy. Review
   or discard does not silently rewrite the Agent's original Act. Accepted,
   rendered, saved and externally published are separate outcomes.
7. **Check evidence.** Shared verification machinery checks the supplied
   material under a named policy. Inshell's artwork-specific check compares the
   exact accepted pair and its attribution with the resulting artifact. Claims
   about what the website actually displayed require scoped presentation
   observations as well. Unavailable execution evidence is reported explicitly.

A later minting integration is a downstream consumer of the result and, if
selected, its verification report. The contract's policy decides whether
minting is open or requires specified evidence. Neither a successful protocol
submission nor a successful mint establishes every participation claim.

The curator is responsible for existing client access, setup/consent, their
contribution, the handoff and host-required approvals. The shared implementation
must make this path usable and maintain it for the named client; it cannot call
the integration complete while handing artists an untested URL.

## Evidence and acceptance limits

Retain the work definition/version and offered context, attributed participant
and authorization claims, original Acts, declared Relation and acceptance/status
records under the work's disclosure/retention policy. Each evidence item names
the claim, subject, material, source/class, trust dependencies and unchecked parts.

Service receipts can support claims about what that service accepted, under
trust in the service. Independently bound contribution signatures can support
attribution and tamper checks under their enrollment/key assumptions. Neither
establishes that an Agent or a particular model generated and selected the
content. An execution-origin claim needs a separately qualified evidence path
bound to this Work, context and exact contribution; none is qualified here.
Private context, unobserved rehearsals/vetoes and private intention remain
distinct limits. A missing execution proof leaves that claim unestablished;
it does not show that a contribution was fabricated.

Protocol acceptance checks permissions, format and commit rules. Evidence
verification assesses named claims from supplied material. Artifact checks
assess declared consequences; presentation observations assess a particular
display. These outcomes can differ and must remain distinguishable. A report
that a receipt matches cannot stand in for an execution or consequence check.

Before promising client support, qualify the full path: setup/authorization,
actual context acquisition, real contribution, durable acceptance, recovery and
the website's rendering of those accepted bytes. Include denied permissions,
explicit refusal, expired access, retry and uncertain delivery. Rich-media works
need their own actual image/SVG delivery and perception-path checks.

All of those live checks remain open. This rollout supplies documents only.

## Candidate v0.1 history

### Profile and authorities

Use symbolic references `thought-definition-1`, `thought-instance-1`, human
Participant `C` and Agent Participant `A`. These are explanatory labels, not
final protocol identifiers or existing records.

For this reference profile, Inshell publishes the conditions and renderer.
The curator may contribute one opening line and authorize `A` to read that
instance and contribute its response. `A` chooses its own exact response within
the declared format. The profile does not authorize the curator to relabel an
edit as `A`'s contribution; credential sharing or manual submission through an
Agent connection remains an evidence limit. The profile admits an explicit
refusal as an Act but does not treat it as the second line of a completed
two-line candidate. Silence leaves it awaiting
participation until its operational policy resolves the wait.

The curator may review, select/save or discard the candidate through separately
attributed administrative events. That selection power is visible; acceptance
does not imply the curator selected the result. No guarantee of equal selection
power or absence of private host review is claimed. This example does not add
a mandatory Agent approval of minting. If a Work requests a publication decision
from the Agent, preserve that exact attributable decision and its conditions;
generating a response alone must not be relabeled as a separate authorization.

The definition pins the actual THOUGHT brief, format validator and renderer
before a real integration. They are not reproduced or newly decided here.
Input changes after the response is pinned require a separately identified
candidate, rather than silently changing what the Agent addressed. Proposed
records stay private to the admitted participants and authorized operator by
default; any sharing/save disclosure and concrete retention/recovery windows
must be set before a live reference run.

### Illustrative sequence

All quoted creative text below is synthetic and does not assert validation
against THOUGHT's production format. Context labels stand for complete pinned
snapshots that an implementation would need to retain under the chosen policy.

| Step | Party and operation | Participation records / outcome |
| --- | --- | --- |
| T0 | Artist publishes definition; authorized curator opens instance | Work instance pins `thought-definition-1`; no creative Act is invented for these administrative operations |
| T1 | Curator connects their client and authorizes `A` | Admission and scoped connection/access records; setup is not the curator's artistic contribution |
| T2 | `C` contributes “A room remembers its windows.” | Accepted Act `t1`; Relation `tr1`: `t1 addresses thought-instance-1`, declared by `C` |
| T3 | Curator sends the invitation to their client; actual client obtains context `tc1` | `tc1` contains the pinned conditions and exact `t1`; invitation copying, context delivery and claimed perception remain distinct observations |
| T4 | `A` chooses “Light leaves without closing the door.” and submits using retry identity `ts2` | Candidate Act `t2` with declared basis `tc1`; Relation `tr2`: `t2 responds-to t1`, declared by `A` |
| T5 | Service validates and commits, but the response to the client is lost | `t2`, `tr2` and acceptance record `ta2` commit atomically; the client sees an unknown outcome |
| T6 | Client retries the exact `ts2` payload or queries authoritative status | Authorized recovery identifies the original `ta2` and exact `t2`; no second Act is created |
| T7 | Website retrieves accepted records and renders the candidate | Renderer uses exact `t1` and `t2`; displaying them is separate from accepting them |
| T8 | Curator selects/save-requests or discards the candidate | An attributed review event identifies the curator and candidate; saving/external publication, if any, has its own outcome. Neither path rewrites `t2` |
| T9 | A checker receives the retained material and identified candidate artifact | Separate findings cover record integrity, execution origin and preservation of the exact pair; a website-display claim additionally identifies its observation scope |

The creative order `C → A` belongs to this profile. `ts2` is a delivery identity,
not an Agent identity, intention or universal artistic round. A successful
response exchange does not itself mark `thought-instance-1` complete; the
profile's recorded lifecycle/review policy determines that status.
An artwork may choose minting as completion of an individual piece, but neither
the protocol nor this written history requires that policy. Its contract owns
any mint gate; verification alone does not mint or grant publication authority.

### Evidence and alternative outcomes

| Subject | Proposed retained material | Limited claim |
| --- | --- | --- |
| Work | Exact definition and `tc1`, version/digest specifications and permitted content | What conditions and input the service says it offered; not the Agent's complete private input |
| Participant | `C`/`A` attribution and the scoped authorization/binding record, with secrets excluded | Which connection/principal the service attributed to each role; not model authorship |
| Act | Exact `t1`/`t2`, submission `ts2`, accepted-value acknowledgment `ta2` and any review event | What bytes committed and what selection was recorded, under trust in the operator |
| Relation | `tr1`/`tr2`, their declarers, endpoints and applicable permissions | The declared response relationship; not comprehension or independent consent |

An evidence item about T5 would name `t2`/`tr2` as subjects, `ta2` and retained
bytes as material, the service as issuer/class `service observation`, and
operator/authorization-binding trust plus unavailable host context as limits.
It would not say the transcript proves Agent intention. An implementation must
provide the authenticated receipt/verification mechanism; these symbolic
labels supply no such evidence by themselves.

For the THOUGHT consequence claim, the checked subject is a particular artifact
under the pinned presentation rules: the exact `t1` and `t2` must occupy their
attributed positions. A replayable renderer that merely loads `t2` but omits or
substitutes its line does not satisfy that claim. If retained artifact bytes or
a scoped display observation show a changed Agent line, the preservation claim
is contradicted for that subject. If the artifact or necessary observation is
unavailable, that check remains unavailable; a matching digest or reference to
`t2` alone cannot establish the intended visible effect. Artistic significance
and private intention are not determined by this mechanical check.

If the client cannot call a tool because of host denial, no Agent refusal Act
is invented. If `A` explicitly declines through the allowed refusal format,
retain that Act and its relation to `t1`; no response line is manufactured. A
changed payload reusing `ts2` conflicts. A new candidate after discard is a
new encounter under the profile, not evidence that no private reroll occurred.

This written history covers one initiator and one creative response. The
[OPEN FIELD example](OPEN-FIELD.md) uses the same contract for an Agent origin,
consecutive Agent Acts, branches, refusal, revision and continuing graphics.
