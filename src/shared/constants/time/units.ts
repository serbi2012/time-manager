/**
 * 시간 단위 상수
 */

// ============================================
// 기본 단위
// ============================================

/** 1시간 = 60분 */
export const MINUTES_PER_HOUR = 60;

/** 1분 = 60초 */
export const SECONDS_PER_MINUTE = 60;

/** 1시간 = 3600초 */
export const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

/** 1초 = 1000ms */
export const MS_PER_SECOND = 1000;

/** 1분 = 60000ms */
export const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;

/** 1시간 = 3600000ms */
export const MS_PER_HOUR = SECONDS_PER_HOUR * MS_PER_SECOND;

/** 1일 = 86400000ms */
export const MS_PER_DAY = 24 * MS_PER_HOUR;

// ============================================
// 시간 계산 헬퍼
// ============================================

/**
 * 시간을 분 단위로 변환
 * @param hours 시간
 * @param minutes 분 (기본값 0)
 */
export function hoursToMinutes(hours: number, minutes: number = 0): number {
    return hours * MINUTES_PER_HOUR + minutes;
}

/**
 * 분을 시:분 형식 문자열로 변환
 * @param totalMinutes 총 분
 */
export function minutesToTimeString(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
    const mins = totalMinutes % MINUTES_PER_HOUR;
    return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
}
