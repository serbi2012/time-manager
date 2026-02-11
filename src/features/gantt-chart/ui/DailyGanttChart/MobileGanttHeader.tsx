/**
 * Mobile gantt chart header
 * - Title + total duration badge
 * - Date navigation (prev / date text / next)
 */

import { useState } from "react";
import {
    LeftOutlined,
    RightOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDuration } from "../../../../shared/lib/time";
import { GANTT_TITLE_DAILY_TIMELINE } from "../../constants";

interface MobileGanttHeaderProps {
    selected_date: string;
    total_minutes: number;
    onPrevDay: () => void;
    onNextDay: () => void;
}

export function MobileGanttHeader({
    selected_date,
    total_minutes,
    onPrevDay,
    onNextDay,
}: MobileGanttHeaderProps) {
    const [prev_date, setPrevDate] = useState(selected_date);

    let slide_dir: "left" | "right" | null = null;
    if (prev_date !== selected_date) {
        slide_dir = selected_date > prev_date ? "right" : "left";
        setPrevDate(selected_date);
    }

    const formatted_date = `${dayjs(selected_date).format(
        "YYYY년 M월 D일"
    )} (${dayjs(selected_date).format("dd")})`;

    const date_slide_class =
        slide_dir === "left"
            ? "mobile-gantt-date-slide-left"
            : slide_dir === "right"
            ? "mobile-gantt-date-slide-right"
            : "";

    return (
        <div className="px-5 pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-gray-900">
                    {GANTT_TITLE_DAILY_TIMELINE}
                </span>
                <div className="flex items-center gap-1.5 bg-primary-light px-md py-xs rounded-full">
                    <ClockCircleOutlined
                        className="text-primary"
                        style={{ fontSize: 12 }}
                    />
                    <span
                        key={total_minutes}
                        className="text-sm font-semibold text-primary mobile-gantt-number-slide"
                    >
                        {formatDuration(total_minutes)}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-md">
                <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border-0 bg-transparent cursor-pointer transition-colors"
                    onClick={onPrevDay}
                >
                    <LeftOutlined style={{ fontSize: 12 }} />
                </button>
                <span
                    key={selected_date}
                    className={`text-sm font-medium text-gray-700 min-w-[150px] text-center ${date_slide_class}`}
                >
                    {formatted_date}
                </span>
                <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border-0 bg-transparent cursor-pointer transition-colors"
                    onClick={onNextDay}
                >
                    <RightOutlined style={{ fontSize: 12 }} />
                </button>
            </div>
        </div>
    );
}
