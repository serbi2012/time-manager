/**
 * Mobile weekly schedule — Toss-inspired redesign
 * Long-press on day card shows copy/navigate menu
 */

import { useState, useCallback } from "react";
import { Empty } from "antd";
import {
    CopyOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { message } from "@/shared/lib/message";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useNavigate } from "react-router-dom";

import { SUCCESS_MESSAGES } from "@/shared/constants";
import { useWorkStore } from "@/store/useWorkStore";
import {
    MobileActionMenu,
    type MobileActionMenuItem,
} from "@/shared/ui";
import { useWeeklyData } from "../../hooks/useWeeklyData";
import { useCopyFormat } from "../../hooks/useCopyFormat";
import { generateWeeklyCopyText } from "../../lib/weekly_copy_text";
import { MobileWeeklyHeader } from "./MobileWeeklyHeader";
import { MobileDayCard } from "./MobileDayCard";
import { CopyPreviewSection } from "../WeeklySchedule/CopyPreviewSection";
import { WEEKLY_LABELS, MOBILE_WEEKLY_MENU } from "../../constants";
import type { DayGroup } from "../../lib/week_grouper";

dayjs.extend(isoWeek);

const DAY_MENU_ITEMS: MobileActionMenuItem[] = [
    {
        key: "copy_day",
        label: MOBILE_WEEKLY_MENU.COPY_DAY,
        icon: CopyOutlined,
        color: "var(--color-primary)",
        bg: "rgba(49,130,246,0.08)",
    },
    {
        key: "go_to_daily",
        label: MOBILE_WEEKLY_MENU.GO_TO_DAILY,
        icon: CalendarOutlined,
        color: "var(--color-success)",
        bg: "rgba(52,199,89,0.08)",
        haptic_ms: 10,
    },
];

export function MobileWeeklySchedule() {
    const [selected_week_start, setSelectedWeekStart] = useState(
        dayjs().startOf("isoWeek")
    );

    const navigate = useNavigate();
    const setSelectedDate = useWorkStore((s) => s.setSelectedDate);

    const {
        day_groups,
        hide_management_work,
        setHideManagementWork,
        handleStatusChange,
    } = useWeeklyData(selected_week_start);

    const { copy_format, setCopyFormat } = useCopyFormat();

    const [menu_open, setMenuOpen] = useState(false);
    const [menu_anchor, setMenuAnchor] = useState<DOMRect | null>(null);
    const [menu_day_group, setMenuDayGroup] = useState<DayGroup | null>(null);

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

    const handleDayLongPress = useCallback(
        (day_group: DayGroup, anchor_rect: DOMRect) => {
            setMenuDayGroup(day_group);
            setMenuAnchor(anchor_rect);
            setMenuOpen(true);
        },
        []
    );

    const handleDayMenuAction = useCallback(
        (key: string) => {
            if (!menu_day_group) return;
            if (key === "copy_day") {
                const text = generateWeeklyCopyText([menu_day_group], copy_format);
                navigator.clipboard.writeText(text).then(() => {
                    message.success(SUCCESS_MESSAGES.clipboardCopied);
                });
            } else if (key === "go_to_daily") {
                setSelectedDate(menu_day_group.date);
                navigate("/");
            }
        },
        [menu_day_group, copy_format, setSelectedDate, navigate]
    );

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
                            <MobileDayCard
                                key={day_group.date}
                                day_group={day_group}
                                on_status_change={handleStatusChange}
                                onLongPress={handleDayLongPress}
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

            <MobileActionMenu
                open={menu_open}
                anchor_rect={menu_anchor}
                items={DAY_MENU_ITEMS}
                onAction={handleDayMenuAction}
                onClose={() => setMenuOpen(false)}
            />
        </div>
    );
}
