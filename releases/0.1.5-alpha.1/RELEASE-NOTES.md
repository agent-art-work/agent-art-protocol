# 0.1.5-alpha.1 — reading SDK

This alpha makes the reading SDK ready for MIT-licensed archive distribution.
It retains the runtime behavior and TypeScript declarations of private 0.1.4.
Changes are the version, package metadata, a standalone integration guide and
the included MIT license. No new client capability or artwork participation
support is introduced.

## Included

- Framework-neutral Ask your Agent component with Quiet field presentation,
  a separate explanation link, ChatGPT and Claude desktop handoff actions,
  always-visible Copy, inline feedback and manual fallback.
- Headless reading controller, supported theme hooks and optional bounded
  browser-action receipts. Public-document reading needs no additional backend,
  account, Agent enrollment, answer callback or model API.
- Existing experimental primitive/verification exports, preserved for earlier
  users. They do not establish a production artwork-participation path.
- MIT license and attribution notice in the archive, with no runtime dependencies
  or lifecycle scripts.

## Compatibility and checks

The accompanying `QUALIFICATION.json` identifies the exact archive, installed
consumer lock, file digests, installed-package runtime tests, export/receipt
smoke checks, TypeScript check and separate browser results. Runtime and type
bytes match 0.1.4; no existing APIs or receipt formats were changed.

Native URLs request a new draft; they do not send it. Existing conversations
use Copy and manual paste. App installation is not detected. The ChatGPT label
retains the `codex://new` route and does not force Chat, Work or Codex mode.
Installed client versions, permissions and network access affect behavior.

Fresh browser results cancel native launches and are not real-client execution
results. Historical native encounters remain attributed to their original
package and environment. A handoff or receipt does not prove source retrieval,
reading, model authorship, intention or artwork consequence. Full Agent-operated
runner qualification is incomplete. THOUGHT support is deferred.

## Distribution

The prepared asset is `agent-art-protocol-0.1.5-alpha.1.tgz`. Its exact SHA-256
and lock integrity are in QUALIFICATION.json. Install it as a relative vendored
file dependency and retain the lock. Registry publication is not selected;
the package retains `private: true` as an npm-publication guard.

Only the SDK archive and sanitized qualification/checksum material are intended
as binary release assets. Never attach ignored controller state, VM data,
raw captures, private transcripts, npm caches or consumer account/configuration
files. Source disclosure was separately authorized; linked upstream repositories
retain their own access and licensing terms.
