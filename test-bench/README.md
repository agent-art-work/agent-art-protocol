# Reading interoperability test bench

A local development instrument for Lab reading through Claude desktop and the
Codex desktop URL handler. Browser checks and real-client observations have
separate reports and provenance. This is not a visitor-side helper or a new
protocol requirement. THOUGHT and artwork return paths remain deferred.

The bench imports the installed private **0.1.4 local candidate**, selected by
[sdk-candidate.json](sdk-candidate.json). It does not use a replacement component.
The historical 0.1.2 and 0.1.3 packages and findings remain preserved. Its public invitation is
copied exactly from the Lab's pinned canonical source, without adding a case
ID, a question, a callback URL or instructions to an Agent to report back.

The bench is a developer test page, not another public reading application or
a service between a site and its visitor's Agent. The component at its top is
the installed SDK under test. The two result tables below distinguish what
the browser requested from what was actually observed or reported in a desktop
client. A run is one local test record tied to exact package/context pins;
**New run** starts a fresh record, not an Agent conversation. **Download local
run JSON** exports that record and its summary, not an Agent transcript.

The [0.1.3 design](../spec/0.1/COMPONENT.md#quiet-field-default-in-the-013-local-candidate)
replaced the default presentation with Quiet field. The current
[0.1.4 candidate](../spec/0.1/COMPONENT.md#action-and-copy-feedback-in-the-014-local-candidate)
retains it and refines action glyphs and inline Copy feedback. It has its own
archive, explicit input pins, matching consumer lock and
[qualification](../pilot/reading-sdk-014/README.md).
Earlier green tests or desktop observations cannot be relabeled as results for
that candidate. An older running bench keeps the inputs loaded at startup;
use a fresh run on a newly started candidate bench instead of reusing an old
run fragment.

## Start

```sh
npm run sdk:prepare
npm run bench
```

Open `http://127.0.0.1:4180/?lane=browser`. Use `-- --port 4181` to choose a
different port. An occupied port is reported; no existing process is stopped.

- **Browser checks** cancel native links before OS launch. Copy remains the
  real SDK action when used interactively.
- **Desktop trial** enables ordinary explicit native clicks. Review the
  destination and draft in the app, then send there when testing continuation.
  No automatic Send, app-mode setting, permission change or retry is supplied.
- Both views share a run through its URL fragment. Refreshing the page retains
  that run. **New run** starts an empty record with the current pinned inputs.

This server binds only to loopback. Same-origin APIs and an in-memory write
capability protect the local observation endpoints; ordinary top-level page
navigation remains possible. These are development safeguards under trust in
the machine owner, not remote authentication or an independent witness.

## The two result lanes

| Lane | What is checked or recorded | Boundary |
| --- | --- | --- |
| Browser | Exact retained invitation, decoded native payloads, Copy/fallback, canceled navigation, layout and installed package pins | Does not establish desktop arrival, sending, retrieval or visible completion |
| Real client | Draft arrival, actual surface, exact public-draft comparison when available, sending, permission, source access and visible orientation | Attributed UI observations or operator reports; no independent model-origin or private-intention proof |

```sh
npm run test:bench
npm run bench:browser
npm run bench:report -- .local/test-bench/runs/<run-id>.json
```

`test:bench` uses synthetic declarations and disposable loopback fixtures. It
does not invoke an Agent. The repository's `npm test` includes these tests.

`bench:browser` verifies regular stable Chrome's bundle before launching an
owned disposable profile. The Quiet field browser cases cover desktop
light/dark, 320px light/dark, 390px dark and signal-only/independent public
color overrides. The 0.1.4 checks also inspect the stable-width **Copied**
state, name-only underlines, coherent Copy glyph, three-second reset, repeated
Copy attempts, denied clipboard fallback and cleanup on destroy. Both Copy
states must fit the recorded 257px container in a 320px viewport; wider
site-preview fit does not substitute for that check. The suite also checks
runtime radius changes, reused DOM behavior fixtures and observer teardown.
The historical 0.1.2 selection retains its
original four viewport cases. Native clicks have a second cancellation guard, and clipboard
success/denial is isolated from the OS clipboard. External requests are
blocked. Its report and screenshots go into a new ignored
`.local/test-bench/browser/<timestamp>/` directory. `-- --output <directory>`
selects a destination explicitly. Each report says `realClientResults: not-run`;
successful browser tests never populate desktop results. Screenshot inspection
is a separately recorded human/agent activity.

The [initial qualification](QUALIFICATION.md) preserves the 0.1.2 failure at
320px. The preserved [0.1.3 qualification](../pilot/reading-sdk-013/README.md)
records its own fit results. The 0.1.4 candidate must check both ready and
copied states under default system fonts; neither a prior pass nor a failed
preliminary archive is relabeled as this archive's result. Explicit
`packagePin: null` in the input
loader selects the historical 0.1.2 package and qualification.

## Real-client procedure

1. Enter **Desktop trial** with one known run. Inspect **Build, source and
   environment**. The bench records installed macOS/browser/app bundle versions;
   it does not claim those identify a model, runtime policy or account.
2. Choose Claude or ChatGPT once. The ChatGPT label requests `codex://new`;
   record the destination actually observed, including Work or Codex. Accepting
   a browser open prompt is distinct from draft arrival.
3. Inspect only the new test composer. Record draft arrival separately from
   exact-text equality. The optional public-draft comparison hashes text locally,
   clears the text, and stores only a matching digest when the operator appends
   that observation. The recorded method is `operator-pasted-text-sha256`;
   textarea line endings may be normalized. It cannot authenticate where pasted
   text came from or prove raw composer/transport bytes.
4. When testing continuation, review and send once in the app. Use its normal
   permissions. Record denied/expired approval, access failures and unavailable
   results explicitly. The bench does not replay an uncertain operation.
5. Inspect index access and the visible orientation independently. A tool's
   processed representation, raw response bytes, an Agent's own retrieval claim
   and complete document reading are different observations. The canonical
   no-question invitation asks for an introduction, not a whole-corpus download.
6. Append results using the form and download the local record if needed. App
   inspection restrictions leave direct observations unavailable; an operator
   report retains that source class. Manual Copy into an existing conversation
   is a separate chosen path, not automatic conversation attachment.

The form offers operator reports. A desktop UI observer can append scoped
`desktop-ui` observations through the same validated local API. Browser
automation cannot claim real-client facts. Positive real-client observations
require pinned OS/app versions, the actual destination and a named method.

Results retain `requested`, `observed`, `operator-reported`, `failed`,
`not-observed` or `not-run` for individual claims. Contradictory declarations
remain in the record and produce a `mixed` summary. No all-client success,
genuineness, Agent authorship or intention flag is produced.

## Public pins and private local records

[lab-work.json](lab-work.json) reproduces the public Work from Lab commit
`225d09591ae6ba012176f1cc002738e9d6fef11f`.
[lab-source.json](lab-source.json) records its public source path, source/Work
digests, exact invitation digest/byte count and SDK archive pin. The Work's
reference index remains live; pinning the invitation does not pin fetched index
bytes. Loading the bench performs no source acquisition or inference.

`loadBenchInputs()` checks the archive, all 11 installed SDK files and dependency
lock, then asks the installed SDK to retain that exact Work. A changed SDK or
Lab invitation requires explicit source/pin updates and new checks. A stale
tab or previously opened client draft is not refreshed by updating these files.

Run files are private local JSON in ignored `.local/test-bench/runs/`. Each
pins the inputs and environment and appends bounded observations. Downloaded
JSON includes the run and its summary; `bench:report` accepts either that
download or a stored run. Validation establishes structural consistency and
scope, under trust in the named observer and local operator. An operator can
fabricate or edit a coherent record. These are bench records, not SDK receipts.

No private conversation IDs, account identifiers, transcript or answers are
collected automatically. Notes are optional, limited to 240 characters and
must contain only public test facts. Draft comparison text stays in the browser
and is discarded. Screenshots from automated browser checks contain only the
public local bench. Review any additional evidence before sharing it.

The server has no Agent callback, model API, document-fetch service, enrollment
or persistent browser storage. Local files remain until the machine owner
deletes them; no background retention service is added to public reading sites.
