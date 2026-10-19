import type { WorkTemplate } from "@/shared/types";
import { FORM_LABELS, TABLE_COLUMNS } from "@/shared/constants";

export interface TemplateDetailRow {
    label: string;
    value: string;
}

export function buildTemplateDetailRows(
    template: WorkTemplate
): TemplateDetailRow[] {
    const rows: TemplateDetailRow[] = [
        { label: TABLE_COLUMNS.dealName, value: template.deal_name },
        { label: TABLE_COLUMNS.workName, value: template.work_name },
        { label: TABLE_COLUMNS.taskName, value: template.task_name },
        { label: TABLE_COLUMNS.categoryName, value: template.category_name },
        { label: FORM_LABELS.projectCode, value: template.project_code },
        { label: FORM_LABELS.remark, value: template.note },
    ];

    return rows
        .map((row) => ({ ...row, value: (row.value ?? "").trim() }))
        .filter((row) => row.value !== "");
}
