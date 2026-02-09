/**
 * Work 레코드 폼 필드 컴포넌트
 * 프로젝트 코드, 작업명, 거래명, 업무명, 카테고리, 메모 입력
 */

import { Form, Input, Select, AutoComplete, Space } from "antd";
import { SelectOptionLabel } from "./SelectOptionLabel";
import { SelectAddNewDropdown } from "./SelectAddNewDropdown";
import type { UseWorkFormOptionsParams } from "./hooks/useWorkFormOptions.tsx";
import { useWorkFormOptions } from "./hooks/useWorkFormOptions.tsx";
import {
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../../../store/useWorkStore";
import {
    GANTT_FORM_LABEL_PROJECT_CODE,
    GANTT_FORM_LABEL_WORK_NAME,
    GANTT_FORM_LABEL_DEAL_NAME,
    GANTT_FORM_LABEL_TASK,
    GANTT_FORM_LABEL_CATEGORY,
    GANTT_FORM_LABEL_NOTE,
    GANTT_FORM_PLACEHOLDER_WORK_NAME,
    GANTT_FORM_PLACEHOLDER_DEAL_NAME,
    GANTT_FORM_PLACEHOLDER_TASK,
    GANTT_FORM_PLACEHOLDER_NEW_TASK,
    GANTT_FORM_PLACEHOLDER_CATEGORY,
    GANTT_FORM_PLACEHOLDER_NEW_CATEGORY,
    GANTT_FORM_PLACEHOLDER_NOTE,
    GANTT_FORM_VALIDATE_WORK_NAME_REQUIRED,
    GANTT_MODAL_BUTTON_ADD,
} from "../../../features/gantt-chart/constants";

const AUTOCOMPLETE_FILTER_OPTION = (
    input: string,
    option?: { value: string }
) => (option?.value ?? "").toLowerCase().includes(input.toLowerCase());

export interface WorkRecordFormFieldsProps
    extends Omit<
        UseWorkFormOptionsParams,
        "default_task_options" | "default_category_options"
    > {
    /** 프로젝트 코드 placeholder (Add/Edit 구분) */
    project_code_placeholder: string;
}

/**
 * Work 레코드 폼 필드 컴포넌트
 *
 * 프로젝트 코드, 작업명, 거래명, 업무명, 카테고리, 메모 입력 필드를 제공합니다.
 * GanttAddModal, GanttEditModal에서 공통으로 사용됩니다.
 */
export function WorkRecordFormFields({
    project_code_placeholder,
    ...hook_params
}: WorkRecordFormFieldsProps) {
    const options = useWorkFormOptions({
        ...hook_params,
        default_task_options: DEFAULT_TASK_OPTIONS,
        default_category_options: DEFAULT_CATEGORY_OPTIONS,
    });

    return (
        <>
            {/* 프로젝트 코드 */}
            <Form.Item
                name="project_code"
                label={GANTT_FORM_LABEL_PROJECT_CODE}
            >
                <AutoComplete
                    options={options.project_code_options}
                    placeholder={project_code_placeholder}
                    filterOption={AUTOCOMPLETE_FILTER_OPTION}
                    onSearch={options.setProjectCodeSearch}
                    onSelect={options.handleProjectCodeSelect}
                />
            </Form.Item>

            {/* 작업명 */}
            <Form.Item
                name="work_name"
                label={GANTT_FORM_LABEL_WORK_NAME}
                rules={[
                    {
                        required: true,
                        message: GANTT_FORM_VALIDATE_WORK_NAME_REQUIRED,
                    },
                ]}
            >
                <AutoComplete
                    options={options.work_name_options}
                    placeholder={GANTT_FORM_PLACEHOLDER_WORK_NAME}
                    filterOption={AUTOCOMPLETE_FILTER_OPTION}
                    onSearch={options.setWorkNameSearch}
                />
            </Form.Item>

            {/* 거래명 */}
            <Form.Item name="deal_name" label={GANTT_FORM_LABEL_DEAL_NAME}>
                <AutoComplete
                    options={options.deal_name_options}
                    placeholder={GANTT_FORM_PLACEHOLDER_DEAL_NAME}
                    filterOption={AUTOCOMPLETE_FILTER_OPTION}
                    onSearch={options.setDealNameSearch}
                />
            </Form.Item>

            {/* 업무명 / 카테고리 */}
            <Space className="!w-full" size="middle">
                <Form.Item
                    name="task_name"
                    label={GANTT_FORM_LABEL_TASK}
                    className="!flex-1"
                >
                    <Select
                        placeholder={GANTT_FORM_PLACEHOLDER_TASK}
                        options={options.task_options}
                        allowClear
                        popupMatchSelectWidth={240}
                        optionRender={(option) => (
                            <SelectOptionLabel
                                label={option.label}
                                onClose={(e) => {
                                    e.stopPropagation();
                                    options.hideAutoCompleteOption(
                                        "task_option",
                                        option.value as string
                                    );
                                }}
                            />
                        )}
                        dropdownRender={(menu) => (
                            <SelectAddNewDropdown
                                menu={menu}
                                input_ref={options.new_task_input_ref}
                                placeholder={GANTT_FORM_PLACEHOLDER_NEW_TASK}
                                value={options.new_task_input}
                                add_button_text={GANTT_MODAL_BUTTON_ADD}
                                onChange={options.setNewTaskInput}
                                onAdd={options.handleAddTaskOption}
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item
                    name="category_name"
                    label={GANTT_FORM_LABEL_CATEGORY}
                    className="!flex-1"
                >
                    <Select
                        placeholder={GANTT_FORM_PLACEHOLDER_CATEGORY}
                        options={options.category_options}
                        allowClear
                        popupMatchSelectWidth={240}
                        optionRender={(option) => (
                            <SelectOptionLabel
                                label={option.label}
                                onClose={(e) => {
                                    e.stopPropagation();
                                    options.hideAutoCompleteOption(
                                        "category_option",
                                        option.value as string
                                    );
                                }}
                            />
                        )}
                        dropdownRender={(menu) => (
                            <SelectAddNewDropdown
                                menu={menu}
                                input_ref={options.new_category_input_ref}
                                placeholder={
                                    GANTT_FORM_PLACEHOLDER_NEW_CATEGORY
                                }
                                value={options.new_category_input}
                                add_button_text={GANTT_MODAL_BUTTON_ADD}
                                onChange={options.setNewCategoryInput}
                                onAdd={options.handleAddCategoryOption}
                            />
                        )}
                    />
                </Form.Item>
            </Space>

            {/* 메모 */}
            <Form.Item name="note" label={GANTT_FORM_LABEL_NOTE}>
                <Input.TextArea
                    placeholder={GANTT_FORM_PLACEHOLDER_NOTE}
                    rows={2}
                />
            </Form.Item>
        </>
    );
}
