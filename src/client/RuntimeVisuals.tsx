import dagre from '@dagrejs/dagre'
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { memo, useMemo } from 'react'
import type { RuntimeSnapshot } from '../snapshot.ts'
import type { RuntimeXrayLocaleKey } from './locales.ts'

interface RuntimeVisualProps {
  readonly snapshot: RuntimeSnapshot
  readonly t: (key: RuntimeXrayLocaleKey) => string
}

type RuntimeMapScope = 'session' | 'host'
type RuntimeMapDomain = 'services' | 'skills' | 'tools' | 'prompt'
type RuntimeNodeKind = 'host' | 'preset' | 'session' | 'capability' | 'context' | 'request' | 'plugin' | 'service'

interface RuntimeNodeData extends Record<string, unknown> {
  readonly eyebrow: string
  readonly label: string
  readonly detail: string
  readonly kind: RuntimeNodeKind
  readonly orientation?: 'horizontal' | 'vertical'
  readonly status?: string
  readonly entityId?: string
  readonly domain?: RuntimeMapDomain
}

type RuntimeNode = Node<RuntimeNodeData, 'runtime'>

interface RuntimeMapProps extends RuntimeVisualProps {
  readonly scope: RuntimeMapScope
  readonly onOpenDomain: (domain: RuntimeMapDomain) => void
  readonly onSelectEntity: (entityId: string) => void
}

interface RuntimeGraph {
  readonly nodes: readonly RuntimeNode[]
  readonly edges: readonly Edge[]
  readonly hiddenLinks: number
  readonly exactLinks: number
  readonly inferredLinks: number
}

const NODE_WIDTH = 190
const NODE_HEIGHT = 92
const nodeTypes = { runtime: memo(RuntimeNodeView) }

/** Interactive, bounded topology over the current session or shared Host runtime. */
export function RuntimeMap({ onOpenDomain, onSelectEntity, scope, snapshot, t }: RuntimeMapProps) {
  const titleKey = scope === 'session' ? 'sessionMapTitle' : 'hostMapTitle'
  const localeGeneration = t(titleKey)
  const graph = useMemo(
    () => buildRuntimeGraph(snapshot, scope, t),
    [localeGeneration, scope, snapshot, t],
  )
  const unavailable = scope === 'host' && graph.edges.length === 0

  return (
    <section className="xray-visual-section xray-runtime-map-section" aria-label={t(titleKey)}>
      <header className="xray-visual-heading">
        <h3>{t(titleKey)}</h3>
        {scope === 'host' ? <span>{graph.exactLinks} {t('exact')} · {graph.inferredLinks} {t('inferred')}</span> : null}
      </header>
      {unavailable ? <p className="xray-map-unavailable">{t('serviceNetworkUnavailable')}</p> : (
        <>
          <div className="xray-map-legend" aria-label={t('mapLegend')}>
            {scope === 'host' ? (
              <>
                <span><i data-edge="exact" />{t('exactRelationship')}</span>
                <span><i data-edge="inferred" />{t('inferredRelationship')}</span>
              </>
            ) : (
              <>
                <span><i data-node="scope" />{t('scopeLayer')}</span>
                <span><i data-node="service" />{t('runtimeService')}</span>
                <span><i data-node="capability" />{t('requestInputs')}</span>
                <span><i data-node="context" />{t('modelContextNode')}</span>
                <span><i data-node="request" />{t('modelRequest')}</span>
              </>
            )}
            {graph.hiddenLinks > 0 ? <span className="xray-map-hidden">+{graph.hiddenLinks} {t('hiddenRelationships')}</span> : null}
          </div>
          <div className="xray-runtime-map">
            <ReactFlow<RuntimeNode, Edge>
              key={`${localeGeneration}:${scope}:${snapshot.capture.completedAt}`}
              ariaLabelConfig={{
                'controls.ariaLabel': t('mapControls'),
                'controls.fitView.ariaLabel': t('fitMap'),
                'controls.zoomIn.ariaLabel': t('zoomIn'),
                'controls.zoomOut.ariaLabel': t('zoomOut'),
                'minimap.ariaLabel': t('mapOverview'),
                'node.a11yDescription.default': t('nodeKeyboardHint'),
              }}
              defaultEdges={[...graph.edges]}
              defaultNodes={[...graph.nodes]}
              edgesFocusable={false}
              elementsSelectable
              fitView
              fitViewOptions={{ maxZoom: 1.05, padding: 0.2 }}
              maxZoom={1.6}
              minZoom={0.28}
              nodeTypes={nodeTypes}
              nodesConnectable={false}
              nodesDraggable={false}
              onNodeClick={(_, node) => {
                if (node.data.entityId !== undefined) onSelectEntity(node.data.entityId)
                else if (node.data.domain !== undefined) onOpenDomain(node.data.domain)
              }}
              panOnScroll
              preventScrolling={false}
              proOptions={{ hideAttribution: true }}
              zoomOnDoubleClick={false}
              zoomOnScroll={false}
            >
              <Background gap={22} size={1} />
              <Controls showInteractive={false} />
              {graph.nodes.length > 8 ? <MiniMap pannable zoomable /> : null}
            </ReactFlow>
          </div>
        </>
      )}
    </section>
  )
}

/** Build the deterministic, size-bounded graph consumed by the interactive map. */
export function buildRuntimeGraph(snapshot: RuntimeSnapshot, scope: RuntimeMapScope, t: RuntimeVisualProps['t']): RuntimeGraph {
  return scope === 'session' ? sessionGraph(snapshot, t) : hostGraph(snapshot, t)
}

/** Expandable exact inventory for the inputs assembled into a model request. */
export function RequestContextTree({ snapshot, t }: RuntimeVisualProps) {
  const session = snapshot.session
  if (session === undefined) return null
  const skills = session.skills?.items ?? []
  const sections = session.prompt.items.filter(item => item.name.startsWith('section:'))
  const contexts = session.prompt.items.filter(item => item.name.startsWith('context:'))
  const variables = session.prompt.items.filter(item => item.name.startsWith('variable:'))
  const branches = [
    { id: 'skills', label: t('skills'), count: skills.length, examples: skills.map(item => item.name) },
    { id: 'tools', label: t('tools'), count: session.tools.items.length, examples: session.tools.items.map(item => item.name) },
    { id: 'sections', label: t('promptSections'), count: sections.length, examples: sections.map(item => stripPrefix(item.name)) },
    { id: 'contexts', label: t('runtimeContexts'), count: contexts.length, examples: contexts.map(item => stripPrefix(item.name)) },
    { id: 'variables', label: t('variables'), count: variables.length, examples: variables.map(item => stripPrefix(item.name)) },
  ]
  return (
    <section className="xray-visual-section" aria-label={t('requestTreeTitle')}>
      <header className="xray-visual-heading"><h3>{t('requestTreeTitle')}</h3></header>
      <div className="xray-request-tree">
        <div className="xray-request-branches">
          {branches.map(branch => (
            <details className="xray-request-branch" data-kind={branch.id} key={branch.id}>
              <summary><strong>{branch.label}</strong><span>{branch.count}</span></summary>
              {branch.examples.length === 0 ? <p>{t('emptyDomain')}</p> : <ul>{branch.examples.map(item => <li key={item}>{item}</li>)}</ul>}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function RuntimeNodeView({ data, selected }: NodeProps<RuntimeNode>) {
  const vertical = data.orientation === 'vertical'
  return (
    <div className="xray-flow-node" data-kind={data.kind} data-selected={selected || undefined} data-status={data.status}>
      <Handle className="xray-flow-handle" type="target" position={vertical ? Position.Top : Position.Left} />
      <span className="xray-flow-node-eyebrow">{data.eyebrow}</span>
      <strong>{data.label}</strong>
      <small title={data.detail}>{data.detail}</small>
      <Handle className="xray-flow-handle" type="source" position={vertical ? Position.Bottom : Position.Right} />
    </div>
  )
}

function sessionGraph(snapshot: RuntimeSnapshot, t: RuntimeVisualProps['t']): RuntimeGraph {
  const session = snapshot.session
  const nodes: RuntimeNode[] = [{
    id: 'scope:host',
    type: 'runtime',
    position: { x: 0, y: 0 },
    data: {
      eyebrow: t('hostLayer'),
      label: t('host'),
      detail: `${snapshot.host.plugins.items.length} ${t('plugins')} · ${snapshot.host.services.items.length} ${t('services')}`,
      kind: 'host',
    },
  }]
  const edges: Edge[] = []
  if (session === undefined) return layoutGraph(nodes, edges)

  let previous = 'scope:host'
  if (session.preset !== undefined) {
    nodes.push(runtimeNode('scope:preset', 'preset', t('presetLayer'), session.preset, ''))
    edges.push(runtimeEdge('scope:host', 'scope:preset', 'scope'))
    previous = 'scope:preset'
  }
  nodes.push(runtimeNode('scope:session', 'session', t('sessionLayer'), t('currentSession'), session.sessionId, session.status))
  edges.push(runtimeEdge(previous, 'scope:session', 'scope'))

  const inputs: readonly { id: RuntimeMapDomain; label: string; count: number }[] = [
    { id: 'services', label: t('services'), count: session.services.items.length },
    { id: 'skills', label: t('skills'), count: session.skills?.items.length ?? 0 },
    { id: 'tools', label: t('tools'), count: session.tools.items.length },
    { id: 'prompt', label: t('modelContext'), count: session.prompt.items.length },
  ]
  for (const input of inputs) {
    const id = `input:${input.id}`
    const isService = input.id === 'services'
    const node = runtimeNode(id, isService ? 'service' : 'capability', isService ? t('runtimeLayer') : t('requestInput'), input.label, `${input.count} ${t('items')}`)
    nodes.push({ ...node, data: { ...node.data, domain: input.id } })
    edges.push(runtimeEdge('scope:session', id, 'scope'))
  }

  const model = [session.modelProvider, session.model].filter(Boolean).join(' / ') || t('modelRouteUnavailable')
  nodes.push(runtimeNode('context:model', 'context', t('modelLayer'), t('modelContextNode'), `${session.prompt.items.length} ${t('items')}`))
  for (const input of inputs.filter(input => input.id !== 'services')) edges.push(runtimeEdge(`input:${input.id}`, 'context:model', 'context'))
  nodes.push(runtimeNode('request:model', 'request', t('requestBoundary'), t('modelRequest'), model))
  edges.push(runtimeEdge('context:model', 'request:model', 'context'))
  return layoutGraph(nodes, edges, 'TB')
}

function hostGraph(snapshot: RuntimeSnapshot, t: RuntimeVisualProps['t']): RuntimeGraph {
  const pluginById = new Map(snapshot.host.plugins.items.map(item => [item.entryId, item]))
  const serviceById = new Map(snapshot.host.services.items.map(item => [item.name, item]))
  const allLinks = snapshot.relationships.filter(link =>
    link.kind === 'provides'
    && link.attribution?.quality !== 'unavailable'
    && pluginById.has(link.fromId)
    && serviceById.has(link.toId),
  )
  const degree = new Map<string, number>()
  for (const link of allLinks) degree.set(link.fromId, (degree.get(link.fromId) ?? 0) + 1)
  const sources = [...degree.keys()]
    .sort((left, right) => (degree.get(right) ?? 0) - (degree.get(left) ?? 0) || left.localeCompare(right))
    .slice(0, 6)
  const sourceSet = new Set(sources)
  const candidateLinks = allLinks.filter(link => sourceSet.has(link.fromId))
  const targets = unique(candidateLinks.map(link => link.toId)).slice(0, 7)
  const targetSet = new Set(targets)
  const links = candidateLinks.filter(link => targetSet.has(link.toId)).slice(0, 18)

  const nodes: RuntimeNode[] = sources.map(source => {
    const plugin = pluginById.get(source)
    const node = runtimeNode(source, 'plugin', t('pluginNode'), plugin?.moduleName ?? source, truncate(source, 34), plugin?.phase ?? 'unobserved')
    return { ...node, data: { ...node.data, entityId: source } }
  })
  for (const target of targets) {
    const service = serviceById.get(target)
    const statusKey = service?.status === 'available' ? 'available' : 'unknown'
    const node = runtimeNode(target, 'service', t('serviceNode'), target, t(statusKey), service?.status)
    nodes.push({ ...node, data: { ...node.data, entityId: target } })
  }
  const edges = links.map(link => runtimeEdge(link.fromId, link.toId, link.attribution?.quality === 'exact' ? 'exact' : 'inferred', link.relationshipId))
  const graph = layoutGraph(nodes, edges)
  return {
    ...graph,
    exactLinks: allLinks.filter(link => link.attribution?.quality === 'exact').length,
    inferredLinks: allLinks.filter(link => link.attribution?.quality === 'inferred').length,
    hiddenLinks: Math.max(0, allLinks.length - links.length),
  }
}

function runtimeNode(id: string, kind: RuntimeNodeKind, eyebrow: string, label: string, detail: string, status?: string): RuntimeNode {
  return {
    id,
    type: 'runtime',
    position: { x: 0, y: 0 },
    data: { eyebrow, label, detail, kind, status },
  }
}

function runtimeEdge(source: string, target: string, quality: 'scope' | 'contributes' | 'context' | 'exact' | 'inferred', id = `${source}:${target}:${quality}`): Edge {
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    className: `xray-flow-edge xray-flow-edge-${quality}`,
    markerEnd: { type: MarkerType.ArrowClosed },
    selectable: false,
  }
}

function layoutGraph(nodes: readonly RuntimeNode[], edges: readonly Edge[], direction: 'LR' | 'TB' = 'LR'): RuntimeGraph {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: direction,
    ...(direction === 'LR' ? { align: 'UL' } : {}),
    nodesep: direction === 'TB' ? 18 : 16,
    ranksep: direction === 'TB' ? 38 : 52,
    marginx: 24,
    marginy: 24,
  })
  for (const node of nodes) graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  for (const edge of edges) graph.setEdge(edge.source, edge.target)
  dagre.layout(graph)
  return {
    nodes: nodes.map(node => {
      const position = graph.node(node.id) as { x: number; y: number }
      return {
        ...node,
        data: { ...node.data, orientation: direction === 'TB' ? 'vertical' : 'horizontal' },
        position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 },
      }
    }),
    edges,
    hiddenLinks: 0,
    exactLinks: 0,
    inferredLinks: 0,
  }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function truncate(value: string, length: number): string {
  return value.length <= length ? value : `${value.slice(0, length - 1)}…`
}

function stripPrefix(value: string): string {
  const separator = value.indexOf(':')
  return separator < 0 ? value : value.slice(separator + 1)
}
