export type DiagnosticEventLevel = "error" | "warn" | "info";

export type DiagnosticEventSource =
    | "window.error"
    | "unhandledrejection"
    | "console.error"
    | "console.warn"
    | "react.boundary"
    | "manual";

export interface DiagnosticEvent {
    id: string;
    at: string;
    level: DiagnosticEventLevel;
    source: DiagnosticEventSource;
    message: string;
    stack?: string;
    component_stack?: string;
    context?: Record<string, unknown>;
}

export interface DiagnosticEnvironment {
    app_version: string;
    user_agent: string;
    platform: string;
    language: string;
    screen: { width: number; height: number };
    viewport: { width: number; height: number };
    device_pixel_ratio: number;
    online: boolean;
    timezone: string;
    collected_at: string;
    url: string;
}

export interface DiagnosticDataSummary {
    record_count: number;
    deleted_record_count: number;
    completed_record_count: number;
    template_count: number;
    session_count: number;
    running_session_count: number;
    records_missing_sessions: number;
    duration_mismatch_count: number;
    storage_bytes: number | null;
}

export interface DiagnosticReport {
    report_version: number;
    generated_at: string;
    environment: DiagnosticEnvironment;
    events: DiagnosticEvent[];
    summary: DiagnosticDataSummary;
    settings: Record<string, unknown>;
    timer: unknown;
    records: unknown;
    templates: unknown;
}
