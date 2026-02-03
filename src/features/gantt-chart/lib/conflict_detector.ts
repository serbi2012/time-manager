/**
 * 간트 차트 충돌 감지 관련 순수 함수
 */

import { timeToMinutes } from "../../../shared/lib/time";
import type { GroupedWork } from "./slot_calculator";

/**
 * 충돌 범위 정보
 */
export interface ConflictRange {
    start: number;
    end: number;
    session_ids: string[];
}

/**
 * 충돌 감지 결과
 */
export interface ConflictInfo {
    conflicting_sessions: Set<string>; // 충돌이 있는 세션 ID 집합
    conflict_ranges: ConflictRange[]; // 충돌 구간 정보
}

/**
 * 세션 정보 (충돌 감지용)
 */
interface SessionInfo {
    id: string;
    start: number;
    end: number;
    record_id: string;
}

/**
 * 모든 세션 간의 충돌 감지
 */
export function detectConflicts(
    grouped_works: GroupedWork[],
    current_time_mins: number
): ConflictInfo {
    const conflicting_sessions = new Set<string>();
    const conflict_ranges: ConflictRange[] = [];

    // 모든 세션 목록 수집 (점심시간 제외)
    const all_sessions: SessionInfo[] = [];
    grouped_works.forEach((group) => {
        group.sessions.forEach((session) => {
            // 진행 중인 세션(end_time === "")은 현재 시간 사용
            const end_mins = session.end_time
                ? timeToMinutes(session.end_time)
                : current_time_mins;
            all_sessions.push({
                id: session.id,
                start: timeToMinutes(session.start_time),
                end: end_mins,
                record_id: group.record.id,
            });
        });
    });

    // 모든 세션 쌍 비교
    for (let i = 0; i < all_sessions.length; i++) {
        for (let j = i + 1; j < all_sessions.length; j++) {
            const a = all_sessions[i];
            const b = all_sessions[j];

            // 시간 겹침 확인
            const overlap_start = Math.max(a.start, b.start);
            const overlap_end = Math.min(a.end, b.end);

            if (overlap_start < overlap_end) {
                // 충돌 발생
                conflicting_sessions.add(a.id);
                conflicting_sessions.add(b.id);

                // 충돌 구간 저장
                conflict_ranges.push({
                    start: overlap_start,
                    end: overlap_end,
                    session_ids: [a.id, b.id],
                });
            }
        }
    }

    return {
        conflicting_sessions,
        conflict_ranges,
    };
}

/**
 * 특정 세션이 충돌 중인지 확인
 */
export function isSessionConflicting(
    session_id: string,
    conflict_info: ConflictInfo
): boolean {
    return conflict_info.conflicting_sessions.has(session_id);
}

/**
 * 두 시간 범위가 겹치는지 확인
 */
export function isTimeRangeOverlapping(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean {
    return start1 < end2 && end1 > start2;
}

/**
 * 겹치는 시간 범위 계산
 */
export function calculateOverlapRange(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): { start: number; end: number } | null {
    const overlap_start = Math.max(start1, start2);
    const overlap_end = Math.min(end1, end2);

    if (overlap_start >= overlap_end) {
        return null;
    }

    return { start: overlap_start, end: overlap_end };
}
