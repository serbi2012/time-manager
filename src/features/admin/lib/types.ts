/**
 * 관리자 기능 관련 타입 정의
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";

/**
 * 관리자 탭 타입
 */
export type AdminTab = "sessions" | "records";

/**
 * 뷰 모드 타입
 */
export type ViewMode = "problems" | "conflicts" | "all";

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
 * 통계 개요 Props
 */
export interface StatsOverviewProps {
    total_records: number;
    total_sessions: number;
    problem_count: number;
    conflict_count: number;
    duplicate_count: number;
}

/**
 * 문제 목록 Props
 */
export interface ProblemsListProps {
    sessions: SessionWithMeta[];
    problems: Map<string, { type: string; description: string }[]>;
    on_fix: (session: SessionWithMeta) => void;
    on_delete: (session: SessionWithMeta) => void;
}

/**
 * 충돌 뷰 Props
 */
export interface ConflictsViewProps {
    conflicts: Array<{
        date: string;
        session1: SessionWithMeta;
        session2: SessionWithMeta;
        overlap_minutes: number;
    }>;
    on_resolve: (conflict: ConflictsViewProps["conflicts"][0]) => void;
}

/**
 * 중복 레코드 뷰 Props
 */
export interface DuplicatesViewProps {
    duplicates: Array<{
        key: string;
        work_name: string;
        deal_name: string;
        records: WorkRecord[];
    }>;
    on_merge: (records: WorkRecord[]) => void;
}
