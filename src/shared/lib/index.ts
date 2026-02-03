/**
 * 공유 라이브러리 함수 모음
 *
 * 모든 순수 유틸리티 함수들의 진입점
 *
 * @example
 * // 개별 모듈에서 import (권장)
 * import { timeToMinutes, formatDuration } from '@/shared/lib/time';
 * import { calculateDurationExcludingLunch } from '@/shared/lib/lunch';
 * import { generateDealName, createRecordFromTemplate } from '@/shared/lib/record';
 * import { downloadAsJson, importFromFile } from '@/shared/lib/data';
 *
 * // 또는 통합 import
 * import { timeToMinutes, generateDealName } from '@/shared/lib';
 */

// 시간 유틸리티
export * from "./time";

// 점심시간 유틸리티
export * from "./lunch";

// 세션 유틸리티
export * from "./session";

// 레코드 유틸리티
export * from "./record";

// 데이터 내보내기/가져오기 유틸리티
export * from "./data";
