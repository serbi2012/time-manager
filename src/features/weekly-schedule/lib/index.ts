/**
 * 주간 일정 관련 순수 함수
 */

export type { CopyFormat, DayRecords } from "./copy_formatter";

export {
    getWeekDates,
    getWeekRange,
    getDayRecords,
    filterRecordsInWeek,
} from "./week_calculator";

export type { WorkGroup, WorkGroupDeal, DayGroup } from "./week_grouper";
export {
    getTotalMinutesForWork,
    getTotalMinutesForDeal,
    getFirstStartDate,
    getWorkProgressStatus,
    buildDayGroups,
} from "./week_grouper";

export { generateWeeklyCopyText } from "./weekly_copy_text";
