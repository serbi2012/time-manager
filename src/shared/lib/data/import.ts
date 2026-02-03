/**
 * 데이터 가져오기 유틸리티
 *
 * JSON 파일에서 작업 데이터를 가져오는 순수 함수들
 */

import type { WorkRecord, WorkTemplate } from "../../types";
import type { ExportData } from "./export";

export interface ImportResult {
    records: WorkRecord[];
    templates: WorkTemplate[];
    custom_task_options: string[];
    custom_category_options: string[];
}

/**
 * 가져오기 데이터 유효성 검사
 *
 * @param data - 검사할 데이터
 * @returns 유효한 가져오기 데이터인지 여부
 */
export function validateImportData(data: unknown): data is ExportData {
    if (!data || typeof data !== "object") {
        return false;
    }

    const obj = data as Record<string, unknown>;

    // records 배열 확인 (필수)
    if (!Array.isArray(obj.records)) {
        return false;
    }

    // templates 배열 확인 (선택적이지만 있다면 배열이어야 함)
    if (obj.templates !== undefined && !Array.isArray(obj.templates)) {
        return false;
    }

    return true;
}

/**
 * 래핑된 데이터에서 실제 데이터 추출
 *
 * 두 가지 형식을 지원:
 * 1. { state: { records: [...] } } - 래핑된 형식
 * 2. { records: [...] } - 직접 형식
 *
 * @param parsed - 파싱된 JSON 데이터
 * @returns 추출된 데이터
 */
export function extractImportData(parsed: unknown): ExportData | null {
    if (!parsed || typeof parsed !== "object") {
        return null;
    }

    const obj = parsed as Record<string, unknown>;

    // 래핑된 형식 처리 { state: { records: [...] } }
    if (obj.state && typeof obj.state === "object") {
        const state = obj.state as ExportData;
        if (validateImportData(state)) {
            return state;
        }
    }

    // 직접 형식 처리 { records: [...] }
    if (validateImportData(obj)) {
        return obj as ExportData;
    }

    return null;
}

/**
 * JSON 문자열 파싱 및 검증
 *
 * @param content - JSON 문자열
 * @returns 파싱된 가져오기 결과 또는 null
 */
export function parseImportContent(content: string): ImportResult | null {
    try {
        const parsed = JSON.parse(content);
        const data = extractImportData(parsed);

        if (!data) {
            return null;
        }

        return {
            records: data.records || [],
            templates: data.templates || [],
            custom_task_options: data.custom_task_options || [],
            custom_category_options: data.custom_category_options || [],
        };
    } catch {
        return null;
    }
}

/**
 * File 객체에서 JSON 내용 읽기
 *
 * @param file - 읽을 파일
 * @returns 파일 내용 Promise
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
        };
        reader.onerror = () => {
            reject(new Error("파일을 읽는 중 오류가 발생했습니다"));
        };
        reader.readAsText(file);
    });
}

/**
 * 파일에서 데이터 가져오기
 *
 * @param file - 가져올 JSON 파일
 * @returns 파싱된 가져오기 결과 또는 에러
 */
export async function importFromFile(file: File): Promise<ImportResult> {
    const content = await readFileAsText(file);
    const result = parseImportContent(content);

    if (!result) {
        throw new Error("유효하지 않은 데이터 형식입니다");
    }

    return result;
}
