/**
 * 레코드 통계 관련 훅
 */

import { useMemo } from "react";
import { useWorkStore } from "../../../store/useWorkStore";
import { calculateTodayStats, type TodayStats } from "../lib/record_stats";

export interface UseRecordStatsReturn {
    /** 오늘 통계 */
    today_stats: TodayStats;
}

/**
 * 레코드 통계 관련 훅
 */
export function useRecordStats(): UseRecordStatsReturn {
    const { records, selected_date } = useWorkStore();

    const today_stats = useMemo(
        () => calculateTodayStats(records, selected_date),
        [records, selected_date]
    );

    return {
        today_stats,
    };
}
