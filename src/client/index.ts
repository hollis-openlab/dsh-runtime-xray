/** Browser half of dsh-runtime-xray. */

import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '../remote.ts'
import { XRayView } from './XRayView.tsx'
import { en, NS, zh, type RuntimeXrayLocaleKey } from './locales.ts'
import { STYLES } from './styles.ts'
import type { RuntimeSnapshot, SnapshotRequest } from '../snapshot.ts'
import { mountRuntimeRemote } from './remote-mount.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Runtime X-Ray localized copy. */
    runtimeXray: RuntimeXrayLocaleKey
  }
}

export const name = 'dsh-runtime-xray'
export const inject = ['slots', 'locale', 'remote']
/** Changes when the browser half is evaluated again, including an HMR reload. */
export const clientGeneration = `client-${Date.now().toString(36)}`

interface RuntimeXrayRemote {
  snapshot(request: SnapshotRequest, signal?: AbortSignal): Promise<RemoteResult<RuntimeSnapshot>>
}

/** Register the peer Conversation view and mount its read-only Host adapter. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-runtime-xray: dictionaries')
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = name
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-runtime-xray: styles')

  const t = ctx.locale.bind(NS)
  const mount = mountRuntimeRemote(ctx)
  const loadSnapshot = async (sessionId?: string, signal?: AbortSignal): Promise<RuntimeSnapshot> => {
    await mount
    const remote = ctx.get('remote.runtimeXray') as RuntimeXrayRemote | undefined
    if (remote === undefined) throw new Error('runtimeXray Remote is unavailable after mount')
    const result = await remote.snapshot(sessionId === undefined ? {} : { sessionId }, signal)
    if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
    return result.value
  }

  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'xray',
    order: 20,
    locale: NS,
    label: () => t('tab'),
    inject: () => ({ loadSnapshot, t, clientGeneration }),
  }, XRayView))
}
