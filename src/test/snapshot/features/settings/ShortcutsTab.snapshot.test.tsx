/**
 * ShortcutsTab 스냅샷 테스트
 * 단축키 설정 UI 구조 변경 감지
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { ShortcutsTab } from "../../../../features/settings/ui/tabs/ShortcutsTab";
import { useShortcutStore } from "../../../../store/useShortcutStore";
import { useWorkStore } from "../../../../store/useWorkStore";
import type { ShortcutDefinition } from "../../../../store/useShortcutStore";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("ShortcutsTab 스냅샷", () => {
    const mock_shortcuts: ShortcutDefinition[] = [
        {
            id: "new-work",
            name: "새 작업 추가",
            description: "새로운 작업을 추가합니다",
            keys: "Alt+N",
            category: "general",
            enabled: true,
            action: "openNewWorkModal",
        },
        {
            id: "toggle-timer",
            name: "타이머 토글",
            description: "타이머를 시작/정지합니다",
            keys: "Alt+S",
            category: "timer",
            enabled: true,
            action: "toggleTimer",
        },
    ];

    beforeEach(() => {
        useWorkStore.setState({ app_theme: "blue" });
        vi.clearAllMocks();
    });

    it("기본 렌더링 구조가 유지됨", () => {
        useShortcutStore.setState({ shortcuts: mock_shortcuts });
        const { container } = render(
            <TestWrapper>
                <ShortcutsTab />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("빈 단축키 목록 구조가 유지됨", () => {
        useShortcutStore.setState({ shortcuts: [] });
        const { container } = render(
            <TestWrapper>
                <ShortcutsTab />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
