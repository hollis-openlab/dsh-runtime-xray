# Compatibility

The private development build is verified against DeepSeek Harness source revision `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca` and the `0.1.0-rc.7` package line.

The package declares the following runtime expectations:

- Node.js `>=22.19.0` or `>=24`.
- `@deepseek-ai/cordis` `^4.0.1`.
- DeepSeek Harness capability packages in the `>=0.1.0-rc.7 <0.2.0` range.

The full typecheck, 18-test suite, and build smoke passed under Node.js `v24.19.0` on the current development tree. The same checks also passed in a clean Linux `node:22.19.0-bookworm` container. The shell's Node.js `v22.15.1` is intentionally below the declared `22.19.0` floor and is not a compatibility result; package-manager engine warnings on that runtime must not be treated as a release signal.

The snapshot response is versioned and strictly decoded. An unsupported schema version or incompatible required field fails the Remote call; the Client keeps the previous compatible snapshot and shows the error state. Optional inspection domains are represented as `unsupported` or `failed` domains when the current composition lacks their public service.

Before public release, update the verified source revision and run the real Web + Codex in-app Browser acceptance workflow against that revision. A public release must not silently widen the compatibility range without a new assembled acceptance run.

The repository workflow `.github/workflows/compatibility.yml` runs typecheck, tests, and the build smoke on both declared Node endpoints (`22.19.0` and `24.19.0`). The local evidence now covers both endpoints; the workflow remains the repeatable CI version of the same matrix.
