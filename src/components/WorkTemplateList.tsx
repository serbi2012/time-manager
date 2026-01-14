import { useState } from "react";
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
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    AppstoreAddOutlined,
    FolderOutlined,
} from "@ant-design/icons";
import { useWorkStore, TEMPLATE_COLORS } from "../store/useWorkStore";

const { Text } = Typography;

const CATEGORY_OPTIONS = [
    { value: "개발", label: "개발" },
    { value: "문서작업", label: "문서작업" },
    { value: "회의", label: "회의" },
    { value: "환경세팅", label: "환경세팅" },
    { value: "코드리뷰", label: "코드리뷰" },
    { value: "테스트", label: "테스트" },
    { value: "기타", label: "기타" },
];

const TASK_OPTIONS = [
    { value: "개발", label: "개발" },
    { value: "작업", label: "작업" },
    { value: "분석", label: "분석" },
    { value: "설계", label: "설계" },
    { value: "테스트", label: "테스트" },
    { value: "기타", label: "기타" },
];

interface WorkTemplateListProps {
    onAddToRecord: (template_id: string) => void;
}

export default function WorkTemplateList({ onAddToRecord }: WorkTemplateListProps) {
    const { templates, addTemplate, deleteTemplate } = useWorkStore();

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

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
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
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
                                            onClick={() => handleUseTemplate(template.id)}
                                            style={{
                                                borderColor: template.color,
                                                color: template.color,
                                            }}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="프리셋 삭제"
                                        description="이 프리셋을 삭제하시겠습니까?"
                                        onConfirm={() => deleteTemplate(template.id)}
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
                        <Input placeholder="예: 5.6 프레임워크 FE" />
                    </Form.Item>

                    <Form.Item name="deal_name" label="거래명 (상세 작업)">
                        <Input placeholder="예: 5.6 테스트 케이스 확인 및 이슈 처리" />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="middle">
                        <Form.Item
                            name="task_name"
                            label="업무명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="업무 선택"
                                options={TASK_OPTIONS}
                                allowClear
                            />
                        </Form.Item>
                        <Form.Item
                            name="category_name"
                            label="카테고리명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리 선택"
                                options={CATEGORY_OPTIONS}
                                allowClear
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
