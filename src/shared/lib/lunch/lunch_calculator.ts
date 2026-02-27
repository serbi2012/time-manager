/**
 * 점심시간 관련 계산 함수들
 * 
 * 기본 점심시간: 11:40 ~ 12:40 (60분)
 * 사용자 설정 점심시간이 전달되면 해당 값을 사용
 */

export interface LunchTimeRange {
    start: number;
    end: number;
    duration: number;
}

// 점심시간 기본값 상수 (분 단위)
export const LUNCH_START_MINUTES = 11 * 60 + 40; // 700분 (11:40)
export const LUNCH_END_MINUTES = 12 * 60 + 40;   // 760분 (12:40)
export const LUNCH_DURATION_MINUTES = LUNCH_END_MINUTES - LUNCH_START_MINUTES; // 60분

function resolveLunchTime(lunch_time?: LunchTimeRange) {
    return {
        lunch_start: lunch_time?.start ?? LUNCH_START_MINUTES,
        lunch_end: lunch_time?.end ?? LUNCH_END_MINUTES,
        lunch_duration: lunch_time?.duration ?? LUNCH_DURATION_MINUTES,
    };
}

/**
 * 점심시간을 제외한 실제 작업 시간 계산
 * 
 * @param start_mins 시작 시간 (분 단위)
 * @param end_mins 종료 시간 (분 단위)
 * @param lunch_time 사용자 점심시간 설정 (미전달 시 기본값 11:40~12:40)
 * @returns 점심시간을 제외한 실제 작업 시간 (분)
 * 
 * @example
 * calculateDurationExcludingLunch(660, 780) // 60 (기본 점심 11:40~12:40)
 * calculateDurationExcludingLunch(660, 780, { start: 720, end: 780, duration: 60 }) // 60 (커스텀)
 */
export function calculateDurationExcludingLunch(
    start_mins: number,
    end_mins: number,
    lunch_time?: LunchTimeRange
): number {
    if (end_mins <= start_mins) return 0;

    const { lunch_start, lunch_end, lunch_duration } = resolveLunchTime(lunch_time);
    
    if (end_mins <= lunch_start || start_mins >= lunch_end) {
        return end_mins - start_mins;
    }

    if (start_mins >= lunch_start && end_mins <= lunch_end) {
        return 0;
    }

    if (start_mins < lunch_start && end_mins > lunch_end) {
        return end_mins - start_mins - lunch_duration;
    }

    if (start_mins < lunch_start && end_mins <= lunch_end) {
        return lunch_start - start_mins;
    }

    if (start_mins >= lunch_start && end_mins > lunch_end) {
        return end_mins - lunch_end;
    }

    return end_mins - start_mins;
}

/**
 * 특정 시간이 점심시간 내에 있는지 확인
 */
export function isInLunchTime(minutes: number, lunch_time?: LunchTimeRange): boolean {
    const { lunch_start, lunch_end } = resolveLunchTime(lunch_time);
    return minutes >= lunch_start && minutes < lunch_end;
}

/**
 * 시간 범위가 점심시간과 겹치는지 확인
 */
export function overlapsWithLunchTime(
    start_mins: number,
    end_mins: number,
    lunch_time?: LunchTimeRange
): boolean {
    const { lunch_start, lunch_end } = resolveLunchTime(lunch_time);
    return !(end_mins <= lunch_start || start_mins >= lunch_end);
}

/**
 * 점심시간과 겹치는 시간(분) 계산
 */
export function getLunchOverlapMinutes(
    start_mins: number,
    end_mins: number,
    lunch_time?: LunchTimeRange
): number {
    if (!overlapsWithLunchTime(start_mins, end_mins, lunch_time)) return 0;
    
    const { lunch_start, lunch_end } = resolveLunchTime(lunch_time);
    const overlap_start = Math.max(start_mins, lunch_start);
    const overlap_end = Math.min(end_mins, lunch_end);
    
    return Math.max(0, overlap_end - overlap_start);
}

/**
 * 점심시간을 피해 시간을 조정
 * 점심시간 중간에 시작하면 점심시간 종료 후로 이동
 */
export function adjustForLunchTime(minutes: number, lunch_time?: LunchTimeRange): number {
    const { lunch_start, lunch_end } = resolveLunchTime(lunch_time);
    if (minutes >= lunch_start && minutes < lunch_end) {
        return lunch_end;
    }
    return minutes;
}
