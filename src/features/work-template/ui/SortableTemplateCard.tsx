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

    const work_name_ref = useRef<HTMLSpanElement>(null);
    const deal_name_ref = useRef<HTMLSpanElement>(null);
    const meta_ref = useRef<HTMLSpanElement>(null);
    const [show_check, setShowCheck] = useState(false);

    const work_name_overflowing = useIsOverflowing(work_name_ref);
    const deal_name_overflowing = useIsOverflowing(deal_name_ref);
    const meta_overflowing = useIsOverflowing(meta_ref);

    const drag_style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

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

    const work_name_element = (
        <span
            ref={work_name_ref}
            className="text-sm font-semibold text-text-primary block truncate leading-snug"
        >
            {template.work_name}
        </span>
    );

    const deal_name_element = has_deal ? (
        <div className="flex items-center mt-[3px] min-w-0">
            <span
                ref={deal_name_ref}
                className="text-[10px] font-medium rounded-xs px-[5px] py-[1px] truncate max-w-full leading-[16px]"
                style={{
                    background: `${template.color}14`,
                    color: template.color,
                }}
            >
                {template.deal_name}
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
                "transition-all duration-200",
                "hover:shadow-sm hover:-translate-y-px hover:border-border-dark",
                isDragging &&
                    "opacity-70 shadow-md scale-[1.02] z-50 border-primary/30"
            )}
        >
            {/* Left color stripe (tapered ends) */}
            <div className="flex items-center pl-[6px] self-stretch flex-shrink-0">
                <div
                    className="w-[3px] h-[60%] rounded-full"
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
                {work_name_overflowing ? (
                    <Tooltip title={template.work_name}>
                        {work_name_element}
                    </Tooltip>
                ) : (
                    work_name_element
                )}

                {deal_name_element &&
                    (deal_name_overflowing ? (
                        <Tooltip title={template.deal_name}>
                            {deal_name_element}
                        </Tooltip>
                    ) : (
                        deal_name_element
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
