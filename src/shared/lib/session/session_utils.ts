/**
 * 세션 관련 유틸리티 함수들
 *
 * WorkSession 타입과 함께 사용되는 순수 함수들
 */

import { timeToMinutes, getEffectiveEndMinutes } from "../time";
import { calculateDurationExcludingLunch, type LunchTimeRange } from "../lunch";

/**
 * 세션 인터페이스 (shared/types에서 import하기 전 임시 정의)
 * 나중에 shared/types/domain.ts로 이동
 */
export interface SessionLike {
    id: string;
    date?: string;
    start_time: string;
    end_time: string;
    duration_minutes?: number;
    is_overnight?: boolean;
}

/**
 * 레거시 세션 타입 (duration_seconds 필드 호환)
 */
interface LegacySession extends SessionLike {
    duration_seconds?: number;
}

/**
 * 세션의 소요 시간(분)을 가져오기
 * 레거시 데이터(duration_seconds)와 호환
 *
 * @param session 세션 객체
 * @param lunch_time 사용자 점심시간 설정 (미전달 시 기본값 사용)
 * @returns 소요 시간 (분)
 */
export function getSessionMinutes(
    session: SessionLike,
    lunch_time?: LunchTimeRange
): number {
    if (
        session.duration_minutes !== undefined &&
        !isNaN(session.duration_minutes)
    ) {
        return session.duration_minutes;
    }

    const legacy = session as LegacySession;
    if (
        legacy.duration_seconds !== undefined &&
        !isNaN(legacy.duration_seconds)
    ) {
        return Math.ceil(legacy.duration_seconds / 60);
    }

    if (session.start_time && session.end_time) {
        const start_mins = timeToMinutes(session.start_time);
        const end_mins = getEffectiveEndMinutes(
            session.end_time,
            session.is_overnight
        );
        if (end_mins > start_mins) {
            return calculateDurationExcludingLunch(
                start_mins,
                end_mins,
                lunch_time
            );
        }
    }

    return 0;
}

/**
 * 세션 목록의 총 시간(분) 계산
 *
 * @param sessions 세션 배열
 * @param lunch_time 사용자 점심시간 설정 (미전달 시 기본값 사용)
 * @returns 총 소요 시간 (분, 최소 1분)
 */
export function calculateTotalMinutes(
    sessions: SessionLike[],
    lunch_time?: LunchTimeRange
): number {
    if (!sessions || sessions.length === 0) return 0;

    const total = sessions.reduce(
        (sum, session) => sum + getSessionMinutes(session, lunch_time),
        0
    );

    return Math.max(1, total);
}

/**
 * 세션 목록을 시간순으로 정렬
 *
 * @param sessions 세션 배열
 * @param record_date 레코드 기본 날짜 (세션에 date가 없을 때 사용)
 * @returns 정렬된 세션 배열 (원본 변경 없음)
 */
export function sortSessionsByTime(
    sessions: SessionLike[],
    record_date?: string
): SessionLike[] {
    return [...sessions].sort((a, b) => {
        const date_a = a.date || record_date || "";
        const date_b = b.date || record_date || "";

        // 날짜가 다르면 날짜 기준 정렬
        if (date_a !== date_b) {
            return date_a.localeCompare(date_b);
        }

        // 같은 날짜면 시작 시간 기준 정렬
        return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
    });
}

/**
 * 특정 날짜의 세션들만 필터링
 *
 * @param sessions 세션 배열
 * @param target_date 필터링할 날짜 (YYYY-MM-DD)
 * @param record_date 레코드 기본 날짜 (세션에 date가 없을 때 사용)
 * @returns 필터링된 세션 배열
 */
export function filterSessionsByDate(
    sessions: SessionLike[],
    target_date: string,
    record_date?: string
): SessionLike[] {
    return sessions.filter(
        (session) => (session.date || record_date) === target_date
    );
}
