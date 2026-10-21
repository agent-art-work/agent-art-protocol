# Ask your Agent component

Styling boundary and identity link agreed 2026-10-21. The private SDK 0.1.2
candidate adds the identity link while retaining 0.1.1's supported theme hooks.
The historical 0.1.1 archive is unchanged.

## Name and ownership

Call the complete interface the **Ask your Agent component**, not a button.
In 0.1.2 the Open bubble mark, label and visible ⓘ form one About link; ChatGPT
and Claude are separate native links, and Copy is a button. In historical
0.1.1 the mark/label were noninteractive. The component is one SDK interface for
the reading profile, not a mandatory visual form of the generic protocol.

**SDK owns the mark and structure; sites control theme and placement.**

| SDK-owned component | Site-owned integration |
| --- | --- |
| Open bubble geometry, mark/label grouping, compact joined structure and action arrangement | Placement, surrounding margins, available container width, headings and surrounding content |
| Default control sizes, spacing, responsive behavior, focus/hover/disabled states and accessible semantics | Theme colors, font family and radius through the supported hooks below |
| Native links, Copy/manual fallback and lifecycle behavior | Public invitation, Work frame, source policy and offered clients through supported SDK options |

Use a host wrapper for layout and the theme hooks for appearance. Do not fork
the mark, replace internal DOM or override private spacing/sizing tokens to
restyle the packaged component. A needed size or structure variant should be
designed in the SDK rather than maintained separately by each site. This is the
integration boundary for the shared component, not a license or attribution rule.

## Supported CSS custom properties in 0.1.1 and 0.1.2

Set these on the mount element or an ancestor; they inherit into the component.
The [packaged stylesheet](../../protocol/reading.css) is the implementation.

| Property | Purpose | Default when not set |
| --- | --- | --- |
| `--aap-ink` | Main action text; base color for derived defaults | Site `--ink`, then system `CanvasText` |
| `--aap-paper` | Fallback panels' background; base paper for derived defaults | Site `--paper`, then system `Canvas` |
| `--aap-muted` | Copy icon and status text | Site `--muted`, then `currentColor` |
| `--aap-line` | Action underlines and fallback panels' borders | Site `--line`, then a mix of 24% effective ink and paper |
| `--aap-font-family` | Mark/label row and action font family | `--aap-gate-font-family`, then `system-ui, sans-serif` |
| `--aap-radius` | Joined outline and relevant panel corner radius | `--aap-gate-radius`, then `5px` |
| `--aap-seal-paper` | Label-section background and joined outer border | Effective ink |
| `--aap-seal-ink` | Label and Open bubble foreground | Effective paper |
| `--aap-seal-surface` | Action-area background | A mix of 5% effective ink and paper |
| `--aap-gate-accent` | Keyboard focus outline | Effective ink |

The mix defaults use `color-mix(in srgb, …)`. “Effective” means after resolving
the named property and its fallbacks, so changing ink and paper also changes
their derived defaults unless a more specific hook is set.

Two compatibility aliases remain supported:

| Alias | Precedence |
| --- | --- |
| `--aap-gate-font-family` | Used only when `--aap-font-family` is absent |
| `--aap-gate-radius` | Used only when `--aap-radius` is absent |

`--aap-gate-accent` retains its existing name and has no replacement in these releases.
There is no supported `--aap-accent` or `--aap-focus-color` hook in this release.

Every `--_reading-*` variable is an internal implementation token, including
font sizes, mark size, padding, gaps, border width and pointer target size.
There are no public size/density hooks. Those defaults adapt through the SDK's
container and pointer rules. Host variables `--font-size-12` and `--weight-mid`
are also read as ambient fallbacks for status size and label weight; they are
not namespaced SDK customization options.

The component does not automatically inherit every aspect of site typography.
The action row defaults to system UI; explicitly set `--aap-font-family` to
match the site's chosen control font. Status and manual-text panels inherit
parts of the host typography separately. Theme colors should keep text, marks
and focus outlines distinguishable in the site's light and dark themes.

## Example: site-owned theme and placement

```css
/* The host mount element, not an internal SDK selector. */
#ask-your-agent {
  margin-block: 1rem 1.5rem;
  --aap-ink: #34312d;
  --aap-paper: #fbf9f4;
  --aap-muted: #69625a;
  --aap-line: #ded9cf;
  --aap-font-family: Arial, sans-serif;
  --aap-radius: 6px;
}

@media (prefers-color-scheme: dark) {
  #ask-your-agent {
    --aap-ink: #ebe5da;
    --aap-paper: #1c1b19;
    --aap-muted: #b7afa2;
    --aap-line: #49443c;
  }
}
```

A site can use its own theme selector instead of this media query. In Lab,
the brown ink and warm paper come from site variables; the SDK supplies the
label/action treatment, mark and default proportions. The heading “Read with
your Agent” and the page texture are outside the component.

## Selected identity link in 0.1.2

The operator selected one link around the mark, label and visible ⓘ cue:

```text
[mark] Ask your Agent ⓘ  |  ChatGPT ↗  Claude ↗  Copy
```

It leads to [What is Ask your Agent?](https://agentart.work/ask-your-agent/),
owned by Lab. The page explains the handoff, offered public context, questions
and answers remaining in the chosen app, and developer adoption. The identity
link is ordinary same-tab navigation with the accessible description “Ask your
Agent — about this component” and a “What is Ask your Agent?” title. A custom
`label` stays reflected in its accessible name. The ⓘ and mark are decorative
within that one link, not extra controls or keyboard stops.

The whole row is not clickable. ChatGPT, Claude and Copy retain separate
actions. The About link carries no prompt/Work query, does not select an Agent,
and has no SDK click handler or receipt/clipboard action. Keyboard order is
identity, offered Agent links, then Copy. Existing focus and touch-target rules
apply to the identity too; no destination URL option is added to `mountReading`.

The ⓘ and description clarify that an action-worded identity leads to an
explanation. The implementation uses an ordinary link and keyboard focus,
following the principles in W3C's
[link-purpose guidance](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)
and [native link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/); these
sources inform semantics rather than deciding the product choice.

This change has a fresh private 0.1.2 package and separate qualification. It
does not replace 0.1.1, change native destinations, collect conversations or
extend reading into supported artistic participation. The site page and its
release remain Lab-owned.
