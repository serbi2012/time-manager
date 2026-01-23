/**
 * 타입 정의 - 하위 호환성 유지를 위한 re-export
 *
 * @deprecated shared/types에서 직접 import하세요
 * @example
 * // 이전 방식 (여전히 작동)
 * import type { WorkRecord } from '../types';
 *
 * // 권장 방식
 * import type { WorkRecord } from '@/shared/types';
 */

// 모든 타입을 shared/types에서 re-export
export type {
    WorkSession,
    WorkRecord,
    WorkFormData,
    WorkTemplate,
    HiddenAutoCompleteOptions,
    ProjectCodeOption,
    TimerState,
    SuggestionStatus,
    SuggestionReply,
    SuggestionPost,
    ShortcutCategory,
    ShortcutDefinition,
} from "../shared/types";

export { DEFAULT_TIMER_STATE } from "../shared/types";
