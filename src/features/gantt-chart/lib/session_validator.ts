/**
 * 세션 유효성 검사 관련 순수 함수
 */

import type { WorkSession } from "../../../shared/types";
import { timeToMinutes } from "../../../shared/lib/time";

export interface ValidationResult {
    is_valid: boolean;
    error_message?: string;
}

/**
 * 시간 형식 검증 (HH:mm)
 *
 * @param time_str - 시간 문자열
 * @returns 검증 결과
 */
export function validateTimeFormat(time_str: string): ValidationResult {
    const pattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!pattern.test(time_str)) {
        return {
            is_valid: false,
            error_message: "시간 형식이 올바르지 않습니다. (HH:mm)",
        };
    }

    return { is_valid: true };
}

/**
 * 시작/종료 시간 순서 검증
 *
 * @param start_time - 시작 시간
 * @param end_time - 종료 시간
 * @returns 검증 결과
 */
export function validateTimeOrder(
    start_time: string,
    end_time: string
): ValidationResult {
    const start_mins = timeToMinutes(start_time);
    const end_mins = timeToMinutes(end_time);

    if (start_mins >= end_mins) {
        return {
            is_valid: false,
            error_message: "시작 시간이 종료 시간보다 늦습니다.",
        };
    }

    return { is_valid: true };
}

/**
 * 최소 작업 시간 검증
 *
 * @param start_time - 시작 시간
 * @param end_time - 종료 시간
 * @param min_duration - 최소 작업 시간 (분 단위, 기본 1분)
 * @returns 검증 결과
 */
export function validateMinDuration(
    start_time: string,
    end_time: string,
    min_duration: number = 1
): ValidationResult {
    const start_mins = timeToMinutes(start_time);
    const end_mins = timeToMinutes(end_time);
    const duration = end_mins - start_mins;

    if (duration < min_duration) {
        return {
            is_valid: false,
            error_message: `작업 시간은 최소 ${min_duration}분 이상이어야 합니다.`,
        };
    }

    return { is_valid: true };
}

/**
 * 세션 시간 범위가 다른 세션과 겹치는지 검증
 *
 * @param start_time - 시작 시간
 * @param end_time - 종료 시간
 * @param existing_sessions - 기존 세션 목록
 * @param exclude_session_id - 검증에서 제외할 세션 ID (수정 시)
 * @returns 검증 결과
 */
export function validateSessionOverlap(
    start_time: string,
    end_time: string,
    existing_sessions: WorkSession[],
    exclude_session_id?: string
): ValidationResult {
    const start_mins = timeToMinutes(start_time);
    const end_mins = timeToMinutes(end_time);

    for (const session of existing_sessions) {
        // 수정 중인 세션은 제외
        if (exclude_session_id && session.id === exclude_session_id) {
            continue;
        }

        // 종료 시간이 없는 진행 중 세션은 검증 제외
        if (!session.end_time) {
            continue;
        }

        const session_start = timeToMinutes(session.start_time);
        const session_end = timeToMinutes(session.end_time);

        // 겹침 검사
        if (start_mins < session_end && end_mins > session_start) {
            return {
                is_valid: false,
                error_message: `다른 세션과 시간이 겹칩니다. (${session.start_time} ~ ${session.end_time})`,
            };
        }
    }

    return { is_valid: true };
}

/**
 * 세션 시간 종합 검증
 *
 * @param start_time - 시작 시간
 * @param end_time - 종료 시간
 * @param options - 검증 옵션
 * @returns 검증 결과
 */
export function validateSessionTime(
    start_time: string,
    end_time: string,
    options: {
        existing_sessions?: WorkSession[];
        exclude_session_id?: string;
        min_duration?: number;
    } = {}
): ValidationResult {
    // 시간 형식 검증
    const start_format_result = validateTimeFormat(start_time);
    if (!start_format_result.is_valid) {
        return start_format_result;
    }

    const end_format_result = validateTimeFormat(end_time);
    if (!end_format_result.is_valid) {
        return end_format_result;
    }

    // 시간 순서 검증
    const order_result = validateTimeOrder(start_time, end_time);
    if (!order_result.is_valid) {
        return order_result;
    }

    // 최소 작업 시간 검증
    const duration_result = validateMinDuration(
        start_time,
        end_time,
        options.min_duration
    );
    if (!duration_result.is_valid) {
        return duration_result;
    }

    // 세션 겹침 검증
    if (options.existing_sessions) {
        const overlap_result = validateSessionOverlap(
            start_time,
            end_time,
            options.existing_sessions,
            options.exclude_session_id
        );
        if (!overlap_result.is_valid) {
            return overlap_result;
        }
    }

    return { is_valid: true };
}
