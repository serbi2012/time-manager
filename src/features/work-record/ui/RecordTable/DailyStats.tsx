/**
 * 일일 통계 패널
 */

import { Card, Row, Col, Statistic } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { TodayStats } from "../../lib/record_stats";
import { formatDuration } from "../../../../shared/lib/time";
import { RECORD_STATS, RECORD_SPACING } from "../../constants";

interface DailyStatsProps {
    stats: TodayStats;
}

export function DailyStats({ stats }: DailyStatsProps) {
    return (
        <Card size="small" className="!mb-lg">
            <Row gutter={RECORD_SPACING.DEFAULT}>
                <Col span={8}>
                    <Statistic
                        title={RECORD_STATS.TOTAL_DURATION}
                        value={formatDuration(stats.total_minutes)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ fontSize: 20 }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={RECORD_STATS.COMPLETED_COUNT}
                        value={stats.completed_count}
                        suffix={RECORD_STATS.COUNT_UNIT}
                        valueStyle={{ color: "#52c41a", fontSize: 20 }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={RECORD_STATS.INCOMPLETE_COUNT}
                        value={stats.incomplete_count}
                        suffix={RECORD_STATS.COUNT_UNIT}
                        valueStyle={{ color: "#1890ff", fontSize: 20 }}
                    />
                </Col>
            </Row>
        </Card>
    );
}
