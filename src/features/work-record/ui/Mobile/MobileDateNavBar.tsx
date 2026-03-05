/**
 * Mobile date navigation bar — "< 2월 11일 수요일 >"
 * Allows navigating day-by-day with left/right arrows
 * Slide transition on date change, press effect on arrow buttons
 */

import { useState, useCallback } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import dayjs from "dayjs";

import { SPRING } from "@/shared/ui/animation/config/easing";
import { DATE_FORMAT } from "../../constants";

interface MobileDateNavBarProps {
    selected_date: string;
    onDateChange: (date: string) => void;
}

const DATE_NAV_DISPLAY_FORMAT = "M월 D일 dddd";
const SLIDE_OFFSET = 30;

const date_slide_variants: Variants = {
    initial: (direction: number) => ({
        x: direction * SLIDE_OFFSET,
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction * -SLIDE_OFFSET,
        opacity: 0,
    }),
};

export function MobileDateNavBar({
    selected_date,
    onDateChange,
}: MobileDateNavBarProps) {
    const formatted = dayjs(selected_date).format(DATE_NAV_DISPLAY_FORMAT);
    const [direction, setDirection] = useState(1);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        const prev = dayjs(selected_date)
            .subtract(1, "day")
            .format(DATE_FORMAT);
        onDateChange(prev);
    }, [selected_date, onDateChange]);

    const handleNext = useCallback(() => {
        setDirection(1);
        const next = dayjs(selected_date).add(1, "day").format(DATE_FORMAT);
        onDateChange(next);
    }, [selected_date, onDateChange]);

    return (
        <div className="flex items-center justify-between px-xl py-lg">
            <motion.button
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 bg-transparent text-gray-400 cursor-pointer"
                onClick={handlePrev}
                whileTap={{
                    scale: 0.88,
                    x: -3,
                    backgroundColor: "rgba(0,0,0,0.06)",
                    color: "var(--gray-700)",
                }}
                transition={SPRING.snappy}
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <LeftOutlined style={{ fontSize: 16 }} />
            </motion.button>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={direction}
                >
                    <motion.span
                        key={selected_date}
                        className="text-lg font-semibold text-gray-800"
                        custom={direction}
                        variants={date_slide_variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={SPRING.light}
                    >
                        {formatted}
                    </motion.span>
                </AnimatePresence>
            </div>

            <motion.button
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 bg-transparent text-gray-400 cursor-pointer"
                onClick={handleNext}
                whileTap={{
                    scale: 0.88,
                    x: 3,
                    backgroundColor: "rgba(0,0,0,0.06)",
                    color: "var(--gray-700)",
                }}
                transition={SPRING.snappy}
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <RightOutlined style={{ fontSize: 16 }} />
            </motion.button>
        </div>
    );
}
