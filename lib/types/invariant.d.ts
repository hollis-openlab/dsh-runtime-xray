/** Package-owned invariant companion. */
/** Cordis companion plugin name. */
export declare const name = "dsh-runtime-xray-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** The first read-only slice has no runtime invariant beyond its contract tests. */
export declare function apply(ctx: {
    readonly invariants: {
        register(packageName: string, install: () => void): () => void;
    };
}): Promise<() => void>;
