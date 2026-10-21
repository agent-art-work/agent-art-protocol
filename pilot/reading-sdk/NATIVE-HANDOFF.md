# Native handoff destinations and text formatting

Clarified 2026-10-21 for immutable private SDK 0.1.1. This is integration
guidance, not a new native-client qualification. No packaged files changed.

## A client label is not a destination-mode guarantee

The compact reading component offers these routes:

| Visible action | Internal client | Prepared route | What the SDK selects |
| --- | --- | --- | --- |
| ChatGPT | `codex-app` | `codex://new?prompt=<encoded-context>` | New desktop composer request; no Chat/Work/Codex selector |
| Claude | `claude-app` | `claude://claude.ai/new?q=<encoded-context>` | Explicitly the Claude Chat endpoint |
| Copy | No fixed destination | No native route | Visitor chooses an app and conversation |

Claude's [official deep-link reference](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link)
documents the reading route as a new Chat with a draft to review and send. It
separately documents `claude://code/new?q=…` for Code. Choosing the Chat route
is intentional for reading; preserving whichever Claude tab was active is not
the selected behavior. The lower-level
[`buildClientHandoff`](../../protocol/clients.mjs) supports explicit
`surface: 'code'` for Claude, but the reading controller/component does not
expose that choice. The source API's Code route is not additional live reading
qualification.

OpenAI's [official commands reference](https://learn.chatgpt.com/docs/app/commands)
retains `codex://` as a desktop compatibility scheme and documents the route as
opening a new local chat with initial composer text, without automatic Send.
The inspected reference does not establish a parameter selecting ordinary Chat,
Work or Codex, or a universal rule deriving that choice from the active surface.
The **ChatGPT** label identifies the offered desktop app, not ordinary Chat mode.

The builder's existing `surface: 'chat'` field must not be read as proof of
ChatGPT Chat selection. For `codex-app` it passes validation and selects the
fixed route above; it is not transmitted as a mode query parameter. The reading
controller calls the builder with this field, then returns a native plan without
it. It supplies no account, model, permission, workspace or mode selector.

## Observations and limits

On 2026-10-21 the operator reported that the Claude handoff left an active Code
tab for Chat, while the ChatGPT desktop handoff opened Work from the ChatGPT
surface and a Codex session from the Codex surface. These are user reports in
the joint Lab investigation. No new native launch, composer inspection or Send
was performed by this protocol-side review. The observations are compatible
with the selected routes, but do not establish a stable app policy across
versions, configurations or installations. App versions for these reports were
not independently pinned here.

Visitors review the destination and draft before sending. Existing conversations
remain Copy/manual paste. Opening, receiving a draft, sending it, permitting a
tool and reading a source remain separate events. A local handoff receipt proves
none of the later events; see the
[permission and destination-error diagnosis](CLIENT-APPROVAL-DIAGNOSIS.md).

## Publishers own the invitation's readable text

The Lab screenshot shows short authored lines breaking again at the recipient
bubble width. The Lab session traced these to editorial hard wraps in its
canonical prompt, hidden on the publisher page by `white-space: normal`.
The protocol code independently confirms that the supplied line breaks are
retained in the prepared native payload rather than inserted by the SDK.
This is a publisher formatting issue; the screenshot alone is not byte-level
delivery evidence or a functional execution failure.

Publishers should author ordinary prose as logical paragraphs, with blank lines
between them, and let the destination wrap to its available width. Preserve
intentional line breaks in poetry, code or other structured material. Display
the canonical invitation in a way that exposes its real paragraph boundaries,
and derive native and Copy actions from the same retained text. The SDK must
not silently reflow arbitrary invitations or alter their instructions.

[`createReading`](../../protocol/reading.mjs) retains the selected context
string. The builder URI-encodes it without reflow, trimming or Markdown
conversion, and the component passes that string to `clipboard.writeText`.
This does not promise identical recipient typography, rich-text rendering,
link serialization or delivered bytes. The selectable textarea fallback can
normalize CRLF to LF through DOM value handling; manual selection and pasting
are not a raw-byte transport guarantee.

Before preparing a changed invitation, update the publisher's retained snapshot
and its applicable version/hash metadata. Verify the selected context against
each decoded native query and the text passed to Copy. Keep payload checks
separate from destination rendering and Agent execution. In this joint task,
Lab owns its prose, preview and adapter checks; this repository owns reusable
handoff guidance.

## Publishing changed context without mixing revisions

In the later 2026-10-21 follow-up, Lab reported that two newer recipient records
still contained the earlier hard-wrapped invitation, allowing for visible URL
link serialization. It also reported corrected current HTTP bytes and decoded
native links in its controlled Chrome preview. This protocol-side review did
not independently inspect those recipient records or the originating preview.
The originating tab, offered payload and reason for using the old text remain
unresolved. A stale page or module is a possibility, not a diagnosed cache fault;
another source, manual copy or a reused draft could also carry older context.

Publishers own coherent delivery of their invitation and generated Work. When
versioning assets, the HTML must reference the new adapter URL and the adapter
must import the new Work-module URL. Changing only text or `Work.version` behind
an unchanged cached URL does not ensure a new load. Keep the snapshot and its
applicable version/hash metadata aligned. Lab owns this mitigation and its test.
It requires no change to the immutable SDK.

When upgrading the SDK itself, version its browser asset directory as well as
the adapter reference and stylesheet URL. Keep the SDK's relative module imports
together under that versioned directory. A refreshed invitation/Work URL alone
does not invalidate an older cached SDK interface.

A cache-enabled old-to-new fixture should check the loaded entry/import chain,
retained context, both decoded native queries and Copy input against the same
expected public invitation. Record its tested cache and service-worker state.
Passing qualifies that loading transition only. It does not identify the
operator's original clicked tab, refresh an already-open document, exclude stale
HTML/history or other delivery paths, or prove bytes arrived in an Agent. A
fresh preview link helps distinguish the intended build but is not delivery
evidence. The SDK should not compensate by silently rewriting the invitation
or retrying a native handoff.

## What this review established

At the 0.1.1 review, the 11 packaged archive members matched the then-current
package sources and `v0.1.1` byte for byte. The historical archive SHA-256 remains:

```text
2c179f487aa71cd0b769c5c70cca8786275111e33f1936de11536531b4012c18
```

Source and existing tests establish the route construction and text boundary,
not actual app arrival, current-tab preservation, permission-free execution or
a new supported destination mode. No SDK runtime defect requiring a change was
demonstrated by these reports. A future routing capability would need documented
client support, qualification and a new SDK package version; it must not be
silently added to the released 0.1.1 archive.
