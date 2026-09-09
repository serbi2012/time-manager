import { describe, it, expect } from "vitest";
import {
    normalizeKeyName,
    normalizeKeys,
    eventToKeyString,
    matchesKeys,
    hasModifier,
    formatKeysForDisplay,
} from "@/shared/lib/shortcuts";

function createEvent(init: KeyboardEventInit): KeyboardEvent {
    return new KeyboardEvent("keydown", init);
}

describe("normalizeKeyName", () => {
    it("한 글자 키를 대문자로 만든다", () => {
        expect(normalizeKeyName("n")).toBe("N");
    });

    it("방향키를 짧은 이름으로 바꾼다", () => {
        expect(normalizeKeyName("ArrowLeft")).toBe("Left");
        expect(normalizeKeyName("ArrowDown")).toBe("Down");
    });

    it("펑션키를 대문자로 만든다", () => {
        expect(normalizeKeyName("f8")).toBe("F8");
        expect(normalizeKeyName("F12")).toBe("F12");
    });

    it("공백을 Space로 바꾼다", () => {
        expect(normalizeKeyName(" ")).toBe("Space");
    });

    it("수식어 별칭을 표준 이름으로 바꾼다", () => {
        expect(normalizeKeyName("control")).toBe("Ctrl");
        expect(normalizeKeyName("cmd")).toBe("Meta");
        expect(normalizeKeyName("esc")).toBe("Escape");
    });
});

describe("normalizeKeys", () => {
    it("수식어 순서를 Ctrl-Alt-Shift-Meta로 통일한다", () => {
        expect(normalizeKeys("shift+alt+n")).toBe("Alt+Shift+N");
        expect(normalizeKeys("Alt+Shift+N")).toBe("Alt+Shift+N");
    });

    it("공백을 무시한다", () => {
        expect(normalizeKeys(" alt + n ")).toBe("Alt+N");
    });

    it("수식어 없는 단일 키도 처리한다", () => {
        expect(normalizeKeys("f8")).toBe("F8");
    });
});

describe("eventToKeyString", () => {
    it("수식어 없는 키를 변환한다", () => {
        expect(eventToKeyString(createEvent({ key: "F8" }))).toBe("F8");
    });

    it("Alt 조합을 변환한다", () => {
        expect(eventToKeyString(createEvent({ key: "n", altKey: true }))).toBe(
            "Alt+N"
        );
    });

    it("여러 수식어를 정해진 순서로 붙인다", () => {
        const event = createEvent({
            key: "s",
            altKey: true,
            shiftKey: true,
            ctrlKey: true,
        });

        expect(eventToKeyString(event)).toBe("Ctrl+Alt+Shift+S");
    });

    it("수식어 키만 누르면 수식어만 남는다", () => {
        expect(eventToKeyString(createEvent({ key: "Alt", altKey: true }))).toBe(
            "Alt"
        );
    });

    it("방향키를 짧은 이름으로 변환한다", () => {
        const event = createEvent({ key: "ArrowRight", altKey: true });

        expect(eventToKeyString(event)).toBe("Alt+Right");
    });
});

describe("matchesKeys", () => {
    it("표기가 달라도 같은 조합이면 일치한다", () => {
        const event = createEvent({ key: "n", altKey: true });

        expect(matchesKeys(event, "alt+n")).toBe(true);
        expect(matchesKeys(event, "Alt+N")).toBe(true);
    });

    it("수식어가 다르면 일치하지 않는다", () => {
        const event = createEvent({ key: "n", altKey: true });

        expect(matchesKeys(event, "Ctrl+N")).toBe(false);
        expect(matchesKeys(event, "N")).toBe(false);
    });

    it("빈 키 문자열은 일치하지 않는다", () => {
        expect(matchesKeys(createEvent({ key: "n" }), "")).toBe(false);
    });
});

describe("hasModifier", () => {
    it("수식어가 있으면 true", () => {
        expect(hasModifier("Alt+N")).toBe(true);
        expect(hasModifier("Ctrl+Shift+S")).toBe(true);
    });

    it("수식어가 없으면 false", () => {
        expect(hasModifier("F8")).toBe(false);
        expect(hasModifier("Enter")).toBe(false);
    });
});

describe("formatKeysForDisplay", () => {
    it("맥에서는 기호로 표시한다", () => {
        expect(formatKeysForDisplay("Alt+N", true)).toBe("⌥ N");
    });

    it("맥이 아니면 그대로 표시한다", () => {
        expect(formatKeysForDisplay("Alt+N", false)).toBe("Alt+N");
    });
});
