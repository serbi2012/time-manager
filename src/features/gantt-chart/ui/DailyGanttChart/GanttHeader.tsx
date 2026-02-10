/**
 * Gantt chart header with date navigation and total duration badge
 * - A: Date text slides left/right on navigation
 * - B: Duration number slides up on change
 */

import { useState } from "react";
import {
    LeftOutlined,
    RightOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDuration } from "../../../../shared/lib/time";
import {
    GANTT_TITLE_DAILY_TIMELINE,
    GANTT_HINT_DRAG_TO_ADD,
} from "../../constants";

interface GanttHeaderProps {
    selected_date: string;
    total_minutes: number;
    onPrevDay: () => void;
    onNextDay: () => void;
}

export function GanttHeader({
    selected_date,
    total_minutes,
    onPrevDay,
    onNextDay,
}: GanttHeaderProps) {
    const [prev_date, setPrevDate] = useState(selected_date);

    let slide_dir: "left" | "right" | null = null;
    if (prev_date !== selected_date) {
        slide_dir = selected_date > prev_date ? "right" : "left";
        setPrevDate(selected_date);
    }

    const formatted_date = `${dayjs(selected_date).format(
        "YYYY년 M월 D일"
    )} (${dayjs(selected_date).format("dd")})`;

    const date_class =
        slide_dir === "left"
            ? "gantt-date-slide-left"
            : slide_dir === "right"
            ? "gantt-date-slide-right"
            : "";

    return (
        <div className="flex items-center justify-between px-xl py-lg border-b border-gray-100">
            <div className="flex items-center gap-md">
                <h3 className="text-lg font-semibold text-gray-900 m-0">
                    {GANTT_TITLE_DAILY_TIMELINE}
                </h3>
                <div className="flex items-center gap-xs">
                    <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer"
                        onClick={onPrevDay}
                    >
                        <LeftOutlined style={{ fontSize: 12 }} />
                    </button>
                    <span
                        key={selected_date}
                        className={`text-sm font-medium text-gray-700 min-w-[140px] text-center ${date_class}`}
                    >
                        {formatted_date}
                    </span>
                    <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer"
                        onClick={onNextDay}
                    >
                        <RightOutlined style={{ fontSize: 12 }} />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-md">
                <div className="flex items-center gap-xs bg-gray-50 px-md py-xs rounded-lg">
                    <ClockCircleOutlined
                        className="text-gray-400"
                        style={{ fontSize: 12 }}
                    />
                    <span
                        key={total_minutes}
                        className="text-sm font-semibold text-gray-800 gantt-number-slide"
                    >
                        {formatDuration(total_minutes)}
                    </span>
                </div>
                <span className="text-xs text-gray-400">
                    {GANTT_HINT_DRAG_TO_ADD}
                </span>
            </div>
        </div>
    );
}
