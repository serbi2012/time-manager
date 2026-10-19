import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHoverIntent } from "@/shared/hooks/useHoverIntent";

const DELAY_MS = 500;

describe("useHoverIntent", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("지연 시간이 지나기 전에는 hover 상태가 아니다", () => {
        const { result } = renderHook(() => useHoverIntent(DELAY_MS));

        act(() => {
            result.current.hover_handlers.onMouseEnter();
            vi.advanceTimersByTime(DELAY_MS - 1);
        });

        expect(result.current.is_hovering).toBe(false);
    });

    it("지연 시간이 지나면 hover 상태가 된다", () => {
        const { result } = renderHook(() => useHoverIntent(DELAY_MS));

        act(() => {
            result.current.hover_handlers.onMouseEnter();
            vi.advanceTimersByTime(DELAY_MS);
        });

        expect(result.current.is_hovering).toBe(true);
    });

    it("지연 중에 마우스가 나가면 hover 상태가 되지 않는다", () => {
        const { result } = renderHook(() => useHoverIntent(DELAY_MS));

        act(() => {
            result.current.hover_handlers.onMouseEnter();
            vi.advanceTimersByTime(DELAY_MS / 2);
            result.current.hover_handlers.onMouseLeave();
            vi.advanceTimersByTime(DELAY_MS);
        });

        expect(result.current.is_hovering).toBe(false);
    });

    it("hover 상태에서 마우스가 나가면 즉시 해제된다", () => {
        const { result } = renderHook(() => useHoverIntent(DELAY_MS));

        act(() => {
            result.current.hover_handlers.onMouseEnter();
            vi.advanceTimersByTime(DELAY_MS);
        });
        act(() => {
            result.current.hover_handlers.onMouseLeave();
        });

        expect(result.current.is_hovering).toBe(false);
    });
});
