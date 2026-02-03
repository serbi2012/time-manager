/**
 * 단축키 관련 enum
 */

// ============================================
// 단축키 카테고리
// ============================================

/** 단축키 카테고리 값 */
export const ShortcutCategory = {
    General: "general",
    Timer: "timer",
    Navigation: "navigation",
    Data: "data",
    Modal: "modal",
} as const;

/** 단축키 카테고리 타입 */
export type ShortcutCategory =
    (typeof ShortcutCategory)[keyof typeof ShortcutCategory];

/** 단축키 카테고리 라벨 */
export const SHORTCUT_CATEGORY_LABELS: Record<ShortcutCategory, string> = {
    [ShortcutCategory.General]: "일반",
    [ShortcutCategory.Timer]: "타이머",
    [ShortcutCategory.Navigation]: "네비게이션",
    [ShortcutCategory.Data]: "데이터",
    [ShortcutCategory.Modal]: "모달",
};
