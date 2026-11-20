# Carry an idea into a second Work

In the first Work, an Agent says, “I wanted the underline to feel like a loose
thread.” Let a second Work encounter that sentence. Its Agent can pick up the
idea, reinterpret it, or carry on without it. The two-Work example shows how
an artist and coding Agent can make the offer, the later choice and its effect
inspectable.

Give your coding Agent a brief like this when you start your own scratch Work.

> Carry those exact words into a second Work if I have permission to reuse
> them there. Offer them as a reference the next Agent can leave aside. Show
> me where the words came from, what the next return declared, and what my app
> made from that choice. Keep the inspection private while we test.

## What happens in the example

1. **Work A keeps the original.** It records the scripted Agent's exact
   words, the attributed Act and its Receipt. A separately permitted reader
   can inspect those selected records and the quote.
2. **Work B offers the idea.** A authorizes reuse of the selected statement
   and B authorizes its import. The app copies the quote and includes a source
   note with the Work, Act, revision, digest and importer. It gives the next
   participant the original SVG mark, the quote and the note as optional
   Context. The source note itself grants no access to A.
3. **Two scripted returns get the same offer.** One declares that it adapted
   the loose-thread idea. B's app adds a broken underline. The other declares
   that it set the quote aside. B's app keeps the original SVG byte for byte.
   The selected B account links each return, its Act and Receipt, the app's
   transformation Report and the exact output.

## What you and your coding Agent decide

Choose the source material, the choices the later Work opens up, the way your
app turns a choice into an effect, and what each reader may see. Use the SDK
to record the scoped offer and contributions and to assemble selected evidence.
Your app checks permission to copy from A and permit import into B. Treat
source access, copying and audience disclosure as separate permissions. The
fixture checks expiry before copying. Copies already delivered need their own
handling under your app's policy.

The script uses synthetic returns and fixed app permissions. Its importer and
reader use separate fixture principals bound to the released owner's Agent
seats. The evidence shows the offer, the return's declared use and the app's
effect. What the reference meant to a participant remains open to interpretation.

## Run and inspect

Use the [installation instructions](INSTALL.md) for your platform. The original
single-Work example is still the first exercise. The follow-on runs from the
installed scratch `consumer/` directory.

```sh
node --test examples/two-work/proof.mjs
```

Expect one pass. The fixture checks the exact quote and source, refuses copies
without both permissions, rejects out-of-scope or expired reuse, and verifies
both marks and access to the selected account. It closes and removes both
synthetic Works.

For a local inspection, set `AAP_TWO_WORK_EVIDENCE` to a new file in an owned
private directory before running the example. Ask your coding Agent to trace
the quote and provenance in `laterWork`, then find `adapt-effect` and
`keep-effect` and compare their inputs and SVG outputs. The optional file
contains synthetic material and remains after the run so you can inspect it.
