/**
 * ShortcutsTab 스냅샷 테스트
 * 단축키 설정 UI 구조 변경 감지
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { ShortcutsTab } from "../../../../features/settings/ui/tabs/ShortcutsTab";
import type { ShortcutDefinition } from "../../../../shared/types";

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
        {
            id: "disabled-shortcut",
            name: "비활성 단축키",
            description: "비활성화된 단축키입니다",
            keys: "Alt+X",
            category: "navigation",
            enabled: false,
            action: "disabledAction",
        },
    ];

    const default_props = {
        shortcuts: mock_shortcuts,
        on_toggle: vi.fn(),
        on_edit: vi.fn(),
        on_reset: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("기본 렌더링 구조가 유지됨", () => {
        const { container } = render(
            <TestWrapper>
                <ShortcutsTab {...default_props} />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("빈 단축키 목록 구조가 유지됨", () => {
        const { container } = render(
            <TestWrapper>
                <ShortcutsTab {...default_props} shortcuts={[]} />
            </TestWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
