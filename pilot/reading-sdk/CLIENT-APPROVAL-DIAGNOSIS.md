# Reading handoffs: permissions and destination errors

Recorded 2026-10-20 after two operator-run Lab reading handoffs. This is a
bounded diagnosis of those observations, not a new client qualification or a
fix for the destination application's approval system. SDK 0.1.1 is unchanged.

## Finding

Both visible chats ended with:

> That approval request is no longer active. Please retry the action if you
> still want ChatGPT to continue with it.

The associated execution records nevertheless completed with substantive final
answers reporting successful retrieval of the public Lab index. There is no
demonstrated SDK encoding or routing defect behind this symptom. There is an
unresolved mismatch between destination execution records and the visible chat
outcome. These trials do **not** qualify a reliable end-to-end reading experience.

The Lab session associated the chat and execution records by matching their
invitations and nested execution times; this review checked the same features.
The operator reported the two recent runs but did not supply those pairings.
The inspected app responses exposed no explicit parent link or destination
approval lifecycle. The exact cause of the expired-approval message remains unknown.

## What was checked

| Observation | Trial 1 | Trial 2 | Evidence limit |
| --- | --- | --- | --- |
| Visible invitation | Same Lab index-reading invitation | Same invitation | Serialized chat and execution messages, not native composer bytes |
| Command-line retrieval | Failed to connect to the runtime's configured proxy; HTTP 000, zero bytes | Same failure | Command output was available; this does not establish that the public site was unavailable |
| JavaScript fallback | Three completed tool calls | Three completed tool calls | Call arguments and completion states were exposed, but returned MCP payloads were not |
| Execution final answer | Reported HTTP 200, 17,984 response bytes and 18 indexed documents | Same reported totals | Assistant reports, not an independent rehash of fetched bytes in this diagnosis |
| Document bodies | None selected or fetched | None selected or fetched | The invitation included no substantive question |
| Visible chat outcome | Inactive-approval error after execution ended | Same error after execution ended | Timing alone does not identify the internal cause |

Both execution answers distinguished index inspection from document reading.
They reported the index's declared revision without recomputing its derivation.
Neither established formal JSON Schema validation or independently authenticated
source provenance. One execution initially overlooked the index revision in an
intermediate check, then inspected it and qualified the final answer.

The compared publisher invitation came from the immutable Lab source commit
`d658be2cc19307d113e64bd3fa0b2ad56a0a4bfc`, `docs/AGENT_ACCESS.md`:

```text
UTF-8 bytes: 516
SHA-256: ab46fe2b82605d6e06fca7cfc5e2f99aeaa3b1bedc37dada60c46e681f756845
```

All four inspected message representations matched one another. They wrapped
the index URL as a Markdown link, unlike the plain URL in the source invitation.
Replacing that link with its identical URL made the text match the source.
This supports matching visible content; it does not establish raw byte equality
at delivery or identify where link serialization occurred. No dropped question,
truncated context or altered index destination was evidenced.

## Three different permission boundaries

1. **Opening an app.** A browser or operating system may ask before following
   the native URL. SDK 0.1.1 performs ordinary navigation on a visitor click;
   it cannot guarantee that the destination opened or received the draft.
2. **Sending and using tools.** The visitor reviews and sends in the Agent
   client. The client/runtime controls source retrieval and tool permissions.
   The observed `node_repl` request concerned running a JavaScript tool after
   other retrieval paths failed. It was not an SDK permission request.
3. **Recording a browser receipt.** Optional SDK receipts describe a local
   handoff request. Their callback is not an Agent answer channel, an approval
   grant, an execution receipt or evidence that the index was read.

The SDK cannot bypass the destination's authorization. It also does not require
every public reading request to invoke a JavaScript runtime or display a new
approval dialog. Existing permissions, available retrieval tools and destination
policy determine that friction. Publisher guidance can favor permitted existing
HTTP tools and report unavailable checks, but cannot enforce a client's tool
selection or silently expand its permissions. A permission-free experience
across clients is not a supported promise.

OpenAI's [permission documentation](https://learn.chatgpt.com/docs/permission-modes)
describes automatic review for eligible requests without expanding the sandbox.
That general behavior does not establish the selected mode in either test or
explain this particular MCP approval prompt. Its
[troubleshooting guide](https://learn.chatgpt.com/docs/reference/troubleshooting)
also distinguishes environment and policy constraints. Neither page establishes
the cause or a verified fix for the observed inactive-approval error.

## SDK boundary and recovery

The [route builder](../../protocol/clients.mjs) URL-encodes the retained context.
The [reading controller](../../protocol/reading.mjs) prepares the plan, and the
[component](../../protocol/reading-ui.mjs) follows it on an explicit click. The
SDK has no approval identifier, execution identifier, destination conversation
inspection or answer callback. It does not fetch the index or configure proxies.
The focused client/controller checks passed: 12 tests, no live Agent launch.

An expired-approval message alone does not prove that no execution occurred.
Inspect the destination's available result and pending state before choosing a
recovery action. Do not automatically send the invitation again, replay an
approval or create a new conversation to hide an uncertain outcome. The
operator may explicitly choose another read-only attempt after checking the
previous one; no retry was performed as part of this diagnosis.

Copy remains available for a visitor-chosen conversation. It avoids dependence
on native URL delivery, but does not remove the destination's tool permissions
or establish that this approval/output symptom will disappear. Broad runtime
grants, forced app modes, proxy changes and security-setting changes are not
required or supplied by the reading SDK, and were not performed here.

## Ownership and remaining work

Lab owns the invitation's initial behavior when no question is supplied and the
index's verification instructions. Its session reports adding an explicit
orientation branch and clarifying format-version identifiers, index-revision
serialization and decompressed response versus source bytes. Those are publisher
changes; they do not repair or qualify the destination's approval lifecycle.
No new native Agent trial of those changes was run in this diagnosis.

The protocol repository owns the reusable handoff boundary and accurate claims
about it. This note supplements the historical
[SDK qualification](QUALIFICATION.json) without rewriting it. No packaged input,
archive, dependency lock, client mode or historical trial result was changed.
SDK 0.1.1's archive SHA-256 remains:

```text
2c179f487aa71cd0b769c5c70cca8786275111e33f1936de11536531b4012c18
```

Still unresolved: the destination's expired-approval/output mismatch, a reliable
user-visible completion for this path, and qualification of Lab's revised
invitation in a future operator-authorized native trial. Successful retrieval
also remains separate from verified document reading, Agent authorship or
intentional artistic participation.
