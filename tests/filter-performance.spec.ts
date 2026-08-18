import { describe, expect, it } from 'vitest'
import { filterRows, type SearchRow } from '../src/client/filter.ts'

const rows: readonly SearchRow[] = Array.from({ length: 2_000 }, (_, index) => ({
  id: `entity-${index}`,
  label: `tool-${index}`,
  secondary: '@fixture/runtime',
  status: index % 3 === 0 ? 'active' : 'ready',
  entity: { name: `tool-${index}`, attribution: { quality: index % 2 === 0 ? 'exact' : 'unavailable' } },
}))

describe('client search performance', () => {
  it('keeps visible search/filter p95 below 50 ms on the large fixture', () => {
    const samples = Array.from({ length: 20 }, (_, index) => {
      const started = performance.now()
      const filtered = filterRows(rows, index % 2 === 0 ? 'tool-19' : '', 'all', index % 3 === 0 ? 'exact' : 'all')
      expect(filtered.length).toBeGreaterThan(0)
      return performance.now() - started
    }).sort((left, right) => left - right)
    const p95 = samples[Math.ceil(samples.length * 0.95) - 1] ?? Number.POSITIVE_INFINITY
    expect(p95).toBeLessThan(50)
  })
})
