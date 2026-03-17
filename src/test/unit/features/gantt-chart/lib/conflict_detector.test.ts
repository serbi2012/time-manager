import { describe, it, expect } from "vitest";
import {
    detectConflicts,
    isSessionConflicting,
    isTimeRangeOverlapping,
    calculateOverlapRange,
} from "@/features/gantt-chart/lib/conflict_detector";
import type { GroupedWork } from "@/features/gantt-chart/lib/slot_calculator";
import {
    createMockSession,
    createMockRecord,
} from "@/test/helpers/mock_factory";

function createGroupedWork(
    sessions: ReturnType<typeof createMockSession>[],
    record_overrides: Parameters<typeof createMockRecord>[0] = {}
): GroupedWork {
    const record = createMockRecord({ sessions, ...record_overrides });
    return {
        record,
        sessions,
        color: "#3182F6",
    };
}

describe("detectConflicts", () => {
    it("겹치지 않는 세션들은 충돌 없음", () => {
        const date = "2026-03-17";
        const groups: GroupedWork[] = [
            createGroupedWork([
                createMockSession({
                    date,
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                }),
            ]),
            createGroupedWork([
                createMockSession({
                    date,
                    start_time: "10:00",
                    end_time: "11:00",
                    duration_minutes: 60,
                }),
            ]),
        ];

        const result = detectConflicts(groups, 720);
        expect(result.conflicting_sessions.size).toBe(0);
        expect(result.conflict_ranges).toHaveLength(0);
    });

    it("겹치는 세션들의 충돌을 감지", () => {
        const date = "2026-03-17";
        const s1 = createMockSession({
            id: "s1",
            date,
            start_time: "09:00",
            end_time: "10:30",
            duration_minutes: 90,
        });
        const s2 = createMockSession({
            id: "s2",
            date,
            start_time: "10:00",
            end_time: "11:00",
            duration_minutes: 60,
        });

        const groups: GroupedWork[] = [
            createGroupedWork([s1]),
            createGroupedWork([s2]),
        ];

        const result = detectConflicts(groups, 720);
        expect(result.conflicting_sessions.has("s1")).toBe(true);
        expect(result.conflicting_sessions.has("s2")).toBe(true);
        expect(result.conflict_ranges).toHaveLength(1);
    });

    it("새벽 근무 세션과 야간 세션의 충돌을 감지", () => {
        const date = "2026-03-17";
        const overnight_session = createMockSession({
            id: "overnight",
            date,
            start_time: "22:00",
            end_time: "02:24",
            duration_minutes: 264,
            is_overnight: true,
        });
        const evening_session = createMockSession({
            id: "evening",
            date,
            start_time: "21:30",
            end_time: "22:30",
            duration_minutes: 60,
        });

        const groups: GroupedWork[] = [
            createGroupedWork([overnight_session]),
            createGroupedWork([evening_session]),
        ];

        const result = detectConflicts(groups, 720);
        expect(result.conflicting_sessions.has("overnight")).toBe(true);
        expect(result.conflicting_sessions.has("evening")).toBe(true);
    });

    it("새벽 근무 세션이 낮 세션과 겹치지 않음", () => {
        const date = "2026-03-17";
        const overnight_session = createMockSession({
            id: "overnight",
            date,
            start_time: "22:00",
            end_time: "02:24",
            duration_minutes: 264,
            is_overnight: true,
        });
        const day_session = createMockSession({
            id: "day",
            date,
            start_time: "09:00",
            end_time: "10:00",
            duration_minutes: 60,
        });

        const groups: GroupedWork[] = [
            createGroupedWork([overnight_session]),
            createGroupedWork([day_session]),
        ];

        const result = detectConflicts(groups, 720);
        expect(result.conflicting_sessions.size).toBe(0);
    });
});

describe("isSessionConflicting", () => {
    it("충돌 세션 ID가 포함되면 true 반환", () => {
        const conflict_info = {
            conflicting_sessions: new Set(["s1", "s2"]),
            conflict_ranges: [],
        };
        expect(isSessionConflicting("s1", conflict_info)).toBe(true);
        expect(isSessionConflicting("s3", conflict_info)).toBe(false);
    });
});

describe("isTimeRangeOverlapping", () => {
    it("겹치는 범위는 true", () => {
        expect(isTimeRangeOverlapping(0, 100, 50, 150)).toBe(true);
    });

    it("겹치지 않는 범위는 false", () => {
        expect(isTimeRangeOverlapping(0, 50, 50, 100)).toBe(false);
    });
});

describe("calculateOverlapRange", () => {
    it("겹치는 구간을 반환", () => {
        const result = calculateOverlapRange(0, 100, 50, 150);
        expect(result).toEqual({ start: 50, end: 100 });
    });

    it("겹치지 않으면 null 반환", () => {
        const result = calculateOverlapRange(0, 50, 50, 100);
        expect(result).toBeNull();
    });
});
