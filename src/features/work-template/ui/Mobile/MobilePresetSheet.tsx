/**
 * 모바일 프리셋 시트
 * 화면 높이의 90%를 쓰는 바텀시트 — 행 탭은 작업 추가, 우측 버튼은 추가 후 타이머 시작
 */

import { useState, useCallback, useMemo } from "react";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useShallow } from "zustand/react/shallow";

import { useWorkStore } from "@/store/useWorkStore";
import {
    MobileBottomSheet,
    MobileActionMenu,
    type MobileActionMenuItem,
} from "@/shared/ui";
import type { WorkTemplate } from "@/shared/types";

import { TemplateModal } from "../TemplateModal";
import { MobilePresetRow } from "./MobilePresetRow";
import { EmptyPresetState } from "../EmptyPresetState";
import { useTemplateActions } from "../../hooks";
import { filterTemplates } from "../../lib/template_filter";
import {
    TEMPLATE_CARD_TITLE,
    BUTTON_ADD_FULL,
    MOBILE_PRESET_SHEET,
    MOBILE_TEMPLATE_MENU,
} from "../../constants";

const SHEET_HEIGHT_RATIO = 0.9;

const PRESET_MENU_KEY = {
    EDIT: "edit",
    DELETE: "delete",
} as const;

const PRESET_MENU_ITEMS: MobileActionMenuItem[] = [
    {
        key: PRESET_MENU_KEY.EDIT,
        label: MOBILE_TEMPLATE_MENU.EDIT,
        icon: EditOutlined,
        color: "var(--color-primary)",
        bg: "var(--color-primary-tint)",
    },
    {
        key: PRESET_MENU_KEY.DELETE,
        label: MOBILE_TEMPLATE_MENU.DELETE,
        icon: DeleteOutlined,
        color: "var(--color-error)",
        bg: "var(--color-error-tint)",
        haptic: "warning",
    },
];

interface MobilePresetSheetProps {
    open: boolean;
    onClose: () => void;
    /** 작업만 추가 */
    onAddRecord: (template_id: string) => void;
    /** 작업 추가 후 타이머 시작 */
    onStartRecord: (template_id: string) => void;
}

export function MobilePresetSheet({
    open,
    onClose,
    onAddRecord,
    onStartRecord,
}: MobilePresetSheetProps) {
    const {
        templates,
        records,
        getAutoCompleteOptions,
        getProjectCodeOptions,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        addCustomTaskOption,
        addCustomCategoryOption,
        hideAutoCompleteOption,
    } = useWorkStore(
        useShallow((s) => ({
            templates: s.templates,
            records: s.records,
            getAutoCompleteOptions: s.getAutoCompleteOptions,
            getProjectCodeOptions: s.getProjectCodeOptions,
            custom_task_options: s.custom_task_options,
            custom_category_options: s.custom_category_options,
            hidden_autocomplete_options: s.hidden_autocomplete_options,
            addCustomTaskOption: s.addCustomTaskOption,
            addCustomCategoryOption: s.addCustomCategoryOption,
            hideAutoCompleteOption: s.hideAutoCompleteOption,
        }))
    );

    const {
        is_modal_open,
        is_edit_mode,
        editing_template,
        form,
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    } = useTemplateActions();

    const [search_query, setSearchQuery] = useState("");
    const [menu_template, setMenuTemplate] = useState<WorkTemplate | null>(null);
    const [menu_anchor, setMenuAnchor] = useState<DOMRect | null>(null);

    const visible_templates = useMemo(
        () => filterTemplates(templates, search_query),
        [templates, search_query]
    );

    const handleLongPress = useCallback(
        (template: WorkTemplate, anchor_rect: DOMRect) => {
            setMenuTemplate(template);
            setMenuAnchor(anchor_rect);
        },
        []
    );

    const handleCloseMenu = useCallback(() => {
        setMenuTemplate(null);
        setMenuAnchor(null);
    }, []);

    const handleMenuAction = useCallback(
        (key: string) => {
            if (!menu_template) return;

            if (key === PRESET_MENU_KEY.EDIT) {
                handleOpenEditModal(menu_template);
            } else if (key === PRESET_MENU_KEY.DELETE) {
                handleDelete(menu_template.id);
            }
        },
        [menu_template, handleOpenEditModal, handleDelete]
    );

    return (
        <>
            <MobileBottomSheet
                open={open}
                onClose={onClose}
                height_ratio={SHEET_HEIGHT_RATIO}
                footer={
                    <button
                        type="button"
                        className="w-full h-12 rounded-lg border-0 bg-primary text-white text-md font-semibold cursor-pointer inline-flex items-center justify-center gap-xs"
                        onClick={handleOpenAddModal}
                    >
                        <PlusOutlined style={{ fontSize: 14 }} />
                        {BUTTON_ADD_FULL}
                    </button>
                }
            >
                <div className="px-xl pb-md flex items-center justify-between">
                    <span className="text-xl font-semibold text-text-primary">
                        {TEMPLATE_CARD_TITLE}
                    </span>
                    <span className="text-sm text-text-disabled">
                        {templates.length}
                        {MOBILE_PRESET_SHEET.COUNT_SUFFIX}
                    </span>
                </div>

                {templates.length > 0 && (
                    <div className="px-xl pb-md">
                        <div className="flex items-center gap-sm h-11 px-md rounded-lg bg-bg-grey">
                            <SearchOutlined className="text-text-disabled" />
                            <input
                                className="flex-1 border-0 bg-transparent text-md text-text-primary outline-none placeholder:text-text-disabled"
                                placeholder={
                                    MOBILE_PRESET_SHEET.SEARCH_PLACEHOLDER
                                }
                                value={search_query}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="px-lg pb-lg">
                    {templates.length === 0 ? (
                        <EmptyPresetState onAdd={handleOpenAddModal} />
                    ) : visible_templates.length === 0 ? (
                        <div className="py-xl text-center text-sm text-text-disabled">
                            {MOBILE_PRESET_SHEET.SEARCH_EMPTY}
                        </div>
                    ) : (
                        visible_templates.map((template) => (
                            <MobilePresetRow
                                key={template.id}
                                template={template}
                                onSelect={onAddRecord}
                                onStart={onStartRecord}
                                onLongPress={handleLongPress}
                            />
                        ))
                    )}
                </div>
            </MobileBottomSheet>

            <MobileActionMenu
                open={menu_template !== null}
                anchor_rect={menu_anchor}
                items={PRESET_MENU_ITEMS}
                onAction={handleMenuAction}
                onClose={handleCloseMenu}
            />

            <TemplateModal
                open={is_modal_open}
                is_edit_mode={is_edit_mode}
                editing_template={editing_template}
                form={form}
                records={records}
                templates={templates}
                getAutoCompleteOptions={getAutoCompleteOptions}
                getProjectCodeOptions={getProjectCodeOptions}
                custom_task_options={custom_task_options}
                custom_category_options={custom_category_options}
                hidden_autocomplete_options={hidden_autocomplete_options}
                addCustomTaskOption={addCustomTaskOption}
                addCustomCategoryOption={addCustomCategoryOption}
                hideAutoCompleteOption={hideAutoCompleteOption}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />
        </>
    );
}
