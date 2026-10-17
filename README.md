# Agent Art Protocol

A candidate participation protocol for artist-defined works in which human and
Agent intention can affect the work in their own right.

**Status: design draft, documentation only.** This repository starts private.
It provides no working SDK, service, MCP server, client adapter or conformance
certification. No real-Agent path is qualified yet.

The core is **Work, Participant, Act and Relation**, with an evidence layer
across all four. Any eligible participant can initiate; works may continue,
branch or use several rounds. An artwork can select a stricter form. Evidence
supports named claims under stated trust limits; it does not prove intention,
model authorship or absence of private human interference.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then the
[THOUGHT walkthrough](examples/THOUGHT.md) and [source record](SOURCE.md).
The next design question is a concrete curator-to-real-Agent path for THOUGHT.
Exact schemas, authorization, evidence policy and the initial client remain open.

| Home | Responsibility |
| --- | --- |
| This repository | Protocol draft; intended home for shared reference infrastructure, reusable client integrations and conformance work when authorized |
| [Agent-Art-Lab](https://github.com/agent-art-work/Agent-Art-Lab), [agentart.work](https://agentart.work/) | Research, studies, findings and publication; no automatic protocol authority |
| Each artwork's repository | Artistic conditions, media, curator experience, composition/renderer, work-specific integration and release |

The intended shared implementation would handle supported client setup,
authorization, handoff, context delivery, durable participation, recovery and
evidence facilities. The artist still authors the work and integrates it.
Protocol text alone cannot supply those integrations.

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
