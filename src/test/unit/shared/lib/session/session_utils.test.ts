/**
 * session_utils 순수 함수 테스트 — 사용자 점심시간 지원
 */

import { describe, it, expect } from "vitest";
import {
    getSessionMinutes,
    calculateTotalMinutes,
    sortSessionsByTime,
    filterSessionsByDate,
    type SessionLike,
} from "../../../../../shared/lib/session/session_utils";
import type { LunchTimeRange } from "../../../../../shared/lib/lunch/lunch_calculator";

const CUSTOM_LUNCH: LunchTimeRange = { start: 720, end: 780, duration: 60 }; // 12:00~13:00

describe("getSessionMinutes", () => {
    it("duration_minutes가 있으면 점심시간과 무관하게 그 값 반환", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "11:00",
            end_time: "14:00",
            duration_minutes: 150,
        };
        expect(getSessionMinutes(session)).toBe(150);
        expect(getSessionMinutes(session, CUSTOM_LUNCH)).toBe(150);
    });

    it("duration_minutes가 없으면 start/end로 계산 (기본 점심)", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "11:00",
            end_time: "13:00",
        };
        // 기본 점심 11:40~12:40 제외: 11:00~11:40(40) + 12:40~13:00(20) = 60분
        expect(getSessionMinutes(session)).toBe(60);
    });

    it("duration_minutes가 없으면 start/end로 계산 (커스텀 점심)", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "11:00",
            end_time: "13:00",
        };
        // 커스텀 점심 12:00~13:00 제외: 11:00~12:00(60) = 60분
        expect(getSessionMinutes(session, CUSTOM_LUNCH)).toBe(60);
    });

    it("커스텀 점심시간에 따라 결과가 달라지는 케이스", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "11:30",
            end_time: "12:30",
        };
        // 기본 점심 11:40~12:40: 11:30~11:40(10분)
        expect(getSessionMinutes(session)).toBe(10);
        // 커스텀 점심 12:00~13:00: 11:30~12:00(30분)
        expect(getSessionMinutes(session, CUSTOM_LUNCH)).toBe(30);
    });
});

describe("calculateTotalMinutes", () => {
    it("세션 목록의 총 시간 계산 (커스텀 점심 전달)", () => {
        const sessions: SessionLike[] = [
            {
                id: "s1",
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
            {
                id: "s2",
                start_time: "14:00",
                end_time: "15:00",
                duration_minutes: 60,
            },
        ];
        expect(calculateTotalMinutes(sessions, CUSTOM_LUNCH)).toBe(120);
    });

    it("빈 배열은 0 반환", () => {
        expect(calculateTotalMinutes([], CUSTOM_LUNCH)).toBe(0);
    });
});

describe("getSessionMinutes - 새벽 근무 (is_overnight)", () => {
    it("is_overnight 세션의 duration_minutes가 있으면 그 값 반환", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "22:00",
            end_time: "02:24",
            duration_minutes: 264,
            is_overnight: true,
        };
        expect(getSessionMinutes(session)).toBe(264);
    });

    it("is_overnight 세션의 duration_minutes가 없으면 자정 넘김으로 계산", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "22:00",
            end_time: "02:24",
            is_overnight: true,
        };
        // 22:00(1320) ~ 02:24(144+1440=1584) = 264분
        expect(getSessionMinutes(session)).toBe(264);
    });

    it("is_overnight가 false이고 end < start이면 0 반환", () => {
        const session: SessionLike = {
            id: "s1",
            start_time: "22:00",
            end_time: "02:24",
            is_overnight: false,
        };
        expect(getSessionMinutes(session)).toBe(0);
    });
});

describe("sortSessionsByTime", () => {
    it("서로 다른 date는 문자열 비교 순으로 정렬된다", () => {
        const sessions: SessionLike[] = [
            { id: "b", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
            { id: "a", date: "2024-01-01", start_time: "14:00", end_time: "15:00" },
        ];

        const sorted = sortSessionsByTime(sessions);

        expect(sorted.map((s) => s.id)).toEqual(["a", "b"]);
    });

    it("같은 date면 start_time 순으로 정렬된다", () => {
        const sessions: SessionLike[] = [
            { id: "late", date: "2024-01-01", start_time: "11:00", end_time: "12:00" },
            { id: "early", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
        ];

        const sorted = sortSessionsByTime(sessions);

        expect(sorted.map((s) => s.id)).toEqual(["early", "late"]);
    });

    it("date가 없는 세션은 record_date를 날짜 키로 사용한다", () => {
        const sessions: SessionLike[] = [
            { id: "no_date_late", start_time: "11:00", end_time: "12:00" },
            { id: "dated", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
        ];

        const sorted_with_record = sortSessionsByTime(sessions, "2024-01-02");

        expect(sorted_with_record[0]?.id).toBe("dated");
        expect(sorted_with_record[1]?.id).toBe("no_date_late");

        const both_no_date: SessionLike[] = [
            { id: "second", start_time: "10:00", end_time: "11:00" },
            { id: "first", start_time: "09:00", end_time: "10:00" },
        ];

        const sorted_same_record_day = sortSessionsByTime(both_no_date, "2024-01-01");

        expect(sorted_same_record_day.map((s) => s.id)).toEqual(["first", "second"]);
    });

    it("빈 배열이면 빈 배열을 반환한다", () => {
        const sessions: SessionLike[] = [];

        const sorted = sortSessionsByTime(sessions);

        expect(sorted).toEqual([]);
    });

    it("원본 배열을 변경하지 않는다", () => {
        const sessions: SessionLike[] = [
            { id: "b", start_time: "11:00", end_time: "12:00" },
            { id: "a", start_time: "09:00", end_time: "10:00" },
        ];
        const snapshot = sessions.map((s) => ({ ...s }));

        const sorted = sortSessionsByTime(sessions, "2024-01-01");

        expect(sorted).not.toBe(sessions);
        expect(sessions).toEqual(snapshot);
    });
});

describe("filterSessionsByDate", () => {
    it("session.date가 target_date와 일치하는 항목만 남긴다", () => {
        const sessions: SessionLike[] = [
            { id: "keep", date: "2024-01-01", start_time: "09:00", end_time: "10:00" },
            { id: "drop", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
        ];

        const filtered = filterSessionsByDate(sessions, "2024-01-01");

        expect(filtered.map((s) => s.id)).toEqual(["keep"]);
    });

    it("date가 없으면 record_date와 target_date를 비교한다", () => {
        const sessions: SessionLike[] = [
            { id: "match", start_time: "09:00", end_time: "10:00" },
            { id: "also_match", start_time: "10:00", end_time: "11:00" },
        ];

        const filtered = filterSessionsByDate(sessions, "2024-01-01", "2024-01-01");

        expect(filtered).toHaveLength(2);

        const filtered_miss = filterSessionsByDate(sessions, "2024-01-02", "2024-01-01");

        expect(filtered_miss).toHaveLength(0);
    });

    it("혼합된 date와 record_date fallback이 올바르게 동작한다", () => {
        const sessions: SessionLike[] = [
            { id: "explicit", date: "2024-01-02", start_time: "09:00", end_time: "10:00" },
            { id: "implicit", start_time: "10:00", end_time: "11:00" },
        ];

        const filtered = filterSessionsByDate(sessions, "2024-01-02", "2024-01-02");

        expect(filtered.map((s) => s.id).sort()).toEqual(["explicit", "implicit"]);
    });
});

describe("getSessionMinutes (레거시 duration_seconds)", () => {
    it.each([
        { duration_seconds: 125, expected: 3 },
        { duration_seconds: 120, expected: 2 },
    ])("duration_seconds $duration_seconds초는 $expected분으로 올림한다", ({ duration_seconds, expected }) => {
        const session: SessionLike & { duration_seconds: number } = {
            id: "legacy",
            start_time: "09:00",
            end_time: "18:00",
            duration_seconds,
        };

        expect(getSessionMinutes(session)).toBe(expected);
    });
});
