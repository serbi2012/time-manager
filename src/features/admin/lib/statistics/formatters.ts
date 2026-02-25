/**
 * 시간 포맷팅 함수
 */

import type { TimeDisplayFormat } from "./types";

export function formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
        return `${mins}분`;
    }
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

export function formatDuration(
    minutes: number,
    format: TimeDisplayFormat = "hours"
): string {
    if (format === "minutes") {
        return `${minutes}분`;
    }
    return formatMinutesToHours(minutes);
}
