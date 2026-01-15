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
