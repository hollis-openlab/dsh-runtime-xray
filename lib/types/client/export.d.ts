import type { RuntimeSnapshot } from '../snapshot.ts';
/** Result of serializing the already-detached snapshot for download. */
export type RedactedExportResult = {
    readonly ok: true;
    readonly text: string;
    readonly bytes: number;
} | {
    readonly ok: false;
    readonly code: 'export-too-large';
    readonly bytes: number;
    readonly maxBytes: number;
};
/** Serialize a snapshot with stable per-export opaque identities and a byte cap. */
export declare function serializeRedactedSnapshot(snapshot: RuntimeSnapshot, maxBytes?: number): RedactedExportResult;
