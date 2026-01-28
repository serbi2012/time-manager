import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { InputRef } from "antd";
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
    EditOutlined,
    FolderOutlined,
    CloseOutlined,
    HolderOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    useWorkStore,
    TEMPLATE_COLORS,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../store/useWorkStore";
import type { WorkTemplate } from "../types";
import { useResponsive } from "../hooks/useResponsive";

const { Text } = Typography;

// Sortable 템플릿 카드 컴포넌트
interface SortableTemplateCardProps {
    template: WorkTemplate;
    onEdit: (template: WorkTemplate) => void;
    onDelete: (id: string) => void;
    onAddRecordOnly?: (template_id: string) => void;
}

function SortableTemplateCard({
    template,
    onEdit,
    onDelete,
    onAddRecordOnly,
}: SortableTemplateCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: template.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        borderLeftColor: template.color,
    };

    return (
        <div
            ref={setNodeRef}
            className="template-card"
            style={style}
        >
            {/* 드래그 핸들 */}
            <div
                className="template-drag-handle"
                {...attributes}
                {...listeners}
            >
                <HolderOutlined />
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="template-content">
                {/* 상단: 작업명 태그 */}
                <div className="template-header">
                    <Tag
                        color={template.color}
                        style={{
                            fontSize: 10,
                            lineHeight: 1.3,
                            padding: "1px 6px",
                            margin: 0,
                        }}
                    >
                        {template.work_name}
                    </Tag>
                </div>

                {/* 중앙: 거래명 (제목) */}
                <Text strong className="template-title">
                    {template.deal_name || template.work_name}
                </Text>

                {/* 하단: 업무명 · 카테고리 */}
                {(template.task_name || template.category_name) && (
                    <Text type="secondary" className="template-subtitle">
                        {[template.task_name, template.category_name]
                            .filter(Boolean)
                            .join(" · ")}
                    </Text>
                )}
            </div>

            {/* 액션 버튼 영역 */}
            <div className="template-actions">
                {/* 호버 시 표시되는 수정/삭제 버튼 */}
                <div className="template-hover-buttons">
                    <Tooltip title="수정">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(template);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="프리셋 삭제"
                        description="이 프리셋을 삭제하시겠습니까?"
                        onConfirm={() => onDelete(template.id)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true, autoFocus: true }}
                    >
                        <Tooltip title="삭제">
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>

                {/* 항상 표시되는 버튼들 */}
                <Space size={4}>
                    {onAddRecordOnly && (
                        <Tooltip title="작업 추가">
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddRecordOnly(template.id);
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            </div>
        </div>
    );
}

interface WorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void; // 타이머 없이 작업 기록에만 추가
}

export default function WorkTemplateList({
    onAddRecordOnly,
}: WorkTemplateListProps) {
    const { is_mobile } = useResponsive();

    const {
        templates,
        records,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        reorderTemplates,
        getAutoCompleteOptions,
        getProjectCodeOptions,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        addCustomTaskOption,
        addCustomCategoryOption,
        hideAutoCompleteOption,
    } = useWorkStore();

    // dnd-kit 센서 설정 (모바일에서는 터치 센서 추가)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px 이동해야 드래그 시작
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // 250ms 터치 유지해야 드래그 시작
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 드래그 종료 핸들러
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderTemplates(active.id as string, over.id as string);
        }
    };

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [is_edit_mode, setIsEditMode] = useState(false);
    const [editing_template, setEditingTemplate] =
        useState<WorkTemplate | null>(null);
    const [form] = Form.useForm();
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");
    
    // Input refs for focus management
    const new_task_input_ref = useRef<InputRef>(null);
    const new_category_input_ref = useRef<InputRef>(null);

    // 프로젝트 코드 자동완성 옵션 (원본)
    const raw_project_code_options = useMemo(() => {
        return getProjectCodeOptions();
    }, [records, templates, getProjectCodeOptions]);

    // 프로젝트 코드 선택 시 작업명 자동 채우기 핸들러
    const handleProjectCodeSelect = useCallback(
        (value: string) => {
            const selected = raw_project_code_options.find((opt) => opt.value === value);
            if (selected?.work_name) {
                form.setFieldsValue({ work_name: selected.work_name });
            }
        },
        [raw_project_code_options, form]
    );

    // 프로젝트 코드 자동완성 옵션 (삭제 버튼 포함)
    const project_code_options = useMemo(() => {
        return raw_project_code_options.map((opt) => ({
            ...opt,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{opt.label}</span>
                    <CloseOutlined
                        style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("project_code", opt.value);
                            message.info(`"${opt.value}" 코드가 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [raw_project_code_options, hideAutoCompleteOption]);

    // 작업명/거래명 자동완성 옵션 (삭제 버튼 포함)
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({
            value: v,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{v}</span>
                    <CloseOutlined
                        style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("work_name", v);
                            message.info(`"${v}" 옵션이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [records, templates, hidden_autocomplete_options, getAutoCompleteOptions, hideAutoCompleteOption]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({
            value: v,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{v}</span>
                    <CloseOutlined
                        style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("deal_name", v);
                            message.info(`"${v}" 옵션이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [records, templates, hidden_autocomplete_options, getAutoCompleteOptions, hideAutoCompleteOption]);

    // 업무명/카테고리명 옵션 (기본 + 사용자 정의, 숨김 필터링)
    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        const hidden = hidden_autocomplete_options.task_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_task_options, hidden_autocomplete_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        const hidden = hidden_autocomplete_options.category_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_category_options, hidden_autocomplete_options]);

    // 단축키 이벤트 리스너: 새 프리셋 모달 열기
    useEffect(() => {
        const handleOpenNewPresetModal = () => {
            setIsEditMode(false);
            setEditingTemplate(null);
            form.resetFields();
            form.setFieldsValue({ color: TEMPLATE_COLORS[0] });
            setIsModalOpen(true);
        };
        window.addEventListener("shortcut:openNewPresetModal", handleOpenNewPresetModal);
        return () => {
            window.removeEventListener("shortcut:openNewPresetModal", handleOpenNewPresetModal);
        };
    }, [form]);

    // 모달 열기 (추가)
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingTemplate(null);
        form.resetFields();
        form.setFieldsValue({ color: TEMPLATE_COLORS[0] });
        setIsModalOpen(true);
    };

    // 모달 열기 (수정)
    const handleOpenEditModal = (template: WorkTemplate) => {
        setIsEditMode(true);
        setEditingTemplate(template);
        form.setFieldsValue({
            project_code: template.project_code || "",
            work_name: template.work_name,
            deal_name: template.deal_name,
            task_name: template.task_name,
            category_name: template.category_name,
            note: template.note,
            color: template.color,
        });
        setIsModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        form.resetFields();
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingTemplate(null);
    };

    // 프리셋 추가/수정 처리
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const color =
                typeof values.color === "string"
                    ? values.color
                    : values.color?.toHexString() || TEMPLATE_COLORS[0];

            if (is_edit_mode && editing_template) {
                // 수정
                updateTemplate(editing_template.id, {
                    project_code: values.project_code || "",
                    work_name: values.work_name,
                    task_name: values.task_name || "",
                    deal_name: values.deal_name || "",
                    category_name: values.category_name || "",
                    note: values.note || "",
                    color,
                });
                message.success("프리셋이 수정되었습니다");
            } else {
                // 추가
                addTemplate({
                    project_code: values.project_code || "",
                    work_name: values.work_name,
                    task_name: values.task_name || "",
                    deal_name: values.deal_name || "",
                    category_name: values.category_name || "",
                    note: values.note || "",
                    color,
                });
                message.success("프리셋이 추가되었습니다");
            }

            handleCloseModal();
        } catch {
            // validation failed
        }
    };

    // 업무명 추가
    const handleAddTaskOption = () => {
        if (new_task_input.trim()) {
            addCustomTaskOption(new_task_input.trim());
            setNewTaskInput("");
            message.success(
                `"${new_task_input.trim()}" 업무명이 추가되었습니다`
            );
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
                        onClick={handleOpenAddModal}
                    >
                        {is_mobile ? "추가" : (
                            <span style={{ display: "inline-flex", alignItems: "center" }}>
                                추가
                                <span style={{
                                    fontSize: 10,
                                    opacity: 0.85,
                                    marginLeft: 4,
                                    padding: "1px 4px",
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: 3,
                                }}>
                                    Alt+P
                                </span>
                            </span>
                        )}
                    </Button>
                }
            >
                {!is_mobile && (
                    <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block", marginBottom: 12 }}
                    >
                        자주 사용하는 작업을 프리셋으로 저장하세요.
                        <br />
                        클릭하면 오늘의 작업 기록에 추가됩니다.
                    </Text>
                )}

                {templates.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span>
                                프리셋이 없습니다
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    "추가" 버튼으로 추가하세요
                                </Text>
                            </span>
                        }
                    />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={templates.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="template-items">
                                {templates.map((template) => (
                                    <SortableTemplateCard
                                        key={template.id}
                                        template={template}
                                        onEdit={handleOpenEditModal}
                                        onDelete={deleteTemplate}
                                        onAddRecordOnly={onAddRecordOnly}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </Card>

            <Modal
                title={is_edit_mode ? "프리셋 수정" : "새 프리셋 추가"}
                open={is_modal_open}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="ok" type="primary" onClick={handleSubmit}>
                        {is_edit_mode ? "수정" : "추가"}{" "}
                        <span style={{
                            fontSize: 11,
                            opacity: 0.85,
                            marginLeft: 4,
                            padding: "1px 4px",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: 3,
                        }}>
                            F8
                        </span>
                    </Button>,
                    <Button key="cancel" onClick={handleCloseModal}>
                        취소
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (e.key === "F8") {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                >
                    <Form.Item
                        name="project_code"
                        label="프로젝트 코드"
                    >
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onSelect={(value: string) =>
                                handleProjectCodeSelect(value)
                            }
                        />
                    </Form.Item>

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
                                popupMatchSelectWidth={240}
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption("task_option", option.value as string);
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
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(() => new_task_input_ref.current?.focus(), 0);
                                            }}
                                        >
                                            <Input
                                                ref={new_task_input_ref}
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
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(() => new_task_input_ref.current?.focus(), 0);
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    new_task_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddTaskOption}
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
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
                        <Form.Item
                            name="category_name"
                            label="카테고리명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리 선택"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption("category_option", option.value as string);
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
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(() => new_category_input_ref.current?.focus(), 0);
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
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(() => new_category_input_ref.current?.focus(), 0);
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    new_category_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
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
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
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
                
                .template-card {
                    position: relative;
                    display: flex;
                    align-items: center;
                    border-radius: 8px;
                    border-left: 4px solid #1890ff;
                    background: #fafafa;
                    overflow: hidden;
                    transition: all 0.2s;
                }
                
                .template-card:hover {
                    background: #f0f5ff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
                
                .template-drag-handle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 8px;
                    cursor: grab;
                    color: #bbb;
                    transition: color 0.2s;
                    align-self: stretch;
                }
                
                .template-drag-handle:hover {
                    color: #666;
                }
                
                .template-drag-handle:active {
                    cursor: grabbing;
                }
                
                .template-content {
                    flex: 1;
                    padding: 10px 12px;
                    padding-left: 0;
                    padding-right: 8px;
                    min-height: 60px;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .template-header {
                    display: flex;
                    align-items: flex-start;
                }
                
                .template-title {
                    font-size: 13px;
                    line-height: 1.4;
                    word-break: break-word;
                    display: block;
                }
                
                .template-subtitle {
                    font-size: 11px;
                    color: #999;
                    display: block;
                    word-break: break-word;
                }
                
                .template-actions {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding-right: 8px;
                    flex-shrink: 0;
                }
                
                .template-hover-buttons {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .template-card:hover .template-hover-buttons {
                    opacity: 1;
                }
            `}</style>
        </>
    );
}
