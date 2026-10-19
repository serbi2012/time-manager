/**
 * duration_calculator 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    getRecordDurationMinutes,
    getRecordDurationForDate,
    getTimeRangeForDate,
} from "../../../../../features/work-record/lib/duration_calculator";
import type { WorkRecord } from "../../../../../shared/types";
import type { LunchTimeRange } from "../../../../../shared/lib/lunch/lunch_calculator";

const CUSTOM_LUNCH: LunchTimeRange = { start: 720, end: 780, duration: 60 }; // 12:00~13:00

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

        it.each([
            { label: "0", duration_minutes: 0 },
            { label: "NaN", duration_minutes: Number.NaN },
        ])("duration_minutes가 $label이면 세션 합산을 사용", ({ duration_minutes }) => {
            const record = createTestRecord({
                duration_minutes,
                sessions: [
                    s("s1", "2024-01-15", "09:00", "10:00"),
                    s("s2", "2024-01-15", "14:00", "16:00"),
                ],
            });

            expect(getRecordDurationMinutes(record)).toBe(180);
        });

        it.each([
            { label: "세션이 없으면", sessions: [], start_time: "09:00", end_time: "18:00", expected: 540 },
            { label: "세션 합이 0이면", sessions: [s("s1", "2024-01-15", "09:00", "09:00")], start_time: "08:00", end_time: "09:30", expected: 90 },
            { label: "start·end 차이가 0이면", sessions: [s("s1", "2024-01-15", "12:00", "12:00")], start_time: "14:00", end_time: "14:00", expected: 0 },
            { label: "시간 정보가 없으면", sessions: [], start_time: "", end_time: "", expected: 0 },
        ])("$label start_time/end_time 차이로 계산 ($expected분)", ({ sessions, start_time, end_time, expected }) => {
            const record = createTestRecord({ duration_minutes: 0, sessions, start_time, end_time });

            expect(getRecordDurationMinutes(record)).toBe(expected);
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

        it.each([
            { target_date: "2024-01-15", expected: 120 },
            { target_date: "2024-01-16", expected: 0 },
        ])("세션이 없으면 레코드 날짜가 $target_date일 때 $expected분 반환", ({ target_date, expected }) => {
            const record = createTestRecord({
                date: "2024-01-15",
                duration_minutes: 120,
                sessions: [],
            });

            expect(getRecordDurationForDate(record, target_date)).toBe(expected);
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

        it.each([
            { target_date: "2024-01-15", expected: { start_time: "08:30", end_time: "17:45" } },
            { target_date: "2024-01-14", expected: { start_time: "", end_time: "" } },
        ])("세션이 없으면 레코드 날짜와 비교해 범위를 반환 ($target_date)", ({ target_date, expected }) => {
            const record = createTestRecord({
                date: "2024-01-15",
                sessions: [],
                start_time: "08:30",
                end_time: "17:45",
            });

            expect(getTimeRangeForDate(record, target_date)).toEqual(expected);
        });

        it("start_time이 비어 있으면 00:00으로 정렬해 가장 이른 시작을 고른다", () => {
            const record = createTestRecord({
                sessions: [
                    s("s1", "2024-01-15", "11:00", "12:00"),
                    { id: "s2", date: "2024-01-15", start_time: "", end_time: "10:00", duration_minutes: 0 },
                ],
            });

            const range = getTimeRangeForDate(record, "2024-01-15");

            expect(range.start_time).toBe("");
            expect(range.end_time).toBe("12:00");
        });
    });

    describe("사용자 점심시간 (LunchTimeRange) 전달", () => {
        it("getRecordDurationForDate에 커스텀 점심시간 전달 시 fallback 경로에서 사용", () => {
            const record = createTestRecord({
                sessions: [
                    {
                        id: "s1",
                        date: "2024-01-15",
                        start_time: "11:30",
                        end_time: "12:30",
                        duration_minutes: undefined as unknown as number,
                    },
                ],
            });

            // 기본 점심(11:40~12:40): 11:30~11:40 = 10분
            const default_result = getRecordDurationForDate(record, "2024-01-15");
            // 커스텀 점심(12:00~13:00): 11:30~12:00 = 30분
            const custom_result = getRecordDurationForDate(record, "2024-01-15", CUSTOM_LUNCH);

            expect(default_result).toBe(10);
            expect(custom_result).toBe(30);
        });

        it("duration_minutes가 있으면 lunch_time 무관하게 그 값 사용", () => {
            const record = createTestRecord({
                sessions: [s("s1", "2024-01-15", "11:00", "14:00")],
            });

            const default_result = getRecordDurationForDate(record, "2024-01-15");
            const custom_result = getRecordDurationForDate(record, "2024-01-15", CUSTOM_LUNCH);

            expect(default_result).toBe(custom_result);
        });
    });
});
