import { describe, it, expect } from "vitest";
import {
    calculateDurationExcludingLunch,
    isOverlappingWithLunch,
    calculateLunchOverlap,
    type LunchTimeRange,
} from "@/features/gantt-chart/lib/lunch_calculator";

describe("lunch_calculator", () => {
    const LUNCH_TIME: LunchTimeRange = {
        start: 720, // 12:00
        end: 780, // 13:00
        duration: 60,
    };

    describe("calculateDurationExcludingLunch", () => {
        it("점심시간 전에 끝나는 경우 전체 시간 반환", () => {
            // 09:00 - 11:00 (120분)
            const result = calculateDurationExcludingLunch(
                540,
                660,
                LUNCH_TIME
            );
            expect(result).toBe(120);
        });

        it("점심시간 후에 시작하는 경우 전체 시간 반환", () => {
            // 14:00 - 16:00 (120분)
            const result = calculateDurationExcludingLunch(
                840,
                960,
                LUNCH_TIME
            );
            expect(result).toBe(120);
        });

        it("점심시간 내에 완전히 포함되는 경우 0 반환", () => {
            // 12:15 - 12:45 (30분이지만 점심시간)
            const result = calculateDurationExcludingLunch(
                735,
                765,
                LUNCH_TIME
            );
            expect(result).toBe(0);
        });

        it("점심시간을 완전히 포함하는 경우 점심시간 제외", () => {
            // 10:00 - 15:00 (300분 - 60분 = 240분)
            const result = calculateDurationExcludingLunch(
                600,
                900,
                LUNCH_TIME
            );
            expect(result).toBe(240);
        });

        it("점심시간 시작 전부터 점심시간 중간까지", () => {
            // 11:00 - 12:30 (90분이지만 12:00까지만 = 60분)
            const result = calculateDurationExcludingLunch(
                660,
                750,
                LUNCH_TIME
            );
            expect(result).toBe(60);
        });

        it("점심시간 중간부터 점심시간 종료 후까지", () => {
            // 12:30 - 14:00 (90분이지만 13:00부터만 = 60분)
            const result = calculateDurationExcludingLunch(
                750,
                840,
                LUNCH_TIME
            );
            expect(result).toBe(60);
        });

        it("점심시간 정확히 시작 시간에 시작", () => {
            // 12:00 - 14:00 (120분이지만 13:00부터만 = 60분)
            const result = calculateDurationExcludingLunch(
                720,
                840,
                LUNCH_TIME
            );
            expect(result).toBe(60);
        });

        it("점심시간 정확히 종료 시간에 끝남", () => {
            // 11:00 - 13:00 (120분이지만 12:00까지만 = 60분)
            const result = calculateDurationExcludingLunch(
                660,
                780,
                LUNCH_TIME
            );
            expect(result).toBe(60);
        });
    });

    describe("isOverlappingWithLunch", () => {
        it("점심시간 전에 끝나면 false", () => {
            const result = isOverlappingWithLunch(540, 660, LUNCH_TIME);
            expect(result).toBe(false);
        });

        it("점심시간 후에 시작하면 false", () => {
            const result = isOverlappingWithLunch(840, 960, LUNCH_TIME);
            expect(result).toBe(false);
        });

        it("점심시간과 겹치면 true", () => {
            const result = isOverlappingWithLunch(660, 750, LUNCH_TIME);
            expect(result).toBe(true);
        });

        it("점심시간을 완전히 포함하면 true", () => {
            const result = isOverlappingWithLunch(600, 900, LUNCH_TIME);
            expect(result).toBe(true);
        });

        it("점심시간 내에 완전히 포함되면 true", () => {
            const result = isOverlappingWithLunch(735, 765, LUNCH_TIME);
            expect(result).toBe(true);
        });
    });

    describe("calculateLunchOverlap", () => {
        it("겹치지 않으면 null 반환", () => {
            const result = calculateLunchOverlap(540, 660, LUNCH_TIME);
            expect(result).toBeNull();
        });

        it("점심시간 시작 전부터 점심시간 중간까지 겹침", () => {
            // 11:00 - 12:30 => 12:00 - 12:30 겹침
            const result = calculateLunchOverlap(660, 750, LUNCH_TIME);
            expect(result).toEqual({ start: 720, end: 750 });
        });

        it("점심시간 중간부터 점심시간 종료 후까지 겹침", () => {
            // 12:30 - 14:00 => 12:30 - 13:00 겹침
            const result = calculateLunchOverlap(750, 840, LUNCH_TIME);
            expect(result).toEqual({ start: 750, end: 780 });
        });

        it("점심시간을 완전히 포함하면 점심시간 전체 반환", () => {
            // 10:00 - 15:00 => 12:00 - 13:00 겹침
            const result = calculateLunchOverlap(600, 900, LUNCH_TIME);
            expect(result).toEqual({ start: 720, end: 780 });
        });

        it("점심시간 내에 완전히 포함되면 해당 구간 반환", () => {
            // 12:15 - 12:45 => 12:15 - 12:45 겹침
            const result = calculateLunchOverlap(735, 765, LUNCH_TIME);
            expect(result).toEqual({ start: 735, end: 765 });
        });
    });
});
