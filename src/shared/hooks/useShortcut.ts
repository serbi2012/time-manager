import { useEffect, useId, useRef } from "react";
import {
    type ShortcutInputPolicy,
    type ShortcutScope,
    installShortcutListener,
    registerBinding,
} from "@/shared/lib/shortcuts";

export interface UseShortcutOptions {
    /** 키 조합 (예: "Alt+N", "F8"). 빈 값이면 등록하지 않는다 */
    keys: string;
    handler: (event: KeyboardEvent) => void;
    /** 기본 global. 모달 안에서는 useShortcutLayer가 준 layer_id와 함께 "layer" */
    scope?: ShortcutScope;
    layer_id?: string;
    /** 입력 중 동작 여부. 생략하면 수식어 유무로 자동 결정 */
    input_policy?: ShortcutInputPolicy;
    enabled?: boolean;
    priority?: number;
    prevent_default?: boolean;
}

/**
 * 단축키 하나를 등록한다
 *
 * handler는 ref로 보관하므로 매 렌더마다 새 함수를 넘겨도 재등록되지 않는다.
 */
export function useShortcut({
    keys,
    handler,
    scope = "global",
    layer_id,
    input_policy,
    enabled = true,
    priority = 0,
    prevent_default = true,
}: UseShortcutOptions): void {
    const auto_id = useId();
    const handler_ref = useRef(handler);

    useEffect(() => {
        handler_ref.current = handler;
    }, [handler]);

    // 앱 루트에서 설치하지만, 단독으로 쓰여도 동작하도록 참조를 하나 더 잡는다
    useEffect(() => installShortcutListener(), []);

    useEffect(() => {
        if (!enabled || !keys) return;
        if (scope === "layer" && !layer_id) return;

        return registerBinding({
            id: auto_id,
            keys,
            scope,
            layer_id,
            input_policy,
            enabled: true,
            priority,
            prevent_default,
            handler: (event) => handler_ref.current(event),
        });
    }, [
        auto_id,
        keys,
        scope,
        layer_id,
        input_policy,
        enabled,
        priority,
        prevent_default,
    ]);
}
