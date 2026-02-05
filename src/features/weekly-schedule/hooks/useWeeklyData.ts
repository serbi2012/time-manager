/**
 * 주간 일정 데이터 훅: 주간 날짜, 레코드, day_groups
 */

import { useMemo, useCallback, useState } from "react";
import type { Dayjs } from "dayjs";
import { useWorkStore } from "@/store/useWorkStore";
import { ADMIN_PROJECT_CODE } from "@/shared/constants";
import {
    getWeekDates,
    getWeekRange,
    filterRecordsInWeek,
    buildDayGroups,
} from "../lib";

export function useWeeklyData(selected_week_start: Dayjs) {
    const records = useWorkStore((s) => s.records);

    const [editable_data, setEditableData] = useState<
        Record<string, { status: string }>
    >({});
    const [hide_management_work, setHideManagementWork] = useState(false);

    const week_start_str = selected_week_start.format("YYYY-MM-DD");
    const week_end_str = selected_week_start.add(6, "day").format("YYYY-MM-DD");

    const week_dates = useMemo(
        () => getWeekDates(week_start_str),
        [week_start_str]
    );

    const weekly_records = useMemo(
        () => filterRecordsInWeek(records, week_start_str, week_end_str),
        [records, week_start_str, week_end_str]
    );

    const day_groups = useMemo(
        () =>
            buildDayGroups(
                week_dates,
                weekly_records,
                editable_data,
                hide_management_work,
                ADMIN_PROJECT_CODE
            ),
        [week_dates, weekly_records, editable_data, hide_management_work]
    );

    const week_range = useMemo(
        () => getWeekRange(week_start_str),
        [week_start_str]
    );

    const handleStatusChange = useCallback(
        (work_name: string, value: string) => {
            setEditableData((prev) => ({
                ...prev,
                [work_name]: { status: value },
            }));
        },
        []
    );

    return {
        week_dates,
        weekly_records,
        day_groups,
        week_range,
        editable_data,
        hide_management_work,
        setHideManagementWork,
        handleStatusChange,
    };
}
