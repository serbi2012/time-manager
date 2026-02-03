/**
 * 자동완성 옵션 관리 훅
 *
 * 각 필드별 자동완성 옵션을 제공하고 옵션 추가/숨김을 관리합니다.
 * 스토어의 getAutoCompleteOptions, hideAutoCompleteOption 등을 래핑합니다.
 */

import { useMemo, useCallback } from "react";
import { useWorkStore } from "../../store/useWorkStore";

/**
 * 자동완성 옵션 타입
 */
export type AutoCompleteField =
    | "project_code"
    | "work_name"
    | "task_name"
    | "deal_name"
    | "task_option"
    | "category_option";

/**
 * 옵션 아이템 타입
 */
export interface OptionItem {
    value: string;
    label: string;
}

/**
 * 자동완성 옵션 훅 반환 타입
 */
export interface UseAutoCompleteOptionsReturn {
    /** 프로젝트 코드 옵션 */
    projectOptions: OptionItem[];
    /** 작업명 옵션 */
    workNameOptions: OptionItem[];
    /** 업무명 옵션 */
    taskNameOptions: OptionItem[];
    /** 거래명 옵션 */
    dealNameOptions: OptionItem[];
    /** 업무명 Select 옵션 (커스텀 포함) */
    taskSelectOptions: OptionItem[];
    /** 카테고리 Select 옵션 (커스텀 포함) */
    categorySelectOptions: OptionItem[];
    /**
     * 옵션 숨김 처리
     * @param field - 필드 타입
     * @param value - 숨길 값
     */
    hideOption: (field: AutoCompleteField, value: string) => void;
    /**
     * 옵션 숨김 해제
     * @param field - 필드 타입
     * @param value - 숨김 해제할 값
     */
    unhideOption: (field: AutoCompleteField, value: string) => void;
    /**
     * 커스텀 업무명 옵션 추가
     * @param value - 추가할 값
     */
    addTaskOption: (value: string) => void;
    /**
     * 커스텀 카테고리 옵션 추가
     * @param value - 추가할 값
     */
    addCategoryOption: (value: string) => void;
    /**
     * 커스텀 업무명 옵션 제거
     * @param value - 제거할 값
     */
    removeTaskOption: (value: string) => void;
    /**
     * 커스텀 카테고리 옵션 제거
     * @param value - 제거할 값
     */
    removeCategoryOption: (value: string) => void;
}

/**
 * 자동완성 옵션 관리 훅
 *
 * @example
 * ```tsx
 * const {
 *   projectOptions,
 *   workNameOptions,
 *   taskSelectOptions,
 *   categorySelectOptions,
 *   hideOption,
 *   addTaskOption,
 * } = useAutoCompleteOptions();
 *
 * // AutoComplete에서 사용
 * <AutoComplete options={projectOptions} />
 *
 * // Select에서 사용
 * <Select options={taskSelectOptions} />
 *
 * // 옵션 숨기기
 * hideOption("work_name", "숨길작업명");
 *
 * // 커스텀 옵션 추가
 * addTaskOption("새업무명");
 * ```
 */
export function useAutoCompleteOptions(): UseAutoCompleteOptionsReturn {
    // 스토어에서 옵션 조회 함수와 액션들 가져오기
    const getAutoCompleteOptions = useWorkStore(
        (s) => s.getAutoCompleteOptions
    );
    const getProjectCodeOptions = useWorkStore((s) => s.getProjectCodeOptions);
    const hideAutoCompleteOption = useWorkStore(
        (s) => s.hideAutoCompleteOption
    );
    const unhideAutoCompleteOption = useWorkStore(
        (s) => s.unhideAutoCompleteOption
    );
    const addCustomTaskOption = useWorkStore((s) => s.addCustomTaskOption);
    const addCustomCategoryOption = useWorkStore(
        (s) => s.addCustomCategoryOption
    );
    const removeCustomTaskOption = useWorkStore(
        (s) => s.removeCustomTaskOption
    );
    const removeCustomCategoryOption = useWorkStore(
        (s) => s.removeCustomCategoryOption
    );

    // 옵션 데이터 (메모이제이션)
    const records = useWorkStore((s) => s.records);
    const templates = useWorkStore((s) => s.templates);
    const custom_task_options = useWorkStore((s) => s.custom_task_options);
    const custom_category_options = useWorkStore(
        (s) => s.custom_category_options
    );
    const hidden_autocomplete_options = useWorkStore(
        (s) => s.hidden_autocomplete_options
    );

    // 프로젝트 코드 옵션
    const projectOptions = useMemo(() => {
        const options = getProjectCodeOptions();
        return options.map((opt) => ({
            value: opt.value,
            label: opt.label,
        }));
    }, [
        getProjectCodeOptions,
        records,
        templates,
        hidden_autocomplete_options.project_code,
    ]);

    // 작업명 옵션
    const workNameOptions = useMemo(() => {
        const values = getAutoCompleteOptions("work_name");
        return values.map((value) => ({ value, label: value }));
    }, [
        getAutoCompleteOptions,
        records,
        templates,
        hidden_autocomplete_options.work_name,
    ]);

    // 업무명 옵션 (AutoComplete용)
    const taskNameOptions = useMemo(() => {
        const values = getAutoCompleteOptions("task_name");
        return values.map((value) => ({ value, label: value }));
    }, [
        getAutoCompleteOptions,
        records,
        templates,
        hidden_autocomplete_options.task_name,
    ]);

    // 거래명 옵션
    const dealNameOptions = useMemo(() => {
        const values = getAutoCompleteOptions("deal_name");
        return values.map((value) => ({ value, label: value }));
    }, [
        getAutoCompleteOptions,
        records,
        templates,
        hidden_autocomplete_options.deal_name,
    ]);

    // 업무명 Select 옵션 (커스텀 옵션 포함)
    const taskSelectOptions = useMemo(() => {
        const from_records = new Set<string>();
        records.forEach((r) => {
            if (r.task_name) from_records.add(r.task_name);
        });
        templates.forEach((t) => {
            if (t.task_name) from_records.add(t.task_name);
        });

        const all_values = new Set([
            ...Array.from(from_records),
            ...custom_task_options,
        ]);

        // 숨김 처리된 옵션 제외
        const hidden = new Set(hidden_autocomplete_options.task_option || []);
        const filtered = Array.from(all_values).filter(
            (value) => !hidden.has(value)
        );

        return filtered.map((value) => ({ value, label: value }));
    }, [
        records,
        templates,
        custom_task_options,
        hidden_autocomplete_options.task_option,
    ]);

    // 카테고리 Select 옵션 (커스텀 옵션 포함)
    const categorySelectOptions = useMemo(() => {
        const from_records = new Set<string>();
        records.forEach((r) => {
            if (r.category_name) from_records.add(r.category_name);
        });
        templates.forEach((t) => {
            if (t.category_name) from_records.add(t.category_name);
        });

        const all_values = new Set([
            ...Array.from(from_records),
            ...custom_category_options,
        ]);

        // 숨김 처리된 옵션 제외
        const hidden = new Set(
            hidden_autocomplete_options.category_option || []
        );
        const filtered = Array.from(all_values).filter(
            (value) => !hidden.has(value)
        );

        return filtered.map((value) => ({ value, label: value }));
    }, [
        records,
        templates,
        custom_category_options,
        hidden_autocomplete_options.category_option,
    ]);

    // 옵션 숨김
    const hideOption = useCallback(
        (field: AutoCompleteField, value: string) => {
            hideAutoCompleteOption(field, value);
        },
        [hideAutoCompleteOption]
    );

    // 옵션 숨김 해제
    const unhideOption = useCallback(
        (field: AutoCompleteField, value: string) => {
            unhideAutoCompleteOption(field, value);
        },
        [unhideAutoCompleteOption]
    );

    // 커스텀 업무명 옵션 추가
    const addTaskOption = useCallback(
        (value: string) => {
            addCustomTaskOption(value);
        },
        [addCustomTaskOption]
    );

    // 커스텀 카테고리 옵션 추가
    const addCategoryOption = useCallback(
        (value: string) => {
            addCustomCategoryOption(value);
        },
        [addCustomCategoryOption]
    );

    // 커스텀 업무명 옵션 제거
    const removeTaskOption = useCallback(
        (value: string) => {
            removeCustomTaskOption(value);
        },
        [removeCustomTaskOption]
    );

    // 커스텀 카테고리 옵션 제거
    const removeCategoryOption = useCallback(
        (value: string) => {
            removeCustomCategoryOption(value);
        },
        [removeCustomCategoryOption]
    );

    return {
        projectOptions,
        workNameOptions,
        taskNameOptions,
        dealNameOptions,
        taskSelectOptions,
        categorySelectOptions,
        hideOption,
        unhideOption,
        addTaskOption,
        addCategoryOption,
        removeTaskOption,
        removeCategoryOption,
    };
}
