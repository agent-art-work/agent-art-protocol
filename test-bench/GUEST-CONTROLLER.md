# Guest controller: read-only first gate

Status: historical read-only setup procedure. This is our maintainer
environment; integrating developers do not need to install it. Native capture
and later bounded Chat setup/readiness are now observed through the
[host-authority bridge](HOST-AUTHORITY.md). Focus, marker input/cleanup,
independence and the full no-Send gate remain unqualified. The original
read-only prompt below retains zero clicks, typing, handoff and Send authority;
it must not inherit the later setup scope.

## One-time operator setup

Inside the VM, open the installed ChatGPT desktop application and sign in to
the intended account/workspace. Select Work or Codex, enable the Computer Use
plugin, its server and skill, and personally complete Screen Recording and
Accessibility prompts. Approve Claude access when requested. These steps
follow the [official Computer Use setup](https://learn.chatgpt.com/docs/computer-use).
Keep target-Claude inference out of this setup.

The initial gate used a guest-local controller chat. At that point our host
chat had no verified guest-CUA selector. The later
[task/result connection](CONTROLLER-CONNECTION.md) supplies stored task reads;
that reader remains separate from the now-implemented host/native bridge.
Optional device pairing is a later route
to qualify, not an assumption: the [remote connection documentation](https://learn.chatgpt.com/docs/remote-connections)
distinguishes connected-device tools from an SSH project's shell/files.
It does not establish support for this particular ARM macOS VM.

Account verification, administrator authentication and OS security grants
belong to the operator; Computer Use cannot automate ChatGPT itself or those
protected steps. See [local security boundaries](https://learn.chatgpt.com/docs/enterprise/chatgpt-work-local-security).
The guest's disabled Gatekeeper assessments are a separate baseline choice;
restoring the normal setting is recommended, not an Agent Art requirement.

The operator commissions the controller task once using the prompt below.
That is different from manually operating each target-client test. Do not
make repeated operator Ready/Send responses a successful-run requirement.

## Controller prompt

Open the owned guest workspace in the controller. Its relative files and
installed SDK must be the verified offline kit; do not fetch or rebuild them.
Use this prompt:

```text
Perform only the dedicated guest controller's READ-ONLY feasibility check.

Read test-bench/AGENT-RUNNER.md, AGENT-QUALIFICATION.md and GUEST-CONTROLLER.md.
The current SDK is the unchanged private 0.1.4 bench pin. The mounted external
authority directory is UNQUALIFIED because host deletions exposed stale guest
metadata. Do not create a case, reservation, claim or diagnostic marker.

Establish the task's actual execution environment using permitted read-only
OS/version and owned-workspace checks. Do not read authentication files,
tokens, profiles, private conversations or unrelated user files.

Use permitted Computer Use through its documented CUA API inside this guest.
Observe the already-open Claude app directly by its exact bundle identity,
com.anthropic.claudefordesktop. Do not substitute the host Tart viewer,
SSH, terminal automation, screenshots without native accessibility, or a
browser simulation. If guest-native CUA is absent, report blocked and stop.

Take two fresh accessibility-and-screenshot observations. Compare attribution,
the same target window/surface, completeness and AX/pixel agreement. Classify
only whether Claude shows a connection error, sign-in, empty Chat or another
surface; do not retain unrelated visible contents or conversation titles.
Do not click, type, focus a composer, clear anything, launch a handoff or Send.
Do not solve a web challenge or approve security/permission prompts.

Write a bounded result to .local/test-bench/guest-controller-readonly.json:
actual OS/app versions; controller execution location and basis; actual CUA
availability; observation count, attribution, completeness, surface class and
agreement; assistance received; blockers and untested conditions. Never invent
successful observations. Do not save raw AX, screenshots, transcripts or keys.

A passing observation is only guest-native read-only feasibility. Keyboard
delivery, independent input, cleanup, canonical authority, VM restore, real
Lab reading and Send remain unqualified. SDK 0.1.4 stays unchanged. No deployment.
```

## Continuing a blocked read-only check

Preserve each original report. Name a new result file for a recheck; do not
replace a failure with later success. A CUA resolver can expose a staged app
on an installer share as well as the installed app. Verify the intended
installed bundle identity and remove unused installer exposure through normal
provisioning before one fresh documented CUA attempt. A directory listing alone
does not prove absence when the guest reports stale metadata. Check the old
paths directly. Do not force an unmount, restart the VM or reset permissions
as a blind retry.

On 2026-10-23, unused staged bundles were preserved outside the exported
folder, but guest metadata still exposed their old paths. Normal unmount of
the temporary volume succeeded, and fresh guest `stat` and `lstat` returned
`ENOENT` for all three source copies. Installed app metadata remained present.
The authority mount on that volume is also unavailable and remains
unqualified. No case or marker may use it.

The recheck must use the documented guest-native CUA entry point and inspect
its returned documentation before further calls. Do not reuse a timed-out
handle or assume that removing duplicate files resolved a CUA inventory cache
or the timeout. Stop after one new selection failure. If selection succeeds,
collect the two required paired observations without clicking, typing, clearing
or sending. A connection-error surface can qualify observation feasibility;
it cannot qualify empty-Chat readiness.

The earlier plain-text continuation for the commissioned guest task was an
explicit setup handoff, not a claimed automated test. The host now retrieves
that task's existing results through the documented app-server API and its
actual workspace. The current reader cannot submit instructions or resume a
task. Do not automate the controller's own UI or substitute CLI inference for
native CUA. Later operator-authorized direct diagnostics used the published
CUA MCP tool through temporary app-server contexts, with no model turn. The
normal app-approval request was relayed and explicitly approved for this
diagnostic session. Both the 30-second selection and one extended-deadline
diagnostic returned errors with zero observations. See the
[separate diagnostic scope and limits](CONTROLLER-CONNECTION.md#separate-read-only-native-diagnostic).
Approval and helper availability do not pass this gate or identify its cause.

The later renewed diagnostic retained a specific native error: **Computer Use
permissions are still pending** in the **ChatGPT Computer Use** setup window,
naming Accessibility and Screen Recording. This supersedes the earlier
cause-unresolved status for the current setup blocker; it does not rewrite
the earlier timeouts or establish each individual OS grant's state. The
installed helper's display name is `ChatGPT Computer Use`, bundle name
`Codex Computer Use`, identity `com.openai.sky.CUAService`. It is distinct from
the Claude app-approval question and from the host Mac's grants.

The concrete repair is to finish the pending permission steps in that helper's
**guest** setup window. Use its controls to open the relevant System Settings
panes so macOS targets the intended installed helper. The operator completes
protected security prompts; the Agent must not edit a permission database,
reset grants or automate those prompts. If the window cannot be found, the
operator can use guest Finder's Go to Folder with `~/.codex/computer-use/`,
then open the existing `Codex Computer Use.app`. Do not install another copy.

Use `permissions: 'human-required'` in the execution assessment, yielding
`permissions-not-ready` before case qualification, or
`permission-required` if an authorized case is already active. No action case
was active in this diagnostic. Preserve the failed probe and record setup
pending separately. The error's instruction to call again because the user is
almost done is not evidence of progress or authorization for a retry loop.
Wait for the actual protected setup step, then obtain fresh native observations.
An operator's completion report alone does not pass the two-pair gate.

After the operator reported completion, installed-Claude selection and two
fresh paired native calls succeeded. Both images show the **Get started**
welcome screen; AX exposes only the window shell and menus. This verifies
that the permission-pending capture failure cleared in this path. It does
not pass complete target observation: the rendered welcome controls are absent
from AX, and there is no empty Chat. The operator must complete Claude's
one-time guest onboarding/sign-in and leave an empty Chat without submitting
anything. Inspect fresh captures afterward; do not infer complete control or
automate authentication from these partial observations.

The operator subsequently completed Claude setup. Two new native paired calls
now expose application content, mode controls and an empty composer, matching
the screenshots. This passes Claude read-only observation on the actual
**Code/new-session** surface. Code is selected in both AX and pixels; the
reported empty Chat is not the observed mode, so Lab Chat readiness does not
pass. No mode change or input occurred. Keep capture feasibility separate from
Chat qualification and from the later authority/input/cleanup gate. The Agent
can obtain these observations directly; another operator Ready/result relay
is not a requirement of normal tests.

The next authorized slice kept canonical claims on the host and used the
guest's published CUA for bounded mode preparation. The shared Chat/Cowork
umbrella initially restored Cowork; an explicit inner Chat selection and two
reviewed empty-Chat pairs then passed. The named profile requires those inner
selectors, not `/new` alone. See [host authority](HOST-AUTHORITY.md) and its
separate [dated result](AGENT-QUALIFICATION.md#host-authority-and-guest-chat-readiness-2026-10-23).
No typing, keypress, clearing, handoff or Send occurred.

## Result-channel requirement exposed by commissioning

The submitted recheck did not produce a report at the expected owned paths
during a bounded wait or the later check. Controller executable presence and
a visible guest desktop do not establish whether its task is running, waiting
for approval, finished elsewhere or interrupted. Keep that attempt's outcome
unknown until its existing result or final reply is obtained. Missing output
does not permit a new CUA selection or establish another CUA failure.

The operator later supplied a screenshot of the final reply reporting another
timeout and zero paired observations. The linked report was subsequently
collected through the direct guest connection, matching its previously recorded
digest. The actual report declares the guest execution basis and a fresh
installed-path timeout with a kernel reset before documentation or observation.
This remains attributed evidence, not independent VM attestation. Preserve both
reports and the earlier result-missing history; do not restart selection.

Before future commissioning, add a bounded, per-attempt diagnostic status
channel: write acceptance/start before selection, then phase, update time,
terminal outcome and result path/digest or a bounded error. Distinguish a
prepared prompt from controller acceptance, task execution and completed
observation. Missing or stale status must remain unknown and must never renew
action authority. This is a requirement to implement and qualify, not an
existing heartbeat or an authority service. Stored turn/result reads now work
through [controller-link.mjs](controller-link.mjs); they do not provide a live
desktop heartbeat or acceptance-before-CUA record. Do not add such a record
retrospectively to claim progress for the already submitted task.

## Acceptance and stop conditions

Pass this gate only when actual guest-native CUA identifies Claude and the two
fresh paired observations agree. An app permission prompt is setup pending;
SSH success or controller prose alone cannot pass it. If the client/plugin is
unavailable, VM eligibility fails, or targets disagree, stop and record that
specific boundary. Do not add a hidden driver or copy host authentication.

This read-only report is a local observation record, not an execution-contract
qualification token or independently witnessed evidence. Do not start the
marker session until canonical authority storage is resolved and the
[no-Send contract](NO-SEND.md) is satisfied. A real Lab trial requires its own
authorization after that gate.
