/**
 * 동기화 헬퍼 함수
 *
 * loadFromFirebase / refreshFromFirebase에서 공통으로 사용하는
 * Store 적용 및 단축키 병합 로직
 */

import type { WorkRecord, WorkSession } from "../types";
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
    useWorkStore.setState({
        records,
        templates,
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

// ============================================
// 중복 레코드 병합 순수 함수
// ============================================

interface DuplicateGroup {
    key: string;
    work_name: string;
    deal_name: string;
    records: WorkRecord[];
}

function getSessionMinutes(session: WorkSession): number {
    if (session.duration_minutes !== undefined) {
        return session.duration_minutes;
    }
    const legacy = session as unknown as { duration_seconds?: number };
    if (legacy.duration_seconds !== undefined) {
        return Math.ceil(legacy.duration_seconds / 60);
    }
    return 0;
}

export function findDuplicateGroups(records: WorkRecord[]): DuplicateGroup[] {
    const group_map = new Map<string, WorkRecord[]>();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const key = `${record.work_name}||${record.deal_name}`;
            if (!group_map.has(key)) {
                group_map.set(key, []);
            }
            group_map.get(key)!.push(record);
        });

    const duplicates: DuplicateGroup[] = [];
    group_map.forEach((group_records, key) => {
        if (group_records.length >= 2) {
            duplicates.push({
                key,
                work_name: group_records[0].work_name,
                deal_name: group_records[0].deal_name,
                records: group_records.sort((a, b) =>
                    a.date.localeCompare(b.date)
                ),
            });
        }
    });

    return duplicates;
}

export function mergeRecordGroup(group: DuplicateGroup): {
    merged_record: WorkRecord;
    deleted_ids: string[];
} {
    const sorted_records = [...group.records].sort((a, b) => {
        const date_cmp = a.date.localeCompare(b.date);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    const base_record = sorted_records[0];
    const other_records = sorted_records.slice(1);

    const all_sessions: WorkSession[] = [...(base_record.sessions || [])];
    const session_ids = new Set(all_sessions.map((s) => s.id));

    other_records.forEach((r) => {
        (r.sessions || []).forEach((s) => {
            if (!session_ids.has(s.id)) {
                all_sessions.push(s);
                session_ids.add(s.id);
            }
        });
    });

    all_sessions.sort((a, b) => {
        const date_a = a.date || base_record.date;
        const date_b = b.date || base_record.date;
        const date_cmp = date_a.localeCompare(date_b);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    const total_duration = all_sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );

    const first_session = all_sessions[0];
    const last_session = all_sessions[all_sessions.length - 1];

    const merged_record: WorkRecord = {
        ...base_record,
        sessions: all_sessions,
        duration_minutes: Math.max(1, total_duration),
        start_time: first_session?.start_time || base_record.start_time,
        end_time: last_session?.end_time || base_record.end_time,
        date: first_session?.date || base_record.date,
    };

    return {
        merged_record,
        deleted_ids: other_records.map((r) => r.id),
    };
}
