/**
 * 작업 수정 모달
 */

import { useEffect } from "react";
import { Modal, Form, Button } from "antd";
import { useShallow } from "zustand/react/shallow";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useModalKeyboard } from "@/shared/hooks";
import { ShortcutKeyBadge } from "@/shared/ui";
import type { WorkRecord } from "../../../../shared/types";
import { WorkRecordFormFields } from "../../../../shared/ui/form";
import { useRecordFormActions } from "../../hooks/useRecordFormActions";
import {
    RECORD_MODAL_TITLE,
    RECORD_BUTTON,
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

    // Form
    const [form] = Form.useForm();

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

    const { submitEdit } = useRecordFormActions();

    // 수정 저장
    const handleSaveEdit = async () => {
        if (!record) return;

        try {
            const values = await form.validateFields();

            submitEdit(record, values);
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

    const { submit_keys } = useModalKeyboard({
        open,
        onSubmit: handleSaveEdit,
    });

    return (
        <Modal
            title={RECORD_MODAL_TITLE.EDIT}
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleSaveEdit}>
                    {RECORD_BUTTON.SAVE}
                    <ShortcutKeyBadge keys={submit_keys} />
                </Button>,
                <Button key="cancel" onClick={handleClose}>
                    {RECORD_BUTTON.CANCEL}
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
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
