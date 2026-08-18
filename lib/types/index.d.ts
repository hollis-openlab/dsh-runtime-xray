/** Host package entry and read-only runtime snapshot Remote. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type RuntimeSnapshot, type SnapshotRequest } from './snapshot.ts';
export * from './snapshot.ts';
export * from './remote.ts';
/** Bounded collection settings validated by the Cordis Loader. */
export interface RuntimeXrayConfig {
    readonly maxEntitiesPerDomain: number;
    readonly maxRelationships: number;
    readonly maxEffectDepth: number;
    readonly deadlineMs: number;
}
export { projectFiberEffects, projectLoaderEntries, projectServiceEntities } from './host-projection.ts';
/** Read-only Host gateway for the first runtime X-Ray vertical slice. */
export declare class RuntimeXrayGateway extends TypertRemoteService {
    static inject: string[];
    static Config: z<RuntimeXrayConfig>;
    private readonly config;
    constructor(ctx: Context, config?: Partial<RuntimeXrayConfig>);
    /**
     * Capture a bounded, detached snapshot of the current Loader inventory.
     * Unsupported domains are explicit so the Client never mistakes absence
     * for an empty runtime.
     *
     * @param request - optional session identity and requested domain list.
     * @returns normalized immutable runtime snapshot.
     */
    snapshot(request?: SnapshotRequest, signal?: AbortSignal): Promise<RuntimeSnapshot>;
}
export default RuntimeXrayGateway;
