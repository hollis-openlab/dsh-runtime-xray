/** Pure projection from Loader-owned entries into the X-Ray snapshot model. */

import type { Context } from '@deepseek-ai/cordis'
import type { EffectEntity, PluginEntry, ServiceEntity, SnapshotRelationship } from './snapshot.ts'

/** Minimal Loader projection required by the Host collector. */
export interface LoaderEntry {
  readonly id: string
  readonly disabled: boolean
  readonly options: { readonly group?: boolean; readonly name: string }
  readonly fiber?: FiberLike
}

/** Public Fiber relations used for lifecycle ownership projection. */
export interface FiberLike {
  readonly name?: string
  readonly state: number
  readonly parent?: { readonly fiber: FiberLike }
  readonly inject?: Record<string, unknown>
  readonly getEffects?: () => readonly EffectMetaLike[]
}

/** Public Cordis effect metadata used by the loader fiber projection. */
export interface EffectMetaLike {
  readonly label: string
  readonly children: readonly EffectMetaLike[]
}

/** Public Cordis service-store projection used for service ownership facts. */
export interface ServiceImplementationLike {
  readonly name: string
  readonly fiber: FiberLike
}

const FIBER_PHASE: Record<number, PluginEntry['phase']> = {
  0: 'pending',
  1: 'loading',
  2: 'active',
  3: 'failed',
  4: null,
  5: 'unloading',
}

/** Project Loader entries without retaining mutable Cordis objects. */
export function projectLoaderEntries(entries: Iterable<LoaderEntry>, hasService?: (name: string) => boolean): readonly PluginEntry[] {
  const plugins: PluginEntry[] = []
  for (const entry of entries) {
    if (entry.options.group) continue
    const requiredServices = Object.keys(entry.fiber?.inject ?? {}).sort()
    const missingServices = hasService === undefined ? [] : requiredServices.filter(name => !hasService(name))
    plugins.push({
      entryId: entry.id,
      moduleName: entry.options.name,
      enabled: !entry.disabled,
      phase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state] ?? null,
      ...(requiredServices.length === 0 ? {} : { requiredServices }),
      ...(missingServices.length === 0 ? {} : { missingServices }),
    })
  }
  return plugins
}

/** Flatten public fiber effect metadata into a bounded snapshot-local tree. */
export function projectFiberEffects(entries: Iterable<LoaderEntry>, maxDepth = Number.POSITIVE_INFINITY, maxEntities = Number.POSITIVE_INFINITY): readonly EffectEntity[] {
  const effects: EffectEntity[] = []
  for (const entry of entries) {
    const roots = entry.fiber?.getEffects?.() ?? []
    const visit = (nodes: readonly EffectMetaLike[], parentId: string | undefined, depth: number, path: readonly number[]): void => {
      nodes.forEach((node, index) => {
        if (effects.length >= maxEntities) return
        const effectId = `${entry.id}#effect-${[...path, index].join('.')}`
        effects.push({
          effectId,
          label: node.label,
          ...(parentId === undefined ? {} : { parentId }),
          depth,
          attribution: {
            quality: 'exact',
            code: 'loader-fiber-effect',
            sourceId: entry.id,
            explanation: 'The effect is exposed by the Loader entry’s public Fiber metadata.',
          },
        })
        if (depth < maxDepth) visit(node.children, effectId, depth + 1, [...path, index])
      })
    }
    visit(roots, undefined, 0, [])
  }
  return effects
}

/** Project live public service registrations without serializing service objects. */
export function projectServiceEntities(
  ctx: Context,
  entries: readonly LoaderEntry[],
): readonly ServiceEntity[] {
  const reflect = (ctx as Context & {
    readonly reflect: { readonly store: Record<PropertyKey, ServiceImplementationLike | undefined> }
  }).reflect
  const store = reflect.store as unknown as Record<PropertyKey, ServiceImplementationLike | undefined>
  const implementations = Object.getOwnPropertySymbols(store)
    .map(key => store[key])
    .filter((implementation): implementation is ServiceImplementationLike => implementation !== undefined)
  return implementations.map(implementation => {
    const owner = entries.find(entry => entry.fiber !== undefined && withinFiber(implementation.fiber, entry.fiber))
    return {
      name: implementation.name,
      status: implementation.fiber.state === 2 ? 'available' : 'unknown',
      ...(owner === undefined ? {} : { attribution: {
        quality: 'exact' as const,
        code: 'loader-service-owner',
        sourceId: owner.id,
        explanation: 'The public service registry points to a Fiber inside this Loader entry’s lifecycle subtree.',
      } }),
    }
  })
}

/** Infer service contributions only from explicit public ctx.provide labels. */
export function inferServiceRelationships(
  effects: readonly EffectEntity[],
  services: readonly ServiceEntity[],
): readonly SnapshotRelationship[] {
  const names = new Set(services.map(service => service.name))
  return effects.flatMap((effect) => {
    const match = /^ctx\.provide\("([^"\\]+)"\)$/.exec(effect.label)
    const serviceName = match?.[1]
    const sourceId = effect.attribution?.sourceId
    if (serviceName === undefined || sourceId === undefined || !names.has(serviceName)) return []
    return [{
      relationshipId: `inferred:${sourceId}->${serviceName}`,
      kind: 'provides' as const,
      fromId: sourceId,
      toId: serviceName,
      attribution: {
        quality: 'inferred' as const,
        code: 'effect-label-service',
        sourceId,
        explanation: `The public effect label names ctx.provide("${serviceName}"), but the service registry does not expose a direct Loader owner reference.`,
      },
    }]
  })
}

function withinFiber(fiber: FiberLike, root: FiberLike): boolean {
  let current = fiber
  while (true) {
    if (current === root) return true
    const parent = current.parent?.fiber
    if (parent === undefined || parent === current) return false
    current = parent
  }
}
