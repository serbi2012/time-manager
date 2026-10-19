/**
 * 동기화 헬퍼 함수
 *
 * loadFromFirebase / refreshFromFirebase에서 공통으로 사용하는
 * Store 적용 및 단축키 병합 로직
 */

import type { WorkRecord } from "../types";
import { useWorkStore } from "../store/useWorkStore";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "../store/useShortcutStore";
import type { UserSettings } from "./firestore";

/**
 * Firebase에서 로드한 데이터를 Store에 적용
 */
export function applyLoadedDataToStore(
    records: WorkRecord[],
    templates: import("../types").WorkTemplate[],
    settings: UserSettings | null
): void {
    const sorted_templates = templates
        .map((t, i) => ({
            ...t,
            sort_order: t.sort_order ?? i,
        }))
        .sort((a, b) => a.sort_order - b.sort_order);

    useWorkStore.setState({
        records,
        templates: sorted_templates,
        custom_task_options: settings?.custom_task_options || [],
        custom_category_options: settings?.custom_category_options || [],
        ...(settings?.timer && { timer: settings.timer }),
        ...(settings?.hidden_autocomplete_options && {
            hidden_autocomplete_options: settings.hidden_autocomplete_options,
        }),
        ...(settings?.app_theme && {
            app_theme: settings.app_theme,
        }),
        ...(settings?.mobile_gantt_list_expanded !== undefined && {
            mobile_gantt_list_expanded: settings.mobile_gantt_list_expanded,
        }),
        ...(settings?.haptics_enabled !== undefined && {
            haptics_enabled: settings.haptics_enabled,
        }),
        ...(settings?.copy_deal_code_on_double_click !== undefined && {
            copy_deal_code_on_double_click:
                settings.copy_deal_code_on_double_click,
        }),
        ...(settings?.deal_codes && {
            deal_codes: settings.deal_codes,
        }),
        ...(settings?.work_codes && {
            work_codes: settings.work_codes,
        }),
    });

    if (settings?.shortcuts && settings.shortcuts.length > 0) {
        const merged_shortcuts = DEFAULT_SHORTCUTS.map((default_shortcut) => {
            const saved = settings.shortcuts!.find(
                (s) => s.id === default_shortcut.id
            );
            return saved
                ? { ...default_shortcut, enabled: saved.enabled }
                : default_shortcut;
        });
        useShortcutStore.getState().setShortcuts(merged_shortcuts);
    }
}
