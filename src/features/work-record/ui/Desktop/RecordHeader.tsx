/**
 * Record header component
 * Combines DateNavigation, WeeklyCalendarStrip, InlineStats, MoreActionsMenu
 * 5-1: Press scale on buttons
 * 5-3: Ripple on primary button
 */

import { useState, useCallback } from "react";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";

import type { TodayStats } from "../../lib/record_stats";
import type { WorkRecord } from "../../../../shared/types";
import { formatShortcutKeyForPlatform } from "../../../../hooks/useShortcuts";
import { cn } from "../../../../shared/lib/cn";
import { RECORD_BUTTON } from "../../constants";
import {
    motion,
    AnimatePresence,
    SLIDE,
    SPRING,
    RippleEffect,
} from "../../../../shared/ui/animation";

import { DateNavigation } from "./DateNavigation";
import { WeeklyCalendarStrip } from "./WeeklyCalendarStrip";
import { InlineStats } from "./InlineStats";
import { MoreActionsMenu } from "./MoreActionsMenu";

const WEEKLY_TOGGLE_LABEL = "주간";

interface RecordHeaderProps {
    selected_date: string;
    onDateChange: (date: Dayjs | null) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
    onDateSelect: (date: string) => void;
    stats: TodayStats;
    records: WorkRecord[];
    onAddNew: () => void;
    onOpenCompleted: () => void;
    onOpenTrash: () => void;
    onCopyRecords: () => void;
    new_work_shortcut_keys: string;
    disabled_copy: boolean;
}

export function RecordHeader({
    selected_date,
    onDateChange,
    onPrevDay,
    onNextDay,
    onDateSelect,
    stats,
    records,
    onAddNew,
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
    new_work_shortcut_keys,
    disabled_copy,
}: RecordHeaderProps) {
    const [is_calendar_open, setIsCalendarOpen] = useState(true);

    const handleToggleCalendar = useCallback(() => {
        setIsCalendarOpen((prev) => !prev);
    }, []);

    return (
        <div className="p-xl pb-lg">
            {/* Row 1: Date text (main) + toggle + actions */}
            <div className="flex items-center justify-between mb-sm">
                <DateNavigation
                    selected_date={selected_date}
                    onDateChange={onDateChange}
                    onPrevDay={onPrevDay}
                    onNextDay={onNextDay}
                />
                <div className="flex items-center gap-sm">
                    {/* 5-1: Press scale on toggle */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleCalendar}
                        className={cn(
                            "h-8 px-md rounded-md text-xs font-medium flex items-center gap-xs transition-colors border cursor-pointer",
                            is_calendar_open
                                ? "bg-primary-light text-primary border-primary/20"
                                : "bg-transparent text-text-secondary hover:bg-bg-grey border-border-default"
                        )}
                    >
                        <CalendarOutlined style={{ fontSize: 12 }} />
                        {WEEKLY_TOGGLE_LABEL}
                    </motion.button>

                    {/* 5-3: Ripple on primary button */}
                    <RippleEffect
                        color="rgba(255, 255, 255, 0.3)"
                        className="h-9 border-0 bg-primary text-white rounded-md text-sm font-semibold inline-flex items-center cursor-pointer"
                        onClick={onAddNew}
                    >
                        <span className="px-lg inline-flex items-center gap-xs">
                            <PlusOutlined style={{ fontSize: 13 }} />
                            {RECORD_BUTTON.NEW_WORK}
                            {new_work_shortcut_keys && (
                                <span className="text-xs opacity-70 ml-xs bg-white/20 px-xs py-px rounded-xs">
                                    {formatShortcutKeyForPlatform(
                                        new_work_shortcut_keys
                                    )}
                                </span>
                            )}
                        </span>
                    </RippleEffect>

                    <MoreActionsMenu
                        onOpenCompleted={onOpenCompleted}
                        onOpenTrash={onOpenTrash}
                        onCopyRecords={onCopyRecords}
                        disabled_copy={disabled_copy}
                    />
                </div>
            </div>

            {/* Row 2: Weekly calendar (collapsible with animation) */}
            <AnimatePresence>
                {is_calendar_open && (
                    <motion.div
                        initial={SLIDE.up.initial}
                        animate={SLIDE.up.animate}
                        exit={{ opacity: 0, y: -10 }}
                        transition={SPRING.toss}
                        className="mt-md mb-sm"
                    >
                        <WeeklyCalendarStrip
                            selected_date={selected_date}
                            onDateSelect={onDateSelect}
                            records={records}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Divider + Stats */}
            <div className="h-px bg-border-light mt-md mb-md" />
            <InlineStats stats={stats} />
        </div>
    );
}
