import { useState, useCallback } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { BUTTON_ADD_FULL } from "@/features/work-template/constants";

interface RippleData {
    id: number;
    x: number;
    y: number;
}

const RIPPLE_DURATION_MS = 600;
const RIPPLE_SIZE = 40;
const RIPPLE_COLOR = "rgba(49, 130, 246, 0.15)";

interface AddPresetButtonProps {
    onClick: () => void;
    className?: string;
}

export function AddPresetButton({ onClick, className }: AddPresetButtonProps) {
    const [ripples, setRipples] = useState<RippleData[]>([]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ripple: RippleData = {
                id: Date.now(),
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            setRipples((prev) => [...prev, ripple]);
            setTimeout(
                () =>
                    setRipples((prev) =>
                        prev.filter((r) => r.id !== ripple.id)
                    ),
                RIPPLE_DURATION_MS
            );
            onClick();
        },
        [onClick]
    );

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "relative overflow-hidden",
                "w-full inline-flex items-center justify-center gap-sm",
                "py-md rounded-xl cursor-pointer",
                "text-sm font-semibold text-text-secondary",
                "bg-bg-light border-[1.5px] border-dashed border-border-dark",
                "hover:bg-primary/5 hover:text-primary hover:border-primary",
                "active:scale-[0.97]",
                "transition-all duration-200",
                className
            )}
        >
            <PlusOutlined className="text-xs" />
            {BUTTON_ADD_FULL}

            <AnimatePresence>
                {ripples.map((r) => (
                    <motion.span
                        key={r.id}
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left: r.x - RIPPLE_SIZE / 2,
                            top: r.y - RIPPLE_SIZE / 2,
                            width: RIPPLE_SIZE,
                            height: RIPPLE_SIZE,
                            background: RIPPLE_COLOR,
                        }}
                    />
                ))}
            </AnimatePresence>
        </button>
    );
}
