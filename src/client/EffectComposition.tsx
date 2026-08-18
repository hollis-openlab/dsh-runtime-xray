import type { EffectEntity } from '../snapshot.ts'
import type { RuntimeXrayLocaleKey } from './locales.ts'
import { presentService } from './ServicePresentation.ts'

interface EffectCompositionRow {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly entity: EffectEntity
}

interface EffectCompositionProps {
  readonly rows: readonly EffectCompositionRow[]
  readonly selectedId: string | null
  readonly sourceLabels?: ReadonlyMap<string, string>
  readonly t: (key: RuntimeXrayLocaleKey) => string
  readonly onSelect: (id: string) => void
}

type EffectKind = 'service' | 'plugin' | 'timer' | 'listener' | 'other'

interface EffectGroup {
  readonly id: EffectKind
  readonly label: string
  readonly rows: readonly EffectCompositionRow[]
  readonly sourceCount: number
  readonly maxDepth: number
}

interface EffectSourceAggregate {
  readonly id: string
  readonly label: string
  readonly count: number
  readonly firstRow: EffectCompositionRow
  readonly minDepth: number
  readonly maxDepth: number
}

const EFFECT_ORDER: readonly EffectKind[] = ['service', 'plugin', 'timer', 'listener', 'other']

/** Group Cordis lifecycle effects into readable, expandable resource categories. */
export function EffectComposition({ onSelect, rows, selectedId, sourceLabels, t }: EffectCompositionProps) {
  const groups = buildEffectGroups(rows, t)
  const sources = new Set(rows.map(row => row.entity.attribution?.sourceId).filter((source): source is string => source !== undefined))
  const maxDepth = rows.reduce((depth, row) => Math.max(depth, row.entity.depth), 0)
  return (
    <section className="xray-effect-composition" aria-label={t('effects')}>
      <div className="xray-effect-stats">
        <article><span>{t('effects')}</span><strong>{rows.length}</strong><small>{t('effectCount')}</small></article>
        <article><span>{t('effectSources')}</span><strong>{sources.size}</strong><small>{t('effectSourceCount')}</small></article>
        <article><span>{t('depth')}</span><strong>{maxDepth}</strong><small>{t('effectMaxDepth')}</small></article>
      </div>
      <div className="xray-effect-groups">
        {groups.map(group => (
          <details className="xray-effect-group" data-kind={group.id} key={group.id}>
            <summary>
              <span className="xray-effect-group-mark" aria-hidden="true" />
              <strong>{group.label}</strong>
              <span>{group.rows.length} {t('effectCount')}</span>
              <small>{group.sourceCount} {t('effectSourceCount')}</small>
            </summary>
            <ul>
              {group.id === 'plugin' ? aggregateEffectSources(group.rows, sourceLabels, t).map(aggregate => (
                <li key={aggregate.id}>
                  <button type="button" aria-pressed={selectedId === aggregate.firstRow.id} title={aggregate.firstRow.description} onClick={() => onSelect(aggregate.firstRow.id)}>
                    <span>{aggregate.count} {t('effectCount')}</span>
                    <strong>{aggregate.label}</strong>
                    <small>{t('depth')} {aggregate.minDepth}–{aggregate.maxDepth}</small>
                  </button>
                </li>
              )) : group.rows.map(row => (
                <li key={row.id}>
                  <button type="button" aria-pressed={selectedId === row.id} title={row.description} onClick={() => onSelect(row.id)}>
                    <span>{t('depth')} {row.entity.depth}</span>
                    <strong>{row.label}</strong>
                    <small>{row.entity.attribution?.sourceId ?? row.entity.parentId ?? ''}</small>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  )
}

function aggregateEffectSources(rows: readonly EffectCompositionRow[], sourceLabels: ReadonlyMap<string, string> | undefined, t: EffectCompositionProps['t']): readonly EffectSourceAggregate[] {
  const grouped = new Map<string, EffectCompositionRow[]>()
  for (const row of rows) {
    const sourceId = row.entity.attribution?.sourceId ?? 'unknown'
    const group = grouped.get(sourceId) ?? []
    group.push(row)
    grouped.set(sourceId, group)
  }
  return [...grouped.entries()].map(([id, sourceRows]) => ({
    id,
    label: id === 'unknown' ? t('effectUnknownSource') : sourceLabels?.get(id) ?? id,
    count: sourceRows.length,
    firstRow: sourceRows[0]!,
    minDepth: sourceRows.reduce((depth, row) => Math.min(depth, row.entity.depth), Number.POSITIVE_INFINITY),
    maxDepth: sourceRows.reduce((depth, row) => Math.max(depth, row.entity.depth), 0),
  })).sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
}

/** Classify raw Fiber effect labels without claiming relationships the snapshot does not expose. */
export function buildEffectGroups(rows: readonly EffectCompositionRow[], t: EffectCompositionProps['t']): readonly EffectGroup[] {
  const grouped = new Map<EffectKind, EffectCompositionRow[]>()
  for (const row of rows) {
    const kind = classifyEffect(row.entity.label)
    const group = grouped.get(kind) ?? []
    group.push(row)
    grouped.set(kind, group)
  }
  return EFFECT_ORDER.filter(kind => grouped.has(kind)).map(kind => {
    const groupRows = grouped.get(kind) ?? []
    return {
      id: kind,
      label: effectGroupLabel(kind, t),
      rows: groupRows,
      sourceCount: new Set(groupRows.map(row => row.entity.attribution?.sourceId).filter((source): source is string => source !== undefined)).size,
      maxDepth: groupRows.reduce((depth, row) => Math.max(depth, row.entity.depth), 0),
    }
  })
}

/** Convert one raw effect label into the user-facing label and description. */
export function presentEffect(label: string, t: EffectCompositionProps['t']): { label: string; description: string } {
  const serviceName = /^ctx\.provide\("(.+)"\)$/.exec(label)?.[1]
  if (serviceName !== undefined) {
    const service = presentService(serviceName, t)
    return { label: `${t('effectServicePrefix')}：${service.label}`, description: service.description }
  }
  if (label === 'ctx.plugin()') return { label: t('effectPluginLabel'), description: t('effectPluginDescription') }
  if (label === 'ctx.debounce()') return { label: t('effectDebounceLabel'), description: t('effectDebounceDescription') }
  if (label === 'ctx.throttle()') return { label: t('effectThrottleLabel'), description: t('effectThrottleDescription') }
  if (/^ctx\.(on|once|emit)\(/.test(label)) return { label: t('effectListenerLabel'), description: t('effectListenerDescription') }
  return { label, description: t('effectOtherDescription') }
}

function classifyEffect(label: string): EffectKind {
  if (label.startsWith('ctx.provide(')) return 'service'
  if (label === 'ctx.plugin()') return 'plugin'
  if (label === 'ctx.debounce()' || label === 'ctx.throttle()') return 'timer'
  if (/^ctx\.(on|once|emit)\(/.test(label)) return 'listener'
  return 'other'
}

function effectGroupLabel(kind: EffectKind, t: EffectCompositionProps['t']): string {
  const keys: Record<EffectKind, RuntimeXrayLocaleKey> = {
    service: 'effectServiceGroup',
    plugin: 'effectPluginGroup',
    timer: 'effectTimerGroup',
    listener: 'effectListenerGroup',
    other: 'effectOtherGroup',
  }
  return t(keys[kind])
}
