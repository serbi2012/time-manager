/**
 * useLongPress 훅 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "../../../../features/work-record/hooks/useLongPress";

describe("useLongPress", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("초기 상태에서 is_pressing은 false이다", () => {
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress }));

        expect(result.current.is_pressing).toBe(false);
    });

    it("handlers 객체가 onTouchStart, onTouchEnd, onTouchMove, onContextMenu를 포함한다", () => {
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress }));

        const handlers = result.current.handlers;

        expect(handlers).toHaveProperty("onTouchStart");
        expect(handlers).toHaveProperty("onTouchEnd");
        expect(handlers).toHaveProperty("onTouchMove");
        expect(handlers).toHaveProperty("onContextMenu");

        expect(typeof handlers.onTouchStart).toBe("function");
        expect(typeof handlers.onTouchEnd).toBe("function");
        expect(typeof handlers.onTouchMove).toBe("function");
        expect(typeof handlers.onContextMenu).toBe("function");
    });

    it("롱프레스 완료 시 navigator.vibrate가 호출된다", () => {
        const vibrate_mock = vi.fn();
        Object.defineProperty(navigator, "vibrate", {
            value: vibrate_mock,
            writable: true,
            configurable: true,
        });

        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress }));

        const touch_event = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.handlers.onTouchStart(touch_event);
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(vibrate_mock).toHaveBeenCalledWith(10);
        expect(onLongPress).toHaveBeenCalled();
    });
});
