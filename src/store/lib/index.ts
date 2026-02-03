/**
 * 스토어 라이브러리 모듈
 *
 * 스토어에서 사용하는 순수 함수들을 모아놓은 모듈입니다.
 * 대부분의 함수는 shared/lib에서 재사용하며, 스토어 전용 함수만 여기에 정의합니다.
 */

// 레코드 병합 관련 함수
export {
    findExistingRecord,
    findDuplicateIncompleteRecords,
    mergeRecords,
    removeSessionFromRecord,
} from "./record_merger";

// 세션 관련 함수 (shared/lib/session 재사용)
export {
    createSession,
    getSessionMinutes,
    calculateTotalMinutes,
    sortSessionsByTime,
    filterSessionsByDate,
    getSessionTimeRange,
    isRunningSession,
    findSessionById,
} from "@/shared/lib/session";

// 점심시간 관련 함수 (shared/lib/lunch 재사용)
export {
    calculateDurationExcludingLunch,
    isInLunchTime,
    overlapsWithLunchTime,
    getLunchOverlapMinutes,
    adjustForLunchTime,
    LUNCH_START_MINUTES,
    LUNCH_END_MINUTES,
    LUNCH_DURATION_MINUTES,
} from "@/shared/lib/lunch";

// 시간 관련 함수 (shared/lib/time 재사용)
export { timeToMinutes, minutesToTime } from "@/shared/lib/time";

// 타이머 헬퍼 함수
export {
    createWorkSession,
    findExistingRecordWithMerge,
    finishCurrentSession,
    handleLegacyStopTimer,
    type SetState,
} from "./timer_helpers";
