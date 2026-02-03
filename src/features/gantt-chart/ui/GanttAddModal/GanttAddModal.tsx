/**
 * 간트 차트 작업 추가 모달
 */

import { useState, useRef, useMemo, useCallback } from "react";
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
    Segmented,
    Radio,
    Typography,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
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
    GANTT_MESSAGE_RECORD_NOT_FOUND,
    GANTT_MESSAGE_OPTION_HIDDEN,
    GANTT_MESSAGE_OPTION_HIDDEN_V,
    GANTT_MESSAGE_SESSION_ADDED_TO_RECORD,
    GANTT_MESSAGE_SESSION_ADDED_EXISTING,
    GANTT_MESSAGE_WORK_ADDED,
    GANTT_MODAL_TITLE_ADD,
    GANTT_MODAL_BUTTON_ADD,
    GANTT_MODAL_BUTTON_CANCEL,
    GANTT_MODAL_SEGMENT_NEW,
    GANTT_MODAL_SEGMENT_EXISTING,
    GANTT_MODAL_SELECT_WORK_PROMPT,
    GANTT_FORM_LABEL_PROJECT_CODE,
    GANTT_FORM_PLACEHOLDER_PROJECT_CODE_ADD,
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
    GANTT_FONT_SMALL,
    GANTT_OPTION_CLOSE_FONT_SIZE,
    GANTT_OPTION_CLOSE_COLOR,
} from "../../constants";

const { Text } = Typography;

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
                    <PlusOutlined />
                    <span>{GANTT_MODAL_TITLE_ADD}</span>
                    {selected_time_range && (
                        <Text type="secondary" style={{ fontWeight: "normal" }}>
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
            {/* 모드 선택 */}
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
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* 기존 작업 선택 모드 */}
            {add_mode === "existing" && today_records.length > 0 ? (
                <div>
                    <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 12 }}
                    >
                        {GANTT_MODAL_SELECT_WORK_PROMPT}
                    </Text>
                    <Radio.Group
                        value={selected_existing_record_id}
                        onChange={(e) =>
                            setSelectedExistingRecordId(e.target.value)
                        }
                        style={{ width: "100%" }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            {today_records.map((record) => (
                                <Radio
                                    key={record.id}
                                    value={record.id}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: 6,
                                        backgroundColor:
                                            selected_existing_record_id ===
                                            record.id
                                                ? "#e6f4ff"
                                                : "transparent",
                                    }}
                                >
                                    <div>
                                        <Text strong>{record.work_name}</Text>
                                        {record.deal_name && (
                                            <Text
                                                type="secondary"
                                                style={{ marginLeft: 8 }}
                                            >
                                                - {record.deal_name}
                                            </Text>
                                        )}
                                        <br />
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: GANTT_FONT_SMALL,
                                            }}
                                        >
                                            [{record.project_code}]{" "}
                                            {record.task_name &&
                                                `${record.task_name}`}
                                            {record.sessions?.length
                                                ? ` (${record.sessions.length}개 세션)`
                                                : ""}
                                        </Text>
                                    </div>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </div>
            ) : (
                /* 새 작업 추가 폼 */
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
                    <Form.Item
                        name="project_code"
                        label={GANTT_FORM_LABEL_PROJECT_CODE}
                    >
                        <AutoComplete
                            options={project_code_options}
                            placeholder={
                                GANTT_FORM_PLACEHOLDER_PROJECT_CODE_ADD
                            }
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

                    <Form.Item
                        name="deal_name"
                        label={GANTT_FORM_LABEL_DEAL_NAME}
                    >
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
                                                    setNewTaskInput(
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
                                                onClick={
                                                    handleAddCategoryOption
                                                }
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
            )}
        </Modal>
    );
}
