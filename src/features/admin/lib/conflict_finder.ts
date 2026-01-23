/**
 * 세션 충돌 감지 관련 순수 함수
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import { timeToMinutes } from "../../../shared/lib/time";

/**
 * 세션 메타 정보 포함 타입
 */
export interface SessionWithMeta extends WorkSession {
    record_id: string;
    work_name: string;
    deal_name: string;
    project_code: string;
    task_name: string;
    category_name: string;
}

/**
 * 충돌 정보
 */
export interface ConflictInfo {
    date: string;
    session1: SessionWithMeta;
    session2: SessionWithMeta;
    overlap_minutes: number;
}

/**
 * 모든 레코드에서 시간 충돌 찾기
 */
export function findConflicts(records: WorkRecord[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    const sessions_by_date = new Map<string, SessionWithMeta[]>();

    // 날짜별로 세션 그룹화
    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                if (!session.start_time || !session.end_time) return;

                const date = session.date || record.date;
                if (!sessions_by_date.has(date)) {
                    sessions_by_date.set(date, []);
                }
                sessions_by_date.get(date)!.push({
                    ...session,
                    record_id: record.id,
                    work_name: record.work_name,
                    deal_name: record.deal_name,
                    project_code: record.project_code,
                    task_name: record.task_name,
                    category_name: record.category_name,
                });
            });
        });

    // 각 날짜별로 충돌 검사
    sessions_by_date.forEach((sessions, date) => {
        for (let i = 0; i < sessions.length; i++) {
            for (let j = i + 1; j < sessions.length; j++) {
                const a = sessions[i];
                const b = sessions[j];

                const a_start = timeToMinutes(a.start_time);
                const a_end = timeToMinutes(a.end_time);
                const b_start = timeToMinutes(b.start_time);
                const b_end = timeToMinutes(b.end_time);

                // 충돌 확인
                if (!(a_end <= b_start || a_start >= b_end)) {
                    const overlap_start = Math.max(a_start, b_start);
                    const overlap_end = Math.min(a_end, b_end);
                    const overlap_minutes = overlap_end - overlap_start;

                    conflicts.push({
                        date,
                        session1: a,
                        session2: b,
                        overlap_minutes,
                    });
                }
            }
        }
    });

    return conflicts;
}

/**
 * 충돌 개수 계산
 */
export function countConflicts(records: WorkRecord[]): number {
    return findConflicts(records).length;
}
