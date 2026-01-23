/**
 * record_merger 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    findDuplicateGroups,
    findExistingRecord,
    mergeRecords,
    autoMergeRecords,
} from "../../../../../features/work-record/lib/record_merger";
import type { WorkRecord } from "../../../../../shared/types";

// 테스트용 레코드 헬퍼
function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "테스트 거래",
        task_name: "개발",
        category_name: "테스트",
        project_code: "PRJ-001",
        date: "2024-01-15",
        duration_minutes: 180,
        start_time: "09:00",
        end_time: "12:00",
        note: "",
        is_completed: false,
        sessions: [
            {
                id: "session-1",
                date: "2024-01-15",
                start_time: "09:00",
                end_time: "12:00",
                duration_minutes: 180,
            },
        ],
        ...overrides,
    };
}

describe("record_merger", () => {
    describe("findDuplicateGroups", () => {
        it("동일한 작업명+거래명의 레코드를 그룹화해야 함", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A", deal_name: "거래X" }),
                createTestRecord({ id: "2", work_name: "작업A", deal_name: "거래X" }),
                createTestRecord({ id: "3", work_name: "작업B", deal_name: "거래Y" }),
            ];

            const groups = findDuplicateGroups(records);

            expect(groups).toHaveLength(1);
            expect(groups[0].records).toHaveLength(2);
            expect(groups[0].work_name).toBe("작업A");
            expect(groups[0].deal_name).toBe("거래X");
        });

        it("중복이 없으면 빈 배열 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A" }),
                createTestRecord({ id: "2", work_name: "작업B" }),
                createTestRecord({ id: "3", work_name: "작업C" }),
            ];

            const groups = findDuplicateGroups(records);

            expect(groups).toHaveLength(0);
        });

        it("삭제된 레코드는 제외해야 함", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A", deal_name: "거래X" }),
                createTestRecord({ id: "2", work_name: "작업A", deal_name: "거래X", is_deleted: true }),
            ];

            const groups = findDuplicateGroups(records);

            expect(groups).toHaveLength(0);
        });

        it("완료된 레코드는 제외해야 함", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A", deal_name: "거래X" }),
                createTestRecord({ id: "2", work_name: "작업A", deal_name: "거래X", is_completed: true }),
            ];

            const groups = findDuplicateGroups(records);

            expect(groups).toHaveLength(0);
        });
    });

    describe("findExistingRecord", () => {
        it("동일한 작업명+거래명 레코드를 찾아야 함", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A", deal_name: "거래X" }),
                createTestRecord({ id: "2", work_name: "작업B", deal_name: "거래Y" }),
            ];

            const found = findExistingRecord(records, "2024-01-15", "작업A", "거래X");

            expect(found).not.toBeUndefined();
            expect(found?.id).toBe("1");
        });

        it("일치하는 레코드가 없으면 undefined 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A", deal_name: "거래X" }),
            ];

            const found = findExistingRecord(records, "2024-01-15", "작업B", "거래Y");

            expect(found).toBeUndefined();
        });

        it("미완료 레코드 우선 반환 (날짜 무관)", () => {
            const records: WorkRecord[] = [
                createTestRecord({ 
                    id: "1", 
                    work_name: "작업A", 
                    deal_name: "거래X", 
                    date: "2024-01-10",
                    is_completed: false,
                }),
                createTestRecord({ 
                    id: "2", 
                    work_name: "작업A", 
                    deal_name: "거래X", 
                    date: "2024-01-15",
                    is_completed: true,
                }),
            ];

            const found = findExistingRecord(records, "2024-01-15", "작업A", "거래X");

            expect(found?.id).toBe("1"); // 미완료 레코드 우선
        });
    });

    describe("mergeRecords", () => {
        it("여러 레코드의 세션을 병합해야 함", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    sessions: [
                        { id: "s1", date: "2024-01-15", start_time: "09:00", end_time: "12:00", duration_minutes: 180 },
                    ],
                }),
                createTestRecord({
                    id: "2",
                    sessions: [
                        { id: "s2", date: "2024-01-15", start_time: "14:00", end_time: "18:00", duration_minutes: 240 },
                    ],
                }),
            ];

            const result = mergeRecords(records);

            expect(result.merged_record.sessions).toHaveLength(2);
            expect(result.deleted_ids).toContain("2");
        });

        it("단일 레코드는 그대로 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    sessions: [
                        { id: "s1", date: "2024-01-15", start_time: "09:00", end_time: "12:00", duration_minutes: 180 },
                    ],
                }),
            ];

            const result = mergeRecords(records);

            expect(result.merged_record.id).toBe("1");
            expect(result.deleted_ids).toHaveLength(0);
        });

        it("빈 배열이면 에러 발생", () => {
            expect(() => mergeRecords([])).toThrow("병합할 레코드가 없습니다.");
        });
    });

    describe("autoMergeRecords", () => {
        it("중복 레코드를 자동으로 병합해야 함", () => {
            const records: WorkRecord[] = [
                createTestRecord({
                    id: "1",
                    work_name: "작업A",
                    deal_name: "거래X",
                    sessions: [{ id: "s1", date: "2024-01-15", start_time: "09:00", end_time: "12:00", duration_minutes: 180 }],
                }),
                createTestRecord({
                    id: "2",
                    work_name: "작업A",
                    deal_name: "거래X",
                    sessions: [{ id: "s2", date: "2024-01-15", start_time: "14:00", end_time: "18:00", duration_minutes: 240 }],
                }),
                createTestRecord({
                    id: "3",
                    work_name: "작업B",
                    deal_name: "거래Y",
                }),
            ];

            const result = autoMergeRecords(records);

            expect(result.merged_records).toHaveLength(2);
            expect(result.merge_info).toHaveLength(1);
        });

        it("중복이 없으면 원본 그대로 반환", () => {
            const records: WorkRecord[] = [
                createTestRecord({ id: "1", work_name: "작업A" }),
                createTestRecord({ id: "2", work_name: "작업B" }),
            ];

            const result = autoMergeRecords(records);

            expect(result.merged_records).toHaveLength(2);
            expect(result.merge_info).toHaveLength(0);
        });
    });
});
