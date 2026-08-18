//#region src/snapshot.d.ts
/** Read-only, detached runtime snapshot contract and normalizer. */
/** Version of the JSON snapshot exchanged by the Host and Client adapters. */
declare const SNAPSHOT_SCHEMA_VERSION: 1;
/** Overall health of a snapshot after domain statuses are folded. */
type SnapshotHealth = 'healthy' | 'partial';
/** Collection state of one independently inspected domain. */
type DomainStatus = 'ready' | 'partial' | 'unsupported' | 'failed' | 'truncated';
/** Domain names accepted by a bounded snapshot request. */
type SnapshotDomainName = 'plugins' | 'services' | 'effects' | 'tools' | 'prompt';
/** Evidence quality for a source attribution. */
type AttributionQuality = 'exact' | 'inferred' | 'unavailable';
/** A bounded, user-facing diagnostic attached to a snapshot or domain. */
interface SnapshotDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly severity?: 'info' | 'warning' | 'error';
}
/** Source evidence for a runtime entity. */
interface SourceAttribution {
  readonly quality: AttributionQuality;
  readonly code: string;
  readonly sourceId?: string;
  readonly explanation?: string;
}
/** One Loader entry observed in the Host runtime. */
interface PluginEntry {
  readonly entryId: string;
  readonly moduleName: string;
  readonly enabled: boolean;
  readonly phase: 'pending' | 'loading' | 'active' | 'failed' | 'unloading' | null;
  readonly attribution?: SourceAttribution;
}
/** One service name observed in a Host or isolated scope. */
interface ServiceEntity {
  readonly name: string;
  readonly status: 'available' | 'missing' | 'unknown';
  readonly scopeId?: string;
  readonly realmId?: string;
  readonly attribution?: SourceAttribution;
}
/** One tool visible to the selected session. */
interface ToolEntity {
  readonly name: string;
  readonly schemaBytes: number;
  readonly attribution?: SourceAttribution;
}
/** One ordered prompt or runtime-context item. */
interface PromptEntity {
  readonly name: string;
  readonly position: number;
  readonly bytes: number;
  readonly contentHash: string;
  readonly attribution?: SourceAttribution;
}
/** One labeled effect in a plugin fiber's effect tree. */
interface EffectEntity {
  readonly effectId: string;
  readonly label: string;
  readonly parentId?: string;
  readonly depth: number;
  readonly attribution?: SourceAttribution;
}
/** Input for one independently collected domain. */
interface SnapshotDomainInput<T> {
  readonly status: DomainStatus;
  readonly items: readonly T[];
  readonly diagnostics: readonly SnapshotDiagnostic[];
}
/** Detached normalized form of one collected domain. */
interface SnapshotDomain<T> {
  readonly status: DomainStatus;
  readonly items: readonly T[];
  readonly diagnostics: readonly SnapshotDiagnostic[];
}
/** Host-side domains collected from the live runtime. */
interface HostSnapshotInput {
  readonly plugins: SnapshotDomainInput<PluginEntry>;
  readonly services: SnapshotDomainInput<ServiceEntity>;
  readonly effects: SnapshotDomainInput<EffectEntity>;
}
/** Detached host-side snapshot domains. */
interface HostSnapshot {
  readonly plugins: SnapshotDomain<PluginEntry>;
  readonly services: SnapshotDomain<ServiceEntity>;
  readonly effects: SnapshotDomain<EffectEntity>;
}
/** Session-specific input collected from an effective Agent scope. */
interface SessionSnapshotInput {
  readonly sessionId: string;
  readonly status: 'running' | 'idle' | 'cold' | 'unavailable';
  readonly preset?: string;
  readonly modelProvider?: string;
  readonly model?: string;
  readonly tools: SnapshotDomainInput<ToolEntity>;
  readonly prompt: SnapshotDomainInput<PromptEntity>;
}
/** Detached session-specific snapshot domains. */
interface SessionSnapshot {
  readonly sessionId: string;
  readonly status: SessionSnapshotInput['status'];
  readonly preset?: string;
  readonly modelProvider?: string;
  readonly model?: string;
  readonly tools: SnapshotDomain<ToolEntity>;
  readonly prompt: SnapshotDomain<PromptEntity>;
}
/** Input accepted by the snapshot normalizer. Unknown fields are ignored. */
interface SnapshotInput {
  readonly capture: {
    readonly startedAt: number;
    readonly completedAt: number;
    readonly generation?: string;
  };
  readonly host: HostSnapshotInput;
  readonly session?: SessionSnapshotInput;
  readonly diagnostics?: readonly SnapshotDiagnostic[];
}
/** Detached, versioned snapshot returned by the Host adapter. */
interface RuntimeSnapshot {
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
}
/** Request accepted by the Host snapshot adapter. */
interface SnapshotRequest {
  readonly sessionId?: string;
  readonly domains?: readonly SnapshotDomainName[];
}
/** Deep inspection seam shared by the Host collector, Client remote, and tests. */
interface RuntimeSnapshotProvider {
  /** Capture one detached runtime snapshot. */
  snapshot(request?: SnapshotRequest): Promise<RuntimeSnapshot>;
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
declare function normalizeSnapshot(input: SnapshotInput): RuntimeSnapshot;
//#endregion
export { AttributionQuality, DomainStatus, EffectEntity, HostSnapshot, HostSnapshotInput, PluginEntry, PromptEntity, RuntimeSnapshot, RuntimeSnapshotProvider, SNAPSHOT_SCHEMA_VERSION, ServiceEntity, SessionSnapshot, SessionSnapshotInput, SnapshotDiagnostic, SnapshotDomain, SnapshotDomainInput, SnapshotDomainName, SnapshotHealth, SnapshotInput, SnapshotRequest, SourceAttribution, ToolEntity, normalizeSnapshot };