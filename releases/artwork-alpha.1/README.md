# Artwork SDK alpha.1

**Prepared 2026-11-17; not published.** For an artist working with a coding
Agent: build your participation app and artistic rules, and reuse a shared runtime
to preserve exact contributions, receipts and a permitted account of what happened.

This is a proposed **SDK distribution**, not a versioned protocol standard.
The protocol schema remains candidate. The distribution name `artwork-alpha.1`
identifies a tested pair of unchanged packages:

| Package | Role |
| --- | --- |
| `@agent-art/artwork-sdk@0.0.0-mcp.1` | One authoritative participation owner/store per Work; exact originals, scoped returns, receipts, recovery and selected inspection; raw MCP method adapter |
| `@agent-art/participation-account@0.0.0-account.1` | Optional pure account assembler, bounded collector and local inspection source over the same owner |

Package versions deliberately retain their qualified identities. They are not
renamed to match the release label. Their archived README files describe the
original internal packaging checkpoints; this guide supplies the later alpha
cohort and qualification context. `private: true` prevents accidental registry
publication and does not prevent installation from these local archives.

Start with [installation](INSTALL.md), give your coding Agent the
[artist/Agent brief](ARTIST-AGENT.md), and read the [support limits](SUPPORT.md).
The frozen [core contract](CORE-CONTRACT.md) specifies the owner and method APIs;
the [companion guide](ACCOUNT-CONTRACT.md) specifies account composition.

## What is ready

The exact core archive passed two clean installed no-client proofs. The exact
core/companion pair passed a clean offline installation and 17 synthetic cases.
Signatures then integrated that pair into its own fresh synthetic app runtime:
its owner reports 67 consolidated checks passing, including eight account cases.
See [qualification](QUALIFICATION.json) and the selected [evidence](evidence/).
These results have different scopes; the test counts must not be added together
or described as a new live-client qualification.

The artist owns Work framing, participation choices, consent/authentication,
the app, renderer, consequences and audience presentation. The SDK preserves and
checks specified evidence. Audiences interpret intention and artistic quality.
Agent Art does not require protocol use or a separate curator.

This snapshot supplies no inference, managed service, production login, complete
MCP server, installed desktop connector or curator plugin. Recording text labelled
as SVG is not SVG execution or rendering safety. A selected account is not a
complete history, a backup or independent proof of model origin.

## Prepared files

- `consumer/` contains the exact previously tested package manifest and lock,
  plus the two original archives in `consumer/vendor/`.
- [ARTIFACTS.json](ARTIFACTS.json) identifies packages and retained provenance.
- [MANIFEST.json](MANIFEST.json) and [SHA256SUMS](SHA256SUMS) identify this snapshot.
- [verify.py](verify.py) checks files, both inner inventories/notices and the lock
  without extracting packages, installing dependencies or executing SDK code.
- [RELEASE.md](RELEASE.md) records preparation and the remaining publication gate.

Original code/documentation is [MIT](LICENSE). Dependencies retain their original
MIT, Apache-2.0 and BSD-3-Clause terms and included notices. Artwork rights and
publication/consent remain with their actual owners. Reading SDK 0.1.4 and the
Ask your Agent reading releases are unchanged and separate.
