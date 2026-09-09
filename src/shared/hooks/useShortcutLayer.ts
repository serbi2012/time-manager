import { useEffect, useId } from "react";
import { openLayer } from "@/shared/lib/shortcuts";

/**
 * 모달/오버레이가 열려 있는 동안 단축키 레이어를 연다
 *
 * 레이어가 열려 있으면 global 스코프 단축키는 모두 차단되고,
 * 반환된 layer_id로 등록한 단축키만 동작한다.
 *
 * @param open 열림 여부
 * @returns 열려 있으면 layer_id, 닫혀 있으면 undefined
 */
export function useShortcutLayer(open: boolean): string | undefined {
    const layer_id = useId();

    useEffect(() => {
        if (!open) return;
        return openLayer(layer_id);
    }, [open, layer_id]);

    return open ? layer_id : undefined;
}
