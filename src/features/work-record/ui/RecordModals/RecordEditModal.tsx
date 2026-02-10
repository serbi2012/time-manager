/**
 * 작업 수정 모달
 */

import { useEffect } from "react";
import { Modal, Form, Button } from "antd";
import { message } from "@/shared/lib/message";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";
import {
    formatShortcutKeyForPlatform,
    matchShortcutKey,
} from "../../../../hooks/useShortcuts";
import type { WorkRecord } from "../../../../shared/types";
import { WorkRecordFormFields } from "../../../../shared/ui/form";
import {
    RECORD_MODAL_TITLE,
    RECORD_BUTTON,
    RECORD_SUCCESS,
    RECORD_PLACEHOLDER,
} from "../../constants";

export interface RecordEditModalProps {
    /** 모달 열림 상태 */
    open: boolean;
    /** 수정할 레코드 */
    record: WorkRecord | null;
    /** 모달 닫기 */
    onClose: () => void;
}

/**
 * 작업 수정 모달
 */
export function RecordEditModal({
    open,
    record,
    onClose,
}: RecordEditModalProps) {
    const {
        records,
        templates,
        timer,
        updateRecord,
        updateActiveFormData,
        getAutoCompleteOptions,
        getProjectCodeOptions,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        addCustomTaskOption,
        addCustomCategoryOption,
        hideAutoCompleteOption,
    } = useWorkStore();

    // Form
    const [form] = Form.useForm();

    // 모달 저장 단축키
    const modal_submit_shortcut = useShortcutStore((state) =>
        state.shortcuts.find((s) => s.id === "modal-submit")
    );
    const modal_submit_keys = modal_submit_shortcut?.keys || "F8";

    // 폼 초기화
    useEffect(() => {
        if (open && record) {
            form.setFieldsValue({
                project_code: record.project_code || "",
                work_name: record.work_name,
                deal_name: record.deal_name,
                task_name: record.task_name,
                category_name: record.category_name,
                note: record.note,
            });
        }
    }, [open, record, form]);

    // 수정 저장
    const handleSaveEdit = async () => {
        if (!record) return;

        try {
            const values = await form.validateFields();

            const updated_data = {
                project_code: values.project_code || "",
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            };

            // 가상 레코드인 경우 (타이머만 실행 중)
            if (record.id === "__active__") {
                updateActiveFormData(updated_data);
            } else {
                // 실제 레코드 업데이트
                updateRecord(record.id, updated_data);

                // 타이머가 실행 중이고, 현재 수정한 레코드가 타이머 추적 중인 레코드인 경우
                const active_form = timer.active_form_data;
                if (
                    timer.is_running &&
                    active_form &&
                    record.work_name === active_form.work_name &&
                    record.deal_name === active_form.deal_name
                ) {
                    updateActiveFormData(updated_data);
                }
            }

            message.success(RECORD_SUCCESS.UPDATED);
            handleClose();
        } catch {
            // validation failed
        }
    };

    // 모달 닫기
    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={RECORD_MODAL_TITLE.EDIT}
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleSaveEdit}>
                    {RECORD_BUTTON.SAVE} (
                    {formatShortcutKeyForPlatform(modal_submit_keys)})
                </Button>,
                <Button key="cancel" onClick={handleClose}>
                    {RECORD_BUTTON.CANCEL}
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onKeyDown={(e) => {
                    if (matchShortcutKey(e, modal_submit_keys)) {
                        e.preventDefault();
                        handleSaveEdit();
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
                    project_code_placeholder={
                        RECORD_PLACEHOLDER.PROJECT_CODE_WITH_EXAMPLE
                    }
                />
            </Form>
        </Modal>
    );
}
