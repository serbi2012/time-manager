import { useState, useMemo } from "react";
import {
    Card,
    Button,
    Modal,
    Form,
    Input,
    Select,
    ColorPicker,
    Space,
    Typography,
    Popconfirm,
    Empty,
    Tooltip,
    message,
    AutoComplete,
    Divider,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    AppstoreAddOutlined,
    FolderOutlined,
} from "@ant-design/icons";
import {
    useWorkStore,
    TEMPLATE_COLORS,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../store/useWorkStore";

const { Text } = Typography;

interface WorkTemplateListProps {
    onAddToRecord: (template_id: string) => void;
}

export default function WorkTemplateList({
    onAddToRecord,
}: WorkTemplateListProps) {
    const {
        templates,
        addTemplate,
        deleteTemplate,
        getAutoCompleteOptions,
        custom_task_options,
        custom_category_options,
        addCustomTaskOption,
        addCustomCategoryOption,
    } = useWorkStore();

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");

    // 작업명/거래명 자동완성 옵션
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({ value: v }));
    }, [getAutoCompleteOptions]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({ value: v }));
    }, [getAutoCompleteOptions]);

    // 업무명/카테고리명 옵션 (기본 + 사용자 정의)
    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_task_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_category_options]);

    const handleAddTemplate = async () => {
        try {
            const values = await form.validateFields();
            const color =
                typeof values.color === "string"
                    ? values.color
                    : values.color?.toHexString() || TEMPLATE_COLORS[0];

            addTemplate({
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
                color,
            });

            form.resetFields();
            setIsModalOpen(false);
            message.success("프리셋이 추가되었습니다");
        } catch {
            // validation failed
        }
    };

    const handleUseTemplate = (template_id: string) => {
        onAddToRecord(template_id);
        message.success("작업 기록에 추가되었습니다");
    };

    // 업무명 추가
    const handleAddTaskOption = () => {
        if (new_task_input.trim()) {
            addCustomTaskOption(new_task_input.trim());
            setNewTaskInput("");
            message.success(`"${new_task_input.trim()}" 업무명이 추가되었습니다`);
        }
    };

    // 카테고리명 추가
    const handleAddCategoryOption = () => {
        if (new_category_input.trim()) {
            addCustomCategoryOption(new_category_input.trim());
            setNewCategoryInput("");
            message.success(
                `"${new_category_input.trim()}" 카테고리가 추가되었습니다`
            );
        }
    };

    return (
        <>
            <Card
                title={
                    <Space>
                        <FolderOutlined />
                        <span>작업 프리셋</span>
                    </Space>
                }
                size="small"
                className="template-list-card"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => setIsModalOpen(true)}
                    >
                        프리셋 추가
                    </Button>
                }
            >
                <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 12 }}
                >
                    자주 사용하는 작업을 프리셋으로 저장하세요.
                    <br />
                    클릭하면 오늘의 작업 기록에 추가됩니다.
                </Text>

                {templates.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span>
                                프리셋이 없습니다
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    "프리셋 추가" 버튼으로 추가하세요
                                </Text>
                            </span>
                        }
                    />
                ) : (
                    <div className="template-items">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="template-item"
                                style={{ borderLeftColor: template.color }}
                            >
                                <div
                                    className="template-info"
                                    onClick={() => handleUseTemplate(template.id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Text
                                        strong
                                        ellipsis
                                        style={{ display: "block" }}
                                    >
                                        {template.work_name}
                                    </Text>
                                    {template.deal_name && (
                                        <Text
                                            type="secondary"
                                            ellipsis
                                            style={{
                                                fontSize: 12,
                                                display: "block",
                                            }}
                                        >
                                            {template.deal_name}
                                        </Text>
                                    )}
                                    <Text
                                        type="secondary"
                                        ellipsis
                                        style={{
                                            fontSize: 11,
                                            display: "block",
                                            color: "#999",
                                        }}
                                    >
                                        {[template.task_name, template.category_name]
                                            .filter(Boolean)
                                            .join(" · ") || "카테고리 없음"}
                                    </Text>
                                </div>

                                <div className="template-actions">
                                    <Tooltip title="작업 기록에 추가">
                                        <Button
                                            type="primary"
                                            ghost
                                            size="small"
                                            icon={<AppstoreAddOutlined />}
                                            onClick={() =>
                                                handleUseTemplate(template.id)
                                            }
                                            style={{
                                                borderColor: template.color,
                                                color: template.color,
                                            }}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="프리셋 삭제"
                                        description="이 프리셋을 삭제하시겠습니까?"
                                        onConfirm={() =>
                                            deleteTemplate(template.id)
                                        }
                                        okText="삭제"
                                        cancelText="취소"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                title="새 프리셋 추가"
                open={is_modal_open}
                onOk={handleAddTemplate}
                onCancel={() => {
                    form.resetFields();
                    setIsModalOpen(false);
                }}
                okText="추가"
                cancelText="취소"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[
                            { required: true, message: "작업명을 입력하세요" },
                        ]}
                    >
                        <AutoComplete
                            options={work_name_options}
                            placeholder="예: 5.6 프레임워크 FE"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
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
                                popupMatchSelectWidth={200}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{ padding: "0 8px 4px", width: "100%" }}
                                        >
                                            <Input
                                                placeholder="새 업무명"
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
                                                style={{ width: 130 }}
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
                            label="카테고리명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리 선택"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={200}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{ padding: "0 8px 4px", width: "100%" }}
                                        >
                                            <Input
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
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={
                                                    handleAddCategoryOption
                                                }
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

                    <Form.Item
                        name="color"
                        label="구분 색상"
                        initialValue={TEMPLATE_COLORS[0]}
                    >
                        <ColorPicker
                            presets={[
                                {
                                    label: "추천 색상",
                                    colors: TEMPLATE_COLORS,
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style>{`
                .template-list-card {
                    height: 100%;
                }
                
                .template-items {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .template-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border-left: 4px solid #1890ff;
                    background: #fafafa;
                    transition: all 0.2s;
                }
                
                .template-item:hover {
                    background: #f0f0f0;
                }
                
                .template-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .template-info:hover {
                    opacity: 0.8;
                }
                
                .template-actions {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
            `}</style>
        </>
    );
}
