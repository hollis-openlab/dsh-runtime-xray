/** Read-only, detached runtime snapshot contract and normalizer. */

/** Version of the JSON snapshot exchanged by the Host and Client adapters. */
export const SNAPSHOT_SCHEMA_VERSION = 1 as const

/** Overall health of a snapshot after domain statuses are folded. */
export type SnapshotHealth = 'healthy' | 'partial' | 'failed'

/** Collection state of one independently inspected domain. */
export type DomainStatus = 'ready' | 'partial' | 'unsupported' | 'failed' | 'truncated'

/** Domain names accepted by a bounded snapshot request. */
export type SnapshotDomainName = 'plugins' | 'services' | 'effects' | 'skills' | 'tools' | 'prompt'

/** Evidence quality for a source attribution. */
export type AttributionQuality = 'exact' | 'inferred' | 'unavailable'

/** A bounded, user-facing diagnostic attached to a snapshot or domain. */
export interface SnapshotDiagnostic {
  readonly code: string
  readonly message: string
  readonly severity?: 'info' | 'warning' | 'error'
}

/** Compatibility identity advertised by the active Host. */
export interface SnapshotCompatibility {
  readonly harnessVersion?: string
  readonly verifiedRevision?: string
}

/** Explicit allowlist policy carried with every detached snapshot. */
export interface SnapshotRedaction {
  readonly policy: 'allowlist'
  readonly excluded: readonly string[]
}

/** Public inspection capabilities available in the current composition. */
export interface SnapshotCapabilities {
  readonly loaderEntries: boolean
  readonly serviceOwners: boolean
  readonly toolOwners: boolean
  readonly promptOwners: boolean
  readonly fiberEffects: boolean
}

/** Directed relationship between snapshot-local entities. */
export interface SnapshotRelationship {
  readonly relationshipId: string
  readonly kind: 'provides' | 'owns' | 'parent'
  readonly fromId: string
  readonly toId: string
  readonly attribution?: SourceAttribution
}

/** Source evidence for a runtime entity. */
export interface SourceAttribution {
  readonly quality: AttributionQuality
  readonly code: string
  readonly sourceId?: string
  readonly explanation?: string
}

/** One Loader entry observed in the Host runtime. */
export interface PluginEntry {
  readonly entryId: string
  readonly moduleName: string
  readonly enabled: boolean
  readonly phase: 'pending' | 'loading' | 'active' | 'failed' | 'unloading' | null
  readonly requiredServices?: readonly string[]
  readonly missingServices?: readonly string[]
  readonly attribution?: SourceAttribution
}

/** One service name observed in a Host or isolated scope. */
export interface ServiceEntity {
  readonly name: string
  readonly status: 'available' | 'missing' | 'unknown'
  readonly scopeId?: string
  readonly realmId?: string
  readonly attribution?: SourceAttribution
}

/** One tool visible to the selected session. */
export interface ToolEntity {
  readonly name: string
  readonly schemaBytes: number
  readonly attribution?: SourceAttribution
}

/** One skill visible through the selected Agent's scoped catalog. */
export interface SkillEntity {
  readonly name: string
  readonly description: string
  readonly provider: string
  readonly source: string
  readonly modelInvocable: boolean
  readonly userInvocable: boolean
}

/** One ordered prompt or runtime-context item. */
export interface PromptEntity {
  readonly name: string
  readonly position: number
  readonly bytes: number
  readonly contentHash: string
  readonly attribution?: SourceAttribution
}

/** One labeled effect in a plugin fiber's effect tree. */
export interface EffectEntity {
  readonly effectId: string
  readonly label: string
  readonly parentId?: string
  readonly depth: number
  readonly attribution?: SourceAttribution
}

/** Input for one independently collected domain. */
export interface SnapshotDomainInput<T> {
  readonly status: DomainStatus
  readonly items: readonly T[]
  readonly diagnostics: readonly SnapshotDiagnostic[]
}

/** Detached normalized form of one collected domain. */
export interface SnapshotDomain<T> {
  readonly status: DomainStatus
  readonly items: readonly T[]
  readonly diagnostics: readonly SnapshotDiagnostic[]
}

/** Host-side domains collected from the live runtime. */
export interface HostSnapshotInput {
  readonly plugins: SnapshotDomainInput<PluginEntry>
  readonly services: SnapshotDomainInput<ServiceEntity>
  readonly effects: SnapshotDomainInput<EffectEntity>
}

/** Detached host-side snapshot domains. */
export interface HostSnapshot {
  readonly plugins: SnapshotDomain<PluginEntry>
  readonly services: SnapshotDomain<ServiceEntity>
  readonly effects: SnapshotDomain<EffectEntity>
}

/** Session-specific input collected from an effective Agent scope. */
export interface SessionSnapshotInput {
  readonly sessionId: string
  readonly status: 'running' | 'idle' | 'cold' | 'unavailable'
  readonly preset?: string
  readonly modelProvider?: string
  readonly model?: string
  readonly services: SnapshotDomainInput<ServiceEntity>
  readonly promptToolCount?: number
  readonly promptToolSchemaBytes?: number
  readonly runtimeContextSuppressed?: boolean
  readonly skillCatalogComplete?: boolean
  readonly skills?: SnapshotDomainInput<SkillEntity>
  readonly tools: SnapshotDomainInput<ToolEntity>
  readonly prompt: SnapshotDomainInput<PromptEntity>
}

/** Detached session-specific snapshot domains. */
export interface SessionSnapshot {
  readonly sessionId: string
  readonly status: SessionSnapshotInput['status']
  readonly preset?: string
  readonly modelProvider?: string
  readonly model?: string
  readonly services: SnapshotDomain<ServiceEntity>
  readonly promptToolCount?: number
  readonly promptToolSchemaBytes?: number
  readonly runtimeContextSuppressed?: boolean
  readonly skillCatalogComplete?: boolean
  readonly skills?: SnapshotDomain<SkillEntity>
  readonly tools: SnapshotDomain<ToolEntity>
  readonly prompt: SnapshotDomain<PromptEntity>
}

/** Input accepted by the snapshot normalizer. Unknown fields are ignored. */
export interface SnapshotInput {
  readonly capture: {
    readonly startedAt: number
    readonly completedAt: number
    readonly generation?: string
  }
  readonly host: HostSnapshotInput
  readonly session?: SessionSnapshotInput
  readonly diagnostics?: readonly SnapshotDiagnostic[]
  readonly requestedSessionId?: string
  readonly compatibility?: SnapshotCompatibility
  readonly redaction?: SnapshotRedaction
  readonly capabilities?: SnapshotCapabilities
  readonly relationships?: readonly SnapshotRelationship[]
}

/** Detached, versioned snapshot returned by the Host adapter. */
export interface RuntimeSnapshot {
  readonly schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION
  readonly health: SnapshotHealth
  readonly capture: {
    readonly startedAt: number
    readonly completedAt: number
    readonly generation?: string
  }
  readonly host: HostSnapshot
  readonly session?: SessionSnapshot
  readonly diagnostics: readonly SnapshotDiagnostic[]
  readonly requestedSessionId?: string
  readonly compatibility: SnapshotCompatibility
  readonly redaction: SnapshotRedaction
  readonly capabilities: SnapshotCapabilities
  readonly relationships: readonly SnapshotRelationship[]
}

/** Request accepted by the Host snapshot adapter. */
export interface SnapshotRequest {
  readonly sessionId?: string
  readonly domains?: readonly SnapshotDomainName[]
}

/** Deep inspection seam shared by the Host collector, Client remote, and tests. */
export interface RuntimeSnapshotProvider {
  /** Capture one detached runtime snapshot. */
  snapshot(request?: SnapshotRequest, signal?: AbortSignal): Promise<RuntimeSnapshot>
}

/**
 * Normalize one collected runtime observation into a deterministic immutable snapshot.
 *
 * The function copies only declared fields. This allowlist is the seam's privacy
 * guarantee: adding an undeclared value to a live runtime object cannot make that
 * value cross into the Client response or export.
 *
 * @param input - detached or live-shaped collector output.
 * @returns a stable, deeply frozen snapshot.
 */
export function normalizeSnapshot(input: SnapshotInput): RuntimeSnapshot {
  const host = {
    plugins: normalizeDomain(input.host.plugins, item => ({
      entryId: item.entryId,
      moduleName: item.moduleName,
      enabled: item.enabled,
      phase: item.phase,
      ...item.requiredServices === undefined ? {} : { requiredServices: [...item.requiredServices].sort(compareText) },
      ...item.missingServices === undefined ? {} : { missingServices: [...item.missingServices].sort(compareText) },
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }), comparePlugin),
    services: normalizeDomain(input.host.services, item => ({
      name: item.name,
      status: item.status,
      ...item.scopeId === undefined ? {} : { scopeId: item.scopeId },
      ...item.realmId === undefined ? {} : { realmId: item.realmId },
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }), compareService),
    effects: normalizeDomain(input.host.effects, item => ({
      effectId: item.effectId,
      label: item.label,
      ...item.parentId === undefined ? {} : { parentId: item.parentId },
      depth: item.depth,
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }), compareEffect),
  }
  const session = input.session === undefined ? undefined : {
    sessionId: input.session.sessionId,
    status: input.session.status,
    ...input.session.preset === undefined ? {} : { preset: input.session.preset },
    ...input.session.modelProvider === undefined ? {} : { modelProvider: input.session.modelProvider },
    ...input.session.model === undefined ? {} : { model: input.session.model },
    ...input.session.promptToolCount === undefined ? {} : { promptToolCount: input.session.promptToolCount },
    ...input.session.promptToolSchemaBytes === undefined ? {} : { promptToolSchemaBytes: input.session.promptToolSchemaBytes },
    ...input.session.runtimeContextSuppressed === undefined ? {} : { runtimeContextSuppressed: input.session.runtimeContextSuppressed },
    ...input.session.skillCatalogComplete === undefined ? {} : { skillCatalogComplete: input.session.skillCatalogComplete },
    ...input.session.skills === undefined ? {} : { skills: normalizeDomain(input.session.skills, item => ({
      name: item.name,
      description: item.description,
      provider: item.provider,
      source: item.source,
      modelInvocable: item.modelInvocable,
      userInvocable: item.userInvocable,
    }), compareSkill) },
    tools: normalizeDomain(input.session.tools, item => ({
      name: item.name,
      schemaBytes: item.schemaBytes,
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }), compareTool),
    services: normalizeDomain(input.session.services, item => ({
      name: item.name,
      status: item.status,
      ...item.scopeId === undefined ? {} : { scopeId: item.scopeId },
      ...item.realmId === undefined ? {} : { realmId: item.realmId },
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }), compareService),
    prompt: normalizeDomain(input.session.prompt, item => ({
      name: item.name,
      position: item.position,
      bytes: item.bytes,
      contentHash: item.contentHash,
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }), comparePrompt),
  }
  const diagnostics = normalizeDiagnostics(input.diagnostics ?? [])
  const statuses = [
    host.plugins.status,
    host.services.status,
    host.effects.status,
    ...session === undefined ? [] : [session.services.status, ...session.skills === undefined ? [] : [session.skills.status], session.tools.status, session.prompt.status],
  ]
  const domainDiagnostics = [
    ...host.plugins.diagnostics,
    ...host.services.diagnostics,
    ...host.effects.diagnostics,
    ...session === undefined ? [] : [...session.services.diagnostics, ...session.skills?.diagnostics ?? [], ...session.tools.diagnostics, ...session.prompt.diagnostics],
  ]
  const hasFailure = statuses.some(status => status === 'failed') || domainDiagnostics.some(item => item.severity === 'error')
  const hasBlockingDiagnostic = diagnostics.some(item => item.severity !== 'info') || domainDiagnostics.some(item => item.severity !== 'info')
  const health = hasFailure
    ? 'failed'
    : statuses.every(status => status === 'ready') && !hasBlockingDiagnostic
    ? 'healthy'
    : 'partial'
  const relationships = [...input.relationships ?? []]
    .map(item => ({
      relationshipId: item.relationshipId,
      kind: item.kind,
      fromId: item.fromId,
      toId: item.toId,
      ...item.attribution === undefined ? {} : { attribution: normalizeAttribution(item.attribution) },
    }))
    .sort((left, right) => compareText(left.relationshipId, right.relationshipId) || compareText(left.fromId, right.fromId) || compareText(left.toId, right.toId))
  return deepFreeze({
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    health,
    capture: {
      startedAt: input.capture.startedAt,
      completedAt: input.capture.completedAt,
      ...input.capture.generation === undefined ? {} : { generation: input.capture.generation },
    },
    host,
    ...session === undefined ? {} : { session },
    diagnostics,
    ...input.requestedSessionId === undefined ? {} : { requestedSessionId: input.requestedSessionId },
    compatibility: {
      ...input.compatibility?.harnessVersion === undefined ? {} : { harnessVersion: input.compatibility.harnessVersion },
      ...input.compatibility?.verifiedRevision === undefined ? {} : { verifiedRevision: input.compatibility.verifiedRevision },
    },
    redaction: {
      policy: 'allowlist',
      excluded: [...input.redaction?.excluded ?? [
        'credentials', 'environment-values', 'prompt-content', 'runtime-context-content', 'variable-values', 'approval-payloads', 'tool-results',
      ]].sort(compareText),
    },
    capabilities: {
      loaderEntries: input.capabilities?.loaderEntries ?? true,
      serviceOwners: input.capabilities?.serviceOwners ?? false,
      toolOwners: input.capabilities?.toolOwners ?? false,
      promptOwners: input.capabilities?.promptOwners ?? false,
      fiberEffects: input.capabilities?.fiberEffects ?? true,
    },
    relationships,
  })
}

function normalizeDomain<T>(
  input: SnapshotDomainInput<T>,
  map: (item: T) => T,
  compare: (left: T, right: T) => number,
): SnapshotDomain<T> {
  return {
    status: input.status,
    items: [...input.items].map(map).sort(compare),
    diagnostics: normalizeDiagnostics(input.diagnostics),
  }
}

function normalizeAttribution(input: SourceAttribution): SourceAttribution {
  return {
    quality: input.quality,
    code: input.code,
    ...input.sourceId === undefined ? {} : { sourceId: input.sourceId },
    ...input.explanation === undefined ? {} : { explanation: input.explanation },
  }
}

function normalizeDiagnostics(input: readonly SnapshotDiagnostic[]): readonly SnapshotDiagnostic[] {
  return [...input]
    .map(item => ({
      code: item.code,
      message: item.message,
      ...item.severity === undefined ? {} : { severity: item.severity },
    }))
    .sort((left, right) => compareText(left.code, right.code) || compareText(left.message, right.message))
}

/** Compare strings by Unicode code point so output is stable across locales. */
function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function comparePlugin(left: PluginEntry, right: PluginEntry): number {
  return compareText(left.entryId, right.entryId)
}

function compareService(left: ServiceEntity, right: ServiceEntity): number {
  return compareText(left.name, right.name)
    || compareText(left.attribution?.sourceId ?? '', right.attribution?.sourceId ?? '')
    || compareText(left.status, right.status)
}

function compareTool(left: ToolEntity, right: ToolEntity): number {
  return compareText(left.name, right.name)
}

function compareSkill(left: SkillEntity, right: SkillEntity): number {
  return compareText(left.name, right.name) || compareText(left.provider, right.provider)
}

function comparePrompt(left: PromptEntity, right: PromptEntity): number {
  return left.position - right.position || compareText(left.name, right.name)
}

function compareEffect(left: EffectEntity, right: EffectEntity): number {
  return compareText(left.effectId, right.effectId)
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return value
  seen.add(value)
  for (const child of Object.values(value)) deepFreeze(child, seen)
  return Object.freeze(value)
}
