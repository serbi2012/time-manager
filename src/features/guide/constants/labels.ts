// UI 레이블 상수

export const GUIDE_LABELS = {
    // 페이지 제목
    pageTitle: "사용 설명서",

    // 검색
    searchPlaceholder: "문서 검색...",
    searchNoResults: "검색 결과가 없습니다",

    // 네비게이션
    prevLabel: "이전",
    nextLabel: "다음",

    // 에러
    mermaidError: "Mermaid 렌더링 오류",
} as const;

// ============================================
// 데모 데이터 레이블
// ============================================

export const DEMO_DATA_LABELS = {
    frameworkFE: "5.6 프레임워크 FE",
    frameworkBE: "5.6 프레임워크 BE",
    management: "관리업무",
    componentDev: "컴포넌트 개발",
    apiIntegration: "API 연동 작업",
    weeklyMeeting: "주간회의",
    apiDesign: "API 설계",
    design: "설계",
    dev: "개발",
    meeting: "회의",
    docs: "문서작업",
    envSetup: "환경세팅",
    codeReview: "코드리뷰",
    test: "테스트",
    etc: "기타",
} as const;

// ============================================
// 데모 UI 레이블
// ============================================

export const DEMO_UI_LABELS = {
    demoDate: "2월 11일 화요일",
    today: "오늘",
    newWork: "새 작업",
    totalCount: (n: number) => `총 ${n}건`,
} as const;

// ============================================
// 데모 간트차트 레이블
// ============================================

export const DEMO_GANTT_LABELS = {
    timelineTitle: "일간 타임라인",
    demoDateFull: "2026년 2월 11일 (화)",
    dragHint: "빈 영역을 드래그하여 작업 추가",
    apiIntegration: "API 연동",
} as const;

// ============================================
// 데모 템플릿 레이블
// ============================================

export const DEMO_TEMPLATE_LABELS = {
    addNewPreset: "새 프리셋 추가",
    addWork: "작업 추가",
} as const;

// ============================================
// 데모 기타 컴포넌트 레이블
// ============================================

export const DEMO_MISC_LABELS = {
    presetTitle: "작업 프리셋",
    emptyPreset: "아직 프리셋이 없어요",
    emptyPresetDesc: "자주 쓰는 작업을 저장해 보세요",
    dataTab: "데이터",
    timeSetting: "시간 설정",
    lunchTime: "점심시간",
    lunchTimeDesc:
        "간트차트에 표시되며 작업 시간 계산 시 자동 제외돼요",
    presetSetting: "프리셋 설정",
    autoIdentifier: "고유 식별자 자동 추가",
    autoIdentifierDesc:
        "프리셋으로 작업 추가 시 거래명에 타임스탬프를 붙여요",
    dataManagement: "데이터 관리",
    exportData: "데이터 내보내기",
    importData: "데이터 가져오기",
    dataManagementDesc:
        "JSON 파일로 데이터를 백업하거나 복원할 수 있어요. 가져오기 시 기존 데이터가 대체돼요.",
    storage: "저장소",
    cloudConnected: "클라우드 연결됨",
    cloudSyncDesc: "모든 데이터가 자동으로 동기화돼요",
    feature: "기능",
    shortcut: "단축키",
    category: "카테고리",
    enabled: "활성화",
    shortcutList: "단축키 목록",
} as const;

// ============================================
// 데모 컴포넌트 레이블
// ============================================

export const DEMO_COMPONENT_LABELS = {
    notFound: (name: string) =>
        `데모 컴포넌트를 찾을 수 없습니다: ${name}`,
    uiPreview: "실제 UI 미리보기",
} as const;
