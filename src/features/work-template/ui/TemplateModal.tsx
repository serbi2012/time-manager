/**
 * 템플릿 추가/수정 모달
 */

import { useEffect } from "react";
import { Modal, Form, Button, message, ColorPicker } from "antd";
import type {
    WorkTemplate,
    WorkFormData,
    HiddenAutoCompleteOptions,
} from "../../../shared/types";
import type { HiddenAutoCompleteField } from "../../../store/types/store";
import { TEMPLATE_COLORS } from "../../../store/useWorkStore";
import { WorkRecordFormFields } from "../../../shared/ui/form";
import { SUCCESS_MESSAGES } from "../../../shared/constants";


export interface TemplateModalProps {
    /** 모달 열림 상태 */
    open: boolean;
    /** 수정 모드 여부 */
    is_edit_mode: boolean;
    /** 수정할 템플릿 */
    editing_template: WorkTemplate | null;
    /** Form 인스턴스 */
    form: ReturnType<typeof Form.useForm>[0];
    /** 스토어 props */
    records: unknown[];
    templates: unknown[];
    getAutoCompleteOptions: (field: keyof WorkFormData) => string[];
    getProjectCodeOptions: () => Array<{ value: string; label: string }>;
    custom_task_options: string[];
    custom_category_options: string[];
    hidden_autocomplete_options: HiddenAutoCompleteOptions;
    addCustomTaskOption: (value: string) => void;
    addCustomCategoryOption: (value: string) => void;
    hideAutoCompleteOption: (
        field: HiddenAutoCompleteField,
        value: string
    ) => void;
    /** 제출 핸들러 */
    onSubmit: (values: {
        project_code?: string;
        work_name: string;
        deal_name?: string;
        task_name?: string;
        category_name?: string;
        note?: string;
        color: string;
    }) => Promise<void>;
    /** 모달 닫기 */
    onClose: () => void;
}

/**
 * 템플릿 추가/수정 모달
 */
export function TemplateModal({
    open,
    is_edit_mode,
    editing_template,
    form,
    records,
    templates,
    getAutoCompleteOptions,
    getProjectCodeOptions,
    custom_task_options,
    custom_category_options,
    hidden_autocomplete_options,
    addCustomTaskOption,
    addCustomCategoryOption,
    hideAutoCompleteOption,
    onSubmit,
    onClose,
}: TemplateModalProps) {
    // 폼 초기화
    useEffect(() => {
        if (open) {
            if (is_edit_mode && editing_template) {
                form.setFieldsValue({
                    project_code: editing_template.project_code || "",
                    work_name: editing_template.work_name,
                    deal_name: editing_template.deal_name,
                    task_name: editing_template.task_name,
                    category_name: editing_template.category_name,
                    note: editing_template.note,
                    color: editing_template.color,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ color: TEMPLATE_COLORS[0] });
            }
        }
    }, [open, is_edit_mode, editing_template, form]);

    // 제출 처리
    const handleSubmit = async () => {
        try {
            const values = (await form.validateFields()) as {
                project_code?: string;
                work_name: string;
                deal_name?: string;
                task_name?: string;
                category_name?: string;
                note?: string;
                color: string | { toHexString: () => string };
            };
            const color =
                typeof values.color === "string"
                    ? values.color
                    : values.color?.toHexString() || TEMPLATE_COLORS[0];

            await onSubmit({
                project_code: values.project_code,
                work_name: values.work_name,
                deal_name: values.deal_name,
                task_name: values.task_name,
                category_name: values.category_name,
                note: values.note,
                color,
            });

            if (is_edit_mode) {
                message.success(SUCCESS_MESSAGES.templateUpdated);
            } else {
                message.success(SUCCESS_MESSAGES.templateAdded);
            }

            onClose();
        } catch {
            // validation failed
        }
    };

    return (
        <Modal
            title={is_edit_mode ? "프리셋 수정" : "새 프리셋 추가"}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleSubmit}>
                    {is_edit_mode ? "수정" : "추가"}{" "}
                    <span className="text-[11px] opacity-85 ml-xs px-xs py-[1px] bg-white/20 rounded-[3px]">F8</span>
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    취소
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onKeyDown={(e) => {
                    if (e.key === "F8") {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
            >
                <WorkRecordFormFields
                    form={form}
                    getAutoCompleteOptions={getAutoCompleteOptions}
                    getProjectCodeOptions={getProjectCodeOptions}
                    custom_task_options={custom_task_options}
                    custom_category_options={custom_category_options}
                    hidden_autocomplete_options={hidden_autocomplete_options}
                    addCustomTaskOption={addCustomTaskOption}
                    addCustomCategoryOption={addCustomCategoryOption}
                    hideAutoCompleteOption={hideAutoCompleteOption}
                    records={records}
                    templates={templates}
                    project_code_placeholder="예: A25_01846 (미입력 시 A00_00000)"
                />

                <Form.Item
                    name="color"
                    label="구분 색상"
                    initialValue={TEMPLATE_COLORS[0]}
                >
                    <ColorPicker
                        presets={[
                            {
                                label: "추천 색상",
                                colors: TEMPLATE_COLORS,
                            },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
