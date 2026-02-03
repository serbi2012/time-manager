/**
 * 모달 관련 텍스트 상수
 */

// ============================================
// 모달 제목
// ============================================

export const MODAL_TITLES = {
    // 작업 관련
    newWork: "새 작업 시작",
    editWork: "작업 수정",
    deleteWork: "작업 삭제",

    // 템플릿 관련
    newTemplate: "새 프리셋",
    editTemplate: "프리셋 수정",
    deleteTemplate: "프리셋 삭제",

    // 설정 관련
    settings: "설정",
    shortcuts: "단축키 설정",
    theme: "테마 설정",

    // 기타
    confirm: "확인",
    warning: "경고",
    error: "오류",
    changelog: "업데이트 내역",
    help: "도움말",
    about: "정보",
} as const;

// ============================================
// Popconfirm 텍스트
// ============================================

export const POPCONFIRM_TEXT = {
    // 삭제 확인
    delete: {
        title: "삭제 확인",
        description: "이 항목을 삭제하시겠습니까?",
        okText: "삭제",
        cancelText: "취소",
    },
    softDelete: {
        title: "삭제 확인",
        description: "이 기록을 휴지통으로 이동하시겠습니까?",
        okText: "삭제",
        cancelText: "취소",
    },
    permanentDelete: {
        title: "영구 삭제",
        description:
            "이 항목을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        okText: "영구 삭제",
        cancelText: "취소",
    },

    // 초기화 확인
    resetShortcuts: {
        title: "단축키 초기화",
        description: "모든 단축키 설정을 기본값으로 되돌리시겠습니까?",
        okText: "초기화",
        cancelText: "취소",
    },
    resetData: {
        title: "데이터 초기화",
        description:
            "모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        okText: "초기화",
        cancelText: "취소",
    },

    // 기타 확인
    unsavedChanges: {
        title: "저장되지 않은 변경사항",
        description: "저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?",
        okText: "나가기",
        cancelText: "취소",
    },
    logout: {
        title: "로그아웃",
        description: "로그아웃하시겠습니까?",
        okText: "로그아웃",
        cancelText: "취소",
    },
} as const;
