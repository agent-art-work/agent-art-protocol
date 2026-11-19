# Run the single-Work example

Use macOS on Apple silicon with Node **22.23.4**, its SQLite **3.53.4** and
npm **10.9.9**. Python 3 can run the bundled file verifier below.

Obtain the bundle and its `BUNDLE.json` from the same trusted channel.
Compare the SHA-256 with the bundle metadata before extracting. Use a
fresh scratch directory for the extracted consumer.

```sh
shasum -a 256 agent-art-artwork-macos-alpha.2.tar.gz
tar -xzf agent-art-artwork-macos-alpha.2.tar.gz
cd artwork-macos-alpha.2
shasum -a 256 -c SHA256SUMS
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

The versions should read `darwin arm64 v22.23.4 3.53.4` and `10.9.9`.
Stop on a mismatch. Use the scratch lock only in this fresh consumer.
An existing app keeps its own reviewed lock and qualification.

Check the installed packages and run the example from `consumer/`:

```sh
python3 -B ../package_verify.py --identity identities/core.json --archive vendor/artwork-sdk-0.0.0-mcp.1.tgz --installed node_modules/@agent-art/artwork-sdk --lock package-lock.json
python3 -B ../package_verify.py --identity identities/account.json --archive vendor/participation-account-0.0.0-account.1.tgz --installed node_modules/@agent-art/participation-account --lock package-lock.json
node --test examples/stated-intention/proof.mjs
```

Expect one passing test. Node may print its SQLite experimental-feature
warning. The test writes one synthetic Work in a temporary directory under
the consumer, then closes and removes the Work. No account or Agent call is
needed. See the [guide](GUIDE.md) for what to carry into your own app.
