/**
 * 알림 메시지 상수
 */

// ============================================
// 성공 메시지
// ============================================

export const SUCCESS_MESSAGES = {
    // 작업 관련
    workAdded: "작업이 추가되었습니다",
    workUpdated: "작업이 수정되었습니다",
    workDeleted: "작업이 삭제되었습니다",
    workCompleted: "작업이 완료되었습니다",

    // 세션 관련
    sessionUpdated: "시간이 수정되었습니다",
    sessionDeleted: "세션이 삭제되었습니다",

    // 템플릿 관련
    templateAdded: "프리셋이 추가되었습니다",
    templateUpdated: "프리셋이 수정되었습니다",
    templateDeleted: "프리셋이 삭제되었습니다",

    // 설정 관련
    settingsSaved: "설정이 저장되었습니다",
    shortcutChanged: "단축키가 변경되었습니다",
    shortcutReset: "단축키가 초기화되었습니다",

    // 데이터 관련
    dataCopied: "클립보드에 복사되었습니다",
    dataExported: "데이터가 내보내기되었습니다",
    dataImported: "데이터가 가져오기되었습니다",
    dataSynced: "동기화가 완료되었습니다",

    // 기타
    saved: "저장되었습니다",
    deleted: "삭제되었습니다",
    restored: "복원되었습니다",
} as const;

// ============================================
// 에러 메시지
// ============================================

export const ERROR_MESSAGES = {
    // 입력 검증
    requiredField: "필수 입력 항목입니다",
    workNameRequired: "작업명을 입력하세요",
    timeRequired: "시작 시간과 종료 시간을 모두 입력하세요",
    invalidTime: "유효하지 않은 시간입니다",
    invalidEndTime: "종료 시간은 시작 시간보다 나중이어야 합니다",

    // 중복/충돌
    shortcutDuplicate: "이미 다른 단축키에서 사용 중입니다",
    timeConflict: "시간이 다른 작업과 겹칩니다",

    // 데이터 관련
    loadFailed: "데이터를 불러오는데 실패했습니다",
    saveFailed: "저장에 실패했습니다",
    deleteFailed: "삭제에 실패했습니다",
    syncFailed: "동기화에 실패했습니다",

    // 인증 관련
    loginRequired: "로그인이 필요합니다",
    authFailed: "인증에 실패했습니다",

    // 기타
    unknown: "오류가 발생했습니다",
    networkError: "네트워크 오류가 발생했습니다",
} as const;

// ============================================
// 경고 메시지
// ============================================

export const WARNING_MESSAGES = {
    // 입력 관련
    nicknameRequired: "닉네임을 입력해주세요",
    contentRequired: "내용을 입력해주세요",
    replyRequired: "답글 내용을 입력해주세요",

    // 확인 관련
    unsavedChanges: "저장하지 않은 변경사항이 있습니다",
    deleteConfirm: "정말 삭제하시겠습니까?",

    // 동기화 관련
    syncPending: "동기화 대기 중인 데이터가 있습니다",
} as const;

// ============================================
// 정보 메시지
// ============================================

export const INFO_MESSAGES = {
    noData: "데이터가 없습니다",
    noRecords: "작업 기록이 없습니다",
    noTemplates: "프리셋이 없습니다",
    loading: "로딩 중...",
    processing: "처리 중...",
} as const;

// ============================================
// 통합 메시지 객체
// ============================================

export const MESSAGES = {
    success: SUCCESS_MESSAGES,
    error: ERROR_MESSAGES,
    warning: WARNING_MESSAGES,
    info: INFO_MESSAGES,
} as const;
