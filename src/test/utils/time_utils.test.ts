/**
 * time_utils 유닛 테스트
 *
 * 핵심 시간 계산 로직을 상세하게 테스트합니다.
 *
 * shared/lib의 순수 함수들을 테스트합니다.
 */
import { describe, it, expect } from "vitest";
import {
    timeToMinutes,
    minutesToTime,
    formatDuration,
    formatTimerWithSeconds,
    isTimeRangeOverlapping,
    getOverlapType,
    adjustTimeRangeToAvoidConflicts,
    isSameDate,
    isDateBefore,
    isDateAfter,
    isDateInRange,
} from "../../shared/lib/time";
import {
    calculateDurationExcludingLunch,
    LUNCH_START_MINUTES,
    LUNCH_END_MINUTES,
    LUNCH_DURATION_MINUTES,
} from "../../shared/lib/lunch";

// 레거시 호환성을 위한 별칭
const formatSecondsToHHMMSS = formatTimerWithSeconds;
const LUNCH_DURATION = LUNCH_DURATION_MINUTES;

// =====================================================
// 시간 변환 유틸리티 테스트
// =====================================================
describe("시간 변환 유틸리티", () => {
    describe("timeToMinutes", () => {
        it("정상적인 시간 문자열을 분으로 변환", () => {
            expect(timeToMinutes("00:00")).toBe(0);
            expect(timeToMinutes("01:00")).toBe(60);
            expect(timeToMinutes("09:30")).toBe(570);
            expect(timeToMinutes("12:00")).toBe(720);
            expect(timeToMinutes("23:59")).toBe(1439);
        });

        it("자정(00:00)은 0분", () => {
            expect(timeToMinutes("00:00")).toBe(0);
        });

        it("정오(12:00)는 720분", () => {
            expect(timeToMinutes("12:00")).toBe(720);
        });

        it("잘못된 형식은 0으로 처리", () => {
            expect(timeToMinutes("")).toBe(0);
            expect(timeToMinutes("invalid")).toBe(0);
        });
    });

    describe("minutesToTime", () => {
        it("분을 시간 문자열로 변환", () => {
            expect(minutesToTime(0)).toBe("00:00");
            expect(minutesToTime(60)).toBe("01:00");
            expect(minutesToTime(570)).toBe("09:30");
            expect(minutesToTime(720)).toBe("12:00");
            expect(minutesToTime(1439)).toBe("23:59");
        });

        it("한 자리 수는 0으로 패딩", () => {
            expect(minutesToTime(5)).toBe("00:05");
            expect(minutesToTime(65)).toBe("01:05");
        });
    });

    describe("timeToMinutes ↔ minutesToTime 왕복 변환", () => {
        const test_times = [
            "00:00",
            "09:00",
            "11:40",
            "12:40",
            "15:30",
            "23:59",
        ];
        test_times.forEach((time) => {
            it(`"${time}" 왕복 변환 일치`, () => {
                expect(minutesToTime(timeToMinutes(time))).toBe(time);
            });
        });
    });

    describe("formatDuration", () => {
        it('60분 미만은 "N분" 형식', () => {
            expect(formatDuration(0)).toBe("0분");
            expect(formatDuration(30)).toBe("30분");
            expect(formatDuration(59)).toBe("59분");
        });

        it('정확히 시간 단위는 "N시간" 형식', () => {
            expect(formatDuration(60)).toBe("1시간");
            expect(formatDuration(120)).toBe("2시간");
            expect(formatDuration(480)).toBe("8시간");
        });

        it('시간+분은 "N시간 M분" 형식', () => {
            expect(formatDuration(90)).toBe("1시간 30분");
            expect(formatDuration(150)).toBe("2시간 30분");
            expect(formatDuration(61)).toBe("1시간 1분");
        });
    });

    describe("formatSecondsToHHMMSS", () => {
        it("초를 HH:MM:SS 형식으로 변환", () => {
            expect(formatSecondsToHHMMSS(0)).toBe("00:00:00");
            expect(formatSecondsToHHMMSS(59)).toBe("00:00:59");
            expect(formatSecondsToHHMMSS(60)).toBe("00:01:00");
            expect(formatSecondsToHHMMSS(3600)).toBe("01:00:00");
            expect(formatSecondsToHHMMSS(3661)).toBe("01:01:01");
            expect(formatSecondsToHHMMSS(86399)).toBe("23:59:59");
        });
    });
});

// =====================================================
// 점심시간 제외 계산 테스트
// =====================================================
describe("점심시간 제외 계산", () => {
    // 점심시간 상수 검증
    describe("점심시간 상수", () => {
        it("점심 시작: 11:40 (700분)", () => {
            expect(LUNCH_START_MINUTES).toBe(700);
            expect(minutesToTime(LUNCH_START_MINUTES)).toBe("11:40");
        });

        it("점심 종료: 12:40 (760분)", () => {
            expect(LUNCH_END_MINUTES).toBe(760);
            expect(minutesToTime(LUNCH_END_MINUTES)).toBe("12:40");
        });

        it("점심 시간: 60분", () => {
            expect(LUNCH_DURATION).toBe(60);
        });
    });

    describe("calculateDurationExcludingLunch", () => {
        // 점심시간과 겹치지 않는 경우
        describe("점심시간과 겹치지 않는 경우", () => {
            it("오전 작업 (09:00~11:00) - 점심 전", () => {
                const start = timeToMinutes("09:00");
                const end = timeToMinutes("11:00");
                expect(calculateDurationExcludingLunch(start, end)).toBe(120);
            });

            it("오전 작업 종료가 점심 시작과 같은 시간 (09:00~11:40)", () => {
                const start = timeToMinutes("09:00");
                const end = timeToMinutes("11:40");
                expect(calculateDurationExcludingLunch(start, end)).toBe(160);
            });

            it("오후 작업 시작이 점심 종료와 같은 시간 (12:40~15:00)", () => {
                const start = timeToMinutes("12:40");
                const end = timeToMinutes("15:00");
                expect(calculateDurationExcludingLunch(start, end)).toBe(140);
            });

            it("오후 작업 (14:00~18:00) - 점심 후", () => {
                const start = timeToMinutes("14:00");
                const end = timeToMinutes("18:00");
                expect(calculateDurationExcludingLunch(start, end)).toBe(240);
            });
        });

        // 점심시간에 완전히 포함되는 경우
        describe("점심시간에 완전히 포함되는 경우", () => {
            it("점심시간 전체 (11:40~12:40) - 0분", () => {
                const start = timeToMinutes("11:40");
                const end = timeToMinutes("12:40");
                expect(calculateDurationExcludingLunch(start, end)).toBe(0);
            });

            it("점심시간 일부 (12:00~12:30) - 0분", () => {
                const start = timeToMinutes("12:00");
                const end = timeToMinutes("12:30");
                expect(calculateDurationExcludingLunch(start, end)).toBe(0);
            });

            it("점심 시작과 동일 ~ 점심 중간 (11:40~12:00) - 0분", () => {
                const start = timeToMinutes("11:40");
                const end = timeToMinutes("12:00");
                expect(calculateDurationExcludingLunch(start, end)).toBe(0);
            });
        });

        // 점심시간을 완전히 포함하는 경우
        describe("점심시간을 완전히 포함하는 경우", () => {
            it("오전~오후 연속 작업 (10:00~14:00) - 점심 60분 제외", () => {
                const start = timeToMinutes("10:00");
                const end = timeToMinutes("14:00");
                // 10:00~14:00 = 240분, 점심 60분 제외 = 180분
                expect(calculateDurationExcludingLunch(start, end)).toBe(180);
            });

            it("11:00~13:00 - 점심 60분 제외 = 60분", () => {
                const start = timeToMinutes("11:00");
                const end = timeToMinutes("13:00");
                // 11:00~13:00 = 120분, 점심 60분 제외 = 60분
                expect(calculateDurationExcludingLunch(start, end)).toBe(60);
            });

            it("점심 시작 직전 ~ 점심 종료 직후 (11:30~12:50)", () => {
                const start = timeToMinutes("11:30");
                const end = timeToMinutes("12:50");
                // 11:30~11:40 (10분) + 12:40~12:50 (10분) = 20분
                expect(calculateDurationExcludingLunch(start, end)).toBe(20);
            });

            it("하루 종일 (09:00~18:00) - 점심 60분 제외 = 480분", () => {
                const start = timeToMinutes("09:00");
                const end = timeToMinutes("18:00");
                // 540분 - 60분 = 480분
                expect(calculateDurationExcludingLunch(start, end)).toBe(480);
            });
        });

        // 점심시간 시작 부분과 겹치는 경우
        describe("점심시간 시작 부분과 겹치는 경우", () => {
            it("11:00~12:00 - 점심 시작 전까지만 계산", () => {
                const start = timeToMinutes("11:00");
                const end = timeToMinutes("12:00");
                // 11:00~11:40 = 40분
                expect(calculateDurationExcludingLunch(start, end)).toBe(40);
            });

            it("11:30~12:30 - 점심 시작 전까지만 계산", () => {
                const start = timeToMinutes("11:30");
                const end = timeToMinutes("12:30");
                // 11:30~11:40 = 10분
                expect(calculateDurationExcludingLunch(start, end)).toBe(10);
            });

            it("11:35~11:45 - 점심 시작 전까지만 계산 (점심 종료가 점심 안)", () => {
                const start = timeToMinutes("11:35");
                const end = timeToMinutes("11:45");
                // 11:35~11:40 = 5분
                expect(calculateDurationExcludingLunch(start, end)).toBe(5);
            });
        });

        // 점심시간 끝 부분과 겹치는 경우
        describe("점심시간 끝 부분과 겹치는 경우", () => {
            it("12:00~13:00 - 점심 종료 후부터만 계산", () => {
                const start = timeToMinutes("12:00");
                const end = timeToMinutes("13:00");
                // 12:40~13:00 = 20분
                expect(calculateDurationExcludingLunch(start, end)).toBe(20);
            });

            it("12:30~13:30 - 점심 종료 후부터만 계산", () => {
                const start = timeToMinutes("12:30");
                const end = timeToMinutes("13:30");
                // 12:40~13:30 = 50분
                expect(calculateDurationExcludingLunch(start, end)).toBe(50);
            });

            it("12:35~12:45 - 점심 종료 후부터만 계산", () => {
                const start = timeToMinutes("12:35");
                const end = timeToMinutes("12:45");
                // 12:40~12:45 = 5분
                expect(calculateDurationExcludingLunch(start, end)).toBe(5);
            });
        });

        // 경계값 테스트
        describe("경계값 테스트", () => {
            it("종료 시간이 시작 시간과 같으면 0", () => {
                expect(calculateDurationExcludingLunch(600, 600)).toBe(0);
            });

            it("종료 시간이 시작 시간보다 빠르면 0", () => {
                expect(calculateDurationExcludingLunch(600, 500)).toBe(0);
            });

            it("점심 시작 1분 전 ~ 점심 시작", () => {
                const start = LUNCH_START_MINUTES - 1;
                const end = LUNCH_START_MINUTES;
                expect(calculateDurationExcludingLunch(start, end)).toBe(1);
            });

            it("점심 종료 ~ 점심 종료 1분 후", () => {
                const start = LUNCH_END_MINUTES;
                const end = LUNCH_END_MINUTES + 1;
                expect(calculateDurationExcludingLunch(start, end)).toBe(1);
            });
        });

        // 실제 업무 시나리오
        describe("실제 업무 시나리오", () => {
            it("일반 오전 업무 (09:00~12:00) - 160분", () => {
                // 09:00~11:40 = 160분
                expect(
                    calculateDurationExcludingLunch(
                        timeToMinutes("09:00"),
                        timeToMinutes("12:00")
                    )
                ).toBe(160);
            });

            it("일반 오후 업무 (13:00~18:00) - 300분", () => {
                expect(
                    calculateDurationExcludingLunch(
                        timeToMinutes("13:00"),
                        timeToMinutes("18:00")
                    )
                ).toBe(300);
            });

            it("표준 8시간 근무 (09:00~18:00) - 480분", () => {
                // 540분 - 60분 점심 = 480분
                expect(
                    calculateDurationExcludingLunch(
                        timeToMinutes("09:00"),
                        timeToMinutes("18:00")
                    )
                ).toBe(480);
            });

            it("반차 오전 (09:00~13:00) - 200분", () => {
                // 09:00~11:40 (160분) + 12:40~13:00 (20분) = 180분
                expect(
                    calculateDurationExcludingLunch(
                        timeToMinutes("09:00"),
                        timeToMinutes("13:00")
                    )
                ).toBe(180);
            });
        });
    });
});

// =====================================================
// 시간 범위 충돌 감지 테스트
// =====================================================
describe("시간 범위 충돌 감지", () => {
    describe("isTimeRangeOverlapping", () => {
        it("겹치지 않음: 첫 번째가 앞에", () => {
            expect(isTimeRangeOverlapping(100, 200, 300, 400)).toBe(false);
        });

        it("겹치지 않음: 첫 번째가 뒤에", () => {
            expect(isTimeRangeOverlapping(300, 400, 100, 200)).toBe(false);
        });

        it("겹치지 않음: 인접 (끝과 시작이 같음)", () => {
            expect(isTimeRangeOverlapping(100, 200, 200, 300)).toBe(false);
        });

        it("겹침: 부분 겹침 (첫 번째 끝이 두 번째 안에)", () => {
            expect(isTimeRangeOverlapping(100, 250, 200, 300)).toBe(true);
        });

        it("겹침: 부분 겹침 (첫 번째 시작이 두 번째 안에)", () => {
            expect(isTimeRangeOverlapping(250, 350, 200, 300)).toBe(true);
        });

        it("겹침: 첫 번째가 두 번째를 포함", () => {
            expect(isTimeRangeOverlapping(100, 400, 200, 300)).toBe(true);
        });

        it("겹침: 두 번째가 첫 번째를 포함", () => {
            expect(isTimeRangeOverlapping(200, 300, 100, 400)).toBe(true);
        });

        it("겹침: 동일 범위", () => {
            expect(isTimeRangeOverlapping(200, 300, 200, 300)).toBe(true);
        });
    });

    describe("getOverlapType", () => {
        it("none: 겹치지 않음", () => {
            expect(getOverlapType(100, 200, 300, 400)).toBe("none");
        });

        it("contains: 첫 번째가 두 번째를 포함", () => {
            expect(getOverlapType(100, 400, 200, 300)).toBe("contains");
        });

        it("contained: 두 번째가 첫 번째를 포함", () => {
            expect(getOverlapType(200, 300, 100, 400)).toBe("contained");
        });

        it("overlap_start: 첫 번째 시작이 두 번째 안에", () => {
            expect(getOverlapType(250, 350, 200, 300)).toBe("overlap_start");
        });

        it("overlap_end: 첫 번째 끝이 두 번째 안에", () => {
            expect(getOverlapType(100, 250, 200, 300)).toBe("overlap_end");
        });
    });
});

// =====================================================
// 시간 범위 조정 테스트
// =====================================================
describe("시간 범위 조정", () => {
    describe("adjustTimeRangeToAvoidConflicts", () => {
        it("충돌 없으면 원본 반환", () => {
            const result = adjustTimeRangeToAvoidConflicts(100, 200, [
                { start: 300, end: 400 },
            ]);
            expect(result).toEqual({ start: 100, end: 200, adjusted: false });
        });

        it("시작 부분 충돌 시 시작을 조정", () => {
            const result = adjustTimeRangeToAvoidConflicts(150, 300, [
                { start: 100, end: 200 },
            ]);
            expect(result).toEqual({ start: 200, end: 300, adjusted: true });
        });

        it("끝 부분 충돌 시 끝을 조정", () => {
            const result = adjustTimeRangeToAvoidConflicts(100, 250, [
                { start: 200, end: 300 },
            ]);
            expect(result).toEqual({ start: 100, end: 200, adjusted: true });
        });

        it("완전 포함 (contains) 시 null 반환", () => {
            const result = adjustTimeRangeToAvoidConflicts(100, 400, [
                { start: 200, end: 300 },
            ]);
            expect(result).toBeNull();
        });

        it("완전 포함됨 (contained) 시 null 반환", () => {
            const result = adjustTimeRangeToAvoidConflicts(200, 300, [
                { start: 100, end: 400 },
            ]);
            expect(result).toBeNull();
        });

        it("조정 후 유효하지 않으면 null 반환", () => {
            // 200~300 범위를 피하면서 250~280을 넣으려 하면
            // 시작을 300으로, 끝을 300 미만으로 조정 → 유효하지 않음
            const result = adjustTimeRangeToAvoidConflicts(250, 280, [
                { start: 200, end: 300 },
            ]);
            expect(result).toBeNull();
        });

        it("빈 기존 범위 배열이면 원본 반환", () => {
            const result = adjustTimeRangeToAvoidConflicts(100, 200, []);
            expect(result).toEqual({ start: 100, end: 200, adjusted: false });
        });

        it("여러 기존 범위와 충돌 시 순차 조정", () => {
            // 150~280을 넣으려 하는데, 100~200이 이미 있음
            // → 시작을 200으로 조정
            const result = adjustTimeRangeToAvoidConflicts(150, 280, [
                { start: 100, end: 200 },
            ]);
            expect(result?.start).toBe(200);
            expect(result?.end).toBe(280);
            expect(result?.adjusted).toBe(true);
        });

        it("양쪽 충돌 시 조정", () => {
            // 150~250을 넣으려 하는데, 100~180과 220~300이 이미 있음
            // → 시작을 180으로, 끝을 220으로 조정
            const result = adjustTimeRangeToAvoidConflicts(150, 250, [
                { start: 100, end: 180 },
                { start: 220, end: 300 },
            ]);
            expect(result?.start).toBe(180);
            expect(result?.end).toBe(220);
            expect(result?.adjusted).toBe(true);
        });
    });
});

// =====================================================
// 날짜 유틸리티 테스트
// =====================================================
describe("날짜 유틸리티", () => {
    describe("isSameDate", () => {
        it("같은 날짜면 true", () => {
            expect(isSameDate("2026-01-19", "2026-01-19")).toBe(true);
        });

        it("다른 날짜면 false", () => {
            expect(isSameDate("2026-01-19", "2026-01-20")).toBe(false);
        });
    });

    describe("isDateBefore", () => {
        it("첫 번째가 이전이면 true", () => {
            expect(isDateBefore("2026-01-18", "2026-01-19")).toBe(true);
        });

        it("첫 번째가 같으면 false", () => {
            expect(isDateBefore("2026-01-19", "2026-01-19")).toBe(false);
        });

        it("첫 번째가 이후면 false", () => {
            expect(isDateBefore("2026-01-20", "2026-01-19")).toBe(false);
        });
    });

    describe("isDateAfter", () => {
        it("첫 번째가 이후면 true", () => {
            expect(isDateAfter("2026-01-20", "2026-01-19")).toBe(true);
        });

        it("첫 번째가 같으면 false", () => {
            expect(isDateAfter("2026-01-19", "2026-01-19")).toBe(false);
        });

        it("첫 번째가 이전이면 false", () => {
            expect(isDateAfter("2026-01-18", "2026-01-19")).toBe(false);
        });
    });

    describe("isDateInRange", () => {
        it("범위 내 날짜면 true", () => {
            expect(
                isDateInRange("2026-01-19", "2026-01-15", "2026-01-25")
            ).toBe(true);
        });

        it("시작 날짜와 같으면 true", () => {
            expect(
                isDateInRange("2026-01-15", "2026-01-15", "2026-01-25")
            ).toBe(true);
        });

        it("종료 날짜와 같으면 true", () => {
            expect(
                isDateInRange("2026-01-25", "2026-01-15", "2026-01-25")
            ).toBe(true);
        });

        it("범위 전이면 false", () => {
            expect(
                isDateInRange("2026-01-10", "2026-01-15", "2026-01-25")
            ).toBe(false);
        });

        it("범위 후면 false", () => {
            expect(
                isDateInRange("2026-01-30", "2026-01-15", "2026-01-25")
            ).toBe(false);
        });
    });
});
