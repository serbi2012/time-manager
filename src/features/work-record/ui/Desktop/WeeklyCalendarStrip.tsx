/**
 * Weekly calendar strip component
 * Shows 7 day buttons (Mon-Sun) for current week without arrows
 * 1-2: Selection indicator layout animation
 */

import { useMemo } from "react";
import dayjs from "dayjs";
import { motion } from "../../../../shared/ui/animation";

import type { WorkRecord } from "../../../../shared/types";
import { cn } from "../../../../shared/lib/cn";
import { DATE_FORMAT } from "../../constants";

interface WeeklyCalendarStripProps {
    selected_date: string;
    onDateSelect: (date: string) => void;
    records: WorkRecord[];
}

interface DayInfo {
    key: string;
    day_label: string;
    date_num: number;
    date_str: string;
    is_today: boolean;
    is_weekend: boolean;
    has_records: boolean;
}

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function getWeekDays(selected_date: string, records: WorkRecord[]): DayInfo[] {
    const selected = dayjs(selected_date);
    const day_of_week = selected.day();
    const monday_offset = day_of_week === 0 ? -6 : 1 - day_of_week;
    const monday = selected.add(monday_offset, "day");
    const today_str = dayjs().format(DATE_FORMAT);

    const record_dates = new Set<string>();
    for (const r of records) {
        if (!r.is_deleted) {
            record_dates.add(r.date);
            if (r.sessions) {
                for (const s of r.sessions) {
                    if (s.date) record_dates.add(s.date);
                }
            }
        }
    }

    return Array.from({ length: 7 }, (_, i) => {
        const d = monday.add(i, "day");
        const date_str = d.format(DATE_FORMAT);
        return {
            key: date_str,
            day_label: WEEKDAY_LABELS[i],
            date_num: d.date(),
            date_str,
            is_today: date_str === today_str,
            is_weekend: i >= 5,
            has_records: record_dates.has(date_str),
        };
    });
}

export function WeeklyCalendarStrip({
    selected_date,
    onDateSelect,
    records,
}: WeeklyCalendarStripProps) {
    const days = useMemo(
        () => getWeekDays(selected_date, records),
        [selected_date, records]
    );

    return (
        <div className="flex gap-xs justify-center">
            {days.map((d) => {
                const is_selected = d.date_str === selected_date;
                return (
                    <motion.button
                        key={d.key}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onDateSelect(d.date_str)}
                        className={cn(
                            "flex flex-col items-center py-sm px-md border-0 rounded-lg min-w-[48px] transition-colors relative cursor-pointer",
                            is_selected
                                ? "text-white"
                                : d.is_weekend
                                ? "bg-transparent text-text-disabled hover:bg-bg-grey"
                                : "bg-transparent text-text-secondary hover:bg-bg-grey"
                        )}
                    >
                        {/* 1-2: Layout-animated selection indicator */}
                        {is_selected && (
                            <motion.div
                                layoutId="weekly-calendar-selection"
                                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}
                        <span
                            className={cn(
                                "text-xs font-medium relative z-10",
                                is_selected && "text-white/80"
                            )}
                        >
                            {d.day_label}
                        </span>
                        <span className="text-md font-semibold mt-xs relative z-10">
                            {d.date_num}
                        </span>
                        {d.is_today && !is_selected && (
                            <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                        )}
                        {d.has_records && !is_selected && !d.is_today && (
                            <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gray-300" />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
