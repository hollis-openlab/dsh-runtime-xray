import { describe, expect, it } from 'vitest'
import { buildRuntimeGraph } from '../src/client/RuntimeVisuals.tsx'
import { buildPromptGroups } from '../src/client/PromptComposition.tsx'
import { presentService } from '../src/client/ServicePresentation.ts'
import { buildEffectGroups, presentEffect } from '../src/client/EffectComposition.tsx'
import { normalizeSnapshot, type SnapshotInput } from '../src/snapshot.ts'
import type { RuntimeXrayLocaleKey } from '../src/client/locales.ts'

const t = (key: RuntimeXrayLocaleKey): string => key

describe('runtime map graph', () => {
  it('projects session scope and request inputs into a deterministic DAG', () => {
    const snapshot = normalizeSnapshot(fixture())
    const graph = buildRuntimeGraph(snapshot, 'session', t)

    expect(graph.nodes.map(node => node.id)).toEqual([
      'scope:host',
      'scope:preset',
      'scope:session',
      'input:services',
      'input:skills',
      'input:tools',
      'input:prompt',
      'context:model',
      'request:model',
    ])
    expect(graph.edges).toHaveLength(10)
    expect(graph.nodes.every(node => Number.isFinite(node.position.x) && Number.isFinite(node.position.y))).toBe(true)
    expect(graph.nodes.find(node => node.id === 'input:tools')?.data.domain).toBe('tools')
    expect(graph.edges.some(edge => edge.source === 'input:services' && edge.target === 'request:model')).toBe(false)
    expect(graph.edges.some(edge => edge.source === 'context:model' && edge.target === 'request:model')).toBe(true)
  })

  it('bounds a large Host graph while preserving evidence totals', () => {
    const input = fixture()
    const relationships = Array.from({ length: 40 }, (_, index) => ({
      relationshipId: `link-${index}`,
      kind: 'provides' as const,
      fromId: `plugin-${index % 14}`,
      toId: `service-${index % 16}`,
      attribution: {
        quality: index % 3 === 0 ? 'exact' as const : 'inferred' as const,
        code: 'fixture',
      },
    }))
    const graph = buildRuntimeGraph(normalizeSnapshot({ ...input, relationships }), 'host', t)

    expect(graph.nodes.length).toBeLessThanOrEqual(13)
    expect(graph.edges.length).toBeLessThanOrEqual(18)
    expect(graph.exactLinks).toBe(14)
    expect(graph.inferredLinks).toBe(26)
    expect(graph.hiddenLinks).toBe(relationships.length - graph.edges.length)
    expect(graph.nodes.every(node => Number.isFinite(node.position.x) && Number.isFinite(node.position.y))).toBe(true)
  })

  it('groups prompt metadata by semantic source and preserves request order', () => {
    const names = [
      'section:tool:write',
      'section:harness:identity',
      'context:sandbox:policy',
      'variable:cwd',
      'section:tool:read',
    ]
    const groups = buildPromptGroups(names.map((name, position) => ({
      id: `prompt:${position}`,
      entity: { name, position, bytes: position * 10, contentHash: `hash-${position}` },
    })), t)

    expect(groups.map(group => group.id)).toEqual(['section:harness', 'section:tool', 'context', 'variable'])
    expect(groups[1]?.rows.map(row => row.label)).toEqual(['write', 'read'])
    expect(groups[1]?.bytes).toBe(40)
    expect(groups[2]?.rows[0]?.label).toBe('sandbox / policy')
  })

  it('maps known service keys and preserves an unknown service fallback', () => {
    expect(presentService('agentLoop', t)).toEqual({
      label: 'serviceAgentLoopLabel',
      description: 'serviceAgentLoopDescription',
    })
    expect(presentService('pluginOwnedService', t)).toEqual({
      label: 'internalServiceLabel',
      description: 'internalServiceDescription',
    })
  })

  it('groups Cordis effects and translates lifecycle labels', () => {
    const rows = [
      { id: 'provide', label: 'ctx.provide("directoryPicker")', description: '', entity: { effectId: 'provide', label: 'ctx.provide("directoryPicker")', depth: 0, attribution: { quality: 'exact' as const, code: 'test', sourceId: 'picker' } } },
      { id: 'plugin-a', label: 'ctx.plugin()', description: '', entity: { effectId: 'plugin-a', label: 'ctx.plugin()', depth: 0, attribution: { quality: 'exact' as const, code: 'test', sourceId: 'a' } } },
      { id: 'plugin-b', label: 'ctx.plugin()', description: '', entity: { effectId: 'plugin-b', label: 'ctx.plugin()', depth: 0, attribution: { quality: 'exact' as const, code: 'test', sourceId: 'b' } } },
      { id: 'debounce', label: 'ctx.debounce()', description: '', entity: { effectId: 'debounce', label: 'ctx.debounce()', depth: 1, attribution: { quality: 'exact' as const, code: 'test', sourceId: 'a' } } },
    ]
    const groups = buildEffectGroups(rows, t)

    expect(groups.map(group => [group.id, group.rows.length])).toEqual([
      ['service', 1], ['plugin', 2], ['timer', 1],
    ])
    expect(presentEffect('ctx.provide("directoryPicker")', t).label).toBe('effectServicePrefix：serviceDirectoryPickerLabel')
    expect(presentEffect('ctx.debounce()', t).label).toBe('effectDebounceLabel')
  })
})

function fixture(): SnapshotInput {
  return {
    capture: { startedAt: 1, completedAt: 2 },
    host: {
      plugins: {
        status: 'ready',
        diagnostics: [],
        items: Array.from({ length: 14 }, (_, index) => ({
          entryId: `plugin-${index}`,
          moduleName: `@fixture/plugin-${index}`,
          enabled: true,
          phase: 'active' as const,
        })),
      },
      services: {
        status: 'ready',
        diagnostics: [],
        items: Array.from({ length: 16 }, (_, index) => ({ name: `service-${index}`, status: 'available' as const })),
      },
      effects: { status: 'ready', diagnostics: [], items: [] },
    },
    session: {
      sessionId: 'session-1',
      status: 'running',
      preset: 'architect',
      modelProvider: 'deepseek',
      model: 'deepseek-chat',
      services: { status: 'ready', diagnostics: [], items: [] },
      skills: {
        status: 'ready',
        diagnostics: [],
        items: [{ name: 'review', description: 'Review code', provider: 'local', source: '/skills/review', modelInvocable: true, userInvocable: true }],
      },
      tools: { status: 'ready', diagnostics: [], items: [{ name: 'read_file', schemaBytes: 128 }] },
      prompt: { status: 'ready', diagnostics: [], items: [{ name: 'section:system', position: 0, bytes: 64, contentHash: 'hash' }] },
    },
  }
}
