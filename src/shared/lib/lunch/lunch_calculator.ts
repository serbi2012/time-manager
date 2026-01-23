/**
 * 점심시간 관련 계산 함수들
 * 
 * 점심시간: 11:40 ~ 12:40 (60분)
 */

// 점심시간 상수 (분 단위)
export const LUNCH_START_MINUTES = 11 * 60 + 40; // 700분 (11:40)
export const LUNCH_END_MINUTES = 12 * 60 + 40;   // 760분 (12:40)
export const LUNCH_DURATION_MINUTES = LUNCH_END_MINUTES - LUNCH_START_MINUTES; // 60분

/**
 * 점심시간을 제외한 실제 작업 시간 계산
 * 
 * @param start_mins 시작 시간 (분 단위)
 * @param end_mins 종료 시간 (분 단위)
 * @returns 점심시간을 제외한 실제 작업 시간 (분)
 * 
 * @example
 * // 11:00 ~ 13:00 -> 11:00~11:40(40분) + 12:40~13:00(20분) = 60분
 * calculateDurationExcludingLunch(660, 780) // 60
 */
export function calculateDurationExcludingLunch(
    start_mins: number,
    end_mins: number
): number {
    // 기본 유효성 검사
    if (end_mins <= start_mins) return 0;
    
    // 점심시간과 겹치지 않는 경우
    if (end_mins <= LUNCH_START_MINUTES || start_mins >= LUNCH_END_MINUTES) {
        return end_mins - start_mins;
    }

    // 점심시간에 완전히 포함되는 경우
    if (start_mins >= LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
        return 0;
    }

    // 점심시간을 완전히 포함하는 경우
    if (start_mins < LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
        return end_mins - start_mins - LUNCH_DURATION_MINUTES;
    }

    // 점심시간 시작 부분과 겹치는 경우 (작업이 점심시간 중간에 끝남)
    if (start_mins < LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
        return LUNCH_START_MINUTES - start_mins;
    }

    // 점심시간 끝 부분과 겹치는 경우 (작업이 점심시간 중간에 시작)
    if (start_mins >= LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
        return end_mins - LUNCH_END_MINUTES;
    }

    // 그 외의 경우 (논리적으로 도달하지 않음)
    return end_mins - start_mins;
}

/**
 * 특정 시간이 점심시간 내에 있는지 확인
 * 
 * @param minutes 확인할 시간 (분 단위)
 * @returns 점심시간 내 여부
 */
export function isInLunchTime(minutes: number): boolean {
    return minutes >= LUNCH_START_MINUTES && minutes < LUNCH_END_MINUTES;
}

/**
 * 시간 범위가 점심시간과 겹치는지 확인
 * 
 * @param start_mins 시작 시간 (분 단위)
 * @param end_mins 종료 시간 (분 단위)
 * @returns 겹침 여부
 */
export function overlapsWithLunchTime(
    start_mins: number,
    end_mins: number
): boolean {
    return !(end_mins <= LUNCH_START_MINUTES || start_mins >= LUNCH_END_MINUTES);
}

/**
 * 점심시간과 겹치는 시간(분) 계산
 * 
 * @param start_mins 시작 시간 (분 단위)
 * @param end_mins 종료 시간 (분 단위)
 * @returns 겹치는 시간 (분)
 */
export function getLunchOverlapMinutes(
    start_mins: number,
    end_mins: number
): number {
    if (!overlapsWithLunchTime(start_mins, end_mins)) return 0;
    
    const overlap_start = Math.max(start_mins, LUNCH_START_MINUTES);
    const overlap_end = Math.min(end_mins, LUNCH_END_MINUTES);
    
    return Math.max(0, overlap_end - overlap_start);
}

/**
 * 점심시간을 피해 시간을 조정
 * 점심시간 중간에 시작하면 점심시간 종료 후로 이동
 * 
 * @param minutes 조정할 시간 (분 단위)
 * @returns 조정된 시간 (분 단위)
 */
export function adjustForLunchTime(minutes: number): number {
    if (minutes >= LUNCH_START_MINUTES && minutes < LUNCH_END_MINUTES) {
        return LUNCH_END_MINUTES;
    }
    return minutes;
}
