/**
 * 완료율 분석 + 딜/프로젝트별 분석 섹션
 */

import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    Table,
    Badge,
    Space,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, PieChartOutlined } from "@ant-design/icons";
import {
    formatDuration,
    type TimeDisplayFormat,
    type CompletionStats,
    type DealStats,
} from "../../lib/statistics";

const { Title } = Typography;

interface CompletionSectionProps {
    completion_stats: CompletionStats;
    deal_stats: DealStats[];
    time_format: TimeDisplayFormat;
}

export function CompletionSection({
    completion_stats,
    deal_stats,
    time_format,
}: CompletionSectionProps) {
    const completion_columns: ColumnsType<CompletionStats["by_category"][0]> = [
        {
            title: "카테고리",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "완료/전체",
            key: "count",
            width: 100,
            align: "center",
            render: (_, record) => `${record.completed}/${record.total}`,
        },
        {
            title: "완료율",
            dataIndex: "rate",
            key: "rate",
            width: 120,
            render: (rate: number) => (
                <Progress
                    percent={rate}
                    size="small"
                    status={
                        rate === 100
                            ? "success"
                            : rate >= 80
                            ? "active"
                            : "normal"
                    }
                />
            ),
        },
    ];

    const deal_columns: ColumnsType<DealStats> = [
        {
            title: "딜명",
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
            render: (name: string, record) => (
                <Space direction="vertical" size={0}>
                    <Typography.Text strong ellipsis>
                        {name}
                    </Typography.Text>
                    {record.project_code && (
                        <Typography.Text type="secondary" className="!text-xs">
                            {record.project_code}
                        </Typography.Text>
                    )}
                </Space>
            ),
        },
        {
            title: "시간",
            dataIndex: "total_minutes",
            key: "total_minutes",
            width: 100,
            align: "right",
            sorter: (a, b) => a.total_minutes - b.total_minutes,
            render: (mins: number) => formatDuration(mins, time_format),
        },
        {
            title: "레코드",
            dataIndex: "record_count",
            key: "record_count",
            width: 70,
            align: "center",
            render: (count: number) => (
                <Badge count={count} showZero color="blue" />
            ),
        },
        {
            title: "완료율",
            dataIndex: "completion_rate",
            key: "completion_rate",
            width: 80,
            align: "center",
            sorter: (a, b) => a.completion_rate - b.completion_rate,
            render: (rate: number) => (
                <Progress
                    percent={rate}
                    size="small"
                    format={(p) => `${p}%`}
                    status={rate === 100 ? "success" : "active"}
                />
            ),
        },
    ];

    return (
        <>
            <Title level={5}>
                <CheckCircleOutlined /> 완료율 분석
            </Title>
            <Row gutter={[16, 16]} className="!mb-xl">
                <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                        <div className="text-center">
                            <Progress
                                type="circle"
                                percent={completion_stats.completion_rate}
                                format={(p) => (
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {p}%
                                        </div>
                                        <div className="text-xs text-text-secondary">
                                            완료율
                                        </div>
                                    </div>
                                )}
                                strokeColor={{
                                    "0%": "#108ee9",
                                    "100%": "#87d068",
                                }}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                        <Statistic
                            title="완료된 레코드"
                            value={completion_stats.completed_records}
                            suffix={`/ ${completion_stats.total_records}건`}
                        />
                        <div className="mt-sm">
                            <Statistic
                                title="평균 완료 시간"
                                value={formatDuration(
                                    completion_stats.avg_completion_time_minutes,
                                    time_format
                                )}
                                valueStyle={{ fontSize: 16 }}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card size="small" title="카테고리별 완료율">
                        <Table
                            dataSource={completion_stats.by_category}
                            columns={completion_columns}
                            rowKey="category"
                            size="small"
                            pagination={false}
                            scroll={{ y: 200 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Title level={5}>
                <PieChartOutlined /> 딜/프로젝트별 분석
            </Title>
            <Card size="small" className="!mb-xl">
                <Table
                    dataSource={deal_stats}
                    columns={deal_columns}
                    rowKey="deal_name"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 600 }}
                />
            </Card>
        </>
    );
}
