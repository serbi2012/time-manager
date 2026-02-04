/**
 * 레코드 상세 데이터 모달
 */

import {
    Modal,
    Button,
    Space,
    Descriptions,
    Card,
    Table,
    Typography,
    Tag,
} from "antd";
import { FileTextOutlined, CopyOutlined } from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../lib/statistics";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";
import {
    RECORD_DETAIL_MODAL_TITLE,
    RECORD_DETAIL_BASIC_INFO,
    RECORD_DETAIL_SESSION_HISTORY,
    RECORD_DETAIL_RAW_JSON,
    COPY_JSON,
    CLOSE,
    MERGE_MODAL_COMPLETED,
    MERGE_MODAL_INCOMPLETE,
} from "../../constants";
import { ADMIN_DESCRIPTION_PRE_STYLE } from "../../constants/styles";

const { Text } = Typography;

const DESCRIPTIONS_ITEM_ID_STYLE: React.CSSProperties = { fontSize: 11 };
const DESCRIPTIONS_ITEM_ID_COPY_STYLE: React.CSSProperties = { fontSize: 10 };

interface RecordDetailModalProps {
    open: boolean;
    record: WorkRecord | null;
    time_format: TimeDisplayFormat;
    on_close: () => void;
    on_copy: (record_id: string) => void;
}

export function RecordDetailModal({
    open,
    record,
    time_format,
    on_close,
    on_copy,
}: RecordDetailModalProps) {
    if (!record) return null;

    return (
        <Modal
            title={
                <Space>
                    <FileTextOutlined />
                    <span>{RECORD_DETAIL_MODAL_TITLE}</span>
                </Space>
            }
            open={open}
            onCancel={on_close}
            width={800}
            footer={[
                <Button
                    key="copy"
                    icon={<CopyOutlined />}
                    onClick={() => on_copy(record.id)}
                >
                    {COPY_JSON}
                </Button>,
                <Button key="close" onClick={on_close}>
                    {CLOSE}
                </Button>,
            ]}
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Descriptions
                    bordered
                    size="small"
                    column={2}
                    title={RECORD_DETAIL_BASIC_INFO}
                >
                    <Descriptions.Item label="ID" span={2}>
                        <Text copyable code style={DESCRIPTIONS_ITEM_ID_STYLE}>
                            {record.id}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="날짜">
                        {record.date}
                    </Descriptions.Item>
                    <Descriptions.Item label="프로젝트 코드">
                        {record.project_code}
                    </Descriptions.Item>
                    <Descriptions.Item label="작업명" span={2}>
                        {record.work_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="거래명" span={2}>
                        {record.deal_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="업무명">
                        {record.task_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="카테고리">
                        {record.category_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="소요시간">
                        {formatDuration(
                            record.duration_minutes || 0,
                            time_format
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="시간">
                        {record.start_time || "-"} ~ {record.end_time || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="완료 여부">
                        {record.is_completed ? (
                            <Tag color="green">{MERGE_MODAL_COMPLETED}</Tag>
                        ) : (
                            <Tag>{MERGE_MODAL_INCOMPLETE}</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="세션 수">
                        {record.sessions?.length || 0}개
                    </Descriptions.Item>
                    {record.note && (
                        <Descriptions.Item label="비고" span={2}>
                            {record.note}
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {record.sessions && record.sessions.length > 0 && (
                    <Card size="small" title={RECORD_DETAIL_SESSION_HISTORY}>
                        <Table
                            columns={[
                                {
                                    title: "#",
                                    width: 50,
                                    render: (_, __, idx) => idx + 1,
                                },
                                {
                                    title: "날짜",
                                    dataIndex: "date",
                                    width: 110,
                                    render: (date: string) =>
                                        date || record.date,
                                },
                                {
                                    title: "시작",
                                    dataIndex: "start_time",
                                    width: 80,
                                },
                                {
                                    title: "종료",
                                    dataIndex: "end_time",
                                    width: 80,
                                },
                                {
                                    title: "소요시간",
                                    dataIndex: "duration_minutes",
                                    width: 90,
                                    render: (mins: number) =>
                                        formatDuration(mins || 0, time_format),
                                },
                                {
                                    title: "ID",
                                    dataIndex: "id",
                                    ellipsis: true,
                                    render: (id: string) => (
                                        <Text
                                            copyable
                                            code
                                            style={
                                                DESCRIPTIONS_ITEM_ID_COPY_STYLE
                                            }
                                        >
                                            {id}
                                        </Text>
                                    ),
                                },
                            ]}
                            dataSource={record.sessions}
                            rowKey="id"
                            size="small"
                            pagination={false}
                        />
                    </Card>
                )}

                <Card size="small" title={RECORD_DETAIL_RAW_JSON}>
                    <pre style={ADMIN_DESCRIPTION_PRE_STYLE}>
                        {JSON.stringify(record, null, 2)}
                    </pre>
                </Card>
            </Space>
        </Modal>
    );
}
