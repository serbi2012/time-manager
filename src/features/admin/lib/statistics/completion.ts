/**
 * 완료율, 세션 분포, 오늘 통계, 딜 통계 계산
 */

import type { WorkRecord } from "../../../../shared/types";
import dayjs from "dayjs";
import type {
    CompletionStats,
    SessionTimeDistribution,
    TodayStats,
    DealStats,
} from "./types";

export function calculateCompletionStats(
    records: WorkRecord[]
): CompletionStats {
    const active_records = records.filter((r) => !r.is_deleted);
    const completed_records = active_records.filter((r) => r.is_completed);

    const avg_completion_time =
        completed_records.length > 0
            ? Math.round(
                  completed_records.reduce(
                      (sum, r) => sum + (r.duration_minutes || 0),
                      0
                  ) / completed_records.length
              )
            : 0;

    const category_map = new Map<
        string,
        { total: number; completed: number }
    >();

    active_records.forEach((record) => {
        const category = record.category_name || "미분류";
        const existing = category_map.get(category) || {
            total: 0,
            completed: 0,
        };
        existing.total += 1;
        if (record.is_completed) {
            existing.completed += 1;
        }
        category_map.set(category, existing);
    });

    const by_category = Array.from(category_map.entries())
        .map(([category, data]) => ({
            category,
            total: data.total,
            completed: data.completed,
            rate:
                data.total > 0
                    ? Math.round((data.completed / data.total) * 100)
                    : 0,
        }))
        .sort((a, b) => b.total - a.total);

    return {
        total_records: active_records.length,
        completed_records: completed_records.length,
        completion_rate:
            active_records.length > 0
                ? Math.round(
                      (completed_records.length / active_records.length) * 100
                  )
                : 0,
        avg_completion_time_minutes: avg_completion_time,
        by_category,
    };
}

export function calculateSessionDistribution(
    records: WorkRecord[]
): SessionTimeDistribution {
    const distribution: SessionTimeDistribution = {
        under_15min: 0,
        min_15_to_30: 0,
        min_30_to_60: 0,
        hour_1_to_2: 0,
        over_2hours: 0,
    };

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                const mins = session.duration_minutes || 0;
                if (mins < 15) {
                    distribution.under_15min += 1;
                } else if (mins < 30) {
                    distribution.min_15_to_30 += 1;
                } else if (mins < 60) {
                    distribution.min_30_to_60 += 1;
                } else if (mins < 120) {
                    distribution.hour_1_to_2 += 1;
                } else {
                    distribution.over_2hours += 1;
                }
            });
        });

    return distribution;
}

export function calculateTodayStats(records: WorkRecord[]): TodayStats {
    const today = dayjs().format("YYYY-MM-DD");
    let total_minutes = 0;
    let session_count = 0;
    let record_count = 0;
    let completed_count = 0;
    let first_time: string | null = null;
    let last_time: string | null = null;

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            if (record.date === today) {
                record_count += 1;
                if (record.is_completed) {
                    completed_count += 1;
                }
            }

            record.sessions.forEach((session) => {
                const session_date = session.date || record.date;
                if (session_date === today) {
                    total_minutes += session.duration_minutes || 0;
                    session_count += 1;

                    if (session.start_time) {
                        if (!first_time || session.start_time < first_time) {
                            first_time = session.start_time;
                        }
                        if (!last_time || session.start_time > last_time) {
                            last_time = session.end_time || session.start_time;
                        }
                    }
                }
            });
        });

    return {
        total_minutes,
        session_count,
        record_count,
        completed_count,
        first_session_time: first_time,
        last_session_time: last_time,
    };
}

export function calculateDealStats(
    records: WorkRecord[],
    top_n: number = 15
): DealStats[] {
    const deal_map = new Map<
        string,
        {
            project_code: string;
            total_minutes: number;
            record_count: number;
            session_count: number;
            completed_count: number;
        }
    >();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const deal_name = record.deal_name || "미지정";
            const existing = deal_map.get(deal_name) || {
                project_code: record.project_code || "",
                total_minutes: 0,
                record_count: 0,
                session_count: 0,
                completed_count: 0,
            };

            existing.total_minutes += record.duration_minutes || 0;
            existing.record_count += 1;
            existing.session_count += record.sessions.length;
            if (record.is_completed) {
                existing.completed_count += 1;
            }

            deal_map.set(deal_name, existing);
        });

    return Array.from(deal_map.entries())
        .map(([deal_name, data]) => ({
            deal_name,
            project_code: data.project_code,
            total_minutes: data.total_minutes,
            record_count: data.record_count,
            session_count: data.session_count,
            completed_count: data.completed_count,
            completion_rate:
                data.record_count > 0
                    ? Math.round(
                          (data.completed_count / data.record_count) * 100
                      )
                    : 0,
        }))
        .sort((a, b) => b.total_minutes - a.total_minutes)
        .slice(0, top_n);
}
