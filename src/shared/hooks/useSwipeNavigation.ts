import { useRef, useCallback } from "react";

/** 이 거리 이상 옆으로 밀어야 이동으로 본다 */
const DEFAULT_THRESHOLD_PX = 70;
/** 방향을 정하기 위한 최소 이동 거리 */
const AXIS_LOCK_PX = 10;

interface UseSwipeNavigationOptions {
    /** 왼쪽으로 밀었을 때 (다음으로 이동) */
    onSwipeLeft: () => void;
    /** 오른쪽으로 밀었을 때 (이전으로 이동) */
    onSwipeRight: () => void;
    enabled?: boolean;
    threshold_px?: number;
}

interface UseSwipeNavigationReturn {
    handlers: {
        onTouchStart: (event: React.TouchEvent) => void;
        onTouchMove: (event: React.TouchEvent) => void;
        onTouchEnd: () => void;
    };
}

/**
 * 좌우로 밀어서 이동하는 제스처
 * 세로 스크롤과 섞이지 않도록 첫 움직임에서 축을 고정한다
 */
export function useSwipeNavigation({
    onSwipeLeft,
    onSwipeRight,
    enabled = true,
    threshold_px = DEFAULT_THRESHOLD_PX,
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
    const start = useRef<{ x: number; y: number } | null>(null);
    const axis = useRef<"x" | "y" | null>(null);
    const delta_x = useRef(0);

    const onTouchStart = useCallback(
        (event: React.TouchEvent) => {
            if (!enabled) return;

            const touch = event.touches[0];
            start.current = { x: touch.clientX, y: touch.clientY };
            axis.current = null;
            delta_x.current = 0;
        },
        [enabled]
    );

    const onTouchMove = useCallback((event: React.TouchEvent) => {
        if (!start.current) return;

        const touch = event.touches[0];
        const dx = touch.clientX - start.current.x;
        const dy = touch.clientY - start.current.y;

        if (axis.current === null) {
            if (Math.abs(dx) > AXIS_LOCK_PX || Math.abs(dy) > AXIS_LOCK_PX) {
                axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            }
        }

        if (axis.current === "x") {
            delta_x.current = dx;
        }
    }, []);

    const onTouchEnd = useCallback(() => {
        const moved = delta_x.current;
        const was_horizontal = axis.current === "x";

        start.current = null;
        axis.current = null;
        delta_x.current = 0;

        if (!was_horizontal || Math.abs(moved) < threshold_px) return;

        if (moved < 0) {
            onSwipeLeft();
            return;
        }

        onSwipeRight();
    }, [threshold_px, onSwipeLeft, onSwipeRight]);

    return { handlers: { onTouchStart, onTouchMove, onTouchEnd } };
}
