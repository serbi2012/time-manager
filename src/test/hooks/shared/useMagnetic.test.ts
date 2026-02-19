/**
 * useMagnetic 커서 트래킹 훅 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMagnetic } from "../../../shared/hooks/useMagnetic";

function createMouseEvent(clientX: number, clientY: number): React.MouseEvent {
    return { clientX, clientY } as React.MouseEvent;
}

function createMockElement(cx: number, cy: number, width = 36, height = 36) {
    return {
        getBoundingClientRect: () => ({
            left: cx - width / 2,
            top: cy - height / 2,
            width,
            height,
            right: cx + width / 2,
            bottom: cy + height / 2,
            x: cx - width / 2,
            y: cy - height / 2,
            toJSON: vi.fn(),
        }),
    } as unknown as HTMLDivElement;
}

describe("useMagnetic", () => {
    it("초기 상태에서 스타일이 비어있다", () => {
        const { result } = renderHook(() => useMagnetic<HTMLDivElement>());

        expect(result.current.style).toEqual({});
    });

    it("mouseMove 시 커서 방향으로 translate가 적용된다", () => {
        const strength = 0.15;
        const { result } = renderHook(() =>
            useMagnetic<HTMLDivElement>(strength)
        );

        const el = createMockElement(200, 200);
        act(() => {
            result.current.ref(el as HTMLDivElement);
        });

        act(() => {
            result.current.handlers.onMouseMove(createMouseEvent(210, 205));
        });

        const dx = (210 - 200) * strength;
        const dy = (205 - 200) * strength;
        expect(result.current.style.transform).toBe(
            `translate(${dx}px, ${dy}px)`
        );
        expect(result.current.style.transition).toBe("none");
    });

    it("mouseLeave 시 원래 위치로 스프링 복귀한다", () => {
        const { result } = renderHook(() => useMagnetic<HTMLDivElement>(0.15));

        const el = createMockElement(200, 200);
        act(() => {
            result.current.ref(el as HTMLDivElement);
        });
        act(() => {
            result.current.handlers.onMouseMove(createMouseEvent(220, 210));
        });
        act(() => {
            result.current.handlers.onMouseLeave();
        });

        expect(result.current.style.transform).toBe("translate(0, 0)");
        expect(result.current.style.transition).toContain("cubic-bezier");
    });

    it("strength 값에 따라 이동량이 비례한다", () => {
        const weak = renderHook(() => useMagnetic<HTMLDivElement>(0.1));
        const strong = renderHook(() => useMagnetic<HTMLDivElement>(0.5));

        const el = createMockElement(100, 100);
        act(() => {
            weak.result.current.ref(el as HTMLDivElement);
            strong.result.current.ref(el as HTMLDivElement);
        });

        act(() => {
            weak.result.current.handlers.onMouseMove(
                createMouseEvent(120, 100)
            );
            strong.result.current.handlers.onMouseMove(
                createMouseEvent(120, 100)
            );
        });

        const weak_dx = parseFloat(
            weak.result.current.style
                .transform!.toString()
                .match(/translate\(([\d.]+)px/)![1]
        );
        const strong_dx = parseFloat(
            strong.result.current.style
                .transform!.toString()
                .match(/translate\(([\d.]+)px/)![1]
        );

        expect(strong_dx).toBeGreaterThan(weak_dx);
        expect(strong_dx / weak_dx).toBeCloseTo(0.5 / 0.1, 1);
    });

    it("ref가 null이면 mouseMove에서 아무 일도 안 일어난다", () => {
        const { result } = renderHook(() => useMagnetic<HTMLDivElement>(0.15));

        act(() => {
            result.current.handlers.onMouseMove(createMouseEvent(100, 100));
        });

        expect(result.current.style).toEqual({});
    });

    it("ref 콜백으로 DOM 요소를 설정할 수 있다", () => {
        const { result } = renderHook(() => useMagnetic<HTMLDivElement>());

        expect(typeof result.current.ref).toBe("function");
    });
});
