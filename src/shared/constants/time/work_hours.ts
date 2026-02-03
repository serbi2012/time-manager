/**
 * 업무 시간 관련 상수
 */

import { hoursToMinutes } from "./units";

// ============================================
// 점심시간
// ============================================

/** 기본 점심 시작 시간 (문자열) */
export const DEFAULT_LUNCH_START_TIME = "11:40";

/** 기본 점심 종료 시간 (문자열) */
export const DEFAULT_LUNCH_END_TIME = "12:40";

/** 점심 시작 시간 (분) - 11:40 = 700분 */
export const LUNCH_START_MINUTES = hoursToMinutes(11, 40);

/** 점심 종료 시간 (분) - 12:40 = 760분 */
export const LUNCH_END_MINUTES = hoursToMinutes(12, 40);

/** 점심 시간 (분) - 60분 */
export const LUNCH_DURATION_MINUTES = LUNCH_END_MINUTES - LUNCH_START_MINUTES;

// ============================================
// 업무 시간
// ============================================

/** 업무 시작 시간 (분) - 09:00 = 540분 */
export const WORK_START_MINUTES = hoursToMinutes(9, 0);

/** 업무 종료 시간 (분) - 18:00 = 1080분 */
export const WORK_END_MINUTES = hoursToMinutes(18, 0);

/** 정오 (분) - 12:00 = 720분 */
export const NOON_MINUTES = hoursToMinutes(12, 0);
