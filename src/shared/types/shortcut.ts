/**
 * 단축키 관련 타입 정의
 */

/**
 * 단축키 카테고리
 */
export type ShortcutCategory = 
    | "general"     // 일반
    | "timer"       // 타이머
    | "navigation"  // 네비게이션
    | "data"        // 데이터
    | "modal";      // 모달

/**
 * 단축키 정의
 */
export interface ShortcutDefinition {
    id: string;
    name: string;           // 단축키 이름
    description: string;    // 설명
    keys: string;           // 키 조합 (예: "Alt+N", "Ctrl+Shift+S")
    category: ShortcutCategory;
    enabled: boolean;       // 활성화 여부
    action: string;         // 액션 식별자
}
