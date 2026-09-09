import { useEffect, type RefObject } from "react";
import { focusInto, pushFocusLayer } from "@/shared/lib/focus";

/** 모달 애니메이션이 끝난 뒤 포커스를 옮기기 위한 지연(ms) */
const FOCUS_DELAY_MS = 80;

export interface UseFocusLayerOptions {
    open: boolean;
    /** 포커스를 찾을 범위. 없으면 자동 포커스를 건너뛴다 */
    container_ref?: RefObject<HTMLElement | null>;
    /** 우선 포커스할 요소 */
    initial_ref?: RefObject<HTMLElement | null>;
    /** 닫을 때 이전 포커스로 되돌릴지 (기본 true) */
    restore?: boolean;
    /** 자동 포커스 이동 여부 (기본 true) */
    auto_focus?: boolean;
}

/**
 * 열림/닫힘에 맞춰 포커스를 옮기고 되돌린다
 *
 * 열릴 때: 현재 포커스를 기억하고 컨테이너 안의 첫 입력으로 이동
 * 닫힐 때: 기억해 둔 요소로 복원
 */
export function useFocusLayer({
    open,
    container_ref,
    initial_ref,
    restore = true,
    auto_focus = true,
}: UseFocusLayerOptions): void {
    useEffect(() => {
        if (!open) return;

        const release = pushFocusLayer({ restore });

        if (!auto_focus) return release;

        const timer = window.setTimeout(() => {
            focusInto(container_ref?.current ?? null, initial_ref?.current);
        }, FOCUS_DELAY_MS);

        return () => {
            window.clearTimeout(timer);
            release();
        };
        // container_ref/initial_ref는 ref 객체라 렌더마다 바뀌지 않는다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, restore, auto_focus]);
}
