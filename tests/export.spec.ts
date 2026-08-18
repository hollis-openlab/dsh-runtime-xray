import { describe, expect, it } from 'vitest'
import { serializeRedactedSnapshot } from '../src/client/export.ts'
import { normalizeSnapshot } from '../src/snapshot.ts'

function snapshot() {
  return normalizeSnapshot({
    capture: { startedAt: 1, completedAt: 2 },
    host: {
      plugins: { status: 'ready', items: [{ entryId: 'entry-raw', moduleName: '@fixture', enabled: true, phase: 'active' }], diagnostics: [] },
      services: { status: 'ready', items: [], diagnostics: [] },
      effects: { status: 'ready', items: [{ effectId: 'effect-raw', label: 'agent(session-raw)', depth: 0 }], diagnostics: [] },
    },
    session: {
      sessionId: 'session-raw', status: 'idle',
      services: { status: 'ready', items: [], diagnostics: [] },
      tools: { status: 'ready', items: [], diagnostics: [] },
      prompt: { status: 'ready', items: [], diagnostics: [] },
    },
  })
}

describe('redacted export', () => {
  it('pseudonymizes identities while preserving equality relationships', () => {
    const result = serializeRedactedSnapshot(snapshot())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.text).not.toContain('session-raw')
    expect(result.text).not.toContain('entry-raw')
    expect(result.text).not.toContain('effect-raw')
    expect(result.text).toContain('id-')
  })

  it('rejects an export over the configured byte cap', () => {
    const result = serializeRedactedSnapshot(snapshot(), 10)
    expect(result).toMatchObject({ ok: false, code: 'export-too-large', maxBytes: 10 })
  })
})
