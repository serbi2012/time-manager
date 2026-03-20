/**
 * admin statistics time_based 순수 함수 테스트
 */

import { vi } from "vitest";
import dayjs from "dayjs";
import {
    calculateDailyStats,
    calculateWeeklyStats,
    calculateMonthlyStats,
    calculateHourlyStats,
    calculateWeekdayStats,
} from "@/features/admin/lib/statistics/time_based";
import type { WorkRecord } from "@/shared/types";

const make_record = (
    date: string,
    sessions: Array<{ date?: string; start_time: string; duration_minutes: number }>,
    overrides: Partial<WorkRecord> = {}
): WorkRecord => ({
    id: crypto.randomUUID(),
    work_name: "작업",
    deal_name: "거래",
    task_name: "",
    category_name: "",
    project_code: "P001",
    note: "",
    date,
    start_time: sessions[0]?.start_time || "09:00",
    end_time: "18:00",
    duration_minutes: sessions.reduce((sum, ses) => sum + ses.duration_minutes, 0),
    sessions: sessions.map((s, i) => ({
        id: `ses-${i}`,
        date: s.date || date,
        start_time: s.start_time,
        end_time: "18:00",
        duration_minutes: s.duration_minutes,
    })),
    is_completed: false,
    ...overrides,
});

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 20));
});

afterEach(() => {
    vi.useRealTimers();
});

describe("calculateDailyStats", () => {
    it("기본 30일 구간이며 날짜 오름차순으로 반환한다", () => {
        const stats = calculateDailyStats([]);

        expect(stats).toHaveLength(30);
        expect(stats[0].date).toBe(dayjs().subtract(29, "day").format("YYYY-MM-DD"));
        expect(stats[stats.length - 1].date).toBe("2026-01-20");
    });

    it("구간 안의 세션은 합산되고 record_count·session_count가 올바르다", () => {
        const records = [
            make_record("2026-01-15", [{ start_time: "10:00", duration_minutes: 30 }]),
            make_record("2026-01-15", [{ start_time: "11:00", duration_minutes: 45 }]),
        ];

        const stats = calculateDailyStats(records, 30);
        const jan_15 = stats.find((s) => s.date === "2026-01-15");

        expect(jan_15?.total_minutes).toBe(75);
        expect(jan_15?.session_count).toBe(2);
        expect(jan_15?.record_count).toBe(2);
    });

    it("구간 밖 날짜는 세션·레코드 집계에서 제외된다", () => {
        const records = [
            make_record("2025-11-01", [{ start_time: "09:00", duration_minutes: 999 }]),
        ];

        const stats = calculateDailyStats(records, 30);
        const in_range_total = stats.reduce((sum, s) => sum + s.total_minutes, 0);

        expect(in_range_total).toBe(0);
        expect(stats.every((s) => s.session_count === 0)).toBe(true);
        expect(stats.every((s) => s.record_count === 0)).toBe(true);
    });

    it("is_deleted 레코드는 제외된다", () => {
        const records = [
            make_record("2026-01-19", [{ start_time: "09:00", duration_minutes: 60 }], {
                is_deleted: true,
            }),
            make_record("2026-01-19", [{ start_time: "10:00", duration_minutes: 20 }]),
        ];

        const stats = calculateDailyStats(records, 7);
        const day_stat = stats.find((s) => s.date === "2026-01-19");

        expect(day_stat?.total_minutes).toBe(20);
        expect(day_stat?.session_count).toBe(1);
        expect(day_stat?.record_count).toBe(1);
    });

    it("days 파라미터로 구간 길이를 바꿀 수 있다", () => {
        const records = [
            make_record("2026-01-20", [{ start_time: "09:00", duration_minutes: 10 }]),
        ];

        const stats = calculateDailyStats(records, 3);

        expect(stats).toHaveLength(3);
        expect(stats.map((s) => s.date)).toEqual(["2026-01-18", "2026-01-19", "2026-01-20"]);
        expect(stats[2].total_minutes).toBe(10);
        expect(stats[2].record_count).toBe(1);
        expect(stats[2].session_count).toBe(1);
    });

    it("세션 날짜가 레코드 날짜와 다르면 세션은 해당 날짜 키에만 반영된다", () => {
        const records = [
            make_record(
                "2026-01-19",
                [{ date: "2026-01-18", start_time: "09:00", duration_minutes: 40 }],
                { start_time: "09:00" }
            ),
        ];

        const stats = calculateDailyStats(records, 10);
        const jan_18 = stats.find((s) => s.date === "2026-01-18");
        const jan_19 = stats.find((s) => s.date === "2026-01-19");

        expect(jan_18?.total_minutes).toBe(40);
        expect(jan_18?.session_count).toBe(1);
        expect(jan_19?.record_count).toBe(1);
        expect(jan_19?.session_count).toBe(0);
    });

    it("세션이 없어도 레코드 날짜가 구간 안이면 record_count만 증가한다", () => {
        const records = [make_record("2026-01-20", [])];

        const stats = calculateDailyStats(records, 3);
        const today = stats.find((s) => s.date === "2026-01-20");

        expect(today?.record_count).toBe(1);
        expect(today?.session_count).toBe(0);
        expect(today?.total_minutes).toBe(0);
    });
});

describe("calculateWeeklyStats", () => {
    it("주 단위로 세션·레코드가 집계된다", () => {
        const records = [
            make_record("2026-01-20", [{ start_time: "09:00", duration_minutes: 100 }]),
        ];

        const stats = calculateWeeklyStats(records, 1);

        expect(stats).toHaveLength(1);
        expect(stats[0].total_minutes).toBe(100);
        expect(stats[0].session_count).toBe(1);
        expect(stats[0].record_count).toBe(1);
    });

    it("is_deleted 레코드는 주별 집계에서 제외된다", () => {
        const records = [
            make_record("2026-01-20", [{ start_time: "09:00", duration_minutes: 50 }], {
                is_deleted: true,
            }),
            make_record("2026-01-20", [{ start_time: "10:00", duration_minutes: 25 }]),
        ];

        const stats = calculateWeeklyStats(records, 1);

        expect(stats[0].total_minutes).toBe(25);
        expect(stats[0].session_count).toBe(1);
        expect(stats[0].record_count).toBe(1);
    });
});

describe("calculateMonthlyStats", () => {
    it("월 단위로 세션·레코드가 집계된다", () => {
        const records = [
            make_record("2026-01-10", [{ start_time: "09:00", duration_minutes: 200 }]),
        ];

        const stats = calculateMonthlyStats(records, 1);

        expect(stats).toHaveLength(1);
        expect(stats[0].date).toBe("2026-01");
        expect(stats[0].total_minutes).toBe(200);
        expect(stats[0].session_count).toBe(1);
        expect(stats[0].record_count).toBe(1);
    });

    it("다른 달 데이터는 해당 월 버킷에만 포함된다", () => {
        const records = [
            make_record("2025-12-31", [{ start_time: "09:00", duration_minutes: 10 }]),
            make_record("2026-01-05", [{ start_time: "09:00", duration_minutes: 20 }]),
        ];

        const stats = calculateMonthlyStats(records, 2);

        expect(stats).toHaveLength(2);
        const dec = stats.find((s) => s.date === "2025-12");
        const jan = stats.find((s) => s.date === "2026-01");

        expect(dec?.total_minutes).toBe(10);
        expect(jan?.total_minutes).toBe(20);
    });
});

describe("calculateHourlyStats", () => {
    it("시작 시각의 시(0~23)별로 24개 엔트리가 반환된다", () => {
        const records = [
            make_record("2026-01-20", [
                { start_time: "09:30", duration_minutes: 15 },
                { start_time: "14:00", duration_minutes: 40 },
            ]),
        ];

        const stats = calculateHourlyStats(records);

        expect(stats).toHaveLength(24);
        expect(stats[0].hour).toBe(0);
        expect(stats[23].hour).toBe(23);
        const h9 = stats.find((s) => s.hour === 9);
        const h14 = stats.find((s) => s.hour === 14);

        expect(h9?.total_minutes).toBe(15);
        expect(h9?.session_count).toBe(1);
        expect(h9?.label).toBe("09:00");
        expect(h14?.total_minutes).toBe(40);
        expect(h14?.session_count).toBe(1);
    });

    it("is_deleted 레코드는 시간대 통계에서 제외된다", () => {
        const records = [
            make_record("2026-01-20", [{ start_time: "10:00", duration_minutes: 99 }], {
                is_deleted: true,
            }),
            make_record("2026-01-20", [{ start_time: "10:00", duration_minutes: 11 }]),
        ];

        const stats = calculateHourlyStats(records);
        const h10 = stats.find((s) => s.hour === 10);

        expect(h10?.total_minutes).toBe(11);
        expect(h10?.session_count).toBe(1);
    });

    it("start_time이 없으면 해당 세션은 집계되지 않는다", () => {
        const records = [
            make_record("2026-01-20", [
                { start_time: "", duration_minutes: 50 },
                { start_time: "08:00", duration_minutes: 12 },
            ]),
        ];

        const stats = calculateHourlyStats(records);
        const h8 = stats.find((s) => s.hour === 8);

        expect(h8?.total_minutes).toBe(12);
        expect(h8?.session_count).toBe(1);
    });
});

describe("calculateWeekdayStats", () => {
    it("요일(0=일)~6까지 7개이며 레코드·세션이 요일별로 집계된다", () => {
        const records = [
            make_record("2026-01-20", [{ start_time: "09:00", duration_minutes: 60 }]),
        ];

        const stats = calculateWeekdayStats(records);

        expect(stats).toHaveLength(7);
        expect(stats.map((s) => s.weekday)).toEqual([0, 1, 2, 3, 4, 5, 6]);
        expect(stats.map((s) => s.weekday_name).join("")).toBe("일월화수목금토");

        const tuesday = stats.find((s) => s.weekday === dayjs("2026-01-20").day());
        expect(tuesday?.record_count).toBe(1);
        expect(tuesday?.session_count).toBe(1);
        expect(tuesday?.total_minutes).toBe(60);
    });

    it("세션 날짜의 요일로 세션 분이 합산되고 레코드는 record.date 요일에만 카운트된다", () => {
        const records = [
            make_record(
                "2026-01-20",
                [{ date: "2026-01-19", start_time: "09:00", duration_minutes: 30 }],
                { start_time: "09:00" }
            ),
        ];

        const stats = calculateWeekdayStats(records);
        const monday = stats.find((s) => s.weekday === dayjs("2026-01-19").day());
        const tuesday = stats.find((s) => s.weekday === dayjs("2026-01-20").day());

        expect(monday?.total_minutes).toBe(30);
        expect(monday?.session_count).toBe(1);
        expect(monday?.record_count).toBe(0);
        expect(tuesday?.record_count).toBe(1);
        expect(tuesday?.session_count).toBe(0);
    });

    it("is_deleted 레코드는 요일 통계에서 제외된다", () => {
        const records = [
            make_record("2026-01-20", [{ start_time: "09:00", duration_minutes: 40 }], {
                is_deleted: true,
            }),
        ];

        const stats = calculateWeekdayStats(records);
        const tuesday = stats.find((s) => s.weekday === dayjs("2026-01-20").day());

        expect(tuesday?.record_count).toBe(0);
        expect(tuesday?.session_count).toBe(0);
        expect(tuesday?.total_minutes).toBe(0);
    });
});
