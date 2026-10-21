# Ask your Agent component

Styling boundary and identity link agreed 2026-10-21. The fresh private SDK
0.1.4 local candidate retains the Quiet field default introduced by the 0.1.3
candidate and refines action glyphs and Copy feedback. It preserves the 0.1.2
identity link and existing handoff behavior. This is local candidate work, not
a release or deployment. Historical 0.1.1, 0.1.2 and 0.1.3 archives and their
qualifications remain unchanged.

## Name and ownership

Call the complete interface the **Ask your Agent component**, not a button.
The mark, label and visible ⓘ form one About link; ChatGPT
and Claude are separate native links, and Copy is a button. In historical
0.1.1 the mark/label were noninteractive. The component is one SDK interface for
the reading profile, not a mandatory visual form of the generic protocol.

**SDK owns the mark and structure; sites control theme and placement.**

| SDK-owned component | Site-owned integration |
| --- | --- |
| Mark/outline geometry, mark/label grouping, compact joined structure and action arrangement | Placement, surrounding margins, available container width, headings and surrounding content |
| Default control sizes, spacing, responsive behavior, focus/hover/disabled states and accessible semantics | Theme colors, font family and radius through the supported hooks below |
| Native links, Copy/manual fallback and lifecycle behavior | Public invitation, Work frame, source policy and offered clients through supported SDK options |

Use a host wrapper for layout and the theme hooks for appearance. Do not fork
the mark, replace internal DOM or override private spacing/sizing tokens to
restyle the packaged component. A needed size or structure variant should be
designed in the SDK rather than maintained separately by each site. This is the
integration boundary for the shared component, not a license or attribution rule.

## Historical CSS custom properties in 0.1.1 and 0.1.2

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

## Quiet field default in the 0.1.3 local candidate

On 2026-10-21 the operator clarified that the refined Quiet field design must
replace the component's default presentation in the next 0.1.3 candidate. It
is not an opt-in theme or a second presentation that sites must discover and
select. The immutable 0.1.2 package and its historical qualification remain
unchanged. Qualification belongs to the fresh candidate's own archive and
consumer lock; the design decision does not reuse an earlier qualification.

The Lab-owned fixed brief specifies a static 8px dot, a continuous closed 1px
outline at 50% signal opacity, 5px outline corners, an 8px-base/4px-depth point
tail, a 15% signal label field and neutral text. The common signal is 95%
palette color plus 5% theme ink in sRGB. Lab selects Clay (#a77c62 light /
#b9937b dark), follows system appearance, and owns its page texture, placement
and escaped Off grid logo dot. SDK-owned geometry and behavior remain separate
from those site branding decisions.

The default signal uses the Clay light/dark palette above mixed with effective
ink. Sites may supply a complete `--aap-signal` to follow their own palette or
theme selector; that value is not mixed again. Neutral label/action text uses
effective ink unless a site explicitly retains its legacy label-ink override.
No extra JavaScript option is needed to obtain the new default.

### Supported semantic colors

| Property | Purpose | Precedence and fallback |
| --- | --- | --- |
| `--aap-signal` | Complete shared signal color | Explicit value, then system light/dark Clay at 95% plus effective ink at 5% |
| `--aap-frame` | Continuous outline and point tail | Explicit value, then `--aap-seal-paper`, then 50% signal mixed with transparent |
| `--aap-label-surface` | Label field | Explicit value, then `--aap-seal-paper`, then 15% signal mixed with effective paper |
| `--aap-mark` | Static dot | Explicit value, then `--aap-seal-ink`, then full signal |
| `--aap-copy-icon` | Copy glyph only | Explicit value, then explicit `--aap-muted`, then full signal |

Specific new semantic values win over corresponding legacy hooks; explicit
legacy hooks win over the derived Quiet field defaults. `--aap-signal` supplies
the common default color and does not erase an explicit frame, label, mark or
Copy override. Ambient site `--muted` continues to affect status text, while
the compatibility Copy fallback reads only the namespaced `--aap-muted`.

The retained public hooks are:

| Property | Role in 0.1.3 |
| --- | --- |
| `--aap-ink`, `--aap-paper` | Neutral text and base paper, using site `--ink`/`--paper` and system color fallbacks as before |
| `--aap-muted` | Status text and legacy Copy color; Copy can now override it independently |
| `--aap-line` | Action underlines and manual-panel borders; effective frame color |
| `--aap-font-family` | Row font; legacy `--aap-gate-font-family`, then system UI |
| `--aap-radius` | Explicit corner-radius override; legacy `--aap-gate-radius`, then the new default 5px |
| `--aap-gate-accent` | Focus outline; effective ink |
| `--aap-seal-paper` | Compatibility fallback for frame and label field, below their independent new overrides |
| `--aap-seal-ink` | Explicit label text color and mark fallback, below new `--aap-mark` |
| `--aap-seal-surface` | Explicit action-area background; paper when absent |

The 8px dot, continuous closed 1px frame, 8px-base/4px-depth tail, default
5px corners, control proportions and responsive fit belong to the SDK. Public
radius compatibility does not create a general geometry/density API. The new
outline is decorative; the About link, two configured Agent links and Copy
remain distinct controls with the existing names, order and semantics.

Quiet field derives default underlines from the frame rather than ambient
site `--line`. A site that wants its ambient line color can set the retained
public `--aap-line: var(--line)` hook explicitly. Radius overrides resolve CSS
lengths, percentages and `calc()` and update the contour when changed after
mount; they do not require remounting the component.

### Site theme example

```css
#ask-your-agent {
  --aap-ink: var(--ink);
  --aap-paper: var(--paper);
  --aap-signal: color-mix(in srgb, #a77c62 95%, var(--ink));
}
@media (prefers-color-scheme: dark) {
  #ask-your-agent {
    --aap-signal: color-mix(in srgb, #b9937b 95%, var(--ink));
  }
}
```

A managed site theme can replace that media query with its own selector. Lab
owns the page's Clay usage, placement, texture and escaped Off grid logo dot;
the component supplies a compatible fallback palette and shared geometry.
Consumers use public hooks rather than internal DOM or `--_reading-*` tokens.

Before rollout, the bench must qualify a fresh candidate archive and matching
consumer lock against the unchanged canonical reading invitation. Acceptance
includes light/dark rendering, default system fonts, always-visible Copy fully
inside the frame at the recorded 257px container in a 320px viewport, keyboard
focus and touch targets, and unchanged About/native/Copy behavior and prompt
bytes. Browser checks and any separately authorized real-client observations
remain distinct. Passing synthetic tests alone does not qualify desktop
arrival, sending, retrieval or completion. No rollout is authorized by this
design decision.

## Action and Copy feedback in the 0.1.4 local candidate

This candidate also keeps large radius overrides clear of the tail. Resolved
corner radii are normalized to retain an 8px lower straight run; the tail and
its fill move together between the corner tangents. Default 5px corners retain
the original tail position. Runtime qualification checks contour ordering and
fill alignment as well as resolved radii, including large percentage and
oversized length overrides. The historical 0.1.3 radius checks retain their
original scope and do not establish this stronger contour check.

The next local candidate preserves Quiet field, its public color hooks and
SDK-owned geometry. Agent links underline the name text only; the adjacent
decorative arrow is outside the underline. Copy's name and glyph are separate
as well. Copy uses one coherent SVG symbol in place of overlapping CSS
outlines. Its icon still uses `--aap-copy-icon` with the documented fallback.
The SVG and any success check remain decorative inside the existing button;
there is no new control or focus stop.

After a successful clipboard write, the existing Copy button briefly shows
**Copied** and a check. It returns to **Copy** after three seconds. Space is
reserved for both labels, so feedback does not change control or row width
and cannot push Copy outside the narrow frame. A visually hidden, polite
status message announces success without adding a visible status paragraph.
This reports clipboard success only; it does not establish paste, sending,
source access or Agent execution.

Failure remains actionable and visible: the exact context is revealed and
selected with manual-copy instructions. A repeated Copy attempt clears an
older success timer; the latest successful attempt gets its own three-second
interval. Unmounting through `destroy()` cancels pending feedback cleanup and
prevents updates to detached UI. The component continues to issue no compact
Copy receipt because it has no fresh/existing conversation selection.

No new mount option, public color token or presentation flag is added. The
same exact context, About and native routes, clipboard fallback and existing
receipt verification remain the contract. A fresh 0.1.4 archive and matching
consumer lock must be checked independently; 0.1.3's source, package and
qualification remain preserved historical material.

Acceptance includes Agent-name-only underlines, the coherent Copy glyph,
success and failure feedback, repeated clicks, cleanup on destroy, keyboard
focus and polite announcements. Both **Copy** and **Copied** must fit the
recorded 257px container in a 320px viewport with system fonts, in addition
to the unchanged About/native payload and public-context checks. These are
browser checks; no new real-client trial or deployment is implied.
