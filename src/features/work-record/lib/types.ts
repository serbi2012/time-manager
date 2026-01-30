/**
 * 작업 기록 관련 타입 정의
 */

import type { WorkRecord, WorkFormData } from "../../../shared/types";

/**
 * 세션 업데이트 결과
 */
export interface SessionUpdateResult {
    success: boolean;
    adjusted: boolean;
    message?: string;
}

/**
 * 레코드 테이블 컬럼 렌더러 Props
 */
export interface RecordColumnProps {
    record: WorkRecord;
    is_running: boolean;
    active_record_id: string | null;
    on_start: (record: WorkRecord) => void;
    on_stop: () => void;
    on_edit: (record: WorkRecord) => void;
    on_delete: (record: WorkRecord) => void;
    on_complete: (record: WorkRecord) => void;
}

/**
 * 레코드 액션 Props
 */
export interface RecordActionsProps {
    record: WorkRecord;
    is_running: boolean;
    on_start: () => void;
    on_stop: () => void;
    on_edit: () => void;
    on_delete: () => void;
    on_complete: () => void;
    on_copy: () => void;
}

/**
 * 레코드 폼 Props
 */
export interface RecordFormProps {
    initial_values?: Partial<WorkFormData>;
    on_submit: (values: WorkFormData) => void;
    on_cancel: () => void;
    submit_text?: string;
    loading?: boolean;
}

/**
 * 레코드 테이블 헤더 Props
 */
export interface RecordTableHeaderProps {
    selected_date: string;
    on_date_change: (date: string) => void;
    total_minutes: number;
    record_count: number;
    on_show_completed: () => void;
    on_show_trash: () => void;
}

/**
 * 완료 모달 Props
 */
export interface CompletedModalProps {
    open: boolean;
    on_close: () => void;
    records: WorkRecord[];
    on_restore: (record: WorkRecord) => void;
}

/**
 * 휴지통 모달 Props
 */
export interface TrashModalProps {
    open: boolean;
    on_close: () => void;
    records: WorkRecord[];
    on_restore: (record: WorkRecord) => void;
    on_permanent_delete: (record: WorkRecord) => void;
}

/**
 * 모바일 카드 Props
 */
export interface MobileRecordCardProps {
    record: WorkRecord;
    is_running: boolean;
    is_expanded: boolean;
    on_toggle_expand: () => void;
    on_start: () => void;
    on_stop: () => void;
    on_edit: () => void;
    on_delete: () => void;
    on_complete: () => void;
    elapsed_seconds?: number;
}

/**
 * 자동완성 필드 타입
 */
export type AutoCompleteField = 
    | "work_name" 
    | "task_name" 
    | "deal_name" 
    | "project_code";
