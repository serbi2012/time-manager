import { describe, it, expect } from "vitest";
import { calcAnchoredMenuPosition } from "@/shared/lib/mobile/menu_position";

const VIEWPORT = { viewport_width: 360, viewport_height: 780 };
const MENU = { menu_width: 140, menu_height: 156 };

function anchorAt(top: number, height: number, right: number) {
    return {
        top,
        bottom: top + height,
        left: right - 300,
        right,
    };
}

describe("calcAnchoredMenuPosition", () => {
    it("기준 요소가 없으면 기본 위치를 반환한다", () => {
        const position = calcAnchoredMenuPosition({
            anchor: null,
            ...VIEWPORT,
            ...MENU,
        });

        expect(position).toEqual({ top: 8, right: 16 });
    });

    it("아래에 공간이 있으면 기준 요소 아래에 배치한다", () => {
        const position = calcAnchoredMenuPosition({
            anchor: anchorAt(100, 80, 344),
            ...VIEWPORT,
            ...MENU,
        });

        expect(position.top).toBe(188);
    });

    it("아래 공간이 부족하면 기준 요소 위로 뒤집는다", () => {
        const position = calcAnchoredMenuPosition({
            anchor: anchorAt(600, 80, 344),
            ...VIEWPORT,
            ...MENU,
            bottom_reserved: 90,
        });

        expect(position.top).toBe(436);
    });

    it("위아래 모두 공간이 부족하면 화면 안쪽으로 고정한다", () => {
        const position = calcAnchoredMenuPosition({
            anchor: anchorAt(40, 700, 344),
            ...VIEWPORT,
            ...MENU,
            bottom_reserved: 90,
        });

        expect(position.top).toBe(526);
        expect(position.top + MENU.menu_height).toBeLessThanOrEqual(
            VIEWPORT.viewport_height - 90
        );
    });

    it("하단 예약 영역을 침범하지 않는다", () => {
        const position = calcAnchoredMenuPosition({
            anchor: anchorAt(500, 60, 344),
            ...VIEWPORT,
            ...MENU,
            bottom_reserved: 90,
        });

        expect(position.top + MENU.menu_height).toBeLessThanOrEqual(
            VIEWPORT.viewport_height - 90
        );
    });

    it("기준 요소가 화면 왼쪽에 있어도 메뉴가 화면 밖으로 나가지 않는다", () => {
        const position = calcAnchoredMenuPosition({
            anchor: anchorAt(100, 60, 40),
            ...VIEWPORT,
            ...MENU,
        });

        expect(position.right).toBeLessThanOrEqual(
            VIEWPORT.viewport_width - MENU.menu_width - 8
        );
        expect(position.right).toBeGreaterThanOrEqual(8);
    });
});
