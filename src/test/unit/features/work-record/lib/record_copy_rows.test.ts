import { describe, it, expect } from "vitest";
import {
    buildRecordCopyRows,
    getCopyRowCells,
    formatCopyRowsToMarkdown,
    resolveDealAndNote,
} from "../../../../../features/work-record/lib/record_copy_rows";
import type { WorkRecord } from "../../../../../shared/types";

const SELECTED_DATE = "2026-09-08";

const NO_CODES = { deal_codes: {} };

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

describe("resolveDealAndNote", () => {
    it("업무가 작업이 아니면 그대로 둔다", () => {
        expect(
            resolveDealAndNote("브랜치 최신화", "개발", "거래A", "비고A")
        ).toEqual({ deal_name: "거래A", note: "비고A" });
    });

    it("업무가 작업이면 거래명을 작업명으로 바꾸고 원래 거래명을 비고로 옮긴다", () => {
        expect(
            resolveDealAndNote(
                "브랜치 최신화",
                "작업",
                "5.6 ViewAction 개선 작업 - 브랜치 최신화",
                ""
            )
        ).toEqual({
            deal_name: "브랜치 최신화",
            note: "5.6 ViewAction 개선 작업 - 브랜치 최신화",
        });
    });

    it("원래 비고가 있으면 옮긴 거래명 뒤에 함께 남긴다", () => {
        expect(
            resolveDealAndNote("질의응답", "작업", "팀장님 질의응답", "메모")
        ).toEqual({
            deal_name: "질의응답",
            note: "팀장님 질의응답 메모",
        });
    });
});

describe("buildRecordCopyRows", () => {
    it("삭제된 레코드는 제외한다", () => {
        const records = [createTestRecord({ is_deleted: true })];

        expect(
            buildRecordCopyRows(records, SELECTED_DATE, NO_CODES)
        ).toHaveLength(0);
    });

    it("업무명을 그대로 담는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            NO_CODES
        );

        expect(rows[0].task_name).toBe("개발");
    });

    it("업무가 작업이면 거래는 작업명, 비고는 원래 거래명이 된다", () => {
        const rows = buildRecordCopyRows(
            [
                createTestRecord({
                    work_name: "브랜치 최신화",
                    task_name: "작업",
                    deal_name: "임시저장 문제 - 브랜치 최신화",
                }),
            ],
            SELECTED_DATE,
            NO_CODES
        );

        expect(rows[0].deal_name).toBe("브랜치 최신화");
        expect(rows[0].note).toBe("임시저장 문제 - 브랜치 최신화");
    });

    it("업무가 작업이 아니면 거래와 비고를 그대로 둔다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord({ note: "비고A" })],
            SELECTED_DATE,
            NO_CODES
        );

        expect(rows[0].deal_name).toBe("거래A");
        expect(rows[0].note).toBe("비고A");
    });

    it("거래코드는 치환된 거래명 기준으로 조회한다", () => {
        const rows = buildRecordCopyRows(
            [
                createTestRecord({
                    work_name: "질의응답",
                    task_name: "작업",
                    deal_name: "팀장님 질의응답",
                }),
            ],
            SELECTED_DATE,
            { deal_codes: { 질의응답: "D-010" } }
        );

        expect(rows[0].deal_code).toBe("D-010");
    });

    it("거래명에 매핑된 거래코드를 채운다", () => {
        const rows = buildRecordCopyRows([createTestRecord()], SELECTED_DATE, {
            deal_codes: { 거래A: "D-001" },
        });

        expect(rows[0].deal_code).toBe("D-001");
    });

    it("카테고리명을 그대로 담는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            NO_CODES
        );

        expect(rows[0].category_name).toBe("환경세팅");
    });

    it("거래명이 비어 있으면 작업명을 거래명으로 쓴다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord({ deal_name: "" })],
            SELECTED_DATE,
            { deal_codes: { 작업A: "W-001" } }
        );

        expect(rows[0].deal_name).toBe("작업A");
        expect(rows[0].deal_code).toBe("W-001");
    });

    it("작업명 가나다순으로 정렬한다", () => {
        const records = [
            createTestRecord({ id: "r1", work_name: "나작업" }),
            createTestRecord({ id: "r2", work_name: "가작업" }),
        ];

        const rows = buildRecordCopyRows(records, SELECTED_DATE, NO_CODES);

        expect(rows.map((r) => r.work_name)).toEqual(["가작업", "나작업"]);
    });

    it("시간은 단위 없이 숫자만 담는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            NO_CODES
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

        const rows = buildRecordCopyRows(records, SELECTED_DATE, NO_CODES);

        expect(rows[0].duration_text).toBe("30");
    });
});

describe("getCopyRowCells", () => {
    it("시간관리 양식 컬럼 순서대로 셀 값을 반환한다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord({ note: "비고내용" })],
            SELECTED_DATE,
            { deal_codes: { 거래A: "D-001" } }
        );

        expect(getCopyRowCells(rows[0])).toEqual([
            "작업A",
            "개발",
            "D-001",
            "거래A",
            "환경세팅",
            "60",
            "비고내용",
        ]);
    });

    it("업무가 작업인 행은 거래에 작업명, 비고에 거래명이 들어간다", () => {
        const rows = buildRecordCopyRows(
            [
                createTestRecord({
                    work_name: "기타 문서 작성",
                    task_name: "작업",
                    deal_name: "시간관리 및 주간일정작성",
                    category_name: "환경세팅",
                }),
            ],
            SELECTED_DATE,
            NO_CODES
        );

        expect(getCopyRowCells(rows[0])).toEqual([
            "기타 문서 작성",
            "작업",
            "",
            "기타 문서 작성",
            "환경세팅",
            "60",
            "시간관리 및 주간일정작성",
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
        });

        const text = formatCopyRowsToMarkdown(rows)!;

        expect(text).toContain("업무");
        expect(text).toContain("거래코드");
        expect(text).toContain("카테고리명");
        expect(text).toContain("시간(분)");
    });

    it("카테고리 컬럼은 포함하지 않는다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            NO_CODES
        );

        const header = formatCopyRowsToMarkdown(rows)!.split("\n")[0];
        const columns = header
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean);

        expect(columns).toEqual([
            "작업",
            "업무",
            "거래코드",
            "거래",
            "카테고리명",
            "시간(분)",
            "비고",
        ]);
    });

    it("헤더 구분선을 포함한 3줄을 만든다", () => {
        const rows = buildRecordCopyRows(
            [createTestRecord()],
            SELECTED_DATE,
            NO_CODES
        );

        const lines = formatCopyRowsToMarkdown(rows)!.split("\n");

        expect(lines).toHaveLength(3);
        expect(lines[1].startsWith("|---")).toBe(true);
    });
});
