/**
 * 공유 훅 모음
 *
 * @example
 * import { useResponsive, useRecordCreation } from '@/shared/hooks';
 */

// 반응형 상태
export {
    useResponsive,
    BREAKPOINTS,
    mediaQuery,
    type ResponsiveState,
} from "./useResponsive";

// 레코드 생성
export {
    useRecordCreation,
    type UseRecordCreationReturn,
} from "./useRecordCreation";

// 인증 핸들러
export { useAuthHandlers, type UseAuthHandlersReturn } from "./useAuthHandlers";

// 데이터 내보내기/가져오기
export {
    useDataImportExport,
    type UseDataImportExportReturn,
} from "./useDataImportExport";

// 자동완성 옵션
export {
    useAutoCompleteOptions,
    type UseAutoCompleteOptionsReturn,
    type AutoCompleteField,
    type OptionItem,
} from "./useAutoCompleteOptions";

// 디바운스
export { useDebouncedValue } from "./useDebouncedValue";
