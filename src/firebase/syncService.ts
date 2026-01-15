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

    await saveUserData(user.uid, {
        records: state.records,
        templates: state.templates,
        custom_task_options: state.custom_task_options,
        custom_category_options: state.custom_category_options,
        timer: state.timer, // 타이머 상태도 저장
    });
}

// Firebase 데이터를 로컬로 불러오기
export async function syncFromFirebase(user: User): Promise<boolean> {
    const firebase_data = await loadUserData(user.uid);
    const state = useWorkStore.getState();

    // 현재 로컬 데이터 카운트 저장
    last_known_record_count = state.records.length;
    last_known_template_count = state.templates.length;

    if (firebase_data) {
        const firebase_records = firebase_data.records || [];
        const firebase_templates = firebase_data.templates || [];

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
            });

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

// 데이터 변경 시 Firebase에 자동 저장 (debounce 적용)
let save_timeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleSync(user: User): void {
    // 로컬 변경 표시
    markLocalChange();

    if (save_timeout) {
        clearTimeout(save_timeout);
    }

    save_timeout = setTimeout(() => {
        syncToFirebase(user);
        save_timeout = null;
    }, 1000); // 1초 후 저장 (연속 변경 시 마지막만 저장)
}
