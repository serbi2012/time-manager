/**
 * 시간 기반 통계 계산 (일별, 주별, 월별, 시간대별, 요일별)
 */

import type { WorkRecord } from "../../../../shared/types";
import dayjs from "dayjs";
import type { DailyStat, HourlyStats, WeekdayStats } from "./types";

export function calculateDailyStats(
    records: WorkRecord[],
    days: number = 30
): DailyStat[] {
    const today = dayjs();
    const start_date = today.subtract(days - 1, "day");
    const stats_map = new Map<string, DailyStat>();

    for (let i = 0; i < days; i++) {
        const date = start_date.add(i, "day").format("YYYY-MM-DD");
        stats_map.set(date, {
            date,
            total_minutes: 0,
            record_count: 0,
            session_count: 0,
        });
    }

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                const session_date = session.date || record.date;
                const stat = stats_map.get(session_date);
                if (stat) {
                    stat.total_minutes += session.duration_minutes || 0;
                    stat.session_count += 1;
                }
            });

            const record_stat = stats_map.get(record.date);
            if (record_stat) {
                record_stat.record_count += 1;
            }
        });

    return Array.from(stats_map.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );
}

export function calculateWeeklyStats(
    records: WorkRecord[],
    weeks: number = 12
): DailyStat[] {
    const today = dayjs();
    const stats: DailyStat[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
        const week_start = today.subtract(i, "week").startOf("week");
        const week_end = week_start.endOf("week");
        const week_label = week_start.format("MM/DD");

        let total_minutes = 0;
        let record_count = 0;
        let session_count = 0;

        records
            .filter((r) => !r.is_deleted)
            .forEach((record) => {
                record.sessions.forEach((session) => {
                    const session_date = dayjs(session.date || record.date);
                    if (
                        session_date.isAfter(week_start.subtract(1, "day")) &&
                        session_date.isBefore(week_end.add(1, "day"))
                    ) {
                        total_minutes += session.duration_minutes || 0;
                        session_count += 1;
                    }
                });

                const record_date = dayjs(record.date);
                if (
                    record_date.isAfter(week_start.subtract(1, "day")) &&
                    record_date.isBefore(week_end.add(1, "day"))
                ) {
                    record_count += 1;
                }
            });

        stats.push({
            date: week_label,
            total_minutes,
            record_count,
            session_count,
        });
    }

    return stats;
}

export function calculateMonthlyStats(
    records: WorkRecord[],
    months: number = 12
): DailyStat[] {
    const today = dayjs();
    const stats: DailyStat[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const month_start = today.subtract(i, "month").startOf("month");
        const month_end = month_start.endOf("month");
        const month_label = month_start.format("YYYY-MM");

        let total_minutes = 0;
        let record_count = 0;
        let session_count = 0;

        records
            .filter((r) => !r.is_deleted)
            .forEach((record) => {
                record.sessions.forEach((session) => {
                    const session_date = dayjs(session.date || record.date);
                    if (
                        session_date.isAfter(month_start.subtract(1, "day")) &&
                        session_date.isBefore(month_end.add(1, "day"))
                    ) {
                        total_minutes += session.duration_minutes || 0;
                        session_count += 1;
                    }
                });

                const record_date = dayjs(record.date);
                if (
                    record_date.isAfter(month_start.subtract(1, "day")) &&
                    record_date.isBefore(month_end.add(1, "day"))
                ) {
                    record_count += 1;
                }
            });

        stats.push({
            date: month_label,
            total_minutes,
            record_count,
            session_count,
        });
    }

    return stats;
}

export function calculateHourlyStats(records: WorkRecord[]): HourlyStats[] {
    const hourly_map = new Map<
        number,
        { total_minutes: number; session_count: number }
    >();

    for (let i = 0; i < 24; i++) {
        hourly_map.set(i, { total_minutes: 0, session_count: 0 });
    }

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                if (session.start_time) {
                    const hour = parseInt(session.start_time.split(":")[0], 10);
                    const existing = hourly_map.get(hour)!;
                    existing.total_minutes += session.duration_minutes || 0;
                    existing.session_count += 1;
                }
            });
        });

    return Array.from(hourly_map.entries())
        .map(([hour, data]) => ({
            hour,
            total_minutes: data.total_minutes,
            session_count: data.session_count,
            label: `${hour.toString().padStart(2, "0")}:00`,
        }))
        .sort((a, b) => a.hour - b.hour);
}

export function calculateWeekdayStats(records: WorkRecord[]): WeekdayStats[] {
    const weekday_names = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday_map = new Map<
        number,
        {
            total_minutes: number;
            session_count: number;
            record_count: number;
        }
    >();

    for (let i = 0; i < 7; i++) {
        weekday_map.set(i, {
            total_minutes: 0,
            session_count: 0,
            record_count: 0,
        });
    }

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const record_weekday = dayjs(record.date).day();
            const record_data = weekday_map.get(record_weekday)!;
            record_data.record_count += 1;

            record.sessions.forEach((session) => {
                const session_date = session.date || record.date;
                const weekday = dayjs(session_date).day();
                const existing = weekday_map.get(weekday)!;
                existing.total_minutes += session.duration_minutes || 0;
                existing.session_count += 1;
            });
        });

    return Array.from(weekday_map.entries())
        .map(([weekday, data]) => ({
            weekday,
            weekday_name: weekday_names[weekday],
            total_minutes: data.total_minutes,
            session_count: data.session_count,
            record_count: data.record_count,
        }))
        .sort((a, b) => a.weekday - b.weekday);
}
