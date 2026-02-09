import { Button, Space, Popconfirm, Typography, Divider, List } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import type { SuggestionPost } from "@/types";
import { useReplyActions } from "../../hooks";
import { SUGGESTION_LABELS } from "../../constants";
import { ReplyForm } from "../ReplyForm";
import { AdminControls } from "../AdminControls";
import { ReplyItem } from "./ReplyItem";

const { Text, Paragraph } = Typography;

interface SuggestionCardContentProps {
    post: SuggestionPost;
    can_edit: boolean;
    can_delete: boolean;
    is_admin: boolean;
    author_id: string;
    user_display_name?: string | null;
    on_edit: () => void;
    on_delete: () => void;
}

export function SuggestionCardContent({
    post,
    can_edit,
    can_delete,
    is_admin,
    author_id,
    user_display_name,
    on_edit,
    on_delete,
}: SuggestionCardContentProps) {
    const reply_actions = useReplyActions({ author_id });

    return (
        <div className="suggestion-item-content">
            {/* 수정/삭제 버튼 */}
            {(can_edit || can_delete) && (
                <div className="mb-md text-right">
                    <Space>
                        {can_edit && (
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={on_edit}
                            >
                                {SUGGESTION_LABELS.updateButton}
                            </Button>
                        )}
                        {can_delete && (
                            <Popconfirm
                                title={SUGGESTION_LABELS.deletePostTitle}
                                description={
                                    SUGGESTION_LABELS.deletePostDescription
                                }
                                onConfirm={on_delete}
                                okText={SUGGESTION_LABELS.deleteButton}
                                cancelText={SUGGESTION_LABELS.cancelButton}
                                okButtonProps={{
                                    danger: true,
                                    autoFocus: true,
                                }}
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    {SUGGESTION_LABELS.deleteButton}
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                </div>
            )}

            {/* 게시글 본문 */}
            <Paragraph className="!whitespace-pre-wrap !mb-lg !px-lg !py-md !bg-[#fafafa] !rounded-lg">
                {post.content}
            </Paragraph>

            {/* 해결 완료 표시 */}
            {post.status === "completed" && post.resolved_version && (
                <div className="py-sm px-md bg-[#f6ffed] border border-[#b7eb8f] rounded-md mb-lg">
                    <Space>
                        <CheckCircleOutlined className="!text-[#52c41a]" />
                        <Text className="!text-[#52c41a]">
                            {post.resolved_version}
                            {SUGGESTION_LABELS.resolvedInVersion}
                        </Text>
                    </Space>
                </div>
            )}

            {/* 답글 목록 */}
            {post.replies.length > 0 && (
                <div className="suggestion-replies">
                    <Text
                        type="secondary"
                        className="!text-[13px] !mb-sm !block"
                    >
                        {SUGGESTION_LABELS.replyCountPrefix}{" "}
                        {post.replies.length}
                        {SUGGESTION_LABELS.replyCountSuffix}
                    </Text>
                    <List
                        dataSource={post.replies}
                        renderItem={(reply) => (
                            <ReplyItem
                                post_id={post.id}
                                reply={reply}
                                reply_actions={reply_actions}
                                author_id={author_id}
                                is_admin={is_admin}
                            />
                        )}
                    />
                </div>
            )}

            {/* 답글 작성 폼 */}
            <Divider className="!my-lg" />
            <ReplyForm
                post_id={post.id}
                default_author={user_display_name || ""}
                author_id={author_id}
            />

            {/* 관리자 설정 */}
            {is_admin && <AdminControls post={post} />}
        </div>
    );
}
