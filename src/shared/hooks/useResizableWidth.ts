import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clampWidth, parseStoredWidth } from "@/shared/lib/resizable_width";

const RESIZE_CURSOR = "col-resize";
const PRIMARY_MOUSE_BUTTON = 0;

interface UseResizableWidthOptions {
    storage_key: string;
    default_width: number;
    min_width: number;
    max_width: number;
}

export interface ResizeHandleProps {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
    onDoubleClick: () => void;
}

interface DragStart {
    pointer_x: number;
    width: number;
}

function readStoredWidth(storage_key: string): string | null {
    try {
        return localStorage.getItem(storage_key);
    } catch {
        return null;
    }
}

function writeStoredWidth(storage_key: string, width: number | null) {
    try {
        if (width === null) {
            localStorage.removeItem(storage_key);
        } else {
            localStorage.setItem(storage_key, String(width));
        }
    } catch {
        return;
    }
}

function useResizeCursor(is_resizing: boolean) {
    useEffect(() => {
        if (!is_resizing) return;

        const body_style = document.body.style;
        const prev_cursor = body_style.cursor;
        const prev_user_select = body_style.userSelect;
        body_style.cursor = RESIZE_CURSOR;
        body_style.userSelect = "none";

        return () => {
            body_style.cursor = prev_cursor;
            body_style.userSelect = prev_user_select;
        };
    }, [is_resizing]);
}

export function useResizableWidth({
    storage_key,
    default_width,
    min_width,
    max_width,
}: UseResizableWidthOptions) {
    const bounds = useMemo(
        () => ({ min: min_width, max: max_width }),
        [min_width, max_width]
    );

    const [width, setWidth] = useState(() =>
        parseStoredWidth(readStoredWidth(storage_key), default_width, bounds)
    );
    const [is_resizing, setIsResizing] = useState(false);
    const drag_start_ref = useRef<DragStart | null>(null);
    const width_ref = useRef(width);

    useResizeCursor(is_resizing);

    const applyWidth = useCallback((next_width: number) => {
        width_ref.current = next_width;
        setWidth(next_width);
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLElement>) => {
            if (e.button !== PRIMARY_MOUSE_BUTTON) return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            drag_start_ref.current = {
                pointer_x: e.clientX,
                width: width_ref.current,
            };
            setIsResizing(true);
        },
        []
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLElement>) => {
            const drag_start = drag_start_ref.current;
            if (!drag_start) return;
            const delta = e.clientX - drag_start.pointer_x;
            applyWidth(clampWidth(drag_start.width + delta, bounds));
        },
        [applyWidth, bounds]
    );

    const handlePointerEnd = useCallback(
        (e: React.PointerEvent<HTMLElement>) => {
            if (!drag_start_ref.current) return;
            drag_start_ref.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            setIsResizing(false);
            writeStoredWidth(storage_key, width_ref.current);
        },
        [storage_key]
    );

    const resetWidth = useCallback(() => {
        applyWidth(default_width);
        writeStoredWidth(storage_key, null);
    }, [applyWidth, default_width, storage_key]);

    const handle_props: ResizeHandleProps = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerEnd,
        onPointerCancel: handlePointerEnd,
        onDoubleClick: resetWidth,
    };

    return { width, is_resizing, handle_props, resetWidth };
}
