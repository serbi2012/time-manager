/**
 * 간트 차트 스타일 컴포넌트
 */

import { useMemo } from "react";

interface GanttStylesProps {
    /** 그룹 작업 수 */
    grouped_works_count: number;
}

/**
 * 간트 차트 스타일 컴포넌트
 */
export function GanttStyles({ grouped_works_count }: GanttStylesProps) {
    const styles = useMemo(
        () => `
        .gantt-wrapper {
            user-select: none;
        }
        
        .gantt-container {
            position: relative;
            min-height: ${Math.max(grouped_works_count * 40 + 40, 100)}px;
            padding-top: 30px;
            padding-left: 90px;
        }
        
        .gantt-empty-container {
            position: relative;
            min-height: 150px;
            cursor: crosshair;
        }
        
        .gantt-time-header {
            position: absolute;
            top: 0;
            left: 90px;
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
            font-size: 11px;
            color: #8c8c8c;
        }
        
        .gantt-grid {
            position: absolute;
            top: 24px;
            left: 90px;
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
            background: #f0f0f0;
        }
        
        .gantt-selection {
            position: absolute;
            top: 0;
            bottom: 0;
            background: rgba(24, 144, 255, 0.2);
            border: 2px dashed #1890ff;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            pointer-events: none;
            transition: background 0.15s, border-color 0.15s;
        }
        
        .gantt-selection-text {
            background: #1890ff;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
        }
        
        .gantt-lunch-overlay {
            position: absolute;
            top: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                rgba(0, 0, 0, 0.03),
                rgba(0, 0, 0, 0.03) 10px,
                rgba(0, 0, 0, 0.06) 10px,
                rgba(0, 0, 0, 0.06) 20px
            );
            border-left: 2px dashed #d9d9d9;
            border-right: 2px dashed #d9d9d9;
            z-index: 1;
            cursor: not-allowed;
        }
        
        .gantt-lunch-overlay::before {
            content: '🍽️';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            opacity: 0.5;
        }
        
        .gantt-empty-hint {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
        
        .gantt-bars {
            position: relative;
            min-height: ${Math.max(grouped_works_count * 40, 60)}px;
        }
        
        .gantt-row {
            position: absolute;
            left: -90px;
            right: 0;
            height: 32px;
            display: flex;
            align-items: center;
        }
        
        .gantt-row-label {
            width: 85px;
            flex-shrink: 0;
            padding: 4px 8px;
            background: #fafafa;
            border-left: 3px solid #1890ff;
            border-radius: 0 4px 4px 0;
            margin-right: 5px;
            overflow: hidden;
            pointer-events: none;
        }
        
        .gantt-row-bars {
            flex: 1;
            position: relative;
            height: 100%;
            pointer-events: none;
        }
        
        .gantt-bar {
            position: absolute;
            height: 20px;
            top: 6px;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.1s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            pointer-events: auto;
        }
        
        .gantt-bar-running {
            animation: pulse 2s ease-in-out infinite;
            box-shadow: 0 0 8px rgba(24, 144, 255, 0.6);
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        .gantt-bar:hover {
            opacity: 0.85;
            transform: scaleY(1.2);
            z-index: 10;
        }
        
        .gantt-bar-resizing {
            z-index: 20;
            transform: scaleY(1.3);
        }
        
        /* 충돌 세션 스타일 */
        .gantt-bar-conflict {
            animation: conflictPulse 1.2s ease-in-out infinite;
            border: 2px solid #ff4d4f;
            box-shadow: 0 0 8px rgba(255, 77, 79, 0.6);
        }
        
        .gantt-bar-conflict::before {
            content: '⚠';
            position: absolute;
            top: -12px;
            right: -4px;
            font-size: 14px;
            z-index: 30;
            text-shadow: 0 0 4px white, 0 0 4px white;
        }
        
        @keyframes conflictPulse {
            0%, 100% { 
                box-shadow: 0 0 6px rgba(255, 77, 79, 0.5);
            }
            50% { 
                box-shadow: 0 0 12px rgba(255, 77, 79, 0.8);
            }
        }
        
        /* 충돌 오버레이 */
        .gantt-conflict-overlay {
            position: absolute;
            top: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                -45deg,
                rgba(255, 77, 79, 0.15),
                rgba(255, 77, 79, 0.15) 4px,
                rgba(255, 77, 79, 0.30) 4px,
                rgba(255, 77, 79, 0.30) 8px
            );
            border: 2px dashed #ff4d4f;
            border-radius: 4px;
            z-index: 5;
            pointer-events: none;
        }
        
        .gantt-conflict-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4d4f;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            font-weight: bold;
        }
        
        .gantt-bar-zero {
            animation: zeroPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes zeroPulse {
            0%, 100% { opacity: 0.6; box-shadow: 0 0 4px #ff4d4f; }
            50% { opacity: 1; box-shadow: 0 0 8px #ff4d4f; }
        }
        
        /* 리사이즈 핸들 */
        .resize-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 10px;
            cursor: ew-resize;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.15s, background 0.15s;
        }
        
        .resize-handle-left {
            left: -2px;
            border-radius: 4px 0 0 4px;
        }
        
        .resize-handle-right {
            right: -2px;
            border-radius: 0 4px 4px 0;
        }
        
        .gantt-bar:hover .resize-handle {
            opacity: 1;
            background: rgba(255, 255, 255, 0.3);
        }
        
        .resize-handle:hover {
            background: rgba(255, 255, 255, 0.6) !important;
        }
        
        /* 리사이즈 중 시간 표시 */
        .resize-time-indicator {
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            z-index: 100;
            pointer-events: none;
        }
    `,
        [grouped_works_count]
    );

    return <style>{styles}</style>;
}
