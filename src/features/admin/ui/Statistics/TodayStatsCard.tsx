/**
 * 오늘 통계 카드
 */

import { Card, Row, Col, Statistic, Space } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { formatDuration, type TimeDisplayFormat } from "../../lib/statistics";
import type { TodayStats } from "../../lib/statistics";
import { STATS_LABEL } from "../../constants";

interface TodayStatsCardProps {
    today_stats: TodayStats;
    time_format: TimeDisplayFormat;
}

export function TodayStatsCard({
    today_stats,
    time_format,
}: TodayStatsCardProps) {
    return (
        <Card
            size="small"
            title={
                <Space>
                    <CalendarOutlined />
                    {STATS_LABEL.todayStats}
                </Space>
            }
            className="!mb-lg"
        >
            <Row gutter={[16, 8]}>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title={STATS_LABEL.todayWorkTime}
                        value={formatDuration(
                            today_stats.total_minutes,
                            time_format
                        )}
                        valueStyle={{
                            color: "var(--color-primary)",
                            fontSize: 18,
                        }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title={STATS_LABEL.sessionCount}
                        value={today_stats.session_count}
                        suffix={STATS_LABEL.unit_count}
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title={STATS_LABEL.recordCount}
                        value={today_stats.record_count}
                        suffix={STATS_LABEL.unit_record}
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title={STATS_LABEL.completed}
                        value={today_stats.completed_count}
                        suffix={STATS_LABEL.unit_record}
                        valueStyle={{
                            color: "var(--color-success)",
                            fontSize: 18,
                        }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title={STATS_LABEL.firstWork}
                        value={today_stats.first_session_time || "-"}
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title={STATS_LABEL.lastWork}
                        value={today_stats.last_session_time || "-"}
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
            </Row>
        </Card>
    );
}
