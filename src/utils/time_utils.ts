/**
 * 시간 관련 유틸리티 함수
 * useWorkStore에서 사용하는 핵심 로직을 분리하여 테스트 가능하게 함
 */

// =====================================================
// 점심시간 관련 상수
// =====================================================
export const LUNCH_START_MINUTES = 11 * 60 + 40; // 700분 (11:40)
export const LUNCH_END_MINUTES = 12 * 60 + 40; // 760분 (12:40)
export const LUNCH_DURATION = LUNCH_END_MINUTES - LUNCH_START_MINUTES; // 60분

// =====================================================
// 시간 변환 유틸리티
// =====================================================

/**
 * 시간 문자열(HH:mm)을 분 단위로 변환
 */
export function timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    return h * 60 + m;
}

/**
 * 분을 시간 문자열(HH:mm)로 변환
 */
export function minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * 분을 사람이 읽기 쉬운 형태로 변환 (예: 1시간 30분)
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}시간`;
    }
    return `${hours}시간 ${mins}분`;
}

/**
 * 초를 HH:MM:SS 형태로 변환
 */
export function formatSecondsToHHMMSS(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

// =====================================================
// 점심시간 제외 계산
// =====================================================

/**
 * 점심시간을 제외한 실제 작업 시간 계산
 * 점심시간: 11:40 ~ 12:40 (60분)
 *
 * @param start_mins 시작 시간 (분 단위, 0-1440)
 * @param end_mins 종료 시간 (분 단위, 0-1440)
 * @returns 점심시간을 제외한 실제 작업 시간 (분)
 *
 * @example
 * // 점심시간과 겹치지 않는 경우
 * calculateDurationExcludingLunch(540, 660) // 09:00~11:00 = 120분
 *
 * @example
 * // 점심시간을 완전히 포함하는 경우
 * calculateDurationExcludingLunch(660, 780) // 11:00~13:00 = 60분 (점심 60분 제외)
 */
export function calculateDurationExcludingLunch(
    start_mins: number,
    end_mins: number
): number {
    // 유효성 검사
    if (end_mins <= start_mins) {
        return 0;
    }

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
        return end_mins - start_mins - LUNCH_DURATION;
    }

    // 점심시간 시작 부분과 겹치는 경우 (작업이 점심시간 중간에 끝남)
    if (start_mins < LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
        return LUNCH_START_MINUTES - start_mins;
    }

    // 점심시간 끝 부분과 겹치는 경우 (작업이 점심시간 중간에 시작)
    if (start_mins >= LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
        return end_mins - LUNCH_END_MINUTES;
    }

    return end_mins - start_mins;
}

// =====================================================
// 시간 범위 충돌 감지
// =====================================================

/**
 * 두 시간 범위가 겹치는지 확인
 *
 * @param start1 첫 번째 범위 시작 (분)
 * @param end1 첫 번째 범위 종료 (분)
 * @param start2 두 번째 범위 시작 (분)
 * @param end2 두 번째 범위 종료 (분)
 * @returns 겹치면 true, 아니면 false
 */
export function isTimeRangeOverlapping(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean {
    // 범위가 겹치지 않는 조건: 하나가 다른 하나의 완전히 전이거나 후
    return !(end1 <= start2 || start1 >= end2);
}

/**
 * 충돌 유형을 반환
 *
 * @returns
 * - 'none': 충돌 없음
 * - 'contains': 첫 번째가 두 번째를 완전히 포함
 * - 'contained': 두 번째가 첫 번째를 완전히 포함
 * - 'overlap_start': 첫 번째 시작이 두 번째 안에 있음
 * - 'overlap_end': 첫 번째 끝이 두 번째 안에 있음
 */
export function getOverlapType(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): 'none' | 'contains' | 'contained' | 'overlap_start' | 'overlap_end' {
    if (!isTimeRangeOverlapping(start1, end1, start2, end2)) {
        return 'none';
    }

    // 첫 번째가 두 번째를 완전히 포함
    if (start1 <= start2 && end1 >= end2) {
        return 'contains';
    }

    // 두 번째가 첫 번째를 완전히 포함
    if (start2 <= start1 && end2 >= end1) {
        return 'contained';
    }

    // 첫 번째 시작이 두 번째 안에 있음
    if (start1 >= start2 && start1 < end2) {
        return 'overlap_start';
    }

    // 첫 번째 끝이 두 번째 안에 있음
    return 'overlap_end';
}

// =====================================================
// 시간 범위 조정
// =====================================================

/**
 * 충돌을 피해 시간 범위를 조정
 *
 * @param new_start 새 범위 시작 (분)
 * @param new_end 새 범위 종료 (분)
 * @param existing_ranges 기존 범위들 [{start, end}]
 * @returns 조정된 범위 또는 null (조정 불가능)
 */
export function adjustTimeRangeToAvoidConflicts(
    new_start: number,
    new_end: number,
    existing_ranges: { start: number; end: number }[]
): { start: number; end: number; adjusted: boolean } | null {
    let adjusted_start = new_start;
    let adjusted_end = new_end;
    let was_adjusted = false;

    // 최대 10회 반복 (무한 루프 방지)
    for (let iteration = 0; iteration < 10; iteration++) {
        let has_conflict = false;

        for (const range of existing_ranges) {
            const overlap = getOverlapType(
                adjusted_start,
                adjusted_end,
                range.start,
                range.end
            );

            if (overlap === 'none') continue;

            has_conflict = true;

            // 완전 포함 관계는 조정 불가
            if (overlap === 'contains' || overlap === 'contained') {
                return null;
            }

            // 시작 부분 충돌: 시작을 기존 범위 종료로 이동
            if (overlap === 'overlap_start') {
                adjusted_start = range.end;
                was_adjusted = true;
            }
            // 끝 부분 충돌: 끝을 기존 범위 시작으로 이동
            else if (overlap === 'overlap_end') {
                adjusted_end = range.start;
                was_adjusted = true;
            }
        }

        if (!has_conflict) break;
    }

    // 조정 후 유효성 검사
    if (adjusted_end <= adjusted_start) {
        return null;
    }

    return {
        start: adjusted_start,
        end: adjusted_end,
        adjusted: was_adjusted,
    };
}

// =====================================================
// 날짜 관련 유틸리티
// =====================================================

/**
 * 날짜가 같은지 비교 (YYYY-MM-DD 형식)
 */
export function isSameDate(date1: string, date2: string): boolean {
    return date1 === date2;
}

/**
 * 날짜가 이전인지 비교
 */
export function isDateBefore(date1: string, date2: string): boolean {
    return date1 < date2;
}

/**
 * 날짜가 이후인지 비교
 */
export function isDateAfter(date1: string, date2: string): boolean {
    return date1 > date2;
}

/**
 * 날짜가 범위 내인지 확인
 */
export function isDateInRange(
    date: string,
    start_date: string,
    end_date: string
): boolean {
    return date >= start_date && date <= end_date;
}
