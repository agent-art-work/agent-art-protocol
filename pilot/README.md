# Agent Art Lab reading pilot

Local experiment, revised 2026-10-19. The current candidate helps a visitor
open their own Agent with the Lab's reading context, then ask questions inside
that Agent. It is not a released SDK, an Agent Art classification, a new
protocol primitive or a frozen contract.

The earlier website question-and-answer experiment was superseded after the
operator clarified the intended flow. Its observations remain dated in
[QUALIFICATION.md](QUALIFICATION.md); they do not qualify this revised handoff.

The Lab now uses the same experimental protocol core as the isolated THOUGHT
consumer. See [shared-consumer qualification](PROTOCOL-QUALIFICATION.md) for
the actual candidate checks; the earlier reading-only observations remain
in the original record. Reading still makes no Agent contribution claim.

## Try it

From this repository, with Node.js 22+ and the neighboring Agent-Art-Lab checkout
and its existing build dependencies available:

```sh
npm run pilot:lab
```

Open <http://127.0.0.1:4174/>. The Agent controls are visible on the homepage. Select an
Agent client and choose where to carry the reading context:

- **New conversation:** the candidate Codex and Claude desktop routes use their
  native URL handlers to request a new conversation with the Lab's prepared
  index and reading-policy draft. Review and send that draft inside the Agent,
  then ask your question there. An installed handler and browser permission
  may be required. Actual application behavior needs per-client qualification.
- **Existing conversation:** copy the context and paste it into the conversation
  you choose. The website cannot attach context to an arbitrary private chat
  or silently continue its memory. This is an explicit manual handoff.
- **Another Agent or unavailable handler:** use the original copy prompt and
  paste it into a client that can read the required public sources. Report
  unavailable tools or sources in that client.

The website collects no question or answer and makes no model call. There is
no background CLI launch, answer callback or website answer record in the
current flow. Questions, interpretation and answers stay in the Agent client.
Sending the draft and asking a question use that client's own account, tools,
permissions and configured provider. Normal client/provider usage applies;
the website does not set a model budget or change global client configuration.

A successful open request is not proof that the intended draft appeared, was
sent, or was read. Current shared-core results and cleanup limits belong in
[PROTOCOL-QUALIFICATION.md](PROTOCOL-QUALIFICATION.md). The earlier
[handoff qualification](QUALIFICATION.md) remains a separate dated record.
The preview's local helper does not qualify production browser prompts.

An optional handoff evidence download identifies the offered public Work and
the local copy/open observation. It contains no Participant, Act or Relation
merely because a client was selected. It does not retain questions or answers,
authenticate an Agent or establish reading. Evidence is held locally without
a persistent participation ledger.

If the Lab checkout is elsewhere, use `npm run pilot:lab -- --lab-source PATH`.
`--port PORT` selects another loopback port; `--no-build` reuses the prepared
preview. No dependency download, publication or deployment is part of startup.

## What belongs where

| Owner | Prototype responsibility |
| --- | --- |
| Lab | Canonical public documents, index format, authored reading context, source identities and verification policy; branded entry and thin integration |
| Shared handoff | Client chooser, native URL adapters and per-client qualification records, context encoding, clear new/existing conversation behavior and manual fallback |
| Visitor and client | Conversation selection, review and sending, actual questions, account access and permissions, public-source acquisition, interpretation and answers |

The public Lab checkout is unchanged. Startup prepares an ignored local clone
at `.local/lab-reading-site`, based on Lab revision
`d658be2cc19307d113e64bd3fa0b2ad56a0a4bfc`, and applies
[the reviewable consumer patch](lab-consumer.patch). The Lab integration is
enabled only for this preview build. Existing build dependencies are reused.
The bootstrap applies this patch with `git apply --unidiff-zero` to the pinned
base revision.

The shared implementation lives in [reading/](reading/). Lab-specific source
rules remain in its consumer patch. The Lab source parser and its synthetic
checks remain available; the current website does not fetch and verify all
documents on the visitor's behalf. The Agent follows the reading context with
its existing tools and reports checks it cannot perform.

Startup prepares the private draft SDK archive offline and installs it in
ignored local state. The helper imports `@agent-art/protocol` and its
`/clients` entry point; browser modules are served from that installed
package. THOUGHT's isolated consumer uses the same archive. This preparation
does not publish a package or download dependencies.

A production website can offer a native URL handoff when the selected app and
browser support it. That does not give the website control of the client or
require the earlier CLI execution service. Installation, browser prompts,
draft placement and conversation behavior still need qualification for each
route. The local preview does not select a production distribution or release.

## Boundaries and checks

- Public reading needs no protocol grant, callback credential, wallet,
  publisher-hosted inference or publisher account. The Agent host controls its
  tools and network permissions. Documents and examples grant no new authority.
- Passing context does not establish that the Agent fetched complete sources,
  preserved exact bytes, understood them or followed the answer policy. Even
  matching document hashes establish only publisher-relative byte agreement.
- Existing conversations can contain other context. The website neither reads
  that history nor proves its continuity. A new conversation is a separate
  choice, not a guarantee about all hidden client context.
- The earlier `read_request`, `read_index`, `read_document` and `submit_answer`
  tools belong to the superseded Q&A experiment. They are not the current
  native handoff and do not replace Work, Participant, Act and Relation.
- No arbitrary client compatibility, independent execution proof, maintenance
  savings or answer-accuracy improvement is claimed.

Run the synthetic checks with:

```sh
npm run test:pilot
```

Synthetic tests do not invoke an Agent or qualify a desktop URL handler. The
current candidate and the earlier experiment have different checks; browser
and actual-client observations are recorded separately in
[QUALIFICATION.md](QUALIFICATION.md).

The baseline question is whether maintained client routes remove useful work
for participating publishers and reduce visitor friction compared with copy
and paste. Context integrity, clear conversation choice and honest fallback
matter. Whether these adapters justify shared maintenance remains unmeasured.
