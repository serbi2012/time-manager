/**
 * transition_config 상수 테스트
 */

import { describe, it, expect } from "vitest";
import { ROUTE_ORDER } from "../../../../../shared/ui/transitions/transition_config";

describe("ROUTE_ORDER", () => {
    it("라우트 순서가 메뉴 좌→우 순서와 일치한다", () => {
        expect(ROUTE_ORDER["/"]).toBeLessThan(ROUTE_ORDER["/weekly"]);
        expect(ROUTE_ORDER["/weekly"]).toBeLessThan(ROUTE_ORDER["/guide"]);
        expect(ROUTE_ORDER["/guide"]).toBeLessThan(ROUTE_ORDER["/admin"]);
    });
});
