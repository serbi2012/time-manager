import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

// crypto.randomUUID mock (jsdom에서 지원 안함)
if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`;
    };
}

// 각 테스트 전에 localStorage 초기화
beforeEach(() => {
    localStorage.clear();
});
