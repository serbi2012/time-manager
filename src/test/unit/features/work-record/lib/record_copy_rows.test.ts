import { describe, it, expect } from "vitest";
import {
    buildRecordCopyRows,
    getCopyRowCells,
    formatCopyRowsToMarkdown,
} from "../../../../../features/work-record/lib/record_copy_rows";
import type { WorkRecord } from "../../../../../shared/types";

const SELECTED_DATE = "2026-09-08";

function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "r1",
        work_name: "작업A",
        deal_name: "거래A",
        task_name: "개발",
        category_name: "개발",
        project_code: "A25_01846",
        date: SELECTED_DATE,
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        note: "",
        is_completed: false,
        sessions: [
            {
                id: "s1",
                date: SELECTED_DATE,
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ],
        ...overrides,
    };
}

describe("buildRecordCopyRows", () => {
    it("삭제된 레코드는 제외한다", () => {
        const records = [createTestRecord({ is_deleted: true })];

        expect(buildRecordCopyRows(records, SELECTED_DATE, {})).toHaveLength(0);
    });

    it("거래명에 매핑된 거래코드를 채운다", () => {
        const records = [createTestRecord()];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, {
            거래A: "D-001",
        });

        expect(rows[0].deal_code).toBe("D-001");
    });

    it("매핑이 없으면 거래코드는 빈 문자열이다", () => {
        const records = [createTestRecord()];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, {});

        expect(rows[0].deal_code).toBe("");
    });

    it("거래명이 비어 있으면 작업명을 거래명으로 쓴다", () => {
        const records = [createTestRecord({ deal_name: "" })];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, {
            작업A: "W-001",
        });

        expect(rows[0].deal_name).toBe("작업A");
        expect(rows[0].deal_code).toBe("W-001");
    });

    it("작업명 가나다순으로 정렬한다", () => {
        const records = [
            createTestRecord({ id: "r1", work_name: "나작업" }),
            createTestRecord({ id: "r2", work_name: "가작업" }),
        ];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, {});

        expect(rows.map((r) => r.work_name)).toEqual(["가작업", "나작업"]);
    });

    it("선택된 날짜의 세션 시간만 합산한다", () => {
        const records = [
            createTestRecord({
                sessions: [
                    {
                        id: "s1",
                        date: SELECTED_DATE,
                        start_time: "09:00",
                        end_time: "09:30",
                        duration_minutes: 30,
                    },
                    {
                        id: "s2",
                        date: "2026-09-09",
                        start_time: "10:00",
                        end_time: "11:00",
                        duration_minutes: 60,
                    },
                ],
            }),
        ];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, {});

        expect(rows[0].duration_text).toBe("30분");
    });
});

describe("getCopyRowCells", () => {
    it("컬럼 순서대로 셀 값을 반환한다", () => {
        const records = [createTestRecord({ note: "비고내용" })];
        const rows = buildRecordCopyRows(records, SELECTED_DATE, {
            거래A: "D-001",
        });

        expect(getCopyRowCells(rows[0])).toEqual([
            "작업A",
            "D-001",
            "거래A",
            "60분",
            "개발",
            "비고내용",
        ]);
    });
});

describe("formatCopyRowsToMarkdown", () => {
    it("행이 없으면 null을 반환한다", () => {
        expect(formatCopyRowsToMarkdown([])).toBeNull();
    });

    it("헤더에 거래코드 컬럼을 포함한다", () => {
        const rows = buildRecordCopyRows([createTestRecord()], SELECTED_DATE, {
            거래A: "D-001",
        });

        const text = formatCopyRowsToMarkdown(rows);

        expect(text).toContain("거래코드");
        expect(text).toContain("D-001");
    });

    it("헤더 구분선을 포함한 3줄 이상을 만든다", () => {
        const rows = buildRecordCopyRows([createTestRecord()], SELECTED_DATE, {});

        const lines = formatCopyRowsToMarkdown(rows)!.split("\n");

        expect(lines).toHaveLength(3);
        expect(lines[1].startsWith("|---")).toBe(true);
    });
});
