/**
 * bar_calculator 순수 함수 테스트
 * - calculateBarStyle: 실행 중 바 너비가 현재 시간까지 정확히 맞는지 검증
 * - calculateTimeRange: 시간 범위 계산
 * - generateTimeLabels: 시간 라벨 생성
 */

import { describe, it, expect } from "vitest";
import {
    calculateBarStyle,
    calculateTimeRange,
    generateTimeLabels,
    calculateLunchOverlayStyle,
    calculateSelectionStyle,
    type TimeRange,
} from "../../../../../features/gantt-chart/lib/bar_calculator";
import type { WorkSession } from "../../../../../shared/types";

function createSession(overrides: Partial<WorkSession> = {}): WorkSession {
    return {
        id: "session-1",
        date: "2026-02-19",
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        ...overrides,
    };
}

const DEFAULT_RANGE: TimeRange = { start: 540, end: 1080 }; // 09:00 ~ 18:00

describe("calculateBarStyle", () => {
    it("일반 세션의 left/width를 올바르게 계산한다", () => {
        const session = createSession({
            start_time: "09:00",
            end_time: "10:00",
        });
        const result = calculateBarStyle(
            session,
            "#3182F6",
            DEFAULT_RANGE,
            600
        );

        expect(result.left).toBe("0%");
        const width = parseFloat(result.width);
        expect(width).toBeCloseTo((60 / 540) * 100, 1);
    });

    it("실행 중인 바의 너비가 현재 시간까지 확장된다", () => {
        const session = createSession({ start_time: "09:00", end_time: "" });
        const current_mins = 600; // 10:00
        const result = calculateBarStyle(
            session,
            "#3182F6",
            DEFAULT_RANGE,
            current_mins,
            true
        );

        const left = parseFloat(result.left);
        const width = parseFloat(result.width);
        const right_pct = ((current_mins - DEFAULT_RANGE.start) / 540) * 100;

        expect(left).toBe(0);
        expect(left + width).toBeCloseTo(right_pct, 1);
    });

    it("실행 중인 바의 우측 끝이 현재 시간 표시기 위치와 일치한다", () => {
        const session = createSession({ start_time: "10:30", end_time: "" });
        const current_mins = 720; // 12:00
        const result = calculateBarStyle(
            session,
            "#3182F6",
            DEFAULT_RANGE,
            current_mins,
            true
        );

        const left = parseFloat(result.left);
        const width = parseFloat(result.width);
        const indicator_pct =
            ((current_mins - DEFAULT_RANGE.start) / 540) * 100;

        expect(left + width).toBeCloseTo(indicator_pct, 1);
    });

    it("시작 시간이 범위 이전인 실행 중 바의 left가 0으로 클램핑된다", () => {
        const range: TimeRange = { start: 600, end: 1080 }; // 10:00 ~ 18:00
        const session = createSession({ start_time: "09:00", end_time: "" });
        const current_mins = 660; // 11:00

        const result = calculateBarStyle(
            session,
            "#3182F6",
            range,
            current_mins,
            true
        );

        const left = parseFloat(result.left);
        const width = parseFloat(result.width);

        expect(left).toBe(0);
        const right_pct =
            ((current_mins - range.start) / (range.end - range.start)) * 100;
        expect(left + width).toBeCloseTo(right_pct, 1);
    });

    it("최소 너비가 보장된다", () => {
        const session = createSession({
            start_time: "09:00",
            end_time: "09:01",
        });
        const result = calculateBarStyle(
            session,
            "#3182F6",
            DEFAULT_RANGE,
            600
        );

        const width = parseFloat(result.width);
        const min_width = Math.max((5 / 540) * 100, 1);

        expect(width).toBeGreaterThanOrEqual(min_width);
    });

    it("실행 중인 바에 boxShadow가 강화된다", () => {
        const session = createSession({ start_time: "09:00", end_time: "" });
        const result = calculateBarStyle(
            session,
            "#3182F6",
            DEFAULT_RANGE,
            600,
            true
        );

        expect(result.opacity).toBe(1);
        expect(result.boxShadow).toContain("40");
    });
});

describe("calculateTimeRange", () => {
    it("세션이 없으면 기본 9시-18시 범위를 반환한다", () => {
        const result = calculateTimeRange([], 600, null);

        expect(result.start).toBe(540);
        expect(result.end).toBe(1080);
    });

    it("이른 세션이 있으면 범위가 확장된다", () => {
        const groups = [
            {
                sessions: [
                    createSession({ start_time: "07:30", end_time: "09:00" }),
                ],
            },
        ];
        const result = calculateTimeRange(groups, 600, null);

        expect(result.start).toBe(420); // 07:00
    });

    it("늦은 세션이 있으면 범위가 확장된다", () => {
        const groups = [
            {
                sessions: [
                    createSession({ start_time: "17:00", end_time: "20:30" }),
                ],
            },
        ];
        const result = calculateTimeRange(groups, 600, null);

        expect(result.end).toBe(1260); // 21:00
    });

    it("실행 중 세션은 현재 시간을 기준으로 확장한다", () => {
        const session = createSession({
            id: "active",
            start_time: "17:00",
            end_time: "",
        });
        const groups = [{ sessions: [session] }];
        const current_mins = 1200; // 20:00

        const result = calculateTimeRange(groups, current_mins, "active");

        expect(result.end).toBe(1200); // 20:00
    });
});

describe("generateTimeLabels", () => {
    it("매 시간 라벨을 생성한다", () => {
        const labels = generateTimeLabels({ start: 540, end: 720 }); // 09:00 ~ 12:00

        expect(labels).toEqual(["09:00", "10:00", "11:00", "12:00"]);
    });
});

describe("calculateLunchOverlayStyle", () => {
    it("점심시간이 범위 내에 있으면 스타일을 반환한다", () => {
        const result = calculateLunchOverlayStyle(720, 780, DEFAULT_RANGE);

        expect(result).not.toBeNull();
        expect(parseFloat(result!.left)).toBeCloseTo(
            ((720 - 540) / 540) * 100,
            1
        );
    });

    it("점심시간이 범위 밖이면 null을 반환한다", () => {
        const result = calculateLunchOverlayStyle(1100, 1160, DEFAULT_RANGE);

        expect(result).toBeNull();
    });
});

describe("calculateSelectionStyle", () => {
    it("선택 영역 스타일을 올바르게 계산한다", () => {
        const result = calculateSelectionStyle(600, 660, DEFAULT_RANGE);

        const left = parseFloat(result.left);
        const width = parseFloat(result.width);

        expect(left).toBeCloseTo(((600 - 540) / 540) * 100, 1);
        expect(width).toBeCloseTo((60 / 540) * 100, 1);
    });
});
