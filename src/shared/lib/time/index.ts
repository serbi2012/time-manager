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

// 충돌 감지 함수
export {
    isTimeRangeOverlapping,
    getOverlapType,
    adjustTimeRangeToAvoidConflicts,
    type OverlapType,
    type AdjustedTimeRange,
} from "./overlap";

// 날짜 비교 함수
export {
    isSameDate,
    isDateBefore,
    isDateAfter,
    isDateInRange,
} from "./date_utils";
