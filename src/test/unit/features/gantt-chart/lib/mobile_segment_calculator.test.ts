/**
 * mobile_segment_calculator 순수 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    buildSegments,
    buildHourLabels,
    formatSessionRange,
} from "@/features/gantt-chart/lib/mobile_segment_calculator";
import type { GroupedWork } from "@/features/gantt-chart/lib/slot_calculator";
import type { TimeRange } from "@/features/gantt-chart/lib/bar_calculator";
import {
    createMockRecord,
    createMockSession,
} from "@/test/helpers/mock_factory";

const TODAY = "2026-02-11";

function makeGroupedWork(overrides: {
    key?: string;
    sessions: { start: string; end?: string }[];
    work_name?: string;
}): GroupedWork {
    const sessions = overrides.sessions.map((s) =>
        createMockSession({
            date: TODAY,
            start_time: s.start,
            end_time: s.end,
            duration_minutes: 60,
        })
    );
    const record = createMockRecord({
        work_name: overrides.work_name ?? "test",
        sessions,
        date: TODAY,
    });

    return {
        key: overrides.key ?? record.id,
        record,
        sessions,
        first_start: 540,
    };
}

// ============================================================================
// buildHourLabels
// ============================================================================

describe("buildHourLabels", () => {
    it("9:00~18:00 범위에 대해 9~18 라벨을 반환한다", () => {
        const time_range: TimeRange = { start: 540, end: 1080 };
        const labels = buildHourLabels(time_range);
        expect(labels).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    });

    it("비정시 시작도 올바르게 처리한다 (9:30 → 9시 시작)", () => {
        const time_range: TimeRange = { start: 570, end: 720 };
        const labels = buildHourLabels(time_range);
        expect(labels).toEqual([9, 10, 11, 12]);
    });

    it("같은 시간 범위면 단일 라벨을 반환한다", () => {
        const time_range: TimeRange = { start: 600, end: 660 };
        const labels = buildHourLabels(time_range);
        expect(labels).toEqual([10, 11]);
    });
});

// ============================================================================
// buildSegments
// ============================================================================

describe("buildSegments", () => {
    const default_range: TimeRange = { start: 540, end: 1080 };
    const mock_get_color = () => "#3182F6";

    it("빈 grouped_works에 대해 빈 배열을 반환한다", () => {
        const result = buildSegments([], default_range, 780, mock_get_color);
        expect(result).toEqual([]);
    });

    it("total_range가 0이면 빈 배열을 반환한다", () => {
        const zero_range: TimeRange = { start: 540, end: 540 };
        const group = makeGroupedWork({
            sessions: [{ start: "09:00", end: "10:00" }],
        });
        const result = buildSegments([group], zero_range, 780, mock_get_color);
        expect(result).toEqual([]);
    });

    it("단일 세션의 위치를 올바르게 계산한다", () => {
        const group = makeGroupedWork({
            sessions: [{ start: "09:00", end: "10:00" }],
        });

        const result = buildSegments(
            [group],
            default_range,
            780,
            mock_get_color
        );

        expect(result).toHaveLength(1);
        expect(result[0].left_pct).toBeCloseTo(0, 1);
        expect(result[0].width_pct).toBeCloseTo((60 / (1080 - 540)) * 100, 1);
        expect(result[0].is_running).toBe(false);
        expect(result[0].color).toBe("#3182F6");
    });

    it("진행 중인 세션은 current_time_mins를 종료 시간으로 사용한다", () => {
        const session = createMockSession({
            date: TODAY,
            start_time: "13:00",
            duration_minutes: 60,
        });
        // Simulate running session by removing end_time
        session.end_time = undefined as unknown as string;

        const record = createMockRecord({
            work_name: "running",
            sessions: [session],
            date: TODAY,
        });

        const group: GroupedWork = {
            key: "running-key",
            record,
            sessions: [session],
            first_start: 780,
        };

        const current_mins = 840; // 14:00
        const result = buildSegments(
            [group],
            default_range,
            current_mins,
            mock_get_color
        );

        expect(result).toHaveLength(1);
        expect(result[0].is_running).toBe(true);
        const expected_width = ((840 - 780) / (1080 - 540)) * 100;
        expect(result[0].width_pct).toBeCloseTo(expected_width, 1);
    });

    it("여러 그룹의 세그먼트를 모두 반환한다", () => {
        const group1 = makeGroupedWork({
            key: "g1",
            sessions: [{ start: "09:00", end: "10:00" }],
        });
        const group2 = makeGroupedWork({
            key: "g2",
            sessions: [
                { start: "10:00", end: "11:00" },
                { start: "14:00", end: "15:00" },
            ],
        });

        const result = buildSegments(
            [group1, group2],
            default_range,
            780,
            mock_get_color
        );

        expect(result).toHaveLength(3);
        expect(result[0].work_key).toBe("g1");
        expect(result[1].work_key).toBe("g2");
        expect(result[2].work_key).toBe("g2");
    });

    it("width_pct는 최소 0.5를 보장한다", () => {
        const group = makeGroupedWork({
            sessions: [{ start: "09:00", end: "09:01" }],
        });

        const result = buildSegments(
            [group],
            default_range,
            780,
            mock_get_color
        );

        expect(result[0].width_pct).toBeGreaterThanOrEqual(0.5);
    });
});

// ============================================================================
// formatSessionRange
// ============================================================================

describe("formatSessionRange", () => {
    it("완료된 세션의 시간 범위를 포맷한다", () => {
        const session = createMockSession({
            start_time: "09:00",
            end_time: "10:30",
        });

        const result = formatSessionRange(session, false, "진행 중");
        expect(result).toBe("09:00 ~ 10:30");
    });

    it("진행 중인 세션은 running_label을 표시한다", () => {
        const session = createMockSession({
            start_time: "14:00",
            end_time: undefined,
        });

        const result = formatSessionRange(session, true, "진행 중");
        expect(result).toBe("14:00 ~ 진행 중");
    });
});
