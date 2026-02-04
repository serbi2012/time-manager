/**
 * 레코드 인라인 편집 상태 관리 훅
 */

import { useState, useCallback } from "react";

export interface EditState {
    /** 편집 중인 레코드 ID */
    editing_id: string | null;
    /** 편집 모드 여부 */
    is_editing: boolean;
}

export interface UseRecordEditReturn extends EditState {
    /** 편집 시작 */
    startEdit: (record_id: string) => void;
    /** 편집 취소 */
    cancelEdit: () => void;
    /** 편집 완료 */
    finishEdit: () => void;
    /** 특정 레코드가 편집 중인지 확인 */
    isEditing: (record_id: string) => boolean;
}

/**
 * 레코드 인라인 편집 상태 관리 훅
 */
export function useRecordEdit(): UseRecordEditReturn {
    const [editing_id, setEditingId] = useState<string | null>(null);

    const startEdit = useCallback((record_id: string) => {
        setEditingId(record_id);
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
    }, []);

    const finishEdit = useCallback(() => {
        setEditingId(null);
    }, []);

    const isEditing = useCallback(
        (record_id: string) => editing_id === record_id,
        [editing_id]
    );

    return {
        editing_id,
        is_editing: editing_id !== null,
        startEdit,
        cancelEdit,
        finishEdit,
        isEditing,
    };
}
