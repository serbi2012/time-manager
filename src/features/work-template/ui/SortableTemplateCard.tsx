import { useRef, useState, useEffect, useCallback } from "react";
import { Tooltip } from "antd";
import { PlusOutlined, HolderOutlined, CheckOutlined } from "@ant-design/icons";
import { useSortable, type AnimateLayoutChanges } from "@dnd-kit/sortable";
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

        const checkOverflow = () => {
            setIsOverflowing(
                el.scrollWidth > el.clientWidth ||
                    el.scrollHeight > el.clientHeight
            );
        };

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(el);

        return () => observer.disconnect();
    }, [ref]);

    return is_overflowing;
}

const ADD_FEEDBACK_DURATION = 600;

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting }) => isSorting;

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
    } = useSortable({ id: template.id, animateLayoutChanges });

    const work_name_ref = useRef<HTMLSpanElement>(null);
    const deal_name_ref = useRef<HTMLSpanElement>(null);
    const meta_ref = useRef<HTMLSpanElement>(null);
    const [show_check, setShowCheck] = useState(false);

    const work_name_overflowing = useIsOverflowing(work_name_ref);
    const deal_name_overflowing = useIsOverflowing(deal_name_ref);
    const meta_overflowing = useIsOverflowing(meta_ref);

    const drag_transform = transform ? CSS.Transform.toString(transform) : null;

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
    const title_ref = has_deal ? deal_name_ref : work_name_ref;
    const title_overflowing = has_deal
        ? deal_name_overflowing
        : work_name_overflowing;

    const title_element = (
        <span
            ref={title_ref}
            className="text-sm font-semibold text-text-primary block truncate leading-snug"
        >
            {title_text}
        </span>
    );

    const work_tag_element = has_deal ? (
        <div className="flex items-center mt-[3px] min-w-0">
            <span
                ref={work_name_ref}
                className="text-[10px] font-medium rounded-xs px-[5px] py-[1px] truncate max-w-full leading-[16px]"
                style={{
                    background: `${template.color}14`,
                    color: template.color,
                }}
            >
                {template.work_name}
            </span>
        </div>
    ) : null;

    const meta_element = meta ? (
        <span
            ref={meta_ref}
            className="text-xs text-text-disabled block truncate mt-[3px]"
        >
            {meta}
        </span>
    ) : null;

    return (
        <div
            ref={setNodeRef}
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
                    "transition-opacity duration-200"
                )}
                {...attributes}
                {...listeners}
            >
                <HolderOutlined className="text-xs" />
            </div>

            {/* Content */}
            <div className="flex-1 py-lg pl-sm pr-0 min-w-0">
                {title_overflowing ? (
                    <Tooltip title={title_text}>{title_element}</Tooltip>
                ) : (
                    title_element
                )}

                {work_tag_element &&
                    (work_name_overflowing ? (
                        <Tooltip title={template.work_name}>
                            {work_tag_element}
                        </Tooltip>
                    ) : (
                        work_tag_element
                    ))}

                {meta_element &&
                    (meta_overflowing ? (
                        <Tooltip title={meta}>{meta_element}</Tooltip>
                    ) : (
                        meta_element
                    ))}
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
    );
}
