# Flat reading prerelease — 0.1.5-alpha.2

The operator approved committing/pushing and publishing this GitHub prerelease
on 2026-10-24, and asked AgentArt.work to integrate the exact release.
Release URL: https://github.com/agent-art-work/agent-art-protocol/releases/tag/v0.1.5-alpha.2
Publication is completed by the release workflow after verifying the pushed tag
and staged assets. Announcements, npm publication and site deployment are excluded.

AgentArt.work reported that its approved deployed flat-label presentation cannot
adopt public alpha.1 without restoring Quiet field. This release supplies the
flat presentation through the shared package, preserving the reading API.
Site production version/digest are owner-reported, not reverified here.

## Exact package

- Name: `@agent-art/protocol@0.1.5-alpha.2`
- MIT license included; `private: true` guards npm publication.
- Archive: `agent-art-protocol-0.1.5-alpha.2.tgz`
- Bytes: 18235
- SHA-256: `eadf80c14307b635bc69589b3a33ac747314b73fdef96cfb05f169337ffcc2b2`
- [Guide and supported hooks](README.md)
- [Exact qualification](QUALIFICATION.json)
- [Release notes](RELEASE-NOTES.md)

The content-addressed archive and install consumer are generated under the
ignored `.local/releases/0.1.5-alpha.2/` directory. Twelve archive members match
staged and installed bytes; the consumer lock binds the exact archive. Seven
base runtime/type files are unchanged; only UI/CSS change in runtime.

## Checks and limits

Installed runtime tests: 26 passed. Strict TypeScript consumer: passed.
Installed exports, native payloads, manual fallback and receipt integrity/limits:
passed. Six stable-Chrome viewport/theme scenarios passed, with 16 interaction
cases, 13 feedback/layout cases, public-hook checks and five inspected captures.
No native launch or Agent Send occurred. Initial canvas color assertions failed
on premultiplied-alpha rounding; raw failed reports are retained locally.
The harness now compares premultiplied channels; package bytes did not change.

Default full row width is approximately 319.32 CSS px with the qualified system
font; a 288px container wraps into label/action rows. Equal gaps, width stability
and no overflow were checked in both states. Actual site integration remains
with AgentArt.work. No new live-client result or source-reading claim is made.

## Reproduce

```sh
node releases/0.1.5-alpha.2/prepare.mjs
node releases/0.1.5-alpha.2/check-ui.mjs
```

Builds run offline with install scripts disabled. Types require a local compiler
(`AAP_RELEASE_TSC` can select one); absent compiler is pending, never a pass.
Browser checks require permitted loopback sockets and stable regular Chrome.
Inspect generated screenshots; regenerating qualification resets inspection.
A clean source-only copy reproduced the exact archive digest, all 26 runtime
tests and strict type check, without the private prototype, old archive or
prior SDK installation. The explicit local compiler was reused without download.
New source passed UTF-8/LF/no-BOM, local-link and redacted secret/personal-path
checks. Retained 0.1.4 and alpha.1 sources are unchanged.

The earlier alpha.1 approval was followed by explicit approval for this new
release. Historical archives/tags and SDK 0.1.4 stay unchanged. No site deployment,
npm publishing, announcement or live Agent trial is authorized. The packaged guide
was finalized after candidate approval; fresh archive/lock and browser checks
qualify the final digest above. The earlier candidate remains retained locally.
