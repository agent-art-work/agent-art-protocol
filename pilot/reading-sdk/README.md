# Packaged Ask your Agent: SDK 0.1.1

Historical 0.1.1 integration and qualification. The current launcher and package
follow the [0.1.2 candidate](../reading-sdk-012/README.md); the commands and pins
below describe the preserved 0.1.1 inputs, not a claim about that new archive.

Lab is the **single active local test consumer**. The SDK now contains the
selected compact Open bubble / Seal component: a small noninteractive
**Ask your Agent** label, **ChatGPT**, **Claude** and always-visible **Copy**.
The label and actions share one background and stay on one line. ChatGPT mode
is left to the app; Claude deliberately uses its Chat endpoint. The old
four-consumer integrations remain historical records.

```sh
npm run pilot:lab
```

Open [the local Lab preview](http://127.0.0.1:4174/). The launcher uses the
isolated `.local/reading-v011-lab` clone, validates its full patch and archive,
checks all 11 installed package files, builds and serves it. Running this
isolated launcher changes no owner checkout or live site. `--prepare-only` builds without
serving; `--no-build` serves the prepared output. `--no-desktop-discovery`
disables the local endpoint and exercises discovery-failure fallback. The no-callback
SDK default is covered separately by the DOM fixtures and public-origin adapter. The former `--open-gate`
flag is accepted but unnecessary; it no longer selects a separate UI.

## Developer ownership

Lab owns its canonical prompt in `docs/AGENT_ACCESS.md`, the public index,
reading/answer policy, site and Work definition. Its static build copies the
five browser runtime/style files from the installed package. A small adapter
imports `mountReading` from that package output and supplies the Work. It no
longer carries an independent presentation implementation.

The SDK owns the mark, compact layout, accessible controls, prepared desktop
URLs, exact-context Copy/manual fallback, optional bounded receipts and
teardown. Public reading requires no helper, account, callback or database.
The [API guide](../../protocol/README.md) covers bundler and static imports.

Call this the **Ask your Agent component**. The SDK owns the mark and structure;
Lab controls its theme and placement. The
[styling guide](../../spec/0.1/COMPONENT.md) lists the supported CSS hooks and
their actual defaults. The proposed identity/About link remains discussion;
the released label is noninteractive.

Lab separately completed its operator-authorized agentart.work rollout on
2026-10-21, according to its owner session's live verification report. The
[rollout record](../dogfood-0.1.1/README.md#lab-rollout-completed-2026-10-21)
keeps those site release findings separate from this isolated SDK qualification.

ChatGPT keeps `codex://new?prompt=…` and the internal `codex-app` identifier;
Claude keeps `claude://claude.ai/new?q=…`. These prepare a new desktop draft.
The visitor reviews its destination and sends there. Existing conversations
use Copy and manual paste. The component does not select ordinary Chat,
Work or Codex. Prior operator-mediated draft observations retain their limits
in the [historical design trial](../open-gate/QUALIFICATION.json); no new
native-client trial was performed for this archive.

The later [permission and destination-error diagnosis](CLIENT-APPROVAL-DIAGNOSIS.md)
records two operator-run reading attempts whose execution results and visible
approval errors disagreed. It documents unresolved client boundaries without
changing the package or treating those attempts as successful end-to-end qualification.

[Native destinations and text formatting](NATIVE-HANDOFF.md) distinguishes the
chosen Claude Chat endpoint from app-controlled ChatGPT destinations, records
the operator's later surface observations, and explains publisher-owned prose
formatting without silently changing the retained context.

Only the local Lab host injects a callback reporting allowlisted Mac desktop
app IDs through its same-origin, loopback-only endpoint. The SDK itself does
no probing or network discovery. Public pages omit this callback and offer
configured routes without claiming installation. An empty successful report
leaves Copy; failures and timeouts offer unverified configured routes and Copy.

Lab leaves evidence off. Optional native receipts record a handoff request,
not arrival or execution. Compact Copy declares no destination conversation
and therefore creates no receipt; the headless explicit receipt API remains
unchanged. Alpha receipt verification is preserved.

## Archive and reproduction

The private archive is `.local/sdk/agent-art-protocol-0.1.1.tgz`:

```text
SHA-256 2c179f487aa71cd0b769c5c70cca8786275111e33f1936de11536531b4012c18
```

[Lab metadata](lab.json) pins the owner base commit, full [binary patch](lab.patch),
result tree, archive/lock integrity and checks. For a fresh clone at that base,
apply this full patch directly with `git apply --binary --unidiff-zero`.
Do not stack it on the earlier 0.1.0 or Open gate patches. Install the locked
consumer dependencies, then run its build/tests. The launcher chooses offline
installation with lifecycle scripts disabled and never silently downloads.

The current local setup reused the earlier Lab's third-party dependencies,
verified their eight locked versions and installed the new SDK offline. A
clean offline `npm ci` lacked cached third-party tarballs (`ENOTCACHED`), so
that complete offline reinstall is **not qualified**. The SDK's own tarball
installation and all 11 installed files were checked independently.

## Checks and boundaries

[Current qualification](QUALIFICATION.json) records:

- 88 repository tests, including 27 SDK tests and a real offline archive install.
- Strict TypeScript consumer checking against the installed final package.
- Lab build, 21 Node tests, 37 Python tests and static-site/link checks.
- Regular Chrome rendering at desktop light/dark and 390px/320px mobile sizes.
- 15 synthetic DOM scenarios for routes, copying, discovery, receipts and teardown.

Run the browser check against the running local Lab:

```sh
node pilot/reading-sdk/check-ui.mjs 1440 1000 light --fixtures
node pilot/reading-sdk/check-ui.mjs 390 844 dark
```

The runner verifies stable Chrome's bundle ID, uses a disposable owned profile
and closes it afterward. It captures DOM geometry, exceptions, HTTP failures
and screenshots under `.local/qa/reading-sdk-011`. Native clicks are canceled
or replaced by same-page fragments; clipboard and discovery failures are
synthetic. No Agent launch, Send, source reading, inference or intentional
participation is established by these tests.

The unchanged four-primitives architecture and broader artistic participation
remain candidate. No public deployment, registry publication, license choice
or new artwork implementation is part of this patch.
