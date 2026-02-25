/**
 * sync_helpers 순수 함수 테스트
 *
 * findDuplicateGroups, mergeRecordGroup 테스트
 */

import { describe, it, expect } from "vitest";
import {
    findDuplicateGroups,
    mergeRecordGroup,
} from "../../../firebase/sync_helpers";
import type { WorkRecord } from "../../../shared/types";

function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "거래A",
        task_name: "",
        category_name: "",
        project_code: "",
        date: "2026-02-25",
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        note: "",
        is_completed: false,
        sessions: [
            {
                id: "s1",
                date: "2026-02-25",
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ],
        ...overrides,
    };
}

// ============================================================================
// findDuplicateGroups
// ============================================================================

describe("findDuplicateGroups", () => {
    it("중복이 없으면 빈 배열을 반환한다", () => {
        const records = [
            createTestRecord({
                id: "r1",
                work_name: "작업A",
                deal_name: "거래1",
            }),
            createTestRecord({
                id: "r2",
                work_name: "작업B",
                deal_name: "거래2",
            }),
        ];
        expect(findDuplicateGroups(records)).toEqual([]);
    });

    it("동일한 work_name + deal_name 조합이 2개 이상이면 중복 그룹을 반환한다", () => {
        const records = [
            createTestRecord({
                id: "r1",
                work_name: "작업A",
                deal_name: "거래1",
            }),
            createTestRecord({
                id: "r2",
                work_name: "작업A",
                deal_name: "거래1",
            }),
        ];
        const groups = findDuplicateGroups(records);
        expect(groups).toHaveLength(1);
        expect(groups[0].records).toHaveLength(2);
        expect(groups[0].work_name).toBe("작업A");
        expect(groups[0].deal_name).toBe("거래1");
    });

    it("삭제된 레코드는 중복 감지에서 제외한다", () => {
        const records = [
            createTestRecord({
                id: "r1",
                work_name: "작업A",
                deal_name: "거래1",
            }),
            createTestRecord({
                id: "r2",
                work_name: "작업A",
                deal_name: "거래1",
                is_deleted: true,
            }),
        ];
        expect(findDuplicateGroups(records)).toEqual([]);
    });

    it("deal_name이 다르면 별도 그룹으로 취급한다", () => {
        const records = [
            createTestRecord({
                id: "r1",
                work_name: "작업A",
                deal_name: "거래1",
            }),
            createTestRecord({
                id: "r2",
                work_name: "작업A",
                deal_name: "거래2",
            }),
        ];
        expect(findDuplicateGroups(records)).toEqual([]);
    });

    it("여러 중복 그룹을 동시에 감지한다", () => {
        const records = [
            createTestRecord({
                id: "r1",
                work_name: "작업A",
                deal_name: "거래1",
            }),
            createTestRecord({
                id: "r2",
                work_name: "작업A",
                deal_name: "거래1",
            }),
            createTestRecord({
                id: "r3",
                work_name: "작업B",
                deal_name: "거래2",
            }),
            createTestRecord({
                id: "r4",
                work_name: "작업B",
                deal_name: "거래2",
            }),
        ];
        const groups = findDuplicateGroups(records);
        expect(groups).toHaveLength(2);
    });

    it("중복 그룹 내 레코드를 date 기준으로 정렬한다", () => {
        const records = [
            createTestRecord({
                id: "r1",
                work_name: "작업A",
                deal_name: "거래1",
                date: "2026-02-27",
            }),
            createTestRecord({
                id: "r2",
                work_name: "작업A",
                deal_name: "거래1",
                date: "2026-02-25",
            }),
        ];
        const groups = findDuplicateGroups(records);
        expect(groups[0].records[0].date).toBe("2026-02-25");
        expect(groups[0].records[1].date).toBe("2026-02-27");
    });
});

// ============================================================================
// mergeRecordGroup
// ============================================================================

describe("mergeRecordGroup", () => {
    it("첫 번째 레코드를 base로 사용하고 나머지 ID를 deleted_ids로 반환한다", () => {
        const group = {
            key: "작업A||거래1",
            work_name: "작업A",
            deal_name: "거래1",
            records: [
                createTestRecord({
                    id: "r1",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s1",
                            date: "2026-02-25",
                            start_time: "09:00",
                            end_time: "10:00",
                            duration_minutes: 60,
                        },
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    date: "2026-02-26",
                    sessions: [
                        {
                            id: "s2",
                            date: "2026-02-26",
                            start_time: "11:00",
                            end_time: "12:00",
                            duration_minutes: 60,
                        },
                    ],
                }),
            ],
        };

        const result = mergeRecordGroup(group);
        expect(result.merged_record.id).toBe("r1");
        expect(result.deleted_ids).toEqual(["r2"]);
    });

    it("모든 세션을 합친다", () => {
        const group = {
            key: "작업A||거래1",
            work_name: "작업A",
            deal_name: "거래1",
            records: [
                createTestRecord({
                    id: "r1",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s1",
                            date: "2026-02-25",
                            start_time: "09:00",
                            end_time: "10:00",
                            duration_minutes: 60,
                        },
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s2",
                            date: "2026-02-25",
                            start_time: "14:00",
                            end_time: "15:00",
                            duration_minutes: 60,
                        },
                    ],
                }),
            ],
        };

        const result = mergeRecordGroup(group);
        expect(result.merged_record.sessions).toHaveLength(2);
    });

    it("중복 세션 ID는 하나만 유지한다", () => {
        const shared_session = {
            id: "same-session",
            date: "2026-02-25",
            start_time: "09:00",
            end_time: "10:00",
            duration_minutes: 60,
        };
        const group = {
            key: "작업A||거래1",
            work_name: "작업A",
            deal_name: "거래1",
            records: [
                createTestRecord({
                    id: "r1",
                    date: "2026-02-25",
                    sessions: [shared_session],
                }),
                createTestRecord({
                    id: "r2",
                    date: "2026-02-25",
                    sessions: [shared_session],
                }),
            ],
        };

        const result = mergeRecordGroup(group);
        expect(result.merged_record.sessions).toHaveLength(1);
        expect(result.merged_record.sessions![0].id).toBe("same-session");
    });

    it("병합된 레코드의 duration_minutes는 전체 세션 합산이다", () => {
        const group = {
            key: "작업A||거래1",
            work_name: "작업A",
            deal_name: "거래1",
            records: [
                createTestRecord({
                    id: "r1",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s1",
                            date: "2026-02-25",
                            start_time: "09:00",
                            end_time: "10:00",
                            duration_minutes: 60,
                        },
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s2",
                            date: "2026-02-25",
                            start_time: "14:00",
                            end_time: "14:30",
                            duration_minutes: 30,
                        },
                    ],
                }),
            ],
        };

        const result = mergeRecordGroup(group);
        expect(result.merged_record.duration_minutes).toBe(90);
    });

    it("duration_minutes가 0이면 최소 1분을 보장한다", () => {
        const group = {
            key: "작업A||거래1",
            work_name: "작업A",
            deal_name: "거래1",
            records: [
                createTestRecord({
                    id: "r1",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s1",
                            date: "2026-02-25",
                            start_time: "09:00",
                            end_time: "09:00",
                            duration_minutes: 0,
                        },
                    ],
                }),
                createTestRecord({
                    id: "r2",
                    date: "2026-02-25",
                    sessions: [
                        {
                            id: "s2",
                            date: "2026-02-25",
                            start_time: "10:00",
                            end_time: "10:00",
                            duration_minutes: 0,
                        },
                    ],
                }),
            ],
        };

        const result = mergeRecordGroup(group);
        expect(result.merged_record.duration_minutes).toBe(1);
    });
});
