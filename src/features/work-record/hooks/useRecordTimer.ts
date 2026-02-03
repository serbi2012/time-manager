/**
 * 레코드 타이머 관련 훅
 */

import { useState, useEffect, useCallback } from "react";
import { useWorkStore } from "../../../store/useWorkStore";

export interface UseRecordTimerReturn {
    /** 타이머가 실행 중인지 여부 */
    is_timer_running: boolean;
    /** 현재 활성 레코드 ID */
    active_record_id: string | null;
    /** 현재 활성 세션 ID */
    active_session_id: string | null;
    /** 경과 시간 (초) */
    elapsed_seconds: number;
    /** 타이머 시작 */
    startTimer: (record_id: string) => void;
    /** 타이머 정지 */
    stopTimer: () => void;
    /** 폼 데이터 업데이트 */
    updateFormData: (
        data: Partial<{
            project_code: string;
            work_name: string;
            task_name: string;
            deal_name: string;
            category_name: string;
            note: string;
        }>
    ) => void;
}

/**
 * 레코드 타이머 관련 훅
 */
export function useRecordTimer(): UseRecordTimerReturn {
    const {
        timer,
        startTimerForRecord,
        stopTimer,
        updateActiveFormData,
        getElapsedSeconds,
    } = useWorkStore();

    // 타이머 리렌더링용 tick
    const [, setTick] = useState(0);

    // 타이머가 실행 중일 때만 1초마다 업데이트
    useEffect(() => {
        if (!timer.is_running) return;

        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer.is_running]);

    const elapsed_seconds = timer.is_running ? getElapsedSeconds() : 0;

    const startTimer = useCallback(
        (record_id: string) => {
            startTimerForRecord(record_id);
        },
        [startTimerForRecord]
    );

    return {
        is_timer_running: timer.is_running,
        active_record_id: timer.active_record_id,
        active_session_id: timer.active_session_id,
        elapsed_seconds,
        startTimer,
        stopTimer,
        updateFormData: updateActiveFormData,
    };
}
