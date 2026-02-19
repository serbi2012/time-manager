/**
 * useSpotlight 커서 트래킹 훅 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpotlight } from "../../../shared/hooks/useSpotlight";

function createMouseEvent(clientX: number, clientY: number): React.MouseEvent {
    return { clientX, clientY } as React.MouseEvent;
}

describe("useSpotlight", () => {
    it("초기 상태에서 glow가 보이지 않는다", () => {
        const { result } = renderHook(() => useSpotlight());

        expect(result.current.glow_style.opacity).toBe(0);
    });

    it("mouseEnter 시 glow가 보인다", () => {
        const { result } = renderHook(() => useSpotlight());

        act(() => {
            result.current.handlers.onMouseEnter();
        });

        expect(result.current.glow_style.opacity).toBe(1);
    });

    it("mouseLeave 시 glow가 사라진다", () => {
        const { result } = renderHook(() => useSpotlight());

        act(() => {
            result.current.handlers.onMouseEnter();
        });
        act(() => {
            result.current.handlers.onMouseLeave();
        });

        expect(result.current.glow_style.opacity).toBe(0);
    });

    it("mouseMove 시 glow 위치가 커서를 따라간다", () => {
        const { result } = renderHook(() => useSpotlight());

        const mock_el = {
            getBoundingClientRect: () => ({
                left: 100,
                top: 200,
                width: 300,
                height: 40,
                right: 400,
                bottom: 240,
                x: 100,
                y: 200,
                toJSON: vi.fn(),
            }),
        } as unknown as HTMLDivElement;

        act(() => {
            result.current.ref(mock_el);
        });

        act(() => {
            result.current.handlers.onMouseEnter();
            result.current.handlers.onMouseMove(createMouseEvent(250, 220));
        });

        expect(result.current.glow_style.left).toBe(150);
        expect(result.current.glow_style.top).toBe(20);
        expect(result.current.glow_style.opacity).toBe(1);
    });

    it("ref가 null이면 mouseMove에서 아무 일도 안 일어난다", () => {
        const { result } = renderHook(() => useSpotlight());

        act(() => {
            result.current.handlers.onMouseMove(createMouseEvent(100, 100));
        });

        expect(result.current.glow_style.left).toBe(0);
        expect(result.current.glow_style.top).toBe(0);
    });

    it("ref 콜백으로 DOM 요소를 설정할 수 있다", () => {
        const { result } = renderHook(() => useSpotlight());

        expect(typeof result.current.ref).toBe("function");

        act(() => {
            result.current.ref(null);
        });
    });
});
