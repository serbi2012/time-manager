/**
 * 작업 폼 관련 타입, 스키마, 상수
 */

import type { Control } from "react-hook-form";
import { z } from "zod";

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
    work_name: z.string().min(1, "작업명을 입력하세요"),
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
    project_code: "프로젝트 코드",
    work_name: "작업명",
    task_name: "업무명",
    deal_name: "거래명 (상세 작업)",
    category_name: "카테고리",
    note: "비고",
};

export const DEFAULT_PLACEHOLDERS: Record<WorkFormFieldName, string> = {
    project_code: "예: A25_01846 (미입력 시 A00_00000)",
    work_name: "예: 5.6 프레임워크 FE",
    task_name: "업무 선택",
    deal_name: "예: 5.6 테스트 케이스 확인 및 이슈 처리",
    category_name: "카테고리 선택",
    note: "추가 메모",
};
