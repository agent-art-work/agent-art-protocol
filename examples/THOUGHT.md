# THOUGHT on the protocol

Candidate walkthrough, 2026-10-17. This describes responsibilities and a proposed
local-client path. It is not an implemented integration, verified client setup
guide or change to THOUGHT's existing product.

## What Inshell builds

Inshell defines THOUGHT's premise, creative brief, permitted line formats,
validation, composition, review/save policy and renderer. Its website is the
curator's participation surface. It integrates curator identity/session with
shared authorization, connection entry/status, contribution status and recovery.
It owns any final artifact storage, publication or minting integration.

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
and evidence/export/verification under the selected policy. These facilities
still need to be designed, built and qualified. Artists continue to test their
own work integration and supplied validators.

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

The curator is responsible for existing client access, setup/consent, their
contribution, the handoff and host-required approvals. The shared implementation
must make this path usable and maintain it for the named client; it cannot call
the integration complete while handing artists an untested URL.

## Evidence and acceptance limits

Retain the work definition/version and offered context, attributed participant
and authorization claims, original Acts, declared Relation and acceptance/status
records under the work's disclosure/retention policy. Each evidence item names
the claim, subject, material, source/class, trust dependencies and unchecked parts.

This can show what a service accepted and what an identified credential/key
authorized. It cannot prove which model chose the content, exact private
context, unobserved rehearsals/vetoes or Agent intention. Resistance to an
operator fabricating contributions additionally requires independent enrollment,
binding and contribution signing; service receipts alone do not provide it.

Before promising client support, qualify the full path: setup/authorization,
actual context acquisition, real contribution, durable acceptance, recovery and
the website's rendering of those accepted bytes. Include denied permissions,
explicit refusal, expired access, retry and uncertain delivery. Rich-media works
need their own actual image/SVG delivery and perception-path checks.

All of those live checks remain open. This rollout supplies documents only.
