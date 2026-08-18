import type { RuntimeSnapshot } from '../snapshot.ts'

/** Result of serializing the already-detached snapshot for download. */
export type RedactedExportResult =
  | { readonly ok: true; readonly text: string; readonly bytes: number }
  | { readonly ok: false; readonly code: 'export-too-large'; readonly bytes: number; readonly maxBytes: number }

/** Serialize a snapshot with stable per-export opaque identities and a byte cap. */
export function serializeRedactedSnapshot(snapshot: RuntimeSnapshot, maxBytes = 1_048_576): RedactedExportResult {
  const aliases = new Map<string, string>()
  const alias = (value: string): string => {
    const existing = aliases.get(value)
    if (existing !== undefined) return existing
    const next = `id-${aliases.size + 1}`
    aliases.set(value, next)
    return next
  }
  collectIdentities(snapshot, undefined, alias)
  const embeddedIdentities = [...aliases.entries()].sort((left, right) => right[0].length - left[0].length)
  const replaceEmbeddedIdentity = (value: string): string => embeddedIdentities.reduce(
    (result, [raw, pseudonym]) => result.split(raw).join(pseudonym),
    value,
  )
  const text = JSON.stringify(snapshot, (key, value: unknown) => {
    if (typeof value === 'string') {
      if (key === 'sessionId' || key === 'sourceId' || key.endsWith('Id')) return alias(value)
      return replaceEmbeddedIdentity(value)
    }
    return value
  }, 2)
  const bytes = new TextEncoder().encode(text).byteLength
  return bytes > maxBytes ? { ok: false, code: 'export-too-large', bytes, maxBytes } : { ok: true, text, bytes }
}

/** Collect structured identities before serializing so labels cannot leak them. */
function collectIdentities(value: unknown, key: string | undefined, alias: (value: string) => string): void {
  if (typeof value === 'string') {
    if (key === 'sessionId' || key === 'sourceId' || key?.endsWith('Id')) alias(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectIdentities(item, undefined, alias)
    return
  }
  if (value === null || typeof value !== 'object') return
  for (const [childKey, child] of Object.entries(value)) collectIdentities(child, childKey, alias)
}
