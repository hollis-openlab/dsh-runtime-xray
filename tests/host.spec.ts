import { describe, expect, it } from 'vitest'
import { projectFiberEffects, projectLoaderEntries, projectServiceEntities } from '../src/host-projection.ts'
import { SNAPSHOT_REQUEST_SCHEMA, SNAPSHOT_RESPONSE_SCHEMA, TYPERT_REMOTE } from '../src/remote.ts'

describe('Host Loader projection', () => {
  it('omits groups and projects lifecycle state into detached entries', () => {
    const entries = projectLoaderEntries([
      { id: 'z', disabled: false, options: { name: '@z' }, fiber: { state: 2 } },
      { id: 'group', disabled: false, options: { name: 'group', group: true }, fiber: { state: 2 } },
      { id: 'a', disabled: true, options: { name: '@a' }, fiber: { state: 3 } },
    ])

    expect(entries).toEqual([
      { entryId: 'z', moduleName: '@z', enabled: true, phase: 'active' },
      { entryId: 'a', moduleName: '@a', enabled: false, phase: 'failed' },
    ])
  })

  it('reports missing public Loader dependencies without exposing runtime objects', () => {
    const entries = projectLoaderEntries([
      { id: 'entry-a', disabled: false, options: { name: '@a' }, fiber: { state: 1, inject: { loader: {}, missing: {} } } },
    ], name => name === 'loader')
    expect(entries[0]?.requiredServices).toEqual(['loader', 'missing'])
    expect(entries[0]?.missingServices).toEqual(['missing'])
  })

  it('publishes one strict snapshot Remote descriptor', () => {
    expect(TYPERT_REMOTE.package).toBe('@deepseek-ai/dsh-runtime-xray')
    expect(TYPERT_REMOTE.descriptors).toHaveLength(1)
    expect(TYPERT_REMOTE.descriptors[0]?.id).toBe('@deepseek-ai/dsh-runtime-xray#runtimeXray/snapshot')
    expect(TYPERT_REMOTE.descriptors[0]?.result.mode).toBe('strict')
    expect(TYPERT_REMOTE.descriptors[0]?.cancellation).toEqual({ parameter: 'signal' })
    expect(TYPERT_REMOTE.descriptors[0]?.sourceLocation?.line).toBe(84)
  })

  it('rejects malformed request and response payloads at the Remote seam', () => {
    expect(() => SNAPSHOT_REQUEST_SCHEMA.parse({ domains: ['not-a-domain'] })).toThrow()
    expect(() => SNAPSHOT_RESPONSE_SCHEMA.parse({ schemaVersion: 1, health: 'healthy' })).toThrow()
  })

  it('flattens public Fiber effect metadata while preserving parent links', () => {
    const effects = projectFiberEffects([{
      id: 'entry-a',
      disabled: false,
      options: { name: '@a' },
      fiber: {
        state: 2,
        getEffects: () => [{ label: 'root', children: [{ label: 'child', children: [] }] }],
      },
    }])

    expect(effects.map(effect => ({ effectId: effect.effectId, label: effect.label, parentId: effect.parentId, depth: effect.depth }))).toEqual([
      { effectId: 'entry-a#effect-0', label: 'root', parentId: undefined, depth: 0 },
      { effectId: 'entry-a#effect-0.0', label: 'child', parentId: 'entry-a#effect-0', depth: 1 },
    ])
  })

  it('projects only public service metadata and attributes the owning Loader entry', () => {
    const fiber = { name: 'entry-fiber', state: 2 }
    const ctx = { reflect: { store: { [Symbol('service')]: { name: 'tools', fiber } } } }
    const services = projectServiceEntities(ctx as never, [{
      id: 'entry-a', disabled: false, options: { name: '@a' }, fiber,
    }])
    expect(services).toEqual([{
      name: 'tools',
      status: 'available',
      attribution: {
        quality: 'exact',
        code: 'loader-service-owner',
        sourceId: 'entry-a',
        explanation: 'The public service registry points to a Fiber owned by this Loader entry.',
      },
    }])
  })
})
