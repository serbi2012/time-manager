import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResizableWidth } from "@/shared/hooks/useResizableWidth";

const STORAGE_KEY = "test-sidebar-width";
const OPTIONS = {
    storage_key: STORAGE_KEY,
    default_width: 300,
    min_width: 240,
    max_width: 560,
};

function createPointerEvent(client_x: number, button = 0) {
    const target = {
        setPointerCapture: vi.fn(),
        hasPointerCapture: vi.fn(() => true),
        releasePointerCapture: vi.fn(),
    };
    return {
        button,
        clientX: client_x,
        pointerId: 1,
        preventDefault: vi.fn(),
        currentTarget: target,
    } as unknown as React.PointerEvent<HTMLElement>;
}

function dragHandle(
    handle_props: ReturnType<typeof useResizableWidth>["handle_props"],
    from_x: number,
    to_x: number
) {
    act(() => handle_props.onPointerDown(createPointerEvent(from_x)));
    act(() => handle_props.onPointerMove(createPointerEvent(to_x)));
    act(() => handle_props.onPointerUp(createPointerEvent(to_x)));
}

describe("useResizableWidth", () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.style.cursor = "";
    });

    it("저장값이 없으면 기본 너비로 시작한다", () => {
        const { result } = renderHook(() => useResizableWidth(OPTIONS));
        expect(result.current.width).toBe(300);
    });

    it("저장된 너비로 시작한다", () => {
        localStorage.setItem(STORAGE_KEY, "420");
        const { result } = renderHook(() => useResizableWidth(OPTIONS));
        expect(result.current.width).toBe(420);
    });

    it("드래그한 만큼 너비가 바뀌고 저장된다", () => {
        const { result } = renderHook(() => useResizableWidth(OPTIONS));

        dragHandle(result.current.handle_props, 300, 380);

        expect(result.current.width).toBe(380);
        expect(localStorage.getItem(STORAGE_KEY)).toBe("380");
    });

    it("최소·최대 범위를 넘지 않는다", () => {
        const { result } = renderHook(() => useResizableWidth(OPTIONS));

        dragHandle(result.current.handle_props, 300, 1000);
        expect(result.current.width).toBe(560);

        dragHandle(result.current.handle_props, 560, 0);
        expect(result.current.width).toBe(240);
    });

    it("드래그 중에는 is_resizing이 true이고 커서가 바뀐다", () => {
        const { result } = renderHook(() => useResizableWidth(OPTIONS));

        act(() =>
            result.current.handle_props.onPointerDown(createPointerEvent(300))
        );
        expect(result.current.is_resizing).toBe(true);
        expect(document.body.style.cursor).toBe("col-resize");

        act(() =>
            result.current.handle_props.onPointerUp(createPointerEvent(300))
        );
        expect(result.current.is_resizing).toBe(false);
        expect(document.body.style.cursor).toBe("");
    });

    it("마우스 왼쪽 버튼이 아니면 드래그를 시작하지 않는다", () => {
        const { result } = renderHook(() => useResizableWidth(OPTIONS));

        act(() =>
            result.current.handle_props.onPointerDown(createPointerEvent(300, 2))
        );
        act(() =>
            result.current.handle_props.onPointerMove(createPointerEvent(400))
        );

        expect(result.current.is_resizing).toBe(false);
        expect(result.current.width).toBe(300);
    });

    it("더블클릭하면 기본 너비로 돌아가고 저장값을 지운다", () => {
        localStorage.setItem(STORAGE_KEY, "450");
        const { result } = renderHook(() => useResizableWidth(OPTIONS));

        act(() => result.current.handle_props.onDoubleClick());

        expect(result.current.width).toBe(300);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});
