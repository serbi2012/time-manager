/**
 * 건의사항 관련 타입 정의
 */

/**
 * 건의사항 상태
 */
export type SuggestionStatus = 
    | "pending"      // 대기중
    | "reviewing"    // 검토중
    | "in_progress"  // 진행중
    | "completed"    // 완료
    | "rejected";    // 반려

/**
 * 건의사항 답글
 */
export interface SuggestionReply {
    id: string;
    author_id?: string;
    author_name: string;
    content: string;
    created_at: string;  // ISO string
}

/**
 * 건의사항 첨부 이미지
 */
export interface SuggestionImage {
    id: string;
    url: string;
    name: string;
}

/**
 * 건의사항 게시글
 */
export interface SuggestionPost {
    id: string;
    author_id: string;
    author_name: string;
    title: string;
    content: string;
    created_at: string;           // ISO string
    replies: SuggestionReply[];
    status: SuggestionStatus;
    resolved_version?: string;    // 해결된 버전
    admin_comment?: string;       // 관리자 코멘트
    images?: SuggestionImage[];   // 첨부 이미지
}
