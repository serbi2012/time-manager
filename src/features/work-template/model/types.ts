/**
 * 템플릿 관련 타입 정의
 */

import type { WorkTemplate, WorkFormData } from "../../../shared/types";

/**
 * 템플릿 목록 Props
 */
export interface TemplateListProps {
    templates: WorkTemplate[];
    on_apply: (template: WorkTemplate) => void;
    on_edit: (template: WorkTemplate) => void;
    on_delete: (template_id: string) => void;
    on_reorder: (from_index: number, to_index: number) => void;
}

/**
 * 템플릿 카드 Props
 */
export interface TemplateCardProps {
    template: WorkTemplate;
    on_apply: () => void;
    on_edit: () => void;
    on_delete: () => void;
    is_dragging?: boolean;
}

/**
 * 템플릿 편집기 Props
 */
export interface TemplateEditorProps {
    template?: WorkTemplate;
    initial_data?: Partial<WorkFormData>;
    on_save: (data: Omit<WorkTemplate, "id">) => void;
    on_cancel: () => void;
}

/**
 * 템플릿 색상 선택기 Props
 */
export interface ColorPickerProps {
    selected_color: string;
    on_change: (color: string) => void;
}

/**
 * 템플릿 아이콘 선택기 Props
 */
export interface IconPickerProps {
    selected_icon?: string;
    on_change: (icon: string) => void;
}
