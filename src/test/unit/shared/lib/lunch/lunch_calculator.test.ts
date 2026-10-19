/**
 * 점심시간 계산 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    calculateDurationExcludingLunch,
    LUNCH_START_MINUTES,
    LUNCH_END_MINUTES,
    LUNCH_DURATION_MINUTES,
    type LunchTimeRange,
} from "@/shared/lib/lunch/lunch_calculator";

const CUSTOM_LUNCH: LunchTimeRange = { start: 720, end: 780, duration: 60 }; // 12:00~13:00

describe("calculateDurationExcludingLunch", () => {
    it("점심시간과 겹치지 않으면 전체 시간 반환", () => {
        // 09:00 ~ 10:00
        expect(calculateDurationExcludingLunch(540, 600)).toBe(60);
        // 13:00 ~ 14:00
        expect(calculateDurationExcludingLunch(780, 840)).toBe(60);
    });

    it("점심시간을 완전히 포함하면 60분 제외", () => {
        // 11:00 ~ 13:00 -> 11:00~11:40(40분) + 12:40~13:00(20분) = 60분
        expect(calculateDurationExcludingLunch(660, 780)).toBe(60);
    });

    it("점심시간에 완전히 포함되면 0분 반환", () => {
        // 11:50 ~ 12:30
        expect(calculateDurationExcludingLunch(710, 750)).toBe(0);
    });

    it("점심시간 시작 부분만 겹치면", () => {
        // 11:00 ~ 12:00 -> 11:00~11:40 = 40분
        expect(calculateDurationExcludingLunch(660, 720)).toBe(40);
    });

    it("점심시간 끝 부분만 겹치면", () => {
        // 12:00 ~ 13:00 -> 12:40~13:00 = 20분
        expect(calculateDurationExcludingLunch(720, 780)).toBe(20);
    });

    it("종료 시간이 시작 시간보다 빠르면 0 반환", () => {
        expect(calculateDurationExcludingLunch(600, 540)).toBe(0);
    });
});

describe("기본 점심시간 상수", () => {
    it("11:40~12:40, 60분이다", () => {
        expect(LUNCH_START_MINUTES).toBe(700);
        expect(LUNCH_END_MINUTES).toBe(760);
        expect(LUNCH_DURATION_MINUTES).toBe(60);
    });
});

describe("calculateDurationExcludingLunch 경계값", () => {
    it.each([
        ["점심 시작 시각에 끝남", 540, 700, 160],
        ["점심 종료 시각에 시작", 760, 900, 140],
        ["점심시간과 정확히 일치", 700, 760, 0],
        ["점심 시작부터 점심 중간까지", 700, 720, 0],
        ["점심 앞뒤로 10분씩 걸침", 690, 770, 20],
        ["하루 종일 (09:00~18:00)", 540, 1080, 480],
        ["시작과 종료가 같음", 600, 600, 0],
        ["점심 시작 1분 전부터", 699, 700, 1],
        ["점심 종료부터 1분", 760, 761, 1],
    ])("%s", (_label, start, end, expected) => {
        expect(calculateDurationExcludingLunch(start, end)).toBe(expected);
    });
});

describe("사용자 설정 점심시간 (LunchTimeRange)", () => {
    describe("calculateDurationExcludingLunch + 커스텀 점심시간", () => {
        it("커스텀 점심시간(12:00~13:00)을 기준으로 제외 계산", () => {
            // 11:00~14:00 → 커스텀 점심 12:00~13:00 제외 = 120분
            expect(calculateDurationExcludingLunch(660, 840, CUSTOM_LUNCH)).toBe(120);
        });

        it("기본 점심(11:40~12:40)과 커스텀 점심(12:00~13:00) 결과가 다름", () => {
            expect(calculateDurationExcludingLunch(660, 750)).toBe(40);
            expect(calculateDurationExcludingLunch(660, 750, CUSTOM_LUNCH)).toBe(60);
        });

        it("커스텀 점심시간에 완전히 포함되면 0분", () => {
            // 12:10~12:50은 커스텀 점심(12:00~13:00)에 포함
            expect(calculateDurationExcludingLunch(730, 770, CUSTOM_LUNCH)).toBe(0);
        });

        it("커스텀 점심시간 전에 끝나면 전체 시간", () => {
            // 10:00~11:00은 점심 전
            expect(calculateDurationExcludingLunch(600, 660, CUSTOM_LUNCH)).toBe(60);
        });

        it("커스텀 점심시간 후에 시작하면 전체 시간", () => {
            // 13:00~14:00은 점심 후
            expect(calculateDurationExcludingLunch(780, 840, CUSTOM_LUNCH)).toBe(60);
        });
    });
});
