import type { PromptEntity } from '../snapshot.ts'
import type { RuntimeXrayLocaleKey } from './locales.ts'

interface PromptCompositionRow {
  readonly id: string
  readonly entity: PromptEntity
}

interface PromptCompositionProps {
  readonly rows: readonly PromptCompositionRow[]
  readonly selectedId: string | null
  readonly t: (key: RuntimeXrayLocaleKey) => string
  readonly onSelect: (id: string) => void
}

type PromptKind = 'section' | 'context' | 'variable'

interface PromptGroup {
  readonly id: string
  readonly kind: PromptKind
  readonly label: string
  readonly bytes: number
  readonly rows: readonly (PromptCompositionRow & { readonly label: string })[]
}

const GROUP_ORDER = ['section:harness', 'section:tool', 'section:app', 'section:deployment', 'section:plan', 'section:ui', 'section:other', 'context', 'variable'] as const

/** Group model-context metadata by semantic source instead of raw name prefix. */
export function PromptComposition({ onSelect, rows, selectedId, t }: PromptCompositionProps) {
  const groups = buildPromptGroups(rows, t)
  const sections = rows.filter(row => row.entity.name.startsWith('section:'))
  const contexts = rows.filter(row => row.entity.name.startsWith('context:'))
  const variables = rows.filter(row => row.entity.name.startsWith('variable:'))
  const sectionBytes = totalBytes(sections)
  const contextBytes = totalBytes(contexts)
  const byteTotal = sectionBytes + contextBytes

  return (
    <section className="xray-prompt-composition" aria-label={t('prompt')}>
      <div className="xray-context-stats">
        <article data-kind="section"><span>{t('promptSections')}</span><strong>{sections.length}</strong><small>{formatBytes(sectionBytes)}</small></article>
        <article data-kind="context"><span>{t('runtimeContexts')}</span><strong>{contexts.length}</strong><small>{formatBytes(contextBytes)}</small></article>
        <article data-kind="variable"><span>{t('variables')}</span><strong>{variables.length}</strong><small>{t('declared')}</small></article>
      </div>
      {byteTotal > 0 ? (
        <div className="xray-context-meter" aria-label={t('byteDistribution')} role="img">
          {sectionBytes > 0 ? <span data-kind="section" style={{ width: `${sectionBytes / byteTotal * 100}%` }} title={`${t('promptSections')} · ${formatBytes(sectionBytes)}`} /> : null}
          {contextBytes > 0 ? <span data-kind="context" style={{ width: `${contextBytes / byteTotal * 100}%` }} title={`${t('runtimeContexts')} · ${formatBytes(contextBytes)}`} /> : null}
        </div>
      ) : null}
      <div className="xray-context-groups">
        {groups.map(group => (
          <details className="xray-context-group" data-kind={group.kind} key={group.id}>
            <summary>
              <span className="xray-context-group-mark" aria-hidden="true" />
              <strong>{group.label}</strong>
              <span>{group.rows.length} {t('items')}</span>
              <small>{group.kind === 'variable' ? t('declared') : formatBytes(group.bytes)}</small>
            </summary>
            <ul>
              {group.rows.map(row => (
                <li key={row.id}>
                  <button type="button" aria-pressed={selectedId === row.id} onClick={() => onSelect(row.id)}>
                    <span className="xray-context-position">#{String(row.entity.position + 1).padStart(2, '0')}</span>
                    <strong>{row.label}</strong>
                    <span>{group.kind === 'variable' ? t('declared') : formatBytes(row.entity.bytes)}</span>
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

/** Build deterministic source groups for the filtered prompt inventory. */
export function buildPromptGroups(rows: readonly PromptCompositionRow[], t: PromptCompositionProps['t']): readonly PromptGroup[] {
  const grouped = new Map<string, { kind: PromptKind; rows: Array<PromptCompositionRow & { label: string }> }>()
  for (const row of rows) {
    const parsed = parsePromptName(row.entity.name)
    const group = grouped.get(parsed.groupId) ?? { kind: parsed.kind, rows: [] }
    group.rows.push({ ...row, label: parsed.label })
    grouped.set(parsed.groupId, group)
  }
  return [...grouped.entries()]
    .map(([id, group]) => ({
      id,
      kind: group.kind,
      label: groupLabel(id, t),
      bytes: totalBytes(group.rows),
      rows: group.rows.sort((left, right) => left.entity.position - right.entity.position),
    }))
    .sort((left, right) => groupRank(left.id) - groupRank(right.id) || left.label.localeCompare(right.label))
}

function parsePromptName(name: string): { readonly groupId: string; readonly kind: PromptKind; readonly label: string } {
  const parts = name.split(':')
  if (parts[0] === 'section') {
    const namespace = parts[1] ?? 'other'
    const known = GROUP_ORDER.includes(`section:${namespace}` as typeof GROUP_ORDER[number]) ? namespace : 'other'
    return { groupId: `section:${known}`, kind: 'section', label: parts.slice(2).join(' / ') || namespace }
  }
  if (parts[0] === 'context') return { groupId: 'context', kind: 'context', label: parts.slice(1).join(' / ') }
  if (parts[0] === 'variable') return { groupId: 'variable', kind: 'variable', label: parts.slice(1).join(' / ') }
  return { groupId: 'section:other', kind: 'section', label: name }
}

function groupLabel(id: string, t: PromptCompositionProps['t']): string {
  const keys: Record<string, RuntimeXrayLocaleKey> = {
    'section:harness': 'harnessGroup',
    'section:tool': 'toolGroup',
    'section:app': 'appGroup',
    'section:deployment': 'deploymentGroup',
    'section:plan': 'planGroup',
    'section:ui': 'uiGroup',
    'section:other': 'otherGroup',
    context: 'runtimeContexts',
    variable: 'variables',
  }
  return t(keys[id] ?? 'otherGroup')
}

function groupRank(id: string): number {
  const rank = GROUP_ORDER.indexOf(id as typeof GROUP_ORDER[number])
  return rank < 0 ? GROUP_ORDER.length : rank
}

function totalBytes(rows: readonly { readonly entity: PromptEntity }[]): number {
  return rows.reduce((total, row) => total + row.entity.bytes, 0)
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KiB`
}
