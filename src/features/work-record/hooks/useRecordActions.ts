/**
 * 레코드 액션 관련 훅
 */

import { useCallback } from "react";
import { message } from "antd";
import { useWorkStore } from "../../../store/useWorkStore";
import type { WorkRecord } from "../../../shared/types";
import { SUCCESS_MESSAGES } from "../../../shared/constants";

export interface UseRecordActionsReturn {
    /** 레코드 삭제 (휴지통) */
    deleteRecord: (record_id: string) => void;
    /** 레코드 복원 */
    restoreRecord: (record_id: string) => void;
    /** 레코드 영구 삭제 */
    permanentlyDeleteRecord: (record_id: string) => void;
    /** 레코드 완료 처리 */
    markAsCompleted: (record_id: string) => void;
    /** 레코드 미완료 처리 */
    markAsIncomplete: (record_id: string) => void;
    /** 레코드 복제 */
    duplicateRecord: (record: WorkRecord) => void;
    /** 레코드 수정 */
    updateRecord: (record_id: string, updates: Partial<WorkRecord>) => void;
    /** 세션 수정 */
    updateSession: (
        record_id: string,
        session_id: string,
        start_time: string,
        end_time: string,
        date?: string
    ) => { success: boolean; adjusted?: boolean; message?: string };
    /** 세션 삭제 */
    deleteSession: (record_id: string, session_id: string) => void;
    /** 새 레코드 추가 */
    addRecord: (record: WorkRecord) => void;
}

/**
 * 레코드 액션 관련 훅
 */
export function useRecordActions(): UseRecordActionsReturn {
    const {
        addRecord: storeAddRecord,
        updateRecord: storeUpdateRecord,
        softDeleteRecord,
        restoreRecord: storeRestoreRecord,
        permanentlyDeleteRecord: storePermanentlyDelete,
        markAsCompleted: storeMarkCompleted,
        markAsIncomplete: storeMarkIncomplete,
        updateSession: storeUpdateSession,
        deleteSession: storeDeleteSession,
        selected_date,
    } = useWorkStore();

    const deleteRecord = useCallback(
        (record_id: string) => {
            softDeleteRecord(record_id);
            message.success(SUCCESS_MESSAGES.recordTrashed);
        },
        [softDeleteRecord]
    );

    const restoreRecord = useCallback(
        (record_id: string) => {
            storeRestoreRecord(record_id);
            message.success(SUCCESS_MESSAGES.recordRestored);
        },
        [storeRestoreRecord]
    );

    const permanentlyDeleteRecord = useCallback(
        (record_id: string) => {
            storePermanentlyDelete(record_id);
            message.success(SUCCESS_MESSAGES.recordPermanentlyDeleted);
        },
        [storePermanentlyDelete]
    );

    const markAsCompleted = useCallback(
        (record_id: string) => {
            storeMarkCompleted(record_id);
            message.success(SUCCESS_MESSAGES.recordCompleted);
        },
        [storeMarkCompleted]
    );

    const markAsIncomplete = useCallback(
        (record_id: string) => {
            storeMarkIncomplete(record_id);
            message.success(SUCCESS_MESSAGES.recordUncompleted);
        },
        [storeMarkIncomplete]
    );

    const duplicateRecord = useCallback(
        (record: WorkRecord) => {
            const new_record: WorkRecord = {
                ...record,
                id: crypto.randomUUID(),
                date: selected_date,
                start_time: "",
                end_time: "",
                duration_minutes: 0,
                sessions: [],
                is_completed: false,
            };

            storeAddRecord(new_record);
            message.success(SUCCESS_MESSAGES.recordCloned);
        },
        [storeAddRecord, selected_date]
    );

    const updateSession = useCallback(
        (
            record_id: string,
            session_id: string,
            start_time: string,
            end_time: string,
            date?: string
        ) => {
            return storeUpdateSession(
                record_id,
                session_id,
                start_time,
                end_time,
                date
            );
        },
        [storeUpdateSession]
    );

    const deleteSession = useCallback(
        (record_id: string, session_id: string) => {
            storeDeleteSession(record_id, session_id);
        },
        [storeDeleteSession]
    );

    return {
        deleteRecord,
        restoreRecord,
        permanentlyDeleteRecord,
        markAsCompleted,
        markAsIncomplete,
        duplicateRecord,
        updateRecord: storeUpdateRecord,
        updateSession,
        deleteSession,
        addRecord: storeAddRecord,
    };
}
