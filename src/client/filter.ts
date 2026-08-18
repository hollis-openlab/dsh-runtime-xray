/** Pure client-side search and filter projection over detached rows. */

export type StatusFilter = 'all' | 'active' | 'failed' | 'available' | 'partial' | 'ready' | 'enabled' | 'disabled'
export type QualityFilter = 'all' | 'exact' | 'inferred' | 'unavailable'

export interface SearchRow {
  readonly id: string
  readonly label: string
  readonly secondary: string
  readonly status: string
  readonly entity: object
}

/** Filter without recollecting or mutating the detached snapshot. */
export function filterRows<T extends SearchRow>(rows: readonly T[], query: string, statusFilter: StatusFilter, qualityFilter: QualityFilter): readonly T[] {
  const needle = query.trim().toLowerCase()
  return rows.filter(row => {
    const textMatch = needle === '' || `${row.id} ${row.label} ${row.secondary} ${row.status} ${JSON.stringify(row.entity)}`.toLowerCase().includes(needle)
    const entity = row.entity as Record<string, unknown>
    const statusMatch = statusFilter === 'all'
      || row.status === statusFilter
      || (statusFilter === 'enabled' && entity.enabled === true)
      || (statusFilter === 'disabled' && entity.enabled === false)
    const quality = typeof entity.attribution === 'object' && entity.attribution !== null && 'quality' in entity.attribution
      ? String((entity.attribution as { quality?: unknown }).quality)
      : 'unavailable'
    const qualityMatch = qualityFilter === 'all' || quality === qualityFilter
    return textMatch && statusMatch && qualityMatch
  })
}
