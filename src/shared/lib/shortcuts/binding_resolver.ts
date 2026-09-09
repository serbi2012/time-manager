import type { ShortcutBinding } from "./types";
import { normalizeKeys } from "./key_matcher";

const EDITABLE_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

/**
 * 이벤트 대상이 텍스트를 입력받는 요소인지 판단
 */
export function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    if (EDITABLE_TAGS.includes(target.tagName)) return true;

    return target.closest('[contenteditable="true"]') !== null;
}

export interface ResolveBindingInput {
    bindings: ShortcutBinding[];
    /** 이벤트에서 얻은 정규화된 키 조합 */
    event_keys: string;
    /** 최상단 레이어 id (열린 레이어가 없으면 null) */
    active_layer_id: string | null;
    /** 입력 요소에 포커스가 있는지 */
    is_editable_target: boolean;
}

/**
 * 현재 상황에서 실행할 바인딩 하나를 고른다
 *
 * 규칙:
 * 1. 레이어가 열려 있으면 최상단 레이어의 바인딩만 후보가 된다 (global 차단)
 * 2. 입력 중에는 input_policy가 "allow"인 것만 후보가 된다
 * 3. 후보가 여럿이면 priority가 높은 것, 같으면 나중에 등록된 것
 */
export function resolveBinding({
    bindings,
    event_keys,
    active_layer_id,
    is_editable_target,
}: ResolveBindingInput): ShortcutBinding | null {
    if (!event_keys) return null;

    const candidates = bindings.filter((binding) => {
        if (!binding.enabled) return false;
        if (normalizeKeys(binding.keys) !== event_keys) return false;

        if (is_editable_target && binding.input_policy !== "allow") {
            return false;
        }

        if (active_layer_id === null) {
            return binding.scope === "global";
        }

        return binding.scope === "layer" && binding.layer_id === active_layer_id;
    });

    if (candidates.length === 0) return null;

    return candidates.reduce((best, current) =>
        current.priority >= best.priority ? current : best
    );
}
