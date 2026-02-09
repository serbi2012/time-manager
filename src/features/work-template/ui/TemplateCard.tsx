/**
 * 템플릿 카드 컴포넌트
 */

import { Card, Typography, Tag, Space, Button, Tooltip } from "antd";
import {
    PlayCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    DragOutlined,
} from "@ant-design/icons";
import type { TemplateCardProps } from "../model/types";
import { getCategoryColor } from "../../../shared/config";

const { Text } = Typography;

/**
 * 템플릿 카드 컴포넌트
 */
export function TemplateCard({
    template,
    on_apply,
    on_edit,
    on_delete,
    is_dragging = false,
}: TemplateCardProps) {
    const {
        work_name,
        deal_name,
        task_name,
        category_name,
        project_code,
        color,
    } = template;

    return (
        <Card
            className={`template-card ${is_dragging ? "template-card-dragging" : ""}`}
            size="small"
            style={{ borderLeft: `4px solid ${color || "#1890ff"}` }}
            actions={[
                <Tooltip key="apply" title="적용">
                    <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={on_apply}
                    />
                </Tooltip>,
                <Tooltip key="edit" title="수정">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={on_edit}
                    />
                </Tooltip>,
                <Tooltip key="delete" title="삭제">
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={on_delete}
                    />
                </Tooltip>,
            ]}
        >
            <div className="template-card-content">
                <div className="template-card-header">
                    <Text strong ellipsis>
                        {work_name}
                    </Text>
                    <DragOutlined className="drag-handle" />
                </div>

                <Space direction="vertical" size={2} className="!w-full">
                    {deal_name && (
                        <Text type="secondary" ellipsis className="!text-xs">
                            {deal_name}
                        </Text>
                    )}
                    <div>
                        <Tag color={getCategoryColor(category_name)}>
                            {category_name}
                        </Tag>
                        {task_name && (
                            <Tag className="!ml-xs">{task_name}</Tag>
                        )}
                    </div>
                    {project_code && (
                        <Text type="secondary" className="!text-[11px]">
                            {project_code}
                        </Text>
                    )}
                </Space>
            </div>

            <style>{`
                .template-card {
                    margin-bottom: 8px;
                    transition: box-shadow 0.2s;
                }
                .template-card:hover {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                .template-card-dragging {
                    opacity: 0.5;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .template-card-content {
                    min-height: 60px;
                }
                .template-card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .template-icon {
                    font-size: 20px;
                }
                .drag-handle {
                    margin-left: auto;
                    cursor: grab;
                    color: #999;
                }
                .drag-handle:hover {
                    color: #1890ff;
                }
            `}</style>
        </Card>
    );
}

export default TemplateCard;
