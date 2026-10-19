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
