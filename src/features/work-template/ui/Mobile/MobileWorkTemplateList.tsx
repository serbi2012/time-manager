/**
 * Mobile Work Template List (Toss-style with animations)
 * Long-press on template card shows quick menu (start timer / edit / delete)
 */

import { useState, useCallback, useRef } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import {
    PlayCircleOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { SPRING, STAGGER } from "@/shared/ui/animation";
import { useShallow } from "zustand/react/shallow";
import { useWorkStore } from "@/store/useWorkStore";
import { useLongPress } from "@/shared/hooks";
import {
    MobileActionMenu,
    type MobileActionMenuItem,
} from "@/shared/ui";
import {
    TemplateModal,
    SortableTemplateCard,
} from "@/features/work-template/ui";
import {
    useTemplateActions,
    useTemplateDnd,
} from "@/features/work-template/hooks";
import {
    TEMPLATE_CARD_TITLE,
    MOBILE_TEMPLATE_MENU,
} from "@/features/work-template/constants";
import { EmptyPresetState } from "../EmptyPresetState";
import { AddPresetButton } from "../AddPresetButton";
import type { WorkTemplate } from "@/shared/types";

interface MobileWorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

const CARD_VARIANTS = {
    initial: { opacity: 0, y: 12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } },
};

const TEMPLATE_MENU_ITEMS: MobileActionMenuItem[] = [
    {
        key: "start_timer",
        label: MOBILE_TEMPLATE_MENU.START_TIMER,
        icon: PlayCircleOutlined,
        color: "var(--color-success)",
        bg: "rgba(52,199,89,0.08)",
        haptic_ms: 10,
    },
    {
        key: "edit",
        label: MOBILE_TEMPLATE_MENU.EDIT,
        icon: EditOutlined,
        color: "var(--color-primary)",
        bg: "rgba(49,130,246,0.08)",
    },
    {
        key: "delete",
        label: MOBILE_TEMPLATE_MENU.DELETE,
        icon: DeleteOutlined,
        color: "var(--color-error)",
        bg: "rgba(240,68,82,0.08)",
        haptic_ms: 15,
    },
];

export function MobileWorkTemplateList({
    onAddRecordOnly,
}: MobileWorkTemplateListProps) {
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

    const { sensors, handleDragEnd } = useTemplateDnd();

    const [menu_open, setMenuOpen] = useState(false);
    const [menu_anchor, setMenuAnchor] = useState<DOMRect | null>(null);
    const [menu_template, setMenuTemplate] = useState<WorkTemplate | null>(null);

    const handleTemplateLongPress = useCallback(
        (template: WorkTemplate, anchor_rect: DOMRect) => {
            setMenuTemplate(template);
            setMenuAnchor(anchor_rect);
            setMenuOpen(true);
        },
        []
    );

    const handleMenuAction = useCallback(
        (key: string) => {
            if (!menu_template) return;
            if (key === "start_timer") {
                if (onAddRecordOnly) {
                    onAddRecordOnly(menu_template.id);
                }
            } else if (key === "edit") {
                handleOpenEditModal(menu_template);
            } else if (key === "delete") {
                handleDelete(menu_template.id);
            }
        },
        [menu_template, onAddRecordOnly, handleOpenEditModal, handleDelete]
    );

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col gap-md px-lg pt-lg pb-sm">
                    <h3 className="text-lg font-semibold text-text-primary m-0">
                        {TEMPLATE_CARD_TITLE}
                    </h3>

                    <AddPresetButton onClick={handleOpenAddModal} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-lg pt-[2px] pb-lg">
                    <AnimatePresence mode="wait">
                        {templates.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={SPRING.gentle}
                            >
                                <EmptyPresetState onAdd={handleOpenAddModal} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={templates.map((t) => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-sm">
                                            <AnimatePresence mode="popLayout">
                                                {templates.map(
                                                    (template, index) => (
                                                        <MobileTemplateCardWrapper
                                                            key={template.id}
                                                            template={template}
                                                            index={index}
                                                            onEdit={handleOpenEditModal}
                                                            onDelete={handleDelete}
                                                            onAddRecordOnly={onAddRecordOnly}
                                                            onLongPress={handleTemplateLongPress}
                                                        />
                                                    )
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

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

            <MobileActionMenu
                open={menu_open}
                anchor_rect={menu_anchor}
                items={TEMPLATE_MENU_ITEMS}
                onAction={handleMenuAction}
                onClose={() => setMenuOpen(false)}
            />
        </>
    );
}

interface MobileTemplateCardWrapperProps {
    template: WorkTemplate;
    index: number;
    onEdit: (template: WorkTemplate) => void;
    onDelete: (id: string) => void;
    onAddRecordOnly?: (template_id: string) => void;
    onLongPress: (template: WorkTemplate, anchor_rect: DOMRect) => void;
}

function MobileTemplateCardWrapper({
    template,
    index,
    onEdit,
    onDelete,
    onAddRecordOnly,
    onLongPress,
}: MobileTemplateCardWrapperProps) {
    const wrapper_ref = useRef<HTMLDivElement>(null);

    const handleLongPress = useCallback(() => {
        const rect = wrapper_ref.current?.getBoundingClientRect();
        if (rect) onLongPress(template, rect);
    }, [template, onLongPress]);

    const { is_pressing, handlers } = useLongPress({
        onLongPress: handleLongPress,
    });

    return (
        <motion.div
            ref={wrapper_ref}
            variants={CARD_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                ...SPRING.toss,
                delay: index * (STAGGER.normal / 1000),
            }}
            style={{
                scale: is_pressing ? 0.97 : 1,
                transition: "scale 0.15s ease",
            }}
            {...handlers}
        >
            <SortableTemplateCard
                template={template}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddRecordOnly={onAddRecordOnly}
            />
        </motion.div>
    );
}
