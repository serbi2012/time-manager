/**
 * 시간 포맷팅 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    formatDuration,
    formatDurationAsTime,
    formatTimer,
    formatTimerWithSeconds,
    formatDateDisplay,
    formatDateShort,
} from "../../../../../shared/lib/time/formatters";

describe("formatDuration", () => {
    it("60분 미만은 분으로 표시", () => {
        expect(formatDuration(0)).toBe("0분");
        expect(formatDuration(30)).toBe("30분");
        expect(formatDuration(59)).toBe("59분");
    });

    it("정확히 시간 단위는 시간으로만 표시", () => {
        expect(formatDuration(60)).toBe("1시간");
        expect(formatDuration(120)).toBe("2시간");
    });

    it("시간+분은 함께 표시", () => {
        expect(formatDuration(90)).toBe("1시간 30분");
        expect(formatDuration(150)).toBe("2시간 30분");
    });

    it("잘못된 입력에 대해 0분 반환", () => {
        expect(formatDuration(-1)).toBe("0분");
        expect(formatDuration(NaN)).toBe("0분");
    });
});

describe("formatDurationAsTime", () => {
    it("분을 HH:mm 형식으로 변환", () => {
        expect(formatDurationAsTime(0)).toBe("00:00");
        expect(formatDurationAsTime(90)).toBe("01:30");
        expect(formatDurationAsTime(150)).toBe("02:30");
    });
});

describe("formatTimer", () => {
    it("초를 HH:MM 형식으로 변환", () => {
        expect(formatTimer(0)).toBe("00:00");
        expect(formatTimer(60)).toBe("00:01");
        expect(formatTimer(3600)).toBe("01:00");
        expect(formatTimer(3661)).toBe("01:01");
    });

    it("잘못된 입력에 대해 00:00 반환", () => {
        expect(formatTimer(-1)).toBe("00:00");
        expect(formatTimer(NaN)).toBe("00:00");
    });
});

describe("formatTimerWithSeconds", () => {
    it("초를 HH:MM:SS 형식으로 변환", () => {
        expect(formatTimerWithSeconds(0)).toBe("00:00:00");
        expect(formatTimerWithSeconds(61)).toBe("00:01:01");
        expect(formatTimerWithSeconds(3661)).toBe("01:01:01");
    });
});

describe("formatDateDisplay", () => {
    it("날짜를 표시용 형식으로 변환", () => {
        // 요일은 로케일에 따라 다를 수 있음
        const result = formatDateDisplay("2026-01-23");
        expect(result).toContain("1/23");
    });

    it("빈 문자열에 대해 빈 문자열 반환", () => {
        expect(formatDateDisplay("")).toBe("");
    });
});

describe("formatDateShort", () => {
    it("날짜를 간단한 형식으로 변환", () => {
        expect(formatDateShort("2026-01-23")).toBe("1/23");
        expect(formatDateShort("2026-12-01")).toBe("12/1");
    });
});
