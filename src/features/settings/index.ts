/**
 * 설정 기능 모듈
 * 
 * @example
 * import { DataTab, ThemeTab, ShortcutsTab } from '@/features/settings';
 */

// 타입
export type {
    SettingsModalProps,
    DataTabProps,
    ShortcutsTabProps,
    AutoCompleteTabProps,
    ThemeTabProps,
    ShortcutKeyEditorProps,
} from "./model/types";

// UI 컴포넌트
export * from "./ui";
