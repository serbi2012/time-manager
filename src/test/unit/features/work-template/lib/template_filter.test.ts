import { describe, it, expect } from "vitest";
import { filterTemplates } from "@/features/work-template/lib/template_filter";
import type { WorkTemplate } from "@/shared/types";

function createTemplate(overrides: Partial<WorkTemplate>): WorkTemplate {
    return {
        id: overrides.id ?? "t1",
        project_code: overrides.project_code ?? "",
        work_name: overrides.work_name ?? "작업",
        task_name: overrides.task_name ?? "",
        deal_name: overrides.deal_name ?? "",
        category_name: overrides.category_name ?? "",
        note: overrides.note ?? "",
        color: overrides.color ?? "#3182F6",
        sort_order: overrides.sort_order ?? 0,
    } as WorkTemplate;
}

const TEMPLATES = [
    createTemplate({
        id: "t1",
        work_name: "브랜치 최신화",
        category_name: "환경세팅",
    }),
    createTemplate({
        id: "t2",
        work_name: "부가세 개발",
        deal_name: "임시저장 적용",
        category_name: "개발",
    }),
    createTemplate({
        id: "t3",
        work_name: "기타회의",
        category_name: "회의",
        project_code: "A00_12345",
    }),
];

describe("filterTemplates", () => {
    it("검색어가 없으면 전부 반환한다", () => {
        expect(filterTemplates(TEMPLATES, "")).toHaveLength(3);
        expect(filterTemplates(TEMPLATES, "   ")).toHaveLength(3);
    });

    it("작업명으로 찾는다", () => {
        const result = filterTemplates(TEMPLATES, "브랜치");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("t1");
    });

    it("거래명으로 찾는다", () => {
        const result = filterTemplates(TEMPLATES, "임시저장");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("t2");
    });

    it("카테고리와 프로젝트 코드로도 찾는다", () => {
        expect(filterTemplates(TEMPLATES, "회의")).toHaveLength(1);
        expect(filterTemplates(TEMPLATES, "A00_12345")).toHaveLength(1);
    });

    it("대소문자를 가리지 않는다", () => {
        expect(filterTemplates(TEMPLATES, "a00_12345")).toHaveLength(1);
    });

    it("일치하는 항목이 없으면 빈 배열", () => {
        expect(filterTemplates(TEMPLATES, "존재하지않는검색어")).toEqual([]);
    });

    it("앞뒤 공백은 무시한다", () => {
        expect(filterTemplates(TEMPLATES, "  브랜치  ")).toHaveLength(1);
    });
});
