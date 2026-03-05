/**
 * 작업 폼 관련 타입, 스키마, 상수
 */

import type { Control } from "react-hook-form";
import { z } from "zod";
import {
    ERROR_MESSAGES,
    FORM_LABELS,
    PLACEHOLDERS,
} from "@/shared/constants";

// ============================================================================
// 폼 데이터 타입
// ============================================================================

export interface WorkFormData {
    project_code: string;
    work_name: string;
    task_name: string;
    deal_name: string;
    category_name: string;
    note: string;
}

// ============================================================================
// Zod 스키마
// ============================================================================

export const workFormSchema = z.object({
    project_code: z.string(),
    work_name: z.string().min(1, ERROR_MESSAGES.workNameRequired),
    task_name: z.string(),
    deal_name: z.string(),
    category_name: z.string(),
    note: z.string(),
}) satisfies z.ZodType<WorkFormData>;

// ============================================================================
// 기본값
// ============================================================================

export const DEFAULT_WORK_FORM_DATA: WorkFormData = {
    project_code: "",
    work_name: "",
    task_name: "",
    deal_name: "",
    category_name: "",
    note: "",
};

// ============================================================================
// 컴포넌트 관련 타입
// ============================================================================

export type WorkFormFieldName = keyof WorkFormData;

export type WorkFormLayout = "default" | "compact" | "inline";

export interface WorkFormFieldsProps {
    control: Control<WorkFormData>;
    layout?: WorkFormLayout;
    visibleFields?: WorkFormFieldName[];
    disabled?: boolean;
    placeholders?: Partial<Record<WorkFormFieldName, string>>;
    labels?: Partial<Record<WorkFormFieldName, string>>;
    className?: string;
    gutter?: number;
}

// ============================================================================
// 훅 옵션 타입
// ============================================================================

export interface UseWorkFormOptions {
    defaultValues?: Partial<WorkFormData>;
    mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
}

// ============================================================================
// 기본 라벨/플레이스홀더 상수
// ============================================================================

export const DEFAULT_LABELS: Record<WorkFormFieldName, string> = {
    project_code: FORM_LABELS.projectCode,
    work_name: FORM_LABELS.workName,
    task_name: FORM_LABELS.taskName,
    deal_name: FORM_LABELS.dealName,
    category_name: FORM_LABELS.categoryName,
    note: FORM_LABELS.remark,
};

export const DEFAULT_PLACEHOLDERS: Record<WorkFormFieldName, string> = {
    project_code: PLACEHOLDERS.projectCode,
    work_name: PLACEHOLDERS.workName,
    task_name: PLACEHOLDERS.taskName,
    deal_name: PLACEHOLDERS.dealName,
    category_name: PLACEHOLDERS.categoryName,
    note: PLACEHOLDERS.noteAdditional,
};
