/**
 * ThemeTab 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { ThemeTab } from "../../../../features/settings/ui/tabs/ThemeTab";
import { useWorkStore } from "../../../../store/useWorkStore";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("ThemeTab", () => {
    beforeEach(() => {
        useWorkStore.setState({ app_theme: "blue" });
        vi.clearAllMocks();
    });

    it("렌더링되어야 함", () => {
        render(
            <TestWrapper>
                <ThemeTab />
            </TestWrapper>
        );

        expect(screen.getByText("테마 색상")).toBeInTheDocument();
    });

    it("모든 테마 옵션 표시", () => {
        render(
            <TestWrapper>
                <ThemeTab />
            </TestWrapper>
        );

        expect(screen.getByText(/파란색/)).toBeInTheDocument();
        expect(screen.getByText(/초록색/)).toBeInTheDocument();
        expect(screen.getByText(/보라색/)).toBeInTheDocument();
        expect(screen.getByText(/빨간색/)).toBeInTheDocument();
    });

    it("테마 클릭 시 스토어 업데이트", () => {
        render(
            <TestWrapper>
                <ThemeTab />
            </TestWrapper>
        );

        const green_label = screen.getByText("초록색");
        fireEvent.click(green_label.closest("[role='button']") ?? green_label);

        expect(useWorkStore.getState().app_theme).toBe("green");
    });
});
