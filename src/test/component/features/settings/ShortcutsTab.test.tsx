/**
 * ShortcutsTab 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithAntd } from "@/test/helpers/test_utils";
import { ShortcutsTab } from "@/features/settings/ui/tabs/ShortcutsTab";
import {
    useShortcutStore,
    DEFAULT_SHORTCUTS,
} from "@/store/useShortcutStore";
import { useWorkStore } from "@/store/useWorkStore";
import { message } from "@/shared/lib/message";
import { SUCCESS_MESSAGES } from "@/shared/constants/ui/messages";
import {
    SETTINGS_SHORTCUTS_RESET,
    SETTINGS_SHORTCUTS_RESET_CONFIRM_TITLE,
    SETTINGS_SHORTCUTS_RESET_OK,
} from "@/features/settings/constants";

vi.mock("@/shared/lib/message", () => ({
    message: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

describe("ShortcutsTab", () => {
    beforeEach(() => {
        useShortcutStore.setState({ shortcuts: [...DEFAULT_SHORTCUTS] });
        useWorkStore.setState({ app_theme: "blue" });
    });

    it("렌더링되어야 함", () => {
        renderWithAntd(<ShortcutsTab />);

        expect(screen.getByText("기본값으로 초기화")).toBeInTheDocument();
    });

    it("단축키 목록 표시", () => {
        renderWithAntd(<ShortcutsTab />);

        const first_shortcut = DEFAULT_SHORTCUTS[0];
        expect(screen.getByText(first_shortcut.name)).toBeInTheDocument();
        expect(screen.getByText(first_shortcut.keys)).toBeInTheDocument();
    });

    it("사용 스위치를 누르면 해당 단축키가 꺼진다", () => {
        renderWithAntd(<ShortcutsTab />);

        const first_shortcut = DEFAULT_SHORTCUTS[0];
        fireEvent.click(screen.getAllByRole("switch")[0]);

        expect(
            useShortcutStore.getState().getShortcut(first_shortcut.id)?.enabled
        ).toBe(false);
    });

    it("초기화는 확인 후에만 바뀐 단축키를 기본값으로 되돌린다", async () => {
        const first_shortcut = DEFAULT_SHORTCUTS[0];
        useShortcutStore.getState().toggleShortcut(first_shortcut.id);
        renderWithAntd(<ShortcutsTab />);

        fireEvent.click(screen.getByText(SETTINGS_SHORTCUTS_RESET));
        const popover_title = await screen.findByText(
            SETTINGS_SHORTCUTS_RESET_CONFIRM_TITLE
        );

        expect(
            useShortcutStore.getState().getShortcut(first_shortcut.id)?.enabled
        ).toBe(false);

        const popover = popover_title.closest<HTMLElement>(".ant-popover");
        if (!popover) throw new Error("확인 팝업을 찾을 수 없음");
        fireEvent.click(
            within(popover).getByRole("button", {
                name: SETTINGS_SHORTCUTS_RESET_OK,
            })
        );

        expect(useShortcutStore.getState().shortcuts).toEqual(
            DEFAULT_SHORTCUTS
        );
        expect(message.success).toHaveBeenCalledWith(
            SUCCESS_MESSAGES.shortcutResetDone
        );
    });
});
