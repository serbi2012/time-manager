import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/shared/constants";

interface SidebarState {
    is_collapsed: boolean;
    toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            is_collapsed: false,
            toggleCollapsed: () =>
                set((state) => ({ is_collapsed: !state.is_collapsed })),
        }),
        {
            name: STORAGE_KEYS.SIDEBAR_COLLAPSED,
            partialize: (state) => ({ is_collapsed: state.is_collapsed }),
        }
    )
);
