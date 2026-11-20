# Install and run the artwork examples on Ubuntu arm64

Use Ubuntu **24.04.5 arm64**, a private guest-local **ext4** directory owned by
a non-root owner, Node **22.23.4**, its SQLite **3.53.4** and npm **10.9.9**.
Python 3 runs the bundled file verifier.

Obtain the bundle and its `BUNDLE.json` from the same trusted channel.
Compare the SHA-256 with the bundle metadata before extracting. Use a
fresh scratch directory on ext4.

```sh
sha256sum agent-art-artwork-linux-alpha.3.tar.gz
tar -xzf agent-art-artwork-linux-alpha.3.tar.gz
cd artwork-linux-alpha.3
sha256sum --strict -c SHA256SUMS
```

From the extracted release root, check the runtime and install into the
provided scratch consumer. Both local package archives and their lock
are included. The install runs offline with lifecycle scripts disabled.

```sh
cd consumer
node -p '[process.platform, process.arch, process.version, process.versions.sqlite].join(" ")'
npm --version
mkdir .npm-cache
touch .npm-userconfig .npm-globalconfig
npm ci --offline --ignore-scripts --no-audit --no-fund --bin-links=false --update-notifier=false --logs-max=0 --cache ./.npm-cache --userconfig ./.npm-userconfig --globalconfig ./.npm-globalconfig
```

The versions should read `linux arm64 v22.23.4 3.53.4` and `10.9.9`.
Stop on a mismatch. Use the scratch lock only in this fresh consumer.
An existing app keeps its own reviewed lock and qualification.

Check the installed packages and run the first example from `consumer/`:

```sh
python3 -B ../package_verify.py --identity identities/core.json --archive vendor/artwork-sdk-0.0.0-planned-transfer.2.tgz --installed node_modules/@agent-art/artwork-sdk --lock package-lock.json
python3 -B ../package_verify.py --identity identities/account.json --archive vendor/participation-account-0.0.0-account-linux.1.tgz --installed node_modules/@agent-art/participation-account --lock package-lock.json
node --test examples/stated-intention/proof.mjs
```

Expect one passing test. It creates one temporary synthetic Work and removes
it on exit. Node may print its SQLite experimental-feature warning.

Once that passes, run the follow-on from the same scratch consumer.

```sh
node --test examples/two-work/proof.mjs
```

Expect one passing test and removal of both synthetic Work stores. The
[two-Work walkthrough](TWO-WORK.md) explains how to inspect the optional
local evidence file. Use the [artist guide](GUIDE.md) to adapt the examples
with your coding Agent. Both examples run offline with scripted returns.
