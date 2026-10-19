/**
 * 시간 유효성 검사 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    isValidTimeFormat,
    isValidDateFormat,
} from "../../../../../shared/lib/time/validators";

describe("isValidTimeFormat", () => {
    it("유효한 HH:mm 형식 인식", () => {
        expect(isValidTimeFormat("00:00")).toBe(true);
        expect(isValidTimeFormat("09:30")).toBe(true);
        expect(isValidTimeFormat("23:59")).toBe(true);
    });

    it("잘못된 형식 거부", () => {
        expect(isValidTimeFormat("")).toBe(false);
        expect(isValidTimeFormat("9:30")).toBe(false); // 앞자리 패딩 필요
        expect(isValidTimeFormat("24:00")).toBe(false);
        expect(isValidTimeFormat("12:60")).toBe(false);
        expect(isValidTimeFormat("abc")).toBe(false);
    });
});

describe("isValidDateFormat", () => {
    it("유효한 YYYY-MM-DD 형식 인식", () => {
        expect(isValidDateFormat("2026-01-23")).toBe(true);
        expect(isValidDateFormat("2026-12-31")).toBe(true);
    });

    it("잘못된 형식 거부", () => {
        expect(isValidDateFormat("")).toBe(false);
        expect(isValidDateFormat("2026/01/23")).toBe(false);
        expect(isValidDateFormat("23-01-2026")).toBe(false);
        expect(isValidDateFormat("2026-13-01")).toBe(false); // 잘못된 월
    });
});
