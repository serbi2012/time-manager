/**
 * 기본 통계 계산 함수 (요약, 세션, 카테고리, 작업명)
 */

import type { WorkRecord } from "../../../../shared/types";
import type {
    StatsSummary,
    SessionStats,
    CategoryStat,
    WorkNameStat,
} from "./types";

export function calculateStatsSummary(records: WorkRecord[]): StatsSummary {
    const active_records = records.filter((r) => !r.is_deleted);
    const deleted_records = records.filter((r) => r.is_deleted);
    const completed_records = active_records.filter((r) => r.is_completed);

    let total_sessions = 0;
    let total_minutes = 0;

    active_records.forEach((record) => {
        total_sessions += record.sessions.length;
        total_minutes += record.duration_minutes || 0;
    });

    return {
        total_records: active_records.length,
        total_sessions,
        total_minutes,
        completed_records: completed_records.length,
        deleted_records: deleted_records.length,
        avg_session_duration:
            total_sessions > 0 ? Math.round(total_minutes / total_sessions) : 0,
        avg_sessions_per_record:
            active_records.length > 0
                ? Math.round((total_sessions / active_records.length) * 10) / 10
                : 0,
    };
}

export function calculateSessionStats(records: WorkRecord[]): SessionStats {
    const all_sessions = records
        .filter((r) => !r.is_deleted)
        .flatMap((record) =>
            record.sessions.filter((s) => s.duration_minutes > 0)
        );

    if (all_sessions.length === 0) {
        return {
            total_count: 0,
            total_minutes: 0,
            average_minutes: 0,
            longest_minutes: 0,
            longest_session: null,
            shortest_minutes: 0,
            shortest_session: null,
        };
    }

    const total_minutes = all_sessions.reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
    );
    const sorted_by_duration = [...all_sessions].sort(
        (a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0)
    );

    return {
        total_count: all_sessions.length,
        total_minutes,
        average_minutes: Math.round(total_minutes / all_sessions.length),
        longest_minutes: sorted_by_duration[0]?.duration_minutes || 0,
        longest_session: sorted_by_duration[0] || null,
        shortest_minutes:
            sorted_by_duration[sorted_by_duration.length - 1]
                ?.duration_minutes || 0,
        shortest_session:
            sorted_by_duration[sorted_by_duration.length - 1] || null,
    };
}

export function calculateCategoryStats(records: WorkRecord[]): CategoryStat[] {
    const category_map = new Map<
        string,
        { total_minutes: number; record_count: number }
    >();

    let grand_total = 0;

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const category = record.category_name || "미분류";
            const existing = category_map.get(category) || {
                total_minutes: 0,
                record_count: 0,
            };

            existing.total_minutes += record.duration_minutes || 0;
            existing.record_count += 1;
            grand_total += record.duration_minutes || 0;

            category_map.set(category, existing);
        });

    return Array.from(category_map.entries())
        .map(([category, data]) => ({
            category,
            total_minutes: data.total_minutes,
            record_count: data.record_count,
            percentage:
                grand_total > 0
                    ? Math.round((data.total_minutes / grand_total) * 100)
                    : 0,
        }))
        .sort((a, b) => b.total_minutes - a.total_minutes);
}

export function calculateWorkNameStats(
    records: WorkRecord[],
    top_n: number = 10
): WorkNameStat[] {
    const work_map = new Map<
        string,
        {
            total_minutes: number;
            record_count: number;
            session_count: number;
        }
    >();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const work_name = record.work_name || "미지정";
            const existing = work_map.get(work_name) || {
                total_minutes: 0,
                record_count: 0,
                session_count: 0,
            };

            existing.total_minutes += record.duration_minutes || 0;
            existing.record_count += 1;
            existing.session_count += record.sessions.length;

            work_map.set(work_name, existing);
        });

    return Array.from(work_map.entries())
        .map(([work_name, data]) => ({
            work_name,
            total_minutes: data.total_minutes,
            record_count: data.record_count,
            session_count: data.session_count,
        }))
        .sort((a, b) => b.total_minutes - a.total_minutes)
        .slice(0, top_n);
}
