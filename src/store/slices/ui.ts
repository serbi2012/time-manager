/**
 * UI Slice
 *
 * UI 상태 및 액션
 * - 날짜 선택
 * - 레코드 필터링
 * - 자동완성 옵션 생성
 */

import type { StateCreator } from "zustand";
import dayjs from "dayjs";
import type {
    UiSlice,
    WorkStore,
    WorkFormData,
    ProjectCodeOption,
} from "../types";

export const createUiSlice: StateCreator<WorkStore, [], [], UiSlice> = (
    set,
    get
) => ({
    // ============================================
    // State
    // ============================================
    selected_date: dayjs().format("YYYY-MM-DD"),

    // ============================================
    // Actions
    // ============================================

    setSelectedDate: (date: string) => {
        set({ selected_date: date });
    },

    getFilteredRecords: () => {
        const { records, selected_date } = get();
        return records.filter((r) => r.date === selected_date && !r.is_deleted);
    },

    // 미완료 작업: 선택된 날짜의 레코드 + 과거 미완료 레코드
    getIncompleteRecords: () => {
        const { records, selected_date } = get();
        return records.filter((r) => {
            // 삭제된 레코드는 제외
            if (r.is_deleted) return false;
            // 완료된 레코드는 제외
            if (r.is_completed) return false;
            // 선택된 날짜의 레코드 또는 과거의 미완료 레코드
            return r.date <= selected_date;
        });
    },

    // 완료된 작업 목록
    getCompletedRecords: () => {
        const { records } = get();
        return records
            .filter((r) => r.is_completed && !r.is_deleted)
            .sort((a, b) => {
                // 완료 시간 기준 내림차순 정렬
                const a_time = a.completed_at || a.date;
                const b_time = b.completed_at || b.date;
                return b_time.localeCompare(a_time);
            });
    },

    // 자동완성 옵션 생성 (숨김 목록 필터링)
    getAutoCompleteOptions: (field: keyof WorkFormData) => {
        const { records, templates, hidden_autocomplete_options } = get();
        const values = new Set<string>();

        // 기존 레코드에서 추출
        records.forEach((r) => {
            const value = r[field as keyof typeof r];
            if (typeof value === "string" && value.trim()) {
                values.add(value);
            }
        });

        // 템플릿에서도 추출
        templates.forEach((t) => {
            const value = t[field as keyof typeof t];
            if (typeof value === "string" && value.trim()) {
                values.add(value);
            }
        });

        // 숨김 목록 필터링
        const hidden_list =
            hidden_autocomplete_options[
                field as keyof typeof hidden_autocomplete_options
            ] || [];
        const filtered = Array.from(values).filter(
            (v) => !hidden_list.includes(v)
        );

        return filtered.sort();
    },

    // 프로젝트 코드 자동완성 옵션 (코드 + 작업명별 개별 옵션, 숨김 목록 필터링)
    getProjectCodeOptions: (): ProjectCodeOption[] => {
        const { records, templates, hidden_autocomplete_options } = get();
        // 코드+작업명 조합을 Set으로 관리 (중복 제거)
        const code_work_pairs = new Set<string>();

        // 레코드에서 추출
        records.forEach((r) => {
            if (r.project_code && r.project_code.trim()) {
                const work_name = r.work_name?.trim() || "";
                code_work_pairs.add(`${r.project_code}::${work_name}`);
            }
        });

        // 템플릿에서도 추출
        templates.forEach((t) => {
            if (t.project_code && t.project_code.trim()) {
                const work_name = t.work_name?.trim() || "";
                code_work_pairs.add(`${t.project_code}::${work_name}`);
            }
        });

        // 숨김 목록 (코드::작업명 형태)
        const hidden_codes = hidden_autocomplete_options.project_code || [];

        // 옵션 생성: { value: "코드::작업명", label: "[코드] 작업명", work_name: 작업명 }
        const options: ProjectCodeOption[] = [];
        code_work_pairs.forEach((pair) => {
            // 숨김 처리된 항목 제외
            if (hidden_codes.includes(pair)) return;

            const [code, work_name] = pair.split("::");
            const label = work_name ? `[${code}] ${work_name}` : `[${code}]`;
            options.push({
                value: pair, // "코드::작업명" 형태로 저장
                label,
                work_name: work_name || undefined,
            });
        });

        return options.sort((a, b) => a.value.localeCompare(b.value));
    },
});
