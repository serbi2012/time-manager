import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    haptic,
    setHapticsEnabled,
    isHapticsEnabled,
    HAPTIC_PATTERNS,
} from "@/shared/lib/haptic";

describe("haptic", () => {
    let vibrate_spy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vibrate_spy = vi.fn();
        Object.defineProperty(navigator, "vibrate", {
            value: vibrate_spy,
            configurable: true,
            writable: true,
        });
        setHapticsEnabled(true);
    });

    afterEach(() => {
        setHapticsEnabled(true);
    });

    it("기본값은 selection 패턴이다", () => {
        haptic();

        expect(vibrate_spy).toHaveBeenCalledWith(HAPTIC_PATTERNS.selection);
    });

    it("종류별로 다른 패턴을 사용한다", () => {
        haptic("success");
        expect(vibrate_spy).toHaveBeenCalledWith(HAPTIC_PATTERNS.success);

        haptic("warning");
        expect(vibrate_spy).toHaveBeenCalledWith(HAPTIC_PATTERNS.warning);
    });

    it("모든 패턴은 15ms 이상이다", () => {
        for (const pattern of Object.values(HAPTIC_PATTERNS)) {
            const durations = Array.isArray(pattern) ? pattern : [pattern];
            expect(Math.max(...durations)).toBeGreaterThanOrEqual(15);
        }
    });

    it("비활성화하면 호출하지 않는다", () => {
        setHapticsEnabled(false);

        haptic("impact");

        expect(vibrate_spy).not.toHaveBeenCalled();
        expect(isHapticsEnabled()).toBe(false);
    });

    it("Vibration API가 없는 환경에서도 예외가 나지 않는다", () => {
        Object.defineProperty(navigator, "vibrate", {
            value: undefined,
            configurable: true,
            writable: true,
        });

        expect(() => haptic("selection")).not.toThrow();
    });
});
