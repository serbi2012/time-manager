/**
 * Mobile weekly schedule — Toss-inspired redesign
 */

import { useState } from "react";
import { Empty } from "antd";
import { message } from "@/shared/lib/message";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { SUCCESS_MESSAGES } from "@/shared/constants";
import { useWeeklyData } from "../../hooks/useWeeklyData";
import { useCopyFormat } from "../../hooks/useCopyFormat";
import { generateWeeklyCopyText } from "../../lib/weekly_copy_text";
import { MobileWeeklyHeader } from "./MobileWeeklyHeader";
import { DayCard } from "../WeeklySchedule/DayCard";
import { CopyPreviewSection } from "../WeeklySchedule/CopyPreviewSection";
import { WEEKLY_LABELS } from "../../constants";

dayjs.extend(isoWeek);

export function MobileWeeklySchedule() {
    const [selected_week_start, setSelectedWeekStart] = useState(
        dayjs().startOf("isoWeek")
    );

    const {
        day_groups,
        hide_management_work,
        setHideManagementWork,
        handleStatusChange,
    } = useWeeklyData(selected_week_start);

    const { copy_format, setCopyFormat } = useCopyFormat();

    const handlePrevWeek = () => {
        setSelectedWeekStart((prev) => prev.subtract(1, "week"));
    };

    const handleNextWeek = () => {
        setSelectedWeekStart((prev) => prev.add(1, "week"));
    };

    const handleThisWeek = () => {
        setSelectedWeekStart(dayjs().startOf("isoWeek"));
    };

    const handleCopy = () => {
        const text = generateWeeklyCopyText(day_groups, copy_format);
        navigator.clipboard.writeText(text).then(() => {
            message.success(SUCCESS_MESSAGES.clipboardCopied);
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Sticky header */}
            <div className="sticky top-0 z-30">
                <MobileWeeklyHeader
                    selected_week_start={selected_week_start}
                    on_prev_week={handlePrevWeek}
                    on_next_week={handleNextWeek}
                    on_this_week={handleThisWeek}
                    on_week_change={(date) => setSelectedWeekStart(date)}
                    hide_management_work={hide_management_work}
                    on_hide_management_change={setHideManagementWork}
                    on_copy={handleCopy}
                    copy_disabled={day_groups.length === 0}
                />
            </div>

            {/* Content */}
            <div className="flex-1 pb-[90px]">
                {day_groups.length === 0 ? (
                    <div className="py-[80px]">
                        <Empty description={WEEKLY_LABELS.emptyDescription} />
                    </div>
                ) : (
                    <div className="px-xl pt-md space-y-md">
                        {day_groups.map((day_group) => (
                            <DayCard
                                key={day_group.date}
                                day_group={day_group}
                                on_status_change={handleStatusChange}
                            />
                        ))}
                    </div>
                )}

                {day_groups.length > 0 && (
                    <div className="px-xl pt-xl">
                        <CopyPreviewSection
                            day_groups={day_groups}
                            copy_format={copy_format}
                            on_format_change={setCopyFormat}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
