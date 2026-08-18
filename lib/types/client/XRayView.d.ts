import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { RuntimeSnapshot } from '../snapshot.ts';
import type { RuntimeXrayLocaleKey } from './locales.ts';
interface XRayViewProps extends ConvViewProps {
    readonly loadSnapshot: (sessionId?: string, signal?: AbortSignal) => Promise<RuntimeSnapshot>;
    readonly t: (key: RuntimeXrayLocaleKey) => string;
    readonly clientGeneration: string;
}
/** Read-only X-Ray view over one detached Host/session snapshot. */
export declare function XRayView({ clientGeneration, loadSnapshot, sessionId, t }: XRayViewProps): import("react").JSX.Element;
export {};
