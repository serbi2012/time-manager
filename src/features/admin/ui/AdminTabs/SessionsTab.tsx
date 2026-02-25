/**
 * 세션 분석 탭 (뷰 모드, 필터, 통계 카드, 세션 테이블)
 */

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
} from "antd";
import {
    DeleteOutlined,
    CalendarOutlined,
    PlayCircleOutlined,
    WarningOutlined,
    BugOutlined,
    EyeInvisibleOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { SessionWithMeta } from "../../lib/conflict_finder";
import type { ConflictInfo } from "../../lib/conflict_finder";
import type { ProblemInfo } from "../../lib/problem_detector";
import { SessionTable } from "./SessionTable";
import type { ViewMode, TimeDisplayFormat } from "../../hooks/useAdminFilters";
import { useSessionAnalysis } from "../../hooks/useSessionAnalysis";
import {
    RunningSessionCard,
    ProblemStatsCard,
    ConflictDatesCard,
} from "./SessionInfoCards";
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
    const {
        conflict_session_ids,
        conflict_pairs,
        problem_session_ids,
        invisible_session_ids,
        running_sessions,
        running_session_ids,
        duplicate_running_sessions,
        time_search_results,
        filtered_sessions,
        unique_dates,
        conflict_dates,
        problem_dates,
        problem_stats,
        time_search_message,
    } = useSessionAnalysis({
        all_sessions,
        conflicts,
        problem_sessions,
        date_range,
        view_mode,
        search_date,
        search_time,
    });

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
                    <RunningSessionCard
                        running_sessions={running_sessions}
                        duplicate_running_sessions={duplicate_running_sessions}
                    />
                )}

                {problem_session_ids.size > 0 && (
                    <ProblemStatsCard
                        problem_stats={problem_stats}
                        problem_dates={problem_dates}
                    />
                )}

                {conflicts.length > 0 && (
                    <ConflictDatesCard
                        conflicts={conflicts}
                        conflict_dates={conflict_dates}
                        set_date_range={set_date_range}
                    />
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
