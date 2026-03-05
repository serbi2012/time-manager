/**
 * 기간 비교 카드 (이번 주 vs 지난 주, 이번 달 vs 지난 달)
 */

import { Card, Row, Col, Statistic, Space, Typography } from "antd";
import {
    BarChartOutlined,
    RiseOutlined,
    FallOutlined,
} from "@ant-design/icons";
import {
    formatDuration,
    type TimeDisplayFormat,
    type PeriodComparison as PeriodComparisonData,
} from "../../lib/statistics";
import { STATS_LABEL } from "../../constants";

const { Text } = Typography;

interface PeriodComparisonProps {
    week_comparison: PeriodComparisonData;
    month_comparison: PeriodComparisonData;
    time_format: TimeDisplayFormat;
}

function ChangeIndicator({ percent }: { percent: number }) {
    if (percent === 0) return <Text type="secondary">-</Text>;
    const is_positive = percent > 0;
    return (
        <Space size={4}>
            {is_positive ? (
                <RiseOutlined className="!text-success" />
            ) : (
                <FallOutlined className="!text-error" />
            )}
            <Text
                style={{
                    color: is_positive
                        ? "var(--color-success)"
                        : "var(--color-error)",
                }}
            >
                {is_positive ? "+" : ""}
                {percent}%
            </Text>
        </Space>
    );
}

function ComparisonCard({
    title,
    data,
    time_format,
}: {
    title: string;
    data: PeriodComparisonData;
    time_format: TimeDisplayFormat;
}) {
    return (
        <Card
            size="small"
            title={
                <Space>
                    <BarChartOutlined />
                    {title}
                </Space>
            }
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic
                        title={STATS_LABEL.workTime}
                        value={formatDuration(
                            data.current_minutes,
                            time_format
                        )}
                        valueStyle={{ fontSize: 16 }}
                    />
                    <div className="mt-xs">
                        <ChangeIndicator percent={data.change_percent} />
                    </div>
                </Col>
                <Col span={8}>
                    <Statistic
                        title={STATS_LABEL.sessions}
                        value={data.current_sessions}
                        suffix={STATS_LABEL.unit_count}
                        valueStyle={{ fontSize: 16 }}
                    />
                    <div className="mt-xs">
                        <ChangeIndicator
                            percent={data.sessions_change_percent}
                        />
                    </div>
                </Col>
                <Col span={8}>
                    <Statistic
                        title={STATS_LABEL.records}
                        value={data.current_records}
                        suffix={STATS_LABEL.unit_record}
                        valueStyle={{ fontSize: 16 }}
                    />
                    <div className="mt-xs">
                        <ChangeIndicator
                            percent={data.records_change_percent}
                        />
                    </div>
                </Col>
            </Row>
        </Card>
    );
}

export function PeriodComparison({
    week_comparison,
    month_comparison,
    time_format,
}: PeriodComparisonProps) {
    return (
        <Row gutter={[16, 16]} className="!mb-lg">
            <Col xs={24} md={12}>
                <ComparisonCard
                    title={STATS_LABEL.weekComparison}
                    data={week_comparison}
                    time_format={time_format}
                />
            </Col>
            <Col xs={24} md={12}>
                <ComparisonCard
                    title={STATS_LABEL.monthComparison}
                    data={month_comparison}
                    time_format={time_format}
                />
            </Col>
        </Row>
    );
}
