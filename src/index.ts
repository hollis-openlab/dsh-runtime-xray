/** Host package entry and read-only runtime snapshot Remote. */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { createHash } from 'node:crypto'
import { assembleContextFor, type Agent } from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'
import {
  normalizeSnapshot,
  type RuntimeSnapshot,
  type SessionSnapshotInput,
  type SkillEntity,
  type SnapshotDomainInput,
  type SnapshotRequest,
} from './snapshot.ts'
import { inferServiceRelationships, projectFiberEffects, projectLoaderEntries, projectServiceEntities, type LoaderEntry } from './host-projection.ts'

export * from './snapshot.ts'
export * from './remote.ts'

interface RuntimeHostContext extends Context {
  readonly loader: { entries(): Iterable<LoaderEntry> }
}

interface PromptCollection {
  readonly domain: SessionSnapshotInput['prompt']
  readonly toolCount: number
  readonly toolSchemaBytes: number
  readonly runtimeContextSuppressed: boolean
}

/** Public preset projection used when the optional preset registry is composed. */
interface AgentPresetRuntime {
  composedPreset(agentContext: Context): string | undefined
}

interface SkillRuntime {
  snapshot(options: { readonly scope?: object; readonly cwd?: string; readonly signal?: AbortSignal }): Promise<{
    readonly complete: boolean
    readonly skills: readonly {
      readonly name: string
      readonly description: string
      readonly provider: string
      readonly source: string
      readonly invocation: { readonly modelInvocable: boolean; readonly userInvocable: boolean }
    }[]
  }>
}

interface SkillCollection {
  readonly domain: SnapshotDomainInput<SkillEntity>
  readonly complete: boolean
}

/** Bounded collection settings validated by the Cordis Loader. */
export interface RuntimeXrayConfig {
  readonly maxEntitiesPerDomain: number
  readonly maxRelationships: number
  readonly maxEffectDepth: number
  readonly deadlineMs: number
}

const DEFAULT_CONFIG: RuntimeXrayConfig = {
  maxEntitiesPerDomain: 2_000,
  maxRelationships: 4_000,
  maxEffectDepth: 32,
  deadlineMs: 750,
}
export { inferServiceRelationships, projectFiberEffects, projectLoaderEntries, projectServiceEntities } from './host-projection.ts'

/** Read-only Host gateway for the first runtime X-Ray vertical slice. */
export class RuntimeXrayGateway extends TypertRemoteService {
  static inject = ['loader', 'agents']
  static Config: z<RuntimeXrayConfig> = z.object({
    maxEntitiesPerDomain: z.number().step(1).min(1).default(DEFAULT_CONFIG.maxEntitiesPerDomain),
    maxRelationships: z.number().step(1).min(1).default(DEFAULT_CONFIG.maxRelationships),
    maxEffectDepth: z.number().step(1).min(0).default(DEFAULT_CONFIG.maxEffectDepth),
    deadlineMs: z.number().step(1).min(1).default(DEFAULT_CONFIG.deadlineMs),
  })

  private readonly config: RuntimeXrayConfig

  constructor(ctx: Context, config: Partial<RuntimeXrayConfig> = {}) {
    super(ctx, 'runtimeXray')
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    }
  }

  /**
   * Capture a bounded, detached snapshot of the current Loader inventory.
   * Unsupported domains are explicit so the Client never mistakes absence
   * for an empty runtime.
   *
   * @param request - optional session identity and requested domain list.
   * @returns normalized immutable runtime snapshot.
   */
  @Remote('snapshot')
  async snapshot(request?: SnapshotRequest, signal?: AbortSignal): Promise<RuntimeSnapshot> {
    if (signal?.aborted) throw signal.reason instanceof Error ? signal.reason : new Error('runtime snapshot aborted')
    const startedAt = Date.now()
    const deadlineAt = startedAt + this.config.deadlineMs
    const host = this.ctx as unknown as RuntimeHostContext
    const loaderEntries = [...host.loader.entries()]
    const selected = new Set(request?.domains ?? ['plugins', 'services', 'effects', 'skills', 'tools', 'prompt'])
    const bounded = <T>(items: readonly T[], domain: string) => items.length > this.config.maxEntitiesPerDomain
      ? {
        status: 'truncated' as const,
        items: items.slice(0, this.config.maxEntitiesPerDomain),
        diagnostics: [{ code: `${domain}-truncated`, message: `The ${domain} domain exceeded the configured entity limit.`, severity: 'warning' as const }],
      }
      : { status: 'ready' as const, items, diagnostics: [] as const }
    const notRequested = (domain: string) => ({
      status: 'unsupported' as const,
      items: [],
      diagnostics: [{ code: `${domain}-not-requested`, message: `The ${domain} domain was not requested for this capture.`, severity: 'info' as const }],
    })
    const collect = <T>(domain: string, read: () => readonly T[]) => {
      if (Date.now() > deadlineAt) return timedOutDomain<T>(domain)
      try {
        return bounded(read(), domain)
      } catch (error) {
        return {
          status: 'failed' as const,
          items: [] as readonly T[],
          diagnostics: [{ code: `${domain}-collection-failed`, message: safeErrorMessage(error), severity: 'error' as const }],
        }
      }
    }
    const plugins = selected.has('plugins') ? collect('plugins', () => projectLoaderEntries(loaderEntries, name => host.get(name) !== undefined)) : notRequested('plugins')
    const effects = selected.has('effects')
      ? collect('effects', () => projectFiberEffects(loaderEntries, this.config.maxEffectDepth, this.config.maxEntitiesPerDomain))
      : notRequested('effects')
    const services = selected.has('services') ? collect('services', () => projectServiceEntities(this.ctx, loaderEntries)) : notRequested('services')
    const relationships = [
      ...services.items.flatMap(service => service.attribution?.sourceId === undefined ? [] : [{
        relationshipId: `${service.attribution.sourceId}->${service.name}`,
        kind: 'provides' as const,
        fromId: service.attribution.sourceId,
        toId: service.name,
        attribution: service.attribution,
      }]),
      ...inferServiceRelationships(effects.items, services.items),
      ...effects.items.flatMap(effect => effect.parentId === undefined ? [] : [{
        relationshipId: `${effect.parentId}->${effect.effectId}`,
        kind: 'parent' as const,
        fromId: effect.parentId,
        toId: effect.effectId,
      }]),
    ].slice(0, this.config.maxRelationships)
    const session = request?.sessionId === undefined
      ? undefined
      : limitSessionSnapshot(await collectSessionSnapshotBounded(host, request.sessionId, selected, deadlineAt, signal), this.config.maxEntitiesPerDomain)
    if (signal?.aborted) throw signal.reason instanceof Error ? signal.reason : new Error('runtime snapshot aborted')
    const completedAt = Date.now()
    const diagnostics = completedAt - startedAt > this.config.deadlineMs
      ? [{ code: 'snapshot-deadline-exceeded', message: `Capture exceeded the configured ${this.config.deadlineMs} ms deadline.`, severity: 'warning' as const }]
      : []
    return normalizeSnapshot({
      capture: { startedAt, completedAt, generation: request?.domains?.join(',') },
      host: {
        plugins,
        services,
        effects,
      },
      ...(session === undefined ? {} : { session }),
      requestedSessionId: request?.sessionId,
      capabilities: {
        loaderEntries: selected.has('plugins'),
        serviceOwners: services.items.some(service => service.attribution?.quality === 'exact'),
        toolOwners: false,
        promptOwners: false,
        fiberEffects: selected.has('effects'),
      },
      relationships,
      diagnostics,
    })
  }
}

/** Hash prompt metadata without returning prompt or context content. */
function contentHash(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/** Bound thrown diagnostics without serializing arbitrary runtime values. */
function safeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'The runtime collector threw a non-Error value.'
  const message = raw.replace(/(api[-_ ]?key|token|secret|password|authorization|bearer)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
  return message.length > 240 ? `${message.slice(0, 237)}…` : message
}

/** Collect the effective public tool and prompt projections for one live Agent. */
async function collectSessionSnapshot(
  host: RuntimeHostContext,
  sessionId: string,
  selected: ReadonlySet<string>,
  signal?: AbortSignal,
): Promise<SessionSnapshotInput> {
  if (signal?.aborted) throw new Error('runtime snapshot aborted')
  const agent = host.agents.get(sessionId as SessionId)
  if (agent === undefined) {
    const unavailable = (code: string) => ({
      status: 'unsupported' as const,
      items: [],
      diagnostics: [{ code, message: 'The session has no live Agent scope in this Host process.', severity: 'info' as const }],
    })
    return {
      sessionId,
      status: 'cold',
      services: unavailable('session-cold-services'),
      skills: selected.has('skills') ? unavailable('session-cold-skills') : unavailable('skills-not-requested'),
      skillCatalogComplete: false,
      tools: selected.has('tools') ? unavailable('session-cold-tools') : unavailable('tools-not-requested'),
      prompt: selected.has('prompt') ? unavailable('session-cold-prompt') : unavailable('prompt-not-requested'),
      promptToolCount: 0,
      promptToolSchemaBytes: 0,
      runtimeContextSuppressed: false,
    }
  }

  const toolsRuntime = host.get('tools') as { schemas(scope: Agent): readonly { name: string; parameters: unknown }[] } | undefined
  const services = (() => {
    try {
      return {
        status: 'ready' as const,
        items: projectServiceEntities(agent.ctx, []),
        diagnostics: [{
          code: 'session-realm-not-exposed',
          message: 'The public service projection exposes visible names, but not registration scopes or isolated realm identities.',
          severity: 'info' as const,
        }],
      }
    } catch (error) {
      return {
        status: 'failed' as const,
        items: [] as readonly ReturnType<typeof projectServiceEntities>[number][],
        diagnostics: [{ code: 'session-services-collection-failed', message: safeErrorMessage(error), severity: 'error' as const }],
      }
    }
  })()
  const tools = selected.has('tools')
    ? toolsRuntime === undefined
      ? {
        status: 'unsupported' as const,
        items: [],
        diagnostics: [{ code: 'tools-service-unavailable', message: 'The ToolRuntime service is not available in this composition.', severity: 'info' as const }],
      }
      : (() => {
        try {
          return {
            status: 'ready' as const,
            items: toolsRuntime.schemas(agent).map(schema => ({
              name: schema.name,
              schemaBytes: Buffer.byteLength(JSON.stringify(schema.parameters) ?? '', 'utf8'),
              attribution: {
                quality: 'unavailable' as const,
                code: 'tool-owner-not-exposed',
                explanation: 'The effective ToolRuntime schema is public, but its registration owner is not exposed by this DSH version.',
              },
            })),
            diagnostics: [],
          }
        } catch (error) {
          return { status: 'failed' as const, items: [], diagnostics: [{ code: 'tools-collection-failed', message: safeErrorMessage(error), severity: 'error' as const }] }
        }
      })()
    : {
      status: 'unsupported' as const,
      items: [],
      diagnostics: [{ code: 'tools-not-requested', message: 'The tools domain was not requested for this capture.', severity: 'info' as const }],
    }

  const promptCollection = selected.has('prompt')
    ? await promptDomainSafely(host, agent, signal)
    : {
      domain: {
        status: 'unsupported' as const,
        items: [],
        diagnostics: [{ code: 'prompt-not-requested', message: 'The prompt domain was not requested for this capture.', severity: 'info' as const }],
      },
      toolCount: 0,
      toolSchemaBytes: 0,
      runtimeContextSuppressed: false,
    }
  const skillCollection = selected.has('skills')
    ? await skillDomainSafely(host, agent, signal)
    : {
      domain: {
        status: 'unsupported' as const,
        items: [],
        diagnostics: [{ code: 'skills-not-requested', message: 'The skills domain was not requested for this capture.', severity: 'info' as const }],
      },
      complete: false,
    }

  const presetRuntime = host.get('agentPresets') as AgentPresetRuntime | undefined
  let preset: string | undefined
  try {
    preset = presetRuntime?.composedPreset(agent.ctx)
  } catch {
    // A preset registry is optional; a concurrently disposed scope makes its identity unavailable.
  }
  return {
    sessionId,
    status: agent.status,
    ...preset === undefined ? {} : { preset },
    ...agent.options.provider === undefined ? {} : { modelProvider: agent.options.provider },
    ...agent.options.model === undefined ? {} : { model: agent.options.model },
    services,
    skills: skillCollection.domain,
    skillCatalogComplete: skillCollection.complete,
    tools,
    prompt: promptCollection.domain,
    promptToolCount: promptCollection.toolCount,
    promptToolSchemaBytes: promptCollection.toolSchemaBytes,
    runtimeContextSuppressed: promptCollection.runtimeContextSuppressed,
  }
}

/** Contain a slow session assembly at the configured total deadline. */
async function collectSessionSnapshotBounded(
  host: RuntimeHostContext,
  sessionId: string,
  selected: ReadonlySet<string>,
  deadlineAt: number,
  signal?: AbortSignal,
): Promise<SessionSnapshotInput> {
  const remaining = Math.max(0, deadlineAt - Date.now())
  if (remaining === 0) return timedOutSession(sessionId)
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<SessionSnapshotInput>(resolve => {
    timer = setTimeout(() => resolve(timedOutSession(sessionId)), remaining)
  })
  try {
    return await Promise.race([collectSessionSnapshot(host, sessionId, selected, signal), timeout])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}

/** Explicit unavailable session result used when the total deadline expires. */
function timedOutSession(sessionId: string): SessionSnapshotInput {
  const domain = (name: string) => ({
    status: 'truncated' as const,
    items: [],
    diagnostics: [{ code: `${name}-deadline-exceeded`, message: 'The session domain exceeded the snapshot deadline.', severity: 'warning' as const }],
  })
  return { sessionId, status: 'unavailable', services: domain('services'), skills: domain('skills'), skillCatalogComplete: false, tools: domain('tools'), prompt: domain('prompt') }
}

function timedOutDomain<T>(name: string): SnapshotDomainInput<T> {
  return {
    status: 'truncated',
    items: [],
    diagnostics: [{ code: `${name}-deadline-exceeded`, message: 'The domain exceeded the snapshot deadline.', severity: 'warning' }],
  }
}

/** Apply the configured entity bound to effective session domains before normalization. */
function limitSessionSnapshot(input: SessionSnapshotInput, limit: number): SessionSnapshotInput {
  return {
    ...input,
    services: limitDomain(input.services, limit, 'session-services'),
    ...input.skills === undefined ? {} : { skills: limitDomain(input.skills, limit, 'skills') },
    tools: limitDomain(input.tools, limit, 'tools'),
    prompt: limitDomain(input.prompt, limit, 'prompt'),
  }
}

function limitDomain<T>(input: SnapshotDomainInput<T>, limit: number, name: string): SnapshotDomainInput<T> {
  if (input.items.length <= limit) return input
  return {
    ...input,
    status: 'truncated',
    items: input.items.slice(0, limit),
    diagnostics: [...input.diagnostics, { code: `${name}-truncated`, message: `The ${name} domain exceeded the configured entity limit.`, severity: 'warning' }],
  }
}

/** Collect the invocation-neutral Skill catalog visible from one Agent scope. */
async function skillDomainSafely(host: RuntimeHostContext, agent: Agent, signal?: AbortSignal): Promise<SkillCollection> {
  const runtime = host.get('skills') as SkillRuntime | undefined
  if (runtime === undefined) {
    return {
      domain: { status: 'unsupported', items: [], diagnostics: [{ code: 'skills-service-unavailable', message: 'The Skill registry is not available in this composition.', severity: 'info' }] },
      complete: false,
    }
  }
  try {
    const snapshot = await runtime.snapshot({ scope: agent, cwd: agent.session.header.cwd, ...signal === undefined ? {} : { signal } })
    return {
      domain: {
        status: snapshot.complete ? 'ready' : 'partial',
        items: snapshot.skills.map(skill => ({
          name: skill.name,
          description: skill.description.length > 400 ? `${skill.description.slice(0, 397)}…` : skill.description,
          provider: skill.provider,
          source: skill.source,
          modelInvocable: skill.invocation.modelInvocable,
          userInvocable: skill.invocation.userInvocable,
        })),
        diagnostics: snapshot.complete ? [] : [{ code: 'skill-catalog-incomplete', message: 'One or more Skill providers did not complete a stable catalog observation.', severity: 'warning' }],
      },
      complete: snapshot.complete,
    }
  } catch (error) {
    return {
      domain: { status: 'failed', items: [], diagnostics: [{ code: 'skills-collection-failed', message: safeErrorMessage(error), severity: 'error' }] },
      complete: false,
    }
  }
}

/** Contain prompt assembly failures to the Prompt domain. */
async function promptDomainSafely(host: RuntimeHostContext, agent: Agent, signal?: AbortSignal): Promise<PromptCollection> {
  try {
    return await promptDomain(host, agent, signal)
  } catch (error) {
    return {
      domain: { status: 'failed', items: [], diagnostics: [{ code: 'prompt-collection-failed', message: safeErrorMessage(error), severity: 'error' }] },
      toolCount: 0,
      toolSchemaBytes: 0,
      runtimeContextSuppressed: false,
    }
  }
}

/** Assemble prompt metadata through the owning SystemPrompt interface. */
async function promptDomain(host: RuntimeHostContext, agent: Agent, signal?: AbortSignal): Promise<PromptCollection> {
  const systemPrompt = host.get('systemPrompt') as { assemble(context: ReturnType<typeof assembleContextFor>): Promise<{
    sections: readonly { name: string; text: string }[]
    contexts: readonly { name: string; text: string }[]
    tools: readonly { parameters: unknown }[]
    variables: Record<string, string | undefined>
  }> } | undefined
  if (systemPrompt === undefined) {
    return {
      domain: { status: 'unsupported', items: [], diagnostics: [{ code: 'prompt-service-unavailable', message: 'The SystemPrompt service is not available in this composition.', severity: 'info' }] },
      toolCount: 0,
      toolSchemaBytes: 0,
      runtimeContextSuppressed: false,
    }
  }
  const assembly = await systemPrompt.assemble(assembleContextFor(agent, signal))
  const items = [
    ...assembly.sections.map((section, position) => ({
      name: `section:${section.name}`,
      position,
      bytes: Buffer.byteLength(section.text, 'utf8'),
      contentHash: contentHash(section.text),
      attribution: { quality: 'unavailable' as const, code: 'prompt-owner-not-exposed', explanation: 'Prompt section ownership is not exposed by the public assembly result.' },
    })),
    ...assembly.contexts.map((context, index) => ({
      name: `context:${context.name}`,
      position: assembly.sections.length + index,
      bytes: Buffer.byteLength(context.text, 'utf8'),
      contentHash: contentHash(context.text),
      attribution: { quality: 'unavailable' as const, code: 'context-owner-not-exposed', explanation: 'Runtime-context ownership is not exposed by the public assembly result.' },
    })),
    ...Object.keys(assembly.variables).sort().map((name, index) => ({
      name: `variable:${name}`,
      position: assembly.sections.length + assembly.contexts.length + index,
      bytes: 0,
      contentHash: contentHash(name),
      attribution: { quality: 'unavailable' as const, code: 'variable-value-redacted', explanation: 'Variable values are intentionally never returned.' },
    })),
  ]
  return {
    domain: {
      status: 'ready',
      items,
      diagnostics: [{
        code: 'prompt-complete-section-not-exposed',
        message: 'The public PromptAssembly exposes the final ordered sections but not which one was declared complete.',
        severity: 'info',
      }],
    },
    toolCount: assembly.tools.length,
    toolSchemaBytes: assembly.tools.reduce((total, tool) => total + Buffer.byteLength(JSON.stringify(tool.parameters) ?? '', 'utf8'), 0),
    runtimeContextSuppressed: assembly.contexts.length === 0,
  }
}

export default RuntimeXrayGateway
