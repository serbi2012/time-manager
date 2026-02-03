/**
 * 시간 지속 관련 상수
 */

import { MS_PER_MINUTE, MS_PER_SECOND } from "./units";

// ============================================
// 타이머 관련
// ============================================

/** 타이머 업데이트 간격 (ms) - 1초 */
export const TIMER_UPDATE_INTERVAL = MS_PER_SECOND;

/** 자동 저장 간격 (ms) - 5분 */
export const AUTO_SAVE_INTERVAL = 5 * MS_PER_MINUTE;

/** 동기화 재시도 간격 (ms) - 30초 */
export const SYNC_RETRY_INTERVAL = 30 * MS_PER_SECOND;

// ============================================
// 애니메이션/UI 관련
// ============================================

/** 디바운스 기본 지연시간 (ms) */
export const DEBOUNCE_DELAY = 300;

/** 토스트 메시지 지속 시간 (ms) */
export const TOAST_DURATION = 3000;

/** 모달 애니메이션 시간 (ms) */
export const MODAL_ANIMATION_DURATION = 200;

// ============================================
// 간트 차트 관련
// ============================================

/** 최소 드래그 지속 시간 (분) */
export const MIN_DRAG_DURATION_MINUTES = 1;

/** 간트 차트 시간 슬롯 단위 (분) */
export const GANTT_SLOT_MINUTES = 5;
