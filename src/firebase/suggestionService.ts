import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    arrayUnion,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "./config";
import type {
    SuggestionPost,
    SuggestionReply,
    SuggestionStatus,
} from "../types";

const COLLECTION_NAME = "suggestions";

export async function addSuggestion(post: SuggestionPost): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post.id);
    await setDoc(doc_ref, post);
}

export async function addReply(
    post_id: string,
    reply: SuggestionReply
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    await updateDoc(doc_ref, {
        replies: arrayUnion(reply),
    });
}

export async function deleteSuggestion(post_id: string): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    await deleteDoc(doc_ref);
}

export async function updateSuggestionStatus(
    post_id: string,
    status: SuggestionStatus,
    resolved_version?: string,
    admin_comment?: string
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    const update_data: Record<string, unknown> = { status };
    if (resolved_version !== undefined) {
        update_data.resolved_version = resolved_version;
    }
    if (admin_comment !== undefined) {
        update_data.admin_comment = admin_comment;
    }
    await updateDoc(doc_ref, update_data);
}

export async function updateSuggestion(
    post_id: string,
    title: string,
    content: string
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    await updateDoc(doc_ref, { title, content });
}

export function subscribeToSuggestions(
    callback: (posts: SuggestionPost[]) => void
): Unsubscribe {
    const suggestions_ref = collection(db, COLLECTION_NAME);
    const q = query(suggestions_ref, orderBy("created_at", "desc"));

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                author_id: data.author_id || "",
                author_name: data.author_name || "",
                title: data.title || "",
                content: data.content || "",
                created_at: data.created_at || "",
                replies: data.replies || [],
                status: data.status || "pending",
                resolved_version: data.resolved_version,
                admin_comment: data.admin_comment,
            } as SuggestionPost;
        });
        callback(posts);
    });
}
