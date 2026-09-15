/**
 * useSwipeNavigation 훅 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useSwipeNavigation } from "@/shared/hooks/useSwipeNavigation";

function touchEvent(x: number, y: number) {
    return {
        touches: [{ clientX: x, clientY: y }],
    } as unknown as React.TouchEvent;
}

function setup(enabled = true) {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
        useSwipeNavigation({ onSwipeLeft, onSwipeRight, enabled })
    );

    const swipe = (dx: number, dy: number) => {
        act(() => {
            result.current.handlers.onTouchStart(touchEvent(200, 300));
        });
        act(() => {
            result.current.handlers.onTouchMove(touchEvent(200 + dx, 300 + dy));
        });
        act(() => {
            result.current.handlers.onTouchEnd();
        });
    };

    return { onSwipeLeft, onSwipeRight, swipe };
}

describe("useSwipeNavigation", () => {
    it("왼쪽으로 충분히 밀면 다음으로 이동한다", () => {
        const { onSwipeLeft, onSwipeRight, swipe } = setup();

        swipe(-120, 0);

        expect(onSwipeLeft).toHaveBeenCalledTimes(1);
        expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it("오른쪽으로 충분히 밀면 이전으로 이동한다", () => {
        const { onSwipeLeft, onSwipeRight, swipe } = setup();

        swipe(120, 0);

        expect(onSwipeRight).toHaveBeenCalledTimes(1);
        expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it("이동 거리가 짧으면 아무 일도 없다", () => {
        const { onSwipeLeft, onSwipeRight, swipe } = setup();

        swipe(-40, 0);

        expect(onSwipeLeft).not.toHaveBeenCalled();
        expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it("세로로 더 많이 움직이면 세로 스크롤로 보고 무시한다", () => {
        const { onSwipeLeft, onSwipeRight, swipe } = setup();

        swipe(-120, 200);

        expect(onSwipeLeft).not.toHaveBeenCalled();
        expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it("enabled=false면 동작하지 않는다", () => {
        const { onSwipeLeft, onSwipeRight, swipe } = setup(false);

        swipe(-150, 0);

        expect(onSwipeLeft).not.toHaveBeenCalled();
        expect(onSwipeRight).not.toHaveBeenCalled();
    });
});
