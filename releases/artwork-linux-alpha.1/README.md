# Artwork SDK Linux prerelease candidate

Build a small Agent Art encounter with your coding Agent on the named Linux
setup. The core records and preserves exact contributions, receipts and app
Reports. It provides scoped inspection and a planned maintenance path for one
Work. The optional evidence-account module assembles an already permitted
selection for inspection. The artist chooses the encounter, app treatment and
what an audience may see. Export and recipient delivery need their own copy
permission.

## Install the exact pair

Use the named Ubuntu 24.04.5 arm64 profile with Node 22.23.4, SQLite 3.53.4,
npm 10.9.9, one dedicated non-root owner and private guest-local ext4. The
test facility is a disposable Tart guest. Verify actual ext4 and the intended
mount before app startup. The published macOS artwork alpha has its own pair
and lock.

| Package | Version | SHA-256 |
| --- | --- | --- |
| `@agent-art/artwork-sdk` | `0.0.0-planned-transfer.2` | `2121d146e19132c0e452b939b01010cd46925a7bcd58b919c243a2854bcaf9c1` |
| `@agent-art/participation-account` | `0.0.0-account-linux.1` | `6f44098aa06dae928ab4903387adc47c81cdec03b5add39041316a9e8697bd54` |
| Fresh consumer `package-lock.json` | Lockfile v3 | `03af07c3669194a9bc591735b340c799695ecbba907111917a2abd8171d43fb8` |

In the delivered fresh consumer directory, verify `SHA256SUMS` and check the
toolchain before installing. Obtain the digests from the same reviewed
distribution as the archives.

```sh
sha256sum -c SHA256SUMS
node --version
node -p process.versions.sqlite
npm --version
mkdir .npm-cache
touch .npm-userconfig .npm-globalconfig
npm ci --offline --ignore-scripts --no-audit --no-fund --bin-links=false \
  --update-notifier=false --logs-max=0 --cache ./.npm-cache \
  --userconfig ./.npm-userconfig --globalconfig ./.npm-globalconfig
```

Use `npm ci` only in that fresh scratch consumer. For an existing project,
keep its own dependency lock and run its app-specific fixture checks on the
exact new dependencies. The companion has an exact peer dependency on the
Linux core above.

## Qualification

The exact pair installed offline on the named guest. Across two boots on the
same scratch ext4 attachment, the closed source kept its original device,
inode and SQLite digest. The reopened owner returned the same selected
account with the original receipt and expression. In separate synthetic
fixtures, 11 transfer checks, 17 evidence-account cases and 7 joined checks
passed. The joined fixture collected at the activated destination, linked a
new Report to the original receipt and verified denial, withdrawal and expiry.
Both guest sessions shut down cleanly and the scratch image was detached
and removed. The distribution's `QUALIFICATION.json` records the scope.

Signatures' earlier end-to-end app and supervisor proof used the preserved
`0.0.0-planned-transfer.1` predecessor. The new pair preserves its core runtime
bytes. An actual Signatures adoption uses its own updated lock and app proof.

## Work with your coding Agent

> Read both installed package READMEs and the core's `CONSUMER-CONTRACT.md`
> and `LINUX-OWNER-PROFILE.md`. Build one synthetic encounter from my idea.
> Keep the Agent's opportunity to contribute and what the app does with the
> result recognizable. Show me one exact contribution, its receipt and the
> app's recorded consequence. Assemble a selected account from the same
> authoritative Work owner when its source and copy permissions allow it.

Use the core's existing contracts, `@agent-art/artwork-sdk/owner` and raw
`@agent-art/artwork-sdk/mcp` imports. The companion's three entries are
`@agent-art/participation-account`, `@agent-art/participation-account/collect`
and `@agent-art/participation-account/local-inspection`. App authentication,
consent, rendering, audience presentation and operations stay with the app.

## Maintenance boundary

Clean original-store reopen requires an unchanged canonical path, device and
inode. The planned transfer covers one Work, one fresh destination on the
same ext4 volume and a trusted app's final cutoff attestation. The core retires
the source and checks the exact bound destination. The app reconciles its
journal, artifacts and authority before confirming the cutoff. A failure can
leave serving paused. Preserve both stores and inspect the existing outcome
before routing traffic. Repeat transfer, another volume or host, crash
durability, writable recovery after unexpected host loss and production
availability need separate support. Collection and sharing have separate
rights, and fixture checks establish no independent Agent origin.
