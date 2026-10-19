# Project walkthroughs for the protocol discussion

Recorded 2026-10-19. Use actual artworks to feel the participation experience
and refine the [working decisions and open questions](../DISCUSSION.md).
THOUGHT and signatures.gallery's preview are the first two cases. These are
design probes, not already selected migrations or conformance examinations.
Signatures' mint flow is outside this study.

## What to notice in every project

First experience the artwork on its own terms. Then name the decisions and
evidence without requiring the artist to reorganize the work around our demo.

1. What does the artist define, and which consequential choice remains with
   the Agent? What is the curator contributing?
2. Who authorizes participation, who initiates the creative Act and what does
   the curator actually have to do in their client?
3. Where can we identify Work, Participant, Act and Relation? Which mappings
   help explain the encounter, and which feel forced or omit something?
4. What exact context/media is offered, returned, accepted, revised and
   selected? Where can a human or service intervene?
5. What changes in the artwork because of the Agent contribution? Could the
   renderer ignore it while a superficial check still passes?
6. What could another reader check, who must they trust and what remains
   missing? Keep execution, preservation, consequence and display separate.
7. What work would shared infrastructure remove for the artist? What setup,
   privacy or maintenance burden would it add for the curator and artist?
8. What should this project change in our draft? Leave that as a question or
   proposal until we actually settle it.

## Current comparison

These findings preserve the preceding 2026-10-19 read-only review. The review
checked served pages/scripts, a public THOUGHT capability response and pinned
source. It did not start a fresh Agent encounter or enter minting. The browser
visit was not a completed UI walkthrough; the served scripts/source supported
the flow analysis. Future visits should record their own observations.

| Aspect | Existing THOUGHT app | Signatures preview only |
| --- | --- | --- |
| Artist framing | Short exact-text conditions and pinned brief/spec/renderer/glyph material | Drawing rules and the mapping from handle plus MBTI interpretation into a mark |
| Curator input | Exact prompt | Choice of X handle and optional handoff to their Grok chat |
| Agent choice | Response line under the Work's conditions | One of 16 MBTI interpretations, or decline for insufficient information |
| Handoff and return | Scoped task, explicit desktop-client launch and native HTTP return | Copied preview prompt followed by an editable preview link |
| Accepted contribution | First valid returned line retained; identical delivery can recover acknowledgment and conflicting return is rejected | Preview renders URL parameters; no durable accepted Agent Act in this path |
| Consequence | The exact Agent line changes its portion of the SVG work | MBTI changes ink/background, curve properties, outline and spacing/distribution |
| Retained evidence | Exact inputs/output, pinned material, local integrity/reconstruction, acceptance and review/save/export states | Parameters and reproducible rendering, without an original Agent-choice journal |
| Execution origin | Not established by the scoped return capability | Not established by the preview URL |

Both fit the artistic model. THOUGHT provides a developed participation and
preservation example. Signatures shows why an Agent may choose meaningful
parameters instead of drawing the final graphic. Neither conclusion makes
their existing flow a released implementation of this candidate protocol.

## Walk through the existing THOUGHT app

Use [THOUGHT](https://inshell.art/thought). Its existing app, the
[hypothetical protocol example](THOUGHT.md) and the
[local MVP](../mvp/README.md) are different things.

### Follow the existing encounter

The reviewed current app creates a scoped plain-HTTP exchange from the exact
prompt. The curator explicitly opens the prepared task in ChatGPT/Codex or
Claude and submits it in that client. The Agent is asked to interpret the
brief, create its exact line and return the raw bytes through native `curl`.
The browser receives the accepted response, reconstructs the record and SVG,
and offers review, Save, Load and export.

The reviewed discovery response reported enabled creation, a 30-minute write
period and a 24-hour read period. Those are this app's observed exchange
settings, not protocol-wide lifetimes. The active route uses the plain-return
implementation; legacy creation routes are not the reference for this study.

At each step, distinguish a requested action from evidence of its completion:
opening a deep link is not an observed model response; a client's success
message is not service acceptance; accepting a line is not selecting or saving
the artwork.

### Explore the points that matter

- Follow the exact prompt through the brief, response Relation and visible
  result. Identify the artistic choice separately from permission to return.
- Inspect the accepted line and the saved/exported record. Ask what must stay
  unchanged and who is allowed to record a later transformation or selection.
- Consider a lost acknowledgment. Recover the earlier service outcome rather
  than asking the Agent to invent a replacement line as delivery recovery.
- Distinguish an explicit refusal, no returned response, host-tool denial,
  validation failure and curator discard. Does the Work need to retain each
  as an artistic Act or an operational observation?
- Consider someone holding the return capability who submits a human-written
  line. The same acceptance path can succeed; what execution claim remains
  unestablished, even if the bytes and SVG agree?
- Ask which existing handoff, recovery and review features should be reused.
  A protocol integration should not require replacing a better artwork-specific
  experience with the MVP's terminal launcher.

### Evidence and source boundary

The reviewed app source explicitly leaves provider, model and internal
inference count unknown; external prompt fidelity and transcript purity are
not established. It does not present the accepted response as a creation
attestation. The record's hashes and renderer checks support narrower
preservation/derivation claims.

The repository also retains October 16 Codex and Claude client canary records.
Those describe operator/DEV-witnessed native launch/submission, mixed ACK
acquisition and assisted reload/load coverage. They are previous bounded
client observations, not a new trial in this discussion or provider/model
attestation. The installed-client version is not an execution identity proof.

The source reviewed was `inshell-art/inshell.art` revision
`25206674f669dc39589dacaa8806440d003c7630`; it differed from an older checked-out
documentation branch. Served creation scripts contained the plain-return
handoff, review/export controls and explicit provenance limits. This identifies
the inspected behavior without asserting an independently proven production
source-to-deployment chain.

Primary references:

- [Live app](https://inshell.art/thought) and [public capability discovery](https://inshell.art/api/thought-plain/v1/capabilities).
- [Creation entry routing](https://github.com/inshell-art/inshell.art/blob/25206674f669dc39589dacaa8806440d003c7630/apps/thought/scripts/plain-return-entry.ts).
- [Brief and provenance model](https://github.com/inshell-art/inshell.art/blob/25206674f669dc39589dacaa8806440d003c7630/apps/thought/src/plain-return/model.ts).
- [Curator handoff and review UI](https://github.com/inshell-art/inshell.art/blob/25206674f669dc39589dacaa8806440d003c7630/apps/thought/src/plain-return/view.ts).
- [Client preservation and save/load/export](https://github.com/inshell-art/inshell.art/blob/25206674f669dc39589dacaa8806440d003c7630/apps/thought/src/plain-return/client.ts).
- [Return acceptance and conflicts](https://github.com/inshell-art/inshell.art/blob/25206674f669dc39589dacaa8806440d003c7630/functions/api/thought-plain/v1/_middleware.ts).
- [Retained client canary record](https://github.com/inshell-art/inshell.art/blob/25206674f669dc39589dacaa8806440d003c7630/release-evidence/thought-canaries.json).

## Walk through Signatures preview

Use [signatures.gallery](https://signatures.gallery/) and its
[preview instructions](https://signatures.gallery/prompts/preview.txt).
Keep the scope on preview, including its optional Grok handoff and manual
exploration. No wallet or mint assessment is needed for this case.

### Follow the existing encounter

The optional prompt asks Grok to obtain the desired handle, resolve its current
public spelling, interpret available public information and choose an MBTI
type. If information is insufficient, the prompt requests an explicit decline
rather than an invented assessment. Grok returns a handle/MBTI preview URL.
The site renders those editable URL inputs; it does not receive the private
chat, the research history or an accepted Agent submission.

Manual exploration can enter the same parameters and compare all 16 types.
Those previews remain valid explorations without establishing Agent origin.
The public Agent index itself describes the preview as editable and says its
documentation is not proof of Agent intention.

### Explore the points that matter

- Hold the handle fixed and compare types. Find the visible consequence of
  the interpretation in the artist's visual language. Parameter selection can
  be a consequential Agent Act; free-form SVG generation is not required.
- Separate the handle's account holder from the curator and Agent. A person
  being interpreted is not automatically a consenting Participant.
- Begin with a purported Agent-selected type and consider a curator editing
  it. What should remain attributed to the Agent? Would retaining both the
  original interpretation and the curator's alternative preserve the work's
  playfulness better than prohibiting changes?
- Compare a Grok-returned URL with an identical human-typed URL. The website
  receives the same parameters; origin cannot be inferred from the graphic.
- Ask which Work/context, exact selection and evidence could be retained
  without publishing a private chat. Qualify the actual Grok return path rather
  than assuming that adding a server endpoint gives the consumer client new
  tool capabilities.
- Consider a declined interpretation. Does the artwork want that refusal as
  retained participation, or is an unresolved private encounter sufficient?

### Evidence and source boundary

A possible protocol mapping is a versioned Work definition, curator and Agent
Participants, an interpretation Act containing the subject and chosen type,
and a Relation to the relevant context. A later human variation would retain
its own attribution. A consequence check could bind accepted parameters and
the pinned renderer to an identified SVG. This is a proposed mapping, not an
integration already supplied by the preview site.

The source reviewed was `agent-art-work/Agent-Art-signatures.gallery` revision
`aa9f97b10152dcd3da112b85d4bd063c020165bb`. Served preview pages and the public
Agent index corroborated editable parameters and the optional handoff, but
this source revision was not established as identical to the deployment.
The read-only review fetched an example preview; it did not run Grok or verify
an X account's current identity or an MBTI judgment.

Primary references:

- [Public Agent index](https://signatures.gallery/agent-index.json).
- [Preview prompt](https://signatures.gallery/prompts/preview.txt).
- [Example editable preview](https://signatures.gallery/p/Alice_Bob_Key/ENFP).
- [Pinned preview handoff and pages](https://github.com/agent-art-work/Agent-Art-signatures.gallery/blob/aa9f97b10152dcd3da112b85d4bd063c020165bb/src/openMint/pages.ts).
- [Pinned Agent document contract](https://github.com/agent-art-work/Agent-Art-signatures.gallery/blob/aa9f97b10152dcd3da112b85d4bd063c020165bb/src/openMint/agentDocuments.ts).
- [Preview-only request handling](https://github.com/agent-art-work/Agent-Art-signatures.gallery/blob/aa9f97b10152dcd3da112b85d4bd063c020165bb/src/preview/worker.ts).
- [MBTI to graphic mapping](https://github.com/agent-art-work/Agent-Art-signatures.gallery/blob/aa9f97b10152dcd3da112b85d4bd063c020165bb/src/algorithmV2/index.ts).

## Use the MVP and hypothetical graphic work afterward

The [local MVP](../mvp/README.md) makes accepted Acts, curator selection,
tampered exports and per-claim checking tangible. Its Node service, local
stdio bridge, fresh Claude session and text profile are experimental choices.
It does not meet the independently evidenced execution claim still under
discussion.

The invented [OPEN FIELD](OPEN-FIELD.md) trace probes what the two existing
human-initiated flows do not: Agent artistic initiation, consecutive Agent
Acts, branches, refusal, revision and continuing graphic work. It remains a
paper example, not a third qualified integration. A human launching a client
can still precede an Agent's first creative Act without becoming that Act.

The research also retains WILL as a possible shared-image/concurrent-work
reference. No fresh WILL walkthrough or migration was performed here.

## Record what each walkthrough changes

Capture the encounter in ordinary language before updating specifications:

- The project, its inspected version and what was actually experienced.
- The artist's and Participants' decisions, including any intervention.
- The contribution's effect and the evidence available to another reader.
- What shared infrastructure would remove or add for each person.
- What the current primitives explain well and what they fail to express.
- Any resulting proposal, unresolved question or explicit decision.

Keep a proposed change separate from an adopted one in
[DISCUSSION.md](../DISCUSSION.md). New runtime observations need their own
scope; a historical trial or a copied prompt is not a newly completed
encounter. Walkthrough findings should inform the draft before more generic
infrastructure or artwork migrations are selected.
