import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    query,
    orderBy,
    onSnapshot,
    arrayUnion,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { db, storage } from "./config";
import type {
    SuggestionPost,
    SuggestionReply,
    SuggestionStatus,
    SuggestionImage,
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

export async function updateReply(
    post_id: string,
    reply_id: string,
    new_content: string
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    const doc_snap = await getDoc(doc_ref);
    if (!doc_snap.exists()) return;

    const data = doc_snap.data();
    const replies = (data.replies || []) as SuggestionReply[];
    const updated_replies = replies.map((reply) =>
        reply.id === reply_id ? { ...reply, content: new_content } : reply
    );
    await updateDoc(doc_ref, { replies: updated_replies });
}

export async function deleteReply(
    post_id: string,
    reply_id: string
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    const doc_snap = await getDoc(doc_ref);
    if (!doc_snap.exists()) return;

    const data = doc_snap.data();
    const replies = (data.replies || []) as SuggestionReply[];
    const filtered_replies = replies.filter((reply) => reply.id !== reply_id);
    await updateDoc(doc_ref, { replies: filtered_replies });
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
                images: data.images || [],
            } as SuggestionPost;
        });
        callback(posts);
    });
}

/**
 * 이미지를 Firebase Storage에 업로드하고 URL을 반환
 */
export async function uploadSuggestionImage(
    post_id: string,
    file: File
): Promise<SuggestionImage> {
    const image_id = crypto.randomUUID();
    const file_extension = file.name.split(".").pop() || "png";
    const storage_path = `suggestions/${post_id}/${image_id}.${file_extension}`;
    const storage_ref = ref(storage, storage_path);

    await uploadBytes(storage_ref, file);
    const url = await getDownloadURL(storage_ref);

    return {
        id: image_id,
        url,
        name: file.name,
    };
}

/**
 * 건의사항에 이미지 추가
 */
export async function addImageToSuggestion(
    post_id: string,
    image: SuggestionImage
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    await updateDoc(doc_ref, {
        images: arrayUnion(image),
    });
}

/**
 * Firebase Storage에서 이미지 삭제
 */
export async function deleteSuggestionImage(
    post_id: string,
    image_id: string,
    file_name: string
): Promise<void> {
    const file_extension = file_name.split(".").pop() || "png";
    const storage_path = `suggestions/${post_id}/${image_id}.${file_extension}`;
    const storage_ref = ref(storage, storage_path);

    try {
        await deleteObject(storage_ref);
    } catch {
        // Storage에서 삭제 실패해도 Firestore에서는 삭제 진행
        console.warn("이미지 파일 삭제 실패:", storage_path);
    }
}

/**
 * 건의사항에서 이미지 제거
 */
export async function removeImageFromSuggestion(
    post_id: string,
    image_id: string
): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    const doc_snap = await getDoc(doc_ref);
    if (!doc_snap.exists()) return;

    const data = doc_snap.data();
    const images = (data.images || []) as SuggestionImage[];
    const image_to_delete = images.find((img) => img.id === image_id);

    if (image_to_delete) {
        await deleteSuggestionImage(post_id, image_id, image_to_delete.name);
    }

    const filtered_images = images.filter((img) => img.id !== image_id);
    await updateDoc(doc_ref, { images: filtered_images });
}

/**
 * 건의사항 삭제 시 연관 이미지도 함께 삭제
 */
export async function deleteSuggestionWithImages(post_id: string): Promise<void> {
    const doc_ref = doc(db, COLLECTION_NAME, post_id);
    const doc_snap = await getDoc(doc_ref);

    if (doc_snap.exists()) {
        const data = doc_snap.data();
        const images = (data.images || []) as SuggestionImage[];

        // 모든 이미지 삭제
        await Promise.all(
            images.map((img) =>
                deleteSuggestionImage(post_id, img.id, img.name)
            )
        );
    }

    await deleteDoc(doc_ref);
}
