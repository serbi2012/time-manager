/**
 * 폼 관련 공통 컴포넌트
 */

export { SelectWithAdd, type SelectWithAddProps } from "./SelectWithAdd";
export {
    AutoCompleteWithHide,
    type AutoCompleteWithHideProps,
    type AutoCompleteOption,
} from "./AutoCompleteWithHide";
export { TimeRangeInput, type TimeRangeInputProps } from "./TimeRangeInput";
export {
    WorkFormFields,
    useWorkForm,
    workFormSchema,
    DEFAULT_WORK_FORM_DATA,
    type WorkFormData,
    type WorkFormFieldName,
    type WorkFormLayout,
    type WorkFormFieldsProps,
    type UseWorkFormOptions,
} from "./WorkFormFields";
export {
    AutoCompleteOptionLabel,
    type AutoCompleteOptionLabelProps,
} from "./AutoCompleteOptionLabel";
export {
    SelectOptionLabel,
    type SelectOptionLabelProps,
} from "./SelectOptionLabel";
export {
    SelectAddNewDropdown,
    type SelectAddNewDropdownProps,
} from "./SelectAddNewDropdown";
export {
    WorkRecordFormFields,
    type WorkRecordFormFieldsProps,
} from "./WorkRecordFormFields";
export {
    useWorkFormOptions,
    type UseWorkFormOptionsParams,
} from "./hooks/useWorkFormOptions.tsx";
