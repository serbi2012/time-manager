import { useCallback } from "react";
import type { SuggestionPost, SuggestionReply } from "@/types";
import { SUGGESTION_CONFIG } from "../constants";

interface UsePermissionCheckParams {
    user_email: string | null | undefined;
    my_author_id: string;
}

/**
 * 권한 체크 훅
 */
export function usePermissionCheck({
    user_email,
    my_author_id,
}: UsePermissionCheckParams) {
    const is_admin = user_email === SUGGESTION_CONFIG.adminEmail;

    const canEditPost = useCallback(
        (post: SuggestionPost): boolean => {
            return !!(
                is_admin ||
                (post.author_id && post.author_id === my_author_id)
            );
        },
        [is_admin, my_author_id]
    );

    const canDeletePost = useCallback(
        (post: SuggestionPost): boolean => {
            return !!(
                is_admin ||
                (post.author_id && post.author_id === my_author_id)
            );
        },
        [is_admin, my_author_id]
    );

    const canEditReply = useCallback(
        (reply: SuggestionReply): boolean => {
            return !!(
                is_admin ||
                (reply.author_id && reply.author_id === my_author_id)
            );
        },
        [is_admin, my_author_id]
    );

    const canDeleteReply = useCallback(
        (reply: SuggestionReply): boolean => {
            return !!(
                is_admin ||
                (reply.author_id && reply.author_id === my_author_id)
            );
        },
        [is_admin, my_author_id]
    );

    return {
        is_admin,
        canEditPost,
        canDeletePost,
        canEditReply,
        canDeleteReply,
    };
}
