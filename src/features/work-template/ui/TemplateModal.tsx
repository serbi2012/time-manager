/**
 * Template Add/Edit Modal (Toss-style redesign)
 */

import { useEffect } from "react";
import { Modal, Form, Button } from "antd";
import { message } from "@/shared/lib/message";
import type {
    WorkTemplate,
    WorkFormData,
    HiddenAutoCompleteOptions,
} from "../../../shared/types";
import type { HiddenAutoCompleteField } from "../../../store/types/store";
import { TEMPLATE_COLORS } from "../../../store/useWorkStore";
import { WorkRecordFormFields } from "../../../shared/ui/form";
import { SUCCESS_MESSAGES } from "../../../shared/constants";
import { PresetColorGrid } from "./PresetColorGrid";
import {
    MODAL_TITLE_ADD,
    MODAL_TITLE_EDIT,
    MODAL_SUBMIT_ADD,
    MODAL_SUBMIT_EDIT,
    MODAL_CANCEL,
    MODAL_COLOR_LABEL,
} from "../constants";

export interface TemplateModalProps {
    open: boolean;
    is_edit_mode: boolean;
    editing_template: WorkTemplate | null;
    form: ReturnType<typeof Form.useForm>[0];
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
    onSubmit: (values: {
        project_code?: string;
        work_name: string;
        deal_name?: string;
        task_name?: string;
        category_name?: string;
        note?: string;
        color: string;
    }) => Promise<void>;
    onClose: () => void;
}

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

    const handleSubmit = async () => {
        try {
            const values = (await form.validateFields()) as {
                project_code?: string;
                work_name: string;
                deal_name?: string;
                task_name?: string;
                category_name?: string;
                note?: string;
                color: string;
            };

            await onSubmit({
                project_code: values.project_code,
                work_name: values.work_name,
                deal_name: values.deal_name,
                task_name: values.task_name,
                category_name: values.category_name,
                note: values.note,
                color: values.color,
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
            title={is_edit_mode ? MODAL_TITLE_EDIT : MODAL_TITLE_ADD}
            open={open}
            onCancel={onClose}
            transitionName="template-modal-slide-up"
            wrapClassName="template-modal-wrap"
            footer={[
                <Button key="ok" type="primary" onClick={handleSubmit}>
                    {is_edit_mode ? MODAL_SUBMIT_EDIT : MODAL_SUBMIT_ADD}
                    <span className="text-xs opacity-85 ml-xs px-xs py-px bg-white/20 rounded-[3px]">
                        F8
                    </span>
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    {MODAL_CANCEL}
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
                    label={MODAL_COLOR_LABEL}
                    initialValue={TEMPLATE_COLORS[0]}
                >
                    <PresetColorGrid />
                </Form.Item>
            </Form>
        </Modal>
    );
}
