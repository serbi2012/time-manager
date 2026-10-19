/**
 * 시간 계산 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    timeToMinutes,
    minutesToTime,
    getEffectiveEndMinutes,
} from "@/shared/lib/time/calculators";

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
        expect(timeToMinutes("invalid")).toBe(0);
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

    it("한 자리 수는 0으로 채운다", () => {
        expect(minutesToTime(5)).toBe("00:05");
        expect(minutesToTime(65)).toBe("01:05");
    });

    it.each(["00:00", "09:00", "11:40", "12:40", "15:30", "23:59"])(
        "%s는 timeToMinutes와 왕복 변환해도 같다",
        (time) => {
            expect(minutesToTime(timeToMinutes(time))).toBe(time);
        }
    );
});

describe("getEffectiveEndMinutes", () => {
    it("is_overnight가 false/undefined이면 일반 변환", () => {
        expect(getEffectiveEndMinutes("18:00")).toBe(1080);
        expect(getEffectiveEndMinutes("18:00", false)).toBe(1080);
        expect(getEffectiveEndMinutes("18:00", undefined)).toBe(1080);
    });

    it("is_overnight가 true이면 +1440 적용", () => {
        expect(getEffectiveEndMinutes("02:24", true)).toBe(144 + 1440);
        expect(getEffectiveEndMinutes("00:00", true)).toBe(1440);
        expect(getEffectiveEndMinutes("03:00", true)).toBe(180 + 1440);
    });

    it("is_overnight가 true여도 늦은 시간(18:00)에 +1440 적용", () => {
        expect(getEffectiveEndMinutes("18:00", true)).toBe(1080 + 1440);
    });
});
