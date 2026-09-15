/**
 * UndoToast 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { UndoToast } from "@/shared/ui/mobile";
import { UNDO_LABELS } from "@/shared/constants";

const MESSAGE = "작업을 삭제했어요";

describe("UndoToast", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("open=false면 렌더하지 않는다", () => {
        render(
            <UndoToast
                open={false}
                message={MESSAGE}
                onUndo={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
    });

    it("메시지와 되돌리기 버튼을 표시한다", () => {
        render(
            <UndoToast
                open={true}
                message={MESSAGE}
                onUndo={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText(MESSAGE)).toBeInTheDocument();
        expect(screen.getByText(UNDO_LABELS.undo)).toBeInTheDocument();
    });

    it("되돌리기를 누르면 onUndo와 onClose가 호출된다", () => {
        const onUndo = vi.fn();
        const onClose = vi.fn();

        render(
            <UndoToast
                open={true}
                message={MESSAGE}
                onUndo={onUndo}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByText(UNDO_LABELS.undo));

        expect(onUndo).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("시간이 지나면 자동으로 닫힌다", () => {
        const onClose = vi.fn();

        render(
            <UndoToast
                open={true}
                message={MESSAGE}
                onUndo={vi.fn()}
                onClose={onClose}
                duration_ms={3000}
            />
        );

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
