/**
 * duration_calculator 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    getRecordDurationMinutes,
    getRecordDurationForDate,
    getTimeRangeForDate,
    recalculateRecordDuration,
} from "../../../../../features/work-record/lib/duration_calculator";
import type { WorkRecord } from "../../../../../shared/types";

// 테스트용 레코드 헬퍼
function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "",
        task_name: "",
        category_name: "테스트",
        project_code: "",
        date: "2024-01-15",
        start_time: "09:00",
        end_time: "18:00",
        duration_minutes: 0,
        note: "",
        is_completed: false,
        sessions: [],
        ...overrides,
    };
}

// 테스트용 세션 헬퍼
function s(id: string, date: string, start: string, end: string): { id: string; date: string; start_time: string; end_time: string; duration_minutes: number } {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return { id, date, start_time: start, end_time: end, duration_minutes: Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) };
}

describe("duration_calculator", () => {
    describe("getRecordDurationMinutes", () => {
        it("duration_minutes가 있으면 그 값 반환", () => {
            const record = createTestRecord({
                duration_minutes: 180,
                sessions: [s("s1", "2024-01-15", "09:00", "10:00")],
            });

            const duration = getRecordDurationMinutes(record);

            expect(duration).toBe(180);
        });

        it("세션에서 시간 계산", () => {
            // 세션의 duration_minutes가 설정되어 있으면 그 값을 사용
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "11:00", "14:00")], // 180분
            });

            const duration = getRecordDurationMinutes(record);

            expect(duration).toBe(180); // 세션의 duration_minutes 합계
        });

        it("점심 시간과 겹치지 않는 세션", () => {
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "14:00", "16:00")],
            });

            const duration = getRecordDurationMinutes(record);

            expect(duration).toBe(120);
        });

        it("세션이 없으면 start_time/end_time으로 계산", () => {
            const record = createTestRecord({
                start_time: "14:00",
                end_time: "16:00",
                sessions: [],
            });

            const duration = getRecordDurationMinutes(record);

            expect(duration).toBe(120);
        });

        it("세션이 없으면 start_time/end_time으로 계산", () => {
            const record = createTestRecord({ 
                sessions: [],
                start_time: "09:00",
                end_time: "18:00", // 540분
            });

            const duration = getRecordDurationMinutes(record);

            expect(duration).toBe(540);
        });

        it("진행 중인 세션(end_time 없음)은 0분으로 처리", () => {
            const record = createTestRecord({
                sessions: [
                    s("s1", "2024-01-15", "14:00", "16:00"),
                    { id: "s2", date: "2024-01-15", start_time: "17:00", end_time: "", duration_minutes: 0 },
                ],
            });

            const duration = getRecordDurationMinutes(record);

            expect(duration).toBe(120);
        });
    });

    describe("getRecordDurationForDate", () => {
        it("특정 날짜의 세션 시간만 계산해야 함", () => {
            const record = createTestRecord({
                sessions: [
                    s("s1", "2024-01-15", "14:00", "16:00"),
                    s("s2", "2024-01-16", "14:00", "15:00"),
                ],
            });

            const duration_15 = getRecordDurationForDate(record, "2024-01-15");
            const duration_16 = getRecordDurationForDate(record, "2024-01-16");

            expect(duration_15).toBe(120);
            expect(duration_16).toBe(60);
        });

        it("해당 날짜에 세션이 없으면 0 반환", () => {
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "14:00", "16:00")],
            });

            const duration = getRecordDurationForDate(record, "2024-01-20");

            expect(duration).toBe(0);
        });

        it("세션이 없고 레코드 날짜가 맞으면 전체 시간 반환", () => {
            const record = createTestRecord({
                date: "2024-01-15",
                duration_minutes: 120,
                sessions: [],
            });

            const duration = getRecordDurationForDate(record, "2024-01-15");

            expect(duration).toBe(120);
        });
    });

    describe("getTimeRangeForDate", () => {
        it("특정 날짜의 시작/종료 시간을 반환해야 함", () => {
            const record = createTestRecord({
                sessions: [
                    s("s1", "2024-01-15", "10:00", "12:00"),
                    s("s2", "2024-01-15", "09:00", "11:00"),
                    s("s3", "2024-01-15", "14:00", "18:00"),
                ],
            });

            const range = getTimeRangeForDate(record, "2024-01-15");

            expect(range.start_time).toBe("09:00");
            expect(range.end_time).toBe("18:00");
        });

        it("해당 날짜에 세션이 없으면 빈 문자열 반환", () => {
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "09:00", "12:00")],
            });

            const range = getTimeRangeForDate(record, "2024-01-20");

            expect(range.start_time).toBe("");
            expect(range.end_time).toBe("");
        });
    });

    describe("recalculateRecordDuration", () => {
        it("세션 기반으로 duration_minutes 재계산", () => {
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "14:00", "16:00")],
                duration_minutes: 0,
            });

            const updated = recalculateRecordDuration(record);

            expect(updated.duration_minutes).toBe(120);
        });

        it("원본 레코드를 변경하지 않아야 함", () => {
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "14:00", "16:00")],
                duration_minutes: 0,
            });

            const updated = recalculateRecordDuration(record);

            expect(record.duration_minutes).toBe(0);
            expect(updated.duration_minutes).toBe(120);
        });

        it("세션이 없으면 원본 반환", () => {
            const record = createTestRecord({ sessions: [] });

            const updated = recalculateRecordDuration(record);

            expect(updated).toBe(record);
        });
    });
});
