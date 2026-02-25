/**
 * 통계 모듈 - 공개 API
 *
 * 모든 통계 관련 타입과 함수를 re-export
 */

export type {
    DailyStat,
    CategoryStat,
    WorkNameStat,
    SessionStats,
    StatsSummary,
    HourlyStats,
    WeekdayStats,
    DealStats,
    ProductivityStats,
    PeriodComparison,
    CompletionStats,
    SessionTimeDistribution,
    TodayStats,
    TimeDisplayFormat,
} from "./types";

export {
    calculateStatsSummary,
    calculateSessionStats,
    calculateCategoryStats,
    calculateWorkNameStats,
} from "./basic";

export {
    calculateDailyStats,
    calculateWeeklyStats,
    calculateMonthlyStats,
    calculateHourlyStats,
    calculateWeekdayStats,
} from "./time_based";

export {
    calculateWeekComparison,
    calculateMonthComparison,
    calculateProductivityStats,
} from "./comparison";

export {
    calculateCompletionStats,
    calculateSessionDistribution,
    calculateTodayStats,
    calculateDealStats,
} from "./completion";

export { formatMinutesToHours, formatDuration } from "./formatters";
