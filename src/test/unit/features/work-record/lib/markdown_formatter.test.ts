/**
 * markdown_formatter 순수 함수 테스트
 */

import { describe, it, expect } from "vitest";
import { formatRecordsToMarkdown } from "../../../../../features/work-record/lib/markdown_formatter";
import type { WorkRecord } from "../../../../../shared/types";
import type { LunchTimeRange } from "../../../../../shared/lib/lunch/lunch_calculator";

const CUSTOM_LUNCH: LunchTimeRange = { start: 720, end: 780, duration: 60 }; // 12:00~13:00

function createTestRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "test-id",
        work_name: "테스트 작업",
        deal_name: "",
        task_name: "",
        category_name: "개발",
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

describe("formatRecordsToMarkdown", () => {
    it("빈 배열이면 null을 반환한다", () => {
        expect(formatRecordsToMarkdown([], "2026-02-25")).toBeNull();
    });

    it("모든 레코드가 삭제됐으면 null을 반환한다", () => {
        const records = [
            createTestRecord({ is_deleted: true }),
            createTestRecord({ id: "r2", is_deleted: true }),
        ];
        expect(formatRecordsToMarkdown(records, "2026-02-25")).toBeNull();
    });

    it("삭제된 레코드는 제외한다", () => {
        const records = [
            createTestRecord({ id: "r1", work_name: "활성 작업" }),
            createTestRecord({
                id: "r2",
                work_name: "삭제됨",
                is_deleted: true,
            }),
        ];
        const result = formatRecordsToMarkdown(records, "2026-02-25");
        expect(result).not.toBeNull();
        expect(result).toContain("활성 작업");
        expect(result).not.toContain("삭제됨");
    });

    it("마크다운 테이블 헤더를 포함한다", () => {
        const records = [createTestRecord()];
        const result = formatRecordsToMarkdown(records, "2026-02-25")!;
        expect(result).toContain("작업명");
        expect(result).toContain("거래명");
        expect(result).toContain("시간");
        expect(result).toContain("카테고리");
        expect(result).toContain("비고");
    });

    it("work_name 기준으로 한글 정렬한다", () => {
        const records = [
            createTestRecord({ id: "r1", work_name: "회의" }),
            createTestRecord({ id: "r2", work_name: "개발" }),
            createTestRecord({ id: "r3", work_name: "테스트" }),
        ];
        const result = formatRecordsToMarkdown(records, "2026-02-25")!;
        const lines = result.split("\n");
        const data_lines = lines.slice(2);

        expect(data_lines[0]).toContain("개발");
        expect(data_lines[1]).toContain("테스트");
        expect(data_lines[2]).toContain("회의");
    });

    it("deal_name이 있으면 거래명 컬럼에 표시한다", () => {
        const records = [
            createTestRecord({
                work_name: "기능 개발",
                deal_name: "프로젝트A",
            }),
        ];
        const result = formatRecordsToMarkdown(records, "2026-02-25")!;
        expect(result).toContain("프로젝트A");
    });

    it("deal_name이 없으면 work_name을 거래명에 대체 표시한다", () => {
        const records = [
            createTestRecord({ work_name: "회의", deal_name: "" }),
        ];
        const result = formatRecordsToMarkdown(records, "2026-02-25")!;
        const lines = result.split("\n");
        const data_line = lines[2];
        const cells = data_line.split("|").map((c) => c.trim());
        expect(cells[1]).toBe("회의");
        expect(cells[2]).toBe("회의");
    });

    it("시간은 분 단위로 표시한다", () => {
        const records = [createTestRecord({ duration_minutes: 90 })];
        const result = formatRecordsToMarkdown(records, "2026-02-25")!;
        expect(result).toContain("60분");
    });

    it("원본 배열 순서를 변경하지 않는다", () => {
        const records = [
            createTestRecord({ id: "r1", work_name: "회의" }),
            createTestRecord({ id: "r2", work_name: "개발" }),
        ];
        const original_first = records[0].work_name;
        formatRecordsToMarkdown(records, "2026-02-25");
        expect(records[0].work_name).toBe(original_first);
    });

    it("커스텀 점심시간을 전달하면 해당 점심시간 기준으로 시간 계산", () => {
        const records = [
            createTestRecord({
                sessions: [
                    {
                        id: "s1",
                        date: "2026-02-25",
                        start_time: "11:30",
                        end_time: "12:30",
                        duration_minutes: undefined as unknown as number,
                    },
                ],
            }),
        ];
        // 기본 점심(11:40~12:40): 10분
        const default_result = formatRecordsToMarkdown(records, "2026-02-25")!;
        expect(default_result).toContain("10분");

        // 커스텀 점심(12:00~13:00): 30분
        const custom_result = formatRecordsToMarkdown(records, "2026-02-25", CUSTOM_LUNCH)!;
        expect(custom_result).toContain("30분");
    });
});
