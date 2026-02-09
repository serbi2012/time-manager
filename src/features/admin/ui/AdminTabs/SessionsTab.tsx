/**
 * 세션 분석 탭 (뷰 모드, 필터, 통계 카드, 세션 테이블)
 */

import { useMemo } from "react";
import {
    Space,
    Button,
    Popconfirm,
    Segmented,
    DatePicker,
    TimePicker,
    Card,
    Typography,
    Alert,
    Tag,
} from "antd";
import {
    DeleteOutlined,
    CalendarOutlined,
    PlayCircleOutlined,
    WarningOutlined,
    BugOutlined,
    EyeInvisibleOutlined,
    SearchOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { timeToMinutes } from "../../../../shared/lib/time";
import type { SessionWithMeta } from "../../lib/conflict_finder";
import type { ConflictInfo } from "../../lib/conflict_finder";
import type { ProblemInfo } from "../../lib/problem_detector";
import { SessionTable } from "./SessionTable";
import type { ViewMode, TimeDisplayFormat } from "../../hooks/useAdminFilters";
import {
    BULK_DELETE,
    CONFIRM_BULK_DELETE_SESSIONS,
    DELETE,
    CANCEL,
    PLACEHOLDER_START_DATE,
    PLACEHOLDER_END_DATE,
    VIEW_MODE_ALL,
    VIEW_MODE_RUNNING,
    VIEW_MODE_CONFLICTS,
    VIEW_MODE_PROBLEMS,
    VIEW_MODE_INVISIBLE,
    VIEW_MODE_TIME_SEARCH,
    SESSION_TIME_SEARCH_TITLE,
    SESSION_TIME_SEARCH_HINT,
    LABEL_DATE,
    LABEL_TIME,
    PLACEHOLDER_DATE,
    PLACEHOLDER_TIME,
    TIME_RESET,
    ALERT_INVISIBLE_SESSIONS_TITLE,
    ALERT_INVISIBLE_SESSIONS_DESC,
    STAT_ALL_SESSIONS,
    STAT_CONFLICT_SESSIONS,
    STAT_CONFLICT_DAYS,
    STAT_PROBLEM_SESSIONS,
    STAT_GANTT_INVISIBLE,
    STAT_RUNNING,
    CARD_RUNNING_STATUS,
    CARD_RUNNING_HINT,
    CARD_DUPLICATE_RUNNING,
    CARD_PROBLEM_STATS,
    CARD_PROBLEM_ZERO,
    CARD_PROBLEM_MISSING,
    CARD_PROBLEM_INVALID,
    CARD_PROBLEM_FUTURE,
    CARD_PROBLEM_DAYS,
    CARD_CONFLICT_DATES,
    BULK_DELETE_SESSIONS_BTN,
} from "../../constants";
import { cn } from "@/shared/lib/cn";

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

interface SessionsTabProps {
    all_sessions: SessionWithMeta[];
    conflicts: ConflictInfo[];
    problem_sessions: Map<string, ProblemInfo[]>;
    date_range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    set_date_range: (
        v: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    ) => void;
    view_mode: ViewMode;
    set_view_mode: (v: ViewMode) => void;
    time_format: TimeDisplayFormat;
    search_date: dayjs.Dayjs | null;
    set_search_date: (v: dayjs.Dayjs | null) => void;
    search_time: dayjs.Dayjs | null;
    set_search_time: (v: dayjs.Dayjs | null) => void;
    selected_row_keys: React.Key[];
    set_selected_row_keys: (keys: React.Key[]) => void;
    on_bulk_delete: () => void;
}

export function SessionsTab({
    all_sessions,
    conflicts,
    problem_sessions,
    date_range,
    set_date_range,
    view_mode,
    set_view_mode,
    time_format,
    search_date,
    set_search_date,
    search_time,
    set_search_time,
    selected_row_keys,
    set_selected_row_keys,
    on_bulk_delete,
}: SessionsTabProps) {
    const conflict_session_ids = useMemo(() => {
        const ids = new Set<string>();
        conflicts.forEach((c) => {
            ids.add(c.session1.id);
            ids.add(c.session2.id);
        });
        return ids;
    }, [conflicts]);

    const conflict_pairs = useMemo(() => {
        const pairs = new Map<string, SessionWithMeta[]>();
        conflicts.forEach((c) => {
            if (!pairs.has(c.session1.id)) pairs.set(c.session1.id, []);
            pairs.get(c.session1.id)!.push(c.session2);
            if (!pairs.has(c.session2.id)) pairs.set(c.session2.id, []);
            pairs.get(c.session2.id)!.push(c.session1);
        });
        return pairs;
    }, [conflicts]);

    const problem_session_ids = useMemo(
        () => new Set(problem_sessions.keys()),
        [problem_sessions]
    );

    const invisible_session_ids = useMemo(() => {
        const ids = new Set<string>();
        all_sessions.forEach((s) => {
            if (!s.start_time || !s.end_time) {
                ids.add(s.id);
                return;
            }
            const start_mins = timeToMinutes(s.start_time);
            const end_mins = timeToMinutes(s.end_time);
            if (end_mins - start_mins <= 1) ids.add(s.id);
        });
        return ids;
    }, [all_sessions]);

    const running_sessions = useMemo(
        () => all_sessions.filter((s) => s.end_time === ""),
        [all_sessions]
    );
    const running_session_ids = useMemo(
        () => new Set(running_sessions.map((s) => s.id)),
        [running_sessions]
    );

    const duplicate_running_sessions = useMemo(() => {
        const by_record = new Map<string, SessionWithMeta[]>();
        running_sessions.forEach((s) => {
            if (!by_record.has(s.record_id)) by_record.set(s.record_id, []);
            by_record.get(s.record_id)!.push(s);
        });
        return Array.from(by_record.entries())
            .filter(([, sessions]) => sessions.length >= 2)
            .map(([record_id, sessions]) => ({
                record_id,
                work_name: sessions[0].work_name,
                deal_name: sessions[0].deal_name,
                sessions,
            }));
    }, [running_sessions]);

    const time_search_results = useMemo(() => {
        if (!search_date || !search_time) return new Set<string>();
        const target_date = search_date.format("YYYY-MM-DD");
        const target_mins = search_time.hour() * 60 + search_time.minute();
        const ids = new Set<string>();
        all_sessions.forEach((s) => {
            if (s.date !== target_date || !s.start_time || !s.end_time) return;
            const start_mins = timeToMinutes(s.start_time);
            const end_mins = timeToMinutes(s.end_time);
            if (start_mins === end_mins) {
                if (start_mins === target_mins) ids.add(s.id);
            } else if (target_mins >= start_mins && target_mins < end_mins) {
                ids.add(s.id);
            }
        });
        return ids;
    }, [all_sessions, search_date, search_time]);

    const filtered_sessions = useMemo(() => {
        let result = all_sessions;
        if (view_mode !== "time_search" && date_range?.[0] && date_range?.[1]) {
            const start = date_range[0].format("YYYY-MM-DD");
            const end = date_range[1].format("YYYY-MM-DD");
            result = result.filter((s) => s.date >= start && s.date <= end);
        }
        if (view_mode === "conflicts")
            result = result.filter((s) => conflict_session_ids.has(s.id));
        else if (view_mode === "problems")
            result = result.filter((s) => problem_session_ids.has(s.id));
        else if (view_mode === "invisible")
            result = result.filter((s) => invisible_session_ids.has(s.id));
        else if (view_mode === "running")
            result = result.filter((s) => running_session_ids.has(s.id));
        else if (view_mode === "time_search" && search_date && search_time)
            result = result.filter((s) => time_search_results.has(s.id));
        else if (view_mode === "time_search" && search_date) {
            const d = search_date.format("YYYY-MM-DD");
            result = result.filter((s) => s.date === d);
        }
        return result;
    }, [
        all_sessions,
        date_range,
        view_mode,
        conflict_session_ids,
        problem_session_ids,
        invisible_session_ids,
        running_session_ids,
        time_search_results,
        search_date,
        search_time,
    ]);

    const unique_dates = useMemo(() => {
        const dates = new Set(all_sessions.map((s) => s.date));
        return Array.from(dates).sort((a, b) => b.localeCompare(a));
    }, [all_sessions]);

    const conflict_dates = useMemo(
        () => new Set(conflicts.map((c) => c.date)),
        [conflicts]
    );

    const problem_dates = useMemo(() => {
        const dates = new Set<string>();
        all_sessions.forEach((s) => {
            if (problem_session_ids.has(s.id)) dates.add(s.date);
        });
        return dates;
    }, [all_sessions, problem_session_ids]);

    const problem_stats = useMemo(() => {
        const stats = {
            zero_duration: 0,
            missing_time: 0,
            invalid_time: 0,
            future_time: 0,
        };
        problem_sessions.forEach((list) => {
            list.forEach((p) => {
                stats[p.type]++;
            });
        });
        return stats;
    }, [problem_sessions]);

    const time_search_message =
        search_date && search_time
            ? time_search_results.size > 0
                ? `${search_date.format("YYYY-MM-DD")} ${search_time.format(
                      "HH:mm"
                  )}에 ${time_search_results.size}개의 세션이 걸쳐있습니다.`
                : `${search_date.format("YYYY-MM-DD")} ${search_time.format(
                      "HH:mm"
                  )}에 걸쳐있는 세션이 없습니다.`
            : null;

    return (
        <Space direction="vertical" size="middle" className="!w-full">
            <Space size="middle" wrap>
                {selected_row_keys.length > 0 && (
                    <Popconfirm
                        title={BULK_DELETE}
                        description={`${selected_row_keys.length}${CONFIRM_BULK_DELETE_SESSIONS}`}
                        onConfirm={on_bulk_delete}
                        okText={DELETE}
                        cancelText={CANCEL}
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            {BULK_DELETE_SESSIONS_BTN} (
                            {selected_row_keys.length})
                        </Button>
                    </Popconfirm>
                )}
                <Segmented
                    value={view_mode}
                    onChange={(v) => set_view_mode(v as ViewMode)}
                    options={[
                        { label: VIEW_MODE_ALL, value: "all" },
                        {
                            label: (
                                <Space size={4}>
                                    <PlayCircleOutlined />
                                    {VIEW_MODE_RUNNING} (
                                    {running_session_ids.size})
                                </Space>
                            ),
                            value: "running",
                        },
                        {
                            label: (
                                <Space size={4}>
                                    <WarningOutlined />
                                    {VIEW_MODE_CONFLICTS} (
                                    {conflict_session_ids.size})
                                </Space>
                            ),
                            value: "conflicts",
                        },
                        {
                            label: (
                                <Space size={4}>
                                    <BugOutlined />
                                    {VIEW_MODE_PROBLEMS} (
                                    {problem_session_ids.size})
                                </Space>
                            ),
                            value: "problems",
                        },
                        {
                            label: (
                                <Space size={4}>
                                    <EyeInvisibleOutlined />
                                    {VIEW_MODE_INVISIBLE} (
                                    {invisible_session_ids.size})
                                </Space>
                            ),
                            value: "invisible",
                        },
                        {
                            label: (
                                <Space size={4}>
                                    <SearchOutlined />
                                    {VIEW_MODE_TIME_SEARCH}
                                </Space>
                            ),
                            value: "time_search",
                        },
                    ]}
                />
                {view_mode !== "time_search" && (
                    <Space>
                        <CalendarOutlined />
                        <RangePicker
                            value={date_range}
                            onChange={set_date_range}
                            allowClear
                            placeholder={[
                                PLACEHOLDER_START_DATE,
                                PLACEHOLDER_END_DATE,
                            ]}
                        />
                    </Space>
                )}
            </Space>

            <Space
                direction="vertical"
                size="middle"
                className="!w-full !mb-lg"
            >
                {view_mode === "time_search" && (
                    <Card
                        size="small"
                        className="!bg-[#e6f7ff] !border-[#91d5ff]"
                    >
                        <Space
                            direction="vertical"
                            size="small"
                            className="!w-full"
                        >
                            <Text strong className="!text-[#096dd9]">
                                <SearchOutlined /> {SESSION_TIME_SEARCH_TITLE}
                            </Text>
                            <Text type="secondary" className="!text-sm">
                                {SESSION_TIME_SEARCH_HINT}
                            </Text>
                            <Space wrap>
                                <Space>
                                    <Text>{LABEL_DATE}</Text>
                                    <DatePicker
                                        value={search_date}
                                        onChange={set_search_date}
                                        placeholder={PLACEHOLDER_DATE}
                                        allowClear={false}
                                    />
                                </Space>
                                <Space>
                                    <Text>{LABEL_TIME}</Text>
                                    <TimePicker
                                        value={search_time}
                                        onChange={set_search_time}
                                        format="HH:mm"
                                        placeholder={PLACEHOLDER_TIME}
                                        minuteStep={1}
                                    />
                                </Space>
                                {search_time && (
                                    <Button
                                        size="small"
                                        onClick={() => set_search_time(null)}
                                    >
                                        {TIME_RESET}
                                    </Button>
                                )}
                            </Space>
                            {time_search_message && (
                                <Alert
                                    type={
                                        time_search_results.size > 0
                                            ? "warning"
                                            : "success"
                                    }
                                    message={time_search_message}
                                    showIcon
                                    className="!mt-sm"
                                />
                            )}
                        </Space>
                    </Card>
                )}

                {view_mode === "invisible" &&
                    invisible_session_ids.size > 0 && (
                        <Alert
                            type="warning"
                            message={ALERT_INVISIBLE_SESSIONS_TITLE}
                            description={ALERT_INVISIBLE_SESSIONS_DESC}
                            showIcon
                        />
                    )}

                <div className="flex gap-lg flex-wrap">
                    <Card size="small" className="!min-w-[150px]">
                        <Text type="secondary">{STAT_ALL_SESSIONS}</Text>
                        <Title level={4} className="!m-0">
                            {all_sessions.length}개
                        </Title>
                    </Card>
                    <Card
                        size="small"
                        className={cn(
                            "!min-w-[150px]",
                            conflicts.length > 0 && "!border-[#ff4d4f]"
                        )}
                    >
                        <Text type="secondary">{STAT_CONFLICT_SESSIONS}</Text>
                        <Title
                            level={4}
                            className={cn(
                                "!m-0",
                                conflicts.length > 0 && "!text-[#ff4d4f]"
                            )}
                        >
                            {conflict_session_ids.size}개
                        </Title>
                    </Card>
                    <Card size="small" className="!min-w-[150px]">
                        <Text type="secondary">{STAT_CONFLICT_DAYS}</Text>
                        <Title level={4} className="!m-0">
                            {conflict_dates.size}일
                        </Title>
                    </Card>
                    <Card
                        size="small"
                        className={cn(
                            "!min-w-[150px]",
                            problem_session_ids.size > 0 && "!border-[#fa8c16]"
                        )}
                    >
                        <Text type="secondary">
                            <BugOutlined /> {STAT_PROBLEM_SESSIONS}
                        </Text>
                        <Title
                            level={4}
                            className={cn(
                                "!m-0",
                                problem_session_ids.size > 0 &&
                                    "!text-[#fa8c16]"
                            )}
                        >
                            {problem_session_ids.size}개
                        </Title>
                    </Card>
                    <Card
                        size="small"
                        className={cn(
                            "!min-w-[150px]",
                            invisible_session_ids.size > 0 &&
                                "!border-[#722ed1]"
                        )}
                    >
                        <Text type="secondary">
                            <EyeInvisibleOutlined /> {STAT_GANTT_INVISIBLE}
                        </Text>
                        <Title
                            level={4}
                            className={cn(
                                "!m-0",
                                invisible_session_ids.size > 0 &&
                                    "!text-[#722ed1]"
                            )}
                        >
                            {invisible_session_ids.size}개
                        </Title>
                    </Card>
                    <Card
                        size="small"
                        className={cn(
                            "!min-w-[150px]",
                            running_session_ids.size > 0 && "!border-[#52c41a]"
                        )}
                    >
                        <Text type="secondary">
                            <PlayCircleOutlined /> {STAT_RUNNING}
                        </Text>
                        <Title
                            level={4}
                            className={cn(
                                "!m-0",
                                running_session_ids.size > 0 &&
                                    "!text-[#52c41a]"
                            )}
                        >
                            {running_session_ids.size}개
                        </Title>
                    </Card>
                </div>

                {view_mode === "running" && running_session_ids.size > 0 && (
                    <Card
                        size="small"
                        className="!bg-[#f6ffed] !border-[#b7eb8f]"
                    >
                        <Space
                            direction="vertical"
                            size="small"
                            className="!w-full"
                        >
                            <Text strong className="!text-[#389e0d]">
                                <PlayCircleOutlined /> {CARD_RUNNING_STATUS}
                            </Text>
                            <Text type="secondary" className="!text-sm">
                                {CARD_RUNNING_HINT}
                            </Text>
                            {duplicate_running_sessions.length > 0 && (
                                <Alert
                                    type="error"
                                    showIcon
                                    message={
                                        <span>
                                            <ExclamationCircleOutlined />{" "}
                                            {CARD_DUPLICATE_RUNNING}{" "}
                                            {duplicate_running_sessions.length}
                                            개 레코드
                                        </span>
                                    }
                                    description={
                                        <Space
                                            direction="vertical"
                                            size="small"
                                        >
                                            {duplicate_running_sessions.map(
                                                (dup) => (
                                                    <Text
                                                        key={dup.record_id}
                                                        className="!text-sm"
                                                    >
                                                        <WarningOutlined className="!text-[#ff4d4f]" />{" "}
                                                        "{dup.work_name} &gt;{" "}
                                                        {dup.deal_name}" -{" "}
                                                        {dup.sessions.length}
                                                        개의 진행 중 세션
                                                    </Text>
                                                )
                                            )}
                                        </Space>
                                    }
                                />
                            )}
                            <Space wrap>
                                {running_sessions.map((s) => (
                                    <Tag
                                        key={s.id}
                                        color="green"
                                        icon={<ClockCircleOutlined />}
                                    >
                                        {s.work_name} &gt; {s.deal_name} (
                                        {s.date} {s.start_time}~)
                                    </Tag>
                                ))}
                            </Space>
                        </Space>
                    </Card>
                )}

                {problem_session_ids.size > 0 && (
                    <Card
                        size="small"
                        className="!bg-[#fff7e6] !border-[#ffd591]"
                    >
                        <Space
                            direction="vertical"
                            size="small"
                            className="!w-full"
                        >
                            <Text strong className="!text-[#d46b08]">
                                <BugOutlined /> {CARD_PROBLEM_STATS}
                            </Text>
                            <Space wrap>
                                {problem_stats.zero_duration > 0 && (
                                    <Tag color="orange">
                                        {CARD_PROBLEM_ZERO}{" "}
                                        {problem_stats.zero_duration}개
                                    </Tag>
                                )}
                                {problem_stats.missing_time > 0 && (
                                    <Tag color="red">
                                        {CARD_PROBLEM_MISSING}{" "}
                                        {problem_stats.missing_time}개
                                    </Tag>
                                )}
                                {problem_stats.invalid_time > 0 && (
                                    <Tag color="magenta">
                                        {CARD_PROBLEM_INVALID}{" "}
                                        {problem_stats.invalid_time}개
                                    </Tag>
                                )}
                                {problem_stats.future_time > 0 && (
                                    <Tag color="purple">
                                        {CARD_PROBLEM_FUTURE}{" "}
                                        {problem_stats.future_time}개
                                    </Tag>
                                )}
                            </Space>
                            <Text type="secondary" className="!text-sm">
                                {CARD_PROBLEM_DAYS}{" "}
                                {Array.from(problem_dates)
                                    .sort()
                                    .slice(0, 5)
                                    .join(", ")}
                                {problem_dates.size > 5 &&
                                    ` 외 ${problem_dates.size - 5}일`}
                            </Text>
                        </Space>
                    </Card>
                )}

                {conflicts.length > 0 && (
                    <Card
                        size="small"
                        className="!bg-[#fff2f0] !border-[#ffccc7]"
                    >
                        <Space direction="vertical" size="small">
                            <Text strong className="!text-[#cf1322]">
                                <WarningOutlined /> {CARD_CONFLICT_DATES}
                            </Text>
                            <Space wrap>
                                {Array.from(conflict_dates)
                                    .sort()
                                    .map((date) => {
                                        const count = conflicts.filter(
                                            (c) => c.date === date
                                        ).length;
                                        return (
                                            <Tag
                                                key={date}
                                                color="red"
                                                className="!cursor-pointer"
                                                onClick={() =>
                                                    set_date_range([
                                                        dayjs(date),
                                                        dayjs(date),
                                                    ])
                                                }
                                            >
                                                {date} ({count}건)
                                            </Tag>
                                        );
                                    })}
                            </Space>
                        </Space>
                    </Card>
                )}
            </Space>

            <SessionTable
                data_source={filtered_sessions}
                unique_dates={unique_dates}
                all_sessions={all_sessions}
                conflict_pairs={conflict_pairs}
                conflict_session_ids={conflict_session_ids}
                problem_sessions={problem_sessions}
                problem_session_ids={problem_session_ids}
                invisible_session_ids={invisible_session_ids}
                time_format={time_format}
                selected_row_keys={selected_row_keys}
                on_selection_change={set_selected_row_keys}
            />
        </Space>
    );
}
