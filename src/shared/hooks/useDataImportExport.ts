/**
 * 데이터 내보내기/가져오기 훅
 *
 * 작업 데이터를 JSON으로 내보내고 가져오는 공통 로직을 제공합니다.
 * Desktop/Mobile Layout에서 중복되던 handleExport/handleImport 로직을 통합합니다.
 */

import { useRef, useCallback } from "react";
import { message } from "@/shared/lib/message";
import { useWorkStore } from "../../store/useWorkStore";
import { useAuth } from "../../firebase/useAuth";
import {
    syncRecord,
    syncTemplate,
    syncSettings,
} from "../../firebase/syncService";
import { downloadAsJson, hasExportableData, importFromFile } from "../lib/data";
import type { WorkRecord, WorkTemplate } from "../types";
import {
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    WARNING_MESSAGES,
} from "../constants";

/**
 * 데이터 내보내기/가져오기 훅 반환 타입
 */
export interface UseDataImportExportReturn {
    /** 파일 input ref */
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    /** 데이터 내보내기 */
    handleExport: () => void;
    /** 파일 선택 다이얼로그 열기 */
    handleImport: () => void;
    /** 파일 변경 이벤트 처리 */
    handleFileChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => Promise<void>;
}

/**
 * 데이터 내보내기/가져오기 훅
 *
 * @example
 * ```tsx
 * const { fileInputRef, handleExport, handleImport, handleFileChange } = useDataImportExport();
 *
 * // 내보내기 버튼
 * <Button onClick={handleExport}>내보내기</Button>
 *
 * // 가져오기 버튼
 * <Button onClick={handleImport}>가져오기</Button>
 *
 * // 숨겨진 파일 input
 * <input
 *   ref={fileInputRef}
 *   type="file"
 *   accept=".json"
 *   onChange={handleFileChange}
 *   style={{ display: "none" }}
 * />
 * ```
 */
export function useDataImportExport(): UseDataImportExportReturn {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, isAuthenticated } = useAuth();

    /**
     * 데이터 내보내기
     */
    const handleExport = useCallback(() => {
        const state = useWorkStore.getState();
        const export_data = {
            records: state.records,
            templates: state.templates,
            timer: state.timer,
            custom_task_options: state.custom_task_options,
            custom_category_options: state.custom_category_options,
        };

        if (!hasExportableData(export_data)) {
            message.warning("내보낼 데이터가 없습니다");
            return;
        }

        downloadAsJson(export_data);
        message.success(SUCCESS_MESSAGES.dataExportedSuccess);
    }, []);

    /**
     * 파일 선택 다이얼로그 열기
     */
    const handleImport = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    /**
     * 파일 변경 이벤트 처리
     */
    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                const data = await importFromFile(file);

                // 스토어 업데이트
                useWorkStore.setState({
                    records: data.records,
                    templates: data.templates,
                    custom_task_options: data.custom_task_options,
                    custom_category_options: data.custom_category_options,
                });

                // Firebase 동기화 (인증된 경우)
                if (user && isAuthenticated) {
                    try {
                        await Promise.all(
                            data.records.map((record: WorkRecord) =>
                                syncRecord(record)
                            )
                        );
                        await Promise.all(
                            data.templates.map((template: WorkTemplate) =>
                                syncTemplate(template)
                            )
                        );
                        await syncSettings({
                            custom_task_options: data.custom_task_options,
                            custom_category_options:
                                data.custom_category_options,
                        });
                        message.success(SUCCESS_MESSAGES.dataImportedAndSynced);
                    } catch {
                        message.warning(
                            WARNING_MESSAGES.dataImportedSyncFailed
                        );
                    }
                } else {
                    message.success(SUCCESS_MESSAGES.dataImportedSuccess);
                }
            } catch (error) {
                if (error instanceof Error) {
                    message.error(error.message);
                } else {
                    message.error(ERROR_MESSAGES.fileReadFailed);
                }
            } finally {
                // 같은 파일 다시 선택 가능하도록 초기화
                if (event.target) {
                    event.target.value = "";
                }
            }
        },
        [user, isAuthenticated]
    );

    return {
        fileInputRef,
        handleExport,
        handleImport,
        handleFileChange,
    };
}
