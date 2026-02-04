/**
 * ShortcutsTab 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { ShortcutsTab } from "../../../../features/settings/ui/tabs/ShortcutsTab";
import {
    useShortcutStore,
    DEFAULT_SHORTCUTS,
} from "../../../../store/useShortcutStore";
import { useWorkStore } from "../../../../store/useWorkStore";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("ShortcutsTab", () => {
    beforeEach(() => {
        useShortcutStore.setState({ shortcuts: [...DEFAULT_SHORTCUTS] });
        useWorkStore.setState({ app_theme: "blue" });
        vi.clearAllMocks();
    });

    it("렌더링되어야 함", () => {
        render(
            <TestWrapper>
                <ShortcutsTab />
            </TestWrapper>
        );

        expect(screen.getByText("기본값으로 초기화")).toBeInTheDocument();
    });

    it("단축키 목록 표시", () => {
        render(
            <TestWrapper>
                <ShortcutsTab />
            </TestWrapper>
        );

        const first_shortcut = DEFAULT_SHORTCUTS[0];
        expect(screen.getByText(first_shortcut.name)).toBeInTheDocument();
    });

    it("초기화 버튼 클릭 시 스토어 초기화", () => {
        render(
            <TestWrapper>
                <ShortcutsTab />
            </TestWrapper>
        );

        const reset_button = screen.getByText("기본값으로 초기화");
        fireEvent.click(reset_button);

        expect(useShortcutStore.getState().shortcuts).toEqual(
            DEFAULT_SHORTCUTS
        );
    });
});
