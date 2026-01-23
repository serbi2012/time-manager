/**
 * ShortcutsTab 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShortcutsTab } from "../../../../features/settings/ui/tabs/ShortcutsTab";
import type { ShortcutDefinition } from "../../../../shared/types";

describe("ShortcutsTab", () => {
    const mock_shortcuts: ShortcutDefinition[] = [
        {
            id: "start-timer",
            name: "타이머 시작",
            description: "타이머를 시작합니다",
            keys: "Ctrl+S",
            category: "timer",
            enabled: true,
            action: "startTimer",
        },
        {
            id: "stop-timer",
            name: "타이머 중지",
            description: "타이머를 중지합니다",
            keys: "Ctrl+P",
            category: "timer",
            enabled: false,
            action: "stopTimer",
        },
    ];

    const default_props = {
        shortcuts: mock_shortcuts,
        on_toggle: vi.fn(),
        on_edit: vi.fn(),
        on_reset: vi.fn(),
    };

    it("렌더링되어야 함", () => {
        render(<ShortcutsTab {...default_props} />);

        expect(screen.getByText("기본값으로 초기화")).toBeInTheDocument();
    });

    it("단축키 목록 표시", () => {
        render(<ShortcutsTab {...default_props} />);

        expect(screen.getByText("타이머 시작")).toBeInTheDocument();
        expect(screen.getByText("타이머 중지")).toBeInTheDocument();
    });

    it("단축키 키 조합 표시", () => {
        render(<ShortcutsTab {...default_props} />);

        expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
        expect(screen.getByText("Ctrl+P")).toBeInTheDocument();
    });

    it("초기화 버튼 클릭 시 on_reset 호출", () => {
        const on_reset = vi.fn();
        render(<ShortcutsTab {...default_props} on_reset={on_reset} />);

        const reset_button = screen.getByText("기본값으로 초기화");
        fireEvent.click(reset_button);

        expect(on_reset).toHaveBeenCalled();
    });
});
