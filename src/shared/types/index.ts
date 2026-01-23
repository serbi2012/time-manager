/**
 * 공유 타입 정의 모음
 * 
 * @example
 * import type { WorkRecord, WorkSession, TimerState } from '@/shared/types';
 */

// 핵심 도메인 타입
export type {
    WorkSession,
    WorkRecord,
    WorkFormData,
    WorkTemplate,
    HiddenAutoCompleteOptions,
    ProjectCodeOption,
} from "./domain";

// 타이머 타입
export type { TimerState } from "./timer";
export { DEFAULT_TIMER_STATE } from "./timer";

// 건의사항 타입
export type {
    SuggestionStatus,
    SuggestionReply,
    SuggestionPost,
} from "./suggestion";

// 단축키 타입
export type {
    ShortcutCategory,
    ShortcutDefinition,
} from "./shortcut";
