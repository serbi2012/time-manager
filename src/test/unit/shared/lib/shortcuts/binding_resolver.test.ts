import { describe, it, expect } from "vitest";
import {
    isEditableTarget,
    resolveBinding,
    type ShortcutBinding,
} from "@/shared/lib/shortcuts";

function createBinding(
    overrides: Partial<ShortcutBinding> & Pick<ShortcutBinding, "id" | "keys">
): ShortcutBinding {
    return {
        scope: "global",
        input_policy: "allow",
        enabled: true,
        priority: 0,
        prevent_default: true,
        handler: () => {},
        ...overrides,
    };
}

describe("isEditableTarget", () => {
    it("input은 편집 대상이다", () => {
        expect(isEditableTarget(document.createElement("input"))).toBe(true);
    });

    it("textarea는 편집 대상이다", () => {
        expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
    });

    it("일반 div는 편집 대상이 아니다", () => {
        expect(isEditableTarget(document.createElement("div"))).toBe(false);
    });

    it("contenteditable 요소는 편집 대상이다", () => {
        const div = document.createElement("div");
        div.setAttribute("contenteditable", "true");
        document.body.appendChild(div);

        expect(isEditableTarget(div)).toBe(true);

        document.body.removeChild(div);
    });

    it("null은 편집 대상이 아니다", () => {
        expect(isEditableTarget(null)).toBe(false);
    });
});

describe("resolveBinding", () => {
    const global_binding = createBinding({ id: "g", keys: "Alt+N" });

    it("레이어가 없으면 global 바인딩을 고른다", () => {
        const result = resolveBinding({
            bindings: [global_binding],
            event_keys: "Alt+N",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result?.id).toBe("g");
    });

    it("키가 다르면 아무것도 고르지 않는다", () => {
        const result = resolveBinding({
            bindings: [global_binding],
            event_keys: "Alt+M",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result).toBeNull();
    });

    it("비활성 바인딩은 고르지 않는다", () => {
        const result = resolveBinding({
            bindings: [{ ...global_binding, enabled: false }],
            event_keys: "Alt+N",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result).toBeNull();
    });

    it("레이어가 열리면 global 바인딩을 차단한다", () => {
        const result = resolveBinding({
            bindings: [global_binding],
            event_keys: "Alt+N",
            active_layer_id: "layer-1",
            is_editable_target: false,
        });

        expect(result).toBeNull();
    });

    it("최상단 레이어의 바인딩만 고른다", () => {
        const bindings = [
            createBinding({
                id: "l1",
                keys: "F8",
                scope: "layer",
                layer_id: "layer-1",
            }),
            createBinding({
                id: "l2",
                keys: "F8",
                scope: "layer",
                layer_id: "layer-2",
            }),
        ];

        const result = resolveBinding({
            bindings,
            event_keys: "F8",
            active_layer_id: "layer-2",
            is_editable_target: false,
        });

        expect(result?.id).toBe("l2");
    });

    it("입력 중에는 block 정책 바인딩을 건너뛴다", () => {
        const result = resolveBinding({
            bindings: [{ ...global_binding, input_policy: "block" }],
            event_keys: "Alt+N",
            active_layer_id: null,
            is_editable_target: true,
        });

        expect(result).toBeNull();
    });

    it("입력 중에도 allow 정책 바인딩은 고른다", () => {
        const result = resolveBinding({
            bindings: [{ ...global_binding, input_policy: "allow" }],
            event_keys: "Alt+N",
            active_layer_id: null,
            is_editable_target: true,
        });

        expect(result?.id).toBe("g");
    });

    it("같은 키가 겹치면 priority가 높은 것을 고른다", () => {
        const bindings = [
            createBinding({ id: "low", keys: "Alt+N", priority: 0 }),
            createBinding({ id: "high", keys: "Alt+N", priority: 10 }),
        ];

        const result = resolveBinding({
            bindings,
            event_keys: "Alt+N",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result?.id).toBe("high");
    });

    it("priority가 같으면 나중에 등록된 것을 고른다", () => {
        const bindings = [
            createBinding({ id: "first", keys: "Alt+N" }),
            createBinding({ id: "second", keys: "Alt+N" }),
        ];

        const result = resolveBinding({
            bindings,
            event_keys: "Alt+N",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result?.id).toBe("second");
    });

    it("빈 이벤트 키는 아무것도 고르지 않는다", () => {
        const result = resolveBinding({
            bindings: [global_binding],
            event_keys: "",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result).toBeNull();
    });

    it("바인딩 키 표기가 달라도 정규화해서 비교한다", () => {
        const result = resolveBinding({
            bindings: [createBinding({ id: "g", keys: "shift+alt+n" })],
            event_keys: "Alt+Shift+N",
            active_layer_id: null,
            is_editable_target: false,
        });

        expect(result?.id).toBe("g");
    });
});
