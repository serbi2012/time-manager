/**
 * 시간 관련 유틸리티 함수 모음
 * 
 * @example
 * import { timeToMinutes, formatDuration, isValidTimeFormat } from '@/shared/lib/time';
 */

// 계산 함수
export {
    timeToMinutes,
    minutesToTime,
    calculateMinutesDifference,
    timestampToMinutes,
    minutesToTimestamp,
} from "./calculators";

// 포맷팅 함수
export {
    formatDuration,
    formatDurationAsTime,
    formatTimer,
    formatTimerWithSeconds,
    formatDateDisplay,
    formatDateShort,
} from "./formatters";

// 검증 함수
export {
    isValidTimeFormat,
    isValidTimeFormatLoose,
    isValidDateFormat,
    isStartBeforeEnd,
    doTimeRangesOverlap,
    isToday,
    isFutureDate,
} from "./validators";
