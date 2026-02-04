/**
 * 관리자 데이터 관리 훅
 */

import { useMemo } from "react";
import dayjs from "dayjs";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    findProblemSessions,
    countProblemSessions,
} from "../lib/problem_detector";
import { findConflicts, countConflicts } from "../lib/conflict_finder";
import {
    findDuplicateRecords,
    type DuplicateGroup,
} from "../lib/duplicate_finder";
import type { WorkRecord, WorkSession } from "../../../shared/types";

/**
 * 메타 정보가 포함된 세션
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
 * 날짜 범위
 */
export interface DateRange {
    start: dayjs.Dayjs | null;
    end: dayjs.Dayjs | null;
}

export interface UseAdminDataReturn {
    /** 전체 레코드 목록 */
    records: WorkRecord[];
    /** 문제 세션 맵 */
    problem_sessions: ReturnType<typeof findProblemSessions>;
    /** 문제 세션 수 */
    problem_count: number;
    /** 충돌 목록 */
    conflicts: ReturnType<typeof findConflicts>;
    /** 충돌 수 */
    conflict_count: number;
    /** 모든 세션 목록 (메타 정보 포함) */
    all_sessions: SessionWithMeta[];
    /** 날짜별 세션 */
    getSessionsByDateRange: (range: DateRange) => SessionWithMeta[];
    /** 진행 중인 세션 */
    running_sessions: SessionWithMeta[];
    /** 통계 요약 */
    stats_summary: {
        total_records: number;
        total_sessions: number;
        total_minutes: number;
        deleted_records: number;
        completed_records: number;
        incomplete_records: number;
    };
    /** 중복 의심 레코드 그룹 */
    duplicate_groups: DuplicateGroup[];
    /** 삭제 제외 전체 레코드 (정렬됨) */
    all_records: WorkRecord[];
    /** 종료 시간 없는 세션 (진행 중) */
    open_end_sessions: SessionWithMeta[];
}

/**
 * 관리자 데이터 관리 훅
 */
export function useAdminData(): UseAdminDataReturn {
    const records = useWorkStore((state) => state.records);
    const timer = useWorkStore((state) => state.timer);

    // 문제 세션 감지
    const problem_sessions = useMemo(() => {
        return findProblemSessions(records);
    }, [records]);

    const problem_count = useMemo(() => {
        return countProblemSessions(records);
    }, [records]);

    // 충돌 감지
    const conflicts = useMemo(() => {
        return findConflicts(records);
    }, [records]);

    const conflict_count = useMemo(() => {
        return countConflicts(records);
    }, [records]);

    // 모든 세션 목록 (메타 정보 포함)
    const all_sessions = useMemo((): SessionWithMeta[] => {
        const sessions: SessionWithMeta[] = [];

        records
            .filter((r) => !r.is_deleted)
            .forEach((record) => {
                record.sessions.forEach((session) => {
                    sessions.push({
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

        return sessions.sort((a, b) => {
            const date_compare = (b.date || "").localeCompare(a.date || "");
            if (date_compare !== 0) return date_compare;
            return (b.start_time || "").localeCompare(a.start_time || "");
        });
    }, [records]);

    // 날짜 범위로 세션 필터링
    const getSessionsByDateRange = (range: DateRange): SessionWithMeta[] => {
        if (!range.start || !range.end) {
            return all_sessions;
        }

        return all_sessions.filter((session) => {
            const session_date = dayjs(session.date);
            return (
                !session_date.isBefore(range.start, "day") &&
                !session_date.isAfter(range.end, "day")
            );
        });
    };

    // 진행 중인 세션
    const running_sessions = useMemo((): SessionWithMeta[] => {
        if (!timer.is_running || !timer.active_session_id) {
            return [];
        }

        return all_sessions.filter((s) => s.id === timer.active_session_id);
    }, [all_sessions, timer.is_running, timer.active_session_id]);

    // 통계 요약
    const stats_summary = useMemo(() => {
        const active_records = records.filter((r) => !r.is_deleted);
        const deleted_records = records.filter((r) => r.is_deleted);
        const completed_records = active_records.filter((r) => r.is_completed);
        const incomplete_records = active_records.filter(
            (r) => !r.is_completed
        );

        const total_sessions = active_records.reduce(
            (sum, r) => sum + (r.sessions?.length || 0),
            0
        );

        const total_minutes = active_records.reduce(
            (sum, r) => sum + (r.duration_minutes || 0),
            0
        );

        return {
            total_records: active_records.length,
            total_sessions,
            total_minutes,
            deleted_records: deleted_records.length,
            completed_records: completed_records.length,
            incomplete_records: incomplete_records.length,
        };
    }, [records]);

    const duplicate_groups = useMemo(() => {
        return findDuplicateRecords(records);
    }, [records]);

    const all_records = useMemo(() => {
        return records
            .filter((r) => !r.is_deleted)
            .sort((a, b) => {
                const date_cmp = b.date.localeCompare(a.date);
                if (date_cmp !== 0) return date_cmp;
                return (b.start_time || "").localeCompare(a.start_time || "");
            });
    }, [records]);

    const open_end_sessions = useMemo(() => {
        return all_sessions.filter((s) => s.end_time === "");
    }, [all_sessions]);

    return {
        records,
        problem_sessions,
        problem_count,
        conflicts,
        conflict_count,
        all_sessions,
        getSessionsByDateRange,
        running_sessions,
        stats_summary,
        duplicate_groups,
        all_records,
        open_end_sessions,
    };
}
