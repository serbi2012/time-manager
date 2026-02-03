/**
 * Timer Slice
 *
 * 타이머 상태 및 액션
 * - 시작/중지/리셋
 * - 템플릿 전환
 * - 경과 시간 계산
 */

import type { StateCreator } from "zustand";
import type { TimerSlice, WorkStore } from "../../types";
import { DEFAULT_TIMER } from "../../constants";

// 액션 팩토리 함수들
import {
    createStartTimerAction,
    createStartTimerForRecordAction,
} from "./start";
import { createStopTimerAction, createResetTimerAction } from "./stop";
import { createSwitchTemplateAction } from "./switch";
import {
    createUpdateActiveFormDataAction,
    createUpdateTimerStartTimeAction,
} from "./update";

export const createTimerSlice: StateCreator<WorkStore, [], [], TimerSlice> = (
    set,
    get
) => ({
    // ============================================
    // State
    // ============================================
    timer: DEFAULT_TIMER,

    // ============================================
    // Actions
    // ============================================

    // Start actions
    startTimer: createStartTimerAction(set, get),
    startTimerForRecord: createStartTimerForRecordAction(set, get),

    // Stop actions
    stopTimer: createStopTimerAction(set, get),
    resetTimer: createResetTimerAction(set, get),

    // Switch action
    switchTemplate: createSwitchTemplateAction(set, get),

    // Update actions
    updateActiveFormData: createUpdateActiveFormDataAction(set, get),
    updateTimerStartTime: createUpdateTimerStartTimeAction(set, get),

    // Getter (간단해서 인라인 유지)
    getElapsedSeconds: () => {
        const { timer } = get();
        if (!timer.is_running || !timer.start_time) return 0;
        return Math.floor((Date.now() - timer.start_time) / 1000);
    },
});
