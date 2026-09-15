import { describe, it, expect } from "vitest";
import {
    normalizeRecordFormValues,
    buildNewRecord,
    isSameAsActiveWork,
} from "@/features/work-record/lib/record_form";

describe("normalizeRecordFormValues", () => {
    it("비어 있는 선택 항목을 빈 문자열로 채운다", () => {
        const result = normalizeRecordFormValues({ work_name: "개발" });

        expect(result).toEqual({
            project_code: "",
            work_name: "개발",
            task_name: "",
            deal_name: "",
            category_name: "",
            note: "",
        });
    });

    it("프로젝트 코드가 비면 기본값을 쓴다", () => {
        const result = normalizeRecordFormValues(
            { work_name: "개발" },
            "A00_00000"
        );

        expect(result.project_code).toBe("A00_00000");
    });

    it("입력한 값은 그대로 둔다", () => {
        const result = normalizeRecordFormValues(
            {
                project_code: "B11_22222",
                work_name: "개발",
                task_name: "리뷰",
                deal_name: "거래",
                category_name: "개발",
                note: "메모",
            },
            "A00_00000"
        );

        expect(result.project_code).toBe("B11_22222");
        expect(result.task_name).toBe("리뷰");
        expect(result.note).toBe("메모");
    });
});

describe("buildNewRecord", () => {
    it("선택한 날짜와 전달받은 id로 레코드를 만든다", () => {
        const record = buildNewRecord({
            values: { work_name: "개발" },
            selected_date: "2026-09-15",
            id: "new-id",
        });

        expect(record.id).toBe("new-id");
        expect(record.date).toBe("2026-09-15");
        expect(record.work_name).toBe("개발");
    });

    it("새 레코드는 세션 없이 0분에서 시작한다", () => {
        const record = buildNewRecord({
            values: { work_name: "개발" },
            selected_date: "2026-09-15",
            id: "new-id",
        });

        expect(record.duration_minutes).toBe(0);
        expect(record.sessions).toEqual([]);
        expect(record.start_time).toBe("");
        expect(record.end_time).toBe("");
        expect(record.is_completed).toBe(false);
        expect(record.is_deleted).toBe(false);
    });
});

describe("isSameAsActiveWork", () => {
    const record = { work_name: "개발", deal_name: "거래A" };

    it("작업명과 거래명이 모두 같으면 true", () => {
        expect(
            isSameAsActiveWork(record, {
                work_name: "개발",
                deal_name: "거래A",
            })
        ).toBe(true);
    });

    it("하나라도 다르면 false", () => {
        expect(
            isSameAsActiveWork(record, {
                work_name: "개발",
                deal_name: "거래B",
            })
        ).toBe(false);
    });

    it("진행 중인 작업 정보가 없으면 false", () => {
        expect(isSameAsActiveWork(record, null)).toBe(false);
    });
});
