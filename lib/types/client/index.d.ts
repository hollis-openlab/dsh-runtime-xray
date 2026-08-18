/** Browser half of dsh-runtime-xray. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type RuntimeXrayLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Runtime X-Ray localized copy. */
        runtimeXray: RuntimeXrayLocaleKey;
    }
}
export declare const name = "dsh-runtime-xray";
export declare const inject: string[];
/** Changes when the browser half is evaluated again, including an HMR reload. */
export declare const clientGeneration: string;
/** Register the peer Conversation view and mount its read-only Host adapter. */
export declare function apply(ctx: ClientContext): void;
