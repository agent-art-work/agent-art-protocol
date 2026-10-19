# Agent Art Protocol

A candidate participation protocol for artist-defined works in which human and
Agent intention can affect the work in their own right.

**Status: candidate protocol design with a local MVP.** This repository starts
private. The [local participation study](mvp/README.md) supplies a curator
surface, local service, stdio MCP adapter and limited evidence checker. It is
not a released SDK or protocol certification; the proposed remote HTTP/OAuth
path and independent execution-origin evidence remain unqualified.

The protocol is not frozen. [Decisions and open discussion](DISCUSSION.md)
separates the working agreements, proposals, unresolved questions and MVP
findings. The [project walkthrough guide](examples/PROJECT-WALKTHROUGHS.md)
starts with existing THOUGHT and Signatures' preview so actual artworks can
inform the design.

To walk through the MVP, run `npm run dev` and open
[the local surface](http://127.0.0.1:4173/). An installed, authenticated Claude
Code client is required for the real Agent step. The page never fabricates an
Agent reply. See [bounded qualification](mvp/QUALIFICATION.md) for checks and
limits.

The selected scope, clarified 2026-10-18, is **curator-Agent bridges,
participation evidence and verification**. Artists build their artwork's
website/app, conditions and renderer, integrating shared bridges and checks.
Whether a later mint accepts unattested works or requires particular evidence
is the consuming contract's policy, outside the participation core.

The core is **Work, Participant, Act and Relation**, with an evidence layer
across all four. Any eligible participant can initiate; works may continue,
branch or use several rounds. An artwork can select a stricter form. Evidence
supports named claims under stated trust limits. Credentials and operator
receipts alone do not establish Agent execution; stronger origin claims need
a qualified evidence path. Private intention and unobserved intervention are
not certified by a blanket genuineness flag.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then the candidate
[v0.1 scope](spec/0.1/SCOPE.md) and [contract draft](spec/0.1/CONTRACT.md).
The [THOUGHT walkthrough](examples/THOUGHT.md) and hypothetical
[OPEN FIELD graphic work](examples/OPEN-FIELD.md) use the same contract for
human-first and Agent-initiated participation. Their histories are invented
design examples, not live runs. [SOURCE.md](SOURCE.md) records prior research.

The next activity is to walk through projects, identify what artists and
curators gain or must do, and refine the scope/contract with those findings.
A concrete curator-to-real-Agent bridge still needs exact evidence bindings,
verification claims/methods, trust dependencies, encoding, authorization and
retention before full implementation. Claude Code on macOS via HTTP MCP/OAuth
remains a proposed target; support and its execution-evidence path are
unqualified. The execution claim and acceptable trust are still in discussion.

| Home | Responsibility |
| --- | --- |
| This repository | Protocol draft; intended home for shared reference infrastructure, reusable client integrations and conformance work when authorized |
| [Agent-Art-Lab](https://github.com/agent-art-work/Agent-Art-Lab), [agentart.work](https://agentart.work/) | Research, studies, findings and publication; no automatic protocol authority |
| Each artwork's repository | Artistic conditions, media, curator experience, composition/renderer, work-specific integration and release |

The intended shared implementation would handle qualified client setup,
authorization, handoff, context/media delivery, durable participation, recovery,
evidence capture/export and reusable verification. Artists supply art-specific
claims/checks and the rules, inputs and artifact material needed to evaluate
them. Participation acceptance, per-claim verification, artifact/display checks
and mint success remain distinct. Protocol text alone supplies none of these
working integrations.

Keep the initial work together in this repository. Separate SDK/service repos
are deferred until there is a demonstrated packaging or maintenance need.
No runtime stack, managed hosting or license is selected by this rollout.

The generic design was developed in WILL and separated here on 2026-10-17.
[SOURCE.md](SOURCE.md) pins the complete prior synthesis and research attribution;
WILL-specific specifications remain with WILL.

Documentation checks currently comprise source/hash comparison, local Markdown
link resolution, UTF-8/LF and whitespace checks, and publication review. They
are not protocol conformance or client qualification tests.

No reuse license has been selected.

## Participation evidence research

[Design review of the participation and evidence path](research/2026-10-18-participation-evidence-design-review.md)
reviews the selected scope end to end: actual-client feasibility, authority,
durable Acts/media, execution evidence, consequence, verification, privacy and
failure recovery. It includes two complete paper paths and concrete design
recommendations. The native client's execution-evidence and durable-submission
mechanisms remain unqualified. Proposed contract changes are recommendations,
not adopted semantics or implementation.

[Evidence for Agent participation and its consequence](research/2026-10-17-participation-evidence.md)
examines execution origin, fabrication/tampering, independent verification and
application to the work. It identifies where the operator-trusted v0.1 draft
falls short of the stronger evidence requirement. The current drafts incorporate
claim-scoped evidence and verification, but select no stronger origin mechanism
and provide no runtime qualification. The dated research retains its original
findings and limits.

[Choosing the first infrastructure](research/2026-10-17-infrastructure-pivot.md)
compares curator-supplied Agents, artist-defined Agents and existing-runtime
adapters against their adoption costs, artistic relationships and evidence
limits. Its dated recommendations remain research. The current architecture and
v0.1 drafts record the subsequent scope clarification without selecting a hosted
Agent platform, mint policy or implemented client path.
