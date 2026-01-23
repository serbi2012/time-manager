/**
 * 설정 관련 타입 정의
 */

import type { AppTheme } from "../../../shared/config";
import type { ShortcutDefinition } from "../../../shared/types";

/**
 * 설정 모달 Props
 */
export interface SettingsModalProps {
    open: boolean;
    on_close: () => void;
    on_export: () => void;
    on_import: (file: File) => void;
    is_logged_in: boolean;
}

/**
 * 데이터 탭 Props
 */
export interface DataTabProps {
    on_export: () => void;
    on_import: (file: File) => void;
    is_logged_in: boolean;
}

/**
 * 단축키 탭 Props
 */
export interface ShortcutsTabProps {
    shortcuts: ShortcutDefinition[];
    on_toggle: (id: string) => void;
    on_edit: (shortcut: ShortcutDefinition) => void;
    on_reset: () => void;
}

/**
 * 자동완성 탭 Props
 */
export interface AutoCompleteTabProps {
    work_names: string[];
    deal_names: string[];
    task_names: string[];
    project_codes: string[];
    hidden_options: {
        work_name: string[];
        deal_name: string[];
        task_name: string[];
        project_code: string[];
    };
    on_hide: (field: string, value: string) => void;
    on_unhide: (field: string, value: string) => void;
}

/**
 * 테마 탭 Props
 */
export interface ThemeTabProps {
    current_theme: AppTheme;
    on_change: (theme: AppTheme) => void;
}

/**
 * 단축키 편집기 Props
 */
export interface ShortcutKeyEditorProps {
    shortcut: ShortcutDefinition;
    on_close: () => void;
    on_save: (id: string, keys: string) => void;
}
