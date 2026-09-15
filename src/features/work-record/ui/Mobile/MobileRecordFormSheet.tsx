/**
 * 모바일 작업 추가·수정 시트
 * 전체 화면을 쓰고, 저장 버튼은 키보드 위에 고정된다
 */

import { useEffect, useCallback } from "react";
import { Form } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useShallow } from "zustand/react/shallow";

import { useWorkStore } from "@/store/useWorkStore";
import { MobileBottomSheet, MobileIconButton } from "@/shared/ui";
import { WorkRecordFormFields } from "@/shared/ui/form";
import { useVisualViewportInset } from "@/shared/hooks";
import type { WorkRecord } from "@/shared/types";

import { useRecordFormActions } from "../../hooks/useRecordFormActions";
import {
    RECORD_MODAL_TITLE,
    RECORD_BUTTON,
    RECORD_PLACEHOLDER,
} from "../../constants";

interface MobileRecordFormSheetProps {
    open: boolean;
    /** 없으면 추가 모드 */
    record: WorkRecord | null;
    onClose: () => void;
}

export function MobileRecordFormSheet({
    open,
    record,
    onClose,
}: MobileRecordFormSheetProps) {
    const {
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
    } = useWorkStore(
        useShallow((s) => ({
            records: s.records,
            templates: s.templates,
            getAutoCompleteOptions: s.getAutoCompleteOptions,
            getProjectCodeOptions: s.getProjectCodeOptions,
            custom_task_options: s.custom_task_options,
            custom_category_options: s.custom_category_options,
            hidden_autocomplete_options: s.hidden_autocomplete_options,
            addCustomTaskOption: s.addCustomTaskOption,
            addCustomCategoryOption: s.addCustomCategoryOption,
            hideAutoCompleteOption: s.hideAutoCompleteOption,
        }))
    );

    const { submitAdd, submitEdit } = useRecordFormActions();
    const keyboard_inset = useVisualViewportInset();

    const [form] = Form.useForm();

    const is_edit_mode = record !== null;

    useEffect(() => {
        if (!open) return;

        if (record) {
            form.setFieldsValue({
                project_code: record.project_code || "",
                work_name: record.work_name,
                deal_name: record.deal_name,
                task_name: record.task_name,
                category_name: record.category_name,
                note: record.note,
            });
            return;
        }

        form.resetFields();
    }, [open, record, form]);

    const handleClose = useCallback(() => {
        form.resetFields();
        onClose();
    }, [form, onClose]);

    const handleSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields();

            if (record) {
                submitEdit(record, values);
            } else {
                submitAdd(values);
            }

            handleClose();
        } catch {
            // 유효성 검사 실패 — 폼이 오류를 표시한다
        }
    }, [form, record, submitAdd, submitEdit, handleClose]);

    return (
        <MobileBottomSheet
            open={open}
            onClose={handleClose}
            full_screen
            header={
                <div className="flex items-center justify-between px-md py-sm border-b border-border-light">
                    <MobileIconButton
                        label={RECORD_BUTTON.CANCEL}
                        onClick={handleClose}
                    >
                        <CloseOutlined style={{ fontSize: 17 }} />
                    </MobileIconButton>

                    <span className="text-lg font-semibold text-text-primary">
                        {is_edit_mode
                            ? RECORD_MODAL_TITLE.EDIT
                            : RECORD_MODAL_TITLE.ADD}
                    </span>

                    <span className="mobile-touch-target" />
                </div>
            }
            footer={
                <div style={{ paddingBottom: keyboard_inset }}>
                    <button
                        type="button"
                        className="w-full h-12 rounded-lg border-0 bg-primary text-white text-md font-semibold cursor-pointer"
                        onClick={handleSubmit}
                    >
                        {is_edit_mode
                            ? RECORD_BUTTON.SAVE
                            : RECORD_BUTTON.ADD}
                    </button>
                </div>
            }
        >
            <div className="px-xl pt-lg pb-xl">
                <Form form={form} layout="vertical">
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
                        project_code_placeholder={
                            RECORD_PLACEHOLDER.PROJECT_CODE_WITH_EXAMPLE
                        }
                    />
                </Form>
            </div>
        </MobileBottomSheet>
    );
}
