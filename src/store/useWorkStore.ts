/**
 * useWorkStore - 작업 시간 관리 전역 스토어
 *
 * 슬라이스 조합으로 구성된 통합 스토어입니다.
 *
 * @example
 * import { useWorkStore } from '@/store/useWorkStore';
 *
 * // 상태 읽기
 * const records = useWorkStore(state => state.records);
 *
 * // 액션 호출
 * const startTimer = useWorkStore(state => state.startTimer);
 * startTimer();
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
import type { WorkStore } from "./types";

// Slices
import {
    createRecordsSlice,
    createTemplatesSlice,
    createTimerSlice,
    createSettingsSlice,
    createFormSlice,
    createUiSlice,
} from "./slices";

// Constants (re-export for backward compatibility)
export {
    TEMPLATE_COLORS,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    DEFAULT_PROJECT_CODE,
    APP_THEME_COLORS,
    APP_THEME_LABELS,
    DEFAULT_FORM_DATA,
    DEFAULT_TIMER,
} from "./constants";

// Types (re-export for backward compatibility)
export type { AppTheme, TransitionSpeed } from "./types";

/**
 * 작업 시간 관리 스토어
 *
 * 슬라이스:
 * - records: 레코드 CRUD, 세션 관리
 * - templates: 템플릿 CRUD
 * - timer: 타이머 시작/중지/전환
 * - settings: 앱 설정
 * - form: 폼 데이터
 * - ui: 날짜 선택, 필터링
 */
export const useWorkStore = create<WorkStore>()(
    persist(
        (...args) => ({
            // 각 슬라이스 생성 및 조합
            ...createRecordsSlice(...args),
            ...createTemplatesSlice(...args),
            ...createTimerSlice(...args),
            ...createSettingsSlice(...args),
            ...createFormSlice(...args),
            ...createUiSlice(...args),
        }),
        {
            name: "work-time-storage", // LocalStorage 키
            partialize: (state) => ({
                // 영속화할 상태만 선택 (form_data, selected_date 제외)
                records: state.records,
                templates: state.templates,
                timer: state.timer,
                custom_task_options: state.custom_task_options,
                custom_category_options: state.custom_category_options,
                hidden_autocomplete_options: state.hidden_autocomplete_options,
                use_postfix_on_preset_add: state.use_postfix_on_preset_add,
                app_theme: state.app_theme,
                lunch_start_time: state.lunch_start_time,
                lunch_end_time: state.lunch_end_time,
                transition_enabled: state.transition_enabled,
                transition_speed: state.transition_speed,
            }),
        }
    )
);
