/**
 * Long-press hook for touch/mouse events
 * Fires callback after holding for a specified duration.
 * Returns press state for visual feedback during the hold.
 */

import { useRef, useCallback, useState, useEffect } from "react";

const DEFAULT_DELAY_MS = 500;

interface UseLongPressOptions {
    /** 롱프레스 인식까지 걸리는 시간(ms) */
    delay_ms?: number;
    /** 롱프레스 완료 시 콜백 */
    onLongPress: () => void;
}

interface UseLongPressReturn {
    /** 현재 눌림 상태 (애니메이션 피드백용) */
    is_pressing: boolean;
    /** 눌림 진행률 0~1 (프로그레스 애니메이션용) */
    press_progress: number;
    /** 터치/마우스 이벤트 핸들러 */
    handlers: {
        onTouchStart: (e: React.TouchEvent) => void;
        onTouchEnd: () => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onContextMenu: (e: React.MouseEvent) => void;
    };
}

export function useLongPress({
    delay_ms = DEFAULT_DELAY_MS,
    onLongPress,
}: UseLongPressOptions): UseLongPressReturn {
    const [is_pressing, setIsPressing] = useState(false);
    const [press_progress, setPressProgress] = useState(0);

    const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
    const raf_ref = useRef<ReturnType<typeof requestAnimationFrame> | null>(
        null
    );
    const start_time_ref = useRef(0);
    const start_pos_ref = useRef({ x: 0, y: 0 });
    const fired_ref = useRef(false);
    const update_fn_ref = useRef<() => void>(() => {});

    useEffect(() => {
        update_fn_ref.current = () => {
            const elapsed = Date.now() - start_time_ref.current;
            const progress = Math.min(1, elapsed / delay_ms);
            setPressProgress(progress);
            if (progress < 1) {
                raf_ref.current = requestAnimationFrame(() =>
                    update_fn_ref.current()
                );
            }
        };
    }, [delay_ms]);

    const cleanup = useCallback(() => {
        if (timer_ref.current) {
            clearTimeout(timer_ref.current);
            timer_ref.current = null;
        }
        if (raf_ref.current) {
            cancelAnimationFrame(raf_ref.current);
            raf_ref.current = null;
        }
        setIsPressing(false);
        setPressProgress(0);
    }, []);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            fired_ref.current = false;
            start_pos_ref.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            start_time_ref.current = Date.now();
            setIsPressing(true);
            setPressProgress(0);

            raf_ref.current = requestAnimationFrame(() =>
                update_fn_ref.current()
            );

            timer_ref.current = setTimeout(() => {
                fired_ref.current = true;
                cleanup();
                onLongPress();
            }, delay_ms);
        },
        [delay_ms, onLongPress, cleanup]
    );

    const handleTouchEnd = useCallback(() => {
        cleanup();
    }, [cleanup]);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            const move_threshold = 10;
            const dx = e.touches[0].clientX - start_pos_ref.current.x;
            const dy = e.touches[0].clientY - start_pos_ref.current.y;
            if (
                Math.abs(dx) > move_threshold ||
                Math.abs(dy) > move_threshold
            ) {
                cleanup();
            }
        },
        [cleanup]
    );

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    return {
        is_pressing,
        press_progress,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
            onTouchMove: handleTouchMove,
            onContextMenu: handleContextMenu,
        },
    };
}
