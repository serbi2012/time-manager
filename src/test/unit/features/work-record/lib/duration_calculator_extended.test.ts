/**
 * duration_calculator 추가 분기 테스트
 */

import {
    getRecordDurationMinutes,
    getRecordDurationForDate,
    getTimeRangeForDate,
    recalculateRecordDuration,
} from "@/features/work-record/lib/duration_calculator";
import type { WorkRecord } from "@/shared/types";

function base_record(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "ext-id",
        work_name: "작업",
        deal_name: "",
        task_name: "",
        category_name: "",
        project_code: "",
        note: "",
        date: "2024-01-15",
        start_time: "09:00",
        end_time: "18:00",
        duration_minutes: 0,
        is_completed: false,
        sessions: [],
        ...overrides,
    };
}

describe("getRecordDurationMinutes (확장)", () => {
    it("duration_minutes가 NaN이면 세션 합산으로 대체한다", () => {
        const record = base_record({
            duration_minutes: Number.NaN,
            sessions: [
                {
                    id: "s1",
                    date: "2024-01-15",
                    start_time: "10:00",
                    end_time: "12:00",
                    duration_minutes: 90,
                },
            ],
        });

        const minutes = getRecordDurationMinutes(record);

        expect(minutes).toBe(90);
    });

    it("duration_minutes가 0이면 세션 합산을 사용한다", () => {
        const record = base_record({
            duration_minutes: 0,
            sessions: [
                {
                    id: "s1",
                    date: "2024-01-15",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 45,
                },
            ],
        });

        const minutes = getRecordDurationMinutes(record);

        expect(minutes).toBe(45);
    });

    it("세션 합이 0이면 레코드 start_time·end_time 차이를 사용한다", () => {
        const record = base_record({
            duration_minutes: 0,
            sessions: [
                {
                    id: "s1",
                    date: "2024-01-15",
                    start_time: "09:00",
                    end_time: "09:00",
                    duration_minutes: 0,
                },
            ],
            start_time: "08:00",
            end_time: "09:30",
        });

        const minutes = getRecordDurationMinutes(record);

        expect(minutes).toBe(90);
    });

    it("세션 합이 0이고 start·end 차이도 0 이하면 0을 반환한다", () => {
        const record = base_record({
            duration_minutes: 0,
            sessions: [
                {
                    id: "s1",
                    date: "2024-01-15",
                    start_time: "12:00",
                    end_time: "12:00",
                    duration_minutes: 0,
                },
            ],
            start_time: "14:00",
            end_time: "14:00",
        });

        const minutes = getRecordDurationMinutes(record);

        expect(minutes).toBe(0);
    });

    it("세션·시간 정보가 없으면 0을 반환한다", () => {
        const record = base_record({
            duration_minutes: 0,
            sessions: [],
            start_time: "",
            end_time: "",
        });

        const minutes = getRecordDurationMinutes(record);

        expect(minutes).toBe(0);
    });
});

describe("getRecordDurationForDate (확장)", () => {
    it("세션이 없고 날짜가 일치하면 getRecordDurationMinutes 결과를 반환한다", () => {
        const record = base_record({
            date: "2024-01-15",
            sessions: [],
            duration_minutes: 0,
            start_time: "10:00",
            end_time: "11:30",
        });

        const minutes = getRecordDurationForDate(record, "2024-01-15");

        expect(minutes).toBe(90);
    });

    it("세션이 없고 날짜가 다르면 0을 반환한다", () => {
        const record = base_record({
            date: "2024-01-15",
            sessions: [],
            duration_minutes: 120,
        });

        const minutes = getRecordDurationForDate(record, "2024-01-16");

        expect(minutes).toBe(0);
    });

    it("세션은 있으나 대상 날짜에 맞는 세션이 없으면 0을 반환한다", () => {
        const record = base_record({
            date: "2024-01-15",
            sessions: [
                {
                    id: "s1",
                    date: "2024-01-16",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                },
            ],
        });

        const minutes = getRecordDurationForDate(record, "2024-01-15");

        expect(minutes).toBe(0);
    });

    it("여러 날짜의 세션 중 해당 날짜만 합산한다", () => {
        const record = base_record({
            sessions: [
                {
                    id: "a",
                    date: "2024-01-15",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                },
                {
                    id: "b",
                    date: "2024-01-16",
                    start_time: "10:00",
                    end_time: "12:00",
                    duration_minutes: 120,
                },
            ],
        });

        const for_15 = getRecordDurationForDate(record, "2024-01-15");
        const for_16 = getRecordDurationForDate(record, "2024-01-16");

        expect(for_15).toBe(60);
        expect(for_16).toBe(120);
    });
});

describe("getTimeRangeForDate (확장)", () => {
    it("세션이 없고 날짜가 일치하면 레코드의 시작·종료 시각을 반환한다", () => {
        const record = base_record({
            date: "2024-01-15",
            sessions: [],
            start_time: "08:30",
            end_time: "17:45",
        });

        const range = getTimeRangeForDate(record, "2024-01-15");

        expect(range).toEqual({ start_time: "08:30", end_time: "17:45" });
    });

    it("세션이 없고 날짜가 다르면 빈 문자열 범위를 반환한다", () => {
        const record = base_record({
            date: "2024-01-15",
            sessions: [],
            start_time: "09:00",
            end_time: "18:00",
        });

        const range = getTimeRangeForDate(record, "2024-01-14");

        expect(range).toEqual({ start_time: "", end_time: "" });
    });

    it("start_time이 비어 있으면 00:00으로 정렬해 가장 이른 시작을 고른다", () => {
        const record = base_record({
            sessions: [
                {
                    id: "s1",
                    date: "2024-01-15",
                    start_time: "11:00",
                    end_time: "12:00",
                    duration_minutes: 60,
                },
                {
                    id: "s2",
                    date: "2024-01-15",
                    start_time: "",
                    end_time: "10:00",
                    duration_minutes: 0,
                },
            ],
        });

        const range = getTimeRangeForDate(record, "2024-01-15");

        expect(range.start_time).toBe("");
        expect(range.end_time).toBe("12:00");
    });

    it("같은 날 여러 세션을 시작 시각 순으로 묶어 첫 시작과 마지막 종료를 반환한다", () => {
        const record = base_record({
            sessions: [
                {
                    id: "late",
                    date: "2024-01-15",
                    start_time: "15:00",
                    end_time: "16:00",
                    duration_minutes: 60,
                },
                {
                    id: "early",
                    date: "2024-01-15",
                    start_time: "09:00",
                    end_time: "11:00",
                    duration_minutes: 120,
                },
                {
                    id: "mid",
                    date: "2024-01-15",
                    start_time: "12:00",
                    end_time: "14:00",
                    duration_minutes: 120,
                },
            ],
        });

        const range = getTimeRangeForDate(record, "2024-01-15");

        expect(range).toEqual({ start_time: "09:00", end_time: "16:00" });
    });
});

describe("recalculateRecordDuration (확장)", () => {
    it("세션 배열이 비어 있으면 동일 레코드 참조를 반환한다", () => {
        const record = base_record({ sessions: [] });

        const updated = recalculateRecordDuration(record);

        expect(updated).toBe(record);
    });

    it("세션을 날짜 후 시간 순으로 정렬한다", () => {
        const record = base_record({
            sessions: [
                {
                    id: "b",
                    date: "2024-01-16",
                    start_time: "09:00",
                    end_time: "10:00",
                    duration_minutes: 60,
                },
                {
                    id: "a",
                    date: "2024-01-15",
                    start_time: "14:00",
                    end_time: "15:00",
                    duration_minutes: 60,
                },
                {
                    id: "c",
                    date: "2024-01-15",
                    start_time: "09:00",
                    end_time: "12:00",
                    duration_minutes: 180,
                },
            ],
            start_time: "01:01",
            end_time: "02:02",
        });

        const updated = recalculateRecordDuration(record);

        expect(updated.sessions.map((s) => s.id)).toEqual(["c", "a", "b"]);
        expect(updated.start_time).toBe("09:00");
        expect(updated.end_time).toBe("10:00");
        expect(updated.duration_minutes).toBe(300);
    });

    it("세션 합이 0이어도 duration_minutes는 최소 1로 설정된다", () => {
        const record = base_record({
            sessions: [
                {
                    id: "z",
                    date: "2024-01-15",
                    start_time: "10:00",
                    end_time: "10:00",
                    duration_minutes: 0,
                },
            ],
        });

        const updated = recalculateRecordDuration(record);

        expect(updated.duration_minutes).toBe(1);
    });
});
