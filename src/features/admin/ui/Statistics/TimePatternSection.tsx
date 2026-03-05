/**
 * 시간대별 & 요일별 작업 패턴 차트
 */

import { Card, Row, Col, Tooltip, Typography } from "antd";
import {
    formatDuration,
    type TimeDisplayFormat,
    type HourlyStats,
    type WeekdayStats,
} from "../../lib/statistics";
import { STATS_LABEL } from "../../constants";

const { Text } = Typography;

const HOUR_LABELS = [
    STATS_LABEL.hour0,
    STATS_LABEL.hour6,
    STATS_LABEL.hour12,
    STATS_LABEL.hour18,
    STATS_LABEL.hour24,
] as const;

interface TimePatternSectionProps {
    hourly_stats: HourlyStats[];
    weekday_stats: WeekdayStats[];
    time_format: TimeDisplayFormat;
}

function HourlyChart({
    hourly_stats,
    time_format,
}: {
    hourly_stats: HourlyStats[];
    time_format: TimeDisplayFormat;
}) {
    const hourly_max = Math.max(...hourly_stats.map((h) => h.total_minutes), 1);

    return (
        <Card size="small" title={STATS_LABEL.hourlyPattern}>
            <div className="flex items-end h-[150px] gap-[2px]">
                {hourly_stats.map((stat) => (
                    <Tooltip
                        key={stat.hour}
                        title={
                            <div>
                                <div>{stat.label}</div>
                                <div>
                                    {formatDuration(
                                        stat.total_minutes,
                                        time_format
                                    )}
                                </div>
                                <div>
                                    {STATS_LABEL.sessionPrefix}{" "}
                                    {stat.session_count}
                                    {STATS_LABEL.unit_count}
                                </div>
                            </div>
                        }
                    >
                        <div
                            style={{
                                flex: 1,
                                backgroundColor:
                                    stat.hour >= 9 && stat.hour < 18
                                        ? "var(--color-primary)"
                                        : "var(--gray-500)",
                                height: `${
                                    (stat.total_minutes / hourly_max) * 100
                                }%`,
                                minHeight: stat.total_minutes > 0 ? 4 : 0,
                                borderRadius: 2,
                                opacity: stat.total_minutes > 0 ? 1 : 0.3,
                            }}
                        />
                    </Tooltip>
                ))}
            </div>
            <div className="flex justify-between mt-sm">
                {HOUR_LABELS.map((label) => (
                    <Text key={label} type="secondary" className="!text-xs">
                        {label}
                    </Text>
                ))}
            </div>
        </Card>
    );
}

function WeekdayChart({
    weekday_stats,
    time_format,
}: {
    weekday_stats: WeekdayStats[];
    time_format: TimeDisplayFormat;
}) {
    const weekday_max = Math.max(
        ...weekday_stats.map((w) => w.total_minutes),
        1
    );

    return (
        <Card size="small" title={STATS_LABEL.weeklyPattern}>
            <div className="flex items-end h-[150px] gap-sm">
                {weekday_stats.map((stat) => {
                    const is_weekend = stat.weekday === 0 || stat.weekday === 6;
                    return (
                        <Tooltip
                            key={stat.weekday}
                            title={
                                <div>
                                    <div>{stat.weekday_name}요일</div>
                                    <div>
                                        {formatDuration(
                                            stat.total_minutes,
                                            time_format
                                        )}
                                    </div>
                                    <div>
                                        {STATS_LABEL.sessionPrefix}{" "}
                                        {stat.session_count}
                                        {STATS_LABEL.unit_count}
                                    </div>
                                    <div>
                                        {STATS_LABEL.recordPrefix}{" "}
                                        {stat.record_count}
                                        {STATS_LABEL.unit_record}
                                    </div>
                                </div>
                            }
                        >
                            <div className="flex-1 flex flex-col items-center">
                                <div
                                    style={{
                                        width: "100%",
                                        backgroundColor: is_weekend
                                            ? "var(--color-error)"
                                            : "var(--color-success)",
                                        height: `${
                                            (stat.total_minutes / weekday_max) *
                                            100
                                        }%`,
                                        minHeight:
                                            stat.total_minutes > 0 ? 4 : 0,
                                        borderRadius: 4,
                                        marginBottom: 4,
                                    }}
                                />
                                <Text
                                    className="!text-sm"
                                    style={{
                                        color: is_weekend
                                            ? "var(--color-error)"
                                            : undefined,
                                    }}
                                >
                                    {stat.weekday_name}
                                </Text>
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </Card>
    );
}

export function TimePatternSection({
    hourly_stats,
    weekday_stats,
    time_format,
}: TimePatternSectionProps) {
    return (
        <Row gutter={[24, 24]} className="!mb-xl">
            <Col xs={24} lg={12}>
                <HourlyChart
                    hourly_stats={hourly_stats}
                    time_format={time_format}
                />
            </Col>
            <Col xs={24} lg={12}>
                <WeekdayChart
                    weekday_stats={weekday_stats}
                    time_format={time_format}
                />
            </Col>
        </Row>
    );
}
