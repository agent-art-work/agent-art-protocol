# Reading SDK 0.1.4 local candidate

`@agent-art/protocol@0.1.4` supplies the framework-neutral **Ask your Agent
component**, browser handoff controller and optional bounded receipts. The
package is private. This is the reading release of one evolving Agent Art
protocol; artwork participation remains experimental work for a later release.
It does not operate a model or collect a visitor's questions and answers.
This fresh local candidate keeps Quiet field and refines action underlines,
the Copy glyph and clipboard feedback. It is not a release or deployment.
Historical 0.1.2 and 0.1.3 archives and their qualifications remain unchanged.

## Install

From the protocol repository, run `npm run sdk:pack`. Copy the resulting
`.local/sdk/agent-art-protocol-0.1.4.tgz` into the consuming application's
`vendor/` folder, then install its relative file dependency:

```sh
npm install ./vendor/agent-art-protocol-0.1.4.tgz --ignore-scripts
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

The compact Quiet field interface puts the dot mark, **Ask your Agent** label and
**ⓘ** in one identity link to
[What is Ask your Agent?](https://agentart.work/ask-your-agent/). It is an ordinary
same-tab link, separate from **ChatGPT**, **Claude** and always-visible **Copy**
on the same line. It carries no prompt/Work query and invokes no handoff,
clipboard operation or receipt. It does not select or open an Agent.
Configured native links appear immediately;
their presence does not mean the apps were detected or are installed.

The SDK owns the mark, structure, control sizing and accessible behavior;
sites own theme and placement. Set these CSS variables on the mount or an
ancestor, and use a host wrapper for surrounding layout:

| CSS variable | Purpose / fallback |
| --- | --- |
| `--aap-ink` | Main text/base ink; site `--ink`, then `CanvasText` |
| `--aap-paper` | Base paper; site `--paper`, then `Canvas` |
| `--aap-muted` | Status text; site `--muted`, then `currentColor` |
| `--aap-line` | Underlines/panel borders; effective frame color |
| `--aap-font-family` | Action row font; legacy `--aap-gate-font-family`, then system UI |
| `--aap-radius` | Corner radius; legacy `--aap-gate-radius`, then `5px` |
| `--aap-signal` | Complete shared signal color; 95% Clay plus 5% effective ink, using the system light/dark palette |
| `--aap-frame` | Continuous outline color; legacy `--aap-seal-paper`, then 50% signal mixed with transparent |
| `--aap-label-surface` | Label background; legacy `--aap-seal-paper`, then 15% signal mixed with paper |
| `--aap-mark` | Dot color; legacy `--aap-seal-ink`, then signal |
| `--aap-copy-icon` | Copy glyph color; explicit `--aap-muted`, then signal |
| `--aap-seal-paper` | Compatibility fallback for frame and label background; absent by default |
| `--aap-seal-ink` | Compatibility label-text color and mark fallback; absent by default |
| `--aap-seal-surface` | Compatibility action background; paper |
| `--aap-gate-accent` | Focus outline; effective ink |

New semantic overrides win over their corresponding legacy hooks. Legacy
hooks win over derived Quiet field defaults; setting `--aap-signal` alone
does not displace an explicit legacy frame/label/mark color. Label and action
text use ink, except an explicit `--aap-seal-ink` still colors the label. The
mark and Copy glyph can be colored independently of that text and status.
An explicit `--aap-muted` keeps its former Copy-icon effect unless
`--aap-copy-icon` overrides it; the ambient site `--muted` affects status only.

The new default derives action underlines from the frame instead of the
ambient site `--line`. To retain that ambient line color, set the supported
`--aap-line: var(--line)` explicitly on the mount. This is a presentation-default
change; the named `--aap-line` override is retained.

The SDK owns the static 8px dot, continuous closed 1px outline, default 5px
corners and 8px-base/4px-depth point tail. Quiet field is the default; no
presentation option or private-selector override is needed. The retained
radius hook is an explicit site override of the default corners, not a
general geometry or density API. Sites own palette, placement and surrounding
branding. Radius overrides resolve lengths, percentages and `calc()` after
mount. Large radii are normalized to leave room for the 8px tail base; the tail
moves along the lower straight edge so it cannot overlap a corner. The default
5px corners and tail position are unchanged. The default system palette is
Clay (#a77c62 light / #b9937b dark),
mixed with 5% of effective ink. A site can provide the complete signal color
itself; the SDK will not mix it a second time. For example:

```css
#ask-your-agent {
  --aap-signal: color-mix(in srgb, #a77c62 95%, var(--ink, CanvasText));
}
@media (prefers-color-scheme: dark) {
  #ask-your-agent {
    --aap-signal: color-mix(in srgb, #b9937b 95%, var(--ink, CanvasText));
  }
}
```

Use the site's own theme selector instead if appearance is managed there.
The SDK's fallback follows system appearance; a site's own theme can override
the signal, ink and paper together. The SDK does not change app appearance or
draw the site's logo, escaped dot or background texture.

Font family does not automatically match the host; use its named hook. Legacy
font/radius aliases have lower precedence than the primary hooks. All
`--_reading-*` tokens are private, including spacing, font/mark sizes and pointer
targets. Keep those responsive proportions and the mark in the SDK.

Styles use the `aap-reading` namespace. The SDK does not inject styles or
contact an asset host. Keep a
manual prompt available when scripts are disabled or a client/clipboard route
is unavailable.

## Browser behavior

- **New desktop conversation:** ChatGPT and Claude links carry the exact
  context through their native draft routes. The installed app and browser
  must support the route. The visitor reviews the app mode and draft, then
  sends inside the Agent. The browser cannot confirm arrival.
- **Existing conversation:** manual copying and pasting into the conversation
  the visitor chooses. No private-history access or automatic attachment.
- **Another Agent or oversized context:** manual copying without truncation.
- **Clipboard denied:** reveal and select the exact context for manual copying.

The **ChatGPT** label uses the existing `codex-app` identifier and
`codex://new?prompt=…` URL. It does not force ordinary Chat, Work or Codex mode.
The visitor's application handles the destination. **Claude** uses the
`claude://claude.ai/new?q=…` Chat route. The SDK prepares the URLs and performs
no Send action; review the destination's actual state before sending. Copy
works with either a new or an existing conversation and does
not declare which one the visitor chooses.

The native route names describe prepared URLs, not universal compatibility or
an authenticated connection. The SDK performs no app probing, discovery
request or loopback access by default. No app opens automatically at mount
time, after a timer, on reload or as a hidden retry. Questions and answers
remain in the chosen Agent. No Send action, model choice or account setting
is automated.

### Action and Copy feedback in 0.1.4

The Agent-name text is underlined; its adjacent arrow is decorative and is not
underlined. Copy's text and adjacent glyph are likewise separate. Its copy
glyph is one coherent SVG rather than overlapping CSS outlines. Both glyphs
are decorative within the existing accessible controls and add no keyboard
stops or public styling hooks.

After a successful clipboard write, the Copy control displays **Copied** with
a check for three seconds, then returns to **Copy**. Its width stays stable in
both states. A visually hidden, polite status announcement confirms copying;
success does not add a visible paragraph beneath the component. This confirms
only that the browser's clipboard call succeeded, not pasting, sending or
Agent reading.

If clipboard access fails, the exact public context is still revealed and
selected, with a visible manual-copy instruction. A new Copy attempt clears
any earlier success timer; successful repetition starts its own three-second
feedback interval. `destroy()` clears that timer and removes the mounted UI,
so delayed feedback cannot update an unmounted component. No conversation
choice, Copy receipt or new JavaScript option is introduced by this feedback.

## Optional host-reported availability

A host that already has a qualified way to report available clients can
provide `discoverClients`:

```js
const mounted = mountReading(host, {
  work,
  discoverClients: async () => ({
    clients: [{ id: 'codex-app' }, { id: 'claude-app' }],
  }),
});
```

This example shows the callback shape; a constant list does not establish
installation. The callback returns a snapshot of IDs, not URLs or code. The
SDK recognizes only configured supported IDs and prepares their routes itself.
A successful empty snapshot leaves Copy available. If the callback fails,
times out or returns an unusable result, configured native links remain
offered with availability unverified. A callback result is the host's report;
the SDK does not independently attest it or call an external detection service.
The application owns any requests or permissions its callback uses.

Lab's local test integration injects its existing loopback-host detector. That
helper is not packaged in the SDK and is not required by public reading sites.

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

Set `evidence: true` when mounting to offer a local receipt download after a
native handoff is requested. `onReceipt(receipt)` may observe that result when
evidence is enabled. The UI keeps only the current receipt in memory; it does
not persist a visitor ledger. Call `destroy()` to remove its UI/listeners and
discard the mounted reference.

The compact Copy control makes no fresh/existing conversation selection, so
it creates no receipt. It reports clipboard success or reveals the exact text
for manual copying. It does not invent a conversation for the receipt schema.
This differs from the 0.1.0 selector interface, which had an explicit client
and conversation choice. The headless receipt API remains available unchanged
for callers that actually know and observe those choices.

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
existing client URL preparation and bounded reading receipts. Version 0.1.1
keeps the mounted function and existing input options, adds optional
host-reported discovery and replaces the selector presentation with the compact
component. Its Copy receipt difference is described above. Headless calls,
native routes and receipt verification remain unchanged. Existing alpha-core/
client exports remain available for experimental consumers; their participation
APIs do not constitute a supported artwork-return service.

Version 0.1.2 makes the identity a keyboard-focusable About link with the visible
ⓘ cue. Existing options, client routes, Copy/manual fallback and receipt
verification remain compatible. The historical 0.1.1 package and archive are
not replaced; consumers upgrading use the fresh 0.1.2 archive and dependency lock.

The 0.1.3 local candidate replaces the default Seal treatment with Quiet field,
adds the five semantic color hooks above and retains existing generic and
legacy hooks. It keeps the same JavaScript options, About/native destinations,
exact context, Copy/manual fallback and receipt verification. It must be
qualified from its own fresh archive and consumer lock; earlier archive checks
do not qualify the changed package. Narrow-screen acceptance includes all
actions, especially Copy, fitting a 257px container in a 320px viewport with
default system fonts. Existing 0.1.2 files and findings remain historical.

The 0.1.4 local candidate retains Quiet field's geometry and public color
hooks. It underlines names separately from glyphs, uses a coherent Copy SVG
and adds the bounded inline success feedback described above. Existing mount
options, exact context, native/About routes, manual failure fallback and
receipt verification are unchanged. It requires its own fresh package,
consumer lock and browser qualification; the preserved 0.1.3 candidate's
findings do not qualify changed inputs.

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
checks. Lab remains the single active site integration. The reading test bench
qualifies the fresh candidate's browser presentation separately from real-client
observations; no new native trial is implied by changing presentation.
The four earlier 0.1.0 integrations and their archive pins remain historical;
Inshell, Pulse and signatures.gallery need no continuing development servers
or automatic upgrade for this SDK change. Lab's owner separately released its
0.1.1 integration; a 0.1.2 site upgrade has its own owner checks and release.

Before this packaging change, the operator reported a prefilled Lab draft in
Codex, then a Work destination after selecting ChatGPT → Chat. The operator
submitted the latter. These are prior preview observations, not new native
qualification of the 0.1.1 archive or a documented universal routing policy.
They support keeping mode selection with the destination application.
Historical 0.1.2 package/browser checks remain in the source repository's
`pilot/reading-sdk-012/`; the 0.1.1 record remains
`pilot/reading-sdk/QUALIFICATION.json`. Earlier alpha and 0.1.0 evidence keeps
its original scope; new observations must not upgrade those historical results.
