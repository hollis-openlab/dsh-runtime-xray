#!/usr/bin/env node
import { build } from 'esbuild'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))
const lib = join(ROOT, 'lib')
await mkdir(lib, { recursive: true })
await rm(join(lib, 'types', 'client', 'plugin-inventory.d.ts'), { force: true })

await build({
  bundle: true,
  entryPoints: [join(ROOT, 'src', 'index.ts')],
  format: 'esm',
  outfile: join(lib, 'index.js'),
  platform: 'node',
  target: 'es2022',
})

await build({
  bundle: true,
  entryPoints: [join(ROOT, 'src', 'snapshot.ts')],
  format: 'esm',
  outfile: join(lib, 'snapshot.js'),
  platform: 'node',
  target: 'es2022',
})

await build({
  bundle: true,
  entryPoints: [join(ROOT, 'src', 'remote.ts')],
  format: 'esm',
  outfile: join(lib, 'typert.remote-client.js'),
  platform: 'node',
  target: 'es2022',
})

await writeFile(join(lib, 'typert.host.js'), [
  'import { TYPERT_REMOTE } from "./typert.remote-client.js";',
  'export const TYPERT = {',
  '  package: TYPERT_REMOTE.package,',
  '  face: "host",',
  '  schemas: [],',
  '  invocations: TYPERT_REMOTE.descriptors,',
  '  model: { services: [], events: [], objects: [] },',
  '};',
  'export default TYPERT;',
  '',
].join('\n'))
await writeFile(join(lib, 'types', 'typert.host.d.ts'), [
  'export declare const TYPERT: unknown;',
  'export default TYPERT;',
  '',
].join('\n'))

await build({
  bundle: true,
  entryPoints: [join(ROOT, 'src', 'invariant.ts')],
  format: 'esm',
  outfile: join(lib, 'invariant.js'),
  platform: 'node',
  target: 'es2022',
})

const temporaryClient = join(lib, '_client.js')
await build({
  bundle: true,
  entryPoints: [join(ROOT, 'src', 'client', 'index.ts')],
  external: ['react'],
  format: 'cjs',
  logOverride: { 'commonjs-variable-in-esm': 'silent' },
  outfile: temporaryClient,
  platform: 'browser',
  target: 'es2020',
})

const clientSource = (await readFile(temporaryClient, 'utf8')).trimEnd()
await rm(temporaryClient)
await writeFile(join(lib, 'client.js'), [
  'window.__ModuleLoader__.load({',
  `  id: ${JSON.stringify(pkg.name)},`,
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  clientSource,
  '    return module.exports;',
  '  },',
  '});',
  '',
].join('\n'))

const host = await import(join(lib, 'index.js'))
if (typeof host.default !== 'function' || host.default.name !== 'RuntimeXrayGateway' || typeof host.RuntimeXrayGateway !== 'function') {
  throw new Error('host half does not expose the expected Remote service')
}
const { Context } = await import('@deepseek-ai/cordis')
const smokeContext = new Context()
await smokeContext.provide('loader', { entries: () => [] })
await smokeContext.provide('agents', { get: () => undefined })
const hostSnapshot = await new host.RuntimeXrayGateway(smokeContext).snapshot({ sessionId: 'smoke-session' })
const typert = await import(join(lib, 'typert.host.js'))
if (typert.TYPERT?.face !== 'host' || typert.TYPERT.invocations.length !== 1) {
  throw new Error('Host Typert artifact is incomplete')
}
const remoteModule = await import(join(lib, 'typert.remote-client.js'))
remoteModule.TYPERT_REMOTE.descriptors[0].result.schema.parse(hostSnapshot)
new Function(await readFile(join(lib, 'client.js'), 'utf8'))
console.log(`built ${pkg.name}: host, invariant, and client halves`)
