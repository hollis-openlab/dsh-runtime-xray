import { describe, expect, it } from 'vitest'
import { normalizeSnapshot, type SnapshotInput } from '../src/snapshot.ts'

function largeFixture(): SnapshotInput {
  return {
    capture: { startedAt: 1, completedAt: 2 },
    host: {
      plugins: { status: 'ready', items: Array.from({ length: 250 }, (_, index) => ({ entryId: `plugin-${index}`, moduleName: `@fixture/plugin-${index}`, enabled: true, phase: 'active' as const })), diagnostics: [] },
      services: { status: 'ready', items: Array.from({ length: 64 }, (_, index) => ({ name: `service-${index}`, status: 'available' as const })), diagnostics: [] },
      effects: { status: 'ready', items: Array.from({ length: 500 }, (_, index) => ({ effectId: `effect-${index}`, label: 'fixture.effect', depth: index % 8 })), diagnostics: [] },
    },
    session: {
      sessionId: 'fixture-session',
      status: 'running',
      services: { status: 'ready', items: [], diagnostics: [] },
      tools: { status: 'ready', items: Array.from({ length: 500 }, (_, index) => ({ name: `tool-${index}`, schemaBytes: index + 10 })), diagnostics: [] },
      prompt: { status: 'ready', items: Array.from({ length: 500 }, (_, index) => ({ name: `prompt-${index}`, position: index, bytes: index + 1, contentHash: `hash-${index}` })), diagnostics: [] },
    },
  }
}

describe('large runtime fixture', () => {
  it('normalizes the release-scale fixture within the host budget', () => {
    const started = performance.now()
    const snapshot = normalizeSnapshot(largeFixture())
    const elapsed = performance.now() - started

    expect(snapshot.session?.tools.items).toHaveLength(500)
    expect(snapshot.session?.prompt.items).toHaveLength(500)
    expect(elapsed).toBeLessThan(750)
  })

  it('keeps repeated refresh normalization bounded and detached', () => {
    const fixture = largeFixture()
    const started = performance.now()
    const snapshots = Array.from({ length: 100 }, () => normalizeSnapshot(fixture))
    const elapsed = performance.now() - started

    expect(snapshots[0]).not.toBe(snapshots[1])
    expect(Object.isFrozen(snapshots[0])).toBe(true)
    expect(elapsed).toBeLessThan(5_000)
  })

  it('records p95 and p99 normalization samples for the release fixture', () => {
    const fixture = largeFixture()
    const samples = Array.from({ length: 20 }, () => {
      const started = performance.now()
      normalizeSnapshot(fixture)
      return performance.now() - started
    }).sort((left, right) => left - right)
    const p95 = samples[Math.ceil(samples.length * 0.95) - 1] ?? Number.POSITIVE_INFINITY
    const p99 = samples[Math.ceil(samples.length * 0.99) - 1] ?? Number.POSITIVE_INFINITY

    expect(p95).toBeLessThan(250)
    expect(p99).toBeLessThan(750)
  })
})
