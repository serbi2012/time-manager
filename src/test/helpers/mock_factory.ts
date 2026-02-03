/**
 * 테스트용 목 데이터 팩토리
 * @faker-js/faker를 활용한 랜덤 데이터 생성
 */
import { faker } from "@faker-js/faker/locale/ko";
import type {
    WorkRecord,
    WorkSession,
    WorkTemplate,
} from "@/shared/types/domain";

// ============================================================================
// WorkSession 팩토리
// ============================================================================

export interface CreateMockSessionOptions {
    id?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    duration_minutes?: number;
}

export function createMockSession(
    overrides: CreateMockSessionOptions = {}
): WorkSession {
    const start_hour = faker.number.int({ min: 9, max: 16 });
    const start_minute = faker.helpers.arrayElement([0, 15, 30, 45]);
    const duration =
        overrides.duration_minutes ?? faker.number.int({ min: 15, max: 120 });

    const end_hour = start_hour + Math.floor((start_minute + duration) / 60);
    const end_minute = (start_minute + duration) % 60;

    return {
        id: overrides.id ?? faker.string.uuid(),
        date:
            overrides.date ??
            faker.date.recent({ days: 7 }).toISOString().split("T")[0],
        start_time:
            overrides.start_time ??
            `${String(start_hour).padStart(2, "0")}:${String(
                start_minute
            ).padStart(2, "0")}`,
        end_time:
            overrides.end_time ??
            `${String(end_hour).padStart(2, "0")}:${String(end_minute).padStart(
                2,
                "0"
            )}`,
        duration_minutes: duration,
    };
}

export function createMockSessions(
    count: number,
    options: CreateMockSessionOptions = {}
): WorkSession[] {
    return Array.from({ length: count }, () => createMockSession(options));
}

// ============================================================================
// WorkRecord 팩토리
// ============================================================================

export interface CreateMockRecordOptions {
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

export function createMockRecord(
    overrides: CreateMockRecordOptions = {}
): WorkRecord {
    const date =
        overrides.date ??
        faker.date.recent({ days: 7 }).toISOString().split("T")[0];
    const sessions = overrides.sessions ?? [createMockSession({ date })];
    const total_duration = sessions.reduce(
        (sum, s) => sum + s.duration_minutes,
        0
    );

    const work_name =
        overrides.work_name ?? faker.helpers.arrayElement(WORK_NAMES);

    return {
        id: overrides.id ?? faker.string.uuid(),
        project_code:
            overrides.project_code ?? faker.helpers.arrayElement(PROJECT_CODES),
        work_name,
        task_name:
            overrides.task_name ?? faker.helpers.arrayElement(TASK_NAMES),
        deal_name:
            overrides.deal_name ??
            `${work_name}_${faker.number.int({ min: 1, max: 99 })}`,
        category_name:
            overrides.category_name ??
            faker.helpers.arrayElement(CATEGORY_NAMES),
        duration_minutes: overrides.duration_minutes ?? total_duration,
        note: overrides.note ?? faker.lorem.sentence(),
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

export function createMockRecords(
    count: number,
    options: CreateMockRecordOptions = {}
): WorkRecord[] {
    return Array.from({ length: count }, () => createMockRecord(options));
}

// ============================================================================
// WorkTemplate 팩토리
// ============================================================================

export interface CreateMockTemplateOptions {
    id?: string;
    project_code?: string;
    work_name?: string;
    task_name?: string;
    deal_name?: string;
    category_name?: string;
    note?: string;
    color?: string;
    created_at?: string;
}

const TEMPLATE_COLORS = [
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
    "#a0d911",
    "#2f54eb",
];

export function createMockTemplate(
    overrides: CreateMockTemplateOptions = {}
): WorkTemplate {
    return {
        id: overrides.id ?? faker.string.uuid(),
        project_code:
            overrides.project_code ?? faker.helpers.arrayElement(PROJECT_CODES),
        work_name:
            overrides.work_name ?? faker.helpers.arrayElement(WORK_NAMES),
        task_name:
            overrides.task_name ?? faker.helpers.arrayElement(TASK_NAMES),
        deal_name: overrides.deal_name ?? "",
        category_name:
            overrides.category_name ??
            faker.helpers.arrayElement(CATEGORY_NAMES),
        note: overrides.note ?? "",
        color: overrides.color ?? faker.helpers.arrayElement(TEMPLATE_COLORS),
        created_at: overrides.created_at ?? faker.date.past().toISOString(),
    };
}

export function createMockTemplates(
    count: number,
    options: CreateMockTemplateOptions = {}
): WorkTemplate[] {
    return Array.from({ length: count }, () => createMockTemplate(options));
}

// ============================================================================
// 시나리오 데이터
// ============================================================================

export const SCENARIOS = {
    /** 빈 하루 */
    emptyDay: () => [] as WorkRecord[],

    /** 바쁜 하루 (10개 레코드) */
    busyDay: (date?: string) => createMockRecords(10, { date }),

    /** 시간 충돌이 있는 레코드들 */
    withConflicts: (date?: string) => {
        const base_date = date ?? new Date().toISOString().split("T")[0];
        return [
            createMockRecord({
                date: base_date,
                sessions: [
                    createMockSession({
                        date: base_date,
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    }),
                ],
            }),
            createMockRecord({
                date: base_date,
                sessions: [
                    createMockSession({
                        date: base_date,
                        start_time: "09:30",
                        end_time: "10:30",
                        duration_minutes: 60,
                    }),
                ],
            }),
        ];
    },

    /** 완료된 레코드들 */
    completedRecords: (count = 5) =>
        createMockRecords(count, {
            is_completed: true,
            completed_at: new Date().toISOString(),
        }),

    /** 삭제된 레코드들 (휴지통) */
    deletedRecords: (count = 3) =>
        createMockRecords(count, {
            is_deleted: true,
            deleted_at: new Date().toISOString(),
        }),

    /** 긴 세션을 가진 레코드 */
    longSession: (date?: string) =>
        createMockRecord({
            date,
            sessions: [createMockSession({ duration_minutes: 480 })],
            duration_minutes: 480,
        }),

    /** 다중 세션을 가진 레코드 */
    multiSession: (date?: string, sessionCount = 3) => {
        const base_date = date ?? new Date().toISOString().split("T")[0];
        const sessions = createMockSessions(sessionCount, { date: base_date });
        return createMockRecord({
            date: base_date,
            sessions,
            duration_minutes: sessions.reduce(
                (sum, s) => sum + s.duration_minutes,
                0
            ),
        });
    },
};

// ============================================================================
// 유틸리티
// ============================================================================

/** 특정 날짜 범위의 레코드 생성 */
export function createMockRecordsForDateRange(
    startDate: Date,
    endDate: Date,
    recordsPerDay = 3
): WorkRecord[] {
    const records: WorkRecord[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        const date = current.toISOString().split("T")[0];
        records.push(...createMockRecords(recordsPerDay, { date }));
        current.setDate(current.getDate() + 1);
    }

    return records;
}

/** 주간 레코드 생성 (월~금) */
export function createMockWeeklyRecords(weekStartDate?: Date): WorkRecord[] {
    const start = weekStartDate ?? getMonday(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 4); // 금요일까지

    return createMockRecordsForDateRange(start, end, 3);
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
