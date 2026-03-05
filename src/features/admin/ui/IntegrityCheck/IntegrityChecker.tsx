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
import { INTEGRITY_LABEL } from "../../constants";

const { Title, Text, Paragraph } = Typography;

// 문제 유형별 라벨
const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
    ...INTEGRITY_LABEL.issueTypes,
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
            title: INTEGRITY_LABEL.severity,
            key: "severity",
            width: 80,
            render: (_, issue) => (
                <Tag
                    color={SEVERITY_COLORS[issue.severity]}
                    icon={SEVERITY_ICONS[issue.severity]}
                >
                    {issue.severity === "error"
                        ? INTEGRITY_LABEL.severityError
                        : issue.severity === "warning"
                        ? INTEGRITY_LABEL.severityWarning
                        : INTEGRITY_LABEL.severityInfo}
                </Tag>
            ),
        },
        {
            title: INTEGRITY_LABEL.type,
            key: "type",
            width: 140,
            render: (_, issue) => (
                <Tag color="default">{ISSUE_TYPE_LABELS[issue.type]}</Tag>
            ),
        },
        {
            title: INTEGRITY_LABEL.description,
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: INTEGRITY_LABEL.detail,
            dataIndex: "details",
            key: "details",
            ellipsis: true,
            render: (text: string) => (
                <Text type="secondary">{text || "-"}</Text>
            ),
        },
        {
            title: INTEGRITY_LABEL.recordLabel,
            dataIndex: "record_id",
            key: "record_id",
            width: 120,
            render: (id: string) =>
                id ? (
                    <Tooltip title={id}>
                        <Text code className="!text-[11px]">
                            {id.substring(0, 8)}...
                        </Text>
                    </Tooltip>
                ) : (
                    "-"
                ),
        },
        {
            title: INTEGRITY_LABEL.fix,
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
                            {INTEGRITY_LABEL.fix}
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
            <div className="text-center p-[48px]">
                <BugOutlined className="!text-[64px] !text-[#1890ff]" />
                <Title level={4} className="!mt-xl">
                    {INTEGRITY_LABEL.title}
                </Title>
                <Paragraph type="secondary">
                    {INTEGRITY_LABEL.titleDesc}
                    <br />
                    {INTEGRITY_LABEL.titleHint}
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    icon={<SyncOutlined spin={is_checking} />}
                    onClick={runCheck}
                    loading={is_checking}
                >
                    {is_checking
                        ? INTEGRITY_LABEL.checking
                        : INTEGRITY_LABEL.startCheck}
                </Button>

                <Card className="!mt-[32px] !text-left">
                    <Title level={5}>{INTEGRITY_LABEL.checkItems}</Title>
                    <Row gutter={[16, 8]}>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkMissingField}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkDuplicateId}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkTimeMismatch}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkDateMismatch}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkInvalidTimeRange}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkZeroSession}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkFutureDate}</Text>
                        </Col>
                        <Col span={12}>
                            <Text>- {INTEGRITY_LABEL.checkNegativeDuration}</Text>
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
            <Row gutter={16} className="!mb-lg">
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title={INTEGRITY_LABEL.totalIssues}
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
                            title={INTEGRITY_LABEL.severityError}
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
                            title={INTEGRITY_LABEL.severityWarning}
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
                            title={INTEGRITY_LABEL.severityInfo}
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
                    message={INTEGRITY_LABEL.noIssues}
                    description={INTEGRITY_LABEL.noIssuesDesc}
                    icon={<CheckCircleOutlined />}
                    showIcon
                    className="!mb-lg"
                />
            ) : (
                <Alert
                    type="warning"
                    message={INTEGRITY_LABEL.issuesFound(result.issues.length)}
                    description={INTEGRITY_LABEL.issuesSummary(
                        result.error_count,
                        result.warning_count,
                        result.info_count
                    )}
                    showIcon
                    className="!mb-lg"
                />
            )}

            {/* 필터 및 재검사 */}
            <Space className="!mb-lg">
                <Button
                    icon={<SyncOutlined spin={is_checking} />}
                    onClick={runCheck}
                    loading={is_checking}
                >
                    {INTEGRITY_LABEL.recheck}
                </Button>
                <Space.Compact>
                    <Button
                        type={
                            selected_severity === "all" ? "primary" : "default"
                        }
                        onClick={() => setSelectedSeverity("all")}
                    >
                        {INTEGRITY_LABEL.filterAll} ({result.issues.length})
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
                        {INTEGRITY_LABEL.filterError} ({result.error_count})
                    </Button>
                    <Button
                        type={
                            selected_severity === "warning"
                                ? "primary"
                                : "default"
                        }
                        onClick={() => setSelectedSeverity("warning")}
                    >
                        {INTEGRITY_LABEL.filterWarning} (
                        {result.warning_count})
                    </Button>
                    <Button
                        type={
                            selected_severity === "info" ? "primary" : "default"
                        }
                        onClick={() => setSelectedSeverity("info")}
                    >
                        {INTEGRITY_LABEL.filterInfo} ({result.info_count})
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
                <Empty
                    description={INTEGRITY_LABEL.noFilteredIssues}
                />
            )}

            {/* 검사 시간 */}
            <Text type="secondary" className="!block !mt-lg !text-right">
                {INTEGRITY_LABEL.checkedAt}{" "}
                {dayjs(result.checked_at).format("YYYY-MM-DD HH:mm:ss")}
            </Text>
        </div>
    );
}

export default IntegrityChecker;
