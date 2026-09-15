import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CaretRightFilled } from "@ant-design/icons";

import { cn } from "@/shared/lib/cn";
import { SPRING } from "@/shared/ui/animation";
import { MobileIconButton } from "@/shared/ui";
import { useLongPress } from "@/shared/hooks";
import type { WorkTemplate } from "@/shared/types";

import { MOBILE_PRESET_SHEET } from "../../constants";

interface MobilePresetRowProps {
    template: WorkTemplate;
    /** 행 전체를 탭 — 작업만 추가 */
    onSelect: (template_id: string) => void;
    /** 우측 버튼 — 작업 추가 + 타이머 시작 */
    onStart: (template_id: string) => void;
    /** 길게 누르기 — 수정/삭제 메뉴 */
    onLongPress: (template: WorkTemplate, anchor_rect: DOMRect) => void;
}

export function MobilePresetRow({
    template,
    onSelect,
    onStart,
    onLongPress,
}: MobilePresetRowProps) {
    const row_ref = useRef<HTMLDivElement>(null);

    const handleLongPress = useCallback(() => {
        const rect = row_ref.current?.getBoundingClientRect();
        if (rect) onLongPress(template, rect);
    }, [template, onLongPress]);

    const { is_pressing, handlers } = useLongPress({
        onLongPress: handleLongPress,
    });

    const title = template.deal_name || template.work_name;
    const sub_info = [
        template.deal_name ? template.work_name : template.task_name,
        template.category_name,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <motion.div
            ref={row_ref}
            className={cn(
                "flex items-center gap-md px-sm rounded-lg",
                "cursor-pointer select-none"
            )}
            animate={{
                scale: is_pressing ? 0.98 : 1,
                backgroundColor: is_pressing
                    ? "var(--color-bg-grey)"
                    : "rgba(255,255,255,0)",
            }}
            transition={
                is_pressing ? SPRING.droplet_press : SPRING.droplet_release
            }
            onClick={() => onSelect(template.id)}
            {...handlers}
        >
            <div
                className="w-1 h-8 rounded-full shrink-0"
                style={{ background: template.color }}
            />

            <div className="flex-1 min-w-0 py-sm">
                <div className="text-md font-medium text-text-primary truncate">
                    {title}
                </div>
                {sub_info && (
                    <div className="text-sm text-text-disabled truncate mt-[1px]">
                        {sub_info}
                    </div>
                )}
            </div>

            <MobileIconButton
                label={MOBILE_PRESET_SHEET.START_LABEL}
                className="bg-success/10 text-success shrink-0"
                onClick={(event) => {
                    event.stopPropagation();
                    onStart(template.id);
                }}
            >
                <CaretRightFilled style={{ fontSize: 15 }} />
            </MobileIconButton>
        </motion.div>
    );
}
