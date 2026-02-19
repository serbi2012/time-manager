import { useRef, useState, useCallback, type CSSProperties } from "react";

interface SpotlightReturn {
    ref: (node: HTMLDivElement | null) => void;
    glow_style: CSSProperties;
    handlers: {
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
    };
}

export function useSpotlight(): SpotlightReturn {
    const el_ref = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [visible, setVisible] = useState(false);

    const setRef = useCallback((node: HTMLDivElement | null) => {
        el_ref.current = node;
    }, []);

    const handleMove = useCallback((e: React.MouseEvent) => {
        const el = el_ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    const handleEnter = useCallback(() => setVisible(true), []);
    const handleLeave = useCallback(() => setVisible(false), []);

    return {
        ref: setRef,
        glow_style: { left: pos.x, top: pos.y, opacity: visible ? 1 : 0 },
        handlers: {
            onMouseMove: handleMove,
            onMouseEnter: handleEnter,
            onMouseLeave: handleLeave,
        },
    };
}
