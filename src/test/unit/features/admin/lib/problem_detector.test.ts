/**
 * problem_detector 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    detectSessionProblems,
    findProblemSessions,
    countProblemSessions,
} from "../../../../../features/admin/lib/problem_detector";
import type { WorkRecord, WorkSession } from "../../../../../shared/types";

// 테스트용 세션 헬퍼
function createTestSession(overrides: Partial<WorkSession> & { id?: string; date?: string; start_time?: string; end_time?: string } = {}): WorkSession {
    const start = overrides.start_time ?? "09:00";
    const end = overrides.end_time ?? "12:00";
    const [sh, sm] = start ? start.split(":").map(Number) : [0, 0];
    const [eh, em] = end ? end.split(":").map(Number) : [0, 0];
    const duration = (start && end) ? Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) : 0;
    return {
        id: overrides.id ?? "test-session",
        date: overrides.date ?? "2024-01-15",
        start_time: start,
        end_time: end,
        duration_minutes: overrides.duration_minutes ?? duration,
    };
}

// 테스트용 레코드 헬퍼
function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "",
        task_name: "",
        category_name: "테스트",
        project_code: "",
        date: "2024-01-15",
        start_time: "09:00",
        end_time: "18:00",
        duration_minutes: 0,
        note: "",
        is_completed: false,
        sessions: [],
        ...overrides,
    };
}

describe("problem_detector", () => {
    describe("detectSessionProblems", () => {
        it("정상 세션은 문제 없음", () => {
            const session = createTestSession({
                start_time: "09:00",
                end_time: "12:00",
            });

            const problems = detectSessionProblems(session, "2024-01-15");

            expect(problems).toHaveLength(0);
        });

        it("시간 정보가 없는 세션 감지 (missing_time)", () => {
            const session = createTestSession({
                start_time: "",
                end_time: "",
            });

            const problems = detectSessionProblems(session, "2024-01-15");

            expect(problems).toHaveLength(1);
            expect(problems[0].type).toBe("missing_time");
        });

        it("종료 시간이 없는 세션 감지", () => {
            const session = createTestSession({
                start_time: "09:00",
                end_time: "",
            });

            const problems = detectSessionProblems(session, "2024-01-15");

            expect(problems.some(p => p.type === "missing_time")).toBe(true);
        });

        it("0분 세션 감지 (zero_duration)", () => {
            const session = createTestSession({
                start_time: "09:00",
                end_time: "09:00",
            });

            const problems = detectSessionProblems(session, "2024-01-15");

            expect(problems.some(p => p.type === "zero_duration")).toBe(true);
        });

        it("잘못된 시간 형식 감지 (invalid_time)", () => {
            const session = createTestSession({
                start_time: "25:00",
                end_time: "12:00",
            });

            const problems = detectSessionProblems(session, "2024-01-15");

            expect(problems.some(p => p.type === "invalid_time")).toBe(true);
        });
    });

    describe("findProblemSessions", () => {
        it("문제가 있는 세션만 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({ id: "s1", start_time: "09:00", end_time: "12:00" }),
                        createTestSession({ id: "s2", start_time: "", end_time: "" }),
                    ],
                }),
            ];

            const problem_map = findProblemSessions(records);

            expect(problem_map.size).toBe(1);
            expect(problem_map.has("s2")).toBe(true);
        });

        it("모든 세션이 정상이면 빈 Map 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({ id: "s1", start_time: "09:00", end_time: "12:00" }),
                        createTestSession({ id: "s2", start_time: "14:00", end_time: "18:00" }),
                    ],
                }),
            ];

            const problem_map = findProblemSessions(records);

            expect(problem_map.size).toBe(0);
        });

        it("삭제된 레코드 제외", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    is_deleted: true,
                    sessions: [
                        createTestSession({ id: "s1", start_time: "", end_time: "" }),
                    ],
                }),
            ];

            const problem_map = findProblemSessions(records);

            expect(problem_map.size).toBe(0);
        });
    });

    describe("countProblemSessions", () => {
        it("문제 세션 수 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({ id: "s1", start_time: "09:00", end_time: "12:00" }),
                        createTestSession({ id: "s2", start_time: "", end_time: "" }),
                        createTestSession({ id: "s3", start_time: "14:00", end_time: "14:00" }),
                    ],
                }),
            ];

            const count = countProblemSessions(records);

            expect(count).toBe(2);
        });
    });
});
