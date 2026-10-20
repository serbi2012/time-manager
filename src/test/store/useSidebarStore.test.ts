import { describe, it, expect, beforeEach } from "vitest";
import { useSidebarStore } from "@/store/useSidebarStore";
import { STORAGE_KEYS } from "@/shared/constants";

describe("useSidebarStore", () => {
    beforeEach(() => {
        useSidebarStore.setState({ is_collapsed: false });
        localStorage.removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    });

    it("기본값은 펼친 상태다", () => {
        expect(useSidebarStore.getState().is_collapsed).toBe(false);
    });

    it("toggleCollapsed는 접힘 상태를 뒤집는다", () => {
        useSidebarStore.getState().toggleCollapsed();
        expect(useSidebarStore.getState().is_collapsed).toBe(true);

        useSidebarStore.getState().toggleCollapsed();
        expect(useSidebarStore.getState().is_collapsed).toBe(false);
    });

    it("접힘 상태를 localStorage에 저장한다", () => {
        useSidebarStore.getState().toggleCollapsed();

        const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored ?? "{}").state).toEqual({
            is_collapsed: true,
        });
    });
});
