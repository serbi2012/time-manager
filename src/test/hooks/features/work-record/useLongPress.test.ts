/**
 * useLongPress 훅 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLongPress } from "../../../../features/work-record/hooks/useLongPress";

describe("useLongPress", () => {
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
});
