import { useState, useCallback } from "react";
import { ColorPicker as AntColorPicker } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { SPRING } from "@/shared/ui/animation";
import { TEMPLATE_COLORS } from "@/shared/config";

const CUSTOM_COLOR_LABEL = "직접 선택";
const BOUNCE_DURATION = 400;

const CHECK_VARIANTS = {
    initial: { scale: 0, rotate: -90, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0, rotate: 90, opacity: 0 },
};

interface PresetColorGridProps {
    value?: string;
    onChange?: (color: string) => void;
}

export function PresetColorGrid({ value, onChange }: PresetColorGridProps) {
    const selected = value || TEMPLATE_COLORS[0];
    const is_custom = !TEMPLATE_COLORS.includes(selected);
    const [bouncing_color, setBouncingColor] = useState<string | null>(null);

    const handleSelect = useCallback(
        (color: string) => {
            onChange?.(color);
            setBouncingColor(color);
            setTimeout(() => setBouncingColor(null), BOUNCE_DURATION);
        },
        [onChange]
    );

    return (
        <div className="flex flex-col gap-md">
            {/* Preset colors */}
            <div className="flex flex-wrap gap-sm">
                {TEMPLATE_COLORS.map((color) => {
                    const is_selected = selected === color;
                    const is_bouncing = bouncing_color === color;

                    return (
                        <motion.button
                            key={color}
                            type="button"
                            onClick={() => handleSelect(color)}
                            animate={
                                is_bouncing
                                    ? { scale: [1, 1.2, 0.95, 1] }
                                    : { scale: 1 }
                            }
                            transition={{
                                duration: 0.4,
                                ease: [0.32, 0.72, 0, 1],
                            }}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 cursor-pointer",
                                "flex items-center justify-center",
                                "transition-[border-color,box-shadow] duration-200",
                                "hover:scale-110",
                                "active:scale-95",
                                is_selected
                                    ? "border-gray-800 shadow-sm"
                                    : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                        >
                            <AnimatePresence mode="wait">
                                {is_selected && (
                                    <motion.span
                                        key="check"
                                        className="inline-flex"
                                        variants={CHECK_VARIANTS}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={SPRING.bouncy}
                                    >
                                        <CheckOutlined className="!text-white !text-xs" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {/* Custom color picker */}
            <div className="flex items-center gap-sm">
                <AntColorPicker
                    value={selected}
                    onChange={(color) => onChange?.(color.toHexString())}
                    size="small"
                    showText={() => (
                        <span className="text-xs text-text-secondary">
                            {CUSTOM_COLOR_LABEL}
                        </span>
                    )}
                    presets={[{ label: "프리셋", colors: TEMPLATE_COLORS }]}
                />
                {is_custom && (
                    <span className="text-xs text-text-secondary">
                        {selected}
                    </span>
                )}
            </div>
        </div>
    );
}
