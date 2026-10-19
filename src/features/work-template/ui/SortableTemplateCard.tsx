import { useState, useCallback } from "react";
import { Tooltip } from "antd";
import { PlusOutlined, HolderOutlined, CheckOutlined } from "@ant-design/icons";
import { useSortable, type AnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { SPRING } from "@/shared/ui/animation";
import { useMousePosition } from "@/shared/hooks/useMousePosition";
import { useHoverIntent } from "@/shared/hooks/useHoverIntent";
import { useWorkStore } from "@/store/useWorkStore";
import { HighlightText } from "@/shared/ui/HighlightText";
import type { WorkTemplate } from "@/shared/types";
import { TemplateCardMenu } from "./TemplateCardMenu";
import { TemplateDetailTooltip } from "./TemplateDetailTooltip";
import {
    TOOLTIP_ADD_WORK,
    DESKTOP_PRESET_LIST,
} from "@/features/work-template/constants";

interface SortableTemplateCardProps {
    template: WorkTemplate;
    onEdit: (template: WorkTemplate) => void;
    onDelete: (id: string) => void;
    onAddRecordOnly?: (template_id: string) => void;
    search_query?: string;
    drag_disabled?: boolean;
}

const ADD_FEEDBACK_DURATION = 600;

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting }) => isSorting;

export function SortableTemplateCard({
    template,
    onEdit,
    onDelete,
    onAddRecordOnly,
    search_query = "",
    drag_disabled = false,
}: SortableTemplateCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: template.id,
        animateLayoutChanges,
        disabled: drag_disabled,
    });

    const {
        ref: spotlight_ref,
        pos: spotlight_pos,
        handlers: spotlight_handlers,
    } = useMousePosition();
    const animation_enabled = useWorkStore((s) => s.cursor_tracking_enabled);

    const [show_check, setShowCheck] = useState(false);
    const {
        is_hovering: is_detail_hovering,
        hover_handlers: detail_hover_handlers,
    } = useHoverIntent(DESKTOP_PRESET_LIST.DETAIL_TOOLTIP_DELAY_MS);

    const drag_transform = transform ? CSS.Translate.toString(transform) : null;

    const drag_style: React.CSSProperties = drag_transform
        ? {
              transform: isDragging
                  ? `${drag_transform} scale(1.02) rotate(1deg)`
                  : drag_transform,
              transition,
          }
        : {};

    const has_deal = !!template.deal_name;
    const meta = [template.task_name, template.category_name]
        .filter(Boolean)
        .join(" · ");

    const handleAddRecord = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!onAddRecordOnly) return;
            onAddRecordOnly(template.id);
            setShowCheck(true);
            setTimeout(() => setShowCheck(false), ADD_FEEDBACK_DURATION);
        },
        [onAddRecordOnly, template.id]
    );

    const title_text = has_deal ? template.deal_name : template.work_name;

    return (
        <Tooltip
            title={<TemplateDetailTooltip template={template} />}
            placement="right"
            open={is_detail_hovering && !isDragging}
        >
            <div
                ref={(node) => {
                    setNodeRef(node);
                    spotlight_ref(node);
                }}
                {...spotlight_handlers}
                style={drag_style}
                className={cn(
                    "group relative flex items-center",
                    "bg-white rounded-xl overflow-hidden",
                    "border border-border-default",
                    "shadow-xs",
                    "transition-[box-shadow,border-color,translate] duration-200",
                    !isDragging &&
                        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] hover:border-border-dark",
                    isDragging && "shadow-lg z-50 border-primary/30"
                )}
            >
                {animation_enabled && spotlight_pos.inside && !isDragging && (
                    <div
                        className="pointer-events-none absolute inset-0 z-[1] rounded-xl"
                        style={{
                            background: `radial-gradient(250px circle at ${spotlight_pos.x}px ${spotlight_pos.y}px, rgba(49, 130, 246, 0.05), transparent 60%)`,
                        }}
                    />
                )}
                {/* Left color stripe (tapered ends) */}
                <div className="flex items-center pl-[6px] self-stretch flex-shrink-0">
                    <div
                        className="w-[3px] h-[60%] rounded-full transition-all duration-200 ease-out group-hover:w-[5px]"
                        style={{ background: template.color }}
                    />
                </div>

                {/* Drag handle */}
                <div
                    className={cn(
                        "flex items-center justify-center",
                        "pl-sm pr-0 self-stretch cursor-grab",
                        "text-text-hint",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-200",
                        drag_disabled && "invisible"
                    )}
                    {...attributes}
                    {...listeners}
                >
                    <HolderOutlined className="text-xs" />
                </div>

                {/* Content */}
                <div
                    className="flex-1 py-lg pl-sm pr-0 min-w-0"
                    {...detail_hover_handlers}
                >
                    <span className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 break-words">
                        <HighlightText text={title_text} search={search_query} />
                    </span>

                    {has_deal && (
                        <div className="flex items-center mt-[3px] min-w-0">
                            <span
                                className="text-xs font-medium rounded-xs px-[5px] py-[1px] truncate max-w-full leading-[16px]"
                                style={{
                                    background: `${template.color}14`,
                                    color: template.color,
                                }}
                            >
                                <HighlightText
                                    text={template.work_name}
                                    search={search_query}
                                />
                            </span>
                        </div>
                    )}

                    {meta && (
                        <span className="text-xs text-text-disabled block truncate mt-[3px]">
                            <HighlightText text={meta} search={search_query} />
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-sm pr-md flex-shrink-0">
                    <TemplateCardMenu
                        onEdit={() => onEdit(template)}
                        onDelete={() => onDelete(template.id)}
                        className="opacity-0 group-hover:opacity-100"
                    />

                    {onAddRecordOnly && (
                        <Tooltip title={TOOLTIP_ADD_WORK}>
                            <motion.button
                                type="button"
                                onClick={handleAddRecord}
                                whileTap={{ scale: 0.85 }}
                                transition={SPRING.snappy}
                                className={cn(
                                    "flex items-center justify-center",
                                    "w-[34px] h-[34px] rounded-full border-none cursor-pointer",
                                    "transition-all duration-200",
                                    show_check
                                        ? "bg-success/12 text-success"
                                        : "bg-primary/6 text-primary hover:bg-primary/12"
                                )}
                            >
                                {show_check ? (
                                    <motion.span
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={SPRING.bouncy}
                                    >
                                        <CheckOutlined className="text-sm" />
                                    </motion.span>
                                ) : (
                                    <PlusOutlined className="text-sm" />
                                )}
                            </motion.button>
                        </Tooltip>
                    )}
                </div>
            </div>
        </Tooltip>
    );
}
