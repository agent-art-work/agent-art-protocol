# Local participation MVP

A THOUGHT-inspired text study of curator-Agent participation, exact Act
preservation, selection and claim-scoped evidence. This is a local prototype,
not production THOUGHT, a released protocol, or a qualified remote client path.

## Walk through it

Requires Node.js 22 or newer and an installed, authenticated Claude Code client.
There are no package dependencies to install.

1. From this repository, run `npm run dev` and open
   [the local surface](http://127.0.0.1:4173/) in regular Google Chrome.
2. Write one opening line and choose **Begin with this line**. Its exact
   characters become an accepted curator Act under the pinned study definition.
3. Choose **Authorize this encounter**. This grants one Agent connection access
   to this Work. It creates no Agent contribution.
4. Copy the command shown and run it from the repository's terminal. The
   launcher opens a fresh Claude Code session with this Work's MCP tools and
   the existing client authentication. Follow the client's permission prompts.
   The Agent reads the conditions and decides whether to submit a line or an
   explicit refusal. The page does not generate the response.
5. The page updates when an Act is accepted. Choose **Use this exact line** to
   compose a pair. Selection is a curator event, separate from the Agent's Act.
   Refusals remain in history without becoming a manufactured second line.
6. Open **Inspect the evidence**. Check preservation, attribution and the
   exact selected pair separately from execution origin and website display.
   **Change a copy & check** alters an exported artifact copy and checks it
   without changing the accepted Work.
7. Export the evidence JSON. To check a permitted export without the server,
   run `npm run mvp:verify -- <exported-evidence.json>`.

You can begin another encounter, inspect earlier ones, revoke new Agent writes,
or launch the same connection again for another response or revision. This
THOUGHT profile starts with a human line; it is not a universal core turn rule.
Graphics and the second artwork integration are not implemented here.

## What this path establishes

The loopback service preserves one Act and its required Relations together,
along with a retry outcome and acceptance receipt. The adapter persists exact
context and submission envelopes outside model sampling. Recovery uses the
same submission rather than asking for another response. Revocation blocks
new writes while allowing scoped recovery of previously accepted submissions.
The private store is serialized for one service process; this is not a
distributed database or managed hosting system.

The checker evaluates internal byte bindings, service-declared authority and
the selected artifact's exact pair. Its reports identify the package digest,
checker, policy, trust configuration and separate claim results. A substituted
line contradicts the affected binding/effect claim. Missing origin evidence
remains **not established**, not fake or refused.

## Trust and deliberate limits

The machine owner and local service are trusted for their records. They can
fabricate and rehash a consistent package. No provider-signed receipt,
independent witness or attested execution is supplied. Actual Claude Code
activity, MCP calls and service acceptance therefore do not establish
independent execution origin, private intention or freedom from intervention.

The launcher uses a fresh, restricted session with only this Work's tools.
It does not connect an existing private conversation or prove continuity of
the curator's Agent memory or identity. It uses temporary, session-specific MCP
configuration without editing global client settings. Local stdio MCP does not
qualify the proposed remote HTTP MCP/OAuth path. No minting or chain is involved.

Records stay in the gitignored `.local/mvp/` directory. Launching the Agent
sends the offered conditions and contributions to the selected model/provider
under the client's account and applicable terms; local storage does not imply
local inference. Normal subscription usage and limits apply. Private Agent
conversations are not collected by the shared service. Exporting discloses the
included artwork material to whoever receives it; capabilities are excluded.

Retention lasts until the machine owner deletes the private data. No automatic
expiry, erasure of exported copies or backup is provided. Local processes owned
by the same user can access the development service and its private files.

## Checks and development

Run `npm test` for service and adapter integration checks. They use temporary
private stores and synthetic contributions. They are distinct from a real
client trial. Browser checks must use regular Chrome, with screenshots and
actual DOM/API assertions. See [QUALIFICATION.md](QUALIFICATION.md) for the
bounded observations and remaining gaps.

Use `PORT=4174 npm run dev` if the default port is occupied. The authorization
step binds the launcher to the actual local endpoint. The service listens only
on loopback, rejects cross-origin browser access and exposes no CORS policy.
There is no production deployment setup.
