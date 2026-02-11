/**
 * Mobile date header — matches desktop DateNavigation style
 * Animation F: Date text slides left/right on navigation
 */

import { useRef, useState } from "react";
import { DatePicker } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import { formatDuration } from "../../../../shared/lib/time";
import { cn } from "../../../../shared/lib/cn";

interface MobileDateHeaderProps {
    selected_date: string;
    total_minutes: number;
    onPrevDay: () => void;
    onNextDay: () => void;
    onDateChange: (date: Dayjs | null) => void;
}

function formatDateLabel(date_str: string): string {
    const d = dayjs(date_str);
    const month = d.month() + 1;
    const day = d.date();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[d.day()];
    return `${month}월 ${day}일 (${weekday})`;
}

export function MobileDateHeader({
    selected_date,
    total_minutes,
    onPrevDay,
    onNextDay,
    onDateChange,
}: MobileDateHeaderProps) {
    const picker_ref = useRef<ReturnType<typeof DatePicker> | null>(null);

    // F: track direction for slide animation (getDerivedStateFromProps pattern)
    const [slide_dir, setSlideDir] = useState<"left" | "right" | null>(null);
    const [slide_key, setSlideKey] = useState(0);
    const [prev_date, setPrevDate] = useState(selected_date);

    if (prev_date !== selected_date) {
        const dir = dayjs(selected_date).isAfter(dayjs(prev_date))
            ? "right"
            : "left";
        setSlideDir(dir);
        setSlideKey((k) => k + 1);
        setPrevDate(selected_date);
    }

    const slide_class =
        slide_dir === "right"
            ? "mobile-date-slide-right"
            : slide_dir === "left"
            ? "mobile-date-slide-left"
            : "";

    return (
        <div className="flex items-center justify-between px-lg pt-md pb-sm">
            {/* Date navigation */}
            <div className="flex items-center gap-sm">
                <button
                    className="w-7 h-7 border-0 bg-transparent rounded-md flex items-center justify-center hover:bg-bg-grey transition-colors cursor-pointer"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    onClick={onPrevDay}
                >
                    <LeftOutlined
                        style={{ fontSize: 12, color: "var(--gray-600)" }}
                    />
                </button>

                <div className="relative overflow-hidden">
                    <div
                        className={cn(
                            "flex items-center gap-xs cursor-pointer hover:bg-bg-grey rounded-md px-sm py-xs transition-colors",
                            slide_class
                        )}
                        key={slide_key}
                    >
                        <CalendarOutlined
                            className="text-primary"
                            style={{ fontSize: 14 }}
                        />
                        <span className="text-md font-semibold text-text-primary whitespace-nowrap">
                            {formatDateLabel(selected_date)}
                        </span>
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

                <button
                    className="w-7 h-7 border-0 bg-transparent rounded-md flex items-center justify-center hover:bg-bg-grey transition-colors cursor-pointer"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    onClick={onNextDay}
                >
                    <RightOutlined
                        style={{ fontSize: 12, color: "var(--gray-600)" }}
                    />
                </button>
            </div>

            {/* Total duration */}
            <div className="flex items-center gap-xs">
                <ClockCircleOutlined
                    style={{ fontSize: 12, color: "var(--color-primary)" }}
                />
                <span className="text-sm font-semibold text-text-primary">
                    {formatDuration(total_minutes)}
                </span>
            </div>
        </div>
    );
}
