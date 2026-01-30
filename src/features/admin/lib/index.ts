/**
 * 관리자 기능 관련 순수 함수 모음
 */

// 타입
export type {
    AdminTab,
    ViewMode,
    SessionWithMeta,
    StatsOverviewProps,
    ProblemsListProps,
    ConflictsViewProps,
    DuplicatesViewProps,
} from "./types";

// 문제 감지
export {
    type ProblemType,
    type ProblemInfo,
    detectSessionProblems,
    findProblemSessions,
    countProblemSessions,
} from "./problem_detector";

// 충돌 감지
export {
    type ConflictInfo,
    findConflicts,
    countConflicts,
} from "./conflict_finder";

// 통계 계산
export {
    type DailyStat,
    type CategoryStat,
    type WorkNameStat,
    type SessionStats,
    type StatsSummary,
    type TimeDisplayFormat,
    type HourlyStats,
    type WeekdayStats,
    type DealStats,
    type ProductivityStats,
    type PeriodComparison,
    type CompletionStats,
    type SessionTimeDistribution,
    type TodayStats,
    calculateDailyStats,
    calculateWeeklyStats,
    calculateMonthlyStats,
    calculateCategoryStats,
    calculateWorkNameStats,
    calculateSessionStats,
    calculateStatsSummary,
    calculateHourlyStats,
    calculateWeekdayStats,
    calculateDealStats,
    calculateProductivityStats,
    calculateWeekComparison,
    calculateMonthComparison,
    calculateCompletionStats,
    calculateSessionDistribution,
    calculateTodayStats,
    formatMinutesToHours,
    formatDuration,
} from "./statistics";

// 정합성 검사
export {
    type IssueSeverity,
    type IssueType,
    type IntegrityIssue,
    type IntegrityResult,
    checkIntegrity,
    filterIssuesByType,
    filterIssuesBySeverity,
    filterAutoFixableIssues,
} from "./integrity";

// 내보내기
export {
    type ExportOptions,
    exportRecordsToCSV,
    exportSessionsToCSV,
    exportToJSON,
    exportData,
    downloadFile,
    generateExportFilename,
} from "./export";
