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
