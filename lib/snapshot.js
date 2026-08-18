// src/snapshot.ts
var SNAPSHOT_SCHEMA_VERSION = 1;
function normalizeSnapshot(input) {
  const host = {
    plugins: normalizeDomain(input.host.plugins, (item) => ({
      entryId: item.entryId,
      moduleName: item.moduleName,
      enabled: item.enabled,
      phase: item.phase,
      ...item.requiredServices === void 0 ? {} : { requiredServices: [...item.requiredServices].sort(compareText) },
      ...item.missingServices === void 0 ? {} : { missingServices: [...item.missingServices].sort(compareText) },
      ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
    }), comparePlugin),
    services: normalizeDomain(input.host.services, (item) => ({
      name: item.name,
      status: item.status,
      ...item.scopeId === void 0 ? {} : { scopeId: item.scopeId },
      ...item.realmId === void 0 ? {} : { realmId: item.realmId },
      ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
    }), compareService),
    effects: normalizeDomain(input.host.effects, (item) => ({
      effectId: item.effectId,
      label: item.label,
      ...item.parentId === void 0 ? {} : { parentId: item.parentId },
      depth: item.depth,
      ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
    }), compareEffect)
  };
  const session = input.session === void 0 ? void 0 : {
    sessionId: input.session.sessionId,
    status: input.session.status,
    ...input.session.preset === void 0 ? {} : { preset: input.session.preset },
    ...input.session.modelProvider === void 0 ? {} : { modelProvider: input.session.modelProvider },
    ...input.session.model === void 0 ? {} : { model: input.session.model },
    ...input.session.promptToolCount === void 0 ? {} : { promptToolCount: input.session.promptToolCount },
    ...input.session.promptToolSchemaBytes === void 0 ? {} : { promptToolSchemaBytes: input.session.promptToolSchemaBytes },
    ...input.session.runtimeContextSuppressed === void 0 ? {} : { runtimeContextSuppressed: input.session.runtimeContextSuppressed },
    tools: normalizeDomain(input.session.tools, (item) => ({
      name: item.name,
      schemaBytes: item.schemaBytes,
      ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
    }), compareTool),
    services: normalizeDomain(input.session.services, (item) => ({
      name: item.name,
      status: item.status,
      ...item.scopeId === void 0 ? {} : { scopeId: item.scopeId },
      ...item.realmId === void 0 ? {} : { realmId: item.realmId },
      ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
    }), compareService),
    prompt: normalizeDomain(input.session.prompt, (item) => ({
      name: item.name,
      position: item.position,
      bytes: item.bytes,
      contentHash: item.contentHash,
      ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
    }), comparePrompt)
  };
  const diagnostics = normalizeDiagnostics(input.diagnostics ?? []);
  const statuses = [
    host.plugins.status,
    host.services.status,
    host.effects.status,
    ...session === void 0 ? [] : [session.tools.status, session.prompt.status]
  ];
  const domainDiagnostics = [
    ...host.plugins.diagnostics,
    ...host.services.diagnostics,
    ...host.effects.diagnostics,
    ...session === void 0 ? [] : [...session.tools.diagnostics, ...session.prompt.diagnostics]
  ];
  const hasFailure = statuses.some((status) => status === "failed") || domainDiagnostics.some((item) => item.severity === "error");
  const hasBlockingDiagnostic = diagnostics.some((item) => item.severity !== "info") || domainDiagnostics.some((item) => item.severity !== "info");
  const health = hasFailure ? "failed" : statuses.every((status) => status === "ready") && !hasBlockingDiagnostic ? "healthy" : "partial";
  const relationships = [...input.relationships ?? []].map((item) => ({
    relationshipId: item.relationshipId,
    kind: item.kind,
    fromId: item.fromId,
    toId: item.toId,
    ...item.attribution === void 0 ? {} : { attribution: normalizeAttribution(item.attribution) }
  })).sort((left, right) => compareText(left.relationshipId, right.relationshipId) || compareText(left.fromId, right.fromId) || compareText(left.toId, right.toId));
  return deepFreeze({
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    health,
    capture: {
      startedAt: input.capture.startedAt,
      completedAt: input.capture.completedAt,
      ...input.capture.generation === void 0 ? {} : { generation: input.capture.generation }
    },
    host,
    ...session === void 0 ? {} : { session },
    diagnostics,
    ...input.requestedSessionId === void 0 ? {} : { requestedSessionId: input.requestedSessionId },
    compatibility: {
      ...input.compatibility?.harnessVersion === void 0 ? {} : { harnessVersion: input.compatibility.harnessVersion },
      ...input.compatibility?.verifiedRevision === void 0 ? {} : { verifiedRevision: input.compatibility.verifiedRevision }
    },
    redaction: {
      policy: "allowlist",
      excluded: [...input.redaction?.excluded ?? [
        "credentials",
        "environment-values",
        "prompt-content",
        "runtime-context-content",
        "variable-values",
        "approval-payloads",
        "tool-results"
      ]].sort(compareText)
    },
    capabilities: {
      loaderEntries: input.capabilities?.loaderEntries ?? true,
      serviceOwners: input.capabilities?.serviceOwners ?? false,
      toolOwners: input.capabilities?.toolOwners ?? false,
      promptOwners: input.capabilities?.promptOwners ?? false,
      fiberEffects: input.capabilities?.fiberEffects ?? true
    },
    relationships
  });
}
function normalizeDomain(input, map, compare) {
  return {
    status: input.status,
    items: [...input.items].map(map).sort(compare),
    diagnostics: normalizeDiagnostics(input.diagnostics)
  };
}
function normalizeAttribution(input) {
  return {
    quality: input.quality,
    code: input.code,
    ...input.sourceId === void 0 ? {} : { sourceId: input.sourceId },
    ...input.explanation === void 0 ? {} : { explanation: input.explanation }
  };
}
function normalizeDiagnostics(input) {
  return [...input].map((item) => ({
    code: item.code,
    message: item.message,
    ...item.severity === void 0 ? {} : { severity: item.severity }
  })).sort((left, right) => compareText(left.code, right.code) || compareText(left.message, right.message));
}
function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
function comparePlugin(left, right) {
  return compareText(left.entryId, right.entryId);
}
function compareService(left, right) {
  return compareText(left.name, right.name) || compareText(left.attribution?.sourceId ?? "", right.attribution?.sourceId ?? "") || compareText(left.status, right.status);
}
function compareTool(left, right) {
  return compareText(left.name, right.name);
}
function comparePrompt(left, right) {
  return left.position - right.position || compareText(left.name, right.name);
}
function compareEffect(left, right) {
  return compareText(left.effectId, right.effectId);
}
function deepFreeze(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}
export {
  SNAPSHOT_SCHEMA_VERSION,
  normalizeSnapshot
};
