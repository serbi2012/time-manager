/**
 * 시간 관련 유효성 검사 함수들
 */

/**
 * 시간 문자열이 유효한 HH:mm 형식인지 검사
 * @param time_str 시간 문자열
 * @returns 유효 여부
 */
export function isValidTimeFormat(time_str: string): boolean {
    if (!time_str || typeof time_str !== "string") return false;
    
    const time_regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return time_regex.test(time_str);
}

/**
 * 느슨한 시간 형식 검사 (0:00 ~ 23:59 허용)
 * @param time_str 시간 문자열
 * @returns 유효 여부
 */
export function isValidTimeFormatLoose(time_str: string): boolean {
    if (!time_str || typeof time_str !== "string") return false;
    
    const time_regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return time_regex.test(time_str);
}

/**
 * 날짜 문자열이 유효한 YYYY-MM-DD 형식인지 검사
 * @param date_str 날짜 문자열
 * @returns 유효 여부
 */
export function isValidDateFormat(date_str: string): boolean {
    if (!date_str || typeof date_str !== "string") return false;
    
    const date_regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date_regex.test(date_str)) return false;
    
    // 실제 유효한 날짜인지 확인
    const date = new Date(date_str);
    return !isNaN(date.getTime());
}

/**
 * 시작 시간이 종료 시간보다 이전인지 검사
 * @param start_time 시작 시간 (HH:mm)
 * @param end_time 종료 시간 (HH:mm)
 * @returns start < end 여부
 */
export function isStartBeforeEnd(start_time: string, end_time: string): boolean {
    if (!isValidTimeFormat(start_time) || !isValidTimeFormat(end_time)) {
        return false;
    }
    
    const start_parts = start_time.split(":").map(Number);
    const end_parts = end_time.split(":").map(Number);
    
    const start_mins = (start_parts[0] || 0) * 60 + (start_parts[1] || 0);
    const end_mins = (end_parts[0] || 0) * 60 + (end_parts[1] || 0);
    
    return start_mins < end_mins;
}

/**
 * 두 시간 범위가 겹치는지 검사
 * @param range1 첫 번째 범위 [start, end]
 * @param range2 두 번째 범위 [start, end]
 * @returns 겹침 여부
 */
export function doTimeRangesOverlap(
    range1: { start: number; end: number },
    range2: { start: number; end: number }
): boolean {
    // 겹치지 않는 경우: range1이 range2 전에 끝나거나, range1이 range2 후에 시작
    return !(range1.end <= range2.start || range1.start >= range2.end);
}

/**
 * 날짜가 오늘인지 검사
 * @param date_str YYYY-MM-DD 형식
 * @returns 오늘 여부
 */
export function isToday(date_str: string): boolean {
    if (!isValidDateFormat(date_str)) return false;
    
    const today = new Date();
    const target = new Date(date_str);
    
    return (
        today.getFullYear() === target.getFullYear() &&
        today.getMonth() === target.getMonth() &&
        today.getDate() === target.getDate()
    );
}

/**
 * 날짜가 미래인지 검사
 * @param date_str YYYY-MM-DD 형식
 * @returns 미래 여부
 */
export function isFutureDate(date_str: string): boolean {
    if (!isValidDateFormat(date_str)) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(date_str);
    target.setHours(0, 0, 0, 0);
    
    return target > today;
}
