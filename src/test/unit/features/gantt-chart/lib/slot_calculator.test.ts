/**
 * slot_calculator 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    groupRecordsByDealName,
    collectOccupiedSlots,
    calculateAvailableRange,
    isTimeOccupied,
    minutesToPixels,
    pixelsToMinutes,
    type TimeSlot,
    type GroupedWork,
} from "../../../../../features/gantt-chart/lib/slot_calculator";
import type { WorkRecord } from "../../../../../shared/types";

// 테스트용 레코드 헬퍼
function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "테스트 거래",
        task_name: "개발",
        category_name: "테스트",
        project_code: "PRJ-001",
        date: "2024-01-15",
        start_time: "09:00",
        end_time: "18:00",
        duration_minutes: 0,
        sessions: [],
        note: "",
        is_completed: false,
        ...overrides,
    };
}

// 테스트용 세션 헬퍼
function s(id: string, date: string, start: string, end: string): { id: string; date: string; start_time: string; end_time: string; duration_minutes: number } {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return { id, date, start_time: start, end_time: end, duration_minutes: Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) };
}

describe("slot_calculator", () => {
    describe("minutesToPixels", () => {
        it("분을 픽셀 위치로 변환해야 함", () => {
            const start_hour = 8;
            const pixels_per_hour = 60;

            // 540분 (09:00) = 8시 기준 60분 후
            const pos = minutesToPixels(540, start_hour, pixels_per_hour);

            expect(pos).toBe(60); // 60분 * 1픽셀/분
        });

        it("시작 시간과 동일하면 0 반환", () => {
            const pos = minutesToPixels(480, 8, 60); // 08:00 = 480분

            expect(pos).toBe(0);
        });
    });

    describe("pixelsToMinutes", () => {
        it("픽셀 위치를 분으로 변환해야 함", () => {
            const start_hour = 8;
            const pixels_per_hour = 60;

            // 60픽셀 = 60분 = 09:00 = 540분
            const mins = pixelsToMinutes(60, start_hour, pixels_per_hour);

            expect(mins).toBe(540);
        });
    });

    describe("isTimeOccupied", () => {
        it("점유된 시간 감지", () => {
            const slots: TimeSlot[] = [
                { start: 540, end: 720 },
            ];

            expect(isTimeOccupied(600, slots)).toBe(true);
            expect(isTimeOccupied(540, slots)).toBe(true);
        });

        it("비어있는 시간 감지", () => {
            const slots: TimeSlot[] = [
                { start: 540, end: 720 },
            ];

            expect(isTimeOccupied(720, slots)).toBe(false);
            expect(isTimeOccupied(480, slots)).toBe(false);
            expect(isTimeOccupied(800, slots)).toBe(false);
        });
    });

    describe("calculateAvailableRange", () => {
        it("드래그 가능한 범위 계산", () => {
            const slots: TimeSlot[] = [
                { start: 540, end: 600 },
                { start: 720, end: 780 },
            ];

            const range = calculateAvailableRange(600, slots);

            expect(range.min).toBe(600);
            expect(range.max).toBe(720);
        });

        it("슬롯이 없으면 전체 범위", () => {
            const range = calculateAvailableRange(600, []);

            expect(range.min).toBe(0);
            expect(range.max).toBe(1440);
        });
    });

    describe("groupRecordsByDealName", () => {
        it("레코드를 deal_name으로 그룹화", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    deal_name: "거래A",
                    sessions: [s("s1", "2024-01-15", "09:00", "12:00")],
                }),
                createTestRecord({
                    id: "2",
                    deal_name: "거래A",
                    sessions: [s("s2", "2024-01-15", "14:00", "16:00")],
                }),
            ];

            const groups = groupRecordsByDealName(records, "2024-01-15", "17:00");

            expect(groups).toHaveLength(1);
            expect(groups[0].key).toBe("거래A");
            expect(groups[0].sessions).toHaveLength(2);
        });

        it("삭제된 레코드 제외", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    deal_name: "거래A",
                    is_deleted: true,
                    sessions: [s("s1", "2024-01-15", "09:00", "12:00")],
                }),
            ];

            const groups = groupRecordsByDealName(records, "2024-01-15", "17:00");

            expect(groups).toHaveLength(0);
        });

        it("선택한 날짜의 세션만 포함", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    deal_name: "거래A",
                    sessions: [
                        s("s1", "2024-01-15", "09:00", "12:00"),
                        s("s2", "2024-01-16", "09:00", "12:00"),
                    ],
                }),
            ];

            const groups = groupRecordsByDealName(records, "2024-01-15", "17:00");

            expect(groups).toHaveLength(1);
            expect(groups[0].sessions).toHaveLength(1);
            expect(groups[0].sessions[0].id).toBe("s1");
        });
    });

    describe("collectOccupiedSlots", () => {
        it("세션을 시간 슬롯으로 변환", () => {
            const groups: GroupedWork[] = [
                {
                    key: "거래A",
                    record: createTestRecord(),
                    sessions: [s("s1", "2024-01-15", "09:00", "12:00")],
                    first_start: 540,
                },
            ];

            const slots = collectOccupiedSlots(groups);

            expect(slots.length).toBeGreaterThanOrEqual(2);
            expect(slots.some(slot => slot.start === 540 && slot.end === 720)).toBe(true);
        });

        it("점심시간 슬롯 포함", () => {
            const slots = collectOccupiedSlots([]);

            expect(slots).toHaveLength(1);
            expect(slots[0].start).toBe(700);
            expect(slots[0].end).toBe(760);
        });
    });
});
