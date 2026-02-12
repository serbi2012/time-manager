/**
 * Mobile swipe card wrapper — swipe left to reveal complete/delete actions.
 * Also detects long-press gestures and provides pressing state for child animations.
 * Uses touch events for native feel, spring-back on release.
 */

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";

import { RECORD_BUTTON } from "../../constants";

const SWIPE_THRESHOLD = 50;
const ACTION_WIDTH = 120;
const TRANSITION_MS = 300;
const OPACITY_RAMP = 30;
const LONG_PRESS_DELAY_MS = 500;
const SWIPE_MOVE_THRESHOLD = 5;
const SCROLL_MOVE_THRESHOLD = 10;

interface MobileSwipeCardProps {
    children: React.ReactNode | ((is_pressing: boolean) => React.ReactNode);
    onComplete: () => void;
    onDelete: () => void;
    /** 롱프레스 완료 시 호출 — anchor_rect으로 메뉴 위치 결정 */
    onLongPress?: (anchor_rect: DOMRect) => void;
}

export function MobileSwipeCard({
    children,
    onComplete,
    onDelete,
    onLongPress,
}: MobileSwipeCardProps) {
    const [offset_x, setOffsetX] = useState(0);
    const [show_actions, setShowActions] = useState(false);
    const [is_dragging, setIsDragging] = useState(false);
    const [is_pressing, setIsPressing] = useState(false);

    const wrapper_ref = useRef<HTMLDivElement>(null);
    const start_x = useRef<number | null>(null);
    const start_y = useRef(0);
    const base_offset = useRef(0);
    const is_swiping = useRef(false);

    /* ── Long-press refs ── */
    const lp_timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lp_fired = useRef(false);

    const cancelLongPress = useCallback(() => {
        if (lp_timer.current) {
            clearTimeout(lp_timer.current);
            lp_timer.current = null;
        }
        setIsPressing(false);
    }, []);

    /* ── Touch handlers (swipe + long-press unified) ── */

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            const cx = e.touches[0].clientX;
            const cy = e.touches[0].clientY;

            // Swipe init
            start_x.current = cx;
            start_y.current = cy;
            base_offset.current = offset_x;
            is_swiping.current = false;
            setIsDragging(true);
            if (offset_x < 0) setShowActions(true);

            // Long-press init
            lp_fired.current = false;
            if (onLongPress) {
                setIsPressing(true);
                lp_timer.current = setTimeout(() => {
                    lp_fired.current = true;
                    setIsPressing(false);
                    const rect = wrapper_ref.current?.getBoundingClientRect();
                    if (rect) onLongPress(rect);
                }, LONG_PRESS_DELAY_MS);
            }
        },
        [offset_x, onLongPress]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (start_x.current === null) return;

            const cx = e.touches[0].clientX;
            const cy = e.touches[0].clientY;
            const dx = cx - start_x.current;
            const dy = cy - start_y.current;

            // Cancel long-press on swipe or vertical scroll
            if (lp_timer.current) {
                if (
                    Math.abs(dx) > SWIPE_MOVE_THRESHOLD ||
                    Math.abs(dy) > SCROLL_MOVE_THRESHOLD
                ) {
                    cancelLongPress();
                }
            }

            // Don't process swipe if long-press already fired
            if (lp_fired.current) return;

            // Swipe offset
            const next = Math.min(
                0,
                Math.max(-ACTION_WIDTH, base_offset.current + dx)
            );
            if (Math.abs(dx) > SWIPE_MOVE_THRESHOLD) {
                is_swiping.current = true;
                setShowActions(true);
            }
            setOffsetX(next);
        },
        [cancelLongPress]
    );

    const handleTouchEnd = useCallback(() => {
        cancelLongPress();

        // If long-press just fired, skip swipe snap
        if (lp_fired.current) {
            lp_fired.current = false;
            start_x.current = null;
            setIsDragging(false);
            return;
        }

        // Swipe snap
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
    }, [offset_x, cancelLongPress]);

    const handleAction = useCallback((action: () => void) => {
        setOffsetX(0);
        setIsDragging(false);
        setTimeout(() => setShowActions(false), TRANSITION_MS);
        action();
    }, []);

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            if (onLongPress) e.preventDefault();
        },
        [onLongPress]
    );

    const action_opacity = Math.min(1, Math.abs(offset_x) / OPACITY_RAMP);

    /** 물방울 스프링 — 카드 전체에 scale 적용 */
    const DROPLET_SPRING = is_pressing
        ? { type: "spring" as const, stiffness: 400, damping: 25 }
        : { type: "spring" as const, stiffness: 300, damping: 12, mass: 0.7 };

    return (
        <motion.div
            className="mobile-swipe-container rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            animate={{ scale: is_pressing ? 0.97 : 1 }}
            transition={DROPLET_SPRING}
        >
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
                ref={wrapper_ref}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={handleContextMenu}
                style={{
                    position: "relative",
                    zIndex: 1,
                    background: "white",
                    borderRadius: 12,
                    transform: `translateX(${offset_x}px)`,
                    transition: is_dragging
                        ? "none"
                        : `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`,
                }}
            >
                {typeof children === "function"
                    ? children(is_pressing)
                    : children}
            </div>
        </motion.div>
    );
}
