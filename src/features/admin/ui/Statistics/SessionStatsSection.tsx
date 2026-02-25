/**
 * 세션 통계 + 세션 시간 분포 섹션
 */

import { Card, Row, Col, Statistic, Progress, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import {
    formatDuration,
    type TimeDisplayFormat,
    type SessionStats,
    type SessionTimeDistribution,
} from "../../lib/statistics";

const { Title, Text } = Typography;

interface SessionStatsSectionProps {
    session_stats: SessionStats;
    session_distribution: SessionTimeDistribution;
    time_format: TimeDisplayFormat;
}

const DISTRIBUTION_ITEMS = [
    {
        key: "under_15min" as const,
        label: "15분 미만",
        color: "var(--color-error)",
    },
    {
        key: "min_15_to_30" as const,
        label: "15-30분",
        color: "var(--color-warning)",
    },
    {
        key: "min_30_to_60" as const,
        label: "30분-1시간",
        color: "var(--color-success)",
    },
    {
        key: "hour_1_to_2" as const,
        label: "1-2시간",
        color: "var(--color-primary)",
    },
    { key: "over_2hours" as const, label: "2시간 이상", color: "#722ed1" },
] as const;

export function SessionStatsSection({
    session_stats,
    session_distribution,
    time_format,
}: SessionStatsSectionProps) {
    const dist_total =
        session_distribution.under_15min +
            session_distribution.min_15_to_30 +
            session_distribution.min_30_to_60 +
            session_distribution.hour_1_to_2 +
            session_distribution.over_2hours || 1;

    return (
        <>
            <Title level={5}>
                <ClockCircleOutlined /> 세션 통계
            </Title>
            <Row gutter={[16, 16]} className="!mb-xl">
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="평균 세션 시간"
                            value={formatDuration(
                                session_stats.average_minutes,
                                time_format
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="최장 세션"
                            value={formatDuration(
                                session_stats.longest_minutes,
                                time_format
                            )}
                            valueStyle={{
                                color: "var(--color-primary)",
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="최단 세션"
                            value={formatDuration(
                                session_stats.shortest_minutes,
                                time_format
                            )}
                            valueStyle={{
                                color: "var(--color-warning)",
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="세션 수"
                            value={session_stats.total_count}
                            suffix="개"
                        />
                    </Card>
                </Col>
            </Row>

            <Card size="small" title="세션 시간 분포" className="!mb-xl">
                <Row gutter={16}>
                    {DISTRIBUTION_ITEMS.map((item) => (
                        <Col
                            key={item.key}
                            xs={24}
                            sm={12}
                            md={item.key === "under_15min" ? 4 : 5}
                        >
                            <div className="mb-sm">
                                <Text>{item.label}</Text>
                            </div>
                            <Progress
                                percent={Math.round(
                                    (session_distribution[item.key] /
                                        dist_total) *
                                        100
                                )}
                                format={() =>
                                    `${session_distribution[item.key]}개`
                                }
                                strokeColor={item.color}
                            />
                        </Col>
                    ))}
                </Row>
            </Card>
        </>
    );
}
