/**
 * Date navigation component
 * Shows "< 📅 2월 10일 화요일 >" with DatePicker trigger
 * 1-1: Slide animation on date change
 * 1-4: "오늘" badge scale bounce (no flicker)
 */

import { useRef } from "react";
import { DatePicker } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { motion, AnimatePresence } from "../../../../shared/ui/animation";

import { RECORD_UI_TEXT } from "../../constants";

interface DateNavigationProps {
    selected_date: string;
    onDateChange: (date: Dayjs | null) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
}

const DATE_FORMAT = "YYYY-MM-DD";

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
    const prev_date_ref = useRef(selected_date);
    const is_today = selected_date === dayjs().format(DATE_FORMAT);

    // Compute direction without state (no extra re-render)
    let slide_x = 20;
    if (prev_date_ref.current !== selected_date) {
        const diff = dayjs(selected_date).diff(
            dayjs(prev_date_ref.current),
            "day"
        );
        slide_x = diff > 0 ? 20 : -20;
        prev_date_ref.current = selected_date;
    }

    return (
        <div className="flex items-center gap-md">
            <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center hover:bg-bg-grey transition-colors text-text-secondary cursor-pointer"
                onClick={onPrevDay}
            >
                <LeftOutlined style={{ fontSize: 13 }} />
            </motion.button>

            <div className="relative">
                <div className="flex items-center gap-sm cursor-pointer hover:bg-bg-grey rounded-lg px-md py-sm transition-colors">
                    <CalendarOutlined
                        className="text-primary"
                        style={{ fontSize: 16 }}
                    />
                    {/* 1-1: Sliding date text */}
                    <div className="overflow-hidden relative h-7 flex items-center">
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
                                className="text-lg font-semibold text-text-primary whitespace-nowrap"
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
                    allowClear={false}
                    className="!absolute !inset-0 !opacity-0 !cursor-pointer"
                    suffixIcon={null}
                />
            </div>

            <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center hover:bg-bg-grey transition-colors text-text-secondary cursor-pointer"
                onClick={onNextDay}
            >
                <RightOutlined style={{ fontSize: 13 }} />
            </motion.button>

            {/* 1-4: "오늘" badge — simple fade only, no AnimatePresence flicker */}
            <motion.span
                animate={{
                    opacity: is_today ? 1 : 0,
                    scale: is_today ? 1 : 0.8,
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
                className="text-xs text-primary font-medium bg-primary-light px-sm py-xs rounded-sm"
                style={{
                    pointerEvents: is_today ? "auto" : "none",
                }}
            >
                {RECORD_UI_TEXT.TODAY_TEXT}
            </motion.span>
        </div>
    );
}
