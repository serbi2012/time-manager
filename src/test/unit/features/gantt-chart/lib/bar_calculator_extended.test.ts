import type { WorkRecord, WorkTemplate } from "@/shared/types";
import {
    calculateConflictOverlayStyle,
    calculateLunchOverlayStyle,
    calculateResizingBarStyle,
    calculateSelectionStyle,
    calculateWorkColor,
    formatResizeTimeIndicator,
    resolveSmartEdge,
    xToMinutes,
    type TimeRange,
} from "@/features/gantt-chart/lib/bar_calculator";

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

describe("calculateLunchOverlayStyle", () => {
    const time_range: TimeRange = { start: 540, end: 1080 };

    it("점심 종료가 그리드 시작 이하이면 null이다", () => {
        const result = calculateLunchOverlayStyle(300, 400, time_range);

        expect(result).toBeNull();
    });

    it("점심 시작이 그리드 종료 이상이면 null이다", () => {
        const result = calculateLunchOverlayStyle(1200, 1260, time_range);

        expect(result).toBeNull();
    });

    it("점심이 범위 안에 있으면 left와 width 퍼센트를 반환한다", () => {
        const lunch_start = 720;
        const lunch_end = 780;
        const result = calculateLunchOverlayStyle(
            lunch_start,
            lunch_end,
            time_range
        );

        const total = time_range.end - time_range.start;
        expect(result).toEqual({
            left: `${((lunch_start - time_range.start) / total) * 100}%`,
            width: `${((lunch_end - lunch_start) / total) * 100}%`,
        });
    });

    it("점심이 그리드보다 넓으면 보이는 구간만큼 자른다", () => {
        const result = calculateLunchOverlayStyle(480, 1200, time_range);

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

describe("formatResizeTimeIndicator", () => {
    it("왼쪽 핸들이면 시작을 current_value로 표시한다", () => {
        const text = formatResizeTimeIndicator("left", 600, 720, 570);

        expect(text).toBe("09:30 ~ 12:00");
    });

    it("오른쪽 핸들이면 종료를 current_value로 표시한다", () => {
        const text = formatResizeTimeIndicator("right", 600, 720, 780);

        expect(text).toBe("10:00 ~ 13:00");
    });
});

describe("resolveSmartEdge", () => {
    it("실행 중이면 항상 left이다", () => {
        expect(resolveSmartEdge(999, 10, true)).toBe("left");
    });

    it("실행 중이 아니면 클릭이 바 중앙 미만이면 left이다", () => {
        expect(resolveSmartEdge(24, 50, false)).toBe("left");
    });

    it("클릭이 바 중앙 이상이면 right이다", () => {
        expect(resolveSmartEdge(25, 50, false)).toBe("right");
    });
});
