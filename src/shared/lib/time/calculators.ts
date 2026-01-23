/**
 * 시간 계산 관련 순수 함수들
 */

/**
 * 시간 문자열을 분 단위로 변환
 * @param time_str 시간 문자열 (HH:mm 형식)
 * @returns 분 단위 숫자 (예: "09:30" -> 570)
 */
export function timeToMinutes(time_str: string): number {
    if (!time_str || typeof time_str !== "string") return 0;
    const parts = time_str.split(":").map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
}

/**
 * 분을 시간 문자열로 변환
 * @param mins 분 단위 숫자
 * @returns HH:mm 형식 문자열
 */
export function minutesToTime(mins: number): string {
    if (typeof mins !== "number" || isNaN(mins)) return "00:00";
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.floor(Math.abs(mins) % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * 두 시간 사이의 분 차이 계산
 * @param start_time 시작 시간 (HH:mm)
 * @param end_time 종료 시간 (HH:mm)
 * @returns 분 단위 차이
 */
export function calculateMinutesDifference(
    start_time: string,
    end_time: string
): number {
    const start_mins = timeToMinutes(start_time);
    const end_mins = timeToMinutes(end_time);
    return end_mins - start_mins;
}

/**
 * 타임스탬프에서 분 단위 시간 추출
 * @param timestamp Unix timestamp (milliseconds)
 * @returns 분 단위 (예: 09:30 -> 570)
 */
export function timestampToMinutes(timestamp: number): number {
    const date = new Date(timestamp);
    return date.getHours() * 60 + date.getMinutes();
}

/**
 * 오늘 날짜의 특정 시각을 timestamp로 변환
 * @param minutes 분 단위 시간
 * @param base_date 기준 날짜 (선택, 기본값: 오늘)
 * @returns Unix timestamp (milliseconds)
 */
export function minutesToTimestamp(
    minutes: number,
    base_date?: Date
): number {
    const date = base_date ? new Date(base_date) : new Date();
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return date.getTime();
}
