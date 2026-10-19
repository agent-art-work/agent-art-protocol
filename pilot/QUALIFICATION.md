# Local reading pilot qualification

Recorded 2026-10-19; revised after the operator's flow correction that day.
This is a local development pilot, not a live-site release, general client
qualification or independent execution attestation.

The records below describe the earlier reading-only candidates, including
the superseded website Q&A experiment. Subsequent integration with the shared
protocol and THOUGHT has its own
[qualification record](PROTOCOL-QUALIFICATION.md). Its tests, encounters and
cleanup limits must not be inferred from these historical observations.

## Current candidate: open the visitor's Agent

The intended flow is now: choose a client, carry the Lab index and reading
policy into that Agent, and ask questions inside it. The website does not
collect a question, launch background inference, receive an answer or keep a
reading-result ledger.

The candidate Codex and Claude desktop routes request a **new conversation**
through native URL handlers, with a prepared context draft and no question.
The visitor reviews and sends it inside the Agent. Existing conversations use
**copy context and paste manually** into the chosen conversation; there is no
automatic attachment to private history. Other clients retain the original
copy-prompt fallback.

Qualification should distinguish: the prepared context bytes, requested URL,
actual destination app and conversation, visible draft placement, manual send,
and subsequent reading. A successful handoff does not establish comprehension,
policy compliance, model identity or continuity with an earlier private Agent.

### Current synthetic checks

All **42 synthetic tests passed**, without model calls: five native handoff
adapter tests, five revised preview-server tests, ten Lab profile tests and
22 retained engine/client tests from the earlier experiment. The retained
tests do not make the earlier engine part of the current flow. These checks
are distinct from desktop application observations and do not qualify arbitrary
clients or policy compliance.

### Current browser observations

Regular stable Google Chrome, identified as `com.google.Chrome`, used a
disposable profile to inspect the revised preview. At 1440 × 1100 in light
mode, no horizontal overflow was observed. The site presented no question,
suggestion or answer interface. Both native **Open** buttons reached the
local helper and received HTTP 202. No task or answer-callback route was used.

At 390 × 844 in dark mode, no horizontal overflow was observed. Existing-
conversation mode hid **Open** and offered **Copy context**. A declared
clipboard-denial fixture opened a read-only fallback, focused it and selected
the complete exact context. No question inputs were present; inspected page
GET requests returned HTTP 200. The fixture does not establish the browser's
default clipboard permission behavior.

### Current native application observations

Route references: [OpenAI desktop deep links](https://learn.chatgpt.com/docs/app/commands)
and [Claude desktop links](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link).
Documentation describes intended behavior; the observations below distinguish
what was actually checked on this machine.

| Route | Actual observation | Qualification limit |
| --- | --- | --- |
| Claude desktop, version 2.37337.1 | The native open request reached `claude.ai/new`. Accessibility inspection showed the complete Lab context as an unsent composer draft, with Send available. The owned draft was cleared afterward and the composer was confirmed empty. No prompt was sent and no other chat was modified. | This checks draft placement for this installed app and environment. It does not check a subsequent Agent reading, answer or general browser-to-app behavior. |
| Codex/ChatGPT app, version 26.1013.40934 | The native open request was accepted. The chosen route follows the official documented new-conversation prefill semantics. The current chat was restored with the purpose-built navigation tool. | Direct composer inspection was blocked by the computer-use rule for `com.openai.codex`; that restriction was respected. Visible draft placement and owned-draft cleanup were not directly verified. Request acceptance and documented semantics do not establish those outcomes. |

The preview routed native opens through its local helper. A production
browser's external-protocol permission prompt and direct site-to-app routing
were not tested. No Send action was performed and no Agent reading was
requested during these native application checks. The earlier Claude Code CLI
reading below supplies no missing desktop qualification.

A separate browser fixture captured the text passed to the clipboard action
and matched it exactly to the prepared context. It exercised the existing-
conversation copy action without selecting or reading a private chat. This
fixture did not write to the real system clipboard.

## Earlier Q&A experiment, 2026-10-19 — superseded

The following observations belong to the earlier website question-and-answer
prototype. They remain valid within their recorded scope, but that experience
was superseded after the operator clarified that questions belong inside the
visitor's Agent. Its CLI launcher, model budget, callback, answer display and
task tools are not the current canonical flow. Historical test counts and
browser observations below are not results for the revised native handoff.

### Source and consumer

The original Lab checkout remained clean at
`d658be2cc19307d113e64bd3fa0b2ad56a0a4bfc`. A separate ignored clone held the
consumer integration. [lab-consumer.patch](lab-consumer.patch) now follows the
revised candidate; it is not an immutable snapshot of the earlier Q&A code.
Its preview-only build rendered 24 pages from seven study records. No Lab
publication, source-ownership transfer, deployment or global client setting
change was performed.

The live site's native reading disclosure was inspected in regular stable
Google Chrome, identified as `com.google.Chrome`, using a disposable headless
profile. The complete prompt and public index link were present and the
disclosure expanded. Source inspection found no client chooser, automatic
launch or answer return in the existing flow. This observation did not test a
clipboard paste into an external client.

### Historical synthetic checks

All **35 prototype tests passed**, with no model calls. They cover:

- Publisher-relative index/envelope/source identity and exact byte verification,
  corruption, truncation, changed metadata and unhandled media.
- Pinned source delivery, authentication, exact answer acceptance and retry
  conflicts, export privacy and concurrent source reads.
- Stop/late-exit races, restart without automatic relaunch, duplicate launch
  delivery and split UTF-8 HTTP input.
- Scoped launcher flags, private configuration cleanup, cancellation, modern
  and legacy MCP framing, and read-only transport behavior.

Temporary loopback servers required the host's sandbox escalation. The tests
remain synthetic; they do not establish client understanding or source truth.

### Historical public acquisition and actual CLI client

A separate read-only check fetched the public Lab index and the Pulse study
through the prototype's transport and parser. The index contained 18 document
entries with revision
`sha256:af1de9f3e27e436952011b68a6946b7550063069a8500122299c11dcb068df0b`.
Download and decoded-source lengths/hashes and envelope identities matched.

The initial direct DNS/public-address path rejected the machine's proxy-routed
DNS result. The implemented supported path uses configured HTTPS proxy
transport when present, retains public URL/same-origin restrictions, ignores
curl configuration and follows no redirects. Proxy routing/DNS and local
operation remain trust dependencies, recorded in exports. This was a transport
compatibility correction, not an approval-denial bypass or an authenticity proof.

One bounded actual reading was started through the local browser form using
installed **Claude Code 2.1.278**, existing authentication, temporary strict
stdio MCP configuration, restricted tools, a 180-second timeout and the
client's USD 1 API-budget setting. It was a fresh session, not continuation
of an earlier private Agent.

The question concerned what the Pulse document-access study established about
accuracy. The client obtained the request, pinned index and two relevant
complete documents. Source-byte checks passed. It submitted an exact answer
through the return tool; the service accepted it and the page displayed it
with the two source references. Browser requests in this encounter returned
200/201. The answer distinguished demonstrated acquisition from unmeasured
accuracy and retained evidence limits. This is one inspected answer, not a
comparative evaluation or proof of comprehension.

The actual question/answer and private launch data remain in ignored local
state. No raw client transcript is captured or included here. No second model
run was needed to exercise rendering of the accepted result.

### Historical browser and consumer regression checks

Stable Chrome checked the local preview at 1440 × 1100 and 1440 × 1050 in
light mode, and 390 × 844 in dark mode. No horizontal overflow was observed.
The accepted result rendered paragraphs, emphasis and its two source links.
A declared clipboard-denial fixture exercised the manual route's selectable
fallback and preserved the question without launching a client. This fixture
does not establish the browser's default clipboard permission behavior.
All disposable browser profiles/processes were closed after checking.

The isolated Lab consumer passed its 20 Node tests and 37 Python tests. A
default build retained the existing site behavior and passed the 24-page,
586-link site check plus the 30-document, 116-link repository check. The local
bridge build was restored afterward. Consumer parser tests also ran without
the local clone, using the preserved patch and synthetic fixtures.

### Historical limits

- Only the earlier Claude Code automatic route had this observed local reading
  result. Codex CLI 0.160.1 was detected, but its isolated launch route was
  unqualified; that prototype used a manual invitation for it and other Agents.
- That experiment depended on an installed loopback CLI execution service.
  Production installation, pairing/distribution, remote OAuth and a production
  execution bridge were not supplied or qualified. This is a limit of that
  experiment, not a requirement for a native URL handoff.
- Local observations, bearer return authority, consistent hashes and a useful
  answer do not independently prove model identity, private intention, private
  continuity or absence of human/operator intervention.
- No measured maintenance savings, broader compatibility, accuracy improvement,
  artistic classification or protocol conformance result follows from this run.
