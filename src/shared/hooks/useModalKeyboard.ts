import { type RefObject } from "react";
import { useShortcutStore } from "@/store/useShortcutStore";
import { DEFAULT_MODAL_SUBMIT_KEYS, MODAL_SUBMIT_SHORTCUT_ID } from "@/shared/constants";
import { useShortcutLayer } from "./useShortcutLayer";
import { useShortcut } from "./useShortcut";
import { useFocusLayer } from "./useFocusLayer";

export interface UseModalKeyboardOptions {
    open: boolean;
    /** 제출 단축키를 눌렀을 때 실행. 없으면 제출 단축키를 걸지 않는다 */
    onSubmit?: () => void;
    container_ref?: RefObject<HTMLElement | null>;
    initial_ref?: RefObject<HTMLElement | null>;
    /** 자동 포커스 이동 여부 (기본 true) */
    auto_focus?: boolean;
    /** 닫을 때 포커스 복원 여부 (기본 true) */
    restore_focus?: boolean;
}

export interface UseModalKeyboardReturn {
    /** 이 모달의 단축키 레이어 id. 추가 단축키를 걸 때 사용한다 */
    layer_id: string | undefined;
    /** 제출 단축키 표시용 문자열 (예: "F8") */
    submit_keys: string;
}

/**
 * 모달의 단축키 레이어와 포커스를 한 번에 관리한다
 *
 * - 열려 있는 동안 전역 단축키를 차단한다
 * - 설정된 제출 단축키(기본 F8)를 모달 스코프로 등록한다
 * - 열릴 때 첫 입력으로 포커스를 옮기고, 닫힐 때 원래 자리로 되돌린다
 */
export function useModalKeyboard({
    open,
    onSubmit,
    container_ref,
    initial_ref,
    auto_focus = true,
    restore_focus = true,
}: UseModalKeyboardOptions): UseModalKeyboardReturn {
    const layer_id = useShortcutLayer(open);

    const submit_keys = useShortcutStore(
        (state) =>
            state.shortcuts.find((s) => s.id === MODAL_SUBMIT_SHORTCUT_ID)
                ?.keys ?? DEFAULT_MODAL_SUBMIT_KEYS
    );

    useShortcut({
        keys: submit_keys,
        scope: "layer",
        layer_id,
        input_policy: "allow",
        enabled: Boolean(open && onSubmit),
        handler: () => onSubmit?.(),
    });

    useFocusLayer({
        open,
        container_ref,
        initial_ref,
        auto_focus,
        restore: restore_focus,
    });

    return { layer_id, submit_keys };
}
