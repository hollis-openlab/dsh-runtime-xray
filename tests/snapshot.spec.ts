import { describe, expect, it } from 'vitest'
import { normalizeSnapshot, SNAPSHOT_SCHEMA_VERSION, type SnapshotInput } from '../src/snapshot.ts'

describe('normalizeSnapshot', () => {
  it('returns a stable immutable snapshot with sorted entities and diagnostics', () => {
    const input: SnapshotInput = {
      capture: { startedAt: 20, completedAt: 21, generation: 'g-1' },
      host: {
        plugins: {
          status: 'ready',
          items: [
            { entryId: 'plugin-z', moduleName: '@example/z', enabled: true, phase: 'active' },
            { entryId: 'plugin-a', moduleName: '@example/a', enabled: false, phase: null },
          ],
          diagnostics: [{ code: 'ZED', message: 'later' }, { code: 'AAA', message: 'first' }],
        },
        services: {
          status: 'ready',
          items: [
            { name: 'zeta', status: 'available' },
            { name: 'alpha', status: 'available' },
          ],
          diagnostics: [],
        },
        effects: { status: 'unsupported', items: [], diagnostics: [] },
      },
      session: {
        sessionId: 'session-1',
        status: 'running',
        preset: 'standard',
        modelProvider: 'volcengine',
        model: 'deepseek-v4-flash',
        services: { status: 'ready', items: [], diagnostics: [] },
        skillCatalogComplete: true,
        skills: {
          status: 'ready',
          items: [{ name: 'diagnose-runtime', description: 'Inspect runtime state.', provider: 'fixture', source: 'runtime', modelInvocable: true, userInvocable: true }],
          diagnostics: [],
        },
        tools: {
          status: 'ready',
          items: [
            { name: 'z_tool', schemaBytes: 20, attribution: { quality: 'unavailable', code: 'NO_OWNER' } },
            { name: 'a_tool', schemaBytes: 10, attribution: { quality: 'exact', code: 'OWNER_ENTRY' } },
          ],
          diagnostics: [],
        },
        prompt: {
          status: 'partial',
          items: [{ name: 'runtime', position: 1, bytes: 12, contentHash: 'h1' }],
          diagnostics: [{ code: 'PROMPT_PARTIAL', message: 'context unavailable' }],
        },
      },
    }

    const snapshot = normalizeSnapshot(input)

    expect(snapshot.schemaVersion).toBe(SNAPSHOT_SCHEMA_VERSION)
    expect(snapshot.health).toBe('partial')
    expect(snapshot.host.plugins.items.map(item => item.entryId)).toEqual(['plugin-a', 'plugin-z'])
    expect(snapshot.host.services.items.map(item => item.name)).toEqual(['alpha', 'zeta'])
    expect(snapshot.session?.tools.items.map(item => item.name)).toEqual(['a_tool', 'z_tool'])
    expect(snapshot.session?.preset).toBe('standard')
    expect(snapshot.session?.model).toBe('deepseek-v4-flash')
    expect(snapshot.session?.skills?.items[0]?.name).toBe('diagnose-runtime')
    expect(snapshot.session?.skillCatalogComplete).toBe(true)
    expect(snapshot.host.plugins.diagnostics.map(item => item.code)).toEqual(['AAA', 'ZED'])
    expect(snapshot.redaction.policy).toBe('allowlist')
    expect(snapshot.redaction.excluded).toContain('credentials')
    expect(snapshot.capabilities.loaderEntries).toBe(true)
    expect(snapshot.relationships).toEqual([])
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.host.plugins.items)).toBe(true)
  })

  it('drops undeclared runtime values instead of copying them into the snapshot', () => {
    const input = {
      capture: { startedAt: 1, completedAt: 2 },
      host: {
        plugins: { status: 'ready', items: [], diagnostics: [] },
        services: { status: 'ready', items: [], diagnostics: [] },
        effects: { status: 'ready', items: [], diagnostics: [] },
        credentialValue: 'must-not-cross-the-seam',
      },
    } as unknown as SnapshotInput

    const snapshot = normalizeSnapshot(input)

    expect(JSON.stringify(snapshot)).not.toContain('must-not-cross-the-seam')
  })

  it('marks failed domains as failed health while informational diagnostics remain non-blocking', () => {
    const snapshot = normalizeSnapshot({
      capture: { startedAt: 1, completedAt: 2 },
      host: {
        plugins: { status: 'failed', items: [], diagnostics: [{ code: 'LOAD', message: 'failed', severity: 'error' }] },
        services: { status: 'ready', items: [], diagnostics: [] },
        effects: { status: 'ready', items: [], diagnostics: [] },
      },
      diagnostics: [{ code: 'INFO', message: 'observed', severity: 'info' }],
    })

    expect(snapshot.health).toBe('failed')
  })
})
