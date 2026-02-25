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
import { Controller } from "react-hook-form";
import { Input, Space, Row, Col, Form } from "antd";
import { SelectWithAdd } from "./SelectWithAdd";
import { AutoCompleteWithHide } from "./AutoCompleteWithHide";
import {
    useAutoCompleteOptions,
    type AutoCompleteField,
} from "../../hooks/useAutoCompleteOptions";
import type { WorkFormFieldName, WorkFormFieldsProps } from "./WorkForm.types";
import { DEFAULT_LABELS, DEFAULT_PLACEHOLDERS } from "./WorkForm.types";

export type {
    WorkFormData,
    WorkFormFieldName,
    WorkFormLayout,
    WorkFormFieldsProps,
    UseWorkFormOptions,
} from "./WorkForm.types";
export { workFormSchema, DEFAULT_WORK_FORM_DATA } from "./WorkForm.types";
export { useWorkForm } from "./useWorkForm";

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

    const [project_search, setProjectSearch] = useState("");
    const [work_name_search, setWorkNameSearch] = useState("");
    const [deal_name_search, setDealNameSearch] = useState("");

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

    const merged_labels = useMemo(
        () => ({ ...DEFAULT_LABELS, ...labels }),
        [labels]
    );
    const merged_placeholders = useMemo(
        () => ({ ...DEFAULT_PLACEHOLDERS, ...placeholders }),
        [placeholders]
    );

    const handleHideOption = useCallback(
        (field: AutoCompleteField, value: string) => {
            hideOption(field, value);
        },
        [hideOption]
    );

    const getColSpan = useCallback(
        (fieldName: WorkFormFieldName): number => {
            if (layout === "inline") return 4;
            if (layout === "compact") {
                if (fieldName === "note") return 24;
                return 12;
            }
            return 24;
        },
        [layout]
    );

    const isFieldVisible = useCallback(
        (fieldName: WorkFormFieldName) => fields_to_show.includes(fieldName),
        [fields_to_show]
    );

    return (
        <div className={className}>
            <Row gutter={[gutter, gutter]}>
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
                                        className="!w-full"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                )}

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
                                        className="!w-full"
                                    />
                                </Form.Item>
                            )}
                        />
                    </Col>
                )}

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
                                        className="!w-full"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                )}

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
                                                className="!w-full"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            )}

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
                                                className="!w-full"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            )}
                        </Space>
                    </Col>
                )}

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
                                        autoSize={{
                                            minRows: 1,
                                            maxRows: 4,
                                        }}
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

export default WorkFormFields;
