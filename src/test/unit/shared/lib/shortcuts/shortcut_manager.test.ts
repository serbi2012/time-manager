import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    installShortcutListener,
    registerBinding,
    openLayer,
    getActiveLayerId,
    getLayerDepth,
    getRegisteredBindings,
    resetShortcutManager,
} from "@/shared/lib/shortcuts";

function press(init: KeyboardEventInit, target?: HTMLElement): void {
    const event = new KeyboardEvent("keydown", { bubbles: true, ...init });
    (target ?? window).dispatchEvent(event);
}

describe("shortcut_manager", () => {
    let uninstall: () => void;

    beforeEach(() => {
        resetShortcutManager();
        uninstall = installShortcutListener();
    });

    afterEach(() => {
        uninstall();
        resetShortcutManager();
    });

    it("등록한 단축키가 키 입력에 반응한다", () => {
        const handler = vi.fn();
        registerBinding({ id: "a", keys: "Alt+N", handler });

        press({ key: "n", altKey: true });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("해제하면 더 이상 반응하지 않는다", () => {
        const handler = vi.fn();
        const release = registerBinding({ id: "a", keys: "Alt+N", handler });

        release();
        press({ key: "n", altKey: true });

        expect(handler).not.toHaveBeenCalled();
    });

    it("같은 id로 다시 등록하면 이전 것을 대체한다", () => {
        const first = vi.fn();
        const second = vi.fn();

        registerBinding({ id: "same", keys: "Alt+N", handler: first });
        registerBinding({ id: "same", keys: "Alt+N", handler: second });

        press({ key: "n", altKey: true });

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
        expect(getRegisteredBindings()).toHaveLength(1);
    });

    it("레이어가 열리면 전역 단축키를 막는다", () => {
        const handler = vi.fn();
        registerBinding({ id: "a", keys: "Alt+N", handler });

        const close = openLayer("modal-1");
        press({ key: "n", altKey: true });

        expect(handler).not.toHaveBeenCalled();

        close();
        press({ key: "n", altKey: true });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("레이어 단축키는 그 레이어가 최상단일 때만 동작한다", () => {
        const handler = vi.fn();
        const close_first = openLayer("modal-1");

        registerBinding({
            id: "layer-binding",
            keys: "F8",
            scope: "layer",
            layer_id: "modal-1",
            handler,
        });

        press({ key: "F8" });
        expect(handler).toHaveBeenCalledTimes(1);

        const close_second = openLayer("modal-2");
        press({ key: "F8" });
        expect(handler).toHaveBeenCalledTimes(1);

        close_second();
        press({ key: "F8" });
        expect(handler).toHaveBeenCalledTimes(2);

        close_first();
    });

    it("수식어 없는 단일 키는 입력 중 동작하지 않는다", () => {
        const handler = vi.fn();
        registerBinding({ id: "a", keys: "Delete", handler });

        const input = document.createElement("input");
        document.body.appendChild(input);

        press({ key: "Delete" }, input);
        expect(handler).not.toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it("수식어가 있으면 입력 중에도 동작한다", () => {
        const handler = vi.fn();
        registerBinding({ id: "a", keys: "Alt+N", handler });

        const input = document.createElement("input");
        document.body.appendChild(input);

        press({ key: "n", altKey: true }, input);
        expect(handler).toHaveBeenCalledTimes(1);

        document.body.removeChild(input);
    });

    it("input_policy를 allow로 주면 단일 키도 입력 중 동작한다", () => {
        const handler = vi.fn();
        registerBinding({
            id: "a",
            keys: "F8",
            input_policy: "allow",
            handler,
        });

        const input = document.createElement("input");
        document.body.appendChild(input);

        press({ key: "F8" }, input);
        expect(handler).toHaveBeenCalledTimes(1);

        document.body.removeChild(input);
    });

    it("키를 누르고 있는 반복 입력은 무시한다", () => {
        const handler = vi.fn();
        registerBinding({ id: "a", keys: "Alt+N", handler });

        press({ key: "n", altKey: true, repeat: true });

        expect(handler).not.toHaveBeenCalled();
    });

    it("레이어 깊이와 최상단 id를 알려준다", () => {
        expect(getActiveLayerId()).toBeNull();
        expect(getLayerDepth()).toBe(0);

        const close_a = openLayer("a");
        const close_b = openLayer("b");

        expect(getActiveLayerId()).toBe("b");
        expect(getLayerDepth()).toBe(2);

        close_b();
        expect(getActiveLayerId()).toBe("a");

        close_a();
        expect(getActiveLayerId()).toBeNull();
    });

    it("같은 레이어를 두 번 열어도 중복 쌓이지 않는다", () => {
        openLayer("dup");
        openLayer("dup");

        expect(getLayerDepth()).toBe(1);
    });

    it("prevent_default가 false면 기본 동작을 막지 않는다", () => {
        registerBinding({
            id: "a",
            keys: "Alt+N",
            prevent_default: false,
            handler: () => {},
        });

        const event = new KeyboardEvent("keydown", {
            key: "n",
            altKey: true,
            cancelable: true,
        });
        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });

    it("기본값은 기본 동작을 막는다", () => {
        registerBinding({ id: "a", keys: "Alt+N", handler: () => {} });

        const event = new KeyboardEvent("keydown", {
            key: "n",
            altKey: true,
            cancelable: true,
        });
        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });
});
