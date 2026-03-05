/**
 * 세션 충돌 감지 및 자동 조정 순수 함수
 *
 * updateSession 스토어 액션에서 추출된 로직으로,
 * 같은 날 다른 세션과의 시간 충돌을 감지하고 자동 조정합니다.
 */

import dayjs from "dayjs";
import type { WorkRecord, WorkSession } from "../types";
import { timeToMinutes, minutesToTime } from "@/shared/lib/time";
import {
    ERROR_MESSAGES,
    WARNING_MESSAGES,
    STATUS_LABELS,
} from "@/shared/constants";

const MAX_ADJUST_ITERATIONS = 10;

export interface SessionTimeSlot {
    record_id: string;
    session: WorkSession;
    start_mins: number;
    end_mins: number;
    work_name: string;
    deal_name: string;
}

export interface SessionUpdateResult {
    success: boolean;
    adjusted: boolean;
    message?: string;
    adjusted_start?: string;
    adjusted_end?: string;
}

interface TimerState {
    is_running: boolean;
    start_time: number | null;
    active_form_data: {
        work_name: string;
        deal_name: string;
    } | null;
}

function formatConflictInfo(other: SessionTimeSlot): string {
    const name_part = other.deal_name
        ? `"${other.work_name} > ${other.deal_name}"`
        : `"${other.work_name}"`;
    return `${name_part} (${other.session.start_time}~${other.session.end_time})`;
}

/**
 * 대상 날짜의 모든 세션을 수집 (현재 수정 중인 세션 제외)
 */
export function collectSameDaySessions(
    records: WorkRecord[],
    target_date: string,
    exclude_record_id: string,
    exclude_session_id: string,
    timer: TimerState
): SessionTimeSlot[] {
    const slots: SessionTimeSlot[] = [];

    records.forEach((r) => {
        if (r.is_deleted) return;

        r.sessions?.forEach((s) => {
            const session_date = s.date || r.date;
            if (
                session_date === target_date &&
                !(r.id === exclude_record_id && s.id === exclude_session_id)
            ) {
                slots.push({
                    record_id: r.id,
                    session: s,
                    start_mins: timeToMinutes(s.start_time),
                    end_mins: timeToMinutes(s.end_time),
                    work_name: r.work_name,
                    deal_name: r.deal_name,
                });
            }
        });
    });

    if (timer.is_running && timer.start_time && timer.active_form_data) {
        const timer_date = dayjs(timer.start_time).format("YYYY-MM-DD");
        if (timer_date === target_date) {
            const timer_start_mins = timeToMinutes(
                dayjs(timer.start_time).format("HH:mm")
            );
            const timer_end_mins = timeToMinutes(dayjs().format("HH:mm"));
            if (timer_end_mins > timer_start_mins) {
                slots.push({
                    record_id: "virtual-running-record",
                    session: {
                        id: "virtual-running-session",
                        date: timer_date,
                        start_time: dayjs(timer.start_time).format("HH:mm"),
                        end_time: dayjs().format("HH:mm"),
                        duration_minutes: timer_end_mins - timer_start_mins,
                    },
                    start_mins: timer_start_mins,
                    end_mins: timer_end_mins,
                    work_name:
                        timer.active_form_data.work_name ||
                        `${STATUS_LABELS.inProgress}인 작업`,
                    deal_name: timer.active_form_data.deal_name || "",
                });
            }
        }
    }

    return slots;
}

/**
 * 날짜 변경 시 충돌 검사 (자동 조정 없음)
 */
export function checkDateChangeConflicts(
    same_day_sessions: SessionTimeSlot[],
    new_start_mins: number,
    new_end_mins: number,
    target_date: string
): SessionUpdateResult | null {
    for (const other of same_day_sessions) {
        const overlaps = !(
            new_end_mins <= other.start_mins || new_start_mins >= other.end_mins
        );
        if (overlaps) {
            return {
                success: false,
                adjusted: false,
                message: ERROR_MESSAGES.conflictOverlap(
                    target_date,
                    formatConflictInfo(other)
                ),
            };
        }
    }
    return null;
}

/**
 * 같은 날짜 내 충돌 시 자동 조정
 */
export function autoAdjustForConflicts(
    same_day_sessions: SessionTimeSlot[],
    new_start_mins: number,
    new_end_mins: number
):
    | SessionUpdateResult
    | {
          adjusted_start_mins: number;
          adjusted_end_mins: number;
          was_adjusted: boolean;
      } {
    let current_start_mins = new_start_mins;
    let current_end_mins = new_end_mins;
    let was_adjusted = false;

    for (let iteration = 0; iteration < MAX_ADJUST_ITERATIONS; iteration++) {
        let has_conflict = false;

        for (const other of same_day_sessions) {
            const overlaps = !(
                current_end_mins <= other.start_mins ||
                current_start_mins >= other.end_mins
            );

            if (overlaps) {
                has_conflict = true;

                if (
                    current_start_mins <= other.start_mins &&
                    current_end_mins >= other.end_mins
                ) {
                    return {
                        success: false,
                        adjusted: false,
                        message: ERROR_MESSAGES.conflictFullOverlap(
                            formatConflictInfo(other)
                        ),
                    };
                }

                if (
                    other.start_mins <= current_start_mins &&
                    other.end_mins >= current_end_mins
                ) {
                    return {
                        success: false,
                        adjusted: false,
                        message: ERROR_MESSAGES.conflictContained(
                            formatConflictInfo(other)
                        ),
                    };
                }

                if (
                    current_start_mins >= other.start_mins &&
                    current_start_mins < other.end_mins
                ) {
                    current_start_mins = other.end_mins;
                    was_adjusted = true;
                } else if (
                    current_end_mins > other.start_mins &&
                    current_end_mins <= other.end_mins
                ) {
                    current_end_mins = other.start_mins;
                    was_adjusted = true;
                }
            }
        }

        if (!has_conflict) break;
    }

    return {
        adjusted_start_mins: current_start_mins,
        adjusted_end_mins: current_end_mins,
        was_adjusted,
    };
}

/**
 * 세션 시간 업데이트 검증 및 조정을 수행하는 통합 함수
 *
 * @returns 실패 시 에러 결과, 성공 시 조정된 시간 정보
 */
export function validateAndAdjustSessionTime(
    records: WorkRecord[],
    timer: TimerState,
    record_id: string,
    session_id: string,
    new_start: string,
    new_end: string,
    new_date?: string
): SessionUpdateResult {
    const record = records.find((r) => r.id === record_id);
    if (!record) {
        return {
            success: false,
            adjusted: false,
            message: ERROR_MESSAGES.recordNotFoundStore,
        };
    }

    const session = record.sessions.find((s) => s.id === session_id);
    if (!session) {
        return {
            success: false,
            adjusted: false,
            message: ERROR_MESSAGES.sessionNotFoundStore,
        };
    }

    const target_date = new_date || session.date || record.date;
    const is_date_changed =
        new_date && new_date !== (session.date || record.date);

    const new_start_mins = timeToMinutes(new_start);
    const new_end_mins = timeToMinutes(new_end);

    if (new_end_mins <= new_start_mins) {
        return {
            success: false,
            adjusted: false,
            message: ERROR_MESSAGES.endTimeBeforeStart,
        };
    }

    const same_day_sessions = collectSameDaySessions(
        records,
        target_date,
        record_id,
        session_id,
        timer
    );

    if (is_date_changed) {
        const conflict = checkDateChangeConflicts(
            same_day_sessions,
            new_start_mins,
            new_end_mins,
            target_date
        );
        if (conflict) return conflict;

        return {
            success: true,
            adjusted: false,
            adjusted_start: new_start,
            adjusted_end: new_end,
        };
    }

    const result = autoAdjustForConflicts(
        same_day_sessions,
        new_start_mins,
        new_end_mins
    );

    if ("success" in result) {
        return result;
    }

    const adjusted_start = minutesToTime(result.adjusted_start_mins);
    const adjusted_end = minutesToTime(result.adjusted_end_mins);

    const final_start_mins = timeToMinutes(adjusted_start);
    const final_end_mins = timeToMinutes(adjusted_end);
    if (final_end_mins <= final_start_mins) {
        return {
            success: false,
            adjusted: false,
            message: ERROR_MESSAGES.conflictUnavoidable,
        };
    }

    return {
        success: true,
        adjusted: result.was_adjusted,
        adjusted_start,
        adjusted_end,
        message: result.was_adjusted
            ? WARNING_MESSAGES.autoAdjustedConflict
            : undefined,
    };
}
