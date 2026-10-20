import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DesktopSidebar } from "@/widgets/Navigation/DesktopSidebar";
import { STORAGE_KEYS } from "@/shared/constants";
import { useSidebarStore } from "@/store/useSidebarStore";

function getSiderWidth(container: HTMLElement) {
    const sider = container.querySelector<HTMLElement>(".app-sider");
    if (!sider) throw new Error("사이드바를 찾을 수 없음");
    return sider.style.width;
}

describe("DesktopSidebar", () => {
    beforeEach(() => {
        localStorage.removeItem(STORAGE_KEYS.SIDEBAR_WIDTH);
        localStorage.removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
        useSidebarStore.setState({ is_collapsed: false });
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

    it("접기 버튼을 누르면 좁은 레일로 접히고 너비 조절 핸들을 숨긴다", () => {
        const { container } = render(
            <DesktopSidebar on_add_record_only={() => undefined} />
        );
        fireEvent.click(screen.getByRole("button", { name: "사이드바 접기" }));

        expect(getSiderWidth(container)).toBe("64px");
        expect(screen.queryByRole("separator")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "사이드바 펼치기" })
        ).toHaveAttribute("aria-expanded", "false");
    });

    it("펼치기 버튼을 누르면 저장된 너비로 돌아온다", () => {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, "420");
        useSidebarStore.setState({ is_collapsed: true });

        const { container } = render(
            <DesktopSidebar on_add_record_only={() => undefined} />
        );
        fireEvent.click(screen.getByRole("button", { name: "사이드바 펼치기" }));

        expect(getSiderWidth(container)).toBe("420px");
        expect(screen.getByRole("separator")).toBeInTheDocument();
    });
});
