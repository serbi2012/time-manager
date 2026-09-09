import type {
    DiagnosticEvent,
    DiagnosticEventLevel,
    DiagnosticEventSource,
} from "./types";
import { DIAGNOSTIC_EVENT_LIMIT } from "./config";

let event_buffer: DiagnosticEvent[] = [];
let listener_count = 0;
let is_installed = false;
let subscribers: Array<(events: DiagnosticEvent[]) => void> = [];

function createEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function notifySubscribers(): void {
    const snapshot = getDiagnosticEvents();
    subscribers.forEach((fn) => fn(snapshot));
}

export interface RecordDiagnosticEventInput {
    level: DiagnosticEventLevel;
    source: DiagnosticEventSource;
    message: string;
    stack?: string;
    component_stack?: string;
    context?: Record<string, unknown>;
}

export function recordDiagnosticEvent(
    input: RecordDiagnosticEventInput
): DiagnosticEvent {
    const event: DiagnosticEvent = {
        id: createEventId(),
        at: new Date().toISOString(),
        ...input,
    };

    event_buffer = [...event_buffer, event].slice(-DIAGNOSTIC_EVENT_LIMIT);
    notifySubscribers();
    return event;
}

export function getDiagnosticEvents(): DiagnosticEvent[] {
    return [...event_buffer];
}

export function getDiagnosticErrorCount(): number {
    return event_buffer.filter((e) => e.level === "error").length;
}

export function clearDiagnosticEvents(): void {
    event_buffer = [];
    notifySubscribers();
}

export function subscribeToDiagnosticEvents(
    fn: (events: DiagnosticEvent[]) => void
): () => void {
    subscribers = [...subscribers, fn];
    return () => {
        subscribers = subscribers.filter((s) => s !== fn);
    };
}

function toMessage(value: unknown): string {
    if (value instanceof Error) return value.message;
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function handleWindowError(event: ErrorEvent): void {
    recordDiagnosticEvent({
        level: "error",
        source: "window.error",
        message: event.message || toMessage(event.error),
        stack: event.error instanceof Error ? event.error.stack : undefined,
        context: {
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
        },
    });
}

function handleRejection(event: PromiseRejectionEvent): void {
    recordDiagnosticEvent({
        level: "error",
        source: "unhandledrejection",
        message: toMessage(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
    });
}

/**
 * 전역 에러 수집기 설치
 *
 * 중복 호출해도 리스너는 한 번만 등록되며, 반환된 해제 함수를 모두 호출하면 제거된다.
 */
export function installDiagnosticCollector(): () => void {
    listener_count += 1;

    if (!is_installed) {
        window.addEventListener("error", handleWindowError);
        window.addEventListener("unhandledrejection", handleRejection);
        is_installed = true;
    }

    return () => {
        listener_count -= 1;
        if (listener_count <= 0 && is_installed) {
            window.removeEventListener("error", handleWindowError);
            window.removeEventListener("unhandledrejection", handleRejection);
            is_installed = false;
            listener_count = 0;
        }
    };
}
