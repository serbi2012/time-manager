/**
 * Desktop Work Template List (Toss-style with animations)
 */

import { Tooltip } from "antd";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING, STAGGER } from "@/shared/ui/animation";
import { useWorkStore } from "@/store/useWorkStore";
import { useShortcutStore } from "@/store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "@/hooks/useShortcuts";
import {
    TemplateModal,
    SortableTemplateCard,
} from "@/features/work-template/ui";
import {
    useTemplateActions,
    useTemplateDnd,
} from "@/features/work-template/hooks";
import { TEMPLATE_CARD_TITLE } from "@/features/work-template/constants";
import { EmptyPresetState } from "../EmptyPresetState";
import { AddPresetButton } from "../AddPresetButton";

interface DesktopWorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

const CARD_VARIANTS = {
    initial: { opacity: 0, y: 12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } },
};

export function DesktopWorkTemplateList({
    onAddRecordOnly,
}: DesktopWorkTemplateListProps) {
    const work_store = useWorkStore();
    const { templates, records } = work_store;

    const new_preset_shortcut = useShortcutStore((state) =>
        state.shortcuts.find((s) => s.id === "new-preset")
    );
    const new_preset_keys = new_preset_shortcut?.keys || "Alt+P";

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

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col gap-md px-lg pt-lg pb-sm">
                    <h3 className="text-lg font-semibold text-text-primary m-0">
                        {TEMPLATE_CARD_TITLE}
                    </h3>

                    <Tooltip
                        title={formatShortcutKeyForPlatform(new_preset_keys)}
                    >
                        <AddPresetButton onClick={handleOpenAddModal} />
                    </Tooltip>
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
                                                        <motion.div
                                                            key={template.id}
                                                            variants={
                                                                CARD_VARIANTS
                                                            }
                                                            initial="initial"
                                                            animate="animate"
                                                            exit="exit"
                                                            transition={{
                                                                ...SPRING.toss,
                                                                delay:
                                                                    index *
                                                                    (STAGGER.normal /
                                                                        1000),
                                                            }}
                                                        >
                                                            <SortableTemplateCard
                                                                template={
                                                                    template
                                                                }
                                                                onEdit={
                                                                    handleOpenEditModal
                                                                }
                                                                onDelete={
                                                                    handleDelete
                                                                }
                                                                onAddRecordOnly={
                                                                    onAddRecordOnly
                                                                }
                                                            />
                                                        </motion.div>
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
                getAutoCompleteOptions={work_store.getAutoCompleteOptions}
                getProjectCodeOptions={work_store.getProjectCodeOptions}
                custom_task_options={work_store.custom_task_options}
                custom_category_options={work_store.custom_category_options}
                hidden_autocomplete_options={
                    work_store.hidden_autocomplete_options
                }
                addCustomTaskOption={work_store.addCustomTaskOption}
                addCustomCategoryOption={work_store.addCustomCategoryOption}
                hideAutoCompleteOption={work_store.hideAutoCompleteOption}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />
        </>
    );
}
