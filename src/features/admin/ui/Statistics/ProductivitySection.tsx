/**
 * 생산성 지표 + 스트릭/활동일 섹션
 */

import { Card, Row, Col, Statistic, Tooltip, Typography } from "antd";
import {
    ThunderboltOutlined,
    TrophyOutlined,
    FireOutlined,
} from "@ant-design/icons";
import {
    formatDuration,
    type TimeDisplayFormat,
    type ProductivityStats,
} from "../../lib/statistics";

const { Title } = Typography;

interface ProductivitySectionProps {
    productivity: ProductivityStats;
    time_format: TimeDisplayFormat;
}

export function ProductivitySection({
    productivity,
    time_format,
}: ProductivitySectionProps) {
    return (
        <>
            <Title level={5}>
                <ThunderboltOutlined /> 생산성 지표
            </Title>
            <Row gutter={[16, 16]} className="!mb-xl">
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title="일 평균"
                            value={formatDuration(
                                productivity.daily_avg_minutes,
                                time_format
                            )}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title="주 평균 (5일)"
                            value={formatDuration(
                                productivity.weekly_avg_minutes,
                                time_format
                            )}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title="월 평균 (22일)"
                            value={formatDuration(
                                productivity.monthly_avg_minutes,
                                time_format
                            )}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title="일 평균 세션"
                            value={productivity.daily_avg_sessions}
                            suffix="개"
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Tooltip title="가장 많이 일한 요일">
                            <Statistic
                                title="최고 생산 요일"
                                value={productivity.most_productive_day}
                                prefix={
                                    <TrophyOutlined className="!text-warning" />
                                }
                                valueStyle={{ fontSize: 16 }}
                            />
                        </Tooltip>
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Tooltip title="가장 많이 일한 시간대">
                            <Statistic
                                title="최고 생산 시간"
                                value={productivity.most_productive_hour}
                                prefix={
                                    <TrophyOutlined className="!text-warning" />
                                }
                                valueStyle={{ fontSize: 16 }}
                            />
                        </Tooltip>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="!mb-xl">
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Tooltip title="연속으로 작업한 일수 (오늘/어제 기준)">
                            <Statistic
                                title="현재 스트릭"
                                value={productivity.streak_current}
                                prefix={
                                    <FireOutlined className="!text-error" />
                                }
                                suffix="일"
                                valueStyle={{
                                    color:
                                        productivity.streak_current >= 5
                                            ? "var(--color-error)"
                                            : undefined,
                                }}
                            />
                        </Tooltip>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="최대 스트릭"
                            value={productivity.streak_max}
                            prefix={<FireOutlined className="!text-warning" />}
                            suffix="일"
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="활동일 수"
                            value={productivity.active_days_count}
                            suffix="일"
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="총 기간"
                            value={productivity.total_days_range}
                            suffix="일"
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
}
