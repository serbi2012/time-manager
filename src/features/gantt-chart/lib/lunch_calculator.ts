/**
 * 점심시간 계산 관련 순수 함수
 */

export interface LunchTimeRange {
    start: number;
    end: number;
    duration: number;
}

/**
 * 점심시간을 제외한 실제 작업 시간 계산
 *
 * @param start_mins - 시작 시간 (분 단위)
 * @param end_mins - 종료 시간 (분 단위)
 * @param lunch_time - 점심시간 정보
 * @returns 점심시간을 제외한 실제 작업 시간 (분 단위)
 *
 * @example
 * ```ts
 * const lunch = { start: 720, end: 780, duration: 60 }; // 12:00-13:00
 * calculateDurationExcludingLunch(600, 900, lunch); // 10:00-15:00 = 240분 (점심 제외)
 * ```
 */
export function calculateDurationExcludingLunch(
    start_mins: number,
    end_mins: number,
    lunch_time: LunchTimeRange
): number {
    const {
        start: LUNCH_START,
        end: LUNCH_END,
        duration: LUNCH_DURATION,
    } = lunch_time;

    // 점심시간 전에 끝나거나 점심시간 후에 시작하는 경우
    if (end_mins <= LUNCH_START || start_mins >= LUNCH_END) {
        return end_mins - start_mins;
    }

    // 점심시간 내에 완전히 포함되는 경우
    if (start_mins >= LUNCH_START && end_mins <= LUNCH_END) {
        return 0;
    }

    // 점심시간을 포함하는 경우
    if (start_mins < LUNCH_START && end_mins > LUNCH_END) {
        return end_mins - start_mins - LUNCH_DURATION;
    }

    // 점심시간 시작 전부터 점심시간 중간까지
    if (start_mins < LUNCH_START && end_mins <= LUNCH_END) {
        return LUNCH_START - start_mins;
    }

    // 점심시간 중간부터 점심시간 종료 후까지
    if (start_mins >= LUNCH_START && end_mins > LUNCH_END) {
        return end_mins - LUNCH_END;
    }

    return end_mins - start_mins;
}

/**
 * 세션이 점심시간과 겹치는지 확인
 *
 * @param start_mins - 시작 시간 (분 단위)
 * @param end_mins - 종료 시간 (분 단위)
 * @param lunch_time - 점심시간 정보
 * @returns 점심시간과 겹치면 true
 */
export function isOverlappingWithLunch(
    start_mins: number,
    end_mins: number,
    lunch_time: LunchTimeRange
): boolean {
    const { start: LUNCH_START, end: LUNCH_END } = lunch_time;

    // 점심시간 전에 끝나거나 점심시간 후에 시작하는 경우
    if (end_mins <= LUNCH_START || start_mins >= LUNCH_END) {
        return false;
    }

    return true;
}

/**
 * 점심시간과의 겹침 구간 계산
 *
 * @param start_mins - 시작 시간 (분 단위)
 * @param end_mins - 종료 시간 (분 단위)
 * @param lunch_time - 점심시간 정보
 * @returns 겹치는 시간 범위 (null이면 겹치지 않음)
 */
export function calculateLunchOverlap(
    start_mins: number,
    end_mins: number,
    lunch_time: LunchTimeRange
): { start: number; end: number } | null {
    const { start: LUNCH_START, end: LUNCH_END } = lunch_time;

    if (!isOverlappingWithLunch(start_mins, end_mins, lunch_time)) {
        return null;
    }

    const overlap_start = Math.max(start_mins, LUNCH_START);
    const overlap_end = Math.min(end_mins, LUNCH_END);

    return {
        start: overlap_start,
        end: overlap_end,
    };
}
