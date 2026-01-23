/**
 * 점심시간 관련 유틸리티 함수 모음
 * 
 * @example
 * import { calculateDurationExcludingLunch, isInLunchTime } from '@/shared/lib/lunch';
 */

export {
    // 상수
    LUNCH_START_MINUTES,
    LUNCH_END_MINUTES,
    LUNCH_DURATION_MINUTES,
    // 함수
    calculateDurationExcludingLunch,
    isInLunchTime,
    overlapsWithLunchTime,
    getLunchOverlapMinutes,
    adjustForLunchTime,
} from "./lunch_calculator";
