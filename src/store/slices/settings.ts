/**
 * Settings Slice
 *
 * 앱 설정 상태 및 액션
 * - 테마, 점심시간, 트랜지션
 * - 사용자 정의 옵션 (task, category)
 * - 숨김 자동완성 옵션
 */

import type { StateCreator } from "zustand";
import { create } from "mutative";
import type {
    SettingsSlice,
    AppTheme,
    TransitionSpeed,
    HiddenAutoCompleteField,
    WorkStore,
} from "../types";
import {
    DEFAULT_HIDDEN_AUTOCOMPLETE_OPTIONS,
    DEFAULT_LUNCH_START_TIME,
    DEFAULT_LUNCH_END_TIME,
    DEFAULT_APP_THEME,
    DEFAULT_TRANSITION_ENABLED,
    DEFAULT_TRANSITION_SPEED,
    DEFAULT_USE_POSTFIX_ON_PRESET_ADD,
    DEFAULT_MOBILE_GANTT_LIST_EXPANDED,
} from "../constants";
import { syncSettings } from "@/firebase/syncService";

export const createSettingsSlice: StateCreator<
    WorkStore,
    [],
    [],
    SettingsSlice
> = (set, get) => ({
    // ============================================
    // State
    // ============================================
    custom_task_options: [],
    custom_category_options: [],
    hidden_autocomplete_options: DEFAULT_HIDDEN_AUTOCOMPLETE_OPTIONS,
    use_postfix_on_preset_add: DEFAULT_USE_POSTFIX_ON_PRESET_ADD,
    app_theme: DEFAULT_APP_THEME,
    lunch_start_time: DEFAULT_LUNCH_START_TIME,
    lunch_end_time: DEFAULT_LUNCH_END_TIME,
    transition_enabled: DEFAULT_TRANSITION_ENABLED,
    transition_speed: DEFAULT_TRANSITION_SPEED,
    mobile_gantt_list_expanded: DEFAULT_MOBILE_GANTT_LIST_EXPANDED,

    // ============================================
    // Custom Options Actions
    // ============================================

    addCustomTaskOption: (option) => {
        const trimmed = option.trim();
        if (!trimmed) return;

        set(
            create((state) => {
                if (!state.custom_task_options.includes(trimmed)) {
                    state.custom_task_options.push(trimmed);
                }
            })
        );

        const { custom_task_options } = get();
        syncSettings({ custom_task_options }).catch(console.error);
    },

    addCustomCategoryOption: (option) => {
        const trimmed = option.trim();
        if (!trimmed) return;

        set(
            create((state) => {
                if (!state.custom_category_options.includes(trimmed)) {
                    state.custom_category_options.push(trimmed);
                }
            })
        );

        const { custom_category_options } = get();
        syncSettings({ custom_category_options }).catch(console.error);
    },

    removeCustomTaskOption: (option) => {
        set(
            create((state) => {
                const index = state.custom_task_options.indexOf(option);
                if (index !== -1) state.custom_task_options.splice(index, 1);
            })
        );

        const { custom_task_options } = get();
        syncSettings({ custom_task_options }).catch(console.error);
    },

    removeCustomCategoryOption: (option) => {
        set(
            create((state) => {
                const index = state.custom_category_options.indexOf(option);
                if (index !== -1)
                    state.custom_category_options.splice(index, 1);
            })
        );

        const { custom_category_options } = get();
        syncSettings({ custom_category_options }).catch(console.error);
    },

    // ============================================
    // Hidden Options Actions
    // ============================================

    hideAutoCompleteOption: (field: HiddenAutoCompleteField, value: string) => {
        set(
            create((state) => {
                const list = state.hidden_autocomplete_options[field];
                if (list && !list.includes(value)) {
                    list.push(value);
                }
            })
        );

        const { hidden_autocomplete_options } = get();
        syncSettings({ hidden_autocomplete_options }).catch(console.error);
    },

    unhideAutoCompleteOption: (
        field: HiddenAutoCompleteField,
        value: string
    ) => {
        set(
            create((state) => {
                const list = state.hidden_autocomplete_options[field];
                if (list) {
                    const index = list.indexOf(value);
                    if (index !== -1) list.splice(index, 1);
                }
            })
        );

        const { hidden_autocomplete_options } = get();
        syncSettings({ hidden_autocomplete_options }).catch(console.error);
    },

    // ============================================
    // Settings Actions
    // ============================================

    setUsePostfixOnPresetAdd: (value) => {
        set({ use_postfix_on_preset_add: value });
    },

    setAppTheme: (theme: AppTheme) => {
        set({ app_theme: theme });
        syncSettings({ app_theme: theme }).catch(console.error);
    },

    setLunchTime: (start, end) => {
        set({ lunch_start_time: start, lunch_end_time: end });
        syncSettings({
            lunch_start_time: start,
            lunch_end_time: end,
        }).catch(console.error);
    },

    getLunchTimeMinutes: () => {
        const { lunch_start_time, lunch_end_time } = get();
        const start_parts = lunch_start_time.split(":").map(Number);
        const end_parts = lunch_end_time.split(":").map(Number);
        const start = start_parts[0] * 60 + start_parts[1];
        const end = end_parts[0] * 60 + end_parts[1];
        return { start, end, duration: end - start };
    },

    setTransitionEnabled: (enabled) => {
        set({ transition_enabled: enabled });
        syncSettings({ transition_enabled: enabled }).catch(console.error);
    },

    setTransitionSpeed: (speed: TransitionSpeed) => {
        set({ transition_speed: speed });
        syncSettings({ transition_speed: speed }).catch(console.error);
    },

    setMobileGanttListExpanded: (expanded: boolean) => {
        set({ mobile_gantt_list_expanded: expanded });
        syncSettings({ mobile_gantt_list_expanded: expanded }).catch(
            console.error
        );
    },
});
