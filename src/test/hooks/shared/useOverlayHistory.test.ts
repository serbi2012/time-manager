/**
 * useOverlayHistory 훅 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useOverlayHistory } from "@/shared/hooks/useOverlayHistory";

describe("useOverlayHistory", () => {
    let push_spy: ReturnType<typeof vi.spyOn>;
    let back_spy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        push_spy = vi.spyOn(window.history, "pushState");
        back_spy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    });

    afterEach(() => {
        push_spy.mockRestore();
        back_spy.mockRestore();
    });

    it("열리면 히스토리 항목을 하나 쌓는다", () => {
        renderHook(() => useOverlayHistory({ open: true, onClose: vi.fn() }));

        expect(push_spy).toHaveBeenCalledTimes(1);
    });

    it("닫혀 있으면 히스토리를 건드리지 않는다", () => {
        renderHook(() => useOverlayHistory({ open: false, onClose: vi.fn() }));

        expect(push_spy).not.toHaveBeenCalled();
    });

    it("뒤로가기가 발생하면 onClose가 호출된다", () => {
        const onClose = vi.fn();
        renderHook(() => useOverlayHistory({ open: true, onClose }));

        act(() => {
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("뒤로가기로 닫힌 뒤에는 history.back을 다시 호출하지 않는다", () => {
        const onClose = vi.fn();
        const { unmount } = renderHook(() =>
            useOverlayHistory({ open: true, onClose })
        );

        act(() => {
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        unmount();

        expect(back_spy).not.toHaveBeenCalled();
    });

    it("코드로 닫으면 쌓아 둔 히스토리 항목을 되돌린다", () => {
        const { unmount } = renderHook(() =>
            useOverlayHistory({ open: true, onClose: vi.fn() })
        );

        unmount();

        expect(back_spy).toHaveBeenCalledTimes(1);
    });

    it("enabled=false면 히스토리를 사용하지 않는다", () => {
        renderHook(() =>
            useOverlayHistory({
                open: true,
                onClose: vi.fn(),
                enabled: false,
            })
        );

        expect(push_spy).not.toHaveBeenCalled();
    });
});
