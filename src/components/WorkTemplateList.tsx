import { useState, useEffect } from "react";
import {
    Card,
    Button,
    Form,
    Space,
    Typography,
    Popconfirm,
    Empty,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderOutlined,
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
import { useWorkStore } from "../store/useWorkStore";
import type { WorkTemplate } from "../types";
import { useResponsive } from "../hooks/useResponsive";
import { useShortcutStore } from "../store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "../hooks/useShortcuts";
import { TemplateModal } from "../features/work-template/ui/TemplateModal";

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
        <div ref={setNodeRef} className="template-card" style={style}>
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

    const work_store = useWorkStore();
    const {
        templates,
        records,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        reorderTemplates,
    } = work_store;

    // 단축키 설정
    const new_preset_shortcut = useShortcutStore((state) =>
        state.shortcuts.find((s) => s.id === "new-preset")
    );
    const new_preset_keys = new_preset_shortcut?.keys || "Alt+P";

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

    // 단축키 이벤트 리스너: 새 프리셋 모달 열기
    useEffect(() => {
        const handleOpenNewPresetModal = () => {
            setIsEditMode(false);
            setEditingTemplate(null);
            setIsModalOpen(true);
        };
        window.addEventListener(
            "shortcut:openNewPresetModal",
            handleOpenNewPresetModal
        );
        return () => {
            window.removeEventListener(
                "shortcut:openNewPresetModal",
                handleOpenNewPresetModal
            );
        };
    }, []);

    // 모달 열기 (추가)
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    // 모달 열기 (수정)
    const handleOpenEditModal = (template: WorkTemplate) => {
        setIsEditMode(true);
        setEditingTemplate(template);
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
    const handleSubmit = async (values: {
        project_code?: string;
        work_name: string;
        deal_name?: string;
        task_name?: string;
        category_name?: string;
        note?: string;
        color: string;
    }) => {
        if (is_edit_mode && editing_template) {
            // 수정
            updateTemplate(editing_template.id, {
                project_code: values.project_code || "",
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
                color: values.color,
            });
        } else {
            // 추가
            addTemplate({
                project_code: values.project_code || "",
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
                color: values.color,
            });
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
                        {is_mobile ? (
                            "추가"
                        ) : (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                }}
                            >
                                추가
                                <span
                                    style={{
                                        fontSize: 10,
                                        opacity: 0.85,
                                        marginLeft: 4,
                                        padding: "1px 4px",
                                        background: "rgba(255,255,255,0.2)",
                                        borderRadius: 3,
                                    }}
                                >
                                    {formatShortcutKeyForPlatform(
                                        new_preset_keys
                                    )}
                                </span>
                            </span>
                        )}
                    </Button>
                }
            >
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

            <TemplateModal
                open={is_modal_open}
                is_edit_mode={is_edit_mode}
                editing_template={editing_template}
                form={form}
                records={records}
                templates={templates}
                getAutoCompleteOptions={work_store.getAutoCompleteOptions}
                getProjectCodeOptions={work_store.getProjectCodeOptions}
                custom_task_options={work_store.custom_task_options}
                custom_category_options={work_store.custom_category_options}
                hidden_autocomplete_options={
                    work_store.hidden_autocomplete_options
                }
                addCustomTaskOption={work_store.addCustomTaskOption}
                addCustomCategoryOption={work_store.addCustomCategoryOption}
                hideAutoCompleteOption={work_store.hideAutoCompleteOption}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />

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
                
                /* 모바일: 호버 버튼 항상 표시 */
                @media (max-width: 480px) {
                    .template-hover-buttons {
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
}
