/**
 * 작업 수정 모달
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
import type { WorkRecord } from "../../../../shared/types";
import { SUCCESS_MESSAGES, INFO_MESSAGES } from "../../../../shared/constants";

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

    // 프로젝트 코드 옵션
    const raw_project_code_options = useMemo(
        () => getProjectCodeOptions(),
        [records, templates, hidden_autocomplete_options, getProjectCodeOptions]
    );

    // 프로젝트 코드 선택 핸들러
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
                            fontSize: 10,
                            color: "#999",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("project_code", opt.value);
                            message.info(INFO_MESSAGES.optionHidden(opt.label));
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
                            fontSize: 10,
                            color: "#999",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("work_name", v);
                            message.info(INFO_MESSAGES.optionHiddenV(v));
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
                            fontSize: 10,
                            color: "#999",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("deal_name", v);
                            message.info(INFO_MESSAGES.optionHiddenV(v));
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

            message.success(SUCCESS_MESSAGES.workUpdated);
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
            title="작업 수정"
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleSaveEdit}>
                    저장 ({formatShortcutKeyForPlatform(modal_submit_keys)})
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
                        handleSaveEdit();
                    }
                }}
            >
                <Form.Item name="project_code" label="프로젝트 코드">
                    <AutoComplete
                        options={project_code_options}
                        placeholder="예: A25_01846"
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
                    label="작업명"
                    rules={[{ required: true, message: "작업명을 입력하세요" }]}
                >
                    <AutoComplete
                        options={work_name_options}
                        placeholder="예: 5.6 프레임워크 FE"
                        filterOption={(input, option) =>
                            (option?.value ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        onSearch={setWorkNameSearch}
                    />
                </Form.Item>

                <Form.Item name="deal_name" label="거래명 (상세 작업)">
                    <AutoComplete
                        options={deal_name_options}
                        placeholder="예: 5.6 테스트 케이스 확인 및 이슈 처리"
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
                        label="업무명"
                        style={{ flex: 1 }}
                    >
                        <Select
                            placeholder="업무 선택"
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
                                            fontSize: 10,
                                            color: "#999",
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
                                            placeholder="새 업무명"
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
                                            추가
                                        </Button>
                                    </Space>
                                </>
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        name="category_name"
                        label="카테고리"
                        style={{ flex: 1 }}
                    >
                        <Select
                            placeholder="카테고리"
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
                                            fontSize: 10,
                                            color: "#999",
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
                                            placeholder="새 카테고리"
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
                                            추가
                                        </Button>
                                    </Space>
                                </>
                            )}
                        />
                    </Form.Item>
                </Space>

                <Form.Item name="note" label="비고">
                    <Input.TextArea placeholder="추가 메모" rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
