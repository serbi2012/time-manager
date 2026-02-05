import type { User } from "firebase/auth";
import { SUGGESTION_CONFIG } from "../constants";

/**
 * 작성자 ID 가져오기
 * - 로그인한 사용자: user.uid 반환
 * - 미로그인: localStorage에서 게스트 ID 가져오기 (없으면 생성)
 */
export function getAuthorId(user: User | null): string {
    if (user) return user.uid;

    let guest_id = localStorage.getItem(SUGGESTION_CONFIG.guestIdKey);
    if (!guest_id) {
        guest_id = crypto.randomUUID();
        localStorage.setItem(SUGGESTION_CONFIG.guestIdKey, guest_id);
    }
    return guest_id;
}
