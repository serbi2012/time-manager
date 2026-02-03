/**
 * Timer Helper Functions
 *
 * 타이머 슬라이스에서 사용하는 헬퍼 함수들
 * - 세션 생성
 * - 레코드 찾기/병합
 * - 세션 종료 처리
 */

import { create } from "mutative";
import dayjs from "dayjs";
import type {
    WorkStore,
    WorkRecord,
    WorkSession,
    WorkFormData,
} from "../types";
import {
    DEFAULT_TIMER,
    DEFAULT_FORM_DATA,
    DEFAULT_PROJECT_CODE,
} from "../constants";
import { syncRecord, syncSettings } from "@/firebase/syncService";
import {
    findExistingRecord,
    mergeRecords,
    calculateTotalMinutes,
    calculateDurationExcludingLunch,
} from "../lib";

// Zustand set 함수 타입 정의
export type SetState = (
    partial: Partial<WorkStore> | ((state: WorkStore) => Partial<WorkStore>),
    replace?: false
) => void;

/**
 * 새 세션 생성 (WorkSession 타입 반환)
 */
export function createWorkSession(
    start_time: number,
    end_time: number
): WorkSession {
    const start_date = new Date(start_time);
    const end_date = new Date(end_time);

    const start_mins = start_date.getHours() * 60 + start_date.getMinutes();
    const end_mins = end_date.getHours() * 60 + end_date.getMinutes();

    const duration_minutes = Math.max(
        1,
        calculateDurationExcludingLunch(start_mins, end_mins)
    );

    const pad = (n: number) => n.toString().padStart(2, "0");

    return {
        id: crypto.randomUUID(),
        date: `${start_date.getFullYear()}-${pad(
            start_date.getMonth() + 1
        )}-${pad(start_date.getDate())}`,
        start_time: `${pad(start_date.getHours())}:${pad(
            start_date.getMinutes()
        )}`,
        end_time: `${pad(end_date.getHours())}:${pad(end_date.getMinutes())}`,
        duration_minutes,
    };
}

/**
 * 기존 레코드 찾기 (중복 발견 시 자동 병합)
 */
export function findExistingRecordWithMerge(
    records: WorkRecord[],
    date: string,
    work_name: string,
    deal_name: string,
    set: SetState
): WorkRecord | undefined {
    // 미완료 매칭 찾기
    const incomplete_matches = records.filter(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );

    if (incomplete_matches.length > 0) {
        // 중복이 2개 이상이면 자동 병합
        if (incomplete_matches.length >= 2) {
            console.log(
                `[AutoMerge] "${work_name} > ${deal_name}" 중복 ${incomplete_matches.length}개 발견, 자동 병합`
            );
            const merged = mergeRecords(incomplete_matches);
            set(
                create((state: WorkStore) => {
                    // 병합된 레코드로 교체
                    const index = state.records.findIndex(
                        (r) => r.id === merged.base_record.id
                    );
                    if (index !== -1) {
                        state.records[index] = merged.base_record;
                    }
                    // 삭제할 레코드들 제거
                    merged.deleted_ids.forEach((id) => {
                        const del_index = state.records.findIndex(
                            (r) => r.id === id
                        );
                        if (del_index !== -1) {
                            state.records.splice(del_index, 1);
                        }
                    });
                })
            );
            return merged.base_record;
        }
        return incomplete_matches[0];
    }

    // 같은 날짜의 작업 찾기
    return records.find(
        (r) =>
            !r.is_deleted &&
            r.date === date &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );
}

/**
 * 현재 세션 종료 (switchTemplate에서 사용)
 */
export function finishCurrentSession(
    set: SetState,
    get: () => WorkStore
): void {
    const { timer, records } = get();
    const { active_record_id, active_session_id } = timer;
    const end_time = Date.now();
    const end_dayjs = dayjs(end_time);
    const end_time_str = end_dayjs.format("HH:mm");

    if (active_record_id && active_session_id) {
        const record = records.find((r) => r.id === active_record_id);
        if (record) {
            const start_dayjs = dayjs(timer.start_time);
            const start_minutes =
                start_dayjs.hour() * 60 + start_dayjs.minute();
            const end_minutes = end_dayjs.hour() * 60 + end_dayjs.minute();
            const duration_minutes = Math.max(
                1,
                calculateDurationExcludingLunch(start_minutes, end_minutes)
            );

            set(
                create((state: WorkStore) => {
                    const rec = state.records.find(
                        (r) => r.id === active_record_id
                    );
                    if (rec) {
                        const session = rec.sessions.find(
                            (s) => s.id === active_session_id
                        );
                        if (session) {
                            session.end_time = end_time_str;
                            session.duration_minutes = duration_minutes;
                        }

                        const total_minutes = calculateTotalMinutes(
                            rec.sessions
                        );
                        rec.duration_minutes = total_minutes;

                        const last_session = rec.sessions
                            .filter((s) => s.end_time !== "")
                            .sort((a, b) =>
                                a.end_time.localeCompare(b.end_time)
                            )
                            .pop();
                        rec.end_time = last_session?.end_time || end_time_str;
                    }
                })
            );

            const updated_record = get().records.find(
                (r) => r.id === active_record_id
            );
            if (updated_record) {
                syncRecord(updated_record).catch(console.error);
            }
        }
    } else if (timer.active_form_data) {
        // 이전 버전 호환
        handleLegacySessionFinish(
            set,
            get,
            timer.active_form_data,
            timer.start_time!,
            end_time,
            records
        );
    }
}

/**
 * 이전 버전 호환용 세션 종료 (active_record_id/session_id가 없는 경우)
 */
function handleLegacySessionFinish(
    set: SetState,
    get: () => WorkStore,
    active_form: WorkFormData,
    start_time: number,
    end_time: number,
    records: WorkRecord[]
): void {
    const record_date = dayjs(start_time).format("YYYY-MM-DD");
    const new_session = createWorkSession(start_time, end_time);

    const existing_record = findExistingRecord(
        records,
        record_date,
        active_form.work_name,
        active_form.deal_name
    );

    if (existing_record) {
        set(
            create((state: WorkStore) => {
                const rec = state.records.find(
                    (r) => r.id === existing_record.id
                );
                if (rec) {
                    rec.sessions.push(new_session);
                    const total_minutes = calculateTotalMinutes(rec.sessions);
                    rec.duration_minutes = total_minutes;
                    rec.start_time = rec.start_time || new_session.start_time;
                    rec.end_time = new_session.end_time;
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
        const new_record: WorkRecord = {
            id: crypto.randomUUID(),
            ...active_form,
            project_code: active_form.project_code || DEFAULT_PROJECT_CODE,
            duration_minutes: calculateTotalMinutes([new_session]),
            start_time: new_session.start_time,
            end_time: new_session.end_time,
            date: record_date,
            sessions: [new_session],
            is_completed: false,
        };

        set(
            create((state: WorkStore) => {
                state.records.push(new_record);
            })
        );

        syncRecord(new_record).catch(console.error);
    }
}

/**
 * 이전 버전 호환용 stopTimer (active_record_id/session_id가 없는 경우)
 */
export function handleLegacyStopTimer(
    set: SetState,
    get: () => WorkStore
): WorkRecord | null {
    const { timer } = get();
    const records = get().records;
    const active_form = timer.active_form_data!;
    const end_time = Date.now();
    const record_date = dayjs(timer.start_time!).format("YYYY-MM-DD");
    const new_session = createWorkSession(timer.start_time!, end_time);

    const existing_record = findExistingRecord(
        records,
        record_date,
        active_form.work_name,
        active_form.deal_name
    );

    if (existing_record) {
        set(
            create((state: WorkStore) => {
                const rec = state.records.find(
                    (r) => r.id === existing_record.id
                );
                if (rec) {
                    rec.sessions.push(new_session);
                    const total_minutes = calculateTotalMinutes(rec.sessions);
                    rec.duration_minutes = total_minutes;
                    rec.start_time = rec.start_time || new_session.start_time;
                    rec.end_time = new_session.end_time;
                }
                state.timer = DEFAULT_TIMER;
                state.form_data = DEFAULT_FORM_DATA;
            })
        );

        const updated_record = get().records.find(
            (r) => r.id === existing_record.id
        );
        if (updated_record) {
            syncRecord(updated_record).catch(console.error);
        }
        syncSettings({ timer: DEFAULT_TIMER }).catch(console.error);

        return {
            ...existing_record,
            duration_minutes: calculateTotalMinutes([
                ...existing_record.sessions,
                new_session,
            ]),
        };
    } else {
        const new_record: WorkRecord = {
            id: crypto.randomUUID(),
            ...active_form,
            project_code: active_form.project_code || DEFAULT_PROJECT_CODE,
            duration_minutes: calculateTotalMinutes([new_session]),
            start_time: new_session.start_time,
            end_time: new_session.end_time,
            date: record_date,
            sessions: [new_session],
            is_completed: false,
        };

        set(
            create((state: WorkStore) => {
                state.records.push(new_record);
                state.timer = DEFAULT_TIMER;
                state.form_data = DEFAULT_FORM_DATA;
            })
        );

        syncRecord(new_record).catch(console.error);
        syncSettings({ timer: DEFAULT_TIMER }).catch(console.error);

        return new_record;
    }
}
