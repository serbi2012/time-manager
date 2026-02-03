/**
 * LocalStorage 키 상수
 */

export const STORAGE_KEYS = {
    /** 작업 시간 데이터 */
    WORK_TIME: "work-time-storage",
    /** 단축키 설정 */
    SHORTCUT: "shortcut-storage",
    /** 동기화 대기 데이터 */
    PENDING_SYNC: "time_manager_pending_sync",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
