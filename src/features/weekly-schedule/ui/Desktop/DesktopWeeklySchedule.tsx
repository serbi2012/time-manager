/**
 * 데스크탑 주간 일정 컴포넌트
 */

import { useState } from "react";
import { Layout, Empty } from "antd";
import { message } from "@/shared/lib/message";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { SUCCESS_MESSAGES } from "@/shared/constants";
import {
    usePageTransitionContext,
    DESKTOP_WEEKLY_STAGGER,
    TRANSITION_SPEED_DURATION,
    TRANSITION_EASE,
} from "@/shared/ui";
import { useWeeklyData } from "../../hooks/useWeeklyData";
import { useCopyFormat } from "../../hooks/useCopyFormat";
import { generateWeeklyCopyText } from "../../lib/weekly_copy_text";
import { DesktopWeeklyHeader } from "./DesktopWeeklyHeader";
import { WeekRangeText } from "../WeeklySchedule/WeekRangeText";
import { DayCard } from "../WeeklySchedule/DayCard";
import { CopyPreviewSection } from "../WeeklySchedule/CopyPreviewSection";
import { WEEKLY_LABELS } from "../../constants";

dayjs.extend(isoWeek);

const { Content } = Layout;

export function DesktopWeeklySchedule() {
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

    const { transition_enabled, transition_speed } =
        usePageTransitionContext();
    const speed_ratio =
        TRANSITION_SPEED_DURATION[transition_speed] /
        TRANSITION_SPEED_DURATION.normal;

    return (
        <Content className="weekly-schedule-content">
            <div className="weekly-schedule-container">
                <motion.div
                    initial={
                        transition_enabled
                            ? {
                                  y: DESKTOP_WEEKLY_STAGGER.header_y_offset,
                                  opacity: 0,
                              }
                            : false
                    }
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration:
                            DESKTOP_WEEKLY_STAGGER.header_duration *
                            speed_ratio,
                        ease: TRANSITION_EASE,
                    }}
                >
                    <DesktopWeeklyHeader
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
                </motion.div>

                {day_groups.length === 0 ? (
                    <Empty description={WEEKLY_LABELS.emptyDescription} />
                ) : (
                    <div className="weekly-schedule-list">
                        {day_groups.map((day_group, index) => (
                            <motion.div
                                key={day_group.date}
                                initial={
                                    transition_enabled
                                        ? {
                                              y: DESKTOP_WEEKLY_STAGGER.card_y_offset,
                                              opacity: 0,
                                          }
                                        : false
                                }
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    duration:
                                        DESKTOP_WEEKLY_STAGGER.card_duration *
                                        speed_ratio,
                                    ease: TRANSITION_EASE,
                                    delay:
                                        (DESKTOP_WEEKLY_STAGGER.card_start_delay +
                                            index *
                                                DESKTOP_WEEKLY_STAGGER.card_stagger) *
                                        speed_ratio,
                                }}
                            >
                                <DayCard
                                    day_group={day_group}
                                    on_status_change={handleStatusChange}
                                />
                            </motion.div>
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
        </Content>
    );
}
