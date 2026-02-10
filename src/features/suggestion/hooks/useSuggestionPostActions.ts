import { useCallback } from "react";
import { Form } from "antd";
import { message } from "@/shared/lib/message";
import type { SuggestionPost } from "@/types";
import { SUGGESTION_MESSAGES } from "@/shared/constants";
import {
    addSuggestion,
    updateSuggestion,
    deleteSuggestion,
} from "@/firebase/suggestionService";

interface UseSuggestionPostActionsParams {
    author_id: string;
    on_submit_success?: () => void;
}

/**
 * 건의사항 게시글 CRUD 액션 훅
 */
export function useSuggestionPostActions({
    author_id,
    on_submit_success,
}: UseSuggestionPostActionsParams) {
    // 게시글 작성
    const handleSubmitPost = useCallback(
        async (form: ReturnType<typeof Form.useForm>[0]) => {
            try {
                const values = (await form.validateFields()) as {
                    author_name: string;
                    title: string;
                    content: string;
                };

                const new_post: SuggestionPost = {
                    id: crypto.randomUUID(),
                    author_id,
                    author_name: values.author_name.trim(),
                    title: values.title.trim(),
                    content: values.content.trim(),
                    created_at: new Date().toISOString(),
                    replies: [],
                    status: "pending",
                };

                await addSuggestion(new_post);
                message.success(SUGGESTION_MESSAGES.suggestionRegistered);
                form.resetFields();
                on_submit_success?.();

                return true;
            } catch {
                message.error("등록에 실패했습니다");
                return false;
            }
        },
        [author_id, on_submit_success]
    );

    // 게시글 수정
    const handleEditPost = useCallback(
        async (
            post_id: string,
            form: ReturnType<typeof Form.useForm>[0],
            on_success?: () => void
        ) => {
            try {
                const values = (await form.validateFields()) as {
                    title: string;
                    content: string;
                };
                await updateSuggestion(
                    post_id,
                    values.title.trim(),
                    values.content.trim()
                );
                message.success(SUGGESTION_MESSAGES.postUpdated);
                form.resetFields();
                on_success?.();

                return true;
            } catch {
                message.error(SUGGESTION_MESSAGES.postUpdateFailed);
                return false;
            }
        },
        []
    );

    // 게시글 삭제
    const handleDeletePost = useCallback(async (post_id: string) => {
        try {
            await deleteSuggestion(post_id);
            message.success(SUGGESTION_MESSAGES.postDeleted);
            return true;
        } catch {
            message.error(SUGGESTION_MESSAGES.postDeleteFailed);
            return false;
        }
    }, []);

    return {
        handleSubmitPost,
        handleEditPost,
        handleDeletePost,
    };
}
