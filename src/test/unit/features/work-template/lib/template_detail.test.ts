import { describe, it, expect } from "vitest";
import { buildTemplateDetailRows } from "@/features/work-template/lib/template_detail";
import { createMockTemplate } from "@/test/helpers/mock_factory";

describe("buildTemplateDetailRows", () => {
    it("모든 필드가 있으면 거래명·작업명·업무명·카테고리·프로젝트 코드·비고 순서로 반환한다", () => {
        const template = createMockTemplate({
            deal_name: "긴 거래명",
            work_name: "작업",
            task_name: "개발",
            category_name: "회의",
            project_code: "A26_00001",
            note: "메모",
        });

        expect(buildTemplateDetailRows(template)).toEqual([
            { label: "거래명", value: "긴 거래명" },
            { label: "작업명", value: "작업" },
            { label: "업무명", value: "개발" },
            { label: "카테고리", value: "회의" },
            { label: "프로젝트 코드", value: "A26_00001" },
            { label: "비고", value: "메모" },
        ]);
    });

    it("비어 있거나 공백뿐인 필드는 제외한다", () => {
        const template = createMockTemplate({
            deal_name: "",
            work_name: "작업",
            task_name: "   ",
            category_name: "",
            project_code: "",
            note: "",
        });

        expect(buildTemplateDetailRows(template)).toEqual([
            { label: "작업명", value: "작업" },
        ]);
    });

    it("값의 앞뒤 공백을 제거한다", () => {
        const template = createMockTemplate({
            deal_name: "  거래  ",
            work_name: "작업",
            task_name: "",
            category_name: "",
            project_code: "",
            note: "",
        });

        expect(buildTemplateDetailRows(template)[0]).toEqual({
            label: "거래명",
            value: "거래",
        });
    });
});
