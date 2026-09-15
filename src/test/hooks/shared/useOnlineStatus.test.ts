import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";

function setOnline(value: boolean) {
    Object.defineProperty(navigator, "onLine", {
        value,
        configurable: true,
        writable: true,
    });
}

describe("useOnlineStatus", () => {
    afterEach(() => {
        setOnline(true);
    });

    it("처음에는 navigator.onLine 값을 따른다", () => {
        setOnline(false);

        const { result } = renderHook(() => useOnlineStatus());

        expect(result.current).toBe(false);
    });

    it("offline 이벤트가 오면 false가 된다", () => {
        setOnline(true);
        const { result } = renderHook(() => useOnlineStatus());

        act(() => {
            window.dispatchEvent(new Event("offline"));
        });

        expect(result.current).toBe(false);
    });

    it("online 이벤트가 오면 다시 true가 된다", () => {
        setOnline(false);
        const { result } = renderHook(() => useOnlineStatus());

        act(() => {
            window.dispatchEvent(new Event("online"));
        });

        expect(result.current).toBe(true);
    });
});
