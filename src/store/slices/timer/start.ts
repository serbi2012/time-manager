/**
 * Timer Start Actions
 *
 * - startTimer: 새 타이머 시작
 * - startTimerForRecord: 기존 레코드에 대해 타이머 시작
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
    type SetState,
} from "../../lib/timer_helpers";

/**
 * startTimer 액션 생성
 */
export function createStartTimerAction(set: SetState, get: () => WorkStore) {
    return (template_id?: string) => {
        const { form_data, records } = get();
        const start_time = Date.now();
        const start_dayjs = dayjs(start_time);
        const record_date = start_dayjs.format("YYYY-MM-DD");
        const start_time_str = start_dayjs.format("HH:mm");

        // 진행 중인 세션 생성 (end_time은 빈 문자열)
        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: record_date,
            start_time: start_time_str,
            end_time: "", // 진행 중 표시
            duration_minutes: 0,
        };

        // 같은 작업 기록 찾기 (미완료 작업 우선)
        // 중복 발견 시 자동 병합
        const current_records = [...records];
        const existing_record = findExistingRecordWithMerge(
            current_records,
            record_date,
            form_data.work_name,
            form_data.deal_name,
            set
        );

        let active_record_id: string;
        let active_session_id: string;

        if (existing_record) {
            // 기존 레코드에 이미 진행 중인 세션(end_time = "")이 있는지 확인
            const existing_running_session = (
                existing_record.sessions || []
            ).find((s) => s.end_time === "");

            if (existing_running_session) {
                // 이미 진행 중인 세션이 있으면 새 세션을 추가하지 않고 기존 세션 사용
                active_record_id = existing_record.id;
                active_session_id = existing_running_session.id;

                // 타이머 상태만 업데이트 (세션은 추가하지 않음)
                set({
                    timer: {
                        is_running: true,
                        start_time: start_time,
                        active_template_id: template_id || null,
                        active_form_data: { ...form_data },
                        active_record_id: active_record_id,
                        active_session_id: active_session_id,
                    },
                });
                return;
            }

            // 진행 중인 세션이 없으면 새 세션 추가
            active_record_id = existing_record.id;
            active_session_id = new_session.id;
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

            // Firebase에 업데이트
            const updated_record = get().records.find(
                (r) => r.id === existing_record.id
            );
            if (updated_record) {
                syncRecord(updated_record).catch(console.error);
            }
        } else {
            // 새 레코드 생성
            active_record_id = crypto.randomUUID();
            active_session_id = new_session.id;
            const new_record: WorkRecord = {
                id: active_record_id,
                ...form_data,
                project_code: form_data.project_code || DEFAULT_PROJECT_CODE,
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

            // Firebase에 저장
            syncRecord(new_record).catch(console.error);
        }

        // 타이머 상태 업데이트
        set({
            timer: {
                is_running: true,
                start_time: start_time,
                active_template_id: template_id || null,
                active_form_data: { ...form_data },
                active_record_id: active_record_id,
                active_session_id: active_session_id,
            },
        });

        // 타이머 상태도 Firebase에 저장
        syncSettings({ timer: get().timer }).catch(console.error);
    };
}

/**
 * startTimerForRecord 액션 생성
 */
export function createStartTimerForRecordAction(
    set: SetState,
    get: () => WorkStore
) {
    return (record_id: string) => {
        const { records, timer } = get();
        const record = records.find((r) => r.id === record_id);
        if (!record) return;

        // 현재 타이머가 동작 중이면 먼저 정지
        if (timer.is_running) {
            get().stopTimer();
        }

        const start_time = Date.now();
        const start_dayjs = dayjs(start_time);
        const record_date = start_dayjs.format("YYYY-MM-DD");
        const start_time_str = start_dayjs.format("HH:mm");

        // 진행 중인 세션 생성
        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: record_date,
            start_time: start_time_str,
            end_time: "",
            duration_minutes: 0,
        };

        // 기존 레코드에 이미 진행 중인 세션이 있는지 확인
        const existing_running_session = (record.sessions || []).find(
            (s) => s.end_time === ""
        );

        let active_session_id: string;

        if (existing_running_session) {
            // 이미 진행 중인 세션이 있으면 해당 세션 사용
            active_session_id = existing_running_session.id;
        } else {
            // 새 세션 추가
            active_session_id = new_session.id;
            set(
                create((state) => {
                    const rec = state.records.find((r) => r.id === record_id);
                    if (rec) {
                        rec.sessions.push(new_session);
                        rec.start_time = rec.start_time || start_time_str;
                    }
                })
            );

            // Firebase에 업데이트
            const updated_record = get().records.find(
                (r) => r.id === record_id
            );
            if (updated_record) {
                syncRecord(updated_record).catch(console.error);
            }
        }

        // 레코드의 form_data 구성
        const record_form_data: WorkFormData = {
            project_code: record.project_code || "",
            work_name: record.work_name,
            task_name: record.task_name,
            deal_name: record.deal_name,
            category_name: record.category_name,
            note: record.note,
        };

        // 타이머 상태 업데이트
        set({
            form_data: record_form_data,
            timer: {
                is_running: true,
                start_time: start_time,
                active_template_id: null,
                active_form_data: record_form_data,
                active_record_id: record_id,
                active_session_id: active_session_id,
            },
        });

        // 타이머 상태 Firebase에 저장
        syncSettings({ timer: get().timer }).catch(console.error);
    };
}
