/**
 * 거래명 컬럼
 */

import { Space, Typography, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import { formatTimer } from "../../../../shared/lib/time";

const { Text } = Typography;

interface DealNameColumnProps {
    record: WorkRecord;
    is_active: boolean;
    is_completed: boolean;
    theme_color: string;
    elapsed_seconds: number;
}

export function DealNameColumn({
    record,
    is_active,
    is_completed,
    theme_color,
    elapsed_seconds,
}: DealNameColumnProps) {
    const text_color = is_active
        ? theme_color
        : is_completed
        ? "#8c8c8c"
        : undefined;

    const text_decoration = is_completed ? "line-through" : undefined;

    return (
        <Space direction="vertical" size={0}>
            <Space>
                {is_completed && (
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                )}
                <Text
                    strong
                    style={{
                        color: text_color,
                        textDecoration: text_decoration,
                    }}
                >
                    {record.deal_name || record.work_name}
                </Text>
                {is_active && (
                    <Tag color={theme_color} style={{ marginLeft: 4 }}>
                        {formatTimer(elapsed_seconds)}
                    </Tag>
                )}
            </Space>
        </Space>
    );
}
