/**
 * Timer Switch Actions
 *
 * - switchTemplate: 현재 세션 종료 후 새 템플릿으로 전환
 */

import { create } from "mutative";
import dayjs from "dayjs";
import type {
    WorkStore,
    WorkRecord,
    WorkSession,
    WorkFormData,
} from "../../types";
import { DEFAULT_PROJECT_CODE } from "../../constants";
import { syncRecord, syncSettings } from "@/firebase/syncService";
import {
    findExistingRecordWithMerge,
    finishCurrentSession,
    type SetState,
} from "../../lib/timer_helpers";

/**
 * switchTemplate 액션 생성
 */
export function createSwitchTemplateAction(
    set: SetState,
    get: () => WorkStore
) {
    return (template_id: string) => {
        const { timer, templates } = get();
        const template = templates.find((t) => t.id === template_id);
        if (!template) return;

        // 현재 진행 중인 작업이 있으면 세션 종료
        if (timer.is_running && timer.start_time && timer.active_form_data) {
            finishCurrentSession(set, get);
        }

        // 새 템플릿으로 타이머 시작
        const new_form_data: WorkFormData = {
            project_code: template.project_code || DEFAULT_PROJECT_CODE,
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: template.deal_name,
            category_name: template.category_name,
            note: template.note,
        };

        // 폼 데이터 먼저 설정
        set({ form_data: new_form_data });

        // 새 작업 시작
        const start_time = Date.now();
        const start_dayjs = dayjs(start_time);
        const record_date = start_dayjs.format("YYYY-MM-DD");
        const start_time_str = start_dayjs.format("HH:mm");

        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: record_date,
            start_time: start_time_str,
            end_time: "",
            duration_minutes: 0,
        };

        // 최신 records 가져오기 (이전 세션 종료 후 상태)
        const current_records = get().records;
        const existing_record = findExistingRecordWithMerge(
            current_records,
            record_date,
            new_form_data.work_name,
            new_form_data.deal_name,
            set
        );

        let active_record_id: string;

        if (existing_record) {
            active_record_id = existing_record.id;
            set(
                create((state) => {
                    const rec = state.records.find(
                        (r) => r.id === existing_record.id
                    );
                    if (rec) {
                        rec.sessions.push(new_session);
                        rec.start_time = rec.start_time || start_time_str;
                    }
                })
            );

            const updated_record = get().records.find(
                (r) => r.id === existing_record.id
            );
            if (updated_record) {
                syncRecord(updated_record).catch(console.error);
            }
        } else {
            active_record_id = crypto.randomUUID();
            const new_record: WorkRecord = {
                id: active_record_id,
                ...new_form_data,
                project_code:
                    new_form_data.project_code || DEFAULT_PROJECT_CODE,
                duration_minutes: 0,
                start_time: start_time_str,
                end_time: "",
                date: record_date,
                sessions: [new_session],
                is_completed: false,
            };
            set(
                create((state) => {
                    state.records.push(new_record);
                })
            );
            syncRecord(new_record).catch(console.error);
        }

        set({
            timer: {
                is_running: true,
                start_time: start_time,
                active_template_id: template_id,
                active_form_data: new_form_data,
                active_record_id: active_record_id,
                active_session_id: new_session.id,
            },
        });

        syncSettings({ timer: get().timer }).catch(console.error);
    };
}
