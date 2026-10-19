import { describe, it, expect } from "vitest";
import {
    isSameDate,
    isDateBefore,
    isDateAfter,
    isDateInRange,
} from "@/shared/lib/time/date_utils";

const BASE_DATE = "2026-01-19";
const PREVIOUS_DATE = "2026-01-18";
const NEXT_DATE = "2026-01-20";
const RANGE_START = "2026-01-15";
const RANGE_END = "2026-01-25";

describe("isSameDate", () => {
    it("같은 날짜면 true, 다르면 false", () => {
        expect(isSameDate(BASE_DATE, BASE_DATE)).toBe(true);
        expect(isSameDate(BASE_DATE, NEXT_DATE)).toBe(false);
    });
});

describe("isDateBefore", () => {
    it("첫 번째 날짜가 이전일 때만 true", () => {
        expect(isDateBefore(PREVIOUS_DATE, BASE_DATE)).toBe(true);
        expect(isDateBefore(BASE_DATE, BASE_DATE)).toBe(false);
        expect(isDateBefore(NEXT_DATE, BASE_DATE)).toBe(false);
    });
});

describe("isDateAfter", () => {
    it("첫 번째 날짜가 이후일 때만 true", () => {
        expect(isDateAfter(NEXT_DATE, BASE_DATE)).toBe(true);
        expect(isDateAfter(BASE_DATE, BASE_DATE)).toBe(false);
        expect(isDateAfter(PREVIOUS_DATE, BASE_DATE)).toBe(false);
    });
});

describe("isDateInRange", () => {
    it.each([
        [BASE_DATE, true],
        [RANGE_START, true],
        [RANGE_END, true],
        ["2026-01-10", false],
        ["2026-01-30", false],
    ])("%s → %s", (date, expected) => {
        expect(isDateInRange(date, RANGE_START, RANGE_END)).toBe(expected);
    });
});
