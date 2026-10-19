# Reading SDK pilots

The current pilot is **SDK 0.1.0 reading** on Lab, Inshell, Pulse and
signatures.gallery. Each uses the same reusable browser interface and handoff
controller with its own canonical prompt and index. Questions are asked inside
the visitor's Agent. THOUGHT participation is deferred to the next release.

Start the prepared Lab preview with:

```sh
npm run pilot:lab
```

Open <http://127.0.0.1:4174/>. New conversations offer a native client URL;
existing conversations offer copying. The visitor reviews and sends inside
their Agent. Installation and browser permission may be required; manual
fallback is always available. No local Agent service, website Q&A, model call,
answer callback, account or wallet is required.

See the [four-consumer guide](reading-consumers/README.md) for application
previews, developer imports, pinned patches and reproduction commands, and the
[current qualification](reading-consumers/QUALIFICATION.md) for actual checks,
client support and trust limits. The SDK installation/API guide is
[protocol/README.md](../protocol/README.md).

These integrations live in isolated local clones with reviewable binary
patches. They have not been deployed to the public sites. The normal Lab build
now contains the SDK interface; the local host only serves static files.
Evidence is optional and does not turn opening/copying into Agent participation.

Earlier [Q&A and native-handoff observations](QUALIFICATION.md),
[alpha shared-consumer qualification](PROTOCOL-QUALIFICATION.md),
[Lab helper patch](lab-consumer.patch), [THOUGHT patch](thought-consumer.patch)
and [reading helper code](reading/) are preserved as historical experiments.
Their checks do not automatically qualify this release. Existing core exports
remain experimental; preserving the old THOUGHT bootstrap does not expand
0.1's supported reading scope or qualify a new artwork flow.
