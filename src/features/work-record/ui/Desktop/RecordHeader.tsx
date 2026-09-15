/**
 * Record header component
 * Combines DateNavigation, WeeklyCalendarStrip, MoreActionsMenu
 * 5-1: Press scale on buttons
 * 5-3: Ripple on primary button
 */

import { PlusOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";

import type { WorkRecord } from "../../../../shared/types";
import { formatShortcutForPlatform } from "@/shared/lib/shortcuts";
import { RECORD_BUTTON } from "../../constants";
import {
    motion,
    SLIDE,
    SPRING,
    RippleEffect,
} from "../../../../shared/ui/animation";

import { DateNavigation } from "./DateNavigation";
import { WeeklyCalendarStrip } from "./WeeklyCalendarStrip";
import { MoreActionsMenu } from "./MoreActionsMenu";

interface RecordHeaderProps {
    selected_date: string;
    onDateChange: (date: Dayjs | null) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
    onDateSelect: (date: string) => void;
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
    records,
    onAddNew,
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
    new_work_shortcut_keys,
    disabled_copy,
}: RecordHeaderProps) {
    return (
        <div className="p-xl pb-xl">
            <div className="flex items-center justify-between flex-wrap gap-sm">
                <DateNavigation
                    selected_date={selected_date}
                    onDateChange={onDateChange}
                    onPrevDay={onPrevDay}
                    onNextDay={onNextDay}
                />

                <motion.div
                    initial={SLIDE.up.initial}
                    animate={SLIDE.up.animate}
                    transition={SPRING.toss}
                >
                    <WeeklyCalendarStrip
                        selected_date={selected_date}
                        onDateSelect={onDateSelect}
                        records={records}
                    />
                </motion.div>

                <div className="flex items-center gap-sm">
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
                                    {formatShortcutForPlatform(
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
        </div>
    );
}
