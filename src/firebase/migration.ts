// 데이터 마이그레이션 서비스
// 기존 단일 문서 구조 → 새 컬렉션 구조로 마이그레이션

import {
    loadUserData,
    saveRecordsBatch,
    saveTemplatesBatch,
    saveSettings,
    markMigrationComplete,
    checkMigrationStatus,
    loadAllData,
} from "./firestore";
import type { UserSettings } from "./firestore";

// 마이그레이션 결과 타입
export interface MigrationResult {
    success: boolean;
    migrated: boolean; // 실제로 마이그레이션이 수행되었는지
    records_count: number;
    templates_count: number;
    error?: string;
}

// 마이그레이션 실행
export async function migrateToCollectionStructure(
    user_id: string
): Promise<MigrationResult> {
    try {
        // 1. 이미 마이그레이션되었는지 확인
        const is_migrated = await checkMigrationStatus(user_id);
        if (is_migrated) {
            console.log("[Migration] 이미 마이그레이션 완료됨");
            return {
                success: true,
                migrated: false,
                records_count: 0,
                templates_count: 0,
            };
        }

        // 2. 기존 단일 문서 데이터 로드
        const old_data = await loadUserData(user_id);

        if (!old_data) {
            console.log("[Migration] 기존 데이터 없음, 새 사용자");
            // 새 사용자는 마이그레이션 완료로 표시
            await markMigrationComplete(user_id);
            return {
                success: true,
                migrated: false,
                records_count: 0,
                templates_count: 0,
            };
        }

        console.log(
            `[Migration] 마이그레이션 시작: ${old_data.records?.length || 0}개 레코드, ${old_data.templates?.length || 0}개 템플릿`
        );

        // 3. records를 개별 문서로 저장
        if (old_data.records && old_data.records.length > 0) {
            await saveRecordsBatch(user_id, old_data.records);
            console.log(
                `[Migration] ${old_data.records.length}개 레코드 마이그레이션 완료`
            );
        }

        // 4. templates를 개별 문서로 저장
        if (old_data.templates && old_data.templates.length > 0) {
            await saveTemplatesBatch(user_id, old_data.templates);
            console.log(
                `[Migration] ${old_data.templates.length}개 템플릿 마이그레이션 완료`
            );
        }

        // 5. 설정 저장
        const settings: Partial<UserSettings> = {
            timer: old_data.timer,
            custom_task_options: old_data.custom_task_options || [],
            custom_category_options: old_data.custom_category_options || [],
            shortcuts: old_data.shortcuts,
            hidden_autocomplete_options: old_data.hidden_autocomplete_options,
            app_theme: old_data.app_theme,
        };
        await saveSettings(user_id, settings);
        console.log("[Migration] 설정 마이그레이션 완료");

        // 6. 마이그레이션 완료 표시
        await markMigrationComplete(user_id);
        console.log("[Migration] 마이그레이션 완료 표시됨");

        return {
            success: true,
            migrated: true,
            records_count: old_data.records?.length || 0,
            templates_count: old_data.templates?.length || 0,
        };
    } catch (error) {
        console.error("[Migration] 마이그레이션 실패:", error);
        return {
            success: false,
            migrated: false,
            records_count: 0,
            templates_count: 0,
            error: error instanceof Error ? error.message : "알 수 없는 오류",
        };
    }
}

// 마이그레이션 확인 및 실행 (앱 시작 시 호출)
export async function checkAndMigrate(user_id: string): Promise<{
    needed_migration: boolean;
    result: MigrationResult;
}> {
    const is_migrated = await checkMigrationStatus(user_id);

    if (is_migrated) {
        return {
            needed_migration: false,
            result: {
                success: true,
                migrated: false,
                records_count: 0,
                templates_count: 0,
            },
        };
    }

    const result = await migrateToCollectionStructure(user_id);
    return {
        needed_migration: true,
        result,
    };
}

// 새 구조에서 전체 데이터 로드
export async function loadMigratedData(user_id: string) {
    return loadAllData(user_id);
}
