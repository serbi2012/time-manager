import { useRef, useState, useCallback } from "react";

interface MousePosition {
    x: number;
    y: number;
    inside: boolean;
}

interface UseMousePositionReturn<T extends HTMLElement> {
    ref: (node: T | null) => void;
    pos: MousePosition;
    handlers: {
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseLeave: () => void;
    };
}

export function useMousePosition<
    T extends HTMLElement = HTMLDivElement
>(): UseMousePositionReturn<T> {
    const el_ref = useRef<T | null>(null);
    const [pos, setPos] = useState<MousePosition>({
        x: 0,
        y: 0,
        inside: false,
    });

    const setNodeRef = useCallback((node: T | null) => {
        el_ref.current = node;
    }, []);

    const handleMove = useCallback((e: React.MouseEvent) => {
        const el = el_ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            inside: true,
        });
    }, []);

    const handleLeave = useCallback(() => {
        setPos((p) => ({ ...p, inside: false }));
    }, []);

    return {
        ref: setNodeRef,
        pos,
        handlers: { onMouseMove: handleMove, onMouseLeave: handleLeave },
    };
}
