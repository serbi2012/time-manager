/**
 * 레이블 텍스트 상수 (폼, 테이블, 툴팁 등)
 */

// ============================================
// 폼 레이블
// ============================================

export const FORM_LABELS = {
    // 작업 관련
    projectCode: "프로젝트 코드",
    workName: "작업명",
    dealName: "거래명 (상세 작업)",
    taskName: "업무명",
    categoryName: "카테고리",
    note: "메모",
    remark: "비고",
    color: "색상",

    // 시간 관련
    date: "날짜",
    startTime: "시작 시간",
    endTime: "종료 시간",
    duration: "소요 시간",

    // 설정 관련
    theme: "테마",
    lunchTime: "점심시간",
    shortcut: "단축키",
    transition: "애니메이션",
    transitionSpeed: "애니메이션 속도",
} as const;

// ============================================
// 테이블 컬럼
// ============================================

export const TABLE_COLUMNS = {
    dealName: "거래명",
    workName: "작업명",
    taskName: "업무명",
    categoryName: "카테고리",
    time: "시간",
    timeRange: "시작-종료",
    date: "날짜",
    duration: "소요시간",
    status: "상태",
    actions: "작업",
    count: "건수",
    total: "합계",
} as const;

// ============================================
// 툴팁
// ============================================

export const TOOLTIP_TEXT = {
    // 액션 관련
    complete: "완료",
    cancelComplete: "완료 취소",
    edit: "수정",
    delete: "삭제",
    restore: "복원",
    copy: "복사",
    expand: "펼치기",
    collapse: "접기",

    // 타이머 관련
    startTimer: "타이머 시작",
    stopTimer: "타이머 정지",
    resetTimer: "타이머 초기화",

    // 기타
    settings: "설정",
    help: "도움말",
    info: "정보",
    warning: "경고",
    error: "오류",
} as const;

// ============================================
// 탭 레이블
// ============================================

export const TAB_LABELS = {
    general: "일반",
    theme: "테마",
    shortcuts: "단축키",
    data: "데이터",
    about: "정보",
    incomplete: "미완료 작업",
    completed: "완료된 작업",
    deleted: "휴지통",
} as const;

// ============================================
// 네비게이션 레이블
// ============================================

export const NAV_LABELS = {
    daily: "일간 기록",
    weekly: "주간 일정",
    suggestions: "건의사항",
    guide: "사용 설명서",
    admin: "관리자",
    dailyShort: "일간",
    weeklyShort: "주간",
    guideShort: "설명서",
} as const;

// ============================================
// 헤더/앱 레이블
// ============================================

export const APP_LABELS = {
    appName: "업무 관리",
    userProfile: "사용자 프로필",
    refreshFromServer: "서버에서 새로고침",
    changelog: "변경 내역",
    changelogWithVersion: (version: string) => `변경 내역 (v${version})`,
} as const;

// ============================================
// 동기화 상태 레이블
// ============================================

export const SYNC_LABELS = {
    syncing: "동기화 중",
    synced: "동기화됨",
    error: "오류",
    guest: "게스트",
} as const;

// ============================================
// 로딩 상태 레이블
// ============================================

export const LOADING_LABELS = {
    checkingLogin: "로그인 확인 중...",
    loadingData: "데이터를 불러오는 중...",
    loading: "로딩 중...",
} as const;

// ============================================
// 날짜/요일 레이블
// ============================================

export const DAY_NAMES_SHORT = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const DAY_NAMES_MON_START = ["월", "화", "수", "목", "금", "토", "일"] as const;

export const DATE_FORMAT_LABELS = {
    month: "월",
    day: "일",
    weekday: "요일",
    formatMonthDayWeekday: (month: number, day: number, weekday: string) =>
        `${month}월 ${day}일 ${weekday}요일`,
    formatDayOfWeek: (dayName: string) => `${dayName}요일`,
} as const;

// ============================================
// 시간 표시 레이블
// ============================================

export const TIME_DISPLAY_LABELS = {
    minute: "분",
    hour: "시간",
    hourMinute: (hours: number, mins: number) => `${hours}시간 ${mins}분`,
    hourOnly: (hours: number) => `${hours}시간`,
    paginationTotal: (range: [number, number], total: number) =>
        `${range[0]}-${range[1]} / ${total}건`,
} as const;

// ============================================
// 상태 레이블
// ============================================

export const STATUS_LABELS = {
    inProgress: "진행 중",
    completed: "완료",
    deleted: "삭제됨",
    active: "활성",
    incomplete: "미완료",
    noData: "데이터가 없습니다",
    noWork: "작업 없음",
} as const;

// ============================================
// 트랜지션/애니메이션 레이블
// ============================================

export const TRANSITION_LABELS = {
    title: "트랜지션 효과",
    pageEntry: "페이지 진입 애니메이션",
    pageEntryDesc: "페이지 로딩 후 UI가 슬라이드되며 나타납니다",
    speed: "애니메이션 속도",
    speedDesc: "트랜지션 효과의 속도를 조절합니다",
    slow: "느리게",
    normal: "보통",
    fast: "빠르게",
} as const;

// ============================================
// 프리셋 레이블
// ============================================

export const PRESET_LABELS = {
    title: "작업 프리셋",
    openPreset: "프리셋 열기",
    preset: "프리셋",
    directSelect: "직접 선택",
    latest: "최신",
} as const;

// ============================================
// 폼 추가 옵션 레이블
// ============================================

export const FORM_ADD_LABELS = {
    newTaskName: "새 업무명",
    newCategory: "새 카테고리",
} as const;

// ============================================
// 단축키 레이블
// ============================================

export const SHORTCUT_LABELS = {
    addNewWork: "새 작업 추가",
    addNewWorkDesc: "작업 기록에 새 작업을 추가하는 모달을 엽니다",
    addNewPreset: "새 프리셋 추가",
    addNewPresetDesc: "새 작업 프리셋을 추가하는 모달을 엽니다",
    openSettings: "설정 열기",
    openSettingsDesc: "설정 모달을 엽니다",
    shortcutHelp: "단축키 도움말",
    shortcutHelpDesc: "단축키 목록을 표시합니다",
    timerToggle: "타이머 시작/중지",
    timerToggleDesc: "현재 작업의 타이머를 시작하거나 중지합니다",
    timerReset: "타이머 초기화",
    timerResetDesc: "타이머를 초기화합니다",
    goToToday: "오늘로 이동",
    goToTodayDesc: "오늘 날짜로 이동합니다",
    prevDate: "이전 날짜",
    prevDateDesc: "이전 날짜로 이동합니다",
    nextDate: "다음 날짜",
    nextDateDesc: "다음 날짜로 이동합니다",
    dailyPage: "일간 기록 페이지",
    dailyPageDesc: "일간 기록 페이지로 이동합니다",
    weeklyPage: "주간 일정 페이지",
    weeklyPageDesc: "주간 일정 페이지로 이동합니다",
    modalSave: "모달 저장/추가",
    modalSaveDesc:
        "작업 추가, 수정, 프리셋 추가 등 모달에서 저장/추가 실행",
    exportData: "데이터 내보내기",
    exportDataDesc: "데이터를 JSON 파일로 내보냅니다",
    manualSync: "수동 동기화",
    manualSyncDesc: "클라우드와 수동으로 동기화합니다",
    duplicateShortcut: (name: string) =>
        `이미 "${name}"에서 사용 중인 단축키입니다`,
} as const;

export const SHORTCUT_CATEGORIES = {
    general: "일반",
    timer: "타이머",
    navigation: "네비게이션",
    data: "데이터",
} as const;
