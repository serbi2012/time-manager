/**
 * 세션 관련 유틸리티 함수 모음
 * 
 * @example
 * import { getSessionMinutes, createSession, sortSessionsByTime } from '@/shared/lib/session';
 */

export {
    // 타입
    type SessionLike,
    // 함수
    getSessionMinutes,
    calculateTotalMinutes,
    createSession,
    sortSessionsByTime,
    filterSessionsByDate,
    getSessionTimeRange,
    isRunningSession,
    findSessionById,
} from "./session_utils";
