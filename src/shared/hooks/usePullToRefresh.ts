import { useState, useRef, useCallback } from "react";

/** 이 거리 이상 당겨야 새로고침 */
const DEFAULT_THRESHOLD_PX = 70;
/** 화면이 당겨지는 최대 거리 */
const DEFAULT_MAX_PULL_PX = 100;
/** 당김으로 인식하기 전 무시할 거리 */
const START_SLOP_PX = 8;

interface UsePullToRefreshOptions {
    onRefresh: () => void | Promise<void>;
    enabled?: boolean;
    threshold_px?: number;
    max_pull_px?: number;
}

interface UsePullToRefreshReturn {
    /** 현재 당겨진 거리 (px) */
    pull_distance: number;
    is_refreshing: boolean;
    /** 놓으면 새로고침되는 상태인가 */
    is_ready: boolean;
    handlers: {
        onTouchStart: (event: React.TouchEvent) => void;
        onTouchMove: (event: React.TouchEvent) => void;
        onTouchEnd: () => void;
    };
}

/**
 * 맨 위에서 아래로 당겨 새로고침
 * 스크롤이 맨 위일 때만 동작한다
 */
export function usePullToRefresh({
    onRefresh,
    enabled = true,
    threshold_px = DEFAULT_THRESHOLD_PX,
    max_pull_px = DEFAULT_MAX_PULL_PX,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
    const [pull_distance, setPullDistance] = useState(0);
    const [is_refreshing, setIsRefreshing] = useState(false);

    const start_y = useRef<number | null>(null);

    const onTouchStart = useCallback(
        (event: React.TouchEvent) => {
            if (!enabled || is_refreshing) return;
            if (window.scrollY > 0) return;

            start_y.current = event.touches[0].clientY;
        },
        [enabled, is_refreshing]
    );

    const onTouchMove = useCallback(
        (event: React.TouchEvent) => {
            if (start_y.current === null) return;

            const dy = event.touches[0].clientY - start_y.current;

            if (dy <= START_SLOP_PX) {
                setPullDistance(0);
                return;
            }

            setPullDistance(Math.min(dy - START_SLOP_PX, max_pull_px));
        },
        [max_pull_px]
    );

    const onTouchEnd = useCallback(() => {
        const pulled = pull_distance;

        start_y.current = null;
        setPullDistance(0);

        if (pulled < threshold_px || is_refreshing) return;

        setIsRefreshing(true);

        Promise.resolve(onRefresh()).finally(() => {
            setIsRefreshing(false);
        });
    }, [pull_distance, threshold_px, is_refreshing, onRefresh]);

    return {
        pull_distance,
        is_refreshing,
        is_ready: pull_distance >= threshold_px,
        handlers: { onTouchStart, onTouchMove, onTouchEnd },
    };
}
