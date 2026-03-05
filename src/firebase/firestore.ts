import type { Unsubscribe } from "firebase/firestore";
import { getDbInstance } from "./config";
import type {
    WorkRecord,
    WorkTemplate,
    TimerState,
    HiddenAutoCompleteOptions,
} from "../types";
import type { ShortcutDefinition } from "../store/useShortcutStore";
import type { AppTheme } from "../store/useWorkStore";

let _fs: typeof import("firebase/firestore") | null = null;

async function fs() {
    if (!_fs) _fs = await import("firebase/firestore");
    return _fs;
}

function removeUndefined<T extends object>(obj: T): T {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined)
    ) as T;
}

export type { HiddenAutoCompleteOptions };

export interface UserData {
    records: WorkRecord[];
    templates: WorkTemplate[];
    custom_task_options: string[];
    custom_category_options: string[];
    timer?: TimerState;
    shortcuts?: ShortcutDefinition[];
    hidden_autocomplete_options?: HiddenAutoCompleteOptions;
    app_theme?: AppTheme;
    updated_at: string;
}

export async function saveUserData(
    user_id: string,
    data: Partial<UserData>
): Promise<void> {
    const db = await getDbInstance();
    const { doc, setDoc } = await fs();
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

export async function loadUserData(user_id: string): Promise<UserData | null> {
    const db = await getDbInstance();
    const { doc, getDoc } = await fs();
    const user_doc_ref = doc(db, "users", user_id);
    const doc_snap = await getDoc(user_doc_ref);

    if (doc_snap.exists()) {
        return doc_snap.data() as UserData;
    }
    return null;
}

export function subscribeToUserData(
    user_id: string,
    callback: (data: UserData | null) => void
): Unsubscribe {
    let unsubscribe_fn: Unsubscribe | null = null;
    let cancelled = false;

    (async () => {
        const db = await getDbInstance();
        const { doc, onSnapshot } = await fs();
        if (cancelled) return;
        const user_doc_ref = doc(db, "users", user_id);

        unsubscribe_fn = onSnapshot(user_doc_ref, (doc_snap) => {
            if (doc_snap.exists()) {
                callback(doc_snap.data() as UserData);
            } else {
                callback(null);
            }
        });
    })();

    return () => {
        cancelled = true;
        unsubscribe_fn?.();
    };
}

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

type TransitionSpeed = "slow" | "normal" | "fast";

export interface UserSettings {
    timer?: TimerState;
    custom_task_options: string[];
    custom_category_options: string[];
    shortcuts?: ShortcutDefinition[];
    hidden_autocomplete_options?: HiddenAutoCompleteOptions;
    app_theme?: AppTheme;
    lunch_start_time?: string;
    lunch_end_time?: string;
    transition_enabled?: boolean;
    transition_speed?: TransitionSpeed;
    cursor_tracking_enabled?: boolean;
    mobile_gantt_list_expanded?: boolean;
    updated_at: string;
    migrated?: boolean;
}

// ============================================
// 개별 레코드 CRUD
// ============================================

export async function saveRecord(
    user_id: string,
    record: WorkRecord
): Promise<void> {
    const db = await getDbInstance();
    const { doc, setDoc } = await fs();
    const record_ref = doc(db, "users", user_id, "records", record.id);
    await setDoc(
        record_ref,
        removeUndefined({
            ...record,
            updated_at: new Date().toISOString(),
        })
    );
}

export async function saveRecordsBatch(
    user_id: string,
    records: WorkRecord[]
): Promise<void> {
    if (records.length === 0) return;

    const db = await getDbInstance();
    const { doc, writeBatch } = await fs();
    const batch_size = 500;
    for (let i = 0; i < records.length; i += batch_size) {
        const batch = writeBatch(db);
        const chunk = records.slice(i, i + batch_size);

        for (const record of chunk) {
            const record_ref = doc(db, "users", user_id, "records", record.id);
            batch.set(
                record_ref,
                removeUndefined({
                    ...record,
                    updated_at: new Date().toISOString(),
                })
            );
        }

        await batch.commit();
    }
}

export async function deleteRecordFromFirestore(
    user_id: string,
    record_id: string
): Promise<void> {
    const db = await getDbInstance();
    const { doc, deleteDoc } = await fs();
    const record_ref = doc(db, "users", user_id, "records", record_id);
    await deleteDoc(record_ref);
}

export async function loadAllRecords(user_id: string): Promise<WorkRecord[]> {
    const db = await getDbInstance();
    const { collection, getDocs } = await fs();
    const records_ref = collection(db, "users", user_id, "records");
    const snapshot = await getDocs(records_ref);

    const records: WorkRecord[] = [];
    snapshot.forEach((doc_snap) => {
        const data = doc_snap.data();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updated_at, ...record_data } = data;
        records.push(record_data as WorkRecord);
    });

    return records;
}

// ============================================
// 개별 템플릿 CRUD
// ============================================

export async function saveTemplateToFirestore(
    user_id: string,
    template: WorkTemplate
): Promise<void> {
    const db = await getDbInstance();
    const { doc, setDoc } = await fs();
    const template_ref = doc(db, "users", user_id, "templates", template.id);
    await setDoc(template_ref, {
        ...template,
        updated_at: new Date().toISOString(),
    });
}

export async function saveTemplatesBatch(
    user_id: string,
    templates: WorkTemplate[]
): Promise<void> {
    if (templates.length === 0) return;

    const db = await getDbInstance();
    const { doc, writeBatch } = await fs();
    const batch = writeBatch(db);

    for (const template of templates) {
        const template_ref = doc(
            db,
            "users",
            user_id,
            "templates",
            template.id
        );
        batch.set(template_ref, {
            ...template,
            updated_at: new Date().toISOString(),
        });
    }

    await batch.commit();
}

export async function deleteTemplateFromFirestore(
    user_id: string,
    template_id: string
): Promise<void> {
    const db = await getDbInstance();
    const { doc, deleteDoc } = await fs();
    const template_ref = doc(db, "users", user_id, "templates", template_id);
    await deleteDoc(template_ref);
}

export async function loadAllTemplates(
    user_id: string
): Promise<WorkTemplate[]> {
    const db = await getDbInstance();
    const { collection, getDocs } = await fs();
    const templates_ref = collection(db, "users", user_id, "templates");
    const snapshot = await getDocs(templates_ref);

    const templates: WorkTemplate[] = [];
    snapshot.forEach((doc_snap) => {
        const data = doc_snap.data();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updated_at, ...template_data } = data;
        if (template_data.sort_order === undefined) {
            template_data.sort_order = templates.length;
        }
        templates.push(template_data as WorkTemplate);
    });

    templates.sort((a, b) => a.sort_order - b.sort_order);

    return templates;
}

// ============================================
// 사용자 설정 CRUD
// ============================================

export async function saveSettings(
    user_id: string,
    settings: Partial<UserSettings>
): Promise<void> {
    const db = await getDbInstance();
    const { doc, setDoc } = await fs();
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

export async function loadSettings(
    user_id: string
): Promise<UserSettings | null> {
    const db = await getDbInstance();
    const { doc, getDoc } = await fs();
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

export async function markMigrationComplete(user_id: string): Promise<void> {
    const db = await getDbInstance();
    const { doc, setDoc } = await fs();
    const user_doc_ref = doc(db, "users", user_id);
    await setDoc(
        user_doc_ref,
        {
            migrated: true,
            migrated_at: new Date().toISOString(),
        },
        { merge: true }
    );

    await saveSettings(user_id, { migrated: true });
}

export async function checkMigrationStatus(user_id: string): Promise<boolean> {
    const settings = await loadSettings(user_id);
    if (settings?.migrated) {
        return true;
    }

    const old_data = await loadUserData(user_id);
    if (old_data && (old_data as UserData & { migrated?: boolean }).migrated) {
        return true;
    }

    return false;
}

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
