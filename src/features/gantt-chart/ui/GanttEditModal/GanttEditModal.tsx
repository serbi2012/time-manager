/**
 * 간트 차트 작업 수정 모달
 */

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { InputRef } from "antd";
import {
    Modal,
    Form,
    Input,
    Select,
    AutoComplete,
    Space,
    Divider,
    Button,
    message,
    Typography,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";
import {
    formatShortcutKeyForPlatform,
    matchShortcutKey,
} from "../../../../hooks/useShortcuts";
import { HighlightText } from "../../../../shared/ui/HighlightText";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { timeToMinutes } from "../../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import {
    GANTT_MESSAGE_OPTION_HIDDEN,
    GANTT_MESSAGE_OPTION_HIDDEN_V,
    GANTT_MESSAGE_WORK_UPDATED,
    GANTT_MESSAGE_ACTIVE_SESSION_END_CANNOT_EDIT,
    GANTT_MODAL_TITLE_EDIT,
    GANTT_MODAL_BUTTON_ADD,
    GANTT_MODAL_BUTTON_SAVE,
    GANTT_MODAL_BUTTON_CANCEL,
    GANTT_MODAL_SESSION_TIME_HEADER,
    GANTT_MODAL_ACTIVE_SESSION_HINT,
    GANTT_FORM_LABEL_START,
    GANTT_FORM_LABEL_END,
    GANTT_FORM_PLACEHOLDER_START,
    GANTT_FORM_PLACEHOLDER_END,
    GANTT_FORM_LABEL_PROJECT_CODE,
    GANTT_FORM_PLACEHOLDER_PROJECT_CODE,
    GANTT_FORM_LABEL_WORK_NAME,
    GANTT_FORM_PLACEHOLDER_WORK_NAME,
    GANTT_FORM_LABEL_DEAL_NAME,
    GANTT_FORM_PLACEHOLDER_DEAL_NAME,
    GANTT_FORM_LABEL_TASK,
    GANTT_FORM_PLACEHOLDER_TASK,
    GANTT_FORM_PLACEHOLDER_NEW_TASK,
    GANTT_FORM_LABEL_CATEGORY,
    GANTT_FORM_PLACEHOLDER_CATEGORY,
    GANTT_FORM_PLACEHOLDER_NEW_CATEGORY,
    GANTT_FORM_LABEL_NOTE,
    GANTT_FORM_PLACEHOLDER_NOTE,
    GANTT_FORM_VALIDATE_WORK_NAME_REQUIRED,
    GANTT_FORM_VALIDATE_START_REQUIRED,
    GANTT_FORM_VALIDATE_END_REQUIRED,
    GANTT_FORM_VALIDATE_TIME_FORMAT,
    GANTT_INPUT_TIME_WIDTH,
    GANTT_OPTION_CLOSE_FONT_SIZE,
    GANTT_OPTION_CLOSE_COLOR,
    GANTT_FONT_SMALL,
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

    // 사용자 정의 옵션 입력
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");

    // AutoComplete 검색어 상태
    const [project_code_search, setProjectCodeSearch] = useState("");
    const [work_name_search, setWorkNameSearch] = useState("");
    const [deal_name_search, setDealNameSearch] = useState("");
    const debounced_project_code_search = useDebouncedValue(
        project_code_search,
        150
    );
    const debounced_work_name_search = useDebouncedValue(work_name_search, 150);
    const debounced_deal_name_search = useDebouncedValue(deal_name_search, 150);

    // Input refs
    const new_task_input_ref = useRef<InputRef>(null);
    const new_category_input_ref = useRef<InputRef>(null);

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

    // 프로젝트 코드 옵션
    const raw_project_code_options = useMemo(
        () => getProjectCodeOptions(),
        [records, templates, hidden_autocomplete_options, getProjectCodeOptions]
    );

    // 프로젝트 코드 선택 시 코드와 작업명 자동 채우기
    const handleProjectCodeSelect = useCallback(
        (value: string) => {
            const [code, work_name] = value.split("::");
            form.setFieldsValue({
                project_code: code,
                ...(work_name ? { work_name } : {}),
            });
        },
        [form]
    );

    // 프로젝트 코드 옵션 (하이라이트)
    const project_code_options = useMemo(() => {
        return raw_project_code_options.map((opt) => ({
            ...opt,
            label: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        <HighlightText
                            text={opt.label}
                            search={debounced_project_code_search}
                        />
                    </span>
                    <CloseOutlined
                        style={{
                            fontSize: GANTT_OPTION_CLOSE_FONT_SIZE,
                            color: GANTT_OPTION_CLOSE_COLOR,
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("project_code", opt.value);
                            message.info(
                                GANTT_MESSAGE_OPTION_HIDDEN(opt.label)
                            );
                        }}
                    />
                </div>
            ),
        }));
    }, [
        raw_project_code_options,
        debounced_project_code_search,
        hideAutoCompleteOption,
    ]);

    // 작업명 옵션
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({
            value: v,
            label: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        <HighlightText
                            text={v}
                            search={debounced_work_name_search}
                        />
                    </span>
                    <CloseOutlined
                        style={{
                            fontSize: GANTT_OPTION_CLOSE_FONT_SIZE,
                            color: GANTT_OPTION_CLOSE_COLOR,
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("work_name", v);
                            message.info(GANTT_MESSAGE_OPTION_HIDDEN_V(v));
                        }}
                    />
                </div>
            ),
        }));
    }, [
        getAutoCompleteOptions,
        debounced_work_name_search,
        hideAutoCompleteOption,
    ]);

    // 거래명 옵션
    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({
            value: v,
            label: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        <HighlightText
                            text={v}
                            search={debounced_deal_name_search}
                        />
                    </span>
                    <CloseOutlined
                        style={{
                            fontSize: GANTT_OPTION_CLOSE_FONT_SIZE,
                            color: GANTT_OPTION_CLOSE_COLOR,
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("deal_name", v);
                            message.info(GANTT_MESSAGE_OPTION_HIDDEN_V(v));
                        }}
                    />
                </div>
            ),
        }));
    }, [
        getAutoCompleteOptions,
        debounced_deal_name_search,
        hideAutoCompleteOption,
    ]);

    // 업무명 옵션
    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        const hidden = hidden_autocomplete_options.task_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_task_options, hidden_autocomplete_options]);

    // 카테고리 옵션
    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        const hidden = hidden_autocomplete_options.category_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_category_options, hidden_autocomplete_options]);

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

    // 사용자 정의 옵션 추가
    const handleAddTaskOption = () => {
        if (new_task_input.trim()) {
            addCustomTaskOption(new_task_input.trim());
            setNewTaskInput("");
        }
    };

    const handleAddCategoryOption = () => {
        if (new_category_input.trim()) {
            addCustomCategoryOption(new_category_input.trim());
            setNewCategoryInput("");
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <span>{GANTT_MODAL_TITLE_EDIT}</span>
                    {record && (
                        <Text type="secondary" style={{ fontWeight: "normal" }}>
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
                {/* 세션 시간 수정 */}
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        background: "#f5f5f5",
                        borderRadius: 8,
                    }}
                >
                    <div
                        style={{
                            marginBottom: 8,
                            fontWeight: 500,
                            fontSize: 13,
                            color: "#666",
                        }}
                    >
                        {GANTT_MODAL_SESSION_TIME_HEADER}
                    </div>
                    <Space size="middle">
                        <Form.Item
                            name="session_start_time"
                            label={GANTT_FORM_LABEL_START}
                            rules={[
                                {
                                    required: true,
                                    message: GANTT_FORM_VALIDATE_START_REQUIRED,
                                },
                                {
                                    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                                    message: GANTT_FORM_VALIDATE_TIME_FORMAT,
                                },
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input
                                placeholder={GANTT_FORM_PLACEHOLDER_START}
                                style={{ width: GANTT_INPUT_TIME_WIDTH }}
                                maxLength={5}
                            />
                        </Form.Item>
                        <span style={{ color: GANTT_OPTION_CLOSE_COLOR }}>
                            ~
                        </span>
                        <Form.Item
                            name="session_end_time"
                            label={GANTT_FORM_LABEL_END}
                            rules={[
                                {
                                    required: true,
                                    message: GANTT_FORM_VALIDATE_END_REQUIRED,
                                },
                                {
                                    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                                    message: GANTT_FORM_VALIDATE_TIME_FORMAT,
                                },
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input
                                placeholder={GANTT_FORM_PLACEHOLDER_END}
                                style={{ width: GANTT_INPUT_TIME_WIDTH }}
                                maxLength={5}
                                disabled={
                                    session?.id === timer.active_session_id
                                }
                            />
                        </Form.Item>
                    </Space>
                    {session?.id === timer.active_session_id && (
                        <div
                            style={{
                                marginTop: 8,
                                fontSize: GANTT_FONT_SMALL,
                                color: GANTT_OPTION_CLOSE_COLOR,
                            }}
                        >
                            {GANTT_MODAL_ACTIVE_SESSION_HINT}
                        </div>
                    )}
                </div>

                <Form.Item
                    name="project_code"
                    label={GANTT_FORM_LABEL_PROJECT_CODE}
                >
                    <AutoComplete
                        options={project_code_options}
                        placeholder={GANTT_FORM_PLACEHOLDER_PROJECT_CODE}
                        filterOption={(input, option) =>
                            (option?.value ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        onSearch={setProjectCodeSearch}
                        onSelect={handleProjectCodeSelect}
                    />
                </Form.Item>

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
                        options={work_name_options}
                        placeholder={GANTT_FORM_PLACEHOLDER_WORK_NAME}
                        filterOption={(input, option) =>
                            (option?.value ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        onSearch={setWorkNameSearch}
                    />
                </Form.Item>

                <Form.Item name="deal_name" label={GANTT_FORM_LABEL_DEAL_NAME}>
                    <AutoComplete
                        options={deal_name_options}
                        placeholder={GANTT_FORM_PLACEHOLDER_DEAL_NAME}
                        filterOption={(input, option) =>
                            (option?.value ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        onSearch={setDealNameSearch}
                    />
                </Form.Item>

                <Space style={{ width: "100%" }} size="middle">
                    <Form.Item
                        name="task_name"
                        label={GANTT_FORM_LABEL_TASK}
                        style={{ flex: 1 }}
                    >
                        <Select
                            placeholder={GANTT_FORM_PLACEHOLDER_TASK}
                            options={task_options}
                            allowClear
                            popupMatchSelectWidth={240}
                            optionRender={(option) => (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span>{option.label}</span>
                                    <CloseOutlined
                                        style={{
                                            fontSize:
                                                GANTT_OPTION_CLOSE_FONT_SIZE,
                                            color: GANTT_OPTION_CLOSE_COLOR,
                                            cursor: "pointer",
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hideAutoCompleteOption(
                                                "task_option",
                                                option.value as string
                                            );
                                        }}
                                    />
                                </div>
                            )}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: "8px 0" }} />
                                    <Space
                                        style={{
                                            padding: "0 8px 4px",
                                            width: "100%",
                                        }}
                                    >
                                        <Input
                                            ref={new_task_input_ref}
                                            placeholder={
                                                GANTT_FORM_PLACEHOLDER_NEW_TASK
                                            }
                                            value={new_task_input}
                                            onChange={(e) =>
                                                setNewTaskInput(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            size="small"
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={handleAddTaskOption}
                                            size="small"
                                        >
                                            {GANTT_MODAL_BUTTON_ADD}
                                        </Button>
                                    </Space>
                                </>
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        name="category_name"
                        label={GANTT_FORM_LABEL_CATEGORY}
                        style={{ flex: 1 }}
                    >
                        <Select
                            placeholder={GANTT_FORM_PLACEHOLDER_CATEGORY}
                            options={category_options}
                            allowClear
                            popupMatchSelectWidth={240}
                            optionRender={(option) => (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span>{option.label}</span>
                                    <CloseOutlined
                                        style={{
                                            fontSize:
                                                GANTT_OPTION_CLOSE_FONT_SIZE,
                                            color: GANTT_OPTION_CLOSE_COLOR,
                                            cursor: "pointer",
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hideAutoCompleteOption(
                                                "category_option",
                                                option.value as string
                                            );
                                        }}
                                    />
                                </div>
                            )}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: "8px 0" }} />
                                    <Space
                                        style={{
                                            padding: "0 8px 4px",
                                            width: "100%",
                                        }}
                                    >
                                        <Input
                                            ref={new_category_input_ref}
                                            placeholder={
                                                GANTT_FORM_PLACEHOLDER_NEW_CATEGORY
                                            }
                                            value={new_category_input}
                                            onChange={(e) =>
                                                setNewCategoryInput(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            size="small"
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={handleAddCategoryOption}
                                            size="small"
                                        >
                                            {GANTT_MODAL_BUTTON_ADD}
                                        </Button>
                                    </Space>
                                </>
                            )}
                        />
                    </Form.Item>
                </Space>

                <Form.Item name="note" label={GANTT_FORM_LABEL_NOTE}>
                    <Input.TextArea
                        placeholder={GANTT_FORM_PLACEHOLDER_NOTE}
                        rows={2}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
