# Reading SDK 0.1.0

`@agent-art/protocol@0.1.0` supplies a framework-neutral **Ask your Agent**
interface, browser handoff controller and optional bounded receipts. The
package is private. This is the reading release of one evolving Agent Art
protocol; artwork participation remains experimental work for a later release.
It does not operate a model or collect a visitor's questions and answers.

## Install

From the protocol repository, run `npm run sdk:pack`. Copy the resulting
`.local/sdk/agent-art-protocol-0.1.0.tgz` into the consuming application's
`vendor/` folder, then install its relative file dependency:

```sh
npm install ./vendor/agent-art-protocol-0.1.0.tgz --ignore-scripts
```

Use the application's existing package manager and commit its dependency lock.
The archive has no runtime dependencies or lifecycle scripts. No registry
publication, new npm account or reuse license is selected by this release.

## Mount the interface

In a browser application with an ESM bundler:

```js
import { defineWork } from '@agent-art/protocol';
import { mountReading } from '@agent-art/protocol/reading-ui';
import '@agent-art/protocol/reading.css';

// The publisher authors this text and its reading policy.
const invitation = 'Read https://agentart.work/agent-index.json. '
  + 'Use it to discover relevant public sources. Report access failures. '
  + 'Confirm readiness; I will ask my questions in this conversation.';

const work = defineWork({
  id: 'https://agentart.work/#reading', version: '1',
  title: 'Read Agent Art Lab',
  purpose: 'Discuss the Lab in the visitor’s own Agent.',
  capabilities: ['handoff'],
  context: [
    { id: 'invitation', kind: 'text', mode: 'snapshot', text: invitation },
    { id: 'index', kind: 'reference', mode: 'live',
      url: 'https://agentart.work/agent-index.json' },
  ],
  conditions: { questionsAndAnswers: 'Stay inside the visitor’s Agent.' },
});

const mounted = mountReading(document.querySelector('#ask-your-agent'), {
  work,
  label: 'Ask your Agent',
  evidence: false, // Default: no receipt creation or persistent storage.
});

// Call mounted.destroy() when a framework unmounts this component.
```

The example invitation is illustrative. Consumers retain their own canonical
prompt, source format, usage/answer policy and failure instructions exactly.
The SDK requires a retained text snapshot and at least one public HTTPS DNS
source reference. It performs no source acquisition or DNS check. References
identify offered locations; their presence proves neither retrieval nor reading.

For static sites, copy `index.mjs`, `clients.mjs`, `reading.mjs`,
`reading-ui.mjs` and `reading.css` from the installed package into one public
asset directory. Import the UI by its relative asset URL and include the CSS.
No Node server, local helper, account, database, answer callback, Agent
registration or model API is required at runtime. Bare npm imports require a
bundler or explicit browser import mapping; they are not browser URLs.

The UI uses the host's font and supports `--aap-ink`, `--aap-paper`,
`--aap-muted`, `--aap-line` and `--aap-radius` CSS properties. It does not inject
styles or contact an asset host. Keep a manual prompt available when scripts
are disabled or a client/clipboard route is unavailable.

## Browser behavior

- **New conversation:** a selected Claude or Codex URL route prepares a draft.
  The installed app and browser must support it. The visitor reviews and sends
  inside the Agent, then asks there. The browser cannot reliably detect an
  installation or confirm draft arrival.
- **Existing conversation:** manual copying and pasting into the conversation
  the visitor chooses. No private-history access or automatic attachment.
- **Another Agent or oversized context:** manual copying without truncation.
- **Clipboard denied:** reveal and select the exact context for manual copying.

The native route names describe prepared URLs, not universal compatibility or
an authenticated connection. No app is opened automatically at mount time,
after a timer, on reload or as a hidden retry. Questions and answers remain in
the chosen Agent. No Send action, model choice or account setting is automated.

## Use your own UI

```js
import { createReading } from '@agent-art/protocol/reading';

const reading = createReading({ work });
const plan = reading.prepare({ client: 'claude-app', conversation: 'fresh' });
// plan.kind === 'native': bind plan.url to an explicit visitor click.
// plan.kind === 'manual': offer plan.context for copying instead.
```

Options are `work`, optional `context`, and optional `clients`. Context defaults
to the Work's sole text snapshot; if several exist, explicitly select an exact
snapshot. Clients are `claude-app`, `codex-app` and `manual`; manual fallback
is always retained. The returned public frame and plans are frozen. Reading
uses only `handoff` and requires no Participant, Act, Relation or encounter.
The core vocabulary remains Work, Participant, Act and Relation, with evidence
across them; the reading profile does not impose human-first or fixed rounds
on other protocol uses.

## Optional receipts

Set `evidence: true` when mounting to offer a local receipt download.
`onReceipt(receipt)` may observe that result when evidence is enabled. The UI
keeps only the current receipt in memory; it does not persist a visitor ledger.
Call `destroy()` to remove its UI/listeners and discard the mounted reference.

A custom interface can call this only **after observing the named action**:

```js
const receipt = await reading.receipt({
  event: 'context-copied',
  client: 'claude-app', conversation: 'existing',
  observer: 'publisher-browser-interface',
});
```

Events are `handoff-requested`, `context-copied` or `manual-context-selected`.
The first requires a fresh native plan. The caller is trusted for its statement;
the SDK is not an independent witness. Receipts contain the offered Work,
bounded observation, trust/limits and zero Participants, Acts and Relations.
They establish neither app arrival, Send, source acquisition, Agent execution
nor comprehension. Web Crypto is required for receipts; its failure does not
prevent native handoff or manual copying.

`verify(receipt)` from the package root returns named `supported`,
`contradicted` and `not-established` findings. The SHA-256 seal is unsigned and
recomputable. An editor can fabricate and reseal a coherent package. There is
no blanket genuineness flag. Applications must exclude private history,
credentials and private handoff capabilities themselves; the SDK does not
automatically redact arbitrary Work content.

## Compatibility and release scope

The supported 0.1 reading surface is `createReading`, `mountReading`, its CSS,
existing client URL preparation and bounded reading receipts. Future releases
must preserve these reading calls/defaults and verify 0.1 receipts. Existing
alpha-core/client exports remain available for experimental consumers; their
participation APIs do not constitute a supported artwork-return service.

The SDK package version is separate from the experimental record schema
`agent-art-protocol/0.1-experimental`. The exact encoding and named core checks
are retained from the alpha: well-formed Unicode, unchanged strings/line
endings, sorted object keys and SHA-256. This is not RFC 8785 compliance or an
independent issuer signature. Unknown future record fields may be rejected by
older verifiers; backward compatibility does not promise forward acceptance.

THOUGHT's scoped return, authorization, acceptance/recovery, artwork renderer
and consequence checker remain with THOUGHT. A later artwork release can add
optional participation facilities without changing reading's lightweight flow.
SDK 0.1 supplies no OAuth service, model execution, private chat control or
independently rooted execution evidence.

Run `npm run test:sdk` from the protocol repository for package/controller
checks. Browser/client observations and consumer pins belong in the
[reading qualification record](https://github.com/agent-art-work/agent-art-protocol/blob/codex/reading-sdk-0.1.0/pilot/reading-consumers/QUALIFICATION.md).
Earlier alpha evidence remains at its immutable source commit; new browser
observations must not upgrade those historical results.
