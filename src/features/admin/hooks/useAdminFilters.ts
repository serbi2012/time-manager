/**
 * 관리자 필터/뷰 상태 훅
 */

import { useState } from "react";
import dayjs from "dayjs";

export type ViewMode =
    | "all"
    | "conflicts"
    | "problems"
    | "invisible"
    | "running"
    | "time_search";

export type TimeDisplayFormat = "minutes" | "hours";

export interface UseAdminFiltersReturn {
    date_range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    set_date_range: (
        v: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    ) => void;
    view_mode: ViewMode;
    set_view_mode: (v: ViewMode) => void;
    time_format: TimeDisplayFormat;
    set_time_format: (v: TimeDisplayFormat) => void;
    search_date: dayjs.Dayjs | null;
    set_search_date: (v: dayjs.Dayjs | null) => void;
    search_time: dayjs.Dayjs | null;
    set_search_time: (v: dayjs.Dayjs | null) => void;
}

export function useAdminFilters(): UseAdminFiltersReturn {
    const [date_range, set_date_range] = useState<
        [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    >(null);
    const [view_mode, set_view_mode] = useState<ViewMode>("all");
    const [time_format, set_time_format] = useState<TimeDisplayFormat>("hours");
    const [search_date, set_search_date] = useState<dayjs.Dayjs | null>(
        dayjs()
    );
    const [search_time, set_search_time] = useState<dayjs.Dayjs | null>(null);

    return {
        date_range,
        set_date_range,
        view_mode,
        set_view_mode,
        time_format,
        set_time_format,
        search_date,
        set_search_date,
        search_time,
        set_search_time,
    };
}
