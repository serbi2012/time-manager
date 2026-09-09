import { describe, it, expect } from "vitest";
import {
    buildRecordCopyRows,
    getCopyRowCells,
    formatCopyRowsToMarkdown,
    formatCodeWithName,
} from "../../../../../features/work-record/lib/record_copy_rows";
import type { WorkRecord } from "../../../../../shared/types";

const SELECTED_DATE = "2026-09-08";

const EMPTY_CODES = { deal_codes: {}, category_codes: {} };

function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "r1",
        work_name: "작업A",
        deal_name: "거래A",
        task_name: "개발",
        category_name: "환경세팅",
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

describe("formatCodeWithName", () => {
    it("코드와 이름을 공백으로 잇는다", () => {
        expect(formatCodeWithName("18", "환경세팅")).toBe("18 환경세팅");
    });

    it("코드가 없으면 빈 문자열을 반환한다", () => {
        expect(formatCodeWithName("", "환경세팅")).toBe("");
    });
});

describe("buildRecordCopyRows", () => {
    it("삭제된 레코드는 제외한다", () => {
        const records = [createTestRecord({ is_deleted: true })];

        expect(
            buildRecordCopyRows(records, SELECTED_DATE, EMPTY_CODES)
        ).toHaveLength(0);
    });

    it("업무명을 그대로 담는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            EMPTY_CODES
        );

        expect(rows[0].task_name).toBe("개발");
    });

    it("거래명에 매핑된 거래코드를 채운다", () => {
        const rows = buildRecordCopyRows([createTestRecord()], SELECTED_DATE, {
            deal_codes: { 거래A: "D-001" },
            category_codes: {},
        });

        expect(rows[0].deal_code).toBe("D-001");
    });

    it("카테고리명에 매핑된 코드로 표시값을 만든다", () => {
        const rows = buildRecordCopyRows([createTestRecord()], SELECTED_DATE, {
            deal_codes: {},
            category_codes: { 환경세팅: "18" },
        });

        expect(rows[0].category_code).toBe("18");
        expect(rows[0].category_display).toBe("18 환경세팅");
        expect(rows[0].category_name).toBe("환경세팅");
    });

    it("카테고리 코드가 없으면 표시값이 비어 있다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            EMPTY_CODES
        );

        expect(rows[0].category_display).toBe("");
    });

    it("카테고리명이 없으면 코드를 조회하지 않는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord({ category_name: "" })],
            SELECTED_DATE,
            { deal_codes: {}, category_codes: { "": "99" } }
        );

        expect(rows[0].category_code).toBe("");
    });

    it("거래명이 비어 있으면 작업명을 거래명으로 쓴다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord({ deal_name: "" })],
            SELECTED_DATE,
            { deal_codes: { 작업A: "W-001" }, category_codes: {} }
        );

        expect(rows[0].deal_name).toBe("작업A");
        expect(rows[0].deal_code).toBe("W-001");
    });

    it("작업명 가나다순으로 정렬한다", () => {
        const records = [
            createTestRecord({ id: "r1", work_name: "나작업" }),
            createTestRecord({ id: "r2", work_name: "가작업" }),
        ];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, EMPTY_CODES);

        expect(rows.map((r) => r.work_name)).toEqual(["가작업", "나작업"]);
    });

    it("시간은 단위 없이 숫자만 담는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            EMPTY_CODES
        );

        expect(rows[0].duration_text).toBe("60");
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

        const rows = buildRecordCopyRows(records, SELECTED_DATE, EMPTY_CODES);

        expect(rows[0].duration_text).toBe("30");
    });
});

describe("getCopyRowCells", () => {
    it("시간관리 양식 컬럼 순서대로 셀 값을 반환한다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord({ note: "비고내용" })],
            SELECTED_DATE,
            {
                deal_codes: { 거래A: "D-001" },
                category_codes: { 환경세팅: "18" },
            }
        );

        expect(getCopyRowCells(rows[0])).toEqual([
            "작업A",
            "개발",
            "D-001",
            "거래A",
            "18 환경세팅",
            "환경세팅",
            "60",
            "비고내용",
        ]);
    });
});

describe("formatCopyRowsToMarkdown", () => {
    it("행이 없으면 null을 반환한다", () => {
        expect(formatCopyRowsToMarkdown([])).toBeNull();
    });

    it("시간관리 양식 헤더를 포함한다", () => {
        const rows = buildRecordCopyRows([createTestRecord()], SELECTED_DATE, {
            deal_codes: { 거래A: "D-001" },
            category_codes: { 환경세팅: "18" },
        });

        const text = formatCopyRowsToMarkdown(rows)!;

        expect(text).toContain("업무");
        expect(text).toContain("거래코드");
        expect(text).toContain("카테고리명");
        expect(text).toContain("시간(분)");
        expect(text).toContain("18 환경세팅");
    });

    it("헤더 구분선을 포함한 3줄을 만든다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            EMPTY_CODES
        );

        const lines = formatCopyRowsToMarkdown(rows)!.split("\n");

        expect(lines).toHaveLength(3);
        expect(lines[1].startsWith("|---")).toBe(true);
    });
});
