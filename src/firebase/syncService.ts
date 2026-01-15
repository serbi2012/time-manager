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

// 로컬 변경 표시 (Firebase 동기화 전 호출)
export function markLocalChange(): void {
    last_local_change_time = Date.now();
}

// 로컬 데이터를 Firebase에 저장
export async function syncToFirebase(user: User): Promise<void> {
    const state = useWorkStore.getState();

    await saveUserData(user.uid, {
        records: state.records,
        templates: state.templates,
        custom_task_options: state.custom_task_options,
        custom_category_options: state.custom_category_options,
    });
}

// Firebase 데이터를 로컬로 불러오기
export async function syncFromFirebase(user: User): Promise<boolean> {
    const firebase_data = await loadUserData(user.uid);

    if (firebase_data) {
        const state = useWorkStore.getState();

        // 로컬에 데이터가 없거나 Firebase가 더 최신인 경우에만 덮어쓰기
        const local_has_data =
            state.records.length > 0 || state.templates.length > 0;

        if (!local_has_data) {
            // 로컬이 비어있으면 Firebase 데이터로 채우기
            useWorkStore.setState({
                records: firebase_data.records || [],
                templates: firebase_data.templates || [],
                custom_task_options: firebase_data.custom_task_options || [],
                custom_category_options:
                    firebase_data.custom_category_options || [],
            });
            return true;
        }

        // 로컬에 데이터가 있으면 병합 로직 적용
        // 여기서는 단순히 Firebase 데이터로 덮어쓰기
        // 나중에 더 복잡한 병합 로직 구현 가능
        useWorkStore.setState({
            records: firebase_data.records || [],
            templates: firebase_data.templates || [],
            custom_task_options: firebase_data.custom_task_options || [],
            custom_category_options:
                firebase_data.custom_category_options || [],
        });
        return true;
    } else {
        // Firebase에 데이터가 없으면 로컬 데이터 업로드
        const state = useWorkStore.getState();
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

            useWorkStore.setState({
                records: data.records || [],
                templates: data.templates || [],
                custom_task_options: data.custom_task_options || [],
                custom_category_options: data.custom_category_options || [],
            });
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
