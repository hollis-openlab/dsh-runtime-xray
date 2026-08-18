/** Read-only, detached runtime snapshot contract and normalizer. */
/** Version of the JSON snapshot exchanged by the Host and Client adapters. */
export declare const SNAPSHOT_SCHEMA_VERSION: 1;
/** Overall health of a snapshot after domain statuses are folded. */
export type SnapshotHealth = 'healthy' | 'partial' | 'failed';
/** Collection state of one independently inspected domain. */
export type DomainStatus = 'ready' | 'partial' | 'unsupported' | 'failed' | 'truncated';
/** Domain names accepted by a bounded snapshot request. */
export type SnapshotDomainName = 'plugins' | 'services' | 'effects' | 'skills' | 'tools' | 'prompt';
/** Evidence quality for a source attribution. */
export type AttributionQuality = 'exact' | 'inferred' | 'unavailable';
/** A bounded, user-facing diagnostic attached to a snapshot or domain. */
export interface SnapshotDiagnostic {
    readonly code: string;
    readonly message: string;
    readonly severity?: 'info' | 'warning' | 'error';
}
/** Compatibility identity advertised by the active Host. */
export interface SnapshotCompatibility {
    readonly harnessVersion?: string;
    readonly verifiedRevision?: string;
}
/** Explicit allowlist policy carried with every detached snapshot. */
export interface SnapshotRedaction {
    readonly policy: 'allowlist';
    readonly excluded: readonly string[];
}
/** Public inspection capabilities available in the current composition. */
export interface SnapshotCapabilities {
    readonly loaderEntries: boolean;
    readonly serviceOwners: boolean;
    readonly toolOwners: boolean;
    readonly promptOwners: boolean;
    readonly fiberEffects: boolean;
}
/** Directed relationship between snapshot-local entities. */
export interface SnapshotRelationship {
    readonly relationshipId: string;
    readonly kind: 'provides' | 'owns' | 'parent';
    readonly fromId: string;
    readonly toId: string;
    readonly attribution?: SourceAttribution;
}
/** Source evidence for a runtime entity. */
export interface SourceAttribution {
    readonly quality: AttributionQuality;
    readonly code: string;
    readonly sourceId?: string;
    readonly explanation?: string;
}
/** One Loader entry observed in the Host runtime. */
export interface PluginEntry {
    readonly entryId: string;
    readonly moduleName: string;
    readonly enabled: boolean;
    readonly phase: 'pending' | 'loading' | 'active' | 'failed' | 'unloading' | null;
    readonly requiredServices?: readonly string[];
    readonly missingServices?: readonly string[];
    readonly attribution?: SourceAttribution;
}
/** One service name observed in a Host or isolated scope. */
export interface ServiceEntity {
    readonly name: string;
    readonly status: 'available' | 'missing' | 'unknown';
    readonly scopeId?: string;
    readonly realmId?: string;
    readonly attribution?: SourceAttribution;
}
/** One tool visible to the selected session. */
export interface ToolEntity {
    readonly name: string;
    readonly schemaBytes: number;
    readonly attribution?: SourceAttribution;
}
/** One skill visible through the selected Agent's scoped catalog. */
export interface SkillEntity {
    readonly name: string;
    readonly description: string;
    readonly provider: string;
    readonly source: string;
    readonly modelInvocable: boolean;
    readonly userInvocable: boolean;
}
/** One ordered prompt or runtime-context item. */
export interface PromptEntity {
    readonly name: string;
    readonly position: number;
    readonly bytes: number;
    readonly contentHash: string;
    readonly attribution?: SourceAttribution;
}
/** One labeled effect in a plugin fiber's effect tree. */
export interface EffectEntity {
    readonly effectId: string;
    readonly label: string;
    readonly parentId?: string;
    readonly depth: number;
    readonly attribution?: SourceAttribution;
}
/** Input for one independently collected domain. */
export interface SnapshotDomainInput<T> {
    readonly status: DomainStatus;
    readonly items: readonly T[];
    readonly diagnostics: readonly SnapshotDiagnostic[];
}
/** Detached normalized form of one collected domain. */
export interface SnapshotDomain<T> {
    readonly status: DomainStatus;
    readonly items: readonly T[];
    readonly diagnostics: readonly SnapshotDiagnostic[];
}
/** Host-side domains collected from the live runtime. */
export interface HostSnapshotInput {
    readonly plugins: SnapshotDomainInput<PluginEntry>;
    readonly services: SnapshotDomainInput<ServiceEntity>;
    readonly effects: SnapshotDomainInput<EffectEntity>;
}
/** Detached host-side snapshot domains. */
export interface HostSnapshot {
    readonly plugins: SnapshotDomain<PluginEntry>;
    readonly services: SnapshotDomain<ServiceEntity>;
    readonly effects: SnapshotDomain<EffectEntity>;
}
/** Session-specific input collected from an effective Agent scope. */
export interface SessionSnapshotInput {
    readonly sessionId: string;
    readonly status: 'running' | 'idle' | 'cold' | 'unavailable';
    readonly preset?: string;
    readonly modelProvider?: string;
    readonly model?: string;
    readonly services: SnapshotDomainInput<ServiceEntity>;
    readonly promptToolCount?: number;
    readonly promptToolSchemaBytes?: number;
    readonly runtimeContextSuppressed?: boolean;
    readonly skillCatalogComplete?: boolean;
    readonly skills?: SnapshotDomainInput<SkillEntity>;
    readonly tools: SnapshotDomainInput<ToolEntity>;
    readonly prompt: SnapshotDomainInput<PromptEntity>;
}
/** Detached session-specific snapshot domains. */
export interface SessionSnapshot {
    readonly sessionId: string;
    readonly status: SessionSnapshotInput['status'];
    readonly preset?: string;
    readonly modelProvider?: string;
    readonly model?: string;
    readonly services: SnapshotDomain<ServiceEntity>;
    readonly promptToolCount?: number;
    readonly promptToolSchemaBytes?: number;
    readonly runtimeContextSuppressed?: boolean;
    readonly skillCatalogComplete?: boolean;
    readonly skills?: SnapshotDomain<SkillEntity>;
    readonly tools: SnapshotDomain<ToolEntity>;
    readonly prompt: SnapshotDomain<PromptEntity>;
}
/** Input accepted by the snapshot normalizer. Unknown fields are ignored. */
export interface SnapshotInput {
    readonly capture: {
        readonly startedAt: number;
        readonly completedAt: number;
        readonly generation?: string;
    };
    readonly host: HostSnapshotInput;
    readonly session?: SessionSnapshotInput;
    readonly diagnostics?: readonly SnapshotDiagnostic[];
    readonly requestedSessionId?: string;
    readonly compatibility?: SnapshotCompatibility;
    readonly redaction?: SnapshotRedaction;
    readonly capabilities?: SnapshotCapabilities;
    readonly relationships?: readonly SnapshotRelationship[];
}
/** Detached, versioned snapshot returned by the Host adapter. */
export interface RuntimeSnapshot {
    readonly schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
    readonly health: SnapshotHealth;
    readonly capture: {
        readonly startedAt: number;
        readonly completedAt: number;
        readonly generation?: string;
    };
    readonly host: HostSnapshot;
    readonly session?: SessionSnapshot;
    readonly diagnostics: readonly SnapshotDiagnostic[];
    readonly requestedSessionId?: string;
    readonly compatibility: SnapshotCompatibility;
    readonly redaction: SnapshotRedaction;
    readonly capabilities: SnapshotCapabilities;
    readonly relationships: readonly SnapshotRelationship[];
}
/** Request accepted by the Host snapshot adapter. */
export interface SnapshotRequest {
    readonly sessionId?: string;
    readonly domains?: readonly SnapshotDomainName[];
}
/** Deep inspection seam shared by the Host collector, Client remote, and tests. */
export interface RuntimeSnapshotProvider {
    /** Capture one detached runtime snapshot. */
    snapshot(request?: SnapshotRequest, signal?: AbortSignal): Promise<RuntimeSnapshot>;
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
export declare function normalizeSnapshot(input: SnapshotInput): RuntimeSnapshot;
