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
import { STATS_LABEL } from "../../constants";

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
                <ThunderboltOutlined /> {STATS_LABEL.productivity}
            </Title>
            <Row gutter={[16, 16]} className="!mb-xl">
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.dailyAvg}
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
                            title={STATS_LABEL.weeklyAvg5}
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
                            title={STATS_LABEL.monthlyAvg22}
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
                            title={STATS_LABEL.dailyAvgSessions}
                            value={productivity.daily_avg_sessions}
                            suffix={STATS_LABEL.unit_count}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Tooltip title={STATS_LABEL.busiestDay}>
                            <Statistic
                                title={STATS_LABEL.busiestDayLabel}
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
                        <Tooltip title={STATS_LABEL.busiestHour}>
                            <Statistic
                                title={STATS_LABEL.busiestHourLabel}
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
                        <Tooltip title={STATS_LABEL.streakDesc}>
                            <Statistic
                                title={STATS_LABEL.currentStreak}
                                value={productivity.streak_current}
                                prefix={
                                    <FireOutlined className="!text-error" />
                                }
                                suffix={STATS_LABEL.dayUnit}
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
                            title={STATS_LABEL.maxStreak}
                            value={productivity.streak_max}
                            prefix={<FireOutlined className="!text-warning" />}
                            suffix={STATS_LABEL.dayUnit}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.activeDays}
                            value={productivity.active_days_count}
                            suffix={STATS_LABEL.dayUnit}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.totalPeriod}
                            value={productivity.total_days_range}
                            suffix={STATS_LABEL.dayUnit}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
}
