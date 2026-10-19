/**
 * ThemeTab 컴포넌트 테스트
 */

import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithAntd } from "@/test/helpers/test_utils";
import { ThemeTab } from "@/features/settings/ui/tabs/ThemeTab";
import { useWorkStore } from "@/store/useWorkStore";

describe("ThemeTab", () => {
    beforeEach(() => {
        useWorkStore.setState({ app_theme: "blue" });
    });

    it("렌더링되어야 함", () => {
        renderWithAntd(<ThemeTab />);

        expect(screen.getByText("테마 색상")).toBeInTheDocument();
    });

    it("모든 테마 옵션 표시", () => {
        renderWithAntd(<ThemeTab />);

        expect(screen.getByText(/파란색/)).toBeInTheDocument();
        expect(screen.getByText(/초록색/)).toBeInTheDocument();
        expect(screen.getByText(/보라색/)).toBeInTheDocument();
        expect(screen.getByText(/빨간색/)).toBeInTheDocument();
    });

    it("테마 클릭 시 스토어 업데이트", () => {
        renderWithAntd(<ThemeTab />);

        const green_label = screen.getByText("초록색");
        fireEvent.click(green_label.closest("[role='button']") ?? green_label);

        expect(useWorkStore.getState().app_theme).toBe("green");
    });
});
