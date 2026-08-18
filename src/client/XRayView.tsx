import { useEffect, useMemo, useRef, useState } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {
  EffectEntity,
  PluginEntry,
  PromptEntity,
  RuntimeSnapshot,
  ServiceEntity,
  ToolEntity,
} from '../snapshot.ts'
import type { RuntimeXrayLocaleKey } from './locales.ts'
import { serializeRedactedSnapshot } from './export.ts'
import { filterRows, type QualityFilter, type StatusFilter } from './filter.ts'

type Scope = 'session' | 'host'
type Domain = 'overview' | 'plugins' | 'services' | 'tools' | 'prompt' | 'effects'

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
  readonly entity: PluginEntry | ServiceEntity | ToolEntity | PromptEntity | EffectEntity
}

const DOMAINS: readonly Domain[] = ['overview', 'plugins', 'services', 'tools', 'prompt', 'effects']

/** Read-only X-Ray view over one detached Host/session snapshot. */
export function XRayView({ clientGeneration, loadSnapshot, sessionId, useSession, t }: XRayViewProps) {
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
  const openState = useSession(snapshot => snapshot.openState)
  const running = useSession(snapshot => snapshot.running)

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

  const snapshot = state.snapshot
  const rows = useMemo(() => displayRows(snapshot, scope, domain), [domain, scope, snapshot])
  const allRows = useMemo(() => DOMAINS.flatMap(item => displayRows(snapshot, scope, item)), [scope, snapshot])
  const filtered = useMemo(() => filterRows(rows, query, statusFilter, qualityFilter), [query, qualityFilter, rows, statusFilter])
  const selected = filtered.find(row => row.id === selectedId) ?? rows.find(row => row.id === selectedId) ?? allRows.find(row => row.id === selectedId)
  const selectedParentId: string | undefined = selected !== undefined && 'parentId' in selected.entity && typeof selected.entity.parentId === 'string' ? selected.entity.parentId : undefined
  const pluginItems = snapshot?.host.plugins.items ?? []
  const active = pluginItems.filter(entry => entry.enabled && entry.phase === 'active').length

  return (
    <div data-dsh-runtime-xray="">
      <div className="xray-toolbar" role="toolbar" aria-label={t('title')}>
        <div className="xray-segment" role="group" aria-label={t('scope')}>
          <button type="button" aria-pressed={scope === 'session'} onClick={() => setScope('session')}>{t('currentSession')}</button>
          <button type="button" aria-pressed={scope === 'host'} onClick={() => setScope('host')}>{t('host')}</button>
        </div>
        <button type="button" onClick={refresh} disabled={state.status === 'loading'}>{t('refresh')}</button>
        <button type="button" onClick={() => setExportOpen(true)} disabled={snapshot === undefined}>{t('export')}</button>
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
      </div>
      {exportOpen && snapshot !== undefined ? (
        <div className="xray-export-preview" role="dialog" aria-label={t('exportPreview')}>
          <strong>{t('exportPreview')}</strong>
          <p>{t('exportDescription')}</p>
          <button type="button" onClick={() => {
            const ok = downloadSnapshot(snapshot)
            if (ok) { setExportError(undefined); setExportOpen(false) }
            else setExportError(t('exportTooLarge'))
          }}>{t('download')}</button>
          <button type="button" onClick={() => setExportOpen(false)}>{t('cancel')}</button>
          {exportError !== undefined ? <p role="alert">{exportError}</p> : null}
        </div>
      ) : null}
      <div className="xray-domain-tabs" role="tablist" aria-label={t('domain')}>
        {DOMAINS.map(item => (
          <button key={item} type="button" role="tab" aria-selected={domain === item} onClick={() => { setDomain(item); setSelectedId(null) }}>
            {t(item)}
          </button>
        ))}
      </div>
      <div className="xray-body">
        <div className="xray-content">
          <div className="xray-heading">
            <h2>{t('title')}</h2>
            <span className="xray-meta">{scope === 'session' ? sessionId : t('host')}</span>
          </div>
          <div className="xray-summary" aria-label={t('title')}>
            <div className="xray-card"><strong>{snapshot === undefined ? '—' : pluginItems.length}</strong><span>{t('total')}</span></div>
            <div className="xray-card"><strong>{snapshot === undefined ? '—' : active}</strong><span>{t('active')}</span></div>
            <div className="xray-card"><strong>{running ? t('active') : openState}</strong><span>{t('sessionState')}</span></div>
            <div className="xray-card"><strong>{snapshot === undefined ? '—' : statusLabel(snapshot.health, t)}</strong><span>{t('health')}</span></div>
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
          {snapshot !== undefined && domain !== 'overview' && filtered.length === 0 ? <div className="xray-status">{t('noResults')}</div> : null}
          {snapshot !== undefined && domain !== 'overview' && filtered.length > 0 ? (
            <ul className="xray-list" aria-label={t(domain)}>
              {filtered.map(row => (
                <li key={row.id}>
                  <button className="xray-entry" type="button" aria-pressed={selectedId === row.id} onClick={() => setSelectedId(row.id)}>
                    <span className="xray-dot" data-active={row.status === 'active' || row.status === 'available' || undefined} aria-hidden="true" />
                    <span className="xray-entry-name">{row.label}</span>
                    <span className="xray-entry-module">{row.secondary}</span>
                    <span className="xray-entry-status">{statusLabel(row.status, t)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {snapshot !== undefined && domain === 'overview' ? (
            <div className="xray-overview" aria-label={t('overview')}>
              <div className="xray-domain-card"><strong>{t('snapshotTime')}</strong><time dateTime={new Date(snapshot.capture.completedAt).toISOString()}>{new Date(snapshot.capture.completedAt).toLocaleString()}</time></div>
              <div className="xray-domain-card"><strong>{t('schemaVersion')}</strong><span>{snapshot.schemaVersion}</span></div>
              {Object.entries(snapshot.host).map(([name, value]) => (
                <div className="xray-domain-card" key={name}><strong>{t(name as Domain)}</strong><span>{statusLabel(value.status, t)} · {value.items.length}</span></div>
              ))}
              {scope === 'session' && (snapshot.session === undefined ? <div className="xray-status">{t('sessionUnavailable')}</div> : <div className="xray-domain-card"><strong>{t('currentSession')}</strong><span>{statusLabel(snapshot.session.status, t)} · {snapshot.session.tools.items.length} {t('tools')} · {snapshot.session.promptToolCount ?? 0} {t('promptSchemas')}</span></div>)}
              {snapshot.session?.preset !== undefined ? <div className="xray-domain-card"><strong>{t('preset')}</strong><span>{snapshot.session.preset}</span></div> : null}
              {snapshot.session?.modelProvider !== undefined || snapshot.session?.model !== undefined ? <div className="xray-domain-card"><strong>{t('model')}</strong><span>{[snapshot.session.modelProvider, snapshot.session.model].filter(Boolean).join(' / ')}</span></div> : null}
              <div className="xray-domain-card"><strong>{t('clientGeneration')}</strong><span>{clientGeneration}</span></div>
            </div>
          ) : null}
          {snapshot !== undefined && snapshot.diagnostics.length > 0 ? <div className="xray-diagnostics" role="status">{snapshot.diagnostics.map(item => <span key={`${item.code}:${item.message}`}>{item.code}: {item.message}</span>)}</div> : null}
        </div>
        {selected !== undefined ? (
          <aside className="xray-details" aria-label={t('details')}>
            <h3>{selected.label}</h3>
            <p>{selected.secondary}</p>
            <pre>{JSON.stringify(selected.entity, null, 2)}</pre>
            {snapshot !== undefined && snapshot.relationships.filter(link => link.fromId === selected.id || link.toId === selected.id).map(link => (
              <button key={link.relationshipId} type="button" onClick={() => setSelectedId(link.fromId === selected.id ? link.toId : link.fromId)}>
                {t('relationship')}: {link.kind} → {link.fromId === selected.id ? link.toId : link.fromId}
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
    running: 'running', idle: 'idle', cold: 'cold', unavailable: 'unavailable', unknown: 'unknown', missing: 'missing',
  }
  const localized = key[value]
  return localized === undefined ? value : t(localized)
}

function displayRows(snapshot: RuntimeSnapshot | undefined, scope: Scope, domain: Domain): readonly DisplayRow[] {
  if (snapshot === undefined || domain === 'overview') return []
  let source: { readonly items: readonly unknown[] } | undefined
  if (scope === 'host') {
    if (domain !== 'plugins' && domain !== 'services' && domain !== 'effects') return []
    source = snapshot.host[domain]
  } else {
    if (domain !== 'services' && domain !== 'tools' && domain !== 'prompt') return []
    source = snapshot.session?.[domain]
  }
  if (source === undefined) return []
  return source.items.map((entity, index) => {
    if (domain === 'plugins') {
      const item = entity as PluginEntry
      const missing = item.missingServices?.length === undefined || item.missingServices.length === 0 ? '' : ` · ${item.missingServices.length} missing`
      return { id: item.entryId, label: item.entryId, secondary: `${item.moduleName}${missing}`, status: item.phase ?? 'unobserved', entity: item }
    }
    if (domain === 'services') {
      const item = entity as ServiceEntity
      return { id: item.name, label: item.name, secondary: item.attribution?.sourceId ?? '', status: item.status, entity: item }
    }
    if (domain === 'effects') {
      const item = entity as EffectEntity
      return { id: item.effectId, label: item.label, secondary: item.parentId ?? '', status: `depth ${item.depth}`, entity: item }
    }
    const item = entity as ToolEntity | PromptEntity
    return { id: `${domain}:${item.name}:${index}`, label: item.name, secondary: 'schemaBytes' in item ? `${item.schemaBytes} B` : `${item.bytes} B`, status: 'ready', entity: item }
  })
}

function snapshotHasEntity(snapshot: RuntimeSnapshot, id: string): boolean {
  return snapshot.host.plugins.items.some(item => item.entryId === id)
    || snapshot.host.services.items.some(item => item.name === id)
    || snapshot.host.effects.items.some(item => item.effectId === id)
    || snapshot.session?.services.items.some(item => item.name === id) === true
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
