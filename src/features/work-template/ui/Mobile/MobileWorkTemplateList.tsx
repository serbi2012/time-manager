/**
 * Mobile Work Template List (Toss-style with animations)
 */

import { PlusOutlined } from "@ant-design/icons";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { SPRING, STAGGER } from "@/shared/ui/animation";
import { useWorkStore } from "@/store/useWorkStore";
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
    BUTTON_ADD,
} from "@/features/work-template/constants";
import { EmptyPresetState } from "../EmptyPresetState";

interface MobileWorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

const CARD_VARIANTS = {
    initial: { opacity: 0, y: 12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } },
};

export function MobileWorkTemplateList({
    onAddRecordOnly,
}: MobileWorkTemplateListProps) {
    const work_store = useWorkStore();
    const { templates, records } = work_store;

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
                <div className="flex items-center justify-between px-lg py-md">
                    <h3 className="text-md font-semibold text-text-primary m-0">
                        {TEMPLATE_CARD_TITLE}
                    </h3>

                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className={cn(
                            "inline-flex items-center gap-xs",
                            "border-none cursor-pointer bg-transparent",
                            "text-sm font-medium text-primary",
                            "hover:text-primary-dark",
                            "active:scale-95",
                            "transition-all duration-150"
                        )}
                    >
                        <PlusOutlined className="text-xs" />
                        {BUTTON_ADD}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-lg pb-lg">
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
                                                            layout
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
                                                                    (STAGGER.fast /
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
