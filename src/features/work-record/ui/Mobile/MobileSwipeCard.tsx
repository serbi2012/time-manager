/**
 * Mobile swipe card wrapper — swipe left to reveal complete/delete actions
 * Uses touch events for native feel, spring-back on release
 */

import { useState, useRef, useCallback } from "react";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";

import { RECORD_BUTTON } from "../../constants";

const SWIPE_THRESHOLD = 50;
const ACTION_WIDTH = 120;
const TRANSITION_MS = 300;
const OPACITY_RAMP = 30;

interface MobileSwipeCardProps {
    children: React.ReactNode;
    onComplete: () => void;
    onDelete: () => void;
}

export function MobileSwipeCard({
    children,
    onComplete,
    onDelete,
}: MobileSwipeCardProps) {
    const [offset_x, setOffsetX] = useState(0);
    const [show_actions, setShowActions] = useState(false);
    const [is_dragging, setIsDragging] = useState(false);
    const start_x = useRef<number | null>(null);
    const base_offset = useRef(0);
    const is_swiping = useRef(false);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            start_x.current = e.touches[0].clientX;
            base_offset.current = offset_x;
            is_swiping.current = false;
            setIsDragging(true);
            if (offset_x < 0) setShowActions(true);
        },
        [offset_x]
    );

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (start_x.current === null) return;
        const diff = e.touches[0].clientX - start_x.current;
        const next = Math.min(
            0,
            Math.max(-ACTION_WIDTH, base_offset.current + diff)
        );
        if (Math.abs(diff) > 5) {
            is_swiping.current = true;
            setShowActions(true);
        }
        setOffsetX(next);
    }, []);

    const handleTouchEnd = useCallback(() => {
        const snap = offset_x < -SWIPE_THRESHOLD ? -ACTION_WIDTH : 0;
        setOffsetX(snap);
        start_x.current = null;
        setIsDragging(false);
        setTimeout(() => {
            is_swiping.current = false;
        }, 50);
        if (snap === 0) {
            setTimeout(() => setShowActions(false), TRANSITION_MS);
        }
    }, [offset_x]);

    const handleAction = useCallback((action: () => void) => {
        setOffsetX(0);
        setIsDragging(false);
        setTimeout(() => setShowActions(false), TRANSITION_MS);
        action();
    }, []);

    const action_opacity = Math.min(1, Math.abs(offset_x) / OPACITY_RAMP);

    return (
        <div className="mobile-swipe-container">
            {/* Action buttons behind — opacity fades with swipe distance */}
            {show_actions && (
                <div
                    className="mobile-swipe-actions"
                    style={{ opacity: action_opacity }}
                >
                    <button
                        className="mobile-swipe-action-btn"
                        style={{ background: "var(--color-success)" }}
                        onClick={() => handleAction(onComplete)}
                    >
                        <CheckCircleOutlined style={{ fontSize: 18 }} />
                        <span>{RECORD_BUTTON.COMPLETE}</span>
                    </button>
                    <button
                        className="mobile-swipe-action-btn"
                        style={{ background: "var(--color-error)" }}
                        onClick={() => handleAction(onDelete)}
                    >
                        <DeleteOutlined style={{ fontSize: 18 }} />
                        <span>{RECORD_BUTTON.DELETE}</span>
                    </button>
                </div>
            )}

            {/* Swipeable content */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    position: "relative",
                    zIndex: 1,
                    background: "white",
                    transform: `translateX(${offset_x}px)`,
                    transition: is_dragging
                        ? "none"
                        : `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
