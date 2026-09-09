import type { ShortcutBinding, ShortcutBindingInput } from "./types";
import { eventToKeyString, hasModifier, normalizeKeys } from "./key_matcher";
import { isEditableTarget, resolveBinding } from "./binding_resolver";

let bindings: ShortcutBinding[] = [];
let layer_stack: string[] = [];
let listener_count = 0;
let is_listening = false;

function defaultInputPolicy(keys: string): ShortcutBinding["input_policy"] {
    return hasModifier(keys) ? "allow" : "block";
}

function handleKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (event.repeat) return;

    const binding = resolveBinding({
        bindings,
        event_keys: eventToKeyString(event),
        active_layer_id: getActiveLayerId(),
        is_editable_target: isEditableTarget(event.target),
    });

    if (!binding) return;

    if (binding.prevent_default) {
        event.preventDefault();
        event.stopPropagation();
    }

    binding.handler(event);
}

/**
 * 전역 keydown 리스너 설치
 *
 * capture 단계에서 처리하므로 포털로 렌더된 드롭다운/피커 안에서도 동작한다.
 * 중복 호출해도 리스너는 하나만 유지되며, 반환된 해제 함수를 모두 호출해야 제거된다.
 */
export function installShortcutListener(): () => void {
    listener_count += 1;

    if (!is_listening) {
        window.addEventListener("keydown", handleKeyDown, true);
        is_listening = true;
    }

    return () => {
        listener_count -= 1;
        if (listener_count <= 0 && is_listening) {
            window.removeEventListener("keydown", handleKeyDown, true);
            is_listening = false;
            listener_count = 0;
        }
    };
}

/**
 * 단축키 바인딩 등록
 *
 * @returns 등록 해제 함수
 */
export function registerBinding(input: ShortcutBindingInput): () => void {
    const binding: ShortcutBinding = {
        scope: "global",
        enabled: true,
        priority: 0,
        prevent_default: true,
        input_policy: input.input_policy ?? defaultInputPolicy(input.keys),
        ...input,
        keys: normalizeKeys(input.keys),
    };

    bindings = [...bindings.filter((b) => b.id !== binding.id), binding];

    return () => {
        bindings = bindings.filter((b) => b !== binding);
    };
}

/**
 * 레이어(모달/오버레이) 열기
 *
 * 열려 있는 동안 global 스코프 단축키는 모두 차단되고,
 * 이 레이어에 등록된 단축키만 동작한다.
 *
 * @param layer_id 호출부가 관리하는 고유 id
 * @returns 레이어를 닫는 함수
 */
export function openLayer(layer_id: string): () => void {
    layer_stack = [...layer_stack.filter((id) => id !== layer_id), layer_id];

    return () => {
        layer_stack = layer_stack.filter((id) => id !== layer_id);
    };
}

export function getActiveLayerId(): string | null {
    return layer_stack.length > 0 ? layer_stack[layer_stack.length - 1] : null;
}

export function getLayerDepth(): number {
    return layer_stack.length;
}

export function getRegisteredBindings(): ShortcutBinding[] {
    return [...bindings];
}

/**
 * 테스트용 초기화
 */
export function resetShortcutManager(): void {
    bindings = [];
    layer_stack = [];
}
