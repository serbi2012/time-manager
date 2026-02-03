/**
 * Placeholder 텍스트 상수
 */

export const PLACEHOLDERS = {
    // 작업 관련
    projectCode: "예: A25_01846 (미입력 시 A00_00000)",
    workName: "예: 5.6 프레임워크 FE",
    dealName: "예: 5.6 테스트 케이스 확인 및 이슈 처리",
    taskName: "업무를 선택하세요",
    categoryName: "카테고리를 선택하세요",
    note: "메모를 입력하세요",

    // 검색/필터
    search: "검색어를 입력하세요",
    searchWork: "작업명으로 검색",
    filterDate: "날짜 선택",

    // 시간 관련
    time: "HH:mm",
    selectTime: "시간 선택",
    selectDate: "날짜 선택",

    // 기타
    nickname: "닉네임을 입력하세요",
    content: "내용을 입력하세요",
    reply: "답글을 입력하세요",
} as const;

// ============================================
// 빈 상태 메시지
// ============================================

export const EMPTY_MESSAGES = {
    noRecords:
        "작업 기록이 없습니다. 프리셋에서 작업을 추가하거나 새 작업을 시작하세요.",
    noTemplates: "프리셋이 없습니다. 새 프리셋을 추가해보세요.",
    noCompletedWorks: "완료된 작업이 없습니다.",
    noDeletedRecords: "휴지통이 비어있습니다.",
    noSearchResults: "검색 결과가 없습니다.",
    noChangelog: "변경 내역이 없습니다.",
    noData: "데이터가 없습니다.",
} as const;
