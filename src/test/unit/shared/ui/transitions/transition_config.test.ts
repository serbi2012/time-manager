/**
 * transition_config 상수 테스트
 */

import { describe, it, expect } from "vitest";
import {
    ROUTE_ORDER,
    TRANSITION_EASE,
    ROUTE_TRANSITION_OFFSET,
    CONTENT_SLIDE_UP_OFFSET,
    PAGE_TRANSITION_DELAYS,
    TRANSITION_SPEED_DURATION,
    TRANSITION_SPEED_STAGGER,
    TRANSITION_SPEED_LABELS,
} from "../../../../../shared/ui/transitions/transition_config";

describe("ROUTE_ORDER", () => {
    it("모든 주요 라우트 경로가 정의되어 있다", () => {
        expect(ROUTE_ORDER["/"]).toBeDefined();
        expect(ROUTE_ORDER["/weekly"]).toBeDefined();
        expect(ROUTE_ORDER["/guide"]).toBeDefined();
        expect(ROUTE_ORDER["/admin"]).toBeDefined();
    });

    it("라우트 순서가 메뉴 좌→우 순서와 일치한다", () => {
        expect(ROUTE_ORDER["/"]).toBeLessThan(ROUTE_ORDER["/weekly"]);
        expect(ROUTE_ORDER["/weekly"]).toBeLessThan(ROUTE_ORDER["/guide"]);
        expect(ROUTE_ORDER["/guide"]).toBeLessThan(ROUTE_ORDER["/admin"]);
    });

    it("인덱스가 0 이상의 정수이다", () => {
        for (const value of Object.values(ROUTE_ORDER)) {
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(0);
        }
    });
});

describe("TRANSITION_EASE", () => {
    it("4개의 cubic-bezier 값으로 구성된다", () => {
        expect(TRANSITION_EASE).toHaveLength(4);
    });

    it("모든 값이 숫자이다", () => {
        for (const value of TRANSITION_EASE) {
            expect(typeof value).toBe("number");
        }
    });
});

describe("ROUTE_TRANSITION_OFFSET", () => {
    it("양수 값이다", () => {
        expect(ROUTE_TRANSITION_OFFSET).toBeGreaterThan(0);
    });
});

describe("CONTENT_SLIDE_UP_OFFSET", () => {
    it("양수 값이다", () => {
        expect(CONTENT_SLIDE_UP_OFFSET).toBeGreaterThan(0);
    });
});

describe("PAGE_TRANSITION_DELAYS.desktop_weekly", () => {
    const weekly = PAGE_TRANSITION_DELAYS.desktop_weekly;

    it("헤더 설정이 정의되어 있다", () => {
        expect(weekly.header_duration).toBeGreaterThan(0);
        expect(typeof weekly.header_y_offset).toBe("number");
    });

    it("카드 stagger 설정이 정의되어 있다", () => {
        expect(weekly.card_duration).toBeGreaterThan(0);
        expect(typeof weekly.card_y_offset).toBe("number");
        expect(weekly.card_start_delay).toBeGreaterThanOrEqual(0);
        expect(weekly.card_stagger).toBeGreaterThan(0);
    });
});

describe("TRANSITION_SPEED_DURATION", () => {
    it("모든 속도별 duration이 양수이다", () => {
        expect(TRANSITION_SPEED_DURATION.slow).toBeGreaterThan(0);
        expect(TRANSITION_SPEED_DURATION.normal).toBeGreaterThan(0);
        expect(TRANSITION_SPEED_DURATION.fast).toBeGreaterThan(0);
    });

    it("slow > normal > fast 순서이다", () => {
        expect(TRANSITION_SPEED_DURATION.slow).toBeGreaterThan(
            TRANSITION_SPEED_DURATION.normal
        );
        expect(TRANSITION_SPEED_DURATION.normal).toBeGreaterThan(
            TRANSITION_SPEED_DURATION.fast
        );
    });
});

describe("TRANSITION_SPEED_STAGGER", () => {
    it("slow > normal > fast 순서이다", () => {
        expect(TRANSITION_SPEED_STAGGER.slow).toBeGreaterThan(
            TRANSITION_SPEED_STAGGER.normal
        );
        expect(TRANSITION_SPEED_STAGGER.normal).toBeGreaterThan(
            TRANSITION_SPEED_STAGGER.fast
        );
    });
});

describe("TRANSITION_SPEED_LABELS", () => {
    it("모든 속도에 한글 라벨이 있다", () => {
        expect(typeof TRANSITION_SPEED_LABELS.slow).toBe("string");
        expect(typeof TRANSITION_SPEED_LABELS.normal).toBe("string");
        expect(typeof TRANSITION_SPEED_LABELS.fast).toBe("string");
        expect(TRANSITION_SPEED_LABELS.slow.length).toBeGreaterThan(0);
        expect(TRANSITION_SPEED_LABELS.normal.length).toBeGreaterThan(0);
        expect(TRANSITION_SPEED_LABELS.fast.length).toBeGreaterThan(0);
    });
});
