import { useState, useCallback, useEffect } from "react";
import { Form } from "antd";
import { useWorkStore } from "@/store/useWorkStore";
import type { WorkTemplate } from "@/shared/types";

interface TemplateFormValues {
    project_code?: string;
    work_name: string;
    deal_name?: string;
    task_name?: string;
    category_name?: string;
    note?: string;
    color: string;
}

export function useTemplateActions() {
    const { addTemplate, updateTemplate, deleteTemplate } = useWorkStore();

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [is_edit_mode, setIsEditMode] = useState(false);
    const [editing_template, setEditingTemplate] =
        useState<WorkTemplate | null>(null);
    const [form] = Form.useForm();

    // 단축키 이벤트 리스너: 새 프리셋 모달 열기
    useEffect(() => {
        const handleOpenNewPresetModal = () => {
            setIsEditMode(false);
            setEditingTemplate(null);
            setIsModalOpen(true);
        };
        window.addEventListener(
            "shortcut:openNewPresetModal",
            handleOpenNewPresetModal
        );
        return () => {
            window.removeEventListener(
                "shortcut:openNewPresetModal",
                handleOpenNewPresetModal
            );
        };
    }, []);

    // 모달 열기 (추가)
    const handleOpenAddModal = useCallback(() => {
        setIsEditMode(false);
        setEditingTemplate(null);
        setIsModalOpen(true);
    }, []);

    // 모달 열기 (수정)
    const handleOpenEditModal = useCallback((template: WorkTemplate) => {
        setIsEditMode(true);
        setEditingTemplate(template);
        setIsModalOpen(true);
    }, []);

    // 모달 닫기
    const handleCloseModal = useCallback(() => {
        form.resetFields();
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingTemplate(null);
    }, [form]);

    // 프리셋 추가/수정 처리
    const handleSubmit = useCallback(
        async (values: TemplateFormValues) => {
            if (is_edit_mode && editing_template) {
                // 수정
                updateTemplate(editing_template.id, {
                    project_code: values.project_code || "",
                    work_name: values.work_name,
                    task_name: values.task_name || "",
                    deal_name: values.deal_name || "",
                    category_name: values.category_name || "",
                    note: values.note || "",
                    color: values.color,
                });
            } else {
                // 추가
                addTemplate({
                    project_code: values.project_code || "",
                    work_name: values.work_name,
                    task_name: values.task_name || "",
                    deal_name: values.deal_name || "",
                    category_name: values.category_name || "",
                    note: values.note || "",
                    color: values.color,
                });
            }
        },
        [is_edit_mode, editing_template, addTemplate, updateTemplate]
    );

    return {
        // 상태
        is_modal_open,
        is_edit_mode,
        editing_template,
        form,

        // 액션
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete: deleteTemplate,
    };
}
