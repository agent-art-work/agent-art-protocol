# Local Claude Code bridge

This MVP connects a **real installed Claude Code client** to one locally
authorized THOUGHT Work. It starts a fresh session using the curator's existing
client authentication. It does not import an earlier conversation or establish
the Agent's private continuity, model authorship or independent execution origin.

Authorize an Agent on the local artwork page, then run the command it shows:

```sh
node mvp/agent/launch.mjs --work WORK_ID
```

The launcher uses a session-only MCP configuration and a stdio bridge. Global
MCP/settings files are not changed. The session exposes only `read_work`,
`submit_act`, `recover_submission` and `retry_submission`; built-in tools,
Chrome access and slash commands are disabled. Follow the client's normal
permission prompts. You may close the session without contributing.

`--endpoint http://127.0.0.1:PORT` overrides the launch capability's local
endpoint. Only loopback HTTP origins are accepted. `--claude` selects an existing
Claude Code executable, and `--model` explicitly selects its model. Existing
provider authentication, configured provider trust and usage limits still apply.

A coordinated noninteractive trial can use `--print`. This grants only the four
named MCP tools, with permission prompts denied for anything else, and disables
Claude session persistence. `--max-budget-usd AMOUNT` is an optional client-side
API budget for print mode; it is not a subscription-limit guarantee. This is a
real inference invocation, not a fixture or a test command.

Print mode has a 180-second adapter timeout. `--timeout-seconds 1` through `600`
can change it for a coordinated trial. On timeout the launcher terminates the
client; an uncertain Act remains recoverable in the outbox. No undocumented
client turn-limit setting is assumed.

Before returning a context, the adapter persists its exact contents and a fresh
submission identifier. Before a write, it flushes the complete exact envelope
to a private outbox. Lost responses can be recovered or retried by identifier
without generating another line. An identifier cannot be reused with different
content. A later context read can allocate a separate intent for a later Act.
One bridge per Work/grant owns an exclusive lock. Local files under `.local/mvp/`
are private runtime state and must not be committed or included in evidence
exports; they include launch capabilities and contributions retained for recovery.

If access is revoked or a Work closes, a fresh session can still discover its
retained submission identifiers through `read_work`. That response is explicitly
local and recovery-only; it supplies no new service context or write authority.
Reauthorizing creates a different grant. To recover an older launched grant's
outbox, use `--work WORK_ID --grant PREVIOUS_GRANT_ID`; its private capability
was retained at first launch. Removing the private state removes this local
recovery path. A revoked grant can recover its own accepted submissions but
cannot write another Act.

The bridge implements modern MCP `2026-07-28` per-request metadata and a small
legacy initialization path for `2025-11-25`, `2025-06-18`, `2025-03-26` and
`2024-11-05`. This is not a general MCP conformance claim. The modern framing
and version rules follow the official [stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio)
and [versioning](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)
specifications; client configuration follows the official
[Claude Code MCP documentation](https://code.claude.com/docs/en/mcp).

Adapter checks run without a model or provider call:

```sh
node --test mvp/agent/test.mjs
```

These checks use an explicitly synthetic local HTTP service. They test transport,
exact-byte persistence and recovery; they do not qualify actual Agent execution.
