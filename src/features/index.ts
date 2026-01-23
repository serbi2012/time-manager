/**
 * Features 모듈 진입점
 * 
 * 각 기능별로 개별 import하는 것을 권장합니다.
 * 
 * @example
 * import { type TimerSlice } from '@/features/timer';
 * import { findExistingRecord } from '@/features/work-record';
 */

// 개별 모듈 re-export
export * as timer from "./timer";
export * as workRecord from "./work-record";
export * as workTemplate from "./work-template";
export * as settings from "./settings";
export * as ganttChart from "./gantt-chart";
export * as admin from "./admin";
export * as weeklySchedule from "./weekly-schedule";
