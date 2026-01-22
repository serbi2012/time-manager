// Firestore 데이터 서비스
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "./config";
import type { WorkRecord, WorkTemplate, TimerState } from "../types";
import type { ShortcutDefinition } from "../store/useShortcutStore";
import type { AppTheme } from "../store/useWorkStore";

// 숨김 자동완성 옵션 타입
export interface HiddenAutoCompleteOptions {
    work_name: string[];
    task_name: string[];
    deal_name: string[];
    project_code: string[];
    task_option: string[];
    category_option: string[];
}

// 사용자 데이터 구조
export interface UserData {
    records: WorkRecord[];
    templates: WorkTemplate[];
    custom_task_options: string[];
    custom_category_options: string[];
    timer?: TimerState; // 타이머 상태 (새로고침 시 복원용)
    shortcuts?: ShortcutDefinition[]; // 단축키 설정
    hidden_autocomplete_options?: HiddenAutoCompleteOptions; // 숨김 자동완성 옵션
    app_theme?: AppTheme; // 앱 테마 색상
    updated_at: string;
}

// 사용자 데이터 저장
export async function saveUserData(
    user_id: string,
    data: Partial<UserData>
): Promise<void> {
    const user_doc_ref = doc(db, "users", user_id);
    await setDoc(
        user_doc_ref,
        {
            ...data,
            updated_at: new Date().toISOString(),
        },
        { merge: true }
    );
}

// 사용자 데이터 불러오기
export async function loadUserData(user_id: string): Promise<UserData | null> {
    const user_doc_ref = doc(db, "users", user_id);
    const doc_snap = await getDoc(user_doc_ref);

    if (doc_snap.exists()) {
        return doc_snap.data() as UserData;
    }
    return null;
}

// 실시간 데이터 구독
export function subscribeToUserData(
    user_id: string,
    callback: (data: UserData | null) => void
): Unsubscribe {
    const user_doc_ref = doc(db, "users", user_id);

    return onSnapshot(user_doc_ref, (doc_snap) => {
        if (doc_snap.exists()) {
            callback(doc_snap.data() as UserData);
        } else {
            callback(null);
        }
    });
}

// 초기 데이터 생성
export function createInitialUserData(): UserData {
    return {
        records: [],
        templates: [],
        custom_task_options: [],
        custom_category_options: [],
        updated_at: new Date().toISOString(),
    };
}
