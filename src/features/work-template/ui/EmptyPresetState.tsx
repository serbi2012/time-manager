import { FolderOpenOutlined, PlusOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import {
    EMPTY_TITLE,
    EMPTY_DESCRIPTION,
    EMPTY_CTA,
} from "@/features/work-template/constants";

const FLOAT_ANIMATION = {
    y: [0, -6, 0],
};

const FLOAT_TRANSITION = {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut" as const,
};

interface EmptyPresetStateProps {
    onAdd: () => void;
    className?: string;
}

export function EmptyPresetState({ onAdd, className }: EmptyPresetStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-section gap-md",
                className
            )}
        >
            <motion.div
                className="flex items-center justify-center w-12 h-12 rounded-full bg-bg-grey"
                animate={FLOAT_ANIMATION}
                transition={FLOAT_TRANSITION}
            >
                <FolderOpenOutlined className="text-xl text-text-hint" />
            </motion.div>

            <div className="flex flex-col items-center gap-xs">
                <span className="text-md font-semibold text-text-primary">
                    {EMPTY_TITLE}
                </span>
                <span className="text-sm text-text-secondary">
                    {EMPTY_DESCRIPTION}
                </span>
            </div>

            <button
                type="button"
                onClick={onAdd}
                className={cn(
                    "inline-flex items-center gap-xs",
                    "px-lg py-sm rounded-md",
                    "text-sm font-semibold text-primary",
                    "bg-primary/5 border-none cursor-pointer",
                    "hover:bg-primary/10 transition-colors duration-200",
                    "active:scale-[0.97]"
                )}
            >
                <PlusOutlined className="text-xs" />
                {EMPTY_CTA}
            </button>
        </div>
    );
}
