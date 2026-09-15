import type { WorkRecord } from "@/shared/types";

export interface RecordFormValues {
    project_code?: string;
    work_name: string;
    task_name?: string;
    deal_name?: string;
    category_name?: string;
    note?: string;
}

export interface RecordFormFields {
    project_code: string;
    work_name: string;
    task_name: string;
    deal_name: string;
    category_name: string;
    note: string;
}

interface BuildNewRecordOptions {
    values: RecordFormValues;
    selected_date: string;
    id: string;
    /** 프로젝트 코드를 비워 두었을 때 사용할 값 */
    default_project_code?: string;
}

/**
 * 폼 값에서 빈 값을 채워 레코드 필드로 만든다
 */
export function normalizeRecordFormValues(
    values: RecordFormValues,
    default_project_code = ""
): RecordFormFields {
    return {
        project_code: values.project_code || default_project_code,
        work_name: values.work_name,
        task_name: values.task_name || "",
        deal_name: values.deal_name || "",
        category_name: values.category_name || "",
        note: values.note || "",
    };
}

/**
 * 폼 값으로 새 레코드를 만든다 (저장은 호출한 쪽에서)
 */
export function buildNewRecord({
    values,
    selected_date,
    id,
    default_project_code = "",
}: BuildNewRecordOptions): WorkRecord {
    return {
        id,
        ...normalizeRecordFormValues(values, default_project_code),
        duration_minutes: 0,
        start_time: "",
        end_time: "",
        date: selected_date,
        sessions: [],
        is_completed: false,
        is_deleted: false,
    };
}

/**
 * 수정한 폼 값이 진행 중인 타이머의 작업과 같은지 판단한다
 */
export function isSameAsActiveWork(
    record: Pick<WorkRecord, "work_name" | "deal_name">,
    active_form_data: { work_name: string; deal_name: string } | null
): boolean {
    if (!active_form_data) return false;

    return (
        record.work_name === active_form_data.work_name &&
        record.deal_name === active_form_data.deal_name
    );
}
