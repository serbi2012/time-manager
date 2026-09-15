/**
 * 새 작업 추가 모달
 */

import { Modal, Form, Button } from "antd";
import { useShallow } from "zustand/react/shallow";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useModalKeyboard } from "@/shared/hooks";
import { ShortcutKeyBadge } from "@/shared/ui";
import { WorkRecordFormFields } from "../../../../shared/ui/form";
import { useRecordFormActions } from "../../hooks/useRecordFormActions";
import {
    RECORD_MODAL_TITLE,
    RECORD_BUTTON,
    RECORD_PLACEHOLDER,
} from "../../constants";

export interface RecordAddModalProps {
    /** 모달 열림 상태 */
    open: boolean;
    /** 모달 닫기 */
    onClose: () => void;
}

/**
 * 새 작업 추가 모달
 */
export function RecordAddModal({ open, onClose }: RecordAddModalProps) {
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

    const { submitAdd } = useRecordFormActions();

    const handleAddWork = async () => {
        try {
            const values = await form.validateFields();

            submitAdd(values);

            form.resetFields();
            onClose();
        } catch {
            // validation failed
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const { submit_keys } = useModalKeyboard({
        open,
        onSubmit: handleAddWork,
    });

    return (
        <Modal
            title={RECORD_MODAL_TITLE.ADD}
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleAddWork}>
                    {RECORD_BUTTON.ADD}
                    <ShortcutKeyBadge keys={submit_keys} />
                </Button>,
                <Button key="cancel" onClick={handleClose}>
                    {RECORD_BUTTON.CANCEL}
                </Button>,
            ]}
        >
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
                        RECORD_PLACEHOLDER.PROJECT_CODE_WITH_EXAMPLE_AND_DEFAULT
                    }
                />
            </Form>
        </Modal>
    );
}
