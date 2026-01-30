/**
 * 통계 계산 함수 테스트
 */

import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatMinutesToHours,
  calculateHourlyStats,
  calculateWeekdayStats,
  calculateDealStats,
  calculateProductivityStats,
  calculateWeekComparison,
  calculateMonthComparison,
  calculateCompletionStats,
  calculateSessionDistribution,
  calculateTodayStats,
  calculateStatsSummary,
  calculateSessionStats,
  calculateCategoryStats,
  calculateWorkNameStats,
} from "../../../../../features/admin/lib/statistics";
import type { WorkRecord } from "../../../../../shared/types";
import dayjs from "dayjs";

// 테스트용 mock 데이터 생성
function createMockRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
  return {
    id: `record-${Math.random().toString(36).substring(7)}`,
    date: dayjs().format("YYYY-MM-DD"),
    work_name: "테스트 작업",
    deal_name: "테스트 딜",
    project_code: "TEST-001",
    category_name: "개발",
    duration_minutes: 60,
    start_time: "09:00",
    end_time: "10:00",
    is_completed: false,
    is_deleted: false,
    sessions: [
      {
        id: `session-${Math.random().toString(36).substring(7)}`,
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        date: dayjs().format("YYYY-MM-DD"),
      },
    ],
    ...overrides,
  };
}

describe("formatDuration", () => {
  it("minutes 형식일 때 분만 표시한다", () => {
    expect(formatDuration(90, "minutes")).toBe("90분");
    expect(formatDuration(0, "minutes")).toBe("0분");
    expect(formatDuration(150, "minutes")).toBe("150분");
  });

  it("hours 형식일 때 시간 분으로 표시한다", () => {
    expect(formatDuration(90, "hours")).toBe("1시간 30분");
    expect(formatDuration(60, "hours")).toBe("1시간");
    expect(formatDuration(30, "hours")).toBe("30분");
    expect(formatDuration(0, "hours")).toBe("0분");
  });

  it("기본값은 hours 형식이다", () => {
    expect(formatDuration(90)).toBe("1시간 30분");
  });
});

describe("formatMinutesToHours", () => {
  it("60분 미만이면 분만 표시한다", () => {
    expect(formatMinutesToHours(30)).toBe("30분");
    expect(formatMinutesToHours(0)).toBe("0분");
    expect(formatMinutesToHours(59)).toBe("59분");
  });

  it("60분 이상이면 시간과 분을 표시한다", () => {
    expect(formatMinutesToHours(60)).toBe("1시간");
    expect(formatMinutesToHours(90)).toBe("1시간 30분");
    expect(formatMinutesToHours(120)).toBe("2시간");
    expect(formatMinutesToHours(125)).toBe("2시간 5분");
  });
});

describe("calculateStatsSummary", () => {
  it("빈 레코드 배열이면 모든 값이 0이다", () => {
    const result = calculateStatsSummary([]);
    expect(result.total_records).toBe(0);
    expect(result.total_sessions).toBe(0);
    expect(result.total_minutes).toBe(0);
    expect(result.completed_records).toBe(0);
    expect(result.deleted_records).toBe(0);
  });

  it("삭제된 레코드는 total_records에 포함되지 않는다", () => {
    const records = [
      createMockRecord({ is_deleted: false }),
      createMockRecord({ is_deleted: true }),
    ];
    const result = calculateStatsSummary(records);
    expect(result.total_records).toBe(1);
    expect(result.deleted_records).toBe(1);
  });

  it("완료된 레코드를 올바르게 집계한다", () => {
    const records = [
      createMockRecord({ is_completed: true }),
      createMockRecord({ is_completed: false }),
      createMockRecord({ is_completed: true }),
    ];
    const result = calculateStatsSummary(records);
    expect(result.completed_records).toBe(2);
  });
});

describe("calculateSessionStats", () => {
  it("빈 레코드 배열이면 기본값을 반환한다", () => {
    const result = calculateSessionStats([]);
    expect(result.total_count).toBe(0);
    expect(result.total_minutes).toBe(0);
    expect(result.average_minutes).toBe(0);
    expect(result.longest_session).toBeNull();
    expect(result.shortest_session).toBeNull();
  });

  it("세션 통계를 올바르게 계산한다", () => {
    const records = [
      createMockRecord({
        sessions: [
          { id: "s1", start_time: "09:00", end_time: "10:00", duration_minutes: 60 },
          { id: "s2", start_time: "11:00", end_time: "11:30", duration_minutes: 30 },
        ],
      }),
      createMockRecord({
        sessions: [
          { id: "s3", start_time: "14:00", end_time: "16:00", duration_minutes: 120 },
        ],
      }),
    ];
    const result = calculateSessionStats(records);
    expect(result.total_count).toBe(3);
    expect(result.total_minutes).toBe(210);
    expect(result.average_minutes).toBe(70);
    expect(result.longest_minutes).toBe(120);
    expect(result.shortest_minutes).toBe(30);
  });
});

describe("calculateHourlyStats", () => {
  it("24시간 통계를 반환한다", () => {
    const result = calculateHourlyStats([]);
    expect(result).toHaveLength(24);
    expect(result[0].hour).toBe(0);
    expect(result[23].hour).toBe(23);
  });

  it("세션 시작 시간을 기준으로 집계한다", () => {
    const records = [
      createMockRecord({
        sessions: [
          { id: "s1", start_time: "09:00", end_time: "10:00", duration_minutes: 60 },
          { id: "s2", start_time: "09:30", end_time: "10:00", duration_minutes: 30 },
        ],
      }),
    ];
    const result = calculateHourlyStats(records);
    expect(result[9].total_minutes).toBe(90);
    expect(result[9].session_count).toBe(2);
  });
});

describe("calculateWeekdayStats", () => {
  it("7일 통계를 반환한다", () => {
    const result = calculateWeekdayStats([]);
    expect(result).toHaveLength(7);
    expect(result[0].weekday_name).toBe("일");
    expect(result[6].weekday_name).toBe("토");
  });
});

describe("calculateDealStats", () => {
  it("딜별 통계를 집계한다", () => {
    const records = [
      createMockRecord({ deal_name: "프로젝트A", duration_minutes: 60 }),
      createMockRecord({ deal_name: "프로젝트A", duration_minutes: 30 }),
      createMockRecord({ deal_name: "프로젝트B", duration_minutes: 45 }),
    ];
    const result = calculateDealStats(records);
    expect(result.length).toBe(2);
    
    const project_a = result.find((d) => d.deal_name === "프로젝트A");
    expect(project_a?.total_minutes).toBe(90);
    expect(project_a?.record_count).toBe(2);
  });

  it("완료율을 계산한다", () => {
    const records = [
      createMockRecord({ deal_name: "프로젝트A", is_completed: true }),
      createMockRecord({ deal_name: "프로젝트A", is_completed: false }),
    ];
    const result = calculateDealStats(records);
    const project_a = result.find((d) => d.deal_name === "프로젝트A");
    expect(project_a?.completion_rate).toBe(50);
  });
});

describe("calculateCategoryStats", () => {
  it("카테고리별 통계를 집계한다", () => {
    const records = [
      createMockRecord({ category_name: "개발", duration_minutes: 100 }),
      createMockRecord({ category_name: "회의", duration_minutes: 50 }),
    ];
    const result = calculateCategoryStats(records);
    expect(result.length).toBe(2);
    
    const dev = result.find((c) => c.category === "개발");
    expect(dev?.total_minutes).toBe(100);
  });

  it("퍼센트를 계산한다", () => {
    const records = [
      createMockRecord({ category_name: "개발", duration_minutes: 75 }),
      createMockRecord({ category_name: "회의", duration_minutes: 25 }),
    ];
    const result = calculateCategoryStats(records);
    const dev = result.find((c) => c.category === "개발");
    expect(dev?.percentage).toBe(75);
  });
});

describe("calculateWorkNameStats", () => {
  it("작업명별 통계를 집계한다", () => {
    const records = [
      createMockRecord({ work_name: "코딩", duration_minutes: 100 }),
      createMockRecord({ work_name: "코딩", duration_minutes: 50 }),
      createMockRecord({ work_name: "리뷰", duration_minutes: 30 }),
    ];
    const result = calculateWorkNameStats(records, 10);
    expect(result.length).toBe(2);
    
    const coding = result.find((w) => w.work_name === "코딩");
    expect(coding?.total_minutes).toBe(150);
    expect(coding?.record_count).toBe(2);
  });

  it("top_n 개수를 제한한다", () => {
    const records = [
      createMockRecord({ work_name: "작업1", duration_minutes: 100 }),
      createMockRecord({ work_name: "작업2", duration_minutes: 50 }),
      createMockRecord({ work_name: "작업3", duration_minutes: 30 }),
    ];
    const result = calculateWorkNameStats(records, 2);
    expect(result.length).toBe(2);
  });
});

describe("calculateCompletionStats", () => {
  it("완료율을 계산한다", () => {
    const records = [
      createMockRecord({ is_completed: true }),
      createMockRecord({ is_completed: true }),
      createMockRecord({ is_completed: false }),
    ];
    const result = calculateCompletionStats(records);
    expect(result.total_records).toBe(3);
    expect(result.completed_records).toBe(2);
    expect(result.completion_rate).toBe(67);
  });

  it("카테고리별 완료율을 계산한다", () => {
    const records = [
      createMockRecord({ category_name: "개발", is_completed: true }),
      createMockRecord({ category_name: "개발", is_completed: false }),
      createMockRecord({ category_name: "회의", is_completed: true }),
    ];
    const result = calculateCompletionStats(records);
    const dev = result.by_category.find((c) => c.category === "개발");
    expect(dev?.rate).toBe(50);
  });
});

describe("calculateSessionDistribution", () => {
  it("세션 시간 분포를 계산한다", () => {
    const records = [
      createMockRecord({
        sessions: [
          { id: "s1", start_time: "09:00", end_time: "09:10", duration_minutes: 10 },
          { id: "s2", start_time: "10:00", end_time: "10:20", duration_minutes: 20 },
          { id: "s3", start_time: "11:00", end_time: "11:45", duration_minutes: 45 },
          { id: "s4", start_time: "14:00", end_time: "15:30", duration_minutes: 90 },
          { id: "s5", start_time: "16:00", end_time: "18:30", duration_minutes: 150 },
        ],
      }),
    ];
    const result = calculateSessionDistribution(records);
    expect(result.under_15min).toBe(1);
    expect(result.min_15_to_30).toBe(1);
    expect(result.min_30_to_60).toBe(1);
    expect(result.hour_1_to_2).toBe(1);
    expect(result.over_2hours).toBe(1);
  });
});

describe("calculateTodayStats", () => {
  it("오늘 통계를 계산한다", () => {
    const today = dayjs().format("YYYY-MM-DD");
    const records = [
      createMockRecord({
        date: today,
        is_completed: true,
        sessions: [
          { id: "s1", date: today, start_time: "09:00", end_time: "10:00", duration_minutes: 60 },
        ],
      }),
      createMockRecord({
        date: today,
        is_completed: false,
        sessions: [
          { id: "s2", date: today, start_time: "14:00", end_time: "15:00", duration_minutes: 60 },
        ],
      }),
    ];
    const result = calculateTodayStats(records);
    expect(result.total_minutes).toBe(120);
    expect(result.session_count).toBe(2);
    expect(result.record_count).toBe(2);
    expect(result.completed_count).toBe(1);
    expect(result.first_session_time).toBe("09:00");
    expect(result.last_session_time).toBe("15:00");
  });
});

describe("calculateProductivityStats", () => {
  it("빈 레코드면 기본값을 반환한다", () => {
    const result = calculateProductivityStats([]);
    expect(result.daily_avg_minutes).toBe(0);
    expect(result.streak_current).toBe(0);
    expect(result.streak_max).toBe(0);
  });

  it("가장 생산적인 요일을 찾는다", () => {
    // 월요일에만 세션이 있는 레코드
    const monday = dayjs().day(1).format("YYYY-MM-DD");
    const records = [
      createMockRecord({
        date: monday,
        sessions: [
          { id: "s1", date: monday, start_time: "09:00", end_time: "17:00", duration_minutes: 480 },
        ],
      }),
    ];
    const result = calculateProductivityStats(records);
    expect(result.most_productive_day).toBe("월요일");
  });
});

describe("calculateWeekComparison", () => {
  it("이번 주와 지난 주를 비교한다", () => {
    const this_week = dayjs().startOf("week").format("YYYY-MM-DD");
    const records = [
      createMockRecord({
        date: this_week,
        duration_minutes: 100,
        sessions: [
          { id: "s1", date: this_week, start_time: "09:00", end_time: "10:40", duration_minutes: 100 },
        ],
      }),
    ];
    const result = calculateWeekComparison(records);
    expect(result.current_minutes).toBe(100);
    expect(result.current_records).toBe(1);
  });
});

describe("calculateMonthComparison", () => {
  it("이번 달과 지난 달을 비교한다", () => {
    const this_month = dayjs().startOf("month").format("YYYY-MM-DD");
    const records = [
      createMockRecord({
        date: this_month,
        duration_minutes: 200,
        sessions: [
          { id: "s1", date: this_month, start_time: "09:00", end_time: "12:20", duration_minutes: 200 },
        ],
      }),
    ];
    const result = calculateMonthComparison(records);
    expect(result.current_minutes).toBe(200);
    expect(result.current_records).toBe(1);
  });
});
