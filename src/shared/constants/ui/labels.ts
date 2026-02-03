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
