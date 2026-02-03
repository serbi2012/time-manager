/**
 * 데이터 내보내기 유틸리티
 *
 * 작업 데이터를 JSON 파일로 내보내는 순수 함수들
 */

import type { WorkRecord, WorkTemplate, TimerState } from "../../types";

export interface ExportData {
    records: WorkRecord[];
    templates: WorkTemplate[];
    timer?: TimerState;
    custom_task_options?: string[];
    custom_category_options?: string[];
}

export interface ExportDataWrapper {
    state: ExportData;
    version: number;
    exported_at: string;
}

/**
 * 내보내기용 데이터 래퍼 생성
 *
 * @param data - 내보낼 데이터
 * @param version - 데이터 버전 (기본값: 0)
 * @returns 래핑된 내보내기 데이터
 */
export function createExportWrapper(
    data: ExportData,
    version: number = 0
): ExportDataWrapper {
    return {
        state: data,
        version,
        exported_at: new Date().toISOString(),
    };
}

/**
 * 내보내기 데이터를 Blob으로 변환
 *
 * @param data - 내보낼 데이터
 * @returns JSON Blob
 */
export function createExportBlob(data: ExportData): Blob {
    const wrapper = createExportWrapper(data);
    return new Blob([JSON.stringify(wrapper, null, 2)], {
        type: "application/json",
    });
}

/**
 * 내보내기 파일명 생성
 *
 * @param prefix - 파일명 접두사 (기본값: "time-manager-backup")
 * @returns 파일명 (예: "time-manager-backup-2026-02-03.json")
 */
export function createExportFileName(
    prefix: string = "time-manager-backup"
): string {
    const date_str = new Date().toISOString().slice(0, 10);
    return `${prefix}-${date_str}.json`;
}

/**
 * 데이터가 내보내기 가능한지 확인
 *
 * @param data - 검사할 데이터
 * @returns 내보낼 데이터가 있으면 true
 */
export function hasExportableData(data: ExportData): boolean {
    return data.records.length > 0 || data.templates.length > 0;
}

/**
 * 데이터를 JSON 파일로 다운로드
 *
 * 이 함수는 부수 효과(DOM 조작)를 포함하므로 순수 함수가 아닙니다.
 * 하지만 내보내기 로직의 일관성을 위해 여기에 포함됩니다.
 *
 * @param data - 내보낼 데이터
 */
export function downloadAsJson(data: ExportData): void {
    const blob = createExportBlob(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createExportFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
