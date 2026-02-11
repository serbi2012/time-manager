/**
 * Mobile weekly header — Toss-inspired redesign
 * Page title + week navigation + filter/copy toolbar
 */

import {
    LeftOutlined,
    RightOutlined,
    CopyOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { cn } from "@/shared/lib/cn";
import { WEEKLY_LABELS } from "../../constants";

export interface MobileWeeklyHeaderProps {
    selected_week_start: Dayjs;
    on_prev_week: () => void;
    on_next_week: () => void;
    on_this_week: () => void;
    on_week_change: (date: Dayjs) => void;
    hide_management_work: boolean;
    on_hide_management_change: (value: boolean) => void;
    on_copy: () => void;
    copy_disabled: boolean;
}

const WEEK_NAV_FORMAT = "M월";

function getWeekNumber(date: Dayjs): number {
    return Math.ceil(date.date() / 7);
}

export function MobileWeeklyHeader({
    selected_week_start,
    on_prev_week,
    on_next_week,
    on_this_week,
    hide_management_work,
    on_hide_management_change,
    on_copy,
    copy_disabled,
}: MobileWeeklyHeaderProps) {
    const week_end = selected_week_start.add(6, "day");
    const formatted_range = `${selected_week_start.format(
        "YYYY년 M월 D일"
    )} ~ ${week_end.format("M월 D일")}`;
    const formatted_nav = `${selected_week_start.format(
        WEEK_NAV_FORMAT
    )} ${getWeekNumber(selected_week_start)}주`;

    return (
        <div className="bg-white">
            {/* Page title */}
            <div className="px-xl pt-xl pb-md">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400">
                            {formatted_range}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-[2px]">
                            {WEEKLY_LABELS.title}
                        </div>
                    </div>
                    <button
                        className="h-[34px] px-md rounded-lg bg-gray-100 border-0 text-sm font-medium text-gray-600 cursor-pointer"
                        onClick={on_this_week}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {WEEKLY_LABELS.thisWeekShort}
                    </button>
                </div>
            </div>

            <div className="mx-xl border-b border-gray-100" />

            {/* Week navigation */}
            <div className="flex items-center justify-between px-xl py-lg">
                <button
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 bg-transparent text-gray-400 cursor-pointer"
                    onClick={on_prev_week}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                >
                    <LeftOutlined style={{ fontSize: 16 }} />
                </button>
                <span className="text-lg font-semibold text-gray-800">
                    {formatted_nav}
                </span>
                <button
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 bg-transparent text-gray-400 cursor-pointer"
                    onClick={on_next_week}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                >
                    <RightOutlined style={{ fontSize: 16 }} />
                </button>
            </div>

            {/* Filter + Copy toolbar */}
            <div className="flex items-center justify-between px-xl pb-lg">
                <div className="flex items-center gap-sm">
                    <button
                        className={cn(
                            "h-[34px] px-md rounded-lg border-0 text-sm font-medium cursor-pointer flex items-center gap-xs",
                            !hide_management_work
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-100 text-gray-500"
                        )}
                        onClick={() => on_hide_management_change(false)}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {WEEKLY_LABELS.viewAllShort}
                    </button>
                    <button
                        className={cn(
                            "h-[34px] px-md rounded-lg border-0 text-sm font-medium cursor-pointer flex items-center gap-xs",
                            hide_management_work
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-100 text-gray-500"
                        )}
                        onClick={() => on_hide_management_change(true)}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        <FilterOutlined style={{ fontSize: 12 }} />
                        {WEEKLY_LABELS.excludeManagementShort}
                    </button>
                </div>
                <button
                    className={cn(
                        "w-[40px] h-[40px] rounded-full flex items-center justify-center border-0 cursor-pointer",
                        copy_disabled
                            ? "bg-gray-100 text-gray-300"
                            : "bg-primary text-white"
                    )}
                    onClick={on_copy}
                    disabled={copy_disabled}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                >
                    <CopyOutlined style={{ fontSize: 16 }} />
                </button>
            </div>
        </div>
    );
}
