/**
 * 리사이즈 핸들 컴포넌트
 */

import type { ResizeHandleProps } from "../../lib/types";

/**
 * 간트 바 리사이즈 핸들
 * 좌우 끝에 표시되어 드래그로 시간 조절 가능
 */
export function ResizeHandle({ 
    position, 
    on_mouse_down 
}: ResizeHandleProps) {
    return (
        <div
            className={`gantt-resize-handle gantt-resize-${position}`}
            onMouseDown={on_mouse_down}
        >
            <style>{`
                .gantt-resize-handle {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 8px;
                    cursor: ew-resize;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.15s;
                }
                .gantt-bar:hover .gantt-resize-handle {
                    opacity: 1;
                }
                .gantt-resize-handle::before {
                    content: '';
                    width: 3px;
                    height: 16px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 1px;
                }
                .gantt-resize-left {
                    left: 0;
                    border-radius: 4px 0 0 4px;
                }
                .gantt-resize-right {
                    right: 0;
                    border-radius: 0 4px 4px 0;
                }
            `}</style>
        </div>
    );
}

export default ResizeHandle;
