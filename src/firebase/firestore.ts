// Firestore 데이터 서비스
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    onSnapshot,
    collection,
    writeBatch,
} from "firebase/firestore";
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

// ============================================
// 새로운 컬렉션 구조 CRUD 함수들
// ============================================

// 사용자 설정 타입 (records, templates 제외)
export interface UserSettings {
    timer?: TimerState;
    custom_task_options: string[];
    custom_category_options: string[];
    shortcuts?: ShortcutDefinition[];
    hidden_autocomplete_options?: HiddenAutoCompleteOptions;
    app_theme?: AppTheme;
    lunch_start_time?: string; // 점심시간 시작 (HH:mm)
    lunch_end_time?: string; // 점심시간 종료 (HH:mm)
    updated_at: string;
    migrated?: boolean; // 마이그레이션 완료 여부
}

// ============================================
// 개별 레코드 CRUD
// ============================================

// 개별 레코드 저장 (추가 또는 수정)
export async function saveRecord(
    user_id: string,
    record: WorkRecord
): Promise<void> {
    const record_ref = doc(db, "users", user_id, "records", record.id);
    await setDoc(record_ref, {
        ...record,
        updated_at: new Date().toISOString(),
    });
}

// 여러 레코드 일괄 저장 (배치 사용)
export async function saveRecordsBatch(
    user_id: string,
    records: WorkRecord[]
): Promise<void> {
    if (records.length === 0) return;

    // Firestore 배치는 500개 제한이 있으므로 분할 처리
    const batch_size = 500;
    for (let i = 0; i < records.length; i += batch_size) {
        const batch = writeBatch(db);
        const chunk = records.slice(i, i + batch_size);

        for (const record of chunk) {
            const record_ref = doc(db, "users", user_id, "records", record.id);
            batch.set(record_ref, {
                ...record,
                updated_at: new Date().toISOString(),
            });
        }

        await batch.commit();
    }
}

// 개별 레코드 삭제
export async function deleteRecordFromFirestore(
    user_id: string,
    record_id: string
): Promise<void> {
    const record_ref = doc(db, "users", user_id, "records", record_id);
    await deleteDoc(record_ref);
}

// 모든 레코드 로드
export async function loadAllRecords(
    user_id: string
): Promise<WorkRecord[]> {
    const records_ref = collection(db, "users", user_id, "records");
    const snapshot = await getDocs(records_ref);

    const records: WorkRecord[] = [];
    snapshot.forEach((doc_snap) => {
        const data = doc_snap.data();
        // updated_at 필드 제거 (WorkRecord 타입에 없음)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updated_at, ...record_data } = data;
        records.push(record_data as WorkRecord);
    });

    return records;
}

// ============================================
// 개별 템플릿 CRUD
// ============================================

// 개별 템플릿 저장 (추가 또는 수정)
export async function saveTemplateToFirestore(
    user_id: string,
    template: WorkTemplate
): Promise<void> {
    const template_ref = doc(db, "users", user_id, "templates", template.id);
    await setDoc(template_ref, {
        ...template,
        updated_at: new Date().toISOString(),
    });
}

// 여러 템플릿 일괄 저장 (배치 사용)
export async function saveTemplatesBatch(
    user_id: string,
    templates: WorkTemplate[]
): Promise<void> {
    if (templates.length === 0) return;

    const batch = writeBatch(db);

    for (const template of templates) {
        const template_ref = doc(db, "users", user_id, "templates", template.id);
        batch.set(template_ref, {
            ...template,
            updated_at: new Date().toISOString(),
        });
    }

    await batch.commit();
}

// 개별 템플릿 삭제
export async function deleteTemplateFromFirestore(
    user_id: string,
    template_id: string
): Promise<void> {
    const template_ref = doc(db, "users", user_id, "templates", template_id);
    await deleteDoc(template_ref);
}

// 모든 템플릿 로드
export async function loadAllTemplates(
    user_id: string
): Promise<WorkTemplate[]> {
    const templates_ref = collection(db, "users", user_id, "templates");
    const snapshot = await getDocs(templates_ref);

    const templates: WorkTemplate[] = [];
    snapshot.forEach((doc_snap) => {
        const data = doc_snap.data();
        // updated_at 필드 제거 (WorkTemplate 타입에 없음)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updated_at, ...template_data } = data;
        templates.push(template_data as WorkTemplate);
    });

    return templates;
}

// ============================================
// 사용자 설정 CRUD
// ============================================

// 설정 저장
export async function saveSettings(
    user_id: string,
    settings: Partial<UserSettings>
): Promise<void> {
    const settings_ref = doc(db, "users", user_id, "settings", "main");
    await setDoc(
        settings_ref,
        {
            ...settings,
            updated_at: new Date().toISOString(),
        },
        { merge: true }
    );
}

// 설정 로드
export async function loadSettings(
    user_id: string
): Promise<UserSettings | null> {
    const settings_ref = doc(db, "users", user_id, "settings", "main");
    const doc_snap = await getDoc(settings_ref);

    if (doc_snap.exists()) {
        return doc_snap.data() as UserSettings;
    }
    return null;
}

// ============================================
// 마이그레이션 헬퍼
// ============================================

// 마이그레이션 완료 표시
export async function markMigrationComplete(user_id: string): Promise<void> {
    // 기존 단일 문서에 migrated 플래그 설정
    const user_doc_ref = doc(db, "users", user_id);
    await setDoc(
        user_doc_ref,
        {
            migrated: true,
            migrated_at: new Date().toISOString(),
        },
        { merge: true }
    );

    // 새 설정 문서에도 migrated 플래그 설정
    await saveSettings(user_id, { migrated: true });
}

// 마이그레이션 상태 확인
export async function checkMigrationStatus(user_id: string): Promise<boolean> {
    // 새 구조의 설정 문서 확인
    const settings = await loadSettings(user_id);
    if (settings?.migrated) {
        return true;
    }

    // 기존 단일 문서 확인
    const old_data = await loadUserData(user_id);
    if (old_data && (old_data as UserData & { migrated?: boolean }).migrated) {
        return true;
    }

    return false;
}

// 모든 데이터 한 번에 로드 (마이그레이션 후 사용)
export async function loadAllData(user_id: string): Promise<{
    records: WorkRecord[];
    templates: WorkTemplate[];
    settings: UserSettings | null;
}> {
    const [records, templates, settings] = await Promise.all([
        loadAllRecords(user_id),
        loadAllTemplates(user_id),
        loadSettings(user_id),
    ]);

    return { records, templates, settings };
}
