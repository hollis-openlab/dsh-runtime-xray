import { describe, expect, it } from 'vitest'
import { mountRuntimeRemote } from '../src/client/remote-mount.ts'

describe('Client Remote lifecycle', () => {
  it('registers the dynamic namespace disposer on the owning effect', async () => {
    let disposed = 0
    let execute: (() => Promise<() => Promise<void>>) | undefined
    const ctx = {
      remote: { $mount: async () => async () => { disposed += 1 } },
      effect: (callback: () => Promise<() => Promise<void>>) => { execute = callback },
    }

    const mounted = await mountRuntimeRemote(ctx)
    expect(disposed).toBe(0)
    expect(execute).toBeDefined()
    const disposer = await execute!()
    await disposer()
    expect(disposed).toBe(1)
    await mounted()
    expect(disposed).toBe(2)
  })

  it('keeps repeated mount/dispose cycles bounded', async () => {
    let mountedCount = 0
    let disposedCount = 0
    const ctx = {
      remote: { $mount: async () => { mountedCount += 1; return async () => { disposedCount += 1 } } },
      effect: async (callback: () => Promise<() => Promise<void>>) => { await callback() },
    }

    for (let index = 0; index < 100; index += 1) {
      const dispose = await mountRuntimeRemote(ctx)
      await dispose()
    }
    expect(mountedCount).toBe(100)
    expect(disposedCount).toBe(100)
  })
})
