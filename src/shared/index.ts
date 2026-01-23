/**
 * 공유 리소스 진입점
 * 
 * 개별 모듈에서 직접 import하는 것을 권장합니다.
 * 
 * @example
 * // 권장: 개별 모듈에서 import
 * import { timeToMinutes } from '@/shared/lib/time';
 * import type { WorkRecord } from '@/shared/types';
 * import { DEFAULT_TASK_OPTIONS } from '@/shared/config';
 * import { useResponsive } from '@/shared/hooks';
 */

// 타입은 re-export하지 않음 (import type 사용 권장)
// 설정은 re-export하지 않음 (개별 모듈에서 import 권장)
// 라이브러리 함수는 re-export하지 않음 (개별 모듈에서 import 권장)

// 각 모듈의 경로만 export (tree-shaking을 위해)
export * as types from "./types";
export * as config from "./config";
export * as lib from "./lib";
export * as hooks from "./hooks";
