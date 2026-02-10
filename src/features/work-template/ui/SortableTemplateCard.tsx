import { useRef, useState, useEffect, useCallback } from "react";
import { Tooltip } from "antd";
import { PlusOutlined, HolderOutlined, CheckOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { SPRING } from "@/shared/ui/animation";
import type { WorkTemplate } from "@/shared/types";
import { TemplateCardMenu } from "./TemplateCardMenu";
import { TOOLTIP_ADD_WORK } from "@/features/work-template/constants";

interface SortableTemplateCardProps {
    template: WorkTemplate;
    onEdit: (template: WorkTemplate) => void;
    onDelete: (id: string) => void;
    onAddRecordOnly?: (template_id: string) => void;
}

function useIsOverflowing(ref: React.RefObject<HTMLElement | null>) {
    const [is_overflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setIsOverflowing(el.scrollHeight > el.clientHeight);
    }, [ref]);

    return is_overflowing;
}

const ADD_FEEDBACK_DURATION = 600;

export function SortableTemplateCard({
    template,
    onEdit,
    onDelete,
    onAddRecordOnly,
}: SortableTemplateCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: template.id });

    const title_ref = useRef<HTMLSpanElement>(null);
    const subtitle_ref = useRef<HTMLSpanElement>(null);
    const [show_check, setShowCheck] = useState(false);

    const title_overflowing = useIsOverflowing(title_ref);
    const subtitle_overflowing = useIsOverflowing(subtitle_ref);

    const drag_style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const title = template.deal_name || template.work_name;
    const subtitle = [template.task_name, template.category_name]
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

    const title_element = (
        <span
            ref={title_ref}
            className="text-sm font-semibold text-text-primary line-clamp-2 break-words"
        >
            {title}
        </span>
    );

    const subtitle_element = subtitle ? (
        <span
            ref={subtitle_ref}
            className="text-xs text-text-secondary block truncate mt-px"
        >
            {subtitle}
        </span>
    ) : null;

    return (
        <div
            ref={setNodeRef}
            style={drag_style}
            className={cn(
                "group relative flex items-center",
                "bg-white rounded-xl shadow-xs overflow-hidden",
                "border border-border-light",
                "transition-all duration-200",
                "hover:shadow-sm hover:-translate-y-px hover:border-border-default",
                isDragging &&
                    "opacity-70 shadow-md scale-[1.02] z-50 border-primary/30"
            )}
        >
            {/* Left color stripe */}
            <div className="flex items-center pl-[6px] self-stretch flex-shrink-0">
                <div
                    className="w-[3px] h-[60%] rounded-full"
                    style={{
                        background: `linear-gradient(to bottom, ${template.color}, ${template.color}88)`,
                    }}
                />
            </div>

            {/* Drag handle */}
            <div
                className={cn(
                    "flex items-center justify-center",
                    "pl-sm pr-0 self-stretch cursor-grab",
                    "text-text-hint",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-200"
                )}
                {...attributes}
                {...listeners}
            >
                <HolderOutlined className="text-xs" />
            </div>

            {/* Content */}
            <div className="flex-1 py-md pl-sm pr-0 min-w-0">
                {title_overflowing ? (
                    <Tooltip title={title}>{title_element}</Tooltip>
                ) : (
                    title_element
                )}

                {subtitle_element &&
                    (subtitle_overflowing ? (
                        <Tooltip title={subtitle}>{subtitle_element}</Tooltip>
                    ) : (
                        subtitle_element
                    ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-xs pr-md flex-shrink-0">
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
                                "w-6 h-6 rounded-full border-none cursor-pointer",
                                "transition-colors duration-150",
                                show_check
                                    ? "bg-success/15 text-success"
                                    : "bg-primary/8 text-primary hover:bg-primary/15"
                            )}
                        >
                            {show_check ? (
                                <motion.span
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={SPRING.bouncy}
                                >
                                    <CheckOutlined className="!text-[10px]" />
                                </motion.span>
                            ) : (
                                <PlusOutlined className="!text-[10px]" />
                            )}
                        </motion.button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
}
