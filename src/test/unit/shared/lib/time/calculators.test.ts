/**
 * 시간 계산 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    timeToMinutes,
    minutesToTime,
    calculateMinutesDifference,
    timestampToMinutes,
} from "../../../../../shared/lib/time/calculators";

describe("timeToMinutes", () => {
    it("정상적인 시간 문자열을 분으로 변환", () => {
        expect(timeToMinutes("00:00")).toBe(0);
        expect(timeToMinutes("01:00")).toBe(60);
        expect(timeToMinutes("09:30")).toBe(570);
        expect(timeToMinutes("12:00")).toBe(720);
        expect(timeToMinutes("23:59")).toBe(1439);
    });

    it("잘못된 입력에 대해 0 반환", () => {
        expect(timeToMinutes("")).toBe(0);
        expect(timeToMinutes(null as unknown as string)).toBe(0);
        expect(timeToMinutes(undefined as unknown as string)).toBe(0);
    });

    it("부분적인 시간 문자열 처리", () => {
        expect(timeToMinutes("9:30")).toBe(570);
        expect(timeToMinutes("9:5")).toBe(545);
    });
});

describe("minutesToTime", () => {
    it("분을 HH:mm 형식으로 변환", () => {
        expect(minutesToTime(0)).toBe("00:00");
        expect(minutesToTime(60)).toBe("01:00");
        expect(minutesToTime(570)).toBe("09:30");
        expect(minutesToTime(720)).toBe("12:00");
        expect(minutesToTime(1439)).toBe("23:59");
    });

    it("잘못된 입력에 대해 00:00 반환", () => {
        expect(minutesToTime(NaN)).toBe("00:00");
        expect(minutesToTime(undefined as unknown as number)).toBe("00:00");
    });

    it("음수 값을 절대값으로 처리", () => {
        expect(minutesToTime(-60)).toBe("01:00");
    });
});

describe("calculateMinutesDifference", () => {
    it("두 시간의 차이를 분으로 계산", () => {
        expect(calculateMinutesDifference("09:00", "10:00")).toBe(60);
        expect(calculateMinutesDifference("09:30", "12:00")).toBe(150);
        expect(calculateMinutesDifference("00:00", "23:59")).toBe(1439);
    });

    it("음수 결과도 정상 반환", () => {
        expect(calculateMinutesDifference("10:00", "09:00")).toBe(-60);
    });
});

describe("timestampToMinutes", () => {
    it("타임스탬프에서 하루 중 분 추출", () => {
        // 2026-01-23 09:30:00
        const timestamp = new Date(2026, 0, 23, 9, 30, 0).getTime();
        expect(timestampToMinutes(timestamp)).toBe(570);
    });

    it("자정은 0분", () => {
        const midnight = new Date(2026, 0, 23, 0, 0, 0).getTime();
        expect(timestampToMinutes(midnight)).toBe(0);
    });
});
