/**
 * 시간 포맷팅 관련 순수 함수들
 */

/**
 * 분을 읽기 쉬운 형식으로 변환
 * @param minutes 분 단위
 * @returns 예: "1시간 30분", "45분"
 */
export function formatDuration(minutes: number): string {
    if (typeof minutes !== "number" || isNaN(minutes) || minutes < 0) {
        return "0분";
    }
    
    if (minutes < 60) {
        return `${minutes}분`;
    }
    
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
        return `${hrs}시간`;
    }
    
    return `${hrs}시간 ${mins}분`;
}

/**
 * 분을 HH:mm 형식의 문자열로 변환
 * @param minutes 분 단위
 * @returns 예: "01:30"
 */
export function formatDurationAsTime(minutes: number): string {
    if (typeof minutes !== "number" || isNaN(minutes) || minutes < 0) {
        return "00:00";
    }
    
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * 초를 타이머 표시 형식으로 변환 (HH:MM)
 * @param seconds 초 단위
 * @returns 예: "01:30"
 */
export function formatTimer(seconds: number): string {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    
    const total_mins = Math.floor(seconds / 60);
    const hrs = Math.floor(total_mins / 60);
    const mins = total_mins % 60;
    
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * 초를 HH:MM:SS 형식으로 변환
 * @param seconds 초 단위
 * @returns 예: "01:30:45"
 */
export function formatTimerWithSeconds(seconds: number): string {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
        return "00:00:00";
    }
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
