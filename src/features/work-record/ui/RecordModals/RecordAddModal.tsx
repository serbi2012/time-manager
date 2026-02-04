/**
 * 새 작업 추가 모달
 */

import { Modal, Form, Button, message } from "antd";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";
import {
    formatShortcutKeyForPlatform,
    matchShortcutKey,
} from "../../../../hooks/useShortcuts";
import type { WorkRecord } from "../../../../shared/types";
import { SUCCESS_MESSAGES } from "../../../../shared/constants";
import { WorkRecordFormFields } from "../../../../shared/ui/form";

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
        selected_date,
        addRecord,
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

    // 작업 추가
    const handleAddWork = async () => {
        try {
            const values = await form.validateFields();

            const new_record: WorkRecord = {
                id: crypto.randomUUID(),
                project_code: values.project_code || "A00_00000",
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
                duration_minutes: 0,
                start_time: "",
                end_time: "",
                date: selected_date,
                sessions: [],
                is_completed: false,
                is_deleted: false,
            };

            addRecord(new_record);
            message.success(SUCCESS_MESSAGES.workAdded);

            form.resetFields();
            onClose();
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
            title="새 작업 추가"
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleAddWork}>
                    추가 ({formatShortcutKeyForPlatform(modal_submit_keys)})
                </Button>,
                <Button key="cancel" onClick={handleClose}>
                    취소
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onKeyDown={(e) => {
                    if (matchShortcutKey(e, modal_submit_keys)) {
                        e.preventDefault();
                        handleAddWork();
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
            </Form>
        </Modal>
    );
}
