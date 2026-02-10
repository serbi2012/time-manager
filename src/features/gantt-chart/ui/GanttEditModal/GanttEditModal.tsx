/**
 * 간트 차트 작업 수정 모달
 */

import { useEffect } from "react";
import { Modal, Form, Space, Button, Typography } from "antd";
import { message } from "@/shared/lib/message";
import dayjs from "dayjs";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";
import {
    formatShortcutKeyForPlatform,
    matchShortcutKey,
} from "../../../../hooks/useShortcuts";
import { timeToMinutes } from "../../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import { WorkRecordFormFields } from "../../../../shared/ui/form";
import { SessionTimeSection } from "./SessionTimeSection";
import {
    GANTT_MESSAGE_WORK_UPDATED,
    GANTT_MESSAGE_ACTIVE_SESSION_END_CANNOT_EDIT,
    GANTT_MODAL_TITLE_EDIT,
    GANTT_MODAL_BUTTON_SAVE,
    GANTT_MODAL_BUTTON_CANCEL,
    GANTT_FORM_PLACEHOLDER_PROJECT_CODE,
} from "../../constants";

const { Text } = Typography;

export interface GanttEditModalProps {
    /** 모달 열림 상태 */
    open: boolean;
    /** 수정할 레코드 */
    record: WorkRecord | null;
    /** 수정할 세션 */
    session: WorkSession | null;
    /** 모달 닫기 */
    onClose: () => void;
}

/**
 * 간트 차트 작업 수정 모달
 */
export function GanttEditModal({
    open,
    record,
    session,
    onClose,
}: GanttEditModalProps) {
    const {
        records,
        templates,
        selected_date,
        timer,
        updateRecord,
        updateSession,
        updateTimerStartTime,
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
        if (open && record && session) {
            const is_active_session = session.id === timer.active_session_id;
            const display_end_time = is_active_session
                ? dayjs().format("HH:mm")
                : session.end_time;

            form.setFieldsValue({
                project_code: record.project_code,
                work_name: record.work_name,
                deal_name: record.deal_name,
                task_name: record.task_name,
                category_name: record.category_name,
                note: record.note,
                session_start_time: session.start_time,
                session_end_time: display_end_time,
            });
        }
    }, [open, record, session, form, timer.active_session_id]);

    // 수정 저장
    const handleEditWork = async () => {
        if (!record || !session) return;

        try {
            const values = await form.validateFields();
            const is_active_session = session.id === timer.active_session_id;
            const original_start = session.start_time;
            const original_end = is_active_session
                ? dayjs().format("HH:mm")
                : session.end_time;

            const new_start = values.session_start_time;
            const new_end = values.session_end_time;
            const is_time_changed =
                new_start !== original_start || new_end !== original_end;

            // 진행 중인 세션의 종료 시간 변경 시도 시 경고
            if (is_active_session && new_end !== original_end) {
                message.warning(GANTT_MESSAGE_ACTIVE_SESSION_END_CANNOT_EDIT);
                return;
            }

            // 세션 시간 수정
            if (is_time_changed) {
                if (is_active_session) {
                    const today = dayjs(selected_date);
                    const new_start_mins = timeToMinutes(new_start);
                    const new_start_timestamp = today
                        .hour(Math.floor(new_start_mins / 60))
                        .minute(new_start_mins % 60)
                        .second(0)
                        .millisecond(0)
                        .valueOf();

                    const result = updateTimerStartTime(new_start_timestamp);
                    if (!result.success) {
                        message.error(result.message);
                        return;
                    }
                    if (result.adjusted) {
                        message.info(result.message);
                    }
                } else {
                    const result = updateSession(
                        record.id,
                        session.id,
                        new_start,
                        new_end
                    );
                    if (!result.success) {
                        message.error(result.message);
                        return;
                    }
                    if (result.adjusted) {
                        message.info(result.message);
                    }
                }
            }

            // 작업 정보 수정
            updateRecord(record.id, {
                project_code: values.project_code || "A00_00000",
                work_name: values.work_name,
                deal_name: values.deal_name || "",
                task_name: values.task_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            });

            message.success(GANTT_MESSAGE_WORK_UPDATED);
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

    const is_active_session = session?.id === timer.active_session_id;

    return (
        <Modal
            title={
                <Space>
                    <span>{GANTT_MODAL_TITLE_EDIT}</span>
                    {record && (
                        <Text type="secondary" className="!font-normal">
                            ({record.deal_name || record.work_name})
                        </Text>
                    )}
                </Space>
            }
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleEditWork}>
                    {GANTT_MODAL_BUTTON_SAVE} (
                    {formatShortcutKeyForPlatform(modal_submit_keys)})
                </Button>,
                <Button key="cancel" onClick={handleClose}>
                    {GANTT_MODAL_BUTTON_CANCEL}
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onKeyDown={(e) => {
                    if (matchShortcutKey(e, modal_submit_keys)) {
                        e.preventDefault();
                        handleEditWork();
                    }
                }}
            >
                <SessionTimeSection is_active_session={is_active_session} />

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
                        GANTT_FORM_PLACEHOLDER_PROJECT_CODE
                    }
                />
            </Form>
        </Modal>
    );
}
