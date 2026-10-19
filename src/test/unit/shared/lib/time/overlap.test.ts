import { describe, it, expect } from "vitest";
import {
    isTimeRangeOverlapping,
    getOverlapType,
    adjustTimeRangeToAvoidConflicts,
} from "@/shared/lib/time/overlap";

describe("isTimeRangeOverlapping", () => {
    it.each([
        ["첫 번째가 앞에 있음", [100, 200, 300, 400], false],
        ["첫 번째가 뒤에 있음", [300, 400, 100, 200], false],
        ["끝과 시작이 맞닿음", [100, 200, 200, 300], false],
        ["첫 번째 끝이 두 번째 안에 있음", [100, 250, 200, 300], true],
        ["첫 번째 시작이 두 번째 안에 있음", [250, 350, 200, 300], true],
        ["첫 번째가 두 번째를 포함", [100, 400, 200, 300], true],
        ["두 번째가 첫 번째를 포함", [200, 300, 100, 400], true],
        ["동일 범위", [200, 300, 200, 300], true],
    ])("%s → %s", (_label, [s1, e1, s2, e2], expected) => {
        expect(isTimeRangeOverlapping(s1, e1, s2, e2)).toBe(expected);
    });
});

describe("getOverlapType", () => {
    it.each([
        ["none", [100, 200, 300, 400]],
        ["contains", [100, 400, 200, 300]],
        ["contained", [200, 300, 100, 400]],
        ["overlap_start", [250, 350, 200, 300]],
        ["overlap_end", [100, 250, 200, 300]],
    ])("%s", (expected, [s1, e1, s2, e2]) => {
        expect(getOverlapType(s1, e1, s2, e2)).toBe(expected);
    });
});

describe("adjustTimeRangeToAvoidConflicts", () => {
    it("충돌이 없으면 원본을 반환한다", () => {
        expect(
            adjustTimeRangeToAvoidConflicts(100, 200, [{ start: 300, end: 400 }])
        ).toEqual({ start: 100, end: 200, adjusted: false });
    });

    it("기존 범위가 없으면 원본을 반환한다", () => {
        expect(adjustTimeRangeToAvoidConflicts(100, 200, [])).toEqual({
            start: 100,
            end: 200,
            adjusted: false,
        });
    });

    it("시작 부분이 겹치면 시작을 기존 범위 끝으로 민다", () => {
        expect(
            adjustTimeRangeToAvoidConflicts(150, 300, [{ start: 100, end: 200 }])
        ).toEqual({ start: 200, end: 300, adjusted: true });
    });

    it("끝 부분이 겹치면 끝을 기존 범위 시작으로 당긴다", () => {
        expect(
            adjustTimeRangeToAvoidConflicts(100, 250, [{ start: 200, end: 300 }])
        ).toEqual({ start: 100, end: 200, adjusted: true });
    });

    it("양쪽이 겹치면 양쪽 모두 조정한다", () => {
        expect(
            adjustTimeRangeToAvoidConflicts(150, 250, [
                { start: 100, end: 180 },
                { start: 220, end: 300 },
            ])
        ).toEqual({ start: 180, end: 220, adjusted: true });
    });

    it.each([
        ["기존 범위를 완전히 포함", 100, 400, { start: 200, end: 300 }],
        ["기존 범위에 완전히 포함", 200, 300, { start: 100, end: 400 }],
        ["조정 후 범위가 비게 됨", 250, 280, { start: 200, end: 300 }],
    ])("%s하면 null을 반환한다", (_label, start, end, existing) => {
        expect(adjustTimeRangeToAvoidConflicts(start, end, [existing])).toBeNull();
    });
});
