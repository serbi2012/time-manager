/**
 * 스토어 타입 정의
 *
 * 각 슬라이스의 상태와 액션 인터페이스를 정의합니다.
 */

import type {
    WorkRecord,
    WorkTemplate,
    WorkFormData,
    WorkSession,
    TimerState,
    HiddenAutoCompleteOptions,
    ProjectCodeOption,
} from "@/shared/types";

// ============================================
// 공통 타입
// ============================================

/** 앱 테마 색상 타입 */
export type AppTheme =
    | "blue"
    | "green"
    | "purple"
    | "red"
    | "orange"
    | "teal"
    | "black";

/** 트랜지션 속도 타입 */
export type TransitionSpeed = "slow" | "normal" | "fast";

/** 숨김 가능한 자동완성 필드 */
export type HiddenAutoCompleteField =
    | "work_name"
    | "task_name"
    | "deal_name"
    | "project_code"
    | "task_option"
    | "category_option";

// ============================================
// Records Slice
// ============================================

export interface RecordsSlice {
    // State
    records: WorkRecord[];

    // Actions
    addRecord: (record: WorkRecord) => void;
    deleteRecord: (id: string) => void;
    softDeleteRecord: (id: string) => void;
    restoreRecord: (id: string) => void;
    permanentlyDeleteRecord: (id: string) => void;
    getDeletedRecords: () => WorkRecord[];
    updateRecord: (id: string, record: Partial<WorkRecord>) => void;
    updateSession: (
        record_id: string,
        session_id: string,
        new_start: string,
        new_end: string,
        new_date?: string
    ) => { success: boolean; adjusted: boolean; message?: string };
    deleteSession: (record_id: string, session_id: string) => void;
    markAsCompleted: (id: string) => void;
    markAsIncomplete: (id: string) => void;
}

// ============================================
// Templates Slice
// ============================================

export interface TemplatesSlice {
    // State
    templates: WorkTemplate[];

    // Actions
    addTemplate: (
        template: Omit<WorkTemplate, "id" | "created_at">
    ) => WorkTemplate;
    deleteTemplate: (id: string) => void;
    updateTemplate: (id: string, template: Partial<WorkTemplate>) => void;
    reorderTemplates: (active_id: string, over_id: string) => void;
    applyTemplate: (template_id: string) => void;
}

// ============================================
// Timer Slice
// ============================================

export interface TimerSlice {
    // State
    timer: TimerState;

    // Actions
    startTimer: (template_id?: string) => void;
    startTimerForRecord: (record_id: string) => void;
    stopTimer: () => WorkRecord | null;
    getElapsedSeconds: () => number;
    resetTimer: () => void;
    switchTemplate: (template_id: string) => void;
    updateActiveFormData: (data: Partial<WorkFormData>) => void;
    updateTimerStartTime: (new_start_time: number) => {
        success: boolean;
        adjusted: boolean;
        message?: string;
        adjusted_start_time?: number;
    };
}

// ============================================
// Settings Slice
// ============================================

export interface SettingsSlice {
    // State
    custom_task_options: string[];
    custom_category_options: string[];
    hidden_autocomplete_options: HiddenAutoCompleteOptions;
    use_postfix_on_preset_add: boolean;
    app_theme: AppTheme;
    lunch_start_time: string;
    lunch_end_time: string;
    transition_enabled: boolean;
    transition_speed: TransitionSpeed;
    mobile_gantt_list_expanded: boolean;

    // Actions - Custom Options
    addCustomTaskOption: (option: string) => void;
    addCustomCategoryOption: (option: string) => void;
    removeCustomTaskOption: (option: string) => void;
    removeCustomCategoryOption: (option: string) => void;

    // Actions - Hidden Options
    hideAutoCompleteOption: (
        field: HiddenAutoCompleteField,
        value: string
    ) => void;
    unhideAutoCompleteOption: (
        field: HiddenAutoCompleteField,
        value: string
    ) => void;

    // Actions - Settings
    setUsePostfixOnPresetAdd: (value: boolean) => void;
    setAppTheme: (theme: AppTheme) => void;
    setLunchTime: (start: string, end: string) => void;
    getLunchTimeMinutes: () => { start: number; end: number; duration: number };
    setTransitionEnabled: (enabled: boolean) => void;
    setTransitionSpeed: (speed: TransitionSpeed) => void;
    setMobileGanttListExpanded: (expanded: boolean) => void;
}

// ============================================
// Form Slice
// ============================================

export interface FormSlice {
    // State
    form_data: WorkFormData;

    // Actions
    setFormData: (data: Partial<WorkFormData>) => void;
    resetFormData: () => void;
}

// ============================================
// UI Slice
// ============================================

export interface UiSlice {
    // State
    selected_date: string;

    // Actions
    setSelectedDate: (date: string) => void;
    getFilteredRecords: () => WorkRecord[];
    getIncompleteRecords: () => WorkRecord[];
    getCompletedRecords: () => WorkRecord[];
    getAutoCompleteOptions: (field: keyof WorkFormData) => string[];
    getProjectCodeOptions: () => ProjectCodeOption[];
}

// ============================================
// Combined WorkStore
// ============================================

export type WorkStore = RecordsSlice &
    TemplatesSlice &
    TimerSlice &
    SettingsSlice &
    FormSlice &
    UiSlice;

// ============================================
// Re-export domain types for convenience
// ============================================

export type {
    WorkRecord,
    WorkTemplate,
    WorkFormData,
    WorkSession,
    TimerState,
    HiddenAutoCompleteOptions,
    ProjectCodeOption,
};
