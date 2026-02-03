/**
 * 공유 UI 컴포넌트 모음
 *
 * @example
 * import { TimeInput, DateInput, CategoryTag } from '@/shared/ui';
 * import { SelectWithAdd, BaseModal, LoadingOverlay } from '@/shared/ui';
 */

// 입력 컴포넌트
export { TimeInput, type TimeInputProps } from "./TimeInput";
export { DateInput, type DateInputProps } from "./DateInput";

// 표시 컴포넌트
export { CategoryTag, type CategoryTagProps } from "./CategoryTag";
export { DurationDisplay, type DurationDisplayProps } from "./DurationDisplay";
export { TimerDisplay, type TimerDisplayProps } from "./TimerDisplay";

// 유틸리티 컴포넌트
export { HighlightText } from "./HighlightText";

// 트랜지션 컴포넌트
export {
    SlideIn,
    FadeIn,
    PageTransitionProvider,
    usePageTransitionContext,
    usePageTransition,
    DESKTOP_DAILY_DELAYS,
    MOBILE_DAILY_DELAYS,
    TRANSITION_CONFIG,
    SLIDE_DIRECTIONS,
    PAGE_TRANSITION_DELAYS,
    TRANSITION_SPEED_DURATION,
    TRANSITION_SPEED_STAGGER,
    TRANSITION_SPEED_LABELS,
    type SlideDirection,
    type TransitionSpeed,
} from "./transitions";

// 폼 컴포넌트
export {
    SelectWithAdd,
    type SelectWithAddProps,
    AutoCompleteWithHide,
    type AutoCompleteWithHideProps,
    type AutoCompleteOption,
    TimeRangeInput,
    type TimeRangeInputProps,
    WorkFormFields,
    useWorkForm,
    workFormSchema,
    DEFAULT_WORK_FORM_DATA,
    type WorkFormData,
    type WorkFormFieldName,
    type WorkFormLayout,
    type WorkFormFieldsProps,
    type UseWorkFormOptions,
} from "./form";

// 테이블 컴포넌트
export {
    DataTable,
    useDataTable,
    createDataTableColumnHelper,
    type DataTableProps,
    type DataTableRef,
    type UseDataTableOptions,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
} from "./table";

// 모달 컴포넌트
export {
    BaseModal,
    type BaseModalProps,
    FormModal,
    type FormModalProps,
    RecordListModal,
    type RecordListModalProps,
} from "./modal";

// 레이아웃 컴포넌트
export {
    LoadingOverlay,
    type LoadingOverlayProps,
    EmptyState,
    type EmptyStateProps,
    type EmptyImageType,
} from "./layout";
