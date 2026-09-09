/**
 * week_grouper 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    getTotalMinutesForWork,
    getTotalMinutesForDeal,
    buildDayGroups,
    isHiddenProjectCode,
} from "@/features/weekly-schedule/lib/week_grouper";
import type { WorkRecord, WorkSession } from "@/shared/types";

function createSession(
    overrides: Partial<WorkSession> & { date: string; duration_minutes: number }
): WorkSession {
    return {
        id: `s-${Math.random().toString(36).slice(2, 8)}`,
        start_time: "09:00",
        end_time: "10:00",
        ...overrides,
    };
}

function createRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: `r-${Math.random().toString(36).slice(2, 8)}`,
        work_name: "작업A",
        deal_name: "",
        task_name: "",
        category_name: "",
        project_code: "P001",
        date: "2025-02-17",
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        note: "",
        is_completed: false,
        sessions: [],
        ...overrides,
    };
}

describe("week_grouper", () => {
    describe("getTotalMinutesForWork", () => {
        it("work_name 기준 해당 날짜까지 세션 합산", () => {
            const records = [
                createRecord({
                    work_name: "작업A",
                    date: "2025-02-17",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 60,
                        }),
                        createSession({
                            date: "2025-02-18",
                            duration_minutes: 30,
                        }),
                    ],
                }),
            ];

            expect(getTotalMinutesForWork(records, "작업A", "2025-02-17")).toBe(
                60
            );
            expect(getTotalMinutesForWork(records, "작업A", "2025-02-18")).toBe(
                90
            );
        });

        it("삭제된 레코드는 제외", () => {
            const records = [
                createRecord({
                    work_name: "작업A",
                    is_deleted: true,
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 60,
                        }),
                    ],
                }),
            ];

            expect(getTotalMinutesForWork(records, "작업A", "2025-02-17")).toBe(
                0
            );
        });

        it("다른 work_name은 포함하지 않음", () => {
            const records = [
                createRecord({
                    work_name: "작업A",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 60,
                        }),
                    ],
                }),
                createRecord({
                    work_name: "작업B",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 120,
                        }),
                    ],
                }),
            ];

            expect(getTotalMinutesForWork(records, "작업A", "2025-02-17")).toBe(
                60
            );
        });
    });

    describe("getTotalMinutesForDeal", () => {
        it("work_name + deal_name 기준 해당 날짜까지 합산", () => {
            const records = [
                createRecord({
                    work_name: "작업A",
                    deal_name: "건1",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 40,
                        }),
                        createSession({
                            date: "2025-02-18",
                            duration_minutes: 20,
                        }),
                    ],
                }),
                createRecord({
                    work_name: "작업A",
                    deal_name: "건2",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 100,
                        }),
                    ],
                }),
            ];

            expect(
                getTotalMinutesForDeal(records, "작업A", "건1", "2025-02-18")
            ).toBe(60);
            expect(
                getTotalMinutesForDeal(records, "작업A", "건2", "2025-02-18")
            ).toBe(100);
        });
    });

    describe("buildDayGroups", () => {
        it("all_records 미전달 시 weekly_records로 누적시간 계산", () => {
            const weekly_records = [
                createRecord({
                    work_name: "작업A",
                    date: "2025-02-17",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 60,
                        }),
                    ],
                }),
            ];

            const groups = buildDayGroups(
                ["2025-02-17"],
                weekly_records,
                {},
                false,
                "ADMIN"
            );

            expect(groups).toHaveLength(1);
            expect(groups[0].works[0].total_minutes).toBe(60);
        });

        it("all_records 전달 시 전체 기간 기준 누적시간 계산", () => {
            const weekly_records = [
                createRecord({
                    work_name: "작업A",
                    date: "2025-02-17",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 60,
                        }),
                    ],
                }),
            ];

            const all_records = [
                createRecord({
                    work_name: "작업A",
                    date: "2025-02-10",
                    sessions: [
                        createSession({
                            date: "2025-02-10",
                            duration_minutes: 120,
                        }),
                    ],
                }),
                ...weekly_records,
            ];

            const groups = buildDayGroups(
                ["2025-02-17"],
                weekly_records,
                {},
                false,
                "ADMIN",
                all_records
            );

            expect(groups).toHaveLength(1);
            expect(groups[0].works[0].total_minutes).toBe(180);
        });

        it("all_records 전달 시 deal 누적시간도 전체 기간 기준", () => {
            const weekly_records = [
                createRecord({
                    work_name: "작업A",
                    deal_name: "건1",
                    date: "2025-02-17",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 30,
                        }),
                    ],
                }),
            ];

            const all_records = [
                createRecord({
                    work_name: "작업A",
                    deal_name: "건1",
                    date: "2025-02-03",
                    sessions: [
                        createSession({
                            date: "2025-02-03",
                            duration_minutes: 90,
                        }),
                    ],
                }),
                ...weekly_records,
            ];

            const groups = buildDayGroups(
                ["2025-02-17"],
                weekly_records,
                {},
                false,
                "ADMIN",
                all_records
            );

            const deal = groups[0].works[0].deals[0];
            expect(deal.total_minutes).toBe(120);
        });

        it("그룹핑은 weekly_records 기준으로 유지", () => {
            const weekly_records = [
                createRecord({
                    work_name: "작업A",
                    date: "2025-02-17",
                    sessions: [
                        createSession({
                            date: "2025-02-17",
                            duration_minutes: 60,
                        }),
                    ],
                }),
            ];

            const all_records = [
                ...weekly_records,
                createRecord({
                    work_name: "작업B",
                    date: "2025-02-10",
                    sessions: [
                        createSession({
                            date: "2025-02-10",
                            duration_minutes: 120,
                        }),
                    ],
                }),
            ];

            const groups = buildDayGroups(
                ["2025-02-17"],
                weekly_records,
                {},
                false,
                "ADMIN",
                all_records
            );

            expect(groups).toHaveLength(1);
            expect(groups[0].works).toHaveLength(1);
            expect(groups[0].works[0].work_name).toBe("작업A");
        });
    });
});

describe("isHiddenProjectCode", () => {
    const MANAGEMENT_CODE = "A24_05591";

    it("관리업무 코드는 숨김 대상이다", () => {
        expect(isHiddenProjectCode(MANAGEMENT_CODE, MANAGEMENT_CODE)).toBe(true);
    });

    it("A로 시작하지 않는 코드는 숨김 대상이다", () => {
        expect(isHiddenProjectCode("P001", MANAGEMENT_CODE)).toBe(true);
        expect(isHiddenProjectCode("B25_00001", MANAGEMENT_CODE)).toBe(true);
        expect(isHiddenProjectCode("", MANAGEMENT_CODE)).toBe(true);
    });

    it("A로 시작하는 일반 프로젝트 코드는 숨기지 않는다", () => {
        expect(isHiddenProjectCode("A25_01846", MANAGEMENT_CODE)).toBe(false);
        expect(isHiddenProjectCode("A00_00000", MANAGEMENT_CODE)).toBe(false);
    });
});

describe("buildDayGroups 프로젝트 코드 필터", () => {
    const MANAGEMENT_CODE = "A24_05591";
    const DATE = "2025-02-17";

    function createDayRecord(project_code: string, work_name: string) {
        return createRecord({
            project_code,
            work_name,
            date: DATE,
            sessions: [createSession({ date: DATE, duration_minutes: 60 })],
        });
    }

    it("숨김이 켜지면 관리업무와 A로 시작하지 않는 코드를 모두 제외한다", () => {
        const records = [
            createDayRecord("A25_01846", "일반작업"),
            createDayRecord(MANAGEMENT_CODE, "관리업무"),
            createDayRecord("P001", "비프로젝트"),
        ];

        const groups = buildDayGroups(
            [DATE],
            records,
            {},
            true,
            MANAGEMENT_CODE
        );

        expect(groups[0].works).toHaveLength(1);
        expect(groups[0].works[0].work_name).toBe("일반작업");
    });

    it("숨김이 꺼지면 모든 코드를 표시한다", () => {
        const records = [
            createDayRecord("A25_01846", "일반작업"),
            createDayRecord(MANAGEMENT_CODE, "관리업무"),
            createDayRecord("P001", "비프로젝트"),
        ];

        const groups = buildDayGroups(
            [DATE],
            records,
            {},
            false,
            MANAGEMENT_CODE
        );

        expect(groups[0].works).toHaveLength(3);
    });

    it("숨김 대상만 있는 날짜는 그룹에서 빠진다", () => {
        const records = [createDayRecord("P001", "비프로젝트")];

        const groups = buildDayGroups(
            [DATE],
            records,
            {},
            true,
            MANAGEMENT_CODE
        );

        expect(groups).toHaveLength(0);
    });
});
