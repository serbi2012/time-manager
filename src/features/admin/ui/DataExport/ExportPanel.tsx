/**
 * 데이터 내보내기 패널 컴포넌트
 */

import { useState, useMemo } from "react";
import {
    Card,
    Button,
    Space,
    Radio,
    Checkbox,
    DatePicker,
    Typography,
    Divider,
    Alert,
    Row,
    Col,
    Statistic,
    message,
} from "antd";
import {
    DownloadOutlined,
    FileExcelOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { WorkRecord } from "../../../../shared/types";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../../shared/constants";
import {
    type ExportOptions,
    exportData,
    downloadFile,
    generateExportFilename,
} from "../../lib/export";
import { formatDuration, type TimeDisplayFormat } from "../../lib/statistics";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface ExportPanelProps {
    records: WorkRecord[];
    time_format?: TimeDisplayFormat;
}

export function ExportPanel({
    records,
    time_format = "hours",
}: ExportPanelProps) {
    // 내보내기 옵션 상태
    const [format, setFormat] = useState<"csv" | "json">("csv");
    const [data_type, setDataType] = useState<"records" | "sessions" | "all">(
        "records"
    );
    const [include_deleted, setIncludeDeleted] = useState(false);
    const [date_range, setDateRange] = useState<
        [dayjs.Dayjs, dayjs.Dayjs] | null
    >(null);
    const [is_exporting, setIsExporting] = useState(false);

    // 내보낼 데이터 미리보기 통계
    const preview_stats = useMemo(() => {
        let filtered = records;

        if (!include_deleted) {
            filtered = filtered.filter((r) => !r.is_deleted);
        }

        if (date_range) {
            const [start, end] = date_range;
            const start_str = start.format("YYYY-MM-DD");
            const end_str = end.format("YYYY-MM-DD");
            filtered = filtered.filter(
                (r) => r.date >= start_str && r.date <= end_str
            );
        }

        const total_sessions = filtered.reduce(
            (sum, r) => sum + r.sessions.length,
            0
        );
        const total_minutes = filtered.reduce(
            (sum, r) => sum + (r.duration_minutes || 0),
            0
        );

        return {
            record_count: filtered.length,
            session_count: total_sessions,
            total_minutes,
        };
    }, [records, include_deleted, date_range]);

    // 내보내기 실행
    const handleExport = () => {
        setIsExporting(true);

        try {
            const options: ExportOptions = {
                format,
                data_type,
                include_deleted,
                date_range: date_range
                    ? {
                          start: date_range[0].format("YYYY-MM-DD"),
                          end: date_range[1].format("YYYY-MM-DD"),
                      }
                    : undefined,
            };

            const content = exportData(records, options);
            const filename = generateExportFilename(options);
            const mime_type =
                format === "json"
                    ? "application/json"
                    : "text/csv;charset=utf-8";

            downloadFile(content, filename, mime_type);
            message.success(SUCCESS_MESSAGES.exportDownloaded(filename));
        } catch (error) {
            message.error(ERROR_MESSAGES.exportFailed);
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <Row gutter={[24, 24]}>
                {/* 내보내기 옵션 */}
                <Col xs={24} lg={14}>
                    <Card title="내보내기 옵션">
                        {/* 파일 형식 */}
                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>파일 형식</Title>
                            <Radio.Group
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="csv">
                                    <FileExcelOutlined /> CSV (엑셀 호환)
                                </Radio.Button>
                                <Radio.Button value="json">
                                    <FileTextOutlined /> JSON (백업용)
                                </Radio.Button>
                            </Radio.Group>
                            <Paragraph
                                type="secondary"
                                style={{ marginTop: 8 }}
                            >
                                {format === "csv"
                                    ? "CSV 형식은 Excel에서 바로 열 수 있습니다."
                                    : "JSON 형식은 전체 데이터를 구조화된 형태로 저장합니다."}
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* 데이터 유형 */}
                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>데이터 유형</Title>
                            <Radio.Group
                                value={data_type}
                                onChange={(e) => setDataType(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="records">
                                    <DatabaseOutlined /> 레코드
                                </Radio.Button>
                                <Radio.Button value="sessions">
                                    <ClockCircleOutlined /> 세션
                                </Radio.Button>
                                <Radio.Button value="all">전체</Radio.Button>
                            </Radio.Group>
                            <Paragraph
                                type="secondary"
                                style={{ marginTop: 8 }}
                            >
                                {data_type === "records" &&
                                    "작업 기록 단위로 내보냅니다."}
                                {data_type === "sessions" &&
                                    "개별 세션 단위로 내보냅니다."}
                                {data_type === "all" &&
                                    "레코드와 세션을 모두 포함합니다."}
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* 날짜 범위 */}
                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>날짜 범위</Title>
                            <Space direction="vertical">
                                <RangePicker
                                    value={date_range}
                                    onChange={(dates) =>
                                        setDateRange(
                                            dates as
                                                | [dayjs.Dayjs, dayjs.Dayjs]
                                                | null
                                        )
                                    }
                                    placeholder={["시작일", "종료일"]}
                                    style={{ width: 300 }}
                                />
                                {date_range && (
                                    <Button
                                        type="link"
                                        onClick={() => setDateRange(null)}
                                    >
                                        전체 기간으로 초기화
                                    </Button>
                                )}
                            </Space>
                            <Paragraph
                                type="secondary"
                                style={{ marginTop: 8 }}
                            >
                                {date_range
                                    ? `${date_range[0].format(
                                          "YYYY-MM-DD"
                                      )} ~ ${date_range[1].format(
                                          "YYYY-MM-DD"
                                      )} 기간의 데이터`
                                    : "전체 기간의 데이터를 내보냅니다."}
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* 추가 옵션 */}
                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>추가 옵션</Title>
                            <Checkbox
                                checked={include_deleted}
                                onChange={(e) =>
                                    setIncludeDeleted(e.target.checked)
                                }
                            >
                                삭제된 데이터 포함
                            </Checkbox>
                        </div>
                    </Card>
                </Col>

                {/* 미리보기 및 다운로드 */}
                <Col xs={24} lg={10}>
                    <Card title="내보내기 미리보기">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title="레코드 수"
                                    value={preview_stats.record_count}
                                    suffix="건"
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="세션 수"
                                    value={preview_stats.session_count}
                                    suffix="개"
                                />
                            </Col>
                            <Col span={24}>
                                <Statistic
                                    title="총 작업 시간"
                                    value={formatDuration(
                                        preview_stats.total_minutes,
                                        time_format
                                    )}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <Alert
                            type="info"
                            message="내보내기 정보"
                            description={
                                <ul
                                    style={{ margin: "8px 0", paddingLeft: 20 }}
                                >
                                    <li>
                                        형식:{" "}
                                        {format === "csv"
                                            ? "CSV (엑셀 호환)"
                                            : "JSON"}
                                    </li>
                                    <li>
                                        데이터:{" "}
                                        {data_type === "records"
                                            ? "레코드"
                                            : data_type === "sessions"
                                            ? "세션"
                                            : "전체"}
                                    </li>
                                    <li>
                                        기간:{" "}
                                        {date_range
                                            ? `${date_range[0].format(
                                                  "YYYY-MM-DD"
                                              )} ~ ${date_range[1].format(
                                                  "YYYY-MM-DD"
                                              )}`
                                            : "전체"}
                                    </li>
                                    <li>
                                        삭제된 데이터:{" "}
                                        {include_deleted ? "포함" : "제외"}
                                    </li>
                                </ul>
                            }
                            style={{ marginBottom: 16 }}
                        />

                        <Button
                            type="primary"
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            loading={is_exporting}
                            block
                            disabled={preview_stats.record_count === 0}
                        >
                            {is_exporting ? "내보내는 중..." : "다운로드"}
                        </Button>

                        {preview_stats.record_count === 0 && (
                            <Alert
                                type="warning"
                                message="내보낼 데이터가 없습니다"
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </Card>

                    {/* 도움말 */}
                    <Card title="도움말" size="small" style={{ marginTop: 16 }}>
                        <Paragraph>
                            <Text strong>CSV 형식</Text>
                            <br />
                            Microsoft Excel, Google Sheets 등에서 바로 열 수
                            있습니다. 한글이 깨지는 경우 UTF-8 BOM 인코딩을
                            지원하는 프로그램을 사용하세요.
                        </Paragraph>
                        <Paragraph>
                            <Text strong>JSON 형식</Text>
                            <br />
                            전체 데이터를 구조화된 형태로 저장합니다. 데이터
                            백업이나 다른 시스템으로 이전할 때 유용합니다.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default ExportPanel;
