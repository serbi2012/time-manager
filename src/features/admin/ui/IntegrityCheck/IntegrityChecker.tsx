/**
 * 정합성 검사 컴포넌트
 */

import { useState, useMemo, useCallback } from "react";
import {
    Card,
    Button,
    Space,
    Table,
    Tag,
    Typography,
    Alert,
    Row,
    Col,
    Statistic,
    Collapse,
    Empty,
    Badge,
    Tooltip,
    message,
} from "antd";
import {
    CheckCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined,
    SyncOutlined,
    ToolOutlined,
    BugOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { WorkRecord } from "../../../../shared/types";
import {
    SUCCESS_MESSAGES,
    WARNING_MESSAGES,
    INFO_MESSAGES,
} from "../../../../shared/constants";
import {
    type IntegrityIssue,
    type IntegrityResult,
    type IssueType,
    checkIntegrity,
    filterIssuesBySeverity,
} from "../../lib/integrity";

const { Title, Text, Paragraph } = Typography;

// 문제 유형별 라벨
const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
    orphan_session: "고아 세션",
    time_mismatch: "시간 불일치",
    date_mismatch: "날짜 불일치",
    duplicate_id: "중복 ID",
    missing_required: "필수 필드 누락",
    invalid_time_range: "잘못된 시간 범위",
    zero_duration: "0분 세션",
    future_date: "미래 날짜",
    negative_duration: "음수 시간",
};

// 심각도별 색상
const SEVERITY_COLORS = {
    error: "red",
    warning: "orange",
    info: "blue",
};

// 심각도별 아이콘
const SEVERITY_ICONS = {
    error: <CloseCircleOutlined />,
    warning: <WarningOutlined />,
    info: <InfoCircleOutlined />,
};

interface IntegrityCheckerProps {
    records: WorkRecord[];
    on_fix_time_mismatch?: (record_id: string, new_duration: number) => void;
    on_delete_session?: (record_id: string, session_id: string) => void;
}

export function IntegrityChecker({
    records,
    on_fix_time_mismatch,
    on_delete_session,
}: IntegrityCheckerProps) {
    const [result, setResult] = useState<IntegrityResult | null>(null);
    const [is_checking, setIsChecking] = useState(false);
    const [selected_severity, setSelectedSeverity] = useState<
        "all" | "error" | "warning" | "info"
    >("all");

    // 검사 실행
    const runCheck = useCallback(() => {
        setIsChecking(true);
        // 약간의 지연으로 로딩 효과
        setTimeout(() => {
            const check_result = checkIntegrity(records);
            setResult(check_result);
            setIsChecking(false);

            if (check_result.issues.length === 0) {
                message.success(SUCCESS_MESSAGES.noProblemsFound);
            } else {
                message.warning(
                    WARNING_MESSAGES.issuesFound(check_result.issues.length)
                );
            }
        }, 500);
    }, [records]);

    // 필터링된 이슈
    const filtered_issues = useMemo(() => {
        if (!result) return [];
        if (selected_severity === "all") return result.issues;
        return filterIssuesBySeverity(result, [selected_severity]);
    }, [result, selected_severity]);

    // 유형별 그룹화
    const issues_by_type = useMemo(() => {
        if (!result) return new Map<IssueType, IntegrityIssue[]>();

        const grouped = new Map<IssueType, IntegrityIssue[]>();
        filtered_issues.forEach((issue) => {
            const existing = grouped.get(issue.type) || [];
            existing.push(issue);
            grouped.set(issue.type, existing);
        });
        return grouped;
    }, [result, filtered_issues]);

    const columns: ColumnsType<IntegrityIssue> = [
        {
            title: "심각도",
            key: "severity",
            width: 80,
            render: (_, issue) => (
                <Tag
                    color={SEVERITY_COLORS[issue.severity]}
                    icon={SEVERITY_ICONS[issue.severity]}
                >
                    {issue.severity === "error"
                        ? "오류"
                        : issue.severity === "warning"
                        ? "경고"
                        : "정보"}
                </Tag>
            ),
        },
        {
            title: "유형",
            key: "type",
            width: 140,
            render: (_, issue) => (
                <Tag color="default">{ISSUE_TYPE_LABELS[issue.type]}</Tag>
            ),
        },
        {
            title: "설명",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "상세",
            dataIndex: "details",
            key: "details",
            ellipsis: true,
            render: (text: string) => (
                <Text type="secondary">{text || "-"}</Text>
            ),
        },
        {
            title: "레코드",
            dataIndex: "record_id",
            key: "record_id",
            width: 120,
            render: (id: string) =>
                id ? (
                    <Tooltip title={id}>
                        <Text code style={{ fontSize: 11 }}>
                            {id.substring(0, 8)}...
                        </Text>
                    </Tooltip>
                ) : (
                    "-"
                ),
        },
        {
            title: "수정",
            key: "action",
            width: 80,
            render: (_, issue) =>
                issue.auto_fixable ? (
                    <Tooltip title={issue.fix_action}>
                        <Button
                            type="text"
                            size="small"
                            icon={<ToolOutlined />}
                            onClick={() => {
                                // 자동 수정 로직 (간략화)
                                if (
                                    issue.type === "time_mismatch" &&
                                    on_fix_time_mismatch &&
                                    issue.record_id
                                ) {
                                    // fix_action에서 시간 추출
                                    const match =
                                        issue.fix_action?.match(/(\d+)분/);
                                    if (match) {
                                        on_fix_time_mismatch(
                                            issue.record_id,
                                            parseInt(match[1])
                                        );
                                        message.success(
                                            SUCCESS_MESSAGES.integrityFixed
                                        );
                                        runCheck(); // 재검사
                                    }
                                } else if (
                                    issue.type === "zero_duration" &&
                                    on_delete_session &&
                                    issue.record_id &&
                                    issue.session_id
                                ) {
                                    on_delete_session(
                                        issue.record_id,
                                        issue.session_id
                                    );
                                    message.success(
                                        SUCCESS_MESSAGES.sessionDeleted
                                    );
                                    runCheck();
                                } else {
                                    message.info(
                                        INFO_MESSAGES.autoFixNotImplemented
                                    );
                                }
                            }}
                        >
                            수정
                        </Button>
                    </Tooltip>
                ) : (
                    <Text type="secondary">-</Text>
                ),
        },
    ];

    // 검사 전 화면
    if (!result) {
        return (
            <div style={{ textAlign: "center", padding: 48 }}>
                <BugOutlined style={{ fontSize: 64, color: "#1890ff" }} />
                <Title level={4} style={{ marginTop: 24 }}>
                    데이터 정합성 검사
                </Title>
                <Paragraph type="secondary">
                    레코드와 세션 데이터의 무결성을 검사합니다.
                    <br />
                    문제가 발견되면 상세 정보와 수정 방법을 안내합니다.
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    icon={<SyncOutlined spin={is_checking} />}
                    onClick={runCheck}
                    loading={is_checking}
                >
                    {is_checking ? "검사 중..." : "검사 시작"}
                </Button>

                <Card style={{ marginTop: 32, textAlign: "left" }}>
                    <Title level={5}>검사 항목</Title>
                    <Row gutter={[16, 8]}>
                        <Col span={12}>
                            <Text>- 필수 필드 누락</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 중복 ID 검사</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 시간 불일치 (레코드 vs 세션 합계)</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 날짜 불일치</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 잘못된 시간 범위</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 0분 세션</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 미래 날짜</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- 음수 소요 시간</Text>
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }

    // 검사 완료 후 화면
    return (
        <div>
            {/* 요약 통계 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title="총 문제"
                            value={result.issues.length}
                            prefix={<BugOutlined />}
                            valueStyle={{
                                color:
                                    result.issues.length > 0
                                        ? "#ff4d4f"
                                        : "#52c41a",
                            }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title="오류"
                            value={result.error_count}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{
                                color:
                                    result.error_count > 0
                                        ? "#ff4d4f"
                                        : undefined,
                            }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title="경고"
                            value={result.warning_count}
                            prefix={<WarningOutlined />}
                            valueStyle={{
                                color:
                                    result.warning_count > 0
                                        ? "#faad14"
                                        : undefined,
                            }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title="정보"
                            value={result.info_count}
                            prefix={<InfoCircleOutlined />}
                            valueStyle={{
                                color:
                                    result.info_count > 0
                                        ? "#1890ff"
                                        : undefined,
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 검사 결과 메시지 */}
            {result.issues.length === 0 ? (
                <Alert
                    type="success"
                    message="문제 없음"
                    description="데이터 정합성 검사를 통과했습니다. 모든 데이터가 정상입니다."
                    icon={<CheckCircleOutlined />}
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            ) : (
                <Alert
                    type="warning"
                    message={`${result.issues.length}개의 문제가 발견되었습니다`}
                    description={`오류: ${result.error_count}개, 경고: ${result.warning_count}개, 정보: ${result.info_count}개`}
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* 필터 및 재검사 */}
            <Space style={{ marginBottom: 16 }}>
                <Button
                    icon={<SyncOutlined spin={is_checking} />}
                    onClick={runCheck}
                    loading={is_checking}
                >
                    다시 검사
                </Button>
                <Space.Compact>
                    <Button
                        type={
                            selected_severity === "all" ? "primary" : "default"
                        }
                        onClick={() => setSelectedSeverity("all")}
                    >
                        전체 ({result.issues.length})
                    </Button>
                    <Button
                        type={
                            selected_severity === "error"
                                ? "primary"
                                : "default"
                        }
                        onClick={() => setSelectedSeverity("error")}
                        danger={result.error_count > 0}
                    >
                        오류 ({result.error_count})
                    </Button>
                    <Button
                        type={
                            selected_severity === "warning"
                                ? "primary"
                                : "default"
                        }
                        onClick={() => setSelectedSeverity("warning")}
                    >
                        경고 ({result.warning_count})
                    </Button>
                    <Button
                        type={
                            selected_severity === "info" ? "primary" : "default"
                        }
                        onClick={() => setSelectedSeverity("info")}
                    >
                        정보 ({result.info_count})
                    </Button>
                </Space.Compact>
            </Space>

            {/* 유형별 그룹화 */}
            {filtered_issues.length > 0 ? (
                <Collapse
                    defaultActiveKey={Array.from(issues_by_type.keys()).slice(
                        0,
                        3
                    )}
                    items={Array.from(issues_by_type.entries()).map(
                        ([type, issues]) => ({
                            key: type,
                            label: (
                                <Space>
                                    <Badge
                                        count={issues.length}
                                        style={{
                                            backgroundColor:
                                                issues[0]?.severity === "error"
                                                    ? "#ff4d4f"
                                                    : issues[0]?.severity ===
                                                      "warning"
                                                    ? "#faad14"
                                                    : "#1890ff",
                                        }}
                                    />
                                    <Text strong>
                                        {ISSUE_TYPE_LABELS[type]}
                                    </Text>
                                </Space>
                            ),
                            children: (
                                <Table
                                    dataSource={issues}
                                    columns={columns.filter(
                                        (c) => c.key !== "type"
                                    )}
                                    rowKey="id"
                                    size="small"
                                    pagination={false}
                                />
                            ),
                        })
                    )}
                />
            ) : (
                <Empty description="필터 조건에 맞는 문제가 없습니다" />
            )}

            {/* 검사 시간 */}
            <Text
                type="secondary"
                style={{ display: "block", marginTop: 16, textAlign: "right" }}
            >
                검사 시각:{" "}
                {dayjs(result.checked_at).format("YYYY-MM-DD HH:mm:ss")}
            </Text>
        </div>
    );
}

export default IntegrityChecker;
