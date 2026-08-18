import type { RuntimeXrayLocaleKey } from './locales.ts'

interface ServicePresentation {
  readonly label: string
  readonly description: string
}

const SERVICE_PRESENTATION_KEYS: Readonly<Record<string, readonly [RuntimeXrayLocaleKey, RuntimeXrayLocaleKey]>> = {
  agentDefaultModel: ['serviceDefaultModelLabel', 'serviceDefaultModelDescription'],
  agentLoop: ['serviceAgentLoopLabel', 'serviceAgentLoopDescription'],
  agentPresets: ['serviceAgentPresetsLabel', 'serviceAgentPresetsDescription'],
  agents: ['serviceAgentsLabel', 'serviceAgentsDescription'],
  apiProxy: ['serviceApiProxyLabel', 'serviceApiProxyDescription'],
  appExit: ['serviceAppExitLabel', 'serviceAppExitDescription'],
  approval: ['serviceApprovalLabel', 'serviceApprovalDescription'],
  atFile: ['serviceAtFileLabel', 'serviceAtFileDescription'],
  attachments: ['serviceAttachmentsLabel', 'serviceAttachmentsDescription'],
  clientModules: ['serviceClientModulesLabel', 'serviceClientModulesDescription'],
  cmdlineArgs: ['serviceCmdlineArgsLabel', 'serviceCmdlineArgsDescription'],
  codeRuntime: ['serviceCodeRuntimeLabel', 'serviceCodeRuntimeDescription'],
  commands: ['serviceCommandsLabel', 'serviceCommandsDescription'],
  compaction: ['serviceCompactionLabel', 'serviceCompactionDescription'],
  connection: ['serviceConnectionLabel', 'serviceConnectionDescription'],
  cordisInspect: ['serviceCordisInspectLabel', 'serviceCordisInspectDescription'],
  credentials: ['serviceCredentialsLabel', 'serviceCredentialsDescription'],
  directoryPicker: ['serviceDirectoryPickerLabel', 'serviceDirectoryPickerDescription'],
  dshHomePath: ['serviceDshHomePathLabel', 'serviceDshHomePathDescription'],
  dynamicCordisRunner: ['serviceDynamicCordisRunnerLabel', 'serviceDynamicCordisRunnerDescription'],
  fs: ['serviceFsLabel', 'serviceFsDescription'],
  goals: ['serviceGoalsLabel', 'serviceGoalsDescription'],
  hmr: ['serviceHmrLabel', 'serviceHmrDescription'],
  jobs: ['serviceJobsLabel', 'serviceJobsDescription'],
  launchEnvironment: ['serviceLaunchEnvironmentLabel', 'serviceLaunchEnvironmentDescription'],
  llm: ['serviceLlmLabel', 'serviceLlmDescription'],
  loader: ['serviceLoaderLabel', 'serviceLoaderDescription'],
  messageFeedback: ['serviceMessageFeedbackLabel', 'serviceMessageFeedbackDescription'],
  permissionPresets: ['servicePermissionPresetsLabel', 'servicePermissionPresetsDescription'],
  planMode: ['servicePlanModeLabel', 'servicePlanModeDescription'],
  pluginInventory: ['servicePluginInventoryLabel', 'servicePluginInventoryDescription'],
  sandbox: ['serviceSandboxLabel', 'serviceSandboxDescription'],
  sandboxPolicy: ['serviceSandboxPolicyLabel', 'serviceSandboxPolicyDescription'],
  sessionPersistence: ['serviceSessionPersistenceLabel', 'serviceSessionPersistenceDescription'],
  sessionProjectionCache: ['serviceSessionProjectionCacheLabel', 'serviceSessionProjectionCacheDescription'],
  sessionProjections: ['serviceSessionProjectionsLabel', 'serviceSessionProjectionsDescription'],
  sessionQuery: ['serviceSessionQueryLabel', 'serviceSessionQueryDescription'],
  sessionTelemetry: ['serviceSessionTelemetryLabel', 'serviceSessionTelemetryDescription'],
  sessionTitle: ['serviceSessionTitleLabel', 'serviceSessionTitleDescription'],
  sessions: ['serviceSessionsLabel', 'serviceSessionsDescription'],
  settings: ['serviceSettingsLabel', 'serviceSettingsDescription'],
  shell: ['serviceShellLabel', 'serviceShellDescription'],
  shellEnv: ['serviceShellEnvLabel', 'serviceShellEnvDescription'],
  skills: ['serviceSkillsLabel', 'serviceSkillsDescription'],
  spillStore: ['serviceSpillStoreLabel', 'serviceSpillStoreDescription'],
  storage: ['serviceStorageLabel', 'serviceStorageDescription'],
  'storage.backend.json': ['serviceJsonStorageLabel', 'serviceJsonStorageDescription'],
  storageDomain: ['serviceStorageDomainLabel', 'serviceStorageDomainDescription'],
  subagents: ['serviceSubagentsLabel', 'serviceSubagentsDescription'],
  subprocess: ['serviceSubprocessLabel', 'serviceSubprocessDescription'],
  systemPrompt: ['serviceSystemPromptLabel', 'serviceSystemPromptDescription'],
  timer: ['serviceTimerLabel', 'serviceTimerDescription'],
  tokenMeter: ['serviceTokenMeterLabel', 'serviceTokenMeterDescription'],
  toolResultPruner: ['serviceToolResultPrunerLabel', 'serviceToolResultPrunerDescription'],
  tools: ['serviceToolsLabel', 'serviceToolsDescription'],
  typert: ['serviceTypertLabel', 'serviceTypertDescription'],
  typertGateway: ['serviceTypertGatewayLabel', 'serviceTypertGatewayDescription'],
  userQuestions: ['serviceUserQuestionsLabel', 'serviceUserQuestionsDescription'],
  web: ['serviceWebLabel', 'serviceWebDescription'],
  webRuntime: ['serviceWebRuntimeLabel', 'serviceWebRuntimeDescription'],
  webServer: ['serviceWebServerLabel', 'serviceWebServerDescription'],
  webStartup: ['serviceWebStartupLabel', 'serviceWebStartupDescription'],
  workflowEngine: ['serviceWorkflowEngineLabel', 'serviceWorkflowEngineDescription'],
  workspaceRegistry: ['serviceWorkspaceRegistryLabel', 'serviceWorkspaceRegistryDescription'],
}

/** Resolve a service key into the localized label and hover description used by the UI. */
export function presentService(name: string, t: (key: RuntimeXrayLocaleKey) => string): ServicePresentation {
  const keys = SERVICE_PRESENTATION_KEYS[name]
  return keys === undefined
    ? { label: t('internalServiceLabel'), description: t('internalServiceDescription') }
    : { label: t(keys[0]), description: t(keys[1]) }
}
