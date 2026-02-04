/**
 * 간트 차트 작업 추가 모달
 */

import { useState } from "react";
import {
    Modal,
    Form,
    Space,
    Button,
    message,
    Segmented,
    Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";
import {
    formatShortcutKeyForPlatform,
    matchShortcutKey,
} from "../../../../hooks/useShortcuts";
import { timeToMinutes } from "../../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import { WorkRecordFormFields } from "../../../../shared/ui/form";
import { ExistingRecordSelector } from "./ExistingRecordSelector";
import {
    GANTT_MESSAGE_RECORD_NOT_FOUND,
    GANTT_MESSAGE_SESSION_ADDED_TO_RECORD,
    GANTT_MESSAGE_SESSION_ADDED_EXISTING,
    GANTT_MESSAGE_WORK_ADDED,
    GANTT_MODAL_TITLE_ADD,
    GANTT_MODAL_BUTTON_ADD,
    GANTT_MODAL_BUTTON_CANCEL,
    GANTT_MODAL_SEGMENT_NEW,
    GANTT_MODAL_SEGMENT_EXISTING,
    GANTT_FORM_PLACEHOLDER_PROJECT_CODE_ADD,
} from "../../constants";

const { Text } = Typography;

const MODAL_TITLE_SECONDARY_STYLE: React.CSSProperties = {
    fontWeight: "normal",
};

const SEGMENTED_MARGIN_STYLE: React.CSSProperties = {
    marginBottom: 16,
};

export interface GanttAddModalProps {
    /** 모달 열림 상태 */
    open: boolean;
    /** 선택된 시간 범위 */
    selected_time_range: { start: string; end: string } | null;
    /** 오늘 레코드 목록 */
    today_records: WorkRecord[];
    /** 점심시간 제외 시간 계산 함수 */
    calculateDurationExcludingLunch: (start: number, end: number) => number;
    /** 모달 닫기 */
    onClose: () => void;
}

/**
 * 간트 차트 작업 추가 모달
 */
export function GanttAddModal({
    open,
    selected_time_range,
    today_records,
    calculateDurationExcludingLunch,
    onClose,
}: GanttAddModalProps) {
    const {
        records,
        templates,
        selected_date,
        addRecord,
        updateRecord,
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

    // 작업 추가 모드
    const [add_mode, setAddMode] = useState<"existing" | "new">("new");
    const [selected_existing_record_id, setSelectedExistingRecordId] = useState<
        string | null
    >(null);

    // 기존 작업에 세션 추가
    const handleAddToExistingRecord = () => {
        if (!selected_time_range || !selected_existing_record_id) return;

        const target_record = records.find(
            (r) => r.id === selected_existing_record_id
        );
        if (!target_record) {
            message.error(GANTT_MESSAGE_RECORD_NOT_FOUND);
            return;
        }

        const start_mins = timeToMinutes(selected_time_range.start);
        const end_mins = timeToMinutes(selected_time_range.end);
        const duration_minutes = calculateDurationExcludingLunch(
            start_mins,
            end_mins
        );

        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: selected_date,
            start_time: selected_time_range.start,
            end_time: selected_time_range.end,
            duration_minutes,
        };

        const updated_sessions = [
            ...(target_record.sessions || []),
            new_session,
        ];
        const total_minutes = updated_sessions.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0
        );

        const sorted_sessions = [...updated_sessions].sort((a, b) => {
            return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
        });

        updateRecord(target_record.id, {
            sessions: sorted_sessions,
            duration_minutes: total_minutes,
            start_time:
                sorted_sessions[0]?.start_time || target_record.start_time,
            end_time:
                sorted_sessions[sorted_sessions.length - 1]?.end_time ||
                target_record.end_time,
        });

        message.success(
            GANTT_MESSAGE_SESSION_ADDED_TO_RECORD(
                target_record.work_name,
                selected_time_range.start,
                selected_time_range.end
            )
        );

        handleClose();
    };

    // 새 작업 추가
    const handleAddWork = async () => {
        if (!selected_time_range) return;

        if (add_mode === "existing") {
            handleAddToExistingRecord();
            return;
        }

        try {
            const values = await form.validateFields();
            const start_mins = timeToMinutes(selected_time_range.start);
            const end_mins = timeToMinutes(selected_time_range.end);
            const duration_minutes = calculateDurationExcludingLunch(
                start_mins,
                end_mins
            );

            const new_session: WorkSession = {
                id: crypto.randomUUID(),
                date: selected_date,
                start_time: selected_time_range.start,
                end_time: selected_time_range.end,
                duration_minutes,
            };

            // 같은 날짜에 같은 work_name, deal_name을 가진 기존 레코드 찾기
            const existing_record = records.find(
                (r) =>
                    r.date === selected_date &&
                    r.work_name === values.work_name &&
                    r.deal_name === (values.deal_name || "")
            );

            if (existing_record) {
                // 기존 레코드에 세션 추가
                const updated_sessions = [
                    ...(existing_record.sessions || []),
                    new_session,
                ];
                const total_minutes = updated_sessions.reduce(
                    (sum, s) => sum + (s.duration_minutes || 0),
                    0
                );

                const sorted_sessions = [...updated_sessions].sort((a, b) => {
                    return (
                        timeToMinutes(a.start_time) -
                        timeToMinutes(b.start_time)
                    );
                });

                updateRecord(existing_record.id, {
                    sessions: sorted_sessions,
                    duration_minutes: total_minutes,
                    start_time:
                        sorted_sessions[0]?.start_time ||
                        existing_record.start_time,
                    end_time:
                        sorted_sessions[sorted_sessions.length - 1]?.end_time ||
                        existing_record.end_time,
                });

                message.success(
                    GANTT_MESSAGE_SESSION_ADDED_EXISTING(
                        selected_time_range.start,
                        selected_time_range.end
                    )
                );
            } else {
                // 새 레코드 생성
                const new_record: WorkRecord = {
                    id: crypto.randomUUID(),
                    project_code: values.project_code || "A00_00000",
                    work_name: values.work_name,
                    task_name: values.task_name || "",
                    deal_name: values.deal_name || "",
                    category_name: values.category_name || "",
                    note: values.note || "",
                    duration_minutes,
                    start_time: selected_time_range.start,
                    end_time: selected_time_range.end,
                    date: selected_date,
                    sessions: [new_session],
                    is_completed: false,
                };

                addRecord(new_record);
                message.success(
                    GANTT_MESSAGE_WORK_ADDED(
                        selected_time_range.start,
                        selected_time_range.end
                    )
                );
            }

            handleClose();
        } catch {
            // validation failed
        }
    };

    // 모달 닫기
    const handleClose = () => {
        form.resetFields();
        setAddMode("new");
        setSelectedExistingRecordId(null);
        onClose();
    };

    return (
        <Modal
            title={
                <Space>
                    <PlusOutlined />
                    <span>{GANTT_MODAL_TITLE_ADD}</span>
                    {selected_time_range && (
                        <Text
                            type="secondary"
                            style={MODAL_TITLE_SECONDARY_STYLE}
                        >
                            ({selected_time_range.start} ~{" "}
                            {selected_time_range.end})
                        </Text>
                    )}
                </Space>
            }
            open={open}
            onCancel={handleClose}
            footer={[
                <Button
                    key="ok"
                    type="primary"
                    onClick={handleAddWork}
                    disabled={
                        add_mode === "existing" && !selected_existing_record_id
                    }
                >
                    {GANTT_MODAL_BUTTON_ADD} (
                    {formatShortcutKeyForPlatform(modal_submit_keys)})
                </Button>,
                <Button key="cancel" onClick={handleClose}>
                    {GANTT_MODAL_BUTTON_CANCEL}
                </Button>,
            ]}
        >
            {today_records.length > 0 && (
                <Segmented
                    value={add_mode}
                    onChange={(value) => {
                        setAddMode(value as "existing" | "new");
                        setSelectedExistingRecordId(null);
                    }}
                    options={[
                        { label: GANTT_MODAL_SEGMENT_NEW, value: "new" },
                        {
                            label: GANTT_MODAL_SEGMENT_EXISTING,
                            value: "existing",
                        },
                    ]}
                    block
                    style={SEGMENTED_MARGIN_STYLE}
                />
            )}

            {add_mode === "existing" && today_records.length > 0 ? (
                <ExistingRecordSelector
                    today_records={today_records}
                    selected_record_id={selected_existing_record_id}
                    onChange={setSelectedExistingRecordId}
                />
            ) : (
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
                        hidden_autocomplete_options={
                            hidden_autocomplete_options
                        }
                        addCustomTaskOption={addCustomTaskOption}
                        addCustomCategoryOption={addCustomCategoryOption}
                        hideAutoCompleteOption={hideAutoCompleteOption}
                        records={records}
                        templates={templates}
                        project_code_placeholder={
                            GANTT_FORM_PLACEHOLDER_PROJECT_CODE_ADD
                        }
                    />
                </Form>
            )}
        </Modal>
    );
}
