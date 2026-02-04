/**
 * 레코드 모달 상태 관리 훅
 */

import { useState, useCallback } from "react";

export interface ModalState {
    /** 추가 모달 열림 여부 */
    is_add_open: boolean;
    /** 수정 모달 열림 여부 */
    is_edit_open: boolean;
    /** 완료 목록 모달 열림 여부 */
    is_completed_open: boolean;
    /** 휴지통 모달 열림 여부 */
    is_trash_open: boolean;
    /** 세션 편집 모달 열림 여부 */
    is_session_edit_open: boolean;
    /** 현재 편집 중인 레코드 ID */
    editing_record_id: string | null;
}

export interface UseRecordModalsReturn extends ModalState {
    /** 추가 모달 열기 */
    openAddModal: () => void;
    /** 추가 모달 닫기 */
    closeAddModal: () => void;
    /** 수정 모달 열기 */
    openEditModal: (record_id: string) => void;
    /** 수정 모달 닫기 */
    closeEditModal: () => void;
    /** 완료 목록 모달 열기 */
    openCompletedModal: () => void;
    /** 완료 목록 모달 닫기 */
    closeCompletedModal: () => void;
    /** 휴지통 모달 열기 */
    openTrashModal: () => void;
    /** 휴지통 모달 닫기 */
    closeTrashModal: () => void;
    /** 세션 편집 모달 열기 */
    openSessionEditModal: (record_id: string) => void;
    /** 세션 편집 모달 닫기 */
    closeSessionEditModal: () => void;
    /** 모든 모달 닫기 */
    closeAllModals: () => void;
}

const DEFAULT_MODAL_STATE: ModalState = {
    is_add_open: false,
    is_edit_open: false,
    is_completed_open: false,
    is_trash_open: false,
    is_session_edit_open: false,
    editing_record_id: null,
};

/**
 * 레코드 모달 상태 관리 훅
 */
export function useRecordModals(): UseRecordModalsReturn {
    const [state, setState] = useState<ModalState>(DEFAULT_MODAL_STATE);

    const openAddModal = useCallback(() => {
        setState((prev) => ({ ...prev, is_add_open: true }));
    }, []);

    const closeAddModal = useCallback(() => {
        setState((prev) => ({ ...prev, is_add_open: false }));
    }, []);

    const openEditModal = useCallback((record_id: string) => {
        setState((prev) => ({
            ...prev,
            is_edit_open: true,
            editing_record_id: record_id,
        }));
    }, []);

    const closeEditModal = useCallback(() => {
        setState((prev) => ({
            ...prev,
            is_edit_open: false,
            editing_record_id: null,
        }));
    }, []);

    const openCompletedModal = useCallback(() => {
        setState((prev) => ({ ...prev, is_completed_open: true }));
    }, []);

    const closeCompletedModal = useCallback(() => {
        setState((prev) => ({ ...prev, is_completed_open: false }));
    }, []);

    const openTrashModal = useCallback(() => {
        setState((prev) => ({ ...prev, is_trash_open: true }));
    }, []);

    const closeTrashModal = useCallback(() => {
        setState((prev) => ({ ...prev, is_trash_open: false }));
    }, []);

    const openSessionEditModal = useCallback((record_id: string) => {
        setState((prev) => ({
            ...prev,
            is_session_edit_open: true,
            editing_record_id: record_id,
        }));
    }, []);

    const closeSessionEditModal = useCallback(() => {
        setState((prev) => ({
            ...prev,
            is_session_edit_open: false,
            editing_record_id: null,
        }));
    }, []);

    const closeAllModals = useCallback(() => {
        setState(DEFAULT_MODAL_STATE);
    }, []);

    return {
        ...state,
        openAddModal,
        closeAddModal,
        openEditModal,
        closeEditModal,
        openCompletedModal,
        closeCompletedModal,
        openTrashModal,
        closeTrashModal,
        openSessionEditModal,
        closeSessionEditModal,
        closeAllModals,
    };
}
