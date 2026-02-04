/**
 * 일일 통계 패널
 */

import { Card, Row, Col, Statistic } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { TodayStats } from "../../lib/record_stats";
import { formatDuration } from "../../../../shared/lib/time";
import {
    RECORD_STATS,
    RECORD_STATS_MARGIN_STYLE,
    RECORD_STATS_VALUE_STYLE,
    RECORD_COLORS,
    RECORD_SPACING,
} from "../../constants";

interface DailyStatsProps {
    stats: TodayStats;
}

export function DailyStats({ stats }: DailyStatsProps) {
    return (
        <Card size="small" style={RECORD_STATS_MARGIN_STYLE}>
            <Row gutter={RECORD_SPACING.DEFAULT}>
                <Col span={8}>
                    <Statistic
                        title={RECORD_STATS.TOTAL_DURATION}
                        value={formatDuration(stats.total_minutes)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={RECORD_STATS_VALUE_STYLE}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={RECORD_STATS.COMPLETED_COUNT}
                        value={stats.completed_count}
                        suffix={RECORD_STATS.COUNT_UNIT}
                        valueStyle={{
                            color: RECORD_COLORS.SUCCESS,
                            ...RECORD_STATS_VALUE_STYLE,
                        }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={RECORD_STATS.INCOMPLETE_COUNT}
                        value={stats.incomplete_count}
                        suffix={RECORD_STATS.COUNT_UNIT}
                        valueStyle={{
                            color: RECORD_COLORS.PRIMARY,
                            ...RECORD_STATS_VALUE_STYLE,
                        }}
                    />
                </Col>
            </Row>
        </Card>
    );
}
