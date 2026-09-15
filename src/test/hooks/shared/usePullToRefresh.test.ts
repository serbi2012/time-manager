/**
 * usePullToRefresh 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { usePullToRefresh } from "@/shared/hooks/usePullToRefresh";

function touchEvent(y: number) {
    return {
        touches: [{ clientX: 100, clientY: y }],
    } as unknown as React.TouchEvent;
}

function setScrollY(value: number) {
    Object.defineProperty(window, "scrollY", {
        value,
        configurable: true,
        writable: true,
    });
}

describe("usePullToRefresh", () => {
    beforeEach(() => {
        setScrollY(0);
    });

    it("당긴 거리를 돌려준다", () => {
        const { result } = renderHook(() =>
            usePullToRefresh({ onRefresh: vi.fn() })
        );

        act(() => {
            result.current.handlers.onTouchStart(touchEvent(100));
        });
        act(() => {
            result.current.handlers.onTouchMove(touchEvent(150));
        });

        expect(result.current.pull_distance).toBeGreaterThan(0);
    });

    it("임계값을 넘으면 놓았을 때 새로고침한다", async () => {
        const onRefresh = vi.fn();
        const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

        act(() => {
            result.current.handlers.onTouchStart(touchEvent(100));
        });
        act(() => {
            result.current.handlers.onTouchMove(touchEvent(220));
        });

        expect(result.current.is_ready).toBe(true);

        await act(async () => {
            result.current.handlers.onTouchEnd();
        });

        expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it("조금만 당기면 새로고침하지 않는다", async () => {
        const onRefresh = vi.fn();
        const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

        act(() => {
            result.current.handlers.onTouchStart(touchEvent(100));
        });
        act(() => {
            result.current.handlers.onTouchMove(touchEvent(130));
        });
        await act(async () => {
            result.current.handlers.onTouchEnd();
        });

        expect(onRefresh).not.toHaveBeenCalled();
    });

    it("스크롤이 맨 위가 아니면 당김을 시작하지 않는다", () => {
        setScrollY(200);

        const { result } = renderHook(() =>
            usePullToRefresh({ onRefresh: vi.fn() })
        );

        act(() => {
            result.current.handlers.onTouchStart(touchEvent(100));
        });
        act(() => {
            result.current.handlers.onTouchMove(touchEvent(220));
        });

        expect(result.current.pull_distance).toBe(0);
    });

    it("enabled=false면 동작하지 않는다", () => {
        const { result } = renderHook(() =>
            usePullToRefresh({ onRefresh: vi.fn(), enabled: false })
        );

        act(() => {
            result.current.handlers.onTouchStart(touchEvent(100));
        });
        act(() => {
            result.current.handlers.onTouchMove(touchEvent(220));
        });

        expect(result.current.pull_distance).toBe(0);
    });
});
