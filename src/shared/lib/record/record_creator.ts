/**
 * 레코드 생성 유틸리티
 *
 * 새 WorkRecord 객체를 생성하는 순수 함수
 */

import type { WorkTemplate, WorkRecord } from "../../types";

export interface CreateRecordFromTemplateParams {
    template: WorkTemplate;
    deal_name: string;
    date: string;
}

/**
 * 템플릿에서 새 레코드 생성
 *
 * @param params.template - 작업 템플릿
 * @param params.deal_name - 생성할 deal_name
 * @param params.date - 날짜 (YYYY-MM-DD)
 * @returns 새 WorkRecord 객체
 */
export function createRecordFromTemplate(
    params: CreateRecordFromTemplateParams
): WorkRecord {
    const { template, deal_name, date } = params;

    return {
        id: crypto.randomUUID(),
        project_code: template.project_code || "A00_00000",
        work_name: template.work_name,
        task_name: template.task_name,
        deal_name: deal_name,
        category_name: template.category_name,
        note: template.note,
        duration_minutes: 0,
        start_time: "",
        end_time: "",
        date: date,
        sessions: [],
        is_completed: false,
        is_deleted: false,
    };
}

export interface CreateEmptyRecordParams {
    date: string;
    defaults?: Partial<WorkRecord>;
}

/**
 * 빈 레코드 생성
 *
 * @param params.date - 날짜 (YYYY-MM-DD)
 * @param params.defaults - 기본값 오버라이드
 * @returns 새 WorkRecord 객체
 */
export function createEmptyRecord(params: CreateEmptyRecordParams): WorkRecord {
    const { date, defaults = {} } = params;

    return {
        id: crypto.randomUUID(),
        project_code: "",
        work_name: "",
        task_name: "",
        deal_name: "",
        category_name: "",
        note: "",
        duration_minutes: 0,
        start_time: "",
        end_time: "",
        date: date,
        sessions: [],
        is_completed: false,
        is_deleted: false,
        ...defaults,
    };
}
