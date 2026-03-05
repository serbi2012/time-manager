/**
 * 통계 대시보드 컴포넌트 - 확장 버전
 */

import { useMemo, useState } from "react";
import {
    Card,
    Row,
    Col,
    Statistic,
    Segmented,
    Space,
    Typography,
    Divider,
} from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    FieldTimeOutlined,
    BranchesOutlined,
} from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import {
    calculateDailyStats,
    calculateWeeklyStats,
    calculateMonthlyStats,
    calculateCategoryStats,
    calculateWorkNameStats,
    calculateSessionStats,
    calculateStatsSummary,
    calculateHourlyStats,
    calculateWeekdayStats,
    calculateDealStats,
    calculateProductivityStats,
    calculateWeekComparison,
    calculateMonthComparison,
    calculateCompletionStats,
    calculateSessionDistribution,
    calculateTodayStats,
    formatDuration,
    type TimeDisplayFormat,
} from "../../lib/statistics";
import { TimeChart } from "./TimeChart";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { TodayStatsCard } from "./TodayStatsCard";
import { PeriodComparison } from "./PeriodComparison";
import { ProductivitySection } from "./ProductivitySection";
import { SessionStatsSection } from "./SessionStatsSection";
import { TimePatternSection } from "./TimePatternSection";
import { CompletionSection } from "./CompletionSection";
import { STATS_LABEL } from "../../constants";

const { Title } = Typography;

type TimeRange = "daily" | "weekly" | "monthly";

interface StatsDashboardProps {
    records: WorkRecord[];
    time_format?: TimeDisplayFormat;
}

export function StatsDashboard({
    records,
    time_format = "hours",
}: StatsDashboardProps) {
    const [time_range, setTimeRange] = useState<TimeRange>("daily");

    const summary = useMemo(() => calculateStatsSummary(records), [records]);
    const session_stats = useMemo(
        () => calculateSessionStats(records),
        [records]
    );
    const daily_stats = useMemo(
        () => calculateDailyStats(records, 30),
        [records]
    );
    const weekly_stats = useMemo(
        () => calculateWeeklyStats(records, 12),
        [records]
    );
    const monthly_stats = useMemo(
        () => calculateMonthlyStats(records, 12),
        [records]
    );
    const category_stats = useMemo(
        () => calculateCategoryStats(records),
        [records]
    );
    const work_name_stats = useMemo(
        () => calculateWorkNameStats(records, 10),
        [records]
    );
    const hourly_stats = useMemo(
        () => calculateHourlyStats(records),
        [records]
    );
    const weekday_stats = useMemo(
        () => calculateWeekdayStats(records),
        [records]
    );
    const deal_stats = useMemo(
        () => calculateDealStats(records, 15),
        [records]
    );
    const productivity = useMemo(
        () => calculateProductivityStats(records),
        [records]
    );
    const week_comparison = useMemo(
        () => calculateWeekComparison(records),
        [records]
    );
    const month_comparison = useMemo(
        () => calculateMonthComparison(records),
        [records]
    );
    const completion_stats = useMemo(
        () => calculateCompletionStats(records),
        [records]
    );
    const session_distribution = useMemo(
        () => calculateSessionDistribution(records),
        [records]
    );
    const today_stats = useMemo(() => calculateTodayStats(records), [records]);

    const chart_data = useMemo(() => {
        switch (time_range) {
            case "daily":
                return daily_stats;
            case "weekly":
                return weekly_stats;
            case "monthly":
                return monthly_stats;
            default:
                return daily_stats;
        }
    }, [time_range, daily_stats, weekly_stats, monthly_stats]);

    const chart_title = useMemo(() => {
        switch (time_range) {
            case "daily":
                return "일별 작업 시간 (최근 30일)";
            case "weekly":
                return "주별 작업 시간 (최근 12주)";
            case "monthly":
                return "월별 작업 시간 (최근 12개월)";
            default:
                return "";
        }
    }, [time_range]);

    return (
        <div>
            <TodayStatsCard
                today_stats={today_stats}
                time_format={time_format}
            />

            <PeriodComparison
                week_comparison={week_comparison}
                month_comparison={month_comparison}
                time_format={time_format}
            />

            <Title level={5}>
                <FileTextOutlined /> {STATS_LABEL.overallSummary}
            </Title>
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.totalRecords}
                            value={summary.total_records}
                            prefix={<FileTextOutlined />}
                            suffix={STATS_LABEL.unit_record}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.totalSessions}
                            value={summary.total_sessions}
                            prefix={<ClockCircleOutlined />}
                            suffix={STATS_LABEL.unit_count}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.totalTime}
                            value={formatDuration(
                                summary.total_minutes,
                                time_format
                            )}
                            prefix={<FieldTimeOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.completedRecords}
                            value={summary.completed_records}
                            prefix={<CheckCircleOutlined />}
                            suffix={STATS_LABEL.unit_record}
                            valueStyle={{
                                color: "var(--color-success)",
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.deletedRecords}
                            value={summary.deleted_records}
                            prefix={<DeleteOutlined />}
                            suffix={STATS_LABEL.unit_record}
                            valueStyle={{
                                color:
                                    summary.deleted_records > 0
                                        ? "var(--color-error)"
                                        : undefined,
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card size="small">
                        <Statistic
                            title={STATS_LABEL.sessionsPerRecord}
                            value={summary.avg_sessions_per_record}
                            prefix={<BranchesOutlined />}
                            suffix={STATS_LABEL.unit_count}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            <ProductivitySection
                productivity={productivity}
                time_format={time_format}
            />

            <Divider />

            <SessionStatsSection
                session_stats={session_stats}
                session_distribution={session_distribution}
                time_format={time_format}
            />

            <Divider />

            <TimePatternSection
                hourly_stats={hourly_stats}
                weekday_stats={weekday_stats}
                time_format={time_format}
            />

            <Divider />

            <div className="mb-lg">
                <Space>
                    <Title level={5} className="!m-0">
                        {STATS_LABEL.timeTrend}
                    </Title>
                    <Segmented
                        value={time_range}
                        onChange={(value) => setTimeRange(value as TimeRange)}
                        options={[
                            { label: STATS_LABEL.daily, value: "daily" },
                            { label: STATS_LABEL.weekly, value: "weekly" },
                            { label: STATS_LABEL.monthly, value: "monthly" },
                        ]}
                    />
                </Space>
            </div>
            <Card size="small">
                <TimeChart
                    data={chart_data}
                    title={chart_title}
                    height={250}
                    show_labels={time_range !== "daily"}
                    time_format={time_format}
                />
            </Card>

            <Divider />

            <CompletionSection
                completion_stats={completion_stats}
                deal_stats={deal_stats}
                time_format={time_format}
            />

            <Divider />

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card size="small" title={STATS_LABEL.categoryAnalysis}>
                        <CategoryAnalysis
                            category_stats={category_stats}
                            work_name_stats={[]}
                            time_format={time_format}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card size="small" title={STATS_LABEL.workNameTop10}>
                        <CategoryAnalysis
                            category_stats={[]}
                            work_name_stats={work_name_stats}
                            time_format={time_format}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default StatsDashboard;
