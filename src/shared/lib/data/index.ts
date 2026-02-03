/**
 * 데이터 내보내기/가져오기 유틸리티
 *
 * @example
 * import { downloadAsJson, importFromFile } from '@/shared/lib/data';
 */

export {
    createExportWrapper,
    createExportBlob,
    createExportFileName,
    hasExportableData,
    downloadAsJson,
    type ExportData,
    type ExportDataWrapper,
} from "./export";

export {
    validateImportData,
    extractImportData,
    parseImportContent,
    readFileAsText,
    importFromFile,
    type ImportResult,
} from "./import";
