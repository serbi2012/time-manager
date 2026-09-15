import { describe, it, expect } from "vitest";
import {
    CATEGORY_HEX_COLORS,
    DEFAULT_CATEGORY_HEX_COLOR,
    getCategoryHexColor,
} from "@/shared/constants/style/colors";

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

describe("getCategoryHexColor", () => {
    it("정의된 카테고리는 매핑된 색상을 반환한다", () => {
        expect(getCategoryHexColor("개발")).toBe(CATEGORY_HEX_COLORS["개발"]);
        expect(getCategoryHexColor("회의")).toBe(CATEGORY_HEX_COLORS["회의"]);
    });

    it("모든 카테고리 색상이 6자리 hex 값이다", () => {
        for (const color of Object.values(CATEGORY_HEX_COLORS)) {
            expect(color).toMatch(HEX_PATTERN);
        }
    });

    it("알 수 없는 카테고리는 기본 색상을 반환한다", () => {
        expect(getCategoryHexColor("존재하지않는카테고리")).toBe(
            DEFAULT_CATEGORY_HEX_COLOR
        );
    });

    it("빈 문자열도 기본 색상을 반환한다", () => {
        expect(getCategoryHexColor("")).toBe(DEFAULT_CATEGORY_HEX_COLOR);
    });

    it("반환값에 알파를 덧붙여도 유효한 8자리 hex가 된다", () => {
        expect(`${getCategoryHexColor("개발")}30`).toMatch(
            /^#[0-9A-Fa-f]{8}$/
        );
    });
});
