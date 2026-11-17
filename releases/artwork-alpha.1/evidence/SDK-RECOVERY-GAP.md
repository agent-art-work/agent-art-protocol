# Stage3 recovery gate — frozen SDK cannot yet qualify ordinary backup/restore

Observed locally on 2026-11-17 with the pinned private artwork-sdk0.0.0-mcp.1,
Node22.23.4 / SQLite3.53.4, macOS arm64. This is a production-readiness blocker,
not a claim that existing restart/receipt recovery is broken.

## What was actually tested

`recovery-qualification.test.mjs` uses disposable synthetic stores only:

| Check | Result |
| --- | --- |
| Standard SQLite with a live WAL writer, separate read-only connection and Node's online backup API | The independent copy contains committed WAL data. Source DB/WAL bytes stay unchanged and the writer continues. |
| Same separate read-only approach against the live frozen SDK owner | Reads are refused by the retained exclusive lock. Pausing application requests does not release that lock. |
| Byte-identical copied SDK DB after the synthetic owner has closed | Opening the copy at a fresh path/inode through the public owner API fails with `store_identity_mismatch`. |
| Reopen the untouched original with the same identity | Succeeds. Existing native restart and exact receipt recovery remain supported. |

The frozen store binds its local path/device/inode and keeps an exclusive SQLite
owner. Those safeguards cannot be bypassed by Signatures. Ordinary file copying
is not a qualified recovery procedure. The rejected encrypted-backup prototype
was removed; there is no partially working backup/restore feature exposed through
the service, CLI, HTTP or MCP. No real service was stopped, no source WAL/SHM was
removed and no real private case was backed up or restored.

## Required supported SDK handoff

1. An owner-controlled consistent snapshot API or a documented qualified procedure
   that preserves committed data without weakening exclusive ownership, changing
   store PRAGMAs or requiring Signatures to access the internal DB connection.
2. A supported restore/relocation boundary that validates the preserved Work,
   binding, exact originals, receipts and operation authority at a fresh location.
   Signatures must not rewrite SQLite identity/binding rows or patch frozen bytes.
3. An explicit rollback/reconciliation policy. An older snapshot cannot prove the
   latest outcome or restore a revoked selection as fresh authority. Until
   reconciliation, restored operation writes/renewals must remain fenced. Restored
   availability must not silently extend record/data/recovery deadlines.
4. A separately versioned, pinned and qualified consumable SDK candidate with
   tests for failure during capture/restore, committed/pending operations, refusal,
   interrupted artist treatment, expiry/withdrawal, version mismatch and corrupted
   archives. Existing frozen qualification does not transfer to new bytes.

Signatures can then add a small operator adapter using mature SQLite backup and
authenticated AES-256 encryption, with separately managed keys, fresh restore
destinations and actual restore tests. It should not grow a parallel generic
recorder or repair SDK storage internals. A selected portable account is also not
an authoritative owner-store backup: selections intentionally omit material and
do not reproduce pending-operation/recovery authority.

## Current availability contract

Results/status now name actual SDK `recordsUntil`, optional `dataUntil`,
`recoveryUntil`, membership expiry and the earliest private result-access deadline.
The service still commissions at most 72-hour membership/record/data windows and
seven-day protected receipt recovery. Saved image files are separate artist
storage; their presence does not renew those permissions, prove physical erasure
or promise permanent access. `backupRestoreQualified=false` is explicit metadata,
not a new warning for ordinary gallery visitors.

Long-term archive/availability and the real server platform remain decisions and
qualification gates. Do not describe Stage3 as complete or promote public durable
participation on the strength of filesystem persistence alone. Stage4 surface
work can proceed locally while this SDK handoff is pending.

API basis: [Node22.23.4 SQLite online backup and read-only connections](https://github.com/nodejs/node/blob/v22.23.4/doc/api/sqlite.md).
