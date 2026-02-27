/**
 * 점심시간 계산 함수 유닛 테스트
 */

import { describe, it, expect } from "vitest";
import {
    LUNCH_START_MINUTES,
    LUNCH_END_MINUTES,
    calculateDurationExcludingLunch,
    isInLunchTime,
    overlapsWithLunchTime,
    getLunchOverlapMinutes,
    adjustForLunchTime,
    type LunchTimeRange,
} from "../../../../../shared/lib/lunch/lunch_calculator";

const CUSTOM_LUNCH: LunchTimeRange = { start: 720, end: 780, duration: 60 }; // 12:00~13:00

describe("점심시간 상수", () => {
    it("점심시간은 11:40 ~ 12:40", () => {
        expect(LUNCH_START_MINUTES).toBe(11 * 60 + 40); // 700
        expect(LUNCH_END_MINUTES).toBe(12 * 60 + 40);   // 760
    });
});

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

describe("isInLunchTime", () => {
    it("점심시간 내 시간 확인", () => {
        expect(isInLunchTime(700)).toBe(true);  // 11:40
        expect(isInLunchTime(720)).toBe(true);  // 12:00
        expect(isInLunchTime(759)).toBe(true);  // 12:39
    });

    it("점심시간 외 시간", () => {
        expect(isInLunchTime(699)).toBe(false); // 11:39
        expect(isInLunchTime(760)).toBe(false); // 12:40 (종료 시간은 제외)
    });
});

describe("overlapsWithLunchTime", () => {
    it("점심시간과 겹치는 범위 감지", () => {
        expect(overlapsWithLunchTime(660, 720)).toBe(true);  // 11:00~12:00
        expect(overlapsWithLunchTime(720, 780)).toBe(true);  // 12:00~13:00
        expect(overlapsWithLunchTime(660, 780)).toBe(true);  // 11:00~13:00
    });

    it("점심시간과 겹치지 않는 범위", () => {
        expect(overlapsWithLunchTime(540, 600)).toBe(false); // 09:00~10:00
        expect(overlapsWithLunchTime(780, 840)).toBe(false); // 13:00~14:00
    });
});

describe("getLunchOverlapMinutes", () => {
    it("겹치는 시간 계산", () => {
        // 11:00 ~ 12:00 -> 점심과 20분 겹침 (11:40~12:00)
        expect(getLunchOverlapMinutes(660, 720)).toBe(20);
        
        // 11:00 ~ 13:00 -> 점심과 60분 겹침
        expect(getLunchOverlapMinutes(660, 780)).toBe(60);
    });

    it("겹치지 않으면 0", () => {
        expect(getLunchOverlapMinutes(540, 600)).toBe(0);
    });
});

describe("adjustForLunchTime", () => {
    it("점심시간 중이면 점심 종료 후로 조정", () => {
        expect(adjustForLunchTime(720)).toBe(760);  // 12:00 -> 12:40
        expect(adjustForLunchTime(700)).toBe(760);  // 11:40 -> 12:40
    });

    it("점심시간 외면 그대로 반환", () => {
        expect(adjustForLunchTime(600)).toBe(600);  // 10:00
        expect(adjustForLunchTime(780)).toBe(780);  // 13:00
    });
});

describe("사용자 설정 점심시간 (LunchTimeRange)", () => {
    describe("calculateDurationExcludingLunch + 커스텀 점심시간", () => {
        it("커스텀 점심시간(12:00~13:00)을 기준으로 제외 계산", () => {
            // 11:00~14:00 → 커스텀 점심 12:00~13:00 제외 = 120분
            expect(calculateDurationExcludingLunch(660, 840, CUSTOM_LUNCH)).toBe(120);
        });

        it("기본 점심(11:40~12:40)과 커스텀 점심(12:00~13:00) 결과가 다름", () => {
            // 11:00~13:00
            const default_result = calculateDurationExcludingLunch(660, 780);
            const custom_result = calculateDurationExcludingLunch(660, 780, CUSTOM_LUNCH);
            // 기본: 11:00~11:40(40) + 12:40~13:00(20) = 60분
            expect(default_result).toBe(60);
            // 커스텀: 11:00~12:00(60) = 60분 (13:00에서 끝나므로 12:00~13:00 제외)
            expect(custom_result).toBe(60);

            // 11:30~13:30
            const default_2 = calculateDurationExcludingLunch(690, 810);
            const custom_2 = calculateDurationExcludingLunch(690, 810, CUSTOM_LUNCH);
            // 기본: 11:30~11:40(10) + 12:40~13:30(50) = 60분
            expect(default_2).toBe(60);
            // 커스텀: 11:30~12:00(30) + 13:00~13:30(30) = 60분
            expect(custom_2).toBe(60);
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

        it("미전달 시 기본값(11:40~12:40)을 사용", () => {
            const with_default = calculateDurationExcludingLunch(660, 780);
            const with_undefined = calculateDurationExcludingLunch(660, 780, undefined);
            expect(with_default).toBe(with_undefined);
        });
    });

    describe("isInLunchTime + 커스텀 점심시간", () => {
        it("커스텀 점심(12:00~13:00) 기준으로 판단", () => {
            // 12:00은 커스텀 점심 내
            expect(isInLunchTime(720, CUSTOM_LUNCH)).toBe(true);
            // 11:40은 기본 점심시간 내이지만 커스텀에는 아님
            expect(isInLunchTime(700, CUSTOM_LUNCH)).toBe(false);
            // 13:00은 커스텀 점심 종료 (exclusive)
            expect(isInLunchTime(780, CUSTOM_LUNCH)).toBe(false);
        });
    });

    describe("overlapsWithLunchTime + 커스텀 점심시간", () => {
        it("커스텀 점심(12:00~13:00)과 겹침 감지", () => {
            // 11:00~12:30은 12:00~13:00과 겹침
            expect(overlapsWithLunchTime(660, 750, CUSTOM_LUNCH)).toBe(true);
            // 10:00~11:00은 겹치지 않음
            expect(overlapsWithLunchTime(600, 660, CUSTOM_LUNCH)).toBe(false);
        });
    });

    describe("getLunchOverlapMinutes + 커스텀 점심시간", () => {
        it("커스텀 점심(12:00~13:00)과 겹치는 시간 계산", () => {
            // 11:30~12:30 → 12:00~12:30 = 30분 겹침
            expect(getLunchOverlapMinutes(690, 750, CUSTOM_LUNCH)).toBe(30);
        });
    });

    describe("adjustForLunchTime + 커스텀 점심시간", () => {
        it("커스텀 점심(12:00~13:00) 중이면 13:00으로 조정", () => {
            expect(adjustForLunchTime(720, CUSTOM_LUNCH)).toBe(780);
            expect(adjustForLunchTime(750, CUSTOM_LUNCH)).toBe(780);
        });

        it("커스텀 점심 외면 그대로", () => {
            expect(adjustForLunchTime(700, CUSTOM_LUNCH)).toBe(700);
        });
    });
});
