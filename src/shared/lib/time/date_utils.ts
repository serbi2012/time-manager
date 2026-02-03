/**
 * 날짜 비교 유틸리티 함수들
 */

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
