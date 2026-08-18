import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {
  EffectEntity,
  PluginEntry,
  PromptEntity,
  RuntimeSnapshot,
  ServiceEntity,
  SkillEntity,
  ToolEntity,
} from '../snapshot.ts'
import type { RuntimeXrayLocaleKey } from './locales.ts'
import { serializeRedactedSnapshot } from './export.ts'
import { filterRows, type QualityFilter, type StatusFilter } from './filter.ts'
import { RequestContextTree, RuntimeMap } from './RuntimeVisuals.tsx'
import { PromptComposition } from './PromptComposition.tsx'
import { presentService } from './ServicePresentation.ts'
import { EffectComposition, presentEffect } from './EffectComposition.tsx'

type Scope = 'session' | 'host'
type Domain = 'overview' | 'plugins' | 'services' | 'skills' | 'tools' | 'prompt' | 'effects'

interface DomainLayer {
  readonly id: string
  readonly label: string
  readonly domains: readonly Domain[]
}

interface XRayViewProps extends ConvViewProps {
  readonly loadSnapshot: (sessionId?: string, signal?: AbortSignal) => Promise<RuntimeSnapshot>
  readonly t: (key: RuntimeXrayLocaleKey) => string
  readonly clientGeneration: string
}

type ReadState =
  | { readonly status: 'loading'; readonly snapshot?: RuntimeSnapshot }
  | { readonly status: 'ready'; readonly snapshot: RuntimeSnapshot }
  | { readonly status: 'error'; readonly message: string; readonly snapshot?: RuntimeSnapshot }

interface DisplayRow {
  readonly id: string
  readonly label: string
  readonly secondary: string
  readonly status: string
  readonly description?: string
  readonly depth?: number
  readonly entity: PluginEntry | ServiceEntity | SkillEntity | ToolEntity | PromptEntity | EffectEntity
}

const SESSION_DOMAINS: readonly Domain[] = ['overview', 'services', 'skills', 'tools', 'prompt']
const HOST_DOMAINS: readonly Domain[] = ['overview', 'plugins', 'services', 'effects']

/** Read-only X-Ray view over one detached Host/session snapshot. */
export function XRayView({ clientGeneration, loadSnapshot, sessionId, t }: XRayViewProps) {
  const [state, setState] = useState<ReadState>({ status: 'loading' })
  const [scope, setScope] = useState<Scope>('session')
  const [domain, setDomain] = useState<Domain>('overview')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all')
  const [exportOpen, setExportOpen] = useState(false)
  const [exportError, setExportError] = useState<string | undefined>(undefined)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const requestGeneration = useRef(0)
  const activeRequest = useRef<AbortController | undefined>(undefined)
  const availableDomains = scope === 'session' ? SESSION_DOMAINS : HOST_DOMAINS
  const localeGeneration = t('tab')
  const domainLayers: readonly DomainLayer[] = scope === 'session' ? [
    { id: 'runtime', label: t('runtimeLayer'), domains: ['services'] },
    { id: 'capability', label: t('capabilityLayer'), domains: ['skills', 'tools'] },
    { id: 'model', label: t('modelLayer'), domains: ['prompt'] },
  ] : [
    { id: 'runtime', label: t('runtimeLayer'), domains: ['plugins', 'services', 'effects'] },
  ]

  const changeScope = (nextScope: Scope): void => {
    setScope(nextScope)
    setDomain('overview')
    setQuery('')
    setStatusFilter('all')
    setQualityFilter('all')
    setSelectedId(null)
  }

  const refresh = (): void => {
    const generation = requestGeneration.current + 1
    requestGeneration.current = generation
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setState(previous => ({
      status: 'loading',
      ...(previous.snapshot === undefined ? {} : { snapshot: previous.snapshot }),
    }))
    void loadSnapshot(scope === 'session' ? sessionId : undefined, controller.signal).then(
      snapshot => {
        if (requestGeneration.current === generation) {
          setState({ status: 'ready', snapshot })
          setSelectedId(previous => previous !== null && snapshotHasEntity(snapshot, previous) ? previous : null)
        }
      },
      error => {
        if (requestGeneration.current === generation) {
          setState(previous => ({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
            ...(previous.snapshot === undefined ? {} : { snapshot: previous.snapshot }),
          }))
        }
      },
    )
  }

  useEffect(() => {
    refresh()
    return () => {
      requestGeneration.current += 1
      activeRequest.current?.abort()
    }
  }, [loadSnapshot, scope, sessionId])

  useEffect(() => {
    if (!availableDomains.includes(domain)) setDomain('overview')
  }, [availableDomains, domain])

  const snapshot = state.snapshot
  const rows = useMemo(() => displayRows(snapshot, scope, domain, t), [domain, localeGeneration, scope, snapshot, t])
  const allRows = useMemo(() => availableDomains.flatMap(item => displayRows(snapshot, scope, item, t)), [availableDomains, localeGeneration, scope, snapshot, t])
  const filtered = useMemo(() => filterRows(rows, query, statusFilter, qualityFilter), [query, qualityFilter, rows, statusFilter])
  const selected = filtered.find(row => row.id === selectedId) ?? rows.find(row => row.id === selectedId) ?? allRows.find(row => row.id === selectedId)
  const selectedParentId: string | undefined = selected !== undefined && 'parentId' in selected.entity && typeof selected.entity.parentId === 'string' ? selected.entity.parentId : undefined
  const visibleDiagnostics = snapshot?.diagnostics.filter(item => item.severity !== 'info') ?? []
  const hasActiveFilters = query.trim() !== '' || statusFilter !== 'all' || qualityFilter !== 'all'
  const effectSourceLabels = useMemo(() => {
    const counts = new Map<string, number>()
    const names = new Map<string, string>()
    for (const plugin of snapshot?.host.plugins.items ?? []) {
      const id = plugin.entryId
      counts.set(id, (counts.get(id) ?? 0) + 1)
      names.set(id, plugin.moduleName)
    }
    return new Map([...names.entries()].filter(([id]) => counts.get(id) === 1))
  }, [snapshot])

  return (
    <div data-dsh-runtime-xray="">
      <div className="xray-topbar">
        <div className="xray-scope-block">
          <span className="xray-scope-label">{t('scope')}</span>
          <div className="xray-segment" role="group" aria-label={t('scope')}>
            <button type="button" aria-pressed={scope === 'session'} onClick={() => changeScope('session')}>{t('currentSession')}</button>
            <button type="button" aria-pressed={scope === 'host'} onClick={() => changeScope('host')}>{t('host')}</button>
          </div>
        </div>
        <div className="xray-actions" role="group" aria-label={t('actions')}>
          <button className="xray-action" type="button" onClick={refresh} disabled={state.status === 'loading'}>{t('refresh')}</button>
          <button className="xray-action xray-action-primary" type="button" onClick={() => setExportOpen(true)} disabled={snapshot === undefined}>{t('export')}</button>
        </div>
      </div>
      {domain !== 'overview' ? <div className="xray-filterbar" role="toolbar" aria-label={t('filters')}>
        <select aria-label={t('filter')} value={statusFilter} onChange={event => { setStatusFilter(event.currentTarget.value as StatusFilter) }}>
          <option value="all">{t('allStatuses')}</option>
          <option value="active">{t('active')}</option>
          <option value="available">{t('available')}</option>
          <option value="ready">{t('ready')}</option>
          <option value="failed">{t('failed')}</option>
          <option value="partial">{t('partial')}</option>
          <option value="enabled">{t('enabled')}</option>
          <option value="disabled">{t('disabled')}</option>
        </select>
        <select aria-label={t('qualityFilter')} value={qualityFilter} onChange={event => { setQualityFilter(event.currentTarget.value as QualityFilter) }}>
          <option value="all">{t('allQuality')}</option>
          <option value="exact">{t('exact')}</option>
          <option value="inferred">{t('inferred')}</option>
          <option value="unavailable">{t('unavailable')}</option>
        </select>
        <input
          className="xray-search"
          type="search"
          aria-label={t('search')}
          placeholder={t('search')}
          value={query}
          onChange={event => { setQuery(event.currentTarget.value) }}
        />
      </div> : null}
      {exportOpen && snapshot !== undefined ? (
        <div className="xray-export-preview" role="dialog" aria-label={t('exportPreview')}>
          <strong>{t('exportPreview')}</strong>
          <button type="button" onClick={() => {
            const ok = downloadSnapshot(snapshot)
            if (ok) { setExportError(undefined); setExportOpen(false) }
            else setExportError(t('exportTooLarge'))
          }}>{t('download')}</button>
          <button type="button" onClick={() => setExportOpen(false)}>{t('cancel')}</button>
          {exportError !== undefined ? <p role="alert">{exportError}</p> : null}
        </div>
      ) : null}
      <div className="xray-domain-tabs" role="navigation" aria-label={t('domain')}>
        <button className="xray-domain-overview" type="button" role="tab" aria-selected={domain === 'overview'} onClick={() => { setDomain('overview'); setSelectedId(null) }}>
          {t('overview')}
        </button>
        {domainLayers.map(layer => (
          <div className="xray-domain-layer" data-layer={layer.id} key={layer.id}>
            <span className="xray-domain-layer-label">{layer.label}</span>
            <div className="xray-domain-layer-tabs">
              {layer.domains.filter(item => availableDomains.includes(item)).map(item => (
                <button key={item} type="button" role="tab" aria-selected={domain === item} onClick={() => { setDomain(item); setSelectedId(null) }}>
                  {t(item)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="xray-body">
        <div className="xray-content">
          <div className="xray-heading">
            <div className="xray-heading-copy">
              <h2>{t('title')}</h2>
            </div>
            <span className="xray-meta">{scope === 'session' ? sessionId : t('host')}</span>
          </div>
          {state.status === 'loading' ? <div className="xray-status" role="status">{t('loading')}</div> : null}
          {state.status === 'loading' && snapshot !== undefined ? <div className="xray-status" role="status">{t('refreshing')}</div> : null}
          {state.status === 'error' ? (
            <div className="xray-status" role="alert">
              <p>{t('error')}</p>
              <code>{state.message}</code>
              {snapshot !== undefined ? <strong>{t('stale')}</strong> : null}
              <button type="button" onClick={refresh}>{t('retry')}</button>
            </div>
          ) : null}
          {snapshot !== undefined && domain !== 'overview' && filtered.length === 0 ? <div className="xray-status">{t(hasActiveFilters ? 'noResults' : 'emptyDomain')}</div> : null}
          {snapshot !== undefined && domain === 'prompt' && filtered.length > 0 ? (
            <PromptComposition
              rows={filtered.map(row => ({ id: row.id, entity: row.entity as PromptEntity }))}
              selectedId={selectedId}
              t={t}
              onSelect={setSelectedId}
            />
          ) : null}
          {snapshot !== undefined && domain === 'effects' && filtered.length > 0 ? (
            <EffectComposition
              rows={filtered.map(row => ({ id: row.id, label: row.label, description: row.description ?? '', entity: row.entity as EffectEntity }))}
              selectedId={selectedId}
              sourceLabels={effectSourceLabels}
              t={t}
              onSelect={setSelectedId}
            />
          ) : null}
          {snapshot !== undefined && domain !== 'overview' && domain !== 'prompt' && domain !== 'effects' && filtered.length > 0 ? (
            <ul className="xray-list" aria-label={t(domain)}>
              {filtered.map(row => (
                <li key={row.id}>
                  <button
                    className="xray-entry"
                    data-status={row.status}
                    data-tree={row.depth === undefined ? undefined : true}
                    style={row.depth === undefined ? undefined : { '--xray-tree-depth': Math.min(row.depth, 10) } as CSSProperties}
                    type="button"
                    title={row.description}
                    aria-pressed={selectedId === row.id}
                    onClick={() => setSelectedId(row.id)}
                  >
                    {row.depth === undefined || row.depth === 0 ? null : <span className="xray-tree-branch" aria-hidden="true">↳</span>}
                    <span className="xray-dot" data-status={row.status} aria-hidden="true" />
                    <span className="xray-entry-name">{row.label}</span>
                    <span className="xray-entry-module">{row.secondary}</span>
                    <span className="xray-entry-status" data-status={row.status}>{statusLabel(row.status, t)}</span>
                    {row.description === undefined ? null : <span className="xray-entry-tooltip" role="tooltip">{row.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {snapshot !== undefined && domain === 'overview' ? (
            <div className="xray-overview" aria-label={t('overview')}>
              <RuntimeMap
                snapshot={snapshot}
                scope={scope}
                t={t}
                onOpenDomain={nextDomain => { setDomain(nextDomain); setSelectedId(null) }}
                onSelectEntity={setSelectedId}
              />
              {scope === 'session' ? <RequestContextTree snapshot={snapshot} t={t} /> : null}
              <details className="xray-snapshot-meta">
                <summary>{t('snapshotDetails')}</summary>
                <dl>
                  <div><dt>{t('snapshotTime')}</dt><dd><time dateTime={new Date(snapshot.capture.completedAt).toISOString()}>{new Date(snapshot.capture.completedAt).toLocaleString()}</time></dd></div>
                  <div><dt>{t('schemaVersion')}</dt><dd>{snapshot.schemaVersion}</dd></div>
                  <div><dt>{t('clientGeneration')}</dt><dd>{clientGeneration}</dd></div>
                </dl>
              </details>
            </div>
          ) : null}
          {visibleDiagnostics.length > 0 ? <div className="xray-diagnostics" role="status">{visibleDiagnostics.map(item => <span key={`${item.code}:${item.message}`}>{item.code}: {item.message}</span>)}</div> : null}
        </div>
        {selected !== undefined ? (
          <aside className="xray-details" aria-label={t('details')}>
            <h3>{selected.label}</h3>
            <p>{selected.secondary}</p>
            <pre>{JSON.stringify(selected.entity, null, 2)}</pre>
            {snapshot !== undefined && snapshot.relationships.filter(link => link.fromId === selected.id || link.toId === selected.id).map(link => (
              <button key={link.relationshipId} type="button" onClick={() => setSelectedId(link.fromId === selected.id ? link.toId : link.fromId)}>
                {t('relationship')}: {relationshipLabel(link.kind, t)} → {link.fromId === selected.id ? link.toId : link.fromId}
              </button>
            ))}
            {selectedParentId !== undefined ? <button type="button" onClick={() => setSelectedId(selectedParentId)}>{t('parent')}</button> : null}
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function statusLabel(value: string, t: XRayViewProps['t']): string {
  if (value.startsWith('depth ')) return `${t('depth')} ${value.slice(6)}`
  const key: Partial<Record<string, RuntimeXrayLocaleKey>> = {
    healthy: 'healthy', partial: 'partial', failed: 'failed', ready: 'ready', unsupported: 'unsupported', truncated: 'truncated',
    active: 'active', available: 'available', pending: 'pending', loading: 'loadingPhase', unloading: 'unloading', unobserved: 'unobserved',
    running: 'running', idle: 'idle', cold: 'cold', unavailable: 'unavailable', unknown: 'unknown', missing: 'missing', open: 'open', closed: 'closed',
  }
  const localized = key[value]
  return localized === undefined ? value : t(localized)
}

function displayRows(snapshot: RuntimeSnapshot | undefined, scope: Scope, domain: Domain, t: XRayViewProps['t']): readonly DisplayRow[] {
  if (snapshot === undefined || domain === 'overview') return []
  let source: { readonly items: readonly unknown[] } | undefined
  if (scope === 'host') {
    if (domain !== 'plugins' && domain !== 'services' && domain !== 'effects') return []
    source = snapshot.host[domain]
  } else {
    if (domain !== 'services' && domain !== 'skills' && domain !== 'tools' && domain !== 'prompt') return []
    source = snapshot.session?.[domain]
  }
  if (source === undefined) return []
  return source.items.map((entity, index) => {
    if (domain === 'plugins') {
      const item = entity as PluginEntry
      const missing = item.missingServices?.length === undefined || item.missingServices.length === 0 ? '' : ` · ${item.missingServices.length} ${t('missingServices')}`
      return { id: item.entryId, label: item.entryId, secondary: `${item.moduleName}${missing}`, status: item.phase ?? 'unobserved', entity: item }
    }
    if (domain === 'services') {
      const item = entity as ServiceEntity
      const presentation = presentService(item.name, t)
      const secondary = [item.name, item.attribution?.sourceId].filter(Boolean).join(' · ')
      return { id: item.name, label: presentation.label, secondary, description: presentation.description, status: item.status, entity: item }
    }
    if (domain === 'effects') {
      const item = entity as EffectEntity
      const presentation = presentEffect(item.label, t)
      const secondary = [item.attribution?.sourceId, item.parentId].filter(Boolean).join(' · ')
      return { id: item.effectId, label: presentation.label, secondary, description: presentation.description, status: 'ready', depth: item.depth, entity: item }
    }
    if (domain === 'skills') {
      const item = entity as SkillEntity
      return { id: `skills:${item.name}:${index}`, label: item.name, secondary: `${item.provider} · ${item.source}`, status: 'ready', entity: item }
    }
    const item = entity as ToolEntity | PromptEntity
    return { id: `${domain}:${item.name}:${index}`, label: item.name, secondary: 'schemaBytes' in item ? `${item.schemaBytes} B` : `${item.bytes} B`, status: 'ready', entity: item }
  })
}

function relationshipLabel(kind: RuntimeSnapshot['relationships'][number]['kind'], t: XRayViewProps['t']): string {
  return t(kind === 'provides' ? 'provides' : kind === 'owns' ? 'owns' : 'parentRelation')
}

function snapshotHasEntity(snapshot: RuntimeSnapshot, id: string): boolean {
  return snapshot.host.plugins.items.some(item => item.entryId === id)
    || snapshot.host.services.items.some(item => item.name === id)
    || snapshot.host.effects.items.some(item => item.effectId === id)
    || snapshot.session?.services.items.some(item => item.name === id) === true
    || snapshot.session?.skills?.items.some((item, index) => `skills:${item.name}:${index}` === id) === true
    || snapshot.session?.tools.items.some((item, index) => `${'tools'}:${item.name}:${index}` === id) === true
    || snapshot.session?.prompt.items.some((item, index) => `${'prompt'}:${item.name}:${index}` === id) === true
}

/** Export the already-redacted detached snapshot without recollection. */
function downloadSnapshot(snapshot: RuntimeSnapshot): boolean {
  const serialized = serializeRedactedSnapshot(snapshot)
  if (!serialized.ok) return false
  const text = serialized.text
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `dsh-runtime-xray-${snapshot.schemaVersion}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return true
}
