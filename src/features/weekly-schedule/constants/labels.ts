/**
 * 주간 일정 UI 레이블
 */

export const WEEKLY_LABELS = {
    title: "주간 일정",
    thisWeek: "이번 주",
    thisWeekShort: "오늘",
    defaultView: "기본 보기",
    defaultViewShort: "기본",
    includeManagement: "관리업무 포함",
    includeManagementShort: "관리포함",
    copy: "복사",
    copyTooltip: "복사하기",
    copyPreview: "복사 미리보기",
    format1: "형식 1",
    format2: "형식 2",
    emptyDescription: "해당 주에 작업 기록이 없습니다",
    statusLabel: "진행상태:",
    startDateLabel: "시작일자:",
    cumulativeTimeLabel: "누적시간:",
    dealCumulativeLabel: "누적시간:",
} as const;

export const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const COPY_FORMAT_LABELS = {
    format1: "형식 1 (기본)",
    format2: "형식 2 (상세)",
    format3: "형식 3 (간단)",
    totalPrefix: "총: ",
    totalBoldPrefix: "총 ",
    dealPrefix: "거래: ",
    categoryPrefix: "카테고리: ",
    timePrefix: "시간: ",
    notePrefix: "비고: ",
} as const;
