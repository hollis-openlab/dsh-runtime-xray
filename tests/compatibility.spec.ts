import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  engines: { node: string }
  peerDependencies: Record<string, string>
}
const compatibilityDoc = readFileSync(new URL('../docs/COMPATIBILITY.md', import.meta.url), 'utf8')

describe('declared compatibility', () => {
  it('keeps the Node and DSH capability declarations explicit', () => {
    expect(packageJson.engines.node).toBe('>=22.19.0 || >=24')
    expect(packageJson.peerDependencies['@deepseek-ai/dsh-api-remotes']).toBe('>=0.1.0-rc.7 <0.2.0')
    expect(packageJson.peerDependencies['@deepseek-ai/dsh-typert-protocol']).toBe('>=0.1.0-rc.7 <0.2.0')
    expect(compatibilityDoc).toContain('99f6f02fecdb7dff40c3fbc9470f5907c29f74ca')
  })
})
