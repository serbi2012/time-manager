/**
 * 주간 일정 스타일 상수
 */

import type { CSSProperties } from "react";

export const WEEKLY_HEADER_TITLE_STYLE: CSSProperties = {
    margin: 0,
};

export const WEEKLY_HEADER_ICON_STYLE: CSSProperties = {
    marginRight: 8,
};

export const WEEKLY_DIVIDER_STYLE: CSSProperties = {
    margin: "16px 0",
};

export const WEEKLY_WEEK_RANGE_STYLE: CSSProperties = {
    textAlign: "center",
    marginBottom: 16,
};

export const WEEKLY_DATE_PICKER_MOBILE_STYLE: CSSProperties = {
    width: 100,
};

export const WEEKLY_WORK_INPUT_STYLE: CSSProperties = {
    width: 80,
};

export const WEEKLY_WORK_DIVIDER_STYLE: CSSProperties = {
    margin: "8px 0",
};

export const WEEKLY_PREVIEW_HEADER_TITLE_STYLE: CSSProperties = {
    margin: 0,
};

export const WEEKLY_PREVIEW_HEADER_CONTAINER_STYLE: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
};

export const WEEKLY_PREVIEW_SECTION_STYLE: CSSProperties = {
    marginTop: 16,
};

export const WEEKLY_SCHEDULE_STYLES = `
.weekly-schedule-content {
    padding: 24px;
    background: #f5f5f5;
    min-height: calc(100vh - 64px);
    overflow-y: auto;
}

.weekly-schedule-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.weekly-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.week-range {
    text-align: center;
    margin-bottom: 16px;
}

.weekly-schedule-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.day-card {
    border-radius: 8px;
}

.day-card .ant-card-head {
    background: #fafafa;
    border-radius: 8px 8px 0 0;
}

.work-item {
    margin-bottom: 8px;
}

.work-header {
    margin-bottom: 4px;
}

.deal-list {
    padding-left: 16px;
}

.deal-item {
    margin: 2px 0;
}

.preview-section {
    margin-top: 16px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.copy-preview {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
    font-family: 'D2Coding', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
}
`;
