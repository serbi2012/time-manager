// Firebase 동기화 서비스 (부분 업데이트 방식)
// 실시간 동기화를 제거하고 변경된 데이터만 저장하는 방식으로 변경

import type { User } from "firebase/auth";
import {
    saveRecord,
    deleteRecordFromFirestore,
    saveTemplateToFirestore,
    deleteTemplateFromFirestore,
    saveSettings,
    loadAllData,
} from "./firestore";
import type { UserSettings } from "./firestore";
import { checkAndMigrate } from "./migration";
import { useWorkStore } from "../store/useWorkStore";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "../store/useShortcutStore";
import type { WorkRecord, WorkSession } from "../types";

// 현재 로그인한 사용자 정보 (Store에서 Firebase 저장 시 사용)
let current_user: User | null = null;

// 현재 사용자 설정
export function setCurrentUser(user: User | null): void {
    current_user = user;
}

export function getCurrentUser(): User | null {
    return current_user;
}

// 마지막 동기화 시간
let last_sync_time: Date | null = null;

export function getLastSyncTime(): Date | null {
    return last_sync_time;
}

// ============================================
// 개별 레코드 저장/삭제 (Store에서 호출)
// ============================================

// 레코드 저장 (추가 또는 수정)
export async function syncRecord(record: WorkRecord): Promise<void> {
    if (!current_user) {
        console.log("[Sync] 로그인되지 않음 - 로컬에만 저장");
        return;
    }

    try {
        await saveRecord(current_user.uid, record);
        console.log(`[Sync] 레코드 저장: ${record.id.substring(0, 8)}...`);
    } catch (error) {
        console.error("[Sync] 레코드 저장 실패:", error);
        throw error;
    }
}

// 레코드 삭제
export async function syncDeleteRecord(record_id: string): Promise<void> {
    if (!current_user) {
        console.log("[Sync] 로그인되지 않음 - 로컬에서만 삭제");
        return;
    }

    try {
        await deleteRecordFromFirestore(current_user.uid, record_id);
        console.log(`[Sync] 레코드 삭제: ${record_id.substring(0, 8)}...`);
    } catch (error) {
        console.error("[Sync] 레코드 삭제 실패:", error);
        throw error;
    }
}

// ============================================
// 개별 템플릿 저장/삭제 (Store에서 호출)
// ============================================

// 템플릿 저장 (추가 또는 수정)
export async function syncTemplate(
    template: import("../types").WorkTemplate
): Promise<void> {
    if (!current_user) {
        console.log("[Sync] 로그인되지 않음 - 로컬에만 저장");
        return;
    }

    try {
        await saveTemplateToFirestore(current_user.uid, template);
        console.log(`[Sync] 템플릿 저장: ${template.id.substring(0, 8)}...`);
    } catch (error) {
        console.error("[Sync] 템플릿 저장 실패:", error);
        throw error;
    }
}

// 템플릿 삭제
export async function syncDeleteTemplate(template_id: string): Promise<void> {
    if (!current_user) {
        console.log("[Sync] 로그인되지 않음 - 로컬에서만 삭제");
        return;
    }

    try {
        await deleteTemplateFromFirestore(current_user.uid, template_id);
        console.log(`[Sync] 템플릿 삭제: ${template_id.substring(0, 8)}...`);
    } catch (error) {
        console.error("[Sync] 템플릿 삭제 실패:", error);
        throw error;
    }
}

// ============================================
// 설정 저장 (Store에서 호출)
// ============================================

export async function syncSettings(
    settings: Partial<UserSettings>
): Promise<void> {
    if (!current_user) {
        console.log("[Sync] 로그인되지 않음 - 로컬에만 저장");
        return;
    }

    try {
        await saveSettings(current_user.uid, settings);
        console.log("[Sync] 설정 저장 완료");
    } catch (error) {
        console.error("[Sync] 설정 저장 실패:", error);
        throw error;
    }
}

// ============================================
// 초기 데이터 로드 (앱 시작 시)
// ============================================

// Firebase에서 전체 데이터 로드 (마이그레이션 포함)
export async function loadFromFirebase(user: User): Promise<boolean> {
    try {
        // 1. 마이그레이션 확인 및 실행
        const migration_result = await checkAndMigrate(user.uid);
        if (migration_result.needed_migration) {
            console.log(
                `[Sync] 마이그레이션 완료: ${migration_result.result.records_count}개 레코드, ${migration_result.result.templates_count}개 템플릿`
            );
        }

        // 2. 새 구조에서 데이터 로드
        const { records, templates, settings } = await loadAllData(user.uid);

        console.log(
            `[Sync] 데이터 로드: ${records.length}개 레코드, ${templates.length}개 템플릿`
        );

        // 3. Store에 적용
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
        });

        // 4. 단축키 동기화
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

        // 5. 동기화 시간 업데이트
        last_sync_time = new Date();

        // 6. 현재 사용자 설정
        setCurrentUser(user);

        return true;
    } catch (error) {
        console.error("[Sync] 데이터 로드 실패:", error);
        return false;
    }
}

// 수동 새로고침 (서버에서 최신 데이터 다시 로드)
export async function refreshFromFirebase(user: User): Promise<boolean> {
    try {
        const { records, templates, settings } = await loadAllData(user.uid);

        console.log(
            `[Sync] 새로고침: ${records.length}개 레코드, ${templates.length}개 템플릿`
        );

        // Store에 적용
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
        });

        // 단축키 동기화
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

        // 동기화 시간 업데이트
        last_sync_time = new Date();

        // 중복 레코드 자동 병합
        const merge_result = autoMergeDuplicateRecords();
        if (merge_result.merged_count > 0) {
            console.log(
                `[Sync] 중복 레코드 자동 병합: ${merge_result.merged_count}개 그룹, ${merge_result.deleted_count}개 제거`
            );
        }

        return true;
    } catch (error) {
        console.error("[Sync] 새로고침 실패:", error);
        return false;
    }
}

// ============================================
// 로그아웃 처리
// ============================================

export function clearSyncState(): void {
    current_user = null;
    last_sync_time = null;
}

// ============================================
// 브라우저 종료 시 백업 (안전망)
// ============================================

// 브라우저 종료/새로고침 시 로컬 백업
export function syncBeforeUnload(user: User): void {
    const state = useWorkStore.getState();
    const shortcut_state = useShortcutStore.getState();

    const backup_data = {
        records: state.records,
        templates: state.templates,
        custom_task_options: state.custom_task_options,
        custom_category_options: state.custom_category_options,
        hidden_autocomplete_options: state.hidden_autocomplete_options,
        app_theme: state.app_theme,
        timer: state.timer,
        shortcuts: shortcut_state.shortcuts,
        user_id: user.uid,
        timestamp: Date.now(),
    };

    try {
        localStorage.setItem(
            "time_manager_pending_sync",
            JSON.stringify(backup_data)
        );
        console.log("[Sync] beforeunload - 로컬 백업 저장됨");
    } catch (e) {
        console.error("[Sync] beforeunload - 로컬 백업 실패:", e);
    }
}

// 앱 시작 시 미저장 데이터 확인 (사용하지 않음 - 새 구조에서는 즉시 저장)
export async function checkPendingSync(user: User): Promise<void> {
    try {
        const pending = localStorage.getItem("time_manager_pending_sync");
        if (pending) {
            const backup_data = JSON.parse(pending);

            // 같은 사용자의 백업인지 확인
            if (backup_data.user_id === user.uid) {
                // 백업이 5분 이내인 경우에만 로그 출력
                const age = Date.now() - backup_data.timestamp;
                if (age < 5 * 60 * 1000) {
                    console.log(
                        `[Sync] 미저장 백업 발견 (${Math.round(age / 1000)}초 전) - 새 구조에서는 자동 저장됨`
                    );
                }
            }

            // 백업 삭제 (새 구조에서는 즉시 저장되므로 필요 없음)
            localStorage.removeItem("time_manager_pending_sync");
        }
    } catch (e) {
        console.error("[Sync] 백업 확인 실패:", e);
        localStorage.removeItem("time_manager_pending_sync");
    }
}

// ============================================
// 중복 레코드 자동 병합 기능
// ============================================

interface DuplicateGroup {
    key: string;
    work_name: string;
    deal_name: string;
    records: WorkRecord[];
}

// 중복 레코드 그룹 찾기 (같은 work_name + deal_name, 미완료 상태)
function findDuplicateGroups(records: WorkRecord[]): DuplicateGroup[] {
    const group_map = new Map<string, WorkRecord[]>();

    records
        .filter((r) => !r.is_deleted && !r.is_completed)
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

// 세션의 duration 계산 (기존 데이터 호환)
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

// 레코드 그룹을 하나로 병합
function mergeRecordGroup(group: DuplicateGroup): {
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

    // 모든 세션 수집 (중복 ID 제거)
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

    // 세션 정렬 (날짜, 시작 시간 순)
    all_sessions.sort((a, b) => {
        const date_a = a.date || base_record.date;
        const date_b = b.date || base_record.date;
        const date_cmp = date_a.localeCompare(date_b);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    // 총 시간 계산
    const total_duration = all_sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );

    // 시작/종료 시간 결정
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

// 중복 레코드 자동 병합 실행
export function autoMergeDuplicateRecords(): {
    merged_count: number;
    deleted_count: number;
} {
    const state = useWorkStore.getState();
    const duplicate_groups = findDuplicateGroups(state.records);

    if (duplicate_groups.length === 0) {
        return { merged_count: 0, deleted_count: 0 };
    }

    let merged_count = 0;
    let deleted_count = 0;
    let updated_records = [...state.records];

    duplicate_groups.forEach((group) => {
        const { merged_record, deleted_ids } = mergeRecordGroup(group);

        // 병합된 레코드로 업데이트
        updated_records = updated_records.map((r) =>
            r.id === merged_record.id ? merged_record : r
        );

        // 삭제할 레코드 제거
        updated_records = updated_records.filter(
            (r) => !deleted_ids.includes(r.id)
        );

        merged_count++;
        deleted_count += deleted_ids.length;

        console.log(
            `[AutoMerge] "${group.work_name} > ${group.deal_name}" ${group.records.length}개 → 1개로 병합 (세션 ${merged_record.sessions.length}개)`
        );

        // Firebase에 병합 결과 저장 (비동기)
        if (current_user) {
            syncRecord(merged_record).catch(console.error);
            deleted_ids.forEach((id) => {
                syncDeleteRecord(id).catch(console.error);
            });
        }
    });

    // 상태 업데이트
    useWorkStore.setState({ records: updated_records });

    console.log(
        `[AutoMerge] 총 ${merged_count}개 그룹 병합, ${deleted_count}개 중복 레코드 제거`
    );

    return { merged_count, deleted_count };
}

// 특정 work_name + deal_name에 대해 기존 레코드 찾기 (중복 있으면 병합 후 반환)
export function findOrMergeExistingRecord(
    work_name: string,
    deal_name: string
): WorkRecord | undefined {
    const state = useWorkStore.getState();

    // 같은 work_name + deal_name을 가진 미완료 레코드 찾기
    const matching_records = state.records.filter(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );

    if (matching_records.length === 0) {
        return undefined;
    }

    if (matching_records.length === 1) {
        return matching_records[0];
    }

    // 2개 이상이면 병합
    console.log(
        `[AutoMerge] "${work_name} > ${deal_name}" 중복 ${matching_records.length}개 발견, 자동 병합`
    );

    const group: DuplicateGroup = {
        key: `${work_name}||${deal_name}`,
        work_name,
        deal_name,
        records: matching_records,
    };

    const { merged_record, deleted_ids } = mergeRecordGroup(group);

    // 상태 업데이트
    let updated_records = state.records.map((r) =>
        r.id === merged_record.id ? merged_record : r
    );
    updated_records = updated_records.filter(
        (r) => !deleted_ids.includes(r.id)
    );

    useWorkStore.setState({ records: updated_records });

    // Firebase에 병합 결과 저장 (비동기)
    if (current_user) {
        syncRecord(merged_record).catch(console.error);
        deleted_ids.forEach((id) => {
            syncDeleteRecord(id).catch(console.error);
        });
    }

    return merged_record;
}
