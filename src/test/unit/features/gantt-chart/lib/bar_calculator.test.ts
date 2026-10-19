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
    calculateConflictOverlayStyle,
    calculateResizingBarStyle,
    calculateWorkColor,
    resolveSmartEdge,
    xToMinutes,
    type TimeRange,
} from "../../../../../features/gantt-chart/lib/bar_calculator";
import type {
    WorkRecord,
    WorkSession,
    WorkTemplate,
} from "../../../../../shared/types";

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

const GRID_RECT = {
    left: 100,
    width: 500,
    top: 0,
    right: 600,
    bottom: 0,
    height: 0,
    x: 100,
    y: 0,
    toJSON: () => ({}),
} as DOMRect;

function base_record(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "rec-1",
        project_code: "P1",
        work_name: "업무",
        task_name: "태스크",
        deal_name: "딜",
        category_name: "카테고리",
        duration_minutes: 60,
        note: "",
        start_time: "09:00",
        end_time: "10:00",
        date: "2026-03-20",
        sessions: [],
        is_completed: false,
        ...overrides,
    };
}

function base_template(overrides: Partial<WorkTemplate> = {}): WorkTemplate {
    return {
        id: "tpl-1",
        project_code: "P1",
        work_name: "업무",
        task_name: "태스크",
        deal_name: "딜",
        category_name: "카테고리",
        note: "",
        color: "#ABCDEF",
        created_at: "",
        sort_order: 0,
        ...overrides,
    };
}


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
        const min_width = Math.max((3 / 540) * 100, 0.5);

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

describe("calculateBarStyle - 새벽 근무", () => {
    it("is_overnight 세션의 바가 자정을 넘어 확장된다", () => {
        const session = createSession({
            start_time: "22:00",
            end_time: "02:24",
            is_overnight: true,
        });
        // 22:00(1320) ~ 02:24(1584): range start=1260, end=1620
        const range: TimeRange = { start: 1260, end: 1620 };
        const result = calculateBarStyle(session, "#3182F6", range, 1500);

        const left = parseFloat(result.left);
        const width = parseFloat(result.width);
        expect(left).toBeGreaterThanOrEqual(0);
        expect(width).toBeGreaterThan(0);
        expect(left + width).toBeLessThanOrEqual(100);
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

    it("is_overnight 세션이 있으면 범위가 자정 넘어 확장된다", () => {
        const groups = [
            {
                sessions: [
                    createSession({
                        start_time: "22:00",
                        end_time: "02:24",
                        is_overnight: true,
                    }),
                ],
            },
        ];
        const result = calculateTimeRange(groups, 600, null);

        expect(result.end).toBeGreaterThanOrEqual(1584); // 02:24 = 144 + 1440
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

    it("자정 넘는 범위에서 24시 이후 라벨이 00:00, 01:00으로 표시된다", () => {
        // 23:00(1380) ~ 02:00(1560=120+1440)
        const labels = generateTimeLabels({ start: 1380, end: 1560 });

        expect(labels).toEqual(["23:00", "00:00", "01:00", "02:00"]);
    });
});

describe("calculateLunchOverlayStyle", () => {
    it.each([
        { label: "그리드 시작 이전", lunch_start: 300, lunch_end: 400 },
        { label: "그리드 종료 이후", lunch_start: 1100, lunch_end: 1160 },
    ])("점심시간이 $label이면 null을 반환한다", ({ lunch_start, lunch_end }) => {
        expect(
            calculateLunchOverlayStyle(lunch_start, lunch_end, DEFAULT_RANGE)
        ).toBeNull();
    });

    it("점심이 범위 안에 있으면 left와 width 퍼센트를 반환한다", () => {
        const lunch_start = 720;
        const lunch_end = 780;
        const result = calculateLunchOverlayStyle(
            lunch_start,
            lunch_end,
            DEFAULT_RANGE
        );

        const total = DEFAULT_RANGE.end - DEFAULT_RANGE.start;
        expect(result).toEqual({
            left: `${((lunch_start - DEFAULT_RANGE.start) / total) * 100}%`,
            width: `${((lunch_end - lunch_start) / total) * 100}%`,
        });
    });

    it("점심이 그리드보다 넓으면 보이는 구간만큼 자른다", () => {
        const result = calculateLunchOverlayStyle(480, 1200, DEFAULT_RANGE);

        expect(result).toEqual({
            left: "0%",
            width: "100%",
        });
    });
});

describe("calculateSelectionStyle", () => {
    it("선택 구간을 퍼센트로 변환한다", () => {
        const time_range: TimeRange = { start: 0, end: 120 };
        const result = calculateSelectionStyle(30, 90, time_range);

        expect(result).toEqual({ left: "25%", width: "50%" });
    });
});

describe("resolveSmartEdge", () => {
    it("실행 중인 세션이면 항상 left를 반환한다", () => {
        expect(resolveSmartEdge(30, 40, true)).toBe("left");
        expect(resolveSmartEdge(0, 40, true)).toBe("left");
        expect(resolveSmartEdge(39, 40, true)).toBe("left");
    });

    it("클릭 위치가 바 왼쪽 절반이면 left를 반환한다", () => {
        expect(resolveSmartEdge(5, 40, false)).toBe("left");
        expect(resolveSmartEdge(0, 40, false)).toBe("left");
        expect(resolveSmartEdge(19, 40, false)).toBe("left");
    });

    it("클릭 위치가 바 오른쪽 절반이면 right를 반환한다", () => {
        expect(resolveSmartEdge(25, 40, false)).toBe("right");
        expect(resolveSmartEdge(39, 40, false)).toBe("right");
    });

    it("클릭 위치가 정확히 중앙이면 right를 반환한다", () => {
        expect(resolveSmartEdge(20, 40, false)).toBe("right");
    });

    it("매우 좁은 바(4px)에서도 정상 동작한다", () => {
        expect(resolveSmartEdge(1, 4, false)).toBe("left");
        expect(resolveSmartEdge(3, 4, false)).toBe("right");
    });
});

describe("calculateResizingBarStyle", () => {
    const time_range: TimeRange = { start: 540, end: 1080 };
    const color = "#3182F6";

    it("왼쪽 핸들일 때 시작을 current_value로 쓰고 유효하면 스타일을 반환한다", () => {
        const result = calculateResizingBarStyle(
            "left",
            600,
            660,
            540,
            color,
            time_range
        );

        expect(result).not.toBeNull();
        expect(result?.backgroundColor).toBe(color);
        expect(result?.left).toBe("0%");
    });

    it("오른쪽 핸들일 때 종료를 current_value로 쓴다", () => {
        const result = calculateResizingBarStyle(
            "right",
            600,
            720,
            780,
            color,
            time_range
        );

        expect(result).not.toBeNull();
        expect(result?.left).toBe(`${((600 - 540) / 540) * 100}%`);
    });

    it("종료가 시작 이하이면 null을 반환한다", () => {
        expect(
            calculateResizingBarStyle(
                "right",
                600,
                660,
                600,
                color,
                time_range
            )
        ).toBeNull();
        expect(
            calculateResizingBarStyle("left", 600, 660, 700, color, time_range)
        ).toBeNull();
    });

    it("너비가 매우 작을 때 최소 0.5%로 올린다", () => {
        const total = 1080 - 540;
        const span_mins = 1;
        const raw_pct = (span_mins / total) * 100;
        expect(raw_pct).toBeLessThan(0.5);

        const result = calculateResizingBarStyle(
            "left",
            540,
            541,
            540,
            color,
            time_range
        );

        expect(result?.width).toBe("0.5%");
    });
});

describe("calculateConflictOverlayStyle", () => {
    it("충돌 구간을 퍼센트로 변환한다", () => {
        const time_range: TimeRange = { start: 100, end: 200 };
        const result = calculateConflictOverlayStyle(120, 160, time_range);

        expect(result).toEqual({ left: "20%", width: "40%" });
    });
});

describe("calculateWorkColor", () => {
    it("work_name과 deal_name이 일치하는 템플릿 색을 반환한다", () => {
        const record = base_record({ work_name: "A", deal_name: "B" });
        const templates = [
            base_template({
                work_name: "다른",
                deal_name: "값",
                color: "#111111",
            }),
            base_template({ work_name: "A", deal_name: "B", color: "#222222" }),
        ];

        const color = calculateWorkColor(record, templates);

        expect(color).toBe("#222222");
    });

    it("템플릿이 없으면 해시 기반 팔레트 색을 반환한다", () => {
        const record = base_record({ work_name: "고유키", deal_name: "조합" });
        const templates: WorkTemplate[] = [];

        const first = calculateWorkColor(record, templates);
        const second = calculateWorkColor(record, templates);

        expect(first).toBe(second);
        expect(first).toMatch(/^#[0-9A-F]{6}$/i);
    });
});

describe("xToMinutes", () => {
    it("그리드 내 상대 위치로 분을 반올림한다", () => {
        const time_range: TimeRange = { start: 540, end: 1080 };
        const x = 100 + 250;

        const mins = xToMinutes(x, GRID_RECT, time_range);

        expect(mins).toBe(810);
    });

    it("그리드 왼쪽 끝이면 time_range.start에 가깝다", () => {
        const time_range: TimeRange = { start: 600, end: 660 };

        const mins = xToMinutes(100, GRID_RECT, time_range);

        expect(mins).toBe(600);
    });
});
