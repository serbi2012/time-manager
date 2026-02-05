import { Button, Space, Popconfirm, Input, Typography } from "antd";
import type { SuggestionReply } from "@/types";
import type { useReplyActions } from "../../hooks";
import { usePermissionCheck } from "../../hooks";
import { formatRelativeTime } from "../../lib";
import {
    SUGGESTION_LABELS,
    SUGGESTION_STYLES,
    SUGGESTION_CONFIG,
} from "../../constants";

const { TextArea } = Input;
const { Text } = Typography;

interface ReplyItemProps {
    post_id: string;
    reply: SuggestionReply;
    reply_actions: ReturnType<typeof useReplyActions>;
    author_id: string;
    is_admin: boolean;
}

export function ReplyItem({
    post_id,
    reply,
    reply_actions,
    author_id,
    is_admin,
}: ReplyItemProps) {
    const { canEditReply, canDeleteReply } = usePermissionCheck({
        user_email: is_admin ? "admin" : null,
        my_author_id: author_id,
    });

    const is_editing =
        reply_actions.editing_reply?.post_id === post_id &&
        reply_actions.editing_reply?.reply_id === reply.id;

    const can_edit = canEditReply(reply);
    const can_delete = canDeleteReply(reply);

    return (
        <div className="suggestion-reply-item">
            {is_editing ? (
                <div style={SUGGESTION_STYLES.replyEditArea}>
                    <TextArea
                        value={reply_actions.edit_reply_content}
                        onChange={(e) =>
                            reply_actions.setEditReplyContent(e.target.value)
                        }
                        autoSize={{
                            minRows: SUGGESTION_CONFIG.minReplyRows,
                            maxRows: SUGGESTION_CONFIG.maxReplyRows,
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                reply_actions.handleEditReply(
                                    post_id,
                                    reply.id
                                );
                            } else if (e.key === "Escape") {
                                reply_actions.cancelEditReply();
                            }
                        }}
                        autoFocus
                    />
                    <Space style={SUGGESTION_STYLES.replyEditActions}>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                                reply_actions.handleEditReply(post_id, reply.id)
                            }
                        >
                            {SUGGESTION_LABELS.saveButton}
                        </Button>
                        <Button
                            size="small"
                            onClick={reply_actions.cancelEditReply}
                        >
                            {SUGGESTION_LABELS.cancelButton}
                        </Button>
                    </Space>
                </div>
            ) : (
                <>
                    <div className="suggestion-reply-content">
                        <Text style={SUGGESTION_STYLES.replyContentText}>
                            {reply.content}
                        </Text>
                    </div>
                    <div
                        className="suggestion-reply-meta"
                        style={SUGGESTION_STYLES.replyMeta}
                    >
                        <Text
                            type="secondary"
                            style={SUGGESTION_STYLES.replyMetaText}
                        >
                            {reply.author_name} ·{" "}
                            {formatRelativeTime(reply.created_at)}
                        </Text>
                        {(can_edit || can_delete) && (
                            <Space size="small">
                                {can_edit && (
                                    <Button
                                        type="link"
                                        size="small"
                                        style={
                                            SUGGESTION_STYLES.replyEditButton
                                        }
                                        onClick={() =>
                                            reply_actions.startEditReply(
                                                post_id,
                                                reply
                                            )
                                        }
                                    >
                                        {SUGGESTION_LABELS.updateButton}
                                    </Button>
                                )}
                                {can_delete && (
                                    <Popconfirm
                                        title={
                                            SUGGESTION_LABELS.deleteReplyTitle
                                        }
                                        description={
                                            SUGGESTION_LABELS.deleteReplyDescription
                                        }
                                        onConfirm={() =>
                                            reply_actions.handleDeleteReply(
                                                post_id,
                                                reply.id
                                            )
                                        }
                                        okText={SUGGESTION_LABELS.deleteButton}
                                        cancelText={
                                            SUGGESTION_LABELS.cancelButton
                                        }
                                        okButtonProps={{
                                            danger: true,
                                            autoFocus: true,
                                        }}
                                    >
                                        <Button
                                            type="link"
                                            size="small"
                                            danger
                                            style={
                                                SUGGESTION_STYLES.replyEditButton
                                            }
                                        >
                                            {SUGGESTION_LABELS.deleteButton}
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
