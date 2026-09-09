const MODIFIER_KEYS = ["Control", "Alt", "Shift", "Meta"];

const MODIFIER_ORDER = ["Ctrl", "Alt", "Shift", "Meta"] as const;

const SPECIAL_KEY_ALIASES: Record<string, string> = {
    arrowleft: "Left",
    arrowright: "Right",
    arrowup: "Up",
    arrowdown: "Down",
    " ": "Space",
    space: "Space",
    esc: "Escape",
    escape: "Escape",
    enter: "Enter",
    return: "Enter",
    del: "Delete",
    delete: "Delete",
    backspace: "Backspace",
    tab: "Tab",
    ctrl: "Ctrl",
    control: "Ctrl",
    alt: "Alt",
    option: "Alt",
    shift: "Shift",
    meta: "Meta",
    cmd: "Meta",
    command: "Meta",
};

const DISPLAY_SYMBOLS: Record<string, string> = {
    Ctrl: "⌃",
    Alt: "⌥",
    Shift: "⇧",
    Meta: "⌘",
    Left: "←",
    Right: "→",
    Up: "↑",
    Down: "↓",
};

/**
 * 키 이름 하나를 표준 표기로 정규화
 *
 * 예: "arrowleft" → "Left", "n" → "N", "f8" → "F8"
 */
export function normalizeKeyName(key: string): string {
    const lower = key.toLowerCase();

    const alias = SPECIAL_KEY_ALIASES[lower];
    if (alias) return alias;

    if (/^f([1-9]|1[0-9]|2[0-4])$/.test(lower)) {
        return lower.toUpperCase();
    }

    if (key.length === 1) return key.toUpperCase();

    return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * 키 조합 문자열을 표준 표기로 정규화
 *
 * 수식어 순서를 Ctrl → Alt → Shift → Meta로 통일한다.
 * 예: "shift+alt+n" → "Alt+Shift+N"
 */
export function normalizeKeys(keys: string): string {
    const parts = keys
        .split("+")
        .map((p) => p.trim())
        .filter(Boolean)
        .map(normalizeKeyName);

    const modifiers = MODIFIER_ORDER.filter((m) => parts.includes(m));
    const main_keys = parts.filter(
        (p) => !MODIFIER_ORDER.includes(p as (typeof MODIFIER_ORDER)[number])
    );

    return [...modifiers, ...main_keys].join("+");
}

/**
 * 키보드 이벤트를 표준 키 조합 문자열로 변환
 *
 * 수식어 키 자체를 누른 경우 수식어만 담긴 문자열을 반환한다.
 */
export function eventToKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push("Ctrl");
    if (event.altKey) parts.push("Alt");
    if (event.shiftKey) parts.push("Shift");
    if (event.metaKey) parts.push("Meta");

    if (!MODIFIER_KEYS.includes(event.key)) {
        parts.push(normalizeKeyName(event.key));
    }

    return parts.join("+");
}

/**
 * 이벤트가 특정 키 조합과 일치하는지 판단
 */
export function matchesKeys(event: KeyboardEvent, keys: string): boolean {
    if (!keys) return false;
    return eventToKeyString(event) === normalizeKeys(keys);
}

/**
 * 키 조합에 수식어(Ctrl/Alt/Shift/Meta)가 포함되어 있는지
 */
export function hasModifier(keys: string): boolean {
    const normalized = normalizeKeys(keys);
    return MODIFIER_ORDER.some((m) => normalized.split("+").includes(m));
}

/**
 * 키 조합을 화면 표시용 문자열로 변환
 *
 * @param is_mac true면 수식어를 기호로 표시한다
 */
export function formatKeysForDisplay(keys: string, is_mac: boolean): string {
    const normalized = normalizeKeys(keys);

    if (!is_mac) return normalized;

    return normalized
        .split("+")
        .map((part) => DISPLAY_SYMBOLS[part] ?? part)
        .join(" ");
}

/**
 * 실행 중인 플랫폼에 맞춰 키 조합을 표시용으로 변환
 */
export function formatShortcutForPlatform(keys: string): string {
    const is_mac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac");

    return formatKeysForDisplay(keys, is_mac);
}
