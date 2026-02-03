/**
 * 앱 기본값 상수
 */

import type {
    WorkFormData,
    TimerState,
    HiddenAutoCompleteOptions,
} from "@/store/types";

// ============================================
// 기본 옵션
// ============================================

/** 기본 업무명(Task) 옵션 */
export const DEFAULT_TASK_OPTIONS = [
    "개발",
    "작업",
    "분석",
    "설계",
    "테스트",
    "기타",
] as const;

/** 기본 카테고리명 옵션 */
export const DEFAULT_CATEGORY_OPTIONS = [
    "개발",
    "문서작업",
    "회의",
    "환경세팅",
    "코드리뷰",
    "테스트",
    "기타",
] as const;

// ============================================
// 프로젝트 코드
// ============================================

/** 프로젝트 코드 기본값 */
export const DEFAULT_PROJECT_CODE = "A00_00000";

// ============================================
// 기본 상태값
// ============================================

/** 기본 폼 데이터 */
export const DEFAULT_FORM_DATA: WorkFormData = {
    project_code: "",
    work_name: "",
    task_name: "",
    deal_name: "",
    category_name: "",
    note: "",
};

/** 기본 타이머 상태 */
export const DEFAULT_TIMER: TimerState = {
    is_running: false,
    start_time: null,
    active_template_id: null,
    active_form_data: null,
    active_record_id: null,
    active_session_id: null,
};

/** 기본 숨김 자동완성 옵션 */
export const DEFAULT_HIDDEN_AUTOCOMPLETE_OPTIONS: HiddenAutoCompleteOptions = {
    work_name: [],
    task_name: [],
    deal_name: [],
    project_code: [],
    task_option: [],
    category_option: [],
};

// ============================================
// 기본 설정값
// ============================================

/** 기본 프리셋 추가 시 구분자 사용 여부 */
export const DEFAULT_USE_POSTFIX_ON_PRESET_ADD = false;
