/**
 * 작업 폼 필드 공통 컴포넌트
 *
 * DailyGanttChart, WorkRecordTable, WorkTemplateList에서 중복되던 폼 필드 패턴을 통합
 * react-hook-form + zod 기반으로 타입 안전하고 테스트 용이한 구조
 *
 * @example
 * // 기본 사용
 * const { control, handleSubmit } = useWorkForm();
 * <WorkFormFields control={control} />
 *
 * // 컴팩트 레이아웃
 * <WorkFormFields control={control} layout="compact" />
 *
 * // 일부 필드만 표시
 * <WorkFormFields
 *   control={control}
 *   visibleFields={["project_code", "work_name", "task_name"]}
 * />
 */

import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Space, Row, Col, Form } from "antd";
import { SelectWithAdd } from "./SelectWithAdd";
import { AutoCompleteWithHide } from "./AutoCompleteWithHide";
import {
    useAutoCompleteOptions,
    type AutoCompleteField,
} from "../../hooks/useAutoCompleteOptions";

// ============================================================================
// Zod 스키마 정의 (테스트 가능한 순수 스키마)
// ============================================================================

/**
 * 작업 폼 데이터 타입
 */
export interface WorkFormData {
    project_code: string;
    work_name: string;
    task_name: string;
    deal_name: string;
    category_name: string;
    note: string;
}

/**
 * 작업 폼 스키마
 * required: work_name만 필수
 */
export const workFormSchema = z.object({
    project_code: z.string(),
    work_name: z.string().min(1, "작업명을 입력하세요"),
    task_name: z.string(),
    deal_name: z.string(),
    category_name: z.string(),
    note: z.string(),
}) satisfies z.ZodType<WorkFormData>;

/**
 * 작업 폼 기본값
 */
export const DEFAULT_WORK_FORM_DATA: WorkFormData = {
    project_code: "",
    work_name: "",
    task_name: "",
    deal_name: "",
    category_name: "",
    note: "",
};

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 표시할 필드 목록 타입
 */
export type WorkFormFieldName = keyof WorkFormData;

/**
 * 레이아웃 타입
 */
export type WorkFormLayout = "default" | "compact" | "inline";

/**
 * WorkFormFields Props
 */
export interface WorkFormFieldsProps {
    /** react-hook-form control 객체 */
    control: Control<WorkFormData>;
    /** 레이아웃 타입 (default: 세로, compact: 2열, inline: 한 줄) */
    layout?: WorkFormLayout;
    /** 표시할 필드 목록 (기본값: 전체) */
    visibleFields?: WorkFormFieldName[];
    /** 비활성화 여부 */
    disabled?: boolean;
    /** 필드별 placeholder 오버라이드 */
    placeholders?: Partial<Record<WorkFormFieldName, string>>;
    /** 필드별 label 오버라이드 */
    labels?: Partial<Record<WorkFormFieldName, string>>;
    /** 커스텀 클래스명 */
    className?: string;
    /** Form.Item 간격 (기본값: 8) */
    gutter?: number;
}

// ============================================================================
// 기본 라벨/플레이스홀더 상수
// ============================================================================

const DEFAULT_LABELS: Record<WorkFormFieldName, string> = {
    project_code: "프로젝트 코드",
    work_name: "작업명",
    task_name: "업무명",
    deal_name: "거래명 (상세 작업)",
    category_name: "카테고리",
    note: "비고",
};

const DEFAULT_PLACEHOLDERS: Record<WorkFormFieldName, string> = {
    project_code: "예: A25_01846 (미입력 시 A00_00000)",
    work_name: "예: 5.6 프레임워크 FE",
    task_name: "업무 선택",
    deal_name: "예: 5.6 테스트 케이스 확인 및 이슈 처리",
    category_name: "카테고리 선택",
    note: "추가 메모",
};

// ============================================================================
// 메인 컴포넌트
// ============================================================================

/**
 * 작업 폼 필드 공통 컴포넌트
 */
export function WorkFormFields({
    control,
    layout = "default",
    visibleFields,
    disabled = false,
    placeholders = {},
    labels = {},
    className,
    gutter = 8,
}: WorkFormFieldsProps) {
    // 자동완성 옵션 훅
    const {
        projectOptions,
        workNameOptions,
        dealNameOptions,
        taskSelectOptions,
        categorySelectOptions,
        hideOption,
        addTaskOption,
        addCategoryOption,
    } = useAutoCompleteOptions();

    // 검색어 상태 (하이라이트용)
    const [project_search, setProjectSearch] = useState("");
    const [work_name_search, setWorkNameSearch] = useState("");
    const [deal_name_search, setDealNameSearch] = useState("");

    // 표시할 필드 결정
    const fields_to_show = useMemo<WorkFormFieldName[]>(() => {
        if (visibleFields && visibleFields.length > 0) {
            return visibleFields;
        }
        return [
            "project_code",
            "work_name",
            "deal_name",
            "task_name",
            "category_name",
            "note",
        ];
    }, [visibleFields]);

    // 라벨/플레이스홀더 병합
    const merged_labels = useMemo(
        () => ({ ...DEFAULT_LABELS, ...labels }),
        [labels]
    );
    const merged_placeholders = useMemo(
        () => ({ ...DEFAULT_PLACEHOLDERS, ...placeholders }),
        [placeholders]
    );

    // 숨김 핸들러
    const handleHideOption = useCallback(
        (field: AutoCompleteField, value: string) => {
            hideOption(field, value);
        },
        [hideOption]
    );

    // 레이아웃에 따른 Col span 계산
    const getColSpan = useCallback(
        (fieldName: WorkFormFieldName): number => {
            if (layout === "inline") return 4;
            if (layout === "compact") {
                // note는 전체 너비
                if (fieldName === "note") return 24;
                return 12;
            }
            // default: 전체 너비
            return 24;
        },
        [layout]
    );

    // 필드 존재 여부 확인
    const isFieldVisible = useCallback(
        (fieldName: WorkFormFieldName) => fields_to_show.includes(fieldName),
        [fields_to_show]
    );

    return (
        <div className={className}>
            <Row gutter={[gutter, gutter]}>
                {/* 프로젝트 코드 */}
                {isFieldVisible("project_code") && (
                    <Col span={getColSpan("project_code")}>
                        <Form.Item
                            label={merged_labels.project_code}
                            style={{ marginBottom: gutter }}
                        >
                            <Controller
                                name="project_code"
                                control={control}
                                render={({ field }) => (
                                    <AutoCompleteWithHide
                                        {...field}
                                        options={projectOptions}
                                        placeholder={
                                            merged_placeholders.project_code
                                        }
                                        disabled={disabled}
                                        onHideOption={(value) =>
                                            handleHideOption(
                                                "project_code",
                                                value
                                            )
                                        }
                                        searchValue={project_search}
                                        onSearch={setProjectSearch}
                                        filterOption={(input, option) =>
                                            String(option?.value ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        style={{ width: "100%" }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                )}

                {/* 작업명 (필수) */}
                {isFieldVisible("work_name") && (
                    <Col span={getColSpan("work_name")}>
                        <Controller
                            name="work_name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Form.Item
                                    label={merged_labels.work_name}
                                    validateStatus={
                                        fieldState.error ? "error" : undefined
                                    }
                                    help={fieldState.error?.message}
                                    required
                                    style={{ marginBottom: gutter }}
                                >
                                    <AutoCompleteWithHide
                                        {...field}
                                        options={workNameOptions}
                                        placeholder={
                                            merged_placeholders.work_name
                                        }
                                        disabled={disabled}
                                        onHideOption={(value) =>
                                            handleHideOption("work_name", value)
                                        }
                                        searchValue={work_name_search}
                                        onSearch={setWorkNameSearch}
                                        filterOption={(input, option) =>
                                            String(option?.value ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            )}
                        />
                    </Col>
                )}

                {/* 거래명 */}
                {isFieldVisible("deal_name") && (
                    <Col span={getColSpan("deal_name")}>
                        <Form.Item
                            label={merged_labels.deal_name}
                            style={{ marginBottom: gutter }}
                        >
                            <Controller
                                name="deal_name"
                                control={control}
                                render={({ field }) => (
                                    <AutoCompleteWithHide
                                        {...field}
                                        options={dealNameOptions}
                                        placeholder={
                                            merged_placeholders.deal_name
                                        }
                                        disabled={disabled}
                                        onHideOption={(value) =>
                                            handleHideOption("deal_name", value)
                                        }
                                        searchValue={deal_name_search}
                                        onSearch={setDealNameSearch}
                                        filterOption={(input, option) =>
                                            String(option?.value ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        style={{ width: "100%" }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                )}

                {/* 업무명 + 카테고리 (같은 줄) */}
                {(isFieldVisible("task_name") ||
                    isFieldVisible("category_name")) && (
                    <Col span={layout === "inline" ? 8 : 24}>
                        <Space
                            style={{
                                width: "100%",
                                display:
                                    layout === "default" ? "flex" : undefined,
                            }}
                            size="middle"
                        >
                            {/* 업무명 (Select) */}
                            {isFieldVisible("task_name") && (
                                <Form.Item
                                    label={merged_labels.task_name}
                                    style={{
                                        flex: 1,
                                        marginBottom: gutter,
                                    }}
                                >
                                    <Controller
                                        name="task_name"
                                        control={control}
                                        render={({ field }) => (
                                            <SelectWithAdd
                                                {...field}
                                                options={taskSelectOptions}
                                                placeholder={
                                                    merged_placeholders.task_name
                                                }
                                                disabled={disabled}
                                                allowClear
                                                popupMatchSelectWidth={240}
                                                onAddOption={addTaskOption}
                                                onHideOption={(value) =>
                                                    handleHideOption(
                                                        "task_option",
                                                        value
                                                    )
                                                }
                                                addPlaceholder="새 업무명"
                                                style={{ width: "100%" }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            )}

                            {/* 카테고리 (Select) */}
                            {isFieldVisible("category_name") && (
                                <Form.Item
                                    label={merged_labels.category_name}
                                    style={{
                                        flex: 1,
                                        marginBottom: gutter,
                                    }}
                                >
                                    <Controller
                                        name="category_name"
                                        control={control}
                                        render={({ field }) => (
                                            <SelectWithAdd
                                                {...field}
                                                options={categorySelectOptions}
                                                placeholder={
                                                    merged_placeholders.category_name
                                                }
                                                disabled={disabled}
                                                allowClear
                                                popupMatchSelectWidth={240}
                                                onAddOption={addCategoryOption}
                                                onHideOption={(value) =>
                                                    handleHideOption(
                                                        "category_option",
                                                        value
                                                    )
                                                }
                                                addPlaceholder="새 카테고리"
                                                style={{ width: "100%" }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            )}
                        </Space>
                    </Col>
                )}

                {/* 비고 */}
                {isFieldVisible("note") && (
                    <Col span={getColSpan("note")}>
                        <Form.Item
                            label={merged_labels.note}
                            style={{ marginBottom: gutter }}
                        >
                            <Controller
                                name="note"
                                control={control}
                                render={({ field }) => (
                                    <Input.TextArea
                                        {...field}
                                        placeholder={merged_placeholders.note}
                                        disabled={disabled}
                                        rows={2}
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                )}
            </Row>
        </div>
    );
}

// ============================================================================
// 폼 훅
// ============================================================================

/**
 * useWorkForm 옵션
 */
export interface UseWorkFormOptions {
    /** 기본값 */
    defaultValues?: Partial<WorkFormData>;
    /** 폼 모드 */
    mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
}

/**
 * 작업 폼 훅
 *
 * react-hook-form + zod 통합 폼 훅
 *
 * @example
 * const form = useWorkForm();
 * const { control, handleSubmit, reset } = form;
 *
 * const onSubmit = handleSubmit((data) => {
 *   console.log(data);
 * });
 */
export function useWorkForm(options: UseWorkFormOptions = {}) {
    const { defaultValues = {}, mode = "onSubmit" } = options;

    return useForm<WorkFormData>({
        resolver: zodResolver(workFormSchema),
        defaultValues: {
            ...DEFAULT_WORK_FORM_DATA,
            ...defaultValues,
        },
        mode,
    });
}

export default WorkFormFields;
