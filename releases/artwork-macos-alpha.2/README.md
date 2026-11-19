# Artwork SDK macOS alpha.2

This prerelease candidate gives an artist and coding Agent a guide and a
runnable example for preserving contributions, optional stated intentions
and the app's effect on the work.

Start with the [artist guide](GUIDE.md) or [install the example](INSTALL.md).
The example uses one synthetic Work and an offered SVG. Its evidence account
shows which bytes were offered and returned, who is attributed to each Act,
how the app derived the result, and what the selected reader can inspect.

| Component | Exact version |
| --- | --- |
| Artwork SDK | `@agent-art/artwork-sdk@0.0.0-mcp.1` |
| Evidence-account module | `@agent-art/participation-account@0.0.0-account.1` |
| Runtime | macOS arm64, Node 22.23.4, SQLite 3.53.4, npm 10.9.9 |

The package archives and bootstrap consumer lock are the same bytes as
`artwork-alpha.1`. The bundle adds the guide and runnable example using the
existing APIs. The evidence-account module is optional for applications.
The example installs it to demonstrate permission-scoped inspection.

The example uses scripted returns and a synthetic attribution. The account
records a statement and its source. Audiences interpret intention and
artistic significance. Live participant connections, actual Signatures
integration, Linux qualification of this example, and two-Work reuse each
have a separate qualification boundary.
