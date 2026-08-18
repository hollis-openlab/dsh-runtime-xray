# dsh-runtime-xray

`dsh-runtime-xray` is a read-only runtime inspection plugin for DeepSeek Harness. It explains the effective plugins, services, tools, prompt inputs, scopes, realms, and lifecycle state behind a live session without changing the runtime it observes.

The verified DSH revision and version policy are in [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).
This repository contains the public runtime plugin and its user-facing compatibility documentation. Internal product requirements, acceptance records, release gates, and development skills remain in the private development repository.

## Development

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

The private development target is DeepSeek Harness `0.1.0-rc.7` and Node.js `>=22.19.0` or `>=24`. Install the local package through the DSH plugin command, then enable it in a Web profile; the package declares the Host and Web Client halves in `package.json`.

## Install

Install the public GitHub bundle into the Web profile, then restart that profile:

```sh
dsh plugin --profile web add "github:hollis-openlab/dsh-runtime-xray#main"
dsh --profile web
```

The plugin appears as a peer `透视` / `X-Ray` view beside Conversation and Trajectory. To remove it, open Settings → Plugins, select `dsh-runtime-xray`, and uninstall it; restart the profile after the change.

## Quick start

Open any live session, click `透视`, and choose `当前会话` to inspect the effective Preset, model route, tools, prompt metadata, services, and effects. Choose `Host 运行时` to inspect shared Loader entries, services, and effects. Use the visible Refresh and Export controls when collecting a diagnostic snapshot.

## Configuration

The Host gateway accepts these optional values under the plugin's `config` entry in `cordis.yml`:

```yaml
- name: '@deepseek-ai/dsh-runtime-xray'
  config:
    maxEntitiesPerDomain: 2000
    maxRelationships: 4000
    maxEffectDepth: 32
    deadlineMs: 750
```

All values are bounded and validated at load time. The plugin does not require an API key, environment variable, network destination, or writable data directory.

The snapshot is read-only and allowlist-based. Default captures exclude credentials, environment values, prompt/runtime-context content, variable values, approval payloads, and tool results. Export uses per-file opaque identities and is capped at 1 MiB. Attribution is labeled exact, inferred, or unavailable; unavailable ownership is expected when DSH does not expose a public provider relationship.

The current vertical slice includes a Cordis Host Loader/service/effect projection, effective session tools and prompt metadata, a deterministic Snapshot normalizer, and a Web Client tab named `透视` (X-Ray). The tab is a peer of `对话` and `轨迹`; it uses the dedicated `runtimeXray/snapshot` Remote, supports Current session and Host scopes, domain tabs, status filtering, details, refresh cancellation, and a redacted export preview. Unsupported ownership and optional-domain facts remain explicit diagnostics.

Session service rows carry a snapshot-local scope marker; isolated Cordis realm identities and complete-section declarations remain unavailable when the active public DSH interfaces do not expose them. Export also replaces identities embedded inside effect labels or other diagnostic strings, not only dedicated ID fields.

## Permissions & data

X-Ray is read-only. It reads public Loader, service, tool, prompt, and fiber projections from the active DSH process. Default snapshots and exports exclude credentials, environment values, raw prompt and runtime-context content, variable values, approval payloads, tool results, and callable runtime objects. Export identities are pseudonymized consistently within one file and the output is capped at 1 MiB.

## Troubleshooting

- If `透视` is missing, confirm the package has `dsh.bundle.patch` in its root and restart the same DSH profile after installation.
- If a domain is `unsupported`, the active DSH composition does not expose that public inspection interface; this is not treated as an empty runtime.
- If the session is cold, open or create a live session and refresh; Host domains remain available without a live Agent.
- If a refresh fails, X-Ray keeps the last compatible snapshot and marks it stale. Use Retry after the service is healthy.

## License & security

This project is released under the MIT License. Please report security issues through GitHub's private vulnerability reporting for this repository when available; do not open a public issue containing credentials, prompt content, or other sensitive data.
