/**
 * 세션 분석 탭의 정보/상태 카드들
 * (실행 중 세션, 문제 세션, 충돌 날짜)
 */

import { Card, Space, Typography, Alert, Tag } from "antd";
import {
    PlayCircleOutlined,
    WarningOutlined,
    BugOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { SessionWithMeta } from "../../lib/conflict_finder";
import type { ConflictInfo } from "../../lib/conflict_finder";
import {
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
} from "../../constants";

const { Text } = Typography;

interface DuplicateRunning {
    record_id: string;
    work_name: string;
    deal_name: string;
    sessions: SessionWithMeta[];
}

interface RunningCardProps {
    running_sessions: SessionWithMeta[];
    duplicate_running_sessions: DuplicateRunning[];
}

export function RunningSessionCard({
    running_sessions,
    duplicate_running_sessions,
}: RunningCardProps) {
    return (
        <Card size="small" className="!bg-[#f6ffed] !border-[#b7eb8f]">
            <Space direction="vertical" size="small" className="!w-full">
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
                                {duplicate_running_sessions.length}개 레코드
                            </span>
                        }
                        description={
                            <Space direction="vertical" size="small">
                                {duplicate_running_sessions.map((dup) => (
                                    <Text
                                        key={dup.record_id}
                                        className="!text-sm"
                                    >
                                        <WarningOutlined className="!text-[#ff4d4f]" />{" "}
                                        "{dup.work_name} &gt; {dup.deal_name}" -{" "}
                                        {dup.sessions.length}
                                        개의 진행 중 세션
                                    </Text>
                                ))}
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
                            {s.work_name} &gt; {s.deal_name} ({s.date}{" "}
                            {s.start_time}~)
                        </Tag>
                    ))}
                </Space>
            </Space>
        </Card>
    );
}

interface ProblemStatsCardProps {
    problem_stats: {
        zero_duration: number;
        missing_time: number;
        invalid_time: number;
        future_time: number;
    };
    problem_dates: Set<string>;
}

export function ProblemStatsCard({
    problem_stats,
    problem_dates,
}: ProblemStatsCardProps) {
    return (
        <Card size="small" className="!bg-[#fff7e6] !border-[#ffd591]">
            <Space direction="vertical" size="small" className="!w-full">
                <Text strong className="!text-[#d46b08]">
                    <BugOutlined /> {CARD_PROBLEM_STATS}
                </Text>
                <Space wrap>
                    {problem_stats.zero_duration > 0 && (
                        <Tag color="orange">
                            {CARD_PROBLEM_ZERO} {problem_stats.zero_duration}개
                        </Tag>
                    )}
                    {problem_stats.missing_time > 0 && (
                        <Tag color="red">
                            {CARD_PROBLEM_MISSING} {problem_stats.missing_time}
                            개
                        </Tag>
                    )}
                    {problem_stats.invalid_time > 0 && (
                        <Tag color="magenta">
                            {CARD_PROBLEM_INVALID} {problem_stats.invalid_time}
                            개
                        </Tag>
                    )}
                    {problem_stats.future_time > 0 && (
                        <Tag color="purple">
                            {CARD_PROBLEM_FUTURE} {problem_stats.future_time}개
                        </Tag>
                    )}
                </Space>
                <Text type="secondary" className="!text-sm">
                    {CARD_PROBLEM_DAYS}{" "}
                    {Array.from(problem_dates).sort().slice(0, 5).join(", ")}
                    {problem_dates.size > 5 &&
                        ` 외 ${problem_dates.size - 5}일`}
                </Text>
            </Space>
        </Card>
    );
}

interface ConflictDatesCardProps {
    conflicts: ConflictInfo[];
    conflict_dates: Set<string>;
    set_date_range: (
        v: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    ) => void;
}

export function ConflictDatesCard({
    conflicts,
    conflict_dates,
    set_date_range,
}: ConflictDatesCardProps) {
    return (
        <Card size="small" className="!bg-[#fff2f0] !border-[#ffccc7]">
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
    );
}
