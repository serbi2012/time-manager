/**
 * 주간 일정 메인 컴포넌트
 */

import { useState } from "react";
import { Layout, Empty, message } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useResponsive } from "@/hooks/useResponsive";
import { SUCCESS_MESSAGES } from "@/shared/constants";
import { useWeeklyData } from "../../hooks/useWeeklyData";
import { useCopyFormat } from "../../hooks/useCopyFormat";
import { generateWeeklyCopyText } from "../../lib/weekly_copy_text";
import { WeeklyHeader } from "./WeeklyHeader";
import { WeekRangeText } from "./WeekRangeText";
import { DayCard } from "./DayCard";
import { CopyPreviewSection } from "./CopyPreviewSection";
import { WEEKLY_LABELS, WEEKLY_SCHEDULE_STYLES } from "../../constants";

dayjs.extend(isoWeek);

const { Content } = Layout;

export function WeeklySchedule() {
    const { is_mobile } = useResponsive();
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

    const week_end = selected_week_start.add(6, "day");

    return (
        <Content className="weekly-schedule-content">
            <div className="weekly-schedule-container">
                <WeeklyHeader
                    is_mobile={is_mobile}
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

                <WeekRangeText
                    week_start={selected_week_start}
                    week_end={week_end}
                />

                {day_groups.length === 0 ? (
                    <Empty description={WEEKLY_LABELS.emptyDescription} />
                ) : (
                    <div className="weekly-schedule-list">
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
                    <CopyPreviewSection
                        day_groups={day_groups}
                        copy_format={copy_format}
                        on_format_change={setCopyFormat}
                    />
                )}
            </div>

            <style>{WEEKLY_SCHEDULE_STYLES}</style>
        </Content>
    );
}
