/**
 * session_utils 순수 함수 테스트 — 사용자 점심시간 지원
 */

import { describe, it, expect } from "vitest";
import {
    getSessionMinutes,
    calculateTotalMinutes,
    createSession,
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
            { id: "s1", start_time: "09:00", end_time: "10:00", duration_minutes: 60 },
            { id: "s2", start_time: "14:00", end_time: "15:00", duration_minutes: 60 },
        ];
        expect(calculateTotalMinutes(sessions, CUSTOM_LUNCH)).toBe(120);
    });

    it("빈 배열은 0 반환", () => {
        expect(calculateTotalMinutes([], CUSTOM_LUNCH)).toBe(0);
    });
});

describe("createSession", () => {
    it("커스텀 점심시간으로 세션 생성 시 duration_minutes가 달라짐", () => {
        // 2026-01-20 11:00 ~ 13:00
        const start = new Date(2026, 0, 20, 11, 0).getTime();
        const end = new Date(2026, 0, 20, 13, 0).getTime();

        const default_session = createSession(start, end);
        const custom_session = createSession(start, end, CUSTOM_LUNCH);

        // 기본 점심(11:40~12:40) 제외: 40 + 20 = 60분
        expect(default_session.duration_minutes).toBe(60);
        // 커스텀 점심(12:00~13:00) 제외: 60 + 0 = 60분
        expect(custom_session.duration_minutes).toBe(60);

        // 11:30 ~ 12:30 케이스에서 차이 발생
        const start2 = new Date(2026, 0, 20, 11, 30).getTime();
        const end2 = new Date(2026, 0, 20, 12, 30).getTime();

        const default_session2 = createSession(start2, end2);
        const custom_session2 = createSession(start2, end2, CUSTOM_LUNCH);

        // 기본: 11:30~11:40 = 10분
        expect(default_session2.duration_minutes).toBe(10);
        // 커스텀: 11:30~12:00 = 30분
        expect(custom_session2.duration_minutes).toBe(30);
    });
});
