import type {
    WorkRecord,
    WorkSession,
    WorkTemplate,
} from "@/shared/types/domain";

interface CreateMockSessionOptions {
    id?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    duration_minutes?: number;
    is_overnight?: boolean;
}

interface CreateMockRecordOptions {
    id?: string;
    project_code?: string;
    work_name?: string;
    task_name?: string;
    deal_name?: string;
    category_name?: string;
    duration_minutes?: number;
    note?: string;
    start_time?: string;
    end_time?: string;
    date?: string;
    sessions?: WorkSession[];
    is_completed?: boolean;
    completed_at?: string;
    is_deleted?: boolean;
    deleted_at?: string;
}

interface CreateMockTemplateOptions {
    id?: string;
    project_code?: string;
    work_name?: string;
    task_name?: string;
    deal_name?: string;
    category_name?: string;
    note?: string;
    color?: string;
    created_at?: string;
    sort_order?: number;
}

const MOCK_DATE = "2026-01-19";
const MOCK_CREATED_AT = "2026-01-01T00:00:00.000Z";
const MINUTES_PER_HOUR = 60;
const SESSION_START_HOURS = [9, 10, 11, 13, 14, 15, 16];
const SESSION_START_MINUTES = [0, 15, 30, 45];
const SESSION_DURATIONS = [30, 45, 60, 90, 120];
const PROJECT_CODES = ["PRJ001", "PRJ002", "PRJ003", "MAINT", "SUPPORT"];
const WORK_NAMES = [
    "기능 개발",
    "버그 수정",
    "코드 리뷰",
    "회의",
    "문서 작성",
    "테스트",
];
const TASK_NAMES = ["개발", "기획", "디자인", "QA", "운영"];
const CATEGORY_NAMES = ["개발", "관리", "회의", "기타", "지원"];
const TEMPLATE_COLORS = [
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
];

let mock_sequence = 0;

export function resetMockSequence(): void {
    mock_sequence = 0;
}

function nextSequence(): number {
    mock_sequence += 1;
    return mock_sequence;
}

function pickBySequence<T>(items: readonly T[], sequence: number): T {
    return items[sequence % items.length];
}

function formatClock(total_minutes: number): string {
    const hours = Math.floor(total_minutes / MINUTES_PER_HOUR);
    const minutes = total_minutes % MINUTES_PER_HOUR;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function createMockSession(
    overrides: CreateMockSessionOptions = {}
): WorkSession {
    const sequence = nextSequence();
    const start_minutes =
        pickBySequence(SESSION_START_HOURS, sequence) * MINUTES_PER_HOUR +
        pickBySequence(SESSION_START_MINUTES, sequence);
    const duration =
        overrides.duration_minutes ??
        pickBySequence(SESSION_DURATIONS, sequence);

    return {
        id: overrides.id ?? `mock-session-${sequence}`,
        date: overrides.date ?? MOCK_DATE,
        start_time: overrides.start_time ?? formatClock(start_minutes),
        end_time: overrides.end_time ?? formatClock(start_minutes + duration),
        duration_minutes: duration,
        ...(overrides.is_overnight ? { is_overnight: true } : {}),
    };
}

export function createMockRecord(
    overrides: CreateMockRecordOptions = {}
): WorkRecord {
    const sequence = nextSequence();
    const date = overrides.date ?? MOCK_DATE;
    const sessions = overrides.sessions ?? [createMockSession({ date })];
    const total_duration = sessions.reduce(
        (sum, session) => sum + session.duration_minutes,
        0
    );
    const work_name =
        overrides.work_name ?? pickBySequence(WORK_NAMES, sequence);

    return {
        id: overrides.id ?? `mock-record-${sequence}`,
        project_code:
            overrides.project_code ?? pickBySequence(PROJECT_CODES, sequence),
        work_name,
        task_name: overrides.task_name ?? pickBySequence(TASK_NAMES, sequence),
        deal_name: overrides.deal_name ?? `${work_name}_${sequence}`,
        category_name:
            overrides.category_name ??
            pickBySequence(CATEGORY_NAMES, sequence),
        duration_minutes: overrides.duration_minutes ?? total_duration,
        note: overrides.note ?? `메모 ${sequence}`,
        start_time: overrides.start_time ?? sessions[0]?.start_time ?? "09:00",
        end_time:
            overrides.end_time ??
            sessions[sessions.length - 1]?.end_time ??
            "18:00",
        date,
        sessions,
        is_completed: overrides.is_completed ?? false,
        completed_at: overrides.completed_at,
        is_deleted: overrides.is_deleted ?? false,
        deleted_at: overrides.deleted_at,
    };
}

export function createMockTemplate(
    overrides: CreateMockTemplateOptions = {}
): WorkTemplate {
    const sequence = nextSequence();

    return {
        id: overrides.id ?? `mock-template-${sequence}`,
        project_code:
            overrides.project_code ?? pickBySequence(PROJECT_CODES, sequence),
        work_name: overrides.work_name ?? pickBySequence(WORK_NAMES, sequence),
        task_name: overrides.task_name ?? pickBySequence(TASK_NAMES, sequence),
        deal_name: overrides.deal_name ?? "",
        category_name:
            overrides.category_name ??
            pickBySequence(CATEGORY_NAMES, sequence),
        note: overrides.note ?? "",
        color: overrides.color ?? pickBySequence(TEMPLATE_COLORS, sequence),
        created_at: overrides.created_at ?? MOCK_CREATED_AT,
        sort_order: overrides.sort_order ?? 0,
    };
}
