# Ask your Agent — reading SDK alpha

`@agent-art/protocol@0.1.5-alpha.1` provides the framework-neutral **Ask your
Agent component**, a headless browser handoff controller and optional bounded
receipts. It is the public-document reading use case of the candidate Agent
Art Protocol. Reading is the implemented profile; the broader protocol and
artwork participation contract remain candidates.

The site offers context. The visitor opens their own Agent, reviews the draft,
sends it and continues the conversation there. The SDK runs no model, fetches
no documents and collects no questions, answers or private conversation history.

## Install

Use Node.js 22 or later for packaging/tooling. After obtaining the reviewed
release archive, place it in your app's `vendor/` directory:

```sh
npm install ./vendor/agent-art-protocol-0.1.5-alpha.1.tgz --ignore-scripts
```

Retain the dependency lock. There are no runtime dependencies or lifecycle
scripts. Registry publication is not part of this candidate; `private: true`
guards against accidental npm publication without preventing archive installs.
Do not assume `npm install @agent-art/protocol` is available.

## Add the component

For a browser application with an ESM bundler:

```js
import { defineWork } from '@agent-art/protocol';
import { mountReading } from '@agent-art/protocol/reading-ui';
import '@agent-art/protocol/reading.css';

const invitation = 'Read https://agentart.work/agent-index.json. '
  + 'Use the index to discover relevant public sources. Report access failures. '
  + 'Confirm readiness; I will ask my questions here.';

const work = defineWork({
  id: 'https://agentart.work/#reading-example', version: '1',
  title: 'Read Agent Art Lab',
  purpose: 'Discuss public sources in the visitor’s own Agent.',
  capabilities: ['handoff'],
  context: [
    { id: 'invitation', kind: 'text', mode: 'snapshot', text: invitation },
    { id: 'index', kind: 'reference', mode: 'live',
      url: 'https://agentart.work/agent-index.json' },
  ],
  conditions: { questionsAndAnswers: 'Stay inside the visitor’s Agent.' },
});

// Your page supplies <div id="ask-your-agent"></div>.
const mounted = mountReading(document.querySelector('#ask-your-agent'), {
  work, evidence: false,
});
// Call mounted.destroy() when your framework unmounts the component.
```

Replace the example invitation and references with your own. The reading
profile requires a retained exact text snapshot and at least one public HTTPS
DNS source reference. URL checks perform neither DNS resolution nor retrieval.
Keep a visible manual prompt available when JavaScript is unavailable.

The compact Quiet field component provides:

- A separate mark, **Ask your Agent ⓘ** identity link to
  [the explanation page](https://agentart.work/ask-your-agent/).
- **ChatGPT** and **Claude** native links for a new conversation draft.
- Always-visible **Copy**, with brief inline confirmation and a selected-text
  fallback if clipboard access fails. Existing conversations use manual paste.

Configured links do not detect installed apps. OS/client approval and behavior
remain outside the SDK. The ChatGPT-labelled route is `codex://new?prompt=…`;
it does not force Chat, Work or Codex mode. The Claude reading route is
`claude://claude.ai/new?q=…`. A route request is not proof of draft arrival or
Send. Neither link submits a message automatically.

## Theme and placement

The SDK owns the mark, structure and accessible controls. Sites own theme and
placement through these supported variables on the mount or an ancestor:

| Variable | Controls |
| --- | --- |
| `--aap-ink`, `--aap-paper`, `--aap-muted` | Base text, paper and status colors |
| `--aap-font-family`, `--aap-radius` | Font and corner-radius override |
| `--aap-signal` | Shared signal color |
| `--aap-frame`, `--aap-label-surface` | Outline and label field |
| `--aap-mark`, `--aap-copy-icon`, `--aap-line` | Mark, Copy glyph and underlines |
| `--aap-gate-accent` | Focus outline |

Legacy hooks `--aap-seal-paper`, `--aap-seal-ink`, `--aap-seal-surface`,
`--aap-gate-font-family` and `--aap-gate-radius` remain compatible fallbacks.
Do not override private `--_reading-*` tokens or internal selectors. Use a
wrapper for surrounding layout. Defaults follow system light/dark appearance;
set ink, paper and signal together for a site-managed theme.

## Custom UI and evidence

Import `createReading` from `@agent-art/protocol/reading` for headless planning.
`prepare({ client: 'claude-app', conversation: 'fresh' })` prepares a native
route. `manual` and existing-conversation requests prepare manual context.
The retained internal identifier `codex-app` is displayed as ChatGPT in the UI.

Reading needs no enrollment, extra server, local helper, answer callback,
database or persistent evidence. It may use zero Participants, Acts and
Relations. Optional receipts describe caller-reported browser actions only;
they are unsigned, recomputable statements, not independent execution proof.
Existing primitive and receipt-verification exports remain available.

An offered URL, click or receipt does not establish source access, reading,
model authorship or intentional participation. Artwork contribution, durable
return, recovery and consequence verification remain experimental work for a
later compatible release. Minting policy belongs to the consuming contract.

## Compatibility and license

This alpha retains 0.1.4 runtime and declaration bytes. Changes are version,
metadata, this standalone guide and inclusion of the MIT license. Package and
browser checks belong to this exact new archive; historical native observations
remain findings for their original package/client/environment.

Original package code and documentation use the included **MIT License**.
Preserve its copyright and permission notice when redistributing. Third-party
material retains its own rights; artworks and participant contributions are
not licensed by merely using the SDK.
