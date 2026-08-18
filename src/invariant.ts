/** Package-owned invariant companion. */

/** Cordis companion plugin name. */
export const name = 'dsh-runtime-xray-invariant'

/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** The first read-only slice has no runtime invariant beyond its contract tests. */
export function apply(ctx: {
  readonly invariants: {
    register(packageName: string, install: () => void): () => void
  }
}): Promise<() => void> {
  return Promise.resolve(ctx.invariants.register('@deepseek-ai/dsh-runtime-xray', () => {}))
}
