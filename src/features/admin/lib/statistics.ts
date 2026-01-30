/**
 * 통계 계산 순수 함수
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import dayjs from "dayjs";

/**
 * 일별 통계 데이터
 */
export interface DailyStat {
  date: string;
  total_minutes: number;
  record_count: number;
  session_count: number;
}

/**
 * 카테고리별 통계 데이터
 */
export interface CategoryStat {
  category: string;
  total_minutes: number;
  record_count: number;
  percentage: number;
}

/**
 * 작업명별 통계 데이터
 */
export interface WorkNameStat {
  work_name: string;
  total_minutes: number;
  record_count: number;
  session_count: number;
}

/**
 * 세션 통계 데이터
 */
export interface SessionStats {
  total_count: number;
  total_minutes: number;
  average_minutes: number;
  longest_minutes: number;
  longest_session: WorkSession | null;
  shortest_minutes: number;
  shortest_session: WorkSession | null;
}

/**
 * 전체 통계 요약
 */
export interface StatsSummary {
  total_records: number;
  total_sessions: number;
  total_minutes: number;
  completed_records: number;
  deleted_records: number;
  avg_session_duration: number;
  avg_sessions_per_record: number;
}

/**
 * 일별 통계 계산 (최근 N일)
 */
export function calculateDailyStats(
  records: WorkRecord[],
  days: number = 30
): DailyStat[] {
  const today = dayjs();
  const start_date = today.subtract(days - 1, "day");
  const stats_map = new Map<string, DailyStat>();

  // 모든 날짜 초기화
  for (let i = 0; i < days; i++) {
    const date = start_date.add(i, "day").format("YYYY-MM-DD");
    stats_map.set(date, {
      date,
      total_minutes: 0,
      record_count: 0,
      session_count: 0,
    });
  }

  // 레코드별 세션 집계
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

      // 레코드 카운트 (레코드 날짜 기준)
      const record_stat = stats_map.get(record.date);
      if (record_stat) {
        record_stat.record_count += 1;
      }
    });

  return Array.from(stats_map.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * 주별 통계 계산 (최근 N주)
 */
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

/**
 * 월별 통계 계산 (최근 N개월)
 */
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

/**
 * 카테고리별 통계 계산
 */
export function calculateCategoryStats(
  records: WorkRecord[]
): CategoryStat[] {
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

/**
 * 작업명별 통계 계산 (TOP N)
 */
export function calculateWorkNameStats(
  records: WorkRecord[],
  top_n: number = 10
): WorkNameStat[] {
  const work_map = new Map<
    string,
    { total_minutes: number; record_count: number; session_count: number }
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

/**
 * 세션 통계 계산
 */
export function calculateSessionStats(records: WorkRecord[]): SessionStats {
  const all_sessions: WorkSession[] = [];

  records
    .filter((r) => !r.is_deleted)
    .forEach((record) => {
      record.sessions.forEach((session) => {
        if (session.duration_minutes > 0) {
          all_sessions.push(session);
        }
      });
    });

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
      sorted_by_duration[sorted_by_duration.length - 1]?.duration_minutes || 0,
    shortest_session:
      sorted_by_duration[sorted_by_duration.length - 1] || null,
  };
}

/**
 * 전체 통계 요약 계산
 */
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

/**
 * 시간대별 통계 데이터
 */
export interface HourlyStats {
  hour: number;
  total_minutes: number;
  session_count: number;
  label: string;
}

/**
 * 요일별 통계 데이터
 */
export interface WeekdayStats {
  weekday: number;
  weekday_name: string;
  total_minutes: number;
  session_count: number;
  record_count: number;
}

/**
 * 딜/프로젝트별 통계 데이터
 */
export interface DealStats {
  deal_name: string;
  project_code: string;
  total_minutes: number;
  record_count: number;
  session_count: number;
  completed_count: number;
  completion_rate: number;
}

/**
 * 생산성 지표 데이터
 */
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

/**
 * 기간 비교 통계
 */
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

/**
 * 완료율 통계
 */
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

/**
 * 세션 시간 분포 통계
 */
export interface SessionTimeDistribution {
  under_15min: number;
  min_15_to_30: number;
  min_30_to_60: number;
  hour_1_to_2: number;
  over_2hours: number;
}

/**
 * 시간대별 통계 계산 (0-23시)
 */
export function calculateHourlyStats(records: WorkRecord[]): HourlyStats[] {
  const hourly_map = new Map<number, { total_minutes: number; session_count: number }>();

  // 0-23시 초기화
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

/**
 * 요일별 통계 계산
 */
export function calculateWeekdayStats(records: WorkRecord[]): WeekdayStats[] {
  const weekday_names = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday_map = new Map<
    number,
    { total_minutes: number; session_count: number; record_count: number }
  >();

  // 0-6 초기화 (일-토)
  for (let i = 0; i < 7; i++) {
    weekday_map.set(i, { total_minutes: 0, session_count: 0, record_count: 0 });
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

/**
 * 딜/프로젝트별 통계 계산
 */
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
          ? Math.round((data.completed_count / data.record_count) * 100)
          : 0,
    }))
    .sort((a, b) => b.total_minutes - a.total_minutes)
    .slice(0, top_n);
}

/**
 * 생산성 지표 계산
 */
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

  // 일별 데이터 수집
  const daily_data = new Map<string, { minutes: number; sessions: number }>();
  
  active_records.forEach((record) => {
    record.sessions.forEach((session) => {
      const date = session.date || record.date;
      const existing = daily_data.get(date) || { minutes: 0, sessions: 0 };
      existing.minutes += session.duration_minutes || 0;
      existing.sessions += 1;
      daily_data.set(date, existing);
    });
  });

  // 날짜 범위 계산
  const dates = Array.from(daily_data.keys()).sort();
  const first_date = dates[0];
  const last_date = dates[dates.length - 1];
  const total_days_range = dayjs(last_date).diff(dayjs(first_date), "day") + 1;
  const active_days_count = daily_data.size;

  // 일/주/월 평균 계산
  const total_minutes = Array.from(daily_data.values()).reduce(
    (sum, d) => sum + d.minutes,
    0
  );
  const total_sessions = Array.from(daily_data.values()).reduce(
    (sum, d) => sum + d.sessions,
    0
  );
  
  const daily_avg_minutes = active_days_count > 0 
    ? Math.round(total_minutes / active_days_count) 
    : 0;
  const weekly_avg_minutes = Math.round(daily_avg_minutes * 5); // 주 5일 기준
  const monthly_avg_minutes = Math.round(daily_avg_minutes * 22); // 월 22일 기준
  const daily_avg_sessions = active_days_count > 0 
    ? Math.round((total_sessions / active_days_count) * 10) / 10 
    : 0;

  // 가장 생산적인 요일
  const weekday_stats = calculateWeekdayStats(records);
  const most_productive_weekday = weekday_stats.reduce((max, curr) =>
    curr.total_minutes > max.total_minutes ? curr : max
  );

  // 가장 생산적인 시간대
  const hourly_stats = calculateHourlyStats(records);
  const most_productive_hour = hourly_stats.reduce((max, curr) =>
    curr.total_minutes > max.total_minutes ? curr : max
  );

  // 스트릭 계산
  const sorted_dates = dates.sort();
  let current_streak = 0;
  let max_streak = 0;
  let temp_streak = 1;

  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  // 현재 스트릭 (오늘 또는 어제부터 역순으로)
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

  // 최대 스트릭
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

/**
 * 이번 주 vs 지난 주 비교
 */
export function calculateWeekComparison(records: WorkRecord[]): PeriodComparison {
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
      
      // 이번 주
      if (record_date.isAfter(this_week_start.subtract(1, "day"))) {
        current.records += 1;
      }
      // 지난 주
      else if (
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

  const calc_change = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0;

  return {
    current_minutes: current.minutes,
    previous_minutes: previous.minutes,
    change_percent: calc_change(current.minutes, previous.minutes),
    current_sessions: current.sessions,
    previous_sessions: previous.sessions,
    sessions_change_percent: calc_change(current.sessions, previous.sessions),
    current_records: current.records,
    previous_records: previous.records,
    records_change_percent: calc_change(current.records, previous.records),
  };
}

/**
 * 이번 달 vs 지난 달 비교
 */
export function calculateMonthComparison(records: WorkRecord[]): PeriodComparison {
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

  const calc_change = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0;

  return {
    current_minutes: current.minutes,
    previous_minutes: previous.minutes,
    change_percent: calc_change(current.minutes, previous.minutes),
    current_sessions: current.sessions,
    previous_sessions: previous.sessions,
    sessions_change_percent: calc_change(current.sessions, previous.sessions),
    current_records: current.records,
    previous_records: previous.records,
    records_change_percent: calc_change(current.records, previous.records),
  };
}

/**
 * 완료율 통계 계산
 */
export function calculateCompletionStats(records: WorkRecord[]): CompletionStats {
  const active_records = records.filter((r) => !r.is_deleted);
  const completed_records = active_records.filter((r) => r.is_completed);
  
  // 완료까지 걸린 평균 시간 (완료된 레코드의 duration_minutes 평균)
  const avg_completion_time =
    completed_records.length > 0
      ? Math.round(
          completed_records.reduce(
            (sum, r) => sum + (r.duration_minutes || 0),
            0
          ) / completed_records.length
        )
      : 0;

  // 카테고리별 완료율
  const category_map = new Map<
    string,
    { total: number; completed: number }
  >();

  active_records.forEach((record) => {
    const category = record.category_name || "미분류";
    const existing = category_map.get(category) || { total: 0, completed: 0 };
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
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    total_records: active_records.length,
    completed_records: completed_records.length,
    completion_rate:
      active_records.length > 0
        ? Math.round((completed_records.length / active_records.length) * 100)
        : 0,
    avg_completion_time_minutes: avg_completion_time,
    by_category,
  };
}

/**
 * 세션 시간 분포 계산
 */
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

/**
 * 오늘 통계
 */
export interface TodayStats {
  total_minutes: number;
  session_count: number;
  record_count: number;
  completed_count: number;
  first_session_time: string | null;
  last_session_time: string | null;
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

/**
 * 시간 표시 형식 타입
 */
export type TimeDisplayFormat = "minutes" | "hours";

/**
 * 시간을 포맷팅 (분 -> 시:분)
 */
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}분`;
  }
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

/**
 * 시간을 지정된 형식으로 포맷팅
 */
export function formatDuration(
  minutes: number,
  format: TimeDisplayFormat = "hours"
): string {
  if (format === "minutes") {
    return `${minutes}분`;
  }
  return formatMinutesToHours(minutes);
}
