import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DesktopSidebar } from "@/widgets/Navigation/DesktopSidebar";
import { STORAGE_KEYS } from "@/shared/constants";

function getSiderWidth(container: HTMLElement) {
    const sider = container.querySelector<HTMLElement>(".app-sider");
    if (!sider) throw new Error("사이드바를 찾을 수 없음");
    return sider.style.width;
}

describe("DesktopSidebar", () => {
    beforeEach(() => {
        localStorage.removeItem(STORAGE_KEYS.SIDEBAR_WIDTH);
    });

    it("너비 조절 핸들을 표시한다", () => {
        render(<DesktopSidebar on_add_record_only={() => undefined} />);

        expect(screen.getByRole("separator")).toHaveAttribute(
            "aria-orientation",
            "vertical"
        );
    });

    it("저장된 너비가 없으면 기본 너비로 표시한다", () => {
        const { container } = render(
            <DesktopSidebar on_add_record_only={() => undefined} />
        );

        expect(getSiderWidth(container)).toBe("300px");
    });

    it("저장된 너비로 표시한다", () => {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, "420");

        const { container } = render(
            <DesktopSidebar on_add_record_only={() => undefined} />
        );

        expect(getSiderWidth(container)).toBe("420px");
    });

    it("핸들을 더블클릭하면 기본 너비로 돌아간다", () => {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, "420");

        const { container } = render(
            <DesktopSidebar on_add_record_only={() => undefined} />
        );
        fireEvent.doubleClick(screen.getByRole("separator"));

        expect(getSiderWidth(container)).toBe("300px");
        expect(localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH)).toBeNull();
    });
});
