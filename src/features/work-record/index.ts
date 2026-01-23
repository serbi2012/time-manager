/**
 * 작업 기록 기능 모듈
 * 
 * @example
 * import { 
 *   type RecordSlice,
 *   findExistingRecord,
 *   getRecordDurationMinutes,
 * } from '@/features/work-record';
 */

// 타입
export type {
    RecordSlice,
    RecordSliceState,
    RecordSliceActions,
    SessionUpdateResult,
} from "./model/types";

// 순수 함수
export * from "./lib";
