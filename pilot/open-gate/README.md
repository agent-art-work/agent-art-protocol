# Ask your Agent: local Open bubble trial

Historical local design trial. The operator selected this component for SDK
0.1.1 on 2026-10-20. Current development uses the packaged component on
[Lab only](../reading-sdk/README.md); the four preview patches and observations
below retain their original 0.1.0 scope. The current `pilot:lab` command starts
the packaged 0.1.1 preview, including when the old `--open-gate` flag is supplied.

Selected 2026-10-20. **Open bubble** is the mark in the compact **Seal**
presentation: a small noninteractive **Ask your Agent** label on an inverse field, followed by
detected ChatGPT and Claude desktop links and always-visible **Copy** on one shared
surface. There is no chooser or expanded panel. Smaller containers reduce
spacing and omit decorative native-link arrows; Agent names and Copy remain
visible. Publisher light/dark colors are retained.

The mark opens on the left and retains its lower-left speech tail, before the
label. It uses the original Open bubble candidate, without the right-tail or
right-of-label variations. This supersedes the facing-brackets Seal mark; its
[qualification](qualification/2026-10-20-seal.json) remains dated history.
The previous [Codex/Open bubble qualification](qualification/2026-10-20-open-bubble-codex.json)
remains dated history. The earlier wrapping inline presentation's
[qualification](qualification/2026-10-20-inline.json) is preserved as dated
history. The internal `open-gate` file/API names remain for this local trial;
no SDK export or packaged file changes.

| Preview | Entry |
| --- | --- |
| [Lab](http://127.0.0.1:4174/) | Homepage |
| [Inshell](http://127.0.0.1:4176/docs) | Docs |
| [Pulse](http://127.0.0.1:4177/) | Homepage and [Projects](http://127.0.0.1:4177/projects) |
| [Signatures Gallery](http://127.0.0.1:4178/about) | About reading |

## Discovery and trust

These previews run on the visitor's own Mac. Their local Node hosts use the
shared [read-only detector](desktop-discovery.mjs) to inspect known ChatGPT/Codex
and Claude app bundles in the standard Applications locations. A positive result
requires the exact allowlisted bundle ID, a declared native URL scheme and an
executable app binary. Current actual probes detected `codex-app` and `claude-app`. The first is
the existing internal SDK client ID; its visible label is **ChatGPT**, matching
THOUGHT's established `codex://new?prompt=…` desktop handoff. This restores the
previous prefill path without adding or renaming an SDK adapter.
No application is launched by detection, and no account or
conversation data is read. The response includes only supported client IDs,
a timestamp and the basis/scope of the observation; no app paths or broad
inventory are returned.

This establishes **app detected on this Mac**. It does not establish a default
URL handler, valid login, successful draft placement, sending, source reading,
model execution or intentional participation. The local host and filesystem
remain trusted. Native links continue to require browser/OS acceptance.

A public website cannot obtain this result from the visitor's Mac using this
candidate alone. The browser's [Installed Related Apps API](https://developer.chrome.com/docs/capabilities/get-installed-related-apps)
requires a verified app/site relationship and cannot enumerate arbitrary
third-party apps. A production visitor-detection path would require an explicit
local bridge, extension or other qualified integration. That is not selected
or supplied by this local trial. Outside loopback, the current candidate shows
Copy; it does not display unconfirmed native-app availability.

The local-only `/__aap/desktop-clients.mjs` module endpoint is same-origin and
checks loopback address, Host, Origin and Fetch Metadata. It sets no-store and
same-origin resource policy, supplies no cross-origin access, and accepts no
launch command. Module delivery also works with Signatures' unchanged
`connect-src 'none'` policy. The endpoint exists in local preview adapters,
not the deployed Signatures Worker or SDK. The module snapshot lasts for the
page lifetime; reload after installing or removing an app.

## Actions and evidence

The presentation imports the unchanged SDK's `createReading` headless
controller. Each detected client gets an ordinary native anchor carrying the
exact offered public context into a **new conversation**. ChatGPT uses the
unchanged `codex://new?prompt=…` adapter; Claude uses its desktop Chat route.
The visitor reviews the app mode and draft, then sends there. Accessible names
and tooltips identify a new desktop conversation; Copy identifies any new or
existing conversation. There is no automatic Send.

The ChatGPT label does not select an app mode. The SDK's internal `surface: "chat"` metadata does not encode a mode parameter in the URL. The
[official deep-link reference](https://learn.chatgpt.com/docs/reference/commands#deep-links)
documents initial composer text and no automatic Send; it supplies no parameter
that forces ordinary Chat mode. This mode question remains separate from
restoring the existing prefill link. Direct desktop inspection is blocked by
the active computer-use tool. After the real Lab click, the operator reported
no desktop callout or confirmed prefilled desktop draft; a ChatGPT web tab in
the built-in browser was visible instead. This does not establish that the
native route opened ordinary Chat, or that the web tab came from that click.
A read-only macOS lookup confirmed ChatGPT as the default `codex://` handler.
A subsequent visible regular-Chrome click showed **Open ChatGPT?**; that one-time
launch was accepted with **Always allow** left unchecked. The operator subsequently confirmed **Codex with the Lab draft**. This is an
operator-reported prefill observation, not tool inspection or destination-byte
verification. Ordinary Chat was not opened in this test.

OpenAI documents a unified desktop app and an optional Codex default view.
It does not establish that all incoming links follow that preference. A second
operator-mediated test kept the exact same Lab context and URL: the operator
selected **ChatGPT > Chat** first, then reported that the destination was
**Work** and that they submitted it. Automation did not send or inspect that
work and left it untouched.

The two observations establish prefill reported in Codex in the first setup
and a Work destination in the second. This link does not guarantee ordinary
Chat, and the evidence does not establish a universal default-view policy or
the exact app routing rule. The component promises a desktop handoff with
context; app mode and subsequent execution remain separate observations.

The superseded browser copy-and-paste trial and its unsent Chat observation
remain in [dated qualification](qualification/2026-10-20-chatgpt-web-copy.json).
That observation does not qualify the restored desktop destination.

The discovery explanation stays
available to assistive technology without adding a permanent text row. Only
the individual actions are interactive.

The label is 12px, or 11px in narrow containers. Fine-pointer actions have a
32px minimum height; coarse-pointer actions retain 44px targets. The shared
row is approximately 40px tall on desktop and 52px with coarse-pointer
targets. Context selection, status and optional receipt controls may appear
after an action; they are not a client chooser.

Copy is available before, during and after discovery, including empty results
and failures. It works for any new or existing conversation or another Agent.
When clipboard access fails, the exact read-only context is shown and selected
for manual copying. Existing owner manual prompts and source links remain.

Lab and Inshell keep evidence off. Pulse and Signatures retain optional
`handoff-requested` receipts for both native links, using the existing SDK's fresh
conversation plan. A canceled link produces no receipt. Copy has no declared
fresh/existing destination in this interface, so the candidate creates no Copy
receipt. ChatGPT native receipts retain the existing internal `codex-app`
identifier and request-only meaning; the visible label does not strengthen
them. No conversation mode is invented for an unobserved destination. This
is a presentation limitation, not a change to the SDK or generic protocol.
Unsigned receipt and execution-origin limits remain unchanged.

## Boundary and reproduction

`@agent-art/protocol@0.1.0`, its archive and installed files are unchanged.
The candidate UI, styles, declarations and detector live outside the package;
no new SDK export, registry release or deployment is selected. Original owner
checkouts, THOUGHT and public sites are unchanged. The UI has no private-history
access, model service, CLI launcher, provider request, wallet or mint action.

Each [consumer record](consumers/) pins the owner revision, immutable SDK 0.1
reading patch and additive candidate delta. Apply the reading patch first,
then the candidate delta with `git apply --binary --unidiff-zero`. Use the
owner's locked dependencies and build command. Clean index replay verifies
the result and unchanged SDK archive.

For the prepared Lab clone, `npm run pilot:lab -- --open-gate` also enables the
read-only discovery endpoint. `--prepare-only` builds without starting a
second server. For the built Inshell preview, run:

```sh
node pilot/reading-consumers/serve.mjs .local/reading-v010-inshell/dist/home 4176 --spa --desktop-agents
```

Pulse and Signatures vendor the detector into their local Node preview adapters.
They retain blank RPC configuration and disabled minting respectively. No
production app-detection or broader desktop-client compatibility is claimed.

[Current qualification](QUALIFICATION.json) separates actual detection/browser
checks from synthetic empty/failing discovery and clipboard fixtures. The
[earlier chooser observations](qualification/2026-10-19-chooser.json) are retained
as dated history and do not qualify this revised interface.
