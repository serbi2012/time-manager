import { useState, useCallback } from "react";

export interface UndoToastRequest {
    message: string;
    onUndo: () => void;
}

export interface UseUndoToastReturn {
    undo_toast: UndoToastRequest | null;
    is_open: boolean;
    showUndo: (request: UndoToastRequest) => void;
    hideUndo: () => void;
}

/**
 * 되돌리기 토스트 상태 관리
 */
export function useUndoToast(): UseUndoToastReturn {
    const [undo_toast, setUndoToast] = useState<UndoToastRequest | null>(null);

    const showUndo = useCallback((request: UndoToastRequest) => {
        setUndoToast(request);
    }, []);

    const hideUndo = useCallback(() => {
        setUndoToast(null);
    }, []);

    return {
        undo_toast,
        is_open: undo_toast !== null,
        showUndo,
        hideUndo,
    };
}
