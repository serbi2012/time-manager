/**
 * Mobile date navigation bar — "< 2월 11일 수요일 >"
 * Allows navigating day-by-day with left/right arrows
 */

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { DATE_FORMAT } from "../../constants";

interface MobileDateNavBarProps {
    selected_date: string;
    onDateChange: (date: string) => void;
}

const DATE_NAV_DISPLAY_FORMAT = "M월 D일 dddd";

export function MobileDateNavBar({
    selected_date,
    onDateChange,
}: MobileDateNavBarProps) {
    const formatted = dayjs(selected_date).format(DATE_NAV_DISPLAY_FORMAT);

    const handlePrev = () => {
        const prev = dayjs(selected_date)
            .subtract(1, "day")
            .format(DATE_FORMAT);
        onDateChange(prev);
    };

    const handleNext = () => {
        const next = dayjs(selected_date).add(1, "day").format(DATE_FORMAT);
        onDateChange(next);
    };

    return (
        <div className="flex items-center justify-between px-xl py-lg">
            <button
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 bg-transparent text-gray-400 cursor-pointer"
                onClick={handlePrev}
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <LeftOutlined style={{ fontSize: 16 }} />
            </button>
            <span className="text-lg font-semibold text-gray-800">
                {formatted}
            </span>
            <button
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 bg-transparent text-gray-400 cursor-pointer"
                onClick={handleNext}
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <RightOutlined style={{ fontSize: 16 }} />
            </button>
        </div>
    );
}
