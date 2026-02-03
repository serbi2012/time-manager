/**
 * 관리자 액션 관련 훅
 */

import { useCallback } from "react";
import { message } from "antd";
import { useWorkStore } from "../../../store/useWorkStore";
import type { WorkRecord } from "../../../shared/types";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../shared/constants";

export interface UseAdminActionsReturn {
    /** 세션 삭제 */
    deleteSession: (record_id: string, session_id: string) => void;
    /** 레코드 삭제 (휴지통) */
    softDeleteRecord: (record_id: string) => void;
    /** 레코드 복원 */
    restoreRecord: (record_id: string) => void;
    /** 레코드 영구 삭제 */
    permanentlyDeleteRecord: (record_id: string) => void;
    /** 세션 수정 */
    updateSession: (
        record_id: string,
        session_id: string,
        start_time: string,
        end_time: string,
        date?: string
    ) => { success: boolean; adjusted?: boolean; message?: string };
    /** 레코드 수정 */
    updateRecord: (record_id: string, updates: Partial<WorkRecord>) => void;
    /** 레코드 병합 */
    mergeRecords: (source_id: string, target_id: string) => void;
    /** 일괄 삭제 */
    bulkDeleteRecords: (record_ids: string[]) => void;
    /** 일괄 완료 처리 */
    bulkMarkComplete: (record_ids: string[]) => void;
    /** 휴지통 비우기 */
    emptyTrash: () => void;
}

/**
 * 관리자 액션 관련 훅
 */
export function useAdminActions(): UseAdminActionsReturn {
    const {
        deleteSession: storeDeleteSession,
        softDeleteRecord: storeSoftDelete,
        restoreRecord: storeRestore,
        permanentlyDeleteRecord: storePermanentDelete,
        updateSession: storeUpdateSession,
        updateRecord: storeUpdateRecord,
        records,
    } = useWorkStore();

    const deleteSession = useCallback(
        (record_id: string, session_id: string) => {
            storeDeleteSession(record_id, session_id);
            message.success(SUCCESS_MESSAGES.sessionDeleted);
        },
        [storeDeleteSession]
    );

    const softDeleteRecord = useCallback(
        (record_id: string) => {
            storeSoftDelete(record_id);
            message.success(SUCCESS_MESSAGES.recordMovedToTrashAdmin);
        },
        [storeSoftDelete]
    );

    const restoreRecord = useCallback(
        (record_id: string) => {
            storeRestore(record_id);
            message.success(SUCCESS_MESSAGES.recordRestoredAdmin);
        },
        [storeRestore]
    );

    const permanentlyDeleteRecord = useCallback(
        (record_id: string) => {
            storePermanentDelete(record_id);
            message.success(SUCCESS_MESSAGES.recordPermanentlyDeletedAdmin);
        },
        [storePermanentDelete]
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

    const mergeRecords = useCallback(
        (source_id: string, target_id: string) => {
            const source = records.find((r) => r.id === source_id);
            const target = records.find((r) => r.id === target_id);

            if (!source || !target) {
                message.error(ERROR_MESSAGES.mergeNotFound);
                return;
            }

            // 세션 병합
            const merged_sessions = [
                ...(target.sessions || []),
                ...(source.sessions || []),
            ].sort((a, b) => {
                const date_compare = (a.date || "").localeCompare(b.date || "");
                if (date_compare !== 0) return date_compare;
                return (a.start_time || "").localeCompare(b.start_time || "");
            });

            // 총 시간 재계산
            const total_minutes = merged_sessions.reduce(
                (sum, s) => sum + (s.duration_minutes || 0),
                0
            );

            // 타겟 레코드 업데이트
            storeUpdateRecord(target_id, {
                sessions: merged_sessions,
                duration_minutes: total_minutes,
                start_time: merged_sessions[0]?.start_time || target.start_time,
                end_time:
                    merged_sessions[merged_sessions.length - 1]?.end_time ||
                    target.end_time,
            });

            // 소스 레코드 삭제
            storeSoftDelete(source_id);

            message.success(SUCCESS_MESSAGES.recordMerged);
        },
        [records, storeUpdateRecord, storeSoftDelete]
    );

    const bulkDeleteRecords = useCallback(
        (record_ids: string[]) => {
            record_ids.forEach((id) => {
                storeSoftDelete(id);
            });
            message.success(
                SUCCESS_MESSAGES.recordsBulkTrashMoved(record_ids.length)
            );
        },
        [storeSoftDelete]
    );

    const bulkMarkComplete = useCallback((record_ids: string[]) => {
        const { markAsCompleted } = useWorkStore.getState();
        record_ids.forEach((id) => {
            markAsCompleted(id);
        });
        message.success(
            SUCCESS_MESSAGES.recordsBulkCompleted(record_ids.length)
        );
    }, []);

    const emptyTrash = useCallback(() => {
        const deleted = records.filter((r) => r.is_deleted);
        deleted.forEach((r) => {
            storePermanentDelete(r.id);
        });
        message.success(SUCCESS_MESSAGES.trashEmptiedWithCount(deleted.length));
    }, [records, storePermanentDelete]);

    return {
        deleteSession,
        softDeleteRecord,
        restoreRecord,
        permanentlyDeleteRecord,
        updateSession,
        updateRecord: storeUpdateRecord,
        mergeRecords,
        bulkDeleteRecords,
        bulkMarkComplete,
        emptyTrash,
    };
}
