/**
 * 문제 세션 감지 관련 순수 함수
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import { timeToMinutes } from "../../../shared/lib/time";

/**
 * 문제 유형
 */
export type ProblemType =
    | "zero_duration"
    | "missing_time"
    | "invalid_time"
    | "future_time";

/**
 * 문제 정보
 */
export interface ProblemInfo {
    type: ProblemType;
    description: string;
}

/**
 * 세션의 문제를 감지
 */
export function detectSessionProblems(
    session: WorkSession,
    record_date: string
): ProblemInfo[] {
    const problems: ProblemInfo[] = [];
    const session_date = session.date || record_date;

    // 1. 시간 정보 누락
    if (!session.start_time || !session.end_time) {
        problems.push({
            type: "missing_time",
            description: "시간 정보 누락",
        });
        return problems; // 시간이 없으면 다른 검사 불가
    }

    // 2. 시간 형식 유효성 검사
    const time_regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
        !time_regex.test(session.start_time) ||
        !time_regex.test(session.end_time)
    ) {
        problems.push({
            type: "invalid_time",
            description: "잘못된 시간 형식",
        });
    }

    // 3. 0분 세션 감지 (시작 = 종료)
    const start_mins = timeToMinutes(session.start_time);
    const end_mins = timeToMinutes(session.end_time);
    if (start_mins === end_mins) {
        problems.push({
            type: "zero_duration",
            description: `0분 세션 (${session.start_time})`,
        });
    }

    // 4. 미래 날짜 세션 감지
    const today = new Date();
    const today_str = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (session_date > today_str) {
        problems.push({
            type: "future_time",
            description: `미래 날짜 세션 (${session_date})`,
        });
    }

    return problems;
}

/**
 * 모든 레코드에서 문제 세션 찾기
 */
export function findProblemSessions(
    records: WorkRecord[]
): Map<string, ProblemInfo[]> {
    const problem_map = new Map<string, ProblemInfo[]>();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                const problems = detectSessionProblems(session, record.date);
                if (problems.length > 0) {
                    problem_map.set(session.id, problems);
                }
            });
        });

    return problem_map;
}

/**
 * 문제 세션 개수 계산
 */
export function countProblemSessions(records: WorkRecord[]): number {
    return findProblemSessions(records).size;
}
