/**
 * 주간 일정 설정
 */

export const WEEKLY_SCHEDULE_CONFIG = {
    /** 복사 형식: 1 = 기존 형식, 2 = 구분선 형식 */
    defaultCopyFormat: 2 as 1 | 2,
    /** 기본 프로젝트 코드 (미지정 시) */
    defaultProjectCode: "A00_00000",
    /** 복사 구분선 문자열 */
    copySeparator: "────────────────────────────────────────",
    /** 요일 개수 */
    daysInWeek: 7,
} as const;
