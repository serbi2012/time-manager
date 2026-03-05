/**
 * 공유 useLongPress 훅 테스트 (shared 위치)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "../../../shared/hooks/useLongPress";

describe("useLongPress (shared)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("초기 상태에서 is_pressing은 false이고 press_progress는 0이다", () => {
        const on_long_press = vi.fn();
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: on_long_press })
        );

        expect(result.current.is_pressing).toBe(false);
        expect(result.current.press_progress).toBe(0);
    });

    it("handlers에 4개의 이벤트 핸들러가 포함된다", () => {
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: vi.fn() })
        );

        expect(result.current.handlers).toHaveProperty("onTouchStart");
        expect(result.current.handlers).toHaveProperty("onTouchEnd");
        expect(result.current.handlers).toHaveProperty("onTouchMove");
        expect(result.current.handlers).toHaveProperty("onContextMenu");
    });

    it("지정된 딜레이 후 onLongPress가 호출된다", () => {
        const on_long_press = vi.fn();
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: on_long_press, delay_ms: 300 })
        );

        const touch = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.handlers.onTouchStart(touch);
        });

        act(() => {
            vi.advanceTimersByTime(299);
        });
        expect(on_long_press).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(on_long_press).toHaveBeenCalledTimes(1);
    });

    it("touchEnd 시 타이머가 취소되어 콜백이 호출되지 않는다", () => {
        const on_long_press = vi.fn();
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: on_long_press })
        );

        const touch = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.handlers.onTouchStart(touch);
        });

        act(() => {
            vi.advanceTimersByTime(200);
        });

        act(() => {
            result.current.handlers.onTouchEnd();
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(on_long_press).not.toHaveBeenCalled();
    });

    it("이동 거리가 임계값을 초과하면 롱프레스가 취소된다", () => {
        const on_long_press = vi.fn();
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: on_long_press })
        );

        const start_touch = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.handlers.onTouchStart(start_touch);
        });

        const move_touch = {
            touches: [{ clientX: 115, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.handlers.onTouchMove(move_touch);
        });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(on_long_press).not.toHaveBeenCalled();
    });

    it("contextMenu 이벤트가 기본 동작을 방지한다", () => {
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: vi.fn() })
        );

        const prevent_default = vi.fn();
        const context_event = {
            preventDefault: prevent_default,
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handlers.onContextMenu(context_event);
        });

        expect(prevent_default).toHaveBeenCalled();
    });

    it("롱프레스 완료 후 is_pressing이 false로 돌아간다", () => {
        const on_long_press = vi.fn();
        const { result } = renderHook(() =>
            useLongPress({ onLongPress: on_long_press })
        );

        const touch = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.handlers.onTouchStart(touch);
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current.is_pressing).toBe(false);
        expect(on_long_press).toHaveBeenCalled();
    });
});
