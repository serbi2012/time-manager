/**
 * Clean Swim Lane gantt chart styles
 */

import { useMemo } from "react";

interface GanttStylesProps {
    grouped_works_count: number;
}

const GANTT_LEFT_MARGIN = 140;
const GANTT_ROW_HEIGHT = 44;

export function GanttStyles({ grouped_works_count }: GanttStylesProps) {
    const styles = useMemo(
        () => `
        .gantt-wrapper {
            user-select: none;
        }
        
        .gantt-container {
            position: relative;
            min-height: ${Math.max(
                grouped_works_count * GANTT_ROW_HEIGHT + 40,
                100
            )}px;
            padding-top: 32px;
            padding-left: ${GANTT_LEFT_MARGIN}px;
        }
        
        .gantt-empty-container {
            position: relative;
            min-height: 150px;
            cursor: crosshair;
        }
        
        .gantt-time-header {
            position: absolute;
            top: 0;
            left: ${GANTT_LEFT_MARGIN}px;
            right: 0;
            height: 24px;
        }
        
        .gantt-time-header-empty {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 24px;
        }
        
        .gantt-time-label {
            position: absolute;
            transform: translateX(-50%);
            font-size: var(--font-size-xs);
            color: var(--gray-400);
            font-weight: 500;
        }
        
        .gantt-grid {
            position: absolute;
            top: 24px;
            left: ${GANTT_LEFT_MARGIN}px;
            right: 0;
            bottom: 0;
            cursor: crosshair;
        }
        
        .gantt-grid-empty {
            position: absolute;
            top: 24px;
            left: 0;
            right: 0;
            bottom: 0;
        }
        
        .gantt-grid-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 1px;
            background: var(--gray-100);
        }
        
        /* --- Selection (E: spring bounce on appear) --- */
        .gantt-selection {
            position: absolute;
            top: 0;
            bottom: 0;
            background: rgba(49, 130, 246, 0.15);
            border: 2px dashed var(--color-primary);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            pointer-events: none;
            animation: selectionBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        
        .gantt-selection-text {
            background: var(--color-primary);
            color: white;
            padding: 2px var(--spacing-sm);
            border-radius: var(--radius-xs);
            font-size: var(--font-size-sm);
            white-space: nowrap;
        }
        
        /* --- Lunch overlay (H: fade-in on load) --- */
        .gantt-lunch-overlay {
            position: absolute;
            top: 0;
            bottom: 0;
            background:
                repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 6px,
                    rgba(0, 0, 0, 0.018) 6px,
                    rgba(0, 0, 0, 0.018) 12px
                ),
                rgba(242, 244, 246, 0.5);
            border-left: 1px dashed var(--gray-300);
            border-right: 1px dashed var(--gray-300);
            z-index: 5;
            pointer-events: auto;
            cursor: default;
            animation: fadeIn 0.6s ease-out both;
        }
        
        .gantt-empty-hint {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
        
        /* --- Bars container --- */
        .gantt-bars {
            position: relative;
            z-index: 2;
            min-height: ${Math.max(
                grouped_works_count * GANTT_ROW_HEIGHT,
                60
            )}px;
        }
        
        /* --- Row (D: hover highlight) --- */
        .gantt-row {
            position: absolute;
            left: -${GANTT_LEFT_MARGIN}px;
            right: 0;
            height: ${GANTT_ROW_HEIGHT}px;
            display: flex;
            align-items: center;
        }
        
        .gantt-row::before {
            content: '';
            position: absolute;
            inset: 0;
            left: ${GANTT_LEFT_MARGIN}px;
            background: linear-gradient(90deg, rgba(49,130,246,0.03), transparent 60%);
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
        }
        
        .gantt-row:hover::before {
            opacity: 1;
        }
        
        .gantt-row-label {
            width: ${GANTT_LEFT_MARGIN}px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--spacing-sm);
            padding-right: var(--spacing-md);
            overflow: hidden;
            pointer-events: none;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .gantt-row:hover .gantt-row-label {
            opacity: 1;
        }
        
        .gantt-row-bars {
            flex: 1;
            position: relative;
            height: 100%;
            pointer-events: none;
        }
        
        /* --- Bar (C: hover shadow expansion, F: resize snap-back, I: pop entrance) --- */
        .gantt-bar {
            position: absolute;
            height: 24px;
            top: 10px;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: left 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                        width 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                        height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        opacity 0.2s ease,
                        box-shadow 0.25s ease,
                        filter 0.25s ease;
            pointer-events: auto;
            opacity: 0.85;
            animation: barPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        
        .gantt-bar:hover {
            height: 28px;
            top: 8px;
            opacity: 1;
            z-index: 10;
            transform: scale(1.01);
            filter: brightness(1.08) drop-shadow(0 2px 6px rgba(0,0,0,0.12));
        }
        
        .gantt-bar-running {
            animation: runningPulse 2s ease-in-out infinite;
            opacity: 1;
        }
        
        .gantt-bar.gantt-bar-resizing,
        .gantt-bar.gantt-bar-resizing:hover {
            z-index: 20;
            height: 28px;
            top: 8px;
            opacity: 0.7;
            transform: scale(1.03);
            filter: none;
            transition: height 0.15s ease, top 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
        }
        
        .gantt-bar-conflict {
            animation: conflictPulse 1.2s ease-in-out infinite;
            border: 2px solid var(--color-error);
        }
        
        .gantt-bar-conflict::before {
            content: '\\26A0';
            position: absolute;
            top: -12px;
            right: -4px;
            font-size: 14px;
            z-index: 30;
            text-shadow: 0 0 4px white, 0 0 4px white;
        }
        
        .gantt-bar-zero {
            animation: zeroPulse 1.5s ease-in-out infinite;
        }
        
        .gantt-bar.gantt-bar-zero:hover {
            animation: none;
            opacity: 1;
        }

        /* --- Conflict overlay --- */
        .gantt-conflict-overlay {
            position: absolute;
            top: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                -45deg,
                rgba(240, 68, 82, 0.12),
                rgba(240, 68, 82, 0.12) 4px,
                rgba(240, 68, 82, 0.24) 4px,
                rgba(240, 68, 82, 0.24) 8px
            );
            border: 2px dashed var(--color-error);
            border-radius: var(--radius-sm);
            z-index: 5;
            pointer-events: none;
        }
        
        .gantt-conflict-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-error);
            color: white;
            padding: 2px var(--spacing-sm);
            border-radius: var(--radius-xs);
            font-size: var(--font-size-xs);
            white-space: nowrap;
            font-weight: var(--font-weight-semibold);
        }
        
        /* --- Resize handles (Edge Stripe, F: spring-back transition) --- */
        .resize-handle {
            position: absolute;
            top: 5px;
            bottom: 5px;
            width: 4px;
            cursor: ew-resize;
            z-index: 10;
            background: rgba(255, 255, 255, 0.45);
            border-radius: 1.5px;
            opacity: 0;
            transition: opacity 0.15s, background 0.15s;
        }
        
        /* Invisible hit area (16px wide) */
        .resize-handle::before {
            content: '';
            position: absolute;
            top: -5px;
            bottom: -5px;
            left: -6px;
            right: -6px;
        }
        
        /* Visual stripe */
        .resize-handle::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 1px;
            height: 8px;
            background: rgba(0, 0, 0, 0.12);
            border-radius: 0.5px;
        }
        
        .resize-handle-left {
            left: 4px;
        }
        
        .resize-handle-right {
            right: 4px;
        }
        
        .gantt-bar:hover .resize-handle {
            opacity: 1;
        }
        
        .gantt-bar.gantt-bar-resizing .resize-handle {
            opacity: 1;
        }
        
        .resize-handle:hover {
            background: rgba(255, 255, 255, 0.8) !important;
        }
        
        .resize-time-indicator {
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px var(--spacing-sm);
            border-radius: var(--radius-xs);
            font-size: var(--font-size-xs);
            white-space: nowrap;
            z-index: 100;
            pointer-events: none;
        }

        /* --- Shimmer for running bars --- */
        .gantt-bar-shimmer {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            border-radius: var(--radius-md);
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.35) 40%,
                rgba(255, 255, 255, 0.5) 50%,
                rgba(255, 255, 255, 0.35) 60%,
                transparent 100%
            );
            background-size: 200% 100%;
            animation: shimmer 2.5s ease-in-out infinite;
            pointer-events: none;
        }

        /* --- Header animations (A: date slide, B: number slide) --- */
        .gantt-date-slide-left {
            animation: slideInFromLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .gantt-date-slide-right {
            animation: slideInFromRight 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .gantt-number-slide {
            display: inline-block;
            animation: slideUpIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        /* --- Current time entrance (G: drop in) --- */
        .gantt-current-time-enter {
            animation: dropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
            animation-delay: 0.3s;
        }

        /* --- Label entrance (J: slide from left) --- */
        .gantt-label-enter {
            animation: labelSlideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) backwards;
        }
        
        /* ==================== Keyframes ==================== */
        
        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes runningPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(49,130,246,0.3); }
            50% { box-shadow: 0 0 0 4px rgba(49,130,246,0.08); }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes currentTimePulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        @keyframes conflictPulse {
            0%, 100% { box-shadow: 0 0 6px rgba(240, 68, 82, 0.4); }
            50% { box-shadow: 0 0 12px rgba(240, 68, 82, 0.7); }
        }
        
        @keyframes zeroPulse {
            0%, 100% { opacity: 0.6; box-shadow: 0 0 4px var(--color-error); }
            50% { opacity: 1; box-shadow: 0 0 8px var(--color-error); }
        }
        
        /* A: Date slide transitions */
        @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInFromRight {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        /* B: Number count-up slide */
        @keyframes slideUpIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* E: Selection spring bounce */
        @keyframes selectionBounce {
            0% { opacity: 0; transform: scaleX(0.92); }
            60% { opacity: 1; transform: scaleX(1.02); }
            100% { opacity: 1; transform: scaleX(1); }
        }
        
        /* G: Current time drop in */
        @keyframes dropIn {
            0% { opacity: 0; transform: translateY(-16px) scaleY(0.6); }
            60% { opacity: 1; transform: translateY(2px) scaleY(1.02); }
            100% { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        
        /* H: Lunch zone fade in */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* I: Bar pop entrance */
        @keyframes barPop {
            0% { opacity: 0; transform: scaleX(0.85) scaleY(0.7); }
            60% { opacity: 0.9; transform: scaleX(1.03) scaleY(1.05); }
            100% { opacity: 0.85; transform: scaleX(1) scaleY(1); }
        }
        
        /* J: Label slide in from left */
        @keyframes labelSlideIn {
            from { opacity: 0; transform: translateX(-16px); }
            to { opacity: 0.8; transform: translateX(0); }
        }
    `,
        [grouped_works_count]
    );

    return <style>{styles}</style>;
}
