# Experimental implementation boundary

Authorized 2026-10-19. This is a bounded implementation of candidate protocol
semantics, not a v0.1 release, conformance certificate or production rollout.
The earlier architecture, design gates and dated research retain their
evidence limits. This note supersedes their design-only restriction only for
the operator-directed local work below.

## One protocol, two first consumers

The protocol keeps **Work, Participant, Act and Relation**, with evidence
across them. Its two practical responsibilities are connecting a curator's
real Agent environment and preserving/checking limited evidence. It does not
operate the Agent's model or take ownership of artistic interpretation.

The selected dogfooding direction eventually includes reading at Inshell,
Agent-Art-Lab, Pulse and Signatures Gallery, plus THOUGHT and Signatures'
preview participation. This step implements **Lab reading and THOUGHT only**.
The remaining uses are future targets. No mint, wallet, chain operation,
production publication or deployment is part of this step.

| First consumer | Work and capability | Participation and evidence boundary |
| --- | --- | --- |
| Lab reading | Versioned purpose, public context and reading conditions; `handoff` | Carry context into a chosen Agent or provide manual copying. Participants, Acts and Relations may remain empty. An open request is an observation, not Agent enrollment, execution or a reading result. Questions and answers stay inside the Agent. |
| THOUGHT | Artistic conditions and identified encounter; `handoff` plus `participation` | Preserve original attributed contributions and their Relations. The artwork owns the renderer and consequence checker. Check exact retained material and its application without upgrading it to proof of Agent origin or private intention. |

Work means the declared participation frame, not an automatically completed
artifact or registered chat. A declaration may refer to live sources; a mutable
index URL alone does not identify retrieved bytes. An encounter reference is
needed when retained contributions must be kept together and distinguished
from other encounters, not merely because a visitor copies public context.

Artistic participation still needs consequential room for Agent choice and
visible attribution/intervention rules. Reading is not thereby Agent Art.
Optional recording never permits a consumer to claim a missing Agent Act or
artifact consequence. Direction, rounds, branching and completion remain
Work-defined rather than imposed by the protocol.

## Shared implementation and consumer ownership

The experimental [core interface](../../protocol/README.md) uses the exact
capability names `handoff` and `participation`. It defines and checks Work,
Participant, Act and Relation records, optional observations/artifacts and
integrity envelopes. Its export names, JSON shapes and encoding are local
experimental choices; the candidate contract is not a stable wire standard.

### Private draft SDK packaging

The operator subsequently requested an installable draft SDK and a source
push. The existing core is packaged as private
`@agent-art/protocol@0.1.0-alpha.0`, without registry publication or deployment.
From the repository root, `npm run sdk:pack` prepares
`.local/sdk/agent-art-protocol-0.1.0-alpha.0.tgz`; `npm run test:sdk` exercises
the package boundary. Consumer installation and actual packaging results are
qualified separately from the earlier source-module observations. The
[SDK instructions](../../protocol/README.md) describe the package entry point.

The actual archive passed clean-consumer installation/import checks, and both
isolated consumers exercised the installed runtime and declarations. The
[qualification record](../../pilot/PROTOCOL-QUALIFICATION.md) preserves the
tarball digest, 17 protocol/package tests, 75-test root rerun and bounded
package-specific browser checks. Those results establish the recorded local
package path; they do not add an Agent-origin attestation or registry release.

Packaging does not add callback hosting, authentication, authorization,
durable storage, model inference or independent Agent-origin guarantees.
The package alpha version does not ratify the candidate protocol/schema,
choose a reuse license or qualify every runtime path. Source pushing is the
operator's later direction; it is not an outcome of the earlier consumer trials.

Lab owns its existing documents, index, reading policy and authored invitation.
The consumer adds a thin integration rather than a second knowledge corpus.
Shared client adapters own prepared native handoffs and their honest manual
fallback. An application choice must not silently create a verified Agent
identity. New-conversation opening and manual context transfer into an
existing conversation remain different operations.

THOUGHT owns its brief, creative constraints, original inputs, renderer and
work-specific consequence checking. A protocol adapter must not silently
replace its successful client path, reinterpret its original content or turn
a curator's later selection into an Agent decision. Shared records and checks
support these work-owned rules rather than implementing a new artist platform.

Consumers are developed in isolated local clones or worktrees; source identity
and consumer changes remain reviewable. Their production repositories and
live sites are not changed by this authorization. The local helper is a
development mechanism, not qualification of direct browser-to-app delivery
or a decision about production installation and hosting.

## Claims and qualification

An integrity seal and deterministic verification can expose changed retained
bytes and inconsistent references under the implemented method. They are
unsigned, recomputable data structures under local operator trust. They do
not prevent the operator from fabricating and resealing a coherent record.
Service assertions and attributed Participant claims remain separate from
independent origin evidence.

Verification must report the absence of Agent contributions and consequence
material honestly. An optional artwork checker can evaluate a declared effect
against the identified contributions, rules and artifact. This does not prove
what a model perceived, who selected an output or whether private intervention
occurred. **Agent execution origin remains unestablished** in this experiment.
No blanket genuineness or artistic-value result is supplied.

Implementation checks should distinguish core fixtures, consumer integration,
browser display, actual native draft placement, real Agent execution and
independently grounded origin. Earlier Lab handoff observations in
[pilot qualification](../../pilot/QUALIFICATION.md) and the older
[participation MVP](../../mvp/QUALIFICATION.md) do not automatically qualify
these new consumer integrations. A simulated contribution remains simulated;
opening a client does not qualify a contribution path.

Current runtime results must be recorded after checking the actual candidate.
This authorization supplies no successful-trial finding, generic client
support, independently rooted execution proof or permission to publish.

The [shared-consumer qualification record](../../pilot/PROTOCOL-QUALIFICATION.md)
now separates the observed synthetic suites, Lab handoff, THOUGHT fixture
return/save/load and local build checks. After explicit approval, one bounded
real Claude Code generation also passed the original validator, harness-run
HTTP delivery, browser preservation and owner consequence checks. Generation
and delivery were separate: this does not qualify autonomous client HTTP
execution or a desktop handoff. Execution origin remains unestablished under
the shared verifier, and fixture content remains identified as synthetic.
