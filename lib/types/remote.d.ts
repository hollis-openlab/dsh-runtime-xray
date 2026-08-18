/** Remote descriptor shared by the Host Gateway and browser Client. */
import { z } from 'zod';
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { RuntimeSnapshot, SnapshotRequest } from './snapshot.ts';
/** Runtime codecs used by contract tests and generated Typert metadata. */
export declare const SNAPSHOT_REQUEST_SCHEMA: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    domains: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        plugins: "plugins";
        services: "services";
        effects: "effects";
        tools: "tools";
        prompt: "prompt";
    }>>>;
}, z.core.$strict>;
export declare const SNAPSHOT_RESPONSE_SCHEMA: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    health: z.ZodEnum<{
        healthy: "healthy";
        partial: "partial";
        failed: "failed";
    }>;
    capture: z.ZodObject<{
        startedAt: z.ZodNumber;
        completedAt: z.ZodNumber;
        generation: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    host: z.ZodObject<{
        plugins: z.ZodObject<{
            status: z.ZodEnum<{
                partial: "partial";
                failed: "failed";
                ready: "ready";
                unsupported: "unsupported";
                truncated: "truncated";
            }>;
            items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            diagnostics: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                severity: z.ZodOptional<z.ZodEnum<{
                    info: "info";
                    warning: "warning";
                    error: "error";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
        services: z.ZodObject<{
            status: z.ZodEnum<{
                partial: "partial";
                failed: "failed";
                ready: "ready";
                unsupported: "unsupported";
                truncated: "truncated";
            }>;
            items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            diagnostics: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                severity: z.ZodOptional<z.ZodEnum<{
                    info: "info";
                    warning: "warning";
                    error: "error";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
        effects: z.ZodObject<{
            status: z.ZodEnum<{
                partial: "partial";
                failed: "failed";
                ready: "ready";
                unsupported: "unsupported";
                truncated: "truncated";
            }>;
            items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            diagnostics: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                severity: z.ZodOptional<z.ZodEnum<{
                    info: "info";
                    warning: "warning";
                    error: "error";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
    }, z.core.$strip>;
    session: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodString;
        status: z.ZodEnum<{
            unavailable: "unavailable";
            running: "running";
            idle: "idle";
            cold: "cold";
        }>;
        preset: z.ZodOptional<z.ZodString>;
        modelProvider: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        promptToolCount: z.ZodOptional<z.ZodNumber>;
        promptToolSchemaBytes: z.ZodOptional<z.ZodNumber>;
        runtimeContextSuppressed: z.ZodOptional<z.ZodBoolean>;
        services: z.ZodObject<{
            status: z.ZodEnum<{
                partial: "partial";
                failed: "failed";
                ready: "ready";
                unsupported: "unsupported";
                truncated: "truncated";
            }>;
            items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            diagnostics: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                severity: z.ZodOptional<z.ZodEnum<{
                    info: "info";
                    warning: "warning";
                    error: "error";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
        tools: z.ZodObject<{
            status: z.ZodEnum<{
                partial: "partial";
                failed: "failed";
                ready: "ready";
                unsupported: "unsupported";
                truncated: "truncated";
            }>;
            items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            diagnostics: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                severity: z.ZodOptional<z.ZodEnum<{
                    info: "info";
                    warning: "warning";
                    error: "error";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
        prompt: z.ZodObject<{
            status: z.ZodEnum<{
                partial: "partial";
                failed: "failed";
                ready: "ready";
                unsupported: "unsupported";
                truncated: "truncated";
            }>;
            items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            diagnostics: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                severity: z.ZodOptional<z.ZodEnum<{
                    info: "info";
                    warning: "warning";
                    error: "error";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
    }, z.core.$strip>>;
    diagnostics: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodOptional<z.ZodEnum<{
            info: "info";
            warning: "warning";
            error: "error";
        }>>;
    }, z.core.$strip>>;
    requestedSessionId: z.ZodOptional<z.ZodString>;
    compatibility: z.ZodObject<{
        harnessVersion: z.ZodOptional<z.ZodString>;
        verifiedRevision: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    redaction: z.ZodObject<{
        policy: z.ZodLiteral<"allowlist">;
        excluded: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    capabilities: z.ZodObject<{
        loaderEntries: z.ZodBoolean;
        serviceOwners: z.ZodBoolean;
        toolOwners: z.ZodBoolean;
        promptOwners: z.ZodBoolean;
        fiberEffects: z.ZodBoolean;
    }, z.core.$strip>;
    relationships: z.ZodArray<z.ZodObject<{
        relationshipId: z.ZodString;
        kind: z.ZodEnum<{
            provides: "provides";
            owns: "owns";
            parent: "parent";
        }>;
        fromId: z.ZodString;
        toId: z.ZodString;
        attribution: z.ZodOptional<z.ZodObject<{
            quality: z.ZodEnum<{
                exact: "exact";
                inferred: "inferred";
                unavailable: "unavailable";
            }>;
            code: z.ZodString;
            sourceId: z.ZodOptional<z.ZodString>;
            explanation: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/** The generated-equivalent Remote contribution mounted by the Client. */
export declare const TYPERT_REMOTE: {
    package: string;
    descriptors: {
        id: string;
        service: string;
        namespace: string;
        method: string;
        invocation: {
            kind: "direct";
        };
        parameters: {
            name: string;
            wire: string;
            source: "json";
            codec: {
                mode: "strict";
                typeSymbol: string;
                schema: z.ZodObject<{
                    sessionId: z.ZodOptional<z.ZodString>;
                    domains: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                        plugins: "plugins";
                        services: "services";
                        effects: "effects";
                        tools: "tools";
                        prompt: "prompt";
                    }>>>;
                }, z.core.$strict>;
            };
            acceptsUndefined: true;
        }[];
        result: {
            mode: "strict";
            typeSymbol: string;
            schema: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                health: z.ZodEnum<{
                    healthy: "healthy";
                    partial: "partial";
                    failed: "failed";
                }>;
                capture: z.ZodObject<{
                    startedAt: z.ZodNumber;
                    completedAt: z.ZodNumber;
                    generation: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                host: z.ZodObject<{
                    plugins: z.ZodObject<{
                        status: z.ZodEnum<{
                            partial: "partial";
                            failed: "failed";
                            ready: "ready";
                            unsupported: "unsupported";
                            truncated: "truncated";
                        }>;
                        items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                        diagnostics: z.ZodArray<z.ZodObject<{
                            code: z.ZodString;
                            message: z.ZodString;
                            severity: z.ZodOptional<z.ZodEnum<{
                                info: "info";
                                warning: "warning";
                                error: "error";
                            }>>;
                        }, z.core.$strip>>;
                    }, z.core.$strict>;
                    services: z.ZodObject<{
                        status: z.ZodEnum<{
                            partial: "partial";
                            failed: "failed";
                            ready: "ready";
                            unsupported: "unsupported";
                            truncated: "truncated";
                        }>;
                        items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                        diagnostics: z.ZodArray<z.ZodObject<{
                            code: z.ZodString;
                            message: z.ZodString;
                            severity: z.ZodOptional<z.ZodEnum<{
                                info: "info";
                                warning: "warning";
                                error: "error";
                            }>>;
                        }, z.core.$strip>>;
                    }, z.core.$strict>;
                    effects: z.ZodObject<{
                        status: z.ZodEnum<{
                            partial: "partial";
                            failed: "failed";
                            ready: "ready";
                            unsupported: "unsupported";
                            truncated: "truncated";
                        }>;
                        items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                        diagnostics: z.ZodArray<z.ZodObject<{
                            code: z.ZodString;
                            message: z.ZodString;
                            severity: z.ZodOptional<z.ZodEnum<{
                                info: "info";
                                warning: "warning";
                                error: "error";
                            }>>;
                        }, z.core.$strip>>;
                    }, z.core.$strict>;
                }, z.core.$strip>;
                session: z.ZodOptional<z.ZodObject<{
                    sessionId: z.ZodString;
                    status: z.ZodEnum<{
                        unavailable: "unavailable";
                        running: "running";
                        idle: "idle";
                        cold: "cold";
                    }>;
                    preset: z.ZodOptional<z.ZodString>;
                    modelProvider: z.ZodOptional<z.ZodString>;
                    model: z.ZodOptional<z.ZodString>;
                    promptToolCount: z.ZodOptional<z.ZodNumber>;
                    promptToolSchemaBytes: z.ZodOptional<z.ZodNumber>;
                    runtimeContextSuppressed: z.ZodOptional<z.ZodBoolean>;
                    services: z.ZodObject<{
                        status: z.ZodEnum<{
                            partial: "partial";
                            failed: "failed";
                            ready: "ready";
                            unsupported: "unsupported";
                            truncated: "truncated";
                        }>;
                        items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                        diagnostics: z.ZodArray<z.ZodObject<{
                            code: z.ZodString;
                            message: z.ZodString;
                            severity: z.ZodOptional<z.ZodEnum<{
                                info: "info";
                                warning: "warning";
                                error: "error";
                            }>>;
                        }, z.core.$strip>>;
                    }, z.core.$strict>;
                    tools: z.ZodObject<{
                        status: z.ZodEnum<{
                            partial: "partial";
                            failed: "failed";
                            ready: "ready";
                            unsupported: "unsupported";
                            truncated: "truncated";
                        }>;
                        items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                        diagnostics: z.ZodArray<z.ZodObject<{
                            code: z.ZodString;
                            message: z.ZodString;
                            severity: z.ZodOptional<z.ZodEnum<{
                                info: "info";
                                warning: "warning";
                                error: "error";
                            }>>;
                        }, z.core.$strip>>;
                    }, z.core.$strict>;
                    prompt: z.ZodObject<{
                        status: z.ZodEnum<{
                            partial: "partial";
                            failed: "failed";
                            ready: "ready";
                            unsupported: "unsupported";
                            truncated: "truncated";
                        }>;
                        items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                        diagnostics: z.ZodArray<z.ZodObject<{
                            code: z.ZodString;
                            message: z.ZodString;
                            severity: z.ZodOptional<z.ZodEnum<{
                                info: "info";
                                warning: "warning";
                                error: "error";
                            }>>;
                        }, z.core.$strip>>;
                    }, z.core.$strict>;
                }, z.core.$strip>>;
                diagnostics: z.ZodArray<z.ZodObject<{
                    code: z.ZodString;
                    message: z.ZodString;
                    severity: z.ZodOptional<z.ZodEnum<{
                        info: "info";
                        warning: "warning";
                        error: "error";
                    }>>;
                }, z.core.$strip>>;
                requestedSessionId: z.ZodOptional<z.ZodString>;
                compatibility: z.ZodObject<{
                    harnessVersion: z.ZodOptional<z.ZodString>;
                    verifiedRevision: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                redaction: z.ZodObject<{
                    policy: z.ZodLiteral<"allowlist">;
                    excluded: z.ZodArray<z.ZodString>;
                }, z.core.$strip>;
                capabilities: z.ZodObject<{
                    loaderEntries: z.ZodBoolean;
                    serviceOwners: z.ZodBoolean;
                    toolOwners: z.ZodBoolean;
                    promptOwners: z.ZodBoolean;
                    fiberEffects: z.ZodBoolean;
                }, z.core.$strip>;
                relationships: z.ZodArray<z.ZodObject<{
                    relationshipId: z.ZodString;
                    kind: z.ZodEnum<{
                        provides: "provides";
                        owns: "owns";
                        parent: "parent";
                    }>;
                    fromId: z.ZodString;
                    toId: z.ZodString;
                    attribution: z.ZodOptional<z.ZodObject<{
                        quality: z.ZodEnum<{
                            exact: "exact";
                            inferred: "inferred";
                            unavailable: "unavailable";
                        }>;
                        code: z.ZodString;
                        sourceId: z.ZodOptional<z.ZodString>;
                        explanation: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>;
                }, z.core.$strip>>;
            }, z.core.$strict>;
        };
        cancellation: {
            parameter: "signal";
        };
        sourceLocation: {
            file: string;
            line: number;
            column: number;
        };
    }[];
};
export default TYPERT_REMOTE;
/** Client-side mount companion for the generated Remote contribution. */
export declare const inject: string[];
/** Mount the runtime snapshot namespace before the UI plugin requests it. */
export declare function apply(ctx: ClientContext): Promise<() => Promise<void>>;
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespace$72756e74696d6558726179 {
        snapshot: (request?: SnapshotRequest) => Promise<RemoteResult<RuntimeSnapshot>>;
    }
    interface TypertRemoteMap {
        'runtimeXray/snapshot': (request?: SnapshotRequest) => Promise<RemoteResult<RuntimeSnapshot>>;
    }
    interface TypertRemoteNamespaceMap {
        runtimeXray: TypertRemoteNamespace$72756e74696d6558726179;
    }
}
