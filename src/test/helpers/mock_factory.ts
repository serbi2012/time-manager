/**
 * 테스트용 목 데이터 생성 헬퍼
 */

import type { WorkSession, WorkRecord, ShortcutDefinition, WorkTemplate } from "../../shared/types";
import type { TimeSlot } from "../../features/work-record/lib/conflict_detector";

/**
 * 테스트용 WorkSession 생성
 */
export function createMockSession(overrides: Partial<WorkSession> & { id: string; date: string; start_time: string; end_time: string }): WorkSession {
    const duration_minutes = overrides.duration_minutes ?? calculateDuration(overrides.start_time, overrides.end_time);
    return {
        id: overrides.id,
        date: overrides.date,
        start_time: overrides.start_time,
        end_time: overrides.end_time,
        duration_minutes,
    };
}

/**
 * 테스트용 WorkRecord 생성
 */
export function createMockRecord(overrides: Partial<WorkRecord> & { 
    id: string; 
    work_name: string;
    deal_name: string;
    sessions: WorkSession[];
}): WorkRecord {
    const first_session = overrides.sessions[0];
    const last_session = overrides.sessions[overrides.sessions.length - 1];
    
    const total_duration = overrides.duration_minutes ?? 
        overrides.sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    
    return {
        id: overrides.id,
        work_name: overrides.work_name,
        deal_name: overrides.deal_name,
        task_name: overrides.task_name ?? "",
        project_code: overrides.project_code ?? "",
        category_name: overrides.category_name ?? "",
        start_time: overrides.start_time ?? first_session?.start_time ?? "09:00",
        end_time: overrides.end_time ?? last_session?.end_time ?? "18:00",
        date: overrides.date ?? first_session?.date ?? new Date().toISOString().split("T")[0],
        duration_minutes: total_duration,
        sessions: overrides.sessions,
        note: overrides.note ?? "",
        is_completed: overrides.is_completed ?? false,
    };
}

/**
 * 테스트용 WorkRecord 간단 생성 (세션 자동 생성)
 */
export function createSimpleRecord(overrides: Partial<WorkRecord> & { 
    id: string; 
    work_name: string;
}): WorkRecord {
    const date = overrides.date ?? new Date().toISOString().split("T")[0];
    const start_time = overrides.start_time ?? "09:00";
    const end_time = overrides.end_time ?? "10:00";
    const duration_minutes = overrides.duration_minutes ?? calculateDuration(start_time, end_time);
    
    return {
        id: overrides.id,
        work_name: overrides.work_name,
        deal_name: overrides.deal_name ?? "테스트 거래",
        task_name: overrides.task_name ?? "개발",
        project_code: overrides.project_code ?? "A25_TEST",
        category_name: overrides.category_name ?? "개발",
        start_time,
        end_time,
        date,
        duration_minutes,
        sessions: overrides.sessions ?? [{
            id: `${overrides.id}-session-1`,
            date,
            start_time,
            end_time,
            duration_minutes,
        }],
        note: overrides.note ?? "",
        is_completed: overrides.is_completed ?? false,
        is_deleted: overrides.is_deleted ?? false,
    };
}

/**
 * 테스트용 WorkTemplate 생성
 */
export function createMockTemplate(overrides: Partial<WorkTemplate> & { 
    id: string; 
    work_name: string;
}): WorkTemplate {
    return {
        id: overrides.id,
        work_name: overrides.work_name,
        deal_name: overrides.deal_name ?? "기본 거래",
        task_name: overrides.task_name ?? "개발",
        project_code: overrides.project_code ?? "A25_TEST",
        category_name: overrides.category_name ?? "개발",
        note: overrides.note ?? "",
        color: overrides.color ?? "#1677ff",
        created_at: overrides.created_at ?? new Date().toISOString(),
    };
}

/**
 * 테스트용 TimeSlot 생성 (conflict_detector용)
 */
export function createMockTimeSlot(overrides: Partial<TimeSlot> & { start: number; end: number }): TimeSlot {
    return {
        start: overrides.start,
        end: overrides.end,
        record_id: overrides.record_id ?? "test-record",
        session_id: overrides.session_id ?? "test-session",
        work_name: overrides.work_name ?? "테스트 업무",
        deal_name: overrides.deal_name ?? "테스트 딜",
    };
}

/**
 * 테스트용 ShortcutDefinition 생성
 */
export function createMockShortcut(overrides: Partial<ShortcutDefinition> & { 
    id: string; 
    name: string;
    keys: string;
    category: ShortcutDefinition["category"];
}): ShortcutDefinition {
    return {
        id: overrides.id,
        name: overrides.name,
        description: overrides.description ?? "",
        keys: overrides.keys,
        category: overrides.category,
        enabled: overrides.enabled ?? true,
        action: overrides.action ?? "defaultAction",
    };
}

/**
 * 시간 문자열로부터 분 단위 duration 계산
 */
function calculateDuration(start_time: string, end_time: string): number {
    const [start_h, start_m] = start_time.split(":").map(Number);
    const [end_h, end_m] = end_time.split(":").map(Number);
    const start_minutes = start_h * 60 + start_m;
    const end_minutes = end_h * 60 + end_m;
    return Math.max(1, end_minutes - start_minutes);
}

/**
 * 복수 레코드 생성 헬퍼
 */
export function createMockRecords(count: number, baseOverrides?: Partial<WorkRecord>): WorkRecord[] {
    return Array.from({ length: count }, (_, i) => 
        createSimpleRecord({
            id: `record-${i + 1}`,
            work_name: `작업 ${i + 1}`,
            start_time: `${String(9 + i).padStart(2, '0')}:00`,
            end_time: `${String(10 + i).padStart(2, '0')}:00`,
            ...baseOverrides,
        })
    );
}
