/**
 * 작업 프리셋 리스트 데모
 */

import { Tag, Button, Card, Typography, Tooltip } from "antd";
import {
    PlusOutlined,
    HolderOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import { DEMO_TEMPLATES } from "./demo_data";

const { Text } = Typography;

export function DemoWorkTemplateList() {
    return (
        <div className="demo-component">
            <Card size="small" className="demo-template-list-card">
                <div className="flex items-center justify-between mb-md">
                    <Text strong className="text-md">
                        작업 프리셋
                    </Text>
                </div>

                <Button
                    block
                    icon={<PlusOutlined />}
                    disabled
                    className="mb-md rounded-xl"
                    style={{ borderStyle: "dashed" }}
                >
                    새 프리셋 추가
                </Button>

                <div className="demo-template-items">
                    {DEMO_TEMPLATES.map((template) => (
                        <div
                            key={template.id}
                            className="demo-template-card"
                            style={{
                                borderLeftColor: template.color,
                            }}
                        >
                            <div className="demo-template-drag-handle">
                                <HolderOutlined />
                            </div>

                            <div className="demo-template-content">
                                <Text
                                    strong
                                    className="demo-template-title text-md"
                                >
                                    {template.deal_name || template.work_name}
                                </Text>

                                <div className="flex items-center gap-xs flex-wrap">
                                    {template.deal_name && (
                                        <Tag
                                            className="text-xs"
                                            style={{
                                                margin: 0,
                                                padding: "0 6px",
                                                lineHeight: "18px",
                                            }}
                                        >
                                            {template.work_name}
                                        </Tag>
                                    )}
                                    {(template.task_name ||
                                        template.category_name) && (
                                        <Text
                                            type="secondary"
                                            className="text-xs"
                                        >
                                            {[
                                                template.task_name,
                                                template.category_name,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </Text>
                                    )}
                                </div>
                            </div>

                            <div className="demo-template-actions">
                                <Tooltip title="더보기">
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<EllipsisOutlined />}
                                    />
                                </Tooltip>
                                <Tooltip title="작업 추가">
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<PlusOutlined />}
                                        className="text-primary"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
