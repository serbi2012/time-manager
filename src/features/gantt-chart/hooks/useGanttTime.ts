/**
 * 간트 차트 시간 관련 상태 훅
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useWorkStore } from "../../../store/useWorkStore";

export interface UseGanttTimeReturn {
    /** 간트 틱 (1분마다 업데이트) */
    gantt_tick: number;
    /** 점심시간 정보 */
    lunch_time: {
        start: number;
        end: number;
        duration: number;
    };
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

    // 간트 틱 (1분마다 업데이트)
    const [gantt_tick, setGanttTick] = useState(0);

    useEffect(() => {
        if (!timer.is_running) return;

        const interval = setInterval(() => {
            setGanttTick((t) => t + 1);
        }, 60000); // 1분마다

        return () => clearInterval(interval);
    }, [timer.is_running, timer.start_time]);

    // 점심시간 정보
    const lunch_time = useMemo(
        () => getLunchTimeMinutes(),
        [getLunchTimeMinutes]
    );

    // 점심시간을 제외한 실제 작업 시간 계산
    const calculateDurationExcludingLunch = useCallback(
        (start_mins: number, end_mins: number): number => {
            const {
                start: LUNCH_START,
                end: LUNCH_END,
                duration: LUNCH_DURATION,
            } = lunch_time;

            // 점심시간 전에 끝나거나 점심시간 후에 시작하는 경우
            if (end_mins <= LUNCH_START || start_mins >= LUNCH_END) {
                return end_mins - start_mins;
            }

            // 점심시간 내에 완전히 포함되는 경우
            if (start_mins >= LUNCH_START && end_mins <= LUNCH_END) {
                return 0;
            }

            // 점심시간을 포함하는 경우
            if (start_mins < LUNCH_START && end_mins > LUNCH_END) {
                return end_mins - start_mins - LUNCH_DURATION;
            }

            // 점심시간 시작 전부터 점심시간 중간까지
            if (start_mins < LUNCH_START && end_mins <= LUNCH_END) {
                return LUNCH_START - start_mins;
            }

            // 점심시간 중간부터 점심시간 종료 후까지
            if (start_mins >= LUNCH_START && end_mins > LUNCH_END) {
                return end_mins - LUNCH_END;
            }

            return end_mins - start_mins;
        },
        [lunch_time]
    );

    return {
        gantt_tick,
        lunch_time,
        calculateDurationExcludingLunch,
    };
}
