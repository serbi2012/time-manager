// UI 레이블 상수

export const SUGGESTION_LABELS = {
    // 페이지 제목
    pageTitle: "건의사항",
    adminBadge: "관리자",
    writeButton: "글쓰기",

    // 빈 상태
    emptyDescription: "아직 건의사항이 없습니다",
    emptyAction: "첫 건의사항 작성하기",

    // 모달 제목
    writeModalTitle: "건의사항 작성",
    editModalTitle: "게시글 수정",

    // 폼 필드
    nicknameLabel: "닉네임",
    nicknamePlaceholder: "닉네임을 입력하세요",
    titleLabel: "제목",
    titlePlaceholder: "제목을 입력하세요",
    contentLabel: "내용",
    contentPlaceholder: "건의사항 내용을 입력하세요",

    // 답글
    replyPlaceholder: "답글을 입력하세요 (Shift+Enter: 줄바꿈, Enter: 등록)",
    replyCountPrefix: "답글",
    replyCountSuffix: "개",

    // 버튼
    submitButton: "등록",
    updateButton: "수정",
    deleteButton: "삭제",
    saveButton: "저장",
    cancelButton: "취소",

    // 관리자 설정
    adminSettingsTitle: "관리자 설정",
    resolvedVersionPlaceholder: "해결 버전 (예: v1.5.0)",
    resolvedInVersion: "에서 해결됨",

    // Popconfirm
    deletePostTitle: "게시글 삭제",
    deletePostDescription: "정말 이 게시글을 삭제하시겠습니까?",
    deleteReplyTitle: "답글 삭제",
    deleteReplyDescription: "정말 이 답글을 삭제하시겠습니까?",

    // 검색
    searchPlaceholder: "문서 검색...",
    searchNoResults: "검색 결과가 없습니다",
} as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "대기중", color: "default" },
    reviewing: { label: "검토중", color: "blue" },
    in_progress: { label: "진행중", color: "orange" },
    completed: { label: "완료", color: "green" },
    rejected: { label: "반려", color: "red" },
} as const;
