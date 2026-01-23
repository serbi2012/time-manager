/**
 * 타이머 관련 타입 정의
 */

import type { WorkFormData } from "./domain";

/**
 * 타이머 상태
 * Firebase에 저장되어 새로고침/탭 간 동기화
 */
export interface TimerState {
    is_running: boolean;
    start_time: number | null;              // 시작 시각 (Unix timestamp, persist됨)
    active_template_id: string | null;      // 현재 진행 중인 템플릿 ID
    active_form_data: WorkFormData | null;  // 진행 중인 작업 정보 (persist됨)
    active_record_id: string | null;        // 현재 진행 중인 레코드 ID
    active_session_id: string | null;       // 현재 진행 중인 세션 ID
}

/**
 * 기본 타이머 상태
 */
export const DEFAULT_TIMER_STATE: TimerState = {
    is_running: false,
    start_time: null,
    active_template_id: null,
    active_form_data: null,
    active_record_id: null,
    active_session_id: null,
};
