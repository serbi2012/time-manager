// 설정 상수

export const SUGGESTION_CONFIG = {
    // 관리자 이메일
    adminEmail: "rlaxo0306@gmail.com",

    // LocalStorage 키
    guestIdKey: "suggestion_guest_id",

    // 입력 제한
    maxNicknameLength: 20,
    maxTitleLength: 100,
    maxContentLength: 2000,

    // 답글
    minReplyRows: 1,
    maxReplyRows: 4,

    // 폼
    contentRows: 6,

    // 레이아웃
    maxContentWidth: 800,
    desktopPadding: 24,
    mobilePadding: 12,

    // 하이라이트 유지 시간 (ms)
    highlightDuration: 4000,
} as const;
