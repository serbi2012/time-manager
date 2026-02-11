/**
 * Mobile weekly calendar strip — matches desktop WeeklyCalendarStrip style
 * Animation E: Pop scale on day selection
 */

import { useMemo, useState } from "react";
import dayjs from "dayjs";

import type { WorkRecord } from "../../../../shared/types";
import { cn } from "../../../../shared/lib/cn";
import { DATE_FORMAT } from "../../constants";

interface MobileCalendarStripProps {
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

export function MobileCalendarStrip({
    selected_date,
    onDateSelect,
    records,
}: MobileCalendarStripProps) {
    const days = useMemo(
        () => getWeekDays(selected_date, records),
        [selected_date, records]
    );

    const [pop_key, setPopKey] = useState(0);

    const handleSelect = (date_str: string) => {
        setPopKey((k) => k + 1);
        onDateSelect(date_str);
    };

    return (
        <div className="px-xl py-md flex justify-between">
            {days.map((d) => {
                const is_selected = d.date_str === selected_date;
                return (
                    <button
                        key={d.key}
                        className="flex flex-col items-center gap-[6px] cursor-pointer border-0 bg-transparent p-0"
                        onClick={() => handleSelect(d.date_str)}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        <span
                            className={cn(
                                "text-xs font-medium",
                                is_selected
                                    ? "text-primary font-semibold"
                                    : "text-gray-400"
                            )}
                        >
                            {d.day_label}
                        </span>
                        <div
                            className={cn(
                                "w-[40px] h-[40px] rounded-xl flex items-center justify-center text-md font-medium transition-all relative",
                                is_selected
                                    ? "bg-primary text-white shadow-[0_2px_8px_rgba(49,130,246,0.3)]"
                                    : d.is_weekend
                                    ? "text-text-disabled"
                                    : "text-gray-700"
                            )}
                        >
                            <span
                                className={cn(
                                    is_selected && "mobile-calendar-pop"
                                )}
                                key={
                                    is_selected
                                        ? `pop-${pop_key}`
                                        : `static-${d.key}`
                                }
                            >
                                {d.date_num}
                            </span>
                            {d.is_today && !is_selected && (
                                <span className="absolute -bottom-[3px] w-[5px] h-[5px] rounded-full bg-primary" />
                            )}
                            {d.has_records && !is_selected && !d.is_today && (
                                <span className="absolute -bottom-[3px] w-[5px] h-[5px] rounded-full bg-gray-300" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
