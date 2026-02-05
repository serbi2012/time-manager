import { Space, Typography, Tag, Divider } from "antd";
import {
    UserOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import type { SuggestionPost } from "@/types";
import { formatRelativeTime } from "../../lib";
import { STATUS_LABELS } from "../../constants";

const { Text } = Typography;

interface SuggestionCardHeaderProps {
    post: SuggestionPost;
}

export function SuggestionCardHeader({ post }: SuggestionCardHeaderProps) {
    return (
        <div className="suggestion-item-header">
            <div className="suggestion-item-title">
                <Space wrap>
                    <Text strong>{post.title}</Text>
                    <Tag color={STATUS_LABELS[post.status].color}>
                        {STATUS_LABELS[post.status].label}
                    </Tag>
                    {post.status === "completed" && post.resolved_version && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            {post.resolved_version}
                        </Tag>
                    )}
                </Space>
            </div>
            <div className="suggestion-item-meta">
                <Space size="small" split={<Divider type="vertical" />}>
                    <span>
                        <UserOutlined /> {post.author_name}
                    </span>
                    <span>
                        <ClockCircleOutlined />{" "}
                        {formatRelativeTime(post.created_at)}
                    </span>
                    <span>
                        <MessageOutlined /> {post.replies.length}
                    </span>
                </Space>
            </div>
        </div>
    );
}
