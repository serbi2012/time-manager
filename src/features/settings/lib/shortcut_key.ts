/**
 * 키보드 이벤트를 단축키 문자열로 변환 (순수 함수)
 */

import type { KeyboardEvent } from "react";

/**
 * 키 입력을 "Ctrl+Alt+Key" 형태 문자열로 변환.
 * 수정자 키만 누른 경우, Escape, 단독 문자 키는 null 반환.
 */
export function keyEventToKeyString(
    e: KeyboardEvent<HTMLElement> | KeyboardEvent<Element>
): string | null {
    const key = e.key;

    if (["Control", "Alt", "Shift", "Meta"].includes(key)) {
        return null;
    }

    if (key === "Escape") {
        return null;
    }

    const parts: string[] = [];

    if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");

    if (parts.length === 0) {
        return null;
    }

    let main_key = key;
    if (key === "ArrowLeft") main_key = "Left";
    else if (key === "ArrowRight") main_key = "Right";
    else if (key === "ArrowUp") main_key = "Up";
    else if (key === "ArrowDown") main_key = "Down";
    else if (key === " ") main_key = "Space";
    else if (key.length === 1) main_key = key.toUpperCase();

    parts.push(main_key);
    return parts.join("+");
}
