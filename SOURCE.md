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
