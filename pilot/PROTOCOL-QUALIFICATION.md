# Shared protocol consumer qualification

Observed 2026-10-19. These checks concern the experimental shared protocol
applied to isolated Lab reading and THOUGHT consumers. They are not a protocol
release, independent execution attestation or production deployment. Earlier
[reading experiments](QUALIFICATION.md) and the
[participation MVP](../mvp/QUALIFICATION.md) retain their own observation scope.

## Candidate and scope

Both consumers import the same [shared core](../protocol/README.md): Work,
Participant, Act and Relation construction, exact integrity encoding and
claim-scoped verification. Reading uses `handoff`; THOUGHT uses `handoff` and
`participation`. There is no hosted model, mandatory mint or blanket genuine
Agent-creation verdict.

The Lab clone is based on `d658be2cc19307d113e64bd3fa0b2ad56a0a4bfc`, with
[its consumer patch](lab-consumer.patch). THOUGHT uses the existing application
from `inshell.art` at `25206674f669dc39589dacaa8806440d003c7630`, with
[its consumer patch](thought-consumer.patch). The original checkouts and live
sites are unchanged. Working code and patches identify the local candidate;
neither patch is an immutable snapshot of earlier experiments.

In the THOUGHT adapter, `Work.version` is the offered brief's hash for that
encounter. The brief includes encounter-specific material. It is not a claim
that one stable master definition version is shared by every encounter;
artistic component pins and the explicit encounter identity remain separate.
This is an experimental mapping, not a settled generic versioning rule.

## Synthetic and source checks

| Check | Recorded result | Limit |
| --- | --- | --- |
| Shared core | 16 synthetic tests passed | Exercises record/reference integrity, missing material, unsigned resealing and owner-supplied checks; no Agent is invoked. |
| Earlier root consumer pass | 74/74 tests passed: 16 core, 16 older participation-MVP and 42 pilot tests | This predates the SDK packaging test; it includes retained earlier implementations. The subsequent 75-test result is recorded below. |
| Lab pilot | 42 synthetic tests passed | Includes ten Lab parser tests, revised handoff/server tests and 22 retained earlier engine/client tests; retained code is not the active reading flow. |
| Isolated Lab consumer | 20 Node tests and 37 Python tests passed | Checks the owning site's source/build contracts; not Agent behavior. |
| THOUGHT | 32 tests passed: 28 existing plain-return tests and four protocol integration tests | These are synthetic tests of the owning application's behavior and the new adapter, not observed Agent participation. |
| THOUGHT TypeScript and publication boundary | Type check and PUB boundary check passed | Static checks do not establish runtime origin, deployed parity or publication authority. |
| THOUGHT frontend build | The actual Vite frontend build passed | A local build does not qualify production deployment or an Agent execution. |

These suites have different scopes and overlap as indicated. The combined
root result was observed directly, not inferred by adding all table rows.
At that consumer-verification pass, repository checks covered 60 public files and 120 local Markdown links,
UTF-8/LF without BOM, and whitespace. Redacted secret and machine-path scans
reported no findings; no files were staged or pushed by these checks.

## Subsequent private SDK packaging

The operator subsequently requested a draft SDK and source push. The existing
shared core is packaged as private `@agent-art/protocol@0.1.0-alpha.0`.
The root commands are `npm run sdk:pack` and `npm run test:sdk`, with intended
artifact `.local/sdk/agent-art-protocol-0.1.0-alpha.0.tgz`.

| Packaging check | Recorded result | Limit |
| --- | --- | --- |
| Focused protocol/package suite | 17 tests passed: 16 core tests and one actual archive smoke test | The archive was packed and installed into a fresh consumer offline with scripts disabled. Root and `/clients` imports, seal/verify and the private-subpath boundary were exercised; this is not Agent execution. |
| Root combined rerun | 75/75 passed: 17 protocol/package, 16 older MVP and 42 pilot tests | An initial restricted run hit loopback `EPERM`; the authorized loopback rerun passed. The environment failure is not an Agent or protocol refusal. |
| Installed Lab and THOUGHT SDK files | Both consumers' installed runtime modules and type declarations matched source byte-for-byte | Checks the local package installation, not a public registry artifact or independent publisher identity. |
| Installed-archive THOUGHT regression | 32 tests, TypeScript, PUB boundary and actual Vite frontend build passed | The consumer used the installed archive without source aliases or a Vite filesystem exception. It does not establish production parity or Agent origin. |

The archive contains six public package files: its manifest, README, two ESM
modules and their two type declarations. Private state, tests, launch helpers
and artwork adapters are not included. The final tarball SHA-256 is
`a206aac917818dc5e88bf8b0f200623c0b03fd4dc56e3248a773378e0a93f02a`.
This identifies the local archive bytes, not independent authorship or a
registry release. Its README uses a repository link for the qualification
record rather than a relative path outside the installed package.

Regular stable Chrome checked both installed-package consumers at
1440 × 1000 in light mode:

- Lab showed a visible, enabled Open action. The packaged browser core sealed
  and verified a handoff record with supported integrity and zero Acts. There
  was no horizontal overflow, and every requested resource returned HTTP 200.
  This check did not establish an Agent reading or contribution.
- THOUGHT imported the packaged core and exercised its owner checker with an
  in-memory synthetic fixture: two Acts, supported exact-pair consequence and
  unestablished execution origin. The prompt was visible, there was no
  horizontal overflow, and all requests returned HTTP 200. No model or return
  endpoint was used for this package-specific fixture.

The initial THOUGHT fixture identifier failed the existing format constraint;
the fixture was corrected to a valid identifier. This was test setup, not an
observed product defect. The owned disposable Chrome profiles were cleaned
up. Earlier source-module browser checks and the separately approved real
generation remain their own encounters rather than being relabeled as new
archive-consumer Agent trials.

This distribution step is not npm-registry publication or deployment. It
adds no turnkey callbacks, account/OAuth enrollment, durable participation
service, automatic client execution or independent Agent-origin evidence.
The dated consumer trials and their trust limits remain unchanged.

## Lab: reading handoff with zero Acts

The operator subsequently reported that the homepage showed no entry buttons.
The consumer build had been overwritten by the canonical build during checks;
the bridge mount also sat inside the original closed disclosure. The corrected
preview uses a separate `_site-reading-pilot` output and mounts its controls
before that disclosure. A canonical rebuild was checked to leave the preview
intact. The original copy prompt remains a separate collapsed fallback.
Regular Chrome checks at 1440 × 1000 light and 390 × 844 dark confirmed enabled
Open and Copy controls with no closed disclosure ancestor and zero horizontal
overflow. Existing-conversation mode hid Open and retained explicit manual
copying. All requested resources returned HTTP 200; no Agent was launched.

Regular stable Google Chrome, identified as `com.google.Chrome`, inspected the
local preview at 1440 × 1100 in light mode and 390 × 844 in dark mode. Both
views had zero horizontal overflow and no question inputs. Existing-
conversation mode retained manual context copying. A synthetic clipboard
fixture exercised its local receipt; it did not observe a paste, Send action
or private chat. An evidence-failure fixture confirmed that the previous
receipt is hidden and current evidence is marked unavailable rather than
reused for a later action.

The actual local backend accepted a Claude native-open request with HTTP 202.
Accessibility inspection showed the complete public Lab context in an unsent
Claude draft. The sealed package contained zero Participants, zero Acts and
zero Relations, with a local helper observation of OS request acceptance.
Agent execution and reading remained unestablished. This is not a model call
or evidence that the Agent followed the offered policy.

Cleanup of this encounter's owned public test draft could not be confirmed:
the operator had changed the active Claude chat before cleanup. That chat was
left untouched; the test draft may remain. This is a different encounter from
the earlier draft whose cleanup was confirmed in [QUALIFICATION.md](QUALIFICATION.md).

The export contains the public Work context and bounded observations. It
excludes the local API key, private launch capabilities, private conversation
and filesystem paths. Seals and JSON validation are not automatic secret
redactors. The preview keeps no persistent participation ledger or answer
callback. Its local OS helper does not qualify a production browser's external
protocol permissions or direct browser-to-app route.

## THOUGHT: synthetic contribution and consequence

The initial local page at `http://127.0.0.1:4175/thought/` rendered without
horizontal overflow or additional API failures. A subsequent browser check
at 1440 × 1100 in light mode exercised the complete local path below using
**a fixed synthetic line, with no model or Agent client involved**:

1. The browser created an encounter through the original THOUGHT interface.
2. Native curl submitted the fixed fixture line once to the original scoped
   return endpoint. HTTP 200 acknowledged the exact line.
3. Browser polling rendered the accepted work. Review complete, Save and Export
   retained the new protocol bundle alongside THOUGHT's original material.
4. The bundle contained two Acts, three Participants and an application-declared
   `responds-to` Relation. The Agent label remained claimed attribution even
   though the fixture line was supplied without an Agent.
5. The SVG blob matched the exact accepted `work.svg`; the image loaded with
   nonzero natural width. The saved attachment's digest matched the export.

No requests failed and no horizontal overflow was observed in that encounter.
The owner-supplied exact-pair and required-consequence checks were supported
for the retained fixture material. Agent execution origin remained
`not-established`.

A copied artifact was then replaced with `<svg/>` and **resealed**. Its new
core integrity digest was internally valid, but THOUGHT's exact-pair check and
required-consequence check were contradicted. Execution origin remained
unestablished in both packages. This shows the distinction between an unsigned,
recomputable consistency seal and the artwork owner's derivation checks; it
does not prove independent historical truth or Agent authorship.

The same saved synthetic fixture was checked at 390 × 844 in dark mode through
THOUGHT's normal Load action. It loaded successfully, retained the exact
artifact, exposed the evidence control and produced no horizontal overflow or
failed requests. This confirms the fixture's local saved-work path, not a new
Agent contribution or cross-device identity claim.

The fixture artwork, return capabilities and exports remain in ignored local
state. No raw Agent transcript was captured.

## One authorized real Claude Code trial

A proposed real Claude trial with a USD 1 budget was rejected by automatic
approval review. The stated reason was that local integration authorization
did not explicitly authorize the proposed paid external model call, its
payload and destination. No call or Agent return ran from that rejected
request, and the rejection was not bypassed.

The operator subsequently explicitly approved **one real Claude Code test
with a budget of at most USD 1**. That authorization supersedes the earlier
authorization gap for this bounded test. The following is the actual result
of that separately authorized trial; it does not relabel the rejected request
as executed.

One fresh Claude Code CLI generation ran in an owned empty temporary directory
with JSON output, no session persistence, no tools, no MCP, `dontAsk` permission
mode, one maximum turn and the client's USD 1 budget setting. It received only
the public THOUGHT brief and authorized test prompt, without return credentials
or private conversation history. No browser was offered to the model. The
budget setting is recorded, not a measurement of the final billing charge.

The returned exact line passed THOUGHT's original validator. The test harness
then used native curl to deliver that line once to the original local scoped
return endpoint. HTTP 200 acknowledged the exact line. **Generation and
delivery were separate operations**: the Claude client did not execute the
HTTP return itself.

The browser polled the accepted result, then Review, Save and Export retained
two Acts, three Participants and the application-declared `responds-to`
Relation. The artifact matched the exact accepted SVG, its image loaded, and
saved state retained the protocol evidence. Structure/references, integrity,
retained Agent attribution, THOUGHT's exact-pair check and required consequence
were supported under their local policies. The saved view had zero horizontal
overflow and no failed requests. Visual inspection confirmed the exact pair
and the Check evidence console on the actual trial screen. Agent execution
origin remained `not-established`: a local harness observation is not
independently rooted execution attestation.

Changing a copied SVG and resealing its package again produced supported
core integrity but contradicted THOUGHT exact-pair and required-consequence
checks. This retained the distinction demonstrated with the earlier synthetic
fixture, now using material from the bounded real generation.

This trial qualifies only the observed local generation, harness delivery and
artwork preservation/checking path. It does not qualify autonomous Claude Code
HTTP execution, the desktop native handoff, all-client compatibility, private
Agent continuity or freedom from unobserved intervention. Private artwork and
exports remain ignored. The trial's owned temporary directory and disposable
browser were cleaned up. The earlier Lab desktop draft's cleanup remains
unverified as recorded above. No mint, deployment or push was performed.

## Remaining limits

- The shared SHA-256 seal is unsigned and recomputable. A local operator can
  construct or edit and reseal a coherent record. No independently rooted
  execution or issuer attestation has been implemented.
- A scoped return capability permits submission; its holder can submit human
  or scripted content. It does not prove model identity, private intention,
  comprehension, private continuity or freedom from host intervention.
- THOUGHT supplies its artistic conditions, renderer and consequence checker.
  These observations do not measure artistic value or qualify every supplied
  checker, Agent client or participation form.
- The two consumers demonstrate a bounded shared implementation experiment.
  Broader compatibility, maintenance savings and the other selected consumer
  integrations remain unestablished. No mint, production deployment or public
  release was performed by the recorded consumer trials. The later private
  SDK distribution and source-push direction is recorded separately above.
