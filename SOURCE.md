# Source and migration record

On 2026-10-17 the operator selected a separate protocol repository under
Agent Art Work, initially private. The Lab remains the research/publication
home; participating artworks retain their own implementation and release.

The source is the [complete architecture synthesis](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/ARCHITECTURE.md)
at WILL commit `ab7c375bdacede7cbd1f72ea74d18c53c43f10b0`. SHA-256 of the original UTF-8 file:
`0de90210d9ee4ca1e1b4c92f2b9f29c3a8491c6608aefb20bb430520ecc37f46`. [SOURCE.json](SOURCE.json) records the same identity.
The source commit preserves the full document before the WILL path becomes
a migration pointer. Source access depends on repository permissions.

The current [architecture](ARCHITECTURE.md) extracts the reusable conceptual
model, role split, THOUGHT example, connection responsibilities, evidence
boundaries and open decisions. Ownership and internal references were adapted.
The historical implementation sketches, qualification matrix and dated reviews
remain at the pinned source; they have not been discarded or promoted to a
completed implementation. WILL's normative rules remain in its own spec.

Reports 01–04 and designs A/B originated in Claude's research. Design C was
planned but not produced. Report 05 and the role/evidence/four-primitive revisions
continue that work in this conversation. This migration is editorial, not new
verification of the literature, providers or historical runtime observations.

## Source register

| Key | File |
|---|---|
| [01] | [research/01-thought-app-architecture.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/research/01-thought-app-architecture.md) |
| [02] | [research/02-thought-issue-catalog.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/research/02-thought-issue-catalog.md) |
| [03] | [research/03-agent-channels.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/research/03-agent-channels.md) |
| [04] | [research/04-integrity-primitives.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/research/04-integrity-primitives.md) |
| [05] | [research/05-intention-and-participation.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/research/05-intention-and-participation.md) (study context, not normative rules) |
| [A] | [designs/A-pointer-run-service.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/designs/A-pointer-run-service.md) |
| [B] | [designs/B-connector-port-mcp.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/docs/agent-app/designs/B-connector-port-mcp.md) |
| [WILL] | [spec/WILL.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/spec/WILL.md) |
| [ACL] | [spec/APP_CONTRACT_LOGIC.md](https://github.com/inshell-art/WILL/blob/ab7c375bdacede7cbd1f72ea74d18c53c43f10b0/spec/APP_CONTRACT_LOGIC.md) |
| [LAB-GUIDE] | [Agent-Art-Lab Guidance](https://agentart.work/documents/guidance.json), source revision `sha256:d832ebbd0489d78d47eb3e80f3256b5680493856e9fcb6e1e4eabd3452118e12` |
| [LAB-HANDOFF] | [Copy prompt to agent handoff](https://agentart.work/documents/projects-agent-handoff-studies-2026-10-04-copy-prompt-reading-handoff.json), source revision `sha256:87b84c1c9a6302660d4f51eaf179488161c13c61dc0fd94322fd34106ecac6e5` |
| [LAB-FRIENDLY] | [Agent-friendly environments](https://agentart.work/documents/projects-agent-handoff-studies-2026-10-04-agent-friendly-environments.json), source revision `sha256:7cf10020d14affc65f0a7b75ce11447aef3f1356b8bc8743b9484e5853130526` |
| [LAB-EXEC] | [Native tools and execution prerequisites](https://agentart.work/documents/projects-thought-studies-2026-10-01-native-explicit-execution.json), source revision `sha256:79a790f6f3af7bb7e866d3ebcb584046e30dd1c386c24ff64adaec3876ac1fae` |
| [LAB-PULSE] | [Pulse document access](https://agentart.work/documents/projects-pulse-studies-2026-09-28-document-access.json), source revision `sha256:e115e5c87003c7337b2d3dc0966a277cae73d9a3bcff724b730df1e2d060c75f` |

The Lab sources above were fetched on 2026-10-17 through their complete JSON downloads and checked against the published index for envelope/source identities, revisions, byte lengths and SHA-256 digests. This identifies the received text relative to that index, not independent authenticity or verification of the historical runtime reports. Lab records distinguish reported canaries, fixtures, directly checked acquisition and unrun proposals; their guidance does not establish universal reliability or intentional participation. [LAB-HANDOFF]'s dated reassessment sets aside its separate reading-helper library, not this broader candidate protocol.

## Reuse

No reuse license has been selected. Research references identify their sources;
they do not grant rights to third-party texts, artwork or private records.
No raw private transcripts, credentials or artwork are imported here.

## v0.1 draft continuation, 2026-10-17

The operator requested a [v0.1 scope](spec/0.1/SCOPE.md),
[contract draft](spec/0.1/CONTRACT.md) and two example histories. They develop
the candidate architecture locally without modifying the pinned WILL source
or its digest. THOUGHT's added trace and the invented OPEN FIELD graphic work
are hypothetical design examples, not new observations, published artist rules
or live-client evidence. Exact wire encoding and implementation choices remain
open. No implementation, trial, release or new verification of external sources
was performed for this documentation revision.

## Scope clarification, 2026-10-18

The operator selected curator-Agent bridges, participation evidence and
verification as the protocol's scope. Artists build their website/app,
conditions and renderer, integrating reusable shared bridges and verification
with artwork-specific claims/checks. Minting admission, including accepting
unattested works or requiring evidence, remains with a consuming contract.

The architecture, v0.1 drafts and hypothetical examples were revised to separate
participation acceptance, claim-scoped verification, artifact/presentation checks
and external publication. Operator receipts retain their limited meaning;
execution-origin and consequence claims need their own bound material and
qualified procedures. No stronger origin mechanism, universal mint-approval
rule, paid-Agent eligibility condition or chain was selected by this revision.

The preserved WILL source, its digest and the dated research reports remain
unchanged. This is a local documentation revision, not implementation, client
qualification, live evidence, contract migration, publication or deployment.

## Comprehensive design review, 2026-10-18

The operator requested another deep review before implementation. The new
[participation and evidence design review](research/2026-10-18-participation-evidence-design-review.md)
applies the selected scope to bridge qualification, exact authority/content
bindings, acceptance and media retention, execution evidence, consequence,
portable assessments, privacy and failure recovery. It includes THOUGHT and
the hypothetical OPEN FIELD as designed traces, not observed encounters.

Primary documentation was reviewed on 2026-10-18 and is linked beside the
relevant findings. These sources include MCP revision 2026-07-28, current A2A
and Claude Code documentation, RFCs, SVG 2, and the documented evidence formats
and execution-proof mechanisms. Mutable documentation describes capabilities
and limits as reviewed; it is not an observation of an installed client or a
verified provider integration. No provider invocation or live Agent trial was
performed. Parallel bridge, evidence and semantics reviews informed the report.

The report identifies remaining origin and native-client recovery gaps and
proposes narrower contract semantics. It does not adopt those proposals into
the architecture or v0.1 contract, rewrite the earlier dated research, or
establish implementation readiness. The preserved WILL source and its digest
remain unchanged. This work is local documentation, not publication.

## Local MVP continuation, 2026-10-18

After reviewing the proposed execution claim, the operator requested a working
MVP and walkthrough. The [local participation study](mvp/README.md) implements
a THOUGHT-inspired text profile, a loopback participation service, a fresh
Claude Code session through local stdio MCP, durable submissions and limited
export checking. This is new prototype work, separate from production THOUGHT
and from the proposed remote HTTP/OAuth reference path.

The [qualification record](mvp/QUALIFICATION.md) separates synthetic integration
tests, browser observations and any actual client encounter. Local receipts and
runtime declarations retain their original trust limits. This work supplies
no independently grounded execution proof or protocol conformance certificate,
and does not select a mint policy, license or deployment. Earlier research and
the preserved WILL source remain unchanged.

## Discussion record and project walkthroughs, 2026-10-19

The operator asked to record both settled and still-discussed ideas before
walking through projects to understand protocol usage. The new
[discussion record](DISCUSSION.md) separates working agreements, proposals,
open questions, experiments and bounded findings. In particular, the proposed
execution threshold remains unresolved, and requesting an MVP did not ratify
the generic contract. This record adds no implementation requirement.

The [project walkthrough guide](examples/PROJECT-WALKTHROUGHS.md) preserves the
preceding read-only comparison of existing THOUGHT and signatures.gallery's
preview. That comparison inspected served pages/scripts, public discovery and
pinned source, with the source and deployment limits recorded beside the
findings. It did not complete a new UI/Agent encounter or examine minting.
The existing THOUGHT application, hypothetical protocol trace and local MVP
remain separate. The invented OPEN FIELD remains a paper example.

Recording these findings performs no new runtime trial, artwork migration,
publication or deployment. Project encounters can revise the candidate
design; the preserved WILL source, its digest and dated research reports
remain unchanged.

## Local Lab reading pilot, 2026-10-19

After discussing reuse of the curator-Agent bridge for documentation reading,
the operator explicitly requested a local prototype on Agent Art Lab. The
[pilot](pilot/README.md) uses an isolated Lab clone and a preserved consumer
patch, leaving the original checkout and live publication unchanged. Lab source
format and reading policy remain with that consumer; reusable client handling,
local task delivery, acceptance and inspection live in this repository.

The [qualification record](pilot/QUALIFICATION.md) separates source inspection,
synthetic checks, public acquisition and one actual scoped Claude Code reading
through the local browser form. The earlier fresh-subagent reading baseline is
a separate controlled transfer, not an external desktop handoff qualification.
The former copy-helper reassessment and all historical evidence remain intact.
The prototype does not establish that reading is Agent Art or select a generic
protocol revision, distribution model, publication or deployment.

### Flow correction, later on 2026-10-19

The operator clarified that the website should hand the Lab context to the
visitor's own Agent; the visitor then asks questions there. This supersedes
the earlier website Q&A experience as the pilot's intended flow, without
erasing its actual CLI trial, source-acquisition checks or other observations.
Those remain a dated experiment in the [qualification record](pilot/QUALIFICATION.md).

The revised candidate distinguishes a new desktop conversation with a prepared
context draft from manual copying into an existing conversation. It provides
no automatic private-history attachment, website question or answer collection,
background inference or answer callback. Native URL handlers and actual draft
placement require separate per-client qualification; earlier CLI or synthetic
results are not relabeled as desktop evidence. The Lab continues to own its
sources and reading policy. No production publication or deployment follows
from this correction.

Subsequent local checks of that revised candidate observed the complete unsent
context in Claude desktop and cleared the owned draft. The Codex native open
was accepted, but direct composer inspection was blocked by the active
computer-use rule; neither visible draft placement nor its cleanup is claimed.
The [qualification record](pilot/QUALIFICATION.md) separates these observations,
revised browser checks and 42 passing synthetic tests, including 22 retained
tests of the superseded engine/client. Opens used the local helper, so these
checks do not qualify production browser protocol prompts. No Send action,
Agent reading, publication or deployment was requested by these checks.

## One protocol implementation direction, 2026-10-19

The operator selected documentation reading at Inshell, the Lab, Pulse and
Signatures Gallery as dogfooding for the same protocol used for THOUGHT and
Signatures' preview participation, then authorized development starting with
**Lab reading and THOUGHT**. The remaining uses are future targets. This
direction supersedes the earlier design-only restriction for the bounded
local implementation; it does not authorize deployment, publication or minting.

The [implementation note](spec/0.1/IMPLEMENTATION.md) records a capability-based
revision: a Work identifies intended context and conditions; `handoff` can
produce zero observed Acts, while `participation` records and any consequence
claim retain their applicable attribution, preservation and checking duties.
No application selection fabricates a verified Agent identity. The core and
consumer interfaces are experimental, and Agent execution origin remains
unestablished. These are new design/implementation choices, not retroactive
findings in the preserved WILL synthesis or dated research.

Consumer changes are prepared in isolated local clones or worktrees. Earlier
Lab reading, native handoff and participation-MVP observations retain their
own scope and do not qualify the new integrations. Actual runtime results
must identify the checked candidate and observation boundary separately.

## Private draft SDK continuation, 2026-10-19

The operator subsequently requested a draft/MVP SDK and a source push. The
existing experimental core was packaged as private
`@agent-art/protocol@0.1.0-alpha.0`, with typed root and client-handoff entry
points and an explicit runtime file allowlist. The Lab and THOUGHT local
consumers use that packaged code. This is a source/package boundary change,
not stronger participation evidence, universal client support or a new Agent
runtime. THOUGHT's existing return service and work-specific rules remain
with THOUGHT. The [qualification record](pilot/PROTOCOL-QUALIFICATION.md)
separates package installation and consumer checks from earlier trial results.

The requested push targets the existing private repository on a feature
branch. No registry release, visibility change, reuse license, deployment or
new paid Agent trial is selected. The preserved WILL references and dated
research remain unchanged.

## Reading SDK 0.1.0 continuation, 2026-10-19

The operator subsequently selected a reading-first release: apply one SDK to
the existing documentation-reading uses at Inshell, Agent Art Lab, Pulse and
Signatures Gallery, then add larger artwork participation in a later compatible
release. New THOUGHT work is deferred. The alpha's earlier factories, receipt
verification and experiments remain experimental paths with their original
limits; they are not rewritten as findings for this release.

Private `@agent-art/protocol@0.1.0` adds the reusable browser reading interface,
controller/styles and optional caller-observed receipts. Its archive SHA-256
is `646b91e68a8ea175ca4a75f8d2af48fb7e41498798c1744726479e2b91a13af0`.
Four consumer integrations are prepared in isolated local clones. Their
[patches/metadata](pilot/reading-consumers/README.md) retain source identities,
dependency/archive locks and consumer-owned prompt boundaries. Original
checkouts and deployed sites are unchanged. This is local package/application
work, not registry publication, licensing or deployment.

The [reading contract](spec/0.1/READING.md) records the selected release boundary:
a public Work frame, zero required Agent Acts and opt-in operational evidence.
The SDK does not acquire sources, inspect conversations or enforce the Agent's
reading policy. Questions and answers remain inside the visitor's Agent.
Unsigned receipts support only their named local observations, under caller
trust; no new execution-origin mechanism was added.

The [reading qualification](pilot/reading-consumers/QUALIFICATION.md) records
27 SDK tests, installed-declaration checking and actual browser regression
checks separately from earlier aggregate suites. A one-time Lab-to-Claude
Open in regular Chrome was observed as a fresh conversation containing the
public Lab context, without full composer-byte verification, Send or inference.
Automatic approval review blocked draft cleanup because field ownership was
uncertain; the user chose manual cleanup. No tool-verified cleanup result is
claimed. These observations do not establish that an Agent read any source.

The preserved WILL source/hash and all earlier dated research remain unchanged.
The broader Work/Participant/Act/Relation architecture stays candidate, with
artistic participation and mint policy boundaries intact.
