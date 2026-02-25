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
                        title="작업 시간"
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
                        title="세션"
                        value={data.current_sessions}
                        suffix="개"
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
                        title="레코드"
                        value={data.current_records}
                        suffix="건"
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
                    title="이번 주 vs 지난 주"
                    data={week_comparison}
                    time_format={time_format}
                />
            </Col>
            <Col xs={24} md={12}>
                <ComparisonCard
                    title="이번 달 vs 지난 달"
                    data={month_comparison}
                    time_format={time_format}
                />
            </Col>
        </Row>
    );
}
