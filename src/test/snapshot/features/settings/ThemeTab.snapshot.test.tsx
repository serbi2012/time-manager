/**
 * ThemeTab 스냅샷 테스트
 * 테마 설정 UI 구조 변경 감지
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { ThemeTab } from "../../../../features/settings/ui/tabs/ThemeTab";
import { useWorkStore } from "../../../../store/useWorkStore";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("ThemeTab 스냅샷", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("블루 테마 구조가 유지됨", () => {
        useWorkStore.setState({ app_theme: "blue" });
        const { container } = render(
            <TestWrapper>
                <ThemeTab />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("그린 테마 구조가 유지됨", () => {
        useWorkStore.setState({ app_theme: "green" });
        const { container } = render(
            <TestWrapper>
                <ThemeTab />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("퍼플 테마 구조가 유지됨", () => {
        useWorkStore.setState({ app_theme: "purple" });
        const { container } = render(
            <TestWrapper>
                <ThemeTab />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
