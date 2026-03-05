/**
 * 관리자 UI 레이블 상수
 */

export const ADMIN_PANEL_TITLE = "관리자 패널";
export const ADMIN_TAG = "관리자";
export const TIME_DISPLAY_LABEL = "시간 표시:";
export const TIME_FORMAT_HOURS = "시간 분";
export const TIME_FORMAT_MINUTES = "분";

export const TAB_SESSIONS = "세션 분석";
export const TAB_RECORDS = "레코드 분석";
export const TAB_EXPLORER = "데이터 탐색기";
export const TAB_STATISTICS = "통계";
export const TAB_TRASH = "휴지통";
export const TAB_EXPORT = "내보내기";
export const TAB_INTEGRITY = "정합성 검사";

export const VIEW_MODE_ALL = "전체";
export const VIEW_MODE_RUNNING = "진행중";
export const VIEW_MODE_CONFLICTS = "충돌";
export const VIEW_MODE_PROBLEMS = "문제";
export const VIEW_MODE_INVISIBLE = "간트미표시";
export const VIEW_MODE_TIME_SEARCH = "시간검색";

export const PLACEHOLDER_START_DATE = "시작일";
export const PLACEHOLDER_END_DATE = "종료일";

export const BULK_DELETE = "선택 삭제";
export const DELETE = "삭제";
export const CANCEL = "취소";
export const MERGE = "병합";
export const MERGE_EXECUTE = "병합 실행";
export const CLOSE = "닫기";
export const COPY_JSON = "JSON 복사";

export const SESSION_TIME_SEARCH_TITLE = "특정 시간대 검색";
export const SESSION_TIME_SEARCH_HINT =
    "특정 날짜와 시간을 입력하면 해당 시간에 걸쳐있는 모든 세션을 찾습니다. 간트차트에서 보이지 않는 세션도 찾을 수 있습니다.";
export const LABEL_DATE = "날짜:";
export const LABEL_TIME = "시간:";
export const PLACEHOLDER_DATE = "날짜 선택";
export const PLACEHOLDER_TIME = "시간 선택";
export const TIME_RESET = "시간 초기화";

export const ALERT_INVISIBLE_SESSIONS_TITLE = "간트차트에서 보이지 않는 세션";
export const ALERT_INVISIBLE_SESSIONS_DESC =
    "0분 세션이나 1분 이하의 세션은 간트차트에서 너비가 너무 작아 보이지 않습니다. 이 세션들은 충돌을 일으킬 수 있지만 시각적으로 확인이 어렵습니다.";

export const STAT_ALL_SESSIONS = "전체 세션";
export const STAT_CONFLICT_SESSIONS = "충돌 세션";
export const STAT_CONFLICT_DAYS = "충돌 발생일";
export const STAT_PROBLEM_SESSIONS = "문제 세션";
export const STAT_GANTT_INVISIBLE = "간트 미표시";
export const STAT_RUNNING = "진행 중";

export const CARD_RUNNING_STATUS = "진행 중 세션 현황";
export const CARD_RUNNING_HINT =
    '종료 시간이 비어있는(end_time === "") 세션입니다. 타이머가 실행 중이거나 비정상 종료된 세션일 수 있습니다.';
export const CARD_DUPLICATE_RUNNING = "중복 진행 중 세션 발견";
export const CARD_PROBLEM_STATS = "문제 유형별 현황";
export const CARD_PROBLEM_ZERO = "0분 세션:";
export const CARD_PROBLEM_MISSING = "시간 누락:";
export const CARD_PROBLEM_INVALID = "잘못된 형식:";
export const CARD_PROBLEM_FUTURE = "미래 날짜:";
export const CARD_PROBLEM_DAYS = "문제 발생일:";
export const CARD_CONFLICT_DATES = "충돌 발생 날짜";

export const RECORD_DETAIL_MODAL_TITLE = "레코드 상세 데이터";
export const RECORD_DETAIL_BASIC_INFO = "기본 정보";
export const RECORD_DETAIL_SESSION_HISTORY = "세션 이력";
export const RECORD_DETAIL_RAW_JSON = "Raw JSON";

export const MERGE_MODAL_TITLE = "레코드 병합 확인";
export const MERGE_MODAL_WARNING = "주의: 병합은 되돌릴 수 없습니다!";
export const MERGE_MODAL_DESC_RECORDS = "개 레코드가 1개로 병합됩니다.";
export const MERGE_MODAL_DESC_FIRST =
    "첫 번째 레코드를 기준으로 모든 세션이 합쳐지고, 나머지 레코드는 삭제됩니다.";
export const MERGE_MODAL_RECORDS_LIST = "병합될 레코드 목록";
export const MERGE_MODAL_LABEL_BASE = "기준";
export const MERGE_MODAL_LABEL_WORK = "작업명";
export const MERGE_MODAL_LABEL_DEAL = "거래명";
export const MERGE_MODAL_LABEL_TARGET = "병합 대상 레코드";
export const MERGE_MODAL_LABEL_TOTAL_SESSIONS = "총 세션 수";
export const MERGE_MODAL_LABEL_TOTAL_DURATION = "총 소요시간";
export const MERGE_MODAL_LABEL_DATE_RANGE = "날짜 범위";
export const MERGE_MODAL_COMPLETED = "완료";
export const MERGE_MODAL_INCOMPLETE = "미완료";
export const TABLE_TAG_NO_SESSIONS = "세션없음";

export const ADMIN_ACCESS_REQUIRED = "관리자 권한이 필요합니다";

export const CONFIRM_BULK_DELETE_SESSIONS = "개 세션을 삭제하시겠습니까?";
export const CONFIRM_BULK_DELETE_RECORDS = "개 레코드를 삭제하시겠습니까?";
export const BULK_DELETE_SESSIONS_BTN = "선택 삭제";
export const SELECT_COPY_RECORDS = "선택 데이터 복사";

export const RECORDS_TAB_ALL_RECORDS = "전체 레코드";
export const RECORDS_TAB_DUPLICATE_GROUPS = "중복 의심 그룹";
export const RECORDS_TAB_DUPLICATE_RECORDS = "중복 의심 레코드";
export const RECORDS_TAB_DUPLICATE_GROUP_TITLE = "중복 의심 레코드 그룹";
export const RECORDS_TAB_DUPLICATE_GROUP_HINT =
    "같은 작업명 + 거래명 조합을 가진 레코드들입니다. 병합이 필요한지 확인하세요.";
export const RECORDS_TAB_GROUPS_COUNT = "개 그룹";
export const RECORDS_TAB_ALL_RECORDS_TITLE = "전체 레코드";

export const EXPLORER_TAB_RECORDS = "레코드 탐색";
export const EXPLORER_TAB_SESSIONS = "세션 탐색";

export const TABLE_COL_DATE = "날짜";
export const TABLE_COL_TIME = "시간";
export const TABLE_COL_WORK_NAME = "작업명";
export const TABLE_COL_DEAL_NAME = "거래명";
export const TABLE_COL_PROJECT = "프로젝트";
export const TABLE_COL_DURATION = "소요시간";
export const TABLE_COL_CONFLICT = "충돌";
export const TABLE_COL_PROBLEM = "문제";
export const TABLE_COL_GANTT = "간트";
export const TABLE_COL_SESSIONS = "세션";
export const TABLE_COL_STATE = "상태";
export const TABLE_COL_ACTION = "액션";
export const TABLE_FILTER_CONFLICT_YES = "충돌 있음";
export const TABLE_FILTER_CONFLICT_NO = "충돌 없음";
export const TABLE_FILTER_PROBLEM_YES = "문제 있음";
export const TABLE_FILTER_PROBLEM_NO = "문제 없음";
export const TABLE_FILTER_ZERO = "0분 세션";
export const TABLE_FILTER_MISSING = "시간 누락";
export const TABLE_FILTER_GANTT_VISIBLE = "간트 표시";
export const TABLE_FILTER_GANTT_INVISIBLE = "간트 미표시";
export const TABLE_TAG_RUNNING = "진행중";
export const TABLE_TAG_INVISIBLE = "미표시";
export const TABLE_TAG_DISPLAY = "표시";
export const TABLE_TOOLTIP_CONFLICT = "충돌하는 작업:";
export const TABLE_TOOLTIP_PROBLEM = "문제 발견:";
export const TABLE_TOOLTIP_GANTT_INVISIBLE =
    "이 세션은 간트차트에서 보이지 않습니다 (0분 또는 1분 이하)";
export const TABLE_LABEL_TASK = "업무명";
export const TABLE_LABEL_CATEGORY = "카테고리";
export const TABLE_LABEL_RECORD_COUNT = "레코드 수";
export const TABLE_LABEL_TOTAL_SESSIONS = "총 세션";
export const TABLE_LABEL_TOTAL_TIME = "총 시간";
export const TABLE_LABEL_DATE_RANGE = "날짜 범위";
export const TABLE_VIEW_DETAIL = "상세 데이터 보기";
export const TABLE_COPY_DATA = "데이터 복사";
export const TABLE_COPY_GROUP = "그룹 데이터 복사";
export const TABLE_MINUTES_SUFFIX = "분";

export const PAGINATION_TOTAL = (
    range0: number,
    range1: number,
    total: number
) => `${range0}-${range1} / 총 ${total}개`;

// ============================================
// 데이터 탐색기 (Explorer) 레이블
// ============================================

export const EXPLORER_LABEL = {
    searchPlaceholderSessions: "검색 (작업명, 거래명, 프로젝트 코드)",
    searchPlaceholderRecords: "검색 (거래명, 작업명, 프로젝트 코드)",
    filterReset: "필터 초기화",
    sessionCount: "세션 수",
    recordCount: "레코드 수",
    runningCount: "진행중",
    totalTime: "총 시간",
    avgTime: "평균 시간",
    unit_count: "개",
    unit_record: "건",
    completed: "완료",
    inProgress: "진행중",
    duration: "소요",
    recordId: "세션 ID",
    record: "레코드",
    paginationTotal: (total: number) => `총 ${total}개`,
    paginationTotalRecords: (total: number) => `총 ${total}건`,
    // RecordsExplorer 전용
    statusAll: "전체 상태",
    statusCompleted: "완료됨",
    statusIncomplete: "미완료",
    deleteExclude: "삭제 제외",
    deleteInclude: "삭제 포함",
    deleteOnly: "삭제만",
    deleted: "삭제됨",
    totalSessions: "총 세션",
    // RecordsExplorer 상세 모달
    recordDetail: "레코드 상세",
    projectCode: "프로젝트 코드",
    taskName: "업무명",
    totalTimeLabel: "총 시간",
    startTime: "시작 시간",
    endTime: "종료 시간",
    completedYesNo: "완료 여부",
    completedYes: "완료",
    completedNo: "미완료",
    deletedYesNo: "삭제 여부",
    deletedYes: "삭제됨",
    deletedNo: "활성",
    completedAt: "완료 시각",
    deletedAt: "삭제 시각",
    note: "비고",
    sessionCountLabel: "세션 수",
    sessionList: "세션 목록",
    start: "시작",
    end: "종료",
    endInProgress: "(진행중)",
} as const;

// ============================================
// 휴지통 (Trash) 레이블
// ============================================

export const TRASH_LABEL = {
    deletedDate: "삭제일",
    originalDate: "원본 날짜",
    restore: "복원",
    permanentDelete: "영구 삭제",
    permanentDeleteConfirm:
        "이 항목을 영구 삭제하시겠습니까? 복구할 수 없습니다.",
    trashEmpty: "휴지통이 비어있습니다",
    searchPlaceholder: "검색 (거래명, 작업명, 프로젝트 코드)",
    deleteStartDate: "삭제 시작일",
    deleteEndDate: "삭제 종료일",
    filterReset: "필터 초기화",
    deletedRecords: "삭제된 레코드",
    totalSessions: "총 세션",
    totalTime: "총 시간",
    restoreSelected: "선택 항목 복원",
    permanentDeleteSelected: "선택 항목 영구 삭제",
    permanentDeleteSelectedConfirm: (n: number) =>
        `${n}개 항목을 영구 삭제하시겠습니까?`,
    deleteSelectedBtn: "선택 항목 삭제",
    emptyTrash: "휴지통 비우기",
    emptyTrashConfirm: (n: number) =>
        `${n}개의 모든 항목이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`,
    emptyTrashBtn: "비우기",
} as const;

// ============================================
// 정합성 검사 (Integrity) 레이블
// ============================================

export const INTEGRITY_LABEL = {
    issueTypes: {
        orphan_session: "고아 세션",
        time_mismatch: "시간 불일치",
        date_mismatch: "날짜 불일치",
        duplicate_id: "중복 ID",
        missing_required: "필수 필드 누락",
        invalid_time_range: "잘못된 시간 범위",
        zero_duration: "0분 세션",
        future_date: "미래 날짜",
        negative_duration: "음수 시간",
    },
    severity: "심각도",
    severityError: "오류",
    severityWarning: "경고",
    severityInfo: "정보",
    type: "유형",
    description: "설명",
    detail: "상세",
    recordLabel: "레코드",
    fix: "수정",
    title: "데이터 정합성 검사",
    titleDesc: "레코드와 세션 데이터의 무결성을 검사합니다.",
    titleHint: "문제가 발견되면 상세 정보와 수정 방법을 안내합니다.",
    checking: "검사 중...",
    startCheck: "검사 시작",
    checkItems: "검사 항목",
    checkMissingField: "필수 필드 누락",
    checkDuplicateId: "중복 ID 검사",
    checkTimeMismatch: "시간 불일치 (레코드 vs 세션 합계)",
    checkDateMismatch: "날짜 불일치",
    checkInvalidTimeRange: "잘못된 시간 범위",
    checkZeroSession: "0분 세션",
    checkFutureDate: "미래 날짜",
    checkNegativeDuration: "음수 소요 시간",
    totalIssues: "총 문제",
    noIssues: "문제 없음",
    noIssuesDesc:
        "데이터 정합성 검사를 통과했습니다. 모든 데이터가 정상입니다.",
    issuesFound: (n: number) => `${n}개의 문제가 발견되었습니다`,
    issuesSummary: (
        errors: number,
        warnings: number,
        infos: number
    ) => `오류: ${errors}개, 경고: ${warnings}개, 정보: ${infos}개`,
    recheck: "다시 검사",
    filterAll: "전체",
    filterError: "오류",
    filterWarning: "경고",
    filterInfo: "정보",
    noFilteredIssues: "필터 조건에 맞는 문제가 없습니다",
    checkedAt: "검사 시각:",
} as const;

// ============================================
// 문제 감지기 (Problem Detector) 레이블
// ============================================

export const PROBLEM_LABEL = {
    missingTime: "시간 정보 누락",
    invalidTimeFormat: "잘못된 시간 형식",
    zeroSession: "0분 세션",
    futureSession: "미래 날짜 세션",
} as const;

// ============================================
// 통계 (Statistics) 레이블
// ============================================

export const STATS_LABEL = {
    // TodayStatsCard
    todayStats: "오늘 통계",
    todayWorkTime: "오늘 작업 시간",
    sessionCount: "세션 수",
    recordCount: "레코드 수",
    completed: "완료",
    firstWork: "첫 작업",
    lastWork: "마지막 작업",

    // SessionStatsSection
    sessionStats: "세션 통계",
    avgSessionTime: "평균 세션 시간",
    longestSession: "최장 세션",
    shortestSession: "최단 세션",
    sessionTimeDist: "세션 시간 분포",
    under15: "15분 미만",
    range15to30: "15-30분",
    range30to60: "30분-1시간",
    range1to2: "1-2시간",
    over2: "2시간 이상",

    // ProductivitySection
    productivity: "생산성 지표",
    dailyAvg: "일 평균",
    weeklyAvg5: "주 평균 (5일)",
    monthlyAvg22: "월 평균 (22일)",
    dailyAvgSessions: "일 평균 세션",
    busiestDay: "가장 많이 일한 요일",
    busiestDayLabel: "최고 생산 요일",
    busiestHour: "가장 많이 일한 시간대",
    busiestHourLabel: "최고 생산 시간",
    streakDesc: "연속으로 작업한 일수 (오늘/어제 기준)",
    currentStreak: "현재 스트릭",
    maxStreak: "최대 스트릭",
    activeDays: "활동일 수",
    totalPeriod: "총 기간",
    dayUnit: "일",

    // PeriodComparison
    workTime: "작업 시간",
    sessions: "세션",
    records: "레코드",
    weekComparison: "이번 주 vs 지난 주",
    monthComparison: "이번 달 vs 지난 달",

    // StatsDashboard
    dailyChart: "일별 작업 시간 (최근 30일)",
    weeklyChart: "주별 작업 시간 (최근 12주)",
    monthlyChart: "월별 작업 시간 (최근 12개월)",
    overallSummary: "전체 요약",
    totalRecords: "총 레코드",
    totalSessions: "총 세션",
    totalTime: "총 시간",
    completedRecords: "완료됨",
    deletedRecords: "삭제됨",
    sessionsPerRecord: "레코드당 세션",
    timeTrend: "작업 시간 추이",
    daily: "일별",
    weekly: "주별",
    monthly: "월별",
    categoryAnalysis: "카테고리별 분석",
    workNameTop10: "작업명별 TOP 10",

    // TimePatternSection
    hourlyPattern: "시간대별 작업 패턴",
    sessionPrefix: "세션:",
    weeklyPattern: "요일별 작업 패턴",
    dayOfWeek: "요일",
    recordPrefix: "레코드:",
    hour0: "0시",
    hour6: "6시",
    hour12: "12시",
    hour18: "18시",
    hour24: "24시",

    // CategoryAnalysis
    rank: "순위",
    time: "시간",
    categoryTimeDist: "카테고리별 시간 분포",
    defaultCategories: {
        dev: "개발",
        meeting: "회의",
        docs: "문서작업",
        analysis: "분석",
        test: "테스트",
        etc: "기타",
    },

    // CompletionSection
    completionRate: "완료율",
    completionAnalysis: "완료율 분석",
    completedRecordCount: "완료된 레코드",
    avgCompletionTime: "평균 완료 시간",
    categoryCompletionRate: "카테고리별 완료율",
    dealProjectAnalysis: "딜/프로젝트별 분석",
    dealName: "딜명",
    completedTotal: "완료/전체",

    // 공통
    unit_count: "개",
    unit_record: "건",
} as const;

// ============================================
// 내보내기 (Export) 레이블
// ============================================

export const EXPORT_LABEL = {
    exportOptions: "내보내기 옵션",
    fileFormat: "파일 형식",
    csvFormat: "CSV (엑셀 호환)",
    jsonFormat: "JSON (백업용)",
    csvDesc: "CSV 형식은 Excel에서 바로 열 수 있습니다.",
    jsonDesc: "JSON 형식은 전체 데이터를 구조화된 형태로 저장합니다.",
    dataType: "데이터 유형",
    records: "레코드",
    sessions: "세션",
    all: "전체",
    recordsDesc: "작업 기록 단위로 내보냅니다.",
    sessionsDesc: "개별 세션 단위로 내보냅니다.",
    allDesc: "레코드와 세션을 모두 포함합니다.",
    dateRange: "날짜 범위",
    startDate: "시작일",
    endDate: "종료일",
    resetToAllPeriod: "전체 기간으로 초기화",
    periodData: "기간의 데이터",
    allPeriodData: "전체 기간의 데이터를 내보냅니다.",
    additionalOptions: "추가 옵션",
    includeDeleted: "삭제된 데이터 포함",
    exportPreview: "내보내기 미리보기",
    recordCountLabel: "레코드 수",
    sessionCountLabel: "세션 수",
    totalWorkTime: "총 작업 시간",
    exportInfo: "내보내기 정보",
    formatLabel: "형식:",
    dataLabel: "데이터:",
    periodLabel: "기간:",
    deletedDataLabel: "삭제된 데이터:",
    include: "포함",
    exclude: "제외",
    exporting: "내보내는 중...",
    download: "다운로드",
    noDataToExport: "내보낼 데이터가 없습니다",
    helpTitle: "도움말",
    helpCsvTitle: "CSV 형식",
    helpCsvDesc:
        "Microsoft Excel, Google Sheets 등에서 바로 열 수 있습니다. 한글이 깨지는 경우 UTF-8 BOM 인코딩을 지원하는 프로그램을 사용하세요.",
    helpJsonTitle: "JSON 형식",
    helpJsonDesc:
        "전체 데이터를 구조화된 형태로 저장합니다. 데이터 백업이나 다른 시스템으로 이전할 때 유용합니다.",
    unit_record: "건",
    unit_count: "개",
    jsonLabel: "JSON",
} as const;

// ============================================
// 충돌 (Conflicts) 레이블
// ============================================

export const CONFLICTS_LABEL = {
    noConflicts: "충돌이 없습니다.",
    session1: "세션 1",
    session2: "세션 2",
    overlap: "겹침",
    resolve: "해결",
    total: "총",
    conflictCountSuffix: "개의 충돌",
} as const;

// ============================================
// 중복 (Duplicates) 레이블
// ============================================

export const DUPLICATES_LABEL = {
    noDuplicates: "중복된 레코드가 없습니다.",
    duplicateCount: "중복 수",
    total: "총",
    duplicateGroupSuffix: "개의 중복 그룹",
} as const;
