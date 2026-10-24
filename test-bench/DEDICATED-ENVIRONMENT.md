# Dedicated desktop environment: no-Send gate

Status, 2026-10-24: Three explicitly authorized fresh Lab → Claude desktop cases have finished.
Each used exactly one Send and recorded matching submitted rendering plus a
completed collection introduction, without human window rescue, manual Send
or result relaying. The same 15 pinned runner/input files remained unchanged.
Case 2 inspected the actual raw-index HTTP403/CONNECT403 denial and passed the
runner with source failure recorded. Cases 1 and 3 could not inspect source
activity because their native summary titles were unsupported; source access
remains unobserved. The three-consecutive-pass gate and full MVP have **not
passed**. All three submission permissions are consumed; no further live test
is authorized. SDK 0.1.4 and the Codex draft remain unchanged; no deployment.
See [three-case findings](AGENT-QUALIFICATION.md#three-authorized-fixed-code-lab-cases-2026-10-24).
The setup chronology below preserves earlier limits and failures. The stale authority
mount is excluded; the [host-authority bridge](HOST-AUTHORITY.md) keeps claims
on the host and calls the published native CUA inside the guest. Earlier
blocked reports remain unchanged. This runbook applies
the [MVP scope](MVP-SCOPE.md) and [execution contract](EXECUTION-CONTRACT.md);
actual outcomes stay in [dated findings](AGENT-QUALIFICATION.md).

The earlier [direct guest task/result connection](CONTROLLER-CONNECTION.md) reads
the intended existing task over SSH and the documented app-server API. Its
actual workspace/output path resolved the missing recheck report. Both blocked
reports are preserved; no new CUA selection followed. This checks task/result
retrieval, not native control, action authority or storage coherence. The later
native/authority findings are separate; see
[dated qualification](AGENT-QUALIFICATION.md#host-authority-and-guest-chat-readiness-2026-10-23).

The later SSH provisioning check verified installed signatures, guest Node
and exact offline SDK inputs. It also found disabled Gatekeeper assessments,
Claude connectivity failure and stale metadata on the writable authority share.
The operator subsequently approved the guest-only HTTP/HTTPS proxy; it is
configured and bounded OS-native HTTPS checks now reach Lab and Claude HTTP
responses. Claude app reconnection is unobserved: viewer coordinate clicks
fail with `noWindowsAvailable`. Mounted authority is not qualified; select the
security baseline and establish actual guest-native control before qualification.
Restoring Gatekeeper is our recommended setup choice, not a protocol requirement
or a proven cause of the Claude error. See the
[diagnostic findings](AGENT-QUALIFICATION.md#guest-ssh-provisioning-and-authority-share-diagnostics-2026-10-23).

## Pinned setup

- Tart 2.41.1, downloaded from its [official release](https://github.com/openai/tart/releases/tag/2.41.1).
  Archive SHA-256:
  `e680a734febccfce7d4e910c1f7f13fc3b00f19a181c945e2d746de3214c32c2`.
- Official vanilla macOS image, tag 26.6.2, pinned by registry digest:
  `ghcr.io/cirruslabs/macos-tahoe-vanilla@sha256:eeec54bfe1f076e27786c5d92b89187a05b1d109b5071eb2dcdf02d596e34640`.
  The inspected manifest declares 23,990,480,836 compressed bytes. Download
  completion and a verified local clone must be observed separately. The direct
  clone finalized with exit code zero on 2026-10-23; the bounded first boot
  reached a guest desktop. Neither observation qualifies guest-native control.
- VM name `agent-art-nosend`; requested configuration: four CPUs, 6144 MiB
  memory and a 1440×900 display. Inspect the actual sparse disk rather than
  assuming its provisioned size or trying to shrink it.
- Runtime, download/cache, VM, app staging and diagnostic state stay below
  ignored `.local/test-bench/environment/dedicated-macos/`. No system-wide
  package installation, host browser profile or personal app data is needed.

The [official installation guide](https://tart.run/quick-start/) requires
invoking Tart inside its app bundle. `TART_HOME` redirects its local storage;
set it on every invocation, rather than allowing a second default workspace.
Keep automatic pruning disabled for this initial diagnostic workspace.

The following records the initial configuration/console commands after image
completion. The temporary installer share was subsequently normally unmounted;
do not restart an active guest or recreate the authority share to repeat setup.
From the repository root:

```sh
export TART_HOME="$PWD/.local/test-bench/environment/dedicated-macos/tart-home"
export TART_NO_AUTO_PRUNE=1
aap_tart_bin="$PWD/.local/test-bench/environment/dedicated-macos/runtime/tart.app/Contents/MacOS/tart"

"$aap_tart_bin" set agent-art-nosend --cpu 4 --memory 6144 --display 1440x900
"$aap_tart_bin" run agent-art-nosend --no-clipboard --no-audio --no-usb-accessories \
  --dir="guest-apps:$PWD/.local/test-bench/environment/dedicated-macos/guest-apps:ro"
```

This opens a console for initial operator setup. Add `--no-graphics` only
after the guest has an independent permitted controller. Use default shared
NAT, not a bridged interface or a public VNC/app-server listener. Share only
the staged application bundles, read-only; do not mount the host home,
credential stores or browser profiles. Neither a console window nor SSH is
guest-local Computer Use evidence.

## Direct image transport, 2026-10-22

The operator requires direct image traffic. Actual connection inspection using
Stash's bundled CLI found that the original CDN transfer matched its `github`
rule and used a Hong Kong proxy node. The registry's rule was DIRECT. Removing
HTTP proxy variables alone would be insufficient: local DNS returns tunnel
addresses and the current route table sends public addresses through a tunnel.
No global proxy, VPN, DNS or Stash rule was changed.

An ignored, image-specific loopback adapter now feeds Tart the same pinned
manifest and its declared blobs. Every upstream request uses macOS curl with
physical interface `en0`, proxies disabled, explicit public-IP resolution and
normal HTTPS certificate verification. The manifest digest is verified before
listening; requests are restricted to the pinned manifest/blob allowlist and
range boundaries. There is no VPN fallback. Tart retains its own OCI digest
checks. The HTTP-only exception applies solely to the local loopback leg,
not to upstream downloads or OS security settings.

The original downloader was stopped without SIGINT, preserving its temporary
image. Its checkpoint was copied for the local transport's cache identity;
Tart must revalidate each completed layer, and incomplete layers can be
downloaded again. This does not assert that all earlier progress was reusable.

Actual checks matched the local manifest and a small metadata blob to their
expected SHA-256 digests. Resumed image workers then had live external sockets
whose interface was `en0` in macOS `nettop`. These observations establish the
bounded direct transport, not image completion, VM boot or guest control.
The helper is temporary ignored provisioning material, not an SDK component
or hosted registry product. Stop its owned listener after the pull finishes;
do not restart the original proxy-routed command as a fallback.

A later recheck found four large upstream streams ending short at the same
30 MiB boundary. The cause remains unestablished. The temporary adapter now
forwards available bytes in reads of at most 64 KiB and requests validated
upstream ranges of at most 8 MiB. Thirteen in-memory checks passed. A bounded
live probe, using a smaller 1 MiB range limit, received exactly 2 MiB + 1 byte
across three upstream ranges; the manifest and a complete small blob also
matched their expected digests. Its actual socket used the physical interface.
This qualifies that bounded probe, not full-image reliability or a whole-layer
digest. The owned clone was resumed with its checkpoint preserved and four
new upstream sockets observed directly. Its new progress counter is separate;
not all incomplete earlier data is necessarily reusable. Guest boot remains
pending.

## One-time operator setup

The first route to test is a controller running in the guest desktop app.
Use the [one-time setup and read-only controller prompt](GUEST-CONTROLLER.md).
It checks actual guest-native observations before any marker or case. The first
submitted guest-controller report is blocked with zero paired observations:
bundle selection was ambiguous and explicit installed-path selection timed
out. Host viewer operation remains separate. The later normal unmount of the
temporary installer share removed stale source-app paths. The subsequent
guest recheck also timed out. Direct stored-task/result access now removes
manual result relaying. A separate operator-authorized diagnostic relayed
the normal app approval and received a session grant, but both its approved
30-second selection and one extended-deadline diagnostic returned errors with
zero observations. Native helper/socket availability is checked; observation
is still blocked with cause unresolved. See the
[connection and diagnostic boundaries](CONTROLLER-CONNECTION.md).

The renewed diagnostic then retained the concrete native error: Accessibility
and Screen Recording setup is still pending in the guest **ChatGPT Computer
Use** window. The console is unlocked. Complete that helper's protected setup
steps before another capture; do not treat the earlier operator-reported
grants as verified readiness. The helper's display name is ChatGPT Computer
Use and bundle identity is `com.openai.sky.CUAService`. See
[the setup repair](GUEST-CONTROLLER.md#continuing-a-blocked-read-only-check).

The operator then completed that setup. A fresh native selection and two
AX/screenshot calls succeeded, clearing the checked permission-pending capture
failure. Claude is still on its **Get started** welcome screen, with only
window-shell/menu AX coverage. Complete its one-time guest onboarding/sign-in
and inspect fresh captures before claiming complete target or Chat readiness.
No input or Send was performed by the diagnostic.

After completed Claude setup, two fresh native pairs now expose application
content, mode controls and an empty composer with matching screenshots. The
checked surface is **Code/new session**, so Claude read-only observation is
observed while Lab Chat readiness remains unqualified. The Agent obtained and
reviewed the result through the VM connection without operator copying. No
mode change, typing or Send occurred; canonical authority and input/cleanup
qualification remain later work.

The staged bundles are verified copies of installed official ChatGPT, Claude
and regular stable Chrome software. Chrome's staged copy needed removal of
Finder/resource-fork metadata before its original signature could be verified;
the host app was not changed. The copies contain no account/session data and
must be installed and checked inside the guest before qualification.
Do not infer that a staged app can run or that Computer Use is enabled.

The operator signs in to the guest controller and Claude, handles protected
authentication, and grants guest OS/tool permissions. Prefer a test Claude
identity; reusing an identity shares its cloud history/quota despite VM
isolation. Account provisioning and new subscriptions are not selected here.

Run the coding Agent in the guest desktop app, or use a supported paired
connection whose Computer Use actually executes there. Availability and
pairing must be checked. [Remote connection documentation](https://learn.chatgpt.com/docs/remote-connections)
distinguishes the connected host's tools from an SSH project shell. Do not
copy host authentication into the guest or manipulate permission databases.
The operator handles the controller app and OS security setup; host-side
automation through the VM viewer is not a substitute.

These are initial setup boundaries, not a requirement to find windows or
press Send during normal jobs. Record which setup assistance actually occurred.

## Guest-controller acceptance

The current authority permits **no Lab handoff, Send or inference in Claude**.
It permits the coding Agent to run the controller and perform this bounded
diagnostic after current target ownership/readiness is established:

1. Identify guest-local Claude and regular Chrome, declared versions and the
   controller's execution location. Observe an owned fresh empty Claude Chat
   with complete accessibility and screenshot contents that agree.
2. Focus the composer and type one uniquely identified public diagnostic
   marker. Observe its exact arrival before taking another action.
3. Clear only that verified marker and observe empty readiness. Never clear
   an unrelated draft or infer successful cleanup from an API return.
4. Assess input independence while the operator continues normal host work.
   Guest input must not affect host apps; paired guest observations must stay
   coherent. Record any operator report separately from direct observation.
5. Verify that interruption or target disagreement blocks subsequent input
   until fresh qualification. Do not attempt blind recovery or use a normal
   Send-authorized case builder for this diagnostic.

No successful VM boot, software installation or shell command can pass steps
1–5 by itself. Stop at the first missing prerequisite and name it. Protect
raw incidental UI; retain only bounded public diagnostic findings.

Keep authoritative job/attempt records outside any disposable guest baseline.
The current [host-native arrangement](HOST-AUTHORITY.md) does this without a
guest mount. The following describes the earlier shared-storage attempt, whose
failed freshness check remains unchanged; it is not the current setup recipe.
The [external authority store and no-Send workflow](NO-SEND.md) are implemented
candidates. During setup, expose only the selected host-owned authority
directory as a separate writable share, verify it stays outside the guest
baseline and bind the guest checkout to its actual mounted path. Do not copy
the host workspace's machine-local authority binding into the guest checkout.
The store identity and canonical records must remain the same across restores.
The actual selected share was subsequently mounted and bound in the guest;
guest-to-host writes and synchronization succeeded. Host deletion left stale
guest metadata despite content reads returning `ENOENT`, so the mount is not
qualified for mutable authority decisions. Successful `fsync`, a new process,
remount or reboot is not sufficient evidence of a coherent storage contract
on its own.
The temporary shared volume was subsequently normally unmounted to remove
duplicate installer-app exposure. This also makes the unqualified authority
mount unavailable. Its host-owned records were preserved, and no case was
created. Do not recreate authority locally or treat the unmount as a storage
coherence qualification.
The later selected replacement is host orchestration of the guest-native tool:
host claims precede dispatch, with no reverse authority endpoint. It is
implemented for bounded Chat setup/readiness and the separate
[host-authorized marker diagnostic](REMOTE-MARKER.md). The latter now has a
bounded actual pass for focus, exact typing/cleanup and sequential owned-surface
non-interference. Lab execution and actual VM restore/reconnect remain
unqualified. The provisioning assessment is not a completed
diagnostic or live reset qualification.
Restoring a VM cannot renew a consumed attempt. Stop an idle guest
through Tart and verify it stopped; do not leave a six-GiB VM running merely
because operator setup is pending. Guest images, account state and staged
software stay private and ignored; do not commit or publish them.

The operator has requested no further restarts of the active direct image
download. Continue preparation and synthetic checks without changing its
process, cache identity or transport. A proposed midnight reset is not an
instruction to schedule or execute a host, guest or network reset.

## Later restore/reconnect check

The initial [actual restore qualification](RESTORE-QUALIFICATION.md) observed a cold
baseline rollback, byte-identical selected host authority files, rejection of a
finished consumed case and a fresh pinned SSH connection. The restored Claude
surface differed and ordinary Chat readiness was rejected as ambiguous. The
active in-flight native recovery path was unqualified in that initial case. The configured
source guest is preserved, and the ignored default connection now selects the
verified restored test clone. Historical findings above remain unchanged.

The later explicit merged-conversation no-Send profile passed two reviewed
native pairs and an active focus-only cold-restore/reconciliation check.
Old qualification was rejected, fresh empty readiness observed, and consumed
focus refused before native dispatch with unchanged contract/deadline. See
the follow-up in the restore guide. This is an orderly-pause diagnostic;
arbitrary crash, guest Chrome interaction and Lab application execution remain
unqualified. The latest restored console and pinned SSH connection remain
available; earlier clones and the configured baseline are retained stopped.
