/** Pure projection from Loader-owned entries into the X-Ray snapshot model. */
import type { Context } from '@deepseek-ai/cordis';
import type { EffectEntity, PluginEntry, ServiceEntity } from './snapshot.ts';
/** Minimal Loader projection required by the Host collector. */
export interface LoaderEntry {
    readonly id: string;
    readonly disabled: boolean;
    readonly options: {
        readonly group?: boolean;
        readonly name: string;
    };
    readonly fiber?: {
        readonly state: number;
        readonly inject?: Record<string, unknown>;
        readonly getEffects?: () => readonly EffectMetaLike[];
    };
}
/** Public Cordis effect metadata used by the loader fiber projection. */
export interface EffectMetaLike {
    readonly label: string;
    readonly children: readonly EffectMetaLike[];
}
/** Public Cordis service-store projection used for service ownership facts. */
export interface ServiceImplementationLike {
    readonly name: string;
    readonly fiber: {
        readonly name: string;
        readonly state: number;
    };
}
/** Project Loader entries without retaining mutable Cordis objects. */
export declare function projectLoaderEntries(entries: Iterable<LoaderEntry>, hasService?: (name: string) => boolean): readonly PluginEntry[];
/** Flatten public fiber effect metadata into a bounded snapshot-local tree. */
export declare function projectFiberEffects(entries: Iterable<LoaderEntry>, maxDepth?: number, maxEntities?: number): readonly EffectEntity[];
/** Project live public service registrations without serializing service objects. */
export declare function projectServiceEntities(ctx: Context, entries: readonly LoaderEntry[]): readonly ServiceEntity[];
