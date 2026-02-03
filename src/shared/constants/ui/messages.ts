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
    sessionAdded: "세션이 추가되었습니다",
    sessionsDeleted: (n: number) => `${n}개 세션이 삭제되었습니다.`,
    dateUpdated: "날짜가 수정되었습니다.",
    dateChanged: "날짜가 변경되었습니다.",
    recordFullyDeleted: "작업이 완전히 삭제되었습니다",
    taskOptionAdded: (name: string) => `"${name}" 업무명이 추가되었습니다`,
    categoryOptionAdded: (name: string) =>
        `"${name}" 카테고리가 추가되었습니다`,
    recordsCopiedToClipboard: (n: number) =>
        `${n}개 레코드 데이터가 클립보드에 복사되었습니다`,
    recordsMergedDetail: (n: number, sessions: number, mins: number) =>
        `${n}개 레코드가 1개로 병합되었습니다 (세션 ${sessions}개, 총 ${mins}분)`,
    recordsDeleted: (n: number) => `${n}개 레코드가 삭제되었습니다`,

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

    // 레코드/작업 관련
    recordTrashed: "작업이 휴지통으로 이동되었습니다",
    recordRestored: "작업이 복원되었습니다",
    recordPermanentlyDeleted: "작업이 영구 삭제되었습니다",
    recordCompleted: "작업이 완료 처리되었습니다",
    recordUncompleted: "작업이 미완료 처리되었습니다",
    recordCloned: "작업이 복제되었습니다",
    recordMerged: "레코드가 병합되었습니다",
    recordsBulkCompleted: (n: number) => `${n}개 레코드가 완료 처리되었습니다`,
    recordsBulkTrashMoved: (n: number) =>
        `${n}개 레코드가 휴지통으로 이동되었습니다`,
    trashEmptiedWithCount: (n: number) =>
        `휴지통이 비워졌습니다 (${n}개 영구 삭제)`,
    sessionDeletedAdmin: "세션이 삭제되었습니다",
    recordMovedToTrash: "레코드가 휴지통으로 이동되었습니다",
    recordMovedToTrashAdmin: "레코드가 휴지통으로 이동되었습니다",
    recordRestoredAdmin: "레코드가 복원되었습니다",
    recordPermanentlyDeletedAdmin: "레코드가 영구 삭제되었습니다",
    trashEmptied: "휴지통이 비워졌습니다",
    itemsRestored: (n: number) => `${n}개 항목이 복원되었습니다`,
    itemsPermanentlyDeleted: (n: number) => `${n}개 항목이 영구 삭제되었습니다`,
    exportDownloaded: (filename: string) => `${filename} 다운로드 완료`,
    noProblemsFound: "문제가 발견되지 않았습니다!",
    integrityFixed: "수정되었습니다",
    dataRefreshed: "서버에서 데이터를 새로고침했습니다",
    dataImportedSuccess: "데이터를 성공적으로 가져왔습니다",
    dataImportedAndSynced: "데이터를 가져오고 클라우드에 동기화했습니다",
    duplicateRecordsMerged: (n: number) =>
        `중복 레코드 ${n}개가 자동으로 병합되었습니다`,
    dataExportedSuccess: "데이터가 내보내졌습니다",
    clipboardCopied: "클립보드에 복사되었습니다",
    workAddedFromTemplate: (name: string) => `"${name}" 작업이 추가되었습니다`,
    shortcutResetDone: "단축키 설정이 초기화되었습니다",
    itemsHidden: (n: number) => `${n}개 항목이 숨겨졌습니다`,
    valueRestored: (v: string) => `"${v}" 복원됨`,
    allItemsRestored: (n: number) => `${n}개 항목이 복원되었습니다`,
    lunchTimeChanged: "점심시간이 변경되었습니다",

    // 기타
    saved: "저장되었습니다",
    deleted: "삭제되었습니다",
    restored: "복원되었습니다",
    loggedOut: "로그아웃되었습니다",
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

    // 병합/선택
    mergeNotFound: "병합할 레코드를 찾을 수 없습니다",
    recordNotFound: "선택된 작업을 찾을 수 없습니다",
    timeUpdateFailed: "시간 수정에 실패했습니다",
    dateChangeFailed: "날짜 변경에 실패했습니다",
    dateUpdateFailed: "날짜 수정에 실패했습니다",
    shortcutChangeFailed: "단축키 변경에 실패했습니다",
    exportFailed: "내보내기 중 오류가 발생했습니다",
    fileReadFailed: "파일을 읽는 중 오류가 발생했습니다",
    invalidImportFormat: "유효하지 않은 데이터 형식입니다",
    loginFailed: "로그인에 실패했습니다",
    logoutFailed: "로그아웃에 실패했습니다",
    refreshFailed: "새로고침 실패",
    dataLoadFailed: "데이터 로드에 실패했습니다",
    syncFailedMessage: "데이터 동기화에 실패했습니다",
    templateNotFound: "템플릿을 찾을 수 없습니다",

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

    // 앱
    selectWorkFirst: "먼저 작업을 선택하세요",
    noDataToExport: "내보낼 데이터가 없습니다",
    noSelectionForImport: "선택된 항목이 없습니다",
    dataImportedSyncFailed:
        "데이터를 가져왔지만 클라우드 동기화에 실패했습니다",
    issuesFound: (n: number) => `${n}개의 문제가 발견되었습니다`,
    timeAdjusted: "시간이 자동 조정되었습니다.",
} as const;

// ---------- SuggestionBoard / 건의사항 ----------
export const SUGGESTION_MESSAGES = {
    nicknameRequired: "닉네임을 입력해주세요",
    replyContentRequired: "답글 내용을 입력해주세요",
    replyRegistered: "답글이 등록되었습니다",
    replyRegisterFailed: "답글 등록에 실패했습니다",
    statusUpdated: "상태가 업데이트되었습니다",
    statusUpdateFailed: "상태 업데이트에 실패했습니다",
    replyUpdated: "답글이 수정되었습니다",
    replyUpdateFailed: "답글 수정에 실패했습니다",
    replyDeleted: "답글이 삭제되었습니다",
    replyDeleteFailed: "답글 삭제에 실패했습니다",
    suggestionRegistered: "건의사항이 등록되었습니다",
    registerFailed: "등록에 실패했습니다",
    postUpdated: "게시글이 수정되었습니다",
    postUpdateFailed: "수정에 실패했습니다",
    postDeleted: "게시글이 삭제되었습니다",
    postDeleteFailed: "삭제에 실패했습니다",
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
    timerStopped: "타이머가 중지되었습니다",
    timerReset: "타이머가 초기화되었습니다",
    movedToToday: "오늘 날짜로 이동했습니다",
    optionHidden: (label: string) => `"${label}" 항목이 숨겨졌습니다`,
    optionHiddenV: (v: string) => `"${v}" 옵션이 숨겨졌습니다`,
    autoFixNotImplemented: "자동 수정 기능이 구현되지 않았습니다",
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
