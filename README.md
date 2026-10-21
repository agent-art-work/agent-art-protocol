# Agent Art Protocol

A candidate protocol for connecting users' real Agent environments and
preserving claim-scoped evidence. Its artistic purpose is to support works
in which human and Agent intention can have consequential standing.

**Current local SDK candidate: private `@agent-art/protocol@0.1.4`, focused on
documentation reading.** It retains the Quiet field default and refines action
underlines, the Copy glyph and brief inline clipboard feedback. About,
ChatGPT, Claude and Copy remain separate actions. This is local candidate
work; SDK 0.1.2 and 0.1.3 archives and historical results are unchanged.
The reusable **Ask your Agent component** carries a site's public
context into the visitor's Agent; the visitor asks and continues there.
The SDK performs no inference and collects no questions, answers or private
history. Existing conversations use manual copying and pasting.

This is one evolving protocol. The generic architecture remains candidate;
new artwork participation work, including THOUGHT, is deferred to a later
compatible release. Earlier alpha/core APIs remain experimental and their
observations are preserved. Reading uses **Work** and optional operational
evidence with zero Participants, Acts and Relations; it is not thereby art.

## Install and integrate

Run `npm run sdk:pack` to create
`.local/sdk/agent-art-protocol-0.1.4.tgz`. Copy it into the consuming project's
`vendor/` directory and install its relative file dependency:

```sh
npm install ./vendor/agent-art-protocol-0.1.4.tgz --ignore-scripts
```

Use the application's existing package manager and retain its dependency lock.
The archive has no runtime dependencies or lifecycle scripts. The package
remains private; no registry publication or reuse license is selected.

The developer supplies a versioned Work with the exact public invitation,
source/index references and authored reading policy, then mounts the shared
interface or uses the headless controller:

| Entry point | Purpose |
| --- | --- |
| `@agent-art/protocol/reading-ui` | Compact Quiet field component: Ask your Agent ⓘ About link, ChatGPT desktop prefill, Claude and always-visible Copy |
| `@agent-art/protocol/reading.css` | Component styles with supported theme hooks for colors, font family and radius |
| `@agent-art/protocol/reading` | Frozen reading frame, prepared routes and optional bounded receipts for a custom UI |
| `@agent-art/protocol`, `/clients` | Existing factories, per-claim checks and native URL builder; wider participation APIs remain experimental |

See the [SDK installation/API guide](protocol/README.md) and
[reading release contract](spec/0.1/READING.md). Public reading requires no
additional backend, local helper, account, enrollment, callback or evidence database.
Receipts are opt-in; adopting persistent storage is not a protocol requirement.

The SDK owns the component's mark and structure; each site controls theme and
placement. See the [styling boundary and supported CSS variables](spec/0.1/COMPONENT.md).

Since 0.1.2 the mark, label and ⓘ link to
[What is Ask your Agent?](https://agentart.work/ask-your-agent/). This identity
link is separate from the two Agent links and Copy, and carries no Work/prompt
query. Lab owns the explanation page. The historical 0.1.2 archive SHA-256 is
`0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5`;
its [qualification](pilot/reading-sdk-012/) is separate from the preserved 0.1.1 record.

The preserved 0.1.3 local candidate added independent signal, frame, label-field, mark and
Copy-icon colors through the [public presentation contract](spec/0.1/COMPONENT.md#quiet-field-default-in-the-013-local-candidate).
The 0.1.4 candidate retains those hooks and adds
[bounded inline Copy feedback](spec/0.1/COMPONENT.md#action-and-copy-feedback-in-the-014-local-candidate)
without adding public options or changing context/native routes.
SDK geometry and responsive fit remain shared. Its own fresh archive and
consumer lock require browser qualification, including Copy fitting a 257px
container in a 320px viewport with system fonts. Neither a changed source tree
nor an earlier archive's passing check establishes that qualification. No
native trial, registry publication, site rollout or deployment follows from
this local presentation work.

## Current consumer and checks

**Lab is the single active site integration for SDK 0.1.2.** Run:

```sh
npm run pilot:lab
```

Open [the local Lab preview](http://127.0.0.1:4174/). The application imports
`mountReading` and the packaged stylesheet; the component is now in the SDK,
with no separate presentation wrapper. Public sites need no helper. This
local preview optionally supplies a read-only Mac availability callback; the
SDK itself does not probe installed applications or fetch discovery endpoints.
Without a host callback it offers configured desktop links without claiming
that those apps are installed. Copy is always present.

ChatGPT keeps the existing `codex://new?prompt=…` desktop route and internal
`codex-app` identity; Claude deliberately uses its Chat-prefill endpoint.
The ChatGPT route sends no Chat/Work/Codex selector. See
[native destinations and publisher formatting](pilot/reading-sdk/NATIVE-HANDOFF.md).
Earlier operator reports found a Codex draft in one setup and Work in another,
even after selecting Chat. These observations do not establish a universal
routing rule. Users review the app mode and draft before sending.

The [current integration and qualification](pilot/reading-sdk-012/README.md) pin
the fresh archive, consumer lock and checks. The SDK is private; its archive
SHA-256 is `0a535238ad9eaecd973fa8127b7d24f745ca502908ad1f7377654ecdd8bdcfa5`.
The earlier [four-consumer integrations](pilot/reading-consumers/README.md) and
[local design trials](pilot/open-gate/README.md) remain historical records.
They are not maintained as four active development apps. Original owner
checkouts and public sites were unchanged by those isolated trials; the later
Lab-owned rollout is recorded below.

`npm run test:sdk` checks the SDK's core, reading and package contracts. The
[current qualification](pilot/reading-sdk-012/QUALIFICATION.json) separates package,
Lab and browser fixture checks from earlier live native-client observations.
A requested handoff does not prove arrival, reading or Agent execution.

The [reading interoperability test bench](test-bench/README.md) adds a local
developer surface and separate browser/real-client reports for the exact Lab
invitation. Run `npm run bench`; `npm run bench:browser` checks the installed
SDK without launching native clients. Desktop observations are operator-assisted
and retain their source, versions and per-stage outcomes. The
[initial findings](test-bench/QUALIFICATION.md) include a narrow default-font
layout failure, Claude's visible orientation with raw-download failure, and an
operator-reported Codex draft kept unsent. These extend test infrastructure;
THOUGHT and new artwork participation remain deferred.

The operator subsequently requested [four-site dogfooding](pilot/dogfood-0.1.1/README.md).
Those current-release integrations are prepared separately for review; they do
not change the tagged SDK archive or imply publication/deployment. Lab remains
the SDK reference dev entry.

On 2026-10-21 the operator authorized Lab's site rollout, and the Lab session
subsequently reported deployment and live checks completed at
[agentart.work](https://agentart.work/), using unchanged SDK 0.1.1. Those are
Lab-owned release findings; this does not release the protocol/npm package or
another site's integration. See the
[Lab rollout record](pilot/dogfood-0.1.1/README.md#lab-rollout-completed-2026-10-21).

Lab subsequently released the 0.1.2 identity link and
[What is Ask your Agent?](https://agentart.work/ask-your-agent/) page via PR #10.
Its owner reports live About-link, asset and document checks passed. See the
[0.1.2 rollout and qualification](pilot/reading-sdk-012/README.md#lab-site-rollout-completed).
The Lab release uses the exact qualified vendored archive. The operator has
also authorized committing and pushing the 0.1.2 source update on its feature
branch; creating a 0.1.2 tag or merging to main is a separate step.

## Wider protocol and earlier experiments

The [discussion record](DISCUSSION.md) distinguishes working agreements,
proposals and findings. The [local participation MVP](mvp/README.md), earlier
[Lab/THOUGHT alpha qualification](pilot/PROTOCOL-QUALIFICATION.md), and
[project walkthroughs](examples/PROJECT-WALKTHROUGHS.md) retain their original
scope. They do not qualify new release clients or settle independent Agent
execution evidence. THOUGHT still owns its return endpoint, authorization,
durable acceptance/recovery, creative conditions and renderer; a shared
participation return service is unfinished.

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

The implementation remains bounded. Signatures' preview participation and new
THOUGHT participation work are later-release targets. Generic encoding,
authorization, retention, cross-client support and stronger execution evidence
remain open. Claude Code on macOS via remote HTTP MCP/OAuth is still an
unqualified proposal. The execution claim and acceptable trust remain in
discussion; local recording and integrity checks cannot settle them.

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
No managed Agent runtime, hosting platform or license is selected by this rollout.

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
claim-scoped evidence and verification, but select no stronger origin mechanism.
The dated research itself supplies no runtime qualification and retains its
original findings and limits.

[Choosing the first infrastructure](research/2026-10-17-infrastructure-pivot.md)
compares curator-supplied Agents, artist-defined Agents and existing-runtime
adapters against their adoption costs, artistic relationships and evidence
limits. Its dated recommendations remain research. The current architecture and
v0.1 drafts record the subsequent scope clarification without selecting a hosted
Agent platform or mint policy. Current bounded client observations are recorded
separately from that research.
