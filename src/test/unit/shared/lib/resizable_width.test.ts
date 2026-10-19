import { describe, it, expect } from "vitest";
import { clampWidth, parseStoredWidth } from "@/shared/lib/resizable_width";

const BOUNDS = { min: 240, max: 560 };
const FALLBACK = 300;

describe("clampWidth", () => {
    it("범위 안의 값은 그대로 반환한다", () => {
        expect(clampWidth(400, BOUNDS)).toBe(400);
    });

    it("최솟값보다 작으면 최솟값을 반환한다", () => {
        expect(clampWidth(100, BOUNDS)).toBe(240);
    });

    it("최댓값보다 크면 최댓값을 반환한다", () => {
        expect(clampWidth(900, BOUNDS)).toBe(560);
    });

    it("소수는 반올림한다", () => {
        expect(clampWidth(320.6, BOUNDS)).toBe(321);
    });
});

describe("parseStoredWidth", () => {
    it("저장값이 없으면 기본값을 반환한다", () => {
        expect(parseStoredWidth(null, FALLBACK, BOUNDS)).toBe(FALLBACK);
    });

    it("빈 문자열이면 기본값을 반환한다", () => {
        expect(parseStoredWidth("  ", FALLBACK, BOUNDS)).toBe(FALLBACK);
    });

    it("숫자가 아니면 기본값을 반환한다", () => {
        expect(parseStoredWidth("wide", FALLBACK, BOUNDS)).toBe(FALLBACK);
    });

    it("유효한 숫자는 범위 안으로 보정해 반환한다", () => {
        expect(parseStoredWidth("420", FALLBACK, BOUNDS)).toBe(420);
        expect(parseStoredWidth("9999", FALLBACK, BOUNDS)).toBe(560);
        expect(parseStoredWidth("10", FALLBACK, BOUNDS)).toBe(240);
    });
});
