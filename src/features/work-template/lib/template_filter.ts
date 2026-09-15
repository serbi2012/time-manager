import type { WorkTemplate } from "@/shared/types";

/**
 * 검색어로 프리셋을 거른다
 * 거래명·작업명·할일·카테고리·프로젝트 코드를 대상으로 한다
 */
export function filterTemplates(
    templates: WorkTemplate[],
    query: string
): WorkTemplate[] {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return templates;

    return templates.filter((template) => {
        const fields = [
            template.deal_name,
            template.work_name,
            template.task_name,
            template.category_name,
            template.project_code,
        ];

        return fields.some((field) =>
            (field ?? "").toLowerCase().includes(keyword)
        );
    });
}
