/**
 * conflict_finder 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    findConflicts,
    countConflicts,
} from "../../../../../features/admin/lib/conflict_finder";
import type { WorkRecord, WorkSession } from "../../../../../shared/types";

// 테스트용 세션 헬퍼
function createTestSession(overrides: Partial<WorkSession> & { id?: string; date?: string; start_time?: string; end_time?: string } = {}): WorkSession {
    const start = overrides.start_time ?? "09:00";
    const end = overrides.end_time ?? "12:00";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const duration = end ? Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) : 0;
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

describe("conflict_finder", () => {
    describe("findConflicts", () => {
        it("같은 날짜에 시간이 겹치는 세션 감지", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    work_name: "작업1",
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    work_name: "작업2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-15",
                            start_time: "11:00",
                            end_time: "14:00",
                        }),
                    ],
                }),
            ];

            const conflicts = findConflicts(records);

            expect(conflicts).toHaveLength(1);
            expect(conflicts[0].overlap_minutes).toBe(60); // 11:00 - 12:00
        });

        it("다른 날짜의 세션은 충돌하지 않음", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-16",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
            ];

            const conflicts = findConflicts(records);

            expect(conflicts).toHaveLength(0);
        });

        it("인접한 시간은 충돌하지 않음", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-15",
                            start_time: "12:00",
                            end_time: "14:00",
                        }),
                    ],
                }),
            ];

            const conflicts = findConflicts(records);

            expect(conflicts).toHaveLength(0);
        });

        it("삭제된 레코드 제외", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    is_deleted: true,
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-15",
                            start_time: "11:00",
                            end_time: "14:00",
                        }),
                    ],
                }),
            ];

            const conflicts = findConflicts(records);

            expect(conflicts).toHaveLength(0);
        });

        it("시간 정보가 없는 세션 제외", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "",  // 종료 시간 없음
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
            ];

            const conflicts = findConflicts(records);

            expect(conflicts).toHaveLength(0);
        });

        it("3개 이상 세션이 겹치는 경우 모든 쌍 감지", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    work_name: "작업1",
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    work_name: "작업2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-15",
                            start_time: "10:00",
                            end_time: "11:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r3",
                    work_name: "작업3",
                    sessions: [
                        createTestSession({
                            id: "s3",
                            date: "2024-01-15",
                            start_time: "10:30",
                            end_time: "13:00",
                        }),
                    ],
                }),
            ];

            const conflicts = findConflicts(records);

            // s1-s2, s1-s3, s2-s3 모두 충돌
            expect(conflicts).toHaveLength(3);
        });
    });

    describe("countConflicts", () => {
        it("충돌 수 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "r1",
                    sessions: [
                        createTestSession({
                            id: "s1",
                            date: "2024-01-15",
                            start_time: "09:00",
                            end_time: "12:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    sessions: [
                        createTestSession({
                            id: "s2",
                            date: "2024-01-15",
                            start_time: "11:00",
                            end_time: "14:00",
                        }),
                    ],
                }),
                createTestRecord({
                    id: "r3",
                    sessions: [
                        createTestSession({
                            id: "s3",
                            date: "2024-01-15",
                            start_time: "16:00",
                            end_time: "18:00",
                        }),
                    ],
                }),
            ];

            const count = countConflicts(records);

            expect(count).toBe(1);
        });
    });
});
