import { useRef, useState, useCallback, type CSSProperties } from "react";

const RETURN_TRANSITION = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";

interface MagneticReturn<T extends HTMLElement> {
    ref: (node: T | null) => void;
    style: CSSProperties;
    handlers: {
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseLeave: () => void;
    };
}

export function useMagnetic<T extends HTMLElement = HTMLElement>(
    strength = 0.15
): MagneticReturn<T> {
    const el_ref = useRef<T | null>(null);
    const [style, setStyle] = useState<CSSProperties>({});

    const setRef = useCallback((node: T | null) => {
        el_ref.current = node;
    }, []);

    const handleMove = useCallback(
        (e: React.MouseEvent) => {
            const el = el_ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * strength;
            const dy = (e.clientY - cy) * strength;
            setStyle({
                transform: `translate(${dx}px, ${dy}px)`,
                transition: "none",
            });
        },
        [strength]
    );

    const handleLeave = useCallback(() => {
        setStyle({
            transform: "translate(0, 0)",
            transition: RETURN_TRANSITION,
        });
    }, []);

    return {
        ref: setRef,
        style,
        handlers: { onMouseMove: handleMove, onMouseLeave: handleLeave },
    };
}
