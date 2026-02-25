/**
 * 오늘 통계 카드
 */

import { Card, Row, Col, Statistic, Space } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { formatDuration, type TimeDisplayFormat } from "../../lib/statistics";
import type { TodayStats } from "../../lib/statistics";

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
                    오늘 통계
                </Space>
            }
            className="!mb-lg"
        >
            <Row gutter={[16, 8]}>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title="오늘 작업 시간"
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
                        title="세션 수"
                        value={today_stats.session_count}
                        suffix="개"
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title="레코드 수"
                        value={today_stats.record_count}
                        suffix="건"
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title="완료"
                        value={today_stats.completed_count}
                        suffix="건"
                        valueStyle={{
                            color: "var(--color-success)",
                            fontSize: 18,
                        }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title="첫 작업"
                        value={today_stats.first_session_time || "-"}
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Statistic
                        title="마지막 작업"
                        value={today_stats.last_session_time || "-"}
                        valueStyle={{ fontSize: 18 }}
                    />
                </Col>
            </Row>
        </Card>
    );
}
