/**
 * 일일 통계 패널
 */

import { Card, Row, Col, Statistic } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { TodayStats } from "../../lib/record_stats";
import { formatDuration } from "../../../../shared/lib/time";

interface DailyStatsProps {
    stats: TodayStats;
}

export function DailyStats({ stats }: DailyStatsProps) {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic
                        title="총 시간"
                        value={formatDuration(stats.total_minutes)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ fontSize: 20 }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="완료"
                        value={stats.completed_count}
                        suffix="건"
                        valueStyle={{ color: "#52c41a", fontSize: 20 }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="진행 중"
                        value={stats.incomplete_count}
                        suffix="건"
                        valueStyle={{ color: "#1890ff", fontSize: 20 }}
                    />
                </Col>
            </Row>
        </Card>
    );
}
