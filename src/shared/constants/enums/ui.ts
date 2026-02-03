/**
 * UI 관련 enum
 */

// ============================================
// 리스트 애니메이션 타입
// ============================================

/** 리스트 애니메이션 타입 값 */
export const ListAnimationType = {
    SlideUp: "slideUp",
    SlideLeft: "slideLeft",
    Fade: "fade",
} as const;

/** 리스트 애니메이션 타입 */
export type ListAnimationType =
    (typeof ListAnimationType)[keyof typeof ListAnimationType];

// ============================================
// 호버 애니메이션 타입
// ============================================

/** 호버 애니메이션 타입 값 */
export const HoverType = {
    Scale: "scale",
    Lift: "lift",
    Glow: "glow",
    Card: "card",
} as const;

/** 호버 애니메이션 타입 */
export type HoverType = (typeof HoverType)[keyof typeof HoverType];

// ============================================
// 빈 상태 이미지 타입
// ============================================

/** 빈 상태 이미지 타입 값 */
export const EmptyImageType = {
    Simple: "simple",
    Default: "default",
} as const;

/** 빈 상태 이미지 타입 */
export type EmptyImageType =
    (typeof EmptyImageType)[keyof typeof EmptyImageType];

// ============================================
// 시간 범위 타입
// ============================================

/** 시간 범위 타입 값 */
export const TimeRange = {
    Daily: "daily",
    Weekly: "weekly",
    Monthly: "monthly",
} as const;

/** 시간 범위 타입 */
export type TimeRange = (typeof TimeRange)[keyof typeof TimeRange];

// ============================================
// 시간 표시 형식
// ============================================

/** 시간 표시 형식 값 */
export const TimeDisplayFormat = {
    Minutes: "minutes",
    Hours: "hours",
} as const;

/** 시간 표시 형식 타입 */
export type TimeDisplayFormat =
    (typeof TimeDisplayFormat)[keyof typeof TimeDisplayFormat];

// ============================================
// 뷰 모드
// ============================================

/** 뷰 모드 값 */
export const ViewMode = {
    Problems: "problems",
    Conflicts: "conflicts",
    All: "all",
} as const;

/** 뷰 모드 타입 */
export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

// ============================================
// 복사 형식
// ============================================

/** 복사 형식 값 */
export const CopyFormat = {
    Format1: "format1",
    Format2: "format2",
    Format3: "format3",
} as const;

/** 복사 형식 타입 */
export type CopyFormat = (typeof CopyFormat)[keyof typeof CopyFormat];

// ============================================
// 숨김 자동완성 필드
// ============================================

/** 숨김 자동완성 필드 값 */
export const HiddenAutoCompleteField = {
    WorkName: "work_name",
    TaskName: "task_name",
    DealName: "deal_name",
    ProjectCode: "project_code",
    TaskOption: "task_option",
    CategoryOption: "category_option",
} as const;

/** 숨김 자동완성 필드 타입 */
export type HiddenAutoCompleteField =
    (typeof HiddenAutoCompleteField)[keyof typeof HiddenAutoCompleteField];
