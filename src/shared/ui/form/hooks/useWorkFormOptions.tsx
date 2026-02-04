/**
 * Work 관련 Form 옵션 생성 및 관리 훅
 * GanttAddModal, GanttEditModal 등에서 공통으로 사용
 */

import { useState, useRef, useMemo, useCallback } from "react";
import type { FormInstance, InputRef } from "antd";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { AutoCompleteOptionLabel } from "../AutoCompleteOptionLabel";
import type {
    WorkFormData,
    HiddenAutoCompleteOptions,
} from "../../../../shared/types";
import type { HiddenAutoCompleteField } from "../../../../store/types/store";
import {
    GANTT_MESSAGE_OPTION_HIDDEN,
    GANTT_MESSAGE_OPTION_HIDDEN_V,
    GANTT_OPTION_CLOSE_FONT_SIZE,
    GANTT_OPTION_CLOSE_COLOR,
} from "../../../../features/gantt-chart/constants";

export interface UseWorkFormOptionsParams {
    /** Ant Design Form 인스턴스 */
    form: FormInstance;
    /** AutoComplete 옵션 가져오기 */
    getAutoCompleteOptions: (field: keyof WorkFormData) => string[];
    /** 프로젝트 코드 옵션 가져오기 */
    getProjectCodeOptions: () => Array<{ value: string; label: string }>;
    /** 커스텀 업무 옵션 */
    custom_task_options: string[];
    /** 커스텀 카테고리 옵션 */
    custom_category_options: string[];
    /** 숨김 옵션 */
    hidden_autocomplete_options: HiddenAutoCompleteOptions;
    /** 기본 업무 옵션 */
    default_task_options: readonly string[];
    /** 기본 카테고리 옵션 */
    default_category_options: readonly string[];
    /** 커스텀 업무 옵션 추가 */
    addCustomTaskOption: (value: string) => void;
    /** 커스텀 카테고리 옵션 추가 */
    addCustomCategoryOption: (value: string) => void;
    /** 옵션 숨기기 */
    hideAutoCompleteOption: (
        field: HiddenAutoCompleteField,
        value: string
    ) => void;
    /** 레코드 목록 (프로젝트 코드 옵션 갱신용) */
    records: unknown[];
    /** 템플릿 목록 (프로젝트 코드 옵션 갱신용) */
    templates: unknown[];
}

/**
 * Work Form 옵션 관리 훅
 */
export function useWorkFormOptions({
    form,
    getAutoCompleteOptions,
    getProjectCodeOptions,
    custom_task_options,
    custom_category_options,
    hidden_autocomplete_options,
    default_task_options,
    default_category_options,
    addCustomTaskOption,
    addCustomCategoryOption,
    hideAutoCompleteOption,
    records,
    templates,
}: UseWorkFormOptionsParams) {
    // 사용자 정의 옵션 입력
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");

    // AutoComplete 검색어 상태
    const [project_code_search, setProjectCodeSearch] = useState("");
    const [work_name_search, setWorkNameSearch] = useState("");
    const [deal_name_search, setDealNameSearch] = useState("");

    // Debounced 검색어
    const debounced_project_code_search = useDebouncedValue(
        project_code_search,
        150
    );
    const debounced_work_name_search = useDebouncedValue(work_name_search, 150);
    const debounced_deal_name_search = useDebouncedValue(deal_name_search, 150);

    // Input refs
    const new_task_input_ref = useRef<InputRef>(null);
    const new_category_input_ref = useRef<InputRef>(null);

    // 프로젝트 코드 옵션
    const raw_project_code_options = useMemo(
        () => getProjectCodeOptions(),
        [records, templates, hidden_autocomplete_options, getProjectCodeOptions]
    );

    // 프로젝트 코드 선택 시 코드와 작업명 자동 채우기
    const handleProjectCodeSelect = useCallback(
        (value: string) => {
            const [code, work_name] = value.split("::");
            form.setFieldsValue({
                project_code: code,
                ...(work_name ? { work_name } : {}),
            });
        },
        [form]
    );

    // 프로젝트 코드 옵션 (하이라이트)
    const project_code_options = useMemo(() => {
        return raw_project_code_options.map((opt) => ({
            ...opt,
            label: (
                <AutoCompleteOptionLabel
                    text={opt.label}
                    search={debounced_project_code_search}
                    value={opt.value}
                    option_type="project_code"
                    close_icon_size={GANTT_OPTION_CLOSE_FONT_SIZE}
                    close_icon_color={GANTT_OPTION_CLOSE_COLOR}
                    onHide={hideAutoCompleteOption}
                    hide_message={GANTT_MESSAGE_OPTION_HIDDEN(opt.label)}
                />
            ),
        }));
    }, [
        raw_project_code_options,
        debounced_project_code_search,
        hideAutoCompleteOption,
    ]);

    // 작업명 옵션
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({
            value: v,
            label: (
                <AutoCompleteOptionLabel
                    text={v}
                    search={debounced_work_name_search}
                    value={v}
                    option_type="work_name"
                    close_icon_size={GANTT_OPTION_CLOSE_FONT_SIZE}
                    close_icon_color={GANTT_OPTION_CLOSE_COLOR}
                    onHide={hideAutoCompleteOption}
                    hide_message={GANTT_MESSAGE_OPTION_HIDDEN_V(v)}
                />
            ),
        }));
    }, [
        getAutoCompleteOptions,
        debounced_work_name_search,
        hideAutoCompleteOption,
    ]);

    // 거래명 옵션
    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({
            value: v,
            label: (
                <AutoCompleteOptionLabel
                    text={v}
                    search={debounced_deal_name_search}
                    value={v}
                    option_type="deal_name"
                    close_icon_size={GANTT_OPTION_CLOSE_FONT_SIZE}
                    close_icon_color={GANTT_OPTION_CLOSE_COLOR}
                    onHide={hideAutoCompleteOption}
                    hide_message={GANTT_MESSAGE_OPTION_HIDDEN_V(v)}
                />
            ),
        }));
    }, [
        getAutoCompleteOptions,
        debounced_deal_name_search,
        hideAutoCompleteOption,
    ]);

    // 업무명 옵션
    const task_options = useMemo(() => {
        const all = [...default_task_options, ...custom_task_options];
        const hidden = hidden_autocomplete_options.task_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [
        default_task_options,
        custom_task_options,
        hidden_autocomplete_options,
    ]);

    // 카테고리 옵션
    const category_options = useMemo(() => {
        const all = [...default_category_options, ...custom_category_options];
        const hidden = hidden_autocomplete_options.category_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [
        default_category_options,
        custom_category_options,
        hidden_autocomplete_options,
    ]);

    // 사용자 정의 옵션 추가
    const handleAddTaskOption = useCallback(() => {
        if (new_task_input.trim()) {
            addCustomTaskOption(new_task_input.trim());
            setNewTaskInput("");
        }
    }, [new_task_input, addCustomTaskOption]);

    const handleAddCategoryOption = useCallback(() => {
        if (new_category_input.trim()) {
            addCustomCategoryOption(new_category_input.trim());
            setNewCategoryInput("");
        }
    }, [new_category_input, addCustomCategoryOption]);

    return {
        // 옵션들
        project_code_options,
        work_name_options,
        deal_name_options,
        task_options,
        category_options,

        // 입력 상태
        new_task_input,
        new_category_input,
        setNewTaskInput,
        setNewCategoryInput,

        // Refs
        new_task_input_ref,
        new_category_input_ref,

        // 검색 핸들러
        setProjectCodeSearch,
        setWorkNameSearch,
        setDealNameSearch,

        // 기타 핸들러
        handleProjectCodeSelect,
        handleAddTaskOption,
        handleAddCategoryOption,
        hideAutoCompleteOption,
    };
}
