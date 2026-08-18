<div align="center">

# dsh-runtime-xray

**Make the current DeepSeek Harness runtime explain itself.**

[简体中文](README.md) · [English](README.en.md)

![Version](https://img.shields.io/badge/version-0.1.0-4d6bfe?style=flat-square)
![DSH](https://img.shields.io/badge/DeepSeek%20Harness-0.1.0--rc.7-4d6bfe?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.19-339933?style=flat-square&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

## What it solves

`dsh-runtime-xray` is a read-only runtime inspection plugin for DeepSeek Harness. Its X-Ray conversation view shows the runtime base, session capabilities, model input, and lifecycle resources that are effective now.

Trajectory answers what happened in the past. X-Ray answers what is active now. It does not change configuration, reload plugins, run commands, or add model-facing tools.

The view follows one runtime chain: runtime base → Skill / tools → model context. Services belong to the Host runtime base and are not presented as model inputs.

## Highlights

| Capability | What it shows |
| --- | --- |
| Layered navigation | Browse overview, runtime base, session capabilities, and model input by runtime level |
| Current session | Services, Skill, tools, model context, preset, and model route effective for this session |
| Whole app | Plugins, services, and lifecycle resources shared by every session |
| Scope inheritance | Shows the override order from Whole app to Preset to Current session |
| Model input | Counts system sections, runtime context, and variables, then groups sources such as Harness, tools, app, deployment, Plan, and UI |
| Plugin–service network | Solid lines are exact ownership; dashed lines are explicit `ctx.provide` inference |
| Lifecycle resources | Groups service registrations, child-plugin mounts, timers, listeners, and other resources; expanded rows retain source and depth |
| Service dictionary | Native DSH services have localized labels and hover descriptions; unknown services retain their raw key with a safe fallback |
| Evidence quality | Exact, inferred, or unavailable; guesses are never presented as facts |
| Fault containment | Other domains remain useful when one inspection domain fails |
| Read again | Collect current state manually; no polling runs while the view is closed |
| Download diagnostics | Download the displayed redacted JSON without recollecting |
| English and Chinese | Follows the DSH Web language setting live, without reloading the plugin |

## Install

```sh
dsh plugin --profile web add "github:hollis-openlab/dsh-runtime-xray#main"
dsh --profile web
```

After restarting the Web profile, X-Ray appears beside Conversation and Trajectory. To uninstall, open Settings → Plugins, remove `dsh-runtime-xray`, and restart the same profile.

## Use

1. Open a session and select X-Ray.
2. Select Current session and follow the runtime base, session capabilities, and model input layers.
3. Open Skill to inspect the effective Skill catalog; open Tools for model-callable actions.
4. Open Model context to inspect data types and source groups.
5. Select Whole app to inspect the plugin–service network and grouped lifecycle resources.
6. Select Read again after a hot reload or runtime change.
7. Select Download diagnostics to download the current redacted JSON snapshot.

## Privacy and permissions

The plugin reads only public runtime information from the active DSH process. It has no external network destination and requires no API key, environment variable, or writable data directory of its own.

Default snapshots and diagnostic files exclude:

- credentials and environment values;
- prompt and runtime-context content;
- variable values, approval payloads, and tool results;
- callable objects and arbitrary plugin configuration;
- raw session and runtime entity identities.

Export identities remain consistent within one file and the output is capped at 1 MiB.

## Compatibility

- DeepSeek Harness: `>=0.1.0-rc.7 <0.2.0`
- Node.js: `>=22.19.0` or `>=24`
- Verified DSH source revision: see [Compatibility](docs/COMPATIBILITY.md)

When public DSH interfaces do not expose service ownership, isolate realms, or complete prompt-section declarations, X-Ray reports the evidence as unavailable. It does not inspect private fields or guess.

## Configuration

All settings are optional and validated at plugin load:

```yaml
- name: '@deepseek-ai/dsh-runtime-xray'
  config:
    maxEntitiesPerDomain: 2000
    maxRelationships: 4000
    maxEffectDepth: 32
    deadlineMs: 750
```

## Troubleshooting

### X-Ray is missing

Restart the same Web profile after installation. The repository root must contain `cordis.patch.yml`, and the profile should list `@deepseek-ai/dsh-runtime-xray`.

### A domain is Unsupported

The active DSH composition does not expose that public inspection interface. Unsupported does not mean empty, and other domains remain available.

### The session is Cold

No live Agent currently owns that session. Open or create a live session and read again; Whole app inspection remains available.

### Reading fails

X-Ray preserves the last successful snapshot and marks it stale. Retry after the service is healthy.

## Development

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```

Release validation also covers Node.js 22.19 / 24.19 and visible installation, language switching, refresh, and export flows in a real DSH Web service.

## Security and license

Released under the [MIT License](LICENSE). Use GitHub private vulnerability reporting for security issues; do not place credentials, prompt content, or other sensitive data in a public issue. See [SECURITY.md](SECURITY.md).
