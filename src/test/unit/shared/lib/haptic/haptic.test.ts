/**
 * triggerHaptic 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { triggerHaptic } from "../../../../../shared/lib/haptic";

describe("triggerHaptic", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("navigator.vibrate가 있으면 기본 10ms로 호출한다", () => {
        const vibrate_mock = vi.fn();
        Object.defineProperty(navigator, "vibrate", {
            value: vibrate_mock,
            writable: true,
            configurable: true,
        });

        triggerHaptic();

        expect(vibrate_mock).toHaveBeenCalledWith(10);
    });

    it("커스텀 duration_ms를 전달할 수 있다", () => {
        const vibrate_mock = vi.fn();
        Object.defineProperty(navigator, "vibrate", {
            value: vibrate_mock,
            writable: true,
            configurable: true,
        });

        triggerHaptic(50);

        expect(vibrate_mock).toHaveBeenCalledWith(50);
    });

    it("navigator.vibrate가 없으면 에러 없이 무시된다", () => {
        Object.defineProperty(navigator, "vibrate", {
            value: undefined,
            writable: true,
            configurable: true,
        });

        expect(() => triggerHaptic()).not.toThrow();
    });
});
