import type React from "react";

// 스타일 상수

export const SUGGESTION_STYLES = {
    // 레이아웃
    content: {
        maxWidth: 800,
        margin: "0 auto",
        width: "100%",
    } as React.CSSProperties,

    // 모달 바로가기 키 표시
    shortcutBadge: {
        fontSize: 11,
        opacity: 0.85,
        marginLeft: 4,
        padding: "1px 4px",
        background: "rgba(255,255,255,0.2)",
        borderRadius: 3,
    } as React.CSSProperties,

    // 폼
    formContainer: {
        marginTop: 16,
    } as React.CSSProperties,

    // 답글
    replyFormContainer: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
    } as React.CSSProperties,

    replyNicknameInput: {
        width: 120,
    } as React.CSSProperties,

    replyContentInput: {
        flex: 1,
    } as React.CSSProperties,

    // 게시글 콘텐츠
    postContent: {
        whiteSpace: "pre-wrap" as const,
        marginBottom: 16,
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
    } as React.CSSProperties,

    // 해결 완료 표시
    resolvedBadge: {
        padding: "8px 12px",
        background: "#f6ffed",
        border: "1px solid #b7eb8f",
        borderRadius: 6,
        marginBottom: 16,
    } as React.CSSProperties,

    resolvedIcon: {
        color: "#52c41a",
    } as React.CSSProperties,

    resolvedText: {
        color: "#52c41a",
    } as React.CSSProperties,

    // 답글
    replyCountText: {
        fontSize: 13,
        marginBottom: 8,
        display: "block",
    } as React.CSSProperties,

    replyContentText: {
        whiteSpace: "pre-wrap" as const,
    } as React.CSSProperties,

    replyMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    } as React.CSSProperties,

    replyMetaText: {
        fontSize: 12,
    } as React.CSSProperties,

    replyEditButton: {
        padding: 0,
        height: "auto",
        fontSize: 12,
    } as React.CSSProperties,

    replyEditArea: {
        width: "100%",
    } as React.CSSProperties,

    replyEditActions: {
        marginTop: 8,
    } as React.CSSProperties,

    // 관리자 설정
    adminDivider: {
        margin: "16px 0 12px",
    } as React.CSSProperties,

    adminTitleText: {
        fontSize: 12,
    } as React.CSSProperties,

    adminWrap: {
        width: "100%",
    } as React.CSSProperties,

    adminStatusSelect: {
        width: 120,
    } as React.CSSProperties,

    adminVersionInput: {
        width: 160,
    } as React.CSSProperties,

    // 액션 버튼
    postActionsContainer: {
        marginBottom: 12,
        textAlign: "right" as const,
    } as React.CSSProperties,

    // 구분선
    replySectionDivider: {
        margin: "16px 0",
    } as React.CSSProperties,

    // Empty 상태
    emptyContainer: {
        padding: "40px 0",
    } as React.CSSProperties,

    // 관리자 태그
    adminTag: {
        marginLeft: 8,
    } as React.CSSProperties,
} as const;
