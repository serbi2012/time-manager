import { create } from "mutative";
import type { CodeMap } from "../types";

/**
 * 이름-코드 매핑을 갱신한 새 맵을 반환
 *
 * 코드가 비어 있으면 해당 항목을 제거한다.
 * 이름이 비어 있으면 갱신하지 않고 null을 반환한다.
 */
export function updateCodeMap(
    map: CodeMap,
    name: string,
    code: string
): CodeMap | null {
    const trimmed_name = name.trim();
    if (!trimmed_name) return null;

    const trimmed_code = code.trim();

    return create(map, (draft) => {
        if (trimmed_code) {
            draft[trimmed_name] = trimmed_code;
        } else {
            delete draft[trimmed_name];
        }
    });
}

/**
 * 이름으로 코드를 조회, 없으면 빈 문자열
 */
export function getCodeFromMap(map: CodeMap, name: string): string {
    return map[name.trim()] || "";
}
