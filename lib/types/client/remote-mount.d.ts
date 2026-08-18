import { TYPERT_REMOTE } from '../remote.ts';
interface RemoteMountContext {
    readonly remote: {
        $mount(contribution: typeof TYPERT_REMOTE): Promise<() => Promise<void>>;
    };
    effect(execute: () => Promise<() => Promise<void>>, label: string): unknown;
}
/** Mount the X-Ray namespace and attach its disposer to the owning Client fiber. */
export declare function mountRuntimeRemote(ctx: RemoteMountContext): Promise<() => Promise<void>>;
export {};
