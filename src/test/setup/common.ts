import { afterEach, vi } from "vitest";

let uuid_counter = 0;

vi.stubGlobal("crypto", {
    randomUUID: () => `test-uuid-${++uuid_counter}`,
});

function createLocalStorageMock(): Storage {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
    };
}

const local_storage_mock = createLocalStorageMock();

Object.defineProperty(globalThis, "localStorage", {
    value: local_storage_mock,
    configurable: true,
});

if (typeof window !== "undefined" && window !== globalThis) {
    Object.defineProperty(window, "localStorage", {
        value: local_storage_mock,
        configurable: true,
    });
}

afterEach(() => {
    uuid_counter = 0;
    localStorage.clear();
});
