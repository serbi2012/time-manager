/**
 * 레코드 슬라이스 타입 정의
 */

import type { WorkRecord } from "../../../shared/types";

/**
 * 세션 업데이트 결과
 */
export interface SessionUpdateResult {
    success: boolean;
    adjusted: boolean;
    message?: string;
}

/**
 * 레코드 슬라이스 상태
 */
export interface RecordSliceState {
    records: WorkRecord[];
    selected_date: string;
}

/**
 * 레코드 슬라이스 액션
 */
export interface RecordSliceActions {
    // 레코드 CRUD
    addRecord: (record: WorkRecord) => void;
    updateRecord: (id: string, record: Partial<WorkRecord>) => void;
    deleteRecord: (id: string) => void;
    
    // 소프트 삭제 (휴지통)
    softDeleteRecord: (id: string) => void;
    restoreRecord: (id: string) => void;
    permanentlyDeleteRecord: (id: string) => void;
    getDeletedRecords: () => WorkRecord[];
    
    // 세션 관리
    updateSession: (
        record_id: string,
        session_id: string,
        new_start: string,
        new_end: string,
        new_date?: string
    ) => SessionUpdateResult;
    deleteSession: (record_id: string, session_id: string) => void;
    
    // 날짜 필터
    setSelectedDate: (date: string) => void;
    getFilteredRecords: () => WorkRecord[];
    getIncompleteRecords: () => WorkRecord[];
    getCompletedRecords: () => WorkRecord[];
    
    // 완료 상태
    markAsCompleted: (id: string) => void;
    markAsIncomplete: (id: string) => void;
}

/**
 * 레코드 슬라이스 전체 타입
 */
export type RecordSlice = RecordSliceState & RecordSliceActions;
