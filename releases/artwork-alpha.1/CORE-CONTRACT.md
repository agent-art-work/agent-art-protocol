# MCP candidate consumer contract

Frozen internal candidate: `@agent-art/artwork-sdk@0.0.0-mcp.1`, private and
unpublished. The first-class user is an artist working with a coding Agent.
This candidate lowers the entry cost through a reusable owner/evidence runtime,
small MCP methods and an installed two-Work example. It does not supply a hosted
platform, production login, Agent inference or a ready-to-install curator plugin.

This is a new API candidate, not a drop-in upgrade of `0.0.0-m7.2`. Previous
archives, reading SDK0.1.4 and reading releases remain separate and immutable.
No registry publication, deployed site, account connection or new Agent call is
part of this contract. Use the exact archive and matching consumer lock.

## Four supported imports

| Import | Contents / boundary |
| --- | --- |
| @agent-art/artwork-sdk | Pure schema/byte contracts, refs/digests, supplied-fact authority/context checks, return compiler/reducer and typed method value validators. No owner, storage or authentication is imported. |
| @agent-art/artwork-sdk/owner | ParticipationOwner and validateSetup. Trusted setup/admin and scoped facade over one authoritative version-2 SQLite store per Work. |
| @agent-art/artwork-sdk/mcp | createParticipationAdapter, TOOL_CATALOG and ADAPTER_INFO. Raw tools/list and tools/call handlers; no initialization, connection, listener or transport. |
| @agent-art/artwork-sdk/testing/inert-resolver | InertPrincipalResolver. Synthetic, process-local test authority only. Never production login or token validation; not imported by the three production entries. |

Internal source/store paths are not supported imports. JavaScript source/package
exports are not a security sandbox against someone controlling local files.
The candidate supports the qualified Node22.23.4 / macOS arm64 / SQLite3.53.4
cohort. Native runtime prerequisites are not bundled or automatically installed.

## Artist and coding Agent responsibilities

Define the actual Work frame, Agent room/refusal, participation/progression,
application formats/rules and presentation. Build the app's Human input/consent
surface, Agent attribution/visibility choices and selected account. Supply exact
schema Work/Binding/Participant/Context/Manifest records and policy definitions;
declare only what the app actually enforces. The example assembles these from
two readable app configurations; it is not a complete Work-authoring language.

Initialize/open the authoritative owner once per Work and share it across app
and MCP adapters. Store the expected identity outside the database and preserve
old records/operations on reopen. Trusted app code enrolls invited declared
Agents with operator-declared terms, publishes Context and records separate app
Reports/inspection selections. A connected host does not itself authorize a Work.

Artist code owns renderers and their safety/format checks. SDK recording preserves
permitted UTF-8 originals, including text/SVG/HTML, without executing or parsing
their artistic format. Recording, Act attribution, app acceptance, selection,
transformation and observed rendering are distinct claims. Audience interpretation
of intention/artistic quality remains outside technical checks.

## Owner API

`ParticipationOwner.initialize({directory, setupJson, clock?})` creates a fresh
project. `open({directory, identityJson, clock?})` reopens its exact expected
Work/Binding/owner/receiver identity. `describe()` returns identity/policy/settings;
`close()` releases ownership. No automatic migration/reset or database-per-call.

Setup is closed JSON: work, binding, owner, receiver, mappingRules, relationRules,
policy and bootstrapUntil. Policy explicitly commissions writeMs, recordsMs,
dataMs, recoveryMs, maxActive and maxEntries within the selected finite profile.
Fixture defaults are not real-Work promises. Absolute canonical/private filesystem
paths are native app inputs; never tool arguments or public records.

Trusted administration methods accept serialized JSON unless stated otherwise:

- enroll: principal, participant record, terms RuleRef and notAfter; returns the
  declared enrollment/source Grant. This does not collect or authenticate Human
  consent. setActive takes a principal string and boolean; revokeGrant takes a
  serialized exact Grant ref. Their changes do not rewrite old evidence.
- publishContext: package, readers and until. The exact selected package uses
  work/context refs, Manifest record, records and UTF-8 carriers. withdrawContext
  takes an exact serialized Context ref. Imported records do not appoint trusted
  Grant roots or establish their issuers' authenticity.
- appendAppReport: serialized owner-issued Report and an ISO deadline string.
  No acceptance/rendering callback runs during capture or retry.
- publishInspection: selection Name, Manifest record of existing exact records/
  data, readers and until. Leases are at most five minutes and clipped to actual
  source/reader availability. withdrawInspection takes a serialized Name.
- inspectRecord/inspectData take exact serialized refs for trusted owner use.
  retire takes subject and reason. Retention protects shared obligations and
  Receipts/pending originals; retirement is not secure erase or backup deletion.

`bind(authReader)` accepts a trusted authentication observation JSON or synchronous
reader returning it: verified, principal and notAfter. Production authentication
must establish those facts; a curator-supplied boolean is not identity. Principal
continuity cannot change within a bound facade. The facade exposes:

| Method | Inputs / effect |
| --- | --- |
| resume | Optional serialized {cursor}; own Work/permission summaries and recovery index under actual rights. |
| readContext | Current exact selected package; no private chat or locator fetching. |
| prepare | Serialized {context, prepareId, revisionOf?}; durable exact reservation or recovery/conflict. |
| submit | Handle, serialized expression and optional serialized reservation DataRef. MCP always supplies the reservation. Pin then record under the same owner. |
| pin / finish | Local separation of durable exact intent staging from admission/recovery; not separate public MCP tools. |
| status / cancel | Handle; independent own-outcome recovery or authorized resolve-and-fence. Existing commits win. |
| inspect | Serialized {selection, cursor?} or {selection, data?}; one selected record/projection page or exact original. |

Durable preparation, not MCP request ID, fixes the operation. Exact retries keep
the old descriptor/IDs/deadlines and first pin's request/capture timestamp. Changed
intent conflicts; a new prepareId means a deliberate new operation, not recovery.
Separate source/capture/recovery/failure-finalization Grants are current checks.
Missing authority, technical failure, no response and null never become an Agent
refusal. Refusal is explicit `{form:"refusal",statement?:Text}`. A material is
`{form:"material",mediaType:Text,text:Text}`; empty bytes are valid recording data.

Native owner errors have fixed codes. Unknown commit/rollback leaves uncertainty;
reopen/status exact recovery precedes replacement. Never treat a thrown call as
proof of noncommit. Protected operation/Grant/request metadata survives primary
artwork retirement under stated recovery rights; it is not hidden chat capture.

## MCP method / identity interface

`createParticipationAdapter({resolver, works})` takes a trusted resolver and at
most 32 routes `{work:Name, identity, getOwner}`. getOwner returns an already-open
owner with that exact expected identity. Unknown/rebound routes fail closed.
The resolver implements synchronous check(trustedContext), returning true, and
resolve(trustedContext, work), returning the trusted owner auth-observation JSON.
It must authenticate outside tool data and recheck revocation/expiry on calls.

`dispatch(rawJson, trustedContext)` returns serialized JSON-RPC for tools/list or
tools/call. It retains raw lexical admission; do not replace raw bytes with
JSON.stringify of already-decoded arguments and claim equivalent checks. IDs are
nonnegative safe integer tokens or strings up to 128 UTF-8 bytes. There is no
initialize/session/transport implementation; notifications/batches are unsupported.

The seven tools are resume_work, read_context, prepare_return, submit_expression,
return_status, cancel_return and inspect_process. Every tool requires an explicit
Work route; no global current Work. Closed arguments accept no principal, caller,
Grant or model identity. The catalog/typed validators define their exact fields.

Requests are bounded to 2 MiB. Results have one typed structuredContent plus a
short summary, at most 1 MiB for the actual entire JSON-RPC frame and 1 KiB summary.
Oversize is withheld, never silently truncated; independently valid components
may not fit a combined result. Finite errors expose no native diagnostic text.
Method completion, Receipt commitment and artistic/app outcomes remain distinct.
All current tools have readOnlyHint=false because even reads may persist clock/
closure metadata. Hints do not authenticate or enforce permission.

Production transport/OAuth, actual service-principal continuity, consent collection,
MCP handshake/headers/collection/concurrency/timeouts, host confirmations and a
real client/Agent journey remain unqualified. The included inert resolver is
deliberately confined to testing. No external service is activated by importing
the SDK; runtime admin code and real deployments remain the operator's authority.

## Installed proof and evidence limits

The included example is invented and no-client. App-owned configurations assemble
two different Works; one method adapter uses the same runtime over both owners.
Tests cover multiple rounds, own revision/refusal, original bytes, separate app
treatment, scope/retry/cancel/recovery and selected inspection. No renderer or
Agent/model is invoked. A passed fixture does not qualify authenticated origin,
private intention, complete context or independently observed display/consequence.

Original SDK code is MIT. Bundled dependencies retain their included licenses and
notices. The exact archive/inventory/consumer lock establish selected bytes, not
independent provenance or universal security/conformance. Source changes require
a new archive/inventory and matching installed proof; preserve prior artifacts.
