/**
 * 통계 관련 타입 정의
 */

import type { WorkSession } from "../../../../shared/types";

export interface DailyStat {
    date: string;
    total_minutes: number;
    record_count: number;
    session_count: number;
}

export interface CategoryStat {
    category: string;
    total_minutes: number;
    record_count: number;
    percentage: number;
}

export interface WorkNameStat {
    work_name: string;
    total_minutes: number;
    record_count: number;
    session_count: number;
}

export interface SessionStats {
    total_count: number;
    total_minutes: number;
    average_minutes: number;
    longest_minutes: number;
    longest_session: WorkSession | null;
    shortest_minutes: number;
    shortest_session: WorkSession | null;
}

export interface StatsSummary {
    total_records: number;
    total_sessions: number;
    total_minutes: number;
    completed_records: number;
    deleted_records: number;
    avg_session_duration: number;
    avg_sessions_per_record: number;
}

export interface HourlyStats {
    hour: number;
    total_minutes: number;
    session_count: number;
    label: string;
}

export interface WeekdayStats {
    weekday: number;
    weekday_name: string;
    total_minutes: number;
    session_count: number;
    record_count: number;
}

export interface DealStats {
    deal_name: string;
    project_code: string;
    total_minutes: number;
    record_count: number;
    session_count: number;
    completed_count: number;
    completion_rate: number;
}

export interface ProductivityStats {
    daily_avg_minutes: number;
    weekly_avg_minutes: number;
    monthly_avg_minutes: number;
    daily_avg_sessions: number;
    most_productive_day: string;
    most_productive_hour: string;
    streak_current: number;
    streak_max: number;
    active_days_count: number;
    total_days_range: number;
}

export interface PeriodComparison {
    current_minutes: number;
    previous_minutes: number;
    change_percent: number;
    current_sessions: number;
    previous_sessions: number;
    sessions_change_percent: number;
    current_records: number;
    previous_records: number;
    records_change_percent: number;
}

export interface CompletionStats {
    total_records: number;
    completed_records: number;
    completion_rate: number;
    avg_completion_time_minutes: number;
    by_category: Array<{
        category: string;
        total: number;
        completed: number;
        rate: number;
    }>;
}

export interface SessionTimeDistribution {
    under_15min: number;
    min_15_to_30: number;
    min_30_to_60: number;
    hour_1_to_2: number;
    over_2hours: number;
}

export interface TodayStats {
    total_minutes: number;
    session_count: number;
    record_count: number;
    completed_count: number;
    first_session_time: string | null;
    last_session_time: string | null;
}

export type TimeDisplayFormat = "minutes" | "hours";
