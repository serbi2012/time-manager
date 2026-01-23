/**
 * 세션 관련 유틸리티 함수들
 * 
 * WorkSession 타입과 함께 사용되는 순수 함수들
 */

import { timeToMinutes } from "../time";
import { calculateDurationExcludingLunch } from "../lunch";

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
 * @returns 소요 시간 (분)
 */
export function getSessionMinutes(session: SessionLike): number {
    // 새 형식: duration_minutes
    if (
        session.duration_minutes !== undefined &&
        !isNaN(session.duration_minutes)
    ) {
        return session.duration_minutes;
    }
    
    // 레거시 형식: duration_seconds
    const legacy = session as LegacySession;
    if (
        legacy.duration_seconds !== undefined &&
        !isNaN(legacy.duration_seconds)
    ) {
        return Math.ceil(legacy.duration_seconds / 60);
    }
    
    // duration 필드가 없으면 시작/종료 시간으로 계산
    if (session.start_time && session.end_time) {
        const start_mins = timeToMinutes(session.start_time);
        const end_mins = timeToMinutes(session.end_time);
        if (end_mins > start_mins) {
            return calculateDurationExcludingLunch(start_mins, end_mins);
        }
    }
    
    return 0;
}

/**
 * 세션 목록의 총 시간(분) 계산
 * 
 * @param sessions 세션 배열
 * @returns 총 소요 시간 (분, 최소 1분)
 */
export function calculateTotalMinutes(sessions: SessionLike[]): number {
    if (!sessions || sessions.length === 0) return 0;
    
    const total = sessions.reduce(
        (sum, session) => sum + getSessionMinutes(session),
        0
    );
    
    return Math.max(1, total);
}

/**
 * 새 세션 생성
 * 
 * @param start_time 시작 시간 (Unix timestamp, milliseconds)
 * @param end_time 종료 시간 (Unix timestamp, milliseconds)
 * @returns 새 세션 객체
 */
export function createSession(
    start_time: number,
    end_time: number
): SessionLike {
    const start_date = new Date(start_time);
    const end_date = new Date(end_time);
    
    const start_mins = start_date.getHours() * 60 + start_date.getMinutes();
    const end_mins = end_date.getHours() * 60 + end_date.getMinutes();
    
    const duration_minutes = Math.max(
        1,
        calculateDurationExcludingLunch(start_mins, end_mins)
    );
    
    const pad = (n: number) => n.toString().padStart(2, "0");
    
    return {
        id: crypto.randomUUID(),
        date: `${start_date.getFullYear()}-${pad(start_date.getMonth() + 1)}-${pad(start_date.getDate())}`,
        start_time: `${pad(start_date.getHours())}:${pad(start_date.getMinutes())}`,
        end_time: `${pad(end_date.getHours())}:${pad(end_date.getMinutes())}`,
        duration_minutes,
    };
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

/**
 * 세션 목록에서 첫 번째와 마지막 시간 정보 추출
 * 
 * @param sessions 세션 배열
 * @returns { first_start, last_end } 또는 빈 문자열
 */
export function getSessionTimeRange(sessions: SessionLike[]): {
    first_start: string;
    last_end: string;
} {
    if (!sessions || sessions.length === 0) {
        return { first_start: "", last_end: "" };
    }
    
    const sorted = sortSessionsByTime(sessions);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    return {
        first_start: first?.start_time || "",
        last_end: last?.end_time || "",
    };
}

/**
 * 진행 중인 세션인지 확인 (end_time이 비어있음)
 * 
 * @param session 세션 객체
 * @returns 진행 중 여부
 */
export function isRunningSession(session: SessionLike): boolean {
    return session.end_time === "";
}

/**
 * 세션 ID로 세션 찾기
 * 
 * @param sessions 세션 배열
 * @param session_id 찾을 세션 ID
 * @returns 세션 객체 또는 undefined
 */
export function findSessionById(
    sessions: SessionLike[],
    session_id: string
): SessionLike | undefined {
    return sessions.find((s) => s.id === session_id);
}
