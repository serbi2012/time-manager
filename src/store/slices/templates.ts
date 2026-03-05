/**
 * Templates Slice
 *
 * 템플릿(프리셋) 상태 및 액션
 * - CRUD 작업
 * - 순서 변경
 * - 폼에 적용
 */

import type { StateCreator } from "zustand";
import { create } from "mutative";
import dayjs from "dayjs";
import type { TemplatesSlice, WorkStore, WorkTemplate } from "../types";
import { syncTemplate, syncDeleteTemplate } from "@/firebase/syncService";

export const createTemplatesSlice: StateCreator<
    WorkStore,
    [],
    [],
    TemplatesSlice
> = (set, get) => ({
    // ============================================
    // State
    // ============================================
    templates: [],

    // ============================================
    // Actions
    // ============================================

    addTemplate: (template: Omit<WorkTemplate, "id" | "created_at" | "sort_order">) => {
        const { templates } = get();
        const max_order = templates.reduce(
            (max, t) => Math.max(max, t.sort_order ?? 0),
            0
        );

        const new_template: WorkTemplate = {
            ...template,
            id: crypto.randomUUID(),
            created_at: dayjs().toISOString(),
            sort_order: max_order + 1,
        };

        set(
            create((state) => {
                state.templates.push(new_template);
            })
        );

        syncTemplate(new_template).catch(console.error);
        return new_template;
    },

    deleteTemplate: (id) => {
        set(
            create((state) => {
                const index = state.templates.findIndex((t) => t.id === id);
                if (index !== -1) state.templates.splice(index, 1);
            })
        );

        syncDeleteTemplate(id).catch(console.error);
    },

    updateTemplate: (id, template) => {
        set(
            create((state) => {
                const t = state.templates.find((t) => t.id === id);
                if (t) {
                    Object.assign(t, template);
                }
            })
        );

        const updated_template = get().templates.find((t) => t.id === id);
        if (updated_template) {
            syncTemplate(updated_template).catch(console.error);
        }
    },

    reorderTemplates: (active_id, over_id) => {
        set(
            create((state) => {
                const old_index = state.templates.findIndex(
                    (t) => t.id === active_id
                );
                const new_index = state.templates.findIndex(
                    (t) => t.id === over_id
                );
                if (old_index === -1 || new_index === -1) return;

                const [removed] = state.templates.splice(old_index, 1);
                state.templates.splice(new_index, 0, removed);

                state.templates.forEach((t, i) => {
                    t.sort_order = i;
                });
            })
        );

        const { templates } = get();
        templates.forEach((t) => {
            syncTemplate(t).catch(console.error);
        });
    },

    applyTemplate: (template_id) => {
        const { templates } = get();
        const template = templates.find((t) => t.id === template_id);
        if (!template) return;

        set({
            form_data: {
                project_code: template.project_code || "",
                work_name: template.work_name,
                task_name: template.task_name,
                deal_name: template.deal_name,
                category_name: template.category_name,
                note: template.note,
            },
        });
    },
});
