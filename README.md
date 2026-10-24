# Agent Art Protocol

Connect a website to a visitor's own Agent, and preserve evidence with explicit
claims and limits. The larger purpose is Agent Art: works in which human and
Agent intention can both have consequential standing.

**Reading alpha: 0.1.5-alpha.1.**
Original project code and documentation use the [MIT License](LICENSE), with
the [source and third-party boundaries](LICENSING.md) described separately.
The reading SDK is **`@agent-art/protocol@0.1.5-alpha.1`**; see its
[integration guide](releases/0.1.5-alpha.1/README.md),
[release notes](releases/0.1.5-alpha.1/RELEASE-NOTES.md) and
[qualification](releases/0.1.5-alpha.1/QUALIFICATION.json).
Get the [GitHub prerelease](https://github.com/agent-art-work/agent-art-protocol/releases/tag/v0.1.5-alpha.1).
The 0.1.4 source, archive and tag remain unchanged. The broader protocol remains
candidate; this release qualifies the bounded reading SDK, not a finished standard.

## What you can use today

The **Ask your Agent component** hands a site's public reading context to the
visitor's Agent. The visitor asks questions and continues the conversation
there. The site supplies the invitation and source policy; the SDK supplies
the component, native link preparation, Copy and optional bounded receipts.

| Part | Status and boundary |
| --- | --- |
| Reading SDK and component | MIT-licensed 0.1.5-alpha.1 archive; runtime/type bytes retained from 0.1.4; checks tied to the new archive |
| Client handoff | ChatGPT desktop route, Claude desktop route and always-visible Copy; actual destination and behavior depend on the installed client |
| Generic participation protocol | Candidate architecture and contract; wider alpha APIs are experimental |
| Developer test bench | Browser checks plus experimental Agent-operated desktop testing; full runner qualification has not passed |
| THOUGHT and other artworks | Design examples and earlier isolated experiments; new artwork support is deferred |

Reading requires no additional server, local helper, Agent registration, model
API, answer callback or evidence database. The SDK performs no inference,
source retrieval or conversation inspection. A source reference identifies a
location; it does not establish that an Agent fetched or read it.

## Try the reading SDK

Download the [versioned SDK archive](https://github.com/agent-art-work/agent-art-protocol/releases/download/v0.1.5-alpha.1/agent-art-protocol-0.1.5-alpha.1.tgz),
place it in your application's `vendor/` directory, then install with that
application's package manager. Package tooling requires Node.js 22 or later.

```sh
npm install ./vendor/agent-art-protocol-0.1.5-alpha.1.tgz --ignore-scripts
```

Keep the dependency lock. Registry publication is not selected; install the
release archive. It has no runtime dependencies or lifecycle scripts.
Its retained SHA-256 is
`5989cfb0eec3fd35df4a583df460696a35643c83a190708458e8b8b0796f7f55`.
The [alpha qualification](releases/0.1.5-alpha.1/QUALIFICATION.json) records
its exact inputs. The package retains `private: true` to prevent accidental
npm publication; archive installs work normally. A changed package needs its
own archive and qualification. Earlier
[0.1.4 findings](pilot/reading-sdk-014/README.md) remain historical.

In a browser application with an ESM bundler:

```js
import { defineWork } from '@agent-art/protocol';
import { mountReading } from '@agent-art/protocol/reading-ui';
import '@agent-art/protocol/reading.css';

// Replace this example with your own public invitation and source policy.
const invitation = 'Read https://agentart.work/agent-index.json. '
  + 'Use the index to find relevant public sources. Report access failures. '
  + 'Confirm readiness; I will ask my questions in this conversation.';

const work = defineWork({
  id: 'https://agentart.work/#reading-example', version: '1',
  title: 'Read Agent Art Lab',
  purpose: 'Discuss public documentation in the visitor’s own Agent.',
  capabilities: ['handoff'],
  context: [
    { id: 'invitation', kind: 'text', mode: 'snapshot', text: invitation },
    { id: 'index', kind: 'reference', mode: 'live',
      url: 'https://agentart.work/agent-index.json' },
  ],
  conditions: { questionsAndAnswers: 'Stay inside the visitor’s Agent.' },
});

// Add <div id="ask-your-agent"></div> to your page.
const mounted = mountReading(document.querySelector('#ask-your-agent'), {
  work, evidence: false,
});
// Call mounted.destroy() when your framework unmounts the component.
```

The invitation above is illustrative, not the Lab's pinned test invitation.
The reading profile requires an exact retained text snapshot and at least one
public HTTPS DNS source reference. The SDK validates URL form without fetching
sources or checking DNS reachability.

The component has a separate identity/About link—mark, **Ask your Agent ⓘ**—and
three actions: **ChatGPT**, **Claude**, **Copy**. New-conversation links prepare
an unsent draft; the user reviews and sends it. Existing conversations use
Copy and manual paste. Links do not detect installed apps or bypass OS/client
permissions. The ChatGPT-labelled action retains the `codex://new` desktop
route; it does not force Chat, Work or Codex mode. Native clients can change
presentation or routing; qualification is specific to the observed versions.

The SDK owns the mark, structure and accessible behavior. Sites control theme
and placement through the [supported CSS variables](spec/0.1/COMPONENT.md).
For static sites, headless integration, manual fallback and receipt verification,
see the [alpha SDK guide](releases/0.1.5-alpha.1/README.md) and
[reading contract](spec/0.1/READING.md).

| Import | Use |
| --- | --- |
| `@agent-art/protocol/reading-ui` | `mountReading` and component lifecycle |
| `@agent-art/protocol/reading.css` | Shared structure and theme hooks |
| `@agent-art/protocol/reading` | `createReading` for a custom UI and optional receipts |
| `@agent-art/protocol`, `/clients` | Primitive factories, bounded verification and native URL preparation; wider participation APIs remain experimental |

## Protocol model and evidence

The four primitives are **Work** (framing and conditions), **Participant**
(attributed participant and authority), **Act** (a contribution or action) and
**Relation** (how those items connect). Evidence is a layer across them. There
is no universal human-first rule, fixed number of rounds or final synthesis.

Reading can use a Work with zero Participants, Acts and Relations. Receipts
are opt-in unsigned statements about observed browser actions; persistent
storage is the consumer's choice. A handoff receipt does not prove delivery,
Send, reading, model execution or artistic participation.

Artwork participation needs additional scoped authorization, retained
contributions and checks that show their consequence in the work. Those paths
remain experimental. Signatures and hashes can bind statements and detect
changes relative to retained material; they do not establish model authorship,
private intention or freedom from curator/host intervention. Verification names
each claim, its material, observer, trust dependencies and limits. There is no
blanket genuineness flag. Mint admission remains the consuming contract's policy.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), the
[v0.1 scope](spec/0.1/SCOPE.md) and [contract draft](spec/0.1/CONTRACT.md).
The [THOUGHT](examples/THOUGHT.md) and Agent-initiated
[OPEN FIELD](examples/OPEN-FIELD.md) histories are hypothetical design examples.
The [discussion record](DISCUSSION.md) separates agreements from open questions;
[SOURCE.md](SOURCE.md) preserves provenance and historical attribution.

## Check an integration

The [test bench](test-bench/README.md) is developer tooling, separate from the
visitor component. A developer supplies public context and expected outcomes;
their coding Agent uses existing permitted browser/native controls. Local
browser reuse needs no VM. Our dedicated VM isolates maintainer desktop tests.

```sh
npm run release:prepare
npm run release:browser
```

The release browser checks use the newly installed alpha archive in disposable
regular Chrome and cancel native launches. The standing experimental bench
continues to pin 0.1.4 for its unfinished runner work:

```sh
npm run sdk:prepare
npm run test:sdk
npm run test:bench
npm run bench
```

Open `http://127.0.0.1:4180/?lane=browser` for the local bench. To run the
controlled browser matrix with regular stable Google Chrome installed:

```sh
node test-bench/reading-profile.mjs browser test-bench/profiles/lab.json
```

The browser matrix cancels native launches. These commands do not submit an
Agent message. A real-client trial additionally requires explicit run authority,
account/device access and the [execution contract](test-bench/EXECUTION-CONTRACT.md).
The current guest-native automation is Lab-specific; declarative profiles do
not yet bind arbitrary application previews.

The [2026-10-24 desktop results](test-bench/results/2026-10-24-lab-three-case.json)
record three single-Send Lab → Claude cases with matching submitted rendering
and completed replies. One inspected an actual HTTP403 source failure; two
could not inspect source activity. The **three-consecutive-pass gate and full
runner MVP have not passed**, and successful source acquisition is unqualified.
Browser fixtures, operator reports and native observations retain separate
provenance. See [dated findings](test-bench/AGENT-QUALIFICATION.md) and the
[standing runner plan](test-bench/AGENT-RUNNER.md).

## Direction, ownership and release status

The [roadmap](ROADMAP.md) keeps reading first, runner qualification separate,
and consequential artwork participation in a later compatible release. The
[public-alpha audit and preparation gates](PUBLIC-ALPHA-AUDIT.md) records what
was inspected and what must be settled before publication.

This repository owns the protocol candidate and shared reference SDK/tooling.
[agentart.work](https://agentart.work/) owns research, publication and its
explanation page; each site/artwork owns its content, integration, artistic
rules and release. Lab is the single active local test consumer. Historical
four-site patches are isolated integration records, not current deployments
or support claims. The Lab owner separately released its site component;
that does not establish a protocol package release.

Release preparation is the current priority; runner development and new live
trials are on hold. [Operations copy](releases/0.1.5-alpha.1/OPERATIONS.md)
and the [release record](releases/0.1.5-alpha.1/RELEASE.md) support launch
coordination. Announcements and site deployment remain with their owners.

Original project code and documentation use [MIT](LICENSE). See
[licensing scope](LICENSING.md) for imported material, attribution and remaining
rights review. Historical tags and archives remain immutable; the retained
0.1.4 archive predates this adoption and contains no MIT license file. The
prepared 0.1.5-alpha.1 package includes MIT and new metadata with its own
archive and checks. Repository visibility, GitHub release, registry publication
and site deployment are separate decisions.
