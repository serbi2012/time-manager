/**
 * 시간 유효성 검사 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    isValidTimeFormat,
    isValidTimeFormatLoose,
    isValidDateFormat,
    isStartBeforeEnd,
    doTimeRangesOverlap,
    isToday,
    isFutureDate,
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

describe("isValidTimeFormatLoose", () => {
    it("느슨한 시간 형식 허용", () => {
        expect(isValidTimeFormatLoose("9:30")).toBe(true);
        expect(isValidTimeFormatLoose("09:30")).toBe(true);
    });

    it("잘못된 형식 거부", () => {
        expect(isValidTimeFormatLoose("24:00")).toBe(false);
        expect(isValidTimeFormatLoose("12:60")).toBe(false);
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

describe("isStartBeforeEnd", () => {
    it("시작이 종료보다 이전인 경우 true", () => {
        expect(isStartBeforeEnd("09:00", "10:00")).toBe(true);
        expect(isStartBeforeEnd("09:00", "09:01")).toBe(true);
    });

    it("시작이 종료보다 같거나 이후인 경우 false", () => {
        expect(isStartBeforeEnd("10:00", "09:00")).toBe(false);
        expect(isStartBeforeEnd("10:00", "10:00")).toBe(false);
    });

    it("잘못된 입력에 대해 false", () => {
        expect(isStartBeforeEnd("", "10:00")).toBe(false);
        expect(isStartBeforeEnd("09:00", "")).toBe(false);
    });
});

describe("doTimeRangesOverlap", () => {
    it("겹치는 범위 감지", () => {
        expect(doTimeRangesOverlap(
            { start: 0, end: 60 },
            { start: 30, end: 90 }
        )).toBe(true);
        
        expect(doTimeRangesOverlap(
            { start: 0, end: 60 },
            { start: 0, end: 30 }
        )).toBe(true);
    });

    it("겹치지 않는 범위", () => {
        expect(doTimeRangesOverlap(
            { start: 0, end: 60 },
            { start: 60, end: 120 }
        )).toBe(false);
        
        expect(doTimeRangesOverlap(
            { start: 0, end: 60 },
            { start: 120, end: 180 }
        )).toBe(false);
    });
});

describe("isToday", () => {
    it("오늘 날짜 확인", () => {
        const today = new Date();
        const today_str = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        expect(isToday(today_str)).toBe(true);
    });

    it("다른 날짜는 false", () => {
        expect(isToday("2020-01-01")).toBe(false);
    });
});

describe("isFutureDate", () => {
    it("미래 날짜 감지", () => {
        expect(isFutureDate("2099-12-31")).toBe(true);
    });

    it("과거/오늘 날짜는 false", () => {
        expect(isFutureDate("2020-01-01")).toBe(false);
    });
});
