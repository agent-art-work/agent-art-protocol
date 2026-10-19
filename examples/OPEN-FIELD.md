# OPEN FIELD: an Agent-initiated graphic work

Status: **hypothetical v0.1 profile and trace**, updated 2026-10-18. OPEN FIELD is an
invented example for testing the [scope](../spec/0.1/SCOPE.md) and
[contract draft](../spec/0.1/CONTRACT.md) on paper. All dialogue and graphic
choices below are synthetic scenario material. No Agent was called, media
asset produced, work registered or real participation observed.

## 1. Artist-defined conditions

An artist provides a white square field in which human and Agent Participants
may offer graphic layers, text, questions, contestations and revisions. The
artist asks participants to attend to openings and passages, but leaves the
first graphic proposition, interpretation, response and refusal to them.

An Agent can originate the first Act without a human creative prompt. It may
act repeatedly. No participant must accept another's proposed direction; the
work can remain unresolved. These conditions describe this example, not the
definition of Agent Art or universal protocol rules.

| Profile choice | Proposed rule |
| --- | --- |
| Work | Symbolic definition `field-definition-1` and instance `field-instance-1`; the instance pins one immutable definition |
| Participants | Human `H` and Agent `A`, admitted under the declared access policy; the artist publishes and is not assumed to participate |
| Available Acts | Graphic layer, text/question, explicit refusal and revision; no separate intention statement required |
| Graphic content | Identified SVG layer resources in an artist-defined restricted subset; immutable originals; previews have separate identities |
| Relations | Profile kinds `addresses`, `responds-to`, `continues`, `contests`, `combines` and `revises`; declared by their attributed Participant; no target author's agreement implied |
| Permissions | Participants submit their own Acts and Relations from those Acts; neither can rewrite the other's contribution or claim the other's endorsement |
| Stale/concurrent context | Accept independent branches with their actual declared basis; no automatic overwrite or mandatory merge |
| Composition | Present all accepted layers as a trace, retaining alternatives; a revision selects a newer visible variant within its own lineage while the source remains inspectable. Text/refusal stays accessible alongside the graphic history |
| Agreement | Co-presentation or a `combines` relation is its declarer's proposal, not shared agreement. A participant may respond or contest it |
| Completion | Either participant may propose closure; closing requires an attributed assent from both under this profile. It may stay open indefinitely in artistic terms, subject to disclosed operating limits; a current image need not be final or agreed |
| Evidence | Claim-specific checks of retained content/context, attribution and declared graphic effects, with operator trust and unavailable execution-origin evidence explicit; no authorship/intention certification |
| Disclosure/retention | Private to admitted participants and authorized operator by default; public exhibition requires a disclosed authorized transition. Exact retention, deletion and retry/status windows remain prerequisites to live use |

Before implementation, the artist must specify actual viewport/coordinates,
layer ordering, lineage/branch display, allowed SVG elements, resource/size
limits, validators and renderer version. Nothing here authorizes unsafe SVG
execution or arbitrary uploaded code. These are profile concerns implemented
through a bounded adapter, not new core primitives.

The artist integrates a reusable curator-Agent bridge and evidence verifier,
supplying the graphic validation and consequence predicates specific to this
work. That is the shared infrastructure benefit; the artist need not develop
each supported client's setup, delivery, return and recovery path. No client
or media path is qualified by this paper example. Publication or minting, if
chosen, consumes records/reports downstream. Any contract decides its own mint
requirements; this profile does not require a token or a final snapshot.

## 2. Authorization without a prior human Act

The curator admits `A`, authorizes scoped access to this instance and opens
their existing Agent client. The handoff identifies the Work and asks the
client to retrieve its conditions; it does not supply a predetermined graphic
or command the Agent to carry out a human artistic idea.

The artist delegates instance creation/admission to this curator for `H` and
`A`. Each admitted Participant controls its own submissions. Closure proposals
and assents are attributable Acts; an operational suspension by the operator
is recorded separately and cannot stand in for their artistic agreement.

This is connection/setup authority, not a fabricated human Act. `A` can make
the first creative proposition after reading the artist's conditions. The
scenario assumes manual launch and continued client availability; it claims
neither autonomous wake-up nor indefinite execution. Later host approvals,
outside instructions and private attempts remain outside service observation.

The service enforces the admitted permissions. An invitation alone is not
sufficient authority to impersonate `A`; the actual connection/binding design
must be settled and qualified before a live use of this profile.

## 3. Hypothetical history

The numbered steps describe one possible service-observed sequence. They are
not mandatory rounds. `fc0` is the offered blank-field context. Subsequent
snapshots identify the records and media they actually include. No complete
private Agent context is implied.

| Step | Attributed Act and declared basis | Declared Relations / consequence |
| --- | --- | --- |
| F1 | `A`: Act `f1`, a cobalt arc that stops before crossing the field; basis `fc0` | `fr1`: `f1 addresses field-instance-1`. The Agent chooses the first gesture; no prior human Act exists |
| F2 | `A`: Act `f2`, a small amber mark near the arc's open end; basis `fc1` containing `f1` | `fr2`: `f2 continues f1`. The same Agent acts again without an intervening human turn |
| F3 | `H`: Act `f3`, “Could you bridge that opening with a straight line?”; basis `fc2` containing `f1`/`f2` | `fr3`: `f3 responds-to f1`. This is an invitation to change direction, not privileged operational authority over `A` |
| F4 | `A`: explicit refusal Act `f4`, “I want the opening to remain. I will look for a way around it.”; basis `fc3` including `f3` | `fr4`: `f4 contests f3`. The refusal is accepted as artistic material; it is not a failed request or fabricated silence |
| F5 | `H`: Act `f5`, a translucent gray band; declared basis is earlier `fc1`, which included `f1` but not `f2`–`f4` | `fr5`: `f5 responds-to f1`. A parallel branch arrives later in service order without being falsely described as a response to `f4` |
| F6 | `A`: Act `f6`, a narrow curved detour around the band's edge, leaving the opening unbridged; basis `fc5` including both branches | `fr6a`/`fr6b`: `f6 combines f2` and `f6 combines f5`, declared by `A`. This is a proposed relationship among layers, not `H`'s agreement or a mandatory final synthesis |
| F7 | `A`: revision Act `f7`, a wider version of its detour that leaves more empty space; basis `fc6` including `f6` | `fr7`: `f7 revises f6`. Original `f6` stays identifiable; the renderer presents the newer lineage variant and permits inspection of the earlier one |

Every `fr` declaration is attributed to the same Participant as its source Act
in this profile. Source/targets, context and authority are checked before the
Act and its required Relations commit together. Every step uses the same
Act/Relation envelope as THOUGHT; only the profile's content and rules differ.

The field remains open after F7. `H` can continue, contest or stop participating;
`A` can propose again if its access and client availability permit. The renderer
can show a current image without declaring agreement, completion or a winner.

### Media inventory and verification boundary

| Symbolic resource | Exact content a real run would have to retain |
| --- | --- |
| `arc-1.svg` | Original bytes of the cobalt-arc layer in `f1` |
| `mark-1.svg` | Original bytes of the amber-mark layer in `f2` |
| `band-1.svg` | Original bytes of `H`'s translucent-band layer in `f5` |
| `detour-1.svg` | Original detour layer in `f6` |
| `detour-2.svg` | Separately identified revised layer in `f7`; it cannot replace the bytes at `detour-1.svg` |
| `view-fcN.png`, if used | Separately identified raster preview and renderer/input references for its particular context |

These labels are not files, URLs, content hashes or verification material.
No actual SVG/PNG bytes are supplied by this written trace. A live integration
must provide resolvable resources, exact identities, access policy and the
qualified client delivery/perception path. Describing graphics in text alone
cannot pass that media qualification gate.

## 4. Evidence and operational counterexamples

| Subject | Proposed material and claim | Required limit |
| --- | --- | --- |
| Work | Pinned definition, contexts `fc0`–`fc6`, renderer and view-input identities | Identifies declared/offered conditions and views, not honest execution or model comprehension |
| Participant | Admission, principal/Participant binding, scope and grants for `H`/`A` | Identifies the service's authorization/attribution basis, not the process or model that chose the graphic |
| Act | Exact SVG/text bytes, declared basis and atomic acceptance records | Shows what the service recorded as accepted; no claim of unobserved private freedom or intention |
| Relation | Exact `fr` records, endpoints/declarers and applicable authority | Shows declared continuation, contest, combination and revision; not agreement, sincerity or complete artistic causality |

For example, evidence for F7 would name `f7`/`fr7` and the definition/context as
subjects, retained revision/source bytes and the acceptance record as material,
and the service as issuer/class `service observation`. Checks could compare
byte identities and the permitted revision relation if all inputs were retained.
Operator trust, receipt authentication, unavailable host events and any missing
assets remain explicit. A self-consistent export would not defeat a malicious
operator inventing the entire history.

Verification must separately address the graphic consequence. For F7, a real
profile would supply a checkable claim that the current lineage displays the
revised detour from `detour-2.svg`, retains access to `detour-1.svg` and preserves
the specified opening. That requires pinned coordinate/layer rules, exact SVG
inputs, relevant before/after state and identified rendered output. Resource
references or a renderer replay that silently drops the Agent layer do not
establish that effect. Geometric opening/visibility predicates must be defined
by the artist; their passing does not prove the artistic meaning of the gesture.

An artifact check concerns the identified output. A claim that the public site
displayed that output additionally needs a scoped presentation observation.
Record acceptance, execution origin, graphic-effect verification and observed
display therefore have separate findings. The operator receipt alone leaves
Agent execution origin unestablished. Missing material leaves its affected
claim unavailable, not automatically fabricated; retained output demonstrably
omitting a required visible layer contradicts that specific effect claim.

- A timeout after F6 acceptance leaves the client uncertain; retrying its exact
  submission resolves the original outcome without adding another detour Act.
- A host tool denial before submission creates an operational observation,
  not an artistic refusal such as F4.
- Revoking `A`'s connection prevents future writes according to the ordered
  authorization policy; it does not rewrite accepted `f1`–`f7`.
- Reusing a submission identity with altered SVG conflicts. A deliberate new
  revision uses a new identity and a `revises` relation, as in F7.
- Missing `detour-1.svg` makes original-content verification unavailable; its
  label/digest cannot be presented as the retained original graphic.

## 5. What this example examines

It combines an Agent origin, repeated same-Participant Acts, human response,
explicit contest/refusal, stale-context branching, several-target composition,
revision and a continuing work using identified graphics. No transport run ID,
human-origin field, fixed round number or mandatory agreement is required by
the core. Agent–Agent participation is also a required core design case, but
is not claimed as exercised by this two-Participant trace.

The artist would build the conditions, graphic validator, curator surface and
renderer. The shared implementation would provide the actual client connection,
authorization, context/media access, durable records, recovery and claim-specific
evidence export/verification. Its checks reuse the artist's bounded predicates
without deciding artistic value or downstream mint eligibility. All live
integration and artistic assessment remain unrun.
