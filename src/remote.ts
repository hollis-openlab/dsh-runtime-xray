/** Remote descriptor shared by the Host Gateway and browser Client. */

import { z, type ZodType } from 'zod'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import type { RuntimeSnapshot, SnapshotRequest } from './snapshot.ts'

const requestSchema = z.object({
  sessionId: z.string().optional(),
  domains: z.array(z.enum(['plugins', 'services', 'effects', 'tools', 'prompt'])).optional(),
}).strict()

const diagnosticSchema = z.object({
  code: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'warning', 'error']).optional(),
})
const attributionSchema = z.object({
  quality: z.enum(['exact', 'inferred', 'unavailable']),
  code: z.string(),
  sourceId: z.string().optional(),
  explanation: z.string().optional(),
})
const pluginSchema = z.object({
  entryId: z.string(), moduleName: z.string(), enabled: z.boolean(),
  phase: z.enum(['pending', 'loading', 'active', 'failed', 'unloading']).nullable(),
  requiredServices: z.array(z.string()).optional(), missingServices: z.array(z.string()).optional(),
  attribution: attributionSchema.optional(),
})
const serviceSchema = z.object({
  name: z.string(), status: z.enum(['available', 'missing', 'unknown']),
  scopeId: z.string().optional(), realmId: z.string().optional(), attribution: attributionSchema.optional(),
})
const toolSchema = z.object({ name: z.string(), schemaBytes: z.number(), attribution: attributionSchema.optional() })
const promptSchema = z.object({ name: z.string(), position: z.number(), bytes: z.number(), contentHash: z.string(), attribution: attributionSchema.optional() })
const effectSchema = z.object({ effectId: z.string(), label: z.string(), parentId: z.string().optional(), depth: z.number(), attribution: attributionSchema.optional() })
const domainSchema = (itemSchema: ZodType) => z.object({
  status: z.enum(['ready', 'partial', 'unsupported', 'failed', 'truncated']),
  items: z.array(itemSchema),
  diagnostics: z.array(diagnosticSchema),
}).strict()
const relationshipSchema = z.object({
  relationshipId: z.string(),
  kind: z.enum(['provides', 'owns', 'parent']),
  fromId: z.string(),
  toId: z.string(),
  attribution: attributionSchema.optional(),
})

/** Runtime result schema. The Host normalizer remains the privacy allowlist. */
const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  health: z.enum(['healthy', 'partial', 'failed']),
  capture: z.object({
    startedAt: z.number(),
    completedAt: z.number(),
    generation: z.string().optional(),
  }),
  host: z.object({ plugins: domainSchema(pluginSchema), services: domainSchema(serviceSchema), effects: domainSchema(effectSchema) }),
  session: z.object({
    sessionId: z.string(), status: z.enum(['running', 'idle', 'cold', 'unavailable']),
    preset: z.string().optional(), modelProvider: z.string().optional(), model: z.string().optional(),
    promptToolCount: z.number().optional(), promptToolSchemaBytes: z.number().optional(), runtimeContextSuppressed: z.boolean().optional(),
    services: domainSchema(serviceSchema), tools: domainSchema(toolSchema), prompt: domainSchema(promptSchema),
  }).optional(),
  diagnostics: z.array(diagnosticSchema),
  requestedSessionId: z.string().optional(),
  compatibility: z.object({ harnessVersion: z.string().optional(), verifiedRevision: z.string().optional() }),
  redaction: z.object({ policy: z.literal('allowlist'), excluded: z.array(z.string()) }),
  capabilities: z.object({
    loaderEntries: z.boolean(),
    serviceOwners: z.boolean(),
    toolOwners: z.boolean(),
    promptOwners: z.boolean(),
    fiberEffects: z.boolean(),
  }),
  relationships: z.array(relationshipSchema),
}).strict()

/** Runtime codecs used by contract tests and generated Typert metadata. */
export const SNAPSHOT_REQUEST_SCHEMA = requestSchema
export const SNAPSHOT_RESPONSE_SCHEMA = snapshotSchema

/** The generated-equivalent Remote contribution mounted by the Client. */
export const TYPERT_REMOTE = {
  package: '@deepseek-ai/dsh-runtime-xray',
  descriptors: [
    {
      id: '@deepseek-ai/dsh-runtime-xray#runtimeXray/snapshot',
      service: 'runtimeXray',
      namespace: 'runtimeXray',
      method: 'snapshot',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'request',
          wire: 'request',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: '@deepseek-ai/dsh-runtime-xray#SnapshotRequest', schema: requestSchema },
          acceptsUndefined: true,
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: '@deepseek-ai/dsh-runtime-xray#RuntimeSnapshot',
        schema: snapshotSchema,
      },
      cancellation: { parameter: 'signal' },
      sourceLocation: { file: 'src/index.ts', line: 84, column: 3 },
    },
  ],
} satisfies TypertRemoteContribution

export default TYPERT_REMOTE

/** Client-side mount companion for the generated Remote contribution. */
export const inject = ['remote']

/** Mount the runtime snapshot namespace before the UI plugin requests it. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  return await ctx.remote.$mount(TYPERT_REMOTE)
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespace$72756e74696d6558726179 {
    snapshot: (request?: SnapshotRequest) => Promise<RemoteResult<RuntimeSnapshot>>
  }

  interface TypertRemoteMap {
    'runtimeXray/snapshot': (request?: SnapshotRequest) => Promise<RemoteResult<RuntimeSnapshot>>
  }

  interface TypertRemoteNamespaceMap {
    runtimeXray: TypertRemoteNamespace$72756e74696d6558726179
  }
}
