import { useState, useCallback } from "react";
import { message } from "antd";
import type { SuggestionReply } from "@/types";
import { SUGGESTION_MESSAGES } from "@/shared/constants";
import {
    addReply,
    updateReply,
    deleteReply,
} from "@/firebase/suggestionService";

interface UseReplyActionsParams {
    author_id: string;
}

/**
 * 답글 CRUD 액션 훅
 */
export function useReplyActions({ author_id }: UseReplyActionsParams) {
    const [editing_reply, setEditingReply] = useState<{
        post_id: string;
        reply_id: string;
    } | null>(null);
    const [edit_reply_content, setEditReplyContent] = useState("");

    // 답글 추가
    const handleAddReply = useCallback(
        async (
            post_id: string,
            author_name: string,
            content: string
        ): Promise<boolean> => {
            if (!author_name.trim()) {
                message.warning(SUGGESTION_MESSAGES.nicknameRequired);
                return false;
            }
            if (!content.trim()) {
                message.warning(SUGGESTION_MESSAGES.replyContentRequired);
                return false;
            }

            try {
                const reply: SuggestionReply = {
                    id: crypto.randomUUID(),
                    author_id,
                    author_name: author_name.trim(),
                    content: content.trim(),
                    created_at: new Date().toISOString(),
                };
                await addReply(post_id, reply);
                message.success(SUGGESTION_MESSAGES.replyRegistered);
                return true;
            } catch {
                message.error(SUGGESTION_MESSAGES.replyRegisterFailed);
                return false;
            }
        },
        [author_id]
    );

    // 답글 수정 시작
    const startEditReply = useCallback(
        (post_id: string, reply: SuggestionReply) => {
            setEditingReply({ post_id, reply_id: reply.id });
            setEditReplyContent(reply.content);
        },
        []
    );

    // 답글 수정 취소
    const cancelEditReply = useCallback(() => {
        setEditingReply(null);
        setEditReplyContent("");
    }, []);

    // 답글 수정 완료
    const handleEditReply = useCallback(
        async (post_id: string, reply_id: string) => {
            if (!edit_reply_content.trim()) {
                message.warning(SUGGESTION_MESSAGES.replyContentRequired);
                return false;
            }
            try {
                await updateReply(post_id, reply_id, edit_reply_content.trim());
                message.success(SUGGESTION_MESSAGES.replyUpdated);
                setEditingReply(null);
                setEditReplyContent("");
                return true;
            } catch {
                message.error(SUGGESTION_MESSAGES.replyUpdateFailed);
                return false;
            }
        },
        [edit_reply_content]
    );

    // 답글 삭제
    const handleDeleteReply = useCallback(
        async (post_id: string, reply_id: string) => {
            try {
                await deleteReply(post_id, reply_id);
                message.success(SUGGESTION_MESSAGES.replyDeleted);
                return true;
            } catch {
                message.error(SUGGESTION_MESSAGES.replyDeleteFailed);
                return false;
            }
        },
        []
    );

    return {
        editing_reply,
        edit_reply_content,
        setEditReplyContent,
        handleAddReply,
        startEditReply,
        cancelEditReply,
        handleEditReply,
        handleDeleteReply,
    };
}
