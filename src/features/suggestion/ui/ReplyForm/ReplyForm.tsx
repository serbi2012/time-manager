import { useState } from "react";
import { Input, Button } from "antd";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import { useReplyActions } from "../../hooks";
import {
    SUGGESTION_LABELS,
    SUGGESTION_STYLES,
    SUGGESTION_CONFIG,
} from "../../constants";

const { TextArea } = Input;

interface ReplyFormProps {
    post_id: string;
    default_author?: string | null;
    author_id: string;
}

export function ReplyForm({
    post_id,
    default_author = "",
    author_id,
}: ReplyFormProps) {
    const [author_name, setAuthorName] = useState(default_author || "");
    const [content, setContent] = useState("");
    const [is_submitting, setIsSubmitting] = useState(false);

    const { handleAddReply } = useReplyActions({ author_id });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const success = await handleAddReply(post_id, author_name, content);
        if (success) {
            setContent("");
        }
        setIsSubmitting(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="suggestion-reply-form">
            <div style={SUGGESTION_STYLES.replyFormContainer}>
                <Input
                    placeholder={SUGGESTION_LABELS.nicknamePlaceholder}
                    prefix={<UserOutlined />}
                    value={author_name}
                    onChange={(e) => setAuthorName(e.target.value)}
                    style={SUGGESTION_STYLES.replyNicknameInput}
                />
                <TextArea
                    placeholder={SUGGESTION_LABELS.replyPlaceholder}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoSize={{
                        minRows: SUGGESTION_CONFIG.minReplyRows,
                        maxRows: SUGGESTION_CONFIG.maxReplyRows,
                    }}
                    style={SUGGESTION_STYLES.replyContentInput}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={is_submitting}
                />
            </div>
        </div>
    );
}
