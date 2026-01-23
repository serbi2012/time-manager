/**
 * 타이머 슬라이스 타입 정의
 */

import type { WorkFormData, TimerState, WorkRecord } from "../../../shared/types";

/**
 * 타이머 슬라이스 상태
 */
export interface TimerSliceState {
    timer: TimerState;
    form_data: WorkFormData;
}

/**
 * 타이머 슬라이스 액션
 */
export interface TimerSliceActions {
    // 타이머 기본 액션
    startTimer: (template_id?: string) => void;
    stopTimer: () => WorkRecord | null;
    resetTimer: () => void;
    switchTemplate: (template_id: string) => void;
    
    // 타이머 상태 조회
    getElapsedSeconds: () => number;
    
    // 타이머 업데이트
    updateActiveFormData: (data: Partial<WorkFormData>) => void;
    updateTimerStartTime: (new_start_time: number) => void;
    
    // 폼 데이터 액션
    setFormData: (data: Partial<WorkFormData>) => void;
    resetFormData: () => void;
}

/**
 * 타이머 슬라이스 전체 타입
 */
export type TimerSlice = TimerSliceState & TimerSliceActions;
