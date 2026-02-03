/**
 * Timer Stop Actions
 *
 * - stopTimer: 타이머 중지 및 세션 저장
 * - resetTimer: 타이머 리셋 (진행 중인 세션 삭제)
 */

import { create } from "mutative";
import dayjs from "dayjs";
import type { WorkStore, WorkRecord } from "../../types";
import { DEFAULT_TIMER, DEFAULT_FORM_DATA } from "../../constants";
import {
    syncRecord,
    syncDeleteRecord,
    syncSettings,
} from "@/firebase/syncService";
import {
    calculateTotalMinutes,
    calculateDurationExcludingLunch,
} from "../../lib";
import { handleLegacyStopTimer, type SetState } from "../../lib/timer_helpers";

/**
 * stopTimer 액션 생성
 */
export function createStopTimerAction(set: SetState, get: () => WorkStore) {
    return (): WorkRecord | null => {
        const { timer, records } = get();
        if (!timer.is_running || !timer.start_time || !timer.active_form_data) {
            return null;
        }

        const { active_record_id, active_session_id } = timer;
        if (!active_record_id || !active_session_id) {
            // 이전 버전 호환: active_record_id/session_id가 없는 경우
            return handleLegacyStopTimer(set, get);
        }

        // 새로운 방식: 이미 추가된 세션의 end_time 업데이트
        const end_time = Date.now();
        const end_dayjs = dayjs(end_time);
        const end_time_str = end_dayjs.format("HH:mm");

        const record = records.find((r) => r.id === active_record_id);
        if (!record) {
            set({ timer: DEFAULT_TIMER, form_data: DEFAULT_FORM_DATA });
            return null;
        }

        // 세션의 종료 시간 및 소요 시간 계산
        const start_dayjs = dayjs(timer.start_time);
        const start_minutes = start_dayjs.hour() * 60 + start_dayjs.minute();
        const end_minutes = end_dayjs.hour() * 60 + end_dayjs.minute();
        const duration_minutes = Math.max(
            1,
            calculateDurationExcludingLunch(start_minutes, end_minutes)
        );

        set(
            create((state) => {
                const rec = state.records.find(
                    (r) => r.id === active_record_id
                );
                if (rec) {
                    // 세션 업데이트
                    const session = rec.sessions.find(
                        (s) => s.id === active_session_id
                    );
                    if (session) {
                        session.end_time = end_time_str;
                        session.duration_minutes = duration_minutes;
                    }

                    // 총 시간 재계산
                    const total_minutes = calculateTotalMinutes(rec.sessions);
                    rec.duration_minutes = total_minutes;

                    // 마지막 종료 시간 결정
                    const last_session = rec.sessions
                        .filter((s) => s.end_time !== "")
                        .sort((a, b) => a.end_time.localeCompare(b.end_time))
                        .pop();
                    rec.end_time = last_session?.end_time || end_time_str;
                }
                state.timer = DEFAULT_TIMER;
                state.form_data = DEFAULT_FORM_DATA;
            })
        );

        // Firebase에 업데이트
        const final_record = get().records.find(
            (r) => r.id === active_record_id
        );
        if (final_record) {
            syncRecord(final_record).catch(console.error);
        }
        syncSettings({ timer: DEFAULT_TIMER }).catch(console.error);

        return {
            ...record,
            duration_minutes: calculateTotalMinutes(record.sessions),
        };
    };
}

/**
 * resetTimer 액션 생성
 */
export function createResetTimerAction(set: SetState, get: () => WorkStore) {
    return () => {
        const { timer, records } = get();

        // 진행 중인 세션이 있으면 삭제
        if (
            timer.is_running &&
            timer.active_record_id &&
            timer.active_session_id
        ) {
            const record = records.find((r) => r.id === timer.active_record_id);
            if (record) {
                const remaining_sessions = record.sessions.filter(
                    (s) => s.id !== timer.active_session_id
                );

                if (remaining_sessions.length === 0) {
                    // 세션이 모두 삭제되면 레코드도 삭제
                    set(
                        create((state) => {
                            const index = state.records.findIndex(
                                (r) => r.id === timer.active_record_id
                            );
                            if (index !== -1) state.records.splice(index, 1);
                        })
                    );
                    syncDeleteRecord(timer.active_record_id).catch(
                        console.error
                    );
                } else {
                    // 남은 세션으로 레코드 업데이트
                    const total_minutes =
                        calculateTotalMinutes(remaining_sessions);
                    set(
                        create((state) => {
                            const rec = state.records.find(
                                (r) => r.id === timer.active_record_id
                            );
                            if (rec) {
                                const session_index = rec.sessions.findIndex(
                                    (s) => s.id === timer.active_session_id
                                );
                                if (session_index !== -1) {
                                    rec.sessions.splice(session_index, 1);
                                }
                                rec.duration_minutes = total_minutes;
                            }
                        })
                    );

                    const updated_record = get().records.find(
                        (r) => r.id === timer.active_record_id
                    );
                    if (updated_record) {
                        syncRecord(updated_record).catch(console.error);
                    }
                }
            }
        }

        set({ timer: DEFAULT_TIMER, form_data: DEFAULT_FORM_DATA });
        syncSettings({ timer: DEFAULT_TIMER }).catch(console.error);
    };
}
