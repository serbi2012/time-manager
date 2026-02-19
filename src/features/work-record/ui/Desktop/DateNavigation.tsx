/**
 * Date navigation component
 * Shows "< 📅 2월 10일 화요일 >" with DatePicker trigger
 * 1-1: Slide animation on date change
 * 1-4: "오늘" badge scale bounce (no flicker)
 */

import { useRef, useState } from "react";
import { DatePicker } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { motion, AnimatePresence } from "../../../../shared/ui/animation";
import { useSpotlight } from "@/shared/hooks/useSpotlight";
import { useMagnetic } from "@/shared/hooks/useMagnetic";

import { RECORD_UI_TEXT } from "../../constants";

interface DateNavigationProps {
    selected_date: string;
    onDateChange: (date: Dayjs | null) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
}

const DATE_FORMAT = "YYYY-MM-DD";
const MAGNETIC_STRENGTH = 0.15;
const SPOTLIGHT_GLOW_STYLE: React.CSSProperties = {
    width: 100,
    height: 100,
    background:
        "radial-gradient(circle, rgba(49,130,246,0.22) 0%, rgba(49,130,246,0.06) 50%, transparent 70%)",
    transform: "translate(-50%, -50%)",
};

function formatDateLabel(date_str: string): string {
    const d = dayjs(date_str);
    const month = d.month() + 1;
    const day = d.date();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[d.day()];
    return `${month}월 ${day}일 ${weekday}요일`;
}

export function DateNavigation({
    selected_date,
    onDateChange,
    onPrevDay,
    onNextDay,
}: DateNavigationProps) {
    const picker_ref = useRef<ReturnType<typeof DatePicker> | null>(null);
    const [prev_date, setPrevDate] = useState(selected_date);
    const [picker_open, setPickerOpen] = useState(false);
    const is_today = selected_date === dayjs().format(DATE_FORMAT);

    const {
        ref: spotlight_ref,
        glow_style: spotlight_glow,
        handlers: spotlight_handlers,
    } = useSpotlight();
    const {
        ref: left_mag_ref,
        style: left_mag_style,
        handlers: left_mag_handlers,
    } = useMagnetic<HTMLDivElement>(MAGNETIC_STRENGTH);
    const {
        ref: right_mag_ref,
        style: right_mag_style,
        handlers: right_mag_handlers,
    } = useMagnetic<HTMLDivElement>(MAGNETIC_STRENGTH);

    let slide_x = 20;
    if (prev_date !== selected_date) {
        const diff = dayjs(selected_date).diff(dayjs(prev_date), "day");
        slide_x = diff > 0 ? 20 : -20;
        setPrevDate(selected_date);
    }

    return (
        <div className="flex items-center gap-sm">
            <div
                ref={left_mag_ref}
                style={left_mag_style}
                {...left_mag_handlers}
            >
                <motion.button
                    whileTap={{ scale: 0.88 }}
                    className="w-9 h-9 border-0 bg-transparent rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary/[0.08] hover:text-primary transition-all duration-200 cursor-pointer"
                    onClick={onPrevDay}
                >
                    <LeftOutlined style={{ fontSize: 14 }} />
                </motion.button>
            </div>

            <div className="relative">
                <div
                    ref={spotlight_ref}
                    className="relative overflow-hidden flex items-center gap-sm cursor-pointer rounded-xl px-lg py-sm transition-all duration-200 hover:bg-primary/[0.04] hover:shadow-sm group"
                    onClick={() => setPickerOpen((prev) => !prev)}
                    {...spotlight_handlers}
                >
                    <div
                        className="absolute pointer-events-none rounded-full transition-opacity duration-200"
                        style={{ ...SPOTLIGHT_GLOW_STYLE, ...spotlight_glow }}
                    />
                    <CalendarOutlined
                        className="text-primary relative z-[1] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[8deg] group-hover:scale-110"
                        style={{ fontSize: 16 }}
                    />
                    {/* 1-1: Sliding date text */}
                    <div className="overflow-hidden relative h-7 flex items-center z-[1]">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={selected_date}
                                initial={{ opacity: 0, x: slide_x }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -slide_x }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                }}
                                className="text-lg font-semibold text-text-primary whitespace-nowrap transition-colors group-hover:text-primary"
                            >
                                {formatDateLabel(selected_date)}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>
                <DatePicker
                    ref={picker_ref as never}
                    value={dayjs(selected_date)}
                    onChange={onDateChange}
                    open={picker_open}
                    onOpenChange={setPickerOpen}
                    allowClear={false}
                    className="!absolute !inset-0 !opacity-0 !pointer-events-none"
                    suffixIcon={null}
                />
            </div>

            <div
                ref={right_mag_ref}
                style={right_mag_style}
                {...right_mag_handlers}
            >
                <motion.button
                    whileTap={{ scale: 0.88 }}
                    className="w-9 h-9 border-0 bg-transparent rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary/[0.08] hover:text-primary transition-all duration-200 cursor-pointer"
                    onClick={onNextDay}
                >
                    <RightOutlined style={{ fontSize: 14 }} />
                </motion.button>
            </div>

            {/* 1-4: "오늘" badge */}
            <motion.span
                animate={{
                    opacity: is_today ? 1 : 0,
                    scale: is_today ? 1 : 0.8,
                }}
                whileHover={is_today ? { scale: 1.08 } : undefined}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
                className="ml-xs text-xs text-primary font-semibold bg-primary-light px-md py-xs rounded-full transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_2px_8px_rgba(49,130,246,0.25)]"
                style={{
                    pointerEvents: is_today ? "auto" : "none",
                }}
            >
                {RECORD_UI_TEXT.TODAY_TEXT}
            </motion.span>
        </div>
    );
}
