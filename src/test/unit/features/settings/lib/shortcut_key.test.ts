import type { KeyboardEvent } from "react";

import { keyEventToKeyString } from "@/features/settings/lib/shortcut_key";

interface MockKeyboardEventInit {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
}

function mock_react_keyboard_event(
    event_init: MockKeyboardEventInit
): KeyboardEvent<HTMLElement> {
    return {
        key: event_init.key,
        ctrlKey: event_init.ctrlKey ?? false,
        metaKey: event_init.metaKey ?? false,
        altKey: event_init.altKey ?? false,
        shiftKey: event_init.shiftKey ?? false,
    } as KeyboardEvent<HTMLElement>;
}

describe("keyEventToKeyString", () => {
    describe("수정자 단독 키는 null", () => {
        it.each([
            ["Control"],
            ["Alt"],
            ["Shift"],
            ["Meta"],
        ] as const)("키가 %s일 때 null을 반환한다", (modifier_key) => {
            const mock_event = mock_react_keyboard_event({ key: modifier_key });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBeNull();
        });
    });

    describe("Escape", () => {
        it("Escape는 null을 반환한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "Escape",
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBeNull();
        });
    });

    describe("수정자 없음", () => {
        it.each([
            ["a"],
            ["Enter"],
            ["Tab"],
            ["F1"],
        ] as const)("수정자 없이 %s만 누르면 null을 반환한다", (plain_key) => {
            const mock_event = mock_react_keyboard_event({ key: plain_key });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBeNull();
        });
    });

    describe("Ctrl+키", () => {
        it("ctrlKey와 단일 문자면 Ctrl와 대문자로 조합한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "a",
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Ctrl+A");
        });
    });

    describe("Meta+키", () => {
        it("metaKey는 Ctrl 레이블로 매핑된다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "z",
                metaKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Ctrl+Z");
        });
    });

    describe("Alt+키", () => {
        it("altKey와 키를 Alt+ 형태로 반환한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "n",
                altKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Alt+N");
        });
    });

    describe("Shift+키", () => {
        it("shiftKey와 키를 Shift+ 형태로 반환한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "b",
                shiftKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Shift+B");
        });
    });

    describe("복합 수정자", () => {
        it("Ctrl+Alt+키 순서로 조합한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "k",
                ctrlKey: true,
                altKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Ctrl+Alt+K");
        });

        it("Ctrl+Shift+키 순서로 조합한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "s",
                ctrlKey: true,
                shiftKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Ctrl+Shift+S");
        });

        it("Ctrl+Alt+Shift+키 순서로 조합한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: "d",
                ctrlKey: true,
                altKey: true,
                shiftKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Ctrl+Alt+Shift+D");
        });
    });

    describe("방향키 매핑", () => {
        it.each([
            ["ArrowLeft", "Left"],
            ["ArrowRight", "Right"],
            ["ArrowUp", "Up"],
            ["ArrowDown", "Down"],
        ] as const)("Ctrl+%s는 Ctrl+%s로 반환한다", (arrow_key, expected_suffix) => {
            const mock_event = mock_react_keyboard_event({
                key: arrow_key,
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe(`Ctrl+${expected_suffix}`);
        });
    });

    describe("Space 매핑", () => {
        it("공백 키는 Space로 표기한다", () => {
            const mock_event = mock_react_keyboard_event({
                key: " ",
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe("Ctrl+Space");
        });
    });

    describe("단일 문자 대문자화", () => {
        it.each([
            ["a", "A"],
            ["z", "Z"],
        ] as const)("Ctrl+%s는 Ctrl+%s이다", (lower, upper) => {
            const mock_event = mock_react_keyboard_event({
                key: lower,
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe(`Ctrl+${upper}`);
        });
    });

    describe("특수 키 문자열 유지", () => {
        it.each([
            ["F1", "Ctrl+F1"],
            ["Enter", "Ctrl+Enter"],
            ["Tab", "Ctrl+Tab"],
        ] as const)("%s는 그대로 붙인다", (special_key, expected) => {
            const mock_event = mock_react_keyboard_event({
                key: special_key,
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe(expected);
        });
    });

    describe("여러 글자 키 문자열 유지", () => {
        it.each([
            ["Delete", "Ctrl+Delete"],
            ["Backspace", "Ctrl+Backspace"],
        ] as const)("%s는 그대로 유지한다", (multi_char_key, expected) => {
            const mock_event = mock_react_keyboard_event({
                key: multi_char_key,
                ctrlKey: true,
            });

            const result = keyEventToKeyString(mock_event);

            expect(result).toBe(expected);
        });
    });
});
