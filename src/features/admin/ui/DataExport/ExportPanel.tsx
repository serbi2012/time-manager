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
import { EXPORT_LABEL } from "../../constants";

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
                    <Card title={EXPORT_LABEL.exportOptions}>
                        {/* 파일 형식 */}
                        <div className="mb-xl">
                            <Title level={5}>{EXPORT_LABEL.fileFormat}</Title>
                            <Radio.Group
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="csv">
                                    <FileExcelOutlined /> {EXPORT_LABEL.csvFormat}
                                </Radio.Button>
                                <Radio.Button value="json">
                                    <FileTextOutlined /> {EXPORT_LABEL.jsonFormat}
                                </Radio.Button>
                            </Radio.Group>
                            <Paragraph
                                type="secondary"
                                className="!mt-sm"
                            >
                                {format === "csv"
                                    ? EXPORT_LABEL.csvDesc
                                    : EXPORT_LABEL.jsonDesc}
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* 데이터 유형 */}
                        <div className="mb-xl">
                            <Title level={5}>{EXPORT_LABEL.dataType}</Title>
                            <Radio.Group
                                value={data_type}
                                onChange={(e) => setDataType(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="records">
                                    <DatabaseOutlined /> {EXPORT_LABEL.records}
                                </Radio.Button>
                                <Radio.Button value="sessions">
                                    <ClockCircleOutlined /> {EXPORT_LABEL.sessions}
                                </Radio.Button>
                                <Radio.Button value="all">
                                    {EXPORT_LABEL.all}
                                </Radio.Button>
                            </Radio.Group>
                            <Paragraph
                                type="secondary"
                                className="!mt-sm"
                            >
                                {data_type === "records" &&
                                    EXPORT_LABEL.recordsDesc}
                                {data_type === "sessions" &&
                                    EXPORT_LABEL.sessionsDesc}
                                {data_type === "all" && EXPORT_LABEL.allDesc}
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* 날짜 범위 */}
                        <div className="mb-xl">
                            <Title level={5}>{EXPORT_LABEL.dateRange}</Title>
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
                                    placeholder={[
                                        EXPORT_LABEL.startDate,
                                        EXPORT_LABEL.endDate,
                                    ]}
                                    className="!w-[300px]"
                                />
                                {date_range && (
                                    <Button
                                        type="link"
                                        onClick={() => setDateRange(null)}
                                    >
                                        {EXPORT_LABEL.resetToAllPeriod}
                                    </Button>
                                )}
                            </Space>
                            <Paragraph
                                type="secondary"
                                className="!mt-sm"
                            >
                                {date_range
                                    ? `${date_range[0].format(
                                          "YYYY-MM-DD"
                                      )} ~ ${date_range[1].format(
                                          "YYYY-MM-DD"
                                      )} ${EXPORT_LABEL.periodData}`
                                    : EXPORT_LABEL.allPeriodData}
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* 추가 옵션 */}
                        <div className="mb-xl">
                            <Title level={5}>{EXPORT_LABEL.additionalOptions}</Title>
                            <Checkbox
                                checked={include_deleted}
                                onChange={(e) =>
                                    setIncludeDeleted(e.target.checked)
                                }
                            >
                                {EXPORT_LABEL.includeDeleted}
                            </Checkbox>
                        </div>
                    </Card>
                </Col>

                {/* 미리보기 및 다운로드 */}
                <Col xs={24} lg={10}>
                    <Card title={EXPORT_LABEL.exportPreview}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title={EXPORT_LABEL.recordCountLabel}
                                    value={preview_stats.record_count}
                                    suffix={EXPORT_LABEL.unit_record}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title={EXPORT_LABEL.sessionCountLabel}
                                    value={preview_stats.session_count}
                                    suffix={EXPORT_LABEL.unit_count}
                                />
                            </Col>
                            <Col span={24}>
                                <Statistic
                                    title={EXPORT_LABEL.totalWorkTime}
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
                            message={EXPORT_LABEL.exportInfo}
                            description={
                                <ul
                                    className="my-sm pl-[20px]"
                                >
                                    <li>
                                        {EXPORT_LABEL.formatLabel}{" "}
                                        {format === "csv"
                                            ? EXPORT_LABEL.csvFormat
                                            : EXPORT_LABEL.jsonLabel}
                                    </li>
                                    <li>
                                        {EXPORT_LABEL.dataLabel}{" "}
                                        {data_type === "records"
                                            ? EXPORT_LABEL.records
                                            : data_type === "sessions"
                                            ? EXPORT_LABEL.sessions
                                            : EXPORT_LABEL.all}
                                    </li>
                                    <li>
                                        {EXPORT_LABEL.periodLabel}{" "}
                                        {date_range
                                            ? `${date_range[0].format(
                                                  "YYYY-MM-DD"
                                              )} ~ ${date_range[1].format(
                                                  "YYYY-MM-DD"
                                              )}`
                                            : EXPORT_LABEL.all}
                                    </li>
                                    <li>
                                        {EXPORT_LABEL.deletedDataLabel}{" "}
                                        {include_deleted
                                            ? EXPORT_LABEL.include
                                            : EXPORT_LABEL.exclude}
                                    </li>
                                </ul>
                            }
                            className="!mb-lg"
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
                            {is_exporting
                                ? EXPORT_LABEL.exporting
                                : EXPORT_LABEL.download}
                        </Button>

                        {preview_stats.record_count === 0 && (
                            <Alert
                                type="warning"
                                message={EXPORT_LABEL.noDataToExport}
                                className="!mt-lg"
                            />
                        )}
                    </Card>

                    {/* 도움말 */}
                    <Card title={EXPORT_LABEL.helpTitle} size="small" className="!mt-lg">
                        <Paragraph>
                            <Text strong>{EXPORT_LABEL.helpCsvTitle}</Text>
                            <br />
                            {EXPORT_LABEL.helpCsvDesc}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>{EXPORT_LABEL.helpJsonTitle}</Text>
                            <br />
                            {EXPORT_LABEL.helpJsonDesc}
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default ExportPanel;
