import { useState, useEffect } from "react";
import type { SuggestionPost } from "@/types";
import { subscribeToSuggestions } from "@/firebase/suggestionService";

/**
 * 건의사항 목록 데이터 훅
 */
export function useSuggestionData() {
    const [posts, setPosts] = useState<SuggestionPost[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToSuggestions(setPosts);
        return () => unsubscribe();
    }, []);

    return { posts };
}
