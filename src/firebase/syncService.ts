// Firebase 동기화 서비스
import type { User } from "firebase/auth";
import {
    saveUserData,
    loadUserData,
    subscribeToUserData,
    createInitialUserData,
} from "./firestore";
import type { UserData } from "./firestore";
import { useWorkStore } from "../store/useWorkStore";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "../store/useShortcutStore";
import type { WorkRecord, WorkSession } from "../types";

let unsubscribe_fn: (() => void) | null = null;

// 로컬 변경 시간 추적 (Firebase 덮어쓰기 방지용)
let last_local_change_time = 0;
const SYNC_IGNORE_DURATION = 3000; // 로컬 변경 후 3초간 Firebase 업데이트 무시

// 마지막으로 알려진 유효한 데이터 수 (데이터 손실 방지)
let last_known_record_count = 0;
let last_known_template_count = 0;

// 로컬 변경 표시 (Firebase 동기화 전 호출)
export function markLocalChange(): void {
    last_local_change_time = Date.now();
}

// 데이터 유효성 검사: 이상한 데이터는 저장/적용하지 않음
function isValidDataForSave(
    records: unknown[],
    templates: unknown[],
    current_record_count: number,
    current_template_count: number
): { valid: boolean; reason?: string } {
    // 기존에 데이터가 있었는데 새 데이터가 완전히 비어있으면 저장하지 않음
    if (current_record_count > 0 && records.length === 0) {
        return {
            valid: false,
            reason: `레코드가 ${current_record_count}개에서 0개로 초기화됨 - 저장 취소`,
        };
    }

    if (current_template_count > 0 && templates.length === 0) {
        return {
            valid: false,
            reason: `템플릿이 ${current_template_count}개에서 0개로 초기화됨 - 저장 취소`,
        };
    }

    // 데이터가 급격하게 줄어들면 저장하지 않음 (50% 이상 감소)
    if (
        current_record_count > 5 &&
        records.length < current_record_count * 0.5
    ) {
        return {
            valid: false,
            reason: `레코드가 ${current_record_count}개에서 ${records.length}개로 급감 - 저장 취소`,
        };
    }

    return { valid: true };
}

// 로컬 데이터를 Firebase에 저장
// force: true면 유효성 검사 우회 (import 시 사용)
export async function syncToFirebase(
    user: User,
    options?: { force?: boolean }
): Promise<void> {
    const state = useWorkStore.getState();
    const force = options?.force ?? false;

    // 유효성 검사 (force가 true면 우회)
    if (!force) {
        const validation = isValidDataForSave(
            state.records,
            state.templates,
            last_known_record_count,
            last_known_template_count
        );

        if (!validation.valid) {
            console.warn(`[Sync] 저장 취소: ${validation.reason}`);
            return;
        }
    } else {
        console.log("[Sync] 강제 저장 모드 - 유효성 검사 우회");
    }

    // 카운트 업데이트
    last_known_record_count = state.records.length;
    last_known_template_count = state.templates.length;

    // 단축키 상태 가져오기
    const shortcut_state = useShortcutStore.getState();

    await saveUserData(user.uid, {
        records: state.records,
        templates: state.templates,
        custom_task_options: state.custom_task_options,
        custom_category_options: state.custom_category_options,
        timer: state.timer, // 타이머 상태도 저장
        shortcuts: shortcut_state.shortcuts, // 단축키 설정 저장
        hidden_autocomplete_options: state.hidden_autocomplete_options, // 숨김 자동완성 옵션
        app_theme: state.app_theme, // 앱 테마 색상
    });
}

// Firebase 데이터를 로컬로 불러오기
export async function syncFromFirebase(user: User): Promise<boolean> {
    const firebase_data = await loadUserData(user.uid);
    const state = useWorkStore.getState();

    // 현재 로컬 데이터 카운트 저장
    last_known_record_count = state.records.length;
    last_known_template_count = state.templates.length;

    // 단축키 동기화 헬퍼 함수
    const syncShortcuts = (firebase_shortcuts?: typeof DEFAULT_SHORTCUTS) => {
        if (firebase_shortcuts && firebase_shortcuts.length > 0) {
            // Firebase에 단축키가 있으면 로드 (기본값과 병합)
            const merged_shortcuts = DEFAULT_SHORTCUTS.map(
                (default_shortcut) => {
                    const saved = firebase_shortcuts.find(
                        (s) => s.id === default_shortcut.id
                    );
                    return saved
                        ? { ...default_shortcut, enabled: saved.enabled }
                        : default_shortcut;
                }
            );
            useShortcutStore.getState().setShortcuts(merged_shortcuts);
        }
    };

    if (firebase_data) {
        const firebase_records = firebase_data.records || [];
        const firebase_templates = firebase_data.templates || [];

        // 단축키 동기화
        syncShortcuts(firebase_data.shortcuts);

        // 로컬에 데이터가 없거나 Firebase가 더 최신인 경우에만 덮어쓰기
        const local_has_data =
            state.records.length > 0 || state.templates.length > 0;

        if (!local_has_data) {
            // 로컬이 비어있으면 Firebase 데이터로 채우기
            useWorkStore.setState({
                records: firebase_records,
                templates: firebase_templates,
                custom_task_options: firebase_data.custom_task_options || [],
                custom_category_options:
                    firebase_data.custom_category_options || [],
                ...(firebase_data.timer && { timer: firebase_data.timer }), // 타이머 상태 복원
                ...(firebase_data.hidden_autocomplete_options && {
                    hidden_autocomplete_options:
                        firebase_data.hidden_autocomplete_options,
                }),
                ...(firebase_data.app_theme && {
                    app_theme: firebase_data.app_theme,
                }),
            });
            last_known_record_count = firebase_records.length;
            last_known_template_count = firebase_templates.length;
            return true;
        }

        // Firebase 데이터가 비어있고 로컬에 데이터가 있으면 Firebase 데이터 무시
        if (firebase_records.length === 0 && state.records.length > 0) {
            console.warn(
                "[Sync] Firebase 레코드가 비어있고 로컬에 데이터 있음 - Firebase 업데이트"
            );
            await saveUserData(user.uid, {
                records: state.records,
                templates: state.templates,
                custom_task_options: state.custom_task_options,
                custom_category_options: state.custom_category_options,
            });
            return false;
        }

        // 로컬에 데이터가 있으면 병합 로직 적용
        useWorkStore.setState({
            records: firebase_records,
            templates: firebase_templates,
            custom_task_options: firebase_data.custom_task_options || [],
            custom_category_options:
                firebase_data.custom_category_options || [],
            ...(firebase_data.timer && { timer: firebase_data.timer }), // 타이머 상태 복원
            ...(firebase_data.hidden_autocomplete_options && {
                hidden_autocomplete_options:
                    firebase_data.hidden_autocomplete_options,
            }),
            ...(firebase_data.app_theme && {
                app_theme: firebase_data.app_theme,
            }),
        });
        last_known_record_count = firebase_records.length;
        last_known_template_count = firebase_templates.length;
        return true;
    } else {
        // Firebase에 데이터가 없으면 로컬 데이터 업로드
        if (state.records.length > 0 || state.templates.length > 0) {
            await saveUserData(user.uid, {
                records: state.records,
                templates: state.templates,
                custom_task_options: state.custom_task_options,
                custom_category_options: state.custom_category_options,
            });
        } else {
            // 둘 다 비어있으면 초기 데이터 생성
            await saveUserData(user.uid, createInitialUserData());
        }
        return false;
    }
}

// 실시간 동기화 시작
export function startRealtimeSync(user: User): void {
    // 이전 구독 해제
    if (unsubscribe_fn) {
        unsubscribe_fn();
    }

    unsubscribe_fn = subscribeToUserData(user.uid, (data: UserData | null) => {
        if (data) {
            // 로컬 변경 직후에는 Firebase 업데이트 무시 (덮어쓰기 방지)
            const time_since_local_change = Date.now() - last_local_change_time;
            if (time_since_local_change < SYNC_IGNORE_DURATION) {
                console.log(
                    `[Sync] 로컬 변경 후 ${time_since_local_change}ms 경과, Firebase 업데이트 무시`
                );
                return;
            }

            const firebase_records = data.records || [];
            const firebase_templates = data.templates || [];
            const state = useWorkStore.getState();

            // 유효성 검사: Firebase 데이터가 비어있고 로컬에 데이터가 있으면 무시
            if (firebase_records.length === 0 && state.records.length > 0) {
                console.warn(
                    `[Sync] Firebase 레코드 0개, 로컬 ${state.records.length}개 - 실시간 업데이트 무시`
                );
                return;
            }

            // 데이터가 급격하게 줄어들면 무시 (50% 이상 감소)
            if (
                state.records.length > 5 &&
                firebase_records.length < state.records.length * 0.5
            ) {
                console.warn(
                    `[Sync] 레코드 급감 감지 (${state.records.length} → ${firebase_records.length}) - 실시간 업데이트 무시`
                );
                return;
            }

            // 유효한 데이터면 적용
            // 타이머는 로컬에서 실행 중이 아닐 때만 Firebase 상태로 복원
            const should_restore_timer =
                !state.timer.is_running && data.timer?.is_running;

            useWorkStore.setState({
                records: firebase_records,
                templates: firebase_templates,
                custom_task_options: data.custom_task_options || [],
                custom_category_options: data.custom_category_options || [],
                ...(should_restore_timer && { timer: data.timer }),
                ...(data.hidden_autocomplete_options && {
                    hidden_autocomplete_options:
                        data.hidden_autocomplete_options,
                }),
                ...(data.app_theme && {
                    app_theme: data.app_theme,
                }),
            });

            // 단축키 동기화 (있으면)
            if (data.shortcuts && data.shortcuts.length > 0) {
                const merged_shortcuts = DEFAULT_SHORTCUTS.map(
                    (default_shortcut) => {
                        const saved = data.shortcuts!.find(
                            (s) => s.id === default_shortcut.id
                        );
                        return saved
                            ? { ...default_shortcut, enabled: saved.enabled }
                            : default_shortcut;
                    }
                );
                useShortcutStore.getState().setShortcuts(merged_shortcuts);
            }

            // 카운트 업데이트
            last_known_record_count = firebase_records.length;
            last_known_template_count = firebase_templates.length;

            // 실시간 동기화 후 중복 레코드 자동 병합
            const merge_result = autoMergeDuplicateRecords();
            if (merge_result.merged_count > 0) {
                console.log(
                    `[RealtimeSync] 중복 레코드 자동 병합: ${merge_result.merged_count}개 그룹, ${merge_result.deleted_count}개 제거`
                );
                // 병합 결과를 Firebase에 저장 (로컬 변경 표시 후)
                markLocalChange();
            }
        }
    });
}

// 실시간 동기화 중지
export function stopRealtimeSync(): void {
    if (unsubscribe_fn) {
        unsubscribe_fn();
        unsubscribe_fn = null;
    }
}

// 데이터 변경 시 Firebase에 즉시 저장
export async function syncImmediately(user: User): Promise<void> {
    // 로컬 변경 표시
    markLocalChange();

    // 즉시 저장
    await syncToFirebase(user);
}

// 브라우저 종료/새로고침 시 로컬 백업 (안전망)
export function syncBeforeUnload(user: User): void {
    // localStorage에 백업 저장 (다음 로드 시 복구용)
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

// 앱 시작 시 미저장 데이터 확인 및 복구
export async function checkPendingSync(user: User): Promise<void> {
    try {
        const pending = localStorage.getItem("time_manager_pending_sync");
        if (pending) {
            const backup_data = JSON.parse(pending);

            // 같은 사용자의 백업인지 확인
            if (backup_data.user_id === user.uid) {
                // 백업이 5분 이내인 경우에만 복구
                const age = Date.now() - backup_data.timestamp;
                if (age < 5 * 60 * 1000) {
                    console.log(
                        `[Sync] 미저장 백업 발견 (${Math.round(
                            age / 1000
                        )}초 전)`
                    );

                    // Firebase에 저장
                    await saveUserData(user.uid, {
                        records: backup_data.records,
                        templates: backup_data.templates,
                        custom_task_options: backup_data.custom_task_options,
                        custom_category_options:
                            backup_data.custom_category_options,
                        hidden_autocomplete_options:
                            backup_data.hidden_autocomplete_options,
                        app_theme: backup_data.app_theme,
                        timer: backup_data.timer,
                        shortcuts: backup_data.shortcuts,
                    });

                    console.log("[Sync] 미저장 백업 Firebase에 복구 완료");
                }
            }

            // 백업 삭제
            localStorage.removeItem("time_manager_pending_sync");
        }
    } catch (e) {
        console.error("[Sync] 백업 복구 실패:", e);
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

    return merged_record;
}
