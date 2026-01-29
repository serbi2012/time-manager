import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("초기값이 바로 반환됨", () => {
        const { result } = renderHook(() => useDebouncedValue("initial", 150));
        expect(result.current).toBe("initial");
    });

    it("값이 변경되면 딜레이 후에 업데이트됨", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebouncedValue(value, delay),
            { initialProps: { value: "initial", delay: 150 } }
        );

        expect(result.current).toBe("initial");

        // 값 변경
        rerender({ value: "updated", delay: 150 });

        // 아직 딜레이 전이므로 이전 값 유지
        expect(result.current).toBe("initial");

        // 딜레이 경과
        act(() => {
            vi.advanceTimersByTime(150);
        });

        // 이제 업데이트됨
        expect(result.current).toBe("updated");
    });

    it("딜레이 중 값이 다시 변경되면 타이머가 리셋됨", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebouncedValue(value, delay),
            { initialProps: { value: "initial", delay: 150 } }
        );

        // 첫 번째 변경
        rerender({ value: "first", delay: 150 });

        // 100ms 경과 (아직 딜레이 전)
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current).toBe("initial");

        // 두 번째 변경 (타이머 리셋)
        rerender({ value: "second", delay: 150 });

        // 100ms 더 경과 (총 200ms, 첫 번째 변경 기준으로는 150ms 초과)
        act(() => {
            vi.advanceTimersByTime(100);
        });
        // 타이머가 리셋되었으므로 아직 "initial"
        expect(result.current).toBe("initial");

        // 50ms 더 경과 (두 번째 변경 기준으로 150ms 도달)
        act(() => {
            vi.advanceTimersByTime(50);
        });
        expect(result.current).toBe("second");
    });

    it("기본 딜레이는 150ms", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value),
            { initialProps: { value: "initial" } }
        );

        rerender({ value: "updated" });

        // 149ms에서는 아직 업데이트 안됨
        act(() => {
            vi.advanceTimersByTime(149);
        });
        expect(result.current).toBe("initial");

        // 1ms 더 지나면 업데이트
        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe("updated");
    });

    it("다양한 타입의 값을 처리함", () => {
        // 숫자
        const { result: numResult, rerender: numRerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 100),
            { initialProps: { value: 0 } }
        );
        numRerender({ value: 42 });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(numResult.current).toBe(42);

        // 객체
        const initial_obj = { a: 1 };
        const updated_obj = { a: 2 };
        const { result: objResult, rerender: objRerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 100),
            { initialProps: { value: initial_obj } }
        );
        objRerender({ value: updated_obj });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(objResult.current).toBe(updated_obj);
    });

    it("컴포넌트 언마운트 시 타이머가 정리됨", () => {
        const { rerender, unmount } = renderHook(
            ({ value }) => useDebouncedValue(value, 150),
            { initialProps: { value: "initial" } }
        );

        rerender({ value: "updated" });

        // 언마운트
        unmount();

        // 타이머 경과해도 에러 없음 (타이머가 정리됨)
        expect(() => {
            act(() => {
                vi.advanceTimersByTime(200);
            });
        }).not.toThrow();
    });
});
