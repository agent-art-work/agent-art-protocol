# Ask your Agent — flat reading alpha

`@agent-art/protocol@0.1.5-alpha.2` is the MIT-licensed flat reading alpha.
Its default presentation preserves AgentArt.work’s approved flat design.
Core reading/client APIs, declarations and receipt verification are unchanged;
the UI and stylesheet provide the new flat structure and documented hooks.
Historical SDK 0.1.4 and public alpha.1 archives remain immutable.

```js
import { mountReading } from '@agent-art/protocol/reading-ui';
import '@agent-art/protocol/reading.css';

const mounted = mountReading(document.querySelector('#ask-your-agent'), {
  work: canonicalReadingWork, // Keep the site's existing exact invitation.
  evidence: false,
});
// On component unmount: mounted.destroy();
```

Install the supplied content-addressed archive as a local file dependency with
scripts disabled, and regenerate the site's dependency lock. Static sites can
copy the installed `index.mjs`, `clients.mjs`, `reading.mjs`, `reading-ui.mjs`
and `reading.css` together to their own public asset directory. Do not mix
files from different archives. Runtime has no dependencies, server, enrollment,
fetch, model API, answer callback or automatic native launch.

## Install

Use Node.js 22 or later for packaging. Obtain the reviewed archive and retain it
in `vendor/`, then run (using your site’s package manager):

```sh
npm install ./vendor/agent-art-protocol-0.1.5-alpha.2.tgz --ignore-scripts
```

Keep the dependency lock and verify the release SHA-256 before installation.
The archive has no runtime dependencies or lifecycle scripts. `private: true`
prevents accidental npm publication; it does not prevent archive installation.
Use the versioned GitHub release archive; no npm registry package is offered.
Supply an
exact retained invitation and at least one public HTTPS source reference in
your Work; provide manual prompt text when JavaScript is unavailable.

## Styling boundary

The SDK owns flat-label structure, equal-gap layout, control semantics and Copy
feedback. Sites own palette, appearance selection and placement. The identity
link goes to https://agentart.work/ask-your-agent/ and remains separate from
ChatGPT, Claude and Copy. There is no mark, frame, tail, dot, info indicator,
Copy icon or external-link arrow. The label underlines on hover; actions
underline normally and remove that underline on hover. Copy underlines text
only. Underlines are 1px with a 3px offset. Keyboard focus remains explicit.

Set public properties on the mount or an ancestor. No private-selector override
or JavaScript theme option is required. `--_reading-*` properties are private.

| Public CSS property | Default / purpose |
| --- | --- |
| `--aap-ink` | Site `--ink`, then `CanvasText`; text |
| `--aap-paper` | Site `--paper`, then `Canvas`; base paper |
| `--aap-muted` | Site `--muted`, then current color; status |
| `--aap-signal` | Effective ink; site-supplied tint color |
| `--aap-field-tint` | `15%`; signal mixed with transparent for actions |
| `--aap-label-tint` | `30%`; signal mixed with transparent for label |
| `--aap-surface` | Complete field color; overrides the derived tint |
| `--aap-label-surface` | Complete label color; overrides derived tint |
| `--aap-font-family` | `system-ui, sans-serif` |
| `--aap-font-size` | `14px`; same font size across all four controls |
| `--aap-padding-block` | `4px` minimum; label and action vertical padding |
| `--aap-label-padding-inline` | `12px` minimum; label horizontal padding |
| `--aap-action-gap` | `12px` minimum; minimum equal action gaps |
| `--aap-focus` | Ink; visible 2px focus outline |
| `--aap-line` | Current color; manual fallback and receipt panel borders |

The site-approved Amber gold theme is:

```css
#ask-your-agent {
  --aap-signal: light-dark(#a87632, #d9b66f);
  --aap-field-tint: 15%;
  --aap-label-tint: 30%;
}
```

`light-dark()` follows the site's effective `color-scheme`. A site may instead
set `--aap-signal` separately under its own light/dark selectors. The SDK does
not change site appearance. The field and label stay square. Legacy
`--aap-seal-surface`, `--aap-seal-paper`, `--aap-seal-ink`,
`--aap-gate-font-family` and `--aap-gate-accent` retain their compatibility
effects. Surface, font and focus aliases have lower precedence than the new
semantic hooks. `--aap-seal-ink` remains an explicit label-only ink override;
omit it to use `--aap-ink` consistently. Mark, Copy-icon, frame and radius
hooks have no corresponding geometry in this presentation.

The action area uses its own translucent background. The label is a sibling,
not a second tint layered over the action field, so 30% label and 15% action
opacity remain independent. Texture below both fields stays visible.

A hidden, `aria-hidden` sizing row reserves **Copied** width. A separate visible
row distributes its free space equally: label edge → ChatGPT → Claude → Copy →
right edge. All four visible gaps are equal and at least 12px, both for Copy
and Copied. The outer width/height stay stable; visible actions rebalance when
the text changes. With fewer clients, the remaining gaps are equal. On narrow
containers, the label/action group may wrap without shrinking the requested
font or gaps. Consumers must qualify their actual container widths.

## Unchanged behavior and limits

ChatGPT uses the `codex-app` identifier and desktop prefill route without
forcing Chat, Work or Codex. Claude retains its desktop Chat route. Native
links retain native tooltips and the exact canonical context; they do not
prove app installation, draft arrival, Send, reading or Agent execution.
Copy remains available for any fresh/existing conversation and another client.
A clipboard success displays Copied for three seconds with a polite hidden
announcement. Denial reveals/selects exact context for manual copying.

`discoverClients`, `evidence`, `onReceipt`, client subsets and teardown retain
their existing API/semantics. Discovery is optional and host-attributed;
no SDK probing is added. Receipts are opt-in browser assertions. Copy chooses
no destination and invents no receipt. Native receipts assert a requested
handoff, never independent Agent participation. Browser tests use canceled
native navigation, synthetic clipboard/discovery and local fixtures; they
cannot qualify real desktop delivery or reading. THOUGHT remains later scope.

## Local maintainer commands

From the protocol repository, run:

```sh
node releases/0.1.5-alpha.2/prepare.mjs
node releases/0.1.5-alpha.2/check-ui.mjs
```

The builder makes an isolated copy of 0.1.4 with this alpha's UI overlays;
it does not modify `protocol/`, the default bench pin or its SDK helper link.
Every archive is retained by SHA-256; it never overwrites a previous archive.
Use the exact archive/digest named by the new qualification report. Existing
site results do not qualify these changed package bytes. No commit, publication
or deployment is performed by these commands.

## License and immutable assets

The archive includes the MIT license for original package code and documentation.
Retain that notice when redistributing package assets, including static copies.
A release archive is immutable; a changed asset needs a new archive and its own
qualification. The consuming site’s artwork/content has its own licensing.

This alpha adapts the earlier local flat-label prototype (not a published
protocol standard). Qualification is tied to this exact archive, not production
0.1.5-flat-label.1 or public alpha.1. Reading does not prove artistic participation.
