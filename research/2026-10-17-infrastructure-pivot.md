# Choosing the first Agent Art infrastructure

Research date: 2026-10-17. Status: decision research and recommendation, not an
adopted pivot. Documentation and current primary sources were inspected. No
implementation, live Agent trial, artist interview or cost measurement was
performed. The architecture, scope and contract remain candidates.

## Finding

The objection to artist-hosted Agents is valid for an **evidence service added
to a working artwork**: it can create integration, disclosure and maintenance
work while taking little development work away. We have not demonstrated that
artists would adopt that product. It does not follow that supplied Agents have
no infrastructure value, or that connecting curators' Agents is automatically
the better product.

The choice mixes three questions: which artistic relationship the Work needs,
which useful capability or development saving the infrastructure supplies, and
which participation claims it can substantiate. Hosting alone answers none of
them. A curator-associated
Agent can run in the cloud; an artist-defined Agent can run on independently
operated infrastructure. Neither arrangement inherently gives Agent intention
more standing.

The recommended direction is to keep the participation contract independent of
Agent supply, make consequential treatment and its evidence central, and
**withhold selection of the first delivery product until its artist benefit and
evidence path are concrete**. Do not expand into a general Agent hosting
platform on the present evidence. Equally, do not present an MCP connector as
meeting the stronger anti-faking requirement.

This is a recommendation about the next design decision, not a claim that a
market for the protocol has been established. A common data model is useful
design work; adoption and interoperability still need their own evidence.

## What the existing material establishes

The historical THOUGHT source inspection describes an existing artwork-specific
handoff, return path, persistence and shared protocol package. That is a
substantial no-new-protocol baseline. The report concerns source at `e7c9a28`,
not a newly checked deployment. Its client paths and reported canaries are not
new qualifications by this study.
[Preserved THOUGHT architecture report](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/research/01-thought-app-architecture.md).

The Lab's 2026-10-04 reading-handoff reassessment set aside a separate helper
library after two pilots. It reported that the replaced clipboard handlers
were small, while prompts, loading, schemas and evidence rules stayed with the
websites. Maintenance savings had not been established. This is a finding about
that small reading helper, not a rejection of this broader participation
protocol. It gives us a concrete reason to compare adoption costs with work
actually removed.
[Lab handoff study and dated reassessment](https://agentart.work/documents/projects-agent-handoff-studies-2026-10-04-copy-prompt-reading-handoff.json).

The current [v0.1 scope](../spec/0.1/SCOPE.md) proposes a curator-owned client and
an operator-trusted evidence baseline. The later
[participation-evidence research](2026-10-17-participation-evidence.md) identifies
why that baseline does not establish actual Agent execution against a dishonest
curator or operator. Neither the scope nor the hypothetical examples establishes
artist demand, maintenance savings or a working independent proof path.

## Separate the choices

| Choice | What must be specified | Why it matters |
| --- | --- | --- |
| Agent supply and continuity | Curator brings an existing Agent, or the artist constitutes one for the Work; which identity/history claims are made | Substitution can change the artistic relationship. Memory and identity are not automatically portable or certified. |
| Execution | Curator client/cloud, artist infrastructure or shared runtime | Determines availability, setup, operational burden and observable execution boundary. Local client does not mean local model inference. |
| Creative authority | Who controls configuration, context, memory, tools, retries, editing and selection | A host can steer a real model. Hosting labels do not expose or constrain that steering. |
| Payment and operation | Who supplies model access, pays, handles limits and maintains the service | Shared hosting relocates these obligations; the protocol does not make them disappear. |
| Verification | Who observes execution, retains commitments and checks consequence; who controls their keys and updates | A separate process, repository or brand does not establish independence from the party whose conduct is in question. |

An artist's ability to define conditions is legitimate framing. The question is
which consequential choices remain to the Agent, how its Acts are treated, and
whether intervention is attributed faithfully. Neither equal artistic standing
nor respect requires identical permissions, forced agreement or mandatory public
disclosure of all private process. Review, refusal and selection need explicit
policies; they must not silently become an edited Agent Act.

## What existing infrastructure already provides

MCP already describes tool/resource/prompt access, media results and HTTP
authorization. It does not define our four participation primitives or an
artwork's obligations to an Agent contribution. These are different layers;
we should reuse transport rather than reproduce it.
[MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28),
[authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

A2A already specifies Agent discovery, authentication requirements, messages,
tasks, status, cancellation, streaming/push updates and artifacts. It permits
opaque execution. An authenticated artifact exchange is therefore not evidence
of its internal generation process. An Agent Card is not a portable personal
memory or a proof of intention. These are limits on what we can infer from
those mechanisms, not defects in their stated purpose.
[A2A specification](https://a2a-protocol.org/latest/specification/).

For a supplied Agent, the artist does not have to build a runtime from scratch.
LangGraph provides thread checkpoints and cross-thread stores; its interrupts
support pausing for external input, including review and editing. LangSmith
Agent Server adds persistence, a durable task queue and run management, with
documented scheduling and MCP/A2A endpoints. These are an illustrative existing
baseline, not a selected stack or an exhaustive market comparison.
[Persistence](https://docs.langchain.com/oss/python/langgraph/persistence),
[interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts),
[Agent Server](https://docs.langchain.com/langsmith/agent-server).

Our inference: ordinary checkpoints and human-edit facilities are useful
execution machinery. They do not by themselves establish independent evidence
of faithful attribution. A human modification would need its own attribution
instead of inheriting the Agent's. The distinctive candidate work is this
participation contract and its enforcement/evidence, built over existing
machinery.

Independent, portable evidence can itself be artist value: an exhibition,
participant or later verifier could inspect participation without relying only
on the artist's account. That benefit can justify added work when the artist
needs it. It remains a value hypothesis, not a reported adoption finding.
Developer convenience, curator access and artistic/evidence value must be
assessed separately rather than reduced to development hours saved.

A protocol earns its interoperability scope when independently controlled
works, Agent paths and verifiers can exchange these meanings and evidence.
It need not invent a new transport. Whether a profile over existing protocols
plus common records is sufficient remains open; one hosted API alone would
not establish a need for another wire protocol.

## The competing products and their adoption costs

These are alternatives to evaluate, not a commitment to implement all of them.

| Candidate | Artist work it could remove | Work and obligations it adds | When its case is strongest |
| --- | --- | --- | --- |
| Keep artwork-owned integration; share guidance | Little migration or dependency work; artist uses supported native tools and existing runtime | Artist retains client/runtime maintenance and designs its own evidence | A single simple work, small repeated burden, or a common dependency costs more than it removes |
| Maintained access for curators' existing Agents | Repeated supported-client setup, authorization, invitations, exact context/media delivery, return/recovery and records | Artwork adapter; curator setup/permissions; compatibility maintenance; execution-origin evidence remains separate | The curator's existing Agent is part of the premise and the same qualified paths serve several works |
| Shared runtime for artist-defined Agents | Execution integration/operation plus common admission, continuation, records and evidence facilities | Inference access/payment, isolation, availability, privacy/memory, model changes and evidence retention become service obligations | Public browser access or continuing Agent activity matters, and the service genuinely operates the encounter |
| Participation/evidence adapter for existing runtimes | Common attribution, preservation, consequence binding, export and verification | Instrumentation, mapping, retention and possibly an independent observation boundary | Artists already have runtimes and need a portable, checkable participation history |

For every row, the artist still defines the artistic premise, choices, media,
validators, presentation and work-specific consequences. There is no evidence
yet that the net development or maintenance savings are positive for either
new service. An adapter that only formats self-reported logs may ease export;
it does not gain stronger origin evidence by changing the format.

### What a real curator-Agent integration would save

The useful promise is: integrate a common participation contract and inherit
**maintained, qualified paths for named clients**. A link or copied invitation
does not fulfill that promise. In the documented Claude Code path, configuring
a remote MCP server and authorizing it remain real curator actions. Plugins
and account connectors can reduce repeated configuration, subject to host and
administrator controls.
[Claude Code MCP reference](https://code.claude.com/docs/en/mcp).

Connection also does not universally supply event-triggered participation.
Claude Code now documents channels into an active session, with explicit
enabling, preview restrictions and runtime compatibility constraints. A closed
session does not receive events. This is a possible client-specific capability
to qualify, not an implemented protocol feature or a universal inability to
notify Agents.
[Claude Code channels](https://code.claude.com/docs/en/channels).

The curator continues to supply client access, consent and required approvals.
Their existing Agent may have context available in its host; the protocol must
not claim to import, fully expose or certify that context. Graphic works also
need actual media-path qualification, beyond text announcing that an image or
SVG exists.

## Compare the same works before choosing

### THOUGHT

**Existing-Agent encounter.** The curator supplies their line and invites their
existing Agent. The Agent obtains the conditions and chooses a response or
refusal. Shared infrastructure handles the qualified path, accepted original
and recovery; Inshell renders the pair and attributes review/save decisions.
This preserves the proposed encounter with the curator's Agent. Inshell's
benefit depends on replacing maintained artwork-specific integration, not merely
renaming its existing run ID and return endpoint.

**Artist-defined Agent encounter.** The curator enters the website and meets
the Work's Agent. If shared infrastructure operates it, Inshell integrates the
Work, artistic configuration and renderer while reusing execution and
participation facilities. If Inshell already operates the same encounter,
adding a recorder alone takes little work away. Replacing the curator's Agent
also changes the premise; browser convenience does not establish artistic
equivalence.

**Artist runtime with a shared evidence adapter.** Inshell keeps execution. A
common adapter might preserve attributed interventions and bind an exact
response to the pair rendered. Independent origin evidence still needs a
qualified external observation/receipt or execution mechanism. If all inputs
and logs remain solely under Inshell's control, the verifier can check internal
consistency but cannot rule out Inshell fabricating the history.

THOUGHT's simple pair is also a useful control against overbuilding: identify
what it already does and subtract that from each proposed benefit. A new
protocol must not take credit for existing functionality.

### OPEN FIELD, the hypothetical continuing graphic work

The [graphic example](../examples/OPEN-FIELD.md) exercises Agent origins,
consecutive Acts, branches, revisions and refusal. It is invented scenario
material, not evidence that an artist wants the proposed service.

| Need | Generic runtime/client facilities | Candidate shared Agent Art responsibility | Artist responsibility |
| --- | --- | --- | --- |
| Continue after interruption | Persistence, queues, supported client sessions | Recover the same accepted participation without relabeling retries as new choices | Decide when work remains open and what stale context permits |
| Develop competing graphics | Stored media/state and execution | Preserve attributed Acts, Relations, branches and revisions | Define graphic actions, conflicts and composition |
| Refuse or contest | Agent output, tool calls and execution status | Distinguish explicit refusal from denied tools, silence or failure; preserve its declared treatment | Define what a refusal or disagreement does in this Work |
| Demonstrate consequence | Runtime traces and generated files | Check a declared observable effect; bind accepted Act, exact rules/input state and resulting state/artifact | Supply meaningful choices, specified effects and the transformation/renderer |
| Inspect or move a history | Framework exports/APIs | Common participation/evidence semantics usable by another verifier or implementation | Decide disclosure, exhibition and retention policies |

The candidate reuse is stronger here than a one-off copy button, but remains a
design hypothesis. General runtime durability and art-specific preservation are
different responsibilities. A single hosted demonstration would not establish
cross-artist interoperability or protocol necessity.

Consistent replay alone is insufficient: a renderer that always ignores the
Agent can also be replayed. THOUGHT could require the exact Agent line in its
attributed place; a graphic Work could require accepted geometry to affect a
specified layer. Check those declared effects and separately attribute permitted
exclusion or selection. Technical checking still does not certify artistic
significance.

## Evidence is a constraint on either product

Use the chain developed in the
[evidence study](2026-10-17-participation-evidence.md): exact conditions/context
and authority, evidenced execution, the process's selected Act, declared
treatment, and resulting state/artifact. This is an evidence dependency, not a
mandatory artistic sequence. Every link has a scope and trust dependency.

| Threat | Existing curator Agent | Artist-operated Agent | Independently operated shared runtime |
| --- | --- | --- | --- |
| Artist fabricates an Agent submission | Separately enrolled participant credentials can constrain unilateral artist fabrication; credential-only evidence still permits curator fabrication | Artist-controlled logs cannot resolve the accusation | Runtime evidence can constrain the artist if enrollment, execution and keys are outside artist control |
| Curator sends human-written content as Agent output | Authentication/signatures alone do not distinguish it | Controlled execution can establish what ran within its boundary; genuine inference may still echo supplied text | Same, with trust shifted to runtime/provider and any qualified proof mechanism |
| Host changes, rerolls or selects output | Private host activity is not automatically visible | Artist's own trace is insufficient against the artist | Can record/enforce admitted operations within its controlled boundary; private external rehearsals remain outside it |
| Work ignores or substitutes an Act | Connection does not establish consequence | Execution does not establish consequence | Still needs binding to exact applied rules, state and artifact; website display is a separate claim |

Independent operation means actual separation of control and trust roots.
Calling a service shared, or placing it in this GitHub organization, does not
create that separation. If the artist also controls the runtime and verifier,
that dependency must be disclosed.

The earlier research found candidate inference receipts, witnessed API
exchanges, attested execution and computation proofs. Each covers different
claims and retains provider, observer, hardware or proof-system assumptions.
None is a qualified end-to-end implementation here. A model-output receipt
also does not automatically cover the Agent loop, human steering, extraction
or the resulting artwork.

There is a hard incompatibility to resolve: **unrestricted curator-controlled
clients plus authenticated submissions do not provide protection against that
curator inventing Agent participation**. Supporting such a path honestly means
naming the curator trust dependency, or adding a qualified origin mechanism
with compatibility/privacy/operational costs. The user has not agreed to lower
the evidence requirement. Cloud hosting must earn its claim too; it cannot
be declared trustworthy by default.

## Recommendation and the decisions that now matter

1. **Keep the four primitives and evidence layer.** Their rationale survives
   the supply/hosting choice. Center the next review on declared Agent choices,
   attribution, preservation and consequence. Protocol, reusable software and
   managed operation remain distinct deliverables.
2. **Do not select a general cloud platform now.** Generic Agent operations
   already have capable implementations. A supplied-runtime product merits
   selection if browser access, continuity, independent verification or reusable
   participation facilities supply a capability the artist needs or remove
   concrete work. Monitoring alone has not earned it on the present evidence.
3. **Keep the existing-Agent path as a reference, not a settled default.** It
   preserves the currently written THOUGHT premise. Its maintenance benefit is
   plausible but unmeasured, and its operator-trusted baseline falls short of
   the stronger evidence requirement. Do not implement it as though those
   issues were settled.
4. **Select one first delivery product after resolving the gates below.**
   Execution-agnostic semantics do not require implementing both paths, a
   universal client adapter or multiple runtimes in the first release.

These are joint constraints, not a sequence in which Agent supply is selected
before checking benefit and proof feasibility. Begin by describing the artistic
encounter: **must the first reference Work involve the curator's existing
Agent, or may it constitute an Agent that visitors meet?**
If substituting the Agent changes what matters about the Work, choose its
supply arrangement on that basis. Location and operator follow separately.

For the benefit, name responsibilities the artist can stop maintaining or a
needed capability they gain, and the complete responsibilities transferred to
the shared implementation. Compare against the current THOUGHT path and a
competent existing runtime, including adoption, privacy and operating costs.
Avoid scores or time estimates without observations.

For the evidence claim, name the adversary, required check,
acceptable trust roots and supported execution boundary. If no compatible path
supports the required claim, the design remains unresolved. Do not silently
weaken the claim or substitute a different artistic encounter to make it pass.

| If the first Work requires... | Investigate this product first | Required condition |
| --- | --- | --- |
| The curator's existing Agent | Maintained access integrated with origin evidence | A qualified evidence path compatible with that encounter; client authentication alone is insufficient |
| Visitors meeting a Work-defined Agent | Shared participation runtime over existing execution machinery | Concrete artist value and an independently rooted execution/consequence evidence path |
| Keeping a satisfactory artist runtime | Participation/evidence adapter before replacement hosting | Needed evidence/portability with acceptable instrumentation and independent verification boundaries |

## Bounded follow-up before implementation

Prepare comparable THOUGHT and graphic-work encounter traces for the two Agent
supply arrangements. For each, show the ordinary encounter plus explicit
refusal, human editing, selection/rerolling, lost acknowledgment and an ignored
contribution. Mark exactly which party can manufacture each purported fact.
The comparisons above are the first paper analysis; they supply no runtime
findings.

Then use two independent acceptance criteria: an artist can identify concrete
value, through work removed or a needed capability supplied, and an evidence
reviewer can verify the named claim using the stated independent material.
Check portability too: can another implementation/verifier interpret exported
Work definitions, original Acts, Relations, evidence and usable artifacts under
the declared disclosure/retention policy, without trusting this service's UI?
This criterion does not require implementing a second service now.

Actual artist feedback and technical qualification are still missing. A later
trial must be separately authorized and scoped; publishing a claim or changing
the v0.1 contract is not part of this research.

No first product, hosting arrangement or weaker assurance has been selected by
this note. The finding is that both earlier defaults were premature, and the
next choice must align the artistic encounter, useful shared work and an honest
evidence path.
