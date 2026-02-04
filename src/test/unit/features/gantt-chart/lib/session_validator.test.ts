import { describe, it, expect } from "vitest";
import {
    validateTimeFormat,
    validateTimeOrder,
    validateMinDuration,
    validateSessionOverlap,
    validateSessionTime,
} from "@/features/gantt-chart/lib/session_validator";
import type { WorkSession } from "@/shared/types";

describe("session_validator", () => {
    describe("validateTimeFormat", () => {
        it("올바른 시간 형식 (HH:mm) 통과", () => {
            const valid_times = ["09:00", "12:30", "18:45", "00:00", "23:59"];

            valid_times.forEach((time) => {
                const result = validateTimeFormat(time);
                expect(result.is_valid).toBe(true);
            });
        });

        it("잘못된 시간 형식 거부", () => {
            const invalid_times = [
                "24:00", // 24시
                "12:60", // 60분
                "12:5", // 한 자리 분
                "12-30", // 잘못된 구분자
                "1230", // 콜론 없음
                "ab:cd", // 문자
            ];

            invalid_times.forEach((time) => {
                const result = validateTimeFormat(time);
                expect(result.is_valid).toBe(false);
                expect(result.error_message).toBeDefined();
            });
        });

        it("한 자리 시 형식도 허용", () => {
            const single_digit_times = ["0:00", "9:00", "9:30"];

            single_digit_times.forEach((time) => {
                const result = validateTimeFormat(time);
                expect(result.is_valid).toBe(true);
            });
        });
    });

    describe("validateTimeOrder", () => {
        it("시작 시간이 종료 시간보다 이르면 통과", () => {
            const result = validateTimeOrder("09:00", "12:00");
            expect(result.is_valid).toBe(true);
        });

        it("시작 시간과 종료 시간이 같으면 실패", () => {
            const result = validateTimeOrder("09:00", "09:00");
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("늦습니다");
        });

        it("시작 시간이 종료 시간보다 늦으면 실패", () => {
            const result = validateTimeOrder("12:00", "09:00");
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("늦습니다");
        });
    });

    describe("validateMinDuration", () => {
        it("최소 작업 시간을 만족하면 통과", () => {
            const result = validateMinDuration("09:00", "09:30", 30);
            expect(result.is_valid).toBe(true);
        });

        it("최소 작업 시간 미만이면 실패", () => {
            const result = validateMinDuration("09:00", "09:20", 30);
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("30분");
        });

        it("기본 최소 작업 시간 (1분) 적용", () => {
            const result = validateMinDuration("09:00", "09:01");
            expect(result.is_valid).toBe(true);
        });
    });

    describe("validateSessionOverlap", () => {
        const existing_sessions: WorkSession[] = [
            {
                id: "session-1",
                date: "2026-02-04",
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
            {
                id: "session-2",
                date: "2026-02-04",
                start_time: "14:00",
                end_time: "16:00",
                duration_minutes: 120,
            },
        ];

        it("기존 세션과 겹치지 않으면 통과", () => {
            const result = validateSessionOverlap(
                "10:30",
                "11:30",
                existing_sessions
            );
            expect(result.is_valid).toBe(true);
        });

        it("기존 세션과 완전히 겹치면 실패", () => {
            const result = validateSessionOverlap(
                "09:30",
                "10:30",
                existing_sessions
            );
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("겹칩니다");
        });

        it("기존 세션을 포함하면 실패", () => {
            const result = validateSessionOverlap(
                "08:00",
                "11:00",
                existing_sessions
            );
            expect(result.is_valid).toBe(false);
        });

        it("기존 세션에 포함되면 실패", () => {
            const result = validateSessionOverlap(
                "14:30",
                "15:30",
                existing_sessions
            );
            expect(result.is_valid).toBe(false);
        });

        it("수정 중인 세션은 제외", () => {
            const result = validateSessionOverlap(
                "09:30",
                "10:30",
                existing_sessions,
                "session-1"
            );
            expect(result.is_valid).toBe(true);
        });

        it("진행 중 세션 (end_time 없음)은 검증 제외", () => {
            const sessions_with_active: WorkSession[] = [
                ...existing_sessions,
                {
                    id: "active",
                    date: "2026-02-04",
                    start_time: "17:00",
                    end_time: "", // 진행 중
                    duration_minutes: 0,
                },
            ];

            const result = validateSessionOverlap(
                "17:30",
                "18:00",
                sessions_with_active
            );
            expect(result.is_valid).toBe(true);
        });
    });

    describe("validateSessionTime", () => {
        const existing_sessions: WorkSession[] = [
            {
                id: "session-1",
                date: "2026-02-04",
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ];

        it("모든 검증을 통과하면 성공", () => {
            const result = validateSessionTime("10:30", "11:30", {
                existing_sessions,
                min_duration: 30,
            });
            expect(result.is_valid).toBe(true);
        });

        it("시간 형식이 잘못되면 실패", () => {
            const result = validateSessionTime("25:00", "10:00");
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("형식");
        });

        it("시간 순서가 잘못되면 실패", () => {
            const result = validateSessionTime("12:00", "09:00");
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("늦습니다");
        });

        it("최소 작업 시간 미만이면 실패", () => {
            const result = validateSessionTime("09:00", "09:20", {
                min_duration: 30,
            });
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("30분");
        });

        it("기존 세션과 겹치면 실패", () => {
            const result = validateSessionTime("09:30", "10:30", {
                existing_sessions,
            });
            expect(result.is_valid).toBe(false);
            expect(result.error_message).toContain("겹칩니다");
        });

        it("옵션 없이도 기본 검증 수행", () => {
            const result = validateSessionTime("09:00", "10:00");
            expect(result.is_valid).toBe(true);
        });
    });
});
