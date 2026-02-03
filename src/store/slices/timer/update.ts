/**
 * Timer Update Actions
 *
 * - updateActiveFormData: 진행 중인 작업의 폼 데이터 업데이트
 * - updateTimerStartTime: 타이머 시작 시간 변경 (충돌 검사 포함)
 */

import { create } from "mutative";
import dayjs from "dayjs";
import type { WorkStore, WorkFormData } from "../../types";
import { syncRecord, syncSettings } from "@/firebase/syncService";
import { timeToMinutes } from "../../lib";
import type { SetState } from "../../lib/timer_helpers";

/**
 * updateActiveFormData 액션 생성
 */
export function createUpdateActiveFormDataAction(
    set: SetState,
    _get: () => WorkStore
) {
    return (data: Partial<WorkFormData>) => {
        set(
            create((state) => {
                if (state.timer.active_form_data) {
                    Object.assign(state.timer.active_form_data, data);
                }
                Object.assign(state.form_data, data);
            })
        );
    };
}

/**
 * 충돌 정보 포맷팅 헬퍼
 */
function formatConflictInfo(other: {
    start_mins: number;
    end_mins: number;
    work_name: string;
    deal_name: string;
}): string {
    const name_part = other.deal_name
        ? `"${other.work_name} > ${other.deal_name}"`
        : `"${other.work_name}"`;
    const end_time_str = `${Math.floor(other.end_mins / 60)
        .toString()
        .padStart(2, "0")}:${(other.end_mins % 60)
        .toString()
        .padStart(2, "0")}`;
    const start_time_str = `${Math.floor(other.start_mins / 60)
        .toString()
        .padStart(2, "0")}:${(other.start_mins % 60)
        .toString()
        .padStart(2, "0")}`;
    return `${name_part} (${start_time_str}~${end_time_str})`;
}

/**
 * updateTimerStartTime 액션 생성
 */
export function createUpdateTimerStartTimeAction(
    set: SetState,
    get: () => WorkStore
) {
    return (new_start_time: number) => {
        const { timer, records } = get();
        if (!timer.is_running || !timer.start_time) {
            return {
                success: false,
                adjusted: false,
                message: "타이머가 실행 중이 아닙니다.",
            };
        }

        // 새 시작 시간은 현재 시간보다 미래일 수 없음
        if (new_start_time > Date.now()) {
            return {
                success: false,
                adjusted: false,
                message: "시작 시간은 현재 시간보다 미래일 수 없습니다.",
            };
        }

        const new_start_dayjs = dayjs(new_start_time);
        const timer_date = new_start_dayjs.format("YYYY-MM-DD");
        const new_start_mins =
            new_start_dayjs.hour() * 60 + new_start_dayjs.minute();
        const current_end_mins = dayjs().hour() * 60 + dayjs().minute();

        // 같은 날짜의 다른 세션 수집 (현재 진행 중인 세션 제외)
        const same_day_sessions: {
            record_id: string;
            session_id: string;
            start_mins: number;
            end_mins: number;
            work_name: string;
            deal_name: string;
        }[] = [];

        records.forEach((r) => {
            if (r.is_deleted) return;
            r.sessions?.forEach((s) => {
                const session_date = s.date || r.date;
                if (
                    session_date === timer_date &&
                    !(
                        r.id === timer.active_record_id &&
                        s.id === timer.active_session_id
                    )
                ) {
                    const end_mins = s.end_time
                        ? timeToMinutes(s.end_time)
                        : current_end_mins;
                    same_day_sessions.push({
                        record_id: r.id,
                        session_id: s.id,
                        start_mins: timeToMinutes(s.start_time),
                        end_mins,
                        work_name: r.work_name,
                        deal_name: r.deal_name,
                    });
                }
            });
        });

        // 충돌 검사 및 자동 조정
        let was_adjusted = false;
        let adjusted_start_mins = new_start_mins;

        // 충돌이 있는 동안 반복적으로 조정 (최대 10회)
        for (let iteration = 0; iteration < 10; iteration++) {
            let has_conflict = false;

            for (const other of same_day_sessions) {
                const overlaps = !(
                    current_end_mins <= other.start_mins ||
                    adjusted_start_mins >= other.end_mins
                );

                if (overlaps) {
                    has_conflict = true;

                    if (
                        adjusted_start_mins <= other.start_mins &&
                        current_end_mins >= other.end_mins
                    ) {
                        return {
                            success: false,
                            adjusted: false,
                            message: `${formatConflictInfo(
                                other
                            )} 작업과 시간이 완전히 겹칩니다.`,
                        };
                    }

                    if (
                        other.start_mins <= adjusted_start_mins &&
                        other.end_mins >= current_end_mins
                    ) {
                        return {
                            success: false,
                            adjusted: false,
                            message: `${formatConflictInfo(
                                other
                            )} 작업 안에 완전히 포함됩니다.`,
                        };
                    }

                    if (
                        adjusted_start_mins >= other.start_mins &&
                        adjusted_start_mins < other.end_mins
                    ) {
                        adjusted_start_mins = other.end_mins;
                        was_adjusted = true;
                    }
                }
            }

            if (!has_conflict) break;
        }

        // 조정 후 유효성 검사
        if (adjusted_start_mins >= current_end_mins) {
            return {
                success: false,
                adjusted: false,
                message: "충돌을 피할 수 없습니다. 다른 시간을 선택하세요.",
            };
        }

        // 조정된 시작 시간 타임스탬프 계산
        const adjusted_start_time = dayjs(new_start_time)
            .hour(Math.floor(adjusted_start_mins / 60))
            .minute(adjusted_start_mins % 60)
            .second(0)
            .millisecond(0)
            .valueOf();

        const adjusted_start_time_str = `${Math.floor(adjusted_start_mins / 60)
            .toString()
            .padStart(2, "0")}:${(adjusted_start_mins % 60)
            .toString()
            .padStart(2, "0")}`;

        // 타이머 상태 업데이트
        set(
            create((state) => {
                state.timer.start_time = adjusted_start_time;
            })
        );

        // 진행 중인 세션의 start_time도 업데이트
        if (timer.active_record_id && timer.active_session_id) {
            set(
                create((state) => {
                    const rec = state.records.find(
                        (r) => r.id === timer.active_record_id
                    );
                    if (rec) {
                        const session = rec.sessions.find(
                            (s) => s.id === timer.active_session_id
                        );
                        if (session) {
                            session.start_time = adjusted_start_time_str;
                        }

                        // 첫 번째 세션의 시작 시간으로 레코드 시작 시간 업데이트
                        const sorted_sessions = [...rec.sessions].sort((a, b) =>
                            a.start_time.localeCompare(b.start_time)
                        );
                        rec.start_time =
                            sorted_sessions[0]?.start_time || rec.start_time;
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

        syncSettings({ timer: get().timer }).catch(console.error);

        return {
            success: true,
            adjusted: was_adjusted,
            message: was_adjusted
                ? "시간 충돌로 인해 자동 조정되었습니다."
                : undefined,
            adjusted_start_time: was_adjusted ? adjusted_start_time : undefined,
        };
    };
}
