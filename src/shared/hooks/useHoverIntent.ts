import { useCallback, useEffect, useRef, useState } from "react";

export function useHoverIntent(delay_ms: number) {
    const [is_hovering, setIsHovering] = useState(false);
    const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = useCallback(() => {
        if (timer_ref.current === null) return;
        clearTimeout(timer_ref.current);
        timer_ref.current = null;
    }, []);

    const handleMouseEnter = useCallback(() => {
        clearTimer();
        timer_ref.current = setTimeout(() => setIsHovering(true), delay_ms);
    }, [clearTimer, delay_ms]);

    const handleMouseLeave = useCallback(() => {
        clearTimer();
        setIsHovering(false);
    }, [clearTimer]);

    useEffect(() => clearTimer, [clearTimer]);

    return {
        is_hovering,
        hover_handlers: {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
        },
    };
}
