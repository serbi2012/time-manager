/**
 * 기간 비교 및 생산성 통계 계산
 */

import type { WorkRecord } from "../../../../shared/types";
import dayjs from "dayjs";
import type { PeriodComparison, ProductivityStats } from "./types";
import { calculateWeekdayStats, calculateHourlyStats } from "./time_based";

function calcChangePercent(curr: number, prev: number): number {
    return prev > 0
        ? Math.round(((curr - prev) / prev) * 100)
        : curr > 0
        ? 100
        : 0;
}

export function calculateWeekComparison(
    records: WorkRecord[]
): PeriodComparison {
    const today = dayjs();
    const this_week_start = today.startOf("week");
    const last_week_start = this_week_start.subtract(1, "week");
    const last_week_end = this_week_start.subtract(1, "day");

    const current = { minutes: 0, sessions: 0, records: 0 };
    const previous = { minutes: 0, sessions: 0, records: 0 };

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const record_date = dayjs(record.date);

            if (record_date.isAfter(this_week_start.subtract(1, "day"))) {
                current.records += 1;
            } else if (
                record_date.isAfter(last_week_start.subtract(1, "day")) &&
                record_date.isBefore(last_week_end.add(1, "day"))
            ) {
                previous.records += 1;
            }

            record.sessions.forEach((session) => {
                const session_date = dayjs(session.date || record.date);

                if (session_date.isAfter(this_week_start.subtract(1, "day"))) {
                    current.minutes += session.duration_minutes || 0;
                    current.sessions += 1;
                } else if (
                    session_date.isAfter(last_week_start.subtract(1, "day")) &&
                    session_date.isBefore(last_week_end.add(1, "day"))
                ) {
                    previous.minutes += session.duration_minutes || 0;
                    previous.sessions += 1;
                }
            });
        });

    return {
        current_minutes: current.minutes,
        previous_minutes: previous.minutes,
        change_percent: calcChangePercent(current.minutes, previous.minutes),
        current_sessions: current.sessions,
        previous_sessions: previous.sessions,
        sessions_change_percent: calcChangePercent(
            current.sessions,
            previous.sessions
        ),
        current_records: current.records,
        previous_records: previous.records,
        records_change_percent: calcChangePercent(
            current.records,
            previous.records
        ),
    };
}

export function calculateMonthComparison(
    records: WorkRecord[]
): PeriodComparison {
    const today = dayjs();
    const this_month_start = today.startOf("month");
    const last_month_start = this_month_start.subtract(1, "month");
    const last_month_end = this_month_start.subtract(1, "day");

    const current = { minutes: 0, sessions: 0, records: 0 };
    const previous = { minutes: 0, sessions: 0, records: 0 };

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const record_date = dayjs(record.date);

            if (record_date.isAfter(this_month_start.subtract(1, "day"))) {
                current.records += 1;
            } else if (
                record_date.isAfter(last_month_start.subtract(1, "day")) &&
                record_date.isBefore(last_month_end.add(1, "day"))
            ) {
                previous.records += 1;
            }

            record.sessions.forEach((session) => {
                const session_date = dayjs(session.date || record.date);

                if (session_date.isAfter(this_month_start.subtract(1, "day"))) {
                    current.minutes += session.duration_minutes || 0;
                    current.sessions += 1;
                } else if (
                    session_date.isAfter(last_month_start.subtract(1, "day")) &&
                    session_date.isBefore(last_month_end.add(1, "day"))
                ) {
                    previous.minutes += session.duration_minutes || 0;
                    previous.sessions += 1;
                }
            });
        });

    return {
        current_minutes: current.minutes,
        previous_minutes: previous.minutes,
        change_percent: calcChangePercent(current.minutes, previous.minutes),
        current_sessions: current.sessions,
        previous_sessions: previous.sessions,
        sessions_change_percent: calcChangePercent(
            current.sessions,
            previous.sessions
        ),
        current_records: current.records,
        previous_records: previous.records,
        records_change_percent: calcChangePercent(
            current.records,
            previous.records
        ),
    };
}

export function calculateProductivityStats(
    records: WorkRecord[]
): ProductivityStats {
    const active_records = records.filter((r) => !r.is_deleted);

    if (active_records.length === 0) {
        return {
            daily_avg_minutes: 0,
            weekly_avg_minutes: 0,
            monthly_avg_minutes: 0,
            daily_avg_sessions: 0,
            most_productive_day: "-",
            most_productive_hour: "-",
            streak_current: 0,
            streak_max: 0,
            active_days_count: 0,
            total_days_range: 0,
        };
    }

    const daily_data = new Map<string, { minutes: number; sessions: number }>();

    active_records.forEach((record) => {
        record.sessions.forEach((session) => {
            const date = session.date || record.date;
            const existing = daily_data.get(date) || {
                minutes: 0,
                sessions: 0,
            };
            existing.minutes += session.duration_minutes || 0;
            existing.sessions += 1;
            daily_data.set(date, existing);
        });
    });

    const dates = Array.from(daily_data.keys()).sort();
    const first_date = dates[0];
    const last_date = dates[dates.length - 1];
    const total_days_range =
        dayjs(last_date).diff(dayjs(first_date), "day") + 1;
    const active_days_count = daily_data.size;

    const total_minutes = Array.from(daily_data.values()).reduce(
        (sum, d) => sum + d.minutes,
        0
    );
    const total_sessions = Array.from(daily_data.values()).reduce(
        (sum, d) => sum + d.sessions,
        0
    );

    const daily_avg_minutes =
        active_days_count > 0
            ? Math.round(total_minutes / active_days_count)
            : 0;
    const weekly_avg_minutes = Math.round(daily_avg_minutes * 5);
    const monthly_avg_minutes = Math.round(daily_avg_minutes * 22);
    const daily_avg_sessions =
        active_days_count > 0
            ? Math.round((total_sessions / active_days_count) * 10) / 10
            : 0;

    const weekday_stats = calculateWeekdayStats(records);
    const most_productive_weekday = weekday_stats.reduce((max, curr) =>
        curr.total_minutes > max.total_minutes ? curr : max
    );

    const hourly_stats = calculateHourlyStats(records);
    const most_productive_hour = hourly_stats.reduce((max, curr) =>
        curr.total_minutes > max.total_minutes ? curr : max
    );

    const sorted_dates = dates.sort();
    let current_streak = 0;
    let max_streak = 0;
    let temp_streak = 1;

    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    if (daily_data.has(today) || daily_data.has(yesterday)) {
        const start_date = daily_data.has(today) ? today : yesterday;
        current_streak = 1;
        let check_date = dayjs(start_date);

        while (true) {
            check_date = check_date.subtract(1, "day");
            if (daily_data.has(check_date.format("YYYY-MM-DD"))) {
                current_streak++;
            } else {
                break;
            }
        }
    }

    for (let i = 1; i < sorted_dates.length; i++) {
        const prev = dayjs(sorted_dates[i - 1]);
        const curr = dayjs(sorted_dates[i]);
        if (curr.diff(prev, "day") === 1) {
            temp_streak++;
        } else {
            max_streak = Math.max(max_streak, temp_streak);
            temp_streak = 1;
        }
    }
    max_streak = Math.max(max_streak, temp_streak);

    return {
        daily_avg_minutes,
        weekly_avg_minutes,
        monthly_avg_minutes,
        daily_avg_sessions,
        most_productive_day: most_productive_weekday.weekday_name + "요일",
        most_productive_hour: most_productive_hour.label,
        streak_current: current_streak,
        streak_max: max_streak,
        active_days_count,
        total_days_range,
    };
}
