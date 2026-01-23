/**
 * 관리자 통계 개요 컴포넌트
 */

import { Card, Statistic, Row, Col, Badge } from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    ExclamationCircleOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import type { StatsOverviewProps } from "../../lib/types";

/**
 * 통계 개요 컴포넌트
 * 레코드, 세션, 문제, 충돌, 중복 수를 카드 형태로 표시
 */
export function StatsOverview({
    total_records,
    total_sessions,
    problem_count,
    conflict_count,
    duplicate_count,
}: StatsOverviewProps) {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4}>
                <Card size="small">
                    <Statistic
                        title="레코드"
                        value={total_records}
                        prefix={<FileTextOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
                <Card size="small">
                    <Statistic
                        title="세션"
                        value={total_sessions}
                        prefix={<ClockCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
                <Card size="small">
                    <Badge count={problem_count} offset={[10, 0]}>
                        <Statistic
                            title="문제"
                            value={problem_count}
                            prefix={<WarningOutlined />}
                            valueStyle={{
                                color:
                                    problem_count > 0 ? "#faad14" : undefined,
                            }}
                        />
                    </Badge>
                </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
                <Card size="small">
                    <Badge count={conflict_count} offset={[10, 0]}>
                        <Statistic
                            title="충돌"
                            value={conflict_count}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{
                                color:
                                    conflict_count > 0 ? "#ff4d4f" : undefined,
                            }}
                        />
                    </Badge>
                </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
                <Card size="small">
                    <Badge count={duplicate_count} offset={[10, 0]}>
                        <Statistic
                            title="중복"
                            value={duplicate_count}
                            prefix={<CopyOutlined />}
                            valueStyle={{
                                color:
                                    duplicate_count > 0 ? "#1890ff" : undefined,
                            }}
                        />
                    </Badge>
                </Card>
            </Col>
        </Row>
    );
}

export default StatsOverview;
