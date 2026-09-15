import { useEffect, useRef } from "react";

const OVERLAY_HISTORY_KEY = "overlay";

interface UseOverlayHistoryOptions {
    open: boolean;
    onClose: () => void;
    /** 뒤로가기 연동 사용 여부 (기본 true) */
    enabled?: boolean;
}

/**
 * 오버레이가 열려 있는 동안 히스토리 항목을 하나 쌓는다
 * 안드로이드 뒤로가기(또는 브라우저 뒤로가기)로 오버레이만 닫히게 한다
 */
export function useOverlayHistory({
    open,
    onClose,
    enabled = true,
}: UseOverlayHistoryOptions): void {
    const close_ref = useRef(onClose);
    const pushed_ref = useRef(false);

    useEffect(() => {
        close_ref.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!enabled || !open) return;

        window.history.pushState({ [OVERLAY_HISTORY_KEY]: true }, "");
        pushed_ref.current = true;

        const handlePopState = () => {
            pushed_ref.current = false;
            close_ref.current();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);

            if (pushed_ref.current) {
                pushed_ref.current = false;
                window.history.back();
            }
        };
    }, [open, enabled]);
}
