/**
 * Form Slice
 *
 * 폼 데이터 상태 및 액션
 */

import type { StateCreator } from "zustand";
import { create } from "mutative";
import type { FormSlice, WorkFormData, WorkStore } from "../types";
import { DEFAULT_FORM_DATA } from "../constants";

export const createFormSlice: StateCreator<WorkStore, [], [], FormSlice> = (
    set
) => ({
    // ============================================
    // State
    // ============================================
    form_data: DEFAULT_FORM_DATA,

    // ============================================
    // Actions
    // ============================================

    setFormData: (data: Partial<WorkFormData>) => {
        set(
            create((state) => {
                Object.assign(state.form_data, data);
            })
        );
    },

    resetFormData: () => {
        set({ form_data: DEFAULT_FORM_DATA });
    },
});
