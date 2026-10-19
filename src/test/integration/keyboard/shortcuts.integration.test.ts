/**
 * 키보드 단축키 통합 테스트
 * 
 * 실제 단축키 동작을 검증합니다.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppShortcuts } from "../../../shared/hooks";
import { resetShortcutManager } from "../../../shared/lib/shortcuts";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "../../../store/useShortcutStore";

const resetStore = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    });
};

function pressKey(init: KeyboardEventInit): void {
    act(() => {
        window.dispatchEvent(
            new KeyboardEvent("keydown", { bubbles: true, ...init })
        );
    });
}

const ALT_N: KeyboardEventInit = { key: "n", altKey: true };
const ALT_S: KeyboardEventInit = { key: "s", altKey: true };

describe("키보드 단축키 통합 테스트", () => {
    beforeEach(() => {
        resetShortcutManager();
        resetStore();
    });

    describe("F8 단축키 (모달 저장)", () => {
        it("모달이 없으면 F8은 전역에서 동작하지 않는다", () => {
            const handlers = {
                modalSubmit: vi.fn(),
            };

            renderHook(() => useAppShortcuts(handlers));

            pressKey({ key: "F8", code: "F8" });

            expect(handlers.modalSubmit).not.toHaveBeenCalled();
        });
    });

    describe("기본 키 매핑", () => {
        it.each<[string, string, KeyboardEventInit]>([
            ["Alt+N", "openNewWorkModal", ALT_N],
            ["Alt+S", "toggleTimer", ALT_S],
            ["Alt+T", "goToday", { key: "t", altKey: true }],
            ["Alt+P", "openNewPresetModal", { key: "p", altKey: true }],
            ["Alt+,", "openSettings", { key: ",", altKey: true }],
            ["Alt+1", "goDaily", { key: "1", altKey: true }],
            ["Alt+2", "goWeekly", { key: "2", altKey: true }],
            ["Alt+Left", "prevDay", { key: "ArrowLeft", altKey: true }],
            ["Alt+Right", "nextDay", { key: "ArrowRight", altKey: true }],
            ["Alt+Shift+S", "syncData", { key: "s", altKey: true, shiftKey: true }],
            ["Alt+E", "exportData", { key: "e", altKey: true }],
            ["Alt+R", "resetTimer", { key: "r", altKey: true }],
        ])("%s 키를 누르면 %s 핸들러만 호출됨", (_label, action, init) => {
            const target = vi.fn();
            const other = vi.fn();
            const other_action =
                action === "openNewWorkModal" ? "toggleTimer" : "openNewWorkModal";

            renderHook(() =>
                useAppShortcuts({ [action]: target, [other_action]: other })
            );

            pressKey(init);

            expect(target).toHaveBeenCalledTimes(1);
            expect(other).not.toHaveBeenCalled();
        });
    });

    describe("단축키 활성화", () => {
        it("비활성화한 단축키는 키를 눌러도 핸들러가 호출되지 않음", () => {
            useShortcutStore.getState().toggleShortcut("new-work");

            const handlers = {
                openNewWorkModal: vi.fn(),
            };

            renderHook(() => useAppShortcuts(handlers));

            pressKey(ALT_N);

            expect(handlers.openNewWorkModal).not.toHaveBeenCalled();
        });
    });

    describe("단축키 키 조합 변경", () => {
        it("단축키 키 조합을 변경하면 새 키로 동작함", () => {
            const result = useShortcutStore.getState().setShortcutKeys("new-work", "Alt+Q");
            expect(result.success).toBe(true);

            const handlers = {
                openNewWorkModal: vi.fn(),
            };

            renderHook(() => useAppShortcuts(handlers));

            pressKey(ALT_N);
            expect(handlers.openNewWorkModal).not.toHaveBeenCalled();

            pressKey({ key: "q", altKey: true });
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);
        });

        it("다른 단축키가 쓰는 키로 바꾸면 거부되고 기존 키 매핑이 유지됨", () => {
            const result = useShortcutStore.getState().setShortcutKeys("new-work", "Alt+S");
            expect(result.success).toBe(false);
            expect(result.message).toContain("이미");
            expect(useShortcutStore.getState().getShortcut("new-work")?.keys).toBe("Alt+N");

            const handlers = {
                openNewWorkModal: vi.fn(),
                toggleTimer: vi.fn(),
            };

            renderHook(() => useAppShortcuts(handlers));

            pressKey(ALT_S);
            expect(handlers.toggleTimer).toHaveBeenCalledTimes(1);
            expect(handlers.openNewWorkModal).not.toHaveBeenCalled();

            pressKey(ALT_N);
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);
        });
    });

    describe("훅 언마운트", () => {
        it("언마운트 후에는 핸들러가 호출되지 않음", () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            };

            const { unmount } = renderHook(() => useAppShortcuts(handlers));

            pressKey(ALT_N);
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);

            unmount();

            pressKey(ALT_N);
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);
        });
    });
});
