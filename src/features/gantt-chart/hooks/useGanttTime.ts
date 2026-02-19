/**
 * 간트 차트 시간 관련 상태 훅
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    calculateDurationExcludingLunch as calcDuration,
    type LunchTimeRange,
} from "../lib/lunch_calculator";

const GANTT_TICK_INTERVAL_MS = 10_000;

export interface UseGanttTimeReturn {
    /** 간트 틱 (타이머 작동 중 10초마다 업데이트) */
    gantt_tick: number;
    /** 점심시간 정보 */
    lunch_time: LunchTimeRange;
    /** 점심시간을 제외한 시간 계산 */
    calculateDurationExcludingLunch: (
        start_mins: number,
        end_mins: number
    ) => number;
}

/**
 * 간트 차트 시간 관련 상태 훅
 */
export function useGanttTime(): UseGanttTimeReturn {
    const { timer, getLunchTimeMinutes } = useWorkStore();

    const [gantt_tick, setGanttTick] = useState(0);

    useEffect(() => {
        if (!timer.is_running) return;

        const tick = () => setGanttTick((t) => t + 1);
        const immediate = setTimeout(tick, 0);
        const interval = setInterval(tick, GANTT_TICK_INTERVAL_MS);

        return () => {
            clearTimeout(immediate);
            clearInterval(interval);
        };
    }, [timer.is_running, timer.start_time]);

    // 점심시간 정보
    const lunch_time = useMemo(
        () => getLunchTimeMinutes(),
        [getLunchTimeMinutes]
    );

    // 점심시간을 제외한 실제 작업 시간 계산 (순수 함수 사용)
    const calculateDurationExcludingLunch = useCallback(
        (start_mins: number, end_mins: number): number => {
            return calcDuration(start_mins, end_mins, lunch_time);
        },
        [lunch_time]
    );

    return {
        gantt_tick,
        lunch_time,
        calculateDurationExcludingLunch,
    };
}
