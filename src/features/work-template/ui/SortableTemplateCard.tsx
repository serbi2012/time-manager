import { Button, Tooltip, Popconfirm, Tag, Typography, Space } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    HolderOutlined,
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { WorkTemplate } from "@/shared/types";

const { Text } = Typography;

interface SortableTemplateCardProps {
    template: WorkTemplate;
    onEdit: (template: WorkTemplate) => void;
    onDelete: (id: string) => void;
    onAddRecordOnly?: (template_id: string) => void;
}

export function SortableTemplateCard({
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
                    <Tag color={template.color} className="!text-[10px] !leading-[1.3] !px-[6px] !py-[1px] !m-0">
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
